import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Alert, ScrollView, FlatList, Modal, TextInput, Touchable, ActivityIndicator, Dimensions, Keyboard} from 'react-native'
import React, {useState, useEffect, useContext, useCallback, useRef} from 'react'
import {MaterialCommunityIcons, MaterialIcons, FontAwesome} from '@expo/vector-icons';
import useAuth from '../Hooks/useAuth';
import { documentId, getFirestore, or, startAfter, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { getDoc, doc, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, setDoc, deleteDoc, where, getDocs, limit, getCountFromServer} from 'firebase/firestore';
import {getStorage, ref, getDownloadURL, uploadBytesResumable, deleteObject} from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import ThemeMadeProgression from '../Components/ThemeMadeProgression';
import FollowIcon from '../Components/FollowIcon';
import FollowingIcon from '../Components/FollowingIcon';
import Checkbox from 'expo-checkbox';
import { Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import FastImage from 'react-native-fast-image';
import ThemeHeader from '../Components/ThemeHeader';
import RequestedIcon from '../Components/RequestedIcon';
import {BACKEND_URL, MODERATION_API_USER, MODERATION_API_SECRET, IMAGE_MODERATION_URL} from "@env"
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import MainButton from '../Components/MainButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NextButton from '../Components/NextButton';
import {Image} from 'react-native-compressor'
import themeContext from '../lib/themeContext';
import ChatBubble from 'react-native-chat-bubble'
import * as WebBrowser from 'expo-web-browser';
import {Audio} from 'expo-av';
import { makeRedirectUri, useAuthRequest, ResponseType} from 'expo-auth-session';
import SearchInput from '../Components/SearchInput';
import { db } from '../firebase'
WebBrowser.maybeCompleteAuthSession();
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};
const ProfileScreen = ({route}) => {
  const {name, preview, viewing, previewImage, previewMade, applying}= route.params;
  //console.log(previewImage)
  
  //console.log(route.params)
  const [background, setBackground] = useState(null);
  const [forSale, setForSale] = useState(false);
  const [spotifyModal, setSpotifyModal] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [moreResults, setMoreResults] = useState(false);
  const [moreResultButton, setMoreResultButton] = useState(false);
  const theme = useContext(themeContext)
    const [token, setToken] = useState('');
  const [soundLoading, setSoundLoading] = useState(false);
    //const dispatch = useDispatch();
    const [playing, setPlaying] = useState(false);
    const [data, setData] = useState(null);
    const [specificSearch, setSpecificSearch] = useState('');
    const [songs, setSongs] = useState([]);
    const [artist, setArtist] = useState("");
    const [song, setSong] = useState("");
    const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true)
  const [isFirstTime, setIsFirstTime] = useState(false);
  const sound = useRef(new Audio.Sound());
  const [followers, setFollowers] = useState(0);
  const [numberOfPosts, setNumberOfPosts] = useState(0);
  const [repostSetting, setRepostSetting] = useState(false);
  const [postSetting, setPostSetting] = useState(true);
  const [numberOfReposts, setNumberOfReposts] = useState(0);
  const [reposts, setReposts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [specificFriends, setSpecificFriends] = useState(0);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loggedInS, setLoggedInS] = useState(false);
  const [groupsJoined, setGroupsJoined] = useState([]);
  const [imageModal, setImageModal] = useState(false);
  const [eventsJoined, setEventsJoined] = useState([]);
  const [status, setStatus] = useState(null);
  const [focused, setFocused] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [soundStatus, setSoundStatus] = useState(null);
  const [followerFriends, setFollowerFriends] = useState([]);
  const [ableToMessage, setAbleToMessage] = useState([]);
  const [lastName, setLastName] = useState();
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState(null);
  const [person, setPerson] = useState(null);
  const [age, setAge] = useState();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [bio, setBio] = useState('');
  const [privacy, setPrivacy] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [pfp, setPfp] = useState();
  const [additionalInfoMode, setAdditionalInfoMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [post, setPost] = useState('');
  const {user} = useAuth()
  const navigation = useNavigation(); 
  const [lastVisible, setLastVisible] = useState();
  const storage = getStorage();
  const [multiLoading, setMultiLoading] = useState(false);
  const [yesChecked, setYesChecked] = useState(false);
  const [noChecked, setNoChecked] = useState(false);
  const [personal, setPersonal] = useState();
  const [free, setFree] = useState();
  const [sale, setSale] = useState();
  const [notificationToken, setNotificationToken] = useState('');
  console.log(posts)
  /* useEffect(() => {
    setname(name)
  }, [route.params?.name]) */
  useEffect(() => {
    return sound // Unload the sound when component unmounts
      ? () => {
          sound.current.unloadAsync(); 
        }
      : undefined;
  }, [sound]);
  useEffect(() => {
    const getData = async() => {
      const docSnap = await getDoc(doc(db, 'profiles', user.uid))
      let numOfFriends = docSnap.data().following
      let numOfFollowers = docSnap.data().followers
      setSpecificFriends(numOfFriends.length)
      setFollowers(numOfFollowers.length)
      //setSpecificFriends({id: docSnap.id, ...docSnap.data()})
    }
    getData();
  }, [])
  useEffect(() => {
    const getData = async() => {
      const docSnap = await getDoc(doc(db, 'profiles', name))
      setPerson({id: docSnap.id, ...docSnap.data()})
    }
    getData();
  }, [name])
  


const searchSongs = async () => {
    try {
    const response = await fetch(`${BACKEND_URL}/search?q=${specificSearch}`); 
    const data = await response.json();
    setFiltered(data.tracks.items);
  } catch (error) {
    console.error(error);
  }
  };
    const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: '6d05a19280784bcd80bfb5cdfa6c777d',
      clientSecret: '717091612788496ea51926ed0d5440a5',
      scopes: ["user-read-currently-playing",
        "offline_access",
        "user-read-recently-played",
        "user-read-playback-state",
        "user-top-read",
        "user-modify-playback-state",
        "streaming",
        "user-read-email",
        "user-read-private"],
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      // For usage in managed apps using the proxy
      redirectUri: "nucliqv1://"
    },
    discovery
  );
  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      console.log(response)
      setToken(access_token);
      const getData = async() => {
      try {

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${specificSearch}&type=track`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    //console.log(data.tracks.items[0].name)
      setFiltered(data.tracks.items);
    } catch (error) {
      console.error(error);
    }
  }
  getData();
    }
  }, [response]);
  /* useEffect(() => {
    if (token) {
      //console.log(token)
      axios(
        "https://api.spotify.com/v1/me/top/tracks?time_range=short_term", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
        .then((response) => {
          console.log(response.data.items[0])
          setData(response)
          setSong(response.data.items[0].name)
          setImage(response.data.items[0].album.images[2].url)
          setArtist(response.data.items[0].album.artists[0].name)
          //console.log(response)
          //dispatch(songAction.addTopSongs(response));
        })
        .catch((error) => {
          console.log("error", error.message);
        });
      //dispatch(tokenAction.addToken(token));
    }
  }, [token]); */
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
  /* useEffect(() => {
    if (song && sound.current && !focused) {
      pauseSound(song.preview_url)
    }
  }, [focused, song, sound]) */
  //console.log(song)
  const playSound = async (previewUrl) => {
     //console.log(previewUrl)
  // ... your audio mode setup ...

  // Check if already loading
  if (soundLoading || (soundStatus && soundStatus.isLoaded)) {
    return; // Don't load again if already loaded or loading
  }

  setSoundLoading(true);

  try {
    // Load the sound
    const status = await sound.current.loadAsync({ uri: previewUrl }, {}, true); // Start loading with 'true' to get status updates

    // Set looping and unmute after successful loading
    if (status.isLoaded) {
      await sound.current.setIsLoopingAsync(true);
      await sound.current.setIsMutedAsync(false);
      await sound.current.playAsync();
      setPlaying(true);
    }

    setSoundStatus(status); // Update sound status
  } catch (error) {
    console.error('Error playing sound:', error);
    setSoundLoading(false); // Reset loading status on error
  }
};


  const pauseSound = async () => {
    console.log('bruh')
    try {
      await sound.current.pauseAsync();
      await sound.current.unloadAsync();
      setPlaying(false);
    } catch (error) {
      console.error('Error pausing sound:', error);
    }
  };
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
    
  }, [name])
  //console.log(prevRoute)
  //console.log(response)
  
  
  
  useEffect(() => {
    const coll = query(collection(db, "profiles", name, 'posts'), where('repost', '==', false));
    const getCount = async() => {
      const snapshot = await getCountFromServer(coll);
      setNumberOfPosts(snapshot.data().count)
    }
    getCount()
    //console.log('count: ', snapshot.data().count);
  }, [])
  useEffect(() => {
    const coll = query(collection(db, "profiles", name, 'posts'), where('repost', '==', true));
    const getCount = async() => {
      const snapshot = await getCountFromServer(coll);
      setNumberOfReposts(snapshot.data().count)
    }
    getCount()
    //console.log('count: ', snapshot.data().count);
  }, [])
  useEffect(() => {
    //console.log(name)
    let unsub;
      new Promise(resolve => {
    const fetchProfileDetails = async() => {
      unsub = onSnapshot(query(doc(db, 'profiles', name)), (snapshot) => {
       setFirstName(snapshot.data().firstName)
       setLastName(snapshot.data().lastName)
       setUsername(snapshot.data().userName)
       setPfp(snapshot.data().pfp)
       setSong(snapshot.data().song)
       setBackground(snapshot.data().background)
       setForSale(snapshot.data().forSale)
       setPrivacy(snapshot.data().private)
       setBio(snapshot.data().bio)
       setGroupsJoined(snapshot.data().groupsJoined)
       setNotificationToken(snapshot.data().notificationToken)
      })
    }
    fetchProfileDetails()
        
          resolve(); // Resolve the Promise after setCompleteMessages is done
      }).finally(() => setLoading(false));
    return unsub;
  }, [])
  useEffect(() => {
    const getData = async() => {
      const isFirstTimeValue = await AsyncStorage.getItem('isFirstTime');
      if (isFirstTimeValue === null) {
        setIsFirstTime(true)
      }
      else {
        setIsFirstTime(false)
      }
    }
    getData();
    
  }, [])
  function skipWalkthrough() {
    const check = async() => {
      await AsyncStorage.setItem('isFirstTime', 'false');
      setIsFirstTime(false)
    }
    check()
  }
  useEffect(() => {
    if (postSetting) {
      setPosts([]);
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
  }, [postSetting])
  useEffect(() => {
    if (repostSetting) {
      setReposts([]);
    let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'profiles', name, 'posts'), where('repost', '==', true), orderBy('timestamp', 'desc'), limit(9)), (snapshot) => {
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
  }, [repostSetting])
  //console.log(posts[0]);
  //console.log(posts)
  //console.log(lastVisible)
  function fetchMoreRepostData () {
    if (lastVisible != undefined) {
    
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
    if (lastVisible != undefined) {
    
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
    
    
  }, [])
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
              uploadImage(result)
                      
            })
            }
            else {
              setLoading(false)
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
  async function addFriend(item) {
    //console.log(item)
    let data = (await getDoc(doc(db, 'profiles', item))).data()
    //console.log(data)
    //console.log(privacy)
    if (data.private) {
      //console.log('first')
      await setDoc(doc(db, 'profiles', user.uid, 'requests', item), {
      id: item,
      actualRequest: true,
      timestamp: serverTimestamp()
    }).then(async() => await setDoc(doc(db, 'profiles', item, 'requests', user.uid), {
      id: user.uid,
      actualRequest: false,
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'profiles', item, 'notifications'), {
      like: false,
      comment: false,
      friend: true,
      item: null,
      request: true,
      acceptRequest: false,
      postId: item,
      theme: false,
      report: false,
      requestUser: user.uid,
      requestNotificationToken: data.notificationToken,
      likedBy: [],
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'profiles', item, 'checkNotifications'), {
      userId: user.uid
    })).then(() => schedulePushRequestFriendNotification(item, username, data.notificationToken)).catch((e) => console.log(e))
    }
    else if (!data.private) {
      await setDoc(doc(db, 'profiles', user.uid, 'friends', item), {
      friendId: item + user.uid,
      actualFriend: true,
      timestamp: serverTimestamp(),
      lastMessageTimestamp: serverTimestamp()
    }).then(async() => await setDoc(doc(db, 'profiles', item, 'friends', user.uid), {
      friendId: item + user.uid,
      actualFriend: true,
      timestamp: serverTimestamp(),
      lastMessageTimestamp: serverTimestamp()
    })).then(async() => await setDoc(doc(db, 'friends', item + user.uid), {
      lastMessageTimestamp: serverTimestamp(),
    })).then(() => addDoc(collection(db, 'profiles', item, 'notifications'), {
       like: true,
      comment: false,
      friend: false,
      item: item,
      request: false,
      acceptRequest: false,
      theme: false,
      report: false,
      postId: item,
      requestUser: user.uid,
      requestNotificationToken: data.notificationToken,
      likedBy: [],
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'profiles', user.uid, 'checkNotifications'), {
      userId: user.uid
    })).then(async() => await updateDoc(doc(db, 'usernames', user.uid), {
      friend: increment(1)
    })).then(() => schedulePushFriendNotification(item, username, data.notificationToken)).catch((e) => console.log(e))
    }
  }
  async function removeFriend() {
    //console.log('first')
    await updateDoc(doc(db, 'profiles', user.uid, 'friends', name), {
      actualFriend: false
    }).then(async() => await updateDoc(doc(db, 'usernames', user.uid), {
      friend: increment(-1)
    }))
  }
  
  useEffect(() => {
    if (userData != null) {
      /* addDoc(collection(db, 'profiles', name, 'friendRequests'), {
        id: user.uid,
        timestamp: serverTimestamp(),
        info: userData
      }) */
      addDoc(collection(db, 'profiles', name, 'notifications'), {
      like: false,
      comment: false,
      friend: true,
      friendId: user.uid,
      info: userData,
      likedBy: username,
      timestamp: serverTimestamp()
    }).then(() => addDoc(collection(db, 'profiles', name, 'checkNotifications'), {
      userId: user.uid
    }))
    }
  }, [userData])
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
        username: username, pushToken: notificationToken
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
  useEffect(() => {
    if (specificSearch.length > 0) {
      searchSongs(specificSearch)
    }
  }, [specificSearch])
  useEffect(() => {
    let unsub;
    const fetchData = () => {
      unsub = onSnapshot(query(collection(db, 'friends'), or(where(documentId(), '==', name + user.uid), where(documentId(), '==', user.uid + name))), (snapshot) => {
          setAbleToMessage(snapshot.docs.map((doc) => ({
            id: doc.id,
          })))
        })
      }
    fetchData();
    return unsub;
  }, [])
  async function messageFriend() {
    if (ableToMessage.length > 0 ) {
      navigation.navigate('PersonalChat',{friendId: name + user.uid, person: person, active: true})
    }
    else {
      Alert.alert('You must both be following each other first (mutual friends) in order to message!')
    }
  }
  async function searchFunction (item) {
    setSong(item)
    setSpotifyModal(false)
    await updateDoc(doc(db, 'profiles', user.uid), {
      song: item
    })
  }
  const renderEvents = ({item, index}) => {
    return (
      <View key={index}>
        <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => searchFunction(item)}>
          <FastImage source={{uri: item.album.images[2].url}} style={{height: 40, width: 40, borderRadius: 8}}/>
          <View style={{marginLeft: '2.5%'}}>
            <Text style={styles.categories}>{item.name}</Text>
            <Text style={styles.categories}>{item.album.artists[0].name}</Text>
          </View>
            
        </TouchableOpacity>
      </View>
    )
  }
  const deleteSong = async() => {
    await updateDoc(doc(db, 'profiles', user.uid), {
      song: null
    }).then(() => setSong(null))
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
        username: username, pushToken: notificationToken
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
        }).then(async() => 
          await updateDoc(doc(db, 'usernames', user.uid), {
            pfp: url
            }))/* .then(async() => {(await getDocs(query(collection(db, 'posts'), where('userId', '==', name)))).forEach(async(document) => {
          await updateDoc(doc(db, 'posts', document.id), {
            pfp: url
          })
        })}).then(() => groupsJoined.map(async(e) => {(await getDocs(query(collection(db, 'groups', e, 'posts'), where('userId', '==', name)))).forEach(async(document) => {
          await updateDoc(doc(db, 'groups', e, 'posts', document.id), {
            pfp: url
          })
        })}))
        })}) */.then(() => setUploading(false))
    }  
      
                    })
            .catch(function (error) {
            // handle error
            if (error.response) console.log(error.response.data);
            else console.log(error.message);
            });
    }
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
  //console.log(background)
  return (
    <>

    {preview ? <View style={{backgroundColor: theme.backgroundColor}}>
      <ThemeMadeProgression text={"Profile Theme Preview"} noAdditional={true}/> 
        </View> : previewMade ? 
      <View style={{backgroundColor: theme.backgroundColor}}>
      <ThemeMadeProgression text={"Profile Theme Preview"} personal={handlePersonalCallback} free={handleFreeCallback} sale={handleSaleCallback} 
        personalStyle={personal ? {backgroundColor: "#005278"} : {backgroundColor: theme.backgroundColor}} freeStyle={free ? {backgroundColor: "#005278"} : {backgroundColor: theme.backgroundColor}} saleStyle={sale ? {backgroundColor: "#005278"} : {backgroundColor: theme.backgroundColor}} /> 
        </View>
        : applying ? 
      <View style={{backgroundColor: "#005278"}}>
        <View style={styles.previewThemeContainer}> 
          <Text style={[styles.previewThemeText, {color: theme.color}]}>My Themes</Text>
          <TouchableOpacity style={{alignSelf: 'center', padding: 5, paddingTop: 10, marginLeft: 'auto'}} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name='close' size={20} color={theme.color}  />
          </TouchableOpacity>
        </View>
        <View style={styles.previewContainer}>
          <Text style={[styles.previewHeader, {color: theme.color}]}>PROFILE THEME PREVIEW</Text>
          <Text style={[styles.previewText, {color: theme.color}]}>This is how your feeds will look like using this theme.</Text>
        </View>
      </View> 
       : 
      viewing ? 
      <View style={{backgroundColor: theme.backgroundColor}}>
        <ThemeHeader text={"Viewing Profile"} video={false} backButton={true}/>
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
   <Modal visible={isFirstTime} transparent animationType='slide' onRequestClose={() => {setIsFirstTime(!isFirstTime); }}>
          <View style={[styles.modalContainer, styles.overlay, {alignItems: 'center', justifyContent: 'center'}]}>
            <View style={[styles.modalView, {height: 245, width: '90%', borderRadius: 20, backgroundColor: theme.backgroundColor}]}>
                <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', marginRight: '-2.5%', marginVertical: 5}} onPress={() => {skipWalkthrough()}}>
                  <Text style={{fontFamily: 'Montserrat_400Regular', fontSize: 15.36, color: theme.color}}>Skip</Text>
                  {/* <MaterialCommunityIcons name='close' size={20} style={{alignSelf: 'center'}}/> */}
              </TouchableOpacity>
              <Text style={{fontFamily: 'Montserrat_700Bold', fontSize: 19.20, marginRight: '5%', paddingBottom: 10, paddingTop: 0, color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}}>Profile</Text>
              <Divider style={{borderWidth: 0.5, width: '100%', marginRight: '5%', borderColor: theme.color}}/>
              <Text style={{fontFamily: 'Montserrat_500Medium', fontSize: 15.36, paddingVertical: 10, marginRight: '5%', color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}}>Welcome, this is the Profile page of NuCliq where you can view and edit your profile, view and edit the posts you've shared, and browse the settings of your account!</Text>
              <View style={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', marginRight: '5%'}}>
              {/* <View style={{ marginTop: '2.5%'}}>
                 <MainButton text={"BACK"} onPress={() => {setIsFirstTime(true); navigation.navigate('Themes', {screen: 'All', params: {name: null, groupId: null, goToMy: false, groupTheme: null, group: null, registers: false, firstTime: true}})}}/>
              </View>              */}
              <View style={{marginLeft: '2.5%', marginTop: '2.5%'}}>
                <NextButton text={"FINISH"} onPress={() => {skipWalkthrough()}}/>
              </View>
            </View>
            </View>
          </View>
        </Modal>
        <Modal visible={imageModal} animationType="fade" transparent onRequestClose={() => setImageModal(!imageModal)}>
              <View style={[styles.pfpModalContainer, styles.overlay]}>
                <View style={styles.pfpModalView}> 
                  <MaterialCommunityIcons name='close' color={theme.color}  size={35} style={{textAlign: 'right', paddingRight: -30, paddingBottom: 10, paddingTop: 10}} onPress={preview ? null : () => setImageModal(false)}/>
                  <View style={{alignItems: 'center'}}>
                    {pfp ? <FastImage source={{uri: pfp}} style={styles.fullImage}/> : <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />}
                  </View>
                </View>
              </View>



            </Modal>
        <Modal visible={spotifyModal} animationType='fade' onRequestClose={() => setSpotifyModal(false)}>
          <View style={[styles.modalContainer, {backgroundColor: "#121212",}]}>
              <View style={[styles.modalView, {backgroundColor: "#121212", marginTop: '12.5%', height: '90%', marginLeft: '5%', borderWidth: 1, borderColor: "#fff"}]}>
                <MaterialCommunityIcons name='close' color={theme.color} size={30} style={{textAlign: 'right', paddingRight: -30, paddingBottom: 10, paddingTop: 10}} onPress={() => setSpotifyModal(false)}/>
                <TouchableOpacity activeOpacity={1} style={{width: '100%', marginTop: '2.5%', zIndex: 0}}>
            <View style={{flexDirection: 'row'}}>
                  <SearchInput autoFocus={true} value={specificSearch} icon={'magnify'} placeholder={'Search'} iconStyle={styles.homeIcon}
                  containerStyle={{borderWidth: 1, borderColor: theme.color, width: '100%'}} text={true} onChangeText={setSpecificSearch}/>
                  </View>
                  <View>
                  {filtered.length == 0 && specificSearch.length > 0 ?
                  <View>
                    <Text style={{fontFamily: 'Montserrat_500Medium', color: theme.color, fontSize: 15.36, paddingHorizontal: 10, textAlign: 'center', marginRight: '5%', marginTop: '5%'}}>No Search Results</Text>
                  </View> :  
                  moreResults
                  ?
                  <>
                  <FlatList 
                      data={!moreResults ? filtered.slice(0, 3) : filtered.slice(0, 10)}
                      renderItem={renderEvents}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{flexGrow: 1}}
                      //contentContainerStyle={{width: '100%', zIndex: 3, flewGrow: 1}}
                      scrollEnabled={moreResultButton ? false: true}
                  /> 
                  
                  </>
                  : (moreResults || specificSearch.length > 0) ? 
                  <View>
                  <FlatList 
                      data={!moreResults ? filtered.slice(0, 3) : filtered.slice(0, 10)}
                      renderItem={renderEvents}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{flexGrow: 1}}
                      scrollEnabled={moreResultButton ? false: true}
                  /> 
                  {moreResults ? 
                  <TouchableOpacity style={{alignItems: 'center', marginRight: '5%'}} onPress={() => {setMoreResults(true); Keyboard.dismiss(); setMoreResultButton(false);}}>
                    <Text style={{paddingTop: 5, color: theme.theme != 'light' ? "#9EDAFF" : "#005278", fontFamily: 'Montserrat_400Regular'}}>See more results</Text>
                    </TouchableOpacity> : null}
                  </View> : <></>}
                  
                  </View>
                  
                  
              </TouchableOpacity>
              </View>
          </View>

        </Modal>
        {/* {background && forSale ? 
      <TouchableOpacity style={styles.buyThemeContainer} onPress={preview ? null : () => buyThemeFunction(background, name, person.forSale)}>
       <FontAwesome name='photo' size={22.5} style={{alignSelf: 'center'}}/>
      </TouchableOpacity> : null} */}
      <FastImage style={styles.container} source={!loading ? previewImage ? {uri: previewImage} : background ? {uri: background} : require('../assets/Default_theme.jpg') : null} />
      <View  style={{flexDirection: 'row'}}>
      
          <View style={{width: '77.5%'}}>
            <Text style={[styles.nameAge, {color: theme.color}]} numberOfLines={1}>@{username}</Text>
            <Text style={[styles.nameAge, {color: theme.color}]} numberOfLines={1}>{firstName} {lastName}</Text>
            
          </View>
          <TouchableOpacity style={{marginTop: '-7.5%', alignItems: 'flex-end', marginRight: '5%', flex: 1}} activeOpacity={1} onPress={() => pickImage()} onLongPress={!pfp ? null : () => setImageModal(true)}>
              {uploading || loading ? <ActivityIndicator style={styles.profileCircle} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} /> : pfp ? <FastImage source={{uri: pfp, priority: 'normal'}} style={styles.profileCircle} /> 
              : <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.profileCircle} />}
            
            </TouchableOpacity>
          </View>
          {bio.length > 0 ? 
            <TouchableOpacity onPress={() => setAdditionalInfoMode(!additionalInfoMode)} style={{flexDirection: 'row', alignItems: 'center', marginLeft: '3.5%', marginRight: '3.5%', justifyContent: 'space-between'}}>
              <Divider borderWidth={1} style={{width: '45%'}} borderColor={theme.color}/>
              {additionalInfoMode ? <MaterialCommunityIcons name='chevron-up' style={{alignSelf: 'center'}} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={25} /> : <MaterialCommunityIcons name='chevron-down' style={{alignSelf: 'center'}} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={25}/> }
              <Divider borderWidth={1} style={{width: '45%'}} borderColor={theme.color}/>
            </TouchableOpacity> : null}
            {(bio != undefined || null) && additionalInfoMode ? 
           <Text style={[styles.bioText, {color: theme.color}]}>{bio != undefined || null ? bio : null}</Text> 
            : null}
             <View style={styles.friendsContainer}>
          {user != null ? name == user.uid ? <TouchableOpacity style={[styles.friendsHeader, {flexDirection: 'row'}]} onPress={() => navigation.navigate('Edit', {firstName: firstName, lastName: lastName, 
            pfp: pfp, username: username, id: name, bio: bio})}>
            <Text style={styles.friendsText}>Edit</Text>
            
          </TouchableOpacity> :
          <TouchableOpacity style={[styles.friendsHeader, {alignSelf: 'center', paddingLeft: 18, padding: 3}]} onPress={name == user.uid || friendRequests.filter(e => e.id === name).length > 0 ? null : friends.filter(e => e.id === name).length > 0 ? () => removeFriend()  : () => addFriend(name)}>
            {friendRequests.filter(e => e.id === name).length > 0 ? <RequestedIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} /> : 
              friends.filter(e => e.id === name).length > 0 ? <FollowingIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
              : name == user.uid ? null : <FollowIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />}
            {/* user.uid != null ? friends.filter(e => e.id === item.userId).length > 0 ? () => removeFriend(item.userId) : item.userId == user.uid || requests.filter(e => e.id === item.userId).length > 0 ? null : () => addFriend(item.userId): null */}
          </TouchableOpacity> : null}
          {user != null ? name == user.uid ? <TouchableOpacity style={styles.friendsHeader} onPress={() => navigation.navigate('Settings', {username: username})}>
            <Text style={styles.friendsText}>Settings</Text>
          </TouchableOpacity> : <TouchableOpacity style={styles.friendsHeader} onPress={() => messageFriend()}>
            <Text style={styles.friendsText}>Message</Text>
          </TouchableOpacity>: null} 
          
        </View>
        <View style={styles.headerContainer}>
              <TouchableOpacity onPress={postSetting ? null : () => {setPostSetting(true); setRepostSetting(false)}} style={[styles.noOfPosts, {backgroundColor: theme.backgroundColor}]}>
                <Text style={[styles.headerText, {color: theme.color}]}>{numberOfPosts > 999 && numberOfPosts < 1000000 ? `${numberOfPosts / 1000}k` : numberOfPosts > 999999 ? `${numberOfPosts / 1000000}m` : numberOfPosts}</Text>
                <Text style={[styles.headerSupplementText, {color: theme.color}]}>{numberOfPosts == 1 ? 'Post' : 'Posts'}</Text>
              </TouchableOpacity >
              <TouchableOpacity onPress={repostSetting ? null : () => {setRepostSetting(true); setPostSetting(false)}} style={[styles.noOfPosts, {backgroundColor: theme.backgroundColor}]}>
                <Text style={[styles.headerText, {color: theme.color}]}>{numberOfReposts > 999 && numberOfReposts < 1000000 ? `${numberOfReposts / 1000}k` : numberOfReposts > 999999 ? `${numberOfReposts / 1000000}m` : numberOfReposts}</Text>
                <Text style={[styles.headerSupplementText, {color: theme.color}]}>{numberOfReposts == 1 ? 'Repost' : 'Reposts'}</Text>
              </TouchableOpacity >
              <TouchableOpacity style={[styles.noOfPosts, {backgroundColor: theme.backgroundColor}]} onPress={() => navigation.navigate('Friends', {profile: name, ogUser: name == user.uid ? true : false, username: username})}>
                <Text style={[styles.headerText, {color: theme.color}]}>{specificFriends > 999 && specificFriends < 1000000 ? `${specificFriends / 1000}k` : specificFriends > 999999 ? `${specificFriends / 1000000}m` : specificFriends}</Text>
                <Text style={[styles.headerSupplementText, {color: theme.color}]}>{'Following'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.noOfPosts, {backgroundColor: theme.backgroundColor}]} onPress={() => navigation.navigate('ViewingFollowers', {profile: name, ogUser: name == user.uid ? true : false, username: username})}>
                <Text style={[styles.headerText, {color: theme.color}]}>{followers > 999 && followers < 1000000 ? `${followers / 1000}k` : followers > 999999 ? `${followers / 1000000}m` : followers}</Text>
                <Text style={[styles.headerSupplementText, {color: theme.color}]}>{'Followers'}</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={[styles.noOfPosts, {backgroundColor: theme.backgroundColor}]} onPress={() => navigation.navigate('GroupList', {user: name, ogUser: name == user.uid ? true : false, username: username})}>
                <Text style={[styles.headerText, {color: theme.color}]}>{groupsJoined.length > 999 && groupsJoined.length < 1000000 ? `${groupsJoined.length / 1000}k` : groupsJoined.length > 999999 ? `${groupsJoined.length / 1000000}m` : groupsJoined.length}</Text>
                <Text style={[styles.headerSupplementText, {color: theme.color}]}>{groupsJoined.length == 1 ? 'Cliq' : 'Cliqs'}</Text>
              </TouchableOpacity> */}
            </View>
            {/* <View style={{marginHorizontal: '5%', marginTop: '5%'}}>
              {song ? <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => {setSpotifyModal(true)}}>
                <FastImage source={{uri: song.album.images[2].url}} style={{height: 50, width: 50}}/>
                <View style={{alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', flex: 1}}>
                  <Text numberOfLines={1} style={[styles.headerSupplementText]}>{song.name}</Text>
                <Text numberOfLines={1} style={[styles.headerSupplementText]}>{song.album.artists[0].name}</Text>
                
                </View>
                {playing ? <MaterialCommunityIcons name='pause' color={"#fff"} size={35} style={{alignSelf: 'center', textAlign: 'right', paddingRight: 5}} onPress={() => pauseSound(song.preview_url)}/> :
                <MaterialCommunityIcons name='play' color={"#fff"} size={35} style={{alignSelf: 'center', textAlign: 'right', paddingRight: 5}} onPress={() => playSound(song.preview_url)}/>}
                <MaterialCommunityIcons name='close' size={20} color={"#fff"} onPress={() => deleteSong()}/>
                </TouchableOpacity>:
              <NextButton text={"Add your Music Anthem! +"} textStyle={{fontSize: 15.36}} onPress={() => setSpotifyModal(true)}/>}
            </View> */}
            {posts.length > 0 && postSetting ? <FlatList 
            data={additionalInfoMode ? posts.slice(0, 6) : previewMade | preview | applying ? posts.slice(0, 6) : posts}
            renderItem={renderPosts}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={{ marginHorizontal: '5%', marginVertical: '5%'}}
            style={[styles.secondMain, {backgroundColor: theme.backgroundColor, marginTop: 0}]}
          /> : reposts.length > 0 && repostSetting ? <FlatList 
            data={additionalInfoMode ? reposts.slice(0, 6) : previewMade | preview | applying ? reposts.slice(0, 6) : reposts}
            renderItem={renderReposts}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={{ marginHorizontal: '5%', marginVertical: '5%'}}
            style={[styles.secondMain, {backgroundColor: theme.backgroundColor, marginTop: 0}]}
          /> : loading ? <View style={{alignItems: 'center', flex: 1, justifyContent: 'center', marginTop: '20%'}}>
          <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View>  :
          <View style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
            <Text style={[styles.noPosts, {color: theme.color}]}>{postSetting ? 'No Posts Yet!' : 'No Reposts Yet!'}</Text>
            {name == user.uid && postSetting ? 
              <>
            <TouchableOpacity style={{backgroundColor: "#eee", alignItems: 'center',
           justifyContent: 'center', width: '30%', borderRadius: 8}} onPress={() => navigation.navigate('New Post', {screen: 'NewPost', params: {group: false, postArray: []}})}>
              <MaterialIcons name='library-add' size={50} style={{paddingVertical: 25}}/>
            </TouchableOpacity>
            <Text style={[styles.noPosts, {color: theme.color}]}>Create a New Post!</Text>
            </> : null}
            
          </View>}
          
    </ScrollView>
    
   
    
    </>
  )
      
}

export default ProfileScreen

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
    //width: '30%',
    flex: 1,
    marginHorizontal: '2.5%',
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
    //borderWidth: 1,
    //borderColor: '#2a0c27',
    //alignItems: 'center',
    //justifyContent: 'center',
    //marginBottom: '8%',
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
    fontSize: 15.36,
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
    width: 82.5,
    height: 82.5,
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
        marginTop: '5%',
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
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
  },
  interests: {
    fontSize: 15.36,
    paddingBottom: 5,
    paddingLeft: 7.5,
    paddingTop: 0,
    fontFamily: 'Montserrat_500Medium',
    paddingRight: 0
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
    height: Dimensions.get('screen').height / 7.5,
    width: (Dimensions.get('screen').height / 7.5) * 1.01625,
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
  
  modalContainer: {
        flex: 1,
    },
  modalView: {
    width: '90%',
    height: '40%',
    //margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    paddingLeft: '5%',
    paddingRight: '5%',
    //paddingRight: 0,
    paddingTop: 5,
    paddingBottom: 25,

    //alignItems: 'center',
  },
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    fullImage: {
    /* height: 650,
    width: 350, */
    width: 350, // Specific width (optional)
    height: 350,
    resizeMode: 'contain',
    borderRadius: 10
  },
  pfpModalContainer: {
    flex: 1,
        //justifyContent: 'center',
        alignItems: 'center',
        //marginTop: 22
  }, 
  pfpModalView: {
    width: '100%',
    height: '100%',
    //margin: 20,
    backgroundColor: '#cdcdcd',
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
  spotifyText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    color: "#fff",
    alignSelf: 'center',
    padding: 10
  },
  homeIcon: {position: 'absolute', left: 280, top: 8.5},
  categoriesContainer: {
    borderRadius: 5,
    flexDirection: 'row',
    //marginRight: '5%',
    marginTop: 5,
    padding: 5,
    alignItems: 'center',
    //justifyContent: 'space-between',
    width: '95%',
  },
  categories: {
    fontSize: 12.29,
    color: "#fff",
    fontFamily: 'Montserrat_500Medium'
  },
})