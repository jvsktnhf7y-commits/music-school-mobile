import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { parentGetNotes } from '../../services/api';
import { COLORS } from '../../theme';

export default function ParentNotesScreen() {
  const [notes,      setNotes]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await parentGetNotes();
      if (res.ok) setNotes(res.notes);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.warning} /></View>;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      data={notes}
      keyExtractor={(_, i) => String(i)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.warning} />}
      ListEmptyComponent={<Text style={{ color: COLORS.muted, textAlign: 'center', padding: 40 }}>No notes yet.</Text>}
      renderItem={({ item: n }) => (
        <View style={s.card}>
          <Text style={s.date}>{n.date}</Text>
          {!!n.notes      && <Text style={s.text}>{n.notes}</Text>}
          {!!n.assignment && (
            <View style={s.assignBox}>
              <Text style={s.assignText}><Text style={{ fontWeight: '700' }}>📌 Assignment: </Text>{n.assignment}</Text>
            </View>
          )}
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  card:       { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 10,
                borderWidth: 1, borderColor: COLORS.border },
  date:       { fontSize: 11, color: COLORS.muted, marginBottom: 6 },
  text:       { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  assignBox:  { marginTop: 10, backgroundColor: 'rgba(16,185,129,.1)', borderLeftWidth: 3,
                borderLeftColor: COLORS.success, padding: 10, borderRadius: 6 },
  assignText: { fontSize: 13, color: COLORS.success },
});
