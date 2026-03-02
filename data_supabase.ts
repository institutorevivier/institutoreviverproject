
// data_supabase.ts

import type { User, Exam, Submission, Question } from './types';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase
// Helper to handle Supabase query errors
const handleSupabaseError = (error: any, context: string) => {
    if (error) {
        console.error(`Error in ${context}:`, error);
        throw new Error(error.message);
    }
};

export const api = {
    // Session Management
    async checkSession(): Promise<User | null> {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            handleSupabaseError(error, 'checkSession: getSession');
            if (!session?.user) {
                return null;
            }
            const { data: userProfile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

            // If no profile, user might be from auth but not in our public table yet
            if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = 0 rows
                handleSupabaseError(profileError, 'checkSession: getUserProfile');
            }

            return userProfile as User | null;
        } catch (error) {
            console.error('Error al obtener la sesión:', error);
            return null;
        }
    },

    // NOTE: Supabase uses email for login. We map 'username' to email here.
    async login(username: string, password: string): Promise<User | null> {
        const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
            email: username, // Assuming username is the user's email
            password,
        });
        handleSupabaseError(loginError, 'login');

        if (!user) return null;

        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        handleSupabaseError(profileError, 'login: getUserProfile');

        return userProfile;
    },
    async loginSimple(username: string, password: string) {

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            //  .eq('username', username)
            //  .eq('password', password)
            .single();
        console.log(data)
        if (error) {
            console.log({ error })
            console.log(`error al login de ${username} ${password} ${{ error }}`)
            return null;
        }

        return data;
    },

    async logout(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        handleSupabaseError(error, 'logout');
    },

    // Admin: Student Management
    async getAllStudents(): Promise<User[]> {

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'student');
        handleSupabaseError(error, 'getAllStudents');
        return data || [];
    },

    async saveStudent(studentData: Omit<User, 'role' | 'id'> | User): Promise<User | null> {
        // Editing an existing studen

        if ('id' in studentData && studentData.id) {
            const { id, ...updateData } = studentData;

            // Handle password update if provided
            //  if (updateData.password) {
            //      const { error: authError } = await supabase.auth.updateUser({ password: updateData.password });
            //      handleSupabaseError(authError, 'saveStudent: updateUserAuth');
            //  }
            //  delete updateData.password; // Don't save password in public table

            const { data, error } = await supabase
                .from('users')
                .update({
                    username: updateData.username,
                    firstName: updateData.firstName,
                    lastName: updateData.lastName,
                    age: updateData.age,
                    documentNumber: updateData.documentNumber,
                    phone: updateData.phone,
                    address: updateData.address,
                    password: updateData.password,
                } as any)
                .eq('id', id)
                .select()
                .single();

            handleSupabaseError(error, 'saveStudent: update');
            return data;
        }
        // Creating a new student
        else {

            const { password, ...profileData } = studentData as Omit<User, 'role' | 'id'>;
            if (!password) {
                throw new Error("Password is required for new students.");
            }

            // 1. Create user in Supabase Auth

            const { data, error } = await supabase
                .from('users')
                .insert({
                    username: profileData.username,
                    password: password,
                    role: 'student',
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    age: profileData.age,
                    documentNumber: profileData.documentNumber,
                    phone: profileData.phone,
                    address: profileData.address,
                } as any)
                .select()
                .single();
            if (error) {
                console.error('Error al crear usuario:', error);
                return null;
            }
            return data;


        }
    },

    // Admin: Exam Management
    async getAllExams(): Promise<Exam[]> {
        const { data, error } = await supabase.from('exams').select('*');
        handleSupabaseError(error, 'getAllExams');
        return (data as any) || [];
    },

    async saveExam(examData: Exam): Promise<Exam | null> {
        if (examData.id) { // Update existing exam
            const { id, ...updateData } = examData;
            const { data, error } = await supabase
                .from('exams')
                .update(updateData as any)
                .eq('id', id)
                .select()
                .single();

            handleSupabaseError(error, 'saveExam: update');
            return data as any;
        } else { // Create new exam
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...insertData } = examData;
            const { data, error } = await supabase
                .from('exams')
                .insert(insertData as any)
                .select()
                .single();

            handleSupabaseError(error, 'saveExam: insert');
            return data as any;
        }
    },

    async deleteExam(examId: number): Promise<void> {
        const { data, error } = await supabase
            .from('exams')
            .update({ isEnable: false } as any)
            .eq('id', examId)
            .select()
            .single();

        if (error) {
            console.error('Error al eliminar examen:', error);
        } else {
            console.log('Examen eliminado:', data);
        }
        handleSupabaseError(error, 'deleteExam');
    },

    // Student: Data fetching
    async getExamsForStudent(studentId: string): Promise<Exam[]> {
        const { data, error } = await supabase
            .from('exams')
            .select('*')
            .contains('allowedStudentIds', [studentId]);

        handleSupabaseError(error, 'getExamsForStudent');
        return (data as any) || [];
    },

    async getExamsAssignedToStudent(studentId: string): Promise<Exam[]> {
        const { data, error } = await supabase
            .from('exams')
            .select('*')
            .contains('allowedStudentIds', [studentId]);

        handleSupabaseError(error, 'getExamsAssignedToStudent');
        return (data as any) || [];
    },

    async getSubmissionsForStudent(studentId: string): Promise<Submission[]> {
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('studentId', studentId);

        handleSupabaseError(error, 'getSubmissionsForStudent');
        return (data as any) || [];
    },

    // Student: Exam submission
    async submitExam(submissionData: Omit<Submission, 'id' | 'score' | 'submittedAt'>): Promise<Submission> {
        const { data: exam, error: examError } = await supabase
            .from('exams')
            .select('questions')
            .eq('id', submissionData.examId)
            .single();

        handleSupabaseError(examError, 'submitExam: getExam');
        if (!exam) throw new Error('Exam not found');

        let correctAnswers = 0;
        ((exam as any).questions as Question[]).forEach((q, index) => {
            if (q.correctAnswerIndex === submissionData.answers[index]) {
                correctAnswers++;
            }
        });
        const score = (exam as any).questions.length > 0 ? (correctAnswers / (exam as any).questions.length) * 100 : 0;

        const newSubmission: Omit<Submission, 'id'> = {
            ...submissionData,
            score,
            submittedAt: new Date().toISOString(),
        };

        const { data: insertedSubmission, error: insertError } = await supabase
            .from('submissions')
            .insert(newSubmission as any)
            .select()
            .single();

        handleSupabaseError(insertError, 'submitExam: insertSubmission');
        return insertedSubmission as any;
    },
};

// =========================
// Ejemplo: Select simple de todos los usuarios
// =========================
export async function obtenerUsuarios() {
    const { data, error } = await supabase
        .from('users')
        .select('*');
    if (error) {
        console.error('Error al obtener usuarios:', error);
        return [];
    }
    return data;
}

// =========================
// Ejemplo: Login simple con username y contraseña
// =========================
export async function loginSimple(username: string, password: string) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();
    if (error) {
        console.error('Usuario o contraseña incorrectos');
        return null;
    }
    return data;
}
