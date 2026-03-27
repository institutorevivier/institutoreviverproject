import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { Label } from '@/src/components/Label';
import { Modal } from '@/src/components/Modal';
import { Textarea } from '@/src/components/Textarea';
import { Exam, User } from '@/types';
import React, { useEffect, useState } from 'react'
interface ExamEditorModalProps {
  exam: Exam | null; // null for creating, Exam object for editing
  allStudents: User[];
  onClose: () => void;
  onSave: (examData: Exam) => Promise<void>;
  onDelete: (examId: number) => Promise<void>;
}
export const ExamEditorModal: React.FC<ExamEditorModalProps> = ({ exam, allStudents, onClose, onSave, onDelete }) => {
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