import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';

const Stepper = ({ status }) => {
  const steps = [
    'Complaint Received',
    'Resolution Team On The Way',
    'Complaint Resolved',
  ];

  const getStatusIndex = (status) => {
    switch (status.toLowerCase()) {
      case 'received':
        return 0;
      case 'on the way':
        return 1;
      case 'resolved':
        return 2;
      default:
        return 0;
    }
  };

  const currentStep = getStatusIndex(status);

  return (
   <View style={{flex: 1}}>
    <ProgressSteps activeStep={1} activeLabelColor = "#FF9C01" activeStepIconBorderColor = "#FF9C01" completedProgressBarColor = "#FF9C01" completedStepIconColor = "#FF9C01">
        <ProgressStep label="Complaint Submitted" removeBtnRow={true}  >
        
        </ProgressStep>
        <ProgressStep label="Resolution Team Dispatched"  removeBtnRow={true}>
         
        </ProgressStep>
        <ProgressStep label="Complaint Resolved" removeBtnRow={true}>
        
        </ProgressStep>
    </ProgressSteps>
</View>
  );
};



export default Stepper;
