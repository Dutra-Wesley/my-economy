import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const token = await AsyncStorage.getItem('@MyEconomy:token');
        const userData = await AsyncStorage.getItem('@MyEconomy:user');

        if (token && userData) {
          api.defaults.headers.Authorization = `Bearer ${token}`;
          setUser(JSON.parse(userData));
        }
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function signIn(email, password) {
    try {
      const response = await api.post('/sessions', { email, password });
      const { token, user: userData } = response.data;

      await AsyncStorage.setItem('@MyEconomy:token', token);
      await AsyncStorage.setItem('@MyEconomy:user', JSON.stringify(userData));

      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(userData);
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao fazer login');
    }
  }

  async function signUp(name, email, password, birthDate) {
    try {
      const response = await api.post('/users', {
        name,
        email,
        password,
        birthDate,
      });

      const { token, user: userData } = response.data;

      await AsyncStorage.setItem('@MyEconomy:token', token);
      await AsyncStorage.setItem('@MyEconomy:user', JSON.stringify(userData));

      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(userData);
    } catch (error) {
      console.log(error);
      throw new Error(error.response?.data?.error || 'Erro ao criar conta');
    }
  }

  async function signOut() {
    await AsyncStorage.removeItem('@MyEconomy:token');
    await AsyncStorage.removeItem('@MyEconomy:user');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
} 