import { Controller, Get, Patch, Post, Param, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // 👇👇 สิ่งที่เพิ่มเข้ามา: ฟังก์ชันส่งข้อมูลให้หน้าเว็บวาดรูป QR Code 👇👇
  @Get('qr/:id')
  async getQrCode(@Param('id') id: string) {
    return this.paymentsService.generateQrCode(id);
  }
  // 👆👆 =================================================== 👆👆

  @Get('pending')
  getPendingPayments() {
    return this.paymentsService.findPending();
  }

  @Patch(':id/verify')
  verifyPayment(
    @Param('id') id: string,
    @Body('status') status: 'approved' | 'rejected'
  ) {
    return this.paymentsService.verifyPayment(id, status);
  }

  @Post('webhook')
  async handleBankWebhook(@Body() payload: { id: string; status: 'approved' | 'rejected' }) {
    return this.paymentsService.verifyPayment(payload.id, payload.status);
  }

  @Get(':id/status')
  async checkPaymentStatus(@Param('id') id: string) {
    return this.paymentsService.checkStatus(id);
  }
}