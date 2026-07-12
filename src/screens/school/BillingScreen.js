import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator,
         TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { schoolGetDashboard, schoolGetBillingUrl } from '../../services/api';
import { COLORS } from '../../theme';

export default function BillingScreen() {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [launching,  setLaunching]  = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await schoolGetDashboard();
      if (res.ok) setData(res);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubscribe = async () => {
    setLaunching(true);
    try {
      const res = await schoolGetBillingUrl();
      if (res.ok && res.url) {
        await Linking.openURL(res.url);
      }
    } catch {}
    finally { setLaunching(false); }
  };

  if (loading) return (
    <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
  );

  const plan     = data?.plan ?? 'none';
  const isActive = plan === 'school';

  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.primary} />}>

      <View style={[s.planCard, { borderColor: isActive ? COLORS.success : COLORS.danger }]}>
        <Text style={s.planLabel}>Current Plan</Text>
        {isActive ? (
          <>
            <Text style={[s.planName, { color: COLORS.success }]}>School Plan</Text>
            <Text style={s.planPrice}>$99 / month</Text>
            <Text style={s.planDetail}>Up to 10 teachers · unlimited students</Text>
            <View style={s.activeBadge}>
              <Text style={s.activeBadgeText}>✓ Active</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={[s.planName, { color: COLORS.danger }]}>No Active Plan</Text>
            <Text style={s.planDetail}>Subscribe to unlock all features.</Text>
          </>
        )}
      </View>

      {!isActive && (
        <View style={s.offerCard}>
          <Text style={s.offerTitle}>Music School Plan</Text>
          <Text style={s.offerPrice}>$99<Text style={s.offerPer}>/mo</Text></Text>
          <Text style={s.offerSub}>Up to 10 teachers · unlimited students</Text>
          <View style={s.featureList}>
            {[
              'School admin dashboard',
              'Multi-teacher management',
              'Lesson notes & assignments',
              'Per-student payment tracking',
              'School-wide analytics',
              'Parent access & push notifications',
              'Policy signing',
            ].map(f => (
              <Text key={f} style={s.feature}>✓  {f}</Text>
            ))}
          </View>
          <TouchableOpacity style={s.subscribeBtn} onPress={handleSubscribe}
            disabled={launching}>
            <Text style={s.subscribeBtnText}>
              {launching ? 'Opening...' : '💳 Subscribe Now'}
            </Text>
          </TouchableOpacity>
          <Text style={s.secureNote}>Secured by Stripe · Cancel anytime</Text>
        </View>
      )}

      {isActive && (
        <TouchableOpacity style={[s.subscribeBtn, { backgroundColor: COLORS.muted }]}
          onPress={handleSubscribe} disabled={launching}>
          <Text style={s.subscribeBtnText}>
            {launching ? 'Opening...' : '⚙️ Manage Subscription'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap:          { flex: 1, backgroundColor: COLORS.bg },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  planCard:      { backgroundColor: COLORS.card, borderRadius: 16, padding: 20,
                   borderWidth: 2, marginBottom: 16 },
  planLabel:     { fontSize: 11, color: COLORS.muted, textTransform: 'uppercase',
                   letterSpacing: 1, marginBottom: 6 },
  planName:      { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  planPrice:     { fontSize: 16, color: COLORS.text, fontWeight: '700', marginBottom: 4 },
  planDetail:    { fontSize: 13, color: COLORS.muted },
  activeBadge:   { marginTop: 12, alignSelf: 'flex-start', backgroundColor: 'rgba(16,185,129,.15)',
                   paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  activeBadgeText: { color: COLORS.success, fontWeight: '700', fontSize: 13 },
  offerCard:     { backgroundColor: COLORS.card, borderRadius: 16, padding: 22,
                   borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  offerTitle:    { fontSize: 14, fontWeight: '700', color: COLORS.subtext,
                   textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  offerPrice:    { fontSize: 48, fontWeight: '800', color: COLORS.text },
  offerPer:      { fontSize: 18, fontWeight: '500', color: COLORS.muted },
  offerSub:      { fontSize: 13, color: COLORS.muted, marginBottom: 18 },
  featureList:   { marginBottom: 22 },
  feature:       { fontSize: 14, color: COLORS.subtext, paddingVertical: 5,
                   borderBottomWidth: 1, borderBottomColor: COLORS.border },
  subscribeBtn:  { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16,
                   alignItems: 'center', marginBottom: 10 },
  subscribeBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  secureNote:    { textAlign: 'center', fontSize: 12, color: COLORS.muted },
});
