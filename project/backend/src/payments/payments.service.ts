import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import generatePayload = require('promptpay-qr');

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
  ) {}

  // 1. ฟังก์ชันสร้าง Payload สำหรับ QR Code (แบบระบุยอดเงินอัตโนมัติ)
  async generateQrCode(bookingId: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['tour', 'user']
    });

    if (!booking) throw new NotFoundException('ไม่พบข้อมูลการจอง');

    // ใส่เบอร์โทรศัพท์ที่ผูกกับพร้อมเพย์ของคุณ
    const mobileNumber = '081-XXX-XXXX'; 
    // ดึงราคาทัวร์จาก Database มาใช้เป็นยอดโอน
    const amount = booking.tour.price;
    
    // สร้าง Payload ตามมาตรฐาน EMVCo
    const payload = generatePayload(mobileNumber, { amount });
    
    return { 
      payload, 
      amount,
      tourTitle: booking.tour.title,
      customerName: booking.user?.username || 'Customer'
    };
  }

  // 2. ดึงรายการที่รอแอดมินตรวจสอบ (Status: pending_verify)
  findPending() {
    return this.paymentRepo.find({
      where: { status: 'pending_verify' },
      relations: ['booking', 'booking.user', 'booking.tour'],
      order: { uploadedAt: 'ASC' },
    });
  }

  // 3. ระบบอนุมัติหรือปฏิเสธการชำระเงิน
  async verifyPayment(id: string, status: 'approved' | 'rejected') {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['booking'],
    });
    
    if (!payment) throw new NotFoundException('ไม่พบรายการชำระเงินนี้');

    payment.status = status;
    payment.verifiedAt = new Date();
    await this.paymentRepo.save(payment);

    // ถ้าอนุมัติ ให้เปลี่ยนสถานะการจองเป็น CONFIRMED
    if (status === 'approved') {
      await this.bookingRepo.update(payment.booking.id, {
        status: BookingStatus.CONFIRMED,
      });
    } else {
      // ถ้าไม่อนุมัติ ให้กลับไปสถานะ PENDING เพื่อให้ลูกค้าจัดการใหม่
      await this.bookingRepo.update(payment.booking.id, {
        status: BookingStatus.PENDING,
      });
    }

    return { success: true, message: `สถานะการชำระเงินถูกเปลี่ยนเป็น ${status}` };
  }

  // 4. ฟังก์ชันเช็คสถานะการจ่ายเงิน (สำหรับหน้าจอลูกค้า)
  async checkStatus(id: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      select: ['id', 'status'],
    });

    if (!payment) throw new NotFoundException('ไม่พบข้อมูลการชำระเงิน');

    return { id: payment.id, status: payment.status };
  }
}