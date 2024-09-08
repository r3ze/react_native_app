import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Polygon } from 'react-native-maps';
import * as turf from '@turf/turf';
import { Ionicons } from '@expo/vector-icons'; 
import {  router } from "expo-router";
const chooseFromMap = () => {
  const navigation = useNavigation();
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 14.2811,
    longitude: 121.4575,
  });
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  const [locationText, setLocationText] = useState('');
  const [isCovered, setIsCovered] = useState(false);
  const nonRestrictedAreas = [
    // Add your non-restricted area coordinates here as polygons
    {
      coordinates: [
        [
          121.42862393013246,
          14.229233208850104
        ],
        [
          121.43268853290414,
          14.292987921144316
        ],
        [
          121.38374234246226,
          14.521722180219996
        ],
        [
          121.4021213046936,
          14.605937892504912
        ],
        [
          121.65486540802124,
          14.582784473734748
        ],
        [
          121.56839677705409,
          14.207645051086274
        ],
        [
          121.42790034481493,
          14.229427756425707
        ],
        [
          121.42862393013246,
          14.229233208850104
        ],
        





      ]
    },
    // Add more polygons for other non-restricted areas
  ];

  const getPlaceName = async (latitude, longitude) => {
    const apiKey = '1e506c976e8f4326be97179c1b0b59c3'; // OpenCage API key
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;
  
    try {
      const response = await axios.get(url);
      if (response.data.results.length > 0) {
        const place = response.data.results[0].formatted;
        return place;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const isLocationInNonRestrictedArea = (latitude, longitude) => {
    const point = turf.point([longitude, latitude]);

    return nonRestrictedAreas.some((area) => {
      const polygon = turf.polygon([area.coordinates]);
      return turf.booleanPointInPolygon(point, polygon);
    });
  };

  const handleMapPress = async (e) => {
    const coordinate = e.nativeEvent.coordinate;
    setSelectedLocation(coordinate);

    if (isLocationInNonRestrictedArea(coordinate.latitude, coordinate.longitude)) {
      const placeName = await getPlaceName(coordinate.latitude, coordinate.longitude);
      setLocationText(placeName);
      setIsCovered(true);
    } else {
      setLocationText('This area is not covered by FLECO. Please choose another location.');
      setIsCovered(false)
    }
  };
  const back = () =>{
  router.replace("/submit")
  }

  const handleConfirmLocation = () => {
    if (isLocationInNonRestrictedArea(selectedLocation.latitude, selectedLocation.longitude)) {
      navigation.navigate('(tabs)', {
        screen: 'submit',
        params: {
          selectedLocation,
          locationText,
        },
      });
    } else {
      alert('Selected location is not covered by FLECO.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>

<TouchableOpacity
       onPress={back}
        style={{
          position: 'absolute',
          top: 40,
          left: 10,
          backgroundColor: 'white',
          padding: 10,
          borderRadius: 10,
          zIndex: 1, // Ensure the button is above the map
        }}
      >
        <Ionicons name='arrow-back' size={24} color="black"/>
      </TouchableOpacity>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 14.2811,
          longitude: 121.4575,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        <Marker coordinate={selectedLocation} />
   
      </MapView>
      <View style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          {locationText || 'Select a location on the map'}
        </Text>
        {isCovered && (
     <TouchableOpacity
     style={{
       backgroundColor: '#E0E0E0',
       paddingVertical: 10,
       paddingHorizontal: 20,
       borderRadius: 5,
       alignItems: 'center',
     }}
     onPress={handleConfirmLocation}
   >
     <Text style={{ fontSize: 16 }}>Confirm Location</Text>
   </TouchableOpacity>
            )}
      
      </View>
    </SafeAreaView>
  );
};

export default chooseFromMap;
