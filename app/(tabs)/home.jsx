import { View, Text, FlatList, Image, RefreshControl, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import useAppwrite from '../../lib/useAppwrite';
import { getUserComplaints, updateComplaintStatusToWithdrawn } from "../../lib/appwrite";
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import { FontAwesome } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons'; 
import { Client, Databases} from 'appwrite';
import EmptyState from '../../components/EmptyState';
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

const Home = () => {
  const { user } = useGlobalContext();
  const { data: initialComplaints, refetch } = useAppwrite(() => getUserComplaints(user.$id));
  const [complaints, setComplaints] = useState(initialComplaints);

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [okModalVisible, setOkModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [visibleComplaints, setVisibleComplaints] = useState(4); // State to control the number of visible complaints
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  
  const navigation = useNavigation();


  useEffect(() => {
    setComplaints(initialComplaints);

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

 const databases = new Databases(client);

 // Subscribe to real-time events
 const unsubscribe = databases.client.subscribe(`databases.66224a152d9f9a67af78.collections.6626029b134a98006f77.documents`, (response) => {
   if (response.events.includes("databases.*.collections.*.documents.*.update")) {
     const updatedComplaint = response.payload;

     // Update the complaints state with the updated complaint
     setComplaints(prevComplaints =>
       prevComplaints.map(complaint =>
         complaint.$id === updatedComplaint.$id ? updatedComplaint : complaint
       )
     );
   }
 });

 return () => {
   unsubscribe(); // Clean up the subscription when the component unmounts
 };

 

 
  }, [initialComplaints]);

  const handlePress = (item) => {
    navigation.navigate('screens/ComplaintDetails', { complaint: item });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'New':
      case 'Assigned':
        return 'In progress';
      case 'resolved':
        return 'Resolved';
        case 'Withdrawn':
        return 'Withdrawn';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'New':
      case 'Assigned':
        return <MaterialIcons name="autorenew" size={24} color="#FF9C01" />;
      case 'Resolved':
        return <MaterialIcons name="check-circle" size={24} color="green" />;
        case 'Withdrawn':
          return <MaterialIcons name="cancel" size={24} color="gray" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
      case 'Assigned':
        return '#FF9C01';
      case 'Resolved':
        return 'green';
      default:
        return 'gray';
    }
  };

  const applyFilter = (status) => {
    setFilter(status);
    setModalVisible(false);
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'All') return true;
    if (filter === 'In progress' && (complaint.status === 'New' || complaint.status === 'Assigned')) return true;
    if (filter === 'Resolved' && complaint.status === 'Resolved') return true;
    if (filter === 'Withdrawn' && complaint.status === 'Withdrawn') return true;
    return false;
  }).slice(0, visibleComplaints); // Limit the number of visible complaints


  const handleWithdrawPress = (complaintId) => {
    setConfirmModalVisible(true);
    setSelectedComplaintId(complaintId)
  };
  
  const confirmWithdrawal = async () => {
    setConfirmModalVisible(false);
    await withdrawComplaint(selectedComplaintId);
  };
  
  const withdrawComplaint = async (complaintId) => {
    const status = "Withdrawn";
    try {
      await updateComplaintStatusToWithdrawn(complaintId, status);
      setComplaints(prevComplaints =>
        prevComplaints.map(complaint =>
          complaint.$id === complaintId ? { ...complaint, status } : complaint
        )
      );
      setModalMessage("Withdrawn successfully");
      setOkModalVisible(true); // Show the custom modal
    } catch (error) {
      console.error('Failed to withdraw complaint: ', error);
    }
  };


  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="flex-row justify-between items-center px-4 py-2">
        <View className="flex-row">
          <Text className="font-pmedium mr-2 text-gray-100" style={{ color: 'gray' }}>Showing</Text>
          <Text className="font-pmedium text-gray-100" >{filter}</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <View className="flex-row items-center justify-between">
            <FontAwesome name="filter" size={24} color="gray" />
            <Text className="font-pmedium text-sm text-gray-100" style={{ color: 'gray' }}>Filters</Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredComplaints}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View className="mb-10">
            <View className="w-full flex-row justify-between px-4">
              <View className="flex-row items-center">
                {getStatusIcon(item.status)}
                <Text className="text text-secondary font-pmedium" style={{ color: getStatusColor(item.status), marginLeft: 5 }}>{getStatusText(item.status)}</Text>
              </View>
              <Text className="text text-gray-100 font-pmedium" style={{ color: 'gray' }}>Ticket ID: {item.$id}</Text>
            </View>
            <View className="w-full mt-3 h-30 flex flex-row justify-between space-x-2">
              <View className="flex-row px-4">
                <View className="w-1/5 mr-2 justify-center">
                  <Image
                    source={{ uri: item.image }}
                    className="h-20 w-15"
                    resizeMode="contain"
                  />
                </View>
                <View className="flex w-4/5">
                  <Text className="mt-1 text text-white font-pmedium">{item.description}</Text>
                  <Text className="mt-1 text text-gray-100 font-pmedium" style={{ color: 'gray' }}>{item.additionalDetails}</Text>
                </View>
              </View>
            </View>
            <View className={`px-4 w-full flex-row ${item.status === 'Resolved' || item.status==='Withdrawn' ? 'justify-end' : 'justify-around'} mt-3`}>
              {item.status !== 'Resolved' && item.status!== 'Withdrawn'  && (
                <>
                  <CustomButton title="WITHDRAW" onPress={() => handleWithdrawPress(item.$id)} />
                  <CustomButton title="TRACK" onPress={() => handlePress(item)} />
                </>
              )}
              {item.status ==='Withdrawn' && (
                <CustomButton title="VIEW" onPress={() => handlePress(item)} />
              )}

               {item.status === 'Resolved'  && (
                <CustomButton title="VIEW" onPress={() => handlePress(item)} />
              )}
            </View>
          </View>
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="items-center w-full">
              <Text className="text-white font-pbold text-2xl">My Complaints</Text>
            </View>
          </View>
        )}

        ListEmptyComponent={() => {
          let emptyTitle = '';
          let emptySubtitle = '';
        
          if (filter === 'All') {
            emptyTitle = "No Complaints Yet.";
            emptySubtitle = "You Haven't Reported Any Issues.";
          } else if (filter === 'In progress') {
            emptyTitle = "No Complaints In Progress.";
            emptySubtitle = "You Have No Ongoing Issues.";
          } else if (filter === 'Resolved') {
            emptyTitle = "No Resolved Complaints.";
            emptySubtitle = "No Issues Have Been Resolved Yet.";
          } else if (filter === 'Withdrawn') {
            emptyTitle = "No Withdrawn Complaints.";
            emptySubtitle = "You Have Not Withdrawn Any Complaints.";
          }
        
          return (
            <EmptyState
              title={emptyTitle}
              subtitle={emptySubtitle}
            />
          );
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {complaints.length > visibleComplaints && (
        <TouchableOpacity onPress={() => setVisibleComplaints(complaints.length)}>
          <Text style={styles.showMoreButton}>Show More</Text>
        </TouchableOpacity>
      )}


      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Complaints</Text>
          <TouchableOpacity onPress={() => applyFilter('All')}>
            <Text style={styles.modalOption}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => applyFilter('In progress')}>
            <Text style={styles.modalOption}>In progress</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => applyFilter('Resolved')}>
            <Text style={styles.modalOption}>Resolved</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => applyFilter('Withdrawn')}>
            <Text style={styles.modalOption}>Withdrawn</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
          transparent={true}
          animationType="fade"
          visible={okModalVisible}
          onRequestClose={() => setOkModalVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Information</Text>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
              <TouchableOpacity onPress={() => setOkModalVisible(false)} style={styles.closeButton}>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalOption: {
    fontSize: 16,
    paddingVertical: 10,
  },
  showMoreButton: {
    color: '#1e90ff',
    textAlign: 'center',
    padding: 10,
    fontSize: 16,
    fontWeight: 'bold',
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

export default Home;
