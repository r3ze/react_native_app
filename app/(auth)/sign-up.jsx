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
import {createLog} from '../../lib/appwrite'
import AwesomeAlert from 'react-native-awesome-alerts'

const SignUp = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email:"",
    phone: "",
    accountNumber:"",
    orNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");

  const submit = async () => {
    if(!form.accountNumber || !form.email || !form.password||!form.phone){
      setAlertTitle('Error');
      setAlertMessage('Please fill in all fields');
      setShowAlert(true);
      return;
   
    }
    if(form.password!==form.confirmPassword)
    {
      setAlertTitle('Error');
      setAlertMessage('Passwords do not match.');
      setShowAlert(true);
      return
    }
    setSubmitting(true)
    try {
      const result = await createUser( form.email, form.password, form.confirmPassword, form.accountNumber, form.phone)
      setAlertTitle('Success');
      setAlertMessage('Account created successfully');
      setShowAlert(true);
      
      router.replace("/sign-in")

    } catch (error) {
      setAlertTitle('Error');
      setAlertMessage(error.message);
      setShowAlert(true);

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
  title="Account Number"
  value={form.accountNumber}
  handleChangeText={(e) => setForm({ ...form, accountNumber: e})}
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
  title="Phone"
  value={form.phone}
  handleChangeText={(e) => setForm({ ...form, phone: e})}
  otherStyles="mt-7"
 
  />

<FormField
  title="Password"
  value={form.password}
  handleChangeText={(e) => setForm({ ...form, password: e})}
  otherStyles="mt-7"
 
  />
  <FormField
  title="Confirm Password"
  value={form.confirmPassword}
  handleChangeText={(e) => setForm({ ...form, confirmPassword: e})}
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
{/* AwesomeAlert */}
<AwesomeAlert
          show={showAlert}
          showProgress={false}
          title={alertTitle}
          message={alertMessage}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showConfirmButton={true}
          confirmText="OK"
          confirmButtonColor="#DD6B55"
          onConfirmPressed={() => {
            setShowAlert(false);
          }}
        />
    </ScrollView>
   </SafeAreaView>
  )
}

export default SignUp