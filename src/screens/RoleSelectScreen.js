import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../theme';

export default function RoleSelectScreen({ navigation }) {
  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.center}>
        <Text style={s.logo}>🎵</Text>
        <Text style={s.title}>Music School App</Text>
        <Text style={s.sub}>Who are you?</Text>

        {[
          { label: '🏫  School Admin',  role: 'school',  color: COLORS.primary },
          { label: '👩‍🏫  Teacher',        role: 'teacher', color: COLORS.success },
          { label: '👪  Parent',          role: 'parent',  color: COLORS.warning },
        ].map(({ label, role, color }) => (
          <TouchableOpacity
            key={role}
            style={[s.btn, { borderColor: color }]}
            onPress={() => navigation.navigate('Login', { role })}
            activeOpacity={0.8}
          >
            <Text style={[s.btnText, { color }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap:    { flex: 1, backgroundColor: COLORS.bg },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  logo:    { fontSize: 64, marginBottom: 16 },
  title:   { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  sub:     { fontSize: 15, color: COLORS.muted, marginBottom: 40 },
  btn:     { width: '100%', borderWidth: 1.5, borderRadius: 14, padding: 18,
             alignItems: 'center', marginBottom: 14, backgroundColor: COLORS.card },
  btnText: { fontSize: 17, fontWeight: '700' },
});
