import { Module } from '@nestjs/common';
import { TradesController } from './trades.controller';
import { TradesService } from './trades.service';
import { BinanceModule } from '../binance/binance.module';

@Module({
	controllers: [TradesController],
	providers: [TradesService],
	imports: [BinanceModule],
})
export class TradesModule {}
