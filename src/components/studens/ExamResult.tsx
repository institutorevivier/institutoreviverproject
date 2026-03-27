import { Exam, Submission } from "@/types";
import { QuestionsAndAnswers } from "./QuestionsAndAnswers";

interface Props {
    assignedExams: Exam[];
    getSubmissionForExam: (id: number) => Submission | undefined;


}

export const ExamResult = ({ assignedExams, getSubmissionForExam }: Props) => {
    const isAnswerCorrect = (exam: Exam, submission: Submission, questionIndex: number) => {
        if (!submission || questionIndex >= submission.answers.length) return null;
        const answerIndex = submission.answers[questionIndex];
        return exam.questions[questionIndex]?.correctAnswerIndex === answerIndex;
    };
    const getStudentAnswerText = (exam: Exam, submission: Submission, questionIndex: number) => {
        if (!submission || questionIndex >= submission.answers.length) return 'No respondió';
        const answerIndex = submission.answers[questionIndex];
        return exam.questions[questionIndex]?.options[answerIndex] || 'Respuesta inválida';
    };

    return (
        <>
            {assignedExams.length === 0 ?
                <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Este estudiante no tiene exámenes asignados.
                    </p>
                </div> :


                <div className="space-y-6">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 border-b pb-2">
                        Exámenes Asignados ({assignedExams.length})
                    </h4>

                    {assignedExams.map(exam => {
                        // recorre todos los examenes asignados del estudiante 
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
                                <QuestionsAndAnswers exam={exam} hasSubmitted={hasSubmitted} submission={submission!} />

                                {hasSubmitted && (
                                    <div className="mt-4 pt-3 border-t dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Fecha de entrega:</span> {new Date(submission!.submittedAt).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            }
        </>
    )
}
