import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {} // Inject Service

  @Get('stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats(); // Call real logic
  }
}