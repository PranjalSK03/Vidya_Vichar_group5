const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const User = require('./models/User');
const Class = require('./models/Class');
const Question = require('./models/Question');
require('dotenv').config();

const app = express();
connectDB();

const PORT = 8080;
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// --- API ROUTES ---

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({ email, password: hashedPassword, role });
        await user.save();

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
        // BUG FIX: Send the full user object, including the MongoDB _id
        res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
         // BUG FIX: Send the full user object, including the MongoDB _id
        res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Class Routes
app.get('/api/classes', async (req, res) => {
    try {
        const { date } = req.query;
        const classes = await Class.find({ date });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/classes', async (req, res) => {
    try {
        const { name, date, professorId } = req.body;
        const newClass = new Class({ name, date, professorId });
        await newClass.save();
        res.status(201).json(newClass);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' });
    }
});

// Question Routes
app.get('/api/classes/:classId/questions', async (req, res) => {
    try {
        const questions = await Question.find({ classId: req.params.classId }).sort({ timestamp: -1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/classes/:classId/questions', async (req, res) => {
    try {
        const { text, studentId } = req.body;
        const newQuestion = new Question({ text, studentId, classId: req.params.classId });
        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' });
    }
});

app.patch('/api/classes/:classId/questions/:questionId', async (req, res) => {
    try {
        const { status } = req.body;
        const question = await Question.findByIdAndUpdate(req.params.questionId, { status }, { new: true });
        if (!question) return res.status(404).send('Question not found');
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/classes/:classId/questions/:questionId', async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.questionId);
        if (!question) return res.status(404).send('Question not found');
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});