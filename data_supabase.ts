// data_supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { User, Exam, Submission, Question } from './types';

// ===================================================================================
// IMPORTANT: CONFIGURE YOUR SUPABASE CREDENTIALS
// ===================================================================================
// 1. Create a project at https://supabase.com/
// 2. Go to Project Settings > API
// 3. Find your "Project URL" and "anon" "public" key.
// 4. It is best to use environment variables, but you can paste them here for now.
//
// const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
//
// For this example, we will use placeholders. The application will not work
// until these are replaced with your actual Supabase credentials.
// ===================================================================================
const supabaseUrl =  import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
console.log( import.meta.env.VITE_SUPABASE_URL )
const supabaseAnonKey =  import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';




if (supabaseUrl.includes('YOUR_SUPABASE_URL') || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
    console.error(`
        ********************************************************************************
        *                                                                              *
        *  ERROR: Supabase credentials are not configured.                             *
        *                                                                              *
        *  Please update 'data_supabase.ts' with your project's URL and anon key.      *
        *  The application will not function correctly until this is done.             *
        *                                                                              *
        ********************************************************************************
    `);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("la supabase")
console.log(supabaseAnonKey)
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

        return userProfile;
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
     async  loginSimple(username: string, password: string) {
        console.log("el login simple ")
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
          //  .eq('username', username)
          //  .eq('password', password)
            .single();
            console.log("el login simple ")
        if (error) {
            console.log(error)
            console.error('Usuario o contraseña incorrectos');
            return null;
        }
        console.log(data)
        return data;
    },

    async logout(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        handleSupabaseError(error, 'logout');
    },

    // Admin: Student Management
    async getAllStudents(): Promise<User[]> {
        console.log("obtener estudiantessupabase")
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'student');
        handleSupabaseError(error, 'getAllStudents');
        return data || [];
    },

    async saveStudent(studentData: Omit<User, 'role'|'id'> | User): Promise<User | null> {
        // Editing an existing studen
        console.log(studentData)
        if ('id' in studentData && studentData.id) {
            const { id, ...updateData } = studentData;

            // Handle password update if provided
            if (updateData.password) {
                const { error: authError } = await supabase.auth.updateUser({ password: updateData.password });
                handleSupabaseError(authError, 'saveStudent: updateUserAuth');
            }
            delete updateData.password; // Don't save password in public table

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
                 })
                .eq('id', id)
                .select()
                .single();

            handleSupabaseError(error, 'saveStudent: update');
            return data;
        } 
        // Creating a new student
        else {
            console.log("creating a new student")
            const { password, ...profileData } = studentData as Omit<User, 'role'|'id'>;
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
                    })
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
        return data || [];
    },

    async saveExam(examData: Omit<Exam, 'id'>): Promise<Exam | null> {
        console.log(examData)
        // Elimina id si existe, para que Supabase lo genere
        delete (examData as any).id;
        console.log("saving an exam")
        const { data, error } = await supabase
            .from('exams')
            .insert(examData)
            .select()
            .single();

        handleSupabaseError(error, 'saveExam');
        if(error){
            console.error('Error al guardar el examen:', error);
            return null;
        }
        return data;
    },

    async deleteExam(examId: string): Promise<void> {
        const { error } = await supabase.from('exams').delete().eq('id', examId);
        handleSupabaseError(error, 'deleteExam');
    },

    // Student: Data fetching
    async getExamsForStudent(studentId: string): Promise<Exam[]> {
        const { data, error } = await supabase
            .from('exams')
            .select('*')
            .contains('allowedStudentIds', [studentId]);
            
        handleSupabaseError(error, 'getExamsForStudent');
        return data || [];
    },

    async getSubmissionsForStudent(studentId: string): Promise<Submission[]> {
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('studentId', studentId);
            
        handleSupabaseError(error, 'getSubmissionsForStudent');
        return data || [];
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
        (exam.questions as Question[]).forEach((q, index) => {
            if (q.correctAnswerIndex === submissionData.answers[index]) {
                correctAnswers++;
            }
        });
        const score = exam.questions.length > 0 ? (correctAnswers / exam.questions.length) * 100 : 0;

        const newSubmission: Omit<Submission, 'id'> = {
            ...submissionData,
            score,
            submittedAt: new Date().toISOString(),
        };

        const { data: insertedSubmission, error: insertError } = await supabase
            .from('submissions')
            .insert(newSubmission)
            .select()
            .single();

        handleSupabaseError(insertError, 'submitExam: insertSubmission');
        return insertedSubmission;
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
