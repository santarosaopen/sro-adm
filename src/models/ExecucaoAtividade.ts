import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IExecucaoAtividade extends Document {
  atividadeId: Types.ObjectId
  funcionarioId: Types.ObjectId
  nomeExecutor: string   // gravado no momento — persiste mesmo após deletar o funcionário
  fotoExecutor: string   // foto da presença do dia — persiste mesmo após deletar o funcionário
  fotos: string[]
  observacao: string
  timestamp: Date
}

const ExecucaoAtividadeSchema = new Schema<IExecucaoAtividade>(
  {
    atividadeId: { type: Schema.Types.ObjectId, ref: 'Atividade', required: true },
    funcionarioId: { type: Schema.Types.ObjectId, ref: 'Funcionario', required: true },
    nomeExecutor: { type: String, default: '' },
    fotoExecutor: { type: String, default: '' },
    fotos: { type: [String], default: [] },
    observacao: { type: String, default: '' },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
)

try { mongoose.deleteModel('ExecucaoAtividade') } catch {}
export default mongoose.model<IExecucaoAtividade>('ExecucaoAtividade', ExecucaoAtividadeSchema)
