import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { TradesModule } from '../src/trades/trades.module';
import { SymbolEnum } from '../src/types/symbol-enum';
import { TradeModel, TradeSchema } from '../src/trades/models/trade-model';
import { ConfigModule } from '@nestjs/config';

describe('TradesController (e2e) with real MongoDB in-memory', () => {
	let app: INestApplication;
	let mongod: MongoMemoryServer;
	let tradeModel: Model<TradeModel>;

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();
		const uri = mongod.getUri();

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					envFilePath: '.env.test',
				}),
				MongooseModule.forRoot(uri),
				MongooseModule.forFeature([{ name: TradeModel.name, schema: TradeSchema }]),
				TradesModule,
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		tradeModel = moduleFixture.get<Model<TradeModel>>(getModelToken(TradeModel.name));
	});

	afterAll(async () => {
		await app.close();
		if (mongod) await mongod.stop();
	});

	afterEach(async () => {
		await tradeModel.deleteMany({});
	});

	it('should fetch and store trades fetchAnStoreTrades/v1/trades/storeTrades (GET)', async () => {
		const symbol = SymbolEnum.BTC_USDT;
		await request(app.getHttpServer()).get(`/v1/trades/storeTrades/${symbol}`).expect(200);

		const tradesInDb = await tradeModel.find().exec();

		expect(tradesInDb).toHaveLength(500);
		expect(tradesInDb[0].symbol).toBe(symbol);
	});

	it('should return correct price analysis /v1/trades/analyzePrice (GET)', async () => {
		await tradeModel.create([
			{
				symbol: SymbolEnum.BTC_USDT,
				price: '50000',
				qty: '0.1',
				quoteQty: '5000',
				time: new Date('2023-01-01T10:00:00Z'),
				isBuyerMaker: false,
				isBestMatch: true,
			},
			{
				symbol: SymbolEnum.BTC_USDT,
				price: '51000',
				qty: '0.1',
				quoteQty: '5100',
				time: new Date('2023-01-01T12:00:00Z'),
				isBuyerMaker: false,
				isBestMatch: true,
			},
		]);

		const symbol = SymbolEnum.BTC_USDT;
		const startDate = '2023-01-01T09:00:00Z';
		const endDate = '2023-01-01T13:00:00Z';

		const response = await request(app.getHttpServer())
			.get(`/v1/trades/analyzePrice?symbol=${symbol}&startDate=${startDate}&endDate=${endDate}`)
			.expect(200);

		expect(response.body).toEqual({
			startPrice: 50000,
			endPrice: 51000,
			isPriceGrows: true,
		});
	});
});
