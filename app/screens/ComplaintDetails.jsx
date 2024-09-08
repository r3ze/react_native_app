  import React, { useLayoutEffect, useEffect, useState } from 'react';
  import { View, Text, StyleSheet, Image, ScrollView, Modal, TouchableOpacity } from 'react-native';
  import { useRoute } from '@react-navigation/native';
  import { useNavigation } from '@react-navigation/native';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import CustomButton from '../../components/CustomButton';
  import { updateComplaintStatus, updateComplaintStatusToWithdrawn } from '../../lib/appwrite';
  import Stepper from '../(screens)/Stepper';
  import { Client} from 'appwrite';
  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import isToday from 'dayjs/plugin/isToday';
  import isYesterday from 'dayjs/plugin/isYesterday';
  import utc from 'dayjs/plugin/utc';
  import timezone from 'dayjs/plugin/timezone';
  import Icon from 'react-native-vector-icons/Ionicons';
  import { Ionicons } from '@expo/vector-icons'; 
  import {  router } from "expo-router";
  import ImageEmptyState from '../../components/ImageEmptyState';
  // Add the plugins to dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
  dayjs.extend(relativeTime);
  dayjs.extend(isToday);
  dayjs.extend(isYesterday);

  const ComplaintDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { complaint } = route.params;
    const [status, setStatus] = useState(complaint.status);
    const [assignedAt, setAssignedAt] = useState(complaint.status);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [followUpDisabled, setFollowUpDisabled] = useState(false);
    const [withdrawnStatus, setWithdrawnStatus] = useState(complaint.status === 'Withdrawn');
    const [followUpDisabledDay, setFollowUpDisabledDay] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false); // State to control image preview modal
    const formattedDate = (createdAt) => {
      // Convert to your local timezone (optional: set the timezone explicitly if needed)
      const date = dayjs.utc(createdAt).tz(dayjs.tz.guess()); 
    
      if (date.isToday()) {
        return `Today ${date.format('HH:mm')}`;
      } else if (date.isYesterday()) {
        return `Yesterday ${date.format('HH:mm')}`;
      } else if (date.isBefore(dayjs().subtract(1, 'week'))) {
        return date.format('MM-DD-YYYY HH:mm');
      } else {
        return date.format('dddd HH:mm');
      }
    };
    

    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, [navigation]);

    useEffect(() => {
      console.log('Complaint Image URL:', complaint.image); // Log the image URL to ensure it is correct
      checkFollowUpEligibility();
 // Initialize Appwrite client
 const client = new Client();
 try {
   client
     .setEndpoint('https://cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
     .setProject('662248657f5bd3dd103c'); // Replace with your Appwrite project ID
     console.log(' initialized Appwrite client:');
 } catch (error) {
   console.error('Failed to initialize Appwrite client:', error);
 }
    
      // Set up real-time listener for complaint status updates
      let unsubscribe;
      try {
        unsubscribe = client.subscribe(
          `databases.66224a152d9f9a67af78.collections.6626029b134a98006f77.documents.${complaint.$id}`,
          (response) => {
            const event = response.events[0];
            console.log(event)
            if (event.includes('update')) {
              const updatedComplaint = response.payload;
              console.log('Update event matched');
              setStatus(updatedComplaint.status);
              setAssignedAt(updatedComplaint.assignedAt);
              console.log(assignedAt)
              if (updatedComplaint.status === 'Withdrawn') {
                setWithdrawnStatus(true);
              }
            }
          }
        );
      } catch (error) {
        console.error('Failed to subscribe to real-time updates:', error);
      }
    
      // Cleanup subscription on unmount
      return () => {
        try {
          if (unsubscribe) {
            unsubscribe();
          }
        } catch (error) {
          console.error('Failed to unsubscribe from real-time updates:', error);
        }
      };
    }, [complaint]);

    const checkFollowUpEligibility = () => {
      const complaintDate = new Date(complaint.createdAt);
      const currentDate = new Date();
      const diffInHours = (currentDate - complaintDate) / (1000 * 60 * 60);

      console.log('Status:', status);
      console.log('FollowUp:', complaint.followUp);
      console.log('Hours since creation:', diffInHours);

      // Disable follow-up if status is not New or Assigned, or if the complaint is less than 24 hours old
      if (complaint.followUp === "Yes") {
        setFollowUpDisabled(true);
      }

      if (diffInHours < 24) {
        setFollowUpDisabledDay(true);
      }
    };

    
    // Function to generate dynamic labels
    const generateLabels = () => {
      const labels = [
        { date: formattedDate(complaint.createdAt), description: 'Complaint Raised', time: 'Your complaint has been raised.' }
      ];

      labels.push({
        date: status == 'Assigned' ? formattedDate(complaint.assignedAt) : 'Assigned',
        description: 'Task Assigned',
        time: status == 'Assigned' ? 'Admin has assigned task to the crew.' : 'Task assignment is pending.'
      });

      labels.push({
        date: complaint.comingAt ? formattedDate(complaint.comingAt) : 'Pending',
        description: 'Resolution Team is Coming',
        time: complaint.comingAt ? 'The resolution team is coming.' : 'Resolution team is yet to be dispatched.'
      });

      labels.push({
        date: complaint.resolvedAt ? formattedDate(complaint.resolvedAt) : 'Pending',
        description: 'Complaint Resolved',
        time: complaint.resolvedAt ? 'Complaint was successfully resolved.' : 'Resolution is pending.'
      });

      return labels;
    };

    const handleWithdrawPress = () => {
      setConfirmModalVisible(true);
    };
    
    const confirmWithdrawal = async () => {
      setConfirmModalVisible(false);
      await withdrawComplaint();
    };
    

    const updateComplaint = async () => {
      const complaintDate = new Date(complaint.createdAt);
      const currentDate = new Date();
      const offset = currentDate.getTimezoneOffset();
      const localDate = new Date(currentDate.getTime() - offset * 60 * 1000)
      const diffInHours = (localDate - complaintDate) / (1000 * 60 * 60);

      if (complaint.followUp === 'Yes') {
        setModalMessage("Complaint already followed up.");
        setModalVisible(true);
        return;
      }

      if (diffInHours < 24) {
        setModalMessage(`You need to wait ${24 - Math.floor(diffInHours)} more hours to follow up.`);
        setModalVisible(true);
        return;
      }

      const followUp = "Yes";
      try {
        await updateComplaintStatus(complaint.$id, followUp);
        setModalMessage("Followed-up successfully");
        setModalVisible(true); // Show the custom modal
        setStatus(followUp); // Update the status state
        setFollowUpDisabled(true); // Disable follow-up after success
        setFollowUpDisabledDay(true); // Disable follow-up after success

      } catch (error) {
        console.error('Failed to update status:', error);
      }
    };

    const withdrawComplaint = async () => {
      const status = "Withdrawn";
      try {
        await updateComplaintStatusToWithdrawn(complaint.$id, status);
        setModalMessage("Withdrawn successfully");
        setModalVisible(true); // Show the custom modal
        setStatus(status); // Update the status state
        setWithdrawnStatus(true);
      } catch (error) {
        console.error('Failed to withdraw complaint: ', error);
      }
    };

    const openImagePreview = () => {
      setImagePreviewVisible(true);
    };
  
    const closeImagePreview = () => {
      setImagePreviewVisible(false);
    };

    const back = () =>{
      navigation.navigate('(tabs)', {
        screen: 'home',
     
      });
      }
    

    return (
      <SafeAreaView className="h-full bg-primary">
        <ScrollView>
     
          <View style={styles.container}>
          <TouchableOpacity
       onPress={back}
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'white',
          padding: 7,
          borderRadius: 10,

        }}
      >
        <Ionicons name='arrow-back' size={18} color="black"/>
      </TouchableOpacity>
            <View className="items-center">
            {withdrawnStatus  && (
         <Text className="text-white mt-5" style={styles.title}>Complaint Withdrawn</Text>
            )}
            {status ==='Resolved' && !withdrawnStatus && (
         <Text className="text-white mt-5" style={styles.title}>Complaint Resolved</Text>
            )}
                {status !=='Resolved' && status !=='Withdrawn' && !withdrawnStatus && (
         <Text className="text-white mt-5" style={styles.title}>Complaint In Progress</Text>
            )}
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-white font-pmedium text-xl w-3/5">{complaint.description}</Text>
              <View className="w-2/5 items-end ">
                <Text className="text-gray-100 " style={styles.text}>{formattedDate(complaint.createdAt)}</Text>
              </View>
            </View>

            <Text className="text-gray-100 mt-2">{complaint.additionalDetails}</Text>
            <Text className="text-gray-100 mt-2">{complaint.locationName}</Text>
            <View className="items-center mt-5">
            
              {complaint.image ? (
                <TouchableOpacity onPress={openImagePreview}> 
                 <Image
                 source={{ uri: complaint.image }}
                 style={styles.image}
                 resizeMode='contain'
               />
                </TouchableOpacity>
              ) :(
                <ImageEmptyState
                title={"No Image Provided"}
                subtitle={""}
              />
              )}
             
              
            </View>
       

           

            {complaint.status !=='Withdrawn' && !withdrawnStatus  && (
        <Stepper complaintStatus={status} labels={generateLabels()} />
            )}

            {status !== 'Resolved' && status !=='Withdrawn' && !withdrawnStatus && (
              <View className="px-4 w-full flex-row justify-around mt-3">
                <CustomButton
                  title="WITHDRAW"
                  onPress={handleWithdrawPress}
                />
                <CustomButton
                  title="REMIND"
                  onPress={updateComplaint}
                  disabled={followUpDisabled}
                />
              </View>
            )}

            {followUpDisabled && (
              <View className="px-4 w-full flex-row justify-center mt-3">
                <Text className="text-gray-100">Complaint already followed up</Text>
              </View>
            )}
          </View>
        </ScrollView>
        <Modal
          transparent={true}
          animationType="fade"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Information</Text>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButtonW}>
                <Text style={styles.closeButtonTextW}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
      transparent={true}
      animationType="fade"
      visible={confirmModalVisible}
      onRequestClose={() => setConfirmModalVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Confirm Withdrawal</Text>
          <Text style={styles.modalMessage}>Are you sure you want to withdraw the complaint?</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => setConfirmModalVisible(false)} style={[styles.cancelButton, styles.buttonWidth]}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={confirmWithdrawal} style={[styles.confirmButton, styles.buttonWidth]}>
          <Text style={styles.buttonText}>Yes</Text>
        </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>




     {/* Image Preview Modal */}
     <Modal
        transparent={true}
        animationType="fade"
        visible={imagePreviewVisible}
        onRequestClose={closeImagePreview}
      >
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity style={styles.closeButton} onPress={closeImagePreview}>
            <Icon name="close-circle" size={30} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: complaint.image }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
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
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: 300,
      padding: 20,
      backgroundColor: '#2c2c34',
      borderRadius: 10,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 10,
    },
    modalMessage: {
      fontSize: 16,
      color: '#fff',
      textAlign: 'center',
      marginBottom: 20,
    },
    closeButtonW: {
      backgroundColor: '#1e90ff',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    

    },
    closeButtonTextW: {
      color: '#fff',
      fontSize: 16,
    },

    buttonWidth: {
      width: 100, // Fixed width for buttons
    },
    cancelButton: {
      backgroundColor: '#ff4c4c', // Red color for the cancel button
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginHorizontal: 5,
    },
    confirmButton: {
      backgroundColor: '#1e90ff', // Blue color for the confirm button
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginHorizontal: 5,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
    },

    fullScreenOverlay: {
      flex: 1,
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullScreenImage: {
      width: '100%',
      height: '100%',
    },
    closeButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      zIndex: 1,
    },
  });

  export default ComplaintDetails;
