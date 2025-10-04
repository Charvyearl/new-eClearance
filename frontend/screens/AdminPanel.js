import React from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
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
    <View>
      <TextInput
        style={styles.input}
        placeholder="Department Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
      />
      <Button title={saving ? 'Saving...' : 'Add Department'} onPress={handleCreate} disabled={saving} />
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
              <>
                <Text style={{ marginVertical: 8, fontWeight: '600' }}>Select Department</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {(departments || []).map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      style={[
                        { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#1976d2', margin: 4 },
                        String(departmentId) === String(d.id) && { backgroundColor: '#1976d2' }
                      ]}
                      onPress={() => setDepartmentId(String(d.id))}
                    >
                      <Text style={[{ color: '#1976d2' }, String(departmentId) === String(d.id) && { color: 'white' }]}>{d.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Button
              title={`Register ${registrationMode === 'student' ? 'Student' : 'Department Staff'}`}
              onPress={handleRegister}
              disabled={submitting}
            />
          </View>

          {registrationMode === 'department' && (
            <View style={[styles.formRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E0E0E0' }]}>
              <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Add New Department</Text>
              <AddDepartmentForm API_URL={API_URL} token={token} onCreated={loadDepartments} styles={styles} />
            </View>
          )}
        </View>
      )}

      {/* Removed inline Name/Email user form */}

      {/* Accounts moved to dedicated screen via AdminNav */}
    </>
  );
}


