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
  // @UseGuards(JwtAuthGuard) // Uncomment when auth is implemented
  create(@Body() createBookingDto: CreateBookingDto, @Request() req: any) {
    // For now, use a mock user ID. Replace with req.user.id when auth is ready
    const userId = req.user?.id || '11111111-1111-1111-1111-111111111111';
    return this.bookingsService.create(createBookingDto, userId);
  }

  @Get('my-bookings')
  // @UseGuards(JwtAuthGuard) // Uncomment when auth is implemented
  findMyBookings(@Request() req: any) {
    // For now, use a mock user ID. Replace with req.user.id when auth is ready
    const userId = req.user?.id || '11111111-1111-1111-1111-111111111111';
    return this.bookingsService.findAllByUser(userId);
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard) // Uncomment when auth is implemented
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    // For now, use a mock user ID. Replace with req.user.id when auth is ready
    const userId = req.user?.id || '11111111-1111-1111-1111-111111111111';
    return this.bookingsService.findOneById(id, userId);
  }

  @Patch(':id/cancel')
  // @UseGuards(JwtAuthGuard) // Uncomment when auth is implemented
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cancelBookingDto: CancelBookingDto,
    @Request() req: any,
  ) {
    // For now, use a mock user ID. Replace with req.user.id when auth is ready
    const userId = req.user?.id || '11111111-1111-1111-1111-111111111111';
    return this.bookingsService.cancelBooking(id, cancelBookingDto, userId);
  }
}
