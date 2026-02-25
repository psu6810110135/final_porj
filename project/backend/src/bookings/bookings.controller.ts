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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingsService } from './bookings.service';
import { CalculateBookingDto } from './dto/calculate-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';

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
}
