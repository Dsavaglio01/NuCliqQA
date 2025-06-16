import { FlatList, StyleSheet, Text, View, Alert, TextInput, KeyboardAvoidingView, ActivityIndicator} from 'react-native'
import React, { useState, useMemo, useEffect, useContext} from 'react'
import useAuth from '../Hooks/useAuth';
import { db } from '../firebase';
import { collection, getDoc, setDoc, doc, addDoc, serverTimestamp, updateDoc, arrayUnion } from 'firebase/firestore';
import FastImage from 'react-native-fast-image';
import {MaterialCommunityIcons} from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import NextButton from './NextButton';
import ProfileContext from '../lib/profileContext';
import { fetchLimitedFriends, fetchLimitedFriendsInfo } from '../firebaseUtils';
import { schedulePushThemeNotification, schedulePushPostNotification } from '../notificationFunctions';
const SendingModal = ({route}) => {
    const {video, payload, payloadUsername, theme} = route.params;
    const [friends, setFriends] = useState([]);
    const [alert, setAlert] = useState(false);
    const [completeFriends, setCompleteFriends] = useState([]);
    const navigation = useNavigation();
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);
    const [actuallySending, setActuallySending] = useState(false);
    const [person, setPerson] = useState(null);
    const [friendsInfo, setFriendsInfo] = useState([]);
    const [ableToShare, setAbleToShare] = useState(true);
    const profile = useContext(ProfileContext);
    const {user} = useAuth();
    useMemo(() => {
      const fetchFriends = async() => {
        const completeFriendsArray = await fetchLimitedFriendsInfo(friends);
        setCompleteFriends(completeFriendsArray)
      } 
      fetchFriends();
    }, [friends])
    useEffect(() => {
      if (alert){
        Alert.alert("Message Sent", "Your message has been sent!", [
          {text: 'OK', onPress: () => {navigation.goBack(); setAlert(false)}},
        ])
      }
    }, [alert])
    function addPostToChatter() {
      if (ableToShare) {
        setSendLoading(true)
        Promise.all(friendsInfo.map(async(item) => {
        if (item.checked == true && payload && video && !theme) {
          const friendId = completeFriends.filter((element) => element.id.includes(item.id))
          const docRef = await addDoc(collection(db, 'friends', friendId[0].id, 'chats'), {
        message: {post: payload, userName: payloadUsername, text: caption},
        liked: false,
        toUser: item.id,
        user: user.uid,
        firstName: item.firstName,
        video: true,
        lastName: item.lastName,
        pfp: item.pfp,
        indirectReply: false,
        indirectReplyTo: "",
        readBy: [],
        timestamp: serverTimestamp()
    })
    addDoc(collection(db, 'friends', friendId[0].id, 'messageNotifications'), {
      //message: true,
      id: docRef.id,
      readBy: [],
      timestamp: serverTimestamp()
    }).then(async() => await updateDoc(doc(db, 'profiles', item.id), {
      messageNotifications: arrayUnion({id: docRef.id, user: user.uid})
    })).then(async() => await updateDoc(doc(db, 'friends', friendId[0].id), {
      lastMessage: {post: payload, userName: payloadUsername, text: caption},
      messageId: docRef.id,
      readBy: [],
      video: true,
      active: true,
      lastMessageTimestamp: serverTimestamp()
    }
    )).then(() => setActuallySending(false)).then(() => setAlert(true)).then(() => setSendLoading(false)).then(() => schedulePushPostNotification(person, friendId[0].id, profile.firstName, profile.lastName, payload.username, person.notificationToken))
        } 
        else if (item.checked == true && payload && !video && !theme) {
          const friendId = completeFriends.filter((element) => element.id.includes(item.id))
          const docRef = await addDoc(collection(db, 'friends', friendId[0].id, 'chats'), {
        message: {post: payload, userName: payloadUsername, text: caption},
        liked: false,
        toUser: item.id,
        user: user.uid,
        firstName: item.firstName,
        lastName: item.lastName,
        pfp: item.pfp,
        indirectReply: false,
        indirectReplyTo: "",
        readBy: [],
        timestamp: serverTimestamp()
    })
    addDoc(collection(db, 'friends', friendId[0].id, 'messageNotifications'), {
      //message: true,
      id: docRef.id,
      readBy: [],
      timestamp: serverTimestamp()
    }).then(async() => await updateDoc(doc(db, 'profiles', item.id), {
      messageNotifications: arrayUnion({id: docRef.id, user: user.uid})
    })).then(async() => await updateDoc(doc(db, 'friends', friendId[0].id), {
      lastMessage: {post: payload, userName: payloadUsername, text: caption},
      messageId: docRef.id,
      readBy: [],
      active: true,
      lastMessageTimestamp: serverTimestamp()
    }
    )).then(() => setActuallySending(false)).then(() => setAlert(true)).then(() => setSendLoading(false)).then(() => schedulePushPostNotification(person, friendId[0].id, profile.firstName, profile.lastName, payload.username, person.notificationToken))
        } 
      else if (item.checked == true && theme && payload) {
        const friendId = completeFriends.filter((element) => element.id.includes(item.id))
          const docRef = await addDoc(collection(db, 'friends', friendId[0].id, 'chats'), {
       message: {theme: payload, text: caption},
        liked: false,
        toUser: item.id,
        user: user.uid,
        firstName: item.firstName,
        lastName: item.lastName,
        pfp: item.pfp,
        indirectReply: false,
        indirectReplyTo: "",
        readBy: [],
        timestamp: serverTimestamp()
    })
    addDoc(collection(db, 'friends', friendId[0].id, 'messageNotifications'), {
      //message: true,
      id: docRef.id,
      toUser: item.id,
      readBy: [],
      timestamp: serverTimestamp()
    }).then(async() => await updateDoc(doc(db, 'profiles', item.id), {
      messageNotifications: arrayUnion({id: docRef.id, user: user.uid})
    })).then(async() => await setDoc(doc(db, 'friends', friendId[0].id), {
      lastMessage: {theme: theme, text: caption},
      messageId: docRef.id,
      readBy: [],
      active: true,
      lastMessageTimestamp: serverTimestamp()
    }
    )).then(() => setActuallySending(false)).then(() => setAlert(true)).then(() => setSendLoading(false)).then(() => schedulePushThemeNotification(person, friendId[0].id, profile.firstName, profile.lastName, person.notificationToken))
      }
      }))
      
      }
      else {
        Alert.alert('Post unavailable to share')
      }
      
    }
    useMemo(()=> {
      setFriends([])
      setLoading(true)
      const fetchData = async() => {
        const { friendsArray } = await fetchLimitedFriends(user.uid, profile.followers, profile.following)
        setFriends(friendsArray)
      }
      fetchData();
    }, [profile]);

    useMemo(() => {
      if (friends.length > 0) {
        Promise.all(friends.map(async(item) => await getDoc(doc(db, 'profiles', item.id))))
      .then(snapshots => {
        setFriendsInfo(snapshots.map(snapshot => ({id: snapshot.id, ...snapshot.data(), checked: false})))
        setTimeout(() => {
          setLoading(false)
        }, 750);
      })
      .catch(error => {
       console.error(error)
      });
      }
      else {
        setTimeout(() => {
          setLoading(false)
        }, 750);
      }
    }, [friends])
    const renderChecked = (id) => {
        
        let list = friendsInfo
      //console.log(list[id])
      let index = list.indexOf(id)
      //console.log(index)
      list[index].checked = !list[index].checked
      const result = friends.filter((element) => 
      {if (element.friendId != undefined) {
        return element.friendId.includes(list[index].id)
      }
      })
      //console.log(result[0].friendId)
      if (list[index].checked) {
        setActuallySending(true)
        setPerson(list[index])
      }
      else {
        if (list.every(obj => !obj.checked)) {
          setActuallySending(false)
        }
        
      }
      var newList = list.slice()
      setFriendsInfo(newList)
      
      
    }
    const renderFriends = ({item, index}) => {
      return (
          <View key={index} style={{width: '30%', margin: 5}}>
            <TouchableOpacity  onPress={() => renderChecked(item)}>
                <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 55, width: 55, borderRadius: 55, alignSelf: 'center'}}/>
                {item.checked ? <MaterialCommunityIcons name='check' size={20} color={"#9edaff"} style={{position: 'relative', bottom: 20, left: 80}}/> : null}
                <Text numberOfLines={1} style={item.checked ? [styles.usernameText, {marginTop: -10}] : styles.usernameText}>{item.userName}</Text>
            </TouchableOpacity>
          </View>
      )
    }
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Share With: </Text>
        <MaterialCommunityIcons name='close' size={30} color={"#fafafa"} style={{marginLeft: 'auto'}} onPress={() => navigation.goBack()}/>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0} style={{flex: 1}}>
        {friendsInfo.length > 0 && !loading ? 
          <FlatList 
            data={friendsInfo}
            renderItem={renderFriends}
            numColumns={3}
            ListFooterComponent={<View style={{paddingBottom: 75}}/>}
            contentContainerStyle={{marginVertical: '2.5%'}}
          /> : !loading ?
          <View style={styles.noPostsContainer}>
            <Text style={styles.noPostsText}>No Friends to Share with Yet!</Text>
          </View> : 
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator color={"#9edaff"}/>
          </View>
          
          }
          {/* <View style={styles.buttonContainer}>
            <NextButton text={"Add to Story"}/>
          </View> */}
          {actuallySending ?
            <View style={styles.addCommentSecondContainer}>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} autoFocus={true} returnKeyType='send' placeholder={"Add message..."} placeholderTextColor={"#fafafa"}
                  maxLength={200} value={caption} onChangeText={setCaption}/>
                <View style={{marginBottom: 10}}>
                  {sendLoading ? <ActivityIndicator color={"#9edaff"} style={{alignSelf: 'center'}}/> : 
                  <NextButton text={"Send"} onPress={() => addPostToChatter()}/>}
                </View>
              </View> 
            </View> 
          : null}
        </KeyboardAvoidingView>
    </View>
  )
}

