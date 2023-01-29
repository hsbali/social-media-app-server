import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, options?: { [key: string]: any }) {
    const user = await this.prisma.user.create({
      data: createUserDto,
    });

    // Do not perform any operation on user if it does not exist
    if (!user) return user;

    if (!options || (options && !options.withPassword)) delete user.password;

    return user;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: number, options?: { [key: string]: any }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    // Do not perform any operation on user if it does not exist
    if (!user) return user;

    if (!options || (options && !options.withPassword)) delete user.password;

    return user;
  }

  async findOneByEmail(email: string, options?: { [key: string]: any }) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Do not perform any operation on user if it does not exist
    if (!user) return user;

    if (!options || (options && !options.withPassword)) delete user.password;

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      data: updateUserDto,
      where: { id },
      select: Object.keys(updateUserDto).reduce(
        (selectObj, key) => ({ ...selectObj, [key]: true }),
        {},
      ),
    });

    return user;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
