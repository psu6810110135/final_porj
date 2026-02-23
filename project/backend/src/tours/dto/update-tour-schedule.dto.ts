import { PartialType } from '@nestjs/mapped-types';
import { CreateTourScheduleDto } from './create-tour-schedule.dto';

export class UpdateTourScheduleDto extends PartialType(CreateTourScheduleDto) {}
