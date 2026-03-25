import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from '../entities/resource.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Action } from '../../business/entities/Action';

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
  ) {}

  async onModuleInit() {
    
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

    this.logger.log('RBAC seeded successfully');
  }
}