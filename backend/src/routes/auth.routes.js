const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { authenticate } = authController;


// Registration options
router.get('/student/batch-options', authController.getBatchOptions);
router.get('/student/branch-options', authController.getBranchOptions);


// Student routes
router.post('/student/register', authController.registerStudent);
router.post('/student/login', authController.loginStudent);

// Example: protect a route (uncomment if needed)
// router.get('/student/protected', authenticate(['student']), (req, res) => res.json({ message: 'Protected student route' }));


// Teacher routes
router.post('/teacher/register', authController.registerTeacher);
router.post('/teacher/login', authController.loginTeacher);

// Example: protect a route (uncomment if needed)
// router.get('/teacher/protected', authenticate(['teacher']), (req, res) => res.json({ message: 'Protected teacher route' }));

// Common routes
router.post('/logout', authController.logout);

module.exports = router;