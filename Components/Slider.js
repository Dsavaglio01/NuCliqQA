import React, { useRef, useState, useEffect } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

const Slider = ({ value, minimumValue, maximumValue, step, onValueChange }) => {
  const [sliderValue, setSliderValue] = useState(value); // Internal state to track the value
  const pan = useRef(new Animated.ValueXY()).current;
  const containerWidth = useRef(0); // To store the container's width

  // Calculate initial thumb position based on value and container width
  useEffect(() => {
    if (containerWidth.current > 0) {
      const initialX = ((sliderValue - minimumValue) / (maximumValue - minimumValue)) * containerWidth.current;
      pan.setValue({ x: initialX, y: 0 });
    }
  }, [containerWidth.current, sliderValue, minimumValue, maximumValue]);

  const panResponder = useRef(
    PanResponder.create({
      // ... (rest of the PanResponder configuration)
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { 
            dx: pan.x, 
            dy: pan.y 
          }
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        // Calculate 
        const newValue = Math.round((pan.x._value / containerWidth.current) * (maximumValue - minimumValue) / step) * step + minimumValue;
        setSliderValue(newValue);
        onValueChange(newValue); // Call the provided callback
      }
    })
  ).current;
  return (
    <View 
      style={styles.container}
      onLayout={(event) => {
        containerWidth.current = event.nativeEvent.layout.width;
      }}
    >
      <Animated.View
        style={{
          ...styles.sliderThumb,
          transform: [{ translateX: pan.x }]
        }}
        {...panResponder.panHandlers}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 40,
    backgroundColor: 'lightgray',
    borderRadius: 20,
    justifyContent: 'center'
  },
  sliderThumb: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'blue'
  }
});

export default Slider;