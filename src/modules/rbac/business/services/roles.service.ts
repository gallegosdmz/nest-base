import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { RolesRepository } from "../repositories/roles.repository";
import { IRole } from "../entities/Role";

@Injectable()
export class RolesService {
  constructor(
    @Inject('RolesRepository')
    private readonly rolesRepo: RolesRepository,
  ) {}

  async findAll(): Promise<IRole[]> {
    return this.rolesRepo.findAll();
  }

  async findOneByName(name: string): Promise<IRole> {
    const role = await this.rolesRepo.findOneByName(name);
    if (!role) throw new NotFoundException(`Role: ${name}, not found`);

    return role;
  }

  async hasPermission(roleId: string, resourceSlug: string, action: string): Promise<boolean> {
    return this.rolesRepo.hasPermission(roleId, resourceSlug, action);
  }
}