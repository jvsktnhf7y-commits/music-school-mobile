import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator,
         RefreshControl, TouchableOpacity } from 'react-native';
import { schoolGetDashboard, logout } from '../../services/api';
import { COLORS } from '../../theme';

export default function SchoolDashboard({ navigation }) {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await schoolGetDashboard();
      if (res.ok) setData(res);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.primary} />}>
      <Text style={s.schoolName}>{data?.school_name || 'My School'}</Text>

      <View style={s.statsGrid}>
        {[
          { icon: '👩‍🏫', val: data?.teacher_count ?? 0, lbl: 'Teachers' },
          { icon: '👥', val: data?.student_count ?? 0, lbl: 'Students' },
          { icon: '💰', val: `$${(data?.this_month ?? 0).toFixed(2)}`, lbl: 'This Month' },
          { icon: '📈', val: `$${(data?.total_revenue ?? 0).toFixed(2)}`, lbl: 'All-Time' },
        ].map(({ icon, val, lbl }) => (
          <View key={lbl} style={s.stat}>
            <Text style={s.statIcon}>{icon}</Text>
            <Text style={s.statVal}>{val}</Text>
            <Text style={s.statLbl}>{lbl}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('Teachers')} activeOpacity={0.8}>
        <Text style={s.actionText}>👩‍🏫  Manage Teachers</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.actionBtn, { borderColor: COLORS.success }]}
        onPress={() => navigation.navigate('Analytics')} activeOpacity={0.8}>
        <Text style={[s.actionText, { color: COLORS.success }]}>📊  View Analytics</Text>
      </TouchableOpacity>

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
  schoolName: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 20 },
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  stat:       { flex: 1, minWidth: '45%', backgroundColor: COLORS.card, borderRadius: 14,
                padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statIcon:   { fontSize: 26, marginBottom: 6 },
  statVal:    { fontSize: 22, fontWeight: '800', color: COLORS.text },
  statLbl:    { fontSize: 11, color: COLORS.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  actionBtn:  { borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 14, padding: 16,
                alignItems: 'center', marginBottom: 12, backgroundColor: COLORS.card },
  actionText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
});
