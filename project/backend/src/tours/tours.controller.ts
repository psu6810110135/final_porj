import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { ToursService } from './tours.service';
import { GetToursFilterDto } from './dto/get-tours-filter.dto';
import { Tour } from './entities/tour.entity';
import { UpdateTourDto } from './dto/update-tour.dto';
import { CreateTourDto } from './dto/create-tour.dto';

@Controller('api/v1/tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  // 1. GET /tours (Get all tours + Filter)
  @Get()
  getTours(@Query() filterDto: GetToursFilterDto): Promise<Tour[]> {
    return this.toursService.getTours(filterDto);
  }

  // 2. POST /tours (Create a new tour - REQUIRED FOR ADMIN)
  @Post()
  createTour(@Body() createTourDto: CreateTourDto): Promise<Tour> {
    return this.toursService.create(createTourDto);
  }

  // 3. POST /tours/seed (Generate mock data)
  @Post('seed')
  seedTours() {
    return this.toursService.seedTours();
  }

  // 4. GET /tours/:id (Get single tour details)
  @Get(':id')
  getTourById(@Param('id') id: string): Promise<Tour> {
    return this.toursService.getTourById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTourDto: UpdateTourDto) {
    return this.toursService.update(id, updateTourDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.toursService.remove(id);
  }
}
