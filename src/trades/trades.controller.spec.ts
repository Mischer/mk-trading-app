import { Test, TestingModule } from '@nestjs/testing';
import { TradesController } from './trades.controller';
import { TradesService } from './trades.service';
import { SymbolEnum } from '../types/symbol-enum';
import { AnalyzeTradesDto } from './dto/analyze-trades.dto';

const mockTradesService = {
	fetchAndStoreTrades: jest.fn(),
	analyzePrice: jest.fn(),
};

describe('TradesController', () => {
	let tradesController: TradesController;
	let tradesService: TradesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TradesController],
			providers: [
				{
					provide: TradesService,
					useValue: mockTradesService,
				},
			],
		}).compile();

		tradesController = module.get<TradesController>(TradesController);
		tradesService = module.get<TradesService>(TradesService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(tradesController).toBeDefined();
	});

	describe('when testing fetchAndStoreTrades endpoint', () => {
		it('should call fetchAndStoreTrades with correct parameters', async () => {
			const symbol = SymbolEnum.BTC_USDT;
			const result = [{ symbol, price: '123.45', quantity: '0.5' }];

			mockTradesService.fetchAndStoreTrades.mockResolvedValue(result);

			expect(await tradesController.fetchAnStoreTrades(symbol)).toBe(result);
			expect(tradesService.fetchAndStoreTrades).toHaveBeenCalledWith(symbol);
		});

		it('should handle errors thrown by fetchAndStoreTrades', async () => {
			const symbol = SymbolEnum.BTC_USDT;
			mockTradesService.fetchAndStoreTrades.mockRejectedValue(new Error('Error fetching trades'));

			await expect(tradesController.fetchAnStoreTrades(symbol)).rejects.toThrow('Error fetching trades');
		});
	});

	describe('when testing analyzePrice endpoint', () => {
		it('should call analyzePrice method of TradesService with correct parameters', async () => {
			const symbol = SymbolEnum.BTC_USDT;
			const startDate = '2023-01-01T00:00:00Z';
			const endDate = '2023-01-02T00:00:00Z';
			const mockAnalyzeResult: AnalyzeTradesDto = {
				startPrice: 50000,
				endPrice: 51000,
				isPriceGrows: true,
			};

			jest.spyOn(tradesService, 'analyzePrice').mockResolvedValue(mockAnalyzeResult);

			const result = await tradesController.analyzePrice(symbol, startDate, endDate);

			expect(tradesService.analyzePrice).toHaveBeenCalledWith(symbol, new Date(startDate), new Date(endDate));
			expect(result).toEqual(mockAnalyzeResult);
		});
	});
});
