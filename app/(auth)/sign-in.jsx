import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, {useState} from 'react'
import { Link, router } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context'
import {icons} from '../../constants'
import FormField from '../../components/FormField'
import CustomButtons from '../../components/CustomButtons'
import {getCurrentUser, signIn} from '../../lib/appwrite'
import { useGlobalContext } from "../../context/GlobalProvider"
import {createLog} from '../../lib/appwrite'


const SignIn = () => {
 
  const {user, setUser, setIsLoggedIn } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
    }

    setSubmitting(true);

    try {
      
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLoggedIn(true);

      const currentDate = new Date();
      await createLog(result.$id, result.name, currentDate, form.email, "Login", "user")
      Alert.alert("Success", "User signed in successfully");
      router.replace("/home");

    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };


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
  title="Email or Account Number"
  value={form.email}
  handleChangeText={(e) => setForm({ ...form, email: e})}
  otherStyles="mt-7"
  keyboardType="email-address"
  />

<FormField
  title="Password"
  value={form.password}
  handleChangeText={(e) => setForm({ ...form, password: e})}
  otherStyles="mt-7"
 
  />
    <CustomButtons 
    title="Sign in"
    handlePress={submit}
    containerStyles="mt-7"
    isLoading={isSubmitting}/>
   </View>
  
   <View className="justify-center pt-5 flex-row gap-2">
       <Text className="text-lg text-gray-100 font-pregular">
        Don't have an account?
       </Text>
    <Link href="/sign-up" className='text-lg font-psemibold text-secondary'> Sign Up</Link>
       </View>
      </View>

    </ScrollView>
   </SafeAreaView>
  )
}

export default SignIn