import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator,
         RefreshControl, TouchableOpacity } from 'react-native';
import { teacherGetNotes } from '../../services/api';
import { COLORS } from '../../theme';

export default function TeacherNotesScreen({ navigation }) {
  const [notes,      setNotes]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await teacherGetNotes();
      if (res.ok) setNotes(res.notes);
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
      data={notes}
      keyExtractor={(_, i) => String(i)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.success} />}
      ListHeaderComponent={
        <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AddNote', {})} activeOpacity={0.8}>
          <Text style={s.addBtnText}>+ Add Note</Text>
        </TouchableOpacity>
      }
      ListEmptyComponent={<Text style={{ color: COLORS.muted, textAlign: 'center', padding: 40 }}>No notes yet.</Text>}
      renderItem={({ item: n }) => (
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.student}>{n.student_name}</Text>
            <Text style={s.date}>{n.date}</Text>
          </View>
          {!!n.notes      && <Text style={s.text}>{n.notes}</Text>}
          {!!n.assignment && <Text style={s.assign}>📌 {n.assignment}</Text>}
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  addBtn:     { backgroundColor: COLORS.success, borderRadius: 12, padding: 14,
                alignItems: 'center', marginBottom: 16 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card:       { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 10,
                borderWidth: 1, borderColor: COLORS.border },
  row:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  student:    { fontSize: 14, fontWeight: '700', color: COLORS.text },
  date:       { fontSize: 12, color: COLORS.muted },
  text:       { fontSize: 13, color: COLORS.subtext, lineHeight: 18 },
  assign:     { fontSize: 12, color: COLORS.success, marginTop: 6 },
});
