import { Controller, Get, Param } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { RolesService } from "../../business/services/roles.service";
import { RequirePermissions } from "../decorators/requiere-permissions.decorator";
import { Action } from "../../business/entities/Action";

@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @RequirePermissions({ resource: 'users', action: Action.READ })
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @RequirePermissions({ resource: 'users', action: Action.READ })
  @Get(':name')
  findOneByName(
    @Param('name') name: string,
  ) {
    return this.rolesService.findOneByName(name);
  }
}