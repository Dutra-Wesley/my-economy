import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function NewExpense({ navigation }) {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [referenceMonth, setReferenceMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [historyMonth, setHistoryMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [months, setMonths] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    // Gera 6 meses anteriores, o mês atual e 12 meses futuros para o Picker
    const arr = [];
    const now = new Date();
    for (let i = -6; i <= 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      arr.push({
        label: format(date, 'MMMM/yyyy', { locale: require('date-fns/locale/pt-BR') }),
        value: format(date, 'yyyy-MM'),
      });
    }
    setMonths(arr);
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [historyMonth]);

  useFocusEffect(
    React.useCallback(() => {
      setDescription('');
      setValue('');
      setReferenceMonth(format(new Date(), 'yyyy-MM'));
      setHistoryMonth(format(new Date(), 'yyyy-MM'));
      setEditing(false);
      setEditingId(null);
    }, [])
  );

  async function fetchExpenses() {
    setLoading(true);
    try {
      const response = await api.get(`/expenses?month=${historyMonth}`);
      setExpenses(response.data || []);
    } catch (error) {
      setExpenses([]);
    }
    setLoading(false);
  }

  async function handleSubmit() {
    try {
      if (!description || !value || !referenceMonth) {
        Alert.alert('Erro', 'Preencha todos os campos');
        return;
      }
      if (editing && editingId) {
        await api.put(`/expenses/${editingId}`, {
          description,
          value: Number(value),
          referenceMonth,
        });
        Alert.alert('Sucesso', 'Despesa atualizada com sucesso');
      } else {
        await api.post('/expenses', {
          description,
          value: Number(value),
          referenceMonth,
        });
        Alert.alert('Sucesso', 'Despesa cadastrada com sucesso');
      }
      setDescription('');
      setValue('');
      setReferenceMonth(format(new Date(), 'yyyy-MM'));
      setHistoryMonth(referenceMonth);
      setEditing(false);
      setEditingId(null);
      fetchExpenses();
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao cadastrar despesa');
      setEditing(false);
      setEditingId(null);
    }
  }

  async function handleDelete(id) {
    Alert.alert('Excluir', 'Deseja realmente excluir esta despesa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/expenses/${id}`);
            fetchExpenses();
          } catch {
            Alert.alert('Erro', 'Erro ao excluir despesa');
          }
        }
      }
    ]);
  }

  function handleEdit(expense) {
    setDescription(expense.description);
    setValue(String(expense.value));
    setReferenceMonth(expense.referenceMonth);
    setEditing(true);
    setEditingId(expense.id);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <Text style={styles.title}>Despesa</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
        />
        <Text style={styles.label}>Valor</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={value}
          onChangeText={setValue}
        />
        <Text style={styles.label}>Mês</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={referenceMonth}
            onValueChange={setReferenceMonth}
            style={styles.picker}
            dropdownIconColor="#222"
          >
            {months.map((m) => (
              <Picker.Item key={m.value} label={m.label.charAt(0).toUpperCase() + m.label.slice(1)} value={m.value} />
            ))}
          </Picker>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>SALVAR</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.historyTitle}>Histórico</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={historyMonth}
          onValueChange={setHistoryMonth}
          style={styles.picker}
          dropdownIconColor="#222"
        >
          {months.map((m) => (
            <Picker.Item key={m.value} label={m.label.charAt(0).toUpperCase() + m.label.slice(1)} value={m.value} />
          ))}
        </Picker>
      </View>
      {loading ? (
        <Text style={styles.loading}>Carregando...</Text>
      ) : expenses.length === 0 ? (
        <Text style={styles.empty}>Nenhuma despesa foi encontrada</Text>
      ) : (
        <View style={styles.expenseList}>
          {expenses.map((exp) => (
            <View key={exp.id} style={styles.expenseItem}>
              <Text style={styles.expenseDesc}>{exp.description}</Text>
              <Text style={styles.expenseValue}>R${exp.value}</Text>
              <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(exp)}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(exp.id)}>
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    alignSelf: 'center',
    marginVertical: 20,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#222',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 56,
    justifyContent: 'center',
  },
  picker: {
    height: 56,
    width: '100%',
    fontSize: 16,
    paddingHorizontal: 0,
    marginLeft: 0,
    marginRight: 0,
    textAlignVertical: 'center',
  },
  button: {
    backgroundColor: '#2ecc71',
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
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
  },
  loading: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 10,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 10,
  },
  expenseList: {
    marginTop: 10,
    marginBottom: 30,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eafbe7',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  expenseDesc: {
    flex: 2,
    fontWeight: 'bold',
    color: '#222',
  },
  expenseValue: {
    flex: 1,
    color: '#2ecc71',
    fontWeight: 'bold',
    textAlign: 'right',
    marginRight: 10,
  },
  editBtn: {
    backgroundColor: '#b2f2bb',
    borderRadius: 4,
    padding: 6,
    marginRight: 6,
  },
  deleteBtn: {
    backgroundColor: '#ffb3b3',
    borderRadius: 4,
    padding: 6,
  },
  editIcon: {
    fontSize: 16,
  },
  deleteIcon: {
    fontSize: 16,
  },
}); 