const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  profilePhoto: { type: String, default: '' },
  additionalInfo: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  savedDestinations: [String],
  languagePreference: { type: String, default: 'en' },
  resetCode: { type: String, default: null },
  resetCodeExpires: { type: Date, default: null },
  failedLoginAttempts: { type: Number, default: 0 },
  pendingAuth: { type: Object, default: null },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
