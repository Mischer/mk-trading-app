import { Module } from '@nestjs/common';
import { TradesController } from './trades.controller';
import { TradesService } from './trades.service';
import { BinanceModule } from '../binance/binance.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TradeModel, TradeSchema } from './models/trade-model';

@Module({
	imports: [ConfigModule, MongooseModule.forFeature([{ name: TradeModel.name, schema: TradeSchema }]), BinanceModule],
	controllers: [TradesController],
	providers: [TradesService],
})
export class TradesModule {}
