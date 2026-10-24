import { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, Modal, Alert, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://192.168.137.1:3000/api';

type Summary = {
  totalLent: number;
  totalRepaid: number;
  overdueAmount: number;
};

type Loan = {
  id: string;
  friendName: string;
  amount: number;
  dueDate: string;
  isRepaid: boolean;
};

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');

  // App State
  const [summary, setSummary] = useState<Summary>({ totalLent: 0, totalRepaid: 0, overdueAmount: 0 });
  const [loans, setLoans] = useState<Loan[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [friendName, setFriendName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('2026-11-01');

  const fetchData = useCallback(async (authToken: string) => {
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      const [sumRes, loansRes] = await Promise.all([
        axios.get(`${API_URL}/loans/summary`, { headers }),
        axios.get(`${API_URL}/loans`, { headers }),
      ]);
      setSummary(sumRes.data);
      setLoans(loansRes.data);
    } catch (e) {
      console.log('Fetch error', e);
    }
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const savedToken = await AsyncStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        await fetchData(savedToken);
      }
    };

    void checkToken();
  }, [fetchData]);

  const handleSendOtp = async () => {
    try {
      await axios.post(`${API_URL}/auth/send-otp`, { phoneNumber: phone });
      setStep('OTP');
      Alert.alert('OTP Sent', 'Check backend terminal logs for 4-digit code (default: 1234)');
    } catch {
      Alert.alert('Error', 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { phoneNumber: phone, otp });
      await AsyncStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      await fetchData(res.data.token);
    } catch {
      Alert.alert('Error', 'Invalid OTP');
    }
  };

  const handleAddLoan = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_URL}/loans`, { friendName, amount, dueDate }, { headers });
      setModalVisible(false);
      setFriendName('');
      setAmount('');
      fetchData(token!);
    } catch {
      Alert.alert('Error', 'Failed to add loan entry');
    }
  };

  const handleRepay = async (id: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`${API_URL}/loans/${id}/repay`, {}, { headers });
      fetchData(token!);
    } catch {
      Alert.alert('Error', 'Failed to mark as repaid');
    }
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.title}>MiniLedger 💸</Text>
        {step === 'PHONE' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter Phone Number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <TouchableOpacity style={styles.btn} onPress={handleSendOtp}>
              <Text style={styles.btnText}>Send OTP</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP (Check Logs)"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
            />
            <TouchableOpacity style={styles.btn} onPress={handleVerifyOtp}>
              <Text style={styles.btnText}>Verify & Login</Text>
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Dashboard Summary</Text>
        <View style={styles.summaryRow}>
          <View><Text style={styles.subText}>Total Lent</Text><Text style={styles.val}>₹{summary.totalLent}</Text></View>
          <View><Text style={styles.subText}>Repaid</Text><Text style={styles.val}>₹{summary.totalRepaid}</Text></View>
          <View><Text style={styles.subText}>Overdue</Text><Text style={[styles.val, { color: '#e74c3c' }]}>₹{summary.overdueAmount}</Text></View>
        </View>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.btnText}>+ Add New Entry</Text>
      </TouchableOpacity>

      {/* Loan Entries List */}
      <FlatList<Loan>
        data={loans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Loan }) => {
          const isOverdue = !item.isRepaid && new Date(item.dueDate) < new Date();
          return (
            <View style={[styles.loanItem, isOverdue && styles.overdueItem]}>
              <View>
                <Text style={styles.friendText}>{item.friendName}</Text>
                <Text style={styles.dateText}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
                {isOverdue && <Text style={styles.overdueBadge}>OVERDUE</Text>}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amountText}>₹{item.amount}</Text>
                {item.isRepaid ? (
                  <Text style={{ color: 'green', fontWeight: 'bold' }}>✓ Repaid</Text>
                ) : (
                  <TouchableOpacity onPress={() => handleRepay(item.id)}>
                    <Text style={styles.repayBtn}>Mark Repaid</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Modal Form */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.title}>Add Loan Entry</Text>
          <TextInput style={styles.input} placeholder="Friend Name" value={friendName} onChangeText={setFriendName} />
          <TextInput style={styles.input} placeholder="Amount (₹)" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          <TextInput style={styles.input} placeholder="Due Date (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} />
          
          <TouchableOpacity style={styles.btn} onPress={handleAddLoan}>
            <Text style={styles.btnText}>Save Entry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#7f8c8d', marginTop: 10 }]} onPress={() => setModalVisible(false)}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15 },
  btn: { width: '100%', height: 50, backgroundColor: '#2ecc71', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  summaryCard: { backgroundColor: '#2c3e50', borderRadius: 12, padding: 20, marginBottom: 15 },
  summaryTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  subText: { color: '#bdc3c7', fontSize: 12 },
  val: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  addBtn: { backgroundColor: '#3498db', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  loanItem: { backgroundColor: '#fff', padding: 15, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  overdueItem: { borderColor: '#e74c3c', borderWidth: 1.5, backgroundColor: '#fdf2f2' },
  friendText: { fontSize: 16, fontWeight: 'bold' },
  dateText: { color: '#7f8c8d', fontSize: 12 },
  amountText: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  repayBtn: { color: '#3498db', fontWeight: 'bold', marginTop: 5 },
  overdueBadge: { color: '#e74c3c', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  modalContainer: { flex: 1, padding: 20, justifyContent: 'center' },
});
