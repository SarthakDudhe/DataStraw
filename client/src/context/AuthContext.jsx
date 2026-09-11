import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEMO_CREDENTIALS = {
  ADMIN: {
    email: 'admin@datastraw.io',
    password: 'admin123',
    name: 'Alex Rivera',
    title: 'Senior Support Lead',
    role: 'admin',
  },
  CUSTOMER: {
    email: 'customer@example.com',
    password: 'customer123',
    name: 'Sarah Jenkins',
    title: 'Lead DevOps Engineer (DataForge)',
    role: 'customer',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('datastraw_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('datastraw_auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('datastraw_auth_user');
      }
    } catch (err) {
      console.error('Failed to sync auth state to localStorage', err);
    }
  }, [user]);

  const login = (email, password) => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (
      trimmedEmail === DEMO_CREDENTIALS.ADMIN.email &&
      cleanPassword === DEMO_CREDENTIALS.ADMIN.password
    ) {
      const adminUser = { ...DEMO_CREDENTIALS.ADMIN };
      delete adminUser.password;
      setUser(adminUser);
      return { success: true, user: adminUser };
    }

    if (
      trimmedEmail === DEMO_CREDENTIALS.CUSTOMER.email &&
      cleanPassword === DEMO_CREDENTIALS.CUSTOMER.password
    ) {
      const customerUser = { ...DEMO_CREDENTIALS.CUSTOMER };
      delete customerUser.password;
      setUser(customerUser);
      return { success: true, user: customerUser };
    }

    return {
      success: false,
      error: 'Invalid email or password. Use demo buttons or listed credentials.',
    };
  };

  const demoLogin = (role = 'admin') => {
    if (role === 'admin') {
      const adminUser = { ...DEMO_CREDENTIALS.ADMIN };
      delete adminUser.password;
      setUser(adminUser);
      return adminUser;
    } else {
      const customerUser = { ...DEMO_CREDENTIALS.CUSTOMER };
      delete customerUser.password;
      setUser(customerUser);
      return customerUser;
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('datastraw_auth_user');
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role || null,
        login,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
