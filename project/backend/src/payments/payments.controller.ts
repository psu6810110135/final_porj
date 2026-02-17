import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ดึงรายการที่รอตรวจสอบทั้งหมด
  @Get('pending')
  getPending() {
    return this.paymentsService.findAllPending();
  }

  // กดยืนยัน หรือ ปฏิเสธ
  @Patch(':id/verify')
  verify(@Param('id') id: string, @Body('status') status: 'approved' | 'rejected') {
    return this.paymentsService.verifyPayment(id, status);
  }
}