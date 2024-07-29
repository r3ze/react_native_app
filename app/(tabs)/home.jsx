import { View, Text, FlatList, Image, RefreshControl, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import useAppwrite from '../../lib/useAppwrite';
import { getUserComplaints } from "../../lib/appwrite";
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import { FontAwesome } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons'; 

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
  const { data: complaints, refetch } = useAppwrite(() => getUserComplaints(user.$id));
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

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
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'New':
      case 'Assigned':
        return <MaterialIcons name="autorenew" size={24} color="#FF9C01" />;
      case 'resolved':
        return <MaterialIcons name="check-circle" size={24} color="green" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
      case 'Assigned':
        return '#FF9C01';
      case 'resolved':
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
    if (filter === 'Resolved' && complaint.status === 'resolved') return true;
    return false;
  });

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
            <View className={`px-4 w-full flex-row ${item.status === 'resolved' ? 'justify-end' : 'justify-around'} mt-3`}>
              {item.status !== 'resolved' && (
                <>
                  <CustomButton title="WITHDRAW" />
                  <CustomButton title="TRACK" onPress={() => handlePress(item)} />
                </>
              )}
              {item.status === 'resolved' && (
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

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
});

export default Home;
