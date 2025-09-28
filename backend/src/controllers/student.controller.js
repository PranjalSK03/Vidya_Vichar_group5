


// Student Controller for handling student-specific operations
const Student = require('../models/Students');
const Course = require('../models/Courses');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Lecture = require('../models/Lecture');

const studentController = {
  // Get student dashboard overview
  getStudentOverview: async (req, res) => {
    try {
      const studentId = req.user.id; // From JWT token
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Number of courses enrolled
      const numCoursesEnrolled = Array.isArray(student.courses_id_enrolled)
        ? student.courses_id_enrolled.length
        : (student.courses_id_enrolled ? 1 : 0);

      // Unanswered questions
      const unansweredQuestions = await Question.countDocuments({
        student_id: studentId,
        is_answered: false
      });

      // Pending course requests
      const pendingCourses = Array.isArray(student.courses_id_request)
        ? student.courses_id_request.length
        : (student.courses_id_request ? 1 : 0);

      res.status(200).json({
        success: true,
        data: {
          name: student.name,
          roll_no: student.roll_no,
          batch: student.batch,
          branch: student.branch,
          numCoursesEnrolled,
          unansweredQuestions,
          pendingCourses
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

  // Get enrolled courses
  getEnrolledCourses: async (req, res) => {
    try {
      const studentId = req.user.id;
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Find all courses where student is in student_list
      const courses = await Course.find({ student_list: studentId })
        .populate('teacher_id', 'name')
        .lean();

      // For each course, calculate duration, remaining time, instructor, and TAs
      const now = new Date();
      const courseDetails = await Promise.all(courses.map(async course => {
        // Duration (in ms)
        let duration = null;
        let remainingTime = null;
        if (course.start_time && course.end_time) {
          duration = new Date(course.end_time) - new Date(course.start_time);
          remainingTime = new Date(course.end_time) - now;
        }

        // Instructor name (assuming teacher_id is populated and can be array or single)
        let instructorName = '';
        if (Array.isArray(course.teacher_id) && course.teacher_id.length > 0) {
          instructorName = course.teacher_id[0].name;
        } else if (course.teacher_id && course.teacher_id.name) {
          instructorName = course.teacher_id.name;
        }

        // Get TAs using course.TA array
        let TAs = [];
        if (Array.isArray(course.TA) && course.TA.length > 0) {
          TAs = await Student.find({ _id: { $in: course.TA } }, 'name roll_no');
        }

        return {
          id: course._id,
          course_name: course.course_name,
          duration, // in ms
          remainingTime, // in ms
          instructor: instructorName,
          TAs: TAs.map(ta => ({ name: ta.name, roll_no: ta.roll_no }))
        };
      }));

      res.status(200).json({
        success: true,
        data: {
          courses: courseDetails
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

  getPendingCourses: async (req, res) => {
    try {
      const studentId = req.user.id;
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Find all courses where student id is present in request_list
      const courses = await Course.find({ request_list: studentId })
        .populate('teacher_id', 'name')
        .lean();

      const now = new Date();
      const courseDetails = await Promise.all(courses.map(async course => {
        // Duration (in ms)
        let duration = null;
        let remainingTime = null;
        if (course.start_time && course.end_time) {
          duration = new Date(course.end_time) - new Date(course.start_time);
          remainingTime = new Date(course.end_time) - now;
        }

        // Instructor name (assuming teacher_id is populated and can be array or single)
        let instructorName = '';
        if (Array.isArray(course.teacher_id) && course.teacher_id.length > 0) {
          instructorName = course.teacher_id[0].name;
        } else if (course.teacher_id && course.teacher_id.name) {
          instructorName = course.teacher_id.name;
        }

        // Get TAs using course.TA array
        let TAs = [];
        if (Array.isArray(course.TA) && course.TA.length > 0) {
          TAs = await Student.find({ _id: { $in: course.TA } }, 'name roll_no');
        }

        return {
          id: course._id,
          course_name: course.course_name,
          duration, // in ms
          remainingTime, // in ms
          instructor: instructorName,
          TAs: TAs.map(ta => ({ name: ta.name, roll_no: ta.roll_no }))
        };
      }));

      res.status(200).json({
        success: true,
        data: {
          courses: courseDetails
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

  // Get courses for student by batch and branch
  getCoursesForStudents: async (req, res) => {
    try {
      const studentId = req.user.id;
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const courses = await Course.find({
        batch: student.batch,
        branch: student.branch
      }, 'course_id course_name');

      res.status(200).json({
        success: true,
        data: {
          courses: courses.map(course => ({
            id: course.course_id,
            name: course.course_name
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

  // Get student classes/lectures
  getStudentLectures: async (req, res) => {
    try {
      const studentId = req.user.id;
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get lectures for courses the student is enrolled in
      const now = new Date();
      const lectures = await Lecture.find({
        course_id: { $in: student.courses_id }
      }).populate('course_id', 'course_name');

      // Filter lectures: only those starting within 15 min from now and not ended
      const filteredLectures = lectures.filter(lecture => {
        if (!lecture.class_start || !lecture.class_end) return false;
        const start = new Date(lecture.class_start);
        const end = new Date(lecture.class_end);
        // Show if now >= (start - 15min) and now <= end
        return now >= new Date(start.getTime() - 15 * 60 * 1000) && now <= end;
      });

      res.status(200).json({
        success: true,
        data: {
          lectures: filteredLectures.map(lecture => ({
            lecture_id: lecture.lecture_id,
            course_id: lecture.course_id?._id || lecture.course_id,
            course_name: lecture.course_id?.course_name,
            lecture_title: lecture.lecture_title,
            lec_num: lecture.lec_num,
            class_start: lecture.class_start,
            class_end: lecture.class_end
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

    // Get previous lectures for student (lectures that have ended)
  getPrevStudentLectures: async (req, res) => {
    try {
      const studentId = req.user.id;
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get lectures for courses the student is enrolled in
      const now = new Date();
      const lectures = await Lecture.find({
        course_id: { $in: student.courses_id }
      }).populate('course_id', 'course_name');

      // Filter lectures: only those where now > class_end
      const filteredLectures = lectures.filter(lecture => {
        if (!lecture.class_end) return false;
        const end = new Date(lecture.class_end);
        return now > end;
      });

      res.status(200).json({
        success: true,
        data: {
          lectures: filteredLectures.map(lecture => ({
            lecture_id: lecture.lecture_id,
            course_id: lecture.course_id?._id || lecture.course_id,
            course_name: lecture.course_id?.course_name,
            lecture_title: lecture.lecture_title,
            lec_num: lecture.lec_num,
            class_start: lecture.class_start,
            class_end: lecture.class_end
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

    // Get all questions for a lecture
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

  // Get all questions for a lecture asked by the current student
  getMyQuestions: async (req, res) => {
    try {
      const studentId = req.user.id;
      const lectureId = req.params.lecture_id;
      if (!lectureId) {
        return res.status(400).json({
          success: false,
          message: 'lecture_id is required in req.user'
        });
      }

      // Find all questions for this lecture asked by this student
      const questions = await Question.find({ lecture_id: lectureId, student_id: studentId })
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

  editQuestion: async (req, res) => {
    try {
      const { question_id, question_text } = req.body;
      const studentId = req.user.id;

      if (!question_id || !question_text) {
        return res.status(400).json({
          success: false,
          message: 'question_id and question_text are required.'
        });
      }

      // Find the question by question_id and student_id
      const question = await Question.findOne({ question_id, student_id: studentId });
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found or not owned by user.'
        });
      }

      if (question.is_answered) {
        return res.status(400).json({
          success: false,
          message: 'Answered questions cannot be edited.'
        });
      }

      // Update the question text
      question.question_text = question_text;
      await question.save();

      res.status(200).json({
        success: true,
        message: 'Question updated successfully.',
        data: {
          question: {
            question_id: question.question_id,
            question_text: question.question_text,
            student_id: question.student_id,
            lecture_id: question.lecture_id,
            timestamp: question.timestamp,
            is_answered: question.is_answered,
            is_important: question.is_important,
            upvotes: question.upvotes,
            upvoted_by: question.upvoted_by,
            answer: question.answer
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

    // Join a course
  joinCourse: async (req, res) => {
    try {
      const { course_id } = req.body; // course_id as per Courses.js
      const studentId = req.user.id;

      const student = await Student.findById(studentId);
      const course = await Course.findOne({ course_id });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if already enrolled (students.js: courses_id_enrolled)
      if (student.courses_id_enrolled.includes(course_id)) {
        return res.status(400).json({
          success: false,
          message: 'Already enrolled in this course'
        });
      }

      // Check if already requested (students.js: courses_id_request)
      if (student.courses_id_request.includes(course_id)) {
        return res.status(400).json({
          success: false,
          message: 'Already requested to join this course'
        });
      }

      // Add course to student's request list
      student.courses_id_request.push(course_id);
      await student.save();

      // Add student to course's request_list (courses.js: request_list)
      if (!course.request_list.includes(studentId)) {
        course.request_list.push(studentId);
        await course.save();
      }

      res.status(200).json({
        success: true,
        message: 'Successfully requested to join the course',
        data: {
          course: {
            course_id: course.course_id,
            course_name: course.course_name,
            batch: course.batch,
            branch: course.branch
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

  // Join a class
  joinLecture: async (req, res) => {
    try {
      const { lectureId } = req.body;
      const studentId = req.user.id;

      const lecture = await Lecture.findById(lectureId);
      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found'
        });
      }

      // Add student to joined students if not already joined
      if (!lecture.joined_students.includes(studentId)) {
        lecture.joined_students.push(studentId);
        await lecture.save();
      }

      res.status(200).json({
        success: true,
        message: 'Successfully joined the class',
        data: {
          lecture: {
            lecture_id: lecture.lecture_id,
            lecture_title: lecture.lecture_title,
            lec_num: lecture.lec_num,
            class_start: lecture.class_start,
            class_end: lecture.class_end,
            joined_students_count: lecture.joined_students.length
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

  // Ask a doubt/question
  askQuestion: async (req, res) => {
    try {
      const { question_text, lecture_id } = req.body;
      const studentId = req.user.id;

      // Generate a unique question_id (could use a UUID or a timestamp+studentId+lectureId)
      const question_id = `${lecture_id}_${studentId}_${Date.now()}`;
      const timestamp = new Date();

      const newQuestion = new Question({
        question_id,
        question_text,
        student_id: studentId,
        lecture_id,
        timestamp,
        is_answered: false,
        is_important: false,
        upvotes: 1, // Auto upvote by asker
        upvoted_by: [studentId],
        answer: []
      });

      await newQuestion.save();

      res.status(201).json({
        success: true,
        message: 'Question asked successfully',
        data: {
          question: {
            question_id: newQuestion.question_id,
            question_text: newQuestion.question_text,
            student_id: newQuestion.student_id,
            lecture_id: newQuestion.lecture_id,
            timestamp: newQuestion.timestamp,
            is_answered: newQuestion.is_answered,
            is_important: newQuestion.is_important,
            upvotes: newQuestion.upvotes,
            upvoted_by: newQuestion.upvoted_by,
            answer: newQuestion.answer
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

  answerQuestion: async (req, res) => {
    try {
      const { question_id, answer_text, answer_type } = req.body;
      const studentId = req.user.id;

      // Only allow if student is TA for this course
      const student = await Student.findById(studentId);
      const { lecture_id } = req.body;
      let courseIdForLecture = null;
      if (lecture_id) {
        const lecture = await Lecture.findOne({ lecture_id });
        if (lecture) courseIdForLecture = lecture.course_id;
      }
      if (!student || !courseIdForLecture || !student.is_TA.includes(courseIdForLecture)) {
        return res.status(403).json({
          success: false,
          message: 'Only TAs for this course can answer questions.'
        });
      }

      const question = await Question.findOne({ question_id });
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      // Create answer according to Answer.js
      const newAnswer = new Answer({
        answerer_name: student.name,
        answer: answer_text,
        answer_type
      });
      await newAnswer.save();

      // Link answer to question
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
    }
     catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }, 
  
  deleteQuestion: async (req, res) => {
    try {
      const question_id = req.params.question_id;
      const studentId = req.user.id;

      if (!question_id) {
        return res.status(400).json({
          success: false,
          message: 'question_id is required.'
        });
      }

      // Find the question by question_id and student_id
      const question = await Question.findOne({ question_id, student_id: studentId });
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found or not owned by user.'
        });
      }

      if (question.is_answered) {
        return res.status(400).json({
          success: false,
          message: 'Answered questions cannot be deleted.'
        });
      }

      await Question.deleteOne({ question_id, student_id: studentId });

      res.status(200).json({
        success: true,
        message: 'Question deleted successfully.'
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

  deleteAnswer: async (req, res) => {
    try {
      const question_id = req.params.question_id;
      const studentId = req.user.id;

      if (!question_id) {
        return res.status(400).json({
          success: false,
          message: 'question_id is required.'
        });
      }

      // Find the question by question_id and student_id (only allow owner to clear answer)
      const question = await Question.findOne({ question_id, student_id: studentId });
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found or not owned by user.'
        });
      }

      // Remove all answers associated with this question
      if (Array.isArray(question.answer) && question.answer.length > 0) {
        await Answer.deleteMany({ _id: { $in: question.answer } });
      }

      // Clear the answer array and mark as not answered
      question.answer = [];
      question.is_answered = false;
      await question.save();

      res.status(200).json({
        success: true,
        message: 'Answer(s) deleted and question cleared.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

};

module.exports = studentController;