import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
  ) {}

  findPending() {
    return this.paymentRepo.find({
      where: { status: 'pending_verify' },
      relations: ['booking', 'booking.user', 'booking.tour'],
      order: { uploadedAt: 'ASC' },
    });
  }

  async verifyPayment(id: string, status: 'approved' | 'rejected') {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['booking'],
    });
    
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = status;
    payment.verifiedAt = new Date();
    await this.paymentRepo.save(payment);

    if (status === 'approved') {
      await this.bookingRepo.update(payment.booking.id, {
        status: BookingStatus.CONFIRMED,
      });
    } else {
      await this.bookingRepo.update(payment.booking.id, {
        status: BookingStatus.PENDING,
      });
    }

    return { success: true, message: `Payment ${status}` };
  }

  async checkStatus(id: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      select: ['id', 'status'],
    });

    if (!payment) throw new NotFoundException('Payment not found');

    return { id: payment.id, status: payment.status };
  }
}