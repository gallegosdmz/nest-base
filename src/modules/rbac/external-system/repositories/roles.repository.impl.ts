import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { RolesRepository } from "../../business/repositories/roles.repository";
import { Repository } from "typeorm";
import { Role } from "../entities/role.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IRole } from "../../business/entities/Role";

@Injectable()
export class RolesRepositoryImpl implements RolesRepository {
  private readonly logger = new Logger(RolesRepositoryImpl.name);

  constructor(
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
  ) {}

  async findAll(): Promise<IRole[]> {
    try {
      return this.rolesRepo.find();
    } catch (e) {
      this.logger.error('Error in findAll - Roles: ', e);
      throw new InternalServerErrorException('Error in RBAC Module');
    }
  }

  async findOneByName(name: string): Promise<IRole | null> {
    return this.rolesRepo.findOne({ where: { name }});
  }

  async findOneWithPermissions(roleId: string): Promise<IRole | null> {
    return this.rolesRepo.findOne({
      where: { id: roleId },
      relations: {
        permissions: {
          resource: true
        },
      },
    });
  }

  async hasPermission(roleId: string, resourceSlug: string, action: string): Promise<boolean> {
    const count = await this.rolesRepo
      .createQueryBuilder('role')
      .innerJoin('role.permissions', 'permissions')
      .innerJoin('permission.resource', 'resource')
      .where('role.id = :roleId', { roleId })
      .andWhere('resource.slug = :resourceSlug', { resourceSlug })
      .andWhere('permission.action = :action', { action })
      .getCount();

    return count > 0;
  }
}