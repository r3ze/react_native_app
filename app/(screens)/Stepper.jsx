import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StepIndicator from 'react-native-step-indicator';

const customStyles = {
  stepIndicatorSize: 30,
  currentStepIndicatorSize: 40,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: '#FFA001',
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: '#FFA001',
  stepStrokeUnFinishedColor: '#aaaaaa',
  separatorFinishedColor: '#FFA001',
  separatorUnFinishedColor: '#aaaaaa',
  stepIndicatorFinishedColor: '#FFA001',
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#ffffff',
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: '#FFA001',
  stepIndicatorLabelFinishedColor: '#ffffff',
  stepIndicatorLabelUnFinishedColor: '#aaaaaa',
  labelColor: '#999999',
  labelSize: 16,
  currentStepLabelColor: '#FFA001',
  labelAlign: 'flex-start',
};

const statusMap = {
  New: 1,
  Assigned: 2,
  resolved: 4,
  Closed: 3,
};

const Stepper = ({ complaintStatus, labels }) => {
  const [currentPosition, setCurrentPosition] = useState(statusMap[complaintStatus]);

  useEffect(() => {
    setCurrentPosition(statusMap[complaintStatus]);
  }, [complaintStatus]);

  const renderLabel = ({ position, stepStatus, label, currentPosition }) => {
    return (
      <View style={styles.labelContainer}>
        <Text style={styles.dateText}>{label.date}</Text>
        <Text style={styles.descriptionText}>{label.description}</Text>
        <Text style={styles.timeText}>{label.time}</Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StepIndicator
        customStyles={customStyles}
        currentPosition={currentPosition}
        labels={labels}
        direction="vertical"
        stepCount={labels.length}
        renderLabel={renderLabel}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 1,
    backgroundColor: '#161622',
  },
  labelContainer: {
    flex: 1,
    paddingLeft: 16,
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#999999',
  },
  descriptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 14,
    color: '#999999',
  },
});

export default Stepper;
