import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

export default function AdminNav(props) {
  const { styles, current, onChange } = props;

  const Tab = ({ id, label }) => (
    <TouchableOpacity
      style={[
        styles.toggleBtn,
        current === id && styles.toggleBtnActive,
      ]}
      onPress={() => onChange(id)}
    >
      <Text style={[styles.toggleText, current === id && styles.toggleTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.authContainer, { flexDirection: 'row', justifyContent: 'center' }]}>
      <Tab id="panel" label="Registration" />
      <Tab id="accounts" label="Accounts" />
    </View>
  );
}


