import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Image, Alert, ScrollView, FlatList, Modal, TextInput, Touchable, ActivityIndicator, Dimensions} from 'react-native'
import React, {useState, useEffect, useContext, useCallback, useMemo, useRef} from 'react'
import {MaterialCommunityIcons, FontAwesome} from '@expo/vector-icons';
import useAuth from '../Hooks/useAuth';
import { arrayUnion, documentId, getFirestore, or, startAfter, updateDoc, arrayRemove } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { getDoc, doc, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, setDoc, deleteDoc, increment, where, getDocs, limit, getCountFromServer} from 'firebase/firestore';
import {getStorage, ref, getDownloadURL, uploadBytesResumable, deleteObject} from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import ThemeMadeProgression from '../Components/ThemeMadeProgression';
import FollowIcon from '../Components/FollowIcon';
import FollowingIcon from '../Components/FollowingIcon';
import { Divider } from 'react-native-paper';
import axios from 'axios';
import FastImage from 'react-native-fast-image';
import ThemeHeader from '../Components/ThemeHeader';
import RequestedIcon from '../Components/RequestedIcon';
import {BACKEND_URL, MODERATION_API_USER, MODERATION_API_SECRET, IMAGE_MODERATION_URL} from "@env"
import GetThemeIcon from '../Components/GetThemeIcon';
import { useFonts, Montserrat_700Bold, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import generateId from '../lib/generateId';
import themeContext from '../lib/themeContext';
import NextButton from '../Components/NextButton';
import ChatBubble from 'react-native-chat-bubble'
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { db } from '../firebase'
const ViewingProfile = ({route}) => {
  const {name, preview, viewing, previewImage, previewMade, applying}= route.params;
  //console.log(previewImage)
  
  //console.log(route.params)
  const [background, setBackground] = useState(null);
  const [friendLoading, setFriendLoading] = useState(false);
  const [bioHeight, setBioHeight] = useState();
  const [uploading, setUploading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true)
  const [multiPost, setMultiPost] = useState(false);
  const [numberOfLines, setNumberOfLines] = useState();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [numberOfPosts, setNumberOfPosts] = useState(0);
  const [focused, setFocused] = useState(false);
  const [usersThatBlocked, setUsersThatBlocked] = useState([]);
  const [repostSetting, setRepostSetting] = useState(false);
  const [postSetting, setPostSetting] = useState(true);
  const [numberOfReposts, setNumberOfReposts] = useState(0);
  const [reposts, setReposts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [nonFriends, setNonFriends] = useState([]);
  const [specificFriends, setSpecificFriends] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [forSale, setForSale] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [groupsJoined, setGroupsJoined] = useState([]);
  const [eventsJoined, setEventsJoined] = useState([]);
  const [pfpLoading, setPfpLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [ogUsername, setOgUsername] = useState('');
  const [ableToMessage, setAbleToMessage] = useState([]);
  const [friendId, setFriendId] = useState(null);
  const [imageModal, setImageModal] = useState(false);
  const [lastName, setLastName] = useState();
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState(null);
  //const [searchKeywords, setSearchKeywords] = useState([]);
  const [smallKeywords, setSmallKeywords] = useState([]);
    const [largeKeywords, setLargeKeywords] = useState([]);
  const [person, setPerson] = useState(null);
  const [age, setAge] = useState();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [bio, setBio] = useState('');
  const [privacy, setPrivacy] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [pfp, setPfp] = useState();
  const [additionalInfoMode, setAdditionalInfoMode] = useState(false);
  const [song, setSong] = useState("");
  const [post, setPost] = useState('');
  const {user} = useAuth()
  const theme = useContext(themeContext)
  const navigation = useNavigation(); 
  const [lastVisible, setLastVisible] = useState();
  const storage = getStorage();
  const [multiLoading, setMultiLoading] = useState(false);
  const [yesChecked, setYesChecked] = useState(false);
  const [noChecked, setNoChecked] = useState(false);
  const [personal, setPersonal] = useState();
  const [free, setFree] = useState();
  const sound = useRef(new Audio.Sound())
  const [sale, setSale] = useState();
  const [notificationToken, setNotificationToken] = useState('');
  /* useEffect(() => {
    setname(name)
  }, [route.params?.name]) */
  useFocusEffect(
      useCallback(() => {
        setFocused(true)
      // This block of code will run when the screen is focused
      

      // Clean-up function when the component unmounts or the screen loses focus
      return () => {
        setFocused(false)
      };
    }, [])
  )
  useEffect(() => {
    const getData = async() => {
      const docSnap = await getDoc(doc(db, 'profiles', name))
      let numOfFriends = docSnap.data().following
      let numOfFollowers = docSnap.data().followers
      setSpecificFriends(numOfFriends.length)
      setFollowers(numOfFollowers.length)
      //setSpecificFriends({id: docSnap.id, ...docSnap.data()})
    }
    getData();
  }, [name])
  useEffect(() => {
    if (song && sound.current && !focused) {
      pauseSound(song.preview_url)
    }
  }, [focused, song, sound])
  useMemo(() => {
    const getData = async() => {
      const docSnap = await getDoc(doc(db, 'profiles', name))
      if (docSnap.exists()) {
      setPerson({id: docSnap.id, ...docSnap.data()})
      }
    }
    getData();
  }, [route.params])
  useEffect(() => {
    const getData = async() => {
      const docSnap = await getDoc(doc(db, 'profiles', user.uid))
      setSmallKeywords(docSnap.data().smallKeywords)
      setLargeKeywords(docSnap.data().largeKeywords)
      //setSearchKeywords(docSnap.data().searchKeywords)
    }
    getData()
  }, [])
  const playSound = async (previewUrl) => {
    try {
      await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
      });
      // ... rest of your playSound logic
    } catch (error) {
      console.error('Error setting audio mode:', error);
    }
    try {
      await sound.current.loadAsync({ uri: previewUrl });
      await sound.current.setIsLoopingAsync(true);
      await sound.current.setIsMutedAsync(false);
      await sound.current.playAsync();
      setPlaying(true);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const pauseSound = async () => {
    try {
      await sound.current.pauseAsync();
      await sound.current.unloadAsync();
      setPlaying(false);
    } catch (error) {
      console.error('Error pausing sound:', error);
    }
  };
  useFocusEffect(
  useCallback(() => {
    // On screen focus (when the user navigates back)
    if (playing) {
      return; // Video wasn't paused, no need to change state
    }

    // Video was paused, keep it paused
    setPlaying(false);
  }, [playing]) // Dependency array for when isPaused changes 
);
  /* useEffect(() => {
    if (background != null) {
      const getSaleData = async() => {
        const themeSnap = await getDocs(query(collection(db, 'products'), where('images', 'array-contains', background)))
      themeSnap.forEach((e) => {
        setForSale({background: e.data().images[0]})
      })
      const freeThemeSnap = await getDocs(query(collection(db, 'freeThemes'), where('images', 'array-contains', background)))
      freeThemeSnap.forEach((e) => {

        setForSale({background: e.data().images[0]})
      })
      }
      getSaleData()
      
    }
  }, [background]) */
  useEffect(() => {
    if (user != null) {
      let unsub;
      const fetchRequests = () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'requests'), where('actualRequest', '==', true)), (snapshot) => {
          setFriendRequests(snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })))
        })
      }
      fetchRequests();
      return unsub;
    }
    
  }, [route.params])
  //console.log(prevRoute)
  useEffect(() => {
    if (person != null && (!person.blockedUsers.includes(user.uid) && !blockedUsers.includes(person.id))) {
    const coll = query(collection(db, "profiles", name, 'posts'), where('repost', '==', false));
    const getCount = async() => {
      const snapshot = await getCountFromServer(coll);
      setNumberOfPosts(snapshot.data().count)
    }
    getCount()
  }
  }, [person])
  useEffect(() => {
    if (person != null && (!person.blockedUsers.includes(user.uid) && !blockedUsers.includes(person.id))) {
    const coll = query(collection(db, "profiles", name, 'posts'), where('repost', '==', true));
    const getCount = async() => {
      const snapshot = await getCountFromServer(coll);
      setNumberOfReposts(snapshot.data().count)
    }
    getCount()
  }
  }, [person])
  ///console.log(repostSetting)
  useEffect(() => {
    const getData = async() => {
      const docSnap = await getDoc(doc(db, 'profiles', user.uid, 'friends', name))
      setFriendId(docSnap.data().friendId)
    }
    getData();
  }, [])
  useMemo(() => {
    if (person != null && (!person.blockedUsers.includes(user.uid) && !blockedUsers.includes(person.id))) {
      new Promise(resolve => {
    const fetchProfileDetails = async() => {
      const docSnap = await getDoc(doc(db, 'profiles', name))
       setFirstName(docSnap.data().firstName)
       setLastName(docSnap.data().lastName)
       setUsername(docSnap.data().userName)
       setPfp(docSnap.data().pfp)
       setSong(docSnap.data().song)
       setForSale(docSnap.data().forSale)
       setBackground(docSnap.data().background)
       setPrivacy(docSnap.data().private)
       setBio(docSnap.data().bio)
       setGroupsJoined(docSnap.data().groupsJoined)
       setNotificationToken(docSnap.data().notificationToken)
    }
    fetchProfileDetails()
    resolve()
  }).finally(() => setPfpLoading(false))
  }
  }, [person])
  useEffect(() => {
    const getData = async() => {
      const docSnap = await getDoc(doc(db, 'profiles', user.uid))
      if (docSnap.exists()) {
      setOgUsername(docSnap.data().userName)
      setBlockedUsers(docSnap.data().blockedUsers)
      setUsersThatBlocked(docSnap.data().usersThatBlocked)
      }
    }
    getData();
  }, [])
  //console.log(pfp)
  useMemo(() => {
    if (person != null && postSetting && (!person.blockedUsers.includes(user.uid) && !blockedUsers.includes(person.id))) {
      let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'profiles', name, 'posts'), where('repost', '==', false), orderBy('timestamp', 'desc'), limit(9)), (snapshot) => {
          new Promise(resolve => {
        setPosts(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            reportVisible: false,
            ...doc.data()
          })))
          setLastVisible(snapshot.docs[snapshot.docs.length-1])
          resolve(); // Resolve the Promise after setCompleteMessages is done
      }).finally(() => setLoading(false)); 
          
        })
      } 
      fetchCards();
      return unsub;
    }
      
  }, [person, postSetting])
  useMemo(() => {
    if (person != null && repostSetting && (!person.blockedUsers.includes(user.uid) && !blockedUsers.includes(person.id))) {
      setReposts([]);
    let unsub;
      //console.log(name)
      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'profiles', name, 'posts'), where('repost', '==', true), orderBy('timestamp', 'desc'), limit(9)), (snapshot) => {
          //console.log(snapshot.docs.length)
          new Promise(resolve => {
        setReposts(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            reportVisible: false,
            ...doc.data()
          })))
          setLastVisible(snapshot.docs[snapshot.docs.length-1])
          resolve(); // Resolve the Promise after setCompleteMessages is done
      }).finally(() => setLoading(false)); 
          
        })
      } 
      fetchCards();
      return unsub;
    }
  }, [repostSetting, person])
  //console.log(reposts.length)
  //console.log(posts[0]);
  //console.log(posts)
  //console.log(lastVisible)
  function fetchMoreRepostData () {
    if (lastVisible != undefined && person != null && (!person.blockedUsers.includes(user.uid) && !blockedUsers.includes(person.id))) {
    
    let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'profiles', name, 'posts'), where('repost', '==', true), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(9)), (snapshot) => {
          const newData = [];
          snapshot.docs.map((doc) => {
            newData.push({
              id: doc.id,
              ...doc.data()
            })
          })
          setReposts([...reposts, ...newData])
          setLastVisible(snapshot.docs[snapshot.docs.length-1])
        })
      }
      fetchCards();
      return unsub;
    }
  }
  function fetchMoreData () {
    if (lastVisible != undefined && person != null && (!person.blockedUsers.includes(user.uid) && !blockedUsers.includes(person.id))) {
    
    let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'profiles', name, 'posts'), where('repost', '==', false), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(9)), (snapshot) => {
          const newData = [];
          snapshot.docs.map((doc) => {
            newData.push({
              id: doc.id,
              ...doc.data()
            })
          })
          setPosts([...posts, ...newData])
          setLastVisible(snapshot.docs[snapshot.docs.length-1])
        })
      }
      fetchCards();
      return unsub;
    }
  }
  //console.log(posts.map((item) => (item.id)))
  //console.log(lastVisible)
  
  useEffect(() => {
      let unsub;
      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'friends'), where('actualFriend', '==', true)), (snapshot) => {
          setFriends(snapshot.docs.map((doc)=> ( {
            id: doc.id
          })))
          
        })
      } 
      fetchCards();
      return unsub;
    
    
  }, [name])
  const pickImage = async() => {
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          //allowsMultipleSelection: true,
          allowsEditing: false,
          aspect: [3, 4],
          quality: 0.8,
        }).then(image => {
          if (image) {
            uploadImage(image.assets[0].uri)
          }
        }) 
    };
  const uploadImage = async(image) => {
    //console.log(image)
        setUploading(true);

        const response = await fetch(image)
        //console.log(response)
        const blob = await response.blob();
        const filename = `${user.uid}pfp.jpg`
        var storageRef = ref(storage, filename)
        try {
            await storageRef;
        } catch (error) {
            console.log(error)
        }
        await uploadBytesResumable(storageRef, blob).then(() => getLink(filename))
        // const response = await fetch(image)
        // const bytes = await response.blob();
        // const filename = `${user.uid}pfp.jpg`
        // //setPfp(filename)
        // var storageRef = ref(storage, filename)
        // try {
        //     await storageRef;
        // } catch (error) {
        //     console.log(error)
        // }
        // await uploadBytesResumable(storageRef, bytes).then(() => getLink(filename))
    }
    const getLink = (pfp) => {
        const starsRef = ref(storage, pfp);
        getDownloadURL(starsRef).then((url) => checkPfp(url, starsRef))
    }
  const renderReposts = ({item, index}) => {
    //console.log(item)
    //console.log(index % 2 == 0)
    
    return (
        <TouchableOpacity style={{borderWidth: 1, borderColor: '#000'}} onPress={() => navigation.navigate('Repost', {post: item.id, name: name, requests: friendRequests, groupId: null, video: false})}>
        <View style={{ padding: 10}}>
          <ChatBubble bubbleColor='#fff' tailColor='#fff'>
          <Text style={{fontSize: 12.29, height: Dimensions.get('screen').height / 12.25, width: (Dimensions.get('screen').height / 12.25) * 1.01625, color: theme.backgroundColor, paddingLeft: 5, paddingTop: 2.5}}>{item.post.post[0].value}</Text>
        </ChatBubble>
        </View>
        
      </TouchableOpacity>
    ) 

    }
  const renderPosts = ({item, index}) => {
    //console.log(item)
    //console.log(index % 2 == 0)
    if (item.post[0] != null) {

      return (
        item.post[0].image ? 
      <TouchableOpacity style={{borderWidth: 1, borderColor: "#000"}} onPress={() => navigation.navigate('Post', {post: item.id, requests: friendRequests, name: name, groupId: null, video: false})}>
        <FastImage source={{uri: item.post[0].post, priority: 'normal'}} style={styles.image}/>
      </TouchableOpacity> : item.post[0].video ? <>
      <TouchableOpacity style={{borderWidth: 1, borderColor: "#000"}} onPress={() => navigation.navigate('Post', {post: item.id, name: name, requests: friendRequests, groupId: null, video: true})}>
        <MaterialCommunityIcons name='play' size={30} style={{position: 'absolute', zIndex: 3, left: 110}} color={"#000"}/>
        <FastImage source={{uri: item.post[0].thumbnail, priority: 'normal'}} style={styles.image}/>
      </TouchableOpacity>
      </> : <TouchableOpacity style={{borderWidth: 1, borderColor: '#000'}} onPress={() => navigation.navigate('Post', {post: item.id, name: name, requests: friendRequests, groupId: null, video: false})}>
        <View style={{ padding: 10}}>
          <ChatBubble bubbleColor='#fff' tailColor='#fff'>
          <Text style={{fontSize: 12.29, height: Dimensions.get('screen').height / 12.25, width: (Dimensions.get('screen').height / 12.25) * 1.01625, color: theme.backgroundColor, paddingLeft: 5, paddingTop: 2.5}}>{item.post[0].value}</Text>
        </ChatBubble>
        </View>
        
      </TouchableOpacity>
    ) 
  } 

    }
  async function removeFriend(friendId) {
    setFriendLoading(true)
    let newFriend = generateId(friendId, user.uid)
    //let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/removeFriend'
    Alert.alert('Are you sure you want to unfollow?', 'If you unfollow, you will be unable to message them and they will be unable to message you.', [
                {
                  text: 'Cancel',
                  onPress: () =>  setFriendLoading(false),
                  style: 'cancel',
                },
                {text: 'OK', onPress: async() => {try {
    const response = await fetch(`${BACKEND_URL}/api/removeFriend`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {newFriend: newFriend, user: user.uid, friendId: friendId}}), // Send data as needed
    })
    const data = await response.json();
    if (data.done) {
      setFriendLoading(false)
    }
  } catch (error) {
    console.error('Error:', error);
  }},
  }]);
    
  }
  async function addFriend(item) {
    setFriendLoading(true)
    let newFriend = generateId(item.id, user.uid)
    try {
    const response = await fetch(`${BACKEND_URL}/api/addFriendTwo`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, newFriend: newFriend, user: user.uid, username: ogUsername, largeKeywords: largeKeywords, smallKeywords: smallKeywords}}), // Send data as needed
    })
    const data = await response.json();
    //console.log(data)
      if (data.request) {
        setFriendLoading(false)
        schedulePushRequestFriendNotification(item.id, ogUsername, item.notificationToken)
      }
      else if (data.friend) {
        setFriendLoading(false)
        schedulePushFriendNotification(item.id, ogUsername, item.notificationToken)
      }
  } catch (error) {
    console.error('Error:', error);
  }
  }
  const handlePersonalCallback = (dataToSend) => {
      setPersonal(dataToSend)
    }
    const handleFreeCallback = (dataToSend) => {
      setFree(dataToSend)
    }
    const handleSaleCallback = (dataToSend) => {
      setSale(dataToSend)
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
      console.log(tempList)
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
    async function schedulePushFriendNotification(id, username, notificationToken) {
      let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
     let banned = (await getDoc(doc(db, 'profiles', id))).data().banned
      if (notis && !banned) {
      fetch(`${BACKEND_URL}/api/friendNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, pushToken: notificationToken, "content-available": 1, data: {routeName: 'NotificationScreen', deepLink: 'nucliqv1://NotificationScreen'}
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
  useEffect(() => {
    let unsub;
    const fetchData = () => {
      unsub = onSnapshot(query(collection(db, 'friends'), or(where(documentId(), '==', name + user.uid), where(documentId(), '==', user.uid + name))), (snapshot) => {
          setAbleToMessage(snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })))
        })
      }
    fetchData();
    return unsub;
  }, [])
  async function messageFriend() {
    //console.log(ableToMessage)
    if (ableToMessage.length > 0 && ableToMessage.filter((e) => e.active == true).length > 0) {
      navigation.navigate('PersonalChat', {friendId: friendId, person: person, active: true})
    }
    else {
      Alert.alert('You must both be following each other first (mutual friends) in order to message!')
    }
  }
  async function buyThemeFunction(image, userId) {
    //console.log(purchased)
    if (userId == user.uid) {
        
    const freeQuerySnapshot = await getDocs(query(collection(db, 'freeThemes'), where('images', 'array-contains', image)));
    freeQuerySnapshot.forEach((doc) => {
      if (doc.exists()){
          navigation.navigate('SpecificTheme', {productId: doc.id, free: true, purchased: false})
      }
    });
      }
    else {
       
    const freeQuerySnapshot = await getDocs(query(collection(db, 'freeThemes'), where('images', 'array-contains', image)));
    freeQuerySnapshot.forEach((doc) => {
      if (doc.exists()) {
        navigation.navigate('SpecificTheme', {productId: doc.id, free: true, purchased: false})
      }
      //console.log(doc.id, " => ", doc.data());
    });
        
    }
    
    
  }
  async function schedulePushRequestFriendNotification(id, username, notificationToken) {
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
      let banned = (await getDoc(doc(db, 'profiles', id))).data().banned
      if (notis && !banned) {
      fetch(`${BACKEND_URL}/api/requestedNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, pushToken: notificationToken, "content-available": 1, data: {routeName: 'NotificationScreen', deepLink: 'nucliqv1://NotificationScreen'}
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
    const checkPfp = (url, reference) => {
        axios.get(`${IMAGE_MODERATION_URL}`, {
            params: {
                'url': url,
                'models': 'nudity-2.0,wad,offensive,scam,gore,qr-content',
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
                Alert.alert('Unable to Post', `This Goes Against Our Guidelines`, [
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
            || containsNumberGreaterThan(Object.values(response.data.offensive), 0.9) || response.data.recreational_drugs > 0.9 || response.data.medical_drugs > 0.9 || response.data.scam > 0.9 ||
            response.data.skull.prob > 0.9 || response.data.weapon > 0.9 || response.data.weapon_firearm > 0.9 || response.data.weapon_knife > 0.9) {
              Alert.alert('Unable to Post', 'This Post Goes Against Our Guidelines', [
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
            await updateDoc(doc(db, "profiles", user.uid), {
            pfp: url,
        }).then(async() => {(await getDocs(query(collection(db, 'posts'), where('userId', '==', name)))).forEach(async(document) => {
          await updateDoc(doc(db, 'posts', document.id), {
            pfp: url
          })
        })}).then(async() => {(await getDocs(query(collection(db, 'usernames'), where('username', '==', name)))).forEach(async(document) => {
          await updateDoc(doc(db, 'usernames', document.id), {
            pfp: url
          })
        })}).then(() => setUploading(false))
    }  
      
                    })
            .catch(function (error) {
            // handle error
            if (error.response) console.log(error.response.data);
            else console.log(error.message);
            });
    }
    async function unBlockUser() {
    try {
    const response = await fetch(`${BACKEND_URL}/api/unBlockUser`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {name: name, user: user.uid,}}), // Send data as needed
    })
    const data = await response.json();
      if (data.done) {
        navigation.goBack()
      }
  } catch (error) {
    console.error('Error:', error);
  }
    }
    async function blockUser() {
      Alert.alert('Are you sure you want to block this user?', 'If you block them, you will not be able to interact with their content and they will not be able to interact with your content', [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: async() => {
    try {
    const response = await fetch(`${BACKEND_URL}/api/blockUser`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {name: name, user: user.uid}}), // Send data as needed
    })
    const data = await response.json();
    console.log(data)
      if (data.done) {
        navigation.goBack()
      }
  } catch (error) {
    console.error('Error:', error);
  }
      }}
              ]);
    }
    //console.log(ableToMessage)
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <>

    {preview ? <View style={{backgroundColor: theme.backgroundColor, marginTop: '2.5%'}}>
      <ThemeMadeProgression text={"Profile Theme Preview"} noAdditional={true}/> 
        </View> : previewMade ? 
      <View style={{backgroundColor: theme.backgroundColor, marginTop: '2.5%'}}>
      <ThemeMadeProgression text={"Profile Theme Preview"} personal={handlePersonalCallback} free={handleFreeCallback} sale={handleSaleCallback} 
        personalStyle={personal ? {backgroundColor: "#005278"} : {backgroundColor: theme.backgroundColor}} freeStyle={free ? {backgroundColor: "#005278"} : {backgroundColor: theme.backgroundColor}} saleStyle={sale ? {backgroundColor: "#005278"} : {backgroundColor: theme.backgroundColor}} /> 
        </View>
        : applying ? 
      <View style={{backgroundColor: "#005278"}}>
        <View style={styles.previewThemeContainer}> 
          <Text style={[styles.previewThemeText, { color: theme.color}]}>My Themes</Text>
          <TouchableOpacity hitSlop={100} style={{alignSelf: 'center', padding: 5, paddingTop: 10, marginLeft: 'auto'}} onPress={preview ? null : () => navigation.goBack()}>
            <MaterialCommunityIcons name='close' size={20} color={theme.color} />
          </TouchableOpacity>
        </View>
        <View style={styles.previewContainer}>
          <Text style={styles.previewHeader}>PROFILE THEME PREVIEW</Text>
          <Text style={styles.previewText}>This is how your feeds will look like using this theme.</Text>
        </View>
      </View> 
       : 
      viewing ? 
      <View style={{backgroundColor: theme.backgroundColor}}>
        <ThemeHeader video={false} text={person != null && (person.blockedUsers.includes(user.uid) || blockedUsers.includes(person.id)) ? "User Unavailable" : "Viewing Profile"} backButton={true}/>
      </View> :
       <>
      </>}
      
    
<ScrollView style={{flex: 1, backgroundColor: theme.backgroundColor}} 
onScroll={({ nativeEvent }) => {
            const offsetY = nativeEvent.contentOffset.y;
            const contentHeight = nativeEvent.contentSize.height;
            const scrollViewHeight = nativeEvent.layoutMeasurement.height;

            // Detect when the user is near the end of the ScrollView
            if (offsetY + scrollViewHeight >= contentHeight - 20) {
              // Load more data when close to the end
              if (repostSetting) {
                fetchMoreRepostData();
              }
              else {
                fetchMoreData();
              }
            }
          }}>

    
      <Modal visible={imageModal} animationType="fade" onRequestClose={() => setImageModal(!imageModal)}>
              <View style={[styles.modalContainer, styles.overlay]}>
                
                <View style={styles.modalView}> 
                  <MaterialCommunityIcons name='close' color={theme.backgroundColor} size={35} style={{textAlign: 'right', paddingRight: -30, paddingBottom: 10, paddingTop: 10}} onPress={preview ? null : () => setImageModal(false)}/>
                  <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginBottom: '20%'}}>
                    {pfp ? <FastImage source={{uri: pfp}} style={styles.fullImage}/> : <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />}
                  </View>
                  
                </View>
              </View>



            </Modal>
            {background && forSale ? 
      <TouchableOpacity style={styles.buyThemeContainer} onPress={preview ? null : () => buyThemeFunction(background, name, person.forSale)}>
       <FontAwesome name='photo' size={22.5} style={{alignSelf: 'center'}}/>
      </TouchableOpacity> : null}
             <FastImage style={styles.container} source={!loading ? previewImage ? {uri: previewImage} : background ? {uri: background} : require('../assets/Default_theme.jpg') : null} />
        
        <View style={{flexDirection: 'row'}}>
          <View style={{width: '77.5%'}}>
            <View style={{flexDirection: 'row', width: '90%'}}>
              <Text style={[styles.nameAge, {color: theme.color}]} numberOfLines={1}>@{username}</Text>
              {privacy ? <MaterialCommunityIcons name='lock-outline' size={20} color={"#fff"} style={{alignSelf: 'center', paddingTop: 7.5}}/> : null}
              
            </View>
            
            <Text style={[styles.nameAge, {color: theme.color}]} numberOfLines={1}>{firstName} {lastName}</Text>

          </View>
          
          <TouchableOpacity style={{marginTop: '-7.5%', alignItems: 'flex-end', marginRight: '5%', flex: 1}} activeOpacity={1} onPress={!pfp ? null : () => setImageModal(true)}>
              {(uploading || loading) && person != null && !(person.blockedUsers.includes(user.uid) || blockedUsers.includes(person.id)) ? <ActivityIndicator style={styles.profileCircle} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} /> : pfp ? <FastImage source={{uri: pfp, priority: 'normal'}} style={styles.profileCircle} /> 
              : <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.profileCircle} />}
            
            </TouchableOpacity>
        </View>
                    {bio.length > 0 ? 
            <TouchableOpacity onPress={preview ? null : () => setAdditionalInfoMode(!additionalInfoMode)} style={{flexDirection: 'row', alignItems: 'center', marginLeft: '3.5%', marginRight: '3.5%', justifyContent: 'space-between'}}>
              <Divider borderWidth={1} style={{width: '45%'}} borderColor={theme.color}/>
              {additionalInfoMode ? <MaterialCommunityIcons name='chevron-up' style={{alignSelf: 'center'}} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={25}/> : <MaterialCommunityIcons name='chevron-down' style={{alignSelf: 'center'}} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={25}/> }
              <Divider borderWidth={1} style={{width: '45%'}} borderColor={theme.color}/>
            </TouchableOpacity> : null}
            {(bio != undefined || null) && additionalInfoMode ? 
           <Text style={[styles.bioText, {color: theme.color}]}>{bio != undefined || null ? bio : null}</Text> 
            : null}
        <View style={styles.friendsContainer}>
          {user != null ? name == user.uid ? <TouchableOpacity style={[styles.friendsHeader, {flexDirection: 'row'}]} onPress={preview ? null :() => navigation.navigate('Edit', {firstName: firstName, lastName: lastName, 
            pfp: pfp, username: username, id: name, bio: bio})}>
            <Text style={styles.friendsText}>Edit</Text>
            
          </TouchableOpacity> : user != null && user.uid != name && person != null && !(person.blockedUsers.includes(user.uid) || blockedUsers.includes(person.id)) ? 
          friendLoading ? 
          <View style={[styles.friendsHeader, {alignSelf: 'center', paddingLeft: 18, padding: 3}]}>
          <ActivityIndicator style={{padding: 7}} color={"#121212"}/> 
          </View>
          :
          <TouchableOpacity style={[styles.friendsHeader, {alignSelf: 'center', paddingLeft: 18, padding: 3}]} onPress={preview ? null :user.uid != null ? friends.filter(e => e.id === name).length > 0 ? () => removeFriend(name) : name == user.uid || friendRequests.filter(e => e.id === name).length > 0 ? null : () => addFriend(person): null}>
            {friendRequests.filter(e => e.id === name).length > 0 ? <RequestedIcon color={theme.backgroundColor} /> : 
              friends.filter(e => e.id === name).length > 0 ? <FollowingIcon color={theme.backgroundColor}  />
              : name == user.uid ? null : <FollowIcon color={theme.backgroundColor}  />}
          </TouchableOpacity> : null : null}
          {user != null ? name == user.uid ? <TouchableOpacity style={styles.friendsHeader} onPress={preview ? null :() => navigation.navigate('Settings', {username: username})}>
            <Text style={styles.friendsText}>Settings</Text>
          </TouchableOpacity> : ableToMessage.filter((e) => e.active == true).length > 0 && friendId && person != null && (!person.blockedUsers.includes(user.uid) && !blockedUsers.includes(person.id)) ? <TouchableOpacity style={styles.friendsHeader} onPress={preview ? null : () => messageFriend()}>
            <Text style={styles.friendsText}>Message</Text>
          </TouchableOpacity> : null : null}
          {user != null && user.uid != name && person != null && (!person.blockedUsers.includes(user.uid) && !blockedUsers.includes(person.id)) ? 
          <TouchableOpacity style={styles.friendsHeader} onPress={preview ? null :() => blockUser()}>
            <Text style={styles.friendsText}>Block</Text>
          </TouchableOpacity>
          : user != null && user.uid != name && person != null && (blockedUsers.includes(person.id)) ? 
          <TouchableOpacity style={styles.friendsHeader} onPress={preview ? null :() => unBlockUser()}>
            <Text style={styles.friendsText}>Un-Block</Text>

          </TouchableOpacity> : null}
          
        </View>
         <View style={styles.headerContainer}>
              <TouchableOpacity onPress={person != null && !blockedUsers.includes(person.id) ? postSetting ? null : () => {setPostSetting(true); setRepostSetting(false)} : null} style={[styles.noOfPosts, {backgroundColor: theme.backgroundColor}]}>
                <Text style={[styles.headerText, {color: theme.color}]}>{numberOfPosts > 999 && numberOfPosts < 1000000 ? `${numberOfPosts / 1000}k` : numberOfPosts > 999999 ? `${numberOfPosts / 1000000}m` : numberOfPosts}</Text>
                <Text style={[styles.headerSupplementText, {color: theme.color}]}>{numberOfPosts == 1 ? 'Post' : 'Posts'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={person != null && !blockedUsers.includes(person.id) ? repostSetting ? null : () => {setRepostSetting(true); setPostSetting(false)} : null} style={[styles.noOfPosts, {backgroundColor: theme.backgroundColor}]}>
                <Text style={[styles.headerText, {color: theme.color}]}>{numberOfReposts > 999 && numberOfReposts < 1000000 ? `${numberOfReposts / 1000}k` : numberOfReposts > 999999 ? `${numberOfReposts / 1000000}m` : numberOfReposts}</Text>
                <Text style={[styles.headerSupplementText, {color: theme.color}]}>{numberOfReposts == 1 ? 'Re-vibe' : 'Re-vibes'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.noOfPosts, {backgroundColor: theme.backgroundColor}]} onPress={person != null && !blockedUsers.includes(person.id) ? () => navigation.navigate('Friends', {profile: name, ogUser: name == user.uid ? true : false, username: username}) : null}>
                <Text style={[styles.headerText, {color: theme.color}]}>{specificFriends > 999 && specificFriends < 1000000 ? `${specificFriends / 1000}k` : specificFriends > 999999 ? `${specificFriends / 1000000}m` : specificFriends}</Text>
                <Text style={[styles.headerSupplementText, {color: theme.color}]}>{'Following'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.noOfPosts, {backgroundColor: theme.backgroundColor}]} onPress={person != null && !blockedUsers.includes(person.id) ? () => navigation.navigate('ViewingFollowers', {profile: name, ogUser: name == user.uid ? true : false, username: username}) : null}>
                <Text style={[styles.headerText, {color: theme.color}]}>{followers > 999 && followers < 1000000 ? `${followers / 1000}k` : followers > 999999 ? `${followers / 1000000}m` : followers}</Text>
                <Text style={[styles.headerSupplementText, {color: theme.color}]}>{'Followers'}</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={[styles.noOfPosts, {backgroundColor: theme.backgroundColor}]} onPress={() => navigation.navigate('GroupList', {user: name, ogUser: name == user.uid ? true : false, username: username})}>
                <Text style={[styles.headerText, {color: theme.color}]}>{groupsJoined.length > 999 && groupsJoined.length < 1000000 ? `${groupsJoined.length / 1000}k` : groupsJoined.length > 999999 ? `${groupsJoined.length / 1000000}m` : groupsJoined.length}</Text>
                <Text style={[styles.headerSupplementText, {color: theme.color}]}>{groupsJoined.length == 1 ? 'Cliq' : 'Cliqs'}</Text>
              </TouchableOpacity> */}
            </View>
        
        {/* <View style={{marginHorizontal: '5%', marginTop: '5%'}}>
              {song ? <View style={{flexDirection: 'row'}}>
                <FastImage source={{uri: song.album.images[2].url}} style={{height: 50, width: 50}}/>
                <View style={{alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', flex: 1}}>
                  <Text numberOfLines={1} style={[styles.headerSupplementText]}>{song.name}</Text>
                <Text numberOfLines={1} style={[styles.headerSupplementText]}>{song.album.artists[0].name}</Text>
                
                </View>
                {playing ? <MaterialCommunityIcons name='pause' color={"#fff"} size={35} style={{alignSelf: 'center', textAlign: 'right', paddingRight: 5}} onPress={() => pauseSound(song.preview_url)}/> :
                <MaterialCommunityIcons name='play' color={"#fff"} size={35} style={{alignSelf: 'center', textAlign: 'right', paddingRight: 5}} onPress={() => playSound(song.preview_url)}/>}
                </View>:
              null}
            </View> */}
        
        
          {posts.length > 0 && (friends.filter(e => e.id === name).length > 0 || !privacy) && postSetting ? <FlatList 
            data={additionalInfoMode ? posts.slice(0, 6) : previewMade | preview | applying ? posts.slice(0, 6) : posts.filter((item, index, self) => 
  index === self.findIndex((obj) => JSON.stringify(obj) === JSON.stringify(item))
)}
            renderItem={renderPosts}
            keyExtractor={item => item.id}
            numColumns={3}
            ListFooterComponent={<View style={{paddingBottom: 100}}/>}
            contentContainerStyle={{ marginHorizontal: '5%', marginVertical: '5%' }}
            style={[styles.secondMain, {marginTop: 0, backgroundColor: theme.backgroundColor}]}
            //scrollEnabled={false}
            
          /> : reposts.length > 0 && repostSetting && (friends.filter(e => e.id === name).length > 0 || !privacy) ? <FlatList 
            data={additionalInfoMode ? reposts.slice(0, 6) : previewMade | preview | applying ? reposts.slice(0, 6) : reposts}
            renderItem={renderReposts}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={{ marginHorizontal: '5%', marginVertical: '5%'}}
            style={[styles.secondMain, {backgroundColor: theme.backgroundColor, marginTop: 0}]}
          /> : privacy && !loading && !friends.filter(e => e.id === name).length > 0 ? <View style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
            <Text style={[styles.noPosts, {color: theme.color}]}>Private Account</Text>
            <Text style={[styles.noPosts, {color: theme.color, paddingTop: 0, fontSize: 15.36
            }]}>Must follow user in order to see posts</Text>
          </View> : loading && person != null && !(person.blockedUsers.includes(user.uid) || blockedUsers.includes(person.id)) ? <View style={{alignItems: 'center', flex: 1, justifyContent: 'center', marginBottom: '30%'}}>
          <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View>  :
          <View style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
            <Text style={[styles.noPosts, {color: theme.color}]}>{postSetting ? 'No Posts Yet!' : 'No Reposts Yet!'}</Text>
            
          </View>}
    </ScrollView>
    
   
    
    </>
  )
      
}

