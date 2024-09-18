import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SymbolEnum } from '../../types/symbol-enum';

@Schema()
export class TradeModel extends Document {
	@Prop({ required: true })
	symbol: SymbolEnum;
	@Prop({ required: true })
	price: string;
	@Prop({ required: true })
	qty: string;
	@Prop({ required: true })
	quoteQty: string;
	@Prop({ required: true })
	time: Date;
	@Prop({ required: true })
	isBuyerMaker: boolean;
	@Prop({ required: true })
	isBestMatch: boolean;
}

export const TradeShema = SchemaFactory.createForClass(TradeModel);
