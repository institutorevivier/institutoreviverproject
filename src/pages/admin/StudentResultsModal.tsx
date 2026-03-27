import { api } from '@/data_supabase';
import { Button } from '@/src/components/Button';
import { Modal } from '@/src/components/Modal';
import { Exam, Submission, User } from '@/types';
import React, { useEffect, useState } from 'react'
interface StudentResultsModalProps {
    student: User;
    onClose: () => void;
    onEditStudent: (student: User) => void;
}
export const StudentResultsModal: React.FC<StudentResultsModalProps> = ({ student, onClose, onEditStudent }) => {
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
