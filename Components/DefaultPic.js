import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const DefaultProfilePicture = () => {
  return (
    <View>
      <Svg height="100" width="100">
        <Circle cx="50" cy="50" r="45" fill="blue" />
      </Svg>
    </View>
  );
};

export default DefaultProfilePicture;
