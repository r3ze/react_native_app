  import React, { useLayoutEffect, useEffect, useState } from 'react';
  import { View, Text, StyleSheet, Image, ScrollView, Modal, TouchableOpacity } from 'react-native';
  import { useRoute } from '@react-navigation/native';
  import { useNavigation } from '@react-navigation/native';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import CustomButton from '../../components/CustomButton';
  import { updateComplaintStatus, updateComplaintStatusToWithdrawn } from '../../lib/appwrite';
  import Stepper from '../(screens)/Stepper';

  const ComplaintDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { complaint } = route.params;
    const [status, setStatus] = useState(complaint.status);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [followUpDisabled, setFollowUpDisabled] = useState(false);
    const [withdrawnStatus, setWithdrawnStatus] = useState(complaint.status === 'Withdrawn');
    const [followUpDisabledDay, setFollowUpDisabledDay] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);

    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, [navigation]);

    useEffect(() => {
      console.log('Complaint Image URL:', complaint.image); // Log the image URL to ensure it is correct
      checkFollowUpEligibility();
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

    // Function to format the date
    function formatDate(date) {
      const dateObj = new Date(date);
      const currentDate = new Date();

      const diffInDays = (currentDate - dateObj) / (1000 * 60 * 60 * 24);

      if (diffInDays < 1 && currentDate.getDate() === dateObj.getDate()) {
        return 'today ' + formatTime(dateObj);
      } else if (diffInDays < 2 && currentDate.getDate() - dateObj.getDate() === 1) {
        return 'yesterday ' + formatTime(dateObj);
      } else if (diffInDays < 7) {
        const options = { weekday: 'long', hour: 'numeric', minute: 'numeric' };
        return dateObj.toLocaleDateString(undefined, options);
      } else {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        return dateObj.toLocaleDateString(undefined, options);
      }
    }

    // Function to format time (HH:MM)
    function formatTime(date) {
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    // Function to generate dynamic labels
    const generateLabels = () => {
      const labels = [
        { date: formatDate(complaint.createdAt), description: 'Complaint Raised', time: 'Your complaint has been raised.' }
      ];

      labels.push({
        date: complaint.assignedAt ? formatDate(complaint.assignedAt) : 'Assigned',
        description: 'Task Assigned',
        time: complaint.assignedAt ? 'Admin has assigned task to the crew.' : 'Task assignment is pending.'
      });

      labels.push({
        date: complaint.comingAt ? formatDate(complaint.comingAt) : 'Pending',
        description: 'Resolution Team is Coming',
        time: complaint.comingAt ? 'The resolution team is coming.' : 'Resolution team is yet to be dispatched.'
      });

      labels.push({
        date: complaint.resolvedAt ? formatDate(complaint.resolvedAt) : 'Pending',
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
      const diffInHours = (currentDate - complaintDate) / (1000 * 60 * 60);

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


    return (
      <SafeAreaView className="h-full bg-primary">
        <ScrollView>
          <View style={styles.container}>
            <View className="items-center">
            {withdrawnStatus  && (
         <Text className="text-white mt-5" style={styles.title}>Complaint Withdrawn</Text>
            )}
            {complaint.status ==='Resolved' && !withdrawnStatus && (
         <Text className="text-white mt-5" style={styles.title}>Complaint Resolved</Text>
            )}
                {complaint.status !=='Resolved' && complaint.status !=='Withdrawn' && !withdrawnStatus && (
         <Text className="text-white mt-5" style={styles.title}>Complaint In Progress</Text>
            )}
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-white font-pmedium text-xl w-3/5">{complaint.description}</Text>
              <View className="w-2/5 items-end ">
                <Text className="text-gray-100 " style={styles.text}>{formatDate(complaint.createdAt)}</Text>
              </View>
            </View>

            <Text className="text-gray-100 mt-2">{complaint.additionalDetails}</Text>
            <Text className="text-gray-100 mt-2">{complaint.locationName}</Text>
            <View className="items-center mt-5">
              <Image
                source={{ uri: complaint.image }}
                style={styles.image}
                resizeMode='contain'
              />
            </View>
       

           

            {complaint.status !=='Withdrawn' && !withdrawnStatus  && (
        <Stepper complaintStatus={status} labels={generateLabels()} />
            )}

            {complaint.status !== 'Resolved' && complaint.status !=='Withdrawn' && !withdrawnStatus && (
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
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>OK</Text>
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
    closeButton: {
      backgroundColor: '#1e90ff',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    

    },
    closeButtonText: {
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
  });

  export default ComplaintDetails;
