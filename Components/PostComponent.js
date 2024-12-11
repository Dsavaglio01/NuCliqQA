import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, Dimensions} from 'react-native'
import React, {useState, useRef, useCallback, useEffect, useMemo, useContext, Suspense} from 'react'
import Carousel from 'react-native-reanimated-carousel'
import {MaterialCommunityIcons, Entypo, Ionicons, FontAwesome, AntDesign} from '@expo/vector-icons';
import { Menu } from 'react-native-paper';
import useAuth from '../Hooks/useAuth';
import { useFocusEffect, useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image'
import { updateDoc, doc, addDoc, setDoc, collection, serverTimestamp, arrayUnion, orderBy, startAfter, limit, arrayRemove, deleteDoc, query, where, getDocs, increment, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import {BACKEND_URL} from "@env"
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { Video, Audio } from 'expo-av';
import NextButton from './NextButton';
import * as Haptics from 'expo-haptics';
import themeContext from '../lib/themeContext';
import _ from 'lodash'
import Pinchable from 'react-native-pinchable'
import FollowButtons from './FollowButtons';
import getDateAndTime from '../lib/getDateAndTime';
import CommentsModal from './Posts/Comments';
import { ableToShareVideoFunction, fetchUsernames, deleteReplyFunction} from '../firebaseUtils';
import LikeButton from './Posts/LikeButton';
import RepostModal from './Posts/RepostModal';
import SaveButton from './Posts/SaveButton';
const LazyVideo = React.memo(
  ({ source, style, videoRef, shouldPlay, onPlaybackStatusUpdate }) => (
      <Video
        ref={videoRef}
        style={style}
        source={{ uri: source }}
        useNativeControls
        volume={1.0}
        shouldPlay={shouldPlay}
        isLooping
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
      />
    )
);
const PaginationDot = React.memo(({ isActive }) => {
  const dotStyle = useMemo(
    () => (isActive ? [styles.paginationDot, {backgroundColor: "#fafafa"}] : [styles.paginationDot, {backgroundColor: "#121212"}]),
    [isActive]
  ); // Memoize the style calculation
  
  return <View style={dotStyle} />;
}, (prevProps, nextProps) => prevProps.isActive === nextProps.isActive);
const PostComponent = ({data, forSale, background, home, loading, lastVisible, actualClique, videoStyling, cliqueIdPfp, 
  cliqueIdName, post, blockedUsers, smallKeywords, largeKeywords, ogUsername, pfp, privacy, reportedComments, reportedPosts,
  openPostMenu, clique, cliqueId, username, admin, edit, caption, notificationToken}) => {
    const flatListRef = useRef(null);
     const videoRef = useRef(null);
     const textInputRef = useRef(null);
     const [requests, setRequests] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [ableToShare, setAbleToShare] = useState(true);
    const [addingReply, setAddingReply] = useState(false);
    const [comments, setComments] = useState([])
    const [filtered, setFiltered] = useState([]);
    const [commentMentions, setCommentMentions] = useState([]);
    
    const [done, setDone] = useState(false);
    const [repostModal, setRepostModal] = useState(false);
  const [repostItem, setRepostItem] = useState(null);
    const [replyLastVisible, setReplyLastVisible] = useState(0);
    const [replies, setReplies] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const [commentsLoading, setLoading] = useState(false)
    const theme = useContext(themeContext)
    const [snapDirection, setSnapDirection] = useState('left')
    const [lastCommentVisible, setLastVisible] = useState(null);
    const {user} = useAuth();
    const [status, setStatus] = useState({})
    const navigation = useNavigation();
    const [activeIndex, setActiveIndex] = useState(0);
    const [singleCommentLoading, setSingleCommentLoading] = useState(false);
    const [tempReplyName, setTempReplyName] = useState();
    const [reportComment, setReportComment] = useState(null);
    const [reportNotificationToken, setReportNotificationToken] = useState(null);
    const [reportCommentModal, setReportCommentModal] = useState(false);
    const [reportedContent, setReportedContent] = useState([]);
    const [finishedReporting, setFinishedReporting] = useState(false);
    const [tempReplyId, setTempReplyId] = useState('');
    const [tempCommentId, setTempCommentId] = useState(null);
    const [usernames, setUsernames] = useState([]);
    const [tapCount, setTapCount] = useState(0);
    const [reply, setReply] = useState('');
    const [focusedPost, setFocusedPost] = useState(null);
    const timerRef = useRef(null);
    const [friends, setFriends] = useState([]);
    const [replyToReplyFocus, setReplyToReplyFocus] = useState(false);
    const [replyFocus, setReplyFocus] = useState(false);
    const [focused, setFocused] = useState(false);
    const [actualData, setActualData] = useState([]);
    const [activePostIndex, setActivePostIndex] = useState(0);
    const [commentModal, setCommentModal] = useState(false);
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
    useFocusEffect(
  useCallback(() => {
    // On screen focus (when the user navigates back)
    if (!isPaused) {
      return; // Video wasn't paused, no need to change state
    }

    // Video was paused, keep it paused
    setIsPaused(true);
  }, [isPaused]) // Dependency array for when isPaused changes 
);
    useEffect(() => {
      if (data) {
        setActualData(data)
      }
    }, [data])
    useEffect(() => {
      if (reportCommentModal && reportedContent.length == 0 && reportComment != null) {
        const getData = async() => {
        const querySnapshot = await getDocs(collection(db, 'profiles', reportComment.user, 'reportedContent'))
        const queryDoc = await getDoc(doc(db, 'profiles', reportComment.user))
        setReportNotificationToken(queryDoc.data().notificationToken)
        querySnapshot.forEach((doc) => {
          if (doc.exists()) {
            setReportedContent(prevState => [...prevState, doc.id])
            
          }
          
        })

      }
      getData();
      }
    }, [reportCommentModal])
    //console.log(actualData.length
    useEffect(() => {
      if (focusedPost != null && !cliqueId && !videoStyling) {
        const getData = async() => {
          const docSnap = await getDoc(doc(db, 'posts', focusedPost.id))
          if (!docSnap.exists()) {
            setAbleToShare(false)
          }
        }
        getData()
      }
    }, [focusedPost, videoStyling])
    useEffect(() => {
        const fetchPostExistence = async () => {
      if (focusedPost != null && videoStyling) {
        try {
          const exists = await ableToShareVideoFunction(focusedPost.id);
          setAbleToShare(exists);
        } catch (error) {
          console.error(error.message);
          setAbleToShare(false); // Handle error by setting `ableToShare` to false
        }
      }
    };
    fetchPostExistence();
    }, [videoStyling, focusedPost])
    useEffect(() => {
    const loadUsernames = async () => {
      const fetchedUsernames = await fetchUsernames();
      setUsernames(fetchedUsernames);
    };

    loadUsernames();
  }, [])
    useEffect(() => {
    if (focusedPost != null) {
      setCommentModal(true)
      if (!videoStyling) {
            let unsub;
            let fetchedCount = 0;
      const fetchCards = async () => {
        const q = query(collection(db, 'posts', focusedPost.id, 'comments'), orderBy('timestamp', 'desc'), limit(10));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              if (blockedUsers.includes(doc.data().userId)) {
                fetchedCount++;
                
              }
              else {
                setComments(prevState => [...prevState, {id: doc.id, showReply: false, loading: false, ...doc.data()}])
              }
            });
            if (fetchedCount === 10 && comments.length === 0) {
              // All 3 posts were blocked, fetch more
              const nextQuery = query(
                collection(db, 'posts', focusedPost.id, 'comments'),
                orderBy('timestamp', 'desc'),
                startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
                limit(10)
              );
              const nextSnapshot = await getDocs(nextQuery);
              nextSnapshot.forEach((doc) => {
                setComments(prevState => [...prevState, {id: doc.id, showReply: false, loading: false, ...doc.data()}])
              })
            }
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
      } 
      fetchCards();
      setTimeout(() => {
        setDone(true);
      }, 1000);
      return unsub;
        } 
        else {
             let unsub;
            let fetchedCount = 0;
      const fetchCards = async () => {
        const q = query(collection(db, 'videos', focusedPost.id, 'comments'), orderBy('timestamp', 'desc'), limit(10));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              if (blockedUsers.includes(doc.data().userId)) {
                fetchedCount++;
                
              }
              else {
                setComments(prevState => [...prevState, {id: doc.id, showReply: false, loading: false, ...doc.data()}])
              }
            });
            if (fetchedCount === 10 && comments.length === 0) {
              // All 3 posts were blocked, fetch more
              const nextQuery = query(
                collection(db, 'videos', focusedPost.id, 'comments'),
                orderBy('timestamp', 'desc'),
                startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
                limit(10)
              );
              const nextSnapshot = await getDocs(nextQuery);
              nextSnapshot.forEach((doc) => {
                setComments(prevState => [...prevState, {id: doc.id, showReply: false, loading: false, ...doc.data()}])
              })
            }
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
      } 
      fetchCards();
      setTimeout(() => {
        setDone(true);
      }, 1000);
      return unsub;
        }
    }
  }, [focusedPost])
    const triggerAudio = async(ref) => {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true})
    }
    useEffect(() => {
      if (status.isPlaying) triggerAudio(videoRef);
  }, [videoRef, status.isPlaying]);
  useEffect(()=> {
      let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'friends'), where('actualFriend', '==', true)), (snapshot) => {
          setFriends(snapshot.docs.map((doc)=> ( {
            id: doc.id,
          })))
        })
      } 
      fetchCards();
      return unsub;
    }, []);
  async function addDoubleHomeLike(item, likedBy) {
    setTapCount(tapCount + 1);
    //console.log('first')
    if (tapCount === 0) {
      timerRef.current = setTimeout(() => {
        if (item.post[0].video) {
          //openVideoModal(item)
          setTapCount(0);
        }
        else {
          setTapCount(0);
        }

        // If no second tap occurs within the timer, treat it as a single tap
        
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
      await updateDoc(doc(db, 'posts', item.id), {
      likedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'profiles', user.uid, 'likes', item.id), {
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
      schedulePushLikeNotification(item.userId, username, item.notificationToken)
    }
      }
      catch (e) {
        console.error(e);
        
      }
    }
    }
  }
  async function addHomeLike(item, likedBy) {
    if (videoStyling) {
      const updatedObject = { ...item };

    // Update the array in the copied object
    
    //console.log(updatedObject)
      if (item.username == username && !likedBy.includes(user.uid) && !updatedObject.likedBy.includes(user.uid)) {
        await setDoc(doc(db, 'profiles', user.uid, 'likes', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    }).then(async() =>
      await updateDoc(doc(db, 'videos', item.id), {
      likedBy: arrayUnion(user.uid)
    })).then(() => {
        updatedObject.likedBy = [...item.likedBy, user.uid];
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
        const response = await fetch(`${BACKEND_URL}/api/likeVideoPost`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, user: user.uid}}), // Send data as needed
    })
    const data = await response.json();
    if (data.done) {
      schedulePushLikeNotification(item.userId, username, item.notificationToken)
    }
      }
      catch (e) {
        console.error(e);
        
      }
      
      
    }
    }
    else {
    const updatedObject = { ...item };

    // Update the array in the copied object
    
    //console.log(updatedObject)
      if (item.username == username && !likedBy.includes(user.uid) && !updatedObject.likedBy.includes(user.uid)) {
        await setDoc(doc(db, 'profiles', user.uid, 'likes', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    }).then(async() =>
      await updateDoc(doc(db, 'posts', item.id), {
      likedBy: arrayUnion(user.uid)
    })).then(() => {
        updatedObject.likedBy = [...item.likedBy, user.uid];
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
      if (item.repost) {
         schedulePushLikeRepostNotification(item.userId, username, item.notificationToken)
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
  async function removeHomeLike(item) {
    if (videoStyling) {
      await updateDoc(doc(db, 'videos', item.id), {
      likedBy: arrayRemove(user.uid)
    }).then(async() => await deleteDoc(doc(db, 'profiles', user.uid, 'likes', item.id))).then(() => {
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
    })
    }
    else {
      await updateDoc(doc(db, 'posts', item.id), {
      likedBy: arrayRemove(user.uid)
    }).then(async() => await deleteDoc(doc(db, 'profiles', user.uid, 'likes', item.id))).then(() => {
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
    })
    }
    
    

  }
  async function removeHomeSave(item) {
    if (videoStyling) {
      await deleteDoc(doc(db, 'profiles', user.uid, 'saves', item.id)).then(async() => await updateDoc(doc(db, 'videos', item.id), {
      savedBy: arrayRemove(user.uid)
    })).then(() => {
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
    })
    }
    else {
      await deleteDoc(doc(db, 'profiles', user.uid, 'saves', item.id)).then(async() => await updateDoc(doc(db, 'posts', item.id), {
      savedBy: arrayRemove(user.uid)
    })).then(() => {
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
    })
    }
    
    
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
    //console.log('first')
    if (tapCount === 0) {
      timerRef.current = setTimeout(() => {
        // If no second tap occurs within the timer, treat it as a single tap
        if (item.post[0].video) {
         // openVideoModal(item)
          setTapCount(0);
        }
        else {
          setTapCount(0);
        }
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
  async function schedulePushCommentReplyNotification(id, username, notificationToken, comment) {
    //console.log(username)
    //console.log(notificationToken)
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    let banned = (await getDoc(doc(db, 'profiles', id))).data().banned
    const deepLink = `nucliqv1://GroupChannels?id=${cliqueId}&group=${actualClique}&person=${id}&pfp=${cliqueIdPfp}&name=${cliqueIdName}`;
      let cliqNotis = (await getDoc(doc(db, 'groups', cliqueId))).data().allowPostNotifications
      if (cliqueId) {
      if (notis && cliqNotis.includes(id)) {
      fetch(`${BACKEND_URL}/api/replyNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: ogUsername, pushToken: notificationToken, "content-available": 1, "content-available": 1, data: {routeName: 'GroupChannels', deepLink: deepLink, id: cliqueId, group: actualClique, person: id, pfp: cliqueIdPfp, name: cliqueIdName,}, comment: comment
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
} else {
      if (notis && !banned) {
      fetch(`${BACKEND_URL}/api/replyNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: ogUsername, pushToken: notificationToken, comment: comment, "content-available": 1, data: {routeName: 'NotificationScreen', deepLink: 'nucliqv1://NotificationScreen'}
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
  const linkUsernameAlert = () => {
        Alert.alert('Cannot post Comment', 'Comment cannot contain link', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => {setNewComment(''); setSingleCommentLoading(false); setReply('')}},
    ]);
    }
    const profanityUsernameAlert = () => {
      Alert.alert('Cannot post comment', 'Comment cannot contain profanity', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => {setNewComment(''); setSingleCommentLoading(false); setReply('')}},
    ]);
    }
//console.log(tempReplyId)
//console.log(username)
  useEffect(() => {
  if (textInputRef.current && replyToReplyFocus) { 
    textInputRef.current.focus();
  }
}, [replyToReplyFocus]);
     
  //console.log(replyFocus)
  //console.log(tempReplyId)
  

  const deleteItem = async(item) => {
    if (videoStyling) {
      await setDoc(doc(db, 'deletedComments', item.id), {
        postId: focusedPost.id,
        user: item.user,
        username: item.username,
        info: item,
        timestamp: serverTimestamp()
      }).then(async() =>
      await deleteDoc(doc(db, 'videos', focusedPost.id, 'comments', item.id))).then(async()=> await updateDoc(doc(db, 'videos', focusedPost.id), {
                                               comments: increment(-1 - item.replies.length)
                                            })).then(async() => await deleteDoc(doc(db, 'profiles', user.uid, 'comments', item.postId))).then(() => 
    setComments(comments.filter(e => e.id != item.id))).then(() => {
      const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments - 1;
    const objectIndex = actualData.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        setActualData(updatedData);
      }
    })
    } 
    else {
      await setDoc(doc(db, 'deletedComments', item.id), {
        postId: focusedPost.id,
        user: item.user,
        username: item.username,
        info: item,
        timestamp: serverTimestamp()
      }).then(async() =>
      await deleteDoc(doc(db, 'posts', focusedPost.id, 'comments', item.id))).then(async()=> await updateDoc(doc(db, 'posts', focusedPost.id), {
                                                comments: increment(-1)
                                            })).then(async() => await deleteDoc(doc(db, 'profiles', user.uid, 'comments', item.postId))).then(() => 
    setComments(comments.filter(e => e.id != item.id))).then(() => {
      const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments - 1;
    const objectIndex = actualData.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        setActualData(updatedData);
      }
    })
    }
    
    }
  const deleteReply = async(item, reply) => {
    //console.log(item.id, reply, focusedItem.id)
    await deleteReplyFunction(item, reply, focusedPost, comments, setComments, tempPosts, setTempPosts);
  }

  async function addHomeSave(item) {
    if (videoStyling) {
      await updateDoc(doc(db, 'videos', item.id), {
      savedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'profiles', user.uid, 'saves', item.id), {
      post: item,
      video: true,
      timestamp: serverTimestamp()
    }).then(() => addRecommendSave(item))
    ).then(() => {
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
    })
    }
    else {
      await updateDoc(doc(db, 'posts', item.id), {
      savedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'profiles', user.uid, 'saves', item.id), {
      post: item,
      timestamp: serverTimestamp()
    }).then(() => addRecommendSave(item))
    ).then(() => {
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
    })
    }
    
    
    
  }
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
        //console.log('first')
        setCommentModal(false)
        setFocusedPost(null)
        setComments([]);
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
  //console.log(usernames)
  return (
    //console.log(text),
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
  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === 'Enter') {
      // Prevent user from manually inserting new lines
      return;
    }
  };
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
            : <FollowButtons username={username} user={user} item={item} ogUsername={ogUsername} smallKeywords={smallKeywords} largeKeywords={largeKeywords} style={styles.addContainer}/> : null
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
                <LikeButton videoStyling={videoStyling} item={item} user={user} updateTempPostsAddLike={addHomeLike} friends={friends} requests={requests} 
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
          <SaveButton item={item} user={user} updateTempPostsAddSave={addHomeSave} home={home} clique={clique} videoStyling={videoStyling}
          updateTempPostsCliqueAddSave={addCliqueSave} updateTempPostsCliqueRemoveSave={removeCliqueSave} 
          updateTempPostsRemoveSave={removeHomeSave}/>
          {item.item.mentions && item.item.mentions.length > 0 ?
          <TouchableOpacity onPress={() => navigation.navigate('Mention', {mentions: item.item.mentions, friends: friends, requests: requests})}>
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
      
      <TouchableOpacity style={styles.buyThemeContainer} onPress={!post ? () => buyThemeFunction(item.item.background, item.item.userId) : null}>
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
   else if (item.item.post != null && item.item.post.length == 1 && !item.item.post[0].video && !item.item.repost) {
    //console.log(edit, caption)
      return (
        <>
        <View style={item.index == 0 ? styles.firstUltimateContainer : styles.ultimateContainer} key={item.item.id}>
          <TouchableOpacity onPress={home ? () => {addDoubleHomeLike(item.item, item.item.likedBy)} : clique ? () => addDoubleCliqueLike(item.item, item.item.likedBy) : null} activeOpacity={1}>
            <FastImage source={item.item.background ? {uri: item.item.background} : require('../assets/Default_theme.jpg')} 
            style={ item.item.post[0].image || item.item.post[0].text ? styles.postingContainer : styles.videoPostingContainer}>
      <View>
      <View style={item.item.post[0].image ? [styles.posting, {height: Dimensions.get('screen').height / 2.1, paddingBottom: 5}] : item.item.post[0].video ? styles.captionPosting : styles.posting}>
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
            <FollowButtons username={username} user={user} item={item} ogUsername={ogUsername} smallKeywords={smallKeywords} largeKeywords={largeKeywords} style={styles.addContainer}/> : null
   }
          </View> 
          : null}
        {item.item.post[0].image ? 
        <Pinchable>
        <FastImage source={{uri: item.item.post[0].post, priority: 'normal'}}
        style={[{ height: Dimensions.get('screen').height / 2.75, width: Dimensions.get('screen').width / 1.2, borderRadius: 8, alignSelf: 'center'}]}/>
        </Pinchable>
        
        : item.item.post[0].video ?
          <TouchableOpacity activeOpacity={1} onLongPress={() => openPostMenu(item.item)} style={styles.videoContainer}>
            
            <Video       
              ref={videoRef}
              style={styles.video}
              source={{uri: item.item.post[0].post}}
              useNativeControls
              volume={1.0}
              shouldPlay={ activeIndex == item.index && focused && !isPaused ? true : false}
              isLooping
              onPlaybackStatusUpdate={status => setStatus(() => status)}
            />
          </TouchableOpacity> : 
   <CustomMentionText text={item.item.post[0].value} />}
          {item.item.post[0].video ?
          <>
          <View style={item.item.caption ? [styles.videoPostHeader, {marginTop: 0}] : styles.videoPostHeader}>
            {item.item.pfp ? <FastImage source={{uri: item.item.pfp, priority: 'normal'}} style={styles.videoPfp}/> : 
          <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.videoPfp}/>
          }
            <TouchableOpacity onPress={item.item.userId != user.uid ? () => navigation.navigate('ViewingProfile', {name: item.item.userId, viewing: true}) : () => navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})}>
              <Text numberOfLines={1} style={[styles.addText, {fontSize: 12.29}]}>@{item.item.username}</Text>
            </TouchableOpacity>
            {!item.item.blockedUsers.includes(user.uid) ? item.item.loading ? <View style={styles.rightAddContainer}>
            <ActivityIndicator color={"#9edaff"}/> 
            </View> :
            <FollowButtons username={username} user={user} item={item} ogUsername={ogUsername} smallKeywords={smallKeywords} largeKeywords={largeKeywords} style={styles.addContainer}/> : null
   }
            {!reportedPosts.includes(item.item.id) ? 
          <TouchableOpacity style={styles.menuContainer}>
            <Menu visible={item.item.reportVisible}
                    onDismiss={() => closeMenuCallback(item.item)}
                    contentStyle={{backgroundColor: theme.backgroundColor, alignSelf: 'center', borderWidth: 1, borderColor: "#71797E"}}
                    anchor={<Entypo name='dots-three-vertical' size={25} color={"#fafafa"} onPress={null}/>}>
                  <Menu.Item title="Report" titleStyle={{color: "#000"}} onPress={() => navigation.navigate('ReportPage', {id: item.item.id, theme: false, comment: null, cliqueId: null, video: false, post: true, comments: false, message: false, cliqueMessage: false, reportedUser: item.item.userId})}/>
            </Menu>
          
            </TouchableOpacity>
            : null }
          </View> 
          {item.item.post[0].video ? item.item.caption.length > 0 ? 
            <TouchableOpacity style={styles.videoCaptionContainer} onPress={() => setFocusedPost(item.item)}>
              <Text numberOfLines={1} style={{color: "#fafafa", fontSize: Dimensions.get('screen').height / 68.7, width: '70%'}}><Text style={styles.usernameCaption}>{item.item.username}</Text> 
              {`${edit ? caption ? item.item.caption : item.item.caption : item.item.caption}`}</Text>
          </TouchableOpacity> : null : null}
        </>
        : null}
            </View>
            {item.item.post[0].video ? 
            <View style={item.item.mentions && item.item.mentions.length > 0 ? {flexDirection: 'column', marginTop: '-64%', width: 100, marginLeft: '70%', justifyContent: 'flex-end'} : {flexDirection: 'column', marginTop: '-50%', width: 100, marginLeft: '70%', justifyContent: 'flex-end'} }>
              <LikeButton videoStyling={videoStyling} item={item} user={user} updateTempPostsAddLike={addHomeLike} friends={friends} requests={requests} 
                updateTempPostsRemoveLike={removeHomeLike}/>
          <View style={styles.videoButton}>
          <TouchableOpacity onPress={() => setFocusedPost(item.item)}>
            <MaterialCommunityIcons name='message-outline' size={Dimensions.get('screen').height / 35.9} color={"#fafafa"} style={{alignSelf: 'center'}}/>
          </TouchableOpacity>
          <Text style={styles.postFooterText}>{item.item.comments > 999 && item.item.comments < 1000000 ? `${item.item.comments / 1000}k` : item.item.comments > 999999 ? `${item.item.comments / 1000000}m` : item.item.comments}</Text>
          </View>
          {!item.item.private ? 
          <TouchableOpacity style={styles.videoButton} onPress={!clique ? () => navigation.navigate('SendingModal', {payload: item.item, payloadUsername: item.item.username, video: true, theme: false}) :
        () => navigation.navigate('GroupChat', {id: cliqueId, group: cliqueId, pfp: cliqueIdPfp, groupName: cliqueIdName, post: item.item})}>
            <Ionicons name='arrow-redo-outline' color={"#fafafa"} size={Dimensions.get('screen').height / 33.1} style={styles.sendingVideo}/>
          </TouchableOpacity> : null}
          <SaveButton item={item} user={user} updateTempPostsAddSave={addHomeSave} home={home} clique={clique} videoStyling={videoStyling}
          updateTempPostsCliqueAddSave={addCliqueSave} updateTempPostsCliqueRemoveSave={removeCliqueSave} 
          updateTempPostsRemoveSave={removeHomeSave}/>
         {item.item.mentions && item.item.mentions.length > 0 ?
          <TouchableOpacity onPress={() => navigation.navigate('Mention', {mentions: item.item.mentions, friends: friends, requests: requests})}>
            <MaterialCommunityIcons name='at' size={Dimensions.get('screen').height / 37.5} style={{alignSelf: 'center', paddingLeft: 2.5, paddingTop: 2.5}} color={"#fafafa"}/>
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
           : null}
          {item.item.post[0].image || item.item.post[0].text ?
          <>
           <View style={styles.postFooter}>
                  <View style={styles.buttonContainer}>
                    <LikeButton videoStyling={videoStyling} item={item} user={user} updateTempPostsAddLike={addHomeLike} friends={friends} requests={requests} 
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
          <SaveButton item={item} user={user} updateTempPostsAddSave={addHomeSave} home={home} clique={clique} videoStyling={videoStyling}
          updateTempPostsCliqueAddSave={addCliqueSave} updateTempPostsCliqueRemoveSave={removeCliqueSave} 
          updateTempPostsRemoveSave={removeHomeSave}/>

          {item.item.mentions && item.item.mentions.length > 0 ?
          <TouchableOpacity onPress={() => navigation.navigate('Mention', {mentions: item.item.mentions, friends: friends, requests: requests})}>
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
      
      <TouchableOpacity style={styles.buyThemeContainer} onPress={!post ? () => buyThemeFunction(item.item.background, item.item.userId) : null}>
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
   else if (item.item.post != null && item.item.post.length == 1 && item.item.post[0].video) {
    return (
    <>
        <View style={item.index == 0 ? [styles.ultimateVideoContainer, {marginTop: 0}] : styles.ultimateVideoContainer} key={item.item.id}>
    {/* <FastImage resizeMode='stretch' source={item.item.background ? {uri: item.item.background} : require('../assets/Default_theme.jpg')} > */}
     <TouchableOpacity activeOpacity={1} style={{flex: 1}} onLongPress={() => openMenu(item.item)}>
      <View style={styles.captionPosting}>
            {!item.item ? <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} /> :
            
            <Suspense fallback={ <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />}>
              <LazyVideo 
                videoRef={videoRef}
                style={styles.video}
                source={item.item.post[0].post}
                shouldPlay={item.index == activeIndex && focused && !isPaused ? true : false}
                onPlaybackStatusUpdate={status => setStatus(() => status)}  
              />
              
            </Suspense> 
        }
          
            </View>
            <View style={item.item.caption ? {flexDirection: 'row', marginTop: '-20%', width: '90%', marginLeft: '5%', justifyContent: 'flex-start'} : {flexDirection: 'row', marginTop: '-17.5%', width: '90%', justifyContent: 'flex-start', marginLeft: '5%'}}>
            {item.item.pfp ? <FastImage source={{uri: item.item.pfp, priority: 'normal'}} style={{height: Dimensions.get('screen').height / 30.36, width: Dimensions.get('screen').height / 30.36, borderRadius: 8}}/> : 
          <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: Dimensions.get('screen').height / 30.36, width: Dimensions.get('screen').height / 30.36, borderRadius: 8}}/>
          }
          <View style={{flexDirection: 'row', width: '70%'}}>
            <TouchableOpacity onPress={item.item.userId != user.uid ? () => navigation.navigate('ViewingProfile', {name: item.item.userId, viewing: true}) : () => navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})}>
              <Text numberOfLines={1} style={[styles.addText, {marginRight: 'auto', fontSize: Dimensions.get('screen').height / 54.95}]}>@{item.item.username}</Text>
            </TouchableOpacity>
            {!item.item.blockedUsers.includes(user.uid) ? item.item.loading ? <View style={styles.rightAddContainer}>
            <ActivityIndicator color={"#9edaff"}/> 
            </View> :
            <FollowButtons username={username} user={user} item={item} ogUsername={ogUsername} smallKeywords={smallKeywords} largeKeywords={largeKeywords} style={{marginTop: 5}}/> : null
   }
          </View>
            {!reportedPosts.includes(item.item.id) ? 
          <TouchableOpacity style={styles.menuContainer}>
            <Menu visible={item.item.reportVisible}
                    onDismiss={() => closeMenu(item.item)}
                    contentStyle={{backgroundColor: theme.backgroundColor, alignSelf: 'center', borderWidth: 1, borderColor: "#71797E"}}
                    anchor={<Entypo name='dots-three-vertical' size={25} color={"transparent"} onPress={null}/>}>
                  <Menu.Item title="Report" titleStyle={{color: "#fafafa"}} onPress={() => navigation.navigate('ReportPage', {id: item.item.id, theme: false, comment: null, cliqueId: null, post: true, video: true, comments: false, message: false, cliqueMessage: false, reportedUser: item.item.userId})}/>
            </Menu>
          
            </TouchableOpacity>
            : null }
          </View> 
          {item.item.post[0].video ? item.item.caption.length > 0 ? 
            <TouchableOpacity style={styles.videoCaptionContainer} onPress={() => setFocusedPost(item.item)}>
              <Text numberOfLines={1} style={{color: "#fafafa", fontSize: Dimensions.get('screen').height / 54.95, width: '80%'}}><Text style={styles.usernameCaption}>{item.item.username}</Text> 
              {`${edit ? caption ? item.item.caption : item.item.caption : item.item.caption}`}</Text>
          </TouchableOpacity> : null : null}
            {
            <View style={item.item.mentions && item.item.mentions.length > 0 ? {flexDirection: 'column', marginTop: '-64%', width: 100, marginLeft: '80%', justifyContent: 'flex-end'} : {flexDirection: 'column', marginTop: '-50%', width: 100, marginLeft: '80%', justifyContent: 'flex-end'} }>
              <LikeButton videoStyling={videoStyling} item={item} user={user} updateTempPostsAddLike={addHomeLike} friends={friends} requests={requests} 
                updateTempPostsRemoveLike={removeHomeLike}/>
          <View style={styles.videoButton}>
          <TouchableOpacity onPress={() => setFocusedPost(item.item)}>
            <MaterialCommunityIcons name='message-outline' size={Dimensions.get('screen').height / 30.61}color={"#fafafa"} style={{alignSelf: 'center'}}/>
          </TouchableOpacity>
          <Text style={styles.postFooterText}>{item.item.comments > 999 && item.item.comments < 1000000 ? `${item.item.comments / 1000}k` : item.item.comments > 999999 ? `${item.item.comments / 1000000}m` : item.item.comments}</Text>
          </View>
          {!item.item.private ? 
          <TouchableOpacity onPress={() => navigation.navigate('SendingModal', {payload: item.item, payloadUsername: item.item.username, video: true, theme: false})} style={styles.videoButton}>
            <Ionicons name='arrow-redo-outline' color={"#fafafa"}  size={Dimensions.get('screen').height / 27.67} style={styles.sendingVideo}/>
          </TouchableOpacity> : null}
          <SaveButton item={item} user={user} updateTempPostsAddSave={addHomeSave} home={home} clique={clique} videoStyling={videoStyling}
          updateTempPostsCliqueAddSave={addCliqueSave} updateTempPostsCliqueRemoveSave={removeCliqueSave} 
          updateTempPostsRemoveSave={removeHomeSave}/>
          {item.item.mentions && item.item.mentions.length > 0 ?
          <TouchableOpacity onPress={() => navigation.navigate('Mention', {mentions: item.item.mentions, friends: friends, requests: requests})}>
            <MaterialCommunityIcons name='at' size={Dimensions.get('screen').height / 37.5} style={{alignSelf: 'center', paddingLeft: 2.5, paddingTop: 2.5}} color={"#fafafa"}/>
          </TouchableOpacity>
          : null}
          </View>}
        {/* </FastImage> */}
        
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
            <FollowButtons username={username} user={user} item={item} ogUsername={ogUsername} smallKeywords={smallKeywords} largeKeywords={largeKeywords} style={styles.addContainer}/> : null
   }
          </View> 
          <Text style={styles.standardPostText}>{item.item.caption}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Post', {post: item.item.post.id, requests: requests, name: user.uid, groupId: null, video: false})} activeOpacity={1} style={styles.repostContainer}>
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
                    <LikeButton videoStyling={videoStyling} item={item} user={user} updateTempPostsAddLike={addHomeLike} friends={friends} requests={requests} 
                    updateTempPostsRemoveLike={removeHomeLike}/>
          <View style={styles.commentContainer}>
          <TouchableOpacity onPress={() => setFocusedPost(item.item)}>
            <MaterialCommunityIcons name='message-outline' size={26} color={theme.color} style={{alignSelf: 'center'}}/>
          </TouchableOpacity>
          <Text style={styles.postFooterText}>{item.item.comments > 999 && item.item.comments < 1000000 ? `${item.item.comments / 1000}k` : item.item.comments > 999999 ? `${item.item.comments / 1000000}m` : item.item.comments}</Text>
          </View>
          <SaveButton item={item} user={user} updateTempPostsAddSave={addHomeSave} home={home} clique={clique} videoStyling={videoStyling}
          updateTempPostsCliqueAddSave={addCliqueSave} updateTempPostsCliqueRemoveSave={removeCliqueSave} 
          updateTempPostsRemoveSave={removeHomeSave}/>
          {item.item.mentions && item.item.mentions.length > 0 ?
          <TouchableOpacity onPress={() => navigation.navigate('Mention', {mentions: item.item.mentions, friends: friends, requests: requests})}>
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
      
      <TouchableOpacity style={styles.buyThemeContainer} onPress={!post ? () => buyThemeFunction(item.item.background, item.item.userId) : null}>
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
          notificationToken={notificationToken} username={username} background={background} pfp={pfp}/>
      {focusedPost != null && commentModal ? 
    <CommentsModal commentModal={commentModal} videoStyling={videoStyling} closeCommentModal={() => setCommentModal(false)} deleteReply={deleteReply} 
    postNull={() => setFocusedPost(null)} user={user} username={username} reportedComments={reportedComments} focusedPost={focusedPost}
    ableToShare={ableToShare} pfp={pfp} notificationToken={notificationToken} blockedUsers={blockedUsers}/> : null}
    {actualData.length > 0 ? 
          <Carousel
          width={Dimensions.get('screen').width}
          data={actualData}
          vertical
          height={videoStyling ? Dimensions.get('screen').height * 0.8 : Dimensions.get('screen').height * 0.85}
          ref={flatListRef}
          renderItem={renderItem}
          loop={false}
          onSnapToItem={(index) => {setActiveIndex(index); setActivePostIndex(0);
            }}
          style={{minHeight: '70%'}}
          
            /> : <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
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
    ultimateVideoContainer: {
      shadowColor: "#000000",
      elevation: 20,
      shadowOffset: {width: 2, height: 3},
      shadowOpacity: 0.5,
      shadowRadius: 1,
      backgroundColor: "#121212",
      height: '100%',
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
    video: {
      width: '100%',
      height: '100%',
      backgroundColor: "#121212"
    },
    videoContainer: {
      height: '85%', 
      width: '94.5%', 
      padding: 5,
      marginLeft: '2.5%'
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
    videoPostHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: '-50%',
      zIndex: 3,
      marginLeft: '15%',
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
    captionPosting: {
      height: '100%',
      width: '100%'
    },
    captionContainer: {
      width: '90%',
      marginLeft: '5%',
      marginTop: '2.5%',
      marginBottom: '1.5%',
      backgroundColor: "#121212"
    },
    videoCaptionContainer: {
      width: '100%',
      marginLeft: '5%',
    },
    menuContainer: {
      marginTop: '2.5%',
      marginLeft: 'auto',
      borderRadius: 8,
      marginRight: '-5%',
      alignSelf: 'center'
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
paginationDot: {
    width: 10,
    height: 10,
    margin: 2.5,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderWidth: 0.5,
    borderColor: "#fafafa"
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
    videoButton: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: .5,
      shadowRadius: 3.84,
      elevation: 5,
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
    sendingVideo: {
      alignSelf: 'center', 
      marginLeft: '2.5%', 
      paddingVertical: 5, 
      paddingTop: 2.5
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
    videoPfp: {
      height: Dimensions.get('screen').height / 37, 
      width: Dimensions.get('screen').height / 37, 
      borderRadius: 8
    }
})