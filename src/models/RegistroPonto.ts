import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IRegistroPonto extends Document {
  funcionarioId: Types.ObjectId
  funcaoId: Types.ObjectId
  foto: string
  timestamp: Date
}

const RegistroPontoSchema = new Schema<IRegistroPonto>(
  {
    funcionarioId: { type: Schema.Types.ObjectId, ref: 'Funcionario', required: true },
    funcaoId: { type: Schema.Types.ObjectId, ref: 'Funcao', required: true },
    foto: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
  { timestamps: true }
)

try { mongoose.deleteModel('RegistroPonto') } catch {}
export default mongoose.model<IRegistroPonto>('RegistroPonto', RegistroPontoSchema)
