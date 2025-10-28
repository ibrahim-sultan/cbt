import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    examId: { type: String, unique: true, sparse: true },
    name: { type: String, trim: true },
    role: { type: String, enum: ['admin', 'instructor', 'student', 'moderator', 'superadmin'], default: 'student' },
    passwordHash: { type: String },
    groups: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

UserSchema.methods.setPassword = async function (pw) {
  this.passwordHash = await bcrypt.hash(pw, 10);
};

UserSchema.methods.validatePassword = async function (pw) {
  return this.passwordHash ? bcrypt.compare(pw, this.passwordHash) : false;
};

export default mongoose.model('User', UserSchema);
