import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator,
         RefreshControl, TouchableOpacity } from 'react-native';
import { schoolGetTeachers } from '../../services/api';
import { COLORS } from '../../theme';

export default function SchoolTeachersScreen({ navigation }) {
  const [teachers,   setTeachers]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await schoolGetTeachers();
      if (res.ok) setTeachers(res.teachers);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      data={teachers}
      keyExtractor={t => t.teacher_id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.primary} />}
      ListEmptyComponent={
        <View style={s.center}>
          <Text style={{ fontSize: 36, marginBottom: 10 }}>👩‍🏫</Text>
          <Text style={{ color: COLORS.muted, fontSize: 15 }}>No teachers yet.</Text>
          <Text style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>Invite them from the web dashboard.</Text>
        </View>
      }
      renderItem={({ item: t }) => (
        <View style={s.card}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{t.name}</Text>
              <Text style={s.email}>{t.email}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.rev}>${t.revenue.toFixed(2)}</Text>
              <Text style={s.sub}>{t.student_count} students</Text>
            </View>
          </View>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: COLORS.bg },
  card:   { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 10,
            borderWidth: 1, borderColor: COLORS.border },
  row:    { flexDirection: 'row', alignItems: 'center' },
  name:   { fontSize: 16, fontWeight: '700', color: COLORS.text },
  email:  { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  rev:    { fontSize: 16, fontWeight: '800', color: COLORS.success },
  sub:    { fontSize: 11, color: COLORS.muted, marginTop: 2 },
});
