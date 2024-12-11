import { StyleSheet, Text, View, TouchableOpacity, TextInput, Dimensions, Alert, Modal, FlatList, ImageBackground, ActivityIndicator } from 'react-native'
import React, {useEffect, useState, useMemo, useRef, useContext} from 'react'
import { where, onSnapshot, query, collection, doc, getDoc, arrayRemove, arrayUnion, deleteDoc, getDocs, setDoc, getCountFromServer, limit, startAfter, updateDoc, serverTimestamp, addDoc, getFirestore, orderBy } from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import {MaterialCommunityIcons, Feather, FontAwesome} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; 
import { Menu, Provider } from 'react-native-paper';
import axios from 'axios';
import PostComponent from '../Components/PostComponent';
import MainLogo from '../Components/MainLogo';
import FastImage from 'react-native-fast-image';
import {BACKEND_URL, MODERATION_API_USER, MODERATION_API_SECRET, IMAGE_MODERATION_URL} from "@env"
import { ScrollView } from 'react-native-gesture-handler';
import { Video } from 'expo-av';
import { useFonts, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import RequestedIcon from '../Components/RequestedIcon';
import * as Haptics from 'expo-haptics';
import { Image } from 'react-native-compressor';
import themeContext from '../lib/themeContext';
import { db } from '../firebase';
const GroupHome = ({route}) => {
    const { name} = route.params;
    const [group, setGroup] = useState({members: [], admins: []});
    //console.log(group.id)
    //console.log(group)
    const [secondReport, setSecondReport] = useState(false);
    const [blockedUsers, setBlockedUsers] = useState([]);
    
    const {user} = useAuth()
    const storage = getStorage();
    const videoRef = useRef(null);
    const [themes, setThemes] = useState([]);
    const [members, setMembers] = useState(1);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [messageNotifications, setMessageNotifications] = useState([]);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
      const [notificationToken, setNotificationToken] = useState('');
    const [background, setBackground] = useState();
    const [pfp, setPfp] = useState();
    const theme = useContext(themeContext)
    const [username, setUsername] = useState('');
    const [searchKeywords, setSearchKeywords] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [groupsJoined, setGroupsJoined] = useState([]);
    const [recentSearches, setRecentSearches] = useState(false);
    const [lastName, setLastName] = useState('');
    const [post, setPost] = useState('');
    const [posts, setPosts] = useState([]);
    const [contacts, setContacts] = useState([]);
    const prevDataRef = useRef(null);
    const [uniqueArray, setUniqueArray] = useState([]);
    const [pfps, setPfps] = useState([]);
    const [backgrounds, setBackgrounds] = useState([]);
    const [reported, setReported] = useState([]);
    const [memberRequests, setMemberRequests] = useState([]);
    const [announcementModalVisible, setAnnouncementModalVisible] = useState(false);
    //const [announcements, setAnnouncements] = useState(true);
    const [otherPosts, setOtherPosts] = useState(true);
    const [announcementPosts, setAnnouncementPosts] = useState([]);
    const [requestModalVisible, setRequestModalVisible] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [url, setUrl] = useState();
    const [actualNewPost, setNewPost] = useState(null);
    const [lastVisible, setLastVisible] = useState();
    const [image, setImage] = useState(null);
    const [reportedItem, setReportedItem] = useState(null);
    const [requests, setRequests] = useState([]);
    const [notifications, setNotifications] = useState(false)
    const [admins, setAdmins] = useState([]);
    const [userRequests, setUserRequests] = useState([]);
    const [privacy, setPrivacy] = useState('');
    const [flagged, setFlagged] = useState(0);
    const [pfpComplete, setPfpComplete] = useState(false);
    const [backgroundsComplete, setBackgroundsComplete] = useState(false);
    const [video, setVideo] = useState(null);
    const timerRef = useRef(null);
    const [tapCount, setTapCount] = useState(0); 
    const [nonMessageNotifications, setNonMessageNotifications] = useState([]);
    const [status, setStatus] = useState(null);
    const [isDead, setIsDead] = useState(false);
    //console.log(name)
    //console.log(group)
    //console.log(requests.length)
    const navState = navigation.getState()?.routes
    const prevRoute = navState[navState.length -2]
    
    useEffect(() => {
        let unsub;
    const getProfileDetails = async() => {
      unsub = onSnapshot(doc(db, 'profiles', user.uid), (doc) => {
        if (doc.exists()) {
          setGroupsJoined(doc.data().groupsJoined)
        }
      })
  }
  getProfileDetails();
  return unsub;
    }, [name])
    //console.log(name)
    useEffect(() => {
       const q = query(collection(db, "groups", name, 'notifications', user.uid, 'checkNotifications'));
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
    }, [name])
    useEffect(() => {
    let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'groupRequests')), (snapshot) => {
          setUserRequests(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
        })
      } 
      fetchCards();
      return unsub;
  }, [name])
    useEffect(() => {
          let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'groups', name, 'notifications', user.uid, 'messageNotifications')), (snapshot) => {
          setMessageNotifications(snapshot.docs.map((doc)=> ( {
          id: doc.id
          })))
        })
      } 
      fetchCards();
      return unsub;
    }, [name])
    //console.log(messageNotifications)
    useEffect(() => {
      if (messageNotifications > 0 || nonMessageNotifications > 0) {
        setNotifications(true)
      }
      else {
        setNotifications(false)
      }
    }, [nonMessageNotifications, name, messageNotifications])
    
    /* useEffect(() => {
      if (posts.length > 0) {
        const uniqueValuesSet = new Set();
        const newItems = posts.filter((item) => !prevDataRef.current.includes(item));
        //)
        // Process only the new items:
        
        const uniqueArray = newItems.filter(obj => {
            const value = obj.userId;

            if (!uniqueValuesSet.has(value)) {
              uniqueValuesSet.add(value);
              return true;
            }

            return false;
          });
          //console.log(uniqueArray.length)
          setUniqueArray(uniqueArray)
        }
       
    }, [posts]) */
    /* useMemo(() => {
      //console.log(uniqueArray.length)
      if (uniqueArray.length > 0) {
         setPfps([])
        setBackgrounds([])
        uniqueArray.map(async(item, index) => {
          //console.log(item)
          const docSnap = await getDoc(doc(db, 'profiles', item.userId))
          //tempPfpArray.push({id: item.userId, pfp: docSnap.data().pfp})
          //tempBackgroundArray.push({id: item.userId, background: docSnap.data().background})
          
          setPfps(prevState => [...prevState, {id: item.userId, pfp: docSnap.data().pfp}])
          setBackgrounds(prevState => [...prevState, {id: item.userId, background: docSnap.data().background}])
        }) 
      }
      
    }, [uniqueArray]) */
    useEffect(() => {
      if (group.admins.includes(user.uid)) {
        const getData = async() => {
            const contactRef = onSnapshot(query(collection(db, 'groups', group.id, 'adminContacts')), (snapshot) => {
               snapshot.forEach((doc) => {
                  setContacts(prevState => [...prevState, {id: doc.id}])
              });
            })
            const adminRef = onSnapshot(query(doc(db, 'groups', group.id)), (snapshot) => {
              if (snapshot.data()) {
                setAdmins(snapshot.data().admins)
              }
              
            })
            const flaggedRef = onSnapshot(query(doc(db, 'groups', group.id)), (snapshot) => {
              if (snapshot.data()) {
                setFlagged(snapshot.data().flagged)
              }
              
            })
            const privacyRef = onSnapshot(query(doc(db, 'groups', group.id)), (snapshot) => {
              if (snapshot.data()) {
                setPrivacy(snapshot.data().groupSecurity)
              }
              
            })
            /* const flaggedRef
            const privacyRef */
            const requestRef = onSnapshot(query(collection(db, 'groups', group.id, 'adminRequests')), (snapshot) => {
              snapshot.forEach((doc) => {
                  setRequests(prevState => [...prevState, {id: doc.id}])
              });
            }) 
            const reportedRef = onSnapshot(query(collection(db, 'groups', group.id, 'reportedContent')), (snapshot) => {
              snapshot.forEach((doc) => {
                  setReported(prevState => [...prevState, {id: doc.id}])
              });
            })
            const memberRef = onSnapshot(query(collection(db, 'groups', group.id, 'memberRequests')), (snapshot) => {
              snapshot.forEach((doc) => {
                  setMemberRequests(prevState => [...prevState, {id: doc.id}])
              });
            })
            return memberRef, contactRef, requestRef, reportedRef, adminRef, privacyRef, flaggedRef
        }
        getData()
        setTimeout(() => {
          setLoading(false)
        }, 1000);
      }
      else {
        setTimeout(() => {
          setLoading(false)
        }, 1000);
      }
    }, [name, group, onSnapshot])
 
    
    
    useEffect(() => {
    const getProfileDetails = async() => {
    const docRef = doc(db, "profiles", user.uid);
    const docSnap = await getDoc(docRef); 

    if (docSnap.exists()) {
      //setLoading(true)
        const profileVariables = {
          pfp: await(await getDoc(doc(db, 'profiles', user.uid))).data().pfp,
          firstName: await(await getDoc(doc(db, 'profiles', user.uid))).data().firstName,
          lastName: await(await getDoc(doc(db, 'profiles', user.uid))).data().lastName,
          username: await (await getDoc(doc(db, 'profiles', user.uid))).data().userName,
          blockedUsers: await (await getDoc(doc(db, 'profiles', user.uid))).data().blockedUsers,
          notificationToken: await (await getDoc(doc(db, 'profiles', user.uid))).data().notificationToken,
          searchKeywords: await (await getDoc(doc(db, 'profiles', user.uid))).data().searchKeywords,
        };
        setPfp(profileVariables.pfp);
        setFirstName(profileVariables.firstName);
        setLastName(profileVariables.lastName);
        setUsername(profileVariables.username);
        setBlockedUsers(profileVariables.blockedUsers)
        setNotificationToken(profileVariables.notificationToken)
        setSearchKeywords(profileVariables.searchKeywords)
      }
    }
    getProfileDetails();
    }, [name])
    //console.log(profilePic)
    //)
    const uploadImage = async(image) => {

        setUploading(true);
        
        const response = await fetch(image)
        const bytes = await response.blob();
        const filename = `${user.uid}cliquePfp.jpg`
        //setPfp(filename)
        var storageRef = ref(storage, filename)
        try {
            await storageRef;
        } catch (error) {
            console.log(error)
        }
        await uploadBytesResumable(storageRef, bytes).then(() => getLink(filename))

    }
    
    //console.log(group.id)
    const getLink = (pfp) => {
        const starsRef = ref(storage, pfp);
        getDownloadURL(starsRef).then((url) => checkPfp(url, starsRef))
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
      //console.log(tempList)
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
                {text: 'OK', onPress: () => deleteObject(reference).then(() => {setUploading(false); }).catch((error) => {
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
              await updateDoc(doc(db, "groups", group.id), {
            banner: url,
              }).then(() => setUploading(false)).then(() => setBackground(url))
            }
            /* if (response.data.status == 'success') {
              //console.log('first')
            
            } */
            //console.log(response.data.status);
            })
            .catch(function (error) {
            // handle error
            if (error.response) console.log(error.response.data);
            else console.log(error.message);
            });
    }
    useEffect(()=> {
      const docRef = doc(db, "groups", name);
      //const postRef = collection(db, 'groups', name, 'posts')
      //console.log(name)
      /*  */
      let unsub;
      const docSnap = () => {
        unsub = onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
              setGroup({
            id: doc.id,
            ...doc.data()
          })
        setMembers(doc.data().members)
          }
          else {
            setIsDead(true)
          }

        
      });
      } 
      docSnap()
      return unsub;
    }, [name]);
    useEffect(() => {
      if (group.members.length > 0) {
        if (group.bannedUsers.includes(user.uid)) {
          setIsDead(true)
        }
      }
    }, [group, name])

    useEffect(() => {
      if (group != undefined) {
        if (group.banner != undefined) {
          if (group.banner.length > 0) {
            setBackground(group.banner)
          }
        }
        
      }
    }, [group, name])
    async function removeLike(item) {
    const newArray = video.likedBy.filter(e => e !== user.uid)
    await updateDoc(doc(db, 'groups', name, 'posts', item.id), {
      likedBy: arrayRemove(user.uid)
    }).then(async() => await deleteDoc(doc(db, 'groups', name, 'profiles', user.uid, 'likes', item.id))).then(() => setVideo({...video, likedBy: newArray}))
    

  }
  async function addSave(item) {
    //console.log(id)
    //console.log(item)
    const newArray = video.savedBy.push(user.uid)
    await updateDoc(doc(db, 'groups', name, 'posts', item.id), {
      savedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'groups', name, 'profiles', user.uid, 'saves', item.id), {
      post: item,
      timestamp: serverTimestamp()
    }).then(() => setVideo({...video, savedBy: newArray}))
    )
  }
  async function removeSave(item) {
    const newArray = video.savedBy.filter(e => e !== user.uid)
    await updateDoc(doc(db, 'groups', name, 'posts', item.id), {
      savedBy: arrayRemove(user.uid)
    }).then(async() => await deleteDoc(doc(db, 'groups', name, 'profiles', user.uid, 'saves', item.id))).then(() => setVideo({...video, savedBy: newArray}))
    
  }
  async function addDoubleLike(item) {
    //console.log('first')
    setTapCount(tapCount + 1);
    //console.log('first')
    if (tapCount === 0) {
      timerRef.current = setTimeout(() => {
        // If no second tap occurs within the timer, treat it as a single tap
        setTapCount(0);
      }, 200); 
    }  else if (tapCount === 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      clearTimeout(timerRef.current);
      setTapCount(0);
    const newArray = video.likedBy.push(user.uid)
    if (item.username == username) {
      await updateDoc(doc(db, 'groups', name, 'posts', item.id), {
      likedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'groups', name, 'profiles', user.uid, 'likes', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    })).then(() => setVideo({...video, likedBy: newArray}))
    }
    else {
      await updateDoc(doc(db, 'groups', name, 'posts', item.id), {
      likedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'groups', name, 'profiles', user.uid, 'likes', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'groups', name, 'notifications', item.userId, 'notifications'), {
      like: true,
      comment: false,
      friend: false,
      item: item.id,
      request: false,
      acceptRequest: false,
      theme: false,
      report: false,
      postId: item.id,
      requestUser: user.uid,
      requestNotificationToken: item.notificationToken,
      likedBy: [],
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'groups', name, 'notifications', item.userId, 'checkNotifications'), {
      userId: item.userId
    })).then(() => setVideo({...video, likedBy: newArray})).then(() => schedulePushLikeNotification(item.userId, username, item.notificationToken))
    }
    
    
    //
  }
  }
  async function addLike(item) {
    //console.log('first')
    const newArray = video.likedBy.push(user.uid)
    if (item.username == username) {
      await updateDoc(doc(db, 'groups', name, 'posts', item.id), {
      likedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'groups', name, 'profiles', user.uid, 'likes', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    })).then(() => setVideo({...video, likedBy: newArray}))
    }
    else {
      await updateDoc(doc(db, 'groups', name, 'posts', item.id), {
      likedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'groups', name, 'profiles', user.uid, 'likes', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'groups', name, 'notifications', item.userId, 'notifications'), {
      like: true,
      comment: false,
      friend: false,
      item: item.id,
      request: false,
      acceptRequest: false,
      theme: false,
      report: false,
      postId: item.id,
      requestUser: user.uid,
      requestNotificationToken: item.notificationToken,
      likedBy: [],
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'groups', name, 'notifications', item.userId, 'checkNotifications'), {
      userId: item.userId
    })).then(() => setVideo({...video, likedBy: newArray})).then(() => schedulePushLikeNotification(item.userId, username, item.notificationToken))
    }
  }
  async function schedulePushLikeNotification(id, username, notificationToken) {
    //console.log(username)
    //console.log(notificationToken)
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    if (notis) {
        if (group.allowPostNotifications.includes(user.uid)) {
          fetch(`${BACKEND_URL}/api/likeNotification`, {
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
      
  }
  function addRecommendLike (item) {
    //console.log(item)
    fetch(`${BACKEND_URL}/api/likeRecommendPost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: item.id, userId: user.uid
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
  function addRecommendSave (item) {
    fetch(`${BACKEND_URL}/api/saveRecommendPost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: item.id, userId: user.uid
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


  
  function shareAlert() {
    Alert.alert('Cannot share', 'You must join this clique in order to share it', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  }
  function settingsAlert() {
    Alert.alert('Cannot access settings', 'You must join this clique in order to access the settings', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
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
  }, [name])
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
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  function channelAlert() {
    Alert.alert('Cannot access chat', 'You must join this clique in order to access the chat', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  }
  function cliqueRecommend(item) {
    fetch(`${BACKEND_URL}/api/cliqueRecommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cliqueId: item, userId: user.uid
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
  async function updateGroup(item) {
    if (item.groupSecurity == 'private') {
      const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.groupSecurity == 'private'
      const objectIndex = completeGroups.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...completeGroups];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setCompleteGroups(updatedData);
    }
      await setDoc(doc(db, 'profiles', user.uid, 'groupRequests', item.id), {
        id: item.id,
        timestamp: serverTimestamp()
      }).then(async() => await setDoc(doc(db, 'groups', item.id, 'memberRequests', user.uid), {
      id: user.uid,
      timestamp: serverTimestamp()
    }))
    }
    else {
      /* const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.members = [...item.members, user.uid];
      const objectIndex = completeGroups.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...completeGroups];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setCompleteGroups(updatedData);
      
    } */
    setGroupsJoined(prevState => [...prevState, item.id])
      await updateDoc(doc(db, 'groups', item.id), {
      members: arrayUnion(user.uid),
      memberUsernames: arrayUnion(username),
      allowMessageNotifications: arrayUnion(user.uid),
      allowPostNotifications: arrayUnion(user.uid)
      //timestamp: serverTimestamp()
    }).then(async() => await updateDoc(doc(db, 'groups', item.id, 'channels', item.id), {
                    members: arrayUnion(user.uid),
                    member_count: increment(1),
                    lastMessageTimestamp: serverTimestamp(),
                    allowNotifications: arrayUnion(user.uid)
                })).then(async() => await setDoc(doc(db, 'profiles', user.uid, 'channels', item.id), {
                  channelsJoined: arrayUnion(item.id)
                })).then(async() => await updateDoc(doc(db, "profiles", user.uid), {
            groupsJoined: arrayUnion(item.id)
        })).then(async() => await setDoc(doc(db, 'groups', item.id, 'profiles', user.uid), {
          searchKeywords: searchKeywords
        })).then(() => cliqueRecommend(item.id)).catch((e) => console.log(e))
    }
      
  }
  return (
    <Provider> 
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
            {isDead ? 
            <>
            <View style={styles.innerContainer}>
            
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          {prevRoute?.name ? 
          <MaterialCommunityIcons name='chevron-left' color={theme.color} size={37.5} style={{alignSelf: 'center', marginTop: 18}} onPress={() => navigation.goBack()}/> : null}
          <View style={{marginTop: '12.5%', marginLeft: '5%'}}>
             <FastImage source={require('../assets/DarkMode5.png')} style={{height: 27.5, width: 68.75}}/>
          </View>
            
        </View>
                  
          </View>
          <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginBottom: '25%'}}>
              <Text style={{fontSize: 24, padding: 10, fontFamily: 'Montserrat_500Medium', color: theme.color}}>Sorry, cliq is unavailable</Text>
              <MaterialCommunityIcons name='emoticon-sad-outline' color={theme.color} size={50} style={{alignSelf: 'center', marginTop: '10%'}}/>
            </View>
              </> : 
              loading ? 
              <View style={{flex: 1,
              justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={"large"}/> 
              </View>
              :
              group ? 
      <>
      <Modal visible={videoModalVisible} animationType="slide" transparent onRequestClose={() => setVideoModalVisible(false)}>
            <View style={[styles.modalContainer, styles.overlay]}>
              <View style={styles.modalView}>
                  <View style={{alignItems: 'center', justifyContent: 'center'}}>
                    <TouchableOpacity onPress={() => {() => addDoubleLike(video)}} activeOpacity={1}>
                  <Video 
                      ref={videoRef}
                      style={{height: Dimensions.get('screen').height, width: Dimensions.get('screen').height, borderRadius: 8}}
                      source={video != null ? {
                        uri: video.post[0].post,
                      } : null}
                      useNativeControls
                      volume={1.0}
                      shouldPlay={true}
                      isLooping
                     // onPlaybackStatusUpdate={status => setStatus(() => status)}
                    />
                    </TouchableOpacity>
                </View>
                <MaterialCommunityIcons name='chevron-left' size={40} onPress={() => setVideoModalVisible(false)} style={{position: 'absolute', top: 40, zIndex: 3, left: 30}} color={theme.color} />
                <View style={[styles.postFooter, {marginTop: '5%'}]}>
                  <View style={{flexDirection: 'column'}}>
                    <View style={{alignItems: 'center'}}>
          <TouchableOpacity onPress={video != null ? video.likedBy.includes(user.uid) ? () => removeLike(video) : () => addLike(video) : null}>
            {video != null ? video.likedBy.includes(user.uid) ? <MaterialCommunityIcons name='cards-heart' size={27.5}  style={{alignSelf: 'center'}} color="red"/> : 
            <MaterialCommunityIcons name='cards-heart-outline' color={theme.color} size={27.5} style={{alignSelf: 'center'}}/>  : null}
          </TouchableOpacity>
          <View>
            <Text style={[styles.postFooterText, {color: theme.color}]}>{video != null ? video.likedBy.length : 0}</Text>
          </View>
          </View>
          {/* <TouchableOpacity style={{marginTop: '70%'}}>
            <Ionicons name='arrow-redo-outline' color={theme.color} size={28} style={{alignSelf: 'center', marginLeft: '2.5%',}}/>
          </TouchableOpacity> */}
          <TouchableOpacity style={{marginTop: '70%'}} onPress={video != null ? video.savedBy.includes(user.uid) ? () => removeSave() : () => addSave(video) : null}>
            {video != null ? video.savedBy.includes(user.uid) ? <MaterialCommunityIcons name='bookmark' color={"#005278"}  size={30} style={{alignSelf: 'center'}}/>  : 
             <MaterialCommunityIcons name='bookmark-plus-outline' color={theme.color} size={30} style={{alignSelf: 'center'}}/> : null}
          </TouchableOpacity>
          </View>
        </View>
              </View>
              
            </View>
          </Modal>
      {/* <ReportModal visible={reportModalVisible} reportedItem={reportedItem} cliqueId={group.id} message={false} comment={false} cliqueMessage={true} post={true} clique={true} theme={false} user={user} currentUser={false} closeModal={() => {setReportModalVisible(false); setSecondReport(false)}} firstReport={!secondReport ? true: false} onPress={() => setSecondReport(true)} /> */}
      <View style={styles.innerContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          {prevRoute?.name ? 
          <MaterialCommunityIcons name='chevron-left' size={37.5} color={theme.color} style={{alignSelf: 'center', marginTop: 18}} onPress={() => navigation.goBack()}/> : null}
          <View style={{marginTop: '12.5%', marginLeft: '5%'}}>
             <FastImage source={require('../assets/DarkMode5.png')} style={{height: 27.5, width: 68.75}}/>
          </View>
            
        </View>
            { group ?
              group.members.includes(user.uid) ? <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: 20, justifyContent: 'space-between', width: 70, marginRight: '5%'}}>
                   {/*  <TouchableOpacity style={{alignSelf: 'center'}} onPress={() => setSearching(true)}>
                       <Ionicons name='search' size={27.5} color="#000"/>
                    </TouchableOpacity> */}
                    {notifications ? 
              <TouchableOpacity style={!recentSearches ? {alignSelf: 'center'}: {marginTop: '2.5%'}} 
              onPress={() => navigation.navigate('GroupChannels', {id: group.id, group: group, person: user.uid, pfp: group.banner, name: group.name, sending: false, notifications: true})}>
                        <MaterialCommunityIcons name='bell-badge-outline' size={29.5} color="#33FF68"/>
                    </TouchableOpacity> : <TouchableOpacity style={!recentSearches ? {alignSelf: 'center'}: {marginTop: '2.5%'}} 
                    onPress={() => navigation.navigate('GroupChannels', {id: group.id, group: group, person: user.uid, pfp: group.banner, name: group.name, sending: false, notifications: true})}>
                        <MaterialCommunityIcons name='bell-outline' size={29.5} color={theme.color}/>
                    </TouchableOpacity>
              }
                    
                    <TouchableOpacity style={!recentSearches ? {alignSelf: 'center'}: {marginTop: '2.5%'}} onPress={() => navigation.navigate('NewPost', {group: true, groupName: group.name, actualGroup: group, groupId: group.id, postArray: [], blockedUsers: blockedUsers, admin: group.admins.includes(user.uid), username: username})}>
                      <MaterialCommunityIcons name='plus' size={29.5} color={theme.color} />
                    </TouchableOpacity>
                  </View> : null : null
            }
                  
          </View>
          {
         <ScrollView style={{flex: 1}} >
          {uploading ? <ActivityIndicator style={{margin: '5%'}} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} /> : background ? <FastImage source={background ? {uri: background} : require('../assets/defaultpfp.jpg')} style={styles.profileCircle} /> 
              : <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.profileCircle} /> }
        {group != undefined ? group.admins.includes(user.uid) ? <MaterialCommunityIcons name='image-edit' size={30} style={{position: 'absolute', top: 170, left: 360}} color="#f5f5f5" onPress={() => pickImage()}/> : <></> : <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />}
        <View style={{marginLeft: '5%', marginRight: '5%', flex: 1}}>
        <View style={{backgroundColor: theme.backgroundColor, marginLeft: '-5%', marginRight: '-5%'}}>
          <View style={styles.headerHeader}>
            {group ? <Text style={[styles.type, {color: theme.color}]}>{group.groupSecurity ? group.groupSecurity.charAt(0).toUpperCase() + group.groupSecurity.slice(1) : null} Cliq</Text> : <></>}
            <Text style={[styles.type, {color: theme.color}]}>|</Text>
            {group ? group.members.length == 1 ? <Text style={[styles.type, {color: theme.color}]}>{group.members.length} Member</Text> 
            : <Text style={[styles.type, {color: theme.color}]}>{group.members.length > 999 && group.members.length < 1000000 ? `${group.members.length / 1000}k` : group.members.length > 999999 ? `${group.members.length / 1000000}m` : group.members.length} Members</Text> : null}
          </View>

        {group ? 
        <>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 10, marginLeft: '5%', width: '90%'}}>
          {
            group.banner ?
            <FastImage source={{uri: group.banner}} style={{height: 42, width: 42, borderRadius: 8}}/> : null
          }
        <Text style={[styles.name, {color: theme.color}]}>{group.name}</Text> 
        
        </View>
        <Text style={[styles.categoryText, {color: theme.color}]}>{group.category}</Text>
        {group.description ? <Text style={[styles.description, {color: theme.color}]}>{group.description}</Text> : null}
        
        </>
        : <></>}
        {group != undefined ? !group.admins.includes(user.uid) ? 
        <View style={styles.middleContainer}>
        {group.groupSecurity == 'private' && userRequests.filter(e => e.id === group.id).length > 0 ?
             <View style={[styles.middleContainers, {padding: 2.5, paddingHorizontal: 10, alignItems: 'center', backgroundColor: theme.backgroundColor}]}>
              <RequestedIcon /> 
              </View>
               :
            !groupsJoined.includes(group.id) ? <TouchableOpacity style={[styles.middleContainers, {backgroundColor: theme.backgroundColor, borderColor: theme.color}]} onPress={() => {updateGroup(group)}}>
                  <Text style={[styles.middleText, {paddingLeft: 10, color: theme.color}]}>Join</Text>
                  <MaterialCommunityIcons name='account-plus' size={20} style={[styles.middleIcon, {paddingRight: 10, paddingLeft: 0}]} color={theme.color}/>
              </TouchableOpacity> :  
               <TouchableOpacity style={[styles.middleContainers, {backgroundColor: theme.backgroundColor, borderColor: theme.color}]} onPress={group.members.includes(user.uid) ? () => navigation.navigate('GroupSettings', {name: group.name, id: group.id, pfp: group.banner, group: group}) : () => settingsAlert()}>
            <Feather name='settings' size={25} style={styles.middleIcon} color={theme.color}/>
            <Text style={[styles.middleText, {color: theme.color}]}>Settings</Text>
          </TouchableOpacity> }
          <TouchableOpacity style={[styles.middleContainers, {backgroundColor: theme.backgroundColor, borderColor: theme.color}]} onPress={() => navigation.navigate('Chat', {sending: true, message: true, payloadGroup: {name: group.name, pfp: group.banner, id: group.id, group: group.id}})}>
            <MaterialCommunityIcons name='share-outline' size={25} style={styles.middleIcon} color={theme.color}/>
            <Text style={[styles.middleText, {color: theme.color}]}>Share</Text>
          </TouchableOpacity>
          </View>
           : group.admins.includes(user.uid) ?
          <View style={styles.middleContainer}>
          <TouchableOpacity style={[styles.middleContainers, {backgroundColor: theme.backgroundColor, borderColor: theme.color}]} onPress={group.members.includes(user.uid) ? () => navigation.navigate('GroupSettings', {name: group.name, id: group.id, pfp: group.banner, group: group}) : () => settingsAlert()}>
            <MaterialCommunityIcons name='shield-crown-outline' size={25} style={styles.middleIcon} color={theme.color}/>
            <Text style={[styles.middleText, {color: theme.color}]}>Manage</Text>
            {requests.length > 0 || contacts.length > 0 || reported.length > 0 || memberRequests.length > 0 ? <View style={[styles.greenDot, { left: 3, top:-4, position: 'relative', zIndex: 3}] }/> : null}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.middleContainers, {backgroundColor: theme.backgroundColor, borderColor: theme.color}]} onPress={() => navigation.navigate('Chat', {sending: true, message: true, payloadGroup: {name: group.name, pfp: group.banner, id: group.id, group: group.id}})}>
            <MaterialCommunityIcons name='share-outline' size={25} style={styles.middleIcon} color={theme.color}/>
            <Text style={[styles.middleText, {color: theme.color}]}>Share</Text>
          </TouchableOpacity>
          </View> : <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} /> : <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/>}
        
          <View style={{margin: '5%', flexDirection: 'column'}} >
            <TouchableOpacity style={styles.buttonHeaders} onPress={group ? () => navigation.navigate('GroupPosts', {group: group, admin: group.admins.includes(user.uid) ? true : false, username: username, blockedUsers: blockedUsers}): null}>
              <Text style={[styles.buttonText]}>{group.name} Posts</Text>
              <MaterialCommunityIcons name='chevron-right' size={25} color={"#fafafa"} style={{marginLeft: 'auto'}}/>
            </TouchableOpacity >
            
            <TouchableOpacity style={styles.buttonHeaders} onPress={() => navigation.navigate('GroupMembers', {groupId: group.id, members: group.members.slice(0, 100), name: group.name, admins: group.admins})}>
              <Text style={[styles.buttonText]}>{group.name} Members</Text>
              <MaterialCommunityIcons name='chevron-right' size={25} color={"#fafafa"} style={{marginLeft: 'auto'}}/>
            </TouchableOpacity>
            {messageNotifications.length > 0 ? <View style={[styles.greenDot, {position: 'relative', top: 7.5, zIndex: 3, left: '95%', height: 13, width: 13, borderRadius: 10}] }/> : null}
            <TouchableOpacity style={messageNotifications.length > 0 ? [styles.buttonHeaders, {marginTop: -2}] : styles.buttonHeaders} onPress={group.members.includes(user.uid) ? () => navigation.navigate('GroupChannels', {id: group.id, pfp: group.banner, group: group, name: group.name, notifications: false}) : () => channelAlert()}>
              <Text style={[styles.buttonText]}>{group.name} Chats</Text>
              <MaterialCommunityIcons name='chevron-right' size={25} color={"#fafafa"} style={{marginLeft: 'auto'}}/>
            </TouchableOpacity>
          </View>
          </View>
          
          
        </View>
        </ScrollView> }

      </>
      : null}
    </View>
    </Provider>
  )
}

export default GroupHome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  headerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  type: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
  },
  header: {
    fontSize: 19.20,
    padding: 10,
    fontFamily: 'Montserrat_700Bold',
    paddingBottom: 0,
    width: '90%'
  },
  name: {
    fontSize: 24,
    fontFamily: 'Montserrat_500Medium',
    fontWeight: '600',
    textAlign: 'center',
    padding: 10,
  },
  buttonHeaders: {
    //marginLeft: 20,
    //marginRight: 3,
    //marginLeft: 6,
    backgroundColor: "#005278",
    //height: 30,
    alignItems: 'center', 
    flexDirection: 'row',
    borderRadius: 8,
    padding: 5,
    margin: 10
  },
  buttonText: {
    fontSize: 15.36,
    padding: 10,
    color: "#fafafa",
    fontFamily: 'Montserrat_500Medium',
  },
  create: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    paddingBottom: 10,
    borderBottomColor: '#cdcdcd',
  },
  input: {
    marginLeft: '5%',
    height: 100,
    borderWidth: 0.5,
    borderRadius: 5,
    margin: 5,
    marginTop: 10
  },
  fullInput: {
    marginLeft: '5%', alignSelf: 'center'
  },
  noPostingsContainer: {
    //justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    marginTop: '2%',
    marginBottom: '25%'
    //flex: 1
  },
  noPostingsText: {
    fontSize: 24,
    fontFamily: 'Montserrat_500Medium',
    padding: 10
  },
  postLength: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    paddingBottom: 10
  },
  postName: {
    //alignSelf: 'center',
    paddingLeft: 20,
    fontSize: 15.36,
    fontFamily: 'Montserrat_700Bold',
  },
  timestamp: {
    //alignSelf: 'center',
    paddingLeft: 20,
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    color: '#676767',
    paddingTop: 2.5
  },
  caption: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    //paddingLeft: 5,
    padding: 10
  },
  middleContainers: {
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  middleText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
        padding: 10,
        paddingLeft: 5,
        color: "#000",
  },
  middleContainer: {
    flexDirection: 'row',
    width: '90%',
    marginHorizontal: '5%',
    justifyContent: 'space-evenly'
  },
  middleIcon: {
    alignSelf: 'center',
    padding: 5
  },
  image: {
    height: 300,
    width: '110%',
    marginLeft: '-5%'
  },
  greenDot: {
    height: 10,
    width: 10,
    backgroundColor: "#33FF68",
    borderRadius: 5,
    position: 'absolute',
  },
    postingContainer: {
      width: '100%',
      //marginLeft: '-5%',
      height: 425,
      flex: 1,
      justifyContent: 'center',
      backgroundColor: "#005278"
    },
    captionPostingContainer: {
      width: '100%',
      height: 275,
      //flex: 1,
      //marginLeft: '-5%',
      //height: 275,
      //alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      backgroundColor: "#005278"
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: '2.5%',
      //justifyContent: 'space-between'
    },
    addContainer: {alignItems: 'center', margin: '5%', justifyContent: 'center'},
    addText: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      color: "#090909",
      padding: 7.5,
      paddingLeft: 15
    },
    paginationContainer: {
    marginTop: -33
    //margin: 10
  },
    menuContainer: {
    //alignSelf: 'center',
    marginLeft: 'auto',
    marginRight: '2%'
    //margin: '2.5%'
    //alignItems: 'flex-end'
  },
    firstName: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_700Bold',
      color: "#090909",
      padding: 7.5,
      paddingBottom: 15
    },
    addPostContainer: {
      backgroundColor: "#000",
      alignItems: 'center',
      marginTop: '5%',
      borderRadius: 8
    },
    addPostText: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
       padding: 10,
       marginTop: '2.5%',
       alignSelf: 'center'
    },
    innerContainer: {
    marginTop: '5%',
      marginBottom: '3%',
      marginLeft: '2.5%',
      //marginRight: '5%',
      justifyContent: 'space-between',
      flexDirection: 'row',
  },
  profileCircle: {height: 200, width: '100%', backgroundColor: "#005278", resizeMode: 'contain'},
  modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
  modalView: {
    width: '100%',
    height: '100%',
    //margin: 20,
    //backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    //paddingRight: 0,
    paddingTop: 5,
    paddingBottom: 25,
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
  postFooter: {
    position: 'absolute',
    left: '102.5%',
    top: '75%'
    //flexDirection: 'column'
  },
  postFooterText: {
      fontSize: 12.29,
      fontFamily: 'Montserrat_500Medium',
      color: "grey",
      padding: 5,
      alignSelf: 'center'
    },
    description: {
      fontFamily: 'Montserrat_500Medium',
      fontSize: 15.36,
      padding: 10,
      paddingTop: 0,
      marginBottom: '5%',
      textAlign: 'center',
      width: '90%',
      marginLeft: '5%'
    },
    categoryText: {
      fontFamily: 'Montserrat_500Medium',
      fontSize: 12.29,
      marginBottom: '5%',
      textAlign: 'center',
      width: '90%',
      marginLeft: '5%'
    },
    joinText: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      padding: 7.5
    },
})