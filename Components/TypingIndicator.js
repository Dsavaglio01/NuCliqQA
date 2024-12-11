import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 300);
    animateDot(dot3, 600);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.dot, { opacity: dot1 }]}>•</Animated.Text>
      <Animated.Text style={[styles.dot, { opacity: dot2 }]}>•</Animated.Text>
      <Animated.Text style={[styles.dot, { opacity: dot3 }]}>•</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    fontSize: 35,
    color: '#fff',
    marginHorizontal: 5,
  },
});

export default TypingIndicator;
