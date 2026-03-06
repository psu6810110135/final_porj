import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller('api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // รับข้อมูลจากหน้า ContactUs
  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.createTicket(createTicketDto);
  }

  // ส่งข้อมูลไปให้หน้า Admin
  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  // รับคำสั่งเปลี่ยนสถานะจากหน้า Admin
  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ticketsService.updateStatus(id, status);
  }
}
