import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Patch,
  Delete,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import { ToursService } from './tours.service';
import { GetToursFilterDto } from './dto/get-tours-filter.dto';
import { Tour } from './entities/tour.entity';
import { UpdateTourDto } from './dto/update-tour.dto';
import { CreateTourDto } from './dto/create-tour.dto';

@Controller('api/v1/tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  getTours(@Query() filterDto: GetToursFilterDto): Promise<Tour[]> {
    return this.toursService.getTours(filterDto);
  }

  @Get('recommended')
  getRecommendedTours(): Promise<Tour[]> {
    return this.toursService.getRecommendedTours();
  }

  // ✨ Added Interceptor to handle FormData (Images + Text)
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  createTour(
    @Body() createTourDto: CreateTourDto,
    @UploadedFiles() files: Array<Multer.File>
  ): Promise<Tour> {
    // Note: The 'files' array contains your uploaded images.
    // You can pass them to toursService if you have an upload logic set up!
    return this.toursService.create(createTourDto);
  }

  @Post('seed')
  seedTours() {
    return this.toursService.seedTours();
  }

  @Get(':id')
  getTourById(@Param('id') id: string): Promise<Tour> {
    return this.toursService.getTourById(id);
  }

  // ✨ Added Interceptor here too for updates
  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor())
  update(
    @Param('id') id: string, 
    @Body() updateTourDto: UpdateTourDto,
    @UploadedFiles() files: Array<Multer.File>
  ) {
    return this.toursService.update(id, updateTourDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.toursService.remove(id);
  }
}