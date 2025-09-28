

const express = require('express');
const router = express.Router();

const studentController = require('../controllers/student.controller');
const teacherController = require('../controllers/teacher.controller');
const { authenticate } = require('../controllers/auth.controller');


// Student Dashboard Routes
//GET
router.get('/student/dashboard/overview', authenticate(['student']), studentController.getStudentOverview);
router.get('/student/dashboard/enrolled-courses', authenticate(['student']), studentController.getEnrolledCourses);
router.get('/student/dashboard/pending-courses', authenticate(['student']), studentController.getPendingCourses);
router.get('/student/dashboard/all-courses', authenticate(['student']), studentController.getCoursesForStudents);
router.get('/student/dashboard/all-lectures', authenticate(['student']), studentController.getStudentLectures);
router.get('/student/dashboard/prev-lectures', authenticate(['student']), studentController.getPrevStudentLectures);
router.get('/student/dashboard/all-questions/:lecture_id', authenticate(['student']), studentController.getAllQuestions);
router.get('/student/dashboard/my-questions/:lecture_id', authenticate(['student']), studentController.getMyQuestions);
router.get('/student/dashboard/all-answers/:question_id', authenticate(['student']), studentController.getAllAnswers);
//POST
router.post('/student/dashboard/join-course', authenticate(['student']), studentController.joinCourse);
router.post('/student/dashboard/join-lecture', authenticate(['student']), studentController.joinLecture);
router.post('/student/dashboard/ask-question', authenticate(['student']), studentController.askQuestion);
router.post('/student/dashboard/answer-question', authenticate(['student']), studentController.answerQuestion);
//PUT
router.put('/student/dashboard/edit-question/:question_id', authenticate(['student']), studentController.editQuestion);
//DELETE
router.delete('/student/dashboard/delete-question/:question_id', authenticate(['student']), studentController.deleteQuestion);
router.delete('/student/dashboard/delete-answer/:question_id', authenticate(['student']), studentController.deleteAnswer);





// Teacher Dashboard Overview and Profile
router.get('/teacher/dashboard/overview', authenticate(['teacher']), teacherController.getTeacherOverview);
router.get('/teacher/all', authenticate(['teacher']), teacherController.getAllTeachers);
router.get('/teacher/courses', authenticate(['teacher']), teacherController.getAllCourses);
router.get('/teacher/:teacher_id', authenticate(['teacher']), teacherController.getTeacherByid);
router.get('/teacher/course/:course_id/pending-requests', authenticate(['teacher']), teacherController.getPendingRequests);
// Get all lectures for a course (for teacher dashboard)
router.get('/teacher/course/:course_id/lectures', authenticate(['teacher']), teacherController.getLecturesForCourse);
router.get('/teacher/course/:course_id/students', authenticate(['teacher']), teacherController.getAllStudents);
router.get('/teacher/course/:course_id/student/:student_id', authenticate(['teacher']), teacherController.getStudentById);
router.get('/teacher/lecture/:lecture_id/questions', authenticate(['teacher']), teacherController.getAllQuestions);
router.get('/teacher/question/:question_id/answers', authenticate(['teacher']), teacherController.getAllAnswers);
//PUT
router.put('/teacher/dashboard/profile', authenticate(['teacher']), teacherController.updateTeacherProfile);
//POST
router.post('/teacher/course', authenticate(['teacher']), teacherController.createCourse);
router.post('/teacher/lecture', authenticate(['teacher']), teacherController.createLecture);
router.post('/teacher/course/make-ta', authenticate(['teacher']), teacherController.makeStudentTA);
router.post('/teacher/question/answer', authenticate(['teacher']), teacherController.answerQuestion);
router.post('/teacher/course/accept-requests', authenticate(['teacher']), teacherController.acceptPendingRequests);
router.post('/teacher/course/reject-requests', authenticate(['teacher']), teacherController.rejectPendingRequests);
//DELETE
router.delete('/teacher/course/:course_id/remove-student', authenticate(['teacher']), teacherController.removeStudentFromCourse);
router.delete('/teacher/lecture/:lecture_id', authenticate(['teacher']), teacherController.deleteLecture);
router.delete('/teacher/question/:question_id', authenticate(['teacher']), teacherController.deleteQuestion);
router.delete('/teacher/answer/:answer_id', authenticate(['teacher']), teacherController.deleteAnswer);

module.exports = router;