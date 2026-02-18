import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  slip_url: string;

  @Column({ default: 'pending_verify' })
  status: string; // pending_verify, approved, rejected

  @Column({ nullable: true })
  verifiedAt: Date;

  @CreateDateColumn()
  uploadedAt: Date;

  // Relations
  @OneToOne(() => Booking)
  @JoinColumn()
  booking: Booking;
}