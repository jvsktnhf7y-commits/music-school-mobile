import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { teacherGetPayments } from '../../services/api';
import { COLORS } from '../../theme';

export default function TeacherPaymentsScreen() {
  const [txns,       setTxns]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await teacherGetPayments();
      if (res.ok) setTxns(res.transactions);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.success} /></View>;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      data={txns}
      keyExtractor={(_, i) => String(i)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.success} />}
      ListEmptyComponent={<Text style={{ color: COLORS.muted, textAlign: 'center', padding: 40 }}>No transactions yet.</Text>}
      renderItem={({ item: t }) => {
        const isPayment = t.status === 'Payment';
        return (
          <View style={s.card}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.student}>{t.student_name}</Text>
                <Text style={s.date}>{t.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.amount, { color: t.amount > 0 ? COLORS.success : COLORS.danger }]}>
                  {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                </Text>
                <Text style={s.status}>{t.status}</Text>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  card:    { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 10,
             borderWidth: 1, borderColor: COLORS.border },
  row:     { flexDirection: 'row', alignItems: 'center' },
  student: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  date:    { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  amount:  { fontSize: 16, fontWeight: '800' },
  status:  { fontSize: 11, color: COLORS.muted, marginTop: 2 },
});
