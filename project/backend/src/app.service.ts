import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Fix paths: Use ./ to look inside src/ folder
import { Booking } from './bookings/entities/booking.entity';
import { Payment } from './payments/entities/payment.entity';
import { Tour } from './tours/entities/tour.entity';

@Injectable()
export class AppService { // FIXED: Class name must match file name (AppService)
  constructor(
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Tour) private tourRepo: Repository<Tour>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  // NOTE: Ideally, dashboard logic should be in AdminService, 
  // but if you want it here temporarily, this works:
  async getDashboardStats() {
    const revenueResult = await this.bookingRepo
      .createQueryBuilder('booking')
      .select('SUM(booking.totalPrice)', 'sum')
      .where("booking.status = 'confirmed'")
      .getRawOne();

    const today = new Date().toISOString().split('T')[0];
    const todayBookings = await this.bookingRepo
      .createQueryBuilder('booking')
      .where('DATE(booking.createdAt) = :today', { today })
      .getCount();

    const pendingPayments = await this.paymentRepo.count({
      where: { status: 'pending_verify' }
    });

    const activeTours = await this.tourRepo.count({
      where: { is_active: true }
    });

    return {
      totalRevenue: Number(revenueResult?.sum || 0),
      todayBookings,
      pendingPayments,
      activeTours,
    };
  }
}