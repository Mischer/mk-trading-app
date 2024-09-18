import { Injectable } from '@nestjs/common';
import { SymbolEnum } from '../types/symbol-enum';
import { TradeModel } from './models/trade-model';
import { BinanceService } from '../binance/binance.service';
// import { Trade } from '../binance/models/trades-response';
import { InjectModel } from '@nestjs/mongoose';
import { Trade } from '../binance/models/trades-response';
// import _ from 'lodash';

@Injectable()
export class TradesService {
	constructor(
		@InjectModel(TradeModel.name) private readonly tradeModel: Model<TradeModel>,
		private readonly binanceService: BinanceService,
	) {}

	async fetchAndStoreTrades(symbol: SymbolEnum): Promise<TradeModel[]> {
		const trades: Trade[] = await this.binanceService.fetchTrades(symbol);
		if (!trades?.length) {
			return [];
		}

		const tradesToSave = trades.map((trade: Trade) => {
			return {
				symbol,
				time: new Date(trade.time),
				..._.omit(trade, 'id', 'timestamp'),
			};
		});
		return this.tradeModel.insertMany(tradesToSave, { ordered: false }); // to store max trades received
	}
}
