import { Body, Controller, Delete, Get, Param, Patch, Query } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "../../business/services/users.service";
import { GetUser } from "../decorators/get-user.decorator";
import type { IUser } from "../../business/entities/User";
import { PaginationDto } from "src/shared/dtos/pagination.dto";
import { UpdateUserDto } from "../dto/update-user.dto";

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
    @GetUser() user: IUser,
  ) {
    return this.usersService.update(id, updateDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser() user: IUser,
  ) {
    return this.usersService.remove(id, user);
  }
}