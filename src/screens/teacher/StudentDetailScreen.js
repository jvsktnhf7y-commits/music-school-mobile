import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator,
         RefreshControl, TouchableOpacity, Alert, TextInput } from 'react-native';
import { teacherGetStudent, teacherChargeStudent, teacherPayStudent } from '../../services/api';
import { COLORS } from '../../theme';

export default function StudentDetailScreen({ route, navigation }) {
  const { student_id, name } = route.params;
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [amount,     setAmount]     = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await teacherGetStudent(student_id);
      if (res.ok) setData(res);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, [student_id]);

  useEffect(() => { load(); }, [load]);

  async function handleCharge() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { Alert.alert('Enter a valid amount'); return; }
    setActionLoading(true);
    try {
      await teacherChargeStudent(student_id, amt);
      setAmount('');
      load(true);
    } catch { Alert.alert('Error', 'Could not record charge'); }
    finally { setActionLoading(false); }
  }

  async function handlePayment() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { Alert.alert('Enter a valid amount'); return; }
    setActionLoading(true);
    try {
      await teacherPayStudent(student_id, amt);
      setAmount('');
      load(true);
    } catch { Alert.alert('Error', 'Could not record payment'); }
    finally { setActionLoading(false); }
  }

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.success} /></View>;

  const student = data?.student;
  const prepaid = student?.prepaid ?? 0;
  const balColor = prepaid > 0 ? COLORS.success : COLORS.danger;

  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.success} />}>

      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={[s.statVal, { color: balColor }]}>${prepaid.toFixed(2)}</Text>
          <Text style={s.statLbl}>Balance</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statVal}>${student?.rate?.toFixed(2) ?? '50.00'}</Text>
          <Text style={s.statLbl}>Rate/Lesson</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statVal}>${data?.total_charged?.toFixed(2) ?? '0.00'}</Text>
          <Text style={s.statLbl}>Total Charged</Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Quick Action</Text>
        <TextInput style={s.input} value={amount} onChangeText={setAmount}
          placeholder="Amount ($)" placeholderTextColor={COLORS.muted}
          keyboardType="decimal-pad" />
        <View style={s.btnRow}>
          <TouchableOpacity style={[s.btn, { backgroundColor: COLORS.success }]}
            onPress={handlePayment} disabled={actionLoading} activeOpacity={0.8}>
            <Text style={s.btnText}>+ Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btn, { backgroundColor: COLORS.danger }]}
            onPress={handleCharge} disabled={actionLoading} activeOpacity={0.8}>
            <Text style={s.btnText}>- Charge</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={[s.card, { borderColor: COLORS.primary }]}
        onPress={() => navigation.navigate('AddNote', { student_id, student_name: name })}
        activeOpacity={0.8}>
        <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 15, textAlign: 'center' }}>
          📝 Add Lesson Note
        </Text>
      </TouchableOpacity>

      <Text style={s.sectionTitle}>Recent Notes</Text>
      {(data?.notes || []).slice(0, 5).map((n, i) => (
        <View key={i} style={s.noteCard}>
          <Text style={s.noteDate}>{n.date}</Text>
          <Text style={s.noteText}>{n.notes}</Text>
          {!!n.assignment && <Text style={s.noteAssign}>📌 {n.assignment}</Text>}
        </View>
      ))}
      {!data?.notes?.length && <Text style={{ color: COLORS.muted, fontSize: 13 }}>No notes yet.</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap:      { flex: 1, backgroundColor: COLORS.bg },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  statsRow:  { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stat:      { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, padding: 12,
               alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statVal:   { fontSize: 16, fontWeight: '800', color: COLORS.text },
  statLbl:   { fontSize: 10, color: COLORS.muted, marginTop: 2, textTransform: 'uppercase' },
  card:      { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12,
               borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.subtext, marginBottom: 12 },
  input:     { backgroundColor: COLORS.bg, borderWidth: 1.5, borderColor: COLORS.border,
               borderRadius: 10, padding: 12, fontSize: 16, color: COLORS.text, marginBottom: 12 },
  btnRow:    { flexDirection: 'row', gap: 10 },
  btn:       { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  btnText:   { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase',
                  letterSpacing: 1, marginBottom: 10 },
  noteCard:  { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 8,
               borderWidth: 1, borderColor: COLORS.border },
  noteDate:  { fontSize: 11, color: COLORS.muted, marginBottom: 4 },
  noteText:  { fontSize: 13, color: COLORS.text },
  noteAssign:{ fontSize: 12, color: COLORS.success, marginTop: 6 },
});
