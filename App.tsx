
import React, { useState, useEffect, useCallback } from 'react';
import type { User } from './types';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { StudentDashboard } from './pages/StudentDashboard';

import { api } from './data_supabase';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Simple session persistence check
  useEffect(() => {
    const checkSession = async () => {
      const user = null
      setCurrentUser(user);
      setLoading(false);
    };
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = useCallback(async (username: string, password: string): Promise<boolean> => {
    const user = await api.loginSimple(username, password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, []);

  const handleLogout = useCallback(async () => {
    await api.logout();
    setCurrentUser(null);
  }, []);

  if (loading) {
    return (

      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl font-semibold text-gray-700 dark:text-gray-200">cargando...</div>
      </div>
    );
  }

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
