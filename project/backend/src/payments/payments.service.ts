import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
  ) {}

  // Get list for Admin
  async findAllPending() {
    return this.paymentRepo.find({
      where: { status: 'pending_verify' },
      relations: ['booking', 'booking.user', 'booking.tour'], // Join tables
      order: { uploadedAt: 'ASC' },
    });
  }

  // Admin Action
  async verifyPayment(id: string, status: 'approved' | 'rejected') {
    const payment = await this.paymentRepo.findOne({ 
      where: { id },
      relations: ['booking'] 
    });

    if (!payment) throw new NotFoundException('Payment not found');

    // 1. Update Payment
    payment.status = status;
    await this.paymentRepo.save(payment);

    // 2. Update Booking
    if (status === 'approved') {
      await this.bookingRepo.update(payment.booking.id, { status: 'confirmed' });
    } else {
      await this.bookingRepo.update(payment.booking.id, { status: 'pending_pay' }); // Let them try again
    }

    return { success: true };
  }
}