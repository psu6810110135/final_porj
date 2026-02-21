import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CalculateBookingDto } from './dto/calculate-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { Tour } from '../tours/entities/tour.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private readonly dataSource: DataSource,
  ) {}

  async findAllForAdmin() {
    return this.bookingsRepository.find({
      relations: ['user', 'tour'],
      order: { createdAt: 'DESC' },
    });
  }

  async calculatePrice(calculateBookingDto: CalculateBookingDto) {
    const { tourId, startDate, endDate, numberOfTravelers } =
      calculateBookingDto;

    // Mock tour price - in real app, fetch from tours table
    const basePricePerPerson = 5000;
    const basePrice = basePricePerPerson * numberOfTravelers;

    // Calculate discount based on weekend/holiday
    const start = new Date(startDate);
    const discount = this.calculateDiscount(start, basePrice);
    const totalPrice = basePrice - discount;

    return {
      basePrice,
      discount,
      totalPrice,
      breakdown: {
        pricePerPerson: basePricePerPerson,
        numberOfTravelers,
        subtotal: basePrice,
        discountPercentage: discount > 0 ? 5 : 0,
        discountAmount: discount,
        total: totalPrice,
      },
    };
  }

  async create(createBookingDto: CreateBookingDto, userId: string) {
    const startDate = new Date(createBookingDto.startDate);
    const endDate = new Date(createBookingDto.endDate);

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

      // 2) Re-check capacity inside the lock
      const activeBookings = await manager.getRepository(Booking).count({
        where: {
          tourId: createBookingDto.tourId,
          startDate,
          status: Not(In([BookingStatus.CANCELLED, BookingStatus.REFUNDED])),
        },
      });

      const available = tour.max_group_size - activeBookings;

      if (available < createBookingDto.numberOfTravelers) {
        const remaining = Math.max(available, 0);
        throw new BadRequestException(`เหลือที่นั่งเพียง ${remaining} ที่`);
      }

      // 3) Calculate pricing and create booking within the same transaction
      const pricing = await this.calculatePrice({
        tourId: createBookingDto.tourId,
        startDate: createBookingDto.startDate,
        endDate: createBookingDto.endDate,
        numberOfTravelers: createBookingDto.numberOfTravelers,
      });

      const bookingReference = this.generateBookingReference();

      const booking = manager.create(Booking, {
        bookingReference,
        tourId: createBookingDto.tourId,
        userId,
        startDate,
        endDate,
        numberOfTravelers: createBookingDto.numberOfTravelers,
        basePrice: pricing.basePrice,
        discount: pricing.discount,
        totalPrice: pricing.totalPrice,
        contactInfo: createBookingDto.contactInfo,
        specialRequests: createBookingDto.specialRequests,
        status: BookingStatus.PENDING,
      });

      const savedBooking = await manager.save(booking);

      return {
        id: savedBooking.id,
        bookingReference: savedBooking.bookingReference,
        status: savedBooking.status,
        tourId: savedBooking.tourId,
        startDate: savedBooking.startDate,
        endDate: savedBooking.endDate,
        numberOfTravelers: savedBooking.numberOfTravelers,
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

    if (booking.status === BookingStatus.REFUNDED) {
      throw new BadRequestException('Booking has already been refunded');
    }

    // Calculate refund amount (100% refund if cancelled 7+ days before start)
    const daysUntilStart = this.getDaysUntilStart(booking.startDate);
    const refundPercentage =
      daysUntilStart >= 7 ? 100 : daysUntilStart >= 3 ? 50 : 0;
    const refundAmount = (booking.totalPrice * refundPercentage) / 100;

    // Update booking
    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = cancelDto.reason;
    booking.refundAmount = refundAmount;

    const updatedBooking = await this.bookingsRepository.save(booking);

    return {
      id: updatedBooking.id,
      status: updatedBooking.status,
      refundAmount: updatedBooking.refundAmount,
      refundPercentage,
      cancellationReason: updatedBooking.cancellationReason,
    };
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
