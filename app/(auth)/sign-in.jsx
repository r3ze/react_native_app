import { View, Text, ScrollView, Image } from 'react-native'
import React, {useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {icons} from '../../constants'
import FormField from '../../components/FormField'
const SignIn = () => {
  const [Form, setForm] = useState({
   email:'',
   password: ''
})
  return (
   <SafeAreaView className="bg-primary  h-full">
    <ScrollView>
      <View className="w-full mt-5  min-h-[85vh] ">
        <View className="items-center">
        <Image
      source={icons.fleco}
      resizeMode='contain'
      className="max-w-[300px]  h-[250px]"
      Text
      />
        </View>
   <View className ="px-3">
   <FormField
  title="Email"
  value={Form.email}
  handleChangeText={(e) => setForm({ ...Form, email: e})}
  otherStyles="mt-7"
  keyboardType="email-address"
  />

<FormField
  title="Password"
  value={Form.password}
  handleChangeText={(e) => setForm({ ...Form, password: e})}
  otherStyles="mt-7"
 
  />
   </View>
  

      </View>

    </ScrollView>
   </SafeAreaView>
  )
}

export default SignIn