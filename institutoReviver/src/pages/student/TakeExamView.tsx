import { Button } from "@/src/components/Button";
import { Exam, Submission } from "@/types";
import { useState } from "react";

interface TakeExamViewProps {
    exam: Exam;
    studentId: string;
    onBack: () => void;
    onSubmit: (submission: Omit<Submission, 'id'|'score'|'submittedAt'>) => Promise<void>;
}

export const TakeExamView: React.FC<TakeExamViewProps> = ({ exam, studentId, onBack, onSubmit }) => {
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