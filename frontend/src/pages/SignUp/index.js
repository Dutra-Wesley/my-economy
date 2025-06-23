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

export default function SignUp({ navigation }) {
  // Estados para os campos do formulário de cadastro
  const [name, setName] = useState(''); // Nome do usuário
  const [email, setEmail] = useState(''); // Email do usuário
  const [password, setPassword] = useState(''); // Senha do usuário
  const [birthDate, setBirthDate] = useState(''); // Data de nascimento formatada (DD/MM/YYYY)
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirmação da senha
  
  // Função de cadastro do contexto de autenticação
  const { signUp } = useAuth();

  // Função para validar formato do email usando regex
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email); // Retorna true se email válido
  };

  // Função para validar se a data de nascimento é válida
  const validarData = (data) => {
    const [dia, mes, ano] = data.split('/').map(Number);
    
    // Valida se o mês está entre 1 e 12
    if (mes < 1 || mes > 12) {
      return false;
    }

    // Valida se o ano está entre 1900 e o ano atual
    const anoAtual = new Date().getFullYear();
    if (ano < 1900 || ano > anoAtual) {
      return false;
    }

    // Valida se o dia é válido para o mês/ano especificado
    const diasNoMes = new Date(ano, mes, 0).getDate();
    if (dia < 1 || dia > diasNoMes) {
      return false;
    }

    return true; // Data válida
  };

  // Função para formatar automaticamente a data de nascimento durante a digitação
  const formatarDataNascimento = (text) => {
    let cleaned = text.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    
    // Adiciona primeira barra após 2 dígitos (DD/)
    if (cleaned.length > 2 && cleaned.length <= 4) {
      cleaned = cleaned.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    } 
    // Adiciona segunda barra após 4 dígitos (DD/MM/)
    else if (cleaned.length > 4) {
      cleaned = cleaned.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
    }
    
    setBirthDate(cleaned); // Atualiza o estado com a data formatada
  };

  // Função para processar cadastro do usuário
  async function handleSignUp() {
    try {
      // Validação dos campos obrigatórios
      if (!name || !email || !password || !birthDate || !confirmPassword) {
        Alert.alert('Erro', 'Preencha todos os campos');
        return;
      }

      // Validação do formato do email
      if (!validarEmail(email)) {
        Alert.alert('Erro', 'Por favor, insira um endereço de e-mail válido');
        return;
      }

      // Validação se as senhas coincidem
      if (password !== confirmPassword) {
        Alert.alert('Erro', 'As senhas não coincidem');
        return;
      }

      // Validação do formato da data (deve ter 3 partes: dia, mês, ano)
      const dateParts = birthDate.split('/');
      if (dateParts.length !== 3) {
        Alert.alert('Erro', 'Data de nascimento inválida. Use o formato DD/MM/YYYY');
        return;
      }

      // Validação se cada parte da data é numérica e tem o tamanho correto
      const [day, month, year] = dateParts;
      if (
        isNaN(day) || isNaN(month) || isNaN(year) ||
        day.length !== 2 || month.length !== 2 || year.length !== 4
      ) {
        Alert.alert('Erro', 'Data de nascimento inválida. Use o formato DD/MM/YYYY');
        return;
      }

      // Validação se a data é válida (considerando dias do mês, etc.)
      if (!validarData(birthDate)) {
        Alert.alert('Erro', 'Data de nascimento inválida');
        return;
      }

      // Converte data do formato DD/MM/YYYY para YYYY-MM-DD (formato da API)
      const formattedBirthDate = `${year}-${month}-${day}`;
      
      // Executa cadastro através do contexto de autenticação
      await signUp(name, email, password, formattedBirthDate);
    } catch (error) {
      // Tratamento de erros específicos
      if (error.message.includes('Usuário já existe')) {
        Alert.alert('Erro', 'E-mail já cadastrado.');
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao criar sua conta. Por favor, tente novamente.');
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRIAR</Text>
      
      {/* Formulário de cadastro */}
      <View style={styles.form}>
        {/* Campo de nome */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            value={name}
            onChangeText={setName}
          />
        </View>
        
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
        
        {/* Campo de data de nascimento com formatação automática */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data de nascimento</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            value={birthDate}
            onChangeText={formatarDataNascimento} // Aplica formatação automática
            keyboardType="numeric" // Teclado numérico
            maxLength={10} // Limite de caracteres (DD/MM/YYYY)
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
        
        {/* Campo de confirmação de senha */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            secureTextEntry // Oculta texto da senha
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
        
        {/* Botão de cadastro */}
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Criar</Text>
        </TouchableOpacity>
        
        {/* Link para voltar à tela anterior */}
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