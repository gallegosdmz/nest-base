import { Controller, Get, Param } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { RolesService } from "../../business/services/roles.service";

@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':name')
  findOneByName(
    @Param('name') name: string,
  ) {
    return this.rolesService.findOneByName(name);
  }
}