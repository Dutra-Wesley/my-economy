// Importação das dependências necessárias para a tela
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext'; // Hook para autenticação

export default function SignIn({ navigation }) {
  // Estados para os campos do formulário de login
  const [email, setEmail] = useState(''); // Email do usuário
  const [password, setPassword] = useState(''); // Senha do usuário
  
  // Função de login do contexto de autenticação
  const { signIn } = useAuth();

  // Função para processar login do usuário
  async function handleSignIn() {
    try {
      // Validação dos campos obrigatórios
      if (!email || !password) {
        Alert.alert('Erro', 'Preencha todos os campos');
        return;
      }

      // Executa login através do contexto de autenticação
      await signIn(email, password);
    } catch (error) {
      // Exibe erro caso login falhe
      Alert.alert('Erro', error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ENTRAR</Text>
      
      {/* Formulário de login */}
      <View style={styles.form}>
        {/* Campo de email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            keyboardType="email-address" // Teclado otimizado para email
            autoCapitalize="none" // Não capitaliza automaticamente
            value={email}
            onChangeText={setEmail}
          />
        </View>
        
        {/* Campo de senha */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            secureTextEntry // Oculta texto da senha
            value={password}
            onChangeText={setPassword}
          />
        </View>
        
        {/* Botão de login */}
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
        
        {/* Link para tela de cadastro */}
        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.linkText}>Não possui conta? Crie aqui</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 36,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  inputGroup: {
    width: 280,
    alignSelf: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 15,
    color: '#000',
    marginLeft: 2,
  },
  input: {
    width: '100%',
    height: 42,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  button: {
    width: 280,
    height: 48,
    backgroundColor: '#4CC95B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    alignItems: 'center',
    marginTop: 6,
  },
  linkText: {
    fontSize: 12,
    color: '#000',
    marginTop: 2,
  },
}); 