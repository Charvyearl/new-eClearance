import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ImageBackground } from 'react-native';

export default function WelcomeScreen({ onGetStarted, onAdminLogin }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
        <TouchableOpacity style={styles.adminButton} onPress={onAdminLogin}>
          <Text style={styles.adminButtonText}>Admin Login</Text>
        </TouchableOpacity>
      </View>
      
      <ImageBackground 
        source={require('../assets/background.jpg')} 
        style={styles.mainContent}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay} />
        <View style={styles.logoContainer}>
          <Image source={require('../assets/mysmclogo.webp')} style={styles.logoImage} />
        </View>
        
        <Text style={styles.welcomeText}>
          Welcome to St. Michael's College{'\n'}eClearance!
        </Text>
        
        <TouchableOpacity style={styles.getStartedBtn} onPress={onGetStarted}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.copyrightIcon}>©</Text>
          <Text style={styles.copyrightText}>Copyright 2025 Developed by Cortez Charvy</Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1976d2' },
  topBar: { 
    height: 56, 
    backgroundColor: '#1976d2', 
    justifyContent: 'center', 
    paddingHorizontal: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#1565c0',
    flexDirection: 'row',
    alignItems: 'center'
  },
  topBarLogo: { width: 80, height: 30, resizeMode: 'contain' },
  adminButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 'auto'
  },
  adminButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  mainContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  backgroundImage: { 
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
  logoContainer: { marginBottom: 40 },
  logoImage: { width: 120, height: 120, resizeMode: 'contain' },
  mainLogo: { 
    fontSize: 48, 
    fontWeight: 'bold', 
    color: '#fff',
    textAlign: 'center'
  },
  welcomeText: { 
    fontSize: 18, 
    color: '#fff', 
    textAlign: 'center', 
    lineHeight: 24,
    marginBottom: 60
  },
  getStartedBtn: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 32, 
    paddingVertical: 16, 
    borderRadius: 8 
  },
  getStartedText: { 
    color: '#1976d2', 
    fontSize: 18, 
    fontWeight: '600' 
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  copyrightIcon: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginRight: 4,
  },
  copyrightText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
});
