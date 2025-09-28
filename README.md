project-root/
│
├── frontend/                       # React / Next.js / Vite app
│   ├── public/                     # static assets (logos, icons)
│   ├── src/
│   │   ├── api/                    # API call wrappers (axios/fetch)
│   │   ├── assets/                 # images, css
│   │   ├── components/             # reusable UI components
│   │   ├── context/                # React context providers
│   │   ├── hooks/                  # custom hooks
│   │   ├── layouts/                # page layouts
│   │   ├── pages/                  # routes/pages
│   │   │   ├── auth/               # login, register pages
│   │   │   ├── admin/              # admin dashboard
│   │   │   ├── teacher/            # teacher dashboard
│   │   │   ├── student/            # student dashboard
│   │   │   └── class/              # class pages, question/answer views
│   │   ├── store/                  # Redux / Zustand state mgmt
│   │   ├── styles/                 # global css/tailwind config
│   │   ├── utils/                  # frontend helpers
│   │   └── main.tsx / index.tsx    # entry
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/                 # DB config, env loader
│   │   │   └── db.js
│   │   ├── models/                 # Mongoose schemas
│   │   │   ├── University.js
│   │   │   ├── User.js
│   │   │   ├── Class.js
│   │   │   ├── ClassMembership.js
│   │   │   ├── Question.js
│   │   │   ├── Answer.js
│   │   │   └── Notification.js
│   │   ├── routes/                 # Express routes
│   │   │   ├── admin.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── class.routes.js
│   │   │   ├── question.routes.js
│   │   │   └── notification.routes.js
│   │   ├── controllers/            # Business logic for routes
│   │   │   ├── admin.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── class.controller.js
│   │   │   ├── question.controller.js
│   │   │   └── notification.controller.js
│   │   ├── services/               # Services (mail, notifications, AI)
│   │   │   ├── mail.service.js
│   │   │   ├── notify.service.js
│   │   │   └── search.service.js
│   │   ├── middlewares/            # auth, error handlers
│   │   │   ├── auth.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── utils/                  # helpers
│   │   │   ├── generateCode.js
│   │   │   └── logger.js
│   │   └── app.js                  # main Express app
│   ├── tests/                      # Jest / Mocha tests
│   ├── .env
│   ├── package.json
│   └── server.js                   # entry point
│


## Backend Model Schemas


### Student
| Field               | Type      | Description                                             |
|---------------------|-----------|---------------------------------------------------------|
| username            | String    | Email, unique, required                                 |
| password            | String    | Hashed password, required                               |
| name                | String    | Student's name, required                                |
| roll_no             | String    | Roll number, required                                   |
| is_TA               | [String]  | Array of course IDs where student is TA                 |
| courses_id_request  | [String]  | Array of course IDs requested for enrollment            |
| courses_id_enrolled | [String]  | Array of enrolled course IDs                            |
| batch               | String    | M.Tech/B.Tech/PHD/MS, required                         |
| branch              | String    | CSE/ECE, required                                      |

### Teacher
| Field        | Type      | Description                                  |
|--------------|-----------|----------------------------------------------|
| teacher_id   | String    | Unique, required                             |
| username     | String    | Email, unique, required                      |
| name         | String    | Name, unique, required                       |
| password     | String    | Hashed password, required                    |
| courses_id   | [String]  | Array of unique course IDs                   |

### Course
| Field         | Type      | Description                                 |
|---------------|-----------|---------------------------------------------|
| course_id     | String    | Unique, required                            |
| course_name   | String    | Required                                    |
| teacher_id    | [String]  | Array of unique teacher IDs                 |
| TA            | [String]  | Array of student IDs who are TAs            |
| batch         | String    | M.Tech/B.Tech/PHD/MS, required              |
| branch        | String    | CSE/ECE, required                           |
| valid_time    | Date      | Course valid until (date/time), required    |
| request_list  | [String]  | Student IDs requesting enrollment           |
| student_list  | [String]  | Enrolled student IDs                        |
| lecture_id    | [String]  | Array of lecture IDs                        |

### Lecture
| Field          | Type      | Description                                 |
|----------------|-----------|---------------------------------------------|
| lecture_id     | String    | Unique, required                            |
| lecture_title  | String    | Title of the lecture, required              |
| course_id      | String    | Course ID this lecture belongs to           |
| class_start    | Date      | Start time of the class                     |
| class_end      | Date      | End time of the class                       |
| lec_num        | Number    | Lecture number for the course               |
| query_id       | [String]  | Array of unique query IDs                   |
| joined_students| [String]  | Array of student IDs who joined             |
| teacher_id     | String    | Teacher for the lecture                     |

### Question
| Field         | Type      | Description                                 |
|---------------|-----------|---------------------------------------------|
| question_id   | String    | Unique, required                            |
| question_text | String    | Question text, required                     |
| student_id    | String    | Student ID (who asked), required            |
| lecture_id    | String    | Lecture ID (which lecture), required        |
| timestamp     | Date      | Date and time of question                   |
| is_answered   | Boolean   | Whether answered                            |
| is_important  | Boolean   | Marked important                            |
| upvotes       | Number    | Upvote count                                |
| upvoted_by    | [String]  | Array of unique student IDs                 |
| answer        | [ObjectId]| Array of Answer IDs (see below)             |

### Answer
| Field         | Type      | Description                                 |
|---------------|-----------|---------------------------------------------|
| answerer_name | String    | Name of the answerer                        |
| answer        | Mixed     | Text or file reference                      |
| answer_type   | String    | 'text' or 'file'                            |
