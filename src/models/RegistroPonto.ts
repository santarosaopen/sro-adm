import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IRegistroPonto extends Document {
  funcionarioId: Types.ObjectId
  tipo: 'entrada' | 'saida'
  foto: string
  timestamp: Date
}

const RegistroPontoSchema = new Schema<IRegistroPonto>(
  {
    funcionarioId: { type: Schema.Types.ObjectId, ref: 'Funcionario', required: true },
    tipo: { type: String, enum: ['entrada', 'saida'], required: true },
    foto: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.RegistroPonto ||
  mongoose.model<IRegistroPonto>('RegistroPonto', RegistroPontoSchema)
