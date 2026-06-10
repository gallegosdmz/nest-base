import { Column, CreateDateColumn, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../modules/users/external-system/entities/user.entity";

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User;

  @Column('uuid', { name: 'created_by_id', nullable: true })
  createdById?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy?: User;

  @Column('uuid', { name: 'updated_by_id', nullable: true })
  updatedById?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}