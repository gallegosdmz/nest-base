import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Action } from "../../business/entities/Action";
import { Resource } from "./resource.entity";
import { Role } from "./role.entity";

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Action })
  action: Action;

  @ManyToOne(() => Resource, (resource) => resource.permissions, { eager: true })
  resource: Resource;

  @ManyToOne(() => Role, (role) => role.permissions)
  role: Role;
}