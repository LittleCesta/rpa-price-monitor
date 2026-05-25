import mongoose, { Schema, Document } from 'mongoose'

export interface IProduct extends Document {
  name: string
  url: string
  targetPrice: number   // preço alvo definido pelo usuário
  createdAt: Date
}

const ProductSchema = new Schema<IProduct>({
  name:        { type: String, required: true },
  url:         { type: String, required: true, unique: true },
  targetPrice: { type: Number, required: true },
  createdAt:   { type: Date, default: Date.now },
})

export default mongoose.model<IProduct>('Product', ProductSchema)
