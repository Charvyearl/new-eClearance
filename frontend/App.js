import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Picker,
} from 'react-native';
import StudentDashboard from './screens/StudentDashboard';
import RequirementsScreen from './screens/RequirementsScreen';
import StudentProfile from './screens/StudentProfile';
import BottomNavigation from './components/BottomNavigation';
import styles from './styles';
import WelcomeScreen from './screens/WelcomeScreen'; // Added import for WelcomeScreen

export default function App() {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'admin-login'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [studentId, setStudentId] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [role, setRole] = useState('student');
  const [departmentId, setDepartmentId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [registrationMode, setRegistrationMode] = useState('student'); // 'student' or 'department'
  const [currentScreen, setCurrentScreen] = useState('dashboard'); // 'dashboard', 'requirements', 'profile'
  const [showWelcome, setShowWelcome] = useState(true); // Added state for welcome screen
  

  const API_URL = useMemo(() => {
    // Change to your machine's LAN IP when testing on a real device, e.g. http://192.168.1.10:3000
    return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  }, []);

  // Load persisted session on first mount (web reload)
  useEffect(() => {
    try {
      const storedToken = typeof window !== 'undefined' ? window.localStorage.getItem('eclearance_token') : null;
      const storedUser = typeof window !== 'undefined' ? window.localStorage.getItem('eclearance_user') : null;
      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {}
  }, []);

  async function loadUsers() {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setCourse('');
    setStudentId('');
    setYearLevel('');
    setRole('student');
    setDepartmentId('');
    setEditingId(null);
  }

  async function handleAuth() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation', 'Email and password are required');
      return;
    }
    
    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        Alert.alert('Error', data.message || 'Authentication failed');
        return;
      }
      
      setToken(data.token);
      setUser(data.user);
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('eclearance_token', data.token);
          window.localStorage.setItem('eclearance_user', JSON.stringify(data.user));
        }
      } catch {}
      resetForm();
      await loadUsers();
    } catch (e) {
      Alert.alert('Error', 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation', 'Name, email, and password are required');
      return;
    }
    
    if (registrationMode === 'student') {
      if (!phone.trim() || !course.trim() || !studentId.trim() || !yearLevel.trim()) {
        Alert.alert('Validation', 'All student fields are required');
        return;
      }
    }
    
    try {
      setSubmitting(true);
      const payload = { 
        name: name.trim(), 
        email: email.trim(), 
        password,
        phone: phone.trim(),
        course: course.trim(),
        student_id: studentId.trim(),
        year_level: yearLevel.trim(),
        role: registrationMode,
        department_id: registrationMode === 'department' ? departmentId.trim() : null
      };
      
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        Alert.alert('Error', data.message || 'Registration failed');
        return;
      }
      
      Alert.alert('Success', 'User registered successfully');
      resetForm();
      await loadUsers();
    } catch (e) {
      Alert.alert('Error', 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setUsers([]);
    resetForm();
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('eclearance_token');
        window.localStorage.removeItem('eclearance_user');
      }
    } catch {}
  }

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Validation', 'Name and email are required');
      return;
    }
    try {
      setSubmitting(true);
      const payload = { name: name.trim(), email: email.trim() };
      let res;
      if (editingId) {
        res = await fetch(`${API_URL}/users/${editingId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const msg = res.status === 409 ? 'Email already exists' : 'Request failed';
        Alert.alert('Error', msg);
        return;
      }
      await loadUsers();
      resetForm();
    } catch (e) {
      Alert.alert('Error', 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(user) {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      await loadUsers();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete');
    }
  }

  useEffect(() => {
    if (token) {
      loadUsers();
      // refresh current user profile with full fields
      (async () => {
        try {
          const res = await fetch(`${API_URL}/me`, { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (data && data.user) {
            setUser((prev) => ({ ...prev, ...data.user }));
            // Fallback: if student-specific fields are missing, fetch full record
            if (!data.user.student_id || !data.user.course || !data.user.year_level) {
              try {
                const res2 = await fetch(`${API_URL}/users/${data.user.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                const full = await res2.json();
                if (full && full.id) {
                  setUser((prev) => ({ ...prev, ...full }));
                }
              } catch {}
            }
          }
        } catch (e) {}
      })();
    }
  }, [token]);

  if (showWelcome) {
    return <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>eClearance</Text>
        <View style={styles.authContainer}>
          <View style={styles.authToggle}>
            <TouchableOpacity 
              style={[styles.toggleBtn, authMode === 'login' && styles.toggleBtnActive]}
              onPress={() => setAuthMode('login')}
            >
              <Text style={[styles.toggleText, authMode === 'login' && styles.toggleTextActive]}>Student/Dept Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, authMode === 'admin-login' && styles.toggleBtnActive]}
              onPress={() => setAuthMode('admin-login')}
            >
              <Text style={[styles.toggleText, authMode === 'admin-login' && styles.toggleTextActive]}>Admin Login</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <Button
            title="Login"
            onPress={handleAuth}
            disabled={submitting}
          />
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  // Student Dashboard moved to ./screens/StudentDashboard

  // Bottom Navigation moved to ./components/BottomNavigation

  // Requirements Screen moved to ./screens/RequirementsScreen

  // Student Profile moved to ./screens/StudentProfile

  // Render different screens based on user role and current screen
  const renderMainContent = () => {
    if (user.role === 'student') {
      switch (currentScreen) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'requirements':
          return <RequirementsScreen />;
        case 'profile':
          return (
            <View style={{ flex: 1, backgroundColor: '#e3f2fd' }}>
              <StudentProfile user={user} onLogout={handleLogout} />
            </View>
          );
        default:
          return <StudentDashboard />;
      }
    } else {
      // Admin/Department view (existing code)
      return (
        <>
          {user.role === 'admin' && (
            <View style={styles.adminSection}>
              <Text style={styles.sectionTitle}>Admin Panel - User Registration</Text>
              
              <View style={styles.registrationToggle}>
                <TouchableOpacity 
                  style={[styles.regToggleBtn, registrationMode === 'student' && styles.regToggleBtnActive]}
                  onPress={() => setRegistrationMode('student')}
                >
                  <Text style={[styles.regToggleText, registrationMode === 'student' && styles.regToggleTextActive]}>Register Student</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.regToggleBtn, registrationMode === 'department' && styles.regToggleBtnActive]}
                  onPress={() => setRegistrationMode('department')}
                >
                  <Text style={[styles.regToggleText, registrationMode === 'department' && styles.regToggleTextActive]}>Register Department</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.formRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                
                {registrationMode === 'student' && (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Phone Number"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Course/Program"
                      value={course}
                      onChangeText={setCourse}
                      autoCapitalize="words"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Student ID"
                      value={studentId}
                      onChangeText={setStudentId}
                      autoCapitalize="characters"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Year Level (e.g., 1st Year, 2nd Year)"
                      value={yearLevel}
                      onChangeText={setYearLevel}
                      autoCapitalize="words"
                    />
                  </>
                )}
                
                {registrationMode === 'department' && (
                  <TextInput
                    style={styles.input}
                    placeholder="Department ID"
                    value={departmentId}
                    onChangeText={setDepartmentId}
                    keyboardType="numeric"
                  />
                )}
                
                <Button
                  title={`Register ${registrationMode === 'student' ? 'Student' : 'Department Staff'}`}
                  onPress={handleRegister}
                  disabled={submitting}
                />
              </View>
            </View>
          )}
          
          <View style={styles.formRow}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Button
              title={editingId ? 'Update' : 'Add'}
              onPress={handleSubmit}
              disabled={submitting}
            />
            {editingId ? (
              <View style={{ marginTop: 8 }}>
                <Button title="Cancel" color="#888" onPress={resetForm} />
              </View>
            ) : null}
          </View>

          {loading ? (
            <ActivityIndicator size="large" style={{ marginTop: 16 }} />
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ paddingVertical: 8 }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                  </View>
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
                    <Text style={styles.btnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Text style={styles.btnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={!loading ? (
                <Text style={{ textAlign: 'center', marginTop: 24, color: '#666' }}>No users</Text>
              ) : null}
            />
          )}
        </>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {user.role !== 'student' && (
        <View style={styles.header}>
          <Text style={styles.title}>eClearance</Text>
          <View style={styles.userInfo}>
            <Text style={styles.userText}>{user.name} ({user.role})</Text>
            <Button title="Logout" onPress={handleLogout} />
          </View>
        </View>
      )}
      
      {renderMainContent()}
      
      {user.role === 'student' && (
        <BottomNavigation currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      )}
      
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
// styles moved to ./styles.js
