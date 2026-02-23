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

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Tour)
    private toursRepository: Repository<Tour>,
    @InjectRepository(TourSchedule)
    private schedulesRepository: Repository<TourSchedule>,
    private readonly dataSource: DataSource,
  ) {}

  async findAllForAdmin() {
    return this.bookingsRepository.find({
      relations: ['user', 'tour'],
      order: { createdAt: 'DESC' },
    });
  }

  async calculatePrice(calculateBookingDto: CalculateBookingDto) {
    const { tourId, travelDate, startDate, endDate, pax } = calculateBookingDto;

    const tour = await this.toursRepository.findOne({ where: { id: tourId } });
    if (!tour)
      throw new NotFoundException(`Tour with ID "${tourId}" not found`);

    const basePricePerPerson = Number(tour.price);
    const basePrice = basePricePerPerson * pax;

    // Simple discount sample: weekend -5%
    const refDate = travelDate
      ? new Date(travelDate)
      : startDate
        ? new Date(startDate)
        : new Date();
    const discount = this.calculateDiscount(refDate, basePrice);
    const totalPrice = basePrice - discount;

    return {
      basePrice,
      discount,
      totalPrice,
      breakdown: {
        pricePerPerson: basePricePerPerson,
        pax,
        subtotal: basePrice,
        discountPercentage: discount > 0 ? 5 : 0,
        discountAmount: discount,
        total: totalPrice,
      },
    };
  }

  async create(createBookingDto: CreateBookingDto, userId: string) {
    const travelDate = createBookingDto.travelDate
      ? new Date(createBookingDto.travelDate)
      : undefined;
    const startDate = createBookingDto.startDate
      ? new Date(createBookingDto.startDate)
      : undefined;
    const endDate = createBookingDto.endDate
      ? new Date(createBookingDto.endDate)
      : undefined;

    return this.dataSource.transaction(async (manager) => {
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

      // 2) Re-check capacity inside the lock (prefer schedule override if provided)
      let maxCapacity = tour.max_group_size;
      let bookedSeatsTotal = 0;

      if (createBookingDto.tourScheduleId) {
        const schedule = await manager.getRepository(TourSchedule).findOne({
          where: { id: createBookingDto.tourScheduleId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!schedule) {
          throw new NotFoundException('Schedule not found');
        }
        if (schedule.tour_id !== tour.id) {
          throw new BadRequestException(
            'Schedule does not belong to this tour',
          );
        }
        maxCapacity = schedule.max_capacity_override ?? tour.max_group_size;

        const booked = await manager
          .getRepository(Booking)
          .createQueryBuilder('b')
          .select('COALESCE(SUM(b.pax), 0)', 'total')
          .where('b.tourScheduleId = :sid', { sid: schedule.id })
          .andWhere('b.status NOT IN (:...statuses)', {
            statuses: [BookingStatus.CANCELLED, BookingStatus.EXPIRED],
          })
          .getRawOne<{ total: string }>();
        bookedSeatsTotal = Number(booked?.total ?? 0);
      } else if (travelDate) {
        const booked = await manager
          .getRepository(Booking)
          .createQueryBuilder('b')
          .select('COALESCE(SUM(b.pax), 0)', 'total')
          .where('b.tourId = :tourId', { tourId: tour.id })
          .andWhere('b.travelDate = :travelDate', { travelDate })
          .andWhere('b.status NOT IN (:...statuses)', {
            statuses: [BookingStatus.CANCELLED, BookingStatus.EXPIRED],
          })
          .getRawOne<{ total: string }>();
        bookedSeatsTotal = Number(booked?.total ?? 0);
      }

      const available = maxCapacity - bookedSeatsTotal;

      if (available < createBookingDto.pax) {
        const remaining = Math.max(available, 0);
        throw new BadRequestException(`เหลือที่นั่งเพียง ${remaining} ที่`);
      }

      // 3) Calculate pricing and create booking within the same transaction
      const pricing = await this.calculatePrice({
        tourId: createBookingDto.tourId,
        travelDate: createBookingDto.travelDate,
        startDate: createBookingDto.startDate,
        endDate: createBookingDto.endDate,
        pax: createBookingDto.pax,
        selectedOptions: createBookingDto.selectedOptions,
      });

      const bookingReference = this.generateBookingReference();

      const booking = manager.create(Booking, {
        bookingReference,
        tourId: createBookingDto.tourId,
        userId,
        tourScheduleId: createBookingDto.tourScheduleId,
        travelDate,
        startDate,
        endDate,
        pax: createBookingDto.pax,
        basePrice: pricing.basePrice,
        discount: pricing.discount,
        totalPrice: pricing.totalPrice,
        contactInfo: createBookingDto.contactInfo,
        specialRequests: createBookingDto.specialRequests,
        selectedOptions: createBookingDto.selectedOptions,
        status: BookingStatus.PENDING_PAY,
        paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const savedBooking = await manager.save(booking);

      return {
        id: savedBooking.id,
        bookingReference: savedBooking.bookingReference,
        status: savedBooking.status,
        tourId: savedBooking.tourId,
        startDate: savedBooking.startDate,
        endDate: savedBooking.endDate,
        pax: savedBooking.pax,
        totalPrice: savedBooking.totalPrice,
        contactInfo: savedBooking.contactInfo,
        createdAt: savedBooking.createdAt,
      };
    });
  }

  findAll() {
    return this.bookingsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByUser(userId: string) {
    const bookings = await this.bookingsRepository.find({
      where: { userId },
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
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // If userId is provided, verify ownership
    if (userId && booking.userId !== userId) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
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
    // 5% discount for weekend bookings (Saturday or Sunday)
    const dayOfWeek = startDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return basePrice * 0.05;
    }
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
