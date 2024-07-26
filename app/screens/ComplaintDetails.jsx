import React, { useLayoutEffect, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Stepper from '../(screens)/Stepper'
import { useNavigation } from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context'
import CustomButton from '../../components/CustomButton';
import { updateComplaintStatus } from '../../lib/appwrite';

const ComplaintDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { complaint } = route.params;
  const [status, setStatus] = useState(complaint.status);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    console.log('Complaint Image URL:', complaint.image); // Log the image URL to ensure it is correct
  }, [complaint]);

  // Function to format the date
  function formatDate(createdAt) {
    const createdAtDate = new Date(createdAt);
    const currentDate = new Date();

    const diffInDays = (currentDate - createdAtDate) / (1000 * 60 * 60 * 24);

    if (diffInDays < 1 && currentDate.getDate() === createdAtDate.getDate()) {
      return 'today ' + formatTime(createdAtDate);
    } else if (diffInDays < 2 && currentDate.getDate() - createdAtDate.getDate() === 1) {
      return 'yesterday ' + formatTime(createdAtDate);
    } else {
      const options = { weekday: 'long', hour: 'numeric', minute: 'numeric' };
      return createdAtDate.toLocaleDateString(undefined, options);
    }
  }

  // Function to format time (HH:MM)
  function formatTime(date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  const updateComplaint = async () => {
    const followUp = "Yes";
    try {
      await updateComplaintStatus(complaint.$id, followUp);
      Alert.alert("Success", "Followed-up successfully");
      setStatus(followUp); // Update the status state
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView>
        <View style={styles.container}>
          <View className="items-center">
            <Text className="text-white mt-1" style={styles.title}>Track Complaint</Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-white font-pmedium text-xl ">{complaint.description}</Text>
            <Text className="text-gray-100" style={styles.text} >{formatDate(complaint.createdAt)}</Text>
          </View>

          <Text className="text-gray-100 mt-2 ">{complaint.additionalDetails}</Text>

          <View className="items-center mt-5" >
            <Image
              source={{ uri: complaint.image }}
              style={styles.image}
              resizeMode='contain'
            />
          </View>
          <Text className="text-white mt-5" style={styles.title}>Complaint in Progress</Text>

          <Stepper complaintStatus={status} />
          {complaint.status !== 'resolved' && (
              <View className="px-4 w-full flex-row justify-around mt-3">
               <CustomButton
              title="WITHDRAW"
            />
            <CustomButton
              title="REMIND"
              onPress={updateComplaint}
            />
              </View>
            )}
     
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161622',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white', // Ensure the text color is white
  },
  text: {
    color: 'gray', // Ensure the text color is gray
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
});

export default ComplaintDetails;
