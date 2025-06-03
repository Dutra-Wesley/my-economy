import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function SignUp({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp } = useAuth();

  const formatarDataNascimento = (text) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 2 && cleaned.length <= 4) {
      cleaned = cleaned.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    } else if (cleaned.length > 4) {
      cleaned = cleaned.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
    }
    setBirthDate(cleaned);
  };

  async function handleSignUp() {
    try {
      if (!name || !email || !password || !birthDate || !confirmPassword) {
        Alert.alert('Erro', 'Preencha todos os campos');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Erro', 'As senhas não coincidem');
        return;
      }
      const dateParts = birthDate.split('/');
      if (dateParts.length !== 3) {
        Alert.alert('Erro', 'Data de nascimento inválida. Use o formato DD/MM/YYYY');
        return;
      }
      const [day, month, year] = dateParts;
      if (
        isNaN(day) || isNaN(month) || isNaN(year) ||
        day.length !== 2 || month.length !== 2 || year.length !== 4
      ) {
        Alert.alert('Erro', 'Data de nascimento inválida. Use o formato DD/MM/YYYY');
        return;
      }
      const formattedBirthDate = `${year}-${month}-${day}`;
      await signUp(name, email, password, formattedBirthDate);
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRIAR</Text>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data de nascimento</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            value={birthDate}
            onChangeText={formatarDataNascimento}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Criar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.linkText}>Voltar</Text>
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