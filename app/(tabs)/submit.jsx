import { TextInput, View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { icons } from "../../constants";
import { router } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataTable } from 'react-native-paper';
import FormField from "../../components/FormField";
import CustomButtons from "../../components/CustomButtons";
import { useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { createComplaint } from '../../lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";

const complaints = [
  { label: 'No Power', value: 'No Power' },
  { label: 'Defective Meter', value: 'Defective Meter' },
  { label: 'Detached Meter', value: 'Detached Meter' },
  { label: 'Low Voltage', value: 'Low Voltage' },
  { label: 'No Reading', value: 'No Reading' },
  { label: 'Loose Connection/ Sparkling of Wire', value: 'Loose Connection/ Sparkling of Wire' },
  { label: 'Others', value: 'Others' },
];

const city = [
  { label: 'Pagsanjan', value: 'Pagsanjan' },
  { label: 'Lumban', value: 'Lumban' },
  { label: 'Cavinti', value: 'Cavinti' },
  { label: 'Siniloan', value: 'Siniloan' },
  { label: 'Kalayaan', value: 'Kalayaan' },
  { label: 'Paete', value: 'Paete' },
  { label: 'Pakil', value: 'Pakil' },
  { label: 'Pangil', value: 'Pangil' },
  { label: 'Mabitac', value: 'Mabitac' },
  { label: 'Famy', value: 'Famy' },
  { label: 'Sta. Maria', value: 'Sta. Maria' },
];

const barangays = {
  'Pagsanjan': [
    { label: 'San Isidro', value: 'San Isidro' },
    { label: 'Maulawin', value: 'Maulawin' },
    { label: 'Barangay I', value: 'Barangay I' },
    { label: 'Barangay II', value: 'Barangay II' },
    { label: 'Biñan', value: 'Biñan' },
    { label: 'Buboy', value: 'Buboy' },
    { label: 'Cabanbanan', value: 'Cabanbanan' },
    { label: 'Calusiche', value: 'Calusiche' },
    { label: 'Dingin', value: 'Dingin' },
    { label: 'Lambac', value: 'Lambac' },
  ],
  'Lumban': [
    { label: 'Bagong Silang', value: 'Bagong Silang' },
    { label: 'Balimbingan', value: 'Balimbingan' },
    { label: 'Balubad', value: 'Balubad' },
    { label: 'Caliraya', value: 'Caliraya' },
  ],
  'Cavinti': [
    { label: 'Anglas', value: 'Anglas' },
    { label: 'Bangco', value: 'Bangco' },
    { label: 'Bukal', value: 'Bukal' },
    { label: 'Bulajo', value: 'Bulajo' },
  ],
  'Siniloan': [
    { label: 'Acevida', value: 'Acevida' },
    { label: 'Bagong Pag-asa', value: 'Bagong Pag-asa' },
    { label: 'Buhay', value: 'Buhay' },
    { label: 'G. Redor', value: 'G. Redor' },
  ],
  'Kalayaan': [
    { label: 'Acevida', value: 'Acevida' },
    { label: 'Bagong Pag-asa', value: 'Bagong Pag-asa' },
    { label: 'Buhay', value: 'Buhay' },
    { label: 'G. Redor', value: 'G. Redor' },
  ],
  'Paete': [
    { label: 'Bagumbayan', value: 'Bagumbayan' },
    { label: 'Bangkusay', value: 'Bangkusay' },
    { label: 'Ermita', value: 'Ermita' },
    { label: 'Ibaba del Norte', value: 'Ibaba del Norte' },
  ],
  'Pakil': [
    { label: 'Banilan', value: 'Banilan' },
    { label: 'Baño', value: 'Baño' },
    { label: 'Burgos', value: 'Burgos' },
    { label: 'Casa Real', value: 'Casa Real' },
  ],
  'Pangil': [
    { label: 'Balian', value: 'Balian' },
    { label: 'Dambo', value: 'Dambo' },
    { label: 'Galalan', value: 'Galalan' },
    { label: 'Isla', value: 'Isla' },
  ],
  'Mabitac': [
    { label: 'Amuyong', value: 'Amuyong' },
    { label: 'Bayanihan', value: 'Bayanihan' },
    { label: 'Lambac', value: 'Lambac' },
    { label: 'Libis ng Nayon', value: 'Libis ng Nayon' },
  ],
  'Famy': [
    { label: 'Asana', value: 'Asana' },
    { label: 'Bacong-Sigsigan', value: 'Bacong-Sigsigan' },
    { label: 'Bagong Pag-asa', value: 'Bagong Pag-asa' },
    { label: 'Balitoc', value: 'Balitoc' },
  ],
  'Sta. Maria': [
    { label: 'Adia', value: 'Adia' },
    { label: 'Bagong Pook', value: 'Bagong Pook' },
    { label: 'Bagumbayan', value: 'Bagumbayan' },
    { label: 'Barangay I', value: 'Barangay I' },
  ],
};

const submit = () => {
  const { user } = useGlobalContext();
  const [form, setForm] = useState({
    description: '',
    city: '',
    barangay: '',
    thumbnail: '',
    street: '',
  });
  
  const [isOthersSelected, setIsOthersSelected] = useState(false); //for complaints dropdown

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
    setBarangayValue('');
  };

  const handleBarangayChange = (value) => {
    setForm({ ...form, barangay: value });
  };

  const handleDropdownChange = (value) => {
    setIsOthersSelected(value === 'Others');
    setForm({ ...form, description: value });
  };

 
  const normalizeFile = (file, source) => {
    if (source === 'camera') {
      return {
        uri: file.uri,
        mimeType: file.mimeType,
        name: file.fileName || `photo_${Date.now()}.jpeg`,
        size: file.fileSize,
      };
    } else if (source === 'document') {
      return {
        uri: file.uri,
        mimeType: file.mimeType,
        name: file.name,
        size: file.size,
      };
    }
    throw new Error('Unknown source');
  };

  const openImagePickerAsync = async (selectType) => {
  Alert.alert(
    "Upload Photo",
    "Choose an option",
    [
      {
        text: "Take Photo",
        onPress: async () => {
          let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
          });

          if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const normalizedAsset = normalizeFile(asset, 'camera');
            setForm((prevForm) => ({
              ...prevForm,
              thumbnail: normalizedAsset,
            }));
          }
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const result = await DocumentPicker.getDocumentAsync({
            type:
              selectType === "image"
                ? ["image/png", "image/jpg", "image/jpeg"]
                : ["video/mp4", "video/gif"],
          });

          if (!result.canceled) {
            const normalizedAsset = normalizeFile(result, 'document');
            setForm((prevForm) => ({
              ...prevForm,
              thumbnail: result.assets[0],
            }));
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ],
    { cancelable: true }
  );
};

  const submitComplaint = async () => {
    if (
      (form.description === "") |
      (form.city === "") |
      (form.barangay === "") 
    ) {
      return Alert.alert("Please fill in all fields!");
    }

    setUploading(true);
    try {
      const currentDate = new Date();
      await createComplaint({
        ...form, userName: user.$id, createdAt: currentDate, consumerName: user.name
      });

      Alert.alert("Success", "Complaint submitted successfully");
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
        <View className="">
          <View className="space-y-2 mt-7">
            <Text className="text-base text-gray-100 font-pmedium">
              Select Complaint
            </Text>
            <Dropdown
              className="mt-5"
              style={[styles.dropdown]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              handleChangeText={handleDropdownChange}
              data={complaints}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? 'Complaints' : '...'}
              searchPlaceholder="Search..."
              value={form.description}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={(item) => handleDropdownChange(item.value)}
              renderLeftIcon={() => (
                <AntDesign
                  style={styles.icon}
                  color={isFocus ? 'blue' : 'back'}
                  name="Safety"
                  size={20}
                />
              )}
            />
            {isOthersSelected && (
              <FormField
                title="Description"
                value={form.description}
                handleChangeText={(e) => setForm({ ...form, description: e })}
                otherStyles="mt-7 "
              />
            )}
            <View className="">
              <Text className="text-base text-gray-100 font-pmedium mt-4">
                Select Municipality
              </Text>
              <Dropdown
                className="mt-2"
                style={[styles.dropdown]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                handleChangeText={(e) => setForm({ ...form, city: e })}
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
            </View>
            <View>
              <Text className="text-base text-gray-100 font-pmedium mt-4">
                Select Barangay
              </Text>
              <Dropdown
                className="mt-2"
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
                placeholder={!isFocus ? 'Barangay' : '...'}
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
              <FormField
                title="House / Block / Lot No. / Street / Subdivision"
                value={form.street}
                handleChangeText={(e) => setForm({ ...form, street: e })}
                otherStyles="mt-7 text-lg"
              />
            </View>
          </View>
          <View className="mt-7 space-y-2">
            <View className="flex flex-row justify-between items-center">
              <Text className="text-base text-gray-100 font-pmedium">
                Upload photo
              </Text>
              <Text className=" text-secondary font-pmedium text-xs ">
                maximum file size: 50 MB
              </Text>
            </View>
            <TouchableOpacity onPress={() => openImagePickerAsync("image")}>
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
                    Upload
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default submit;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  dropdown: {
    backgroundColor: 'white',
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
