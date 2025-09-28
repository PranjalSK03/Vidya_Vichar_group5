import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import '../styles/index.css';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Global background accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-200/60 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -right-28 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tl from-purple-200/60 to-transparent blur-3xl" />
        {/* <div className="absolute bottom-[-8rem] left-1/2 -translate-x-1/2 h-[26rem] w-[26rem] rounded-full bg-gradient-to-tr from-indigo-100/70 to-transparent blur-3xl" /> */}
      </div>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200 overflow-x-clip">
  <div className="w-screen max-w-none pr-3 sm:pr-5 md:pr-6 lg:pr-8 pl-6 sm:pl-8 md:pl-10 lg:pl-12 xl:pl-16 h-16 flex items-center justify-between">
          {/* Brand/logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white grid place-items-center shadow-sm">
              <span className="text-sm font-bold">VV</span>
            </div>
            <div className="leading-tight">
              <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Vidya Vichar</div>
              <div className="hidden sm:block text-[13px] text-slate-500">Learn. Ask. Grow.</div>
            </div>
          </div>

          {/* Nav actions (keep links the same) */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/student/login"
              className="inline-flex items-center rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition duration-200 hover:text-indigo-700 hover:bg-indigo-50 hover:shadow-sm ring-1 ring-transparent hover:ring-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              Student Login
            </Link>
            <Link
              to="/teacher/login"
              className="inline-flex items-center rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition duration-200 hover:text-indigo-700 hover:bg-indigo-50 hover:shadow-sm ring-1 ring-transparent hover:ring-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              Teacher Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content fills remaining viewport */}
      <main className="flex-1">
        {/* Hero section with reduced height and padding */}
  <section className="relative overflow-hidden min-h-[40vh] flex items-center">
          <div className="w-screen max-w-none px-2 sm:px-3 md:px-4 py-2 sm:py-4 lg:py-6">
            <div className="flex justify-center">
              <div className="text-center max-w-5xl px-2">
                <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900">
                  Welcome to <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Vidya Vichar</span>
                </h1>
                <p className="mt-3 text-lg text-slate-600 max-w-3xl mx-auto">
                  A platform connecting students and teachers for effective, doubt-driven learning. Join classes, ask questions, and share resources in one place.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/student/register"
                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-white text-sm font-semibold shadow hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                  >
                    Join as Student
                  </Link>
                  <Link
                    to="/teacher/register"
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-indigo-700 text-sm font-semibold shadow border border-indigo-200 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                  >
                    Join as Teacher
                  </Link>
                </div>


              </div>
            </div>
          </div>
        </section>

        {/* Features with reduced vertical spacing */}
        <section className="py-4">
          <div className="w-screen max-w-none px-2 sm:px-3 md:px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">Why Choose Vidya Vichar?</h2>
            <p className="mt-2 text-slate-600 text-center max-w-3xl mx-auto px-2">
              Practical tools for both students and teachers to keep learning focused and engaging.
            </p>

            <div className="mt-6 flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full px-2">
                <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6 text-center">
                  <div className="text-3xl mb-3">🎓</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">For Students</h3>
                  <ul className="space-y-2 text-slate-600 text-sm text-center list-none">
                    <li>Ask questions and get timely answers</li>
                    <li>Join classes and structured discussions</li>
                    <li>Access curated learning resources</li>
                    <li>Stay organized with class timelines</li>
                  </ul>
                </div>

                <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6 text-center">
                  <div className="text-3xl mb-3">👩‍🏫</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">For Teachers</h3>
                  <ul className="space-y-2 text-slate-600 text-sm text-center list-none">
                    <li>Create and manage classes</li>
                    <li>Address student doubts efficiently</li>
                    <li>Share slides, links, and documents</li>
                    <li>Track learning progress</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <p className="text-sm text-slate-500">© 2025 Vidya Vichar. All rights reserved.</p>
          <div className="text-xs text-slate-400">Made for better learning.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;// hmr
// hmr2
