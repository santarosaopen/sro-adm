import mongoose, { Schema, Document } from 'mongoose'

export interface IAdminUser extends Document {
  username: string
  nome: string
  passwordHash: string
  senhaOperacionalHash: string
  ativo: boolean
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    nome: { type: String, required: true },
    passwordHash: { type: String, required: true },
    senhaOperacionalHash: { type: String, default: '' },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.AdminUser ||
  mongoose.model<IAdminUser>('AdminUser', AdminUserSchema)
