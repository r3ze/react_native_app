import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import MapViewClustering from 'react-native-map-clustering'; // Import Clustered Map
import useAppwrite from '../../lib/useAppwrite';
import { getAllComplaints } from "../../lib/appwrite"; 
import { Databases, Client } from 'appwrite';
import * as Animatable from 'react-native-animatable';  // Import Animatable for animation
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Add the plugins to dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

const Map = () => {
  const { data: complaints, refetch } = useAppwrite(getAllComplaints);
  const [activeComplaints, setActiveComplaints] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filterType, setFilterType] = useState('No Power'); // Default filter to "Power Outage"

  // Function to parse location string into latitude and longitude
  const parseLocation = (location) => {
    const [latitude, longitude] = location.split(',').map(coord => parseFloat(coord.trim()));
    return { latitude, longitude };
  };

  // Filter complaints based on the selected type
  useEffect(() => {
    setActiveComplaints(complaints.filter(
      (complaint) => 
        (complaint.status !== 'Resolved' && complaint.status !== 'Withdrawn' && complaint.status!=='Canceled') && 
        (filterType === 'No Power' ? complaint.description === 'No Power' : complaint.description !== 'No Power')
    ));
  }, [complaints, filterType]);

  // Initialize Appwrite client
  const client = new Client();
  try {
    client
      .setEndpoint('https://cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
      .setProject('662248657f5bd3dd103c'); // Replace with your Appwrite project ID
    console.log('Initialized Appwrite client:');
  } catch (error) {
    console.error('Failed to initialize Appwrite client:', error);
  }
  const databases = new Databases(client);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = databases.client.subscribe(`databases.66224a152d9f9a67af78.collections.6626029b134a98006f77.documents`, (response) => {
      if (response.events.includes("databases.*.collections.*.documents.*.update")) {
        console.log("Update event matched");
        refetch(); // Refetch complaints to update the list
      }

      if (response.events.includes("databases.*.collections.*.documents.*.create")) {
        console.log("Create event matched");
        refetch(); // Refetch complaints to update the list
      }
    });

    // Clean up the subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [refetch]);

  // Function to handle marker press and show modal
  const handleMarkerPress = (complaint) => {
    setSelectedComplaint(complaint); // Set the selected complaint to show its details
    setModalVisible(true); // Show the modal
  };

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

  return (
    <SafeAreaView className="bg-primary h-full">
      <View style={{ padding: 16, alignItems: 'center' }} className="bg-primary">
        <Text className="text-2xl text-white font-psemibold">
          Active Complaints Map
        </Text>
      </View>

 

      <MapViewClustering
        style={{ width: '100%', height: '100%' }}
        initialRegion={{
          latitude: 14.2811,
          longitude: 121.4575,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        radius={30} // Adjust the clustering radius
        clusterColor="red" // Set the cluster color to red
      >
        {activeComplaints.map((complaint) => {
          const { latitude, longitude } = parseLocation(complaint.Location);

          return (
            <Marker
              key={complaint.$id}
              coordinate={{ latitude, longitude }}
              onPress={() => handleMarkerPress(complaint)}
            >
              <View
                style={{
                  height: 12,
                  width: 12,
                  borderRadius: 6,
                  backgroundColor: 'red',
                  borderColor: 'red',
                  borderWidth: 1,
                }}
              />
            </Marker>
          );
        })}
      </MapViewClustering>
           {/* Filter Buttons */}
           <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'No Power' && styles.activeFilter]}
          onPress={() => setFilterType('No Power')} // Filter for power outages
        >
          <Text style={styles.filterText}>Power Outages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filterType !== 'No Power' && styles.activeFilter]}
          onPress={() => setFilterType('Other Complaints')} // Filter for other complaints
        >
          <Text style={styles.filterText}>Other Complaints</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for complaint details */}
      <Modal
        animationType="slide" // You can change this to "fade" or "none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Handle modal close
      >
        <Animatable.View animation="bounceInUp" style={styles.modalView}> 
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complaint Details</Text>

            {selectedComplaint && (
              <>
                <Text style={styles.modalText}>Description: {selectedComplaint.description}</Text>
                <Text style={styles.modalText}>Status: {selectedComplaint.status}</Text>
                <Text style={styles.modalText}>Reported on: {formattedDate(selectedComplaint.createdAt)}</Text>
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)} // Close modal
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    position: 'absolute', // Make the container position absolute
    top: 100, // Position it from the top (you can adjust this value)
    left: 0, // Make it stretch from the left to right of the screen
    right: 0, 
    flexDirection: 'row', // Display buttons in a row
    justifyContent: 'center', // Center the buttons horizontally
    paddingHorizontal: 20, // Add some padding to the sides
    zIndex: 1, // Ensure the buttons are above the map
  },
  filterButton: {
    backgroundColor: '#E0E0E0',

    padding: 10,

  },
  activeFilter: {
    backgroundColor: '#FF9001',
  },
  filterText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Transparent background
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Map;
