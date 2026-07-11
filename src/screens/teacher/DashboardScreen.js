import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator,
         RefreshControl, TouchableOpacity } from 'react-native';
import { teacherGetDashboard, logout } from '../../services/api';
import { COLORS } from '../../theme';

export default function TeacherDashboard({ navigation }) {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await teacherGetDashboard();
      if (res.ok) setData(res);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.success} /></View>;

  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.success} />}>
      <Text style={s.greeting}>Welcome back, {data?.name}! 👋</Text>

      <View style={s.statsGrid}>
        {[
          { icon: '👥', val: data?.student_count ?? 0,                      lbl: 'Students' },
          { icon: '💰', val: `$${(data?.this_month ?? 0).toFixed(2)}`,       lbl: 'This Month' },
          { icon: '📈', val: `$${(data?.total_revenue ?? 0).toFixed(2)}`,    lbl: 'All-Time' },
        ].map(({ icon, val, lbl }) => (
          <View key={lbl} style={s.stat}>
            <Text style={s.statIcon}>{icon}</Text>
            <Text style={s.statVal}>{val}</Text>
            <Text style={s.statLbl}>{lbl}</Text>
          </View>
        ))}
      </View>

      <Text style={s.sectionTitle}>Student Balances</Text>
      {(data?.balances || []).map(b => {
        const color = b.prepaid > 0 ? COLORS.success : COLORS.danger;
        return (
          <View key={b.name} style={s.balRow}>
            <Text style={s.balName}>{b.prepaid > 0 ? '🟢' : '🔴'} {b.name}</Text>
            <Text style={[s.balAmt, { color }]}>${b.prepaid.toFixed(2)}</Text>
          </View>
        );
      })}
      {!data?.balances?.length && <Text style={{ color: COLORS.muted, fontSize: 13 }}>No students yet.</Text>}

      <TouchableOpacity onPress={async () => { await logout(); navigation.replace('RoleSelect'); }}
        style={{ marginTop: 28, alignItems: 'center' }}>
        <Text style={{ color: COLORS.muted, fontSize: 14 }}>🚪 Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap:        { flex: 1, backgroundColor: COLORS.bg },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  greeting:    { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 20 },
  statsGrid:   { flexDirection: 'row', gap: 10, marginBottom: 24 },
  stat:        { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: 14,
                 alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statIcon:    { fontSize: 22, marginBottom: 6 },
  statVal:     { fontSize: 18, fontWeight: '800', color: COLORS.text },
  statLbl:     { fontSize: 10, color: COLORS.muted, marginTop: 2, textTransform: 'uppercase' },
  sectionTitle:{ fontSize: 13, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase',
                 letterSpacing: 1, marginBottom: 12 },
  balRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                 paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  balName:     { fontSize: 14, fontWeight: '600', color: COLORS.text },
  balAmt:      { fontSize: 14, fontWeight: '700' },
});
