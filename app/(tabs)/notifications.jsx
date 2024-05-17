import { View, Text, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import { useGlobalContext } from "../../context/GlobalProvider";
import { getUserComplaints, signOut } from "../../lib/appwrite";
import {icons} from "../../constants"
import {router} from 'expo-router'
import { EmptyState} from "../../components/EmptyState";
import useAppwrite from '../../lib/useAppwrite';
const Notification = () => {


  return (
    <SafeAreaView className="bg-primary h-full">
  

        <View className="px-4 mt-5">
        <Text className="text-2xl text-white font-psemibold">
          Notifications
        </Text>
<View className="w-full mt-4 h-16 flex flex-row justify-between space-x-2">

<View className="w-1/5 justify-center items-center">
<Image
            source = {icons.repair}
            className="w-12 h-12"
            resizeMode='contain'
            />
</View>
<View className="flex justify-center px-4 w-3/5">
<Text className="text text-secondary font-psmall">Resolution team is coming!</Text>
</View>

<View className="  justify-end items-end mb-2 px-4 w-1/5">
<Text className="text text-gray-100">Today 1:00</Text>


</View>



</View>
</View>
    
      

    </SafeAreaView>
  )
}

export default Notification