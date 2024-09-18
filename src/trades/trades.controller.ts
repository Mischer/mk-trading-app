import { Controller, Get, Param, Query } from '@nestjs/common';
import { SymbolEnum } from '../types/symbol-enum';
import { TradesService } from './trades.service';
import { AnalyzeTradesDto } from './dto/analyze-trades.dto';

@Controller('/v1/trades')
export class TradesController {
	constructor(private readonly tradesService: TradesService) {}
	@Get('storeTrades/:symbol')
	async fetchAnStoreTrades(@Param('symbol') symbol: SymbolEnum) {
		return this.tradesService.fetchAndStoreTrades(symbol);
	}

	@Get('/analyzePrice')
	async analyzePrice(
		@Query('symbol') symbol: SymbolEnum,
		@Query('startDate') startDate: string,
		@Query('endDate') endDate: string,
	): Promise<AnalyzeTradesDto> {
		const start = new Date(startDate);
		const end = new Date(endDate);
		return this.tradesService.analyzePrice(symbol, start, end);
	}
}
