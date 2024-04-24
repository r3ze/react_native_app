import { View, Text } from 'react-native'
import {Redirect, Stack, stack} from 'expo-router'
import { useGlobalContext } from "../../context/GlobalProvider";
const Authlayout = () => {
 
  return (
   <>
   <Stack>
      <Stack.Screen
      name = "sign-in"
      options={{headerShown:false}}
      />
        <Stack.Screen
      name = "sign-up"
      options={{headerShown:false}}
      />




   </Stack>
   
   </>
  )
}

export default Authlayout