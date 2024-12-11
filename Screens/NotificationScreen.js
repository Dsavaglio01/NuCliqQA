import { StyleSheet, Text, View, Alert, TouchableOpacity, FlatList, ActivityIndicator} from 'react-native'
import React, { useContext } from 'react'
import * as Notifications from 'expo-notifications'
import { useState, useEffect, useMemo } from 'react';
import { query, collection, onSnapshot, getDoc, getDocs, deleteDoc, doc, orderBy, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../Hooks/useAuth';
import {BACKEND_URL} from '@env';
import {MaterialIcons, MaterialCommunityIcons} from '@expo/vector-icons'
import { Swipeable } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import NextButton from '../Components/NextButton';
import FollowIcon from '../Components/FollowIcon';
import RequestedIcon from '../Components/RequestedIcon';
import FollowingIcon from '../Components/FollowingIcon';
import themeContext from '../lib/themeContext';
import { useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-paper';
import generateId from '../lib/generateId';
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
const NotificationScreen = () => {
    const [completeNotificationsDone, setCompleteNotificationsDone] = useState(false);
    const [notificationDone, setNotificationDone] = useState(false);
    const [notifications, setNotifications] = useState([])
    const navigation = useNavigation();
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [nonMessageNotifications, setNonMessageNotifications] = useState([]);
    const [username, setUsername] = useState('');
    const [searchKeywords, setSearchKeywords] = useState([]);
    const [smallKeywords, setSmallKeywords] = useState([]);
    const [largeKeywords, setLargeKeywords] = useState([]);
    const [completeNotifications, setCompleteNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const {user} = useAuth();
    const modeTheme = useContext(themeContext)
    const [menuVisible, setMenuVisible] = useState(false);
    const openMenu = () => setMenuVisible(true)
    const closeMenu = () => setMenuVisible(false)
    const [checkNotifications, setCheckNotifications] = useState([]);
    let row = [];
    let prevOpenedRow;
    useEffect(() => {
      
        deleteCheckedNotifications()
    }, [])
    async function deleteCheckedNotifications() {
      //console.log('first')
      const querySnapshot = await getDocs(collection(db, "profiles", user.uid, 'checkNotifications'));
      querySnapshot.forEach(async(docu) => {
        await deleteDoc(doc(db, 'profiles', user.uid, 'checkNotifications', docu.id))
      });
    }
    console.log(`Requests: ${requests}`)
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
    }, [onSnapshot]);
    useEffect(()=> {
      const getRequest = async() => {
        const unsub = onSnapshot(doc(db, 'profiles', user.uid), (docSnap) => {
          setFriends(docSnap.data().following)
        })
       //const docSnap = await getDoc(doc(db, 'profiles', user.uid))
         
        return unsub;
      } 
      getRequest()
      
    }, [onSnapshot]);
    useEffect(()=> {
      const getRequest = async() => {
        const docSnap = await getDoc(doc(db, 'profiles', user.uid))
         setUsername(docSnap.data().userName)
         setSmallKeywords(docSnap.data().smallKeywords)
         setLargeKeywords(docSnap.data().largeKeywords)
      } 
      getRequest()
    }, []);
    useEffect(() => {
      let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'checkNotifications')), (snapshot) => {
          setCheckNotifications(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
        })
      }
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
      return unsub;
    }, [])
    
    useEffect(() => {
      const q = query(collection(db, "profiles", user.uid, 'checkNotifications'));
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
    }, [])
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
  useEffect(() => {
        setNotificationDone(false)
        let templist = []
      const fetchCards = async () => {
        const q = query(collection(db, "profiles", user.uid, 'notifications'), orderBy('timestamp', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            templist.push({id: doc.id, loading: false, ...doc.data()})
          });
         setNotifications(templist)
      }
      
      setTimeout(() => {
        setNotificationDone(true)
      }, 1000);
      fetchCards();
    }, [])
    //console.log(notifications.length)
    //console.log(completeNotifications.length)
     useMemo(() => {
      if (notificationDone) {
        //setLoading(true)
        let newData = [];
        let tempList = [];
        setCompleteNotifications([])
        Promise.all(notifications.map(async(item) => {
    
          if (item.like && !item.video) {   
            //console.log(item)      
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'posts', item.item))
            if (dataSnap.exists() && docSnap.exists()) {
            if (!newData.includes(dataSnap.id)) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
               //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
                newData.push(dataSnap.id)
            }
            
            }
          }
          else if (item.like && item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'videos', item.item))
            if (dataSnap.exists() && docSnap.exists()) {
            if (!newData.includes(dataSnap.id)) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
               //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
                newData.push(dataSnap.id)
            }
            
            }
          }
          else if (item.report) {
            if (item.comments) {
              tempList.push({item})
              //setCompleteNotifications(prevState => [...prevState, {item}])
            }
            else if (item.post && !item.video) {
              const postSnap = await getDoc(doc(db, 'posts', item.postId))
              if (postSnap.exists()) {
                tempList.push({item, postInfo: {id: postSnap.id, ...postSnap.data()}})
              }
            }
            else if (item.post && item.video) {
              const postSnap = await getDoc(doc(db, 'videos', item.postId))
              if (postSnap.exists()) {
                tempList.push({item, postInfo: {id: postSnap.id, ...postSnap.data()}})
              }
            }
            else if (item.message) {
              //setCompleteNotifications(prevState => [...prevState, {item}])
              tempList.push({item})
            }
            else if (item.theme) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = (await getDoc(doc(db, 'products', item.postId)))
            const freeDataSnap = (await getDoc(doc(db, 'freeThemes', item.postId)))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data(), free: false})
              //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data(), free: false}])
            }
            else if (freeDataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: freeDataSnap.id, ...freeDataSnap.data()}, info: docSnap.data(), free: true})
              //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: freeDataSnap.id, ...freeDataSnap.data()}, info: docSnap.data(), free: true}])
            }
          }
          }
          else if (item.comment && !item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'posts', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
            //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          } 
          else if (item.comment && item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'videos', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
            //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.reply && !item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'posts', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
            //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.reply && item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'videos', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
            //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.acceptRequest) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            if (docSnap.exists()) {
              tempList.push({item, info: {id: docSnap.id, ...docSnap.data()}})
              //setCompleteNotifications(prevState => [...prevState, {item, info: {id: docSnap.id, ...docSnap.data()}}])
            }
            
          }
          else if (item.request) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            if (docSnap.exists()) {
              tempList.push({item, info: {id: docSnap.id, ...docSnap.data()}})
              //setCompleteNotifications(prevState => [...prevState, {item, info: {id: docSnap.id, ...docSnap.data()}}])
            }
          }
          else if (item.friend) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            if (docSnap.exists()) {
              tempList.push({item, info: {id: docSnap.id, ...docSnap.data()}})
              //setCompleteNotifications(prevState => [...prevState, {item, info: {id: docSnap.id, ...docSnap.data()}}])
            }
            
          }
          else if (item.mention && !item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'posts', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
             //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.mention && item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'videos', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
             //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.postMention && !item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'posts', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
             //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.postMention && item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'videos', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
             //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.repost) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'posts', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
            //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.remove || item.ban) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'groups', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
             //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.theme) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = (await getDoc(doc(db, 'products', item.postId)))
            const freeDataSnap = (await getDoc(doc(db, 'freeThemes', item.postId)))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data(), free: false})
              //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data(), free: false}])
            }
            else if (freeDataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: freeDataSnap.id, ...freeDataSnap.data()}, info: docSnap.data(), free: true})
              //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: freeDataSnap.id, ...freeDataSnap.data()}, info: docSnap.data(), free: true}])
            }
          }
          
        })).then(() => setCompleteNotifications(tempList)).finally(() => {setLoading(false); setCompleteNotificationsDone(true)})
       
      }
      
    }, [notificationDone])
    async function removeFriend(ele, friendId) {
      //console.log(ele)
      const updatedObject = { ...ele };

    // Update the array in the copied object
    updatedObject.loading = true
      const objectIndex = completeNotifications.findIndex(obj => obj.item.id === ele.id);
      //console.log(objectIndex)
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...completeNotifications];
      updatedData[objectIndex].item = updatedObject;
      // Set the new array as the state
      setCompleteNotifications(updatedData);
    }
    let newFriend = generateId(friendId, user.uid)
    //let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/removeFriend'
    Alert.alert('Are you sure you want to unfollow?', 'If you unfollow, you will be unable to message them and they will be unable to message you.', [
                {
                  text: 'Cancel',
                  onPress: () => {const updatedObject = { ...ele };

    // Update the array in the copied object
    updatedObject.loading = false
      const objectIndex = completeNotifications.findIndex(obj => obj.item.id === ele.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...completeNotifications];
      updatedData[objectIndex].item = updatedObject;
      // Set the new array as the state
      setCompleteNotifications(updatedData);
    }},
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
      const updatedObject = { ...ele };

    // Update the array in the copied object
    updatedObject.loading = false
      const objectIndex = completeNotifications.findIndex(obj => obj.item.id === ele.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...completeNotifications];
      updatedData[objectIndex].item = updatedObject;
      // Set the new array as the state
      setCompleteNotifications(updatedData);
    }
    }
  } catch (error) {
    console.error('Error:', error);
  }},
  }]);
    
  }
  //console.log(completeNotifications[0])
  //console.log(friends)
 // console.log(friends)
  async function addFriend(item, ele) {
    //console.log(ele)
      const updatedObject = { ...ele };
   //console.log(updatedObject.loading)
    // Update the array in the copied object
    updatedObject.loading = true
      const objectIndex = completeNotifications.findIndex(obj => obj.item.id === ele.id);
      //console.log(objectIndex)
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...completeNotifications];
      updatedData[objectIndex].item = updatedObject;
      // Set the new array as the state
      setCompleteNotifications(updatedData);
    }
    //console.log(newFriend)
    let newFriend = generateId(item.id, user.uid)
    //console.log(newFriend)
    //console.log(ele)
   // let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/addFriendTwo'
    try {
    const response = await fetch(`${BACKEND_URL}/api/addFriendTwo`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, newFriend: newFriend, user: user.uid, username: username, smallKeywords: smallKeywords, largeKeywords: largeKeywords,}}), // Send data as needed
    })
    const data = await response.json();
   // console.log(data)
      if (data.request) {
        const updatedObject = { ...ele };
        
    // Update the array in the copied object
    updatedObject.loading = false
      const objectIndex = completeNotifications.findIndex(obj => obj.item.id === ele.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...completeNotifications];
      updatedData[objectIndex].item = updatedObject;
      // Set the new array as the state
      setCompleteNotifications(updatedData);
    }
        schedulePushRequestFriendNotification(item.id, username, item.notificationToken)
      }
      else if (data.friend) {
        const updatedObject = { ...ele };

    // Update the array in the copied object
    updatedObject.loading = false
      const objectIndex = completeNotifications.findIndex(obj => obj.item.id === ele.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...completeNotifications];
      updatedData[objectIndex].item = updatedObject;
      // Set the new array as the state
      setCompleteNotifications(updatedData);
    }
        schedulePushFriendNotification(item.id, username, item.notificationToken)
      }
  } catch (error) {
    console.error('Error:', error);
  }
  }
  const renderNotification = ({item, index}, onClick) => {
    //console.log(item)
    //console.log(item.postInfo.post)
    if (index == 0) {
      //console.log(item.item)
    }
    const closeRow = (index) => {
      console.log('closerow');
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
          }} onPress={() => deleteNotification(item)}>
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
        {item.item.like && !item.item.repost ? 
        <View style={{margin: '2.5%', flexDirection: 'row', marginTop: 0, borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10, marginTop: 0}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '91%'}}>
          {item.info.pfp ? <FastImage source={{uri: item.info.pfp}} style={styles.image}/> :
              <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.image}/>
              }
          <Text numberOfLines={2} style={[styles.addText, {color: modeTheme.color}]}><Text style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.info.userName}</Text> liked your {!item.postInfo.repost ? item.postInfo.post[0].image ? 'post' : 
          item.postInfo.post[0].video ? 'vid' : 'vibe' : 're-vibe'}: </Text>
        </View>
        {!item.postInfo.repost ? item.postInfo.post[0].image ? 
      <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].post, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : item.postInfo.post[0].video ? <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].thumbnail, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.postInfo.post[0].textSize, borderRadius: 1, color: modeTheme.color}]}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity> : item.postInfo.post.post[0].image ? <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].post, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : item.postInfo.post.post[0].video ? <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].thumbnail, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.postInfo.post.post[0].textSize, borderRadius: 1, color: modeTheme.color}]}>{item.postInfo.post.post[0].value}</Text>
      </TouchableOpacity>}
        
        </View> : item.item.request ? 
        <View style={{margin: '2.5%', flexDirection: 'row', marginTop: 0, borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10, marginTop: 0}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '75%'}}>
          {item.info.pfp ? <FastImage source={{uri: item.info.pfp}} style={styles.image}/> :
              <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.image}/>
              }
          <Text numberOfLines={2} style={[styles.addText, {color: modeTheme.color}]}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.info.userName}</Text> requested to add you as a friend.</Text>
        </View>
        <View style={{alignItems: 'center', justifyContent: 'center', marginLeft: 'auto'}}>
          <NextButton text={"Accept"} textStyle={{padding: 7.5, paddingLeft: 7.5, paddingRight: 7.5, fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}} onPress={() => acceptRequest(item)}/>
        </View>
        
        </View>
        : item.item.repost ? 
        <View style={{margin: '2.5%', flexDirection: 'row', marginTop: 0, borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10, marginTop: 0}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '91%'}}>
          {item.info.pfp ? <FastImage source={{uri: item.info.pfp}} style={styles.image}/> :
              <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.image}/>
              }
          <Text numberOfLines={2} style={[styles.addText, {color: modeTheme.color}]}><Text style={{fontFamily: 'Montserrat_700Bold'}} 
          onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.info.userName}</Text> re-vibed your vibe: </Text>
        </View>
        <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={() => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false})}>
        <Text style={[styles.image, {fontSize: 15.36, borderRadius: 1, color: modeTheme.color}]}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity>
        
        </View> :
        item.item.acceptRequest ? 
        <View style={{margin: '2.5%', flexDirection: 'row', marginTop: 0, borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10, marginTop: 0}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '91%'}}>
          {item.info.pfp ? <FastImage source={{uri: item.info.pfp}} style={styles.image}/> :
              <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.image}/>
              }
          <Text numberOfLines={2} style={[styles.addText, {color: modeTheme.color}]}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.info.userName}</Text> accepted your friend request!</Text>
        </View>
        </View> :
        item.item.friend ? 
        <View style={{margin: '2.5%', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10, marginTop: 0}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '75%'}}>
          {item.info.pfp ? <FastImage source={{uri: item.info.pfp}} style={styles.image}/> :
              <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.image}/>
              }
          <Text numberOfLines={2} style={[styles.addText, {color: modeTheme.color}]}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.info.userName}</Text> added you as a friend!</Text>
        </View>
       {/*  {!item.info.blockedUsers.includes(user.uid) ? item.item.loading ? <View style={{marginLeft: 'auto', marginRight: '5%', alignSelf: 'center', justifyContent: 'flex-end'}}>
        <ActivityIndicator color={"#9edaff"}/> 
        </View> : 
        <TouchableOpacity style={[{marginLeft: 'auto', alignSelf: 'center', justifyContent: 'flex-end'}]} onPress={user.uid != null ? friends.filter(e => e === item.item.requestUser).length > 0 ? () => removeFriend(item.item, item.item.requestUser) : item.item.requestUser == user.uid || requests.filter(e => e.id === item.item.requestUser).length > 0 ? null : () => addFriend(item.info, item.item): null}>
              {requests.filter(e => e.id === item.item.requestUser).length > 0 ? <RequestedIcon color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"} /> : 
              friends.filter(e => e === item.item.requestUser).length > 0 ? <FollowingIcon color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"} />
              : item.item.requestUser == user.uid ? null : <FollowIcon color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"} />}
              
            </TouchableOpacity> : null
    } */}
        </View> :
        item.item.report ? 
        <View style={{margin: '2.5%', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10, marginTop: 0}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '100%'}}>
          {item.item.comments ? <View>
            <Text numberOfLines={2} style={[[styles.addText, {color: modeTheme.color}], {paddingLeft: 0, marginLeft: 0}]}>You have been reported for this comment: {item.item.postId.comment} for {item.item.item}</Text>
          </View> : item.item.post ? 
          <View style={{flexDirection: 'row', flex: 1, marginTop: 0}}>
            <Text numberOfLines={2} style={[[styles.addText, {color: modeTheme.color}], {paddingLeft: 0, marginLeft: 0}]}>This post has been reported for {item.item.item}:</Text>
            {!item.postInfo.repost ? item.postInfo.post[0].image ? 
            <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
              <FastImage source={{uri: item.postInfo.post[0].post, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
            </TouchableOpacity> : item.postInfo.post[0].video ? <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].thumbnail, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.postInfo.post[0].textSize, borderRadius: 1, color: modeTheme.color}]}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity> : item.postInfo.post.post[0].image ? 
            <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
              <FastImage source={{uri: item.postInfo.post.post[0].post, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
            </TouchableOpacity> : item.postInfo.post.post[0].video ? <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].thumbnail, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.postInfo.post.post[0].textSize, borderRadius: 1, color: modeTheme.color}]}>{item.postInfo.post.post[0].value}</Text>
      </TouchableOpacity>}
          </View> : item.item.message ? 
          <View style={{marginLeft: '-3%', width: '110%'}}> 
             <Text numberOfLines={2} style={[styles.addText, {color: modeTheme.color}]}>You have been reported for a chat message for {item.item.item}</Text>
          </View> : item.item.theme ? 
          <View style={{flexDirection: 'row', flex: 1, marginTop: 0}}>
            <Text numberOfLines={2} style={[[styles.addText, {color: modeTheme.color}], {paddingLeft: 0, marginLeft: 0}]}>This theme has been reported:</Text>
            <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={() => navigation.navigate('SpecificTheme', {productId: item.postInfo.id, free: true, purchased: false})}>
              <FastImage source={{uri: item.postInfo.images[0], priority: 'normal'}} style={styles.image}/>
            </TouchableOpacity>
          </View>  : null}
        </View>
        
        </View> 
        :
        item.item.comment ? item.item.likedComment ? 
        <View style={{margin: '2.5%', flexDirection: 'row', marginTop: 0, borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '75%'}}>
          <FastImage source={item.info.pfp != undefined ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={[styles.addText, {color: modeTheme.color}]}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.item.likedBy}</Text> liked your comment:  {item.item.item} </Text>
        </View>
        {!item.postInfo.repost ? item.postInfo.post[0].image ? 
      <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].post, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : item.postInfo.post[0].video ? <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].thumbnail, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.postInfo.post[0].textSize, borderRadius: 1, color: modeTheme.color}]}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity> : item.postInfo.post.post[0].image ? 
      <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].post, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : item.postInfo.post.post[0].video ? <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].thumbnail, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.postInfo.post.post[0].textSize, borderRadius: 1, color: modeTheme.color}]}>{item.postInfo.post.post[0].value}</Text>
      </TouchableOpacity>}
        </View> : 
        <View style={{margin: '2.5%', flexDirection: 'row', marginTop: 0, borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '75%'}}>
          <FastImage source={item.info.pfp != undefined ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={[styles.addText, {color: modeTheme.color}]}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.item.likedBy}</Text> commented:  {item.item.item} </Text>
        </View>
        {!item.postInfo.repost ? item.postInfo.post[0].image ? 
      <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].post, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : item.postInfo.post[0].video ? <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].thumbnail, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.postInfo.post[0].textSize, borderRadius: 1, color: modeTheme.color}]}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity> : item.postInfo.post.post[0].image ? 
      <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].post, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : item.postInfo.post.post[0].video ? <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].thumbnail, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.postInfo.post.post[0].textSize, borderRadius: 1, color: modeTheme.color}]}>{item.postInfo.post.post[0].value}</Text>
      </TouchableOpacity>}
        </View>
        : item.item.reply ? 
        <View style={{margin: '2.5%', flexDirection: 'row', marginTop: 0, borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '75%'}}>
          <FastImage source={item.info.pfp != undefined ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={[styles.addText, {color: modeTheme.color}]}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.item.likedBy}</Text> replied to you:  {item.item.item} </Text>
        </View>
        {!item.postInfo.repost ? item.postInfo.post[0].image ? 
      <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].post, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : item.postInfo.post[0].video ? <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].thumbnail, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.postInfo.post[0].textSize, borderRadius: 1, color: modeTheme.color}]}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity> :item.postInfo.post.post[0].image ? 
      <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].post, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : item.postInfo.post.post[0].video ? <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].thumbnail, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.postInfo.post.post[0].textSize, borderRadius: 1, color: modeTheme.color}]}>{item.postInfo.post.post[0].value}</Text>
      </TouchableOpacity>}
        </View> :
        item.item.theme ? 
        <View style={{margin: '2.5%', flexDirection: 'row', marginTop: 0, borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '75%'}}>
          <FastImage source={item.info.pfp != undefined ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={[styles.addText, {color: modeTheme.color}]}><Text  style={{fontWeight: '700'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.info.userName}</Text> bought your theme: </Text>
        </View>
      <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={() => navigation.navigate('SpecificTheme', {productId: item.postInfo.id, free: true, purchased: false})}>
              <FastImage source={{uri: item.postInfo.images[0], priority: 'normal'}} style={styles.image}/>
            </TouchableOpacity>
        
        </View> :
        item.item.mention ? 
         <View style={{margin: '2.5%', flexDirection: 'row', marginTop: 0, borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '75%'}}>
          <FastImage source={item.info.pfp != undefined ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={[styles.addText, {color: modeTheme.color}]}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.item.likedBy}</Text> mentioned you in a comment.</Text>
        </View>
        {!item.postInfo.repost ? item.postInfo.post[0].image ? 
      <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].post, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : item.postInfo.post[0].video ? <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].thumbnail, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.postInfo.post[0].textSize, borderRadius: 1, color: modeTheme.color}]}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity> : item.postInfo.post.post[0].image ? 
      <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].post, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : item.postInfo.post.post[0].video ? <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].thumbnail, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.postInfo.post.post[0].textSize, borderRadius: 1, color: modeTheme.color}]}>{item.postInfo.post.post[0].value}</Text>
      </TouchableOpacity>}
        </View> : item.item.remove ? 
        <View style={{margin: '2.5%', flexDirection: 'row', marginTop: 0, borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10}}>
          <View style={{flexDirection: 'row', flex: 1, marginTop: 0}}>
            <Text numberOfLines={2} style={[[styles.addText, {color: modeTheme.color}], {paddingLeft: 0, marginLeft: 0}]}>You have been removed from this Cliq: {item.postInfo.name}</Text>
            {<View style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}}>
              <FastImage source={item.postInfo.banner ? {uri: item.postInfo.banner, priority: 'normal'} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
            </View>}
          </View>
        </View> 
        : item.item.postMention ? 
        <View style={{margin: '2.5%', flexDirection: 'row', marginTop: 0, borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '75%'}}>
          <FastImage source={item.info.pfp != undefined ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={[styles.addText, {color: modeTheme.color}]}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.item.likedBy}</Text> mentioned you in a post.</Text>
        </View>
        {item.postInfo.post[0].image ? 
      <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={() => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false})}>
        <FastImage source={{uri: item.postInfo.post[0].post, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : item.postInfo.post[0].video ? <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={() => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: true})}>
        <FastImage source={{uri: item.postInfo.post[0].thumbnail, priority: 'normal'}} style={[styles.image, {borderRadius: 1}]}/>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}} onPress={() => navigation.navigate('Post', {post: item.postInfo.id, requests: requests, name: item.postInfo.userId, groupId: null, video: false})}>
        <Text style={[styles.image, {fontSize: item.postInfo.post[0].textSize, borderRadius: 1, color: modeTheme.color}]}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity>}
        </View>
        : item.item.ban ? 
        <View style={{margin: '2.5%', flexDirection: 'row', marginTop: 0, borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10}}>
          <View style={{flexDirection: 'row', flex: 1, marginTop: 0}}>
            <Text numberOfLines={2} style={[[styles.addText, {color: modeTheme.color}], {paddingLeft: 0, marginLeft: 0}]}>You have been banned from this Cliq: {item.postInfo.name}</Text>
            {<View style={{borderRadius: 10, marginLeft: 'auto', alignSelf: 'center'}}>
              <FastImage source={{uri: item.postInfo.banner, priority: 'normal'}} style={styles.image}/>
            </View>}
          </View>
        </View > :
        null
        }
        </Swipeable>
    )
}
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
async function deleteAllNotifications()  {
  /* if (item.item.request) {
     setCompleteNotifications(completeNotifications.filter((e) => e.item.id != item.item.id))
    await deleteDoc(doc(db, 'profiles', user.uid, 'notifications', item.item.id))
    .then(async() => await deleteDoc(doc(db, 'profiles', user.uid, 'requests', item.item.requestUser))).then(async() => await deleteDoc(doc(db, 'profiles', item.item.requestUser, 'requests', user.uid))) 
  }
  else {
    setCompleteNotifications(completeNotifications.filter((e) => e.item.id != item.item.id))
    await deleteDoc(doc(db, 'profiles', user.uid, 'notifications', item.item.id))
  } */
  
  //console.log(item)
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
  async function acceptRequest(item) {
  const newUser = generateId(item.item.requestUser, user.uid)
  //let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/acceptRequestInd'
    try {
    const response = await fetch(`${BACKEND_URL}/api/acceptRequestInd`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, newUser: newUser, username: username, smallKeywords: smallKeywords, largeKeywords: largeKeywords, user: user.uid}}), // Send data as needed
    })
    const data = await response.json();
      if (data.done) {
        schedulePushAcceptNotification(item.item.requestUser, username, item.info.notificationToken)
        setCompleteNotifications(completeNotifications.filter((e) => e.item.id != item.item.id)) 
      }
  } catch (error) {
    console.error('Error:', error);
  }
}
//console.log(loading, completeNotifications.length, completeNotificationsDone)
  return (
    <>
    <View style={styles.header}>
            <TouchableOpacity style={{alignSelf: 'center',}} hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }} onPress={() => navigation.goBack()} >
                <MaterialCommunityIcons name='chevron-left' color={modeTheme.color} size={35} onPress={() => navigation.goBack()} />
            </TouchableOpacity>
            {
         <>
          <Text style={[styles.headerText, {color: modeTheme.color}]}>Notifications</Text>
        </>
        }
        {/* <Menu
        visible={menuVisible}
              onDismiss={() => closeMenu()}
              contentStyle={{backgroundColor: '#121212', borderWidth: 1, borderColor: "#71797E"}}
              anchor={<Entypo name='dots-three-vertical' size={20} style={{alignSelf: 'center', marginTop: 10}} color={"#fafafa"} onPress={() => openMenu()}/>}>
          <Menu.Item onPress={() => deleteAllNotifications()} title="Clear All Notifications" />
        </Menu> */}
        </View>
        <Divider />
        <View style={{flex: 1}}>
      {<>
      {loading ?  <View style={{justifyContent: 'flex-end', flex: 1}}>
          <ActivityIndicator color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View> : notifications.length > 0 ? 
      <>
      
        {!loading && completeNotificationsDone ? <View style={{flex: 1, margin: '2.5%'}}>
            <FlatList 
                data={completeNotifications.slice().sort((a, b) => b.item.timestamp - a.item.timestamp)}
                renderItem={renderNotification}
                keyExtractor={(item) => item.item.id.toString()}
                style={{height: '50%', marginTop: '2.5%'}}
                contentContainerStyle={{zIndex: 0}}
            />
            
        </View> : null}
        {loading ? 
            <View style={{alignItems: 'center', flex: 1, justifyContent: 'flex-end', marginVertical: '5%'}}>
          <ActivityIndicator color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"} /> 
        </View> : null
            }
      {/* </View> */}
      </> 
      :
      <View style={{justifyContent: 'center', flex: 1, marginBottom: '40%'}}>
        <Text style={[styles.noFriendsText, {color: modeTheme.color}]}>Sorry no Notifications</Text>
        <MaterialCommunityIcons name='emoticon-sad-outline' color={modeTheme.color} size={50} style={{alignSelf: 'center', marginTop: '10%'}}/>
      </View>}
      </>
      }
            
      </View>
  </>
  )
}

export default NotificationScreen

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