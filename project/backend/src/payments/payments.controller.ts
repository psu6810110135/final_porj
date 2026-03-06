import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // 👇👇 สิ่งที่เพิ่มเข้ามา: ฟังก์ชันส่งข้อมูลให้หน้าเว็บวาดรูป QR Code 👇👇
  @UseGuards(AuthGuard('jwt'))
  @Get('qr/:id')
  async getQrCode(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.generateQrCode(id);
  }
  // 👆👆 =================================================== 👆👆

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('pending')
  getPendingPayments() {
    return this.paymentsService.findPending();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/verify')
  verifyPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: 'approved' | 'rejected',
  ) {
    return this.paymentsService.verifyPayment(id, status);
  }

  @Post('webhook')
  async handleBankWebhook(
    @Body() payload: { id: string; status: 'approved' | 'rejected' },
  ) {
    return this.paymentsService.verifyPayment(payload.id, payload.status);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/status')
  async checkPaymentStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.checkStatus(id);
  }
}
