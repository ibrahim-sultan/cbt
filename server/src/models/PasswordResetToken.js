import mongoose from 'mongoose';

const PasswordResetTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    token: { type: String, unique: true },
    expiresAt: { type: Date, index: { expires: 0 } },
    used: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('PasswordResetToken', PasswordResetTokenSchema);
