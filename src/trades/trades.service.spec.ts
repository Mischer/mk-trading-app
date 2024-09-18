import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TradesService } from './trades.service';
import { BinanceService } from '../binance/binance.service';
import { TradeModel } from './models/trade-model';
import { SymbolEnum } from '../types/symbol-enum';
import { NotFoundException } from '@nestjs/common';

describe('TradesService Tests', () => {
	let service: TradesService;
	let tradeModelMock: any;
	let binanceServiceMock: any;

	beforeEach(async () => {
		tradeModelMock = {
			insertMany: jest.fn(),
			find: jest.fn().mockReturnThis(),
			sort: jest.fn().mockReturnThis(),
			exec: jest.fn(),
		};

		binanceServiceMock = {
			fetchTrades: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TradesService,
				{ provide: getModelToken(TradeModel.name), useValue: tradeModelMock },
				{ provide: BinanceService, useValue: binanceServiceMock },
			],
		}).compile();

		service = module.get<TradesService>(TradesService);
	});

	describe('when testing fetchAndStoreTrades', () => {
		it('should fetch trades and store them in the database', async () => {
			const symbol = SymbolEnum.BTC_USDT;
			const mockTrades = [
				{
					id: 1,
					price: '50000',
					qty: '0.1',
					quoteQty: '5000',
					time: 1625234523000,
					isBuyerMaker: true,
					isBestMatch: true,
				},
				{
					id: 2,
					price: '51000',
					qty: '0.2',
					quoteQty: '10200',
					time: 1625234524000,
					isBuyerMaker: true,
					isBestMatch: true,
				},
			];

			binanceServiceMock.fetchTrades.mockResolvedValue(mockTrades);

			const expectedTrades = mockTrades.map((trade) => ({
				symbol,
				time: new Date(trade.time),
				price: trade.price,
				qty: trade.qty,
				quoteQty: trade.quoteQty,
				isBuyerMaker: trade.isBuyerMaker,
				isBestMatch: trade.isBestMatch,
			}));

			tradeModelMock.insertMany.mockResolvedValue(expectedTrades);

			const result = await service.fetchAndStoreTrades(symbol);

			const expectedTradesWithTimestamp = expectedTrades.map((trade) => ({
				...trade,
				time: trade.time.getTime(),
			}));
			expect(binanceServiceMock.fetchTrades).toHaveBeenCalledWith(symbol);
			expect(tradeModelMock.insertMany).toHaveBeenCalledWith(expectedTradesWithTimestamp, { ordered: false });
			expect(result).toEqual(expectedTrades);
		});

		it('should return an empty array if no trades are fetched', async () => {
			binanceServiceMock.fetchTrades.mockResolvedValue([]);

			const result = await service.fetchAndStoreTrades(SymbolEnum.BTC_USDT);

			expect(result).toEqual([]);
			expect(tradeModelMock.insertMany).not.toHaveBeenCalled();
		});
	});

	describe('when testing analyzePrice', () => {
		it('should return the correct price analysis', async () => {
			const symbol = SymbolEnum.BTC_USDT;
			const startDate = new Date('2023-01-01T00:00:00Z');
			const endDate = new Date('2023-01-02T00:00:00Z');

			const mockTrades = [
				{ price: '50000', time: startDate },
				{ price: '51000', time: endDate },
			];

			tradeModelMock.exec.mockResolvedValue(mockTrades);

			const result = await service.analyzePrice(symbol, startDate, endDate);

			expect(tradeModelMock.find).toHaveBeenCalledWith({
				symbol: symbol,
				time: { $gte: startDate, $lte: endDate },
			});
			expect(tradeModelMock.sort).toHaveBeenCalledWith({ time: 1 });
			expect(result).toEqual({
				startPrice: 50000,
				endPrice: 51000,
				isPriceGrows: true,
			});
		});

		it('should throw NotFoundException if no trades are found', async () => {
			const symbol = SymbolEnum.BTC_USDT;
			const startDate = new Date('2023-01-01T00:00:00Z');
			const endDate = new Date('2023-01-02T00:00:00Z');

			tradeModelMock.exec.mockResolvedValue([]);

			await expect(service.analyzePrice(symbol, startDate, endDate)).rejects.toThrow(NotFoundException);
		});
	});
});
