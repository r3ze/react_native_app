import React, { useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Stepper from '../(screens)/Stepper'
import { useNavigation } from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context'
const ComplaintDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { complaint } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    console.log('Complaint Image URL:', complaint.image); // Log the image URL to ensure it is correct
  }, [complaint]);

  return (
    <SafeAreaView className="h-full">
    <View  style={styles.container}>
      <Text className="text-white mt-5" style={styles.title}>Complaint Details</Text>
      <Text className="text-gray-100 " style={styles.text}>Ticket ID: {complaint.$id  }</Text>
      <Text className="text-gray-100 " style={styles.text}>Description: {complaint.description}</Text>
      <Text className="text-gray-100 " style={styles.text}>Date: {complaint.createdAt}</Text>
      
      <View className ="items-center mt-5" >
            <Image
            source = {{uri: complaint.image}}
            style={styles.image}
            resizeMode='contain'
            />

          </View>
      <Stepper status={complaint.status} />
    </View>
    
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
    fontSize: 16,
    marginBottom: 10,
    color: 'gray', // Ensure the text color is gray
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
});

export default ComplaintDetails;
