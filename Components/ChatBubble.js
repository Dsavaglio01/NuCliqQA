import { StyleSheet, Text, View, Animated, Image, TouchableOpacity } from 'react-native'
import React, {useState, useEffect, useRef} from 'react'
import {Ionicons } from '@expo/vector-icons'
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native'
import * as Haptics from 'expo-haptics';
const ChatBubble = ({ message, isUser, item, timestamp, liked, read, theme, post, image, person}) => {
    const [animatedValue] = useState(new Animated.Value(0))
    const [tapCount, setTapCount] = useState(0);
    const timerRef = useRef(null);
    const navigation = useNavigation();
    
  function handleThemePress(item) {
    setTapCount(tapCount + 1);
    console.log(item.message.theme)
    if (tapCount === 0) {
      // Set a timer for the second tap
      timerRef.current = setTimeout(() => {
        // If no second tap occurs within the timer, treat it as a single tap
        setTapCount(0);
        if (item.message.theme.free) {
          navigation.navigate('SpecificTheme', {productId: item.message.theme.id, free: true, purchased: false})
        } 
        
        //console.log('Single Tap!');
      }, 300); // Adjust the time limit according to your requirements
    } else if (tapCount === 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      // If it's the second tap and the timer is still active, treat it as a double tap
      clearTimeout(timerRef.current);
      setTapCount(0);
      renderLiked(item)
    }
  }
  //console.log(theme)
  return (
     null
      
    
   
  )
}

export default ChatBubble

const styles = StyleSheet.create({
    timestamp: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'right',
    marginTop: 5,
  },
  text: {
    fontSize: 15.36, 
    color: "#fafafa",
    alignSelf: 'flex-start',
    textAlign: 'left'
  },
  userText: {
    fontSize: 15.36,
    color: "#121212",
    textAlign: 'left'
  },
  timestampContainer: { 
    width: 80,  // Adjust the width as needed
    alignItems: 'flex-end', // Align timestamp to the right
  },
  userTimestampContainer: {
    width: 80,
    alignItems: 'flex-start',
  },
  likeButton: {
  position: 'absolute',
  bottom: 5,
  right: 10, // Default: right side
},
userLikeButton: {
  left: 10, 
  //bottom: 10,
  right: 'auto', 
}, 
readReceipt: { 
    fontSize: 12,
    color: 'gray',
    marginLeft: 'auto', 
    marginRight: 10
  },
  profileImage: {
    width: 40,
    height: 40,
    backgroundColor: "#fafafa",
    borderRadius: 20,
    marginRight: 10, // Add spacing between image and text
  },
  messageContent: { // Style for wrapping text and timestamp
    flex: 1, 
  },
  imagepfp: {
    height: 33, width: 33, borderRadius: 8, margin: '5%'
  },
  postUsername: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    //padding: 5,
    alignSelf: 'center',
  },
  captionText: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    paddingBottom: 0,
    paddingHorizontal: 5,
    paddingRight: 0,
    //marginTop: '5%'
  },
  image: {height: 220, width: 220, borderRadius: 8, marginLeft: 5},
})
