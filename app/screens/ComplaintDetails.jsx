import React, { useLayoutEffect } from 'react';
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

  return (
    <SafeAreaView className="h-full">
    <View style={styles.container}>
      <Text className="text-white" style={styles.title}>Complaint Details</Text>
      <Text className="text-white" style={styles.text}>Description: {complaint.consumer_name}</Text>
      <Text className="text-white" style={styles.text}>Description: {complaint.description}</Text>
      <Text className="text-white" style={styles.text}>Date: {complaint.createdAt}</Text>
      <Text  className="text-white"style={styles.text}>Status: {complaint.status}</Text>
      <View className="">
            <Image
            
            className="w-20 h-20 y"
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
    padding: 16,
    backgroundColor: '#161622',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default ComplaintDetails;
