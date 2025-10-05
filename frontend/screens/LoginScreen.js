import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ImageBackground,
  Image,
  Alert
} from 'react-native';

export default function LoginScreen({ onLogin, onAdminLogin, submitting }) {
  const [loginType, setLoginType] = useState('student'); // 'student' or 'department'
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (loginType === 'student') {
      if (!studentId.trim() || !password.trim()) {
        Alert.alert('Validation', 'Student ID and password are required');
        return;
      }
      // Send student ID directly - backend will check both email and student_id
      onLogin(studentId.trim(), password);
    } else {
      if (!email.trim() || !password.trim()) {
        Alert.alert('Validation', 'Email and password are required');
        return;
      }
      onLogin(email.trim(), password);
    }
  };

  const handleAdminLogin = () => {
    if (typeof onAdminLogin === 'function') {
      onAdminLogin();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
      </View>
      
      <ImageBackground 
        source={require('../assets/background.jpg')} 
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.overlay} />
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/mysmclogo.webp')} style={styles.logoImage} />
          </View>
          
          <Text style={styles.appTitle}>eClearance</Text>
          <Text style={styles.appSubtitle}>Digital Clearance Processing</Text>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          {/* Tab Selection */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, loginType === 'student' && styles.activeTab]}
              onPress={() => setLoginType('student')}
            >
              <Text style={styles.tabIcon}>🎓</Text>
              <Text style={[styles.tabText, loginType === 'student' && styles.activeTabText]}>
                Student
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, loginType === 'department' && styles.activeTab]}
              onPress={() => setLoginType('department')}
            >
              <Text style={styles.tabIcon}>🏢</Text>
              <Text style={[styles.tabText, loginType === 'department' && styles.activeTabText]}>
                Department
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {loginType === 'student' ? 'Student Login' : 'Department Login'}
            </Text>

            {loginType === 'student' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Student ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your student ID"
                  value={studentId}
                  onChangeText={setStudentId}
                  autoCapitalize="none"
                  keyboardType="default"
                />
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={styles.signInButton}
              onPress={handleLogin}
              disabled={submitting}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin Login Link */}
        <TouchableOpacity style={styles.adminLink} onPress={handleAdminLogin}>
          <Text style={styles.adminLinkText}>Admin login here</Text>
        </TouchableOpacity>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1976d2' 
  },
  topBar: { 
    height: 56, 
    backgroundColor: '#1976d2', 
    justifyContent: 'center', 
    paddingHorizontal: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#1565c0' 
  },
  topBarLogo: { 
    width: 80, 
    height: 30, 
    resizeMode: 'contain' 
  },
  backgroundImage: {
    flex: 1,
    paddingHorizontal: 32,
  },
  backgroundImageStyle: {
    opacity: 0.75,
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  headerSection: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logoContainer: { 
    marginBottom: 20 
  },
  logoImage: { 
    width: 120, 
    height: 120, 
    resizeMode: 'contain' 
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 10,
  },
  loginCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  signInButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  adminLink: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  adminLinkText: {
    color: '#000',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