export default ViewingProfile

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get('screen').height * 0.25,
    backgroundColor: "#005278"
  },
  nameAge: {
    fontSize: 19.20,
    color: "#090909",
    fontFamily: 'Montserrat_700Bold',
    //textAlign: 'center',
    padding: 7.5,
    paddingBottom: 0,
  },
  nameContainer: {
    flexDirection: 'row',
    //marginBottom: '10%',
    marginLeft: '5%'
  },
  header: {
    flexDirection: 'row',
    //marginTop: '-12%',
    justifyContent: 'space-between',
    marginLeft: '2.5%',
    marginRight: '4%',
  },
  friendsContainer:{
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '90%',
    marginLeft: '5%',
    //marginTop: '-5%'
    },
  friendsHeader: {
    borderRadius: 5,
    backgroundColor: "lightblue",
    //borderColor: "#005278",
    //borderWidth: 0.5,
    marginTop: '2%',
    //marginHorizontal: '2.5%',
    //width: '30%',
    flex: 1,
    //maxWidth: '90%',
    marginHorizontal: '1%',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center'
  },
  horizontalLine: {
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#a4a4a4",
    width: '90%',
    marginLeft: '5%'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: '2%',
  },
  noOfPosts: {
    //borderRadius: 8,
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: '5%',
    //marginTop: '5%'
  },
  bioText: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    width: '90%',
    paddingLeft: 8.75,
    lineHeight: 14.5
  },
  friendsText: {
    fontSize: Dimensions.get('screen').height / 54.9,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    color: "#000",
  },
  postsHeaders: {

  },
  addContainer: {
        backgroundColor: "#000",
        height: 71,
        width: 71,
        borderRadius: 8,
        //justifyContent:'center'
    },
  headerText: {
    fontSize: 15.36,
   fontFamily: 'Montserrat_700Bold',
    color: "#000",
    padding: 5,
    paddingTop: 0,
    paddingBottom: 0,
    textAlign: 'center'
  },
  headerSupplementText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    color: "#fff",
    padding: 5,
    paddingTop: 0,
    paddingBottom: 0,
    textAlign: 'center'
  },
  profileCircle: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 7.5,
    borderColor: "#000",
  },
  noPosts: {
    fontSize: 19.20,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
    padding: 20
  },
  main: {
    marginRight: '5%',
      marginLeft: '5%',
        borderRadius: 25,
        
        height: '85%',
        //marginTop: '5%'
    //flex: 1
  },
  secondMain: {
        borderBottomLeftRadius: 25, borderBottomRightRadius: 25,
        borderColor: "grey",
        //flex: 1,
        //marginTop: '5%',
        //height: '100%',
        //flex: 1
        
        //marginTop: '10%'
        //marginBottom: '10%'
        //height: '70%'
  },
  mutualContainer: {
    marginTop: '5%',
    //alignItems: 'flex-end',
    marginRight: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  mutualText: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    alignSelf: 'center',
    padding: 10
  },
  addText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    color: "#000",
    padding: 10,
    textAlign: 'center'
  },
  getThemeText: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    color: '#0a1a5b',
    padding: 2.5,
    paddingLeft: 5,
    paddingBottom: 3.5
  },
  addPostContainer: {
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#005278',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '5%',
    width: '40%',
    justifyContent: 'center'
  },
  postList: {
    padding: 10
  },
  noMutualText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    alignSelf: 'center',
    //paddingRight: 0,
    //marginRight: '15%'
  },
  previewThemeContainer: {
    margin: '5%',
    marginTop: '10%',
    marginBottom: "2.5%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewThemeText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    alignSelf: 'center',
    padding: 5,
    paddingBottom: 0
  },
  barColor: {
        borderColor: '#3286ac'
    },
  previewHeader: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_600SemiBold',
    padding: 5,
    textAlign: 'center'
  },
  previewContainer: {
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    borderColor: "#979797"
  },
  previewText: {
    padding: 5,
    fontSize: 15.36,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  interests: {
    fontSize: 15.36,
    paddingBottom: 5,
    paddingLeft: 7.5,
    paddingTop: 0,
   fontFamily: 'Montserrat_500Medium',
    paddingRight: 0
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
    //backgroundColor: '#cdcdcd',
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
  input: {
    marginTop: '5%',
    height: 110,
    borderRadius: 5,
    borderWidth: 0.25,
    padding: 5
  },
  postName: {
    //alignSelf: 'center',
    paddingLeft: 15,
    fontSize: 15.36,
    fontFamily: 'Montserrat_700Bold',
    alignSelf: 'center',
    
  },
  postHeader: {
    fontSize: 19.20,
    fontFamily: 'Montserrat_700Bold',
    padding: 10
  },
  postLength: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    paddingBottom: 10,
    paddingTop: 5,
    textAlign: 'right'
  },
  image: {
     height: Dimensions.get('screen').height / 7,
    width: (Dimensions.get('screen').height / 7.5) * 1.01625,
    resizeMode: 'contain'
  },
  paragraph:{
        fontSize: 15.36,
        padding: 12,
        alignSelf: 'center',
        fontFamily: 'Montserrat_400Regular',
        color: "#000",
    },
    buyThemeText: {
    fontSize: 12.29,
    alignSelf: 'center',
    fontFamily: 'Montserrat_700Bold',
    color: "#005278",
    padding: 5
    //padding: 10
  },
  buyThemeContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    backgroundColor: "#fff",
    padding: 5,
    marginBottom: '-10%',
    zIndex: 3
  },
  fullImage: {
    /* height: 650,
    width: 350, */
    width: 350, // Specific width (optional)
    height: 350,
    resizeMode: 'contain',
    borderRadius: 10
  },
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
})