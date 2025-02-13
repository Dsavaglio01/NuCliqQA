import { StyleSheet, Text, View, KeyboardAvoidingView, ActivityIndicator, TouchableOpacity, TextInput, FlatList, Modal} from 'react-native'
import React, {useState, useRef, useEffect, useMemo, useContext, useCallback} from 'react'
import {MaterialCommunityIcons, FontAwesome} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection, query, orderBy, onSnapshot, getDocs, startAfter, setDoc, doc, limit, getDoc, updateDoc, serverTimestamp, arrayUnion, deleteDoc} from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import FastImage from 'react-native-fast-image';
import {BACKEND_URL} from "@env"
import themeContext from '../lib/themeContext';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '../firebase';
import TextChat from '../Components/Chat/TextChat';
import PostChat from '../Components/Chat/PostChat';
import ProfileContext from '../lib/profileContext';
import ChatHeader from '../Components/Chat/ChatHeader';
const GroupChat = ({route}) => {
   const {id, pfp, group, groupName, post} = route.params;
   const theme = useContext(themeContext)
   const [singleMessageLoading, setSingleMessageLoading] = useState(false);
   const [inputText, setInputText] = useState('');
   const inputRef = useRef();
   const [members, setMembers] = useState([]);
   const [security, setSecurity] = useState('');
   const [messages, setMessages] = useState([]);
   const [loading, setLoading] = useState(true);
  const [doneSending, setDoneSending] = useState(false);
   const [completeMessages, setCompleteMessages] = useState([])
   const [lastMessageId, setLastMessageId] = useState('');
  const [imageModal, setImageModal] = useState(false);
  const [done, setDone] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null)
  const [readBy, setReadBy] = useState([]);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [lastVisible, setLastVisible] = useState();
  const [pfps, setPfps] = useState([]);
  const [official, setOfficial] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [channelNotifications, setChannelNotifications] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [name, setName] = useState('');
  const navigation = useNavigation();
  const profile = useContext(ProfileContext);
   const {user} = useAuth()
   const [to, setTo] = useState(null);
   useEffect(() => {
      if (route.params?.id) {
        let unsub;
        const getData = async() => {
          unsub = onSnapshot(doc(db, 'groups', id, 'channels', id), (doc) => {
            if (doc.exists()) {
                setAdmins(doc.data().admins)
                setOfficial(doc.data().official)
          setTo(doc.data().to)
          setName(doc.data().name)
          setSecurity(doc.data().security)
        
            }
            
        });
        }
        getData()
        return unsub;
      }
   }, [route.params?.id])
  function schedulePushPostNotification(firstName, lastName, message, notificationToken, clique) {
    const deepLink = `nucliqv1://GroupChat?id=${group.id}&group=${group}&pfp=${group.banner}&groupName=${group.name}`;
        fetch(`${BACKEND_URL}/api/postCliqueNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: firstName, lastName: lastName, username: message, pushToken: notificationToken, clique: clique, "content-available": 1, 
        data: {routeName: 'GroupChat', id: group.id, pfp: group.banner, group: group, groupName: group.name, deepLink: deepLink}
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
   useEffect(() => {
    //console.log(collectionRef)
    //console.log(group)
    let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot((doc(db, 'groups', id)), (snapshot) => { 
          if (snapshot.exists()) {
          setNotifications(snapshot.data().allowMessageNotifications)
          setMembers(snapshot.data().members)
          }
          //console.log(snapshot.data())
        })
      } 
      fetchCards();
      return unsub;
  }, [])
  useEffect(() => {
  //
  let unsub;
  const queryData = async() => {
    unsub = onSnapshot(doc(db, 'groups', id, 'channels', id), async(doc) => {
        setLastMessageId(doc.data().messageId)
        setReadBy(doc.data().readBy)
    });
    await updateDoc(doc(db, 'groups', id, 'channels', id), {
      readBy: arrayUnion(user.uid)
    })
    const querySnapshot = await getDocs(collection(db, 'groups', id, 'notifications', user.uid, 'messageNotifications'));
    querySnapshot.forEach(async(document) => {
      await deleteDoc(doc(db, 'groups', id, 'notifications', user.uid, 'messageNotifications', document.id))
    })
  } 
  queryData()
  return unsub;
}, [])
//console.log(members)
  useEffect(() => {
    if (members.length > 0) {
      members.map(async(item) => {
        //console.log(item)
        if (item != user.uid && notifications.includes(item)) {
          const snap = (await getDoc(doc(db, 'profiles', item)))
        //console.log(snap.data())
        if (item.cliqChatActive != id){
          setChannelNotifications(prevState => [...prevState, {id: item, notificationToken: snap.data().notificationToken}])
        }
        }
        
      })
    }
    
  }, [members, notifications])
  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        await updateDoc(doc(db, 'profiles', user.uid), {
          cliqChatActive: id
        })
      }
      fetchData()
      // This block of code will run when the screen is focused
      

      // Clean-up function when the component unmounts or the screen loses focus
      return async() => {
        await updateDoc(doc(db, 'profiles', user.uid), {
          cliqChatActive: null
        })
      };
    }, []))

  useEffect(() => {
      let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'groups', id, 'channels', id, 'chats'), orderBy('timestamp', 'desc'), limit(25)), (snapshot) => {
          //console.log(snapshot)
          setMessages(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data(),
            copyModal: false,
            saveModal: false
          })))
          setLastVisible(snapshot.docs[snapshot.docs.length-1])
        })
      } 

      fetchCards();
      return unsub;
  }, [id])
  function fetchMoreData() {
      if (lastVisible != undefined) {
    
    let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'groups', id, 'channels', id, 'chats'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(25)), (snapshot) => {
          const newData = [];
          setMessages(snapshot.docs.map((doc)=> {
            newData.push({
              id: doc.id,
            ...doc.data(),
            copyModal: false,
            saveModal: false
            })
            
          }))
          if (newData.length > 0) {
            setLoading(true)
            setMessages([...messages, ...newData])
          setLastVisible(snapshot.docs[snapshot.docs.length-1])
          }
          
        })
      } 
      setTimeout(() => {
        setLoading(false)
      }, 1000);
      fetchCards();
      return unsub;
    }
    }
    useMemo(() => {
        setPfps([])

        members.map((item) => {

            const getData = async() => {
        const querySnapshot = await getDoc(doc(db, 'profiles', item))
                if (querySnapshot.exists()) {
                    //console.log(querySnapshot.id)
                    setPfps(prevState => [...prevState, {user: item, pfp: querySnapshot.data().pfp, username: querySnapshot.data().userName}])
                }
       
      }
      getData();
      setTimeout(() => {
        setDone(true)
      }, 1000);
    })
        
    }, [members])
  useMemo(() => {
    if (done) {
      const newArray = [...messages];
      //console.log(newArray)
      messages.map(async(item, index) => {
        if (item) {
        //console.log(item)
        
        if (item.message.post != undefined) {
          if (item.message.post.channelId != undefined) {
          //console.log(item.message.post.channelId)
          //console.log(id)
          const channelRef = doc(db, 'groups', id, 'channels', item.message.post.channelId);
          const channelSnap = await getDoc(channelRef);
          
          //console.log(channelSnap.data())
          //newArray[index].
          newArray[index].message.post = {...item,
             channelPfp: channelSnap.data().pfp, channelName: channelSnap.data().name,
          }
          setCompleteMessages(newArray)
        }
        } 
        else {
          setCompleteMessages(newArray)
        
        }
    }
      })
    
    }
    
  }, [messages, pfps, done])
  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 1000);
  }, [])
    async function addPostToChatter(payload, payloadUsername, caption) {
      setSingleMessageLoading(true)
          const docRef = await addDoc(collection(db, 'groups', id, 'channels', id, 'chats'), {
        message: {post: payload, userName: payloadUsername, text: caption},
        likedBy: [],
        user: user.uid,
        indirectReply: false,
        indirectReplyTo: "",
        readBy: [],
        timestamp: serverTimestamp()
    })
    //console.log(docRef)
      addDoc(collection(db, 'groups', id, 'notifications', user.uid, 'messageNotifications' ), {
      //message: true,
      user: user.uid,
      channelId: id,
      id: docRef.id,
      readBy: [],
      timestamp: serverTimestamp()
    }).then(async() => await setDoc(doc(db, 'groups', id, 'notifications', user.uid, 'messageNotifications', docRef.id), {
      timestamp: serverTimestamp()
    })).then(async() => await setDoc(doc(db, 'groups',id, 'channels', id), {
      lastMessage: {post: payload, userName: payloadUsername, text: caption},
      messageId: docRef.id,
      readBy: [],
      lastMessageTimestamp: serverTimestamp()
    }
    )).then(() => setDoneSending(true)).then(() => channelNotifications.map(async(item) => {
      await addDoc(collection(db, 'groups', id, 'notifications', item.id, 'messageNotifications'), {
      id: docRef.id,
      user: user.uid,
      channelId: id,
      readBy: [],
      timestamp: serverTimestamp()
    }).then(async() => await setDoc(doc(db, 'groups', id, 'notifications', item.id, 'messageNotifications', docRef.id), {
      timestamp: serverTimestamp()
    })).then(() => schedulePushPostNotification(profile.firstName, profile.lastName, payloadUsername, item.notificationToken, groupName, name))
    })).then(() => setInputText('')).then(() => setSingleMessageLoading(false))
    
      
    }
  return (
   <View style={styles.container}>
      {completeMessages.length >= 0  ? 
        <ChatHeader pfp={pfp} text={groupName}/>
      : null}
        {loading ? <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start', marginTop: '2.5%'}}>
        <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} /> 
        </View> : null}
        {completeMessages.length > 0 ? 
        <FlatList
        data={completeMessages}
        scrollEnabled={post && !doneSending ? false : true}
        keyExtractor={(item, index) => item.id}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
            const offsetY = nativeEvent.contentOffset.y;
            const contentHeight = nativeEvent.contentSize.height;
            const scrollViewHeight = nativeEvent.layoutMeasurement.height;
            // Detect when the user is near the end of the ScrollView
            if (offsetY + scrollViewHeight >= contentHeight - 100) {
              //)
              //
              // Load more data when close to the end
              fetchMoreData()
            }
          }}
        inverted
        renderItem={({ item, index }) => (
            
           <View>
              {index != completeMessages.length - 1 && completeMessages[index].timestamp != null  && completeMessages[index].timestamp.toDate != undefined
              ? completeMessages[index].timestamp.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'}) != completeMessages[index+1].timestamp.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'}) ? <Text style={item.user == user.uid ?  {alignSelf: 'flex-end', margin: '2.5%', color: theme.color} 
            : {alignSelf: 'flex-start', margin: '2.5%', color: theme.color}}>{getDateAndTime(item.timestamp)}</Text> : null : 
            <Text style={item.user == user.uid ? {alignSelf: 'flex-end', margin: '2.5%', color: theme.color} : {alignSelf: 'flex-start', margin: '2.5%', color: theme.color}}>{getDateAndTime(item.timestamp)}</Text>}
        <View key={item.id} style={item.user == user.uid ? {alignSelf: 'flex-end'} : {alignSelf: 'flex-start'}}>
          <Modal visible={imageModal} animationType="fade" transparent onRequestClose={() => setImageModal(!imageModal)}>
              <View style={[styles.modalContainer, styles.overlay]}>
                <View style={styles.modalView}> 
                  <MaterialCommunityIcons name='close' color={theme.color}  size={35} style={{textAlign: 'right', paddingRight: -30, paddingBottom: 10, paddingTop: 10}} onPress={() => setImageModal(false)}/>
                  <View style={{alignItems: 'center'}}>
                    {selectedImage != null ? <FastImage source={{uri: selectedImage}} style={styles.fullImage} resizeMode='contain'/> : <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />}
                  </View>
                </View>
              </View>



            </Modal>
           
            
            {item.message.post == undefined && item.message.text !== "" ? 
              <TextChat /> : item.message.post != undefined ?
              <PostChat />
            : <></>}
        </View>
        </View>
        
        )}
      /> 
      : !loading && !post ?
       <View style={{marginTop: '10%',}}>
        {pfp ?
        <FastImage source={{uri: pfp}} style={{height: 120, width: 120, borderRadius: 70, alignSelf: 'center', borderWidth: 1.25, borderColor: theme.color}}/> :
        <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 120, width: 120, borderRadius: 70, alignSelf: 'center', borderWidth: 1.25, borderColor: theme.color}}/>}
                    
                    <Text style={styles.username}>{groupName}</Text>
                </View> : null}
        {post && !doneSending ? 
          <View style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
            <TouchableOpacity style={post.caption.length == 0 ? [styles.postContainer, {height: 295, paddingRight: 8.5}] : styles.postContainer} activeOpacity={1}>
                <View>
                <View style={{flexDirection: 'row'}}>
                  {post.pfp ?  <FastImage source={{uri: post.pfp}} style={styles.imagepfp}/> :
               <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.imagepfp}/>
              }
                    <Text style={styles.postUsername}>@{post.username}</Text>
                </View>
                 {post.post[0].image ?
                      <FastImage source={{uri: post.post[0].post, priority: 'normal'}} style={post.caption.length == 0 ? styles.image
                    : [styles.image, {borderBottomLeftRadius: 0, borderBottomRightRadius: 0}]}/>: post.post[0].video ?
                     <FastImage source={{uri: post.post[0].thumbnail, priority: 'normal'}} style={post.caption.length == 0 ? [styles.image]
                    : [styles.image, {borderBottomLeftRadius: 0, borderBottomRightRadius: 0}]}/> : <Text style={[styles.image, {fontSize: post.post[0].textSize, width: '95%', color: theme.color}]}>{post.post[0].value}</Text>
                     }
                {post.caption.length > 0 ? 
                <View>
                  <Text numberOfLines={1} style={styles.captionText}>{post.username} - {post.caption}</Text> 
                </View>
                : null}
                
                </View>
            </TouchableOpacity>
            
            
            </View> : null}
      {official && admins.includes(user.uid) ? 
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={completeMessages.length == 0 && !doneSending ? {flexDirection: 'row', marginTop: '5%'} : !post ? {marginBottom: '5%', flexDirection: 'row'} : {flexDirection
    : 'row'}}>
        <View style={inputText.length > 0 ? [styles.input, {width: '75%'}] : styles.input}>
          
          <TextInput  
            placeholder="Type message..."
            value={inputText}
            placeholderTextColor="#979797"
            onChangeText={setInputText}
            style={keyboardFocused || (!post && inputText.length == 0) ? {width: '92.25%', color: theme.color} : !post || doneSending ? {width: '92.25%',color: theme.color} : !doneSending ? {width: '78%', color: theme.color} : {width: '92.25%', color: theme.color}}
            ref={inputRef}
            autoFocus={post && !doneSending ? true: false}
            enablesReturnKeyAutomatically={true}
            maxLength={200}
            //onFocus={keyboardFocused}
          />
          {post ? doneSending ? <>
          <FontAwesome name='picture-o' size={25} color={theme.color} style={{alignSelf: 'center'}} onPress={pickImage}/>
          </> : null : inputText.length == 0 ? <>
          <FontAwesome name='picture-o' size={25} color={theme.color} style={{alignSelf: 'center'}} onPress={pickImage}/>
          </> : null}
          {/* {inputText.length == 0 || (post && doneSending) ?  : null } */}
        
        </View>
        {!singleMessageLoading ?
                inputText.length > 0 || (post && !doneSending)
        ? <TouchableOpacity style={styles.sendButton} onPress={post && !doneSending ? () => addPostToChatter(post, post.username, inputText) : !post ? () => sendMessage() : null}>
          <Text style={[styles.sendButtonText, {color: "#fafafa"}]}>Send</Text>
        </TouchableOpacity> : null
                : 
                <View style={{ flex: 1, alignItems: 'center', marginTop: '2.5%'}}>
                <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} style={{alignSelf: 'center'}}/>
                </View>
                }
        

        
        {/*  */}
        </KeyboardAvoidingView>
        : !official ? <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={completeMessages.length == 0 && !doneSending ? {flexDirection: 'row', marginTop: '5%'} : !post ? {marginBottom: '5%', flexDirection: 'row'} : {flexDirection
    : 'row'}}>
        <View style={inputText.length > 0 ? [styles.input, {width: '75%'}] : styles.input}>
          
          <TextInput  
            placeholder="Type message..."
            value={inputText}
            placeholderTextColor="#979797"
            onChangeText={setInputText}
            style={keyboardFocused || (!post && inputText.length == 0) ? {width: '92.25%', color: theme.color} : !post || doneSending ? {width: '92.25%',color: theme.color} : !doneSending ? {width: '78%', color: theme.color} : {width: '92.25%', color: theme.color}}
            ref={inputRef}
            autoFocus={post && !doneSending ? true: false}
            enablesReturnKeyAutomatically={true}
            maxLength={200}
            //onFocus={keyboardFocused}
          />
          {post ? doneSending ? <>
          <FontAwesome name='picture-o' size={25} color={theme.color} style={{alignSelf: 'center'}} onPress={pickImage}/>
          </> : null : inputText.length == 0 ? <>
          <FontAwesome name='picture-o' size={25} color={theme.color} style={{alignSelf: 'center'}} onPress={pickImage}/>
          </> : null}
          {/* {inputText.length == 0 || (post && doneSending) ?  : null } */}
        
        </View>
        {!singleMessageLoading ?
                inputText.length > 0 || (post && !doneSending)
        ? <TouchableOpacity style={styles.sendButton} onPress={post && !doneSending ? () => addPostToChatter(post, post.username, inputText) : !post ? () => sendMessage() : null}>
          <Text style={[styles.sendButtonText, {color: "#fafafa"}]}>Send</Text>
        </TouchableOpacity> : null
                : 
                <View style={{ flex: 1, alignItems: 'center', marginTop: '2.5%'}}>
                <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} style={{alignSelf: 'center'}}/>
                </View>
                }
        

        
        {/*  */}
        </KeyboardAvoidingView> : 
        <View style={{flex: 1, justifyContent: 'flex-end'}}> 
          <Text style={styles.officialText}>This is a read-only general chat for Cliq announcements</Text>
        </View>}
    </View>
  )
}

export default GroupChat

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundcolor: '#121212'
  },
  officialText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 15.36,
    color: "#fafafa",
    textAlign: 'center',
    padding: 10
  },
  postContainer: {
    margin: '2.5%',
    padding: 5,
    height: 325,
    width: 245,
    borderRadius: 20,
    backgroundColor: "#005278"
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: '2.5%',
    marginTop: '1%',
    marginLeft: '2.5%',
    marginRight: '2.5%',
    flexDirection: 'row'
  }, 
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#005278',
    borderRadius: 8,
    marginBottom: '2.5%',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontWeight: 'bold',
  },
  postUsername: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    color: "#fafafa",
    alignSelf: 'center',
    paddingLeft: 5,
  },
  captionText: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    paddingBottom: 0,
    paddingHorizontal: 5,
    paddingRight: 0,
    color: "#fafafa"
  },
  image: {
    height: 220, 
    width: 223.4375, 
    borderRadius: 8, 
    marginLeft: 5
  },
  fullImage: {
    width: 350, // Specific width (optional)
    height: 650,
  },
  username: {
      padding: 10,
      textAlign: 'left',
      fontFamily: 'Montserrat_500Medium',
      color: "#FAFAFA",
      fontSize: 15.36, 
      marginTop: '3.5%', 
      textAlign: 'center'
    },
    modalContainer: {
        flex: 1,
        //justifyContent: 'center',
        alignItems: 'center',
        //marginTop: 22
    },
  modalView: {
    width: '100%',
    //marginTop: '5%',
    height: '100%',
    //margin: 20,
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 35,
    paddingTop: 25,
    //paddingBottom: 25,
    //alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  imagepfp: {
    height: 33, 
    width: 33, 
    borderRadius: 8, 
    margin: '5%'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }
})