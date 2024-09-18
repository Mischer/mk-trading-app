import { Injectable } from '@nestjs/common';
import { TradesResponse } from './models/trades-response';

@Injectable()
export class BinanceService {
	async fetchAndStoreTrades(): Promise<TradesResponse> {}
}
