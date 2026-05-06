import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'rave_auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback((email, password) => {
    // Check if user exists in localStorage users list
    const users = JSON.parse(localStorage.getItem('rave_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const userData = { id: found.id, name: found.name, email: found.email, avatar: found.avatar };
      setUser(userData);
      return { success: true, user: userData };
    }
    return { success: false, error: 'Invalid email or password' };
  }, []);

  const signup = useCallback((name, email, password) => {
    const users = JSON.parse(localStorage.getItem('rave_users') || '[]');
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already exists' };
    }
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: Date.now(),
    };
    users.push(newUser);
    localStorage.setItem('rave_users', JSON.stringify(users));
    const userData = { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar };
    setUser(userData);
    return { success: true, user: userData };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
