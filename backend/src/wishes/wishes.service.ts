import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  create(createWishDto: CreateWishDto, ownerId: number) {
    const wish = this.wishesRepository.create({
      ...createWishDto,
      owner: { id: ownerId },
    });
    return this.wishesRepository.save(wish);
  }

  async findAll(query: FindManyOptions<Wish>) {
    return this.wishesRepository.find(query);
  }

  async findOne(query: FindOneOptions<Wish>) {
    return this.wishesRepository.findOne(query);
  }

  getLastWishes() {
    return this.findAll({ order: { createdAt: 'DESC' }, take: 40 });
  }

  getTopWishes() {
    return this.findAll({ order: { copied: 'DESC' }, take: 10 });
  }

  async getById(id: number) {
    return this.findOne({ where: { id }, relations: { owner: true } });
  }

  async update(id: number, userId: number, updateWishDto: UpdateWishDto) {
    const wish = await this.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (userId !== wish.owner.id) {
      throw new ForbiddenException(
        'Вы можете редактировать только свои подборки подарков',
      );
    }

    if (updateWishDto.price && wish.raised > 0) {
      throw new ForbiddenException(
        'Нельзя изменять стоимость подарка, уже есть желающие скинуться',
      );
    }

    return this.wishesRepository.update(id, updateWishDto);
  }

  async remove(id: number, userId: number) {
    const wish = await this.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (userId !== wish.owner.id) {
      throw new ForbiddenException(
        'Вы можете удалять только свои подборки подарков',
      );
    }

    this.wishesRepository.delete(id);
    return wish;
  }

  async copy(wishId: number, userId: number) {
    const wish = await this.findOne({ where: { id: wishId } });
    const { name, description, image, link, price, copied } = wish;

    const isExist = !!(await this.findOne({
      where: { name, link, price, owner: { id: userId } },
      relations: { owner: true },
    }));

    if (isExist) {
      throw new ForbiddenException('У Вас уже есть копия этого подарка');
    }

    const wishCopy = {
      name,
      description,
      image,
      link,
      price,
      owner: { id: userId },
    };

    await this.dataSource.transaction(async (transManager) => {
      await transManager.update<Wish>(Wish, wishId, { copied: copied + 1 });
      await transManager.insert<Wish>(Wish, wishCopy);
    });

    return {};
  }
}
