// components/CustomButton.jsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const CustomButton = ({ title, onPress, isLoading, style, borderColor, textColor }) => {
  return (
    <TouchableOpacity
    className="  border-2 border-black-200"
      style={[
        styles.button,
        style,
        { minHeight: 40 },
      ]}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor || '#FF9C01'} />
      ) : (
        <Text style={[styles.buttonText]} className="text-sm text-gray-100 font-pmedium">{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '47%',
   
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
  },
  buttonText: {
   
 
  },
});

export default CustomButton;
