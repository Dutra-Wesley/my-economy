import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { format } from 'date-fns';
import api from '../../services/api';

export default function MonthlyLimit({ navigation }) {
  const [value, setValue] = useState('');
  const [referenceMonth, setReferenceMonth] = useState(
    format(new Date(), 'yyyy-MM')
  );

  async function handleSubmit() {
    try {
      if (!value || !referenceMonth) {
        Alert.alert('Erro', 'Preencha todos os campos');
        return;
      }

      const currentDate = new Date();
      const selectedDate = new Date(referenceMonth);

      if (selectedDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) {
        Alert.alert('Erro', 'Não é possível cadastrar limite para meses anteriores');
        return;
      }

      await api.post('/monthly-limits', {
        value: Number(value),
        referenceMonth,
      });

      Alert.alert('Sucesso', 'Limite mensal cadastrado com sucesso');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao cadastrar limite');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Definir Limite Mensal</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Valor do Limite"
          keyboardType="numeric"
          value={value}
          onChangeText={setValue}
        />

        <TextInput
          style={styles.input}
          placeholder="Mês de Referência (YYYY-MM)"
          value={referenceMonth}
          onChangeText={setReferenceMonth}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Definir Limite</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 