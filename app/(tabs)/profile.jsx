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
       
          </View>
      
        

      </SafeAreaView>
    )
  }

  export default Profile