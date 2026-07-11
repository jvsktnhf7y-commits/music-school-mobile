import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { parentGetPayments } from '../../services/api';
import { COLORS } from '../../theme';

export default function ParentPaymentsScreen() {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await parentGetPayments();
      if (res.ok) setData(res);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.warning} /></View>;

  const prepaid  = data?.prepaid ?? 0;
  const balColor = prepaid > 0 ? COLORS.success : COLORS.danger;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      data={data?.transactions || []}
      keyExtractor={(_, i) => String(i)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.warning} />}
      ListHeaderComponent={
        <View style={[s.balCard, { borderColor: balColor }]}>
          <Text style={s.balLabel}>Current Balance</Text>
          <Text style={[s.balVal, { color: balColor }]}>${prepaid.toFixed(2)}</Text>
          <Text style={s.balSub}>${data?.rate?.toFixed(2) ?? '50.00'} per lesson</Text>
        </View>
      }
      ListEmptyComponent={<Text style={{ color: COLORS.muted, textAlign: 'center', padding: 20 }}>No transactions yet.</Text>}
      renderItem={({ item: t }) => (
        <View style={s.card}>
          <View style={s.row}>
            <View>
              <Text style={s.status}>{t.status}</Text>
              <Text style={s.date}>{t.date}</Text>
            </View>
            <Text style={[s.amount, { color: t.amount > 0 ? COLORS.success : COLORS.danger }]}>
              {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  center:   { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  balCard:  { backgroundColor: COLORS.card, borderRadius: 16, padding: 22,
              borderWidth: 2, alignItems: 'center', marginBottom: 16 },
  balLabel: { fontSize: 12, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1 },
  balVal:   { fontSize: 36, fontWeight: '800', marginTop: 4 },
  balSub:   { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  card:     { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 10,
              borderWidth: 1, borderColor: COLORS.border },
  row:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  status:   { fontSize: 14, fontWeight: '600', color: COLORS.text },
  date:     { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  amount:   { fontSize: 18, fontWeight: '800' },
});
