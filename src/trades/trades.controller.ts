import { Controller, Get, Param, Query } from '@nestjs/common';
import { SymbolEnum } from '../types/symbol-enum';
import { TradesService } from './trades.service';

@Controller('/v1/trades')
export class TradesController {
	constructor(private readonly tradesService: TradesService) {}
	@Get('/:symbol')
	async fetchAnStoreTrades(@Param('symbol') symbol: SymbolEnum) {
		return this.tradesService.fetchAndStoreTrades(symbol);
	}

	@Get('/analyze')
	async fetchAndStoreTrades(
		@Query('symbol') symbol: SymbolEnum,
		@Query('startDate') startDate: string,
		@Query('endDate') endDate: string,
	) {
		const start = new Date(startDate);
		const end = new Date(endDate);
		return this.tradesService.analyze(symbol, start, end);
	}
}
