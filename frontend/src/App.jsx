import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';

// --- API SERVICE ---
const API_URL = 'http://localhost:8080/api';

const apiService = {
    async fetch(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (token) {
            headers['x-auth-token'] = token;
        }

        const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Something went wrong');
        }
        if (response.status === 204) return;
        return response.json();
    },
    login: (email, password) => apiService.fetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    }),
    signup: (email, password, role) => apiService.fetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, role })
    }),
    getClasses: (date) => apiService.fetch(`/classes?date=${date}`),
    createClass: (classData) => apiService.fetch('/classes', {
        method: 'POST',
        body: JSON.stringify(classData)
    }),
    getQuestions: (classId) => apiService.fetch(`/classes/${classId}/questions`),
    postQuestion: (classId, questionData) => apiService.fetch(`/classes/${classId}/questions`, {
        method: 'POST',
        body: JSON.stringify(questionData)
    }),
    updateQuestionStatus: (classId, questionId, status) => apiService.fetch(`/classes/${classId}/questions/${questionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    }),
    deleteQuestion: (classId, questionId) => apiService.fetch(`/classes/${classId}/questions/${questionId}`, {
        method: 'DELETE'
    })
};

// --- CONTEXT ---
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { token, user: userData } = await apiService.login(email, password);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const signup = async (email, password, role) => {
    const { token, user: userData } = await apiService.signup(email, password, role);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
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
            else await login(email, password);
        } catch (err) {
            setError(err.message || 'Failed to authenticate.');
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
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
                    </div>
                    <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md">{actionText}</button>
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
        // BUG FIX: Pass the correct professor ID from the user object
        await apiService.createClass({ name: className, date, professorId: user.id });
        onClassCreated();
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
    
    useEffect(() => {
        const fetchClasses = async () => {
            const dateString = selectedDate.toISOString().split('T')[0];
            try {
                const data = await apiService.getClasses(dateString);
                setClasses(data);
            } catch (error) {
                console.error("Failed to fetch classes:", error);
                setClasses([]);
            }
        };

        fetchClasses();
    }, [selectedDate]);

    const handleClassCreated = () => {
        setSelectedDate(new Date(selectedDate));
    };
    
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
                            <div key={c._id} className="p-4 bg-gray-100 rounded-md flex justify-between items-center">
                                <span className="font-semibold">{c.name}</span>
                                <button onClick={() => onEnterClass(c)} className="px-3 py-1 text-sm text-white bg-green-500 rounded-md">Enter</button>
                            </div>
                        ))
                    ) : (<p className="text-gray-500">No classes scheduled for this day.</p>)}
                </div>
            </div>
            {isModalOpen && <CreateClassModal date={selectedDate.toISOString().split('T')[0]} onClose={() => setIsModalOpen(false)} onClassCreated={handleClassCreated} />}
        </div>
    );
};

const ProfessorClassView = ({ classInfo }) => {
    const [questions, setQuestions] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchQuestions = async () => {
            try { setQuestions(await apiService.getQuestions(classInfo._id)); } 
            catch (error) { console.error("Failed to fetch questions:", error); }
        };
        fetchQuestions();
    }, [classInfo._id]);

    const updateQuestionStatus = async (questionId, newStatus) => {
        try {
            await apiService.updateQuestionStatus(classInfo._id, questionId, newStatus);
            setQuestions(questions.map(q => q._id === questionId ? { ...q, status: newStatus } : q));
        } catch (error) { console.error("Failed to update status:", error); }
    };

    const deleteQuestion = async(questionId) => {
        try {
            await apiService.deleteQuestion(classInfo._id, questionId);
            setQuestions(questions.filter(q => q._id !== questionId));
        } catch (error) { console.error("Failed to delete question:", error); }
    }

    const filteredQuestions = questions.filter(q => filter === 'all' || q.status === filter);
    
    const getStatusStyling = (status) => {
        switch (status) {
            case 'answered': return 'bg-green-100';
            case 'important': return 'bg-yellow-100';
            default: return 'bg-blue-100';
        }
    };
    
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
                    <div key={q._id} className={`p-4 rounded-lg shadow ${getStatusStyling(q.status)}`}>
                        <p className="mb-4 text-gray-800">{q.text}</p>
                        <div className="text-xs text-gray-500 mb-3">{new Date(q.timestamp).toLocaleString()}</div>
                        <div className="flex flex-wrap gap-2">
                             <button onClick={() => updateQuestionStatus(q._id, 'answered')} className="px-2 py-1 text-xs bg-green-500 text-white rounded">Answered</button>
                             <button onClick={() => updateQuestionStatus(q._id, 'important')} className="px-2 py-1 text-xs bg-yellow-500 text-white rounded">Important</button>
                             <button onClick={() => updateQuestionStatus(q._id, 'unanswered')} className="px-2 py-1 text-xs bg-blue-500 text-white rounded">Unanswered</button>
                             <button onClick={() => deleteQuestion(q._id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StudentClassView = ({ classInfo }) => {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchQuestions = async () => {
            try { setQuestions(await apiService.getQuestions(classInfo._id)); }
            catch (error) { console.error("Failed to fetch questions:", error); }
        };
        fetchQuestions();
    }, [classInfo._id]);

    const handleAskQuestion = async (e) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;
        try {
            // BUG FIX: Pass the correct student ID and class ID
            const questionData = { text: newQuestion, studentId: user.id };
            const createdQuestion = await apiService.postQuestion(classInfo._id, questionData);
            setQuestions(prevQuestions => [createdQuestion, ...prevQuestions]);
            setNewQuestion('');
        } catch (error) { console.error("Failed to post question:", error); }
    };
    
    const getStatusStyling = (status) => {
        switch (status) {
            case 'answered': return { card: 'bg-green-100', badge: 'bg-green-200 text-green-800' };
            case 'important': return { card: 'bg-yellow-100', badge: 'bg-yellow-200 text-yellow-800' };
            default: return { card: 'bg-blue-100', badge: 'bg-blue-200 text-blue-800' };
        }
    };

    return (
        <div>
            <form onSubmit={handleAskQuestion} className="mb-6 flex gap-2">
                <input type="text" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="Ask a question..." className="flex-grow px-4 py-2 border rounded-md"/>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md">Ask</button>
            </form>
            <h3 className="text-xl font-semibold mb-4">Questions Board</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {questions.length === 0 && <p className="text-gray-500 col-span-full">No questions yet. Be the first to ask!</p>}
                {questions.map(q => {
                    const statusStyle = getStatusStyling(q.status);
                    const statusText = q.status.charAt(0).toUpperCase() + q.status.slice(1);
                    return (
                        <div key={q._id} className={`p-4 rounded-lg shadow ${statusStyle.card}`}>
                           <div className="flex justify-between items-start mb-2">
                               <p className="text-gray-800 break-words w-4/5">{q.text}</p>
                               <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyle.badge}`}>{statusText}</span>
                           </div>
                           <div className="text-xs text-gray-500 mt-2">{new Date(q.timestamp).toLocaleString()}</div>
                        </div>
                    );
                })}
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
                {user.role === 'professor' ? <ProfessorClassView classInfo={classInfo} /> : <StudentClassView classInfo={classInfo} />}
            </div>
        </div>
    );
};

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedClass, setSelectedClass] = useState(null);

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