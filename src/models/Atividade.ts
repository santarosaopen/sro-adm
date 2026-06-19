import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IPeriodicidade {
  tipo: 'intervalo' | 'diasSemana'
  intervalo?: number        // dias entre execuções (tipo=intervalo)
  diasSemana?: number[]     // 0=dom, 1=seg … 6=sab (tipo=diasSemana)
}

export interface IAtividade extends Document {
  nome: string
  funcaoId: Types.ObjectId
  qrToken: string
  ativo: boolean
  periodicidade?: IPeriodicidade
}

const PeriodicidadeSchema = new Schema<IPeriodicidade>(
  {
    tipo: { type: String, enum: ['intervalo', 'diasSemana'], required: true },
    intervalo: { type: Number, min: 1 },
    diasSemana: { type: [Number] },
  },
  { _id: false }
)

const AtividadeSchema = new Schema<IAtividade>(
  {
    nome: { type: String, required: true, trim: true },
    funcaoId: { type: Schema.Types.ObjectId, ref: 'Funcao', required: true },
    qrToken: { type: String, required: true, unique: true },
    ativo: { type: Boolean, default: true },
    periodicidade: { type: PeriodicidadeSchema, default: undefined },
  },
  { timestamps: true }
)

try { mongoose.deleteModel('Atividade') } catch {}
export default mongoose.model<IAtividade>('Atividade', AtividadeSchema)
