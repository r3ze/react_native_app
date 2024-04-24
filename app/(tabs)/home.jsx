import { View, Text, FlatList, Image } from 'react-native'
import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {icons} from "../../constants"
const home = () => {
  return (
    <SafeAreaView className="bg-primary">
      <FlatList 
      data={[{id:1}]}
      keyExtractor={(item) => item.$id}
      renderItem={({item}) => (
        <Text className="text-3xl text-white">{item.id} </Text>
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
            resizeMethod='contain'
            />

          </View>

          </View>

          
        </View>
      )}
      />
    </SafeAreaView>
  )
}

export default home