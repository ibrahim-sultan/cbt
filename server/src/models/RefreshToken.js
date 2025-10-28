import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    token: { type: String, unique: true, index: true },
    expiresAt: { type: Date, index: true },
    revoked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('RefreshToken', RefreshTokenSchema);
