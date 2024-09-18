import { Injectable, NotFoundException } from '@nestjs/common';
import { SymbolEnum } from '../types/symbol-enum';
import { TradeModel } from './models/trade-model';
import { BinanceService } from '../binance/binance.service';
import { InjectModel } from '@nestjs/mongoose';
import { Trade } from '../binance/models/trades-response';
import { Model } from 'mongoose';
import { omit } from 'lodash';
import { AnalyzeTradesDto } from './dto/analyze-trades.dto';

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
				...omit(trade, 'id', 'timestamp'),
			};
		});
		return this.tradeModel.insertMany(tradesToSave, { ordered: false }); // to store max trades received
	}

	async analyzePrice(symbol: SymbolEnum, startDate: Date, endDate: Date): Promise<AnalyzeTradesDto> {
		const trades = await this.tradeModel
			.find({
				symbol: symbol,
				time: { $gte: startDate, $lte: endDate },
			})
			.sort({ time: 1 })
			.exec();

		if (trades.length === 0) {
			throw new NotFoundException('No trades found in the given time range.');
		}

		const firstTrade = trades[0];
		const lastTrade = trades[trades.length - 1];

		const startPrice = parseFloat(firstTrade.price);
		const endPrice = parseFloat(lastTrade.price);

		return {
			startPrice: startPrice,
			endPrice: endPrice,
			isPriceGrows: endPrice > startPrice,
		};
	}
}
