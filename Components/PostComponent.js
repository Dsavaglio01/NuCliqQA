import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Dimensions} from 'react-native'
import React, {useState, useRef, useEffect, useContext,} from 'react'
import Carousel from 'react-native-reanimated-carousel'
import {MaterialCommunityIcons, Ionicons, FontAwesome, AntDesign} from '@expo/vector-icons';
import useAuth from '../Hooks/useAuth';
import { useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image'
import { updateDoc, doc, addDoc, setDoc, collection, serverTimestamp, arrayUnion, arrayRemove, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import {BACKEND_URL} from "@env"
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import NextButton from './NextButton';
import * as Haptics from 'expo-haptics';
import themeContext from '../lib/themeContext';
import _ from 'lodash'
import Pinchable from 'react-native-pinchable'
import FollowButtons from './FollowButtons';
import getDateAndTime from '../lib/getDateAndTime';
import CommentsModal from './Posts/Comments';
import { fetchUsernames, ableToShareFunction, ableToShareCliqueFunction, fetchFriends, addLikeToPost, removeLikeFromPost, 
  removeSaveFromPost, addSaveToPost, buyThemeFunction,
  activePerson} from '../firebaseUtils';
import LikeButton from './Posts/LikeButton';
import RepostModal from './Posts/RepostModal';
import SaveButton from './Posts/SaveButton';
import handleKeyPress from '../lib/handleKeyPress';
import { PaginationDot } from './Posts/PaginationDot';
import { schedulePushLikeNotification, schedulePushLikeRepostNotification} from '../notificationFunctions';
import showToast from '../lib/toastService';
const PostComponent = ({data, forSale, background, home, loading, lastVisible, actualClique, cliqueIdPfp, 
  cliqueIdName, post, blockedUsers, smallKeywords, largeKeywords, ogUsername, pfp, reportedComments, clique, cliqueId, username, 
  admin, edit, caption, notificationToken, fetchMoreData}) => {
    const {user} = useAuth();
    const snapDirection = 'left'
    const flatListRef = useRef(null);
    const navigation = useNavigation();
    const [ableToShare, setAbleToShare] = useState(true);
    const [repostModal, setRepostModal] = useState(false);
    const [repostItem, setRepostItem] = useState(null);
    const theme = useContext(themeContext)
    const [usernames, setUsernames] = useState([]);
    const [tapCount, setTapCount] = useState(0);
    const [focusedPost, setFocusedPost] = useState(null);
    const timerRef = useRef(null);
    const [friends, setFriends] = useState([]);
    const [actualData, setActualData] = useState([]);
    const [activePostIndex, setActivePostIndex] = useState(0);
    const [commentModal, setCommentModal] = useState(false);
    useEffect(() => {
      if (data) {
        setActualData(data)
      }
    }, [data])
    useEffect(() => {
      if (focusedPost != null && !cliqueId) {
        const fetchPostExistence = async () => {
          if (focusedPost != null) {
            try {
              const exists = await ableToShareFunction(focusedPost.id);
              setAbleToShare(exists);
              setCommentModal(true)
            } 
            catch (error) {
              setAbleToShare(false); // Handle error by setting `ableToShare` to false
            }
          }
        };
        fetchPostExistence();
      }
      else if (focusedPost != null && cliqueId) {
        const fetchPostExistence = async () => {
          if (focusedPost != null) {
            try {
              const exists = await ableToShareCliqueFunction(cliqueId, focusedPost.id);
              setAbleToShare(exists);
              setCommentModal(true)
            } 
            catch (error) {
              setAbleToShare(false); // Handle error by setting `ableToShare` to false
            }
          }
        };
        fetchPostExistence();
      }
    }, [focusedPost])
    useEffect(() => {
    const loadUsernames = async () => {
      const fetchedUsernames = await fetchUsernames();
      setUsernames(fetchedUsernames);
    };

    loadUsernames();
  }, [])
  useEffect(() => {
    let unsubscribe;
    if (user?.uid) {
      // Call the utility function and pass state setters as callbacks
      unsubscribe = fetchFriends(user.uid, setFriends);
    }
    // Clean up the listener when the component unmounts
    return () => {
      if (unsubscribe) {
        return unsubscribe;
      }
    };
  }, [])
  async function addDoubleHomeLike(item, likedBy) {
    setTapCount(tapCount + 1);
    if (tapCount === 0) {
      timerRef.current = setTimeout(() => {
        
          setTapCount(0);
        
      }, 200); 
    }  else if (tapCount === 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      clearTimeout(timerRef.current);
      setTapCount(0);
      const updatedObject = { ...item };

    // Update the array in the copied object
    
      if (item.username == username && !likedBy.includes(user.uid) && !updatedObject.likedBy.includes(user.uid)) {
      updatedObject.likedBy = [...item.likedBy, user.uid];
    const objectIndex = actualData.findIndex(obj => obj.id === item.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        setActualData(updatedData);
      }
      await addLikeToPost(item.id, user.uid)
    }
    else if (!likedBy.includes(user.uid) && !updatedObject.likedBy.includes(user.uid)) {
      updatedObject.likedBy = [...item.likedBy, user.uid];
    const objectIndex = actualData.findIndex(obj => obj.id === item.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        setActualData(updatedData);
      }
      try {
        const response = await fetch(`${BACKEND_URL}/api/likePost`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, user: user.uid}}), // Send data as needed
    })
    const data = await response.json();
    if (data.done) {
      const friend = activePerson(item.userId)
      if (friend.active) {
        showToast(`${friend.userName}`, 'Liked your post', `${friend.pfp}`)
      }
      else {
        schedulePushLikeNotification(item.userId, username, item.notificationToken)
      }
      
    }
      }
      catch (e) {
        console.error(e);
        
      }
    }
    }
  }
  async function addHomeLike(item, likedBy) {
    const updatedObject = { ...item };

    // Update the array in the copied object
      if (item.username == username && !likedBy.includes(user.uid) && !updatedObject.likedBy.includes(user.uid)) {
        updatedObject.likedBy = [...item.likedBy, user.uid];
      const objectIndex = actualData.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...actualData];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualData(updatedData);
    }
    await addLikeToPost(item.id, user.uid)
    }
    else if (!likedBy.includes(user.uid) && !updatedObject.likedBy.includes(user.uid)) {
      updatedObject.likedBy = [...item.likedBy, user.uid];
      const objectIndex = actualData.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...actualData];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualData(updatedData);
    }
      try {
        const response = await fetch(`http://10.0.0.225:4000/api/likePost`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, user: user.uid}}), // Send data as needed
    })
    const data = await response.json();
    if (data.done) {
      const friend = activePerson(item.userId)
      if (item.repost) {
        if (friend.active) {
          showToast(`${friend.userName}`, 'Liked your re-vibe', `${friend.pfp}`)
        }
        else {
          schedulePushLikeRepostNotification(item.userId, username, item.notificationToken)
        }
      }
      else {
        if (friend.active) {
          showToast(`${friend.userName}`, 'Liked your post', `${friend.pfp}`)
        }
        else {
          schedulePushLikeNotification(item.userId, username, item.notificationToken)
        }
      }
    }
      }
      catch (e) {
        console.error(e);
        
      }
  }
  }
  async function removeHomeLike(item) {
    const updatedObject = { ...item };
    // Update the array in the copied object
    updatedObject.likedBy = item.likedBy.filter((e) => e != user.uid)
    const objectIndex = actualData.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...actualData];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualData(updatedData);
    }
    removeLikeFromPost(item.id, user.uid)
  }
  async function removeHomeSave(item) {
      const updatedObject = { ...item };
    updatedObject.savedBy = item.savedBy.filter((e) => e != user.uid)
    const objectIndex = actualData.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      console.log(objectIndex)
      // Create a new array with the replaced object
      const updatedData = [...actualData];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualData(updatedData);
    }
    removeSaveFromPost(item.id, user.uid, false)
  }
  async function addCliqueSave(item) {
    const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.savedBy = [...item.savedBy, user.uid];
    await updateDoc(doc(db, 'groups', cliqueId, 'posts', item.id), {
      savedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'groups', cliqueId, 'profiles', user.uid, 'saves', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    })).then(() => {
      const objectIndex = actualData.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...actualData];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualData(updatedData);
    }
    })
    
  }
  //console.log(username)
  async function addDoubleCliqueLike(item, likedBy) {
    setTapCount(tapCount + 1);
    //
    if (tapCount === 0) {
      timerRef.current = setTimeout(() => {
        // If no second tap occurs within the timer, treat it as a single tap
          setTapCount(0);
      }, 200); 
    }  else if (tapCount === 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      clearTimeout(timerRef.current);
      setTapCount(0);
      const updatedObject = { ...item };

    // Update the array in the copied object
    
    if(item.username == username && !likedBy.includes(user.uid) && !updatedObject.likedBy.includes(user.uid)) {
      //console.log('sec')
      updatedObject.likedBy = [...item.likedBy, user.uid];
    const objectIndex = actualData.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...actualData];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualData(updatedData);
    }
      await updateDoc(doc(db, 'groups', cliqueId, 'posts', item.id), {
      likedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'groups', cliqueId, 'profiles', user.uid, 'likes', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    }))
    }
    else if (!likedBy.includes(user.uid) && !updatedObject.likedBy.includes(user.uid)) {
      updatedObject.likedBy = [...item.likedBy, user.uid];
    const objectIndex = actualData.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...actualData];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualData(updatedData);
    }
      await updateDoc(doc(db, 'groups', cliqueId, 'posts', item.id), {
      likedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'groups', cliqueId, 'profiles', user.uid, 'likes', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    })).then(async() => await setDoc(doc(db, 'groups', cliqueId, 'notifications', item.userId, 'notifications', item.id), {
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
      likedBy: username,
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'groups', cliqueId, 'notifications', item.userId, 'checkNotifications'), {
        userId: user.uid
      })).then(() => schedulePushLikeNotification(item.userId, username, item.notificationToken))
    }
  }
  }
  async function addCliqueLike(item, likedBy) {
    const updatedObject = { ...item };

    // Update the array in the copied object
    
    if(item.username == username && !likedBy.includes(user.uid) && !updatedObject.likedBy.includes(user.uid)) {
      updatedObject.likedBy = [...item.likedBy, user.uid];
    const objectIndex = actualData.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...actualData];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualData(updatedData);
    }
      //console.log('sec')
      await updateDoc(doc(db, 'groups', cliqueId, 'posts', item.id), {
      likedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'groups', cliqueId, 'profiles', user.uid, 'likes', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    }))
    }
    else if (!likedBy.includes(user.uid) && !updatedObject.likedBy.includes(user.uid)) {
      updatedObject.likedBy = [...item.likedBy, user.uid];
    const objectIndex = actualData.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...actualData];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualData(updatedData);
    }
      await updateDoc(doc(db, 'groups', cliqueId, 'posts', item.id), {
      likedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'groups', cliqueId, 'profiles', user.uid, 'likes', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    })).then(async() => await setDoc(doc(db, 'groups', cliqueId, 'notifications', item.userId, 'notifications', item.id), {
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
      likedBy: username,
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'groups', cliqueId, 'notifications', item.userId, 'checkNotifications'), {
        userId: user.uid
      })).then(() => schedulePushLikeNotification(item.userId, username, item.notificationToken))
    }
  }

  async function removeCliqueLike(item) {
    const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.likedBy = item.likedBy.filter((e) => e != user.uid)
    const objectIndex = actualData.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...actualData];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualData(updatedData);
    }
    await updateDoc(doc(db, 'groups', cliqueId, 'posts', item.id), {
      likedBy: arrayRemove(user.uid)
    }).then(async() => await deleteDoc(doc(db, 'groups', cliqueId, 'profiles', user.uid, 'likes', item.id)))

  }
  async function removeCliqueSave(item) {
    const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.savedBy = item.savedBy.filter((e) => e != user.uid)
    const objectIndex = actualData.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...actualData];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualData(updatedData);
    }
    await updateDoc(doc(db, 'groups', cliqueId, 'posts', item.id), {
      savedBy: arrayRemove(user.uid)
    }).then(async() => await deleteDoc(doc(db, 'groups', cliqueId, 'profiles', user.uid, 'saves', item.id)))

  }

  async function addHomeSave(item, savedBy) {
      const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.savedBy = [...item.savedBy, user.uid];
      const objectIndex = actualData.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...actualData];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualData(updatedData);
    }
    addSaveToPost(item.id, user.uid, false)
  }
  const handleSnap = async (index) => {
    setActivePostIndex(0)
    if (index >= actualData.length - 2) {
      fetchMoreData();
    }
  };
  const CustomMentionText = (props) => {
 const arr = props.text.split(' ');
  const reducer = (acc, cur, index) => {
    let previousVal = acc[acc.length - 1];
    if (
      previousVal &&
      previousVal.startsWith('@') &&
      previousVal.endsWith('@')
    ) {
      //console.log(acc[acc.length - 1])
      acc[acc.length - 1] = previousVal + ' ' + cur;
    } else {
      acc.push(cur);
    }
    return acc;
  };

  const text = arr.reduce(reducer, []);
  async function findUser(text) {
    const getData = async() => {
      const q = query(collection(db, "usernames"), where("username", "==", text));
      const docSnap = await getDocs(q)
      docSnap.forEach((item) => {
        if (item.id != undefined) {
        //
        setCommentModal(false)
        setFocusedPost(null)
        if (item.id == user.uid) {
          navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})
        }
        else {
        navigation.navigate('ViewingProfile', {name: item.id, viewing: true})
        }
      } 
      })
      /* */
    }
    getData();
    //console.log(text)
  }
  return (
      <Text style={styles.standardPostText}>
      {text.slice(0).map((text) => {

        if (text.startsWith('@')) {
          console.log(text)
          return (
              <Text style={text.startsWith('@') ? usernames.some((substring) => text.includes(substring)) ? {color: "#9edaff"} : null : null} 
              onPress={usernames.some((substring) => text.includes(substring)) ? () => findUser(usernames.find((substring) => text.includes(substring))) : null}>
                {text.startsWith('@') ? text.replaceAll('@', '@') : null}{' '}
              </Text>
            
          );
        }
        return `${text} `;
      })}
    </Text>
  );
    }
  async function buyTheme(image) {
    await buyThemeFunction(image, navigation)
  }
    const renderItems = ({item, index}) => {
    return (
      <Pinchable>
        <FastImage
          source={{ uri: item.post, priority: 'normal' }}
          style={styles.multiItem}
          resizeMethod='cover'
        />
      </Pinchable>
    )
  }
    
    function openMenu(editedItem) {
      const editedItemIndex = actualData.findIndex((item) => item.id === editedItem.id);
      const newData = [...actualData];
      newData[editedItemIndex] = {
        ...newData[editedItemIndex],
        reportVisible: true
      } 
      setActualData(newData);
    
  }
  function closeMenu(editedItem) {
      const editedItemIndex = actualData.findIndex((item) => item.id === editedItem.id);
      const newData = [...actualData];
      newData[editedItemIndex] = {
        ...newData[editedItemIndex],
        reportVisible: false
      }
      setActualData(newData);
  }
    const renderItem = (item, index) => {
    if (item.item.likedBy != undefined) {
      if (item.item.post != null && item.item.post.length > 1) {
    return (
      <>
      <View style={item.item.index == 0 ? [styles.ultimateContainer, {marginTop: '-7.5%'}] : styles.ultimateContainer} key={item.item.id}>
        <TouchableOpacity onPress={home ? () => {addDoubleHomeLike(item.item, item.item.likedBy)} : clique ? () => addDoubleCliqueLike(item.item, item.item.likedBy) : null} activeOpacity={1}>
    <FastImage source={item.item.background ? {uri: item.item.background} : require('../assets/Default_theme.jpg')} style={styles.postingContainer}>
      <View style={[styles.posting, {height: Dimensions.get('screen').height / 2, zIndex: 99}]}>
        
        {item.item.username != username ? <View style={styles.postHeader}>
           {item.item.pfp ? <FastImage source={{uri: item.item.pfp, priority: 'normal'}} style={styles.pfp}/> : 
          <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.pfp}/>
          }
            <TouchableOpacity onPress={() => navigation.navigate('ViewingProfile', {name: item.item.userId, viewing: true})}>
              <Text numberOfLines={1} style={styles.addText}>@{item.item.username}</Text>
            </TouchableOpacity>
            {!item.item.blockedUsers.includes(user.uid) ? item.item.loading ? 
            <View style={styles.rightAddContainer}>
            <ActivityIndicator color={"#9edaff"}/> 
            </View>
            : <FollowButtons actualData={actualData} friendId={item.item.userId} updateActualData={setActualData} username={username} user={user} item={item.item} ogUsername={ogUsername} smallKeywords={smallKeywords} largeKeywords={largeKeywords} style={styles.addContainer}/> : null
   }
          </View> 
          : <View style={styles.postHeader}>
            {item.item.pfp ? <FastImage source={{uri: item.item.pfp, priority: 'normal'}} style={styles.pfp}/> : 
          <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.pfp}/>
          }
            <TouchableOpacity onPress={() => navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})} style={{marginLeft: '2.5%'}}>
              <Text style={styles.addText}>@{item.item.username}</Text>
            </TouchableOpacity>
            
          </View>}
          <GestureHandlerRootView style={styles.multiItemContainer}>
          <Carousel
          width={340}
          data={item.item.post}
          
          //mode='vertical-stack'
          modeConfig={{
            snapDirection,
          }}
          defaultIndex={index}
          onSnapToItem={(newIndex) => setActivePostIndex(newIndex)}
          renderItem={renderItems}
          
          />
            
          </GestureHandlerRootView>
          <View style={styles.paginationContainer}>
            {item.item.post.map((e, index) => (
              <PaginationDot 
                key={index} 
                isActive={index === activePostIndex} 
              />
            ))}
          </View>

            </View>
           <View style={styles.postFooter}>
              <View style={styles.buttonContainer}>
                <LikeButton videoStyling={false} item={item} user={user} updateTempPostsAddLike={addHomeLike} friends={friends}
                updateTempPostsRemoveLike={removeHomeLike}/>
          <View style={styles.commentContainer}>
          <TouchableOpacity onPress={!clique ? () => setFocusedPost(item.item) : () => setFocusedPost(item.item)}>
            <MaterialCommunityIcons name='message-outline' color={theme.color} size={26} style={{alignSelf: 'center'}} />
          </TouchableOpacity>
          <Text style={styles.postFooterText}>{item.item.comments > 999 && item.item.comments < 1000000 ? `${item.item.comments / 1000}k` : item.item.comments > 999999 ? `${item.item.comments / 1000000}m` : item.item.comments}</Text>
          </View>
          {!item.item.private ? 
           <TouchableOpacity onPress={!clique ? () => navigation.navigate('SendingModal', {payload: item.item, payloadUsername: item.item.username, video: false, theme: false}) :
        () => navigation.navigate('GroupChat', {id: cliqueId, group: cliqueId, pfp: cliqueIdPfp, groupName: cliqueIdName, post: item.item})}>
            <Ionicons name='arrow-redo-outline' color={theme.color} size={28} style={styles.sending}/>
          </TouchableOpacity> : null}
          <SaveButton item={item} user={user} updateTempPostsAddSave={addHomeSave} home={home} clique={clique} videoStyling={false}
          updateTempPostsCliqueAddSave={addCliqueSave} updateTempPostsCliqueRemoveSave={removeCliqueSave} 
          updateTempPostsRemoveSave={removeHomeSave}/>
          {item.item.mentions && item.item.mentions.length > 0 ?
          <TouchableOpacity onPress={() => navigation.navigate('Mention', {mentions: item.item.mentions, friends: friends})}>
            <MaterialCommunityIcons name='at' size={25} style={styles.mention} color={theme.color}/>
          </TouchableOpacity>
          : null}
          </View>
          
            
       {item.item.caption.length > 0 ? 
            <TouchableOpacity style={styles.captionContainer} onPress={() => setFocusedPost(item.item)}>
              <Text numberOfLines={1} style={{color: theme.color}}><Text style={styles.usernameCaption}>{item.item.username}</Text> {`${edit ? caption ? item.item.caption : item.item.caption : item.item.caption}`}</Text>
          </TouchableOpacity> : null}
          <Text style={styles.postText}>{getDateAndTime(item.item.timestamp)}</Text>
        </View>
        <View style={[[styles.rightArrow, {borderLeftColor: theme.backgroundColor}], {borderLeftArrow: theme.backgroundColor}]} />
        {item.item.background && item.item.postBought ? 
      
      <TouchableOpacity style={styles.buyThemeContainer} onPress={!post ? () => buyTheme(item.item.background, item.item.userId) : null}>
        <FontAwesome name='photo' size={22.5} style={{alignSelf: 'center'}}/>
      </TouchableOpacity>: null}
        </FastImage>
        
        </TouchableOpacity>
        </View>
          {loading && lastVisible && item.index == actualData.length - 1 ? <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
          </View>  : null}

        </>
        
    )
   }
   else if (item.item.post != null && item.item.post.length == 1 && !item.item.repost) {
    //console.log(edit, caption)
    //console.log(item.item.userId)
      return (
        <>
        <View style={item.index == 0 ? styles.firstUltimateContainer : styles.ultimateContainer} key={item.item.id}>
          <TouchableOpacity onPress={home ? () => {addDoubleHomeLike(item.item, item.item.likedBy)} : clique ? () => addDoubleCliqueLike(item.item, item.item.likedBy) : null} activeOpacity={1}>
            <FastImage source={item.item.background ? {uri: item.item.background} : require('../assets/Default_theme.jpg')} 
            style={ item.item.post[0].image || item.item.post[0].text ? styles.postingContainer : styles.videoPostingContainer}>
      <View>
      <View style={item.item.post[0].image ? [styles.posting, {height: Dimensions.get('screen').height / 2.1, paddingBottom: 5}] : styles.posting}>
        {item.item.post[0].image || item.item.post[0].text ?
        <View style={ styles.postHeader}>
            {item.item.pfp ? <FastImage source={{uri: item.item.pfp, priority: 'normal'}} style={styles.pfp}/> : 
          <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.pfp}/>
          }
            <TouchableOpacity onPress={item.item.userId != user.uid ? () => navigation.navigate('ViewingProfile', {name: item.item.userId, viewing: true}) : () => navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})}>
              <Text style={styles.addText}>@{item.item.username}</Text>
            </TouchableOpacity>
            {!item.item.blockedUsers.includes(user.uid) ? item.item.loading ? <View style={styles.rightAddContainer}>
            <ActivityIndicator color={"#9edaff"}/> 
            </View> :
            <FollowButtons actualData={actualData} friendId={item.item.userId} updateActualData={setActualData} username={username} user={user} item={item.item} ogUsername={ogUsername} smallKeywords={smallKeywords} largeKeywords={largeKeywords} style={styles.addContainer}/> : null
   }
          </View> 
          : null}
        {item.item.post[0].image ? 
        <Pinchable>
        <FastImage source={{uri: item.item.post[0].post, priority: 'normal'}}
        style={[{ height: Dimensions.get('screen').height / 2.75, width: Dimensions.get('screen').width / 1.2, borderRadius: 8, alignSelf: 'center'}]}/>
        </Pinchable> : 
   <CustomMentionText text={item.item.post[0].value} />}
          {item.item.mood && item.item.mood.length > 0 ? <Text style={styles.mood}>{item.item.mood}</Text> : null}
            </View>
            
          {item.item.post[0].image || item.item.post[0].text ?
          <>
           <View style={styles.postFooter}>
                  <View style={styles.buttonContainer}>
                    <LikeButton videoStyling={false} item={item} user={user} updateTempPostsAddLike={addHomeLike} friends={friends} 
                    updateTempPostsRemoveLike={removeHomeLike}/>
          <View style={styles.commentContainer}>
          <TouchableOpacity onPress={() => setFocusedPost(item.item)}>
            <MaterialCommunityIcons name='message-outline' size={26} color={theme.color} style={{alignSelf: 'center'}}/>
          </TouchableOpacity>
          <Text style={styles.postFooterText}>{item.item.comments > 999 && item.item.comments < 1000000 ? `${item.item.comments / 1000}k` : item.item.comments > 999999 ? `${item.item.comments / 1000000}m` : item.item.comments}</Text>
          </View>
          {!item.item.private ? 
          <TouchableOpacity onPress={!clique ? () => navigation.navigate('SendingModal', {payload: item.item, payloadUsername: item.item.username, video: false, theme: false}) :
        () => navigation.navigate('GroupChat', {id: cliqueId, group: cliqueId, pfp: cliqueIdPfp, groupName: cliqueIdName, post: item.item})}>
            <Ionicons name='arrow-redo-outline' color={theme.color} size={28} style={styles.sending}/>
          </TouchableOpacity> : null}
          <SaveButton item={item} user={user} updateTempPostsAddSave={addHomeSave} home={home} clique={clique} videoStyling={false}
          updateTempPostsCliqueAddSave={addCliqueSave} updateTempPostsCliqueRemoveSave={removeCliqueSave} 
          updateTempPostsRemoveSave={removeHomeSave}/>

          {item.item.mentions && item.item.mentions.length > 0 ?
          <TouchableOpacity onPress={() => navigation.navigate('Mention', {mentions: item.item.mentions, friends: friends})}>
            <MaterialCommunityIcons name='at' size={25} style={styles.mention} color={theme.color}/>
          </TouchableOpacity>
          : null}
          {item.item.post[0].text && item.item.userId != user.uid && !item.item.private ? 
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => {setRepostModal(true); setRepostItem(item.item)}}>
            <AntDesign name='retweet' size={25} style={styles.mention} color={theme.color}/> 
          </TouchableOpacity>
          {item.item.reposts ?
          <View>
            <Text style={styles.postFooterText}>{item.item.reposts > 999 && item.item.reposts < 1000000 ? `${item.item.reposts / 1000}k` : item.item.reposts > 999999 ? `${item.item.reposts / 1000000}m` : item.item.reposts}</Text>
          </View>
          : null}
          </View>
          : null}
          </View>
          
            {item.item.caption.length > 0 ? 
            <TouchableOpacity style={styles.captionContainer} onPress={() => setFocusedPost(item.item)}>
             <Text numberOfLines={1} style={{color: theme.color}}><Text style={styles.usernameCaption}>{item.item.username}</Text> {`${edit ? caption ? item.item.caption : item.item.caption : item.item.caption}`}</Text>
          </TouchableOpacity> : null}
          <Text style={styles.postText}>{getDateAndTime(item.item.timestamp)}</Text>
        </View> 
        <View style={[[styles.rightArrow, {borderLeftColor: theme.backgroundColor}], {borderLeftArrow: theme.backgroundColor}]} />
        </> : null}
        </View>
        {item.item.background && item.item.postBought ? 
      
      <TouchableOpacity style={styles.buyThemeContainer} onPress={!post ? () => buyTheme(item.item.background, item.item.userId) : null}>
        <FontAwesome name='photo' size={22.5} style={{alignSelf: 'center'}}/>
      </TouchableOpacity>: null}
        </FastImage>
        </TouchableOpacity>
        
        
        </View>
        {loading && lastVisible && item.index == actualData.length - 1 ? <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
          </View>  : null}
        </>
      )
   } 
   else {
    return (
        <>
        <View style={item.index == 0 ? styles.firstUltimateContainer : styles.ultimateContainer} key={item.item.id}>
    <FastImage source={item.item.background ? {uri: item.item.background} : require('../assets/Default_theme.jpg')}
    style={styles.postingContainer}>
      <View>
      <View style={styles.posting}>
        <View style={ styles.postHeader}>
            {item.item.pfp ? <FastImage source={{uri: item.item.pfp, priority: 'normal'}} style={styles.pfp}/> : 
          <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.pfp}/>
          }
            <TouchableOpacity onPress={item.item.userId != user.uid ? () => navigation.navigate('ViewingProfile', {name: item.item.userId, viewing: true}) : () => navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})}>
              <Text style={styles.addText}>@{item.item.username}</Text>
            </TouchableOpacity>
            {!item.item.blockedUsers.includes(user.uid) ? item.item.loading ? <View style={styles.rightAddContainer}>
            <ActivityIndicator color={"#9edaff"}/> 
            </View> :
            <FollowButtons actualData={actualData} friendId={item.item.userId} updateActualData={setActualData} username={username} user={user} item={item.item} ogUsername={ogUsername} smallKeywords={smallKeywords} largeKeywords={largeKeywords} style={styles.addContainer}/> : null
   }
          </View> 
          <Text style={styles.standardPostText}>{item.item.caption}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Post', {post: item.item.post.id, name: user.uid, groupId: null, video: false})} activeOpacity={1} style={styles.repostContainer}>
            <View style={ styles.postHeader}>
            {item.item.post.pfp ? <FastImage source={{uri: item.item.post.pfp, priority: 'normal'}} style={{height: 33, width: 33, borderRadius: 8}}/> : 
          <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 33, width: 33, borderRadius: 8}}/>
          }
            <TouchableOpacity>
              <Text style={styles.addText}>@{item.item.post.username}</Text>
            </TouchableOpacity>
            <Text style={{fontSize: 12.29, color: theme.color, }}>{getDateAndTime(item.item.post.timestamp)}</Text>
          </View> 
            <Text style={styles.standardPostText}>{item.item.post.post[0].value}</Text>
          </TouchableOpacity>
            </View>
          <>
           <View style={[styles.postFooter, {zIndex: -1}]}>
                  <View style={styles.buttonContainer}>
                    <LikeButton videoStyling={false} item={item} user={user} updateTempPostsAddLike={addHomeLike} friends={friends} 
                    updateTempPostsRemoveLike={removeHomeLike}/>
          <View style={styles.commentContainer}>
          <TouchableOpacity onPress={() => setFocusedPost(item.item)}>
            <MaterialCommunityIcons name='message-outline' size={26} color={theme.color} style={{alignSelf: 'center'}}/>
          </TouchableOpacity>
          <Text style={styles.postFooterText}>{item.item.comments > 999 && item.item.comments < 1000000 ? `${item.item.comments / 1000}k` : item.item.comments > 999999 ? `${item.item.comments / 1000000}m` : item.item.comments}</Text>
          </View>
          <SaveButton item={item} user={user} updateTempPostsAddSave={addHomeSave} home={home} clique={clique} videoStyling={false}
          updateTempPostsCliqueAddSave={addCliqueSave} updateTempPostsCliqueRemoveSave={removeCliqueSave} 
          updateTempPostsRemoveSave={removeHomeSave}/>
          {item.item.mentions && item.item.mentions.length > 0 ?
          <TouchableOpacity onPress={() => navigation.navigate('Mention', {mentions: item.item.mentions, friends: friends})}>
            <MaterialCommunityIcons name='at' size={25} style={styles.mention} color={theme.color}/>
          </TouchableOpacity>
          : null}
          
          </View>
          <Text style={styles.postText}>{getDateAndTime(item.item.timestamp)}</Text>
        </View>
        <View style={[styles.rightArrow, {borderLeftColor: theme.backgroundColor, zIndex: -1,}]} />
        </>
        </View>
  
        {item.item.background && item.item.postBought ? 
      
      <TouchableOpacity style={styles.buyThemeContainer} onPress={!post ? () => buyTheme(item.item.background, item.item.userId) : null}>
       <FontAwesome name='photo' size={22.5} style={{alignSelf: 'center'}}/>
      </TouchableOpacity>: null}
        </FastImage>
        
        
        </View>
        {loading && lastVisible && item.index == actualData.length - 1 ? <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
          </View>  : null}
        </>
      )
   }
  }
    
  }
  
  return (
    <View style={{flex: 1}}>
      <RepostModal repostModal={repostModal} closeRepostModal={() => setRepostModal(false)} repostItem={repostItem} 
          handleKeyPress={handleKeyPress} user={user} ableToShare={ableToShare} blockedUsers={blockedUsers} forSale={forSale} 
          notificationToken={notificationToken} username={ogUsername} background={background} pfp={pfp}/>
      {focusedPost != null && commentModal ? 
    <CommentsModal actualData={actualData} handleActualData={setActualData} commentModal={commentModal} videoStyling={false} closeCommentModal={() => setCommentModal(false)}
    postNull={() => setFocusedPost(null)} user={user} username={ogUsername} reportedComments={reportedComments} focusedPost={focusedPost}
    ableToShare={ableToShare} pfp={pfp} notificationToken={notificationToken} blockedUsers={blockedUsers}/> : null}
    {actualData.length > 0 ? 
          <Carousel
          width={Dimensions.get('screen').width}
          data={actualData}
          vertical
          height={Dimensions.get('screen').height * 0.85}
          ref={flatListRef}
          renderItem={renderItem}
          loop={false}
          onSnapToItem={handleSnap}
          style={{minHeight: '70%'}}
          
            /> : <View style={styles.noPostContainer}>
              <Text style={styles.noPostText}>No Posts Yet!</Text>
              <View style={{margin: '5%'}}>
                <NextButton text={"Be the first to create a post!"} textStyle={{fontSize: 15.36}} onPress={cliqueId ? () => navigation.navigate('NewPost', {group: true, cliqueId: cliqueId, actualGroup: actualClique, postArray: [], blockedUsers: blockedUsers, admin: admin, username: ogUsername}) : 
              () => navigation.navigate('NewPost', {group: null, cliqueId: null, postArray: []})}/>
              </View>
              
              </View>}
        </View>
  )
}

