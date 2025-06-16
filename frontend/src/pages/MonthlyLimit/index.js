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
import { useFocusEffect, useRoute } from '@react-navigation/native';

export default function MonthlyLimit({ navigation }) {
  const route = useRoute();
  const { selectedMonth } = route.params || {};
  const [value, setValue] = useState('');
  const [referenceMonth, setReferenceMonth] = useState(selectedMonth || format(new Date(), 'yyyy-MM'));
  const [months, setMonths] = useState([]);
  const [queryMonth, setQueryMonth] = useState(selectedMonth || format(new Date(), 'yyyy-MM'));
  const [limit, setLimit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  function isMonthValid(month) {
    const current = new Date();
    const currentStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    return month >= currentStr;
  }

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
    fetchLimit();
  }, [queryMonth]);

  useFocusEffect(
    React.useCallback(() => {
      setValue('');
      setReferenceMonth(selectedMonth || format(new Date(), 'yyyy-MM'));
      setEditing(false);
      if (selectedMonth) {
        setQueryMonth(selectedMonth);
      }
      fetchLimit();
    }, [selectedMonth])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setValue('');
      setReferenceMonth(format(new Date(), 'yyyy-MM'));
      setQueryMonth(format(new Date(), 'yyyy-MM'));
      setEditing(false);
      if (route.params?.selectedMonth) {
        navigation.setParams({ selectedMonth: undefined });
      }
    });
    return unsubscribe;
  }, [navigation, route.params]);

  async function fetchLimit() {
    setLoading(true);
    try {
      const response = await api.get(`/monthly-limits?month=${queryMonth}`);
      setLimit(response.data || null);
    } catch (error) {
      setLimit(null);
    }
    setLoading(false);
  }

  async function handleSubmit() {
    try {
      if (!value || !referenceMonth) {
        Alert.alert('Erro', 'Preencha todos os campos');
        return;
      }

      if (!isMonthValid(referenceMonth)) {
        Alert.alert('Erro', 'Não é possível cadastrar ou editar limites de meses anteriores');
        return;
      }

      const limitId = limit && (limit.limit ? limit.limit.id : limit.id);
      if (editing && limitId) {
        await api.put(`/monthly-limits/${limitId}`, {
          value: Number(value),
          referenceMonth,
        });
        Alert.alert('Sucesso', 'Limite mensal atualizado com sucesso');
        setEditing(false);
      } else {
        await api.post('/monthly-limits', {
          value: Number(value),
          referenceMonth,
        });
        Alert.alert('Sucesso', 'Limite mensal cadastrado com sucesso');
        setEditing(false);
      }
      setValue('');
      setReferenceMonth(format(new Date(), 'yyyy-MM'));
      setQueryMonth(referenceMonth);
      fetchLimit();
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao cadastrar limite');
      setEditing(false);
    }
  }

  async function handleDelete() {
    if (!limit) return;

    const limitMonth = limit.limit ? limit.limit.referenceMonth : limit.referenceMonth;
    if (!isMonthValid(limitMonth)) {
      Alert.alert('Erro', 'Não é possível excluir limites de meses anteriores');
      return;
    }

    const limitId = limit && (limit.limit ? limit.limit.id : limit.id);

    Alert.alert('Excluir', 'Deseja realmente excluir este limite?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/monthly-limits/${limitId}`);
            setLimit(null);
            setValue('');
            setEditing(false);
            fetchLimit();
          } catch {
            Alert.alert('Erro', 'Erro ao excluir limite');
            setEditing(false);
          }
        }
      }
    ]);
  }

  function handleEdit() {
    if (!limit) return;

    const limitMonth = limit.limit ? limit.limit.referenceMonth : limit.referenceMonth;
    if (!isMonthValid(limitMonth)) {
      Alert.alert('Erro', 'Não é possível editar limites de meses anteriores');
      return;
    }

    setValue(String((limit.limit ? limit.limit.value : limit.value)));
    setReferenceMonth((limit.limit ? limit.limit.referenceMonth : limit.referenceMonth).slice(0, 7));
    setEditing(true);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <Text style={styles.title}>Limite</Text>
      <View style={styles.form}>
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
            onValueChange={(itemValue) => {
              setReferenceMonth(itemValue);
              setQueryMonth(itemValue);
            }}
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
      <Text style={styles.historyTitle}>Consulta</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={queryMonth}
          onValueChange={setQueryMonth}
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
      ) : !limit ? (
        <Text style={styles.empty}>Nenhum limite foi encontrado</Text>
      ) : (
        <View style={styles.limitBox}>
          <Text style={styles.limitText}>
            {months.find(m => m.value === queryMonth)?.label}  R${Number((limit.limit ? limit.limit.value : limit.value)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
          {isMonthValid(queryMonth) && (
            <View style={styles.limitActions}>
              <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
                <Text style={styles.actionText}>EDITAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.actionText}>EXCLUIR</Text>
              </TouchableOpacity>
            </View>
          )}
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
  limitBox: {
    backgroundColor: '#2ecc71',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  limitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  limitActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  editBtn: {
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  deleteBtn: {
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  actionText: {
    color: '#2ecc71',
    fontWeight: 'bold',
    fontSize: 14,
  },
}); 