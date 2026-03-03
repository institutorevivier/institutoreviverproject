

import React, { useState, useEffect, useCallback } from 'react';
import type { User, Exam, Question, Submission } from '../../types';
import { api } from '../../data_supabase';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

// Props for the main dashboard component
interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

// Props for the Exam Editor Modal
interface ExamEditorModalProps {
  exam: Exam | null; // null for creating, Exam object for editing
  allStudents: User[];
  onClose: () => void;
  onSave: (examData: Exam) => Promise<void>;
  onDelete: (examId: number) => Promise<void>;
}

// Props for the Student Editor Modal
interface StudentEditorModalProps {
    student: User | null;
    onClose: () => void;
    onSave: (studentData: Omit<User, 'role' | 'id'> | User) => Promise<void>;
}

// Props for the Student Results Modal
interface StudentResultsModalProps {
    student: User;
    onClose: () => void;
    onEditStudent: (student: User) => void;
}

// Reusable Button Component
// const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: 'primary' | 'secondary' | 'danger'}> = ({ children, className, variant = 'primary', ...props }) => {
//     const baseClasses = "px-4 py-2 rounded-md font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed";
//     const variantClasses = {
//         primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
//         secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500',
//         danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
//     };
//     return <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>{children}</button>
// }

// Reusable Input Component
// const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
//     <input className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`} {...props} />
// );

// Reusable Textarea Component
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
    <textarea rows={3} className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`} {...props} />
);

// Reusable Label Component
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, children, ...props }) => (
    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`} {...props}>{children}</label>
);

// Reusable Modal Component
const Modal: React.FC<{ children: React.ReactNode, onClose: () => void, title: string }> = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl transform transition-all" role="dialog">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
            </div>
            <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
        </div>
    </div>
);


