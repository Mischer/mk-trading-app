import { Prop, Schema } from '@nestjs/mongoose';
import Document from 'mongoose';

@Schema()
export class TradeModel extends Document {
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
