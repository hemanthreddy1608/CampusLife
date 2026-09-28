import React, { useState, useEffect } from 'react';
import { UserProfile, AptitudeQuestion } from '../types';
import { mockQuestionsData, subjectQuestionsBank, paperAnalysisData } from '../ai-data';
import { useTheme } from '../ThemeContext';
import {
  BrainCircuit,
  Sparkles,
  FileQuestion,
  TrendingUp,
  Timer,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  BookOpen,
  Layers,
  ArrowRight,
  BarChart3,
  BookmarkCheck,
  Compass,
  AlertCircle
} from 'lucide-react';

interface Props {
  user: UserProfile;
}

export default function AIAssistantSection({ user }: Props) {
  const { isDark } = useTheme();

  // Mode: 'important-questions' | 'paper-analysis' | 'aptitude' | 'mock-test'
  const [subTab, setSubTab] = useState<'important-questions' | 'paper-analysis' | 'aptitude' | 'mock-test'>('mock-test');

  // Important Questions State
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('CS301');

  // Aptitude Category
  const [selectedAptCategory, setSelectedAptCategory] = useState<'Quantitative Aptitude' | 'Logical Reasoning' | 'Verbal Ability'>('Quantitative Aptitude');
  const [showExplanationId, setShowExplanationId] = useState<string | null>(null);

  // Mock Test State (21 Questions minimum requirement!)
  const [testActive, setTestActive] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes countdown

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (testActive && !testFinished && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTestFinished(true);
            setTestActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testActive, testFinished, timeLeft]);

  // Start test
  const handleStartTest = () => {
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setTimeLeft(1200);
    setTestFinished(false);
    setTestActive(true);
  };

  // Submit test
  const handleSubmitTest = () => {
    setTestActive(false);
    setTestFinished(true);
  };

  // Calculate score
  const totalQuestions = mockQuestionsData.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  let correctCount = 0;
  if (testFinished) {
    mockQuestionsData.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });
  }
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Institutional Executive styling */}
      <div className={`p-6 border transition-all ${
        isDark 
          ? 'bg-slate-900/90 border-slate-800 text-white' 
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 border ${
                isDark ? 'bg-blue-950/60 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800 font-bold'
              }`}>
                Institutional Academic Center
              </span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>•</span>
              <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Cognitive Study & Exam Preparation Engine
              </span>
            </div>
            <h2 className={`text-2xl font-bold font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Academic Evaluation & AI Study Assistant
            </h2>
            <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Synthesize vetted syllabus questions, analyze historical exam recurrence patterns, complete rigorous 20+ question timed mock examinations, and practice competitive aptitude benchmarks.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className={`flex flex-wrap gap-1 p-1 border text-xs self-start md:self-auto ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setSubTab('mock-test')}
              className={`px-3 py-2 font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                subTab === 'mock-test'
                  ? (isDark ? 'bg-blue-700 text-white shadow-sm' : 'bg-blue-900 text-white shadow-sm')
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Mock Exam (21 Qs)</span>
            </button>

            <button
              onClick={() => setSubTab('important-questions')}
              className={`px-3 py-2 font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                subTab === 'important-questions'
                  ? (isDark ? 'bg-blue-700 text-white shadow-sm' : 'bg-blue-900 text-white shadow-sm')
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Core Syllabus Qs</span>
            </button>

            <button
              onClick={() => setSubTab('paper-analysis')}
              className={`px-3 py-2 font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                subTab === 'paper-analysis'
                  ? (isDark ? 'bg-blue-700 text-white shadow-sm' : 'bg-blue-900 text-white shadow-sm')
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Paper Trend Analysis</span>
            </button>

            <button
              onClick={() => setSubTab('aptitude')}
              className={`px-3 py-2 font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                subTab === 'aptitude'
                  ? (isDark ? 'bg-blue-700 text-white shadow-sm' : 'bg-blue-900 text-white shadow-sm')
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Aptitude Practice</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. MOCK TEST MODULE */}
      {subTab === 'mock-test' && (
        <div className="space-y-6">
          {!testActive && !testFinished && (
            <div className={`p-8 border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <div className={`w-14 h-14 mx-auto border flex items-center justify-center ${
                  isDark ? 'bg-blue-950/60 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  <Timer className="w-7 h-7" />
                </div>
                <h3 className={`text-xl font-bold font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Comprehensive Academic & Aptitude Mock Examination
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Designed to simulate standardized institutional examinations and campus recruitment aptitude assessments.
                  Strict automatic countdown timer, real-time question palette tracking, and rigorous performance breakdown.
                </p>

                {/* Exam specifications table */}
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 text-left p-4 border my-4 ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className={`text-[10px] font-mono uppercase block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Questions</span>
                    <span className={`text-sm font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>21 Questions</span>
                  </div>
                  <div>
                    <span className={`text-[10px] font-mono uppercase block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Duration</span>
                    <span className={`text-sm font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>20:00 Minutes</span>
                  </div>
                  <div>
                    <span className={`text-[10px] font-mono uppercase block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Format</span>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Multiple Choice</span>
                  </div>
                  <div>
                    <span className={`text-[10px] font-mono uppercase block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Negative Mark</span>
                    <span className={`text-sm font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>None</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleStartTest}
                    className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md inline-flex items-center gap-2"
                  >
                    <span>Begin Timed Examination</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE TEST TERMINAL */}
          {testActive && !testFinished && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Question Screen */}
              <div className={`lg:col-span-3 border p-6 flex flex-col justify-between min-h-[480px] ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div>
                  {/* Test Header */}
                  <div className={`flex items-center justify-between pb-4 border-b mb-6 ${
                    isDark ? 'border-slate-800' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-mono uppercase border ${
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                      }`}>
                        Question {currentQIndex + 1} of {totalQuestions}
                      </span>
                      <span className={`text-xs px-2 py-0.5 border ${
                        isDark ? 'bg-blue-950/60 border-blue-900 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
                      }`}>
                        {mockQuestionsData[currentQIndex]?.category}
                      </span>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-1 border font-mono font-bold text-sm ${
                      timeLeft < 180 
                        ? (isDark ? 'bg-red-950/60 border-red-800 text-red-400 animate-pulse' : 'bg-red-50 border-red-300 text-red-800 animate-pulse') 
                        : (isDark ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-slate-100 border-slate-300 text-blue-900')
                    }`}>
                      <Timer className="w-4 h-4" />
                      <span>{formatTimer(timeLeft)}</span>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="space-y-4">
                    <h4 className={`text-base font-semibold leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {mockQuestionsData[currentQIndex]?.question}
                    </h4>

                    {/* Options list */}
                    <div className="space-y-2.5 pt-2">
                      {mockQuestionsData[currentQIndex]?.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[currentQIndex] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              setSelectedAnswers(prev => ({
                                ...prev,
                                [currentQIndex]: optIdx
                              }));
                            }}
                            className={`w-full text-left p-3.5 border transition cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? (isDark ? 'bg-blue-950/80 border-blue-600 text-white shadow-sm' : 'bg-blue-50 border-blue-700 text-blue-950 font-semibold shadow-sm')
                                : (isDark ? 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-400 hover:bg-slate-50')
                            }`}
                          >
                            <span className={`w-5 h-5 flex items-center justify-center text-xs font-mono border shrink-0 mt-0.5 ${
                              isSelected
                                ? (isDark ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-900 border-blue-900 text-white')
                                : (isDark ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600')
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="text-xs leading-relaxed">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className={`flex items-center justify-between pt-6 border-t mt-6 ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <button
                    onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQIndex === 0}
                    className={`px-3 py-1.5 text-xs font-semibold border flex items-center gap-1 transition ${
                      currentQIndex === 0
                        ? (isDark ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600' : 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400')
                        : (isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer' : 'border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer')
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedAnswers(prev => {
                          const copy = { ...prev };
                          delete copy[currentQIndex];
                          return copy;
                        });
                      }}
                      className={`text-xs hover:underline cursor-pointer ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                      Clear Selection
                    </button>

                    {currentQIndex < totalQuestions - 1 ? (
                      <button
                        onClick={() => setCurrentQIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                        className="px-4 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white transition cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitTest}
                        className="px-4 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <span>Finish & Submit</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Question Navigation Palette */}
              <div className={`border p-5 space-y-4 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div>
                  <h5 className={`text-xs font-bold font-serif uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Question Palette
                  </h5>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Click question number to navigate
                  </p>
                </div>

                {/* Status indicators */}
                <div className="flex items-center gap-4 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-blue-700 border border-blue-600 block"></span>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 block border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}></span>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Unanswered ({totalQuestions - answeredCount})</span>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-5 gap-2 pt-2">
                  {mockQuestionsData.map((_, idx) => {
                    const isAnswered = selectedAnswers[idx] !== undefined;
                    const isCurrent = currentQIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQIndex(idx)}
                        className={`h-9 text-xs font-mono font-bold transition cursor-pointer border flex items-center justify-center ${
                          isCurrent
                            ? (isDark ? 'ring-2 ring-blue-400 bg-blue-600 text-white' : 'ring-2 ring-blue-900 bg-blue-900 text-white')
                            : isAnswered
                            ? (isDark ? 'bg-blue-950/80 border-blue-700 text-blue-200' : 'bg-blue-100 border-blue-300 text-blue-950')
                            : (isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400')
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className={`pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <button
                    onClick={handleSubmitTest}
                    className="w-full py-2 text-xs font-bold uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white transition cursor-pointer shadow-sm"
                  >
                    Submit Complete Test
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TEST COMPLETED SUMMARY & SCORECARD */}
          {testFinished && (
            <div className={`p-8 border space-y-6 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="text-center max-w-xl mx-auto space-y-3">
                <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 border ${
                  scorePercentage >= 60
                    ? (isDark ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800')
                    : (isDark ? 'bg-amber-950/60 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800')
                }`}>
                  Official Test Results
                </span>
                <h3 className={`text-2xl font-bold font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Examination Performance Summary
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Institutional evaluation report for candidate {user.name} ({user.studentId || user.email})
                </p>

                {/* Score Big Indicator */}
                <div className={`p-6 border inline-block min-w-[240px] my-3 ${
                  isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-4xl font-mono font-bold ${
                    scorePercentage >= 75 ? 'text-emerald-500' : scorePercentage >= 50 ? 'text-blue-500' : 'text-amber-500'
                  }`}>
                    {scorePercentage}%
                  </div>
                  <div className={`text-xs font-mono mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {correctCount} Correct / {totalQuestions} Questions
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleStartTest}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-blue-700 hover:bg-blue-800 text-white transition cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Mock Exam</span>
                  </button>
                  <button
                    onClick={() => {
                      setTestFinished(false);
                      setTestActive(false);
                    }}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition cursor-pointer ${
                      isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Exit to Dashboard
                  </button>
                </div>
              </div>

              {/* Detailed Question Review List */}
              <div className={`space-y-4 pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <h4 className={`text-sm font-bold font-serif uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Comprehensive Question Breakdown & Solutions
                </h4>

                <div className="space-y-3">
                  {mockQuestionsData.map((q, idx) => {
                    const candidateAnswer = selectedAnswers[idx];
                    const isCorrect = candidateAnswer === q.correctIndex;
                    const isSkipped = candidateAnswer === undefined;

                    return (
                      <div
                        key={idx}
                        className={`p-4 border text-xs space-y-2 ${
                          isCorrect
                            ? (isDark ? 'bg-emerald-950/20 border-emerald-900/60' : 'bg-emerald-50/50 border-emerald-200')
                            : isSkipped
                            ? (isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200')
                            : (isDark ? 'bg-red-950/20 border-red-900/60' : 'bg-red-50/50 border-red-200')
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">Q{idx + 1}.</span>
                            <span className={`px-2 py-0.5 text-[10px] font-mono border ${
                              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                            }`}>
                              {q.category}
                            </span>
                          </div>

                          <div>
                            {isCorrect && (
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                                isDark ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                              }`}>
                                Correct (+1)
                              </span>
                            )}
                            {!isCorrect && !isSkipped && (
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                                isDark ? 'bg-red-950/60 border-red-800 text-red-300' : 'bg-red-100 border-red-300 text-red-800'
                              }`}>
                                Incorrect
                              </span>
                            )}
                            {isSkipped && (
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                                isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
                              }`}>
                                Skipped
                              </span>
                            )}
                          </div>
                        </div>

                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{q.question}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = candidateAnswer === oIdx;
                            const isRealAnswer = q.correctIndex === oIdx;

                            return (
                              <div
                                key={oIdx}
                                className={`p-2 border text-[11px] flex items-center justify-between ${
                                  isRealAnswer
                                    ? (isDark ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200 font-bold' : 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold')
                                    : isSelected
                                    ? (isDark ? 'bg-red-950/60 border-red-700 text-red-200' : 'bg-red-100 border-red-300 text-red-900')
                                    : (isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600')
                                }`}
                              >
                                <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                                {isRealAnswer && <span className="text-[10px] uppercase tracking-wider font-mono">Correct Key</span>}
                                {isSelected && !isRealAnswer && <span className="text-[10px] uppercase tracking-wider font-mono">Your Pick</span>}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className={`p-2.5 border mt-2 text-[11px] ${
                            isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                          }`}>
                            <span className="font-bold font-mono uppercase text-blue-500 mr-2">Institutional Solution:</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. IMPORTANT QUESTIONS BY SUBJECT & SYLLABUS */}
      {subTab === 'important-questions' && (
        <div className="space-y-6">
          {/* Subject Selector Bar */}
          <div className={`p-4 border ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className={`text-sm font-bold font-serif uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Subject Syllabus Question Bank
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Filter core high-weightage questions formulated from verified academic syllabi
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Course:</span>
                <select
                  value={selectedSubjectCode}
                  onChange={e => setSelectedSubjectCode(e.target.value)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold border transition ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="CS301">CS301 - Data Structures & Algorithms</option>
                  <option value="CS302">CS302 - Database Management Systems</option>
                  <option value="CS303">CS303 - Operating Systems</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions List grouped by topic */}
          <div className="space-y-4">
            {subjectQuestionsBank[selectedSubjectCode] ? (
              subjectQuestionsBank[selectedSubjectCode].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-5 border transition ${
                    isDark ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-[10px] font-mono uppercase border ${
                      isDark ? 'bg-blue-950/60 border-blue-900 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800 font-bold'
                    }`}>
                      Unit / Topic Area: {item.topic}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                      isDark ? 'bg-amber-950/60 border-amber-900 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      {item.questions.length} Core Questions
                    </span>
                  </div>

                  <div className="space-y-3">
                    {item.questions.map((qText, qIdx) => (
                      <div
                        key={qIdx}
                        className={`p-3 border text-xs leading-relaxed flex items-start gap-2.5 ${
                          isDark ? 'bg-slate-950/60 border-slate-800/80 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className="font-mono font-bold text-blue-500 shrink-0">#{qIdx + 1}</span>
                        <p className="font-medium">{qText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className={`p-8 text-center border ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
              }`}>
                No questions populated for course code {selectedSubjectCode}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. PREVIOUS PAPER TREND ANALYSIS */}
      {subTab === 'paper-analysis' && (
        <div className="space-y-6">
          <div className={`p-6 border ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div>
                <h3 className={`text-base font-bold font-serif uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Historical Examination Recurrence Matrix
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Synthesized statistical frequency analysis of 5 past examination cycles (2020-2025)
                </p>
              </div>

              <span className={`text-[10px] font-mono uppercase px-2.5 py-1 border self-start md:self-auto ${
                isDark ? 'bg-blue-950/60 border-blue-900 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800 font-bold'
              }`}>
                Empirical Evaluation Model
              </span>
            </div>

            {/* Recurrence cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {paperAnalysisData.map((data, idx) => (
                <div
                  key={idx}
                  className={`p-4 border space-y-3 ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-500">Subject Analysis</span>
                    <span className={`text-[10px] font-mono border px-2 py-0.5 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                    }`}>
                      Frequency: {data.frequencyScore}
                    </span>
                  </div>

                  <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{data.subject}</h4>

                  <div className="space-y-2 pt-1">
                    <span className={`text-[10px] font-mono uppercase block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Top Repeated Examination Topics:
                    </span>
                    {data.topRepeatedTopics.map((topicItem, tIdx) => (
                      <div key={tIdx} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{topicItem.topic}</span>
                          <span className="font-mono font-bold text-blue-500">{topicItem.weight}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {topicItem.appearanceCount}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`p-2.5 border text-[11px] leading-relaxed mt-2 ${
                    isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                    <span className="font-bold text-slate-300">Exam Preparation Note: </span>
                    {data.examTip}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. APTITUDE PRACTICE BY CATEGORY */}
      {subTab === 'aptitude' && (
        <div className="space-y-6">
          {/* Category Tabs */}
          <div className={`p-4 border ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className={`text-sm font-bold font-serif uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Targeted Aptitude Practice Modules
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Self-paced skill drills across critical competitive aptitude domains
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {(['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedAptCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-semibold border transition cursor-pointer ${
                      selectedAptCategory === cat
                        ? (isDark ? 'bg-blue-700 border-blue-600 text-white font-bold' : 'bg-blue-900 border-blue-900 text-white font-bold')
                        : (isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200')
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filtered questions list */}
          <div className="space-y-4">
            {mockQuestionsData
              .filter(q => q.category === selectedAptCategory)
              .map((q, qIdx) => {
                const isExpanded = showExplanationId === q.id;

                return (
                  <div
                    key={q.id}
                    className={`p-5 border transition ${
                      isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-500">Practice Item #{qIdx + 1}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-mono border ${
                            isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}>
                            {q.category}
                          </span>
                        </div>
                        <h4 className={`text-sm font-semibold pt-1 leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {q.question}
                        </h4>
                      </div>

                      <button
                        onClick={() => setShowExplanationId(isExpanded ? null : q.id)}
                        className={`px-3 py-1.5 text-xs font-mono font-bold border transition cursor-pointer shrink-0 ${
                          isExpanded
                            ? (isDark ? 'bg-blue-950/60 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-300 text-blue-900')
                            : (isDark ? 'border-slate-700 text-slate-400 hover:text-white' : 'border-slate-300 text-slate-600 hover:text-slate-900')
                        }`}
                      >
                        {isExpanded ? 'Hide Solution' : 'View Solution'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2.5 border text-xs flex items-center gap-2.5 ${
                            isExpanded && q.correctIndex === oIdx
                              ? (isDark ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200 font-bold' : 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold')
                              : (isDark ? 'bg-slate-950/50 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                          }`}
                        >
                          <span className={`w-5 h-5 flex items-center justify-center text-[11px] font-mono border shrink-0 ${
                            isExpanded && q.correctIndex === oIdx
                              ? (isDark ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-emerald-700 text-white border-emerald-700')
                              : (isDark ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-300 text-slate-600')
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>

                    {isExpanded && (
                      <div className={`p-4 border mt-3 text-xs leading-relaxed ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-blue-50/50 border-blue-200 text-slate-800'
                      }`}>
                        <div className="font-bold font-mono uppercase text-blue-500 mb-1">
                          Correct Answer: Option {String.fromCharCode(65 + q.correctIndex)} ({q.options[q.correctIndex]})
                        </div>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
