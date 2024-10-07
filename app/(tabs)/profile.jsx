import { Modal,View, Text, TextInput, Image, TouchableOpacity, ScrollView, Button } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from "../../context/GlobalProvider";
import { signOut } from "../../lib/appwrite";
import { icons } from "../../constants";
import { router } from 'expo-router';
import CustomButton from '../../components/CustomButton';
import { updateUserProfile, updatePassword, updateEmail } from '../../lib/appwrite';

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(user ? user.phone : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewUserPassword] = useState(user ? user.password : '');
  const [isModalVisible, setModalVisible] = useState(false); // Modal state
  const [modalMessage, setModalMessage] = useState(''); // Modal message

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false);
    router.replace("/sign-in");
  };

  const toggleEditMode = async () => {
    if (isEditing) {
      try {
        const updatedUser = await updateUserProfile(user.$id, { phone, password: newPassword, email });
        if (email && email !== user.email) {
          await updateEmail(email, currentPassword);
        }
        if (newPassword) {
          await updatePassword(newPassword, currentPassword);
          setModalMessage('Password changed successfully!'); // Set success message
          setModalVisible(true); // Show modal
        }
        setUser(updatedUser);
      } catch (error) {
        console.error('Failed to update profile:', error);
        setModalMessage('Failed to update password. Please try again.'); // Set error message
        setModalVisible(true); // Show modal
      }
    } else {
      setCurrentPassword(''); // Clear password fields
      setNewUserPassword('');
    }
    setIsEditing(!isEditing);
  };
  

  if (!user) {
    return (
      <SafeAreaView className="bg-primary h-full flex items-center justify-center">
        <ScrollView>
          <Text className="text-gray-100">Loading...</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="w-full mb-6 px-4">
          <View className="w-full items-end">
            <TouchableOpacity onPress={logout} className="flex mb-10">
              <Image source={icons.logout} resizeMode="contain" className="w-8 h-8" />
            </TouchableOpacity>
          </View>

          <View className="flex items-center mb-6">
              <View className="w-24 h-24 rounded-full bg-black-200 items-center justify-center">
                <Text className="text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
          </View>

          <View className="px-4">
            <Text className="text-lg text-white font-semibold text-center mb-4">Account Information</Text>
      {!isEditing && (
<>
<View className="mb-4">
              <Text className="text text-gray-200 font-medium">Account Number</Text>
              <View className="mt-2 h-14 bg-black-200 rounded-xl border border-gray-600 p-4">
                <Text className="text text-gray-100 font-medium">{user.account_number}</Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text text-gray-200 font-medium">Name</Text>
              <View className="mt-2 h-14 bg-black-200 rounded-xl border border-gray-600 p-4">
                <Text className="text text-gray-100 font-medium">{user.name}</Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text text-gray-200 font-medium">Address</Text>
              <View className="mt-2 h-14 bg-black-200 rounded-xl border border-gray-600 p-4">
                <Text className="text text-gray-100 font-medium">{user.city}</Text>
              </View>
            </View>
            </>
      )}
 

            <View className="mb-4">
              <Text className="text text-gray-200 font-medium">Email</Text>
              <View className="mt-2 h-14 bg-black-200 rounded-xl border border-gray-600 p-4">
                {isEditing ? (
                  <TextInput
                    className="text w-full text-gray-100 font-medium"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="gray"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                ) : (
                  <Text className="text text-gray-100 font-medium">{email}</Text>
                )}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text text-gray-200 font-medium">Phone Number</Text>
              <View className="mt-2 h-14 bg-black-200 rounded-xl border border-gray-600 p-4">
                {isEditing ? (
                  <TextInput
                    className="text w-full text-gray-100 font-medium"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter your phone number"
                    placeholderTextColor="gray"
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text className="text text-gray-100 font-medium">{phone}</Text>
                )}
              </View>
            </View>

            {isEditing && (
              <>
                <View className="mb-4">
                  <Text className="text text-gray-200 font-medium">Current Password</Text>
                  <View className="mt-2 h-14 bg-black-200 rounded-xl border border-gray-600 p-4">
                    <TextInput
                      className="text w-full text-gray-100 font-medium"
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="Enter your current password"
                      placeholderTextColor="gray"
                      secureTextEntry
                    />
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text text-gray-200 font-medium">New Password</Text>
                  <View className="mt-2 h-14 bg-black-200 rounded-xl border border-gray-600 p-4">
                    <TextInput
                      className="text w-full text-gray-100 font-medium"
                      value={newPassword}
                      onChangeText={setNewUserPassword}
                      placeholder="Enter your new password"
                      placeholderTextColor="gray"
                      secureTextEntry
                    />
                  </View>
                </View>
              </>
            )}

<View className="mt-6 items-center flex-row">
  {/* Save / Edit Profile button */}
  <CustomButton 
    title={isEditing ? "Save" : "Edit Profile"} 
    className="w-40 rounded-full justify-center items-center shadow-lg mr-4"
    textClassName="text-lg text-white font-semibold"
    onPress={toggleEditMode} 
  />

  {/* Cancel button (only shown in editing mode) */}
  {isEditing && (
    <CustomButton 
      title="Cancel" 
      className="w-40 rounded-full justify-center items-center shadow-lg bg-gray-600"
      textClassName="text-lg text-white font-semibold"
      onPress={() => {
        // Exit edit mode and clear fields
        setIsEditing(false);
        setCurrentPassword('');  // Clear current password field
        setNewUserPassword('');  // Clear new password field
      }} 
    />
  )}
</View>
          </View>
                {/* Modal for password change notification */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>{modalMessage}</Text>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
