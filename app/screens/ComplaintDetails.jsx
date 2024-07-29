import React, { useLayoutEffect, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../components/CustomButton';
import { updateComplaintStatus } from '../../lib/appwrite';
import Stepper from '../(screens)/Stepper';

const ComplaintDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { complaint } = route.params;
  const [status, setStatus] = useState(complaint.status);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    console.log('Complaint Image URL:', complaint.image); // Log the image URL to ensure it is correct
  }, [complaint]);

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
      date: complaint.assignedAt ? formatDate(complaint.assignedAt) : 'Pending',
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

  const updateComplaint = async () => {
    const followUp = "Yes";
    try {
      await updateComplaintStatus(complaint.$id, followUp);
      setModalMessage("Followed-up successfully");
      setModalVisible(true); // Show the custom modal
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
            <Text className="text-white font-pmedium text-xl w-3/5">{complaint.description}</Text>
            <View className="w-2/5 items-end ">
              <Text className="text-gray-100 " style={styles.text}>{formatDate(complaint.createdAt)}</Text>
            </View>
          </View>

          <Text className="text-gray-100 mt-2">{complaint.additionalDetails}</Text>

          <View className="items-center mt-5">
            <Image
              source={{ uri: complaint.image }}
              style={styles.image}
              resizeMode='contain'
            />
          </View>
          <Text className="text-white mt-5" style={styles.title}>Complaint in Progress</Text>

          <Stepper complaintStatus={status} labels={generateLabels()} />

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
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>OK</Text>
            </TouchableOpacity>
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
});

export default ComplaintDetails;
