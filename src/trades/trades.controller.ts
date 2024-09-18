import { Controller, Get, Param } from '@nestjs/common';
import { SymbolEnum } from '../types/symbol-enum';
import { TradesService } from './trades.service';

@Controller('trades')
export class TradesController {
	constructor(private readonly tradesService: TradesService) {}
	@Get('/:symbol')
	async fetchAnStoreTrades(@Param() symbol: SymbolEnum) {
		return this.tradesService.fetchAndStoreTrades(symbol);
	}
}
