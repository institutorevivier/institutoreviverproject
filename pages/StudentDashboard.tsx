
import React, { useState, useEffect, useCallback } from 'react';
import type { User, Exam, Submission } from '../types';
import { api } from '../data';


interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

// Reusable Button Component
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: 'primary' | 'secondary' | 'danger'}> = ({ children, className, variant = 'primary', ...props }) => {
    const baseClasses = "px-4 py-2 rounded-md font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClasses = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };
    return <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>{children}</button>
}

// Reusable Modal Component
const Modal: React.FC<{ children: React.ReactNode, onClose: () => void, title: string }> = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg transform transition-all" role="dialog">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

interface TakeExamViewProps {
    exam: Exam;
    studentId: string;
    onBack: () => void;
    onSubmit: (submission: Omit<Submission, 'id'|'score'|'submittedAt'>) => Promise<void>;
}

const TakeExamView: React.FC<TakeExamViewProps> = ({ exam, studentId, onBack, onSubmit }) => {
    const [answers, setAnswers] = useState<number[]>(Array(exam.questions.length).fill(-1));
    const [loading, setLoading] = useState(false);

    const handleAnswerChange = (qIndex: number, oIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[qIndex] = oIndex;
        setAnswers(newAnswers);
    };

    const allQuestionsAnswered = answers.every(ans => ans !== -1);

    const handleSubmit = async () => {
        if (!allQuestionsAnswered) return;
        setLoading(true);
        await onSubmit({ studentId, examId: exam.id, answers });
        setLoading(false);
    };
    
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <Button onClick={onBack} variant="secondary" className="mb-6"> &larr; Back to Dashboard</Button>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold">{exam.title}</h1>
                <p className="text-gray-500 dark:text-gray-400">{exam.class}</p>
                <p className="mt-4 text-gray-700 dark:text-gray-300">{exam.description}</p>
                <div className="border-t my-6 dark:border-gray-700"></div>
                <div className="space-y-8">
                    {exam.questions.map((q, qIndex) => (
                        <div key={q.id}>
                            <p className="font-semibold text-lg">{qIndex + 1}. {q.text}</p>
                            <div className="mt-4 space-y-3">
                                {q.options.map((opt, oIndex) => (
                                    <label key={oIndex} className="flex items-center p-3 rounded-lg border dark:border-gray-700 has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/50 has-[:checked]:border-indigo-500 cursor-pointer transition-all">
                                        <input type="radio" name={`q_${qIndex}`} value={oIndex} checked={answers[qIndex] === oIndex} onChange={() => handleAnswerChange(qIndex, oIndex)} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                                        <span className="ml-3 text-gray-800 dark:text-gray-200">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t dark:border-gray-700 flex justify-end">
                    <Button onClick={handleSubmit} disabled={!allQuestionsAnswered || loading}>
                        {loading ? 'Submitting...' : 'Submit Exam'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [takingExam, setTakingExam] = useState<Exam | null>(null);
    const [infoModalContent, setInfoModalContent] = useState<{title: string, message: string} | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [examData, submissionData] = await Promise.all([
            api.getExamsForStudent(user.id),
            api.getSubmissionsForStudent(user.id)
        ]);
        setExams(examData);
        setSubmissions(submissionData);
        setLoading(false);
    }, [user.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleExamClick = (exam: Exam) => {
        const submission = submissions.find(s => s.examId === exam.id);
        if (submission) {
            setInfoModalContent({
                title: 'Result for ' + exam.title,
                message: `You have already completed this exam. Your score was ${submission.score.toFixed(2)}%.`
            });
            return;
        }

        if (!exam.isEnabled) {
             setInfoModalContent({
                title: 'Exam Not Available',
                message: `This exam is not currently enabled. It is scheduled for ${new Date(exam.dateTime).toLocaleString()}.`
            });
            return;
        }

        setTakingExam(exam);
    };

    const handleExamSubmit = async (submissionData: Omit<Submission, 'id'|'score'|'submittedAt'>) => {
        await api.submitExam(submissionData);
        setTakingExam(null);
        await fetchData();
        // Show score after submission
        const newSubmissions = await api.getSubmissionsForStudent(user.id);
        const newSubmission = newSubmissions.find(s => s.examId === submissionData.examId);
        if (newSubmission) {
             setInfoModalContent({
                title: 'Exam Submitted!',
                message: `Your score is ${newSubmission.score.toFixed(2)}%.`
            });
        }
    };

    if (takingExam) {
        return (
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
             <TakeExamView exam={takingExam} studentId={user.id} onBack={() => setTakingExam(null)} onSubmit={handleExamSubmit} />
          </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
             {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Panel de estudiante</h1>
                    <div>
                        <span className="mr-4">Bienvenido/a, {user.firstName}</span>
                        <Button onClick={onLogout} variant="secondary">Salir</Button>
                    </div>
                </div>
            </header>
            
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-3xl font-semibold mb-6">Examenes asignados</h2>
                {loading ? <p>Cargando Examenes...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exams.length > 0 ? exams.map(exam => {
                            const submission = submissions.find(s => s.examId === exam.id);
                            let status: 'Taken' | 'Available' | 'Scheduled' = 'Scheduled';
                            let bgColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
                            
                            if (submission) {
                                status = 'Taken';
                                bgColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
                            } else if (exam.isEnabled) {
                                status = 'Available';
                                bgColor = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
                            }
                            
                            return (
                                <div key={exam.id} onClick={() => handleExamClick(exam)} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{exam.title}</h3>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bgColor}`}>{status}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{exam.class}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{new Date(exam.dateTime).toLocaleString()}</p>
                                    {submission && <p className="mt-4 font-bold text-lg text-indigo-600 dark:text-indigo-400">Score: {submission.score.toFixed(2)}%</p>}
                                </div>
                            );
                        }) : <p>No tenes aun examenes asignados</p>}
                    </div>
                )}
            </main>
            
            {/* Info Modal */}
            {infoModalContent && (
                <Modal onClose={() => setInfoModalContent(null)} title={infoModalContent.title}>
                    <p className="text-gray-700 dark:text-gray-300">{infoModalContent.message}</p>
                    <div className="flex justify-end mt-6">
                        <Button onClick={() => setInfoModalContent(null)}>Close</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};
