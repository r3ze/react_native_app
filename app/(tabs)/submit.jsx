import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import { icons } from "../../constants";
import {router} from "expo-router"
import {SafeAreaView} from 'react-native-safe-area-context'
import { DataTable } from 'react-native-paper';
import FormField from "../../components/FormField"
import CustomButtons from "../../components/CustomButtons"
import { useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as DocumentPicker from 'expo-document-picker'
import { createComplaint } from '../../lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";
const city = [
  { label: 'Pagsanjan', value: '1' },
  { label: 'Lumban', value: '2' },
  { label: 'Cavinti', value: '3' },
  { label: 'Siniloan', value: '4' },
];

const barangays = {
  '1': [
    { label: 'san isidro', value: '1' },
    { label: 'uno', value: '2' },
    { label: 'dos', value: '3' },
    { label: 'tres', value: '4' },
  ],
  '2': [
    { label: 'l', value: '1' },
    { label: 'u', value: '2' },
    { label: 'm', value: '3' },
    { label: 'ban', value: '4' },
  ],
  '3': [
    { label: 'c', value: '1' },
    { label: 'a', value: '2' },
    { label: 'vin', value: '3' },
    { label: 'ti', value: '4' },
  ],
  '4': [
    { label: 'si', value: '1' },
    { label: 'ni', value: '2' },
    { label: 'lo', value: '3' },
    { label: 'an', value: '4' },
  ],
};

const submit = () => {
  const { setUser } = useGlobalContext();
  const [form, setForm] = useState({
    description: '',
    city: '',
    barangay: '',
    thumbnail: '',
  })

  const [uploading, setUploading] = useState(false);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);


  
  const [municipalityValue, setMunicipalityValue] = useState('');
  const [barangayValue, setBarangayValue] = useState('');
  const [barangayData, setBarangayData] = useState([]);

  const handleMunicipalityChange = (value) => {
    setForm({ ...form, city: value });
    setMunicipalityValue(value);
    setBarangayData(barangays[value]);
    // Reset barangay value when municipality changes
    setBarangayValue('');
  };
  const handleBarangayChange = (value) => {
    setForm({ ...form, barangay: value });
  };

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
      (form.description === "") |
      (form.city === "") |
      (form.barangay === "") |
      !form.thumbnail
    ) {
      return Alert.alert("Please fill in all fields!");
    }

    setUploading(true);
    try {

    
      await createComplaint({
        ...form, userId: setUser.$id

      });

      Alert.alert("Success", "Post uploaded successfully");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        description: "",
        city: "",
        thumbnail: null,
        barangay: "",
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
  handleChangeText={(e) => setForm({ ...form, description: e})}
  otherStyles="mt-7 "

  />

<Dropdown
          className="mt-5"
          
          style={[styles.dropdown]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          handleChangeText={(e) => setForm({ ...form, city: e})}
          data={city}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Municipality' : '...'}
          searchPlaceholder="Search..."
          value={form.city}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => handleMunicipalityChange(item.value)}
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
          data={barangayData}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          searchPlaceholder="Search..."
          value={form.barangay}
          onChange={(item) => handleBarangayChange(item.value)}
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
          title="Submit"
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