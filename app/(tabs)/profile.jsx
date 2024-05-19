import { View, Text, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from "../../context/GlobalProvider";
import { signOut } from "../../lib/appwrite";
import { icons } from "../../constants";
import { router } from 'expo-router';
import CustomButton from '../../components/CustomButton';
import { useState } from 'react';

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false);
    router.replace("/sign-in");
  };

  if (!user) {
    // Render a loading state or some placeholder if user is null
    return (
      <SafeAreaView className="bg-primary h-full flex items-center justify-center">
        <Text className="text-gray-100">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="w-full mt-6 mb-12 px-4">
        <View className="w-full items-end">
          <TouchableOpacity
            onPress={logout}
            className="flex mb-10"
          >
            <Image
              source={icons.logout}
              resizeMode="contain"
              className="w-6 h-6"
            />
          </TouchableOpacity>
        </View>
        <View className="w-full flex-row items-center">
          <Image
            source={icons.avatar}
            resizeMode="contain"
            className="w-35 h-20"
          />
        </View>

        <View className="w-full mt-5 h-20 bg-black-100 rounded-2xl border-2 border-black-200 flex flex-row justify-between space-x-2">
          <View className="flex-row justify-between w-full items-center px-4">
            <View>
              <Text className="text text-gray-100 font-pmedium">{user.name}</Text>
              <Text className="text text-gray-100 font-pmedium" style={{ color: 'gray' }}>{user.email}</Text>
            </View>
            <CustomButton
              title="Edit Profile"
            />
          </View>
        </View>
      </View>
      <View className="px-4">
        <Text className="text text-gray-100 font-pmedium">Address</Text>
        <View className="w-full mt-1 h-16 bg-black-100 rounded-2xl border-2 border-black-200 flex flex-row justify-between space-x-2">
          <View className="flex justify-center px-4">
            <Text className="text text-gray-100 font-pmedium">{user.city}, {user.barangay}, {user.street}</Text>
          </View>
        </View>

        <Text className="text text-gray-100 font-pmedium mt-4">Phone number</Text>
        <View className="w-full mt-1 h-16 bg-black-100 rounded-2xl border-2 border-black-200 flex flex-row justify-between space-x-2">
          <View className="flex justify-center px-4">
            <Text className="text text-gray-100 font-pmedium">{user.phone}</Text>
          </View>
        </View>

        <Text className="text text-gray-100 font-pmedium mt-4">Account number</Text>
        <View className="w-full mt-1 h-16 bg-black-100 rounded-2xl border-2 border-black-200 flex flex-row justify-between space-x-2">
          <View className="flex justify-center px-4">
            <Text className="text text-gray-100 font-pmedium">{user.account_number}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
