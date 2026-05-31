import mongoose, { Schema, Document } from "mongoose";

export interface IPriceHistory extends Document {
  productId: mongoose.Types.ObjectId;
  productName: string;
  price: number;
  productUrl: string;
  available: boolean;
  scrapedAt: Date;
}

const PriceHistorySchema = new Schema<IPriceHistory>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  productUrl: { type: String, required: true },
  available: { type: Boolean, default: true },
  scrapedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPriceHistory>(
  "PriceHistory",
  PriceHistorySchema,
);
