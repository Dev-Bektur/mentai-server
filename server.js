const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const User = require('./models/User');

const app = express();

// --- НАСТРОЙКА CORS ---
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Подключение к базе
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Подключено к MongoDB!'))
  .catch(err => console.log('❌ Ошибка подключения:', err));

// 1. РЕГИСТРАЦИЯ
app.post('/api/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ 
      message: 'Успех!', 
      userId: newUser._id, 
      userName: newUser.name 
    });
  } catch (error) {
    res.status(400).json({ message: 'Ошибка: ' + error.message });
  }
});

// 2. ОБНОВЛЕНИЕ МОНЕТ (Квесты)
app.post('/api/update-coins', async (req, res) => {
  const { userId, coinsToAdd } = req.body;
  try {
    const user = await User.findById(userId);
    if (user) {
      user.mentCoins = (user.mentCoins || 0) + coinsToAdd;
      
      // Логика званий
      if (user.mentCoins >= 1000) user.rank = "Мастер ОРТ";
      else if (user.mentCoins >= 500) user.rank = "Активный ученик";
      
      await user.save();
      res.json({ message: "Баллы начислены!", total: user.mentCoins, rank: user.rank });
    } else {
      res.status(404).json({ message: "Пользователь не найден" });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// 3. ДАННЫЕ ОДНОГО ПОЛЬЗОВАТЕЛЯ (Для Profile.jsx)
app.get('/api/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user) {
      res.json({
        mentCoins: user.mentCoins || 0,
        rank: user.rank || "Новичок"
      });
    } else {
      res.status(404).json({ message: "Пользователь не найден" });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// 4. СПИСОК ВСЕХ ПОЛЬЗОВАТЕЛЕЙ (Для AdminPanel.jsx)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при получении списка" });
  }
});

// 5. УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ (Для AdminPanel.jsx)
app.delete('/api/user/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Удалено" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка при удалении" });
  }
});

// --- ДИНАМИЧЕСКИЙ ПОРТ ДЛЯ RENDER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));