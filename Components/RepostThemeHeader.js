import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import {MaterialCommunityIcons, Entypo, Ionicons} from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import MainLogo from './MainLogo'
import { Provider, Menu, Divider } from 'react-native-paper'
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat'
import { setDoc, doc, serverTimestamp, deleteDoc, query, collection, getDocs, where, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import {BACKEND_URL} from '@env'
import useAuth from '../Hooks/useAuth'
import themeContext from '../lib/themeContext'
import FastImage from 'react-native-fast-image'
const RepostThemeHeader = ({text, style, backButton, postArray, caption, id,
  timestamp, post, actualPost, userId, name,}) => {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const theme = useContext(themeContext)
  const [reportedContent, setReportedContent] = useState([]);
  //)
  const {user} = useAuth();
  //console.log(timestamp)
   const openMenu = () => setVisible(true)

    const closeMenu = () => setVisible(false)
    useEffect(() => {
      const getData = async() => {
        let unsub;
        unsub = onSnapshot(doc(db, "profiles", user.uid), (doc) => { 
              setReportedContent(doc.data().reportedPosts)
      });
      return unsub;
      }
      getData();
    }, [onSnapshot])
    //console.log(id)
    async function deletePost(id){ 
      //console.log(id)
      Alert.alert('Delete Re-vibe', 'Are You Sure You Want to Delete This Re-vibe?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: async() => {
      try {
    const response = await fetch(`${BACKEND_URL}/api/deleteRePost`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {id: id, user: user.uid}}), // Send data as needed
    })
    const data = await response.json();
    if (data.done) {
      navigation.goBack()
    }
  } catch (error) {
    console.error('Error:', error);
  }
      }},
    ]);
      
    //console.log(id)
        
    }
    function getHour(timestamp) {
      let milliseconds = timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000);
      let currentTime = new Date()
      let yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1);
      let currentHour = currentTime.getHours()
      var t = new Date(Date.UTC(1970, 0, 1)); // Epoch
      t.setUTCSeconds(timestamp.seconds);
      const date = new Date(t);
      let newTimestamp = new Date(milliseconds)
      let timestampHour = newTimestamp.getHours()
      if  (date.getTime() <= yesterday.getTime() && timestampHour <= currentHour) {
        return false
        
        }
        else {
          return true
        }
      
    }
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium
  });
  
  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  //console.log(name)
  //console.log(postArray ? postArray[0].text : null)
  return (

    <View style={[styles.innerContainer, {backgroundColor: theme.backgroundColor}, style]}>
      {backButton ? 
      <TouchableOpacity style={{alignItems: 'center', marginTop: '3%', marginLeft: '5%'}} onPress={() => navigation.goBack()}>
      <MaterialCommunityIcons name='chevron-left' size={35} style={{alignSelf: 'center'}} color={theme.color}/> 
      </TouchableOpacity>
      : null}
      <View style={backButton ? {flexDirection: 'row', alignItems: 'center', marginLeft: '5%'} : {flexDirection: 'row', alignItems: 'center'}}>
      <View style={{marginTop: '3%', marginLeft: '5%'}}>
        <FastImage source={require('../assets/DarkMode5.png')} style={{height: 27.5, width: 68.75}}/>
      </View>
              
              <Text style={backButton ? {fontSize: 37.5, fontWeight: '200', color: theme.theme != 'light' ? "#9EDAFF" : "#005278", marginLeft: '5%'} :
               {fontSize: 37.5, fontWeight: '200', color: theme.theme != 'light' ? "#9EDAFF" : "#005278", marginLeft: '5%'}}>|</Text>
                <Text numberOfLines={1} style={[styles.header, {fontFamily: 'Montserrat_500Medium', color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>{text}</Text>
                </View>
                {post ? 
                <Menu 
                visible={visible}
                onDismiss={closeMenu}
                contentStyle={{backgroundColor: theme.backgroundColor, borderWidth: 1, borderColor: "#71797E"}}
                anchor={<Entypo name='dots-three-vertical' size={25} color={theme.color} style={{paddingTop: '3.5%'}} onPress={openMenu}/>}>
                {name == user.uid ? <Menu.Item title="Delete" titleStyle={{color: theme.color}} onPress={() => deletePost(actualPost)}/> : null}
                  {!reportedContent.includes(id) ? <Menu.Item title="Report" titleStyle={{color: theme.color}} onPress={() => navigation.navigate('ReportPage', {id: id, comment: null, cliqueId: null, video: false, post: true, theme: false, comments: false, message: false, cliqueMessage: false, reportedUser: userId})}/> : null}
              </Menu>
               : null
                }
          </View>
  )
}

export default RepostThemeHeader

const styles = StyleSheet.create({
    innerContainer:{
        marginTop: '8%',
      marginBottom: '2.5%',
      //marginLeft: '10%',
      marginRight: '5%',
      justifyContent: 'space-evenly',
      flexDirection: 'row',
      alignItems: 'center',
    },
    header: {
        fontSize: 19.20,
        padding: 10,
        paddingLeft: 0,
        marginTop: 8,
        
        width: '60%',
        marginLeft: '5%',
        fontFamily: 'Montserrat_500Medium'
    },

})