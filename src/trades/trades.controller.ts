import { Controller, Get, Param } from '@nestjs/common';
import { SymbolEnum } from '../types/symbol-enum';
import { TradesService } from './trades.service';

@Controller('/v1/trades')
export class TradesController {
	constructor(private readonly tradesService: TradesService) {}
	@Get('/:symbol')
	async fetchAnStoreTrades(@Param() symbol: SymbolEnum) {
		return this.tradesService.fetchAndStoreTrades(symbol);
	}

	/*	@Get('analyze')
	async fetchAnStoreTrades(@Param() symbol: SymbolEnum, @Param() startDate: Date, @Param() endDate: Date) {
		return this.tradesService.analyze(symbol);
	}*/
}
