import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator,
         RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { parentGetPolicies } from '../../services/api';
import { COLORS } from '../../theme';

export default function PoliciesScreen() {
  const [policies,   setPolicies]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await parentGetPolicies();
      if (res.ok) setPolicies(res.policies);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <View style={s.center}><ActivityIndicator size="large" color={COLORS.warning} /></View>
  );

  const unsigned = policies.filter(p => !p.signed);
  const signed   = policies.filter(p =>  p.signed);

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      data={policies}
      keyExtractor={p => p.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.warning} />}
      ListHeaderComponent={
        unsigned.length > 0 ? (
          <View style={s.banner}>
            <Text style={s.bannerText}>
              ⚠️  {unsigned.length} unsigned {unsigned.length === 1 ? 'policy' : 'policies'} — tap to sign
            </Text>
          </View>
        ) : policies.length > 0 ? (
          <View style={[s.banner, { backgroundColor: 'rgba(16,185,129,.12)', borderColor: COLORS.success }]}>
            <Text style={[s.bannerText, { color: COLORS.success }]}>✓ All policies signed</Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={s.empty}>
          <Text style={s.emptyIcon}>📋</Text>
          <Text style={s.emptyText}>No policies from your school yet.</Text>
        </View>
      }
      renderItem={({ item: p }) => (
        <View style={[s.card, { borderColor: p.signed ? COLORS.success : COLORS.warning }]}>
          <View style={s.row}>
            <Text style={s.title}>{p.title}</Text>
            {p.signed
              ? <View style={s.badge}><Text style={s.badgeSigned}>✓ Signed</Text></View>
              : <View style={[s.badge, { backgroundColor: 'rgba(245,158,11,.15)' }]}>
                  <Text style={[s.badgeSigned, { color: COLORS.warning }]}>Unsigned</Text>
                </View>
            }
          </View>
          {!p.signed && (
            <TouchableOpacity style={s.signBtn} onPress={() => Linking.openURL(p.sign_url)}>
              <Text style={s.signBtnText}>✍️ Tap to Sign</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  banner:      { backgroundColor: 'rgba(245,158,11,.12)', borderWidth: 1, borderColor: COLORS.warning,
                 borderRadius: 12, padding: 12, marginBottom: 14 },
  bannerText:  { color: COLORS.warning, fontWeight: '700', fontSize: 13, textAlign: 'center' },
  empty:       { alignItems: 'center', paddingTop: 60 },
  emptyIcon:   { fontSize: 48, marginBottom: 12, opacity: 0.5 },
  emptyText:   { color: COLORS.muted, fontSize: 14 },
  card:        { backgroundColor: COLORS.card, borderRadius: 14, padding: 16,
                 marginBottom: 12, borderWidth: 2 },
  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:       { fontSize: 15, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 10 },
  badge:       { backgroundColor: 'rgba(16,185,129,.15)', paddingHorizontal: 10,
                 paddingVertical: 4, borderRadius: 20 },
  badgeSigned: { color: COLORS.success, fontWeight: '700', fontSize: 12 },
  signBtn:     { marginTop: 12, backgroundColor: COLORS.warning, borderRadius: 10,
                 padding: 12, alignItems: 'center' },
  signBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
