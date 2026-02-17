import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity'; // Update path based on actual file location
import { Payment } from '../payments/entities/payment.entity';
import { Tour } from '../tours/entities/tour.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Tour) private tourRepo: Repository<Tour>,
  ) {}

  async getDashboardStats() {
    // Run queries in parallel for performance
    const [totalRevenue, todayBookings, pendingPayments, activeTours] = await Promise.all([
      // 1. Calculate Total Revenue (Sum of confirmed bookings)
      this.bookingRepo
        .createQueryBuilder('booking')
        .select('SUM(booking.total_price)', 'sum')
        .where("booking.status = 'confirmed'")
        .getRawOne(),

      // 2. Count Today's Bookings
      this.bookingRepo
        .createQueryBuilder('booking')
        .where('DATE(booking.created_at) = CURRENT_DATE')
        .getCount(),

      // 3. Count Pending Payments (Need verification)
      this.paymentRepo.count({ where: { status: 'pending_verify' } }),

      // 4. Count Active Tours
      this.tourRepo.count({ where: { isActive: true } }),
    ]);

    return {
      totalRevenue: Number(totalRevenue?.sum || 0),
      todayBookings,
      pendingPayments,
      activeTours,
    };
  }
}