export default SendingModal

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212"
        //height: 300
    },
    headerContainer: {
      flexDirection: 'row', 
      marginTop: '5%', 
      marginHorizontal: '5%'
    },
    header: {
      fontFamily: 'Montserrat_600SemiBold',
      fontSize: 19.20,
      color: "#fafafa",
      marginLeft: 'auto'
    },
    usernameText: {
      fontFamily: 'Montserrat_500Medium',
      fontSize: 12.29,
      color: "#fafafa",
      alignSelf: 'center',
      padding: 5
    },
    addCommentSecondContainer: {
      justifyContent: 'flex-end',
      marginBottom: '10%',
      alignItems: 'flex-end',
      borderColor: "#fafafa",
      width: '100%',
    },
    inputContainer: {
      flexDirection: 'column', 
      marginHorizontal: '5%', 
      width: '90%'
    },
    input: {
      borderTopWidth: 0.25,
      marginTop: 0,
      borderColor: "#fafafa", 
      color: "#fafafa", 
      padding: 20, 
      marginLeft: '-5%', 
      width: '110%'
    },
    noPostsText: {
      fontFamily: 'Montserrat_500Medium',
      fontSize: 24,
      margin: '5%',
      color: "#fafafa"
    },
    noPostsContainer: {
      flex: 1, 
      marginTop: '-33%',
      alignItems: 'center', 
      justifyContent: 'center'
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      margin: '5%',
      marginBottom: '7.5%'
    }
})