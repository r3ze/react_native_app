import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text } from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';
import { account } from '../../lib/appwrite';  // Adjust the path if needed

const ResetPassword = () => {
  const { userId, secret } = useSearchParams();  // Get userId and secret from URL
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handlePasswordReset = async () => {
    if (!newPassword) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }

    setSubmitting(true);

    try {
      // Call Appwrite's updateRecovery function to reset the password
      await account.updateRecovery(userId, secret, newPassword, newPassword);
      Alert.alert("Success", "Password has been reset. You can now log in with your new password.");
      router.replace('/auth/sign-in');  // Redirect to sign-in screen after successful reset
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Enter your new password:</Text>
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 8, marginVertical: 12 }}
        placeholder="New password"
      />
      <Button
        title={isSubmitting ? "Resetting..." : "Reset Password"}
        onPress={handlePasswordReset}
        disabled={isSubmitting}
      />
    </View>
  );
};

export default ResetPassword;
