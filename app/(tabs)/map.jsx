import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout, Geojson } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useGlobalContext } from "../../context/GlobalProvider";
import useAppwrite from '../../lib/useAppwrite';
import { getAllComplaints } from "../../lib/appwrite"; 
import { Databases, Client} from 'appwrite';
import serviceAreaGeoJSON from "../../geojson/areas.json"
const Map = () => {
  const { data: complaints, refetch } = useAppwrite(getAllComplaints);
  const [activeComplaints, setActiveComplaints] = useState([]);

  // Function to parse location string into latitude and longitude
  const parseLocation = (location) => {
    const [latitude, longitude] = location.split(',').map(coord => parseFloat(coord.trim()));
    return { latitude, longitude };
  };

  // Function to get the appropriate icon based on complaint type
  const getComplaintIcon = (type) => {
    switch (type) {
      case 'No Power':
        return <MaterialIcons name="power" size={32} color="red" />;
      case 'Defective Meter':
        return <MaterialIcons name="speed" size={32} color="orange" />;
      case 'Detached Meter':
        return <MaterialIcons name="electrical-services" size={32} color="blue" />;
      case 'Low Voltage':
        return <MaterialIcons name="bolt" size={32} color="yellow" />;
      case 'No Reading':
        return <MaterialIcons name="speed" size={32} color="purple" />;
      case 'Loose Connection/Sparkling of Wire':
        return <MaterialIcons name="electrical-services" size={32} color="green" />;
      default:
        return <MaterialIcons name="warning" size={32} color="gray" />;
    }
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
     console.log(' initialized Appwrite client:');
 } catch (error) {
   console.error('Failed to initialize Appwrite client:', error);
 }
 const databases = new Databases(client);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = databases.client.subscribe(`databases.66224a152d9f9a67af78.collections.6626029b134a98006f77.documents`, (response) => {
      if (response.events.includes("databases.*.collections.*.documents.*.update")) {
        console.log("update event matched");
        refetch(); // Refetch complaints to update the list
      }

      if (response.events.includes("databases.*.collections.*.documents.*.create")) {
        console.log("create event matched");
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
      <MapView
        style={{ width: '100%', height: '100%' }}
        initialRegion={{
          latitude: 14.2811,
          longitude: 121.4575,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {activeComplaints.map((complaint) => {
          const { latitude, longitude } = parseLocation(complaint.Location);

          return (
            <Marker
              key={complaint.$id}
              coordinate={{ latitude, longitude }}
            >
              {getComplaintIcon(complaint.description)}
              <Callout>
                <View>
                  <Text>{complaint.description}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}

      </MapView>
   
    </SafeAreaView>
  );
};

export default Map;
