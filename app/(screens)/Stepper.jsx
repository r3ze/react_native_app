import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StepIndicator from 'react-native-step-indicator';

const labels = ["Complaint Received", "Resolution Team On The Way", "Complaint Resolved"];

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

const Stepper = ({ currentPosition }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
    
      <StepIndicator
        customStyles={customStyles}
        currentPosition={1}
        labels={labels}
        direction="vertical"
        stepCount={3}
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
});

export default Stepper;
