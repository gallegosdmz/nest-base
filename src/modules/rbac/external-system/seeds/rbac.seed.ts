import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Resource } from '../entities/resource.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { User } from 'src/modules/users/external-system/entities/user.entity';
import { Action } from '../../business/entities/Action';
import * as bcrypt from 'bcrypt';

const RBAC_CONFIG = {
  resources: [
    { name: 'Users', slug: 'users' },
    { name: 'Orders', slug: 'orders' },
    { name: 'Shipments', slug: 'shipments' },
    { name: 'Notifications', slug: 'notifications' },
  ],
  roles: {
    admin: {
      description: 'Full system access',
      permissions: {
        users: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
        orders: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
        shipments: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
        notifications: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
      },
    },
    sales: {
      description: 'Sales team member',
      permissions: {
        orders: [Action.CREATE, Action.READ, Action.UPDATE],
        shipments: [Action.READ],
        notifications: [Action.READ],
      },
    },
    purchases: {
      description: 'Purchases team member',
      permissions: {
        orders: [Action.READ],
        shipments: [Action.CREATE, Action.READ, Action.UPDATE],
        notifications: [Action.READ],
      },
    },
    client: {
      description: 'External client',
      permissions: {
        orders: [Action.CREATE, Action.READ],
        shipments: [Action.READ],
        notifications: [Action.READ],
      },
    },
  },
};

@Injectable()
export class RbacSeeder implements OnModuleInit {
  private readonly logger = new Logger(RbacSeeder.name);

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepo: Repository<Resource>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    const existingRoles = await this.roleRepo.count();
    if (existingRoles > 0) {
      this.logger.log('RBAC already seeded, skipping...');
      return;
    }

    this.logger.log('Seeding RBAC...');

    const resources = new Map<string, Resource>();
    for (const res of RBAC_CONFIG.resources) {
      const resource = this.resourceRepo.create(res);
      await this.resourceRepo.save(resource);
      resources.set(res.slug, resource);
    }

    for (const [roleName, roleConfig] of Object.entries(RBAC_CONFIG.roles)) {
      const role = this.roleRepo.create({
        name: roleName,
        description: roleConfig.description,
      });
      await this.roleRepo.save(role);

      for (const [resourceSlug, actions] of Object.entries(roleConfig.permissions)) {
        const resource = resources.get(resourceSlug);
        if (!resource) continue;

        for (const action of actions) {
          const permission = this.permissionRepo.create({
            action,
            resource,
            role,
          });
          await this.permissionRepo.save(permission);
        }
      }
    }

    await this.seedAdminUser();
    this.logger.log('RBAC seeded successfully');
  }

  private async seedAdminUser() {
    const existingAdmin = await this.userRepo.findOne({
      where: { email: this.configService.get<string>('ADMIN_EMAIL', 'admin@admin.com') },
    });

    if (existingAdmin) {
      this.logger.log('Admin user already exists, skipping...');
      return;
    }

    const adminRole = await this.roleRepo.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      this.logger.error('Admin role not found, cannot create admin user');
      return;
    }

    const adminUser = this.userRepo.create({
      email: this.configService.get<string>('ADMIN_EMAIL', 'admin@admin.com'),
      password: bcrypt.hashSync(
        this.configService.get<string>('ADMIN_PASSWORD', 'Admin123!'),
        10,
      ),
      firstName: 'Admin',
      lastName: 'System',
      isVerified: true,
      role: adminRole,
      roleId: adminRole.id,
    });

    await this.userRepo.save(adminUser);
    this.logger.log('Admin user created successfully');
  }
}