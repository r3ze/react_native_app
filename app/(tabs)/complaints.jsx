import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import useAppwrite from "../../lib/useAppwrite";
import {
  getUserComplaints,
  updateComplaintStatusToWithdrawn,
  createLog,
} from "../../lib/appwrite";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../../components/CustomButton";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Client, Databases } from "appwrite";
import EmptyState from "../../components/EmptyState";
import { RadioButton } from "react-native-paper";
import Icon from "react-native-vector-icons/Feather";
import dayjs from "dayjs";
const complaints = () => {
  const { user } = useGlobalContext();
  const { data: initialComplaints, refetch } = useAppwrite(() =>
    getUserComplaints(user.$id)
  );
  const [complaints, setComplaints] = useState(initialComplaints);

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [okModalVisible, setOkModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [visibleComplaints, setVisibleComplaints] = useState(4); // State to control the number of visible complaints
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    setComplaints(initialComplaints);

    // Initialize Appwrite client
    const client = new Client();
    try {
      client
        .setEndpoint("https://cloud.appwrite.io/v1") // Replace with your Appwrite endpoint
        .setProject("662248657f5bd3dd103c"); // Replace with your Appwrite project ID
      console.log(" initialized Appwrite client:");
    } catch (error) {
      console.error("Failed to initialize Appwrite client:", error);
    }

    const databases = new Databases(client);

    // Subscribe to real-time events
    const unsubscribe = databases.client.subscribe(
      `databases.66224a152d9f9a67af78.collections.6626029b134a98006f77.documents`,
      (response) => {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.update"
          )
        ) {
          const updatedComplaint = response.payload;

          // Update the complaints state with the updated complaint
          setComplaints((prevComplaints) =>
            prevComplaints.map((complaint) =>
              complaint.$id === updatedComplaint.$id
                ? updatedComplaint
                : complaint
            )
          );
        }
      }
    );

    return () => {
      unsubscribe(); // Clean up the subscription when the component unmounts
    };
  }, [initialComplaints]);

  const handlePress = (item) => {
    navigation.navigate("screens/ComplaintDetails", { complaint: item });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "New":
      case "Assigned":
        return "In progress";
      case "resolved":
        return "Resolved";
      case "Withdrawn":
        return "Withdrawn";
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "New":
      case "Assigned":
      case "In Progress":
        return <MaterialIcons name="autorenew" size={24} color="#FF9C01" />;
      case "Resolved":
        return <MaterialIcons name="check-circle" size={24} color="green" />;
      case "Withdrawn":
        return <MaterialIcons name="cancel" size={24} color="gray" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
      case "Assigned":
      case "In Progress":
        return "#FF9C01";
      case "Resolved":
        return "green";
      default:
        return "gray";
    }
  };

  const applyFilter = (status) => {
    setFilter(status);
    setModalVisible(false);
  };

  const filteredComplaints = complaints
    .filter((complaint) => {
      if (filter === "All") return true;
      if (
        filter === "In progress" &&
        (complaint.status === "New" ||
          complaint.status === "Assigned" ||
          complaint.status === "In Progress")
      )
        return true;
      if (filter === "Resolved" && complaint.status === "Resolved") return true;
      if (filter === "Withdrawn" && complaint.status === "Withdrawn")
        return true;
      if (filter === "Invalidated" && complaint.status === "Invalidated")
        return true;
      return false;
    })
    .slice(0, visibleComplaints); // Limit the number of visible complaints

  const handleWithdrawPress = (complaintId) => {
    setConfirmModalVisible(true);
    setSelectedComplaintId(complaintId);
  };

  const confirmWithdrawal = async (reason) => {
    if (!reason) {
      console.error("No reason provided for withdrawal.");
      return;
    }

    const withdrawalReason = reason === "other" ? otherReason : reason;

    if (withdrawalReason.trim() === "") {
      console.error("Other reason cannot be empty.");
      return;
    }
    const currentDate = new Date();
    const offset = currentDate.getTimezoneOffset();
    const localDate = new Date(currentDate.getTime() - offset * 60 * 1000);

    setConfirmModalVisible(false);
    await withdrawComplaint(selectedComplaintId, withdrawalReason);
    await createLog(
      user.$id,
      user.name,
      localDate,
      "Withdrawn a complaint",
      user.email,
      "Consumer"
    );
  };

  const withdrawComplaint = async (complaintId, reason) => {
    const status = "Withdrawn";
    const currentDate = new Date();
    const offset = currentDate.getTimezoneOffset();
    const localDate = new Date(currentDate.getTime() - offset * 60 * 1000);
    try {
      await updateComplaintStatusToWithdrawn(
        complaintId,
        status,
        reason,
        localDate
      );
      setModalMessage("Withdrawn successfully");
      setWithdrawModalVisible(true);
    } catch (error) {
      console.error("Failed to withdraw complaint: ", error);
    }
  };

  const generateTicketId = (locationName, createdAt) => {
    const locationMapping = {
      Cavinti: "CV",
      Pagsanjan: "PG",
      Lumban: "LM",
      Kalayaan: "KL",
      Paete: "PT",
      Pakil: "PK", // corrected based on pattern
      Pangil: "PN",
      Siniloan: "SN",
      Famy: "FY",
      Mabitac: "MB",
      "Santa Maria": "SM",
    };

    let locationCode = "XX"; // Fallback code if location is unknown

    // Check if the locationName contains any of the mapped location keys
    for (const [key, code] of Object.entries(locationMapping)) {
      if (locationName.includes(key)) {
        locationCode = code;
        break;
      }
    }

    try {
      const formattedDate = dayjs(createdAt).format("MM-YYYY");
      return `TCKT-${locationCode}-${formattedDate}`;
    } catch (error) {
      console.error("Invalid date format", error);
      return `TCKT-${locationCode}-InvalidDate`;
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <FlatList
          data={filteredComplaints}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <View className="mb-10">
              <View className="w-full flex-row justify-between px-4">
                <View className="flex-row items-center">
                  {getStatusIcon(item.status)}
                  <Text
                    className="text text-secondary font-pmedium"
                    style={{
                      color: getStatusColor(item.status),
                      marginLeft: 5,
                    }}
                  >
                    {getStatusText(item.status)}
                  </Text>
                </View>
                <Text
                  className="text text-gray-100 font-pmedium"
                  style={{ color: "gray" }}
                >
                  Ticket ID:{" "}
                  {generateTicketId(item.locationName, item.createdAt)}-
                  {item.counter}
                </Text>
              </View>
              <View className="w-full mt-3 h-30 flex flex-row justify-between space-x-2">
                <View className="flex-row px-4">
                  <View className="w-1/5 mr-2 justify-center">
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        className="h-20 w-15"
                        resizeMode="contain"
                      />
                    ) : (
                      // Display a document icon if no image is available
                      <Icon name="file-text" size={70} color="#cccccc" />
                    )}
                  </View>
                  <View className="flex w-4/5">
                    <Text className="mt-1 text text-white font-pmedium">
                      {item.description}
                    </Text>
                    {item.additionalDetails ? (
                      <Text
                        className="mt-1 text text-gray-100 font-pmedium"
                        style={{ color: "gray" }}
                      >
                        {item.additionalDetails}
                      </Text>
                    ) : (
                      <Text
                        className="mt-1 text text-gray-100 font-pmedium"
                        style={{ color: "gray" }}
                      >
                        No description provided.
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              <View
                className={`px-4 w-full flex-row ${
                  item.status === "Resolved" ||
                  item.status === "Withdrawn" ||
                  item.status === "Invalidated"
                    ? "justify-end"
                    : "justify-around"
                } mt-3`}
              >
                {item.status !== "Resolved" &&
                  item.status !== "Withdrawn" &&
                  item.status !== "Invalidated" && (
                    <>
                      <CustomButton
                        title="WITHDRAW"
                        onPress={() => handleWithdrawPress(item.$id)}
                      />
                      <CustomButton
                        title="TRACK"
                        onPress={() => handlePress(item)}
                      />
                    </>
                  )}
                {item.status === "Withdrawn" && (
                  <CustomButton
                    title="VIEW"
                    onPress={() => handlePress(item)}
                  />
                )}

                {item.status === "Resolved" && (
                  <CustomButton
                    title="VIEW"
                    onPress={() => handlePress(item)}
                  />
                )}

                {item.status === "Invalidated" && (
                  <CustomButton
                    title="VIEW"
                    onPress={() => handlePress(item)}
                  />
                )}
              </View>
            </View>
          )}
          ListHeaderComponent={() => (
            <View className="">
              <View className="flex-row justify-between items-center px-4 py-2">
                <View className="flex-row">
                  <Text
                    className="font-pmedium mr-2 text-gray-100"
                    style={{ color: "gray" }}
                  >
                    Showing
                  </Text>
                  <Text className="font-pmedium text-gray-100">{filter}</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <View className="flex-row items-center justify-between">
                    <FontAwesome name="filter" size={24} color="gray" />
                    <Text
                      className="font-pmedium text-sm text-gray-100"
                      style={{ color: "gray" }}
                    >
                      Filters
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={() => {
            let emptyTitle = "";
            let emptySubtitle = "";

            if (filter === "All") {
              emptyTitle = "No Complaints Yet.";
              emptySubtitle = "You Haven't Reported Any Issues.";
            } else if (filter === "In progress") {
              emptyTitle = "No Complaints In Progress.";
              emptySubtitle = "You Have No Ongoing Issues.";
            } else if (filter === "Resolved") {
              emptyTitle = "No Resolved Complaints.";
              emptySubtitle = "No Issues Have Been Resolved Yet.";
            } else if (filter === "Withdrawn") {
              emptyTitle = "No Withdrawn Complaints.";
              emptySubtitle = "You Have Not Withdrawn Any Complaints.";
            }

            return <EmptyState title={emptyTitle} subtitle={emptySubtitle} />;
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />

        {complaints.length > visibleComplaints && (
          <TouchableOpacity
            onPress={() => setVisibleComplaints(complaints.length)}
          >
            <Text className="text text-secondary font-pmedium text-center">
              Show More
            </Text>
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
            <TouchableOpacity onPress={() => applyFilter("All")}>
              <Text style={styles.modalOption}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => applyFilter("In progress")}>
              <Text style={styles.modalOption}>In progress</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => applyFilter("Resolved")}>
              <Text style={styles.modalOption}>Resolved</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => applyFilter("Withdrawn")}>
              <Text style={styles.modalOption}>Withdrawn</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => applyFilter("Invalidated")}>
              <Text style={styles.modalOption}>Invalidated</Text>
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
              <TouchableOpacity
                onPress={() => setOkModalVisible(false)}
                style={styles.closeButton}
              >
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
          {confirmModalVisible && (
            <View className="flex-1 items-center justify-center bg-black/50">
              <View className="w-[90%] bg-white p-5 rounded-2xl shadow-lg">
                <Text className="text-xl font-bold text-gray-800 mb-4">
                  Select Reason for Withdrawal:
                </Text>

                <RadioButton.Group
                  onValueChange={(value) => setSelectedReason(value)}
                  value={selectedReason}
                >
                  <View className="flex-row items-center mb-3">
                    <RadioButton value="Issue Resolved" />
                    <Text className="ml-2 text-lg text-gray-700">
                      Issue Resolved
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-3">
                    <RadioButton value="No longer necessary" />
                    <Text className="ml-2 text-lg text-gray-700">
                      No longer necessary
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-3">
                    <RadioButton value="Submitted by mistake" />
                    <Text className="ml-2 text-lg text-gray-700">
                      Submitted by mistake
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-3">
                    <RadioButton value="other" />
                    <Text className="ml-2 text-lg text-gray-700">Other</Text>
                  </View>
                </RadioButton.Group>

                {selectedReason === "other" && (
                  <TextInput
                    className="mt-4 p-3 border border-blue-500 rounded-lg text-lg bg-white"
                    placeholder="Please specify your reason"
                    value={otherReason}
                    onChangeText={(text) => setOtherReason(text)}
                  />
                )}

                <View className="flex-row justify-between mt-6">
                  <TouchableOpacity
                    onPress={() => setConfirmModalVisible(false)}
                    className="bg-red-500 py-3 px-6 rounded-lg w-[48%]"
                  >
                    <Text className="text-white text-center text-lg">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmWithdrawal(selectedReason)}
                    className="bg-blue-500 py-3 px-6 rounded-lg w-[48%]"
                  >
                    <Text className="text-white text-center text-lg">Yes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Modal>

        <Modal
          transparent={true}
          animationType="fade"
          visible={withdrawModalVisible}
          onRequestClose={() => setWithdrawModalVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Information</Text>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
              <TouchableOpacity
                onPress={() => setWithdrawModalVisible(false)}
                style={styles.closeButtonW}
              >
                <Text style={styles.closeButtonTextW}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalOption: {
    fontSize: 16,
    paddingVertical: 10,
  },
  showMoreButton: {
    color: "#1e90ff",
    textAlign: "center",
    padding: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "#2c2c34",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#1e90ff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },

  closeButtonW: {
    backgroundColor: "#1e90ff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonTextW: {
    color: "#fff",
    fontSize: 16,
  },
  buttonWidth: {
    width: 100, // Fixed width for buttons
  },
  cancelButton: {
    backgroundColor: "#ff4c4c", // Red color for the cancel button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: "#1e90ff", // Blue color for the confirm button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});

export default complaints;
