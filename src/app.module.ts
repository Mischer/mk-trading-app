import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TradesModule } from './trades/trades.module';
import { BinanceModule } from './binance/binance.module';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule.forRoot(),
		MongooseModule.forRoot('mongodb://admin:admin@localhost:27017/mk-trading?authSource=admin'), //FIXME should be in conf!!!
		TradesModule,
		BinanceModule,
	], // TODO move to configs
	controllers: [],
	providers: [],
})
export class AppModule {}
