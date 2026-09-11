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

const USERS_STORAGE_KEY = 'datastraw_registered_users';

function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save registered users', err);
  }
}

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

    // 1. Check registered customer accounts first
    const registered = getRegisteredUsers();
    const matchedAccount = registered.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === cleanPassword
    );

    if (matchedAccount) {
      const customerUser = {
        name: matchedAccount.name,
        email: matchedAccount.email,
        title: matchedAccount.title || 'Verified Customer',
        role: 'customer',
      };
      setUser(customerUser);
      return { success: true, user: customerUser };
    }

    // 2. Check Demo Admin
    if (
      trimmedEmail === DEMO_CREDENTIALS.ADMIN.email &&
      cleanPassword === DEMO_CREDENTIALS.ADMIN.password
    ) {
      const adminUser = { ...DEMO_CREDENTIALS.ADMIN };
      delete adminUser.password;
      setUser(adminUser);
      return { success: true, user: adminUser };
    }

    // 3. Check Demo Customer
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
      error: 'Invalid email or password. Check credentials or register a new customer account.',
    };
  };

  const registerCustomer = ({ name, email, password, company }) => {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanCompany = (company || '').trim();

    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }
    if (cleanPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Check conflict
    const registered = getRegisteredUsers();
    const emailExists = registered.some((u) => u.email.toLowerCase() === cleanEmail) ||
      cleanEmail === DEMO_CREDENTIALS.ADMIN.email ||
      cleanEmail === DEMO_CREDENTIALS.CUSTOMER.email;

    if (emailExists) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newAccountRecord = {
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      title: cleanCompany ? `${cleanCompany} (Client)` : 'Verified Customer',
      role: 'customer',
      created_at: new Date().toISOString(),
    };

    saveRegisteredUsers([...registered, newAccountRecord]);

    const activeUser = {
      name: newAccountRecord.name,
      email: newAccountRecord.email,
      title: newAccountRecord.title,
      role: 'customer',
    };

    setUser(activeUser);
    return { success: true, user: activeUser };
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
        registerCustomer,
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
