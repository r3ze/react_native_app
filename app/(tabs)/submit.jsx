import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import { icons } from "../../constants";

import {SafeAreaView} from 'react-native-safe-area-context'
import { DataTable } from 'react-native-paper';
import FormField from "../../components/FormField"
import CustomButtons from "../../components/CustomButtons"
import { useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as DocumentPicker from 'expo-document-picker'

const city = [
  { label: 'Pagsanjan', value: '1' },
  { label: 'Lumban', value: '2' },
  { label: 'Cavinti', value: '3' },
  { label: 'Siniloan', value: '4' },

];

const pagsanjan_barangay = [
  { label: 'san isidro', value: '1' },
  { label: 'uno', value: '2' },
  { label: 'dos', value: '3' },
  { label: 'tres', value: '4' },

];
const submit = () => {

  const [form, setForm] = useState({
    description: '',
    city: '',
    barangay: '',
    thumbnail: '',
  })

  const [uploading, setUploading] = useState(false);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  const [streetValue, setStreetValue] = useState(null);
  const [streetIsFocus, streetSetIsFocus] = useState(false);

  const [barangayValue, barangaySetValue] = useState(null);
  const [barangayIsFocus, barangaySetIsFocus] = useState(false);

  const openPicker = async (selectType) => {
    const result = await DocumentPicker.getDocumentAsync({
      type:
        selectType === "image"
          ? ["image/png", "image/jpg"]
          : ["video/mp4", "video/gif"],
    });

    if (!result.canceled) {
      if (selectType === "image") {
        setForm({
          ...form,
          thumbnail: result.assets[0],
        });
      }

      if (selectType === "video") {
        setForm({
          ...form,
          video: result.assets[0],
        });
      }
    } else {
      setTimeout(() => {
        Alert.alert("Document picked", JSON.stringify(result, null, 2));
      }, 100);
    }
  };

  const submitComplaint = async () => {
    if (
      (form.prompt === "") |
      (form.title === "") |
      !form.thumbnail |
      !form.video
    ) {
      return Alert.alert("Please provide all fields");
    }

    setUploading(true);
    try {
      await createVideoPost({
        ...form,
        userId: user.$id,
      });

      Alert.alert("Success", "Post uploaded successfully");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        title: "",
        video: null,
        thumbnail: null,
        prompt: "",
      });

      setUploading(false);
    }
  };




  return (
    
    <SafeAreaView className="bg-primary h-full">
        <ScrollView className="px-4 my-6">
     
          <Text className="text-2xl text-white font-psemibold">
            Submit Complaint
          </Text>
          <FormField
  title="Description"
  value={form.description}
  handleChangeText={(e) => setform({ ...form, description: e})}
  otherStyles="mt-7 "

  />

<Dropdown
          className="mt-5"
          
          style={[styles.dropdown]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={city}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Municipality' : '...'}
          searchPlaceholder="Search..."
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setValue(item.value);
            setIsFocus(false);
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={styles.icon}
              color={isFocus ? 'blue' : 'back'}
              name="Safety"
              size={20}
            />
          )}
        />


     
     <Dropdown
          className="mt-5"
          
          style={[styles.dropdown]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={pagsanjan_barangay}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!barangayIsFocus ? 'Barangay' : '...'}
          searchPlaceholder="Search..."
          value={barangayValue}
          onFocus={() => barangaySetIsFocus(true)}
          onBlur={() => barangaySetIsFocus(false)}
          onChange={item => {
            barangaySetValue(item.value);
            barangaySetIsFocus(false);
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={styles.icon}
              color={isFocus ? 'blue' : 'back'}
              name="Safety"
              size={20}
            />
          )}
        />
        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Upload photo
          </Text>
          <TouchableOpacity onPress={() => openPicker("image")}>
            {form.thumbnail ? (
              <Image
                source={{ uri: form.thumbnail.uri }}
                resizeMode="cover"
                className="w-full h-64 rounded-2xl"
              />
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex justify-center items-center flex-row space-x-2">
                <Image
                  source={icons.upload}
                  resizeMode="contain"
                  alt="upload"
                  className="w-5 h-5"
                />
                <Text className="text-sm text-gray-100 font-pmedium">
                  Choose a file
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <CustomButtons
          title="Submit & Publish"
          handlePress={submitComplaint}
          containerStyles="mt-7"
          isLoading={uploading}
        />
        </ScrollView>


    </SafeAreaView>
      
   
  )
}
export default submit

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  dropdown: {
    backgroundColor:'white',
    height: 50,
    borderColor: 'black',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  
  },
  icon: {
    marginRight: 5,
  },
  
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});