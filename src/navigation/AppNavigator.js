import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Text, View } from 'react-native';

import { isLoggedIn, getStoredRole } from '../services/api';
import { COLORS } from '../theme';

import RoleSelectScreen   from '../screens/RoleSelectScreen';
import LoginScreen        from '../screens/LoginScreen';

import SchoolDashboard    from '../screens/school/DashboardScreen';
import SchoolTeachers     from '../screens/school/TeachersScreen';
import SchoolAnalytics    from '../screens/school/AnalyticsScreen';

import TeacherDashboard   from '../screens/teacher/DashboardScreen';
import TeacherStudents    from '../screens/teacher/StudentsScreen';
import TeacherNotes       from '../screens/teacher/NotesScreen';
import TeacherPayments    from '../screens/teacher/PaymentsScreen';
import StudentDetail      from '../screens/teacher/StudentDetailScreen';
import AddStudent         from '../screens/teacher/AddStudentScreen';
import AddNote            from '../screens/teacher/AddNoteScreen';

import ParentDashboard    from '../screens/parent/DashboardScreen';
import ParentNotes        from '../screens/parent/NotesScreen';
import ParentPayments     from '../screens/parent/PaymentsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TAB_BAR  = { backgroundColor: '#1e293b', borderTopColor: '#2e3f5c', borderTopWidth: 1, height: 82, paddingTop: 8, paddingBottom: 16 };
const TAB_LBL  = { fontSize: 11, fontWeight: '600', marginTop: 2 };
const HDR      = { backgroundColor: '#0f172a', borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 };
const HDR_TTL  = { color: COLORS.text, fontWeight: '800', fontSize: 18 };

function SchoolTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => {
        const icons = { Dashboard: '🏠', Teachers: '👩‍🏫', Analytics: '📊' };
        return <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>{icons[route.name]}</Text>;
      },
      tabBarActiveTintColor: COLORS.primary, tabBarInactiveTintColor: COLORS.muted,
      tabBarLabelStyle: TAB_LBL, tabBarStyle: TAB_BAR,
      headerStyle: HDR, headerTitleStyle: HDR_TTL, headerTintColor: COLORS.text,
    })}>
      <Tab.Screen name="Dashboard" component={SchoolDashboard} options={{ title: 'School Dashboard' }} />
      <Tab.Screen name="Teachers"  component={SchoolTeachers}  options={{ title: 'Teachers' }} />
      <Tab.Screen name="Analytics" component={SchoolAnalytics} options={{ title: 'Analytics' }} />
    </Tab.Navigator>
  );
}

function TeacherTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => {
        const icons = { Home: '🏠', Students: '👥', Notes: '📝', Payments: '💳' };
        return <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>{icons[route.name]}</Text>;
      },
      tabBarActiveTintColor: COLORS.success, tabBarInactiveTintColor: COLORS.muted,
      tabBarLabelStyle: TAB_LBL, tabBarStyle: TAB_BAR,
      headerStyle: HDR, headerTitleStyle: HDR_TTL, headerTintColor: COLORS.text,
    })}>
      <Tab.Screen name="Home"     component={TeacherDashboard} options={{ title: "Dashboard" }} />
      <Tab.Screen name="Students" component={TeacherStudents}  options={{ title: 'My Students' }} />
      <Tab.Screen name="Notes"    component={TeacherNotes}     options={{ title: 'Lesson Notes' }} />
      <Tab.Screen name="Payments" component={TeacherPayments}  options={{ title: 'Payments' }} />
    </Tab.Navigator>
  );
}

function ParentTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => {
        const icons = { Home: '🏠', Notes: '📝', Pay: '💳' };
        return <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>{icons[route.name]}</Text>;
      },
      tabBarActiveTintColor: COLORS.warning, tabBarInactiveTintColor: COLORS.muted,
      tabBarLabelStyle: TAB_LBL, tabBarStyle: TAB_BAR,
      headerStyle: HDR, headerTitleStyle: HDR_TTL, headerTintColor: COLORS.text,
    })}>
      <Tab.Screen name="Home"  component={ParentDashboard} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Notes" component={ParentNotes}     options={{ title: 'Lesson Notes' }} />
      <Tab.Screen name="Pay"   component={ParentPayments}  options={{ title: 'Payments' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [checking,     setChecking]     = useState(true);
  const [initialRoute, setInitialRoute] = useState('RoleSelect');
  const [role,         setRole]         = useState(null);

  useEffect(() => {
    (async () => {
      const storedRole = await getStoredRole();
      const authed     = await isLoggedIn();
      setRole(storedRole);
      setInitialRoute(authed && storedRole ? 'Main' : 'RoleSelect');
      setChecking(false);
    })();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
        <Stack.Screen name="Login"      component={LoginScreen} />
        <Stack.Screen name="Main" children={() => {
          if (role === 'school')  return <SchoolTabs />;
          if (role === 'teacher') return <TeacherTabs />;
          if (role === 'parent')  return <ParentTabs />;
          return <SchoolTabs />;
        }} />
        <Stack.Screen name="StudentDetail" component={StudentDetail}
          options={{ headerShown: true, headerStyle: HDR, headerTitleStyle: HDR_TTL,
                     headerTintColor: COLORS.text, title: '' }} />
        <Stack.Screen name="AddStudent" component={AddStudent}
          options={{ headerShown: true, headerStyle: HDR, headerTitleStyle: HDR_TTL,
                     headerTintColor: COLORS.text, title: 'Add Student' }} />
        <Stack.Screen name="AddNote" component={AddNote}
          options={{ headerShown: true, headerStyle: HDR, headerTitleStyle: HDR_TTL,
                     headerTintColor: COLORS.text, title: 'Add Note' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
