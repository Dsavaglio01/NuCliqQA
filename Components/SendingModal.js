import { FlatList, StyleSheet, Text, View, Alert, TextInput, KeyboardAvoidingView} from 'react-native'
import React, { useState, useMemo, useEffect} from 'react'
import useAuth from '../Hooks/useAuth';
import { db } from '../firebase';
import { onSnapshot, query, collection, where, orderBy, limit, getDoc, setDoc, doc, addDoc, serverTimestamp, updateDoc, arrayUnion } from 'firebase/firestore';
import FastImage from 'react-native-fast-image';
import {MaterialCommunityIcons} from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {BACKEND_URL} from '@env';
import NextButton from './NextButton';
const SendingModal = ({route}) => {
    const {video, payload, payloadUsername, theme} = route.params;
    const [friends, setFriends] = useState([]);
    const [alert, setAlert] = useState(false);
    const [completeFriends, setCompleteFriends] = useState([]);
    const navigation = useNavigation();
    
    const [caption, setCaption] = useState('');
    const [following, setFollowing] = useState([])
    const [followers, setFollowers] = useState([]);
    const [actuallySending, setActuallySending] = useState(false);
    const [person, setPerson] = useState(null);
    const [sendingFriend, setSendingFriend] = useState(null);
    const [friendsInfo, setFriendsInfo] = useState([]);
    const [ableToShare, setAbleToShare] = useState(true);
    const [lastVisible, setLastVisible] = useState(null);
    const {user} = useAuth();
     async function schedulePushThemeNotification(item, friendId, firstName, lastName, notificationToken) {
      //console.log(firstName, lastName, notificationToken)
      let notis = (await getDoc(doc(db, 'profiles', item.id))).data().allowNotifications
      const deepLink = `nucliqv1://PersonalChat?person=${item}&friendId=${friendId}`;
     let banned = (await getDoc(doc(db, 'profiles', item.id))).data().banned
      if (notis && !banned) {
        fetch(`${BACKEND_URL}/api/sentThemeNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: firstName, lastName: lastName, pushToken: notificationToken, "content-available": 1, data: {routeName: 'PersonalChat', person: item, friendId: friendId, deepLink: deepLink}
      }),
      })
    .then(response => response.json())
    .then(responseData => {
      // Handle the response from the server
      console.log(responseData);
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error(error);
    })
  }
    }
    async function schedulePushPostNotification(item, friendId, firstName, lastName, username, notificationToken) {
      let notis = (await getDoc(doc(db, 'profiles', item.id))).data().allowNotifications
      const deepLink = `nucliqv1://PersonalChat?person=${item}&friendId=${friendId}`;
      let banned = (await getDoc(doc(db, 'profiles', item.id))).data().banned
      if (notis && !banned) {
        fetch(`${BACKEND_URL}/api/postNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: firstName, lastName: lastName, username: username, pushToken: notificationToken, "content-available": 1, data: {routeName: 'PersonalChat', person: item, friendId: friendId, deepLink: deepLink}
      }),
      })
    .then(response => response.json())
    .then(responseData => {
      // Handle the response from the server
      console.log(responseData);
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error(error);
    })
  }
    }
    useMemo(() => {
      
      Promise.all(friends.map(async(item) => await getDoc(doc(db, 'friends', item.friendId))))
      .then(snapshots => {
        setCompleteFriends(snapshots.map(snapshot => ({id: snapshot.id, ...snapshot.data()})))
      })
      .catch(error => {
        // Handle errors
      });
    }, [friends])
    useEffect(() => {
        const getData = async() => {
           const docSnap = await getDoc(doc(db, 'profiles', user.uid))
           setFollowing(docSnap.data().following)
           setFollowers(docSnap.data().followers)
        }
        getData()
    }, [])
    //console.log(followers)
    useEffect(() => {
        if (alert){
        Alert.alert("Message Sent", "Your message has been sent!", [
      
      {text: 'OK', onPress: () => {navigation.goBack(); setAlert(false)}},
    ])
}
    }, [alert])
    function addPostToChatter() {
      if (ableToShare) {
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
    )).then(() => setActuallySending(false)).then(() => setAlert(true)).then(() => schedulePushPostNotification(person, friendId[0].id, firstName, lastName, payload.username, person.notificationToken))
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
    )).then(() => setActuallySending(false)).then(() => setAlert(true)).then(() => schedulePushPostNotification(person, friendId[0].id, firstName, lastName, payload.username, person.notificationToken))
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
    )).then(() => setActuallySending(false)).then(() => setAlert(true)).then(() => schedulePushThemeNotification(person, friendId[0].id,firstName, lastName, person.notificationToken))
      }
      }))
      
      }
      else {
        Alert.alert('Post unavailable to share')
      }
      
      
    }
    //console.log(followers)
    useMemo(()=> {
      setFriends([])
      let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'friends'), where('actualFriend', '==', true), orderBy('lastMessageTimestamp', 'desc'), limit(20)), (snapshot) => {
          setFriends(snapshot.docs.filter((doc => followers.includes(doc.id) && following.includes(doc.id))).map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
           setLastVisible(snapshot.docs[snapshot.docs.length - 1])
        })
       
      } 
      fetchCards();
      return unsub;
    }, [followers, following]);

    useMemo(() => {
      if (friends.length > 0) {
        Promise.all(friends.map(async(item) => await getDoc(doc(db, 'profiles', item.id))))
      .then(snapshots => {
        setFriendsInfo(snapshots.map(snapshot => ({id: snapshot.id, ...snapshot.data(), checked: false})))
      })
      .catch(error => {
       console.error(error)
      });
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
        setSendingFriend(result[0].friendId)
        setPerson(list[index])
      }
      else {
        if (list.every(obj => !obj.checked)) {
          setActuallySending(false)
        setSendingFriend(null)
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
        {friendsInfo.length > 0 ? 
          <FlatList 
            data={friendsInfo}
            renderItem={renderFriends}
            numColumns={3}
            ListFooterComponent={<View style={{paddingBottom: 75}}/>}
            contentContainerStyle={{marginVertical: '2.5%'}}
          /> : 
          <View style={styles.noPostsContainer}>
            <Text style={styles.noPostsText}>No Friends to Share with Yet!</Text>
          </View>}
          <View style={styles.buttonContainer}>
            <NextButton text={"Add to Story"}/>
            <NextButton text={"Re-Vibe"}/>
          </View>
          {actuallySending ?
            <View style={styles.addCommentSecondContainer}>
              <View style={{flexDirection: 'column', marginHorizontal: '5%', width: '90%'}}>
                    <TextInput style={[styles.input, {borderColor: "#fafafa", color: "#fafafa", padding: 20, marginLeft: '-5%', width: '110%'}]} autoFocus={true} returnKeyType='send' placeholder={"Add message..."} placeholderTextColor={"#fafafa"} maxLength={200} value={caption} onChangeText={setCaption}/>
                  <View style={{marginBottom: 10}}>
                    <NextButton text={"Send"} onPress={() => addPostToChatter()}/>
                    </View>
                  </View> 
                </View> : null}
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
    input: {
      borderTopWidth: 0.25,
      padding: 15,
      marginTop: 0,
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