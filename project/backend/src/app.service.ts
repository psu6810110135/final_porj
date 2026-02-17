import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '..payements/entities/payment.entity';
import { Tour } from '../tours/entities/tour.entity';
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Tour) private tourRepo: Repository<Tour>,
  ) {}

  async getDashboardStats() {
    // 1. หา Total Revenue (เฉพาะที่ confirmed แล้ว)
    const revenueResult = await this.bookingRepo
      .createQueryBuilder('booking')
      .select('SUM(booking.totalPrice)', 'sum')
      .where("booking.status = 'confirmed'")
      .getRawOne();

    // 2. นับ Booking วันนี้
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = await this.bookingRepo
      .createQueryBuilder('booking')
      .where('DATE(booking.createdAt) = :today', { today })
      .getCount();

    // 3. นับ Payment ที่รอตรวจสอบ
    const pendingPayments = await this.paymentRepo.count({
      where: { status: 'pending_verify' }
    });

    // 4. นับทัวร์ที่เปิดขาย
    const activeTours = await this.tourRepo.count({
      where: { is_active: true } // *เช็คใน Tour Entity ด้วยว่าใช้ชื่อ isActive หรือ is_active
    });

    return {
      totalRevenue: Number(revenueResult?.sum || 0),
      todayBookings,
      pendingPayments,
      activeTours,
    };
  }
}