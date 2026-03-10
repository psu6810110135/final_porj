import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  // รับข้อมูลจากหน้า Contact Us -> เซฟลง Database
  async createTicket(createTicketDto: CreateTicketDto) {
    console.log('Get this data:', createTicketDto);

    const newTicket = this.ticketRepository.create({
      ...createTicketDto,
      status: 'pending',
    });

    await this.ticketRepository.save(newTicket);
    return { success: true, message: 'บันทึกข้อมูลสำเร็จ', data: newTicket };
  }

  // ส่งข้อมูลให้หน้า Admin
  async findAll() {
    const data = await this.ticketRepository.find({
      order: { created_at: 'DESC' },
    });
    return { data };
  }

  // 3. เปลี่ยนสถานะ (pending / resolved / cancelled)
  async updateStatus(id: string, status: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: id },
    });

    if (!ticket) throw new NotFoundException('ไม่พบ Ticket นี้');

    ticket.status = status;
    await this.ticketRepository.save(ticket);
    return ticket;
  }

  async removeResolvedTicket(id: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: id },
    });

    if (!ticket) throw new NotFoundException('ไม่พบ Ticket นี้');

    if (ticket.status !== 'resolved') {
      throw new BadRequestException('สามารถลบได้เฉพาะ Ticket ที่แก้ไขแล้ว');
    }

    await this.ticketRepository.remove(ticket);
    return { success: true, message: 'ลบ Ticket สำเร็จ' };
  }
}
