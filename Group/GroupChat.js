import { StyleSheet, Text, View, KeyboardAvoidingView, Alert, ActivityIndicator, TouchableOpacity, TextInput, FlatList, Modal} from 'react-native'
import React, {useState, useRef, useLayoutEffect, useEffect, useMemo, useContext, useCallback} from 'react'
import {MaterialCommunityIcons, Entypo, FontAwesome, MaterialIcons} from '@expo/vector-icons';
import { Menu, Provider } from 'react-native-paper';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, query, orderBy, where, onSnapshot, getDocs, startAfter, setDoc, getFirestore, doc, limit, getDoc, updateDoc, serverTimestamp, arrayRemove, arrayUnion, deleteDoc} from 'firebase/firestore';
import MainButton from '../Components/MainButton';
import useAuth from '../Hooks/useAuth';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
import {Divider} from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import FastImage from 'react-native-fast-image';
import uuid from 'react-native-uuid';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {BACKEND_URL} from "@env"
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import * as Haptics from 'expo-haptics';
import {Image} from 'react-native-compressor'
import themeContext from '../lib/themeContext';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '../firebase';
const GroupChat = ({route}) => {
   const {id, pfp, group, groupName, post} = route.params;
   //console.log(group)
   //console.log(pfp)
   const theme = useContext(themeContext)
   const [visible, setVisible] = useState(false);
   const openMenu = () => setVisible(true)
   const isFocused = useIsFocused();
   const [singleMessageLoading, setSingleMessageLoading] = useState(false);
   const storage = getStorage();
   const [inputText, setInputText] = useState('');
   const inputRef = useRef();
   const closeMenu = () => setVisible(false)
   const [requests, setRequests] = useState([]);
   const [reportedContent, setReportedContent] = useState([]);
   const [members, setMembers] = useState([]);
   const [security, setSecurity] = useState('');
   const [messages, setMessages] = useState([]);
   const [username, setUsername] = useState('');
   const [loading, setLoading] = useState(true);
   const [status, setStatus] = useState(null);
   const [reportedItem, setReportedItem] = useState(null);
   const [indirectReplyTo, setIndirectReplyTo] = useState(false);
   const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [doneSending, setDoneSending] = useState(false);
   const [completeMessages, setCompleteMessages] = useState([])
   const [lastMessageId, setLastMessageId] = useState('');
  const [imageModal, setImageModal] = useState(false);
  const [done, setDone] = useState(false);
  const [image, setImage] = useState(null);
  const [copyModal, setCopyModal] = useState(false);
  const [replyItem, setReplyItem] = useState(null);
  const [saveModal, setSaveModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null)
  const [readBy, setReadBy] = useState([]);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [lastVisible, setLastVisible] = useState();
   const [textCopied, setTextCopied] = useState('');
  const [userCopied, setUserCopied] = useState('');
  const [imageCopied, setImageCopied] = useState(null);
  const [pfps, setPfps] = useState([]);
  const [official, setOfficial] = useState(true);
  const [themeCopied, setThemeCopied] = useState(null);
  const [indirectReply, setIndirectReply] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [channelNotifications, setChannelNotifications] = useState([]);
  const [notificationToken, setNotificationToken] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [name, setName] = useState('');
    const [replyTo, setReplyTo] = useState('');
   const navigation = useNavigation();

   const {user} = useAuth()
   const [to, setTo] = useState(null);
   const [tapCount, setTapCount] = useState(0);
   const timerRef = useRef(null);
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
   //console.log(channelNotifications)
   useEffect(() => {
    const getUsername = async() => {
      const nameOfUser = (await getDoc(doc(db, 'profiles', user.uid))).data().userName
      const nameFirst = (await getDoc(doc(db, 'profiles', user.uid))).data().firstName
      const nameLast = (await getDoc(doc(db, 'profiles', user.uid))).data().lastName
      const notificationToken = (await getDoc(doc(db, 'profiles', user.uid))).data().notificationToken
      
      setUsername(nameOfUser)
      setLastName(nameLast)
      setFirstName(nameFirst)
      setNotificationToken(notificationToken)
    }
    getUsername()
  }, [])
  useEffect(() => {
    let unsub;
    //const reportedMessages = (await getDoc(doc(db, 'profiles', user.uid))).data().reportedMessages
     unsub = onSnapshot(doc(db, "profiles", user.uid), (doc) => {
          setReportedContent(doc.data().reportedMessages)
    });
    return unsub;
  }, [onSnapshot])
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
   const renderLiked = async(actualId, notificationToken) => {
    if (actualId.likedBy.includes(user.uid)) {
      await updateDoc(doc(db, 'groups', id, 'channels', id, 'chats', actualId.id), {
      likedBy: arrayRemove(user.uid)
    }).then(() => {
      const updatedArray = completeMessages.map((item) => {
      if (item.id === actualId.id) {
        return { ...item, likedBy: item.likedBy.filter(e => e != user.uid) };
      }
      return item;
    });
    setCompleteMessages(updatedArray) 
    }).then(actualId.user != user.uid && notificationToken != undefined ? () => schedulePushLikedMessageNotification(actualId.user, firstName, lastName, notificationToken, groupName, name) : null)
    }
    else {
      await updateDoc(doc(db, 'groups', id, 'channels', id, 'chats', actualId.id), {
      likedBy: arrayUnion(user.uid)
    }).then(() => {
      const updatedArray = completeMessages.map((item) => {
      if (item.id === actualId.id) {
        return { ...item, liked: item.likedBy.push(user.uid) };
      }
      return item;
    });
    setCompleteMessages(updatedArray) 
    })
      
    
    //console.log(updatedArray)
    
    }
    }
   //console.log(id, person, event)
    const memberRef = doc(db, 'groups', id, 'channels', id)
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
  //console.log('first')
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
  /* useEffect(() => {
    if (isFocused) {
      // User is on this screen
      const getActive = async() => {
        await updateDoc(doc(db, 'profiles', user.uid), {
          cliqChatActive: id
        })
      }
      getActive();
      // Implement any additional logic you need
    } else {
      // User has left this screen
      const getActive = async() => {
        await updateDoc(doc(db, 'profiles', user.uid), {
          cliqChatActive: null
        })
      }
      getActive();
      // Implement any cleanup or additional logic as needed
    }

    // You can also integrate Firebase analytics events here if needed

    return () => {
      // Cleanup logic when component unmounts or screen changes
    };
  }, [isFocused]); */
  //console.log(channelNotifications)
  function getCalculatedTime(time) {
        return time.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'})
    }
  function getDateAndTime(timestamp) {
      if (timestamp != null) {
        //const formattedDate = new Date(timestamp.seconds*1000)
        //return formattedDate.toLocaleString()
      //console.log(date)
      var t = new Date(Date.UTC(1970, 0, 1)); // Epoch
      t.setUTCSeconds(timestamp.seconds);
      const date = new Date(t);
      const yesterday = new Date();
      const twodays = new Date();
      const threedays = new Date();
      const fourdays = new Date();
      const fivedays = new Date();
      const sixdays = new Date();
      const lastWeek = new Date();
      const twoWeeks = new Date();
      const threeWeeks = new Date();
      const fourWeeks = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      twoWeeks.setDate(twoWeeks.getDate() - 14);
      threeWeeks.setDate(threeWeeks.getDate() - 21);
      fourWeeks.setDate(fourWeeks.getDate() - 28);
      twodays.setDate(twodays.getDate() - 2);
      threedays.setDate(threedays.getDate() - 3);
      fourdays.setDate(fourdays.getDate() - 4);
      fivedays.setDate(fivedays.getDate() - 5);
      sixdays.setDate(sixdays.getDate() - 6);
      yesterday.setDate(yesterday.getDate() - 1);
      //console.log(twodays.getTime())
      //console.log(yesterday.getTime())
      //console.log(date.getTime())
      //console.log(threedays.getTime())
      //console.log(fourdays.getTime())
      if  (date.getTime() >= yesterday.getTime()) {
        return `${getCalculatedTime(timestamp)}`
      }
      else if (date.getTime() <= fourWeeks.getTime()) {
        return `${new Date(timestamp.seconds*1000).toLocaleString()}`
      }
      else if (date.getTime() <= threeWeeks.getTime()) {
        return `3 weeks ago, ${getCalculatedTime(timestamp)}`
      }
      else if (date.getTime() <= twoWeeks.getTime()) {
        return `2 weeks ago, ${getCalculatedTime(timestamp)}`
      }
      else if (date.getTime() <= lastWeek.getTime()) {
        return `1 week ago, ${getCalculatedTime(timestamp)}`
      }
      else if (date.getTime() <= sixdays.getTime()) {
        return `6 days ago, ${getCalculatedTime(timestamp)}`
      }
      else if (date.getTime() <= fivedays.getTime()) {
        return `5 days ago, ${getCalculatedTime(timestamp)}`
      }
      else if (date.getTime() <= fourdays.getTime()) {
        return `4 days ago, ${getCalculatedTime(timestamp)}`
      }
      else if (date.getTime() <= threedays.getTime()) {
        return `3 days ago, ${getCalculatedTime(timestamp)}`
      }
      else if (date.getTime() <= twodays.getTime()) {
        return `2 days ago, ${getCalculatedTime(timestamp)}`
      }
      else if (date.getTime() <= yesterday.getTime()) {
        return `Yesterday, ${getCalculatedTime(timestamp)}`
      } 
      }
      
    }
  async function copyFunction(item) {
    await Clipboard.setStringAsync(textCopied).then(()=> toggleCopyToFalse(item)).catch((error) => console.warn(error))
  }

  function saveImage() {
    //console.log(imageCopied)
    MediaLibrary.saveToLibraryAsync(imageCopied).then(() => toggleSaveToFalse(item))
  }
  useEffect(() => {
    const getPermissions = async() => {
      const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync()
      let finalStatus = existingStatus;
      //console.log(existingCameraStatus)
      if (existingStatus !== 'granted') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        setStatus(false)
      }
      }
    getPermissions()
  }, [])
    const pickImage = async() => {
      if (status !== false) {
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          //allowsMultipleSelection: true,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        }).then(async(image) => {
          if (!image.canceled) {
              image.assets.map(async(ite, index) => {
              const result = await Image.compress(
                ite.uri,
                {},
              );
              //console.log(result)
              setImage(result)
                      
            })
            }
        })
      }
      else {
        Alert.alert("No Media Permissions", "To select an image, allow media permissions, in order to select images for profile pictures, posts and themes, in your phone's settings", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])
      }
         
    };
    useEffect(() => {
    if (image != null){
      const uploadImage = async() => {
        setUploading(true);
        const response = await fetch(image)
        const bytes = await response.blob();
        const filename = `${uuid.v4()}${user.uid}${group.id}message.jpg`
        //setPfp(filename)
        var storageRef = ref(storage, filename)
        try {
            await storageRef;
        } catch (error) {
            console.log(error)
        }
        await uploadBytesResumable(storageRef, bytes).then(() => getLink(filename))
    }
    uploadImage()
    setUploading(false)
    setImage(null)
    }
  }, [image])
  const getLink = (pfp) => {
        const starsRef = ref(storage, pfp);
        getDownloadURL(starsRef).then(async(url) =>
         {
          
          
          const docRef = await addDoc(collection(db, 'groups', id, 'channels', id, 'chats'), {
        message: {image: url},
        likedBy: [],
        user: user.uid,
        readBy: [],
        timestamp: serverTimestamp()
    })
    await updateDoc(doc(db, 'groups', id, 'channels', id), {
      lastMessage: {image: url},
      messageId: docRef.id,
      readBy: [],
      lastMessageTimestamp: serverTimestamp()
    }
    ).then(() => channelNotifications.map(async(item) => {
      await addDoc(collection(db, 'groups', id, 'notifications', item.id, 'messageNotifications'), {
      id: docRef.id,
      user: user.uid,
      channelId: id,
      readBy: [],
      timestamp: serverTimestamp()
    }).then(async() => await setDoc(doc(db, 'groups', id, 'notifications', item.id, 'messageNotifications', docRef.id), {
      timestamp: serverTimestamp()
    })).then(() => schedulePushImageNotification(firstName, lastName, item.notificationToken, groupName, name))
      
    })) 
         
         }
        
    )
    }
    async function schedulePushLikedMessageNotification(id, firstName, lastName, notificationToken, clique) {
      let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    const deepLink = `nucliqv1://GroupChannels?id=${group.id}&group=${group}&person=${id}&pfp=${group.pfp}&name=${group.name}`;
     let cliqNotis = (await getDoc(doc(db, 'groups', group.id))).data().allowMessageNotifications
      if (notis && cliqNotis.includes(user.uid)) {
      fetch(`${BACKEND_URL}/api/likeCliquePostNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: firstName, lastName: lastName, clique: clique, pushToken: notificationToken, "content-available": 1, 
        data: {routeName: 'GroupChat', id: group.id, pfp: group.banner, group: group, groupName: group.name, deepLink: deepLink}
      }),
      })
      .then(response => response.json())
      .then(responseData => {
    })
    .catch(error => {
      console.error(error);
    })
  }
  }
  
    function schedulePushTextNotification(firstName, lastName, message, notificationToken, clique) {
      //console.log(message)
      const deepLink = `nucliqv1://GroupChat?id=${group.id}&group=${group}&pfp=${group.banner}&groupName=${group.name}`;
      fetch(`${BACKEND_URL}/api/textCliqueNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: firstName, lastName: lastName, clique: clique,
        message: message.text, pushToken: notificationToken, "content-available": 1, 
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
  //console.log(group)
  function schedulePushImageNotification(firstName, lastName, notificationToken, clique) {
    const deepLink = `nucliqv1://GroupChat?id=${group.id}&group=${group}&pfp=${group.banner}&groupName=${group.name}`;
    fetch(`${BACKEND_URL}/api/imageCliqueNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: firstName, lastName: lastName, pushToken: notificationToken, clique: clique, "content-available": 1, 
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
    const sendMessage = async() => {
        
    if (inputText.trim() === '') {
      return;
    }

    const newMessage = {
      text: inputText,
      
    };
    setSingleMessageLoading(true)
    inputRef.current.blur()
    const docRef = await addDoc(collection(db, 'groups', id, 'channels', id, 'chats'), {
        message: newMessage,
        likedBy: [],
        user: user.uid,
        
        readBy: [],
        timestamp: serverTimestamp()
    })
    await updateDoc(doc(db, 'groups', id, 'channels', id), {
      lastMessage: newMessage,
      messageId: docRef.id,
      readBy: [],
      lastMessageTimestamp: serverTimestamp()
    }).then(() => channelNotifications.map(async(item) => {
      await addDoc(collection(db, 'groups', id, 'notifications', item.id, 'messageNotifications'), {
      id: docRef.id,
      user: user.uid,
      channelId: id,
      readBy: [],
      timestamp: serverTimestamp()
    }).then(async() => await setDoc(doc(db, 'groups', id, 'notifications', item.id, 'messageNotifications', docRef.id), {
      timestamp: serverTimestamp()
    })).then(() => schedulePushTextNotification(firstName, lastName, newMessage, item.notificationToken, groupName, name))
      
    })) 

    /* */
    //setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText('');
    setSingleMessageLoading(false)
    setKeyboardFocused(false)
    setCopyModal(false)
  };
  //console.log(channelNotifications)

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
  //console.log(completeMessages[0])
  //console.log(inputRef.current.focus())
  //console.log(messages)
  async function getPfp (userId) {
    const userPfp = (await getDoc(doc(db, 'profiles', userId))).data().pfp
    //console.log(userPfp)
    return userPfp
  }
  function toggleCopyToTrue(e) {
   const updatedArray = completeMessages.map(item => {
      if (item.id === e.id) {
        // Update the "isActive" property from false to true
        return { ...item, copyModal: true, saveModal: false };
      }
      return item;
    });
    setCompleteMessages(updatedArray) 
  }
  function toggleSaveToTrue(e) {
   const updatedArray = completeMessages.map(item => {
      if (item.id === e.id) {
        // Update the "isActive" property from false to true
        return { ...item, copyModal: false, saveModal: true };
      }
      return item;
    });
    setCompleteMessages(updatedArray) 
  }
  
  
  function toggleCopyToFalse(e) {
    const updatedArray = completeMessages.map(item => {
      if (item.id === e.id) {
        // Update the "isActive" property from false to true
        return { ...item, copyModal: false, saveModal: false };
      }
      return item;
    });
    setCompleteMessages(updatedArray)
  }
  function toggleSaveToFalse(e) {
    const updatedArray = completeMessages.map(item => {
      if (item.id === e.id) {
        // Update the "isActive" property from false to true
        return { ...item, copyModal: false, saveModal: false };
      }
      return item;
    });
    setCompleteMessages(updatedArray)
  }
  function handleMessagePress(item) {
    ///console.log(channelNotifications)
    setTapCount(tapCount + 1);
    if (tapCount === 0) {
      // Set a timer for the second tap
      timerRef.current = setTimeout(() => {
        // If no second tap occurs within the timer, treat it as a single tap
        setTapCount(0);
        console.log('Single Tap!');
      }, 500); // Adjust the time limit according to your requirements
    } else if (tapCount === 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      // If it's the second tap and the timer is still active, treat it as a double tap
      clearTimeout(timerRef.current);
      setTapCount(0);
      if (channelNotifications.filter((e) => e.id == item.user)[0]) {
        renderLiked(item, channelNotifications.filter((e) => e.id == item.user)[0].notificationToken)
      }
      else {
       
        renderLiked(item, null)
      }
      
      
      
    }
  }
  async function deleteMessage(item) {
    if (lastMessageId != item.id) {
       await setDoc(doc(db, 'deletedCliqueMessages', item.id), {
      cliqueId: group,
      channelId: id,
      info: item,
      user: item.user,
      timestamp: serverTimestamp()
    }).then(async() => await deleteDoc(doc(db, 'groups', id, 'channels', id, 'chats', item.id))).then(() => setCompleteMessages(completeMessages.filter((e) => e.id != item.id)))
    }
    else if (lastMessageId == item.id) {
      const newMessage = completeMessages[completeMessages.indexOf(item.id) + 2]
      if (newMessage) {
        await setDoc(doc(db, 'deletedCliqueMessages', item.id), {
      cliqueId: group,
      channelId: id,
      info: item,
      user: item.user,
      timestamp: serverTimestamp()
    }).then(async() => await updateDoc(doc(db, 'groups', id, 'channels', id), {
      messageId: newMessage.id,
      lastMessageTimestamp: newMessage.timestamp,
      lastMessage: newMessage.message
    })).then(async() => await deleteDoc(doc(db, 'groups', id, 'channels', id, 'chats', item.id))).then(() => setCompleteMessages(completeMessages.filter((e) => e.id != item.id)))
      }
      else {
        await setDoc(doc(db, 'deletedCliqueMessages', item.id), {
      cliqueId: group,
      channelId: id,
      info: item,
      user: item.user,
      timestamp: serverTimestamp()
    }).then(async() => await updateDoc(doc(db, 'groups', id, 'channels', id), {
      messageId: null,
      lastMessageTimestamp: serverTimestamp(),
      lastMessage: null
    })).then(async() => await deleteDoc(doc(db, 'groups', id, 'channels', id, 'chats', item.id))).then(() => setCompleteMessages(completeMessages.filter((e) => e.id != item.id)))
      }
      //console.log(completeMessages.indexOf(item) - 1)
      }

  }
  /* async function deleteMessage(item) {
    await setDoc(doc(db, 'deletedCliqueMessages', item.id), {
      cliqueId: group,
      channelId: id,
      info: item,
      user: item.user,
      timestamp: serverTimestamp()
    })
      //await deleteDoc(doc(db, 'groups', id, 'channels', id, 'chats', item.id)).then(() => setcompleteMessages(completeMessages.filter((e) => e.id != item.id)))
      await deleteDoc(doc(db, 'groups', id, 'channels', id, 'chats', item.id)).then(() => setCompleteMessages(completeMessages.filter((e) => e.id != item.id)))
    //
    //console.log(item.message)
  } */
  function handleImagePress(item) {
    setTapCount(tapCount + 1);

    if (tapCount === 0) {
      // Set a timer for the second tap
      timerRef.current = setTimeout(() => {
        // If no second tap occurs within the timer, treat it as a single tap
        setTapCount(0);
        setSelectedImage(item.message.image)
        setImageModal(true)
        //console.log('Single Tap!');
      }, 300); // Adjust the time limit according to your requirements
    } else if (tapCount === 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      // If it's the second tap and the timer is still active, treat it as a double tap
      clearTimeout(timerRef.current);
      setTapCount(0);
      if (channelNotifications.filter((e) => e.id == item.user)[0]) {
        renderLiked(item, channelNotifications.filter((e) => e.id == item.user)[0].notificationToken)
      }
      else {
        renderLiked(item, null)
      }
    }
  }
  async function silenceNotifications() {
    await updateDoc(memberRef, {
      allowNotifications: arrayRemove(user.uid)
    })
  }
  //console.log(completeMessages)
  //console.log(messages)
  async function activateNotifications() {
    await updateDoc(memberRef, {
      allowNotifications: arrayUnion(user.uid)
    })
  }
  useEffect(()=> {
      let unsub;
      const fetchCards = async () => {
        //const passes = await getDocs(collection(db, 'users', user.uid, 'passes')).then((snapshot) => snapshot.docs.map((doc) => doc.id));
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'requests'), where('actualRequest', '==', true)), (snapshot) => {
          setRequests(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
            //info: doc.data().info
          })))
        })
      } 
      fetchCards();
      return unsub;
    }, []);
    console.log(post)
  function handlePostPress(item, notificationToken) {
    setTapCount(tapCount + 1);

    if (tapCount === 0) {
      // Set a timer for the second tap
      timerRef.current = setTimeout(() => {
        // If no second tap occurs within the timer, treat it as a single tap
        setTapCount(0);
        navigation.navigate('Post', {post: item.message.post.id, requests: requests, name: item.message.post.userId, groupId: group})
        //console.log('Single Tap!');
      }, 300); // Adjust the time limit according to your requirements
    } else if (tapCount === 1) {
      //console.log('first')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      // If it's the second tap and the timer is still active, treat it as a double tap
      clearTimeout(timerRef.current);
      setTapCount(0);
      if (channelNotifications.filter((e) => e.id == item.user)[0]) {
        renderLiked(item, channelNotifications.filter((e) => e.id == item.user)[0].notificationToken)
      }
      else {
        renderLiked(item, null)
      }
    }
  }
  //console.log(official, admins)
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
    })).then(() => schedulePushPostNotification(firstName, lastName, payloadUsername, item.notificationToken, groupName, name))
    })).then(() => setInputText('')).then(() => setSingleMessageLoading(false))
    
      
    }
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  //console.log(pfps)
  //console.log(name)
  return (
    <Provider>
   <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      {completeMessages.length >= 0  ? 
      <>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity style={{margin: '10%', marginBottom: 0, marginRight: 0, marginLeft: '2.5%'}} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name='chevron-left' size={35} color={theme.color} />
            </TouchableOpacity>
              <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: '5%', marginTop: '11%', marginBottom: '2.5%'}}>
               <FastImage source={pfp ? {uri: pfp} : require('../assets/defaultpfp.jpg') } style={{height: 35, width: 35, borderRadius: 8, borderWidth: 1.5, borderColor: '#000'}}/> 
               <Text style={{fontSize: 15.36, marginLeft: '5%', width: '65%', fontFamily: 'Montserrat_500Medium', color: theme.color}}>{groupName}</Text>
              </View>
            {/* {!post || doneSending ? 
            <Menu visible={visible}
            onDismiss={() => closeMenu()}
            contentStyle={{backgroundColor: theme.backgroundColor, marginTop: '30%'}}
            anchor={<Entypo name='dots-three-vertical' size={25} color="#000" onPress={() => openMenu()} style={{margin: '15%', marginTop: 40, alignSelf: 'center', marginHorizontal: 0}}/>}>
              {
                security == 'public' ? <Menu.Item title="Enable Notifications" titleStyle={{color: "#000"}} onPress={() => {}}/> : null
              }


        </Menu> 
        : null
            } */}
        

        </View>
                <Divider borderBottomWidth={1} borderColor={theme.color}/>
        </>
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
              //console.log('first')
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
            item.user != user.uid ? 
            <>
            <View style={styles.addpfp}>
            <TouchableOpacity onPress={() => navigation.navigate('ViewingProfile', {name: item.user, viewing: true})}>
            
            {pfps[pfps.findIndex(obj => obj.user === item.user)] != undefined ? pfps[pfps.findIndex(obj => obj.user === item.user)].pfp ? <FastImage source={{uri: pfps[pfps.findIndex(obj => obj.user === item.user)].pfp}} style={styles.pfp}/> :
               <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.pfp}/> :<FastImage source={require('../assets/defaultpfp.jpg')} style={styles.pfp}/>
              }
            </TouchableOpacity>
            
            {item.user != user.uid ? 
            item.message.image != undefined && user.uid != item.user ? 
            <View style={{flexDirection: 'column'}}>
            {pfps[pfps.findIndex(obj => obj.user === item.user)] != undefined ? pfps[pfps.findIndex(obj => obj.user === item.user)].username ? <Text style={styles.username}>{pfps[pfps.findIndex(obj => obj.user === item.user)].username}</Text> : null : null}
            <TouchableOpacity activeOpacity={1}  onPress={() => handleImagePress(item)} onLongPress={() => {toggleSaveToTrue(item); setImageCopied(item.message.image)}}>
             <>
                <FastImage source={{uri: item.message.image}} style={[styles.regImage, {marginRight: -5}]}/>
            {item.likedBy.length > 0 && !item.saveModal ? 
                
                    <View style={item.user == user.uid ? {position: 'relative', bottom: 10, left: 5}: {position: 'relative', bottom: 11, left: 170}}>
                        <MaterialCommunityIcons name='heart' size={20} color="red"/>
                    </View> : null}
            {lastMessageId == item.id && readBy.length > 1 && item.user == user.uid ? <Text style={[styles.readRightText, {color: theme.color}]}>{readBy.length - 1} Read</Text> : null}
            {(item.saveModal && item.user === user.uid) || (item.saveModal && !reportedContent.includes(item.id)) ?  
          <View style={[styles.copyModal, {marginTop: '5%'}]}>
            {item.user == user.uid ? <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => deleteMessage(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Delete Message</Text>
                  <MaterialCommunityIcons name='delete' size={20} style={{alignSelf: 'center'}} color={theme.color}/>
                </TouchableOpacity>
                <Divider color={theme.color}/> 
                </>
                : null}
                {!reportedContent.includes(item.id) ? 
                <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, theme: false, comment: null, cliqueId: null, post: false, comments: false, message: true, cliqueMessage: false, reportedUser: item.user})}>
                  <Text style={[styles.copyText, {color: '#fafafa'}]}>Report</Text>
                  <MaterialIcons name='report' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity> 
                <Divider color={theme.color}/> 
                </>
                : null}
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => toggleSaveToFalse(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Cancel</Text>
                  <MaterialIcons name='cancel' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
              </View> 
          : null} 
          </> 
          </TouchableOpacity>
          </View>:
            item.message.text != undefined ? 
                
            <View style={{flexDirection: 'column'}}>
            {pfps[pfps.findIndex(obj => obj.user === item.user)] != undefined ? pfps[pfps.findIndex(obj => obj.user === item.user)].username ? <Text style={styles.username}>{pfps[pfps.findIndex(obj => obj.user === item.user)].username}</Text> : null : null}
              <TouchableOpacity activeOpacity={1} style={index != completeMessages.length - 1 && completeMessages[index].timestamp != null  && completeMessages[index].timestamp.toDate != undefined
              ? completeMessages[index].timestamp.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'}) != completeMessages[index+1].timestamp.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'}) ? [styles.messageContainer, {backgroundColor: 'grey', alignSelf: 'flex-start'}] 
              : [styles.messageContainer, {marginBottom: 0, backgroundColor: 'grey', alignSelf: 'flex-start'}] : [styles.messageContainer, {backgroundColor: 'grey', alignSelf: 'flex-start'}]}
              onLongPress={() => {toggleCopyToTrue(item); setTextCopied(item.message.text); setReplyTo(item.user == user.uid ? user.uid : item.userName)}} onPress={() => handleMessagePress(item)}>
                {item.message.text !== "" ?
                <>
                
                <Text style={[styles.messageText]}>{item.message.text}</Text>
                {item.likedBy.length > 0 && !item.copyModal ? 
                
                    <View style={{position: 'absolute', bottom: -7.5, right: 10}}>
                        <MaterialCommunityIcons name='heart' size={20} color="red"/>
                    </View> : null}
                </> : null}

              </TouchableOpacity> 
                  
                    {lastMessageId == item.id && readBy.length > 1 && item.user == user.uid ? <Text style={[styles.readRightText, {color: theme.color}]}>{readBy.length - 1} Read</Text> : null}
            
            </View>
            : null
            : item.message.text != undefined ? 
              <>
            <View style={index != completeMessages.length - 1 && completeMessages[index].timestamp != null  && completeMessages[index].timestamp.toDate != undefined
              ? completeMessages[index].timestamp.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'}) != completeMessages[index+1].timestamp.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'}) ? [styles.messageContainer] 
              : [styles.messageContainer, {marginBottom: 0}] : [styles.messageContainer]}>
              <TouchableOpacity activeOpacity={1} onPress={() => handleMessagePress(item)}
              onLongPress={() => {toggleCopyToTrue(item); setTextCopied(item.message.text)}}>
                {item.message.text !== "" ?
                <>
                
                <Text style={[styles.messageText]}>{item.message.text}</Text>
                
                </> : null}
              </TouchableOpacity> 

            
            </View>
            
            {item.likedBy.length > 0 && !item.copyModal ? 
                
                    <View style={{position: 'relative', marginLeft: 'auto', bottom: 10}}>
                        <MaterialCommunityIcons name='heart' size={20} color="red"/>
                    </View> : null}
                    
             {lastMessageId == item.id && readBy.length > 1 && item.user == user.uid ? <Text style={[styles.readRightText, {color: theme.color}]}>{readBy.length - 1} Read</Text> : null}
            
            </> : null}
            
            {
              item.copyModal && item.user == user.uid ?
              <View style={styles.copyModal}>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => copyFunction(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Copy</Text>
                  <MaterialCommunityIcons name='content-copy' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
                <Divider color={theme.color}/>
                {item.user == user.uid ? <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => deleteMessage(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Delete Message</Text>
                  <MaterialCommunityIcons name='delete' size={20} style={{alignSelf: 'center'}} color={theme.color}/>
                </TouchableOpacity>
                <Divider color={theme.color}/> 
                </>
                : null}
                
                {!reportedContent.includes(item.id) ? 
                <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, theme: false, comment: null, cliqueId: null, post: false, comments: false, message: true, cliqueMessage: false, reportedUser: item.user})}>
                  <Text style={[styles.copyText, {color: '#fafafa'}]}>Report</Text>
                  <MaterialIcons name='report' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity> 
                <Divider color={theme.color}/> 
                </>
                : null}
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => toggleCopyToFalse(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Cancel</Text>
                  <MaterialIcons name='cancel' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
              </View> 
              :
              null
            }
            
            </View>
            {
              item.copyModal && item.user != user.uid ?
              <View style={[styles.copyModal, {marginTop: 0}]}>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => copyFunction(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Copy</Text>
                  <MaterialCommunityIcons name='content-copy' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
                <Divider color={theme.color}/>
                {item.user == user.uid ? <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => deleteMessage(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Delete Message</Text>
                  <MaterialCommunityIcons name='delete' size={20} style={{alignSelf: 'center'}} color={theme.color}/>
                </TouchableOpacity>
                <Divider color={theme.color}/> 
                </>
                : null}
                
                {!reportedContent.includes(item.id) ? 
                <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, theme: false, comment: null, cliqueId: null, post: false, comments: false, message: true, cliqueMessage: false, reportedUser: item.user})}>
                  <Text style={[styles.copyText, {color: '#fafafa'}]}>Report</Text>
                  <MaterialIcons name='report' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity> 
                <Divider color={theme.color}/> 
                </>
                : null}
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => toggleCopyToFalse(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Cancel</Text>
                  <MaterialIcons name='cancel' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
              </View> 
              :
              null
            }
            </>
            :
            <View>
            { 
            item.user != user.uid ? 
            item.message.text != undefined ? 

            <View style={styles.addpfp}>
         <TouchableOpacity onPress={() => navigation.navigate('ViewingProfile', {name: item.user, viewing: true})}>
           {pfps[pfps.findIndex(obj => obj.user === item.user)] != undefined ? pfps[pfps.findIndex(obj => obj.user === item.user)].username ? <Text style={styles.username}>{pfps[pfps.findIndex(obj => obj.user === item.user)].username}</Text> : null : null}
            {pfps[pfps.findIndex(obj => obj.user === item.user)] != undefined ? pfps[pfps.findIndex(obj => obj.user === item.user)].pfp ? <FastImage source={{uri: pfps[pfps.findIndex(obj => obj.user === item.user)].pfp}} style={styles.pfp}/> :
               <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.pfp}/> : <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.pfp}/>
              }
              </TouchableOpacity>
            <View style={index != completeMessages.length - 1 && completeMessages[index].timestamp != null  && completeMessages[index].timestamp.toDate != undefined
              ? completeMessages[index].timestamp.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'}) != completeMessages[index+1].timestamp.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'}) ? [styles.messageContainer, {backgroundColor: 'grey', alignSelf: 'flex-start'}] 
              : [styles.messageContainer, {marginBottom: 0, backgroundColor: 'grey', alignSelf: 'flex-start'}] : [styles.messageContainer, {backgroundColor: 'grey', alignSelf: 'flex-start'}]}>
              <TouchableOpacity activeOpacity={1}  onPress={() => handleMessagePress(item)}
              onLongPress={() => {toggleCopyToTrue(item); setTextCopied(item.message.text)}}>
                {item.message.text !== "" ?
                <>
                
                <Text style={[styles.messageText]}></Text>
                
                </> : null}
              </TouchableOpacity> 
              
            </View>
                {item.likedBy.length > 0 && !item.copyModal ? 
                
                    <View style={item.user == user.uid ? {position: 'relative', bottom: 15, left: 17} : {position: 'relative', right: 25}}>
                        <MaterialCommunityIcons name='heart' size={20} color="red"/>
                    </View> : null}
                
            
            {lastMessageId == item.id && readBy.length > 1 && item.user == user.uid ? <Text style={[styles.readRightText, {color: theme.color}]}>{readBy.length - 1} Read</Text> : null}
            </View>
            : null
            : item.message.text != undefined ? 
              <>
            <View style={index != completeMessages.length - 1 && completeMessages[index].timestamp != null  && completeMessages[index].timestamp.toDate != undefined
              ? completeMessages[index].timestamp.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'}) != completeMessages[index+1].timestamp.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'}) ? [styles.messageContainer] 
              : [styles.messageContainer, {marginBottom: 0}] : [styles.messageContainer]}>
              <TouchableOpacity activeOpacity={1}  onPress={() => handleMessagePress(item)}
              onLongPress={() => {toggleCopyToTrue(item); setTextCopied(item.message.text);}}>
                {item.message.text !== "" ?
                
                <Text style={[styles.messageText]}>{item.message.text}</Text>
                
                : null}
              </TouchableOpacity> 
            </View>
            {item.likedBy.length > 0 && !item.copyModal ? 
                
                    <View style={{position: 'relative', bottom:12, marginRight: 'auto', left: 25}}>
                        <MaterialCommunityIcons name='heart' size={20} color="red"/>
                    </View> : null}
             {lastMessageId == item.id && readBy.length > 1 && item.user == user.uid ? <Text style={[styles.readRightText, {color: theme.color}]}>{readBy.length - 1} Read</Text> : null}
            </> : null
            }
            
            {
              item.copyModal ?
              <View style={styles.copyModal}>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => copyFunction(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Copy</Text>
                  <MaterialCommunityIcons name='content-copy' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
                <Divider color={theme.color}/>
                {item.user == user.uid ? <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => deleteMessage(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Delete Message</Text>
                  <MaterialCommunityIcons name='delete' size={20} style={{alignSelf: 'center'}} color={theme.color}/>
                </TouchableOpacity>
                <Divider color={theme.color}/> 
                </>
                : null}
               {!reportedContent.includes(item.id) ? 
                <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, theme: false, comment: null, cliqueId: null, post: false, comments: false, message: true, cliqueMessage: false, reportedUser: item.user})}>
                  <Text style={[styles.copyText, {color: '#fafafa'}]}>Report</Text>
                  <MaterialIcons name='report' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity> 
                <Divider color={theme.color}/> 
                </>
                : null}
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => toggleCopyToFalse(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Cancel</Text>
                  <MaterialIcons name='cancel' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
              </View> 
              :
               <View style={{margin: '2.5%'}}>
          <TouchableOpacity activeOpacity={1}  onPress={() => handleImagePress(item)} onLongPress={() => {toggleSaveToTrue(item); setImageCopied(item.message.image)}}>
            { uploading ? <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
            :
            item.message.image != undefined && user.uid == item.user ? 
            <>
            
            <FastImage source={{uri: item.message.image}} style={[styles.regImage, {marginRight: -5}]}/>
            {item.likedBy.length > 0 && !item.saveModal ? 
                
                    <View style={item.user == user.uid ? {position: 'relative', bottom: 10, left: 5}: {position: 'relative', bottom: 11, left: 170}}>
                        <MaterialCommunityIcons name='heart' size={20} color="red"/>
                    </View> : null}
            {lastMessageId == item.id && readBy.length > 1 && item.user == user.uid ? <Text style={[styles.readRightText, {color: theme.color}]}>{readBy.length - 1} Read</Text> : null}
            {(item.saveModal && item.user === user.uid) || (item.saveModal && !reportedContent.includes(item.id)) ?  
          <View style={[styles.copyModal, {marginTop: '5%'}]}>
            {item.user == user.uid ? <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => deleteMessage(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Delete Message</Text>
                  <MaterialCommunityIcons name='delete' size={20} style={{alignSelf: 'center'}} color={theme.color}/>
                </TouchableOpacity>
                <Divider color={theme.color}/> 
                </>
                : null}
                {!reportedContent.includes(item.id) ? 
                <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, theme: false, comment: null, cliqueId: null, post: false, comments: false, message: true, cliqueMessage: false, reportedUser: item.user})}>
                  <Text style={[styles.copyText, {color: '#fafafa'}]}>Report</Text>
                  <MaterialIcons name='report' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity> 
                <Divider color={theme.color}/> 
                </>
                : null}
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => toggleSaveToFalse(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Cancel</Text>
                  <MaterialIcons name='cancel' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
              </View> 
          : null}
            </>
             : null}
          </TouchableOpacity>
          </View>
            }
            </View> :
          item.message.post != undefined && item.message.post == null && item.user == user.uid ? 
              <>
              <View style={item.user == user.uid ? [styles.postContainer, {height: 60}] : [styles.postContainer, {backgroundColor: "grey", height: 60, alignSelf: 'flex-start'}]}>
                <Text style={[styles.postUsername, {color: "#fafafa"}]}>Post unavailable</Text>
            </View>
            
            {lastMessageId == item.id && readBy.length > 1 && item.user == user.uid ? <Text style={[styles.readRightText, {color: theme.color}]}>{readBy.length - 1} Read</Text> : null}
            </> 
             :  
             item.message.post != undefined && item.message.post == null && item.user != user.uid ? 
             <View style={styles.addpfp}>
               {pfps[pfps.findIndex(obj => obj.user === item.user)] != undefined ? pfps[pfps.findIndex(obj => obj.user === item.user)].username ? <Text style={styles.username}>{pfps[pfps.findIndex(obj => obj.user === item.user)].username}</Text> : null : null}
              <TouchableOpacity onPress={() => navigation.navigate('ViewingProfile', {name: item.user, viewing: true})}>
            {pfps[pfps.findIndex(obj => obj.user === item.user)] != undefined ? pfps[pfps.findIndex(obj => obj.user === item.user)].pfp ? <FastImage source={{uri: pfps[pfps.findIndex(obj => obj.user === item.user)].pfp}} style={styles.pfp}/> :
               <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.pfp}/> : <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.pfp}/>
              }
              </TouchableOpacity>
             <>
              <View style={item.user == user.uid ? [styles.postContainer, {height: 60}] : [styles.postContainer, {backgroundColor: "grey", height: 60, alignSelf: 'flex-start'}]}>
                <Text style={[styles.postUsername, {color: "#fafafa"}]}>Post unavailable</Text>
            </View>
            
            {lastMessageId == item.id && readBy.length > 1 && item.user == user.uid ? <Text style={[styles.readRightText, {color: theme.color}]}>{readBy.length - 1} Read</Text> : null}
            </> 
            </View>
             :
          item.message.post != undefined && item.message.post.multiPost == true  ? 
          item.user != user.uid ? 
          <View style={styles.addpfp}>

         <TouchableOpacity onPress={() => navigation.navigate('ViewingProfile', {name: item.user, viewing: true})}>
            {pfps[pfps.findIndex(obj => obj.user === item.user)] != undefined ? pfps[pfps.findIndex(obj => obj.user === item.user)].pfp ? <FastImage source={{uri: pfps[pfps.findIndex(obj => obj.user === item.user)].pfp}} style={styles.pfp}/> :
               <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.pfp}/> : <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.pfp}/>
              }
              </TouchableOpacity>
              <View>
          <View>
                         {pfps[pfps.findIndex(obj => obj.user === item.user)] != undefined ? pfps[pfps.findIndex(obj => obj.user === item.user)].username ? <Text style={styles.username}>{pfps[pfps.findIndex(obj => obj.user === item.user)].username}</Text> : null : null}
            <TouchableOpacity style={item.message.post.caption.length == 0 ? [styles.postContainer, {backgroundColor: "grey", height: 295, paddingRight: 8.5}] : [styles.postContainer, {backgroundColor: "grey", paddingRight: 8.5}]} activeOpacity={1} onPress={() => handlePostPress(item)}
          onLongPress={item.user == user.uid ? () => {setUserCopied(item.message.post.username); toggleSaveToTrue(item);}: () => {
               setUserCopied(item.message.post.username); toggleSaveToTrue(item);
            }}>
                <View>
                <View style={{flexDirection: 'row'}}>
                  {item.message.post.pfp ?  <FastImage source={{uri: item.message.post.pfp}} style={styles.imagepfp}/> :
               <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.imagepfp}/>
              }
                    <Text style={[styles.postUsername, {color: "#fafafa"}]}>@{item.message.post.username}</Text>
                </View>
                 {item.message.post.post[0].image ?
                      <FastImage source={{uri: item.message.post.post[0].post, priority: 'normal'}} style={item.message.post.caption.length == 0 ? styles.image
                    : [styles.image, {borderBottomLeftRadius: 0, borderBottomRightRadius: 0}]}/>: item.message.post.post[0].video ?
                      <FastImage source={{uri: item.message.post.post[0].thumbnail, priority: 'normal'}} style={item.message.post.caption.length == 0 ? [styles.image]
                    : [styles.image, {borderBottomLeftRadius: 0, borderBottomRightRadius: 0}]}/> : <View style={{backgroundColor: theme.backgroundColor, borderRadius: 10, width: '95%', marginLeft: "2.5%"}}>
                    <Text style={[styles.image, {fontSize: item.message.post.post[0].textSize, fontFamily: 'Montserrat_500Medium',  width: '95%', color: theme.color}]}>{item.message.post.post[0].value}</Text>
                    </View>
                     }
                {item.message.post.caption.length > 0 ? 
                <View style={{width: '75%'}}>
                  <Text numberOfLines={1} style={[styles.captionText, {color: "#fafafa"}]}>{item.message.post.username} - {item.message.post.caption}</Text> 
                </View>
                : null}
                
                </View>
            </TouchableOpacity>
            
            
            </View>
            {item.likedBy.length > 0 && !item.saveModal && item.message.text.length == 0 ?
                   
                        <MaterialCommunityIcons name='heart' size={20} color="red" style={{position: 'relative', zIndex: 2, left: 217, bottom: 17}}/>
                     : null}
            {item.message.text.length > 0 ? 
            <View style={index != completeMessages.length - 1 && completeMessages[index].timestamp != null  && completeMessages[index].timestamp.toDate != undefined
              ? completeMessages[index].timestamp.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'}) != completeMessages[index+1].timestamp.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'}) ? [styles.messageContainer, {backgroundColor: 'grey', alignSelf: 'flex-start'}] 
              : [styles.messageContainer, {marginBottom: 0, backgroundColor: 'grey', alignSelf: 'flex-start'}] : [styles.messageContainer, {backgroundColor: 'grey', alignSelf: 'flex-start'}]}>
              <TouchableOpacity activeOpacity={1}  onPress={() => handleMessagePress(item)}
              onLongPress={() => {toggleCopyToTrue(item); setTextCopied(item.message.text); setReplyTo(item.user == user.uid ? user.uid : item.userName)}}>
                {item.message.text !== "" ?
                <>
                
                <Text style={[styles.messageText]}>{item.message.text}</Text>
                
                </> : null}
              </TouchableOpacity> 
              {item.likedBy.length > 0 && !item.saveModal ?
                        <MaterialCommunityIcons name='heart' size={20} color="red" style={{position: 'absolute', zIndex: 2, right: 10, top: 28}}/>
                     : null}
              
            </View> 
            
            : null}
            {(item.saveModal && item.user === user.uid) || (item.saveModal && !reportedContent.includes(item.id)) ?  
          <View style={[styles.copyModal, {marginTop: '5%'}]}>
            {item.user == user.uid ? <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => deleteMessage(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Delete Message</Text>
                  <MaterialCommunityIcons name='delete' size={20} style={{alignSelf: 'center'}} color={theme.color}/>
                </TouchableOpacity>
                <Divider color={theme.color}/> 
                </>
                : null}
                {!reportedContent.includes(item.id) ? 
                <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, theme: false, comment: null, cliqueId: null, post: false, comments: false, message: true, cliqueMessage: false, reportedUser: item.user})}>
                  <Text style={[styles.copyText, {color: '#fafafa'}]}>Report</Text>
                  <MaterialIcons name='report' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity> 
                <Divider color={theme.color}/> 
                </>
                : null}
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => toggleSaveToFalse(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Cancel</Text>
                  <MaterialIcons name='cancel' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
              </View> 
          : null}
            
            
            
            {lastMessageId == item.id && readBy.length > 1 && item.user == user.uid ? <Text style={[styles.readRightText, {color: theme.color}]}>{readBy.length - 1} Read</Text> : null}
          </View>
          </View>
           : 
           <View>
          <View>
            <TouchableOpacity style={item.message.post.caption.length == 0 ? [styles.postContainer, {height: 295}] : styles.postContainer} activeOpacity={1} onPress={() => handlePostPress(item)}
          onLongPress={item.user == user.uid ? () => { setUserCopied(item.message.post.username); toggleSaveToTrue(item); }: () => {
               setUserCopied(item.message.post.username); toggleSaveToTrue(item);
            }}>
                <View>
                <View style={{flexDirection: 'row'}}>
                  {item.message.post.pfp ?  <FastImage source={{uri: item.message.post.pfp}} style={styles.imagepfp}/> :
               <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.imagepfp}/>
              }
                    <Text style={[styles.postUsername, {color: "#fafafa"}]}>@{item.message.post.username}</Text>
                </View>
                 {item.message.post.post[0].image ?
                      <FastImage source={{uri: item.message.post.post[0].post, priority: 'normal'}} style={item.message.post.caption.length == 0 ? styles.image
                    : [styles.image, {borderBottomLeftRadius: 0, borderBottomRightRadius: 0}]}/>: item.message.post.post[0].video ?
                      <FastImage source={{uri: item.message.post.post[0].thumbnail, priority: 'normal'}} style={item.message.post.caption.length == 0 ? [styles.image]
                    : [styles.image, {borderBottomLeftRadius: 0, borderBottomRightRadius: 0}]}/> : <View style={{backgroundColor: theme.backgroundColor, borderRadius: 10, width: '95%', marginLeft: "2.5%"}}>
                    <Text style={[styles.image, {fontSize: item.message.post.post[0].textSize, fontFamily: 'Montserrat_500Medium', width: '95%', color: theme.color}]}>{item.message.post.post[0].value}</Text>
                    </View>
                     }
                {item.message.post.caption.length > 0 ? 
                <View style={{width: '75%'}}>
                  <Text numberOfLines={1} style={[styles.captionText, {color: "#fafafa"}]}>{item.message.post.username} - {item.message.post.caption}</Text> 
                </View>
                : null}
                
                </View>
            </TouchableOpacity>
            
            
            </View>
            {item.likedBy.length > 0 && !item.saveModal && item.message.text.length == 0 ?
                   
                        <MaterialCommunityIcons name='heart' size={20} color="red" style={{position: 'relative', zIndex: 2, left: 18, bottom: 19}}/>
                     : null}
            {item.message.text.length > 0 ? 
            <View style={index != completeMessages.length - 1 && completeMessages[index].timestamp != null  && completeMessages[index].timestamp.toDate != undefined
              ? completeMessages[index].timestamp.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'}) != completeMessages[index+1].timestamp.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'}) ? [styles.messageContainer] 
              : [styles.messageContainer, {marginBottom: 0}] : [styles.messageContainer]}>
              <TouchableOpacity activeOpacity={1}  onPress={() => handleMessagePress(item)}
              onLongPress={() => {toggleCopyToTrue(item); setTextCopied(item.message.text); setReplyTo(item.user == user.uid ? user.uid : item.userName)}}>
                {item.message.text !== "" ?
                <>
                
                <Text style={[styles.messageText]}>{item.message.text}</Text>
                
                </> : null}
              </TouchableOpacity> 
              {item.likedBy.length > 0 && !item.saveModal ?
                   
                        <MaterialCommunityIcons name='heart' size={20} color="red" style={{position: 'absolute', zIndex: 2, left: 10, top: 28}}/>
                     : null}
              
            </View> 
            
            : null}
            {(item.saveModal && item.user === user.uid) || (item.saveModal && !reportedContent.includes(item.id)) ?  
          <View style={[styles.copyModal, {marginTop: '5%'}]}>
            {item.user == user.uid ? <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => deleteMessage(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Delete Message</Text>
                  <MaterialCommunityIcons name='delete' size={20} style={{alignSelf: 'center'}} color={theme.color}/>
                </TouchableOpacity>
                <Divider color={theme.color}/> 
                </>
                : null}
                {!reportedContent.includes(item.id) ? 
                <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, theme: false, comment: null, cliqueId: null, post: false, comments: false, message: true, cliqueMessage: false, reportedUser: item.user})}>
                  <Text style={[styles.copyText, {color: '#fafafa'}]}>Report</Text>
                  <MaterialIcons name='report' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity> 
                <Divider color={theme.color}/> 
                </>
                : null}
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => toggleSaveToFalse(item)}>
                  <Text style={[styles.copyText, {color: "#fafafa"}]}>Cancel</Text>
                  <MaterialIcons name='cancel' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
              </View> 
          : null}
            
            
            
            {lastMessageId == item.id && readBy.length > 1 && item.user == user.uid ? <Text style={[styles.readRightText, {color: theme.color}]}>{readBy.length - 1} Read</Text> : null}
          </View> 
          : 
          item.message.post != undefined && item.message.post.multiPost == false ? 
          <>
          <View style={styles.postContainer}>
          <TouchableOpacity activeOpacity={1} onPress={() => handlePostPress(item)}
          onLongPress={item.user == user.uid ? () => { setUserCopied(item.message.post.username); }: () => {
              setUserCopied(item.message.post.username)
            }}>
                <View>
                <View style={{flexDirection: 'row'}}>
                    {item.message.post.pfp ?  <FastImage source={{uri: item.message.post.pfp}} style={styles.imagepfp}/> :
               <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.imagepfp}/>
              }
                    <Text style={[styles.postUsername, {color: "#fafafa"}]}>@{item.message.post.username}</Text>
                </View>
                    <FastImage source={{uri: item.message.post.post}} style={item.message.post.caption.length == 0 ? styles.image
                    : [styles.image, {borderBottomLeftRadius: 0, borderBottomRightRadius: 0}]}/>
                {item.message.post.caption.length > 0 ? 
                <View style={{width: '75%'}}>
                  <Text numberOfLines={1} style={[styles.captionText, {color: "#fafafa"}]}>{item.message.post.username} - {item.message.post.caption}</Text> 
                </View>
                : null}
                
                </View>
            </TouchableOpacity>
            </View>
            
            
            {item.likedBy.length > 0 ?
                    <View style={{position: 'relative', bottom: 20, left: 20}}>
                        <MaterialCommunityIcons name='heart' size={20} color="red"/>
                    </View> : null}
            {lastMessageId == item.id && readBy.length > 1 && item.user == user.uid ? <Text style={[styles.readRightText, {color: theme.color}]}>{readBy.length - 1} Read</Text> : null}
            </>
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
                    
                    <Text style={[styles.username, {color: theme.color, fontSize: 15.36, marginTop: '3.5%', textAlign: 'center'}]}>{groupName}</Text>
                    {/* <View style={{width: '70%', marginLeft: '15%', marginTop: '5%'}}>
                        <MainButton text={"Go to Cliq"} onPress={() => navigation.navigate('GroupHome', {name: group, newPost: false, postId: null})}/>
                    </View> */}
                </View> : null}
        {post && !doneSending ? 
          <View style={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
            <TouchableOpacity style={post.caption.length == 0 ? [styles.postContainer, {height: 295, paddingRight: 8.5}] : styles.postContainer} activeOpacity={1}>
                <View>
                <View style={{flexDirection: 'row'}}>
                  {post.pfp ?  <FastImage source={{uri: post.pfp}} style={styles.imagepfp}/> :
               <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.imagepfp}/>
              }
                    <Text style={[styles.postUsername, {color: "#fafafa"}]}>@{post.username}</Text>
                </View>
                 {post.post[0].image ?
                      <FastImage source={{uri: post.post[0].post, priority: 'normal'}} style={post.caption.length == 0 ? styles.image
                    : [styles.image, {borderBottomLeftRadius: 0, borderBottomRightRadius: 0}]}/>: post.post[0].video ?
                     <FastImage source={{uri: post.post[0].thumbnail, priority: 'normal'}} style={post.caption.length == 0 ? [styles.image]
                    : [styles.image, {borderBottomLeftRadius: 0, borderBottomRightRadius: 0}]}/> : <Text style={[styles.image, {fontSize: post.post[0].textSize, width: '95%', color: theme.color}]}>{post.post[0].value}</Text>
                     }
                {post.caption.length > 0 ? 
                <View>
                  <Text numberOfLines={1} style={[styles.captionText, {color: "#fafafa"}]}>{post.username} - {post.caption}</Text> 
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
    </Provider>
  )
}

export default GroupChat

const styles = StyleSheet.create({
    container: {
    flex: 1,
    //backgroundcolor: '#fafafa'
  },
  officialText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 15.36,
    color: "#fafafa",
    textAlign: 'center',
    padding: 10
  },
  messageContainer: {
    padding: 20,
    paddingVertical: 10,
    margin: '2.5%',
    maxWidth: 255,
    //width: '45%',
    //marginLeft: '50%',
    backgroundColor: '#005278',
    borderRadius: 20,
    marginVertical: 0,
    marginBottom: 0,
    //marginRight: '7.5%',
    //paddingTop: 0,
    alignSelf: 'flex-end'

  },
  postContainer: {
    margin: '2.5%',
    padding: 5,
    //width: 250,
    //paddingLeft: 2,
    height: 325,
    width: 245,
    //width: '65%',
    //marginBottom: 0,
    borderRadius: 20,
    backgroundColor: "#005278"
    //alignSelf: 'center'
  },
  messageText: {
    fontSize: 16,
    color: "#fafafa",
    fontFamily: 'Montserrat_500Medium',
  },
  timestampText: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#888',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: 0,
    //backgroundcolor: '#fafafa',
    //justifyContent: 'flex-end',
    //marginBottom: '7.5%',
    marginRight: 0,
    zIndex: 2
    //backgroundcolor: '#fafafa'
  },
  input: {
    //flex: 1,
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
  textinput: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    alignSelf: 'center',
    paddingLeft: 5,
    
  },  
  sendButton: {
    //marginLeft: 2,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#005278',
    borderRadius: 8,
    marginBottom: '2.5%',
    justifyContent: 'center',
    //marginLeft: '-6%'
  },
  sendButtonText: {
    fontWeight: 'bold',
    //alignSelf: 'center'
  },
  postUsername: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    //padding: 5,
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
    //marginTop: '5%'
  },
  image: {height: 220, width: 223.4375, borderRadius: 8, marginLeft: 5},
  regImage: {
    height: 200,
    width: 200,
    borderRadius: 10,
    resizeMode: 'contain'
  },
  fullImage: {
    /* height: 650,
    width: 350, */
    width: 350, // Specific width (optional)
    height: 650,
    //marginLeft: '-10%'
  },
  username: {
      fontSize: 12.29,
      padding: 10,
      textAlign: 'left',
      fontFamily: 'Montserrat_500Medium',
      color: "#FAFAFA"
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
  copyModal: {
    borderRadius: 10,
    backgroundColor: "gray",
    marginRight: '5%',
    marginTop: '5%',
    marginLeft: '5%'
  },
  copyText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    paddingRight: 10
    //padding: 10
  },
  copyTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10
  },
  replyText: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'right',
    padding: 10
  },
  addpfp: {
    flexDirection: 'row',
    alignItems: 'center',
    //alignItems: 'flex-end',
    //alignItems: 'center',
    //alignSelf: 'center',
    padding: 10
  },
  pfp: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10
  },
  replyImage: {
    height: 200,
    width: 200,
    borderRadius: 8,
  },
  readRightText: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    marginTop: 5,
    marginBottom: 5,
    textAlign: 'right',
    marginRight: 20
  },
  readLeftText: {
    fontSize: 12.29,
    marginTop: -5,
    marginBottom: 5,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'left',
    marginLeft: 20
  },
  imagepfp: {
    height: 33, width: 33, borderRadius: 8, margin: '5%'
  },
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    characterCountText: {
      fontSize: 9,
      fontFamily: 'Montserrat_500Medium',
      padding: 5,
      textAlign: 'right',
      paddingRight: 0,
      paddingTop: 2.5,
      marginRight: '7.5%',
      backgroundColor: "transparent"
    }
})