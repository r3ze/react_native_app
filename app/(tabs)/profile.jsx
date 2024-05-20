import { View, Text, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from "../../context/GlobalProvider";
import { signOut } from "../../lib/appwrite";
import { icons } from "../../constants";
import { router } from 'expo-router';
import CustomButton from '../../components/CustomButton';
import { updateUserProfile, updatePassword, updateEmail } from '../../lib/appwrite'; // You will need to implement this function

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState(user ? `${user.city}, ${user.barangay}, ${user.street}` : '');
  const [phone, setPhone] = useState(user ? user.phone : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [password, setNewUserPassword] = useState(user ? user.password : '');
  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false);
    router.replace("/sign-in");
  };

  const toggleEditMode = async () => {
    if (isEditing) {
      // Save changes
      const addressParts = address.split(',').map(part => part.trim());
      const [city, barangay, street] = addressParts;

      try {
        const updatedUser = await updateUserProfile(user.$id, { city, barangay, street, phone, password, email });
        if (email && email !== user.email) {
          await updateEmail(email, currentPassword);
        }
       
        if (password) {
          await updatePassword(password, currentPassword);
         
        }
        setUser(updatedUser);
      } catch (error) {
        console.error('Failed to update profile:', error);
        console.error('Failed to update profile:', password);
      }
    }
    setIsEditing(!isEditing);
  };

  if (!user) {
    return (
      <SafeAreaView className="bg-primary h-full flex items-center justify-center">
        <Text className="text-gray-100">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
      <View className="w-full mt-6 mb-5 px-4">
        <View className="w-full items-end">
          <TouchableOpacity onPress={logout} className="flex mb-10">
            <Image source={icons.logout} resizeMode="contain" className="w-6 h-6" />
          </TouchableOpacity>
        </View>
        <View className="w-full flex-row items-center">
          <Image source={icons.avatar} resizeMode="contain" className="w-35 h-20" />
        </View>
        <View className="w-full mt-5 h-20 bg-black-100 rounded-2xl border-2 border-black-200 flex flex-row justify-between space-x-2">
          <View className="flex-row justify-between w-full items-center px-4">
            <View>
              <Text className="text text-gray-100 font-pmedium">{user.name}</Text>
              <Text className="text text-gray-100 font-pmedium" style={{ color: 'gray' }}>{user.email}</Text>
            </View>
          </View>
        </View>
        <View className="items-end">
          <CustomButton title={isEditing ? "Save" : "Edit Profile"} className="mt-3" onPress={toggleEditMode} />
        </View>
      </View>

      <View className="px-4">
        <Text className="text text-gray-100 font-pmedium">Address</Text>
        <View className="w-full mt-1 h-16 bg-black-100 rounded-2xl border-2 border-black-200 flex flex-row justify-between space-x-2">
          <View className="flex justify-center px-4">
            {isEditing ? (
              <TextInput
                className="text text-gray-100 font-pmedium"
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                placeholderTextColor="gray"
              />
            ) : (
              <Text className="text text-gray-100 font-pmedium">{address}</Text>
            )}
          </View>
        </View>

        <Text className="text text-gray-100 font-pmedium mt-4">Email</Text>
        <View className="w-full mt-1 h-16 bg-black-100 rounded-2xl border-2 border-black-200 flex flex-row justify-between space-x-2">
          <View className="flex justify-center px-4">
            {isEditing ? (
              <TextInput
                className="text text-gray-100 font-pmedium"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="gray"
              />
            ) : (
              <Text className="text text-gray-100 font-pmedium">{email}</Text>
            )}
          </View>
        </View>

        <Text className="text text-gray-100 font-pmedium mt-4">Phone number</Text>
        <View className="w-full mt-1 h-16 bg-black-100 rounded-2xl border-2 border-black-200 flex flex-row justify-between space-x-2">
          <View className="flex justify-center px-4">
            {isEditing ? (
              <TextInput
                className="text text-gray-100 font-pmedium"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="gray"
              />
            ) : (
              <Text className="text text-gray-100 font-pmedium">{phone}</Text>
            )}
          </View>
        </View>

        



        <Text className="text text-gray-100 font-pmedium mt-4">Current Password</Text>
        <View className="w-full mt-1 h-16 bg-black-100 rounded-2xl border-2 border-black-200 flex flex-row justify-between space-x-2">
          <View className="flex justify-center px-4">
            {isEditing ? (
              <TextInput
                className="text text-gray-100 font-pmedium"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter your current password"
                placeholderTextColor="gray"
              />
            ) : (
              <Text className="text text-gray-100 font-pmedium"></Text>
            )}
          </View>
        </View>

        <Text className="text text-gray-100 font-pmedium mt-4">New Password</Text>
        <View className="w-full mt-1 h-16 bg-black-100 rounded-2xl border-2 border-black-200 flex flex-row justify-between space-x-2">
          <View className="flex justify-center px-4">
            {isEditing ? (
              <TextInput
                className="text text-gray-100 font-pmedium"
                value={password}
                onChangeText={setNewUserPassword}
                placeholder="Enter your new password"
                placeholderTextColor="gray"

              />
            ) : (
              <Text className="text text-gray-100 font-pmedium"></Text>
            )}
          </View>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
