import React from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, TouchableOpacity, ScrollView, Image } from 'react-native';
function AddDepartmentForm({ API_URL, token, onCreated, styles }) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data && data.message ? data.message : 'Failed to create department');
        return;
      }
      setName('');
      setDescription('');
      if (onCreated) onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.addDepartmentCard}>
      <View style={styles.addDepartmentHeader}>
        <Text style={styles.addDepartmentTitle}>🏢 Add New Department</Text>
        <Text style={styles.addDepartmentSubtitle}>Create a new department for the system</Text>
      </View>
      
      <View style={styles.addDepartmentForm}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Department Name</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🏛️</Text>
            <TextInput
              style={styles.modernInput}
              placeholder="Enter department name"
              placeholderTextColor="#9e9e9e"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>📝</Text>
            <TextInput
              style={styles.modernInput}
              placeholder="Enter department description"
              placeholderTextColor="#9e9e9e"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.addDepartmentBtn, saving && styles.addDepartmentBtnDisabled]}
          onPress={handleCreate}
          disabled={saving}
        >
          <Text style={styles.addDepartmentBtnText}>
            {saving ? 'Creating...' : '➕ Create Department'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminPanel(props) {
  const {
    user,
    styles,
    // Registration state
    registrationMode,
    setRegistrationMode,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    phone,
    setPhone,
    course,
    setCourse,
    studentId,
    setStudentId,
    yearLevel,
    setYearLevel,
    departmentId,
    setDepartmentId,
    departments,
    submitting,
    handleRegister,
    API_URL,
    token,
    loadDepartments,
    loading,
    onViewAccounts,
  } = props;

  return (
    <ScrollView style={styles.adminPanelContainer} showsVerticalScrollIndicator={false}>
      {user.role === 'admin' && (
        <View style={styles.adminPanelCard}>
          {/* Header Section */}
          <View style={styles.adminPanelHeader}>
            <View style={styles.adminPanelTitleContainer}>
              <Text style={styles.adminPanelTitle}>👥 User Registration</Text>
              <Text style={styles.adminPanelSubtitle}>Create new student or department accounts</Text>
            </View>
            <View style={styles.adminPanelIcon}>
              <Text style={styles.adminPanelIconText}>⚙️</Text>
            </View>
          </View>

          {/* Registration Mode Toggle */}
          <View style={styles.registrationToggle}>
            <TouchableOpacity
              style={[styles.regToggleBtn, registrationMode === 'student' && styles.regToggleBtnActive]}
              onPress={() => setRegistrationMode('student')}
            >
              <Text style={styles.regToggleIcon}>🎓</Text>
              <Text style={[styles.regToggleText, registrationMode === 'student' && styles.regToggleTextActive]}>Register Student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.regToggleBtn, registrationMode === 'department' && styles.regToggleBtnActive]}
              onPress={() => setRegistrationMode('department')}
            >
              <Text style={styles.regToggleIcon}>🏢</Text>
              <Text style={[styles.regToggleText, registrationMode === 'department' && styles.regToggleTextActive]}>Register Department</Text>
            </TouchableOpacity>
          </View>

          {/* Registration Form */}
          <View style={styles.registrationForm}>
            {/* Basic Information */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>📋 Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.modernInput}
                    placeholder="Enter full name"
                    placeholderTextColor="#9e9e9e"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    style={styles.modernInput}
                    placeholder="Enter email address"
                    placeholderTextColor="#9e9e9e"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.modernInput}
                    placeholder="Enter password"
                    placeholderTextColor="#9e9e9e"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            {/* Student-specific fields */}
            {registrationMode === 'student' && (
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>🎓 Student Information</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>📱</Text>
                    <TextInput
                      style={styles.modernInput}
                      placeholder="Enter phone number"
                      placeholderTextColor="#9e9e9e"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Course/Program</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>📚</Text>
                    <TextInput
                      style={styles.modernInput}
                      placeholder="Enter course or program"
                      placeholderTextColor="#9e9e9e"
                      value={course}
                      onChangeText={setCourse}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Student ID</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>🆔</Text>
                    <TextInput
                      style={styles.modernInput}
                      placeholder="Enter student ID"
                      placeholderTextColor="#9e9e9e"
                      value={studentId}
                      onChangeText={setStudentId}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Year Level</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>🎯</Text>
                    <TextInput
                      style={styles.modernInput}
                      placeholder="e.g., 1st Year, 2nd Year"
                      placeholderTextColor="#9e9e9e"
                      value={yearLevel}
                      onChangeText={setYearLevel}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Department-specific fields */}
            {registrationMode === 'department' && (
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>🏢 Department Assignment</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Select Department</Text>
                  <View style={styles.departmentGrid}>
                    {(departments || []).map((d) => (
                      <TouchableOpacity
                        key={d.id}
                        style={[
                          styles.departmentCard,
                          String(departmentId) === String(d.id) && styles.departmentCardActive
                        ]}
                        onPress={() => setDepartmentId(String(d.id))}
                      >
                        <Text style={styles.departmentIcon}>🏛️</Text>
                        <Text style={[
                          styles.departmentName,
                          String(departmentId) === String(d.id) && styles.departmentNameActive
                        ]}>
                          {d.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.registerBtn, submitting && styles.registerBtnDisabled]}
              onPress={handleRegister}
              disabled={submitting}
            >
              <Text style={styles.registerBtnText}>
                {submitting ? 'Creating Account...' : `🚀 Register ${registrationMode === 'student' ? 'Student' : 'Department Staff'}`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Add Department Section */}
          {registrationMode === 'department' && (
            <View style={styles.addDepartmentSection}>
              <AddDepartmentForm API_URL={API_URL} token={token} onCreated={loadDepartments} styles={styles} />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}


