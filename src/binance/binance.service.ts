import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { TradesResponse } from './models/trades-response';
import { ConfigService } from '@nestjs/config';
import { SymbolEnum } from '../types/symbol-enum';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class BinanceService {
	private binanceApiUrl: string;
	private logger: Logger;

	constructor(private readonly configService: ConfigService) {
		this.binanceApiUrl = configService.get('BINANCE_API_URL');
		this.logger = new Logger(BinanceService.name);
	}
	async fetchTrades(symbol: SymbolEnum): Promise<TradesResponse> {
		try {
			const response: AxiosResponse<TradesResponse> = await axios.get<TradesResponse>(
				`${this.binanceApiUrl}/api/v3/trades`,
				{
					params: {
						symbol,
					},
				},
			);

			return response.data;
		} catch (error) {
			this.logger.error('Failed to fetching trades', error);
			throw new InternalServerErrorException('Failed to fetching trades');
		}
	}
}
