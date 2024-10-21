import { View, Text, Alert } from 'react-native';
import React, { useState, useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import { router } from 'expo-router';
import CustomButtons from '../../components/CustomButtons';
import { sendPasswordResetEmail } from '../../lib/appwrite';
import { useNavigation } from '@react-navigation/native';
import AwesomeAlert from 'react-native-awesome-alerts'
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const navigation = useNavigation();
  const [showAlert, setShowAlert] = useState(false); // state to control alert visibility
  const [alertMessage, setAlertMessage] = useState(""); // state to set alert message
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handlePasswordReset = async () => {
    if (email === "") {
      setAlertMessage("Please enter your email"); // set error message
      setShowAlert(true); // show alert on error
      return;
    }

    setSubmitting(true);

    try {
      await sendPasswordResetEmail(email);
      setAlertMessage("Password reset email sent. Please check your inbox."); // set error message
      setShowAlert(true); // show alert on error
      router.replace("/sign-in");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="w-full mt-5 min-h-[85vh] px-3">
        <Text className="text-2xl text-white font-pbold">Forgot Password</Text>
        <Text className="text-lg text-gray-300 mt-3">
          Enter your email address and we will send you a link to reset your password.
        </Text>

        <FormField
          title="Email"
          value={email}
          handleChangeText={(e) => setEmail(e)}
          otherStyles="mt-7"
          keyboardType="email-address"
        />

        <CustomButtons 
          title="Send Reset Link"
          handlePress={handlePasswordReset}
          containerStyles="mt-7"
          isLoading={isSubmitting}
        />
        <CustomButtons 
          title="Cancel"
          handlePress={() => router.replace('sign-in')}
          containerStyles="mt-7"
          isLoading={isSubmitting}
        />
      </View>
        {/* Awesome Alert */}
        <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title="Error"
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="Close"
        confirmButtonColor="#DD6B55"
        onConfirmPressed={() => {
          setShowAlert(false); // close the alert
        }}
      />
    </SafeAreaView>
  );
}

export default ForgotPassword;
