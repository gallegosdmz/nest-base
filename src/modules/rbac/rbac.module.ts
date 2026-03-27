import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './external-system/entities/resource.entity';
import { Role } from './external-system/entities/role.entity';
import { Permission } from './external-system/entities/permission.entity';
import { User } from '../users/external-system/entities/user.entity';
import { RolesRepositoryImpl } from './external-system/repositories/roles.repository.impl';
import { RolesService } from './business/services/roles.service';
import { RolesController } from './application/controllers/roles.controller';
import { RbacSeeder } from './external-system/seeds/rbac.seed';
import { PermissionsGuard } from './application/guards/permissions.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Resource, Role, Permission, User])
  ],
  controllers: [RolesController],
  providers: [
    { provide: 'RolesRepository', useClass: RolesRepositoryImpl },
    RolesService,
    RbacSeeder,
    PermissionsGuard,
  ],
  exports: [RolesService, PermissionsGuard],
})
export class RbacModule {}