export default PostComponent

const styles = StyleSheet.create({
    firstUltimateContainer: {
      marginBottom: '7.5%',
      backgroundColor: "#121212",
      shadowColor: "#000000",
      elevation: 20,
      shadowOffset: {width: 2, height: 3},
      shadowOpacity: 0.5,
      shadowRadius: 1,
      height: '90%',
      borderTopWidth: 0.25,
      marginTop: 0
    },
    ultimateContainer: {
      marginBottom: '7.5%',
      backgroundColor: "#121212",
      shadowColor: "#000000",
      elevation: 20,
      shadowOffset: {width: 2, height: 3},
      shadowOpacity: 0.5,
      shadowRadius: 1,
      height: '90%',
      borderTopWidth: 0.25,
    },
    posting: {
      width: '90%',
      shadowColor: '#171717',
      shadowOffset: {width: -1, height: 3},
      shadowOpacity: 0.25,
      shadowRadius: 0.5,
      borderRadius: 8,
      marginLeft: '5%',
      paddingBottom: 25,
      marginTop: '5%',
      backgroundColor: "#121212",
      elevation: 20,
    },
    postingContainer: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      flexDirection: 'column',
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: '2.5%',
      marginLeft: '3.5%'
    },
    videoPostingContainer: {
      height: '100%',
      justifyContent: 'center',
    },
    addContainer: {
      marginLeft: 'auto',
      alignItems: 'flex-end',
    },
    rightAddContainer: {
      marginLeft: 'auto',
      alignItems: 'flex-end',
      marginRight: 5
    },
    addText: {
      fontSize: 15.36,
      fontFamily: 'Monserrat_500Medium',
      color: "#fafafa",
      padding: 7.5,
      alignSelf: 'center'
    },
  buyThemeContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    padding: 2.5,
    borderRadius: 2.5,
    backgroundColor: "#fafafa",
  },
  postFooter: {
    borderRadius: 10,
    padding: 10,
    width: '90%',
    elevation: 20,
    shadowColor: '#171717',
    shadowOffset: {width: -1, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 0.5,
    marginLeft: '5%',
    paddingLeft: 0,
    marginTop: '5%',
    backgroundColor: "#121212"
  },
    postFooterText: {
      fontSize: 12.29,
      fontFamily: 'Monserrat_500Medium',
      color: "#fafafa",
      padding: 5,
      alignSelf: 'center'
    },
    captionContainer: {
      width: '90%',
      marginLeft: '5%',
      marginTop: '2.5%',
      marginBottom: '1.5%',
      backgroundColor: "#121212"
    },
  rightArrow: {
    left: 50,
    bottom: 0.1,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRadius: 1,
    borderRightWidth: 0,
    borderBottomWidth: 20,  // Adjust the height of the triangle
    borderLeftWidth: 20,  // Adjust the width of the triangle
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '90deg' }],
    shadowColor: "#171717",
    elevation: 20,
    shadowOffset: {width: 2, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 1,
  },
  postText: {
    fontSize: 12.29,
    fontFamily: 'Monserrat_500Medium',
    padding: 5, 
    marginLeft: '3.5%',
    color: "#fafafa"
  },
  standardPostText: {
    fontSize: 15.36,
    fontFamily: 'Monserrat_500Medium',
    padding: 5, 
    marginLeft: '3.5%',
    color: "#fafafa"
  },
  noPostText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 24,
    margin: '5%',
    marginTop: '-25%',
    color: "#fafafa"
  },
    repostContainer: {
      borderWidth: 1,
      borderRadius: 10,
      borderColor: "#fafafa",
      width: '90%',
      marginLeft: '5%'
    },
    multiItem: {
      height: Dimensions.get('screen').height / 2.75, 
      width: Dimensions.get('screen').width / 1.20,
      zIndex: 10,
      resizeMode: 'cover',
      borderRadius: 8,
      marginLeft: '2.25%'
    },
    multiItemContainer: {
      justifyContent: 'center', 
      alignItems: 'center', 
      flex: 1, 
      zIndex: 999
    },
    pfp: {
      height: 44,
      width: 44, 
      borderRadius: 8
    },
    paginationContainer: {
      flexDirection: 'row', 
      marginBottom: '-4%', 
      justifyContent: 'flex-end', 
      marginRight: '2.5%'
    },
    buttonContainer: {
      flexDirection: 'row', 
      width: '90%', 
      marginLeft: '5%', 
      marginRight: '5%', 
      alignItems: 'center'
    },
    commentContainer: {
      flexDirection: 'row', 
      marginLeft: '2.5%',
    },
    sending: {
      alignSelf: 'center', 
      marginLeft: '2.5%',
    },
    mention: {
      alignSelf: 'center', 
      paddingLeft: 5
    },
    usernameCaption: {
      fontFamily: 'Montserrat_700Bold', 
      fontSize: Dimensions.get('screen').height / 54.95
    },
    loadingContainer: {
      height: 25, 
      marginTop: '2.5%'
    },
    noPostContainer: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center'
    },
    mood: {
      color: "#fafafa",
      fontFamily: 'Montserrat_500Medium',
      fontSize: 15.36,
      padding: 5,
      paddingLeft: 10
    }
})