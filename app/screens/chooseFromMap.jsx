import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import axios from 'axios';
import { router } from 'expo-router';
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

  const getPlaceName = async (latitude, longitude) => {
    const apiKey = '1e506c976e8f4326be97179c1b0b59c3'; //  OpenCage API key
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

  const handleMapPress = async (e) => {
    const coordinate = e.nativeEvent.coordinate;
    setSelectedLocation(coordinate);

    const placeName = await getPlaceName(coordinate.latitude, coordinate.longitude);
    setLocationText(placeName);

  };
  const handleConfirmLocation = () => {
    navigation.navigate('(tabs)', {
      screen: 'submit',
      params: {
        selectedLocation,
        locationText,
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
      </View>
    </SafeAreaView>
  );
};

export default chooseFromMap;
