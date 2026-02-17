import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
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
    // 1. Calculate Total Revenue (only confirmed bookings)
    const revenueQuery = await this.bookingRepo
      .createQueryBuilder('booking')
      .select('SUM(booking.totalPrice)', 'sum')
      .where("booking.status = 'confirmed'")
      .getRawOne();

    // 2. Count Today's Bookings
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const todayBookings = await this.bookingRepo
      .createQueryBuilder('booking')
      .where('DATE(booking.createdAt) = :today', { today })
      .getCount();

    // 3. Count Pending Payments
    const pendingPayments = await this.paymentRepo.count({
      where: { status: 'pending_verify' }
    });

    // 4. Count Active Tours
    const activeTours = await this.tourRepo.count();

    return {
      success: true,
      data: {
        totalRevenue: Number(revenueQuery?.sum || 0),
        todayBookings,
        pendingPayments,
        activeTours,
      },
    };
  }
}