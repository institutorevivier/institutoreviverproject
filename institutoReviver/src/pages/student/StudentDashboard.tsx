

import React, { useState, useEffect, useCallback } from 'react';
import type { User, Exam, Submission } from '../../../types';
import { api } from '../../../data_supabase';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { TakeExamView } from './TakeExamView';


interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}



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
                title: 'El resultado del examen ' + exam.title,
                message: `Ya terminaste el examan. Tu resultado es ${submission.score.toFixed(2)}%.`
            });
            return;
        }

        if (!exam.isEnabled) {
             setInfoModalContent({
                title: 'El examen esta inhabilitado',
                message: `Este examen esta inhabilitado. El mismo estara disponible el ${new Date(exam.dateTime).toLocaleString()}.`
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
                title: '¡Examen Teminado!',
                message: `Tu resultado es ${newSubmission.score.toFixed(2)}%.`
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
                        {exams.filter((dato)=> dato.isActivo).length > 0 ? exams.filter((dato)=> dato.isActivo).map(exam => {
                            const submission = submissions.find(s => s.examId === exam.id);
                            let status: 'Listo' | 'Disponible' | 'Programado' = 'Programado';
                            let bgColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
                            
                            if (submission) {
                                status = 'Listo';
                                bgColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
                            } else if (exam.isEnabled) {
                                status = 'Disponible';
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
                                    {submission && <p className="mt-4 font-bold text-lg text-indigo-600 dark:text-indigo-400">Resultado: {submission.score.toFixed(2)}%</p>}
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
