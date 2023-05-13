import { User } from 'src/users/entities/user.entity';
import { Base } from 'src/utils/base-entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Offer extends Base {
  @ManyToOne(() => User, (user) => user.offers)
  user: User;

  @ManyToOne(() => Wish, (wish) => wish.offers)
  item: Wish;

  @Column({ scale: 2 })
  amount: number;

  @Column({ default: false })
  hidden: boolean;
}
