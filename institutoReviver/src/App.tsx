
import React, { useState, useEffect, useCallback } from 'react';
import type { User } from './../types';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';

import { api } from './../data_supabase';

const App: React.FC = () => {
  const usuario=localStorage.getItem("usuario")!=null ? JSON.parse(localStorage.getItem("usuario")): null;
  const [currentUser, setCurrentUser] = useState<User | null>(usuario);
  //const [loading, setLoading] = useState(true);
  // try {

  //     const usuarioGuardado = JSON.parse(localStorage.getItem("usuario")||"");
  //     if(usuarioGuardado){
        
  //       console.log(usuarioGuardado)
        
  //       setCurrentUser(usuarioGuardado)
  //     }
      
   
  // } catch (error) {
    
  // }

    // Simple session persistence check
       
  console.log("aca 1")
  const handleLogin = useCallback(async (username: string, password: string): Promise<boolean> => {
    const user = await api.loginSimple(username, password);
    if (user) {
       
       setCurrentUser(user);
       localStorage.setItem("usuario", JSON.stringify(user));
      return true;
    }
    return false;
  }, []);

  const handleLogout = useCallback(async () => {
   // await api.logout();
   setCurrentUser(null)
   localStorage.setItem("usuario", JSON.stringify(null));

  }, []);

  // if (loading) {
  //   return (

  //     <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
  //       <div className="text-xl font-semibold text-gray-700 dark:text-gray-200">cargando...</div>
  //     </div>
  //   );
  // }
  
  // try {

  //     const usuarioGuardado = JSON.parse(localStorage.getItem("usuario")||"");
  //     console.log(usuarioGuardado)
  //     if(usuarioGuardado!=null){
  //     setCurrentUser(usuarioGuardado)
  //     }
   
  // } catch (error) {
    
  // }



  if (!currentUser) {
    console.log("paso por aca")
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  if (currentUser.role === 'student') {
    return <StudentDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return null; // Should not happen
};

export default App;
