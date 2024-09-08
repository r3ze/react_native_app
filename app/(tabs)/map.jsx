import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout } from 'react-native-maps';
import MapViewClustering from 'react-native-map-clustering'; // Import Clustered Map
import useAppwrite from '../../lib/useAppwrite';
import { getAllComplaints } from "../../lib/appwrite"; 
import { Databases, Client } from 'appwrite';

const Map = () => {
  const { data: complaints, refetch } = useAppwrite(getAllComplaints);
  const [activeComplaints, setActiveComplaints] = useState([]);

  // Function to parse location string into latitude and longitude
  const parseLocation = (location) => {
    const [latitude, longitude] = location.split(',').map(coord => parseFloat(coord.trim()));
    return { latitude, longitude };
  };

  // Filter complaints to only include active ones (not resolved or withdrawn)
  useEffect(() => {
    setActiveComplaints(complaints.filter(
      (complaint) => complaint.status !== 'Resolved' && complaint.status !== 'Withdrawn'
    ));
  }, [complaints]);

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
        // Customize clustering options here
        radius={30} // Adjust the clustering radius
        clusterColor="red" // Set the cluster color to red
      >
        {activeComplaints.map((complaint) => {
          const { latitude, longitude } = parseLocation(complaint.Location);

          return (
            <Marker
              key={complaint.$id}
              coordinate={{ latitude, longitude }}
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
              <Callout>
              <View style={{minWidth: 100, width: 150}} className="items-center">
                <Text>{complaint.description}</Text>
              </View>
              </Callout>
            </Marker>
          );
        })}
      </MapViewClustering>
    </SafeAreaView>
  );
};

export default Map;
