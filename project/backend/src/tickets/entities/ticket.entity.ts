import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tickets') // สร้างตารางชื่อ 'tickets'
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column('text')
  message: string;

  @Column({ default: 'pending' }) // ค่าเริ่มต้น: pending, resolved, cancelled
  status: string;

  @CreateDateColumn()
  created_at: Date;
}