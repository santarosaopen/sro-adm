import mongoose, { Schema, Document } from 'mongoose'

export interface ILeituraAgua extends Document {
  valor: number
  data: Date
  tipo: 'diaria' | 'mensal'
  cota?: number
}

const LeituraAguaSchema = new Schema<ILeituraAgua>(
  {
    valor: { type: Number, required: true },
    data: { type: Date, required: true },
    tipo: { type: String, enum: ['diaria', 'mensal'], default: 'diaria' },
    cota: { type: Number },
  },
  { timestamps: true }
)

export default mongoose.models.LeituraAgua ||
  mongoose.model<ILeituraAgua>('LeituraAgua', LeituraAguaSchema)
