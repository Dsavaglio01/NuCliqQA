import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const WordBubble = ({ text }) => (
  <View style={{ backgroundColor: 'white', padding: 10, borderRadius: 15 }}> 
    <Text>{text}</Text>
    <Svg height="100" width="150" style={{ position: 'absolute', bottom: -5, left: 10 }}>
      <Path d="M0 0 L15 0 L7.5 10 z" fill="white" /> 
    </Svg>
  </View>
);
export default WordBubble;