import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TourSchedulesService } from './tour-schedules.service';
import { CreateTourScheduleDto } from './dto/create-tour-schedule.dto';
import { UpdateTourScheduleDto } from './dto/update-tour-schedule.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('api/v1/tours/:tourId/schedules')
export class TourSchedulesController {
  constructor(private readonly schedulesService: TourSchedulesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Param('tourId') tourId: string,
    @Body() createDto: CreateTourScheduleDto,
  ) {
    return this.schedulesService.create(tourId, createDto);
  }

  @Get()
  findAll(@Param('tourId') tourId: string) {
    return this.schedulesService.findAll(tourId);
  }

  @Get('available')
  findAvailable(@Param('tourId') tourId: string) {
    return this.schedulesService.findAvailableByTour(tourId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateDto: UpdateTourScheduleDto) {
    return this.schedulesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }
}
