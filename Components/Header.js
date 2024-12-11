import { StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native'
import React, {useState, useEffect} from 'react'
import { Menu, Divider } from 'react-native-paper'
import {MaterialCommunityIcons, Ionicons} from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import FollowIcon from './FollowIcon'
import useAuth from '../Hooks/useAuth'
import { db } from '../firebase'
import { collection, getCountFromServer, limit,  onSnapshot, query, where} from 'firebase/firestore'
import MainLogo from './MainLogo'
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat'
const Header = ({searching, all, following, meet, notification, text, titleStyle, actuallyMeet, reload}) => {
    const [visible, setVisible] = useState(false);
    const [messages, setMessages] = useState([]);
    const [messageNotifications, setMessageNotifications] = useState([]);
    const [notifications, setNotifications] = useState(false)
    const [nonMessageNotifications, setNonMessageNotifications] = useState([]);
    const {user} = useAuth();
    const openMenu = () => setVisible(true)
    const closeMenu = () => setVisible(false)
    const navigation = useNavigation()
    const sendReloadDataBack = () => {
      reload(true)
    }
    const sendSearchingDataBack = () => {
        searching(true)
    }
    const sendFollowingDataBack = () => {
      following(true);
      notification(false);
      meet(false);
    }
    const sendMeetDataBack = () => {
      following(false);
      notification(false);
      meet(true);
    }
    useEffect(() => {
      const q = query(collection(db, "profiles", user.uid, 'checkNotifications'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        //console.log(querySnapshot)
        const cities = [];
        querySnapshot.forEach((doc) => {
          //console.log(doc.id)
            cities.push(doc.id);
        });
        setNonMessageNotifications(cities.length)
      });
      return unsubscribe;
    }, [])
    useEffect(() => {
          let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'friends'), where('users', 'array-contains', user.uid)), (snapshot) => {
          setMessages(snapshot.docs.map((doc)=> ( {
          id: doc.id
          })))
        })
      } 
      fetchCards();
      return unsub;
    }, [])
    useEffect(() => {
      if (messages.length > 0) {
        messages.map((item) => {
        let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'friends', item.id, 'messageNotifications'), where('toUser', '==', user.uid)), (snapshot) => {
          setMessageNotifications(snapshot.docs.map((doc)=> ( {
          id: doc.id
          })))
        })
      } 
      fetchCards();
      return unsub;
      })
      }
    }, [messages])
    //console.log(messageNotifications)
    useEffect(() => {
      if (messageNotifications > 0 || nonMessageNotifications > 0) {
        //console.log('first')
        setNotifications(true)
      }
      else {
        setNotifications(false)
      }
    }, [messageNotifications, nonMessageNotifications])
    //console.log(messages)
    //console.log(messageNotifications)
    //const [searching, setSearching] = useState(false)
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={styles.innerContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <View style={{marginTop: '3%'}}>
        <MainLogo />
      </View>
              
              <Text style={{fontSize: 37.5, fontWeight: '200', color: "#005278", marginLeft: '5%'}}>|</Text>
                <Text numberOfLines={1} style={[styles.header, {fontSize: 24, fontFamily: 'Montserrat_500Medium'}]}>{text}</Text>
                </View>
            {/* <Image source={require('../assets/BrandLogo.png')} style={{height: 55, width: 150, marginTop: 15, marginBottom: 0, marginLeft: '5%', alignSelf: 'center'}}/> */}
            <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: 10, justifyContent: 'space-between', width: 110, marginRight: '5%'}}>
              <Ionicons name='search' size={27.5} color="#000" style={{alignSelf: 'center'}} onPress={sendSearchingDataBack}/>
              {notifications ? 
              <MaterialCommunityIcons name='bell-badge-outline' size={29.5} color="#005e1c" style={{alignSelf: 'center', marginTop: 1}} onPress={() => navigation.navigate('Chat', {sending: false })}/> :
              <MaterialCommunityIcons name='bell-outline' size={29.5} color="#000" style={{alignSelf: 'center', marginTop: 1}} onPress={() => navigation.navigate('Chat', {sending: false})}/>
              }
              
              <Menu 
                visible={visible}
                onDismiss={closeMenu}
                contentStyle={{backgroundColor: "#fff"}}
                anchor={<MaterialCommunityIcons name='chevron-down-circle-outline' size={28.5} color="#000" style={{alignSelf: 'center', marginTop: 2}} onPress={openMenu}/>}>
                <Menu.Item onPress={sendMeetDataBack} title="For You" titleStyle={actuallyMeet ? {color: "#005278"} : {color: "#000"}}/>
                <Divider />
                <Menu.Item onPress={sendFollowingDataBack} title="Friends Only" titleStyle={!actuallyMeet ? {color: "#005278"} : {color: "#000"}}/>
              </Menu>
            </View>
          </View>
  )
}

export default Header

const styles = StyleSheet.create({
    innerContainer: {
      marginTop: '8%',
      marginBottom: '2.5%',
      marginLeft: '14%',
      marginRight: '9%',
      justifyContent: 'space-evenly',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: "#fff"
    },
    header: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        //textAlign: 'center',
        color: "#005278",
        padding: 10,
        paddingLeft: 0,
        marginTop: 8,
        alignSelf: 'center',
        width: '60%',
        marginLeft: '5%',
    }
})