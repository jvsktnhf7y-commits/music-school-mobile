import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { schoolGetAnalytics } from '../../services/api';
import { COLORS } from '../../theme';

export default function SchoolAnalyticsScreen() {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await schoolGetAnalytics();
      if (res.ok) setData(res);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const monthly = data?.monthly || [];
  const maxRev  = Math.max(...monthly.map(m => m.rev), 1);

  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.primary} />}>

      <View style={s.statsGrid}>
        {[
          { icon: '💰', val: `$${(monthly[monthly.length-1]?.rev ?? 0).toFixed(2)}`, lbl: 'This Month' },
          { icon: '📈', val: `$${(data?.total_revenue ?? 0).toFixed(2)}`, lbl: 'All-Time' },
          { icon: '👩‍🏫', val: data?.teacher_count ?? 0, lbl: 'Teachers' },
          { icon: '👥', val: data?.student_count ?? 0, lbl: 'Students' },
        ].map(({ icon, val, lbl }) => (
          <View key={lbl} style={s.stat}>
            <Text style={s.statIcon}>{icon}</Text>
            <Text style={s.statVal}>{val}</Text>
            <Text style={s.statLbl}>{lbl}</Text>
          </View>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>📊 Monthly Revenue</Text>
        <View style={s.barChart}>
          {monthly.map((m, i) => (
            <View key={i} style={s.barCol}>
              <Text style={s.barAmt}>${m.rev > 0 ? m.rev.toFixed(0) : ''}</Text>
              <View style={[s.bar, { height: Math.max(4, (m.rev / maxRev) * 120) }]} />
              <Text style={s.barLabel}>{m.label.split(' ')[0]}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap:      { flex: 1, backgroundColor: COLORS.bg },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  stat:      { flex: 1, minWidth: '45%', backgroundColor: COLORS.card, borderRadius: 14,
               padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statIcon:  { fontSize: 24, marginBottom: 6 },
  statVal:   { fontSize: 20, fontWeight: '800', color: COLORS.text },
  statLbl:   { fontSize: 11, color: COLORS.muted, marginTop: 2, textTransform: 'uppercase' },
  card:      { backgroundColor: COLORS.card, borderRadius: 14, padding: 16,
               borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  barChart:  { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160 },
  barCol:    { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar:       { width: '70%', backgroundColor: COLORS.primary, borderRadius: 4, marginBottom: 6 },
  barAmt:    { fontSize: 9, color: COLORS.muted, marginBottom: 2 },
  barLabel:  { fontSize: 10, color: COLORS.muted, marginTop: 4 },
});
