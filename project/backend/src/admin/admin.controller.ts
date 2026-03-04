import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
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

  @Delete('bookings/:id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  async deleteBooking(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteBooking(id);
  }

  @Patch('bookings/:id/status')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  async updateBookingStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBookingStatusDto,
  ) {
    return this.adminService.updateBookingStatus(id, body.status);
  }
}
