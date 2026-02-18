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

@Controller('api/v1/tours') // Updated path
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  // 1. GET /tours (ดึงข้อมูลทั้งหมด + Filter)
  @Get()
  getTours(@Query() filterDto: GetToursFilterDto): Promise<Tour[]> {
    return this.toursService.getTours(filterDto);
  }

  // 2. POST /tours/seed (สร้างข้อมูลจำลอง)
  @Post('seed')
  seedTours() {
    return this.toursService.seedTours();
  }

  // 3. GET /tours/:id (ดึงรายตัว)
  // ต้องเอาไว้ล่างสุด! เพราะถ้าเอาไว้บน มันอาจจะมองว่าคำว่า "seed" คือ "id"
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
