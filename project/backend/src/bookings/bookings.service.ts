import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { DataSource, In, LessThan, Not, Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CalculateBookingDto } from './dto/calculate-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { Tour } from '../tours/entities/tour.entity';
import { TourSchedule } from '../tours/entities/tour-schedule.entity';
import { Payment } from '../payments/entities/payment.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Tour)
    private toursRepository: Repository<Tour>,
    @InjectRepository(TourSchedule)
    private schedulesRepository: Repository<TourSchedule>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private readonly dataSource: DataSource,
  ) {}

  async findAllForAdmin() {
    return this.bookingsRepository.find({
      relations: ['user', 'tour'],
      order: { createdAt: 'DESC' },
    });
  }

  async calculatePrice(calculateBookingDto: CalculateBookingDto) {
    const paxValue =
      calculateBookingDto.pax ?? calculateBookingDto.numberOfTravelers;
    if (!paxValue || paxValue < 1) {
      throw new BadRequestException('pax must be at least 1');
    }
    const { tourId, tourScheduleId } = calculateBookingDto;

    const tour = await this.toursRepository.findOne({ where: { id: tourId } });
    if (!tour)
      throw new NotFoundException(`Tour with ID "${tourId}" not found`);

    const schedule = await this.schedulesRepository.findOne({
      where: { id: tourScheduleId },
    });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    if (schedule.tour_id !== tourId) {
      throw new BadRequestException('Schedule does not belong to this tour');
    }

    // --- ส่วนที่ใช้คำนวณราคา (แก้ปัญหา TypeScript แล้ว) ---
    const adultPrice = Number.isFinite(Number(tour.price))
      ? Number(tour.price)
      : 5000;
    const childPrice = tour.child_price
      ? Number(tour.child_price)
      : Math.floor(adultPrice * 0.6);

    let basePrice = 0;
    let adultsCount = paxValue;
    let childrenCount = 0;

    // เลี่ยง Error ตัวแปร options
    const options = (calculateBookingDto as any).selectedOptions;

    if (options && options.adults !== undefined) {
      adultsCount = Number(options.adults);
      childrenCount = Number(options.children || 0);

      if (adultsCount + childrenCount !== paxValue) {
        throw new BadRequestException(
          'จำนวนผู้ใหญ่และเด็กไม่ตรงกับจำนวนผู้เดินทางรวม',
        );
      }

      basePrice = adultsCount * adultPrice + childrenCount * childPrice;
    } else {
      basePrice = adultPrice * paxValue;
    }

    const refDate = new Date(schedule.available_date);
    const discount = this.calculateDiscount(refDate, basePrice);
    const totalPrice = basePrice - discount;

    return {
      basePrice,
      discount,
      totalPrice,
      breakdown: {
        pricePerPerson: adultPrice, // ✅ เปลี่ยนมาใช้ adultPrice แล้ว
        pax: paxValue,
        adults: adultsCount, // ✅ แนบจำนวนผู้ใหญ่กลับไปในบิลด้วย
        children: childrenCount, // ✅ แนบจำนวนเด็กกลับไปในบิลด้วย
        subtotal: basePrice,
        discountPercentage: discount > 0 ? 5 : 0,
        discountAmount: discount,
        total: totalPrice,
      },
    };
  }

  async create(createBookingDto: CreateBookingDto, userId: string) {
    console.log('📥 หลังบ้านได้รับข้อมูล:', createBookingDto);
    return this.dataSource.transaction(async (manager) => {
      const paxValue =
        createBookingDto.pax ?? createBookingDto.numberOfTravelers;
      if (!paxValue || paxValue < 1) {
        throw new BadRequestException('pax must be at least 1');
      }

      // 1) Lock tour row to prevent concurrent overbooking
      const tour = await manager
        .getRepository(Tour)
        .createQueryBuilder('tour')
        .setLock('pessimistic_write')
        .where('tour.id = :tourId', { tourId: createBookingDto.tourId })
        .getOne();

      if (!tour) {
        throw new NotFoundException(
          `Tour with ID "${createBookingDto.tourId}" not found`,
        );
      }

      if (!tour.is_active) {
        throw new BadRequestException('ทัวร์นี้ไม่เปิดให้จอง');
      }

      // 2) Lock & validate schedule
      const schedule = await manager.getRepository(TourSchedule).findOne({
        where: { id: createBookingDto.tourScheduleId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }

      if (schedule.tour_id !== tour.id) {
        throw new BadRequestException('Schedule does not belong to this tour');
      }

      if (!schedule.is_available) {
        throw new BadRequestException(
          'This schedule is not available for booking',
        );
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const scheduleDate = new Date(schedule.available_date);
      scheduleDate.setHours(0, 0, 0, 0);

      if (scheduleDate < today) {
        throw new BadRequestException(
          'Cannot book a schedule that has already passed',
        );
      }

      // 4) Capacity check
      const maxCapacity = schedule.max_capacity_override ?? tour.max_group_size;
      const now = new Date();

      const booked = await manager
        .getRepository(Booking)
        .createQueryBuilder('b')
        .select('COALESCE(SUM(b.pax), 0)', 'total')
        .where('b.tourScheduleId = :sid', { sid: schedule.id })
        .andWhere('b.status NOT IN (:...statuses)', {
          statuses: [BookingStatus.CANCELLED, BookingStatus.EXPIRED],
        })
        .andWhere('(b.status != :pendingStatus OR b.payment_deadline > :now)', {
          pendingStatus: BookingStatus.PENDING_PAY,
          now: now,
        })
        .getRawOne<{ total: string }>();

      const bookedSeatsTotal = Number(booked?.total ?? 0);
      const available = maxCapacity - bookedSeatsTotal;

      if (available < paxValue) {
        const remaining = Math.max(available, 0);
        throw new BadRequestException(`เหลือที่นั่งเพียง ${remaining} ที่`);
      }

      // 5) Calculate pricing
      const pricing = await this.calculatePrice({
        tourId: createBookingDto.tourId,
        tourScheduleId: createBookingDto.tourScheduleId,
        pax: paxValue,
        selectedOptions: createBookingDto.selectedOptions,
      });

      // 6) Create booking
      const bookingReference = this.generateBookingReference();

      const booking = manager.create(Booking, {
        bookingReference,
        tourId: createBookingDto.tourId,
        userId,
        tourScheduleId: createBookingDto.tourScheduleId,
        travelDate: new Date(schedule.available_date),
        pax: paxValue,
        basePrice: pricing.basePrice,
        discount: pricing.discount,
        totalPrice: pricing.totalPrice,
        contactInfo: createBookingDto.contactInfo,
        specialRequests: createBookingDto.specialRequests,
        selectedOptions: createBookingDto.selectedOptions,
        status: BookingStatus.PENDING_PAY,
        paymentDeadline: new Date(Date.now() + 15 * 60 * 1000),
      });

      const savedBooking = await manager.save(booking);

      return {
        id: savedBooking.id,
        bookingReference: savedBooking.bookingReference,
        status: savedBooking.status,
        tourId: savedBooking.tourId,
        travelDate: savedBooking.travelDate,
        pax: savedBooking.pax,
        numberOfTravelers: savedBooking.pax,
        totalPrice: savedBooking.totalPrice,
        contactInfo: savedBooking.contactInfo,
        createdAt: savedBooking.createdAt,
      };
    });
  }

  // เพิ่มฟังก์ชันนี้ลงไปในคลาส BookingsService
  async uploadPaymentSlip(id: string, filename: string, userId: string) {
    const booking = await this.findOneById(id, userId);

    if (booking.status !== BookingStatus.PENDING_PAY) {
      throw new BadRequestException('บิลนี้ไม่สามารถอัปโหลดสลิปได้แล้ว');
    }

    const now = new Date();
    if (booking.paymentDeadline && now > new Date(booking.paymentDeadline)) {
      booking.status = BookingStatus.EXPIRED; // ปรับเป็นหมดอายุทันที
      await this.bookingsRepository.save(booking);
      throw new BadRequestException('หมดเวลาชำระเงินแล้ว ระบบได้ยกเลิกรายการนี้แล้ว หากโอนเงินมาแล้วกรุณาติดต่อแอดมิน');
    }

    // เซฟพาร์ทของรูปและเปลี่ยนสถานะเป็นรอตรวจสอบ
    booking.paymentSlipUrl = `/uploads/slips/${filename}`;
    booking.status = BookingStatus.PENDING_VERIFY;

    const savedBooking = await this.bookingsRepository.save(booking);

    const existingPayment = await this.paymentsRepository.findOne({
      where: { booking: { id: savedBooking.id } },
      relations: ['booking'],
    });

    if (existingPayment) {
      existingPayment.amount = Number(savedBooking.totalPrice);
      existingPayment.slip_url = savedBooking.paymentSlipUrl;
      existingPayment.status = 'pending_verify';
      existingPayment.booking = savedBooking as Booking;
      await this.paymentsRepository.save(existingPayment);
    } else {
      const payment = this.paymentsRepository.create({
        amount: Number(savedBooking.totalPrice),
        slip_url: savedBooking.paymentSlipUrl,
        status: 'pending_verify',
        booking: savedBooking as Booking,
      });
      await this.paymentsRepository.save(payment);
    }

    return {
      message: 'อัปโหลดสลิปสำเร็จ รอแอดมินตรวจสอบ',
      status: savedBooking.status,
      paymentSlipUrl: savedBooking.paymentSlipUrl,
    };
  }

  findAll() {
    return this.bookingsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByUser(userId: string) {
    const bookings = await this.bookingsRepository.find({
      where: { userId },
      relations: ['tour'],
      order: { createdAt: 'DESC' },
    });

    return bookings;
  }

  findOne(id: number) {
    return this.bookingsRepository.findOne({
      where: { id: id.toString() },
    });
  }

  async findOneById(id: string, userId?: string) {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['tour'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // If userId is provided, verify ownership
    if (userId && booking.userId !== userId) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return {
      ...booking,
      numberOfTravelers: booking.pax,
    };
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }

  async cancelBooking(id: string, cancelDto: CancelBookingDto, userId: string) {
    const booking = await this.findOneById(id, userId);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    // Calculate refund amount (100% refund if cancelled 7+ days before start)
    const targetDate = booking.travelDate || booking.startDate || new Date();
    const daysUntilStart = this.getDaysUntilStart(targetDate);
    const refundPercentage =
      daysUntilStart >= 7 ? 100 : daysUntilStart >= 3 ? 50 : 0;
    const refundAmount = (booking.totalPrice * refundPercentage) / 100;

    // Update booking
    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = cancelDto.reason;
    booking.refundAmount = refundAmount;

    const updatedBooking = await this.bookingsRepository.save(booking);

    return {
      id: booking.id,
      status: booking.status,
      refundPercentage,
      refundAmount: booking.refundAmount,
      cancellationReason: booking.cancellationReason,
    };
  }

  // 🌟 เพิ่มฟังก์ชันใหม่ สำหรับต่ออายุการจองที่หมดเวลาไปแล้ว
  async renewBooking(id: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      // 1) ดึงข้อมูลการจองเดิมขึ้นมา พร้อมล็อก Row เพื่อป้องกันคนแย่งที่นั่ง
      const booking = await manager.findOne(Booking, {
        where: { id, userId },
        relations: ['tour', 'tourSchedule'],
      });

      if (!booking) throw new NotFoundException('ไม่พบรายการจองนี้');

      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException('รายการจองนี้ถูกยกเลิกไปแล้ว กรุณากดจองใหม่');
      }

      const now = new Date();

      // 2) ถ้ายังไม่หมดเวลา ไม่ต้องทำอะไร ส่งข้อมูลเดิมกลับไปเลย
      if (
        booking.status === BookingStatus.PENDING_PAY && 
        booking.paymentDeadline && 
        booking.paymentDeadline > now
      ) {
        return booking;
      }

      // 3) --- ถ้าหมดเวลาแล้ว (EXPIRED) ต้องเช็คที่นั่งว่างใหม่ ---
      const schedule = booking.tourSchedule;
      const tour = booking.tour;

      if (!schedule || !tour) {
        throw new BadRequestException('ข้อมูลทัวร์หรือรอบทัวร์ไม่สมบูรณ์');
      }
      const maxCapacity = schedule.max_capacity_override ?? tour.max_group_size;

      const booked = await manager
        .getRepository(Booking)
        .createQueryBuilder('b')
        .select('COALESCE(SUM(b.pax), 0)', 'total')
        .where('b.tourScheduleId = :sid', { sid: schedule.id })
        .andWhere('b.id != :bookingId', { bookingId: booking.id })
        .andWhere('b.status NOT IN (:...statuses)', {
          statuses: [BookingStatus.CANCELLED, BookingStatus.EXPIRED],
        })
        .andWhere('(b.status != :pendingStatus OR b.paymentDeadline > :now)', {
          pendingStatus: BookingStatus.PENDING_PAY,
          now: now,
        })
        .getRawOne<{ total: string }>();

      const bookedSeatsTotal = Number(booked?.total ?? 0);
      const available = maxCapacity - bookedSeatsTotal;

      // 4) ถ้าที่นั่งเหลือน้อยกว่าจำนวนที่ลูกค้าจองไว้แต่แรก
      if (available < booking.pax) {
        throw new BadRequestException('ขออภัยค่ะ มีผู้ใช้ท่านอื่นจองที่นั่งนี้ไปแล้ว กรุณาเลือกรอบทัวร์ใหม่');
      }

      // 5) ถ้าที่นั่งพอ ให้ต่อเวลาไปอีก 15 นาที!
      booking.status = BookingStatus.PENDING_PAY;
      booking.paymentDeadline = new Date(now.getTime() + 15 * 60 * 1000); // เริ่มนับใหม่
      
      return await manager.save(booking);
    });
  }

  @Cron('*/5 * * * *')
  async expireOldBookings() {
    const now = new Date();
    const result = await this.bookingsRepository.update(
      { status: BookingStatus.PENDING_PAY, paymentDeadline: LessThan(now) },
      { status: BookingStatus.EXPIRED },
    );
    return result.affected ?? 0;
  }

  private generateBookingReference(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK-${timestamp}${random}`;
  }

  private calculateDiscount(startDate: Date, basePrice: number): number {
    return 0;
  }

  private getDaysUntilStart(startDate: Date): number {
    const now = new Date();
    const start = new Date(startDate);
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
