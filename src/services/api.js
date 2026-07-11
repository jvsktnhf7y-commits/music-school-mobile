import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL    = 'https://music-school-app-hde7.onrender.com';
const ROLE_KEY    = 'ms_role';
const SESSION_KEY = 'ms_session';

// ── Axios clients ─────────────────────────────────────────────────────────────
const schoolClient = axios.create({ baseURL: BASE_URL, timeout: 60000 });
schoolClient.interceptors.request.use(async (cfg) => {
  const s = await AsyncStorage.getItem(SESSION_KEY);
  if (s) cfg.headers['Authorization'] = `Bearer school:${s}`;
  return cfg;
});

const teacherClient = axios.create({ baseURL: BASE_URL, timeout: 60000 });
teacherClient.interceptors.request.use(async (cfg) => {
  const s = await AsyncStorage.getItem(SESSION_KEY);
  if (s) cfg.headers['Authorization'] = `Bearer teacher:${s}`;
  return cfg;
});

const parentClient = axios.create({ baseURL: BASE_URL, timeout: 60000 });
parentClient.interceptors.request.use(async (cfg) => {
  const s = await AsyncStorage.getItem(SESSION_KEY);
  if (s) cfg.headers['Authorization'] = `Bearer parent:${s}`;
  return cfg;
});

// ── Auth helpers ───────────────────────────────────────────────────────────────
export async function getStoredRole()  { return AsyncStorage.getItem(ROLE_KEY); }
export async function getStoredSession(){ return AsyncStorage.getItem(SESSION_KEY); }
export async function isLoggedIn() {
  return !!(await AsyncStorage.getItem(SESSION_KEY));
}
export async function logout() {
  await AsyncStorage.multiRemove([ROLE_KEY, SESSION_KEY]);
}

async function _saveSession(role, session) {
  await AsyncStorage.setItem(ROLE_KEY,    role);
  await AsyncStorage.setItem(SESSION_KEY, session);
}

// ── School Admin ───────────────────────────────────────────────────────────────
export async function schoolLogin(email, password) {
  const res = await axios.post(`${BASE_URL}/api/mobile/school/login`, { email, password });
  if (res.data.ok) await _saveSession('school', res.data.session);
  return res.data;
}
export async function schoolGetDashboard() {
  const res = await schoolClient.get('/api/mobile/school/dashboard');
  return res.data;
}
export async function schoolGetTeachers() {
  const res = await schoolClient.get('/api/mobile/school/teachers');
  return res.data;
}
export async function schoolGetAnalytics() {
  const res = await schoolClient.get('/api/mobile/school/analytics');
  return res.data;
}

// ── Teacher ────────────────────────────────────────────────────────────────────
export async function teacherLogin(email, password) {
  const res = await axios.post(`${BASE_URL}/api/mobile/teacher/login`, { email, password });
  if (res.data.ok) await _saveSession('teacher', res.data.session);
  return res.data;
}
export async function teacherGetDashboard() {
  const res = await teacherClient.get('/api/mobile/teacher/dashboard');
  return res.data;
}
export async function teacherGetStudents() {
  const res = await teacherClient.get('/api/mobile/teacher/students');
  return res.data;
}
export async function teacherAddStudent(data) {
  const res = await teacherClient.post('/api/mobile/teacher/students/add', data);
  return res.data;
}
export async function teacherGetStudent(id) {
  const res = await teacherClient.get(`/api/mobile/teacher/students/${id}`);
  return res.data;
}
export async function teacherChargeStudent(id, amount) {
  const res = await teacherClient.post(`/api/mobile/teacher/students/${id}/charge`, { amount });
  return res.data;
}
export async function teacherPayStudent(id, amount, notes = '') {
  const res = await teacherClient.post(`/api/mobile/teacher/students/${id}/payment`, { amount, notes });
  return res.data;
}
export async function teacherGetNotes() {
  const res = await teacherClient.get('/api/mobile/teacher/notes');
  return res.data;
}
export async function teacherAddNote(data) {
  const res = await teacherClient.post('/api/mobile/teacher/notes/add', data);
  return res.data;
}
export async function teacherGetPayments() {
  const res = await teacherClient.get('/api/mobile/teacher/payments');
  return res.data;
}
export async function teacherRegisterPush(token) {
  const res = await teacherClient.post('/api/mobile/teacher/register-push', { token });
  return res.data;
}

// ── Parent ─────────────────────────────────────────────────────────────────────
export async function parentLogin(studentName, parentCode) {
  const res = await axios.post(`${BASE_URL}/api/mobile/parent/login`,
    { student_name: studentName, parent_code: parentCode });
  if (res.data.ok) await _saveSession('parent', res.data.session);
  return res.data;
}
export async function parentGetDashboard() {
  const res = await parentClient.get('/api/mobile/parent/dashboard');
  return res.data;
}
export async function parentGetNotes() {
  const res = await parentClient.get('/api/mobile/parent/notes');
  return res.data;
}
export async function parentGetPayments() {
  const res = await parentClient.get('/api/mobile/parent/payments');
  return res.data;
}
export async function parentRegisterPush(token) {
  const res = await parentClient.post('/api/mobile/parent/register-push', { token });
  return res.data;
}
