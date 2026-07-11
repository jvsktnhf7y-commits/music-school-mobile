import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,
         Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { teacherAddStudent } from '../../services/api';
import { COLORS } from '../../theme';

export default function AddStudentScreen({ navigation }) {
  const [name,        setName]        = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentCode,  setParentCode]  = useState('');
  const [rate,        setRate]        = useState('50');
  const [prepaid,     setPrepaid]     = useState('0');
  const [loading,     setLoading]     = useState(false);

  async function handleAdd() {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    setLoading(true);
    try {
      const res = await teacherAddStudent({
        name: name.trim(), parent_email: parentEmail.trim(),
        parent_code: parentCode.trim(), rate: parseFloat(rate) || 50,
        prepaid: parseFloat(prepaid) || 0,
      });
      if (res.ok) { navigation.goBack(); }
      else { Alert.alert('Error', res.error || 'Could not add student'); }
    } catch { Alert.alert('Error', 'Connection error'); }
    finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {[
          { label: 'Student Name *', val: name, set: setName, ph: 'Emma Smith', cap: 'words' },
          { label: 'Parent Email',   val: parentEmail, set: setParentEmail, ph: 'parent@example.com', kb: 'email-address', cap: 'none' },
          { label: 'Parent Code',    val: parentCode, set: setParentCode, ph: 'e.g. smith2024', cap: 'none' },
          { label: 'Rate per Lesson ($)', val: rate, set: setRate, ph: '50', kb: 'decimal-pad' },
          { label: 'Starting Balance ($)', val: prepaid, set: setPrepaid, ph: '0', kb: 'decimal-pad' },
        ].map(({ label, val, set, ph, kb, cap }) => (
          <View key={label} style={s.group}>
            <Text style={s.label}>{label}</Text>
            <TextInput style={s.input} value={val} onChangeText={set}
              placeholder={ph} placeholderTextColor={COLORS.muted}
              keyboardType={kb || 'default'} autoCapitalize={cap || 'sentences'} />
          </View>
        ))}

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]}
          onPress={handleAdd} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Add Student</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap:  { flex: 1, backgroundColor: COLORS.bg },
  group: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.subtext, marginBottom: 6 },
  input: { backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.border,
           borderRadius: 10, padding: 12, fontSize: 15, color: COLORS.text },
  btn:   { backgroundColor: COLORS.success, borderRadius: 12, height: 52,
           alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
