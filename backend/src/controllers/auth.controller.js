const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../models/Students');
const Teacher = require('../models/Teachers');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';


// Get available batch options
exports.getBatchOptions = (req, res) => {
  const batchOptions = ['M.Tech', 'B.Tech', 'PHD', 'MS'];
  res.status(200).json({
    success: true,
    options: batchOptions
  });
};

// Get available branch options
exports.getBranchOptions = (req, res) => {
  const branchOptions = ['CSE', 'ECE'];
  res.status(200).json({
    success: true,
    options: branchOptions
  });
};


// Register Student
exports.registerStudent = async (req, res) => {
  try {
    const { username, password, name, roll_no, batch, branch } = req.body;
    if (!username || !password || !name || !roll_no || !batch || !branch) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existing = await Student.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Student already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({
      username,
      password: hashedPassword,
      name,
      roll_no,
      is_TA: false,
      courses_id_request: [],
      courses_id_enrolled: [],
      batch,
      branch
    });
    await student.save();
    res.status(201).json({ message: 'Student registered successfully.' });
  } 
  catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Register Teacher
exports.registerTeacher = async (req, res) => {
  try {
    const { teacher_id, username, name, password } = req.body;
    if (!teacher_id || !username || !name || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existing = await Teacher.findOne({ $or: [ { username }, { teacher_id }, { name } ] });
    if (existing) {
      return res.status(400).json({ message: 'Teacher already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new Teacher({
      teacher_id,
      username,
      name,
      password: hashedPassword,
      courses_id: []
    });
    await teacher.save();
    res.status(201).json({ message: 'Teacher registered successfully.' });
  } 
  catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login Student
exports.loginStudent = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    const user = await Student.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user._id, role: 'student' }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0.5 * 60 * 60 * 1000 // 1/2 hour
    });
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user
      }
    });
  } 
  catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login Teacher
exports.loginTeacher = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    const user = await Teacher.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user._id, role: 'teacher' }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0.5 * 60 * 60 * 1000 // 1/2 day
    });
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user
      }
    });
  } 
  catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Logout: clear the cookie
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    message: 'Logout successful'
  });
};

// Middleware for protected routes
exports.authenticate = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient role.' });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
  };
};
