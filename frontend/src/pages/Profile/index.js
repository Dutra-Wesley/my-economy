// Importação das dependências necessárias para a tela
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { format } from 'date-fns'; // Para formatação de datas
import { useAuth } from '../../contexts/AuthContext'; // Hook para autenticação e dados do usuário
import api from '../../services/api'; // Serviço para chamadas da API

export default function Profile({ navigation }) {
  // Obtém dados e função de logout do contexto de autenticação
  const { user, signOut } = useAuth();
  
  // Estado para armazenar dados completos do usuário vindos da API
  const [userData, setUserData] = useState(null);

  // Carrega dados do usuário ao montar o componente
  useEffect(() => {
    loadUserData();
  }, []);

  // Função para carregar dados completos do usuário via API
  async function loadUserData() {
    try {
      const response = await api.get('/users');
      setUserData(response.data); // Define dados do usuário no estado
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar dados do usuário');
    }
  }

  // Função para fazer logout com confirmação
  function handleSignOut() {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sair',
          onPress: () => signOut() // Executa logout através do contexto de autenticação
        }
      ]
    );
  }

  // Tela de carregamento - enquanto os dados não foram carregados
  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  // Tela principal - quando os dados do usuário estão disponíveis
  return (
    <View style={styles.containerWhite}>
      <Text style={styles.titleCentered}>Meus Dados</Text>
      
      {/* Caixa com informações do usuário */}
      <View style={styles.dataBox}>
        <Text style={styles.labelBold}>Nome</Text>
        <Text style={styles.valueNormal}>{userData.name}</Text>
        
        <Text style={[styles.labelBold, { marginTop: 18 }]}>Email</Text>
        <Text style={styles.valueNormal}>{userData.email}</Text>
        
        <Text style={[styles.labelBold, { marginTop: 18 }]}>Data de nascimento</Text>
        <Text style={styles.valueNormal}>{format(new Date(userData.birthDate), 'dd/MM/yyyy')}</Text>
      </View>
      
      {/* Botão para fazer logout */}
      <TouchableOpacity style={styles.signOutButtonGreen} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>SAIR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerWhite: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  titleCentered: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 0,
  },
  dataBox: {
    width: '80%',
    marginBottom: 32,
    alignSelf: 'center',
  },
  labelBold: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111',
    marginBottom: 2,
  },
  valueNormal: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
  },
  signOutButtonGreen: {
    backgroundColor: '#4CC95B',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: 'center',
    marginTop: 8,
    width: '80%',
    alignSelf: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 20,
  },
}); 