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

export default function MonthlyLimit({ navigation }) {
  // Obtém parâmetros passados pela navegação
  const route = useRoute();
  const { selectedMonth } = route.params || {};
  
  // Estados do componente
  const [value, setValue] = useState(''); // Valor do limite a ser cadastrado/editado
  const [referenceMonth, setReferenceMonth] = useState(selectedMonth || format(new Date(), 'yyyy-MM')); // Mês de referência para cadastro
  const [months, setMonths] = useState([]); // Lista de meses disponíveis no seletor
  const [queryMonth, setQueryMonth] = useState(selectedMonth || format(new Date(), 'yyyy-MM')); // Mês selecionado para consulta
  const [limit, setLimit] = useState(null); // Dados do limite consultado
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [editing, setEditing] = useState(false); // Indica se está em modo de edição

  // Função que verifica se um mês é válido para operações (não pode ser mês passado)
  function isMonthValid(month) {
    const current = new Date();
    const currentStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    return month >= currentStr; // Permite apenas mês atual ou futuros
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

  // Busca dados do limite sempre que o mês de consulta muda
  useEffect(() => {
    fetchLimit();
  }, [queryMonth]);

  // Executa quando a tela ganha foco (reset de estados e busca de dados)
  useFocusEffect(
    React.useCallback(() => {
      setValue(''); // Limpa campo de valor
      setReferenceMonth(selectedMonth || format(new Date(), 'yyyy-MM')); // Define mês para cadastro
      setEditing(false); // Sai do modo de edição
      if (selectedMonth) {
        setQueryMonth(selectedMonth); // Define mês para consulta se veio por parâmetro
      }
      fetchLimit(); // Busca dados do limite
    }, [selectedMonth])
  );

  // Executa quando a tela perde foco (limpa estados)
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setValue(''); // Limpa campo de valor
      setReferenceMonth(format(new Date(), 'yyyy-MM')); // Volta para mês atual
      setQueryMonth(format(new Date(), 'yyyy-MM')); // Volta para mês atual na consulta
      setEditing(false); // Sai do modo de edição
      if (route.params?.selectedMonth) {
        navigation.setParams({ selectedMonth: undefined }); // Limpa parâmetro da navegação
      }
    });
    return unsubscribe;
  }, [navigation, route.params]);

  // Função para buscar dados do limite do mês selecionado via API
  async function fetchLimit() {
    setLoading(true); // Ativa indicador de carregamento
    try {
      const response = await api.get(`/monthly-limits?month=${queryMonth}`);
      setLimit(response.data || null); // Define dados do limite ou null se não encontrar
    } catch (error) {
      setLimit(null); // Em caso de erro, define limite como null
    }
    setLoading(false); // Desativa indicador de carregamento
  }

  // Função para salvar ou atualizar um limite mensal
  async function handleSubmit() {
    try {
      // Validação dos campos obrigatórios
      if (!value || !referenceMonth) {
        Alert.alert('Erro', 'Preencha todos os campos');
        return;
      }

      // Verifica se o mês é válido (não pode ser passado)
      if (!isMonthValid(referenceMonth)) {
        Alert.alert('Erro', 'Não é possível cadastrar ou editar limites de meses anteriores');
        return;
      }

      // Obtém ID do limite para operações de edição
      const limitId = limit && (limit.limit ? limit.limit.id : limit.id);
      
      if (editing && limitId) {
        // Atualiza limite existente
        await api.put(`/monthly-limits/${limitId}`, {
          value: Number(value),
          referenceMonth,
        });
        Alert.alert('Sucesso', 'Limite mensal atualizado com sucesso');
        setEditing(false);
      } else {
        // Cria novo limite
        await api.post('/monthly-limits', {
          value: Number(value),
          referenceMonth,
        });
        Alert.alert('Sucesso', 'Limite mensal cadastrado com sucesso');
        setEditing(false);
      }
      
      // Limpa formulário e atualiza dados
      setValue('');
      setReferenceMonth(format(new Date(), 'yyyy-MM'));
      setQueryMonth(referenceMonth);
      fetchLimit();
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao cadastrar limite');
      setEditing(false);
    }
  }

  // Função para excluir um limite mensal
  async function handleDelete() {
    if (!limit) return; // Não faz nada se não há limite

    // Verifica se o mês do limite pode ser editado
    const limitMonth = limit.limit ? limit.limit.referenceMonth : limit.referenceMonth;
    if (!isMonthValid(limitMonth)) {
      Alert.alert('Erro', 'Não é possível excluir limites de meses anteriores');
      return;
    }

    const limitId = limit && (limit.limit ? limit.limit.id : limit.id);

    // Mostra confirmação antes de excluir
    Alert.alert('Excluir', 'Deseja realmente excluir este limite?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/monthly-limits/${limitId}`); // Exclui via API
            setLimit(null); // Remove limite do estado
            setValue(''); // Limpa formulário
            setEditing(false); // Sai do modo de edição
            fetchLimit(); // Atualiza dados
          } catch {
            Alert.alert('Erro', 'Erro ao excluir limite');
            setEditing(false);
          }
        }
      }
    ]);
  }

  // Função para iniciar edição de um limite existente
  function handleEdit() {
    if (!limit) return; // Não faz nada se não há limite

    // Verifica se o mês do limite pode ser editado
    const limitMonth = limit.limit ? limit.limit.referenceMonth : limit.referenceMonth;
    if (!isMonthValid(limitMonth)) {
      Alert.alert('Erro', 'Não é possível editar limites de meses anteriores');
      return;
    }

    // Preenche formulário com dados do limite existente
    setValue(String((limit.limit ? limit.limit.value : limit.value))); // Define valor no campo
    setReferenceMonth((limit.limit ? limit.limit.referenceMonth : limit.referenceMonth).slice(0, 7)); // Define mês no seletor
    setEditing(true); // Ativa modo de edição
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <Text style={styles.title}>Limite</Text>
      
      {/* Formulário para cadastro/edição de limites */}
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
              setReferenceMonth(itemValue); // Define mês para cadastro
              setQueryMonth(itemValue); // Também atualiza consulta para o mesmo mês
            }}
            style={styles.picker}
            dropdownIconColor="#222"
          >
            {months.map((m) => (
              <Picker.Item key={m.value} label={m.label.charAt(0).toUpperCase() + m.label.slice(1)} value={m.value} />
            ))}
          </Picker>
        </View>
        
        {/* Botão para salvar/atualizar limite */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>SALVAR</Text>
        </TouchableOpacity>
      </View>
      
      {/* Seção de consulta de limites existentes */}
      <Text style={styles.historyTitle}>Consulta</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={queryMonth}
          onValueChange={setQueryMonth} // Muda apenas o mês de consulta
          style={styles.picker}
          dropdownIconColor="#222"
        >
          {months.map((m) => (
            <Picker.Item key={m.value} label={m.label.charAt(0).toUpperCase() + m.label.slice(1)} value={m.value} />
          ))}
        </Picker>
      </View>
      
      {/* Resultado da consulta */}
      {loading ? (
        <Text style={styles.loading}>Carregando...</Text>
      ) : !limit ? (
        <Text style={styles.empty}>Nenhum limite foi encontrado</Text>
      ) : (
        <View style={styles.limitBox}>
          {/* Exibe informações do limite encontrado */}
          <Text style={styles.limitText}>
            {months.find(m => m.value === queryMonth)?.label}  R${Number((limit.limit ? limit.limit.value : limit.value)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
          
          {/* Botões de ação - só aparecem para meses válidos (atual ou futuros) */}
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