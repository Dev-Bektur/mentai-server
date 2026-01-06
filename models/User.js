const mongoose = require('mongoose'); // ВОТ ЭТОЙ СТРОЧКИ НЕ ХВАТАЛО

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  mentCoins: { type: Number, default: 0 },
  rank: { type: String, default: "Новичок" }
});

module.exports = mongoose.model('User', UserSchema);