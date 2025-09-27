const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// --- MOCK DATABASE (to be replaced with MongoDB) ---
const mockDatabase = {
    classes: [
        { id: '1', name: 'Software System Development', date: new Date().toISOString().split('T')[0], professorId: 'prof-1' },
        { id: '2', name: 'Advanced Algorithms', date: new Date().toISOString().split('T')[0], professorId: 'prof-1' }
    ],
    questions: {
        '1': [
            { id: 'q1', text: "What's the difference between horizontal and vertical scaling?", timestamp: new Date(), status: 'unanswered' },
            { id: 'q2', text: 'Can caching introduce consistency issues?', timestamp: new Date(), status: 'answered' },
        ]
    },
    users: []
};

// --- API ROUTES ---

// Auth Routes
app.post('/api/auth/login', (req, res) => {
    // TODO: Add MongoDB logic for user login
    const { email, role } = req.body;
    console.log('Login attempt:', { email, role });
    res.json({ email, role, id: 'user-' + Math.random(), token: 'mock-jwt-token' });
});

app.post('/api/auth/signup', (req, res) => {
    // TODO: Add MongoDB logic for user signup
    const { email, role } = req.body;
    console.log('Signup attempt:', { email, role });
    res.json({ email, role, id: 'user-' + Math.random(), token: 'mock-jwt-token' });
});


// Class Routes
app.get('/api/classes', (req, res) => {
    // TODO: Add MongoDB logic to fetch classes by date
    const { date } = req.query;
    const classesForDate = mockDatabase.classes.filter(c => c.date === date);
    res.json(classesForDate);
});

app.post('/api/classes', (req, res) => {
    // TODO: Add MongoDB logic to create a new class
    const { name, date, professorId } = req.body;
    const newClass = { id: 'class-' + Math.random(), name, date, professorId };
    mockDatabase.classes.push(newClass);
    res.status(201).json(newClass);
});


// Question Routes
app.get('/api/classes/:classId/questions', (req, res) => {
    // TODO: Add MongoDB logic to fetch questions for a class
    const { classId } = req.params;
    res.json(mockDatabase.questions[classId] || []);
});

app.post('/api/classes/:classId/questions', (req, res) => {
    // TODO: Add MongoDB logic to post a new question
    const { classId } = req.params;
    const { text, studentId } = req.body;
    const newQuestion = { id: 'q-' + Math.random(), text, studentId, timestamp: new Date(), status: 'unanswered' };
    if (!mockDatabase.questions[classId]) {
        mockDatabase.questions[classId] = [];
    }
    mockDatabase.questions[classId].unshift(newQuestion);
    res.status(201).json(newQuestion);
});

app.patch('/api/classes/:classId/questions/:questionId', (req, res) => {
    // TODO: Add MongoDB logic to update question status
    const { classId, questionId } = req.params;
    const { status } = req.body;
    const question = mockDatabase.questions[classId]?.find(q => q.id === questionId);
    if (question) {
        question.status = status;
        res.json(question);
    } else {
        res.status(404).send('Question not found');
    }
});

app.delete('/api/classes/:classId/questions/:questionId', (req, res) => {
    // TODO: Add MongoDB logic to delete a question
    const { classId, questionId } = req.params;
    const classQuestions = mockDatabase.questions[classId];
    if (classQuestions) {
        const initialLength = classQuestions.length;
        mockDatabase.questions[classId] = classQuestions.filter(q => q.id !== questionId);
        if(mockDatabase.questions[classId].length < initialLength){
            res.status(204).send(); // Success, no content
        } else {
             res.status(404).send('Question not found');
        }
    } else {
        res.status(404).send('Class not found');
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});