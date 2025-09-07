import React from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';

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
    // User management state/handlers
    editingId,
    resetForm,
    handleSubmit,
    loading,
    users,
    handleEdit,
    handleDelete,
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


