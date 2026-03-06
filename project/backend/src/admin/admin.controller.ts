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
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('api/v1/admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('bookings')
  async getAllBookings() {
    return this.adminService.getAllBookings();
  }

  @Delete('bookings/:id')
  async deleteBooking(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteBooking(id);
  }

  @Patch('bookings/:id/status')
  async updateBookingStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBookingStatusDto,
  ) {
    return this.adminService.updateBookingStatus(id, body.status);
  }
}
