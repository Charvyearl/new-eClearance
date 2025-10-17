import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ImageBackground } from 'react-native';

export default function WelcomeScreen({ onGetStarted }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
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
    borderBottomColor: '#1565c0' 
  },
  topBarLogo: { width: 80, height: 30, resizeMode: 'contain' },
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
});
