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
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { ToursService } from './tours.service';
import { GetToursFilterDto } from './dto/get-tours-filter.dto';
import { Tour } from './entities/tour.entity';
import { UpdateTourDto } from './dto/update-tour.dto';
import { CreateTourDto } from './dto/create-tour.dto';

// 💡 ตรวจสอบและสร้างโฟลเดอร์ uploads อัตโนมัติถ้ายังไม่มี
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper to configure file storage
const storageConfig = diskStorage({
  destination: uploadDir,
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

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

  @Post()
  @UseInterceptors(AnyFilesInterceptor({ storage: storageConfig }))
  createTour(
    @Body() createTourDto: CreateTourDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ): Promise<Tour> {
    if (files) {
      const cover = files.find(f => f.fieldname === 'image_cover');
      const extras = files.filter(f => f.fieldname === 'images');
      
      if (cover) createTourDto.image_cover = `uploads/${cover.filename}`;
      if (extras.length > 0) createTourDto.images = extras.map(f => `uploads/${f.filename}`);
    }

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

  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor({ storage: storageConfig }))
  update(
    @Param('id') id: string, 
    @Body() updateTourDto: UpdateTourDto,
    @UploadedFiles() files: Array<any>
  ) {
    if (files) {
      const cover = files.find(f => f.fieldname === 'image_cover');
      const extras = files.filter(f => f.fieldname === 'images');
      
      if (cover) updateTourDto.image_cover = `uploads/${cover.filename}`;
      if (extras.length > 0) updateTourDto.images = extras.map(f => `uploads/${f.filename}`);
    }

    return this.toursService.update(id, updateTourDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.toursService.remove(id);
  }
}