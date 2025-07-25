import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React, {useState} from 'react'
import {icons} from '../constants'
const FormField = ({title, value, placeholder, handleChangeText, editable, otherStyles, ...props}) => {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <View className={`space-y-2  ${otherStyles}` }>
      <Text className="text-base text-white font-pmedium text-sm">{title}</Text>
      
      <View className="border-2 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary
      items-center flex-row
      ">
        <TextInput
         className ="w-full flex-1 text-white font-psmall text-base"
         value = {value}
         placeholder={placeholder}
         placeholderTextColor={"#7b7b8b"}
         onChangeText={handleChangeText}
         secureTextEntry ={(title=='Password' || title=="Confirm Password") &&!showPassword}
         editable={editable}
         />

      {(title==='Password' || title==="Confirm Password") && (
        <TouchableOpacity onPress={() =>
        setShowPassword(!showPassword)}>
          <Image source={!showPassword? icons.eye : icons.eyeHide}
          className="w-6 h-6"
          resizeMode='contain'
          />

        </TouchableOpacity>
      )}

      </View>
    </View>
  )
}

export default FormField