// Importação das dependências necessárias para a tela
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
import { Picker } from '@react-native-picker/picker'; // Componente de seleção de mês
import { format } from 'date-fns'; // Para formatação de datas
import api from '../../services/api'; // Serviço para chamadas da API
import { useFocusEffect, useRoute } from '@react-navigation/native'; // Hooks de navegação

export default function NewExpense({ navigation }) {
  // Obtém parâmetros passados pela navegação
  const route = useRoute();
  const { selectedMonth } = route.params || {};
  
  // Estados do formulário de despesa
  const [description, setDescription] = useState(''); // Descrição da despesa
  const [value, setValue] = useState(''); // Valor da despesa
  const [referenceMonth, setReferenceMonth] = useState(selectedMonth || format(new Date(), 'yyyy-MM')); // Mês de referência para cadastro
  
  // Estados para consulta de histórico
  const [historyMonth, setHistoryMonth] = useState(format(new Date(), 'yyyy-MM')); // Mês selecionado para visualizar histórico
  const [months, setMonths] = useState([]); // Lista de meses disponíveis no seletor
  const [expenses, setExpenses] = useState([]); // Lista de despesas do mês consultado
  
  // Estados de controle
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [editing, setEditing] = useState(false); // Indica se está em modo de edição
  const [editingId, setEditingId] = useState(null); // ID da despesa sendo editada

  // Função que verifica se um mês é válido para operações (não pode ser mês passado)
  function isMonthValid(month) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const [year, monthNum] = month.split('-');
    
    // Permite apenas mês atual ou futuros
    return Number(year) > currentYear || 
           (Number(year) === currentYear && Number(monthNum) - 1 >= currentMonth);
  }

  // Gera lista de meses disponíveis no seletor (6 passados + 12 futuros)
  useEffect(() => {
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

  // Busca despesas sempre que o mês do histórico muda
  useEffect(() => {
    fetchExpenses();
  }, [historyMonth]);

  // Executa quando a tela ganha foco (reset de formulário se não estiver editando)
  useFocusEffect(
    React.useCallback(() => {
      if (!editing) { // Só limpa se não estiver editando uma despesa
        const initialMonth = selectedMonth || format(new Date(), 'yyyy-MM');
        setDescription(''); // Limpa descrição
        setValue(''); // Limpa valor
        setReferenceMonth(initialMonth); // Define mês para cadastro
        setHistoryMonth(initialMonth); // Define mês para histórico
      }
    }, [selectedMonth])
  );

  // Executa quando a tela perde foco (limpa todos os estados)
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setDescription(''); // Limpa descrição
      setValue(''); // Limpa valor
      setReferenceMonth(format(new Date(), 'yyyy-MM')); // Volta para mês atual
      setHistoryMonth(format(new Date(), 'yyyy-MM')); // Volta para mês atual no histórico
      setEditing(false); // Sai do modo de edição
      setEditingId(null); // Limpa ID da despesa sendo editada
      if (route.params?.selectedMonth) {
        navigation.setParams({ selectedMonth: undefined }); // Limpa parâmetro da navegação
      }
    });
    return unsubscribe;
  }, [navigation, route.params]);

  // Função para buscar despesas do mês selecionado via API
  async function fetchExpenses() {
    setLoading(true); // Ativa indicador de carregamento
    try {
      const response = await api.get(`/expenses?month=${historyMonth}`);
      setExpenses(response.data || []); // Define lista de despesas ou array vazio
    } catch (error) {
      setExpenses([]); // Em caso de erro, define lista vazia
    }
    setLoading(false); // Desativa indicador de carregamento
  }

  // Função para salvar ou atualizar uma despesa
  async function handleSubmit() {
    try {
      // Validação dos campos obrigatórios
      if (!description || !value || !referenceMonth) {
        Alert.alert('Erro', 'Preencha todos os campos');
        return;
      }

      // Verifica se o mês é válido (não pode ser passado)
      if (!isMonthValid(referenceMonth)) {
        Alert.alert('Erro', 'Não é possível cadastrar ou editar despesas de meses anteriores');
        return;
      }

      if (editing && editingId) {
        // Atualiza despesa existente
        await api.put(`/expenses/${editingId}`, {
          description,
          value: Number(value),
          referenceMonth,
        });
        Alert.alert('Sucesso', 'Despesa atualizada com sucesso');
        setDescription('');
        setValue('');
        setReferenceMonth(referenceMonth);
        setHistoryMonth(referenceMonth);
        setEditing(false);
        setEditingId(null);
        fetchExpenses();
      } else {
        // Cria nova despesa
        await api.post('/expenses', {
          description,
          value: Number(value),
          referenceMonth,
        });
        Alert.alert('Sucesso', 'Despesa cadastrada com sucesso');
        setDescription('');
        setValue('');
        setReferenceMonth(selectedMonth || format(new Date(), 'yyyy-MM'));
        setHistoryMonth(referenceMonth);
        setEditing(false);
        setEditingId(null);
        fetchExpenses();
      }
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao cadastrar despesa');
      setEditing(false);
      setEditingId(null);
    }
  }

  // Função para excluir uma despesa
  async function handleDelete(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return; // Não faz nada se a despesa não for encontrada

    // Verifica se o mês da despesa pode ser editado
    if (!isMonthValid(expense.referenceMonth)) {
      Alert.alert('Erro', 'Não é possível excluir despesas de meses anteriores');
      return;
    }

    // Mostra confirmação antes de excluir
    Alert.alert('Excluir', 'Deseja realmente excluir esta despesa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/expenses/${id}`); // Exclui via API
            fetchExpenses(); // Atualiza lista de despesas
          } catch {
            Alert.alert('Erro', 'Erro ao excluir despesa');
          }
        }
      }
    ]);
  }

  // Função para iniciar edição de uma despesa existente
  function handleEdit(expense) {
    // Verifica se o mês da despesa pode ser editado
    if (!isMonthValid(expense.referenceMonth)) {
      Alert.alert('Erro', 'Não é possível editar despesas de meses anteriores');
      return;
    }

    // Preenche formulário com dados da despesa existente
    setDescription(expense.description); // Define descrição no campo
    setValue(String(expense.value)); // Define valor no campo
    setReferenceMonth(expense.referenceMonth.slice(0, 7)); // Define mês no seletor
    setEditing(true); // Ativa modo de edição
    setEditingId(expense.id); // Define ID da despesa sendo editada
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <Text style={styles.title}>Despesa</Text>
      
      {/* Formulário para cadastro/edição de despesas */}
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
            onValueChange={(value) => {
              setReferenceMonth(value); // Define mês para cadastro
              setHistoryMonth(value); // Também atualiza histórico para o mesmo mês
            }}
            style={styles.picker}
            dropdownIconColor="#222"
          >
            {months.map((m) => (
              <Picker.Item key={m.value} label={m.label.charAt(0).toUpperCase() + m.label.slice(1)} value={m.value} />
            ))}
          </Picker>
        </View>
        
        {/* Botão para salvar/atualizar despesa */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>SALVAR</Text>
        </TouchableOpacity>
      </View>
      
      {/* Seção de histórico de despesas */}
      <Text style={styles.historyTitle}>Histórico</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={historyMonth}
          onValueChange={setHistoryMonth} // Muda apenas o mês do histórico
          style={styles.picker}
          dropdownIconColor="#222"
        >
          {months.map((m) => (
            <Picker.Item key={m.value} label={m.label.charAt(0).toUpperCase() + m.label.slice(1)} value={m.value} />
          ))}
        </Picker>
      </View>
      
      {/* Lista de despesas do mês selecionado */}
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
              
              {/* Botões de ação - só aparecem para meses válidos (atual ou futuros) */}
              {isMonthValid(exp.referenceMonth) && (
                <>
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(exp)}>
                    <Text style={styles.editIcon}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(exp.id)}>
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </>
              )}
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