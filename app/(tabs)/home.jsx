import { View, Text, FlatList, Image, RefreshControl } from 'react-native'
import React, { useEffect } from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {icons} from "../../constants"
import { useGlobalContext } from "../../context/GlobalProvider";
import useAppwrite from '../../lib/useAppwrite';
import { getUserComplaints} from "../../lib/appwrite";
import { useState } from "react";

// Function to format the date
function formatDate(createdAt) {
  const createdAtDate = new Date(createdAt);
  const currentDate = new Date();

  const diffInDays = (currentDate - createdAtDate) / (1000 * 60 * 60 * 24);

  if (diffInDays < 1 && currentDate.getDate() === createdAtDate.getDate()) {
      return 'today ' + formatTime(createdAtDate);
  } else if (diffInDays < 2 && currentDate.getDate() - createdAtDate.getDate() === 1) {
      return 'yesterday ' + formatTime(createdAtDate);
  } else {
      const options = { weekday: 'long', hour: 'numeric', minute: 'numeric' };
      return createdAtDate.toLocaleDateString(undefined, options);
  }
}

// Function to format time (HH:MM)
function formatTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

const home = () => {



  
  const { user } = useGlobalContext();
  const {data: complaints, refetch} = useAppwrite(
    () => getUserComplaints(user.$id)
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  return (
    <SafeAreaView className="bg-primary h-full ">
  
       <FlatList 
        data={complaints}
        keyExtractor={(item) => item.$id}
        renderItem={({item}) => (
          <View className="px-4">

          <View className="w-full mt-3 h-16 bg-black-100 rounded-2xl border-2 border-black-200 flex flex-row justify-between space-x-2">
         
          <View className="flex justify-center px-4 w-3/5">
          <Text className="text text-secondary font-pmedium">{item.description}</Text>
          </View>

          <View className=" justify-end items-end mb-2 px-4 w-2/5">
          <Text className="text text-gray-100">{formatDate(item.createdAt)}</Text>
          <Text className="text text-white">{item.status}</Text>
          </View>

          </View>
          </View>
        )}
        

      ListHeaderComponent={() =>(
        <View className="my-6 px-4 space-y-6">
          <View className="justify-between items-start flex-row mb-6">
          <View>
            <Text className="font-pmedium text-sm text-gray-100">Welcome Back</Text>
            <Text className="text-2xl font-psemibold text-white">Danzel</Text>
          </View>
          <View className="">
            <Image
            source = {icons.fleco}
            className="w-20 h-20"
            resizeMode='contain'
            />

          </View>

          </View>
          
          <View className="items-center w-full">
          <Text className="text-white font-pbold text-2xl">Active Complaints</Text>

          </View>
          
        </View>
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      />
    </SafeAreaView>
  )
}

export default home