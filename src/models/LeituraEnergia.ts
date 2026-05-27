import mongoose, { Schema, Document } from 'mongoose'

export interface ILeituraEnergia extends Document {
  valor: number
  data: Date
  tipo: 'diaria' | 'mensal'
}

const LeituraEnergiaSchema = new Schema<ILeituraEnergia>(
  {
    valor: { type: Number, required: true },
    data: { type: Date, required: true },
    tipo: { type: String, enum: ['diaria', 'mensal'], default: 'diaria' },
  },
  { timestamps: true }
)

export default mongoose.models.LeituraEnergia ||
  mongoose.model<ILeituraEnergia>('LeituraEnergia', LeituraEnergiaSchema)
