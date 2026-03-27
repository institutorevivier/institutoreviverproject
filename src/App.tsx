
import React, { useState, useEffect, useCallback } from 'react';
import type { User } from './../types';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';

import { api } from './../data_supabase';

const App: React.FC = () => {
  const usuario = localStorage.getItem("usuario") != null ? JSON.parse(localStorage.getItem("usuario")) : null;
  const [currentUser, setCurrentUser] = useState<User | null>(usuario);



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




  if (!currentUser) {

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
