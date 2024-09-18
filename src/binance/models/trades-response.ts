export interface Trade {
	id: number;
	price: string;
	qty: string;
	quoteQty: string;
	time: number;
	isBuyerMaker: boolean;
	isBestMatch: boolean;
}

export type TradesResponse = Trade[];
