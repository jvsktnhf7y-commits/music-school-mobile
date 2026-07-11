import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator,
         RefreshControl, TouchableOpacity } from 'react-native';
import { parentGetDashboard, logout } from '../../services/api';
import { COLORS } from '../../theme';

export default function ParentDashboard({ navigation }) {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await parentGetDashboard();
      if (res.ok) setData(res);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.warning} /></View>;

  const prepaid   = data?.prepaid ?? 0;
  const rate      = data?.rate ?? 50;
  const covered   = rate > 0 ? Math.floor(prepaid / rate) : 0;
  const balColor  = prepaid > 0 ? COLORS.success : COLORS.danger;
  const latest    = data?.latest_note;

  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.warning} />}>
      <Text style={s.greeting}>Hi, {data?.student_name}! 👋</Text>

      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={[s.statVal, { color: balColor }]}>${prepaid.toFixed(2)}</Text>
          <Text style={s.statLbl}>Balance</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statVal}>{covered}</Text>
          <Text style={s.statLbl}>Lessons Covered</Text>
        </View>
      </View>

      {latest ? (
        <View style={[s.card, { borderColor: '#a5b4fc' }]}>
          <Text style={s.cardTitle}>📌 Latest Note — {latest.date}</Text>
          <Text style={s.noteText}>{latest.notes}</Text>
          {!!latest.assignment && (
            <View style={s.assignBox}>
              <Text style={s.assignText}><Text style={{ fontWeight: '700' }}>Assignment: </Text>{latest.assignment}</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={s.card}><Text style={{ color: COLORS.muted }}>No lesson notes yet.</Text></View>
      )}

      <TouchableOpacity onPress={async () => { await logout(); navigation.replace('RoleSelect'); }}
        style={{ marginTop: 24, alignItems: 'center' }}>
        <Text style={{ color: COLORS.muted, fontSize: 14 }}>🚪 Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap:       { flex: 1, backgroundColor: COLORS.bg },
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  greeting:   { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 20 },
  statsRow:   { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stat:       { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: 16,
                alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statVal:    { fontSize: 22, fontWeight: '800', color: COLORS.text },
  statLbl:    { fontSize: 11, color: COLORS.muted, marginTop: 2, textTransform: 'uppercase' },
  card:       { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12,
                borderWidth: 1, borderColor: COLORS.border },
  cardTitle:  { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  noteText:   { fontSize: 13, color: COLORS.subtext, lineHeight: 18 },
  assignBox:  { marginTop: 10, backgroundColor: '#f0fdf4', borderLeftWidth: 3,
                borderLeftColor: COLORS.success, padding: 10, borderRadius: 6 },
  assignText: { fontSize: 13, color: '#065f46' },
});
