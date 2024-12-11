import React, { useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, PanResponder } from 'react-native';

const DraggableCircle = () => {
    const pan = useRef(new Animated.ValueXY()).current;
    const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([
      null,
      {
        dx: pan.x, // x,y are Animated.Value
        dy: pan.y,
      },
    ]),
    onPanResponderRelease: () => {
      Animated.decay(
        pan, // Auto-multiplexed
        {toValue: {x: 0, y: 0}, useNativeDriver: true}, // Back to zero
      ).start();
    },
  });
    
    /* const onGestureEvent = ([
    {
      nativeEvent: {
        translationX: dragX,
        translationY: dragY,
        state: gestureState,
      },
    },
  ]); */

  return (
      <Animated.View
        {...panResponder.panHandlers}
        style={[pan.getLayout(), styles.circle]}
      />
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DraggableCircle;
