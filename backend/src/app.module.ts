import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { WishesModule } from './wishes/wishes.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { OffersModule } from './offers/offers.module';
import { AuthModule } from './auth/auth.module';
import { HashModule } from './hash/hash.module';
import { ConfigModule} from '@nestjs/config';
import configuration from './configuration/configuration';
import { DatabaseConfigFactory } from './configuration/database-config.factory';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({ useClass: DatabaseConfigFactory }),
    UsersModule,
    WishesModule,
    WishlistsModule,
    AuthModule,
    HashModule,
    OffersModule,
  ],
  controllers: [],
  providers: [DatabaseConfigFactory],
})
export class AppModule {}
