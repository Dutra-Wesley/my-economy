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

export default function Home({ navigation }) {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [pickerVisible, setPickerVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadMonthlyData();
  }, [currentMonth]);

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

  function getStatusMessage() {
    if (!monthlyData) {
      return {
        title: 'Nenhum limite definido',
        message: 'Defina um limite mensal para começar a controlar suas despesas',
        type: 'info',
      };
    }

    if (monthlyData.status === 'success') {
      return {
        title: 'Parabéns!',
        message: `Você economizou R$ ${monthlyData.remaining.toFixed(2)} este mês`,
        type: 'success',
      };
    }

    return {
      title: 'Atenção!',
      message: `Você ultrapassou o limite em R$ ${Math.abs(monthlyData.remaining).toFixed(2)}`,
      type: 'warning',
    };
  }

  const status = getStatusMessage();

  // Geração dos meses para o Picker
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: format(date, "MMMM/yyyy", { locale: require('date-fns/locale/pt-BR') }),
      value: format(date, 'yyyy-MM'),
    });
  }

  if (!monthlyData) {
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
              {months.map((m) => (
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Economy</Text>
        <TouchableOpacity
          style={styles.limitButton}
          onPress={() => navigation.navigate('MonthlyLimit')}
        >
          <Text style={styles.limitButtonText}>Definir Limite</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, styles[status.type]]}>
        <Text style={styles.cardTitle}>{status.title}</Text>
        <Text style={styles.cardMessage}>{status.message}</Text>
      </View>

      {monthlyData && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progresso do Mês</Text>
            <Text style={styles.progressValue}>
              R$ {monthlyData.totalExpenses.toFixed(2)} / R$ {monthlyData.limit.value.toFixed(2)}
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    (monthlyData.totalExpenses / monthlyData.limit.value) * 100,
                    100
                  )}%`,
                  backgroundColor:
                    monthlyData.status === 'success' ? '#2ecc71' : '#e74c3c',
                },
              ]}
            />
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.expenseButton}
        onPress={() => navigation.navigate('NewExpense')}
      >
        <Text style={styles.expenseButtonText}>Nova Despesa</Text>
      </TouchableOpacity>
    </ScrollView>
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
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  progressValue: {
    fontSize: 16,
    color: '#7f8c8d',
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
  },
  expenseButton: {
    margin: 20,
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  expenseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#fff',
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
    width: '100%',
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 0,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    height: 44,
    justifyContent: 'center',
    minWidth: '100%',
    overflow: 'visible',
  },
  emptyCard: {
    backgroundColor: '#4CC95B',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 12,
    alignItems: 'center',
    width: '85%',
    marginBottom: 24,
    marginTop: 10,
    alignSelf: 'center',
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
    paddingHorizontal: 0,
    alignItems: 'center',
    width: '85%',
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
  },
}); 