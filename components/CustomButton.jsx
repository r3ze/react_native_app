// components/CustomButton.jsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const CustomButton = ({ title, onPress, isLoading, style, borderColor, textColor }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        { borderColor: borderColor || '#FF9C01', minHeight: 40 },
      ]}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor || '#FF9C01'} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor || '#FF9C01' }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '47%',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomButton;
