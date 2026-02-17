import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller'; // 👈 อย่าลืมบรรทัดนี้
import { Tour } from './entities/tour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tour])],
  controllers: [ToursController], // 👈 เพิ่มบรรทัดนี้เข้าไปครับ
  providers: [ToursService],
})
export class ToursModule {}