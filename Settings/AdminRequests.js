import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert, KeyboardAvoidingView, Image, FlatList, TextInput} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import { Divider } from 'react-native-paper'
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import RegisterHeader from '../Components/RegisterHeader';
import { useNavigation } from '@react-navigation/native';
import ThemeHeader from '../Components/ThemeHeader';
import NextButton from '../Components/NextButton';
import { Swipeable } from 'react-native-gesture-handler';
import MainButton from '../Components/MainButton';
import { db } from '../firebase';
import { getDoc, doc, updateDoc, arrayUnion, serverTimestamp, addDoc, collection, deleteDoc, setDoc} from 'firebase/firestore';
import FastImage from 'react-native-fast-image';
import useAuth from '../Hooks/useAuth';
import {BACKEND_URL} from "@env";
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
const AdminRequests = ({route}) => {
    let row = [];
    let prevOpenedRow;
    const {requests, groupId, admins} = route.params
    const theme = useContext(themeContext)
    const [data, setData] = useState([])
    const [caption, setCaption] = useState('')
    const {user} = useAuth();
    const [loading, setLoading] = useState(true);
     const [responseUserId, setResponseUserId] = useState();
     const [actuallySending, setActuallySending] = useState(false);
     const [currentFeedback, setCurrentFeedback] = useState('');
    const [currentId, setCurrentId] = useState();
    const [responseUsername, setResponseUsername] = useState('');
    const [adminNotificationTokens, setAdminNotificationTokens] = useState([]);
    const [firstName, setFirstName] = useState('');
    const [username, setUsername] = useState('');
  const [lastName, setLastName] = useState('');
    useEffect(() => {
     admins.map(async(item) => {
        const docSnap = await getDoc(doc(db, 'profiles', item))
        setAdminNotificationTokens(prevState => [...prevState, {id: item, notificationToken: docSnap.data().notificationToken}])
        })
        setTimeout(() => {
            setLoading(false)
        }, 1000);
    }, [route.params?.admins])
    useEffect(() => {
    const getUsername = async() => {
      const nameOfUser = (await getDoc(doc(db, 'profiles', user.uid)))
      setUsername(nameOfUser.data().userName)
      setFirstName(nameOfUser.data().firstName)
      setLastName(nameOfUser.data().lastName)
    }
    getUsername()
  }, [])
    useEffect(() => {
        requests.map(async(item) => {
            let pfp = await (await getDoc(doc(db, 'profiles', item.userId))).data().pfp
            let username = await (await getDoc(doc(db, 'profiles', item.userId))).data().userName
            setData(prevState => [...prevState, {id: item.id, data: item, user: {pfp: pfp, username: username}}])
        })
        setTimeout(() => {
            setLoading(false)
        }, 1000);
    }, [route.params?.requests])
    async function schedulePushTextNotification(id, firstName, lastName, message, notificationToken, clique, channel) {
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
    async function addAdmin(item) {
      const docSnap = await getDoc(doc(db, 'groups', groupId))
      if (!docSnap.exists()) {
        Alert.alert('Cliq unavailable to respond to user')
      }
      else {
      await updateDoc(doc(db, 'groups', groupId), {
        admins: arrayUnion(item.data.userId)
      }).then(async() => {
        await updateDoc(doc(db, 'profiles', item.data.userId), {
          adminGroups: arrayUnion(groupId)
        })
      }).then(() => deleteRequest(item.id))
    }
    }
    async function messageAdmin() {
    if (responseUserId != undefined && currentFeedback.length > 0 && currentId != undefined) {
      const secondUsername = (await getDoc(doc(db, 'profiles', responseUserId))).data().userName
      const chatRef = await addDoc(collection(db, 'groups', id, 'channels'), {
      lastMessage: {text: caption} ,
      lastMessageTimestamp: serverTimestamp(),
      members: [user.uid, responseUserId],
      name: username,
      secondName: secondUsername,
      security: 'private',
      timestamp: serverTimestamp(),
      invite: true,
      to: responseUserId,
      from: user.uid,
      requests: [],
      member_count: 1,
      allowNotifications: [user.uid, responseUserId],
      admins: [user.uid, responseUserId]
    })
    addDoc(collection(db, 'groups', groupId, 'channels', chatRef.id, 'chats'), {
        message: {text: currentFeedback},
        likedBy: [],
        user: responseUserId,
        toUser: user.uid,
        received: false,
        indirectReply: false,
        indirectReplyTo: null,
        timestamp: serverTimestamp()
    }).then(() => addDoc(collection(db, 'groups', groupId, 'channels', chatRef.id, 'chats'), {
        message: {text: caption},
        likedBy: [],
        user: user.uid,
        toUser: responseUserId,
        received: false,
        indirectReply: false,
        indirectReplyTo: null,
        timestamp: serverTimestamp()
    })).then(async() => await setDoc(doc(db, 'profiles', user.uid, 'channels', groupId), {
                    channelsJoined: arrayUnion(groupId)
                })).then(async() => await updateDoc(doc(db, 'profiles', responseUserId, 'channels', id), {
                    channelsJoined: arrayUnion(chatRef.id)
                })).then(() => deleteRequest(currentId)).then(() => adminNotificationTokens.map(async(item) => {
      await setDoc(doc(db, 'groups', groupId, 'notifications', item.id, 'messageNotifications'), {
      id: chatRef.id,
      user: user.uid,
      channelId: responseUserId,
      readBy: [],
      timestamp: serverTimestamp()
    }).then(() => schedulePushTextNotification(responseUserId, firstName, lastName, currentFeedback, item.notificationToken, false, true))
      
    })) 
    setData(data.filter(item => item.id !== currentId))
    setActuallySending(false)
      }

    }
    async function deleteRequest(item) {
      setData(data.filter(e => e.id !== item))
      await deleteDoc(doc(db, 'groups', groupId, 'adminRequests', item))
    }
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
    const renderRequest = ({item, index}, onClick) => {
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
          }} onPress={() => deleteRequest(item.id)}>
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
        <View style={{marginTop: '2.5%', marginHorizontal: '2.5%',flexDirection: 'row', paddingBottom: 10, width: '80%'}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {item.user.pfp ? <FastImage source={{uri: item.user.pfp}} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/> 
          : <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
          }
          
          <View style={{alignItems: 'center', width: '60%'}}>
            <Text numberOfLines={1} style={[styles.addText, {paddingBottom: 0}]}>@{item.user.username}</Text>
            <Text style={styles.addText}>Requested to be an admin</Text>
          </View>
          <View style={{flexDirection: 'column'}}>
            <View style={{marginBottom: '5%'}}>
                <NextButton text={"Accept"} textStyle={{fontSize: 12.29, padding: 7.5, fontFamily: 'Montserrat_500Medium'}} onPress={() => addAdmin(item)}/>
            </View>
          </View>
        </View>
        
        
        
        </View>
        </Swipeable>
    )
    }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <ThemeHeader text={"Admin Requests"} backButton={true}/>
        <Divider borderBottomWidth={0.4}/>
        {loading ? <View style={styles.noContentContainer}>
        <ActivityIndicator size={'large'} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View> : data.length > 0 ? 
         <KeyboardAvoidingView  behavior={Platform.OS === 'ios' ? 'padding' : 'height'} contentContainerStyle={{flex: 1}} style={{flex: 1, zIndex: 0, marginLeft: '2.5%', marginRight: '2.5%', marginBottom: '15%'}}>
        <Text style={[styles.totalText, {color: theme.color}]}>Total no. of admin requests: {data.length}</Text>
            <FlatList data={data}
            renderItem={renderRequest}
            keyExtractor={(item) => item.id}
            style={{flexGrow: 1}}
            ItemSeparatorComponent={<Divider borderBottomWidth={0.6}/>}
            ListFooterComponentStyle={<View style={{paddingBottom: 1000}}/>}
            />
            {actuallySending ? <View style={{justifyContent: 'flex-end', width: '75%', marginHorizontal: '15%'}}>
          <TextInput style={styles.input} onSubmitEditing={caption.length > 0 ? () => messageAdmin() : null} returnKeyType='send' placeholder={`Responding to @${responseUsername}...`} placeholderTextColor={"#000"}  maxLength={200} value={caption} onChangeText={setCaption}/>
        </View> : null}
        </KeyboardAvoidingView>
        : data.length == 0 ?
            <View style={styles.noContentContainer}>
                <Text style={[styles.noContentText, {color: theme.color}]}>No Admin Requests! Yay!</Text>
                <MaterialCommunityIcons name='emoticon-happy-outline' color={theme.color} size={50} style={{alignSelf: 'center', marginTop: '5%'}}/>
            </View> : <View style={styles.noContentContainer}>
        <ActivityIndicator size={'large'} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View>}
    </View>
  )
}

export default AdminRequests

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContainer: {
        marginTop: '5%',
        marginLeft: '5%', 
        marginRight: '5%'
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    reportedText: {
        fontSize: 24,
        fontFamily: 'Montserrat_500Medium'
    },
    seeAllText: {
        color: '#007AFF',
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        alignSelf: 'center'
    },
    noContentText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium'
        //textAlign: 'center',
    },
    noContentContainer: {
        zIndex: 3,
        alignItems: 'center',
        marginTop: '60%'
        //marginTop: '-5%'
    },
    addText: {
        fontSize: 12.29,
        fontFamily: 'Montserrat_500Medium',
      color: "#fff",
      padding: 5,
      //width: '100%'
      //paddingLeft: 15,
    },
    totalText: {
         fontSize: 19.20,
         fontFamily: 'Montserrat_500Medium',
      color: "#090909",
      padding: 5,
      textAlign: 'center',
      marginTop: '2.5%'
    },
    input: {
      borderTopWidth: 2,
      width: '145%',
      marginLeft: '-24%',
      padding: 15,
      paddingLeft: 35,
      margin: '2.5%',
      marginTop: 0
    }
})