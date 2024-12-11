import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Keyboard, Alert, FlatList, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Share} from 'react-native'
import React, {useState, useEffect, useMemo, useCallback, useContext} from 'react'
import {MaterialCommunityIcons, Entypo, MaterialIcons} from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard'
import useAuth from '../Hooks/useAuth';
import { onSnapshot, query, collection, orderBy, addDoc, doc, getDocs, limit,
  serverTimestamp, getDoc, increment, getFirestore, updateDoc, where, deleteDoc, startAt, endAt, setDoc, startAfter, arrayRemove, arrayUnion } from 'firebase/firestore';
import SearchInput from '../Components/SearchInput';
import SearchDropDown from '../Components/DropdownSearch';
import * as FileSystem from 'expo-file-system';
import NextButton from '../Components/NextButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Provider, Menu } from 'react-native-paper';
import RecentSearches from '../Components/RecentSearches';
import {Divider} from 'react-native-paper'
import * as Notifications from 'expo-notifications';
import { useRoute } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { Swipeable } from 'react-native-gesture-handler';
import SearchBar from '../Components/SearchBar';
import FastImage from 'react-native-fast-image';
import {BACKEND_URL} from "@env"
import FollowIcon from '../Components/FollowIcon';
import FollowingIcon from '../Components/FollowingIcon';
import RequestedIcon from '../Components/RequestedIcon';
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import generateId from '../lib/generateId';
import themeContext from '../lib/themeContext';
import _ from 'lodash';
import { db } from '../firebase'
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
const ChatScreen = ({route}) => {
   let row = [];
    let prevOpenedRow;
     const routeName = useRoute();
    const navigation = useNavigation();
    const {sending, payload, payloadUsername, payloadGroup, video, theme, payloadUser, message, notification} = route.params; 
    const [searches, setSearches] = useState([]);
    const [completeNotificationsDone, setCompleteNotificationsDone] = useState(false);
    const [friends, setFriends] = useState([]);
    const modeTheme = useContext(themeContext)
    const [specificSearch, setSpecificSearch] = useState('');
    const [username, setUsername] = useState('');
    const [filtered, setFiltered] = useState([]);
    const [routeSending, setRouteSending] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [completeMessages, setCompleteMessages] = useState([]);
    const [notificationDone, setNotificationDone] = useState(false);
    const [messages, setMessages] = useState(true);
    const [messageArray, setMessageArray] = useState([]);
    const [messageNotifications, setMessageNotifications] = useState([]);
    const [nonMessageNotifications, setNonMessageNotifications] = useState([]);
    const [completeFriends, setCompleteFriends] = useState([]);
    const [ogActiveFriends, setOgActiveFriends] = useState([]);
    const [activeFriends, setActiveFriends] = useState([]);
    const [activeFriendsInfo, setActiveFriendsInfo] = useState([]);
    const [filteredGroup, setFilteredGroup] = useState([]);
    const [friendsInfo, setFriendsInfo] = useState([]);
    const [sendingFriend, setSendingFriend] = useState(null);
    const [chats, setChats] = useState([]);
    const [referralCode, setReferralCode] = useState(0);
    const [caption, setCaption] = useState("");
    const [secondReport, setSecondReport] = useState(false);
    const [person, setPerson] = useState();
    const [isVisible, setIsVisible] = useState(false);
    const [actuallySending, setActuallySending] = useState(false);
    //const [searchKeywords, setSearchKeywords] = useState([]);
    const [smallKeywords, setSmallKeywords] = useState([]);
    const [largeKeywords, setLargeKeywords] = useState([]);
    const [lastMessages, setLastMessages] = useState([]);
    const [newLastMessages, setNewLastMessages] = useState([]);
    const [searching, setSearching] = useState(false)
    const [filteredEvent, setFilteredEvent] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [moreResults, setMoreResults] = useState(false);
  const [moreResultButton, setMoreResultButton] = useState(false);
    const [visible, setVisible] = useState(false);
    const [recentSearches, setRecentSearches] = useState(false);
    const [notifications, setNotifications] = useState([])
    const [notificationVisible, setNotificationVisible] = useState();
    const [completeNotifications, setCompleteNotifications] = useState([]);
    const [lastVisible, setLastVisible] = useState();
    const [checkNotifications, setCheckNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [usersThatBlocked, setUsersThatBlocked] = useState([]);
    const openMenu = () => setVisible(true)
    const closeMenu = () => setVisible(false)
    const [requests, setRequests] = useState([]);
    const [ableToShare, setAbleToShare] = useState(true);
    const {user} = useAuth()
    //console.log(theme)
    //console.log(messages)
    //console.log(sending)
    useEffect(() => {
      if (route.params?.sending) {
        setRouteSending(true)
      }
    }, [route.params?.sending])
    //console.log(sending)
    useFocusEffect(
      useCallback(() => {
        //setFocused(true)
      // This block of code will run when the screen is focused
      

      // Clean-up function when the component unmounts or the screen loses focus
      return () => {
        setRouteSending(false)
      };
    }, [])
  )
    //console.log(filteredGroup)
    
    useMemo(() => {


      //console.log('first')
          let unsub;
      const fetchCards = () => {
        unsub = onSnapshot(query(collection(db, 'friends'), where('toUser', '==', user.uid)), (snapshot) => {
          setMessageNotifications(snapshot.docs.map((doc)=> ( {
          id: doc.data().messageId
          })))
        })
      } 
      fetchCards();
      return unsub;
    }, [ onSnapshot])
    //console.log(messages)
    //console.log(messageArray)
    //console.log(messageNotifications)
    useEffect(() => {
      if (route.params?.payload && !video) {
        const getData = async() => {
          const docSnap = await getDoc(doc(db, 'posts', payload.id))
          if (!docSnap.exists()) {
            setAbleToShare(false)
          }
        }
        getData();
      }
      if (route.params?.payload && video) {
        const getData = async() => {
          const docSnap = await getDoc(doc(db, 'videos', payload.id))
          if (!docSnap.exists()) {
            setAbleToShare(false)
          }
        }
        getData();
      }
      if (route.params?.payloadGroup) {
        setRouteSending(true)
        const getData = async() => {
          const docSnap = await getDoc(doc(db, 'groups', payloadGroup.id))
          if (!docSnap.exists()) {
            setAbleToShare(false)
          }
        }
        getData();
      }
      if (route.params?.theme) {
        setRouteSending(true)
      }
    }, [route.params])
    useEffect(()=> {
      const getRequest = async() => {
        const docSnap = await getDoc(doc(db, 'profiles', user.uid))
         setUsername(docSnap.data().userName)
         setFirstName(docSnap.data().firstName)
         setReferralCode(docSnap.data().refferalCode)
         setSmallKeywords(docSnap.data().smallKeywords)
         setLargeKeywords(docSnap.data().largeKeywords)
         setLastName(docSnap.data().lastName)
         setUsersThatBlocked(docSnap.data().usersThatBlocked)
          setBlockedUsers(docSnap.data().blockedUsers)
        /* docSnap.forEach((doc)=> {
         
        }) */
      } 
      getRequest()
    }, []);
    useEffect(() => {
    let timeoutId;
    if (isVisible) {
      // Automatically close the modal after 3 seconds
      timeoutId = setTimeout(() => {
        setIsVisible(false)
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [isVisible]);
    async function schedulePushAcceptNotification(id, username, notificationToken) {
    //console.log(username)
    //console.log(notificationToken)
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    let banned = (await getDoc(doc(db, 'profiles', id))).data().banned
      if (notis && !banned) {
      fetch(`${BACKEND_URL}/api/acceptNotification`, {
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
    async function schedulePushCliqueNotification(item, friendId, firstName, lastName, notificationToken) {
      //console.log(firstName, lastName, notificationToken)
      let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
      const deepLink = `nucliqv1://PersonalChat?person=${item}&friendId=${friendId}`;
      let banned = (await getDoc(doc(db, 'profiles', id))).data().banned
      if (notis && !banned) {
        fetch(`${BACKEND_URL}/api/sentCliqueNotification`, {
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
    async function schedulePushUserNotification(id, firstName, lastName, notificationToken) {
      //console.log(firstName, lastName, notificationToken)
      let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
      let banned = (await getDoc(doc(db, 'profiles', id))).data().banned
      if (notis && !banned) {
        fetch(`${BACKEND_URL}/api/sentUserNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: firstName, lastName: lastName, pushToken: notificationToken
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
    })}
    }
    async function schedulePushThemeNotification(item, friendId, firstName, lastName, notificationToken) {
      //console.log(firstName, lastName, notificationToken)
      let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
      const deepLink = `nucliqv1://PersonalChat?person=${item}&friendId=${friendId}`;
     let banned = (await getDoc(doc(db, 'profiles', id))).data().banned
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
  useMemo(()=> {
      let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'friends'), where('actualFriend', '==', true)), (snapshot) => {
          setOgActiveFriends(snapshot.docs.filter(doc => !blockedUsers.includes(doc.id) && !usersThatBlocked.includes(doc.id)).map((doc)=> ( {
            id: doc.id,
            //...doc.data()
          })))
           setLastVisible(snapshot.docs[snapshot.docs.length - 1])
        })
       
      } 
      fetchCards();
      return unsub;
    }, []);
    useEffect(() => {
  if (isVisible) {
    const timeoutId = setTimeout(() => setIsVisible(false), 2000); // Adjust timeout as needed
    return () => clearTimeout(timeoutId);
  }
}, [isVisible]);
  //console.log(blockedUsers)
  //console.log(usersThatBlocked)
    useMemo(()=> {
      setFriends([])
      let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'friends'), where('actualFriend', '==', true), orderBy('lastMessageTimestamp', 'desc'), limit(20)), (snapshot) => {
          setFriends(snapshot.docs.filter(doc => !blockedUsers.includes(doc.id) && !usersThatBlocked.includes(doc.id)).map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
           setLastVisible(snapshot.docs[snapshot.docs.length - 1])
        })
       
      } 
      fetchCards();
      return unsub;
    }, [usersThatBlocked, blockedUsers]);
    
    useMemo(() => {
      if (friends.length > 0) {
        Promise.all(friends.map(async(item) => await getDoc(doc(db, 'profiles', item.id))))
      .then(snapshots => {
        setFriendsInfo(snapshots.map(snapshot => ({id: snapshot.id, ...snapshot.data(), checked: false})))
        //console.log(snapshots.map(snapshot => snapshot.data()))
        //const documents = snapshots.map(snapshot => snapshot.data());
        // Process the fetched documents here
      })
      .catch(error => {
        // Handle errors
      });
      }
    }, [friends])
    //console.log(friendsInfo.length)
    useMemo(() => {
      if (ogActiveFriends.length > 0) {
        Promise.all(ogActiveFriends.map(async(item) => await getDoc(doc(db, 'profiles', item.id))))
      .then(snapshots => {

        setActiveFriendsInfo(snapshots.map(snapshot => ({id: snapshot.id, ...snapshot.data(), checked: false})))
        //console.log(snapshots.map(snapshot => snapshot.data()))
        //const documents = snapshots.map(snapshot => snapshot.data());
        // Process the fetched documents here
      })
      .catch(error => {
        // Handle errors
      });
      }
    }, [ogActiveFriends])
    //console.log(friendsInfo)
    useMemo(() => {
      
      Promise.all(friends.map(async(item) => await getDoc(doc(db, 'friends', item.friendId))))
      .then(snapshots => {
        setCompleteFriends(snapshots.map(snapshot => ({id: snapshot.id, ...snapshot.data()})))
        //console.log(snapshots.map(snapshot => snapshot.data()))
        //const documents = snapshots.map(snapshot => snapshot.data());
        // Process the fetched documents here
      })
      .catch(error => {
        // Handle errors
      });
    }, [friends])
    //console.log(friends.length)
    useMemo(() => {
       const newArray = activeFriendsInfo.map((item) => {
          if (item.active == true) {
            return item;
            //setActiveFriends([...activeFriends, item])
          }
          else {
            return null;
          }
          //console.log(item.id)
        })
        //console.log(newArray.filter((e) => e !== undefined).map(item => item.id))
        const filtered = newArray.filter((item) => item !== null);
        //console.log(filtered.length)
        setActiveFriends(filtered);
    }, [activeFriendsInfo])
    //console.log(activeFriends.length)

    

    function fetchMoreData() {
      if (lastVisible != undefined) {
    let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'friends'), where('actualFriend', '==', true), orderBy('lastMessageTimestamp', 'desc'), startAfter(lastVisible), limit(20)), (snapshot) => {
          const newData = [];
          setFriends(snapshot.docs.filter(doc => !blockedUsers.includes(doc.id) || !usersThatBlocked.includes(doc.id)).map((doc)=> {
            newData.push({
              id: doc.id,
            ...doc.data(),
            })
            
          }))
          setFriends([...friends, ...newData])
          setLastVisible(snapshot.docs[snapshot.docs.length-1])
          
        })
      } 
      fetchCards();
      return unsub;
    }
      }

    
    
   
    useMemo(()=> {
      if (completeFriends.length > 0){
        Promise.all(completeFriends.map(async(item) => await getDoc(doc(db, 'friends', item.id))))
      .then(snapshots => {
        setLastMessages(snapshots.map(snapshot => ({id: snapshot.id, ...snapshot.data()})))
        //console.log(snapshots.map(snapshot => snapshot.data()))
        //const documents = snapshots.map(snapshot => snapshot.data());
        // Process the fetched documents here
      })
      .catch(error => {
        // Handle errors
      });
        //console.log('first')
      /* completeFriends.map((item) => {
        //console.log(item.id)
      let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(doc(db, 'friends', item.id)), (snapshot) => {
          //console.log(snapshot.data())
          setLastMessages(prevState => [...prevState, {id: snapshot.id, ...snapshot.data()}])
        })
      } 
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 2000);
      return unsub;
      
    }) */
  }

    }, [completeFriends]);
    //console.log(completeFriends[1])
    //console.log(lastMessages.length)
    //console.log(notifications)
    useEffect(() => {
      //setFriendsInfo(newArray2)
      //const objectToReplace = lastMessages.find(obj1 => obj1.id === 1);

      
      // Find the corresponding object in array2 and replace its value
      const updatedArray2 = friendsInfo.map(obj2 => {
        if (lastMessages.find(obj1 => obj1.id.includes(obj2.id))) {
          return { ...obj2, messageActive:lastMessages.find(obj1 => obj1.id.includes(obj2.id)).active, messageId: lastMessages.find(obj1 => obj1.id.includes(obj2.id)).messageId, lastMessage: lastMessages.find(obj1 => obj1.id.includes(obj2.id)).lastMessage,
          lastMessageTimestamp: lastMessages.find(obj1 => obj1.id.includes(obj2.id)).lastMessageTimestamp};
        }
        return obj2;
      });
      // Update the state variable array2 with the modified array
      //console.log(updatedArray2)
      new Promise(resolve => {
        setCompleteMessages(updatedArray2
        .filter((e) => e.lastMessageTimestamp != undefined)
        .slice()
              .sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp));
          resolve(); // Resolve the Promise after setCompleteMessages is done
      }).finally(() => setLoading(false)); 
      //setCompleteMessages(updatedArray2.filter((e) => e.lastMessageTimestamp != undefined).slice().sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp));
      //const result = lastMessages.filter((item) => item.id.includes(friendsInfo.map((element) => element.id)))
      //console.log(result)
    }, [lastMessages])
    //console.log(lastMessages)
    //console.log(friendsInfo[0])
    const renderChecked = (id) => {
      if (id.messageActive) {
         if (filteredGroup.length > 0) {
        //console.log(filteredGroup)
        let list = filteredGroup
      list[0].checked = !list[0].checked
      const result = friends.filter((element) => 
      {if (element.friendId != undefined) {
        return element.friendId.includes(list[0].id)
      }
      })
      //console.log(result[0].friendId)
      if (list[0].checked) {
        setActuallySending(true)
        setSendingFriend(result[0].friendId)
        setPerson(list[0])
      }
      else {
        setActuallySending(false)
        setSendingFriend(null)
      }
      var newList = list.slice()
      setCompleteMessages(newList)
      }
      else {
        let list = completeMessages
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
        setActuallySending(false)
        setSendingFriend(null)
      }
      var newList = list.slice()
      setCompleteMessages(newList)
      }
      }
      else {
         Alert.alert('You must both be following each other first (mutual friends) in order to message!')
      }
      
    }
    async function deleteMessageNotifications (item) {
      
      //console.log(item)
    }
    //console.log(sendingFriend)
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
        return `${new Date(timestamp.seconds*1000).toLocaleDateString()}`
      }
      else if (date.getTime() <= threeWeeks.getTime()) {
        return `3 weeks ago`
      }
      else if (date.getTime() <= twoWeeks.getTime()) {
        return `2 weeks ago`
      }
      else if (date.getTime() <= lastWeek.getTime()) {
        return `1 week ago`
      }
      else if (date.getTime() <= sixdays.getTime()) {
        return `6 days ago`
      }
      else if (date.getTime() <= fivedays.getTime()) {
        return `5 days ago`
      }
      else if (date.getTime() <= fourdays.getTime()) {
        return `4 days ago`
      }
      else if (date.getTime() <= threedays.getTime()) {
        return `3 days ago`
      }
      else if (date.getTime() <= twodays.getTime()) {
        return `2 days ago`
      }
      else if (date.getTime() <= yesterday.getTime()) {
        return `Yesterday`
      } 
      }
      
    }

    //console.log(messageNotifications)
    
  //console.log(messageArray)
    const renderChats = ({item, index}, onClick) => {
      //console.log(item)
      //console.log(item.messageId)

      //console.log(messageNotifications.filter((element) => element.id == item.messageId))
      const closeRow = (index) => {
      //console.log('closerow');
      
      if (prevOpenedRow && prevOpenedRow !== row[index]) {
        prevOpenedRow.close();
      }
      prevOpenedRow = row[index];
    };

    const renderRightActions = (progress, dragX, onClick) => {
      return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
          style={{
            margin: 0,
            alignContent: 'center',
            justifyContent: 'center',
            width: 70,
          }} onPress={() => deleteMessage(item)}>
          <MaterialIcons name='delete-outline' size={35} style={{alignSelf: 'center'}} color="red"/>
        </TouchableOpacity>
        </View>
        
      );
    }; 
        return (
          !routeSending ? 
          <View>
            <TouchableOpacity style={[styles.messageContainer, {backgroundColor: modeTheme.backgroundColor}]} activeOpacity={1} onPress={() => {deleteMessageNotifications(item); navigation.navigate('PersonalChat', {person: item, friendId: completeFriends.filter((element) => element.id.includes(item.id))[0].id})}}>
              {item.pfp ? <FastImage source={{uri: item.pfp}} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/> :
              <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
              }
                
                 <View style={{paddingLeft: 7.5, width: '75%'}}>
                    <Text numberOfLines={1} style={[styles.name, {color: modeTheme.color}]}>{item.firstName} {item.lastName}</Text>
                    {filteredGroup.length > 0 ? <Text numberOfLines={1} style={[styles.message, {color: modeTheme.color}]}>{item.userName}</Text> : 
                    <Text numberOfLines={1} style={[styles.message, {color: modeTheme.color}]}>{item.lastMessage == undefined ? 'Start the Conversation!' : item.lastMessage.userSent != undefined ?
                    `Sent a profile`: item.lastMessage.post != undefined ? item.lastMessage.post.group != undefined ? 'Sent a Cliq' : `Sent a post by ${item.lastMessage.userName}` 
                    :  item.lastMessage.theme != undefined ? `Sent a theme` :
                     item.lastMessage.image != undefined ? 'Sent a photo' : 
                    item.lastMessage.image && item.lastMessage.text.length > 0 ? item.lastMessage.text : item.lastMessage.text}</Text>}
                    {/* <Text style={styles.message}>{}</Text> */}
                </View>
                <View style={{flexDirection: 'column', marginLeft: 'auto'}}>
                  <Text style={{fontSize: 12.29, paddingBottom: 5, color: modeTheme.color, fontFamily: 'Montserrat_500Medium'}}>{getDateAndTime(item.lastMessageTimestamp)}</Text>
                {
                  messageNotifications.length > 0 ?
                  messageNotifications.filter((element) => element.id == item.messageId).length > 0 ? 
                  <View>
                  <MaterialCommunityIcons name='message-badge-outline' style={{textAlign: 'right', paddingRight: 5}} size={25} color={"#33FF68"}/>
                </View> : 
                 <View>
                  <MaterialCommunityIcons name='message-outline' style={{textAlign: 'right', paddingRight: 5}}  size={25} color={modeTheme.color}/>
                </View> :
                <View>
                  <MaterialCommunityIcons name='message-outline' style={{textAlign: 'right', paddingRight: 5}} size={25} color={modeTheme.color}/>
                </View> 
                }
                </View>
                
                
            </TouchableOpacity>
          </View>
          : 
           <TouchableOpacity style={[styles.messageContainer, {backgroundColor: modeTheme.backgroundColor}]} onPress={() => renderChecked(item)}>
                {item.pfp ? <FastImage source={{uri: item.pfp}} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/> :
              <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
              }
                 <View style={{paddingLeft: 7.5, width: '75%'}}>
                    <Text numberOfLines={1} style={[styles.name, {color: modeTheme.color}]}>{item.firstName} {item.lastName}</Text>
                    <Text numberOfLines={1} style={[styles.message, {color: modeTheme.color}]}>{item.userName}</Text>
                </View>
                {item.checked ? <View style={{marginRight: '10%'}}>
                  <MaterialCommunityIcons name='message-arrow-right-outline' style={{alignSelf: 'center'}} size={25} color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
                </View> : <View style={{marginRight: '10%'}}>
                  <MaterialCommunityIcons name='message-outline' style={{alignSelf: 'center'}} size={25} color={modeTheme.color}/>
                </View>}
           </TouchableOpacity>
        )
        
    }
    function getCalculatedTime(time) {

      if (time && time.seconds) {
        // Create a new JavaScript Date object using the seconds from the timestamp
        const date = new Date(time.seconds * 1000 + time.nanoseconds / 1000000);
        
        // Return the formatted time
        return date.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' });
      } else {
        // Handle cases where time is undefined or doesn't have the expected structure
        return 'Invalid time';
      }
        
        
    }
    function recommendShareGroup() {
      fetch(`${BACKEND_URL}/api/shareRecommendGroup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: payloadGroup.id, userId: user.uid
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
    function recommendSharePost() {
      fetch(`${BACKEND_URL}/api/shareRecommendPost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: payload.id, userId: user.uid
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
    const handleSearchCallback = (dataToSend) => {
      //console.log(dataToSend)
      setSearching(dataToSend)
    }
    const url = 'https://apps.apple.com/us/app/nucliq/id6451544113'
    const shareApp = async() => {
      try {
       //await Clipboard.setStringAsync(referralCode); 
       //
        const result = await Share.share({
          message: (`Join me on NuCliq! Use my referral code when you sign up:\n${referralCode}\n${url}`)
        });
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            console.log('shared with activity type of: ', result.activityType)
          }
          else {
            console.log('shared')
          }
        } else if (result.action === Share.dismissedAction) {
          console.log('dismissed')
        }
      }
      catch (error) {
        console.log(error)
      }
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
    useEffect(() => {
        if (specificSearch.length > 0) {
      setSearching(true)
      setMoreResultButton(false)
      setMoreResults(false)
      //const temp = specificSearch.toLowerCase()
      const tempList = Array.from(new Set(searches.map(JSON.stringify))).map(JSON.parse).filter(item => {
          return item
      })
      if (tempList.length > 3) {
        setMoreResultButton(true)
      }
      setFiltered(tempList)
    }
    else {
      setFiltered([])
    }
    }, [searches])
    useMemo(() => {
    if (specificSearch.length > 0) {
      setSearches([])
      const getData = async() => {
        if (specificSearch.length < 4) {
        const firstQ = query(collection(db, "profiles", user.uid, 'friends'), where('smallKeywords', 'array-contains', specificSearch.toLowerCase()), limit(10));
        const firstQuerySnapshot = await getDocs(firstQ)
        firstQuerySnapshot.forEach(async(document) => {
          const docSnap = await getDoc(doc(db, 'profiles', document.id))
          if (docSnap.exists()) {
          setSearches(prevState => [...prevState, {id: docSnap.id, ...docSnap.data()}])
          }
        })
      }
      else {
        const firstQ = query(collection(db, "profiles", user.uid, 'friends'), where('largeKeywords', 'array-contains', specificSearch.toLowerCase()), limit(10));
        const firstQuerySnapshot = await getDocs(firstQ)
        firstQuerySnapshot.forEach(async(document) => {
          const docSnap = await getDoc(doc(db, 'profiles', document.id))
          if (docSnap.exists()) {
          setSearches(prevState => [...prevState, {id: docSnap.id, ...docSnap.data()}])
          }
        })
      }
      }
      
      getData();
    } 
  }, [specificSearch])
    useEffect(() => {
      if (route.params?.notification == true) {
        deleteCheckedNotifications()
      }
    }, [route.params?.notification])
    async function deleteCheckedNotifications() {
      //console.log('first')
      const querySnapshot = await getDocs(collection(db, "profiles", user.uid, 'checkNotifications'));
      querySnapshot.forEach(async(docu) => {
        await deleteDoc(doc(db, 'profiles', user.uid, 'checkNotifications', docu.id))
      });
    }
    //console.log(payloadGroup)
    function addPostToChatter() {
      if (ableToShare) {
        Promise.all(completeMessages.map(async(item) => {
          //console.log(item)
        if (item.checked == true && payload && video) {
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
    )).then(() => setActuallySending(false)).then(() => setRouteSending(false)).then(() => schedulePushPostNotification(person, friendId[0].id, firstName, lastName, payload.username, person.notificationToken)).then(() => recommendSharePost())
        } 
        else if (item.checked == true && payload && !video) {
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
    )).then(() => setActuallySending(false)).then(() => setRouteSending(false)).then(() => schedulePushPostNotification(person, friendId[0].id, firstName, lastName, payload.username, person.notificationToken)).then(() => recommendSharePost())
        } 
        else if (item.checked == true && payloadGroup) {
          const friendId = completeFriends.filter((element) => element.id.includes(item.id))
          const docRef = await addDoc(collection(db, 'friends', friendId[0].id, 'chats'), {
        message: {post: payloadGroup, text: caption},
        liked: false,
        toUser: person.id,
        user: user.uid,
        firstName: person.firstName,
        lastName: person.lastName,
        pfp: person.pfp,
        indirectReply: false,
        indirectReplyTo: false,
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
      lastMessage: {post: payloadGroup, text: caption},
      messageId: docRef.id,
      readBy: [],
      active: true,
      lastMessageTimestamp: serverTimestamp()
    }
    )).then(() => setActuallySending(false)).then(() => setRouteSending(false)).then(() => schedulePushCliqueNotification(person, friendId[0].id, firstName, lastName, person.notificationToken)).then(() => recommendShareGroup())
        }
      else if (item.checked == true && theme) {
        const friendId = completeFriends.filter((element) => element.id.includes(item.id))
          const docRef = await addDoc(collection(db, 'friends', friendId[0].id, 'chats'), {
       message: {theme: theme, text: caption},
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
    )).then(() => setActuallySending(false)).then(() => setRouteSending(false)).then(() => schedulePushThemeNotification(person, friendId[0].id,firstName, lastName, person.notificationToken))
      }
      }))
      
      }
      else {
        Alert.alert('Post unavailable to share')
      }
      
      
    }
    async function removeFriend(ele, friendId) {
      const updatedObject = { ...ele };

    // Update the array in the copied object
    updatedObject.loading = true
      const objectIndex = completeNotifications.findIndex(obj => obj.id === ele.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...completeNotifications];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setCompleteNotifications(updatedData);
    }
    let newFriend = generateId(friendId, user.uid)
    let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/removeFriend'
    Alert.alert('Are you sure you want to unfollow?', 'If you unfollow, you will be unable to message them and they will be unable to message you.', [
                {
                  text: 'Cancel',
                  onPress: () => {const updatedObject = { ...ele };

    // Update the array in the copied object
    updatedObject.loading = false
      const objectIndex = completeNotifications.findIndex(obj => obj.id === ele.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...completeNotifications];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setCompleteNotifications(updatedData);
    }},
                  style: 'cancel',
                },
                {text: 'OK', onPress: async() => {try {
    const response = await fetch(url, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {newFriend: newFriend, user: user.uid, friendId: friendId}}), // Send data as needed
    })
    const data = await response.json();
    if (data.result.done) {
      const updatedObject = { ...ele };

    // Update the array in the copied object
    updatedObject.loading = false
      const objectIndex = completeNotifications.findIndex(obj => obj.id === ele.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...completeNotifications];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setCompleteNotifications(updatedData);
    }
    }
  } catch (error) {
    console.error('Error:', error);
  }},
  }]);
    
  }
    //console.log(requests)

