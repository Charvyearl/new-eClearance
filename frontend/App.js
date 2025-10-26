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
  Image,
} from 'react-native';
import StudentDashboard from './screens/StudentDashboard';
import RequirementsScreen from './screens/RequirementsScreen';
import StudentProfile from './screens/StudentProfile';
import BottomNavigation from './components/BottomNavigation';
import AdminPanel from './screens/AdminPanel';
import styles from './styles';
import WelcomeScreen from './screens/WelcomeScreen'; // Added import for WelcomeScreen
import LoginScreen from './screens/LoginScreen';
import DepartmentDashboard from './screens/DepartmentDashboard';
import RequirementsManagement from './screens/RequirementsManagement';
import DepartmentRequests from './screens/DepartmentRequests';
import DepartmentProfile from './screens/DepartmentProfile';
import AdminAccounts from './screens/AdminAccounts';
import AdminBottomNavigation from './components/AdminBottomNavigation';
import AdminDepartments from './screens/AdminDepartments';

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
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [registrationMode, setRegistrationMode] = useState('student'); // 'student' or 'department'
  const [currentScreen, setCurrentScreen] = useState('dashboard'); // 'dashboard', 'requirements', 'profile'
  const [departmentScreen, setDepartmentScreen] = useState('dashboard'); // 'dashboard', 'requirements', 'requests', 'profile'
  const [adminScreen, setAdminScreen] = useState('panel'); // 'panel' | 'accounts' | 'departments'
  const [showWelcome, setShowWelcome] = useState(true); // Added state for welcome screen
  

  const API_URL = useMemo(() => {
    // Use environment variable if available, otherwise auto-detect
    if (process.env.EXPO_PUBLIC_API_URL) {
      return process.env.EXPO_PUBLIC_API_URL;
    }
    
    // For web, use localhost
    if (typeof window !== 'undefined' && window.location) {
      return 'http://109.123.227.37:9080';
    }
    
    // For mobile devices (Expo Go), use local network IP
    return 'http://109.123.227.37:9080';
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

  async function loadDepartments() {
    try {
      const res = await fetch(`${API_URL}/departments`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setDepartments(data);
      }
    } catch {}
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

  async function handleAuth(emailOrStudentId, password, mode = 'normal') {
    if (!emailOrStudentId.trim() || !password.trim()) {
      Alert.alert('Validation', 'Email/Student ID and password are required');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Set auth mode based on the mode parameter
      if (mode === 'admin') {
        setAuthMode('admin-login');
      }
      
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrStudentId.trim(), password }),
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
    } else if (registrationMode === 'department') {
      const parsedDeptId = Number(String(departmentId).trim());
      if (!Number.isFinite(parsedDeptId) || parsedDeptId <= 0) {
        Alert.alert('Validation', 'Please select a valid department');
        return;
      }
    }
    
    try {
      setSubmitting(true);
      const payload = { 
        name: name.trim(), 
        email: email.trim(), 
        password,
        phone: registrationMode === 'student' ? phone.trim() : null,
        course: registrationMode === 'student' ? course.trim() : null,
        student_id: registrationMode === 'student' ? studentId.trim() : null,
        year_level: registrationMode === 'student' ? yearLevel.trim() : null,
        role: registrationMode,
        department_id: registrationMode === 'department' ? Number(String(departmentId).trim()) : null
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
            if (!data.user.student_id || !data.user.course || !data.user.year_level || !data.user.phone) {
              try {
                const res2 = await fetch(`${API_URL}/users/${data.user.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                const full = await res2.json();
                if (full && full.id) {
                  setUser((prev) => ({ ...prev, ...full }));
                }
              } catch {}
            }
            // If admin, load departments for registration UI
            if (data.user.role === 'admin') {
              loadDepartments();
            }
          }
        } catch (e) {}
      })();
    }
  }, [token]);

  if (showWelcome) {
    return <WelcomeScreen onGetStarted={() => setShowWelcome(false)} onAdminLogin={() => setAuthMode('admin-login')} />;
  }

  if (!user) {
    if (authMode === 'admin-login') {
      // Show enhanced admin login form
    return (
      <SafeAreaView style={styles.adminContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1a237e" translucent={false} />
        
        {/* Background Gradient Effect */}
        <View style={styles.adminBackground}>
          <View style={styles.adminGradient} />
        </View>
        
        {/* Header with Logo */}
        <View style={styles.adminHeader}>
          <View style={styles.adminLogoContainer}>
            <Image source={require('./assets/mysmclogo.webp')} style={styles.adminLogo} />
          </View>
          <Text style={styles.adminTitle}>Admin Portal</Text>
          <Text style={styles.adminSubtitle}>eClearance Management System</Text>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>🔐 SECURE ACCESS</Text>
          </View>
        </View>

        {/* Admin Login Card */}
        <View style={styles.adminCard}>
          <View style={styles.adminCardHeader}>
            <Text style={styles.adminCardTitle}>Administrator Access</Text>
            <Text style={styles.adminCardSubtitle}>Sign in to manage the system</Text>
          </View>

          {/* Back Button */}
          <TouchableOpacity 
            style={styles.adminBackBtn}
            onPress={() => setAuthMode('login')}
          >
            <Text style={styles.adminBackIcon}>←</Text>
            <Text style={styles.adminBackText}>Back to Student/Department Login</Text>
          </TouchableOpacity>

          {/* Login Form */}
          <View style={styles.adminForm}>
            <View style={styles.adminInputGroup}>
              <Text style={styles.adminInputLabel}>Admin Email</Text>
              <View style={styles.adminInputContainer}>
                <Text style={styles.adminInputIcon}>📧</Text>
                <TextInput
                  style={styles.adminInput}
                  placeholder="Enter admin email"
                  placeholderTextColor="#9e9e9e"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>
            
            <View style={styles.adminInputGroup}>
              <Text style={styles.adminInputLabel}>Password</Text>
              <View style={styles.adminInputContainer}>
                <Text style={styles.adminInputIcon}>🔒</Text>
                <TextInput
                  style={styles.adminInput}
                  placeholder="Enter password"
                  placeholderTextColor="#9e9e9e"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.adminLoginBtn, submitting && styles.adminLoginBtnDisabled]}
              onPress={() => handleAuth(email, password, 'admin')}
              disabled={submitting}
            >
              <Text style={styles.adminLoginBtnText}>
                {submitting ? 'Signing In...' : '🚀 Sign In as Admin'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.adminFooter}>
          <Text style={styles.adminFooterText}>© 2025 Developed by Cortez Charvy</Text>
        </View>
      </SafeAreaView>
      );
    }
    
    // Show the new LoginScreen for normal login
    return (
      <LoginScreen 
        onLogin={handleAuth}
        onAdminLogin={() => setAuthMode('admin-login')}
        submitting={submitting}
      />
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
          return <StudentDashboard API_URL={API_URL} token={token} user={user} />;
        case 'requirements':
          return <RequirementsScreen API_URL={API_URL} token={token} user={user} />;
        case 'profile':
          return (
            <View style={{ flex: 1, backgroundColor: '#e3f2fd' }}>
              <StudentProfile user={user} onLogout={handleLogout} />
            </View>
          );
        default:
          return <StudentDashboard API_URL={API_URL} token={token} user={user} />;
      }
    } else if (user.role === 'department') {
      switch (departmentScreen) {
        case 'dashboard':
          return <DepartmentDashboard user={user} onLogout={handleLogout} onNavigate={setDepartmentScreen} API_URL={API_URL} token={token} />;
        case 'requirements':
          return <RequirementsManagement user={user} onLogout={handleLogout} onNavigate={setDepartmentScreen} API_URL={API_URL} token={token} />;
        case 'requests':
          return <DepartmentRequests user={user} onLogout={handleLogout} onNavigate={setDepartmentScreen} API_URL={API_URL} token={token} />;
        case 'profile':
          return <DepartmentProfile user={user} onLogout={handleLogout} onNavigate={setDepartmentScreen} />;
        default:
          return <DepartmentDashboard user={user} onLogout={handleLogout} onNavigate={setDepartmentScreen} API_URL={API_URL} token={token} />;
      }
    } else {
      return (
        <>
          <View style={{ flex: 1 }}>
            {adminScreen === 'panel' && (
              <AdminPanel
                user={user}
                styles={styles}
                registrationMode={registrationMode}
                setRegistrationMode={setRegistrationMode}
                API_URL={API_URL}
                token={token}
                loadDepartments={loadDepartments}
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                phone={phone}
                setPhone={setPhone}
                course={course}
                setCourse={setCourse}
                studentId={studentId}
                setStudentId={setStudentId}
                yearLevel={yearLevel}
                setYearLevel={setYearLevel}
                departmentId={departmentId}
                setDepartmentId={setDepartmentId}
                departments={departments}
                submitting={submitting}
                handleRegister={handleRegister}
                loading={loading}
              />
            )}
            {adminScreen === 'accounts' && (
              <AdminAccounts
                styles={styles}
                users={users}
                loading={loading}
                handleDelete={handleDelete}
                onUpdateUser={async (id, payload) => {
                  try {
                    const res = await fetch(`${API_URL}/users/${id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(payload),
                    });
                    if (!res.ok) {
                      const msg = res.status === 409 ? 'Email already exists' : 'Update failed';
                      Alert.alert('Error', msg);
                      return;
                    }
                    await loadUsers();
                  } catch (e) {
                    Alert.alert('Error', 'Update failed');
                  }
                }}
              />
            )}
            {adminScreen === 'departments' && (
              <AdminDepartments
                styles={styles}
                departments={departments}
                loading={loading}
                onRefresh={loadDepartments}
                onUpdate={async (id, payload) => {
                  try {
                    const res = await fetch(`${API_URL}/departments/${id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify(payload),
                    });
                    if (!res.ok) {
                      const data = await res.json().catch(() => ({}));
                      Alert.alert('Error', data.message || 'Update failed');
                      return;
                    }
                    await loadDepartments();
                  } catch (e) {
                    Alert.alert('Error', 'Update failed');
                  }
                }}
                onDelete={async (id) => {
                  try {
                    const res = await fetch(`${API_URL}/departments/${id}`, {
                      method: 'DELETE',
                      headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (!res.ok) {
                      const data = await res.json().catch(() => ({}));
                      Alert.alert('Error', data.message || 'Delete failed');
                      return;
                    }
                    await loadDepartments();
                  } catch (e) {
                    Alert.alert('Error', 'Delete failed');
                  }
                }}
              />
            )}
          </View>
          <AdminBottomNavigation currentTab={adminScreen} setCurrentTab={setAdminScreen} />
        </>
      );
    }
  };

  // For department users, don't use SafeAreaView to avoid white space
  if (user.role === 'department') {
    return (
      <View style={{ flex: 1 }}>
        {renderMainContent()}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {user.role === 'admin' && (
        <View style={{ height: 56, backgroundColor: '#1976d2', justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1565c0', flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('./assets/mysmclogo.webp')} style={{ width: 80, height: 30, resizeMode: 'contain' }} />
          <View style={{ flex: 1 }} />
          <Button title="Logout" onPress={handleLogout} color="#000" />
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
