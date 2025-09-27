import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';

// --- SHARED MOCK DATABASE & API ---
// This acts as our persistent backend for the duration of the browser session.
// Any data changed here will be visible to all users (professor/student) after logging in/out.
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

const mockApi = {
    login: async (email, role) => {
        console.log("API: Logging in...", { email, role });
        const mockUserData = { email, role, id: 'mock-user-id-' + Math.random() };
        return mockUserData;
    },
    signup: async (email, role) => {
        console.log("API: Signing up...", { email, role });
        const mockUserData = { email, role, id: 'mock-user-id-' + Math.random() };
        return mockUserData;
    },
    getClasses: async (date) => {
        console.log(`API: Fetching classes for ${date}`);
        return mockDatabase.classes.filter(c => c.date === date);
    },
    createClass: async (classData) => {
        const newClass = {
            ...classData,
            id: 'class-' + Math.random()
        };
        mockDatabase.classes.push(newClass);
        console.log("API: Class created and saved to mock DB", newClass);
        return newClass;
    },
    getQuestions: async (classId) => {
        console.log(`API: Fetching questions for class ${classId}`);
        return mockDatabase.questions[classId] || [];
    },
    postQuestion: async (classId, questionData) => {
        if (!mockDatabase.questions[classId]) {
            mockDatabase.questions[classId] = [];
        }
        const newQuestion = { ...questionData, id: 'q-' + Math.random() };
        mockDatabase.questions[classId].unshift(newQuestion);
        console.log(`API: New question for class ${classId}`, newQuestion);
        return newQuestion;
    },
    updateQuestionStatus: async(classId, questionId, status) => {
         const classQuestions = mockDatabase.questions[classId] || [];
         const question = classQuestions.find(q => q.id === questionId);
         if(question) {
            question.status = status;
            console.log(`API: Updated Q:${questionId} to ${status}`);
            return question;
         }
         return null;
    },
    deleteQuestion: async(classId, questionId) => {
        if(mockDatabase.questions[classId]) {
            mockDatabase.questions[classId] = mockDatabase.questions[classId].filter(q => q.id !== questionId);
            console.log(`API: Deleted Q:${questionId}`);
            return true;
        }
        return false;
    }
};


// --- CONTEXT ---
const AuthContext = createContext();

const useAuth = () => {
  return useContext(AuthContext);
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    const userData = await mockApi.login(email, role);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const signup = async (email, password, role) => {
    const userData = await mockApi.signup(email, role);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = { user, loading, login, signup, logout };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};


// --- COMPONENTS ---

const Navbar = ({ onHomeClick }) => {
    const { user, logout } = useAuth();
    if (!user) return null;
    return (
        <header className="bg-white shadow-md">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <button onClick={onHomeClick} className="text-2xl font-bold text-indigo-600">VidyaVichar</button>
                <div className="flex items-center space-x-4">
                    <span className="text-gray-700 capitalize">Welcome, {user.role}</span>
                    <button onClick={logout} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Logout</button>
                </div>
            </nav>
        </header>
    );
};

const LoginPage = () => {
    const [isProfessorLogin, setIsProfessorLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const { login, signup } = useAuth();

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const role = isProfessorLogin ? 'professor' : 'student';
            if (isSignUp) await signup(email, password, role);
            else await login(email, password, role);
        } catch (err) {
            setError('Failed to authenticate.');
            console.error(err);
        }
    };
    
    const loginTitle = isProfessorLogin ? 'Professor' : 'Student';
    const actionText = isSignUp ? 'Sign Up' : 'Log In';

    return (
        <div className="flex items-center justify-center min-h-screen -mt-20">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center">VidyaVichar</h2>
                <div className="flex justify-center border-b-2">
                    <button onClick={() => setIsProfessorLogin(true)} className={`px-6 py-2 text-lg font-semibold ${isProfessorLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Professor</button>
                    <button onClick={() => setIsProfessorLogin(false)} className={`px-6 py-2 text-lg font-semibold ${!isProfessorLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Student</button>
                </div>
                <h3 className="text-2xl font-semibold text-center">{actionText} as a {loginTitle}</h3>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <form onSubmit={handleAuthAction} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">{actionText}</button>
                </form>
                <p className="text-sm text-center">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <button onClick={() => setIsSignUp(!isSignUp)} className="ml-1 font-medium text-indigo-600 hover:underline">{isSignUp ? 'Log In' : 'Sign Up'}</button>
                </p>
            </div>
        </div>
    );
};

const Calendar = ({ currentDate, setCurrentDate, selectedDate, setSelectedDate }) => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const changeMonth = (offset) => setCurrentDate(new Date(year, month + offset, 1));

    const renderDays = () => {
        const dayElements = [];
        for (let i = 0; i < firstDayOfMonth; i++) dayElements.push(<div key={`empty-${i}`} className="p-2"></div>);
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isSelected = selectedDate.toDateString() === date.toDateString();
            const isToday = new Date().toDateString() === date.toDateString();
            let dayClass = 'p-2 text-center cursor-pointer rounded-full w-10 h-10 flex items-center justify-center';
            if (isSelected) dayClass += ' bg-indigo-600 text-white';
            else if (isToday) dayClass += ' bg-indigo-200 text-indigo-800';
            else dayClass += ' hover:bg-gray-200';
            dayElements.push(<div key={day} className={dayClass} onClick={() => setSelectedDate(date)}>{day}</div>);
        }
        return dayElements;
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200">&lt;</button>
                <h2 className="text-xl font-bold">{monthNames[month]} {year}</h2>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-600">{days.map(day => <div key={day}>{day}</div>)}</div>
            <div className="grid grid-cols-7 gap-2 mt-2">{renderDays()}</div>
        </div>
    );
};

