import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TradesModule } from './trades/trades.module';

@Module({
	imports: [MongooseModule.forRoot('mongodb://admin:admin@localhost:27017/mk-trading?authSource=admin'), TradesModule], // TODO move to configs
	controllers: [],
	providers: [],
})
export class AppModule {}
