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

	it('should fetch and store trades', async () => {
		const symbol = SymbolEnum.BTC_USDT;
		await request(app.getHttpServer()).get(`/v1/trades/${symbol}`).expect(200);

		const tradesInDb = await tradeModel.find().exec();

		expect(tradesInDb).toHaveLength(500);
		expect(tradesInDb[0].symbol).toBe(symbol);
	});
});
