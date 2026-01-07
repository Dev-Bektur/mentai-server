const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  photo: { type: String },
  role: { type: String, enum: ['student', 'teacher'], default: 'student' }, // Роль
  mentCoins: { type: Number, default: 0 },
  rank: { type: String, default: 'Новичок' },
  lessonsPlanned: { type: Array, default: [] }, // Для учителей
});

module.exports = mongoose.model('User', userSchema);