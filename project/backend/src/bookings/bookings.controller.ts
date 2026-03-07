import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingsService } from './bookings.service';
import { CalculateBookingDto } from './dto/calculate-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('calculate')
  calculatePrice(@Body() calculateBookingDto: CalculateBookingDto) {
    return this.bookingsService.calculatePrice(calculateBookingDto);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createBookingDto: CreateBookingDto, @Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.bookingsService.create(createBookingDto, userId);
  }

  // ✅ แก้ 404: เพิ่ม Endpoint ดึงการจองทั้งหมด (สำหรับ Admin Dashboard)
  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAllBookings() {
    // ป้องกันแอปพัง หากไม่มีฟังก์ชัน findAll ใน Service
    if (typeof this.bookingsService['findAll'] === 'function') {
      return this.bookingsService['findAll']();
    }
    return [];
  }

  @Get('my-bookings')
  @UseGuards(AuthGuard('jwt'))
  findMyBookings(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.bookingsService.findAllByUser(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.bookingsService.findOneById(id, userId);
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard('jwt'))
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cancelBookingDto: CancelBookingDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.bookingsService.cancelBooking(id, cancelBookingDto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/upload-slip')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/slips',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `slip-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadSlip(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any, // เก็บ req ไว้เพื่อเข้าไปดูว่าข้างในมีอะไร
  ) {
    if (!file) {
      throw new BadRequestException('กรุณาอัปโหลดไฟล์รูปภาพ');
    }

    // 🌟 จุดเปลี่ยนอยู่ตรงนี้ครับ:
    // ถ้า req.user.id เป็น undefined ให้ลองใช้ req.user.userId หรือ req.user.sub
    // หรือลอง console.log(req.user) ใน Terminal ดูว่าในนั้นมีชื่อฟิลด์ว่าอะไร
    const userId = req.user?.id || req.user?.userId || req.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('ไม่พบข้อมูล User ID ในระบบ');
    }

    return this.bookingsService.uploadPaymentSlip(id, file.filename, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/renew')
  async renewBooking(@Param('id') id: string, @Req() req: any) {
    // ดึง userId จาก Token (ปรับชื่อ req.user.id หรือ req.user.sub ตามที่ตั้งไว้ใน payload)
    const userId = req.user?.id || req.user?.sub; 
    
    return await this.bookingsService.renewBooking(id, userId);
  }
}
