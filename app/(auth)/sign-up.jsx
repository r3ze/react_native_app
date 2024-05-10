import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, {useState} from 'react'
import { Link, router } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context'
import {icons} from '../../constants'
import FormField from '../../components/FormField'
import CustomButtons from '../../components/CustomButtons'
import {getCurrentUser, signIn} from '../../lib/appwrite'
import { useGlobalContext } from "../../context/GlobalProvider"
import {createUser} from '../../lib/appwrite'
const SignUp = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name:"",
    email: "",
    accountNumber:"",
    password: "",
  });

  const submit = async () => {
    if(!form.name || !form.email || !form.password||!form.accountNumber){
      Alert.alert('Error', 'Please fill in all fields')
   
    }
    setSubmitting(true)
    try {
      const result = await createUser(form.email, form.password, form.name, form.accountNumber)
      setUser(result);
      setIsLoggedIn(true);
      router.replace("/home")
      Alert.alert('Account created successfully')


    } catch (error) {
      Alert.alert('Error', error.message)

    } finally{
      setSubmitting(false)
    }
  };


  return (
   <SafeAreaView className="bg-primary  h-full">
    <ScrollView>
      <View className="w-full min-h-[85vh] ">
        <View className="items-center">
        <Image
      source={icons.fleco}
      resizeMode='contain'
      className="max-w-[300px]  h-[120px]"
      Text
      />
        </View>
   <View className ="px-3">

   <FormField
  title="Name"
  value={form.name}
  handleChangeText={(e) => setForm({ ...form, name: e})}
  otherStyles="mt-7 "

  />

   <FormField
  title="Email"
  value={form.email}
  handleChangeText={(e) => setForm({ ...form, email: e})}
  otherStyles="mt-7"
  keyboardType="email-address"
  />

  <FormField
  title="Account Number"
  value={form.accountNumber}
  handleChangeText={(e) => setForm({ ...form, accountNumber: e})}
  otherStyles="mt-7"
 
  />

<FormField
  title="Password"
  value={form.password}
  handleChangeText={(e) => setForm({ ...form, password: e})}
  otherStyles="mt-7"
 
  />
    <CustomButtons 
    title="Sign up"
    handlePress={submit}
    containerStyles="mt-7"
    isLoading={isSubmitting}/>
   </View>
  
   <View className="justify-center pt-5 flex-row gap-2 mb-4">
       <Text className="text-lg text-gray-100 font-pregular">
        Already have an account?
       </Text >
    <Link href="/sign-in" className='text-lg font-psemibold text-secondary'> Sign In</Link>
       </View>
      </View>

    </ScrollView>
   </SafeAreaView>
  )
}

export default SignUp