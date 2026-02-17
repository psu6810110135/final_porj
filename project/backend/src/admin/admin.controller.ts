import { Controller, Get } from '@nestjs/common';

@Controller('api/v1/admin')
export class AdminController {
  @Get('stats')
  getDashboardStats() {
    return {
      success: true,
      data: {
        totalRevenue: 150200, // ข้อมูลจำลองสำหรับปี 1
        todayBookings: 12,
        pendingPayments: 4,
        activeTours: 8
      }
    };
  }
}