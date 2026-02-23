import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
  ) {}

  // Get only pending payments for admin review
  findPending() {
    return this.paymentRepo.find({
      where: { status: 'pending_verify' },
      relations: ['booking', 'booking.user', 'booking.tour'], // Join related data
      order: { uploadedAt: 'ASC' },
    });
  }

  async verifyPayment(id: string, status: 'approved' | 'rejected') {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['booking'],
    });
    if (!payment) throw new NotFoundException('Payment not found');

    // Update Payment Status
    payment.status = status;
    payment.verifiedAt = new Date();
    await this.paymentRepo.save(payment);

    // Update Booking Status based on decision
    if (status === 'approved') {
      await this.bookingRepo.update(payment.booking.id, {
        status: BookingStatus.CONFIRMED,
      });
    } else {
      await this.bookingRepo.update(payment.booking.id, {
        status: BookingStatus.PENDING_VERIFY,
      }); // Reset to pending verify if rejected
    }

    return { success: true, message: `Payment ${status}` };
  }

  // ... keep other CRUD methods if needed
}
