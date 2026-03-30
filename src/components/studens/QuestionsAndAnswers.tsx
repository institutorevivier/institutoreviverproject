import { Exam, Submission } from '@/types';




interface Props {
    exam: Exam;
    hasSubmitted: boolean;
    submission: Submission;

}


export const QuestionsAndAnswers = ({ exam, hasSubmitted, submission }: Props) => {
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

                // const studentAnswer = submission!.answers[qIndex];
                const isCorrect = isAnswerCorrect(exam, submission!, qIndex);
                const answerText = getStudentAnswerText(exam, submission!, qIndex);
                const correctAnswer = question.options[question.correctAnswerIndex];

                return (
                    <div key={question.id} className="pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{qIndex + 1}.</span> {question.text}
                        </p>
                        <div className="mt-2 space-y-1">
                            <div className={`text-sm p-2 rounded ${isCorrect
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

    )
}
