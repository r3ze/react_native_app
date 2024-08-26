import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const GeoSearch = ({onAddressSelected}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const searchLocation = async (text) => {
    setQuery(text);
    if (text.length > 2) {  // Start searching after 3 characters
      try {
        const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
          params: {
            key: '1e506c976e8f4326be97179c1b0b59c3',
            q: text,
            limit: 5,
          },
        });
        setResults(response.data.results);
      } catch (error) {
        console.error(error);
      }
    } else {
      setResults([]);
    }
  };

  const handleSelection = (item) => {
    console.log('Selected location:', item.formatted);
    setQuery(item.formatted);
    setResults([]);
    if (onAddressSelected) {
        onAddressSelected(item.formatted); // Trigger the callback with the selected address
      }
  };

  return (
    <View style={styles.container}>
    <View
      className="border-2 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary
  items-center flex-row"
    >
      <TextInput
        className="w-full flex-1 text-white font-pmedium text-base"
        placeholder="Search for a place"
        placeholderTextColor={"#7b7b8b"}
        value={query}
        onChangeText={searchLocation}
      />
    </View>

    {/* Display the list of suggestions below the TextInput */}
    {results.length > 0 && (
      <FlatList
        data={results}
        keyExtractor={(item) => item.geometry.lat.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelection(item)}>
            <Text style={styles.item}>{item.formatted}</Text>
          </TouchableOpacity>
        )}
        style={styles.suggestionsContainer}
      />
    )}
  </View>
  );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
      },
      suggestionsContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginTop: 5,
      },
      item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
      },
  });


export default GeoSearch;
