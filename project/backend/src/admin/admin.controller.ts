import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';
// import { Role } from '../users/entities/user.entity';

@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('bookings')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  async getAllBookings() {
    return this.adminService.getAllBookings();
  }
}