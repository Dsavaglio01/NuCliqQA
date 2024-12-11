import { ActivityIndicator, StyleSheet, Text, View, Image, FlatList, Platform, TouchableOpacity, TextInput, KeyboardAvoidingView, Alert} from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import ThemeHeader from '../Components/ThemeHeader'
import { Divider } from 'react-native-paper'
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import NextButton from '../Components/NextButton';
import { Swipeable } from 'react-native-gesture-handler';
import { db } from '../firebase';
import { getDoc, doc, addDoc, serverTimestamp, collection, setDoc, deleteDoc, arrayUnion, updateDoc} from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import {BACKEND_URL} from "@env"
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
const AdminContacts = ({route}) => {
    let row = [];
    let prevOpenedRow;
    const {contacts, id, admins, name} = route.params
    const [data, setData] = useState([])
    const [caption, setCaption] = useState('')
    const [currentFeedback, setCurrentFeedback] = useState('');
    const [currentId, setCurrentId] = useState();
    const [channelId, setChannelId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [username, setUsername] = useState('');
    const [pfp, setPfp] = useState(null);
  const [lastName, setLastName] = useState('');
    const {user} = useAuth();
    const [responseUsername, setResponseUsername] = useState('');
    const [adminNotificationTokens, setAdminNotificationTokens] = useState([]);
    const [responseUserId, setResponseUserId] = useState();
    const [actuallySending, setActuallySending] = useState(false);
    const navigation = useNavigation();
    async function deleteContact(item) {
      setData(data.filter(e => e.id !== item))
      await deleteDoc(doc(db, 'groups', id, 'adminContacts', item))
    }
    useEffect(() => {
    const getUsername = async() => {
      const nameOfUser = (await getDoc(doc(db, 'profiles', user.uid)))
      setUsername(nameOfUser.data().userName)
      setFirstName(nameOfUser.data().firstName)
      setLastName(nameOfUser.data().lastName)
      setPfp(nameOfUser.data().pfp)
    }
    getUsername()
  }, [])
  
    useEffect(() => {
        contacts.map(async(item) => {
            let pfp = await (await getDoc(doc(db, 'profiles', item.userId))).data().pfp
            let username = await (await getDoc(doc(db, 'profiles', item.userId))).data().userName
            //let pfp = await getDoc(doc(db, 'profiles', item.data.userId)).data().pfp
            //let username = await getDoc(doc(db, 'profiles', item.data.userId)).data().userName
            setData(prevState => [...prevState, {id: item.id, data: item, user: {pfp: pfp, username: username}}])
            //console.log(item.data.userId)
        })
        setTimeout(() => {
            setLoading(false)
        }, 1000);
    }, [route.params?.contacts])
    useEffect(() => {
     admins.map(async(item) => {
        const docSnap = await getDoc(doc(db, 'profiles', item))
        setAdminNotificationTokens(prevState => [...prevState, {id: item, notificationToken: docSnap.data().notificationToken}])
        })
        setTimeout(() => {
            setLoading(false)
        }, 1000);
    }, [route.params?.admins])
    async function schedulePushTextNotification(id, firstName, lastName, message, notificationToken, clique, channel) {
      console.log(currentFeedback)
       let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
       if (notis) {
      fetch(`${BACKEND_URL}/api/textCliqueNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: firstName, lastName: lastName, clique: clique, channel: channel,
        message: message, pushToken: notificationToken, "content-available": 1
      }),
      })

      .then(response => response.json())
      .then(responseData => {
      // Handle the response from the server
      //console.log(responseData);
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error(error);
    })
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
    const renderContact = ({item, index}, onClick) => {
        //console.log(item.userId)
        const closeRow = (index) => {
      //onsole.log('closerow');
      if (prevOpenedRow && prevOpenedRow !== row[index]) {
        prevOpenedRow.close();
      }
      prevOpenedRow = row[index];
    };

    const renderRightActions = (progress, dragX, onClick) => {
      return (
        <TouchableOpacity
          style={{
            margin: 0,
            alignContent: 'center',
            justifyContent: 'center',
            width: 70,
          }} onPress={() => deleteContact(item.id)}>
          <MaterialIcons name='delete-outline' size={35} style={{alignSelf: 'center', paddingBottom: 10}} color="red"/>
        </TouchableOpacity>
      );
    };
    return (
        <Swipeable renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, onClick)
        }
        onSwipeableOpen={() => closeRow(index)}
        ref={(ref) => (row[index] = ref)}
        rightOpenValue={-100}>
        <View key={index} style={{marginTop: '2.5%', flexDirection: 'row', paddingBottom: 10}}>
        <TouchableOpacity style={{flexDirection: 'column', alignItems: 'center'}} onPress={item.userId ? () => navigation.navigate('ViewingProfile', {name: item.userId, viewing: true}) : null}>
          {item.user.pfp ? <FastImage source={{uri: item.user.pfp}} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/> 
          : <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
          }
          <Text numberOfLines={1} style={[styles.addText, {fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}]}>@{item.user.username}</Text>
        </TouchableOpacity>
        <View style={{alignItems: 'center', flexDirection: 'row'}}>
          <View style={{marginLeft: '2.5%', width: '45%'}}>
            <Text numberOfLines={2} style={[styles.addText, {paddingRight: 0}]}>{item.data.feedback}</Text>
          </View>
          <View style={{marginLeft: 'auto'}}>
                <NextButton text={"Respond"} textStyle={{fontSize: 12.29, fontFamily: 'Montserrat_500Medium', padding: 7.5}} onPress={() => {setActuallySending(true); setCurrentId(item.id); setCurrentFeedback(item.data.feedback); setResponseUsername(item.user.username); setResponseUserId(item.data.userId)}}/>
          </View>
        </View>
        </View>
        </Swipeable>
    )
    }
    async function sendFeedback() {
      const docSnap = await getDoc(doc(db, 'groups', id))
      if (!docSnap.exists()) {
        Alert.alert('Cliq unavailable to respond to user')
      }
      else {
      if (responseUserId != undefined && currentFeedback.length > 0 && currentId != undefined) {
      const secondUsername = (await getDoc(doc(db, 'profiles', responseUserId))).data().userName
      const secondPfp = (await getDoc(doc(db,'profiles', responseUserId))).data().pfp
      const chatRef = await addDoc(collection(db, 'groups', id, 'channels'), {
      lastMessage: {text: caption} ,
      lastMessageTimestamp: serverTimestamp(),
      members: [user.uid, responseUserId],
      name: username,
      secondName: secondUsername,
      security: 'private',
      timestamp: serverTimestamp(),
      invite: true,
      pfp: pfp,
      secondPfp: secondPfp,
      to: responseUserId,
      from: user.uid,
      requests: [],
      member_count: 1,
      allowNotifications: [user.uid, responseUserId],
      admins: [user.uid, responseUserId]
    })
    addDoc(collection(db, 'groups', id, 'channels', chatRef.id, 'chats'), {
        message: {text: currentFeedback},
        likedBy: [],
        user: responseUserId,
        toUser: user.uid,
        received: false,
        indirectReply: false,
        indirectReplyTo: null,
        timestamp: serverTimestamp()
    }).then(() => addDoc(collection(db, 'groups', id, 'channels', chatRef.id, 'chats'), {
        message: {text: caption},
        likedBy: [],
        user: user.uid,
        toUser: responseUserId,
        received: false,
        indirectReply: false,
        indirectReplyTo: null,
        timestamp: serverTimestamp()
    })).then(async() => await updateDoc(doc(db, 'profiles', user.uid, 'channels', id), {
                    channelsJoined: arrayUnion(chatRef.id)
                })).then(async() => await updateDoc(doc(db, 'profiles', responseUserId, 'channels', id), {
                    channelsJoined: arrayUnion(chatRef.id)
                })).then(() => deleteContact(currentId)).then(() => adminNotificationTokens.map(async(item) => {
      await addDoc(collection(db, 'groups', id, 'notifications', item.id, 'messageNotifications'), {
      id: chatRef.id,
      user: user.uid,
      channelId: responseUserId,
      readBy: [],
      timestamp: serverTimestamp()
    }).then(() => schedulePushTextNotification(responseUserId, firstName, lastName, currentFeedback, item.notificationToken, name, username))
      
    })) 
    setData(data.filter(item => item.id !== currentId))
    setActuallySending(false)
      }
    }
    }
  return (
    <View style={styles.container}>
      <ThemeHeader text={"Admin Contacts"} video={false} backButton={true}/>
      <Divider borderBottomWidth={0.4}/>
        {loading ? <View style={styles.noDataContainer}>
        <ActivityIndicator size={'large'} color={"#005278"}/> 
        </View>
        : data.length > 0 ? 
        <KeyboardAvoidingView  behavior={Platform.OS === 'ios' ? 'padding' : 'height'} contentContainerStyle={{flex: 1}} style={{flex: 1, zIndex: 0, marginLeft: '2.5%', marginRight: '2.5%', marginBottom: '15%'}}>
            <Text style={styles.totalText}>Total no. of admin feedback: {data.length}</Text>
            <FlatList data={data}
            renderItem={renderContact}
            keyExtractor={(item) => item.id}
            style={{height: '55%'}}
            ItemSeparatorComponent={<View style={{backgroundColor: '#000', height: 0.6,}} />}
            />
            {actuallySending ? <View style={{justifyContent: 'flex-end', width: '75%', marginHorizontal: '15%'}}>
          <TextInput style={styles.input} placeholder={`Responding to @${responseUsername}...`} placeholderTextColor={"#000"} returnKeyType='send' onSubmitEditing={caption.length > 0 ? () => sendFeedback() : null} maxLength={200} value={caption} onChangeText={setCaption}/>
        </View> : null}
        </KeyboardAvoidingView> : data.length == 0 ? <View style={styles.noDataContainer}>
            <Text style={styles.noData}>No feedback to respond to at the moment! </Text>
            <MaterialCommunityIcons name='emoticon-happy-outline' size={50} style={{alignSelf: 'center', marginTop: '5%'}}/>
        </View> : <View style={{flex: 1, alignItems: 'center', justifyContent:'center'}}>
        <ActivityIndicator size={'large'} color={"#005278"}/> 
        </View>}
    </View>
  )
}

export default AdminContacts

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    noData: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '40%'
    },
    addText: {
        fontSize: 12.29,
      color: "#090909",
      padding: 5,
      fontFamily: 'Montserrat_500Medium',
      //width: '100%'
      //paddingLeft: 15,
    },
    totalText: {
         fontSize: 19.20,
      color: "#090909",
      padding: 5,
      textAlign: 'center',
      marginTop: '2.5%',
      fontFamily: 'Montserrat_500Medium',
    },
    input: {
      borderTopWidth: 2,
      width: '145%',
      marginLeft: '-24%',
      padding: 15,
      paddingLeft: 35,
      margin: '2.5%',
      marginTop: 0
      //backgroundColor: 'red'
    },
})