const CreateClassModal = ({ date, onClose, onClassCreated }) => {
    const [className, setClassName] = useState('');
    const { user } = useAuth();

    const handleCreateClass = async (e) => {
        e.preventDefault();
        if (!className.trim()) return;
        const newClass = await mockApi.createClass({ name: className, date, professorId: user.id });
        onClassCreated(newClass);
        onClose(); 
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Create New Class</h2>
                <form onSubmit={handleCreateClass}>
                    <label className="block text-sm font-medium">Class Name</label>
                    <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const HomePage = ({ onEnterClass }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [classes, setClasses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();
    const formattedSelectedDate = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);

    const handleClassCreated = (newClass) => {
        if (newClass.date === formattedSelectedDate) {
            setClasses(prevClasses => [...prevClasses, newClass]);
        }
    };
    
    useEffect(() => {
        const fetchClasses = async () => {
            const data = await mockApi.getClasses(formattedSelectedDate);
            setClasses(data);
        };
        fetchClasses();
    }, [formattedSelectedDate]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Calendar currentDate={currentDate} setCurrentDate={setCurrentDate} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-semibold">Classes on {selectedDate.toLocaleDateString()}</h3>
                     {user.role === 'professor' && (
                        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md">+</button>
                     )}
                </div>
                <div className="space-y-3">
                    {classes.length > 0 ? (
                        classes.map(c => (
                            <div key={c.id} className="p-4 bg-gray-100 rounded-md flex justify-between items-center">
                                <span className="font-semibold">{c.name}</span>
                                <button onClick={() => onEnterClass(c)} className="px-3 py-1 text-sm text-white bg-green-500 rounded-md">Enter</button>
                            </div>
                        ))
                    ) : (<p className="text-gray-500">No classes scheduled for this day.</p>)}
                </div>
            </div>
            {isModalOpen && <CreateClassModal date={formattedSelectedDate} onClose={() => setIsModalOpen(false)} onClassCreated={handleClassCreated} />}
        </div>
    );
};

const ProfessorClassView = ({ classId }) => {
    const [questions, setQuestions] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchQuestions = async () => setQuestions(await mockApi.getQuestions(classId));
        fetchQuestions();
    }, [classId]);

    const updateQuestionStatus = async (questionId, newStatus) => {
        await mockApi.updateQuestionStatus(classId, questionId, newStatus);
        setQuestions(questions.map(q => q.id === questionId ? { ...q, status: newStatus } : q));
    };

    const deleteQuestion = async(questionId) => {
        await mockApi.deleteQuestion(classId, questionId);
        setQuestions(questions.filter(q => q.id !== questionId));
    }

    const filteredQuestions = questions.filter(q => filter === 'all' || q.status === filter);
    const getStatusColor = (status) => status === 'answered' ? 'border-green-400' : status === 'important' ? 'border-yellow-400' : 'border-blue-400';
    
    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-4 border-b pb-4">
                <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-md text-sm ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>All ({questions.length})</button>
                <button onClick={() => setFilter('unanswered')} className={`px-3 py-1 rounded-md text-sm ${filter === 'unanswered' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Unanswered ({questions.filter(q=>q.status==='unanswered').length})</button>
                 <button onClick={() => setFilter('answered')} className={`px-3 py-1 rounded-md text-sm ${filter === 'answered' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Answered ({questions.filter(q=>q.status==='answered').length})</button>
                <button onClick={() => setFilter('important')} className={`px-3 py-1 rounded-md text-sm ${filter === 'important' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Important ({questions.filter(q=>q.status==='important').length})</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQuestions.length === 0 && <p className="text-gray-500 col-span-full">No questions in this category.</p>}
                {filteredQuestions.map(q => (
                    <div key={q.id} className={`p-4 rounded-lg shadow bg-gray-50 border-l-4 ${getStatusColor(q.status)}`}>
                        <p className="mb-4">{q.text}</p>
                        <div className="text-xs text-gray-500 mb-3">{new Date(q.timestamp).toLocaleString()}</div>
                        <div className="flex flex-wrap gap-2">
                             <button onClick={() => updateQuestionStatus(q.id, 'answered')} className="px-2 py-1 text-xs bg-green-500 text-white rounded">Answered</button>
                             <button onClick={() => updateQuestionStatus(q.id, 'important')} className="px-2 py-1 text-xs bg-yellow-500 text-white rounded">Important</button>
                             <button onClick={() => updateQuestionStatus(q.id, 'unanswered')} className="px-2 py-1 text-xs bg-blue-500 text-white rounded">Unanswered</button>
                             <button onClick={() => deleteQuestion(q.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StudentClassView = ({ classId }) => {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchQuestions = async () => setQuestions(await mockApi.getQuestions(classId));
        fetchQuestions();
    }, [classId]);

    const handleAskQuestion = async (e) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;
        const questionData = { text: newQuestion, studentId: user.id, timestamp: new Date(), status: 'unanswered' };
        const createdQuestion = await mockApi.postQuestion(classId, questionData);
        setQuestions(prevQuestions => [createdQuestion, ...prevQuestions]);
        setNewQuestion('');
    };
    
    const getStatusInfo = (status) => {
        if (status === 'answered') return { text: 'Answered', color: 'bg-green-200 text-green-800'};
        if (status === 'important') return { text: 'Important', color: 'bg-yellow-200 text-yellow-800'};
        return { text: 'Unanswered', color: 'bg-blue-200 text-blue-800'};
    };

    return (
        <div>
            <form onSubmit={handleAskQuestion} className="mb-6 flex gap-2">
                <input type="text" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="Ask a question..." className="flex-grow px-4 py-2 border rounded-md"/>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md">Ask</button>
            </form>
            <h3 className="text-xl font-semibold mb-4">Questions Board</h3>
            <div className="space-y-4">
                {questions.map(q => {
                    const statusInfo = getStatusInfo(q.status);
                    return (
                        <div key={q.id} className="p-4 bg-gray-100 rounded-lg flex justify-between items-start">
                           <div>
                                <p>{q.text}</p>
                                <div className="text-xs text-gray-500 mt-2">{new Date(q.timestamp).toLocaleString()}</div>
                           </div>
                           <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>{statusInfo.text}</span>
                        </div>
                    );
                })}
                {questions.length === 0 && <p className="text-gray-500">No questions yet. Be the first to ask!</p>}
            </div>
        </div>
    );
};

const ClassroomPage = ({ classInfo, onBack }) => {
    const { user } = useAuth();
    if (!classInfo) return <div>Loading class...</div>;
    return (
        <div>
            <button onClick={onBack} className="mb-4 px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50">&larr; Back to Calendar</button>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold mb-1">{classInfo.name}</h2>
                <p className="text-gray-500 mb-6">Date: {new Date(classInfo.date).toLocaleDateString()}</p>
                {user.role === 'professor' ? <ProfessorClassView classId={classInfo.id} /> : <StudentClassView classId={classInfo.id} />}
            </div>
        </div>
    );
};

// --- Main App Component ---
function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedClass, setSelectedClass] = useState(null);

  // FIX: Reset the view to home when user logs out.
  useEffect(() => {
    if (!user) {
      setCurrentPage('home');
      setSelectedClass(null);
    }
  }, [user]);

  const handleEnterClass = (classInfo) => {
      setSelectedClass(classInfo);
      setCurrentPage('classroom');
  };
  
  const handleBackToHome = () => {
      setSelectedClass(null);
      setCurrentPage('home');
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  
  return (
      <div className="min-h-screen bg-gray-50 font-sans">
          <Navbar onHomeClick={handleBackToHome} />
          <main className="container mx-auto p-6">
              {!user ? <LoginPage /> : currentPage === 'home' ? <HomePage onEnterClass={handleEnterClass} /> : <ClassroomPage classInfo={selectedClass} onBack={handleBackToHome} />}
          </main>
      </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}