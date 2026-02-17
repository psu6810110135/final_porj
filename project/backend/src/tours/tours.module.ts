import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import this
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { Tour } from './entities/tour.entity'; // Import the Entity

@Module({
  imports: [TypeOrmModule.forFeature([Tour])], // Add this line to provide the Repository
  controllers: [ToursController],
  providers: [ToursService],
  exports: [ToursService], // Good practice to export if other modules need it
})
export class ToursModule {}