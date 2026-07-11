import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator,
         RefreshControl, TouchableOpacity } from 'react-native';
import { teacherGetStudents } from '../../services/api';
import { COLORS } from '../../theme';

export default function TeacherStudentsScreen({ navigation }) {
  const [students,   setStudents]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await teacherGetStudents();
      if (res.ok) setStudents(res.students);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [load, navigation]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.success} /></View>;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      data={students}
      keyExtractor={s => s.student_id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.success} />}
      ListHeaderComponent={
        <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AddStudent')} activeOpacity={0.8}>
          <Text style={s.addBtnText}>+ Add Student</Text>
        </TouchableOpacity>
      }
      ListEmptyComponent={
        <View style={s.empty}>
          <Text style={{ fontSize: 36, marginBottom: 10 }}>👥</Text>
          <Text style={{ color: COLORS.muted }}>No students yet. Add one above.</Text>
        </View>
      }
      renderItem={({ item: st }) => {
        const color = st.prepaid > 0 ? COLORS.success : COLORS.danger;
        return (
          <TouchableOpacity style={s.card}
            onPress={() => navigation.navigate('StudentDetail', { student_id: st.student_id, name: st.name })}
            activeOpacity={0.8}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{st.prepaid > 0 ? '🟢' : '🔴'} {st.name}</Text>
                {!!st.parent_email && <Text style={s.sub}>{st.parent_email}</Text>}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.bal, { color }]}>${st.prepaid.toFixed(2)}</Text>
                <Text style={s.rate}>${st.rate}/lesson</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  empty:  { alignItems: 'center', padding: 40 },
  addBtn: { backgroundColor: COLORS.success, borderRadius: 12, padding: 14,
            alignItems: 'center', marginBottom: 16 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card:   { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 10,
            borderWidth: 1, borderColor: COLORS.border },
  row:    { flexDirection: 'row', alignItems: 'center' },
  name:   { fontSize: 15, fontWeight: '700', color: COLORS.text },
  sub:    { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  bal:    { fontSize: 16, fontWeight: '800' },
  rate:   { fontSize: 11, color: COLORS.muted, marginTop: 2 },
});
