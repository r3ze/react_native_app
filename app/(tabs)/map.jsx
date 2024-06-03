import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, RefreshControl, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import useAppwrite from '../../lib/useAppwrite';
import { getUserComplaints } from "../../lib/appwrite";
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';

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

function formatTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

const Home = () => {
  const { user } = useGlobalContext();
  const { data: complaints, refetch } = useAppwrite(() => getUserComplaints(user.$id));
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const handlePress = (item) => {
    navigation.navigate('screens/ComplaintDetails', { complaint: item });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Function to determine marker color based on complaint type
  const getMarkerColor = (type) => {
    switch (type) {
      case 'Power Outage':
        return 'blue';
      case 'Defective Meter':
        return 'green';
      case 'Detached Meter':
        return 'yellow';
      case 'Loose Connection/Sparkling of Wire':
        return 'orange';
      case 'Low Voltage':
        return 'purple';
      case 'No Reading':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
  r
      <MapView
        style={{ width: '100%', height: '100%' }}
        initialRegion={{
          latitude: 14.2811,
          longitude: 121.4575,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        
      </MapView>
    </SafeAreaView>
  );
}

export default Home;
