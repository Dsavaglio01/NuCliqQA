import { addDoc, collection, onSnapshot, query,  where, serverTimestamp, orderBy, startAfter, updateDoc, setDoc, doc, getCountFromServer, limit, getFirestore, getDoc, getDocs, deleteDoc, arrayUnion } from 'firebase/firestore';
import React, { useState, useEffect, useRef, useMemo, useCallback, useContext } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import useAuth from '../Hooks/useAuth';
import {MaterialCommunityIcons, FontAwesome, MaterialIcons, Ionicons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
import MainButton from '../Components/MainButton';
import { Divider } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard'
import * as MediaLibrary from 'expo-media-library';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRoute } from '@react-navigation/native';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject} from 'firebase/storage';
import * as Crypto from 'expo-crypto';
import uuid from 'react-native-uuid';
import FastImage from 'react-native-fast-image';
import {Camera} from 'expo-camera';
import {BACKEND_URL, MODERATION_API_USER, MODERATION_API_SECRET, IMAGE_MODERATION_URL} from "@env"
import { useIsFocused } from '@react-navigation/native'
import { useFonts, Montserrat_600SemiBold, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import * as Notifications from 'expo-notifications'
import { useFocusEffect } from '@react-navigation/native';
import generateId from '../lib/generateId';
import {GiftedChat} from 'react-native-gifted-chat'
import * as Haptics from 'expo-haptics';
import { Image } from 'react-native-compressor';
import themeContext from '../lib/themeContext';
import TypingIndicator from '../Components/TypingIndicator';
import axios from 'axios';
import ChatBubble from 'react-native-chat-bubble';
import { db } from '../firebase'
const PersonalChatScreen = ({route}) => {
  const {person, friendId} = route.params;
  const [loading, setLoading] = useState(true) 
  const storage = getStorage();
  const isFocused = useIsFocused();
  const [singleMessageLoading, setSingleMessageLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [lastMessageId, setLastMessageId] = useState('');
  const [reportedItem, setReportedItem] = useState(null);

  const [readBy, setReadBy] = useState([]);
  const [lastVisible, setLastVisible] = useState();
  const responseListener = useRef();
  const inputRef = useRef();
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [animatedValue] = useState(new Animated.Value(0))
  //console.log(messages.length)
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [active, setActive] = useState(true);
  const [actualUser, setActualUser] = useState(null);
  const [newMessages, setNewMessages] = useState([]);
  const [requests, setRequests] = useState([]);
  const [inputText, setInputText] = useState('');
  const [liked, setLiked] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // To track if it's the first render
  const hasScrolled = useRef(false);
  const theme = useContext(themeContext)
  const [imageModal, setImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null)
  const [replyItem, setReplyItem] = useState(null);
  const [replyTo, setReplyTo] = useState('');
  const [saveModal, setSaveModal] = useState(false);
  const [textCopied, setTextCopied] = useState('');
  const [reportedContent, setReportedContent] = useState([]);
  const [userCopied, setUserCopied] = useState('');
  const [imageCopied, setImageCopied] = useState(null);
  const [themeCopied, setThemeCopied] = useState(null); 
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [friends, setFriends] = useState(0);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [id, setId] = useState();
   const [tapCount, setTapCount] = useState(0);
   const [permission, requestPermission] = Camera.useCameraPermissions();
  const timerRef = useRef(null);
  const {user} = useAuth()
  //console.log(user.uid)
  //console.log(newMessages.length)
  const navigation = useNavigation();
  const routeName = useRoute();

  //console.log(person.pfp)
  //console.log(routeName
  useEffect(() => {
    const getData = async() => {
      const docSnap = await getDoc(doc(db, 'profiles', user.uid))
      setActualUser({id: docSnap.id, ...docSnap.data()})
    }
    getData()
  }, [])
  useEffect(() => {
    let unsub;
    unsub = onSnapshot(doc(db, "friends", friendId), (document) => {
        setActive(document.data().active)
  });
  return unsub;
  }, [onSnapshot])
  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        await updateDoc(doc(db, 'profiles', user.uid), {
        activeOnMessage: true
      })
      }
      fetchData()
      // This block of code will run when the screen is focused
      

      // Clean-up function when the component unmounts or the screen loses focus
      return async() => {
        await updateDoc(doc(db, 'profiles', user.uid), {
        activeOnMessage: false,
        messageTyping: false
      })
      };
    }, []))
  useEffect(() => {
    if (isFocused) {
      // User is on this screen
      const getActive = async() => {
        await updateDoc(doc(db, 'profiles', user.uid), {
          messageActive: true
        })
      }
      getActive();
      // Implement any additional logic you need
    } else {
      // User has left this screen
      const getActive = async() => {
        await updateDoc(doc(db, 'profiles', user.uid), {
          messageActive: false
        })
      }
      getActive();
      // Implement any cleanup or additional logic as needed
    }

    // You can also integrate Firebase analytics events here if needed

    return () => {
      // Cleanup logic when component unmounts or screen changes
    };
  }, [isFocused]);
 async function schedulePushTextNotification(id, firstName, lastName, message, notificationToken) {
  let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
  let activeNoties = (await getDoc(doc(db, 'profiles', id))).data().activeOnMessage
  let banned = (await getDoc(doc(db, 'profiles', id))).data().banned
  //console.log(first)
  const deepLink = `nucliqv1://PersonalChat?person=${actualUser}&friendId=${friendId}`;
      if (notis && !activeNoties && !banned) {
      await fetch(`${BACKEND_URL}/api/textNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: firstName, lastName: lastName, 
        message: message, pushToken: notificationToken, "content-available": 1, data: {routeName: 'PersonalChat', person: actualUser, friendId: friendId, deepLink: deepLink}
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
  async function schedulePushLikedMessageNotification(id, firstName, lastName, notificationToken) {
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    let activeNoties = (await getDoc(doc(db, 'profiles', id))).data().activeOnMessage
    let banned = (await getDoc(doc(db, 'profiles', id))).data().banned
    const deepLink = `nucliqv1://PersonalChat?person=${actualUser}&friendId=${friendId}`;
      if (notis && !activeNoties && !banned) {
      fetch(`${BACKEND_URL}/api/likePostNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: firstName, lastName: lastName, pushToken: notificationToken, "content-available": 1, data: {routeName: 'PersonalChat', person: actualUser, friendId: friendId, deepLink: deepLink}
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
  async function schedulePushImageNotification(id, firstName, lastName, notificationToken) {
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    let activeNoties = (await getDoc(doc(db, 'profiles', id))).data().activeOnMessage
    let banned = (await getDoc(doc(db, 'profiles', id))).data().banned
    const deepLink = `nucliqv1://PersonalChat?person=${actualUser}&friendId=${friendId}`;
      if (notis && !activeNoties && !banned) {
    fetch(`${BACKEND_URL}/api/imageNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: firstName, lastName: lastName, pushToken: notificationToken, 'content-available': 1, data: {routeName: 'PersonalChat', person: actualUser, friendId: friendId, deepLink: deepLink}
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
  
  //console.log(friendId)
  useEffect(() => {
    let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'friends', friendId, 'chats'), orderBy('timestamp', 'desc'), limit(25)), (snapshot) => {
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
  }, [])
  function fetchMoreData() {
    console.log('first')
      if (lastVisible != undefined) {
        
    let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'friends', friendId, 'chats'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(25)), (snapshot) => {
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
    //console.log(messages.length)
  useEffect(() => {
    const getUsername = async() => {
      const nameOfUser = (await getDoc(doc(db, 'profiles', user.uid))).data().userName
      const nameFirst = (await getDoc(doc(db, 'profiles', user.uid))).data().firstName
      const nameLast = (await getDoc(doc(db, 'profiles', user.uid))).data().lastName
      
      setUsername(nameOfUser)
      setLastName(nameLast)
      setFirstName(nameFirst)
  
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
  useEffect(()=> {
      let unsub;
      const fetchRequests = () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'requests'), where('actualRequest', '==', true)), (snapshot) => {
          setRequests(snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })))
        })
      }
      fetchRequests();
      return unsub;
    }, []);
  //console.log(newMessages.length)
  useMemo(() => {
    if (messages.length > 0) {
      //console.log('first')
      new Promise(resolve => {
      const newArray = [...messages];
      messages.map((item, index) => {
        //console.log(item)
        if (item) {
      if (item.message.post != undefined) {
        //console.log('first')
        /* if (item.message.post.group != undefined) {
          //console.log(item.message.post)
          const getData = async() => {
          //const docSnap = await getDoc(doc(db, 'groups', item.message.post.group))
            //console.log(docSnap.data())
            newArray[index].message.post = newArray[index].message.post
            //console.log(newArray)
            setNewMessages(newArray)
          
        }

      
          getData()
        } */
        if (item.message.post.group == undefined && item.video) {
          //console.log('first')
          const getData = async() => {
          const docSnap = await getDoc(doc(db, 'videos', item.message.post.id))
          if (docSnap.exists()) {
           
            newArray[index].message.post = {id: docSnap.id, ...docSnap.data()}
            //console.log(newArray[index])
            setNewMessages(newArray)
            //console.log(newArray[0])
          }
          else {
            newArray[index].message.post = null
            setNewMessages(newArray)
          }
          
        }
        getData()
        }
        else if (item.message.post.group == undefined && !item.video) {
          //console.log(item.message.post)
          //console.log('first')
          const getData = async() => {
          const docSnap = await getDoc(doc(db, 'posts', item.message.post.id))
          if (docSnap.exists()) {
           
            newArray[index].message.post = {id: docSnap.id, ...docSnap.data()}
            //console.log(newArray[index])
            setNewMessages(newArray)
            //console.log(newArray[0])
          }
          else {
            newArray[index].message.post = null
            setNewMessages(newArray)
          }
          
        }
        getData()
        }

        //console.log(index)
        
      }
      else if (item.message.theme != undefined) {
        //console.log(item.message.theme.images[0])
        const getData = async() => {
          //const docSnap = await getDoc(doc(db, 'products', item.message.theme.id))
          const themeRef = collection(db, 'products')
                const q = query(themeRef, where('images', 'array-contains', item.message.theme.images[0]))
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                  if (doc.exists()) {
                    newArray[index].message.theme = {...item, id: doc.id, ...doc.data(), purchased: true, free: false}
                  //console.log(newArray)
                  //console.log(newArray)
                  setNewMessages(newArray)
                  }
                  else {
                    newArray[index].message.theme == null
                    setNewMessages(newArray)
                  }
                  //console.log(doc)
                  
                })
        const freeThemeRef = collection(db, 'freeThemes')
                const freeQ = query(freeThemeRef, where('images', 'array-contains', item.message.theme.images[0]))
                const freeQuerySnapshot = await getDocs(freeQ);
                freeQuerySnapshot.forEach((doc) => {
                  if (doc.exists()) {
                    newArray[index].message.theme = {...item, id: doc.id, ...doc.data(), free: true, purchased: false}
                  //console.log(newArray)
                  //console.log(newArray)
                  setNewMessages(newArray)
                  }
                  
                  //console.log(doc)
                  
                }) 
        }
          getData()
      }
      else {
       setNewMessages(newArray)
      }
      //console.log(item)
      //console.log(newArray[0])
    }
    })
    resolve()
  }).finally(() => setLoading(false)); 
    }
  }, [messages])
  //console.log(newMessages[0])
  //console.log(Math.floor(Math.random() * 20))
  useEffect(() => {
    if (image != null){
      const uploadImage = async() => {
        setUploading(true);
        const response = await fetch(image)
        const bytes = await response.blob();
        const filename = `${uuid.v4()}${user.uid}${friendId}${Date.now()}message.jpg`
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
    //setImage(null)
    }
  }, [image])
  const getLink = (pfp) => {
        const starsRef = ref(storage, pfp);
        getDownloadURL(starsRef).then(async(url) =>
        checkPfp(url, starsRef))
    }
    function containsNumberGreaterThan(array, threshold) {
      return array.some(function(element) {
        return element > threshold;
      });
    }
    const getValuesFromImages = (list) => {
      //console.log(list)
      let newList = filterByType(list, 'object')
      //console.log(newList)
      let tempList = filterByType(list, 'number')
      tempList.forEach((obj) => {
        //console.log(obj)
        filterByType(Object.values(obj), 'object').forEach((e) => {
          newList.push(e)
        })
        filterByType(Object.values(obj), 'number').forEach((e) => {
          if (e.hasOwnProperty('none')) {
            delete e['none']
            Object.values(e).forEach((element) => {
              newList.push(element)
            })
          }

        })
        //newList.push(filterByType(Object.values(obj), 'object'))
      })
      //console.log(newList)
      return newList
    }
    function filterByType(arr, type) {
      return arr.filter(function(item) {
        return typeof item !== type;
      });
    }
    useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);
  const heartColor = 'gray';
  const likedHeartColor = 'red'
  const userPostContainer = {
    margin: 5,
    //marginBottom: 0,
    paddingTop: 5,
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 5,
    maxWidth: 270,
    alignSelf: 'flex-end',
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
    borderRadius: 20,
    backgroundColor: '#9edaff',
  }
  const postContainer = {
    margin: 5,
    //marginBottom: 0,
    padding: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 20,
    maxWidth: 270,
    alignSelf: 'flex-start',
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
    borderRadius: 20,
    backgroundColor: '#005278',
    //alignSelf: 'center'
  }
  const userBubbleStyle = {
    backgroundColor: '#9edaff',
    padding: 10,
    
    margin: 5,
    borderRadius: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 5,
    maxWidth: 200,
    alignSelf: 'flex-end',
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  }
   const bubbleStyle = {
    backgroundColor: '#005278',
    padding: 10,
    
    margin: 5,
    borderRadius: 20,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 20,
    maxWidth: 200,
    alignSelf: 'flex-start',
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  };
  const checkPfp = async(url, reference) => {
    //console.log(url, reference)
     axios.get(`${IMAGE_MODERATION_URL}`, {
            params: {
                'url': url,
                'models': 'nudity-2.0,wad,offensive,gore',
                'api_user': `${MODERATION_API_USER}`,
                'api_secret': `${MODERATION_API_SECRET}`,
            }
            })
            .then(async function (response) {
            if(response.data.nudity.hasOwnProperty('none')) {
              delete response.data.nudity['none']
            }
            if (response.data.nudity.hasOwnProperty('context')) {
              delete response.data.nudity.context
            }
            if (response.data.nudity.hasOwnProperty('erotica')) {
              if (response.data.nudity.erotica >= 0.68) {
                Alert.alert('Unable to Send', `This Goes Against Our Guidelines`, [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => deleteObject(reference).then(() => {setUploading(false);}).catch((error) => {
                  throw error;
                  
                })},
              ]);
              throw null;
              }
              else {
                delete response.data.nudity.erotica
              }
              //console.log(response.data.nudity.suggestive)
            }
            if (response.data.drugs > 0.9 || response.data.gore.prob > 0.9 || containsNumberGreaterThan(getValuesFromImages(Object.values(response.data.nudity)), 0.95)
            || containsNumberGreaterThan(Object.values(response.data.offensive), 0.9) || response.data.recreational_drugs > 0.9 || response.data.medical_drugs > 0.9 ||
            response.data.skull.prob > 0.9 || response.data.weapon > 0.9 || response.data.weapon_firearm > 0.9 || response.data.weapon_knife > 0.9) {
              Alert.alert('Unable to Send', 'This Goes Against Our Guidelines', [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => deleteObject(reference).then(() => setUploading(false)).catch((error) => {
                  console.error(error)
                })},
              ]);
            }
            else {
            schedulePushImageNotification(person.id, firstName, lastName, person.notificationToken)
          const docRef = await addDoc(collection(db, 'friends', friendId, 'chats'), {
        message: {image: url},
        liked: false,
        toUser: person.id,
        user: user.uid,
        firstName: firstName,
        lastName: lastName,
        pfp: person.pfp,
        readBy: [],
        timestamp: serverTimestamp()
    })
    addDoc(collection(db, 'friends', friendId, 'messageNotifications'), {
      //message: true,
      id: docRef.id,
      toUser: person.id,
      readBy: [],
      timestamp: serverTimestamp()
    }).then(async() => await updateDoc(doc(db, 'profiles', person.id), {
      messageNotifications: arrayUnion({id: docRef.id, user: user.uid})
    })).then(async() => await updateDoc(doc(db, 'friends', friendId), {
      lastMessage: {image: url},
      messageId: docRef.id,
      active: true,
      readBy: [],
      toUser: person.id,
      lastMessageTimestamp: serverTimestamp()
    }
    )).then(async() => await updateDoc(doc(db, 'profiles', user.uid, 'friends', person.id), {
      lastMessageTimestamp: serverTimestamp()
    })).then(async() => await updateDoc(doc(db, 'profiles', person.id, 'friends', user.uid), {
      lastMessageTimestamp: serverTimestamp()
    })).then(() => {
      //console.log('first')
      const newArray = [{id: docRef.id,
      message: {image: url},
        liked: false,
        toUser: person.id,
        user: user.uid,
        firstName: firstName,
        lastName: lastName,
        pfp: person.pfp,
        readBy: [],
        timestamp: serverTimestamp()}, ...newMessages]
        setNewMessages(newArray)
    })
    }  
      
                    })
            .catch(function (error) {
            // handle error
            if (error.response) console.log(error.response.data);
            else console.log(error.message);
            });
  }
  //console.log(messages)
//console.log(person)
useEffect(() => {
  //console.log('first')
  let unsub;
  const queryData = async() => {
    unsub = onSnapshot(doc(db, 'friends', friendId), async(doc) => {
        setLastMessageId(doc.data().messageId)
        setReadBy(doc.data().readBy)
    });
    await updateDoc(doc(db, 'friends', friendId), {
      readBy: arrayUnion(user.uid)
    }).then(async() => await updateDoc(doc(db, 'profiles', user.uid), {
      messageNotifications: []
    }))
    const querySnapshot = await getDocs(collection(db, 'friends', friendId, 'messageNotifications'));
    querySnapshot.forEach(async(document) => {
      if (document.data().toUser == user.uid) {
      await deleteDoc(doc(db, 'friends', friendId, 'messageNotifications', document.id)).then(async() => {
        await updateDoc(doc(db, 'friends', friendId), {
          toUser: null
        })
      })
      }
    })
  } 
  queryData()
  return unsub;
}, [])
  //console.log(active)
  //console.log(person)
  const sendMessage = async() => {
    if (active && inputText.trim() !== '') {
    if (inputText.trim() === '') {
      return;
    }
    const newMessage = {
      text: inputText,
      //user: user.uid,
      //toUser: person.id
    };
    setSingleMessageLoading(true)
    /* await updateDoc(doc(db, 'profiles', user.uid), {
      messageTyping: ''
    }) */
    inputRef.current.blur()
        schedulePushTextNotification(person.id, firstName, lastName, newMessage, person.notificationToken)
    const docRef = await addDoc(collection(db, 'friends', friendId, 'chats'), {
        message: newMessage,
        liked: false,
        toUser: person.id,
        user: user.uid,
        firstName: firstName,
        lastName: lastName,
        pfp: person.pfp,
        readBy: [],
        timestamp: serverTimestamp()
    })
    addDoc(collection(db, 'friends', friendId, 'messageNotifications'), {
      //message: true,
      id: docRef.id,
      toUser: person.id,
      readBy: [],
      timestamp: serverTimestamp()
    }).then(async() =>
         await updateDoc(doc(db, 'profiles', person.id), {
             messageNotifications: arrayUnion({id: docRef.id, user: user.uid})
         })).then(async() => await updateDoc(doc(db, 'friends', friendId), {
      lastMessage: newMessage,
      messageId: docRef.id,
      readBy: [],
      active: true,
      toUser: person.id,
      lastMessageTimestamp: serverTimestamp()
    }
    )).then(async() => await updateDoc(doc(db, 'profiles', user.uid, 'friends', person.id), {
      lastMessageTimestamp: serverTimestamp()
    })).then(async() => await updateDoc(doc(db, 'profiles', person.id, 'friends', user.uid), {
      lastMessageTimestamp: serverTimestamp()
    }))
    setInputText('');
    setSingleMessageLoading(false)
    setKeyboardFocused(false)
    
  }
  else if (!active && inputText.trim() !== 0) {
    Alert.alert('You must both be following each other first (mutual friends) in order to message!')
  }
}
  //console.log(messages)
  //console.log(user.uid)
  const renderLiked = async(actualId) => {
    if (actualId.liked == true) {
      await updateDoc(doc(db, 'friends', friendId, 'chats', actualId.id), {
      liked: false
    }).then(() => {
      const updatedArray = newMessages.map((item) => {
      if (item.id === actualId.id) {
        return { ...item, liked: false };
      }
      return item;
    });
    setNewMessages(updatedArray) 
    })
    }
    else {
      await updateDoc(doc(db, 'friends', friendId, 'chats', actualId.id), {
      liked: true
    }).then(() => {
      const updatedArray = newMessages.map((item) => {
      if (item.id === actualId.id) {
        return { ...item, liked: true };
      }
      return item;
    });
    setNewMessages(updatedArray) 
    }).then(actualId.user != user.uid ? () => schedulePushLikedMessageNotification(person.id, firstName, lastName, person.notificationToken) : null)
    //console.log(updatedArray)
    
    }
    }
  //console.log(messages)
  async function pickCamera () {
    await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4,3],
            quality: 0.2
        }).then(image  => {
          if (image) {
            setImage(image.assets[0].uri)
            //setImage(image.assets.uri)
          }
        })

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
  useEffect(() =>{
    const getFriends = async() => {
      const coll = collection(db, 'profiles', person.id, 'friends');
      const snapshot = await getCountFromServer(coll)
      let count = snapshot.data().count.toString()
      //console.log(snapshot.data().count
      setFriends(count)
    } 
    getFriends()
    return;
  }, [])
  useEffect(() => {
    let unsub;
    unsub = onSnapshot(doc(db, 'profiles', person.id), (doc) => {
      if (doc.data().messageTyping) {
        if (doc.data().messageTyping == user.uid) {
          setTyping(true)
        }
      }
      else {
        setTyping(false)
      }
    })
    return unsub;
  }, [onSnapshot])
   //console.log(typing)




  //console.log(messages.length)
  //console.log(friendId)
  async function copyFunction(item) {
    await Clipboard.setStringAsync(textCopied).then(()=> toggleCopyToFalse(item)).catch((error) => console.warn(error))
  }
  async function deleteMessage(item) {
      const newMessage = newMessages[newMessages.indexOf(item.id) + 2]
      //item.message.image
      if (newMessage) {
        if (item.message.image) {
            try {
    const response = await fetch(`${BACKEND_URL}/api/deleteImageMessageNewMessage`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, image: item.message.image, friendId: friendId, newMessage: newMessage}}), // Send data as needed
    })
    const data = await response.json();
    //console.log(data)
      if (data.done) {
        setNewMessages(newMessages.filter((e) => e.id != item.id))
        setLastMessageId(newMessage.id)
      }
    } catch (e) {
      console.error(e);
      
    }

        }
        else {
          try {
    const response = await fetch(`${BACKEND_URL}/api/deleteMessageNewMessage`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, friendId: friendId, newMessage: newMessage}}), // Send data as needed
    })
    const data = await response.json();
    //console.log(data)
      if (data.done) {
        setNewMessages(newMessages.filter((e) => e.id != item.id))
        setLastMessageId(newMessage.id)
      }
    } catch (e) {
      console.error(e);
      
    }
        }
        
      }
      else {
        if (item.message.image) {
          try {
    const response = await fetch(`${BACKEND_URL}/api/deleteImageMessage`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, image: item.message.image, friendId: friendId, newMessage: newMessage}}), // Send data as needed
    })
    const data = await response.json();
    //console.log(data)
      if (data.done) {
          setNewMessages(newMessages.filter((e) => e.id != item.id))
      }
    } catch 
    (e) {
      console.error(e);
      
    }
        }
        else {

          try {
    const response = await fetch(`${BACKEND_URL}/api/deleteMessage`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, friendId: friendId, newMessage: newMessage}}), // Send data as needed
    })
    const data = await response.json();
    //console.log(data)
      if (data.done) {
          setNewMessages(newMessages.filter((e) => e.id != item.id))
      }
    } catch 
    (e) {
      console.error(e);
      
    }
        }
        
      }
      //console.log(newMessages.indexOf(item) - 1)

  }
 
  //console.log(textCopied)
  //console.log(inputRef.current.focus())
  //console.log(keyboardFocused)
  //console.log(user.uid)
  const getCalculatedTime = useMemo(() => {
    return((time) => {
      if (time != null) {
        return time.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'})
      }
    })
  })
  /* function getCalculatedTime(time) {
    if (time != null) {
      return time.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'})
    }
    } */
    const getDateAndTime = useMemo(() => {
      console.log('bruhhhhhh')
      return (timestamp) => {
             if (timestamp != null) {
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
        return `${new Date(timestamp.seconds*1000).toLocaleDateString()}`
      }
      else if (date.getTime() <= threeWeeks.getTime()) {
        return `3w ago`
      }
      else if (date.getTime() <= twoWeeks.getTime()) {
        return `2w ago`
      }
      else if (date.getTime() <= lastWeek.getTime()) {
        return `1w ago`
      }
      else if (date.getTime() <= sixdays.getTime()) {
        return `6d ago`
      }
      else if (date.getTime() <= fivedays.getTime()) {
        return `5d ago`
      }
      else if (date.getTime() <= fourdays.getTime()) {
        return `4d ago`
      }
      else if (date.getTime() <= threedays.getTime()) {
        return `3d ago`
      }
      else if (date.getTime() <= twodays.getTime()) {
        return `2d ago`
      }
      else if (date.getTime() <= yesterday.getTime()) {
        return `Yesterday, ${getCalculatedTime(timestamp)}`
      }
      } 
      
    }
    }, []);
  
  function toggleCopyToTrue(e) {
   const updatedArray = newMessages.map(item => {
      if (item.id === e.id) {
        // Update the "isActive" property from false to true
        return { ...item, copyModal: true, saveModal: false};
      }
      return item;
    });
    setNewMessages(updatedArray) 
  }
  function toggleSaveToTrue(e) {
   const updatedArray = newMessages.map(item => {
      if (item.id === e.id) {
        // Update the "isActive" property from false to true
        return { ...item, copyModal: false, saveModal: true };
      }
      return item;
    });
    setNewMessages(updatedArray) 
  }

  //console.log(username)
  //console.log(person.userName)
  
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
      renderLiked(item)
    }
  }
  
  function handleGroupPress(item) {
    setTapCount(tapCount + 1);

    if (tapCount === 0) {
      // Set a timer for the second tap
      timerRef.current = setTimeout(() => {
        // If no second tap occurs within the timer, treat it as a single tap
        setTapCount(0);
        navigation.navigate('Cliqs', {screen: 'GroupHome', params: {name: item.message.post.id, newPost: false, postId: null}})
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
  //console.log(newMessages[0])
  

  function handleMessagePress(item) {
    //console.log(item)
    setTapCount(tapCount + 1);
    //renderLiked(item)
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
      renderLiked(item)
      
      
    }
  }
  function handlePostPress(item) {

    setTapCount(tapCount + 1);

    if (tapCount === 0) {
      // Set a timer for the second tap
      timerRef.current = setTimeout(() => {
        // If no second tap occurs within the timer, treat it as a single tap
        setTapCount(0);
        if (!item.message.post.repost && !item.message.post.post[0].video) {
          navigation.navigate('Post', {post: item.message.post.id, requests: requests, name: item.message.post.userId, groupId: null, video: false})
        }
        else if (!item.message.post.repost && item.message.post.post[0].video) {
          console.log('bruh')
          navigation.navigate('Post', {post: item.message.post.id, requests: requests, name: item.message.post.userId, groupId: null, video: true})
        }
        else {
          navigation.navigate('Repost', {post: item.message.post.id, requests: requests, name: item.message.post.userId, groupId: null, video: false})
        }
        
        //console.log('Single Tap!');
      }, 500); // Adjust the time limit according to your requirements
    } else if (tapCount === 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      // If it's the second tap and the timer is still active, treat it as a double tap
      clearTimeout(timerRef.current);
      setTapCount(0);
      renderLiked(item)
    }
  }
  function toggleCopyToFalse(e) {
    const updatedArray = newMessages.map(item => {
      if (item.id === e.id) {
        // Update the "isActive" property from false to true
        return { ...item, copyModal: false, saveModal: false };
      }
      return item;
    });
    setNewMessages(updatedArray)
  }
  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === 'Enter') {
      // Prevent user from manually inserting new lines
      return;
    }
  };
  function toggleSaveToFalse(e) {
    const updatedArray = newMessages.map(item => {
      if (item.id === e.id) {
        // Update the "isActive" property from false to true
        return { ...item, copyModal: false, saveModal: false };
      }
      return item;
    });
    setNewMessages(updatedArray)
  }
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    //console.log(person),
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      {newMessages.length >= 0  ? 
      <>
      <View style={{flexDirection: 'row', marginBottom: '-7.5%', marginLeft: '5%', marginTop: '1%'}}>
            <MaterialCommunityIcons name='chevron-left' size={35} style={{margin: '10%', marginHorizontal: 0}} color={theme.color} onPress={() => navigation.goBack()}/>
            <View style={{alignItems: 'center', justifyContent: 'center', marginLeft: '2.5%'}}>
            <View style={{flexDirection: 'row'}}>
              {person.pfp ?  <FastImage source={{uri: person.pfp}} style={{height: 35, width: 35, borderRadius: 8, margin: '10%', marginLeft: 0, marginRight: '7.5%', alignSelf: 'center', borderWidth: 1.5, borderColor: '#000'}}/> :
               <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 35, width: 35, borderRadius: 8, margin: '10%', marginLeft: 0, marginRight: '7.5%', alignSelf: 'center', borderWidth: 1.5, borderColor: '#000'}}/>
              }
           
            <Text allowFontScaling={false} numberOfLines={1} style={{fontSize: 15.36, color: theme.color, alignSelf: 'center', fontFamily: 'Montserrat_600SemiBold', width: '90%', marginLeft: '-5%'}}>{person.firstName} {person.lastName}</Text>
            </View>
            </View>
         </View> 
        <Divider borderBottomWidth={1} borderColor={theme.color}/>
        </>
        : null}
        {loading && lastVisible ? <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start', marginTop: '2.5%'}}>
        <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} /> 
        </View> : null}
        {/* 
        :  */
         newMessages.length > 0 ? 
         <>
        <FlatList
        //ref={flatListRef}
        data={newMessages}
        keyExtractor={(item, index) => index.toString()}
        inverted
        showsVerticalScrollIndicator={false}
        style={{marginBottom: '2.5%'}}
        ListFooterComponent={<View style={{paddingBottom: 10}}/>}
        onScroll={({ nativeEvent }) => {
        const offsetY = nativeEvent.contentOffset.y;
        const contentHeight = nativeEvent.contentSize.height;
        const scrollViewHeight = nativeEvent.layoutMeasurement.height;

        // Check if user has manually scrolled
        if (!hasScrolled.current && offsetY > 0) {
          hasScrolled.current = true; // Mark that the user has scrolled
        }

        // Prevent fetching more data on initial load
        if (!isInitialLoad && hasScrolled.current) {
          if (offsetY + scrollViewHeight >= contentHeight - 50) {
            // Fetch more data when close to the end
            fetchMoreData();
          }
        }
      }}
      onContentSizeChange={() => {
        // Set isInitialLoad to false once content size has changed (i.e. initial load is done)
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }}
          
        renderItem={({ item, index }) => 
        {
          
          
          // Only display timestamps for messages with timestamps before or at the initial screen load time
          
           
          //console.log(item)
            return (
              item.message.theme!= undefined ? 
            item.message.theme== null ? 
              <View style={item.user == user.uid ? {alignSelf: 'flex-end', marginLeft: 'auto'}: {alignSelf: 'flex-start', flexDirection: 'row'}}>
                {item.user != user.uid && ( // Only show image for non-user messages
        <FastImage
          source={person.pfp ? { uri: person.pfp } : require('../assets/defaultpfp.jpg')} // Replace with actual image URL
          style={styles.profileImage}
        />
      )}
              <Animated.View style={item.user == user.uid ? userBubbleStyle : bubbleStyle}>
                <Text allowFontScaling={false} style={item.user == user.uid ? [styles.postUsername, {color: "#121212"}] : [styles.postUsername, {color: "#fafafa"}]}>Theme unavailable</Text>
                
                <View style={[styles.timestampContainer, item.user != user.uid && styles.userTimestampContainer]}>
                   {getDateAndTime(item.timestamp) ?  <Text style={item.user == user.uid ? styles.userTimestamp : styles.timestamp}>{getDateAndTime(item.timestamp)}</Text> : null}
                </View>
            </Animated.View>
            
            {lastMessageId == item.id && readBy.includes(item.toUser) && item.user == user.uid && <Text style={styles.readReceipt}>Read</Text>}
            </View> 
             :
             
            <View style={item.user == user.uid ? {alignSelf: 'flex-end', marginLeft: 'auto'}: {alignSelf: 'flex-start', flexDirection: 'row'}}>
                {item.user != user.uid && ( // Only show image for non-user messages
        <FastImage
          source={person.pfp ? { uri: person.pfp } : require('../assets/defaultpfp.jpg')} // Replace with actual image URL
          style={styles.profileImage}
        />
      )}
      <Animated.View style={item.user == user.uid ? userPostContainer : postContainer}>
          <TouchableOpacity onPress={() => handleThemePress(item)}  activeOpacity={1}
          onLongPress={item.user == user.uid ? () => { setThemeCopied(item); toggleSaveToTrue(item)}: () => {
               setThemeCopied(item); toggleSaveToTrue(item)
            }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    
                    <View style={{alignSelf: 'center', paddingTop: 5}}>
                      <Text allowFontScaling={false} style={item.user == user.uid ? [styles.postUsername, {color: "#121212"}] : [styles.postUsername, {color: "#fafafa"}]}>Theme: {item.message.theme.name}</Text>
                    </View>
                </View>
                <View style={{ marginTop: '5%'}}>
                {item.message.theme.images[0] ?  <FastImage source={{uri: item.message.theme.images[0]}} style={[styles.image, {width: 220}]}/> :
               <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.image}/>
               
              }
              </View>
            </TouchableOpacity>
            <View style={[styles.timestampContainer, item.user != user.uid && styles.userTimestampContainer]}>
                   {getDateAndTime(item.timestamp) ?  <Text style={item.user == user.uid ? styles.userTimestamp : styles.timestamp}>{getDateAndTime(item.timestamp)}</Text> : null}
                </View>
              
                        <TouchableOpacity style={[styles.likeButton, item.user == user.uid && styles.userLikeButton]} onPress={item.user != user.uid ? () => renderLiked(item) : null}>
                            <Ionicons name="heart" size={20} color={item.liked ? likedHeartColor : heartColor} /> 
                            </TouchableOpacity>
            </Animated.View>
           
            {item.message.text.length > 0 ? 
             <View style={item.user == user.uid ? {alignSelf: 'flex-end', marginLeft: 'auto'}: {alignSelf: 'flex-start', flexDirection: 'row'}}>
                {item.user != user.uid && ( // Only show image for non-user messages
        <FastImage
          source={person.pfp ? { uri: person.pfp } : require('../assets/defaultpfp.jpg')} // Replace with actual image URL
          style={styles.profileImage}
        />
      )}
            <Animated.View style={item.user == user.uid ? userBubbleStyle : bubbleStyle}>
              <TouchableOpacity activeOpacity={1}  onPress={() => handleMessagePress(item)}
              onLongPress={() => {toggleCopyToTrue(item); setTextCopied(item.message.text); setReplyTo(item.user == user.uid ? user.uid : person.userName)}}>
                {item.message.text !== "" ?
                <>
                
                <Text allowFontScaling={false} style={[item.user == user.uid ? styles.userText : styles.text]}>{item.message.text}</Text>
                
                </> : null}
                 
              </TouchableOpacity> 
              <View style={[styles.timestampContainer, item.user != user.uid && styles.userTimestampContainer]}>
                   {getDateAndTime(item.timestamp) ?  <Text style={item.user == user.uid ? styles.userTimestamp : styles.timestamp}>{getDateAndTime(item.timestamp)}</Text> : null}
                </View>
                        <TouchableOpacity style={[styles.likeButton, item.user == user.uid && styles.userLikeButton]} onPress={item.user != user.uid ? () => renderLiked(item) : null}>
                            <Ionicons name="heart" size={20} color={item.liked ? likedHeartColor : heartColor} /> 
                            </TouchableOpacity>
            </Animated.View> 
            </View>
            : null}
            {(item.saveModal && item.user == user.uid) || (item.saveModal && !reportedContent.includes(item.id)) ?  
          <View style={[styles.copyModal, {marginTop: '5%'}]}>
            {item.user == user.uid ? <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => deleteMessage(item)}>
                  <Text allowFontScaling={false} style={[styles.copyText, {color: "#fafafa"}]}>Delete Message</Text>
                  <MaterialCommunityIcons name='delete' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
                <Divider color={"#fafafa"}/> 
                </>
                : null}
                {!reportedContent.includes(item.id) ? 
                <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, video: false, theme: false, comment: null, cliqueId: null, post: false, comments: false, message: true, cliqueMessage: false, reportedUser: item.user})}>
                  <Text allowFontScaling={false} style={[styles.copyText, {color: '#fafafa'}]}>Report</Text>
                  <MaterialIcons name='report' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity> 
                <Divider color={"#fafafa"}/> 
                </>
                : null}
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => toggleSaveToFalse(item)}>
                  <Text allowFontScaling={false} style={[styles.copyText]}>Cancel</Text>
                  <MaterialIcons name='cancel' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
              </View> 
          : null}
            {lastMessageId == item.id && readBy.includes(item.toUser) && item.user == user.uid && <Text style={styles.readReceipt}>Read</Text>}
            </View>
            :
            item.message.post == undefined && item.message.text !== "" ? 
            <View>
            { 
            item.message.text != undefined ?
              <View style={item.user == user.uid ? {alignSelf: 'flex-end', marginLeft: 'auto'}: {alignSelf: 'flex-start', flexDirection: 'row'}}>
                {item.user != user.uid && ( // Only show image for non-user messages
        <FastImage
          source={person.pfp ? { uri: person.pfp } : require('../assets/defaultpfp.jpg')} // Replace with actual image URL
          style={styles.profileImage}
        />
      )}
            <Animated.View style={item.user == user.uid ? userBubbleStyle : bubbleStyle}>
              <TouchableOpacity style={{alignItems: 'flex-end'}} activeOpacity={1}  onPress={() => handleMessagePress(item)}
              onLongPress={() => {toggleCopyToTrue(item); setTextCopied(item.message.text);}}>
                {item.message.text !== "" ?
                
                <Text allowFontScaling={false} style={[item.user == user.uid ? styles.userText : styles.text]}>{item.message.text}</Text>
                
                : null}
             
              </TouchableOpacity> 
              <View style={[styles.timestampContainer, item.user != user.uid && styles.userTimestampContainer]}>
                   {getDateAndTime(item.timestamp) ?  <Text style={item.user == user.uid ? styles.userTimestamp : styles.timestamp}>{getDateAndTime(item.timestamp)}</Text> : null}
                </View>
                        <TouchableOpacity style={[styles.likeButton, item.user == user.uid && styles.userLikeButton]} onPress={item.user != user.uid ? () => renderLiked(item) : null}>
                            <Ionicons name="heart" size={20} color={item.liked ? likedHeartColor : heartColor} /> 
                            </TouchableOpacity>
        </Animated.View>
             {lastMessageId == item.id && readBy.includes(item.toUser) && item.user == user.uid && <Text style={styles.readReceipt}>Read</Text>}
            </View> : null
            }
            
            {
              item.copyModal ?
              <View style={styles.copyModal}>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => copyFunction(item)}>
                  <Text allowFontScaling={false} style={[styles.copyText, {color: "#fafafa"}]}>Copy</Text>
                  <MaterialCommunityIcons name='content-copy' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
                <Divider color={"#fafafa"}/>
                {item.user == user.uid ? <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => deleteMessage(item)}>
                  <Text allowFontScaling={false} style={[styles.copyText, {color: "#fafafa"}]}>Delete Message</Text>
                  <MaterialCommunityIcons name='delete' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
                <Divider color={"#fafafa"}/> 
                </>
                : null}
               {!reportedContent.includes(item.id) ? 
                <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, video: false, theme: false, comment: null, cliqueId: null, post: false, comments: false, message: true, cliqueMessage: false, reportedUser: item.user})}>
                  <Text allowFontScaling={false} style={[styles.copyText, {color: '#fafafa'}]}>Report</Text>
                  <MaterialIcons name='report' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity> 
                <Divider color={"#fafafa"}/> 
                </>
                : null}
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => toggleCopyToFalse(item)}>
                  <Text allowFontScaling={false} style={[styles.copyText]}>Cancel</Text>
                  <MaterialIcons name='cancel' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
              </View> 
              :
               <View style={{margin: '2.5%'}}>
          <TouchableOpacity activeOpacity={1}  onPress={() => handleImagePress(item)} onLongPress={() => {toggleSaveToTrue(item); setImageCopied(item.message.image)}}>
            {
            item.message.image != undefined ? 
            <View style={item.user == user.uid ? {alignSelf: 'flex-end', marginLeft: 'auto'}: {alignSelf: 'flex-start', flexDirection: 'row'}}>
                {item.user != user.uid && ( // Only show image for non-user messages
        <FastImage
          source={person.pfp ? { uri: person.pfp } : require('../assets/defaultpfp.jpg')} // Replace with actual image URL
          style={styles.profileImage}
        />
      )}
            
            
            <FastImage source={{uri: item.message.image}} style={[styles.regImage, {marginRight: -5}]}/>
     
            {lastMessageId == item.id && readBy.includes(item.toUser) && item.user == user.uid && <Text style={styles.readReceipt}>Read</Text>}
            {(item.saveModal && item.user == user.uid) || (item.saveModal && !reportedContent.includes(item.id)) ?  
          <View style={[styles.copyModal, {marginTop: '5%'}]}>
            {item.user == user.uid ? <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => deleteMessage(item)}>
                  <Text allowFontScaling={false} style={[styles.copyText, {color: "#fafafa"}]}>Delete Message</Text>
                  <MaterialCommunityIcons name='delete' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
                <Divider color={"#fafafa"}/> 
                </>
                : null}
                {!reportedContent.includes(item.id) ? 
                <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, video: false, theme: false, comment: null, cliqueId: null, post: false, comments: false, message: true, cliqueMessage: false, reportedUser: item.user})}>
                  <Text allowFontScaling={false} style={[styles.copyText, {color: '#fafafa'}]}>Report</Text>
                  <MaterialIcons name='report' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity> 
                <Divider color={"#fafafa"}/> 
                </>
                : null}
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => toggleSaveToFalse(item)}>
                  <Text allowFontScaling={false} style={[styles.copyText]}>Cancel</Text>
                  <MaterialIcons name='cancel' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
              </View> 
          : null}
            </View>
            : null}
          </TouchableOpacity>
          </View>
            }
            </View> :
          item.message.post != undefined && item.message.post == null ? 
              <View style={item.user == user.uid ? {alignSelf: 'flex-end', marginLeft: 'auto'}: {alignSelf: 'flex-start', flexDirection: 'row'}}>
                {item.user != user.uid && ( // Only show image for non-user messages
        <FastImage
          source={person.pfp ? { uri: person.pfp } : require('../assets/defaultpfp.jpg')} // Replace with actual image URL
          style={styles.profileImage}
        />
      )}
              <Animated.View style={item.user == user.uid ? userBubbleStyle : bubbleStyle}>
                <Text allowFontScaling={false} style={item.user == user.uid ? [styles.postUsername, {color: "#121212"}] : [styles.postUsername, {color: "#fafafa"}]}>Post unavailable</Text>
                <View style={[styles.timestampContainer, item.user != user.uid && styles.userTimestampContainer]}>
                   {getDateAndTime(item.timestamp) ?  <Text style={item.user == user.uid ? styles.userTimestamp : styles.timestamp}>{getDateAndTime(item.timestamp)}</Text> : null}
                </View>
            </Animated.View>
            
            {lastMessageId == item.id && readBy.includes(item.toUser) && item.user == user.uid && <Text style={styles.readReceipt}>Read</Text>}
            </View> 
             : 
          item.message.post != undefined && item.message.post.multiPost == true  ? 
          <View style={{flexDirection: 'column'}}>
           <View style={item.user == user.uid ? {alignSelf: 'flex-end', marginLeft: 'auto'}: {alignSelf: 'flex-start', flexDirection: 'row'}}>
                {item.user != user.uid && ( // Only show image for non-user messages
        <FastImage
          source={person.pfp ? { uri: person.pfp } : require('../assets/defaultpfp.jpg')} // Replace with actual image URL
          style={styles.profileImage}
        />
      )}
      <Animated.View style={item.user == user.uid ? userPostContainer : postContainer}>
            <TouchableOpacity  activeOpacity={1} onPress={() => handlePostPress(item)}
          onLongPress={item.user == user.uid ? () => { setUserCopied(item.message.post.username); toggleSaveToTrue(item); }: () => {
               setUserCopied(item.message.post.username); toggleSaveToTrue(item);
            }}>
                <View style={{flexDirection: 'row'}}>
                  {item.message.post.pfp ?  <FastImage source={{uri: item.message.post.pfp}} style={styles.imagepfp}/> :
               <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.imagepfp}/>
              }
                    <Text allowFontScaling={false} style={item.user == user.uid ? [styles.postUsername, {color: "#121212"}] : [styles.postUsername, {color: "#fafafa"}]}>@{item.message.post.username}</Text>
                </View>
                 {item.message.post.post[0].image ?
                      <FastImage source={{uri: item.message.post.post[0].post, priority: 'normal'}} style={item.message.post.caption.length == 0 ? styles.image
                    : [styles.image, {borderBottomLeftRadius: 0, borderBottomRightRadius: 0}]}/>: item.message.post.post[0].video ?
                      <FastImage source={{uri: item.message.post.post[0].thumbnail, priority: 'normal'}} style={item.message.post.caption.length == 0 ? [styles.image]
                    : [styles.image, {borderBottomLeftRadius: 0, borderBottomRightRadius: 0}]}/> : 
                    <View style={{marginTop: -5}}>
          <ChatBubble bubbleColor='#fff' tailColor='#fff'>
         <Text allowFontScaling={false} style={[styles.image, {fontSize: item.message.post.post[0].textSize, width: 191, color: "#121212", fontFamily: 'Montserrat_500Medium'}]}>{item.message.post.post[0].value}</Text>
        </ChatBubble>
        </View>
                    
                     }
                {item.message.post.caption.length > 0 ? 
                <View style={{width: '90%'}}>
                  <Text allowFontScaling={false} numberOfLines={1} style={item.user == user.uid ? [styles.captionText, {color: "#121212"}] : [styles.captionText, {color: "#fafafa"}]}>{item.message.post.username} - {item.message.post.caption}</Text> 
                </View>
                : null}
                </TouchableOpacity> 
            <View style={[styles.timestampContainer, item.user != user.uid && styles.userTimestampContainer]}>
                   {getDateAndTime(item.timestamp) ?  <Text style={item.user == user.uid ? styles.userTimestamp : styles.timestamp}>{getDateAndTime(item.timestamp)}</Text> : null}
                </View>
              
                        <TouchableOpacity style={[styles.likeButton, item.user == user.uid && styles.userLikeButton]} onPress={item.user != user.uid ? () => renderLiked(item) : null}>
                            <Ionicons name="heart" size={20} color={item.liked ? likedHeartColor : heartColor} /> 
                            </TouchableOpacity>
            </Animated.View>
                  </View>
            {item.message.text.length > 0 ? 
            <View style={item.user == user.uid ? {alignSelf: 'flex-end', marginLeft: 'auto'}: {alignSelf: 'flex-start', flexDirection: 'row'}}>
                {item.user != user.uid && ( // Only show image for non-user messages
        <FastImage
          source={person.pfp ? { uri: person.pfp } : require('../assets/defaultpfp.jpg')} // Replace with actual image URL
          style={styles.profileImage}
        />
      )}
            <Animated.View style={item.user == user.uid ? userBubbleStyle : bubbleStyle}>
              <TouchableOpacity activeOpacity={1}  onPress={() => handleMessagePress(item)}
              onLongPress={() => {toggleCopyToTrue(item); setTextCopied(item.message.text); setReplyTo(item.user == user.uid ? user.uid : person.userName)}}>
                {item.message.text !== "" ?
                <>
                
                <Text allowFontScaling={false} style={[item.user == user.uid ? styles.userText : styles.text]}>{item.message.text}</Text>
                
                </> : null}
               
              </TouchableOpacity> 
              <View style={[styles.timestampContainer, item.user != user.uid && styles.userTimestampContainer]}>
                   {getDateAndTime(item.timestamp) ?  <Text style={item.user == user.uid ? styles.userTimestamp : styles.timestamp}>{getDateAndTime(item.timestamp)}</Text> : null}
                </View>
                        <TouchableOpacity style={[styles.likeButton, item.user == user.uid && styles.userLikeButton]} onPress={item.user != user.uid ? () => renderLiked(item) : null}>
                            <Ionicons name="heart" size={20} color={item.liked ? likedHeartColor : heartColor} /> 
                            </TouchableOpacity>
              
            </Animated.View> 
            </View>
            
            : null}
            
            {(item.saveModal && item.user == user.uid) || (item.saveModal && !reportedContent.includes(item.id)) ?  
          <View style={[styles.copyModal, {marginTop: '5%'}]}>
            {item.user == user.uid ? <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => deleteMessage(item)}>
                  <Text allowFontScaling={false} style={[styles.copyText, {color: "#fafafa"}]}>Delete Message</Text>
                  <MaterialCommunityIcons name='delete' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
                <Divider color={"#fafafa"}/> 
                </>
                : null}
                {!reportedContent.includes(item.id) ? 
                <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, video: false, theme: false, comment: null, cliqueId: null, post: false, comments: false, message: true, cliqueMessage: false, reportedUser: item.user})}>
                  <Text allowFontScaling={false} style={[styles.copyText, {color: '#fafafa'}]}>Report</Text>
                  <MaterialIcons name='report' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity> 
                <Divider color={"#fafafa"}/> 
                </>
                : null}
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => toggleSaveToFalse(item)}>
                  <Text allowFontScaling={false} style={[styles.copyText]}>Cancel</Text>
                  <MaterialIcons name='cancel' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
              </View> 
          : null}
            
            
            
            {lastMessageId == item.id && readBy.includes(item.toUser) && item.user == user.uid && <Text style={styles.readReceipt}>Read</Text>}
          </View> 
          : 
          item.message.post != null && item.message.post.group ? 
         <>
         <View style={item.user == user.uid ? [styles.postContainer, {height: 275, padding: 7.5, paddingRight: 12.5}] : [styles.postContainer, {backgroundColor: "grey", alignSelf: 'flex-start'}]} >
          <TouchableOpacity activeOpacity={1} onPress={() => handleGroupPress(item)} onLongPress={item.user == user.uid ? () => {  toggleSaveToTrue(item) }: () => {
               toggleSaveToTrue(item)

            }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    
                    <View style={{alignSelf: 'center', paddingTop: 5}}>
                      <Text allowFontScaling={false} style={item.user == user.uid ? [styles.postUsername, {color: "#121212"}] : [styles.postUsername, {color: "#fafafa"}]}>Cliq: {item.message.post.name}</Text>
                    </View>
                </View>
                <View style={{ marginTop: '5%'}}>
                {item.message.post ? item.message.post.pfp ?  <FastImage source={{uri: item.message.post.pfp}} style={[styles.image, {width: 220}]}/> :
               <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.image}/> : <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.image}/> 
               
              }
              </View>
            </TouchableOpacity>
            
            </View>

            {item.message.text.length > 0 ? 
            <View style={item.user == user.uid ? {alignSelf: 'flex-end', marginLeft: 'auto'}: {alignSelf: 'flex-start', flexDirection: 'row'}}>
                {item.user != user.uid && ( // Only show image for non-user messages
        <FastImage
          source={person.pfp ? { uri: person.pfp } : require('../assets/defaultpfp.jpg')} // Replace with actual image URL
          style={styles.profileImage}
        />
      )}
            <Animated.View style={item.user == user.uid ? userBubbleStyle : bubbleStyle}>
              <TouchableOpacity activeOpacity={1}  onPress={() => handleMessagePress(item)}
              onLongPress={() => {toggleCopyToTrue(item); setTextCopied(item.message.text); setReplyTo(item.user == user.uid ? user.uid : person.userName)}}>
                {item.message.text !== "" ?
                <>
                
                <Text allowFontScaling={false} style={[item.user == user.uid ? styles.userText : styles.text]}>{item.message.text}</Text>
                
                </> : null}
              
              </TouchableOpacity> 
               <View style={[styles.timestampContainer, item.user != user.uid && styles.userTimestampContainer]}>
                   {getDateAndTime(item.timestamp) ?  <Text style={item.user == user.uid ? styles.userTimestamp : styles.timestamp}>{getDateAndTime(item.timestamp)}</Text> : null}
                </View>
                        <TouchableOpacity style={[styles.likeButton, item.user == user.uid && styles.userLikeButton]} onPress={item.user != user.uid ? () => renderLiked(item) : null}>
                            <Ionicons name="heart" size={20} color={item.liked ? likedHeartColor : heartColor} /> 
                            </TouchableOpacity>
            </Animated.View> 
            </View>
            : null}
            {(item.saveModal && item.user == user.uid) || (item.saveModal && !reportedContent.includes(item.id)) ?  
          <View style={[styles.copyModal, {marginTop: '5%'}]}>
            {item.user == user.uid ? <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => deleteMessage(item)}>
                  <Text allowFontScaling={false} style={[styles.copyText, {color: "#fafafa"}]}>Delete Message</Text>
                  <MaterialCommunityIcons name='delete' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
                <Divider color={"#fafafa"}/> 
                </>
                : null}
                {!reportedContent.includes(item.id) ? 
                <>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, video: false, theme: false, comment: null, cliqueId: null, post: false, comments: false, message: true, cliqueMessage: false, reportedUser: item.user})}>
                  <Text allowFontScaling={false} style={[styles.copyText, {color: '#fafafa'}]}>Report</Text>
                  <MaterialIcons name='report' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity> 
                <Divider color={"#fafafa"}/> 
                </>
                : null}
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => toggleSaveToFalse(item)}>
                  <Text allowFontScaling={false} style={[styles.copyText]}>Cancel</Text>
                  <MaterialIcons name='cancel' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
              </View> 
          : null}
            {lastMessageId == item.id && readBy.includes(item.toUser) && item.user == user.uid && <Text style={styles.readReceipt}>Read</Text>}

          </> 
          : <></>
          
            
        )
        }
      }
      />
      {typing ? <View style={{marginLeft: '5%'}}>
      <TypingIndicator />
    </View> : null}
      
      </> : !loading ? <View style={{marginTop: '10%',}}>
        {person.pfp  ? <FastImage source={{uri: person.pfp}} style={{height: Dimensions.get('screen').height / 7, width: Dimensions.get('screen').height / 7, borderRadius: 70, alignSelf: 'center', borderWidth: 1.25, borderColor: '#9edaff'}}/> :
        <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: Dimensions.get('screen').height / 7, width: Dimensions.get('screen').height / 7, borderRadius: 70, alignSelf: 'center', borderWidth: 1.25, borderColor: '#9edaff'}}/>
         }
                    
                    <Text allowFontScaling={false} style={[styles.username, {color: theme.color}]}>{person.firstName} {person.lastName}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <Text allowFontScaling={false} style={[styles.supplementHeader, {color: theme.color}]}>{friends} {friends != 1 ? 'Friends' : 'Friend'}</Text>
                    </View>
                    {/* <Text allowFontScaling={false} style={[styles.supplementHeader, {width: '75%', textAlign: 'center', marginLeft: '10%'}]}>You both like music and are friends with @Edavid192</Text> */}
                    <View style={{width: '70%', marginLeft: '15%', marginTop: '5%'}}>
                        <MainButton text={"Go to Profile"} onPress={() => navigation.navigate('ViewingProfile', {name: person.id, viewing: true})}/>
                    </View>
                </View> : newMessages.length != 0 ? <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                  <ActivityIndicator color={"#9edaff"} />
                  </View> : <View style={{marginTop: '10%',}}>
        {person.pfp  ? <FastImage source={{uri: person.pfp}} style={{height: Dimensions.get('screen').height / 7, width: Dimensions.get('screen').height / 7, borderRadius: 70, alignSelf: 'center', borderWidth: 1.25, borderColor: '#9edaff'}}/> :
        <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: Dimensions.get('screen').height / 7, width: Dimensions.get('screen').height / 7, borderRadius: 70, alignSelf: 'center', borderWidth: 1.25, borderColor: '#9edaff'}}/>
         }
                    
                    <Text allowFontScaling={false} style={[styles.username, {color: theme.color}]}>{person.firstName} {person.lastName}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <Text allowFontScaling={false} style={[styles.supplementHeader, {color: theme.color}]}>{friends} {friends != 1 ? 'Friends' : 'Friend'}</Text>
                    </View>
                    {/* <Text allowFontScaling={false} style={[styles.supplementHeader, {width: '75%', textAlign: 'center', marginLeft: '10%'}]}>You both like music and are friends with @Edavid192</Text> */}
                    <View style={{width: '70%', marginLeft: '15%', marginTop: '5%'}}>
                        <MainButton text={"Go to Profile"} onPress={() => navigation.navigate('ViewingProfile', {name: person.id, viewing: true})}/>
                    </View>
                </View>
                }
                
        {/* <Text allowFontScaling={false} style={styles.characterCountText}>{inputText.length}/200</Text> */}
      {!uploading ? 
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={newMessages.length == 0 ? {flexDirection: 'row', marginTop: '5%'} : {marginBottom: '5%', flexDirection: 'row'}}>
        <View style={inputText.length > 0 ? [styles.input, {width: '75%'}] : styles.input}>
          
          <TextInput
            placeholder="Type message..."
            value={inputText}
            multiline
            onKeyPress={handleKeyPress}
            placeholderTextColor={theme.color}
            onChangeText={async(text) => {
              const sanitizedText = text.replace(/\n/g, ''); // Remove all new line characters
              setInputText(sanitizedText); 
              if (text.length > 0) {
              await updateDoc(doc(db, 'profiles', user.uid), {
              messageTyping: person.id
            })
            }
            else {
              await updateDoc(doc(db, 'profiles', user.uid), {
              messageTyping: ''
            })
            }
          }}
            style={keyboardFocused ? {width: '100%', color: theme.color, padding: 5, alignSelf: 'center'} : {width: '92.25%', color: theme.color, padding: 5, alignSelf: 'center'}}
            ref={inputRef}
            maxLength={200}
            enablesReturnKeyAutomatically={true}
            
            //onFocus={keyboardFocused}
          />
          {inputText.length == 0 && !keyboardFocused ? <>
          <FontAwesome name='picture-o' color={theme.color} size={25} style={{alignSelf: 'center'}} onPress={pickImage}/>
          </> : null }
        
        </View>
        {!singleMessageLoading || !uploading ?
                inputText.length > 0 ? <TouchableOpacity style={styles.sendButton} onPress={ () => {sendMessage()}}>
          <Text allowFontScaling={false} style={[styles.sendButtonText, {color: "#fafafa"}]}>Send</Text>
        </TouchableOpacity> : null
                : 
                <View style={{ flex: 1, alignItems: 'center', marginTop: '2.5%'}}>
                <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} style={{alignSelf: 'center'}}/>
                </View>
                }
        
        {/*  */}
        </KeyboardAvoidingView> 
        : 
        <ActivityIndicator color={"#9edaff"}/>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  topMessage: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  topUserMessage: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 15,
    marginBottom: 0,
  },
  middleMessage: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 0,
    marginBottom: 0,
    
  },
  middleUserMessage: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 15,
    marginBottom: 0,
  },
  bottomMessage: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 0,
  },
  bottomUserMessage: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 0,
  },
  singleMessage: {
    borderRadius: 15,
    marginBottom: 0,
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
    marginLeft: '2.5%',
    marginRight: '2.5%',
    flexDirection: 'row'
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
    fontSize: 15.36,
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
  replyImage: {
    height: 220,
    width: 225,
    borderRadius: 8,
    padding: 5,
    margin: 5
  },
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
  },
  username: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      padding: 10,
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
  copyModal: {
    borderRadius: 10,
    backgroundColor: "gray",
    marginRight: '5%',
    marginLeft: '5%',
    marginBottom: '2.5%'
  },
  copyText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    paddingRight: 10,
    color: "#fafafa",
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
    marginTop: 0,
    margin: '2.5%',
    position: 'relative'
  },
  pfp: {
    width: 30,
    height: 30,
    borderRadius: 15
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
    fontFamily: 'Montserrat_500Medium',
    marginTop: -5,
    marginBottom: 5,
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
      marginTop: '10%',
            backgroundColor: "transparent"
    },
     timestamp: {
    fontSize: 12,
    color: '#fafafa',
    marginRight: 'auto',
    marginTop: 5,
  },
  userTimestamp: {
    fontSize: 12,
    color: '#121212',
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
    fontSize: 12.29,
    color: '#fafafa',
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
});

export default PersonalChatScreen;