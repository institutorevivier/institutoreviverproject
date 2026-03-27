import { api } from '@/data_supabase';
import { CabezeraModal } from '@/src/components/studens/CabezeraModal';
import { ExamResult } from '@/src/components/studens/ExamResult';

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


    if (loading) {
        return (
            <Modal onClose={onClose} title={`Resultados de ${student.firstName} ${student.lastName}`}>
                <div className="text-center py-8">
                    <p>Cargando resultados...</p>
                </div>
            </Modal>
        );
    }

    // if (assignedExams.length === 0) {
    //     return (
    //         <Modal onClose={onClose} title={`Resultados de ${student.firstName} ${student.lastName}`}>


    //             <CabezeraModal student={student} handleEditStudent={handleEditStudent} />
    //             <div className="text-center py-8">
    //                 <p className="text-gray-600 dark:text-gray-400 mb-6">
    //                     Este estudiante no tiene exámenes asignados.
    //                 </p>
    //             </div>
    //         </Modal>
    //     );
    // }

    return (
        <Modal onClose={onClose} title={`Resultados de ${student.firstName} ${student.lastName}`}>
            <div className="space-y-6">

                <CabezeraModal student={student} handleEditStudent={handleEditStudent} />



                {/* Exams Results */}
                <ExamResult assignedExams={assignedExams} getSubmissionForExam={getSubmissionForExam} />
            </div>
        </Modal>
    );
};
