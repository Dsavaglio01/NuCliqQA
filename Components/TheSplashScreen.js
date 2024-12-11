import { StyleSheet, Text, View } from 'react-native'
import React, {useRef, useEffect, useState, useContext} from 'react'
import LottieView from 'lottie-react-native';
import useAuth from '../Hooks/useAuth';
import { onSnapshot, doc, getDoc, updateDoc} from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import themeContext from '../lib/themeContext';
const TheSplashScreen = () => {
    const animation = useRef(null);
    const {user} = useAuth();
    const navigation = useNavigation();
    const theme = useContext(themeContext)
    useEffect(() => {
  if (user != null && user != undefined) {
    let unsub;
    unsub = onSnapshot(doc(db, "profiles", user.uid), (doc) => {
      if (doc.data() != undefined) {
        if (doc.data().firstName != undefined) {
          navigation.navigate('Home', {screen: 'Home', params: {newPost: false, post: null}});
          //setFirstName(doc.data().firstName)
        }
        else {
          navigation.navigate('Name')
        }
        
      }
      else {
        navigation.navigate('Name')
      }
  });
  return unsub;
  }
}, [user])
useEffect(() => {
  const getData = async() => {
    await updateDoc(doc(db, 'profiles', user.uid), {
      active: true
    })
  }
  getData()
}, [])
  return (
    <View style={[styles.animationContainer, {backgroundColor: "#121212"}]}>
      <FastImage source={require('../assets/logo.png')} style={{height: 100, width: 100}}/>
    </View>
  )
}

export default TheSplashScreen

const styles = StyleSheet.create({
    animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  }
})