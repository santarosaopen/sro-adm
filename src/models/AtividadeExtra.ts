import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IAtividadeExtra extends Document {
  funcionarioId: Types.ObjectId
  descricao: string
  observacao: string
  fotos: string[]
  timestamp: Date
}

const AtividadeExtraSchema = new Schema<IAtividadeExtra>(
  {
    funcionarioId: { type: Schema.Types.ObjectId, ref: 'Funcionario', required: true },
    descricao: { type: String, required: true, trim: true },
    observacao: { type: String, default: '' },
    fotos: { type: [String], default: [] },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
)

try { mongoose.deleteModel('AtividadeExtra') } catch {}
export default mongoose.model<IAtividadeExtra>('AtividadeExtra', AtividadeExtraSchema)
