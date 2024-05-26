import { View, Text, FlatList, Image, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {icons} from "../../constants"
import { useGlobalContext } from "../../context/GlobalProvider";
import useAppwrite from '../../lib/useAppwrite';
import { getUserComplaints} from "../../lib/appwrite";
import { useState } from "react";
import { useNavigation } from '@react-navigation/native';
import CustomButtons from "../../components/CustomButtons";
import CustomButton from '../../components/CustomButton';
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
  const navigation = useNavigation();

  const handlePress = (item) => {
    navigation.navigate('screens/ComplaintDetails', { complaint: item });
  };
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
        renderItem={({ item }) => (
         
            <View className="mb-10">
            <View className=" w-full flex-row justify-between px-4 ">
            <Text className="text text-secondary font-pmedium ">In Progress</Text>
            <Text className="text text-gray-100 font-pmedium" style={{color:'gray'}}>Ticket ID: {item.$id}</Text>
            
            </View>
              <View className="w-full mt-3 h-30  flex flex-row justify-between space-x-2">
                <View className="flex-row  px-4">
                <View className =" w-1/5 mr-2" >
            <Image
            source = {{uri: item.image}}
            className="h-20 w-20"
            resizeMode='contain'
            />

          </View>

          <View className="flex w-4/5">
                  <Text className=" mt-1 text text-white font-pmedium">{item.description}</Text>
                  <Text className=" mt-1 text text-gray-100 font-pmedium" style={{color:'gray'}}>{item.additionalDetails}</Text>
                  </View>
                </View>
              
              </View>
              <View className=" px-4 w-full flex-row justify-around mt-3">
              <CustomButton
                title="WITHDRAW"
              
              />
              <CustomButton
                title="TRACK"
                onPress={() => handlePress(item)}
              
              />
            </View>
            </View>
            
       
        )}

      ListHeaderComponent={() =>(
        <View className="my-6 px-4 space-y-6">
          <View className="justify-between items-start flex-row mb-6">
          <View>
            <Text className="font-pmedium text-sm text-gray-100">Welcome Back</Text>
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
          <Text className="text-white font-pbold text-2xl">My Complaints</Text>

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