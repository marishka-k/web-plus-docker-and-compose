import { InjectRepository } from '@nestjs/typeorm';
import { ConflictException, Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { HashService } from 'src/hash/hash.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, username, password } = createUserDto;
    const user = await this.findOne({ where: [{ email }, { username }] });

    if (user) {
      throw new ConflictException(
        'Пользователь с таким email или username уже зарегистрирован',
      );
    }

    const hash = await this.hashService.generate(password);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hash,
    });

    return this.userRepository.save(newUser);
  }

  findAll(query: FindManyOptions<User>) {
    return this.userRepository.find(query);
  }

  findOne(query: FindOneOptions<User>) {
    return this.userRepository.findOne(query);
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto) {
    const { email, username, password } = updateUserDto;
    const isAlreadyInBase = !!(await this.findOne({
      where: [{ email }, { username }],
    }));

    if (isAlreadyInBase)
      throw new ConflictException(
        'Пользователь с таким email или username уже зарегистрирован',
      );

    const user = await this.findOne({ where: { id } });

    if (password) {
      updateUserDto.password = await this.hashService.generate(password);
    }

    const updatedUser = { ...user, ...updateUserDto };
    await this.userRepository.update(id, updatedUser);

    return this.findOne({ where: { id } });
  }

  getByUsername(username: string) {
    return this.findOne({ where: { username } });
  }

  getMyWishes(userId: number) {
    return this.findOne({
      where: { id: userId },
      relations: { wishes: { owner: true } },
    }).then((user) => user.wishes);
  }

  getUserWishes(username: string) {
    return this.findOne({
      where: { username },
      relations: { wishes: true },
    }).then((user) => user.wishes);
  }

  findByUsernameOrEmail(query: string) {
    return this.findAll({
      where: [{ username: query }, { email: query }],
    });
  }
}
