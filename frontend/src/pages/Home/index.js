import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { format } from 'date-fns';
import api from '../../services/api';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

export default function Home({ navigation }) {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [pickerVisible, setPickerVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setMonthlyData(null);
    loadMonthlyData();
  }, [currentMonth]);

  useEffect(() => {
    if (monthlyData !== null) {
      console.log('monthlyData:', monthlyData);
    }
  }, [monthlyData]);

  useFocusEffect(
    React.useCallback(() => {
      setCurrentMonth(format(new Date(), 'yyyy-MM'));
    }, [])
  );

  async function loadMonthlyData() {
    try {
      const response = await api.get(`/monthly-limits?month=${currentMonth}`);
      setMonthlyData(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        Alert.alert('Erro', 'Erro ao carregar dados do mês');
      }
    }
  }

  function getStatusCard() {
    if (!monthlyData || !monthlyData.limit) return null;
    const { status, remaining, totalExpenses, limit } = monthlyData;
    const now = new Date();
    const selected = new Date(limit.referenceMonth);
    const isCurrentMonth = now.getFullYear() === selected.getFullYear() && now.getMonth() === selected.getMonth();
    const isPastMonth = selected < new Date(now.getFullYear(), now.getMonth(), 1);
    const isFutureMonth = selected > new Date(now.getFullYear(), now.getMonth(), 1);
    const showProgress = isCurrentMonth || isFutureMonth;
    // 1. Ultrapassou o limite (qualquer mês)
    if (status === 'failure') {
      return {
        emoji: '😓',
        message: 'Objetivo não atingido',
        value: `-R$${Math.abs(remaining).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
        color: '#4CC95B',
        showProgress,
      };
    }
    // 2. Final do mês e economizou (mês passado)
    if (status === 'success' && isPastMonth) {
      return {
        emoji: '🤩',
        message: 'Parabéns você economizou',
        value: `R$${(totalExpenses === 0 ? Number(limit.value) : remaining).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
        color: '#4CC95B',
        showProgress: false,
      };
    }
    // 3. Progresso durante o mês atual ou futuro
    if (isCurrentMonth || isFutureMonth) {
      return {
        emoji: '🙂',
        message: 'Continue assim!',
        value: '',
        color: '#4CC95B',
        showProgress,
      };
    }
    // Caso não tenha limite, mostrar progresso não encontrado
    return null;
  }

  const statusCard = getStatusCard();

  // Geração dos meses para o Picker
  const months = [];
  const now = new Date();
  for (let i = -6; i <= 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({
      label: format(date, "MMMM/yyyy", { locale: require('date-fns/locale/pt-BR') }),
      value: format(date, 'yyyy-MM'),
    });
  }
  // Garante que o mês selecionado sempre aparece no Picker, sem duplicatas
  if (currentMonth && !months.some(m => m.value === currentMonth)) {
    const date = new Date(currentMonth + '-01');
    months.push({
      label: format(date, "MMMM/yyyy", { locale: require('date-fns/locale/pt-BR') }),
      value: currentMonth,
    });
  }
  // Remove duplicatas e ordena
  const uniqueMonths = Array.from(new Map(months.map(m => [m.value, m])).values())
    .sort((a, b) => a.value.localeCompare(b.value));

  if (!monthlyData || !monthlyData.limit || !statusCard) {
    return (
      <View style={[styles.emptyContainer, { paddingBottom: insets.bottom + 20 }]}> 
        <View style={styles.greetingBox}>
          <Text style={styles.greeting}>Olá {user?.name?.split(' ')[0] || ''} <Text style={{fontSize:22}}>👋</Text></Text>
          <Text style={styles.subGreeting}>É bom te ver por aqui!</Text>
        </View>
        <View style={styles.centerContent}>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={currentMonth}
              onValueChange={setCurrentMonth}
              style={styles.picker}
              dropdownIconColor="#222"
            >
              {uniqueMonths.map((m) => (
                <Picker.Item key={m.value} label={m.label.charAt(0).toUpperCase() + m.label.slice(1)} value={m.value} />
              ))}
            </Picker>
          </View>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>😴</Text>
            <Text style={styles.emptyText}>Progresso não encontrado</Text>
          </View>
          <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('MonthlyLimit')}>
            <Text style={styles.startButtonText}>COMEÇAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.greetingBox}>
          <Text style={styles.greeting}>Olá {user?.name?.split(' ')[0] || ''} <Text style={{fontSize:22}}>👋</Text></Text>
          <Text style={styles.subGreeting}>É bom te ver por aqui!</Text>
        </View>
        <View style={styles.centerContent}>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={currentMonth}
              onValueChange={setCurrentMonth}
              style={styles.picker}
              dropdownIconColor="#222"
            >
              {uniqueMonths.map((m) => (
                <Picker.Item key={m.value} label={m.label.charAt(0).toUpperCase() + m.label.slice(1)} value={m.value} />
              ))}
            </Picker>
          </View>
          <View style={[styles.statusCard, { backgroundColor: statusCard.color }]}> 
            <Text style={styles.statusEmoji}>{statusCard.emoji}</Text>
            <Text style={styles.statusMessage}>{statusCard.message}</Text>
            {statusCard.value !== '' && (
              <Text style={styles.statusValue}>{statusCard.value}</Text>
            )}
          </View>
          {statusCard.showProgress && (
            <>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressLabelBold}>Progresso</Text>
                <Text style={styles.progressValueBold}>
                  R$ {monthlyData.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}/R$ {Number(monthlyData.limit.value).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </Text>
              </View>
              <View style={styles.progressBarFullWidth}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          (monthlyData.totalExpenses / Number(monthlyData.limit.value)) * 100,
                          100
                        )}%`,
                        backgroundColor: '#4CC95B',
                      },
                    ]}
                  />
                </View>
              </View>
            </>
          )}
          <TouchableOpacity
            style={styles.expenseButton}
            onPress={() => navigation.navigate('NewExpense')}
          >
            <Text style={styles.expenseButtonText}>Nova Despesa</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  limitButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  limitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  success: {
    borderLeftWidth: 5,
    borderLeftColor: '#2ecc71',
  },
  warning: {
    borderLeftWidth: 5,
    borderLeftColor: '#e74c3c',
  },
  info: {
    borderLeftWidth: 5,
    borderLeftColor: '#3498db',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  cardMessage: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  progressContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    width: '90%',
    alignSelf: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  progressValue: {
    fontSize: 16,
    color: '#95a5a6',
    fontWeight: 'normal',
    alignSelf: 'flex-end',
    marginBottom: 0,
    marginTop: 0,
    marginRight: 0,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2ecc71',
    borderRadius: 9,
  },
  expenseButton: {
    marginTop: 0,
    marginBottom: 10,
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    elevation: 2,
  },
  expenseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  greetingBox: {
    width: '85%',
    alignSelf: 'flex-start',
    marginLeft: '7.5%',
    marginTop: 32,
    marginBottom: 0,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 0,
  },
  subGreeting: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
    marginTop: 2,
  },
  pickerBox: {
    backgroundColor: '#f1f3f4',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 56,
    justifyContent: 'center',
    marginBottom: 15,
    width: '90%',
    alignSelf: 'center',
    marginTop: 4,
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
  emptyCard: {
    backgroundColor: '#4CC95B',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 0,
    alignItems: 'center',
    width: '90%',
    maxWidth: 320,
    marginBottom: 18,
    marginTop: 10,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyEmoji: {
    fontSize: 54,
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyText: {
    color: '#222',
    fontSize: 17,
    marginTop: 2,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#4CC95B',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginTop: 0,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  statusCard: {
    backgroundColor: '#4CC95B',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 0,
    alignItems: 'center',
    width: '90%',
    maxWidth: 320,
    marginBottom: 18,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  statusEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 10,
  },
  statusMessage: {
    color: '#222',
    fontSize: 20,
    marginTop: 0,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 0,
  },
  statusValue: {
    color: '#222',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginBottom: 6,
    marginTop: 0,
  },
  progressLabelBold: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  progressValueBold: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  progressBarFullWidth: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 16,
    height: 28,
    backgroundColor: 'transparent',
  },
  progressBarBackground: {
    width: '100%',
    height: 28,
    backgroundColor: '#e0e0e0',
    borderRadius: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CC95B',
    borderRadius: 14,
  },
}); 