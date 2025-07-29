// data.ts

import type { User, Exam, Submission } from './types';

// MOCK DATA - Simulates a database
let users: User[] = [
    { id: 'admin1', username: 'admin', password: 'admin123', role: 'admin', firstName: 'Admin', lastName: 'User' },
    { id: 'student1', username: 'student1', password: 'student123', role: 'student', firstName: 'John', lastName: 'Doe', age: 20, documentNumber: '12345678', phone: '555-0101', address: '123 Main St' },
    { id: 'student2', username: 'student2', password: 'student123', role: 'student', firstName: 'Jane', lastName: 'Smith', age: 22, documentNumber: '87654321', phone: '555-0102', address: '456 Oak Ave' },
];

let exams: Exam[] = [
    {
        id: 'exam1',
        title: 'React Fundamentals',
        class: 'Web Development 101',
        description: 'A quick quiz on the basics of React hooks, components, and state management.',
        dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        questions: [
            { id: 'q1_1', text: 'What is JSX?', options: ['A JavaScript syntax extension', 'A templating engine', 'A CSS preprocessor', 'A database query language'], correctAnswerIndex: 0 },
            { id: 'q1_2', text: 'Which hook is used to manage state in a functional component?', options: ['useEffect', 'useState', 'useContext', 'useReducer'], correctAnswerIndex: 1 },
        ],
        isEnabled: true,
        allowedStudentIds: ['student1', 'student2'],
    },
    {
        id: 'exam2',
        title: 'Advanced TypeScript',
        class: 'Programming II',
        description: 'A test on advanced TypeScript concepts like generics, decorators, and mapped types.',
        dateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        questions: [
             { id: 'q2_1', text: 'What is a generic in TypeScript?', options: ['A type of variable', 'A tool for creating reusable components with types', 'A specific class', 'A built-in function'], correctAnswerIndex: 1 },
             { id: 'q2_2', text: 'What does the "readonly" modifier do on a property?', options: ['Prevents access to the property', 'Makes the property writable only once', 'Ensures the property can only be set when the object is created', 'Deletes the property'], correctAnswerIndex: 2 },
        ],
        isEnabled: false,
        allowedStudentIds: ['student1'],
    },
     {
        id: 'exam3',
        title: 'CSS Grid and Flexbox',
        class: 'Web Design',
        description: 'A practical exam on modern CSS layout techniques.',
        dateTime: new Date().toISOString(),
        questions: [
             { id: 'q3_1', text: 'Which property is used to create a flex container?', options: ['flex: 1', 'display: flex', 'flex-direction: row', 'justify-content: center'], correctAnswerIndex: 1 },
        ],
        isEnabled: true,
        allowedStudentIds: ['student2'],
    }
];

let submissions: Submission[] = [];

// SIMULATED API
const FAKE_DELAY = 250;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    // Session Management
    async checkSession(): Promise<User | null> {
        await sleep(FAKE_DELAY);
        try {
            const userJson = sessionStorage.getItem('currentUser');
            return userJson ? JSON.parse(userJson) : null;
        } catch (e) {
            sessionStorage.removeItem('currentUser');
            return null;
        }
    },

    async login(username: string, password: string): Promise<User | null> {
        await sleep(FAKE_DELAY);
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            const userToStore = { ...user };
            delete userToStore.password; // Don't store password in session
            sessionStorage.setItem('currentUser', JSON.stringify(userToStore));
            return userToStore;
        }
        return null;
    },

    async logout(): Promise<void> {
        await sleep(100);
        sessionStorage.removeItem('currentUser');
    },

    // Admin: Student Management
    async getAllStudents(): Promise<User[]> {
        console.log("obtener estudiantesslocal")
        await sleep(FAKE_DELAY);
        return JSON.parse(JSON.stringify(users.filter(u => u.role === 'student')));
    },

    async saveStudent(studentData: Omit<User, 'role'|'id'> | User): Promise<User> {
        await sleep(FAKE_DELAY);
        if ('id' in studentData && studentData.id) {
            const index = users.findIndex(u => u.id === studentData.id);
            if (index > -1) {
                const updatedStudent = { ...users[index], ...studentData };
                if (!studentData.password) {
                    updatedStudent.password = users[index].password;
                }
                users[index] = updatedStudent;
                return JSON.parse(JSON.stringify(updatedStudent));
            }
            throw new Error('Student not found');
        } else {
            const newUser: User = {
                ...studentData,
                id: `student_${Date.now()}`,
                role: 'student',
            };
            users.push(newUser);
            return JSON.parse(JSON.stringify(newUser));
        }
    },
    
    // Admin: Exam Management
    async getAllExams(): Promise<Exam[]> {
        await sleep(FAKE_DELAY);
        return JSON.parse(JSON.stringify(exams));
    },

    async saveExam(examData: Exam): Promise<Exam> {
        await sleep(FAKE_DELAY);
        const index = exams.findIndex(e => e.id === examData.id);
        if (index > -1) {
            exams[index] = examData;
        } else {
            exams.push(examData);
        }
        return JSON.parse(JSON.stringify(examData));
    },

    async deleteExam(examId: string): Promise<void> {
        await sleep(FAKE_DELAY);
        exams = exams.filter(e => e.id !== examId);
    },

    // Student: Data fetching
    async getExamsForStudent(studentId: string): Promise<Exam[]> {
        await sleep(FAKE_DELAY);
        return JSON.parse(JSON.stringify(exams.filter(e => e.allowedStudentIds.includes(studentId))));
    },

    async getSubmissionsForStudent(studentId: string): Promise<Submission[]> {
        await sleep(FAKE_DELAY);
        return JSON.parse(JSON.stringify(submissions.filter(s => s.studentId === studentId)));
    },

    // Student: Exam submission
    async submitExam(submissionData: Omit<Submission, 'id' | 'score' | 'submittedAt'>): Promise<Submission> {
        await sleep(FAKE_DELAY);
        const exam = exams.find(e => e.id === submissionData.examId);
        if (!exam) throw new Error('Exam not found');
        
        let correctAnswers = 0;
        exam.questions.forEach((q, index) => {
            if (q.correctAnswerIndex === submissionData.answers[index]) {
                correctAnswers++;
            }
        });

        const score = exam.questions.length > 0 ? (correctAnswers / exam.questions.length) * 100 : 0;

        const newSubmission: Submission = {
            ...submissionData,
            id: `sub_${Date.now()}`,
            score,
            submittedAt: new Date().toISOString(),
        };

        submissions.push(newSubmission);
        return JSON.parse(JSON.stringify(newSubmission));
    },
};