const handleScroll = _.debounce((event) => {
    // Your logic for fetching more data
    setLoading(true)
    fetchMoreData()
    setTimeout(() => {
      setLoading(false)
    }, 1000);
  }, 500);
async function deleteNotification(item)  {
  if (item.item.request) {
     setCompleteNotifications(completeNotifications.filter((e) => e.item.id != item.item.id))
    await deleteDoc(doc(db, 'profiles', user.uid, 'notifications', item.item.id))
    .then(async() => await deleteDoc(doc(db, 'profiles', user.uid, 'requests', item.item.requestUser))).then(async() => await deleteDoc(doc(db, 'profiles', item.item.requestUser, 'requests', user.uid))) 
  }
  else {
    setCompleteNotifications(completeNotifications.filter((e) => e.item.id != item.item.id))
    await deleteDoc(doc(db, 'profiles', user.uid, 'notifications', item.item.id))
  }
  
  //console.log(item)
}
async function deleteMessage(item) {
  //await updateDoc
  //await deleteDoc(doc(db, 'friends', completeFriends.filter((element) => element.id.includes(item.id))[0].id)).then(() => setCompleteMessages((prevItems) => prevItems.filter((e) => e.id !== item.id)))
}
async function schedulePushRequestFriendNotification(id, username, notificationToken) {
      let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
      if (clique) {
        if (notifications.includes(user.uid)) {
          fetch(`${BACKEND_URL}/api/requestedNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, pushToken: notificationToken, data: {routeName: 'NotificationScreen', deepLink: 'nucliqv1://NotificationScreen'} 
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
      else if (notis) {
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
  //console.log(completeMessages.length)
  async function schedulePushFriendNotification(id, username, notificationToken) {
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    if (notis) {
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

const renderEvents = ({item, index}) => {
    //console.log(item)
    return (
      <View key={index}>
        <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}]} onPress={() => {setFilteredGroup([item]); setSearching(false)}}>
            <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.firstName} {item.lastName} | @{item.username != undefined ? item.username : item.userName}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center', marginLeft: 'auto'}} color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
        </TouchableOpacity>
      </View>
    )
  }
const handleGroupCallback = (dataToSend) => {
    setFilteredGroup(completeMessages.filter(item => item.userName == dataToSend[0].userName))
  }
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }

  return (
    <Provider>
    <View style={[styles.container, {backgroundColor: modeTheme.backgroundColor}]}>
      <Modal
      //transparent={true}
      visible={isVisible}
      animationType="fade"
    >
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: modeTheme.backgroundColor}}>
          <Text style={[styles.messageText, {color: modeTheme.color}]}>Message Sent</Text>
      </View>
    </Modal>
    <View style={styles.header}>
            <TouchableOpacity style={{alignSelf: 'center',}} hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }} onPress={payloadGroup ? () => navigation.navigate('Cliqs', {screen: 'GroupHome', params: {name: payloadGroup.id}}) : theme ? () => {navigation.navigate('Themes', {screen : 'All', params: {name: null, groupId: null, goToMy: false, groupTheme: null, group: null, registers: false}}); setRouteSending(false); setActuallySending(false)}  
        : () => navigation.goBack()} >
                <MaterialCommunityIcons name='chevron-left' color={modeTheme.color} size={35} onPress={payloadGroup ? () => navigation.navigate('Cliqs', {screen: 'GroupHome', params: {name: payloadGroup.id}}) : theme ? () => {navigation.navigate('Themes', {screen : 'All', params: {name: null, groupId: null, goToMy: false, groupTheme: null, group: null, registers: false}}); setRouteSending(false); setActuallySending(false)}  
        : () => navigation.goBack()} />
            </TouchableOpacity>
            
            {
            message ?
                  <>
            <Text style={[styles.headerText, {color: modeTheme.color}]}>Messages</Text>

        
       
        </>
        :
         <>
          <Text style={[styles.headerText, {color: modeTheme.color}]}>Notifications</Text>
        </>
        }
        <MaterialCommunityIcons name='share-variant-outline' size={27.5} color={"#fafafa"} onPress={shareApp}/>
        </View>
      <Divider />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
      {message ? <>
      {loading && completeMessages.length == 0 ?  <View style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
          <ActivityIndicator color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"} size={"large"}/> 
        </View> : friendsInfo.filter(obj => completeMessages.some(otherObj => otherObj.id === obj.id)).length > 0 ?
      <>
      {/* {activeFriends.filter(obj => completeMessages.some(otherObj => otherObj.id === obj.id)).length > 0 ? 
      <View style={{marginVertical: '5%', marginBottom: 0}}>
      <ScrollView horizontal contentContainerStyle={{flexGrow: 1}}>
        {activeFriends.filter(obj => completeMessages.some(otherObj => otherObj.id === obj.id)).map((item) => {
          //console.log(item)
          return (
            <>
            <View style={{height: 10, width: 10, position: 'relative', backgroundColor: '#9edaff', borderRadius: 8, left: 12, zIndex: 3}}/>
            <TouchableOpacity onPress={() => navigation.navigate('ViewingProfile', {name: item.id, viewing: true})}>
            
            {item.pfp ? <FastImage source={{uri: item.pfp}} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5, marginLeft: 5, marginRight: 5}}/> :
              <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5, marginLeft: 5, marginRight: 5}}/>
              }
            </TouchableOpacity>
            </>
          )
          
        })}
      </ScrollView>
      </View> : null}  */}
      {friendsInfo.filter(obj => completeMessages.some(otherObj => otherObj.id === obj.id)).length > 0 ? 
          <View style={{margin: '5%'}}>
            <TouchableOpacity activeOpacity={1} style={{width: '100%', marginTop: '2.5%', zIndex: 0}}>
            <View style={{flexDirection: 'row'}}>
                  <SearchInput value={specificSearch} icon={'magnify'} placeholder={'Search'} onFocus={() => {setRecentSearches(true); setSearching(true)}} iconStyle={styles.homeIcon}
                  containerStyle={!searching ? {borderWidth: 1, borderColor: modeTheme.color, width: '100%'} : {borderWidth: 1, borderColor: modeTheme.color, width: '90%'}} onSubmitEditing={ () => {setRecentSearches(false)}} text={searching ? true : false} onChangeText={setSpecificSearch} 
                  onPress={() => { setRecentSearches(true); setSpecificSearch(''); setSearching(true)}}/>
                  {searching ?
                  <MaterialCommunityIcons name='close' size={40} style={styles.closeHomeIcon} color={modeTheme.color} onPress={() => {setRecentSearches(false); setSearching(false); Keyboard.dismiss(); setFiltered([]); setSpecificSearch('')}}/> : null}
                  </View>
                  <View>
                  {searching && filtered.length == 0 && specificSearch.length > 0 ?
                  <View>
                    <Text style={{fontFamily: 'Montserrat_500Medium', color: modeTheme.color, fontSize: 15.36, paddingHorizontal: 10, textAlign: 'center', marginRight: '5%', marginTop: '5%'}}>No Search Results</Text>
                  </View> :  
                  searching && moreResults
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
                  : searching && (moreResults || specificSearch.length > 0) ? 
                  <View>
                  <FlatList 
                      data={!moreResults ? filtered.slice(0, 3) : filtered.slice(0, 10)}
                      renderItem={renderEvents}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{flexGrow: 1}}
                      scrollEnabled={moreResultButton ? false: true}
                  /> 
                  {moreResults ? 
                  <TouchableOpacity style={{alignItems: 'center', marginRight: '5%'}} onPress={() => {setRecentSearches(false); setMoreResults(true); setMoreResultButton(false);}}>
                    <Text style={{paddingTop: 5, fontFamily: 'Montserrat_400Regular', color: modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}}>See more results</Text>
                    </TouchableOpacity> : null}
                  </View> : <></>}
                  </View>
                  
                  
              </TouchableOpacity>
              
          </View>
      : null}
        {/* <Divider style={{borderWidth: 0.5}}/> */}
        {!searching ? <View style={{flex: 1}}>
            {filteredGroup.length > 0 ? 
            <FlatList 
                data={filteredGroup}
                renderItem={renderChats}
                keyExtractor={(item) => item.id.toString()}
                style={{height: '50%'}}
                contentContainerStyle={{zIndex: 0}}
            /> :
            completeMessages.length > 0 ? 
            <FlatList 
                data={completeMessages}
                renderItem={renderChats}
                keyExtractor={(item) => item.id.toString()}
                //contentContainerStyle={{flex: 1}}
                style={activeFriends.filter(obj => completeMessages.some(otherObj => otherObj.id === obj.id)).length > 0 ? {height: '100%'} : {height: '100%'}}
                ListFooterComponent={<View style={{paddingBottom: 75}}/>}
                onScroll={handleScroll}
                //ListFooterComponentStyle={<View style={{paddingBottom: 100}}/>}
                //style={{flex: 1}}
                //contentContainerStyle={{zIndex: 0, height: '100%'}}
                
            /> : null
            }
            {loading ? 
            <View style={{}}>
          <ActivityIndicator color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View> : null
            }

            
            
        </View> : null}
      {/* </View> */}
      </> : message && !loading && friendsInfo.filter(obj => completeMessages.some(otherObj => otherObj.id === obj.id)).length == 0 ? 
      <View style={{justifyContent: 'center', flex: 1, marginBottom: '40%', alignItems: 'center'}}>
        <Text style={[styles.noFriendsText, {color: modeTheme.color}]}>Sorry no Friends to Chat With</Text>
        <MaterialCommunityIcons name='emoticon-sad-outline' color={modeTheme.color} size={50} style={{alignSelf: 'center', marginTop: '10%'}}/>
      </View> : !loading && notifications.length == 0 ? <View style={{justifyContent: 'center', flex: 1, marginBottom: '40%', alignItems: 'center'}}>
        <Text style={[styles.noFriendsText, {color: modeTheme.color}]}>Sorry no Notifications yet</Text>
        <MaterialCommunityIcons name='emoticon-sad-outline' color={modeTheme.color} size={50} style={{alignSelf: 'center', marginTop: '10%'}}/>
      </View> : null}
      </> : <>
      {loading &&!lastVisible ?  <View style={{justifyContent: 'flex-end', flex: 1}}>
          <ActivityIndicator color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"} size={"large"}/> 
        </View> : notifications.length > 0 ? 
      <>
      
        
        {loading ? 
            <View style={{alignItems: 'center', flex: 1, justifyContent: 'flex-end', marginVertical: '5%'}}>
          <ActivityIndicator color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"} /> 
        </View> : null
            }
      {/* </View> */}
      </> 
      : message ?
      <View style={{justifyContent: 'center', flex: 1, marginBottom: '40%'}}>
        <Text style={[styles.noFriendsText, {color: modeTheme.color}]}>Sorry no Friends to Chat With</Text>
        <MaterialCommunityIcons name='emoticon-sad-outline' color={modeTheme.color} size={50} style={{alignSelf: 'center', marginTop: '10%'}}/>
      </View> 
      : notification ? 
      <View style={{justifyContent: 'center', flex: 1, marginBottom: '40%'}}>
        <Text style={[styles.noFriendsText, {color: modeTheme.color}]}>Sorry no Notifications</Text>
        <MaterialCommunityIcons name='emoticon-sad-outline' color={modeTheme.color} size={50} style={{alignSelf: 'center', marginTop: '10%'}}/>
      </View> : null}
      </>
      }
      {actuallySending ? 
      <View style={[styles.addCommentSecondContainer, {borderColor: modeTheme.color}]}>
        {/* <Text style={styles.characterCountText}>{caption.length}/200</Text> */}
        <View style={{flexDirection: 'row', marginHorizontal: '5%', width: '90%'}}>
              <TextInput style={[styles.input, {borderColor: modeTheme.color, color: modeTheme.color}]} autoFocus={true} returnKeyType='send' onSubmitEditing={addPostToChatter} placeholder={"Add message..."} placeholderTextColor={modeTheme.color} maxLength={200} value={caption} onChangeText={setCaption}/>
            </View> 
          </View>
            : null}
            
      </KeyboardAvoidingView>
    </View>
    
      
    </Provider>
  )
}

export default ChatScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    profilesContainer: {
        flexDirection: 'row'
    },
    messageText: {
      fontSize: 19.20, 
      alignSelf: 'center', 
      fontFamily: 'Montserrat_600SemiBold',
      padding: 7.5,
      paddingRight: 0, 
      paddingLeft: 0,
    },
    input: {
      borderTopWidth: 0.25,
      width: '110%',
      marginLeft: '-5%',
      padding: 15,
      margin: '2.5%',
      marginTop: 0,
      
      //backgroundColor: 'red'
    },
    searchContainer: {
        height: 60,
        width: 60,
        borderRadius: 30,
        backgroundColor: '#005278',
        justifyContent: 'center',
        //flex: 1,
        alignItems: 'center',
        marginRight: '5%',
        //marginLeft: '2.5%'
    },
    online: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: 'green',
        position: 'absolute',
        //top: 2,
        bottom: 45,
        left: 45,
        zIndex: 3
    },
    messageContainer: {
        borderRadius: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#d3d3d3",
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    name: {
        fontSize: 15.36,
        paddingTop: 5,
        fontFamily: 'Montserrat_700Bold'
        //width: '95%'
    },
    message: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        paddingBottom: 5,
    },
    clock: {
        paddingTop: 5,
        fontSize: 12.29,
        fontFamily: 'Montserrat_500Medium'
        //paddingRight: 5
    },
  iconStyle: {
    position: 'absolute', left: 280, top: 8.5
  },
  checkbox: {
    borderWidth: 1.5,
    height: 25,
    width: 25,
    borderRadius: 12.5,
    marginVertical: '5.5%',
    marginHorizontal: '5%'
  },
  noFriendsText: {
    fontSize: 19.20,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    textAlign: 'center'
  },
  greenDot: {
    height: 10,
    width: 10,
    backgroundColor: "#33FF68",
    borderRadius: 5,
    position: 'absolute',
  },
  addText: {
      fontSize: 15.36,
      padding: 7.5,
      paddingLeft: 15,
      fontFamily: 'Montserrat_500Medium',
      maxWidth: '90%'
      //maxWidth: '98%'
      //paddingTop: 0
    },
    image: {height: 40, width: 40, borderRadius: 8, alignSelf: 'center', borderWidth: 1},
    addCommentSecondContainer: {
        //flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        //flex: 1,
        //marginHorizontal: '5%',
        //marginBottom: '17.5%',
        width: '100%',
    },
    addContainer: {
      flex: 1,
      alignSelf: 'center', 
      alignItems: 'flex-end',
      marginRight: '2.5%'
    },
    characterCountText: {
      fontSize: 9,
      fontFamily: 'Montserrat_500Medium',
      padding: 5,
      textAlign: 'right',
      paddingRight: 0,
      marginRight: '7.5%',
      backgroundColor: "transparent"
    },
    modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
        flexDirection: 'row',
        alignItems: 'center',
        //justifyContent: 'space-between',
        marginTop: '8%',
        marginLeft: '5%',
        marginRight: '5%'
    },
    headerText: {
        fontSize: 19.20,
        flex: 1,
        textAlign: 'center',
        paddingLeft: 0,
         fontFamily: 'Montserrat_700Bold',
        alignSelf: 'center',
        padding: 10,
        //marginLeft: '-5%'
        
        marginRight: '5%'
    },
    homeIcon: {position: 'absolute', left: 280, top: 8.5},
  homeContainer: {marginLeft: '5%', marginBottom: '5%'},
  closeHomeIcon: {marginLeft: '1%'},
  categoriesContainer: {
    borderRadius: 5,
    flexDirection: 'row',
    //marginRight: '5%',
    marginTop: 5,
    padding: 5,
    alignItems: 'center',
    //justifyContent: 'space-between',
    //width: '95%',
  },
  categories: {
    fontSize: 15.36,
    padding: 10,
    width: '80%',
    fontFamily: 'Montserrat_500Medium'
  },
})