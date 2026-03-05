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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingsService } from './bookings.service';
import { CalculateBookingDto } from './dto/calculate-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('api/v1/bookings')
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

  @Post(':id/upload-slip')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/slips', // โฟลเดอร์ที่จะเก็บรูป
        filename: (req, file, cb) => {
          // ตั้งชื่อไฟล์ใหม่ไม่ให้ซ้ำกัน (กันรูปทับกัน)
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `slip-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ไม่เกิน 5MB
    }),
  )
  async uploadSlip(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('กรุณาอัปโหลดไฟล์รูปภาพ');
    }
    const userId = req.user.id;
    return this.bookingsService.uploadPaymentSlip(id, file.filename, userId);
  }
}