const StudentEditorModal: React.FC<StudentEditorModalProps> = ({ student, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        firstName: student?.firstName || '',
        lastName: student?.lastName || '',
        username: student?.username || '',
        password:  student?.password || '',
        age: student?.age || undefined,
        documentNumber: student?.documentNumber || '',
        phone: student?.phone || '',
        address: student?.address || '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'age' ? (value ? parseInt(value) : undefined) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const dataToSave = student ? { ...student, ...formData } : { ...formData, role: 'student' as const, id: '' };
        await onSave(dataToSave);
        setLoading(false);
    };

    return (
        <Modal onClose={onClose} title={student ? 'Editar Estudiante' : 'Crear Estudiante'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="firstName">Nombre *</Label><Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required /></div>
                    <div><Label htmlFor="lastName">Apellido *</Label><Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required /></div>
                    <div><Label htmlFor="username">Nombre de usuario *</Label><Input id="username" name="username" value={formData.username} onChange={handleChange} required /></div>
                    <div><Label htmlFor="password">Contraseña {student ? '(mantenga en blanco para mantener actual)' : '*'}</Label><Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required={!student} /></div>
                    <div><Label htmlFor="age">Edad</Label><Input id="age" name="age" type="number" value={formData.age || ''} onChange={handleChange} /></div>
                    <div><Label htmlFor="documentNumber">Numero de documento</Label><Input id="documentNumber" name="documentNumber" value={formData.documentNumber} onChange={handleChange} /></div>
                    <div><Label htmlFor="phone">Telefono</Label><Input id="phone" name="phone" value={formData.phone} onChange={handleChange} /></div>
                    <div><Label htmlFor="address">Direccion</Label><Input id="address" name="address" value={formData.address} onChange={handleChange} /></div>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
                </div>
            </form>
        </Modal>
    );
};

const StudentResultsModal: React.FC<StudentResultsModalProps> = ({ student, onClose, onEditStudent }) => {
    const [assignedExams, setAssignedExams] = useState<Exam[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            setLoading(true);
            try {
                const [examsData, submissionsData] = await Promise.all([
                    api.getExamsAssignedToStudent(student.id),
                    api.getSubmissionsForStudent(student.id)
                ]);
                setAssignedExams(examsData);
                setSubmissions(submissionsData);
            } catch (error) {
                console.error('Error fetching student data:', error);
            }
            setLoading(false);
        };
        fetchStudentData();
    }, [student.id]);

    const handleEditStudent = () => {
        onClose();
        onEditStudent(student);
    };

    const getSubmissionForExam = (examId: number) => {
        return submissions.find(s => s.examId === examId);
    };

    const getStudentAnswerText = (exam: Exam, submission: Submission, questionIndex: number) => {
        if (!submission || questionIndex >= submission.answers.length) return 'No respondió';
        const answerIndex = submission.answers[questionIndex];
        return exam.questions[questionIndex]?.options[answerIndex] || 'Respuesta inválida';
    };

    const isAnswerCorrect = (exam: Exam, submission: Submission, questionIndex: number) => {
        if (!submission || questionIndex >= submission.answers.length) return null;
        const answerIndex = submission.answers[questionIndex];
        return exam.questions[questionIndex]?.correctAnswerIndex === answerIndex;
    };

    if (loading) {
        return (
            <Modal onClose={onClose} title={`Resultados de ${student.firstName} ${student.lastName}`}>
                <div className="text-center py-8">
                    <p>Cargando resultados...</p>
                </div>
            </Modal>
        );
    }

    if (assignedExams.length === 0) {
        return (
            <Modal onClose={onClose} title={`Resultados de ${student.firstName} ${student.lastName}`}>
                <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Este estudiante no tiene exámenes asignados.
                    </p>
                    <Button onClick={handleEditStudent} variant="primary">
                        Editar Estudiante
                    </Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal onClose={onClose} title={`Resultados de ${student.firstName} ${student.lastName}`}>
            <div className="space-y-6">
                {/* Header with Edit Button */}
                <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{student.username}</p>
                    </div>
                    <Button onClick={handleEditStudent} variant="primary">
                        Editar Estudiante
                    </Button>
                </div>

                {/* Student Information */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {student.age && <div><span className="font-medium">Edad:</span> {student.age}</div>}
                    {student.documentNumber && <div><span className="font-medium">Documento:</span> {student.documentNumber}</div>}
                    {student.phone && <div><span className="font-medium">Teléfono:</span> {student.phone}</div>}
                    {student.address && <div><span className="font-medium">Dirección:</span> {student.address}</div>}
                </div>

                {/* Exams Results */}
                <div className="space-y-6">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 border-b pb-2">
                        Exámenes Asignados ({assignedExams.length})
                    </h4>
                    
                    {assignedExams.map(exam => {
                        const submission = getSubmissionForExam(exam.id);
                        const hasSubmitted = !!submission;
                        
                        return (
                            <div key={exam.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h5 className="font-semibold text-lg text-gray-900 dark:text-white">
                                            {exam.title}
                                        </h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {exam.class && `${exam.class} • `}
                                            {new Date(exam.dateTime).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {hasSubmitted ? (
                                            <div>
                                                <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                                    Completado
                                                </span>
                                                <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                                                    {submission!.score.toFixed(1)}%
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                                                Pendiente
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Questions and Answers */}
                                <div className="space-y-3">
                                    <h6 className="font-medium text-gray-700 dark:text-gray-300">
                                        Preguntas ({exam.questions.length})
                                    </h6>
                                    
                                    {exam.questions.map((question, qIndex) => {
                                        if (!hasSubmitted) {
                                            return (
                                                <div key={question.id} className="pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="font-medium">{qIndex + 1}.</span> {question.text}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                        No respondido
                                                    </p>
                                                </div>
                                            );
                                        }

                                        const studentAnswer = submission!.answers[qIndex];
                                        const isCorrect = isAnswerCorrect(exam, submission!, qIndex);
                                        const answerText = getStudentAnswerText(exam, submission!, qIndex);
                                        const correctAnswer = question.options[question.correctAnswerIndex];

                                        return (
                                            <div key={question.id} className="pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium">{qIndex + 1}.</span> {question.text}
                                                </p>
                                                <div className="mt-2 space-y-1">
                                                    <div className={`text-sm p-2 rounded ${
                                                        isCorrect 
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700' 
                                                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'
                                                    }`}>
                                                        <span className="font-medium">Respuesta del estudiante:</span> {answerText}
                                                        {isCorrect ? ' ✅' : ' ❌'}
                                                    </div>
                                                    {!isCorrect && (
                                                        <div className="text-sm p-2 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                                                            <span className="font-medium">Respuesta correcta:</span> {correctAnswer}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {hasSubmitted && (
                                    <div className="mt-4 pt-3 border-t dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Fecha de entrega:</span> {new Date(submission!.submittedAt).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </Modal>
    );
};

const ExamEditorModal: React.FC<ExamEditorModalProps> = ({ exam, allStudents, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState<Exam>(exam || {
        id: 0, title: '', dateTime: '', questions: [], isEnabled: false, allowedStudentIds: [], class: '', description: '', isActivo: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormData(exam || {
            id: 0, title: '', dateTime: new Date().toISOString().substring(0, 16),
            questions: [], isEnabled: false, allowedStudentIds: [], class: '', description: '', isActivo: true
        });
    }, [exam]);

    const handleExamDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleStudentSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, allowedStudentIds: selectedIds }));
    };
    
    const handleQuestionChange = (qIndex: number, text: string) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].text = text;
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options[oIndex] = text;
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleCorrectAnswerChange = (qIndex: number, oIndex: number) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].correctAnswerIndex = oIndex;
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, { id: `q_${Date.now()}`, text: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]
        }));
    };

    const removeQuestion = (qIndex: number) => {
        setFormData(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== qIndex) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };
    
    const handleDelete = async () => {
        if(exam && window.confirm('¿Estas seguro que quires borrar el examen? esta acción no tiene vuelta atras')){
            setLoading(true);
            await onDelete(exam.id);
            setLoading(false);
        }
    }

    return (
        <Modal onClose={onClose} title={exam ? 'Editar Examen' : 'Crear Examen'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Exam Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="title">Titulo *</Label><Input id="title" name="title" value={formData.title} onChange={handleExamDetailsChange} required /></div>
                    <div><Label htmlFor="dateTime">Fecha y hora *</Label><Input id="dateTime" name="dateTime" type="datetime-local" value={formData.dateTime.substring(0,16)} onChange={handleExamDetailsChange} required /></div>
                    <div><Label htmlFor="class">Clase (Opcional)</Label><Input id="class" name="class" value={formData.class} onChange={handleExamDetailsChange} /></div>
                    <div><Label htmlFor="description">Descripción (Opcional)</Label><Textarea id="description" name="description" value={formData.description} onChange={handleExamDetailsChange} /></div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Preguntas</h4>
                    {formData.questions.map((q, qIndex) => (
                        <div key={q.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 space-y-3">
                            <div className="flex justify-between items-center">
                                <Label htmlFor={`q_text_${qIndex}`}>Pregunta {qIndex + 1}</Label>
                                <Button type="button" variant="danger" onClick={() => removeQuestion(qIndex)}>&times;</Button>
                            </div>
                            <Textarea id={`q_text_${qIndex}`} value={q.text} onChange={(e) => handleQuestionChange(qIndex, e.target.value)} placeholder="Enter question text" required />
                            <div className="space-y-2">
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center space-x-2">
                                        <input type="radio" name={`correct_q${qIndex}`} checked={q.correctAnswerIndex === oIndex} onChange={() => handleCorrectAnswerChange(qIndex, oIndex)} className="form-radio h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-600 focus:ring-indigo-500" />
                                        <Input type="text" value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} required />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <Button type="button" variant="secondary" onClick={addQuestion}>Agregar Pregunta</Button>
                </div>
                
                {/* Student Assignment & Status */}
                 <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Control de Acceso</h4>
                     <div>
                        <Label htmlFor="allowedStudentIds">Asignar Estudiantes</Label>
                        <select id="allowedStudentIds" name="allowedStudentIds" multiple value={formData.allowedStudentIds} onChange={handleStudentSelectionChange}
                            className="mt-1 block w-full h-40 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {allStudents.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.username})</option>)}
                        </select>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mantén presionada Ctrl/Cmd para seleccionar varios estudiantes</p>
                    </div>
                     <div className="flex items-center space-x-2">
                         <input type="checkbox" id="isEnabled" name="isEnabled" checked={formData.isEnabled} onChange={handleExamDetailsChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                         <Label htmlFor="isEnabled">Activar examen a los estudiantes</Label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4">
                    <div>
                        {exam && <Button type="button" variant="danger" onClick={handleDelete} disabled={loading}>{loading ? 'Borrando...' : 'Borrar Examen'}</Button>}
                    </div>
                    <div className="flex space-x-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};


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
