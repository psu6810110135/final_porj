import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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
}