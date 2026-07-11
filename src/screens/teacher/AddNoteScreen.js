import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
         ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { teacherAddNote, teacherGetStudents } from '../../services/api';
import { COLORS } from '../../theme';

export default function AddNoteScreen({ route, navigation }) {
  const prefillId   = route.params?.student_id || '';
  const prefillName = route.params?.student_name || '';

  const [students,    setStudents]    = useState([]);
  const [selectedId,  setSelectedId]  = useState(prefillId);
  const [date,        setDate]        = useState(new Date().toISOString().split('T')[0]);
  const [notes,       setNotes]       = useState('');
  const [assignment,  setAssignment]  = useState('');
  const [loading,     setLoading]     = useState(false);
  const [showPicker,  setShowPicker]  = useState(false);

  useEffect(() => {
    teacherGetStudents().then(res => { if (res.ok) setStudents(res.students); }).catch(() => {});
  }, []);

  const selectedName = prefillName || students.find(s => s.student_id === selectedId)?.name || 'Select student';

  async function handleSave() {
    if (!selectedId) { Alert.alert('Select a student'); return; }
    if (!notes.trim()) { Alert.alert('Add some notes'); return; }
    setLoading(true);
    try {
      const res = await teacherAddNote({ student_id: selectedId, date, notes, assignment });
      if (res.ok) navigation.goBack();
      else Alert.alert('Error', res.error || 'Could not save');
    } catch { Alert.alert('Error', 'Connection error'); }
    finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={s.label}>Student</Text>
        <TouchableOpacity style={s.picker} onPress={() => !prefillId && setShowPicker(!showPicker)}>
          <Text style={{ color: selectedId ? COLORS.text : COLORS.muted, fontSize: 15 }}>{selectedName}</Text>
        </TouchableOpacity>
        {showPicker && students.map(st => (
          <TouchableOpacity key={st.student_id} style={s.pickerItem}
            onPress={() => { setSelectedId(st.student_id); setShowPicker(false); }}>
            <Text style={{ color: COLORS.text }}>{st.name}</Text>
          </TouchableOpacity>
        ))}

        <Text style={s.label}>Date</Text>
        <TextInput style={s.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.muted} />

        <Text style={s.label}>Notes</Text>
        <TextInput style={[s.input, { height: 120, textAlignVertical: 'top' }]}
          value={notes} onChangeText={setNotes} multiline
          placeholder="What did you work on today?" placeholderTextColor={COLORS.muted} />

        <Text style={s.label}>Assignment</Text>
        <TextInput style={s.input} value={assignment} onChangeText={setAssignment}
          placeholder="Practice 10 min daily" placeholderTextColor={COLORS.muted} />

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]}
          onPress={handleSave} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Save Note</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap:       { flex: 1, backgroundColor: COLORS.bg },
  label:      { fontSize: 12, fontWeight: '600', color: COLORS.subtext, marginBottom: 6, marginTop: 14 },
  input:      { backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.border,
                borderRadius: 10, padding: 12, fontSize: 15, color: COLORS.text },
  picker:     { backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.border,
                borderRadius: 10, padding: 12 },
  pickerItem: { backgroundColor: COLORS.card, padding: 12, borderBottomWidth: 1,
                borderBottomColor: COLORS.border },
  btn:        { backgroundColor: COLORS.success, borderRadius: 12, height: 52,
                alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  btnText:    { color: '#fff', fontWeight: '800', fontSize: 16 },
});
