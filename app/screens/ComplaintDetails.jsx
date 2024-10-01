  import React, { useLayoutEffect, useEffect, useState } from 'react';
  import { View, Text, StyleSheet, Image, ScrollView, Modal, TouchableOpacity, TextInput } from 'react-native';
  import { useRoute } from '@react-navigation/native';
  import { useNavigation } from '@react-navigation/native';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import CustomButton from '../../components/CustomButton';
  import { updateComplaintStatus, updateComplaintStatusToWithdrawn, createLog } from '../../lib/appwrite';
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
  import { useGlobalContext } from "../../context/GlobalProvider";
  import { RadioButton } from 'react-native-paper';
  // Add the plugins to dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
  dayjs.extend(relativeTime);
  dayjs.extend(isToday);
  dayjs.extend(isYesterday);

  const ComplaintDetails = () => {
    const route = useRoute();
    const { user } = useGlobalContext();
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
    const [labels, setLabels] = useState([]); // Keep track of labels
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false); // State to control image preview modal
    const [selectedReason, setSelectedReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
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

              complaint.assignedAt = updatedComplaint.assignedAt;
              complaint.comingAt = updatedComplaint.comingAt;
              complaint.resolvedAt = updatedComplaint.resolvedAt;

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



    const handleWithdrawPress = () => {
      setConfirmModalVisible(true);
    };
    
    const confirmWithdrawal = async (reason) => {
      if (!reason) {
        console.error('No reason provided for withdrawal.');
        return;
      }
    
      const withdrawalReason = reason === 'other' ? otherReason : reason;
    
      if (withdrawalReason.trim() === "") {
        console.error('Other reason cannot be empty.');
        return;
      }
      const currentDate = new Date();
      const offset = currentDate.getTimezoneOffset();
      const localDate = new Date(currentDate.getTime() - offset * 60 * 1000)
    
      setConfirmModalVisible(false);
      await withdrawComplaint(withdrawalReason);
      await createLog(user.$id, user.name, localDate, "Withdrawn a complaint", user.email, "Consumer");
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
        await updateComplaintStatus(complaint.$id, followUp, localDate);
        await createLog(user.$id, user.name, localDate, "Followed-up a complaint", user.email, "Consumer");
        setModalMessage("Followed-up successfully");
        setModalVisible(true); // Show the custom modal
        setFollowUpDisabled(true); // Disable follow-up after success
        setFollowUpDisabledDay(true); // Disable follow-up after success

      } catch (error) {
        console.error('Failed to update status:', error);
      }
    };

    const withdrawComplaint = async (reason) => {
      const status = "Withdrawn";
      const currentDate = new Date();
      const offset = currentDate.getTimezoneOffset();
      const localDate = new Date(currentDate.getTime() - offset * 60 * 1000)
      try {
        await updateComplaintStatusToWithdrawn(complaint.$id, status, reason, localDate);
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

      useEffect(() => {
        // Update labels whenever complaint data or status changes
        const generateLabels = () => {
          const labelsArray = [
            { date: formattedDate(complaint.createdAt), description: 'Complaint Raised', time: 'Your complaint has been raised.' },
            {
              date: complaint.assignedAt ? formattedDate(complaint.assignedAt) : 'Pending Assignment',
              description: 'Task Assigned',
              time: complaint.assignedAt
              ? (
                <Text>
                  Admin has assigned task to{' '}
                  <Text className="font-bold text-secondary">{complaint.crew_name}</Text>
                </Text>
              )
              : 'Task assignment is pending.'
            },
            {
              date: complaint.comingAt ? formattedDate(complaint.comingAt) : 'Not Dispatched Yet',
              description: 'Resolution Team is Coming.',
              time: complaint.comingAt ? 'The resolution team is coming.' : 'Resolution team is yet to be dispatched.'
            },
            {
              date: complaint.resolvedAt ? formattedDate(complaint.resolvedAt) : 'Not Resolved',
              description: 'Complaint Resolved',
              time: complaint.resolvedAt ? 'The complaint has been successfully resolved.' : 'Resolution is still pending.'
            }
          ];
          return labelsArray;
        };
    
        setLabels(generateLabels());
      }, [complaint, status])
    
      function formatDateRange(startDateStr, endDateStr) {
        try {
            // Convert string to Date objects, assuming input is in 'YYYY-MM-DD' format
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
    
            const options = { month: 'long', day: 'numeric' }; // e.g., September 21
    
            // Check if the month is the same
            if (startDate.getMonth() === endDate.getMonth()) {
                return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.getDate()}`;
            } else {
                // Different months
                return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
            }
        } catch (error) {
            console.error('Error formatting date range:', error);
            return 'Invalid Date';
        }
    }
    
    return (
      <SafeAreaView className="h-full bg-primary">
        <ScrollView>
     
          <View style={styles.container}>
          <TouchableOpacity
       onPress={back}
       className="  border-2 border-black-200"
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          padding: 7,
          borderRadius: 10,

        }}
      >
        <Icon name='arrow-back' size={18} color="#FF9001"/>
      </TouchableOpacity>
            <View className="items-center">
              {(complaint.status =='Invalidated') ? (
                <View>
   <Text className="text-white mt-2" style={styles.title}>Complaint Invalidated</Text>
   <View className="items-center">
   <Text>
   <Text  style={{ color: 'gray' }}> {complaint.cancellation_reason} - </Text>
   <Text  style={{ color: 'white' }}> {formattedDate(complaint.canceledAt)}</Text>
   </Text>
   </View>
   </View>
              ) : (
                <Text className="text-white mt-2" style={styles.title}>Track Complaint</Text>
              )}
         
         
         {(complaint.resolutionStartDate && complaint.resolutionEndDate) ? (
          <Text className="mb-2">
          <Text style={{ color: 'gray' }}>Estimated resolution date: </Text>
          <Text  style={{ color: 'white' }}>{formatDateRange(complaint.resolutionStartDate, complaint.resolutionEndDate)}</Text>
        </Text>
         ) :  (
        <Text className=""></Text>
         )}
       
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-white font-pmedium text-xl w-3/5">{complaint.description}</Text>
              <View className="w-2/5 items-end ">
                <Text className="text-gray-100 " style={styles.text}></Text>
              </View>
            </View>

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
              
             {complaint.additionalDetails ? (
  <View className="mb-4">
  <Text className="text text-gray-200 font-medium">Additional Details</Text>
  <View className="mt-2 h-14 bg-black-200 rounded-xl border border-gray-600 p-4">
    <Text className="text text-gray-100 font-medium">{complaint.additionalDetails}</Text>
  </View>
</View>

             ):
             (
              <View className="mb-4">

            </View>
             )} 
          
            {complaint.status !=='Withdrawn' && !withdrawnStatus && status!=='Invalidated'  && (
        <Stepper complaintStatus={status} labels={labels} />
            )}

            {status !== 'Resolved' && status !=='Withdrawn' && status!=='Invalidated' && !withdrawnStatus && (
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
       {confirmModalVisible && (
 <View className="flex-1 items-center justify-center bg-black/50">
 <View className="w-[90%] bg-white p-5 rounded-2xl shadow-lg">
   <Text className="text-xl font-bold text-gray-800 mb-4">Select Reason for Withdrawal:</Text>

   <RadioButton.Group onValueChange={(value) => setSelectedReason(value)} value={selectedReason}>
     <View className="flex-row items-center mb-3">
       <RadioButton value="Issue Resolved" />
       <Text className="ml-2 text-lg text-gray-700">Issue Resolved</Text>
     </View>
     <View className="flex-row items-center mb-3">
       <RadioButton value="No longer necessary" />
       <Text className="ml-2 text-lg text-gray-700">No longer necessary</Text>
     </View>
     <View className="flex-row items-center mb-3">
       <RadioButton value="Submitted by mistake" />
       <Text className="ml-2 text-lg text-gray-700">Submitted by mistake</Text>
     </View>
     <View className="flex-row items-center mb-3">
       <RadioButton value="other" />
       <Text className="ml-2 text-lg text-gray-700">Other</Text>
     </View>
   </RadioButton.Group>

   {selectedReason === 'other' && (
     <TextInput
       className="mt-4 p-3 border border-blue-500 rounded-lg text-lg bg-white"
       placeholder="Please specify your reason"
       value={otherReason}
       onChangeText={text => setOtherReason(text)}
     />
   )}

   <View className="flex-row justify-between mt-6">
     <TouchableOpacity
       onPress={() => setConfirmModalVisible(false)}
       className="bg-red-500 py-3 px-6 rounded-lg w-[48%]"
     >
       <Text className="text-white text-center text-lg">Cancel</Text>
     </TouchableOpacity>
     <TouchableOpacity
       onPress={() => confirmWithdrawal(selectedReason)}
       className="bg-blue-500 py-3 px-6 rounded-lg w-[48%]"
     >
       <Text className="text-white text-center text-lg">Yes</Text>
     </TouchableOpacity>
   </View>
 </View>
</View>
    )}

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
