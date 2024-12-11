import { StyleSheet, Text, View, ActivityIndicator} from 'react-native'
import React, {useState, useEffect, useRef, useCallback, useContext} from 'react'
import { Provider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { query, onSnapshot, getDocs, collection, where, addDoc, increment, serverTimestamp, doc, updateDoc, getDoc, deleteDoc, startAfter, orderBy, limit, setDoc, arrayUnion, arrayRemove} from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import { db } from '../firebase';
import {BACKEND_URL} from "@env"
import FastImage from 'react-native-fast-image';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash'
import themeContext from '../lib/themeContext';
import PostComponent from '../Components/PostComponent';
import FirstTimeModal from '../Components/FirstTimeModal';
const Vidz = ({route}) => {
  const videoRef = useRef(null);
  const [smallKeywords, setSmallKeywords] = useState([]);
    const [largeKeywords, setLargeKeywords] = useState([]);
  const cliqueId = null;
  const [isPaused, setIsPaused] = useState(false);
  const [posts, setPosts] = useState([]);
  const [reloadPage, setReloadPage] = useState(true);
  const [reportComment, setReportComment] = useState(null);
  const [postDone, setPostDone] = useState(false);
  const [reportNotificationToken, setReportNotificationToken] = useState(null);
  const [tempPosts, setTempPosts] = useState([]);
  const [reportCommentModal, setReportCommentModal] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [background, setBackground] = useState(null);
  const [forSale, setForSale] = useState(false)
  const [loading, setLoading] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [commentDone, setCommentDone] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState(null);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [lastRecommendedPost, setLastRecommendedPost] = useState(null);
  const [reportedContent, setReportedContent] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const theme = useContext(themeContext);
  const [meet, setMeet] = useState(true);
  const [friends, setFriends] = useState([]);
  const [lastVisible, setLastVisible] = useState();
  const [username, setUsername] = useState('');
  const [searching, setSearching] = useState(false)
  const [notificationToken, setNotificationToken] = useState('');
     const textInputRef = useRef(null);
    const [ableToShare, setAbleToShare] = useState(true);
    const [comments, setComments] = useState([])
    const [status, setStatus] = useState({})
    const [activeIndex, setActiveIndex] = useState(0);
    const [pfp, setPfp] = useState(null);
    const [focusedPost, setFocusedPost] = useState(null);
    const [replyToReplyFocus, setReplyToReplyFocus] = useState(false);
    const [focused, setFocused] = useState(false);
  const {user} = useAuth();
  const [friendList, setFriendList] = useState(user ? [user.uid] : []); 
    const [messageNotifications, setMessageNotifications] = useState([]);
    
//console.log(reloading)
useEffect(() => {
  if (route.params?.reloading) {
    //console.log('first')
    setPosts([]);
      setActiveIndex(0)
      setReloadPage(true)
  }
}, [route.params?.reloading])
    
    
    //console.log(firstTime)
    useEffect(() => {
      if (route.params?.firstTime) {
        //console.log('first')
        setIsFirstTime(false)
      }
    }, [route.params?.firstTime])
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
  const triggerAudio = async(ref) => {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true})
    }
    useEffect(() => {
      if (status.isPlaying) triggerAudio(videoRef);
      /* if (status.isPlaying === false) {
          setIsPaused(true);
        } */
  }, [videoRef, status.isPlaying]);
  useEffect(() => {
    const fetchProfileData = async () => {
      const profileData = await getProfileDetails(user.uid);

      if (profileData) {
        setUsername(profileData.username);
        setPfp(profileData.pfp);
        setPrivacy(profileData.private);
        setSmallKeywords(profileData.smallKeywords);
        setLargeKeywords(profileData.largeKeywords);
        setFollowing(profileData.following);
        setForSale(profileData.forSale);
        setBackground(profileData.postBackground);
        setBlockedUsers(profileData.blockedUsers);
        setNotificationToken(profileData.notificationToken);
      }
    };

    fetchProfileData();
  }, [user?.uid]);
  useEffect(() => {
    let unsub;
    //const reportedMessages = (await getDoc(doc(db, 'profiles', user.uid))).data().reportedMessages
     unsub = onSnapshot(doc(db, "profiles", user.uid), (doc) => {
          setReportedPosts(doc.data().reportedPosts)
          setReportedComments(doc.data().reportedComments)
          setMessageNotifications(doc.data().messageNotifications)
    });
    return unsub;
  }, [onSnapshot])
    useEffect(()=> {
      let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'friends'), where('actualFriend', '==', true)), (snapshot) => {
          setFriends(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            //info: doc.data().info
          })))
          snapshot.docs.map((doc) => {
            setFriendList(prevState=> [...prevState, doc.id])
          })
          /* setFriendList(prevState => [...prevState, snapshot.docs.map((doc) => (
            doc.id
          ))]) */
        })
      } 
      fetchCards();
      return unsub;
    }, []);
    
    useEffect(() => {
      if (meet && reloadPage && blockedUsers != null) {

        setTempPosts([])
        setPostDone(false)
        let fetchedCount = 0;
        new Promise(resolve => {
          const fetchCards = async () => {
            const q = query(collection(db, 'videos'), where('private', '==', false), orderBy('timestamp', 'desc'), limit(3));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              if (blockedUsers.includes(doc.data().userId) || doc.data().blockedUsers.includes(user.uid)) {
                  fetchedCount++; // Increment blocked count
                } else {
                  setTempPosts(prevState => [...prevState, { id: doc.id, loading: false, postIndex: 0, ...doc.data() }]);
                }
                
            });
            if (fetchedCount === 3 && tempPosts.length === 0) {
              // All 3 posts were blocked, fetch more
              const nextQuery = query(
                collection(db, 'videos'),
                where('private', '==', false),
                orderBy('timestamp', 'desc'),
                startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
                limit(3)
              );
              const nextSnapshot = await getDocs(nextQuery);
              nextSnapshot.forEach((doc) => {
                setTempPosts(prevState => [...prevState, { id: doc.id, loading: false, postIndex: 0, ...doc.data() }]);
              })
            }

            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
          }
          fetchCards();
           resolve(); // Resolve the Promise after setCompleteMessages is done
      }).finally(() => {setLoading(false); setPostDone(true); setReloadPage(false)}); 
          
      }
      
    }, [meet, posts, reloadPage, blockedUsers])
    //console.log(tempPosts.length)
    /* useMemo(() => {
      if (postDone) {
        //console.log('s')
        tempPosts.map(async(item) => {
          setSemiFinalPosts(prevState => [...prevState, {postIndex: 0, ...item}])
        })
        setTimeout(() => {
          setCompletePostDone(true)
          setTempPosts([]);
          setReloadPage(false)
        }, 1000);
      }
    }, [postDone]) */
    //console.log(tempPosts.length)
   /*  useEffect(() => {
      if (tempPosts.length > 0) {
        const uniqueValuesSet = new Set();
        const newItems = tempPosts.filter((item) => !prevDataRef.current.includes(item));
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
       
    }, [tempPosts]) */
    //console.log(pfps)
  //console.log(dataToSend)

  //console.log(recommendedPosts.recomms)
  /* useEffect(() => {
    if(completePosts.length > 0) {
      completePosts.map((item) => {
        //console.log(item)
        fetch(`${BACKEND_URL}/api/recommendPostsView`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.uid, postId: item.id
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
      })
    }
  }, [completePosts]) */
  const deleteItem = async(item) => {
    setCommentDone(false)
    const updatedObject = { ...item };
      const objectIndex = comments.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...comments];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setComments(updatedData);
    }
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
    const objectIndex = tempPosts.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        const updatedData = [...tempPosts];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        setTempPosts(updatedData);
      }
    })
    
    }
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
  //console.log(tempPosts.length)
  function fetchMoreData() {
      if (recommendedPosts.length < 30) {
      if (lastVisible != undefined && meet) {
    setLoading(true)
    let newData = [];
    let fetchedCount = 0;
      const fetchCards = async () => {
        newData = [];
        const q = query(collection(db, 'videos'), where('private', '==', false), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(4));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              if (blockedUsers.includes(doc.data().userId) || doc.data().blockedUsers.includes(user.uid)) {
                fetchedCount++;
              }
              else {
                newData.push({
                    id: doc.id,
                    postIndex: 0,
                    loading: false,
                    ...doc.data()
                  })
              }
                
              
            });
            if (fetchedCount === 4 && newData.length === 0) {
              // All 3 posts were blocked, fetch more
              const nextQuery = query(
                collection(db, 'videos'),
                where('private', '==', false),
                orderBy('timestamp', 'desc'),
                startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
                limit(4)
              );
              const nextSnapshot = await getDocs(nextQuery);
              nextSnapshot.forEach((doc) => {
                newData.push({
                    id: doc.id,
                    postIndex: 0,
                    loading: false,
                    ...doc.data()
                  })
              })
            }
            if (newData.length > 0) {
                setTempPosts([...tempPosts, ...newData])
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
              }
      }
      fetchCards();
        setTimeout(() => {
          setLoading(false)
        }, 1000);
    }
    }
    else {
      //console.log('first')
      setLoading(true)
    const getRecommendations = async() => {
      await fetch(`${BACKEND_URL}/api/getMoreRecommendedPosts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({userId: user.uid, recommId: lastRecommendedPost})
          })
        .then(response => response.json())
        .then(responseData => {
          if (responseData.recomms) {
            //console.log(responseData.recomms)
            responseData.recomms.map((e) => {
              setRecommendedPosts(prevState => [...prevState, e.id])
              setLastRecommendedPost(responseData.recommId)
            })
            //setRecommendedPosts(responseData.recomms)
          }
          //console.log(responseData)
          // Handle the response from the server
          
        })
        .catch(error => {
          // Handle any errors that occur during the request
          console.error(error);
        })
    }
    setTimeout(() => {
      setLoading(false)
    }, 1000);
    getRecommendations()
    }
    
  }
  //console.log(friendList)
  async function schedulePushMentionNotification(id, username, notificationToken, comment) {
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    if (notis) {
      //console.log(notificationToken)
      fetch(`${BACKEND_URL}/api/mentionCommentNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, pushToken: notificationToken,  "content-available": 1, comment: comment, data: {routeName: 'NotificationScreen', deepLink: 'nucliqv1://NotificationScreen'}
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
  async function schedulePushLikeNotification(id, username, notificationToken) {
    //console.log(username)
    //console.log(notificationToken)
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    let banned = (await getDoc(doc(db, 'profiles', id))).data().banned
      if (notis && !banned) {
      //console.log(notificationToken)
      fetch(`${BACKEND_URL}/api/likeNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, pushToken: notificationToken,  "content-available": 1, data: {routeName: 'NotificationScreen', deepLink: 'nucliqv1://NotificationScreen'},
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
  async function removeLike(item) {
    setCommentDone(false)
  const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.likedBy = item.likedBy.filter((e) => e != user.uid)
      const objectIndex = comments.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...comments];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setComments(updatedData);
    }
    
        await updateDoc(doc(db, 'videos', focusedPost.id, 'comments', item.id), {
      likedBy: arrayUnion(user.uid)
    })
    

  }
  ///console.log(tempPosts[7])
  async function addHomeLike(item, likedBy) {
    //console.log(item)
    const updatedObject = { ...item };

    // Update the array in the copied object
    
    //console.log(updatedObject)
    //console.log(Object.keys(item))
   
      if (item.username == username && !likedBy.includes(user.uid)&& !updatedObject.likedBy.includes(user.uid) ) {
        
        updatedObject.likedBy = [...item.likedBy, user.uid];
      const objectIndex = tempPosts.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...tempPosts];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setTempPosts(updatedData);
    }
       await setDoc(doc(db, 'profiles', user.uid, 'likes', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    }).then(async() =>
      await updateDoc(doc(db, 'videos', item.id), {
      likedBy: arrayUnion(user.uid)
    }))
    
    }
    else if (!likedBy.includes(user.uid) && !updatedObject.likedBy.includes(user.uid)) {
      updatedObject.likedBy = [...item.likedBy, user.uid];
      const objectIndex = tempPosts.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...tempPosts];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setTempPosts(updatedData);
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
    console.log(data)
    if (data.done) {

      schedulePushLikeNotification(item.userId, username, item.notificationToken)
    }
      }
      catch (e) {
        console.error(e);
        
      }
        
    }
  }
  async function removeHomeLike(item) {
    //console.log(item)
    const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.likedBy = item.likedBy.filter((e) => e != user.uid)
    const objectIndex = tempPosts.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...tempPosts];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setTempPosts(updatedData);
    }
    await updateDoc(doc(db, 'videos', item.id), {
      likedBy: arrayRemove(user.uid)
    }).then(async() => await deleteDoc(doc(db, 'profiles', user.uid, 'likes', item.id)))
    

  }
  async function addLike(item) {
    setCommentDone(false)
  const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.likedBy = [...item.likedBy, user.uid];
      const objectIndex = comments.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...comments];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setComments(updatedData);
    }
    if (username != focusedPost.username) {
      //schedulePushCommentLikeNotification(item.user, username, item.notificationToken, item.comment)
        await updateDoc(doc(db, 'videos', focusedPost.id, 'comments', item.id), {
      likedBy: arrayUnion(user.uid)
    }).then(async() => 
    
    addDoc(collection(db, 'profiles', item.user, 'notifications'), {
      like: false,
                                  comment: true,
                                  likedComment: true,
                                  friend: false,
                                  video: true,
                                  item: item.comment,
                                  request: false,
                                  acceptRequest: false,
                                  postId: focusedPost.id,
                                  theme: false,
                                  report: false,
                                  requestUser: user.uid,
                                  requestNotificationToken: item.notificationToken,
                                  likedBy: item.username,
                                  timestamp: serverTimestamp()
    })
    )
    }
    else {
        await updateDoc(doc(db, 'videos', focusedPost.id, 'comments', item.id), {
      likedBy: arrayUnion(user.uid)
    })
    }
    
    
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
    function getCalculatedTime(time) {
    if (time != null) {
  const currentTimestamp = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
  const timeDifference = currentTimestamp - time.seconds;
  //console.log(currentTimestamp)
  //console.log(timeDifference)
    //console.log(time)
  const secondsInMinute = 60;
  const secondsInHour = 60 * secondsInMinute;
  const secondsInDay = 24 * secondsInHour;
  const secondsInMonth = 30 * secondsInDay;
  const secondsInYear = 365 * secondsInDay;
  //console.log(timeDifference)
  if (timeDifference < secondsInMinute) {
    return `${timeDifference} second${timeDifference !== 1 ? 's' : ''} ago`;
  } else if (timeDifference < secondsInHour) {
    const minutes = Math.floor(timeDifference / secondsInMinute);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (timeDifference < secondsInDay) {
    const hours = Math.floor(timeDifference / secondsInHour);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (timeDifference < secondsInMonth) {
    const days = Math.floor(timeDifference / secondsInDay);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else if (timeDifference < secondsInYear) {
    const months = Math.floor(timeDifference / secondsInMonth);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(timeDifference / secondsInYear);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
}
    }
  useEffect(() => {
  if (textInputRef.current && replyToReplyFocus) { 
    textInputRef.current.focus();
  }
}, [replyToReplyFocus]);
  //console.log(focusedPost)
  useEffect(() => {
      if (focusedPost != null && !cliqueId) {
        const getData = async() => {
          const docSnap = await getDoc(doc(db, 'videos', focusedPost.id))
          if (!docSnap.exists()) {
            setAbleToShare(false)
          }
        }
        getData()
      }
    }, [focusedPost])
  function skipWalkthrough() {
    const check = async() => {
      await AsyncStorage.setItem('isFirstTime', 'false');
      setIsFirstTime(false)
    }
    check()
  }
  const handleLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    console.log(height)
  };
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

  return (
    <Provider>
      <View style={styles.container}>
        <FirstTimeModal isFirstTime={isFirstTime} vidz={true} closeFirstTimeModal={() => setIsFirstTime(false)}/>
        <View style={styles.innerContainer} onLayout={handleLayout}>
          <View style={styles.headerContainer}>
            <View style={{marginTop: '3%'}}>
              <FastImage source={require('../assets/DarkMode5.png')} style={styles.logo}/>
            </View>
            <Text style={{fontSize: 37.5, fontWeight: '200', color: theme.theme != 'light' ? "#9EDAFF" : "#005278", marginLeft: '6%'}}>|</Text>
            <Text numberOfLines={1} style={[styles.header, { fontFamily: 'Montserrat_500Medium', color: theme.theme != 'light' ? "#9EDAFF" : "#005278", backgroundColor: theme.backgroundColor}]}>{"Vidz For You"}</Text>
          </View>
        </View>
        {postDone && user && tempPosts.length > 0 ? <>
        <PostComponent data={tempPosts} forSale={forSale} background={background} home={true} loading={loading} lastVisible={lastVisible} 
        actualClique={null} videoStyling={true} cliqueIdPfp={null} cliqueIdName={null} post={null} blockedUsers={blockedUsers}
        openPostMenu={null} clique={false} cliqueId={null} pfp={pfp} ogUsername={username} admin={false} edit={false} caption={null} 
        notificationToken={notificationToken} smallKeywords={smallKeywords} largeKeywords={largeKeywords} reportedPosts={reportedPosts}
        reportedComments={reportedComments} privacy={privacy}/>
        </>
        : loading && !lastVisible ? 
        <View style={{alignItems: 'center', flex: 1, backgroundColor: theme.backgroundColor, justifyContent: 'center'}}>
          <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={"large"}/> 
        </View> 
        : !searching ? 
        <View style={{alignItems: 'center', flex: 1, backgroundColor: theme.backgroundColor, justifyContent: 'center'}}>
          <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={"large"}/> 
        </View> : null}
      </View>
    </Provider>
  )
}

export default Vidz

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212'
  },
  innerContainer: {
      marginTop: '8%',
      marginBottom: '2.5%',
      marginLeft: '15.85%',
      marginRight: '9%',
      justifyContent: 'space-evenly',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: "#121212"
    },
    headerContainer: {
      flexDirection: 'row', 
      alignItems: 'center'
    },
    header: {
      fontSize: 19.20,
      fontFamily: 'Montserrat_500Medium',
      color: "#9EDAFF",
      padding: 10,
      paddingLeft: 0,
      marginTop: 8,
      alignSelf: 'center',
      width: '60%',
      marginLeft: '5%',
    },
    logo: {
      height: 27.5, 
      width: 68.75
    }
})