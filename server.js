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
      userName: newUser.name,
      role: newUser.role || 'student'
    });
  } catch (error) {
    res.status(400).json({ message: 'Ошибка: ' + error.message });
  }
});

// 2. ВХОД (ЭТОГО НЕ ХВАТАЛО!)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // ВАЖНО: В реальном проекте используй bcrypt для проверки пароля!
    if (user.password !== password) {
      return res.status(401).json({ message: "Неверный пароль" });
    }

    res.json({
      message: "Вход выполнен",
      role: user.role || 'student',
      user: user // Отправляем данные пользователя (включая _id, name, email)
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при входе" });
  }
});

// 3. ОБНОВЛЕНИЕ МОНЕТ (Квесты и Уроки)
app.post('/api/update-coins', async (req, res) => {
  const { userId, coinsToAdd } = req.body;
  try {
    const user = await User.findById(userId);
    if (user) {
      user.mentCoins = (user.mentCoins || 0) + coinsToAdd;
      
      // Логика званий
      if (user.mentCoins >= 1000) user.rank = "Мастер ОРТ";
      else if (user.mentCoins >= 500) user.rank = "Активный ученик";
      else user.rank = "Новичок";
      
      await user.save();
      res.json({ message: "Баллы начислены!", mentCoins: user.mentCoins, rank: user.rank });
    } else {
      res.status(404).json({ message: "Пользователь не найден" });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// 4. ДАННЫЕ ОДНОГО ПОЛЬЗОВАТЕЛЯ (Исправил путь под твой фронтенд)
// Теперь работает и по /user/:id и по /api/user/:id
app.get('/api/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user) {
      res.json({
        name: user.name,
        email: user.email,
        mentCoins: user.mentCoins || 0,
        rank: user.rank || "Новичок",
        photo: user.photo
      });
    } else {
      res.status(404).json({ message: "Пользователь не найден" });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Дублируем путь без /api, так как в некоторых компонентах у тебя fetch(`/user/${userId}`)
app.get('/user/:userId', async (req, res) => {
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

// 5. СПИСОК ВСЕХ ПОЛЬЗОВАТЕЛЕЙ
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при получении списка" });
  }
});

// 6. УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ
app.delete('/api/user/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Удалено" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка при удалении" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));