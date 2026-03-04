

import React, { useState, useEffect, useCallback } from 'react';
import type { User, Exam, 

} from '../../../types';
import { api } from '../../../data_supabase';
import { Button } from '../../components/Button';

import { StudentEditorModal } from './StudentEditorModal';
import { StudentResultsModal } from './StudentResultsModal';
import { ExamEditorModal } from './ExamEditorModal';


interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}



export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
    const [view, setView] = useState<'exams' | 'students'>('exams');
    const [exams, setExams] = useState<Exam[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<User | null>(null);
    const [isStudentResultsModalOpen, setIsStudentResultsModalOpen] = useState(false);
    const [viewingStudentResults, setViewingStudentResults] = useState<User | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [examsData, studentsData] = await Promise.all([api.getAllExams(), api.getAllStudents()]);
        setExams(examsData);
        setStudents(studentsData.filter(s => s.role === 'student'));
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenExamModal = (exam: Exam | null = null) => {
        setEditingExam(exam);
        setIsExamModalOpen(true);
    };

    const handleOpenStudentModal = (student: User | null = null) => {
        setEditingStudent(student);
        setIsStudentModalOpen(true);
    };

    const handleViewStudentResults = (student: User) => {
        setViewingStudentResults(student);
        setIsStudentResultsModalOpen(true);
    };
    
    const handleCloseModals = () => {
        setIsExamModalOpen(false);
        setEditingExam(null);
        setIsStudentModalOpen(false);
        setEditingStudent(null);
        setIsStudentResultsModalOpen(false);
        setViewingStudentResults(null);
    }

    const handleSaveExam = async (examData: Exam) => {
        await api.saveExam(examData);
        await fetchData();
        handleCloseModals();
    };

    const handleDeleteExam = async (examId: number) => {
        await api.deleteExam(examId);
        await fetchData();
        handleCloseModals();
    };
    
    const handleSaveStudent = async (studentData: Omit<User, 'role'|'id'> | User) => {
        await api.saveStudent(studentData);
        await fetchData();
        handleCloseModals();
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Panel de administración</h1>
                    <div>
                        <span className="mr-4">Bienvenido/a, {user.firstName}</span>
                        <Button onClick={onLogout} variant="secondary">Salir</Button>
                    </div>
                </div>
            </header>
            
            {/* Navigation */}
            <nav className="bg-white dark:bg-gray-800/50 border-b dark:border-gray-700">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="flex space-x-4">
                        <button onClick={() => setView('exams')} className={`py-3 px-4 font-medium text-sm ${view === 'exams' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Examenes</button>
                        <button onClick={() => setView('students')} className={`py-3 px-4 font-medium text-sm ${view === 'students' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Estudiantes</button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? <p>Loading...</p> : (
                    <>
                    {view === 'exams' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold">Tablero de exámenes</h2>
                                <Button onClick={() => handleOpenExamModal()}>Crear exámen</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {exams.filter((dato)=> dato.isActivo).map(exam => (
                                    <div key={exam.id} onClick={() => handleOpenExamModal(exam)} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{exam.title}</h3>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${exam.isEnabled ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>{exam.isEnabled ? 'Activo' : 'Inactivo'}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{exam.class}</p>
                                        {/* aca tengo que corregir cdeorta */}
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{exam.dateTime.substring(0,16).replace("T"," ")}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{exam.questions.length} Preguntas</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{exam.allowedStudentIds.length} Estudiantes asignados</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {view === 'students' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold">Tablero de estudiantes</h2>
                                <Button onClick={() => handleOpenStudentModal()}>Crear estudiante</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {students.map(student => (
                                     <div key={student.id} onClick={() => handleViewStudentResults(student)} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all cursor-pointer">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{student.firstName} {student.lastName}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">@{student.username}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    </>
                )}
            </main>
            
            {/* Modals */}
            {isExamModalOpen && <ExamEditorModal exam={editingExam} allStudents={students} onClose={handleCloseModals} onSave={handleSaveExam} onDelete={handleDeleteExam} />}
            {isStudentModalOpen && <StudentEditorModal student={editingStudent} onClose={handleCloseModals} onSave={handleSaveStudent} />}
            {isStudentResultsModalOpen && viewingStudentResults && <StudentResultsModal student={viewingStudentResults} onClose={handleCloseModals} onEditStudent={handleOpenStudentModal} />}
        </div>
    );
};
