
// Teacher Controller for handling teacher-specific operations
const Teacher = require('../models/Teachers');
const Student = require('../models/Students');
const Course = require('../models/Courses');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Lecture = require('../models/Lecture');
const { answerQuestion } = require('./student.controller');

const teacherController = {
  // Get teacher dashboard overview
  getTeacherOverview: async (req, res) => {
    try {
      const teacherId = req.user.id; // From JWT token
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      // Find all courses taught by this teacher (by teacher.courses_id)
      const courses = await Course.find({ course_id: { $in: teacher.courses_id } });

      // Calculate total pending requests (sum of request_list lengths)
      let totalPendingRequests = 0;
      courses.forEach(course => {
        if (Array.isArray(course.request_list)) {
          totalPendingRequests += course.request_list.length;
        }
      });

      res.status(200).json({
        success: true,
        data: {
          teacher_id: teacher.teacher_id,
          username: teacher.username,
          name: teacher.name,
          courses_id: teacher.courses_id,
          total_pending_requests: totalPendingRequests
        }
      });
    } 
    catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  getAllTeachers: async (req, res) => {
    try {
      const teachers = await Teacher.find({}, 'name teacher_id');
      res.status(200).json({
        success: true,
        data: {
          teachers: teachers.map(t => ({
            name: t.name,
            teacher_id: t.teacher_id
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  getTeacherByid: async (req, res) => {
    try {
      const teacher_id = req.params.teacher_id;
      if (!teacher_id) {
        return res.status(400).json({
          success: false,
          message: 'teacher_id is required.'
        });
      }
      const teacher = await Teacher.findOne({ teacher_id }, 'name teacher_id');
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found.'
        });
      }
      res.status(200).json({
        success: true,
        data: {
          name: teacher.name,
          teacher_id: teacher.teacher_id
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  getAllCourses: async (req, res) => {
    try {
      const teacherId = req.user.id;
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      // Find all courses where course_id is in teacher.courses_id
      const courses = await Course.find({ course_id: { $in: teacher.courses_id } }, 'course_id course_name');

      res.status(200).json({
        success: true,
        data: {
          courses: courses.map(course => ({
            course_id: course.course_id,
            course_name: course.course_name
          }))
        }
      });
    }
    catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  getPendingRequests: async (req, res) => {
    try {
      const course_id = req.params.course_id;
      if (!course_id) {
        return res.status(400).json({
          success: false,
          message: 'course_id is required as a URL parameter.'
        });
      }

      // Find the course by course_id
      const course = await Course.findOne({ course_id });
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found.'
        });
      }

      // Get all students whose _id is in course.request_list
      const students = await Student.find({ _id: { $in: course.request_list } }, 'name _id');

      res.status(200).json({
        success: true,
        data: {
          pending_students: students.map(s => ({
            id: s._id,
            name: s.name
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // Update teacher profile
  updateTeacherProfile: async (req, res) => {
    try {
      const teacherId = req.user.id;
      const { name, username } = req.body;

      // Only allow updating name and username
      const updateFields = {};
      if (name) updateFields.name = name;
      if (username) updateFields.username = username;

      // Check for uniqueness of username and name if being updated
      if (username) {
        const existing = await Teacher.findOne({ username, _id: { $ne: teacherId } });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Username already in use.'
          });
        }
          
      }
      if (name) {
        const existing = await Teacher.findOne({ name, _id: { $ne: teacherId } });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Name already in use.'
          });
        }
      }

      const updatedTeacher = await Teacher.findByIdAndUpdate(
        teacherId,
        updateFields,
        { new: true }
      ).select('-password');

      if (!updatedTeacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          teacher: updatedTeacher
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // Create course
  createCourse: async (req, res) => {
    try {
      const { course_id, course_name, batch, branch, valid_time, teacher_ids } = req.body;
      const mainTeacher = await Teacher.findById(req.user.id);
      if (!mainTeacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      // Combine main teacher and additional teacher_ids (ensure uniqueness)
      let allTeacherIds = [mainTeacher.teacher_id];
      if (Array.isArray(teacher_ids)) {
        allTeacherIds = Array.from(new Set([mainTeacher.teacher_id, ...teacher_ids]));
      }

      // Create new course with all teachers
      const newCourse = new Course({
        course_id,
        course_name,
        teacher_id: allTeacherIds,
        batch,
        branch,
        valid_time,
        request_list: [],
        student_list: [],
        lecture_id: []
      });

      await newCourse.save();

      // Add course_id to each teacher's courses_id array
      const teachersToUpdate = await Teacher.find({ teacher_id: { $in: allTeacherIds } });
      for (const t of teachersToUpdate) {
        if (!t.courses_id.includes(course_id)) {
          t.courses_id.push(course_id);
          await t.save();
        }
      }

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: {
          course: {
            course_id: newCourse.course_id,
            course_name: newCourse.course_name,
            batch: newCourse.batch,
            branch: newCourse.branch,
            valid_time: newCourse.valid_time,
            teacher_id: newCourse.teacher_id
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // Create class/lecture
  createLecture: async (req, res) => {
    try {
      const { course_id, class_start, class_end, lecture_title } = req.body;

      if (!lecture_title || typeof lecture_title !== 'string' || !lecture_title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'lecture_title is required.'
        });
      }
      const teacher = await Teacher.findById(req.user.id);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      // Verify course exists and teacher is assigned
      const course = await Course.findOne({ course_id, teacher_id: { $in: [teacher.teacher_id] } });
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found or unauthorized'
        });
      }


      // Validate class_start and class_end
      if (new Date(class_start) >= new Date(class_end)) {
        return res.status(400).json({
          success: false,
          message: 'class_start must be before class_end.'
        });
      }

      // Find the current max lec_num for this course and increment
      const lastLecture = await Lecture.find({ course_id }).sort({ lec_num: -1 }).limit(1);
      let nextLecNum = 1;
      if (lastLecture.length > 0 && lastLecture[0].lec_num) {
        nextLecNum = lastLecture[0].lec_num + 1;
      }

      // Generate a unique lecture_id that includes the course_id
      let uniqueLectureId;
      let isUnique = false;
      // Sanitize course_id for use in ID (remove spaces, special chars)
      const safeCourseId = String(course_id).replace(/[^a-zA-Z0-9]/g, '');
      const generateLectureId = () => `LEC_${safeCourseId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      while (!isUnique) {
        uniqueLectureId = generateLectureId();
        const existing = await Lecture.findOne({ lecture_id: uniqueLectureId });
        if (!existing) isUnique = true;
      }


      // Create new lecture with auto-incremented lec_num
      const newLecture = new Lecture({
        lecture_id: uniqueLectureId,
        lecture_title,
        course_id,
        class_start,
        class_end,
        lec_num: nextLecNum,
        query_id: [],
        joined_students: [],
        teacher_id: teacher.teacher_id
      });
      await newLecture.save();

      // Add lecture_id to course's lecture_id array
      course.lecture_id.push(uniqueLectureId);
      await course.save();

      res.status(201).json({
        success: true,
        message: 'Lecture created successfully',
        data: {
          lecture: {
            lecture_id: newLecture.lecture_id,
            course_id: newLecture.course_id,
            class_start: newLecture.class_start,
            class_end: newLecture.class_end,
            lec_num: newLecture.lec_num
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  getAllStudents: async (req, res) => {
    try {
      const { course_id } = req.params;
      if (!course_id) {
        return res.status(400).json({
          success: false,
          message: 'course_id is required as a URL parameter.'
        });
      }

      // Find the course by course_id
      const course = await Course.findOne({ course_id });
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found.'
        });
      }

      // Get all students whose _id is in course.student_list
      const students = await Student.find({ _id: { $in: course.student_list } }, 'name _id');

      // Mark TA status for each student (if their _id is in course.TA)
      const taSet = new Set((course.TA || []).map(id => String(id)));

      res.status(200).json({
        success: true,
        data: {
          students: students.map(s => ({
            id: s._id,
            name: s.name,
            is_TA: taSet.has(String(s._id))
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  getStudentById: async (req, res) => {
    try {
      const { course_id, student_id } = req.params;
      if (!course_id || !student_id) {
        return res.status(400).json({
          success: false,
          message: 'course_id and student_id are required as URL parameters.'
        });
      }

      // Find the course by course_id
      const course = await Course.findOne({ course_id });
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found.'
        });
      }

      // Check if student_id is in course.student_list
      if (!course.student_list.includes(student_id)) {
        return res.status(404).json({
          success: false,
          message: 'Student not found in this course.'
        });
      }

      // Find the student by _id
      const student = await Student.findById(student_id, 'name _id');
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found.'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: student._id,
          name: student.name
        }
      });
    } 
    catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  getAllQuestions: async (req, res) => {
    try {
      const lectureId = req.params.lecture_id;
      if (!lectureId) {
        return res.status(400).json({
          success: false,
          message: 'lecture_id is required in req.user'
        });
      }

      // Find all questions for this lecture
      const questions = await Question.find({ lecture_id: lectureId })
        .populate('answer');

      res.status(200).json({
        success: true,
        data: {
          questions: questions.map(q => ({
            question_id: q.question_id,
            question_text: q.question_text,
            student_id: q.student_id,
            lecture_id: q.lecture_id,
            timestamp: q.timestamp,
            is_answered: q.is_answered,
            is_important: q.is_important,
            upvotes: q.upvotes,
            upvoted_by: q.upvoted_by,
            answer: (q.answer || []).map(a => ({
              answer_id: a._id,
              answerer_name: a.answerer_name,
              answer: a.answer,
              answer_type: a.answer_type
            }))
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  makeStudentTA: async (req, res) => {//POST type
    try {
      const { student_id, course_id } = req.body;
      if (!student_id || !course_id) {
        return res.status(400).json({
          success: false,
          message: 'student_id and course_id are required in the request body.'
        });
      }

      // Find the student
      const student = await Student.findById(student_id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found.'
        });
      }

      // Find the course
      const course = await Course.findOne({ course_id });
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found.'
        });
      }

      // Add course_id to student's is_TA array if not already present
      if (!student.is_TA.includes(course_id)) {
        student.is_TA.push(course_id);
        await student.save();
      }

      // Add student_id to course.TA array if not already present
      if (!course.TA) course.TA = [];
      if (!course.TA.map(id => String(id)).includes(String(student._id))) {
        course.TA.push(student._id);
        await course.save();
      }

      res.status(200).json({
        success: true,
        message: 'Student is now a TA for the course.',
        data: {
          student_id: student._id,
          is_TA: student.is_TA,
          course_TA: course.TA
        }
      });
    } 
    catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  answerQuestion: async (req, res) => {
    try {
      const { question_id, answer_text, answer_type } = req.body;
      const teacherId = req.user.id;

      // Find teacher
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({ success: false, message: 'Teacher not found.' });
      }

      // Find question
      const question = await Question.findOne({ question_id });
      if (!question) {
        return res.status(404).json({ success: false, message: 'Question not found.' });
      }

      // Create answer
      const newAnswer = new Answer({
        answerer_name: teacher.name,
        answer: answer_text,
        answer_type
      });
      await newAnswer.save();

      // Link answer to question
      if (!Array.isArray(question.answer)) question.answer = [];
      question.answer.push(newAnswer._id);
      question.is_answered = true;
      await question.save();

      res.status(201).json({
        success: true,
        message: 'Answer submitted successfully',
        data: {
          answer: {
            answer_id: newAnswer._id,
            answerer_name: newAnswer.answerer_name,
            answer: newAnswer.answer,
            answer_type: newAnswer.answer_type
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },


  getAllAnswers: async (req, res) => {
    try {
      const { question_id } = req.params;
      if (!question_id) {
        return res.status(400).json({
          success: false,
          message: 'question_id is required as a URL parameter.'
        });
      }

      // Find the question and populate answers
      const question = await Question.findOne({ question_id }).populate('answer');
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found.'
        });
      }

      // Return all answer content
      res.status(200).json({
        success: true,
        data: {
          answers: (question.answer || []).map(ans => ({
            answer_id: ans._id,
            answerer_name: ans.answerer_name,
            answer: ans.answer,
            answer_type: ans.answer_type
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // Accept pending requests for a course
  acceptPendingRequests: async (req, res) => {
    try {
      const { course_id, student_ids } = req.body;
      if (!course_id || !Array.isArray(student_ids) || student_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'course_id and student_ids (array) are required.'
        });
      }

      // Find the course
      const course = await Course.findOne({ course_id });
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found.'
        });
      }

      // For each student: remove from request_list, add to student_list
      for (const studentId of student_ids) {
        // Remove from course.request_list if present
        const reqIdx = course.request_list.indexOf(studentId);
        if (reqIdx !== -1) course.request_list.splice(reqIdx, 1);
        // Add to course.student_list if not already present
        if (!course.student_list.includes(studentId)) course.student_list.push(studentId);

        // Update student model
        const student = await Student.findById(studentId);
        if (student) {
          // Remove course_id from courses_id_request
          const reqCourseIdx = student.courses_id_request.indexOf(course_id);
          if (reqCourseIdx !== -1) student.courses_id_request.splice(reqCourseIdx, 1);
          // Add course_id to courses_id_enrolled if not already present
          if (!student.courses_id_enrolled.includes(course_id)) student.courses_id_enrolled.push(course_id);
          await student.save();
        }
      }
      await course.save();

      res.status(200).json({
        success: true,
        message: 'Pending requests accepted and students enrolled.',
        data: {
          course_id,
          enrolled_students: student_ids
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

    // Reject pending requests for a course
  rejectPendingRequests: async (req, res) => {
    try {
      const { course_id, student_ids } = req.body;
      if (!course_id || !Array.isArray(student_ids) || student_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'course_id and student_ids (array) are required.'
        });
      }

      // Find the course
      const course = await Course.findOne({ course_id });
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found.'
        });
      }

      // For each student: remove from request_list (do not add to student_list)
      for (const studentId of student_ids) {
        // Remove from course.request_list if present
        const reqIdx = course.request_list.indexOf(studentId);
        if (reqIdx !== -1) course.request_list.splice(reqIdx, 1);

        // Update student model
        const student = await Student.findById(studentId);
        if (student) {
          // Remove course_id from courses_id_request
          const reqCourseIdx = student.courses_id_request.indexOf(course_id);
          if (reqCourseIdx !== -1) student.courses_id_request.splice(reqCourseIdx, 1);
          await student.save();
        }
      }
      await course.save();

      res.status(200).json({
        success: true,
        message: 'Pending requests rejected.',
        data: {
          course_id,
          rejected_students: student_ids
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

    // Remove a student from a course
  removeStudentFromCourse: async (req, res) => {
    try {
      const { course_id } = req.params;
      const { student_id } = req.body;
      if (!course_id || !student_id) {
        return res.status(400).json({ success: false, message: 'course_id and student_id are required.' });
      }
      const course = await Course.findOne({ course_id });
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found.' });
      }
      // Remove student from student_list
      course.student_list = course.student_list.filter(id => String(id) !== String(student_id));
      await course.save();
      // Remove course from student's enrolled list
      const student = await Student.findById(student_id);
      if (student) {
        student.courses_id_enrolled = student.courses_id_enrolled.filter(cid => cid !== course_id);
        await student.save();
      }
      res.status(200).json({ success: true, message: 'Student removed from course.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  },

  // Delete a lecture
  deleteLecture: async (req, res) => {
    try {
      const { lecture_id } = req.params;
      if (!lecture_id) {
        return res.status(400).json({ success: false, message: 'lecture_id is required.' });
      }
      const lecture = await Lecture.findOneAndDelete({ lecture_id });
      if (!lecture) {
        return res.status(404).json({ success: false, message: 'Lecture not found.' });
      }
      // Remove lecture from course's lecture_id array
      await Course.updateOne({ course_id: lecture.course_id }, { $pull: { lecture_id: lecture_id } });
      res.status(200).json({ success: true, message: 'Lecture deleted.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  },

  // Delete a question
  deleteQuestion: async (req, res) => {
    try {
      const { question_id } = req.params;
      if (!question_id) {
        return res.status(400).json({ success: false, message: 'question_id is required.' });
      }
      // Remove all answers associated with this question
      const question = await Question.findOne({ question_id });
      if (!question) {
        return res.status(404).json({ success: false, message: 'Question not found.' });
      }
      if (Array.isArray(question.answer) && question.answer.length > 0) {
        await Answer.deleteMany({ _id: { $in: question.answer } });
      }
      await Question.deleteOne({ question_id });
      res.status(200).json({ success: true, message: 'Question and its answers deleted.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  },

  // Delete an answer
  deleteAnswer: async (req, res) => {
    try {
      const { answer_id } = req.params;
      if (!answer_id) {
        return res.status(400).json({ success: false, message: 'answer_id is required.' });
      }
      // Remove answer from all questions' answer arrays
      await Question.updateMany({ answer: answer_id }, { $pull: { answer: answer_id } });
      await Answer.deleteOne({ _id: answer_id });
      res.status(200).json({ success: true, message: 'Answer deleted.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }

};

module.exports = teacherController;