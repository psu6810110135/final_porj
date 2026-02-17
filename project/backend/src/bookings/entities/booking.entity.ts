import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tour } from '../../tours/entities/tour.entity';
import { Payment } from '../../payments/entities/payment.entity'; // เดี๋ยวเราจะสร้างไฟล์นี้ใน Step 2

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ default: 'pending_pay' })
  status: string; // pending_pay, pending_verify, confirmed

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relation กับ User (ถ้ายังไม่มี User Entity ให้ comment บรรทัดนี้ไปก่อนได้)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relation กับ Tour
  @ManyToOne(() => Tour)
  @JoinColumn({ name: 'tour_id' })
  tour: Tour;

  // Relation กับ Payment
  @OneToOne(() => Payment, (payment) => payment.booking)
  payment: Payment;
}