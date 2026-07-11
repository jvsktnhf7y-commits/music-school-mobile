import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,
         Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { schoolLogin, teacherLogin, parentLogin } from '../services/api';
import { COLORS } from '../theme';

export default function LoginScreen({ navigation, route }) {
  const role = route?.params?.role || 'teacher';
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [student,  setStudent]  = useState('');
  const [code,     setCode]     = useState('');
  const [loading,  setLoading]  = useState(false);

  const isParent = role === 'parent';

  const roleColor = { school: COLORS.primary, teacher: COLORS.success, parent: COLORS.warning }[role];
  const roleLabel = { school: 'School Admin', teacher: 'Teacher', parent: 'Parent' }[role];

  async function handleLogin() {
    setLoading(true);
    try {
      let res;
      if (role === 'school')  res = await schoolLogin(email.trim(), password);
      if (role === 'teacher') res = await teacherLogin(email.trim(), password);
      if (role === 'parent')  res = await parentLogin(student.trim(), code.trim());
      if (res?.ok) {
        navigation.replace('Main');
      } else {
        Alert.alert('Login Failed', res?.error || 'Invalid credentials');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not connect. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.wrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.card}>
        <Text style={s.logo}>🎵</Text>
        <Text style={[s.role, { color: roleColor }]}>{roleLabel} Login</Text>

        {isParent ? (
          <>
            <Text style={s.label}>Student Name</Text>
            <TextInput style={s.input} value={student} onChangeText={setStudent}
              placeholder="e.g. Emma Smith" placeholderTextColor={COLORS.muted} autoCapitalize="words" />
            <Text style={s.label}>Parent Code</Text>
            <TextInput style={s.input} value={code} onChangeText={setCode}
              placeholder="Provided by your teacher" placeholderTextColor={COLORS.muted}
              secureTextEntry autoCapitalize="none" />
          </>
        ) : (
          <>
            <Text style={s.label}>Email</Text>
            <TextInput style={s.input} value={email} onChangeText={setEmail}
              placeholder="you@example.com" placeholderTextColor={COLORS.muted}
              keyboardType="email-address" autoCapitalize="none" />
            <Text style={s.label}>Password</Text>
            <TextInput style={s.input} value={password} onChangeText={setPassword}
              placeholder="••••••••" placeholderTextColor={COLORS.muted} secureTextEntry />
          </>
        )}

        <TouchableOpacity style={[s.btn, { backgroundColor: roleColor }, loading && { opacity: 0.6 }]}
          onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('RoleSelect')} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.muted, textAlign: 'center', fontSize: 14 }}>← Back</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap:    { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', padding: 24 },
  card:    { backgroundColor: COLORS.card, borderRadius: 20, padding: 28, borderWidth: 1, borderColor: COLORS.border },
  logo:    { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  role:    { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 24 },
  label:   { fontSize: 12, fontWeight: '600', color: COLORS.subtext, marginBottom: 6 },
  input:   { backgroundColor: COLORS.bg, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10,
             padding: 12, fontSize: 15, color: COLORS.text, marginBottom: 14 },
  btn:     { borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
