  import { View, Text, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native'
  import React from 'react'
  import {SafeAreaView} from 'react-native-safe-area-context'
  import { useGlobalContext } from "../../context/GlobalProvider";
  import { getUserComplaints, signOut } from "../../lib/appwrite";
  import {icons} from "../../constants"
  import {router} from 'expo-router'
  import { EmptyState} from "../../components/EmptyState";
  import useAppwrite from '../../lib/useAppwrite';
  const Profile = () => {
    const { user, setUser, setIsLoggedIn } = useGlobalContext();
    const {data: complaints} = useAppwrite(
      () => getUserComplaints(user.$id)
    )

    const logout = async () => {
      await signOut();
      setUser(null);
      setIsLoggedIn(false);
  
      router.replace("/sign-in");
    };
    return (
      <SafeAreaView className="bg-primary">
    
        <FlatList 
        data={complaints}
        keyExtractor={(item) => item.$id}
        renderItem={({item}) => (
          <View className="w-full mt-3 h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex justify-center items-center flex-row space-x-2">
          <Text className="text text-white font-pmedium">{item.description}</Text>
          <Text className="text text-white">{item.status}</Text>
          </View>
        )}

  

        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <View className="w-full items-end">
            <TouchableOpacity
              onPress={logout}
              className="flex  mb-10"
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>
            </View>

            <Image
                source={icons.fleco}
                resizeMode="contain"
                className="w-35 h-20"
              />
              <View>

                <Text className="text-white mt-5 font-pmedium">
                  Active Complaints
                </Text>
              </View>
          </View>
        )}
        />

      </SafeAreaView>
    )
  }

  export default Profile