import { Body, Controller, Delete, Get, Param, Patch, Query } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "../../business/services/users.service";
import { GetUser } from "../decorators/get-user.decorator";
import type { IUser } from "../../business/entities/User";
import { UpdateUserDto } from "../dto/update-user.dto";
import { Action } from "../../../rbac/business/entities/Action";
import { RequirePermissions } from "../../../rbac/application/decorators/requiere-permissions.decorator";
import { PaginationDto } from "../../../../shared/dtos/pagination.dto";

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RequirePermissions({ resource: 'users', action: Action.READ })
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.usersService.findAll(paginationDto);
  }

  @Get('me')
  findProfile(
    @GetUser() user: IUser,
  ) {
    return this.usersService.findOne(user.id ?? '');
  }

  @RequirePermissions({ resource: 'users', action: Action.READ })
  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.usersService.findOne(id);
  }

  @RequirePermissions({ resource: 'users', action: Action.UPDATE })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
    @GetUser() user: IUser,
  ) {
    return this.usersService.update(id, updateDto, user);
  }

  @RequirePermissions({ resource: 'users', action: Action.DELETE })
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser() user: IUser,
  ) {
    return this.usersService.remove(id, user);
  }
}