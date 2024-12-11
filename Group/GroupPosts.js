import { StyleSheet, Text, View, Image, TouchableOpacity, Platform, Modal, TextInput, TouchableHighlight, Keyboard, Alert, ActivityIndicator, Dimensions} from 'react-native'
import React, {useState, useRef, useCallback, useEffect, useMemo, useContext, lazy, Suspense} from 'react'
import Carousel from 'react-native-reanimated-carousel'
import {MaterialCommunityIcons, Entypo, MaterialIcons, Ionicons, FontAwesome} from '@expo/vector-icons';
import { Menu } from 'react-native-paper';
import useAuth from '../Hooks/useAuth';
import FollowingIcon from '../Components/FollowingIcon';
import FollowIcon from '../Components/FollowIcon';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import FastImage from 'react-native-fast-image'
import { updateDoc, doc, addDoc, setDoc, collection, serverTimestamp, Timestamp, arrayUnion, orderBy, startAfter, limit, arrayRemove, deleteDoc, query, where, getDocs, increment, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FlatList } from 'react-native-gesture-handler';
import RequestedIcon from '../Components/RequestedIcon';
import {BACKEND_URL, MODERATION_API_SECRET, MODERATION_API_USER, TEXT_MODERATION_URL} from "@env"
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import BuyThemeIcon from '../Components/BuyThemeIcon';
import GetThemeIcon from '../Components/GetThemeIcon';
import FreeThemeIcon from '../Components/FreeThemeIcon';
import { Audio } from 'expo-av';
import {Divider} from 'react-native-paper';
import { useFonts, Montserrat_500Medium, Montserrat_700Bold, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import NextButton from '../Components/NextButton';
import { KeyboardAvoidingView } from 'react-native';
import axios from 'axios';
import ThemeHeader from '../Components/ThemeHeader';
import generateId from '../lib/generateId';
import * as Haptics from  'expo-haptics';
import _ from 'lodash'
import themeContext from '../lib/themeContext';
import {ResumableZoom} from "react-native-zoom-toolkit"
import Gallery from 'react-native-awesome-gallery';
import Pinchable from 'react-native-pinchable'
import Video from '../Components/Video'
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
    () => (isActive ? [styles.paginationDot, {backgroundColor: "#fafafa", borderColor: "#fafafa"}] : [styles.paginationDot, {backgroundColor: "#121212", borderColor: "#fafafa"}]),
    [isActive]
  ); // Memoize the style calculation
  
  return <View style={dotStyle} />;
}, (prevProps, nextProps) => prevProps.isActive === nextProps.isActive);
const GroupPosts = ({route}) => {
    const navigation = useNavigation();
    const {group, admin, username, blockedUsers, newPost, postId} = route.params;
    const [loading, setLoading] = useState(true);
    const imageZoomRef = useRef(null);
    const postImageZoomRef = useRef(null);
    const [activePostIndex, setActivePostIndex] = useState(0);
    const [friendInfo, setFriendInfo] = useState([]);
    const [isZoomModalVisible, setIsZoomModalVisible] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [requests, setRequests] = useState([]);
    const [imageUri, setImageUri] = useState(null);
    const [completePostDone, setCompletePostDone] = useState(false);
    const [notificationToken, setNotificationToken] = useState(null);
    const [semiFinalPosts, setSemiFinalPosts] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const theme = useContext(themeContext)
    const [replyLastVisible, setReplyLastVisible] = useState(0);
    const [posts, setPosts] = useState([]);
    const [reportComment, setReportComment] = useState(null);
    const [reportNotificationToken, setReportNotificationToken] = useState(null);
    const [reportCommentModal, setReportCommentModal] = useState(false);
    const [reportedContent, setReportedContent] = useState([]);
    const [reportedPosts, setReportedPosts] = useState([]);
    const [reportedComments, setReportedComments] = useState([]);
    const [finishedReporting, setFinishedReporting] = useState(false);
    const [userRequests, setUserRequests] = useState([]);
    const [commentSearching, setCommentSearching] = useState(false);
    const [friends, setFriends] = useState([]);
    const edit = false;
    const clique = true;
    const [newPosts, setNewPosts] = useState([]);
    const [done, setDone] = useState(false);
    const [commentMentions, setCommentMentions] = useState([]);
    const [actualNewPost, setNewPost] = useState({id: null});
    const {user} = useAuth();
    const flatListRef = useRef(null);
     const videoRef = useRef(null);
     const textInputRef = useRef(null);
    const [newComment, setNewComment] = useState('');
    const [ableToShare, setAbleToShare] = useState(true);
    const [snapDirection, setSnapDirection] = useState('left')
    const [addingReply, setAddingReply] = useState(false);
    const [comments, setComments] = useState([])
    let row = [];
    const [filtered, setFiltered] = useState([]);
    let prevOpenedRow;
    const [postDone, setPostDone] = useState(false);
    const [searchKeywords, setSearchKeywords] = useState([]);
    const [commentTempId, setCommentTempId] = useState(null);
    const [replies, setReplies] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [commentDone, setCommentDone] = useState(false);
    const [lastCommentVisible, setCommentsLastVisible] = useState(null);
    const [status, setStatus] = useState({})
    const [activeIndex, setActiveIndex] = useState(0);
    const [singleCommentLoading, setSingleCommentLoading] = useState(false);
    const [tempReplyName, setTempReplyName] = useState();
    const [tempReplyId, setTempReplyId] = useState('');
    const [usernames, setUsernames] = useState([]);
    const [pfp, setPfp] = useState(null);
    const [tapCount, setTapCount] = useState(0);
    const [postNotifications, setPostNotifications] = useState([]);
    const [reply, setReply] = useState('');
    const [focusedPost, setFocusedPost] = useState(null);
    const timerRef = useRef(null);
    const [replyToReplyFocus, setReplyToReplyFocus] = useState(false);
    const [replyFocus, setReplyFocus] = useState(false);
    const [focused, setFocused] = useState(false);
    const [commentModal, setCommentModal] = useState(false);
    //console.log(group)
    useEffect(() => {
      if (route.params?.newPost) {
        const getData = async() => {
       const docSnap = await getDoc(doc(db, 'groups', group.id, 'posts', route.params?.postId))
      setLoading(true)
      if (docSnap.exists()) {
       setNewPost({id: docSnap.id, ...docSnap.data()})
      }
       
      }
      getData()
      }
    }, [route.params?.newPost])
    useEffect(() => {
        if (newPosts.length > 0) {
          console.log(newPosts[0])
        }
    }, [newPosts])
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
    //console.log(newPost)
    //console.log(group.id)
    //console.log(actualNewPost)
    useEffect(()=> {
      let unsub;
      const fetchCards = async () => {
        //const passes = await getDocs(collection(db, 'users', user.uid, 'passes')).then((snapshot) => snapshot.docs.map((doc) => doc.id));
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'requests'), where('actualRequest', '==', true)), (snapshot) => {
          setUserRequests(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
            //info: doc.data().info
          })))
        })
      } 
      fetchCards();
      return unsub;
    }, []);
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
    /* useEffect(() => {
      if (friends && newComment.includes('@') && /(?<=^|\s)@$/.test(newComment) && friendInfo.length ==0) {
        setCommentsLoading(true)
        friends.map((item) => {
        //console.log(item)
        let unsub;
      const fetchCards = () => {
        unsub = onSnapshot(query(doc(db, 'profiles', item.id)), (snapshot) => {
          setFriendInfo(prevState => [...prevState, {id: snapshot.id, ...snapshot.data()}])
        })
      }
      fetchCards();
      setTimeout(() => {
        setCommentsLoading(false)
      }, 1000);
      return unsub;
      })
      }
    }, [newComment, friends]) */
    /* useEffect(() => {
      setFiltered([]);
      if (newComment.length > 0 && newComment.includes('@') && friendInfo.length > 0) {
      setCommentSearching(true)
      const atIndex = newComment.lastIndexOf('@');
      //if(newComment.length > 1 && newComment.includes('@'))
      const temp = newComment.substring(atIndex + 1).toLowerCase()
      const tempList = friendInfo.filter(item => {
        //console.log(item)
        if (item.userName.toLowerCase().match(temp) || item.firstName.toLowerCase().match(temp)) {
          //console.log(temp)
          return item
        } 
      })
      setFiltered(tempList)
    }
    else {
      setFiltered([])
    }
    }, [newComment, friendInfo]) */
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
    useMemo(() => {
      if (actualNewPost.id != null) {
        setPosts([actualNewPost])
        let unsub;
      let fetchedCount = 0;
      const fetchCards = async() => {
        const q = query(collection(db, 'groups', group.id, 'posts'), orderBy('timestamp', 'desc'), limit(3));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              if (blockedUsers.includes(doc.data().userId) && actualNewPost.id !== doc.id) {
                  fetchedCount++; // Increment blocked count
                } else if (actualNewPost.id !== doc.id) {
                  setPosts(prevState => [...prevState, { id: doc.id, postIndex: 0, ...doc.data() }]);
                }
            });
            if (fetchedCount === 3 && posts.length === 0) {
              // All 3 posts were blocked, fetch more
              const nextQuery = query(
                collection(db, 'groups', group.id, 'posts'),
                orderBy('timestamp', 'desc'),
                startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
                limit(3)
              );
              const nextSnapshot = await getDocs(nextQuery);
              nextSnapshot.forEach((doc) => {
                setPosts(prevState => [...prevState, { id: doc.id, postIndex: 0, ...doc.data() }]);
              })
            }
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
      }
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
      return unsub;
      }
      else {
        let unsub;
        let fetchedCount = 0;
      const fetchCards = async() => {
        const q = query(collection(db, 'groups', group.id, 'posts'), orderBy('timestamp', 'desc'), limit(3));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              if (blockedUsers.includes(doc.data().userId)) {
                  fetchedCount++; // Increment blocked count
                } else {
                  setPosts(prevState => [...prevState, { id: doc.id, postIndex: 0, ...doc.data() }]);
                }
            });
            if (fetchedCount === 3 && posts.length === 0) {
              // All 3 posts were blocked, fetch more
              const nextQuery = query(
                collection(db, 'groups', group.id, 'posts'),
                orderBy('timestamp', 'desc'),
                startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
                limit(3)
              );
              const nextSnapshot = await getDocs(nextQuery);
              nextSnapshot.forEach((doc) => {
                setPosts(prevState => [...prevState, { id: doc.id, postIndex: 0, ...doc.data() }]);
              })
            }
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
      }
      fetchCards();
      setTimeout(() => {
        setPostDone(true)
        setLoading(false)
      }, 1000);
      return unsub;
      }
        
      
    }, [actualNewPost, blockedUsers])
    //)
    //console.log(posts)
    async function schedulePushReportNotification() {
      let notis = (await getDoc(doc(db, 'profiles', reportComment.user))).data().allowNotifications
      if (notis) {
     fetch(`${BACKEND_URL}/api/reportNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pushToken: reportNotificationToken, post: focusedPost, cliqueMessage: false, message: false, comment: reportComment, "content-available": 1, data: {routeName: 'NotificationScreen', deepLink: 'nucliqv1://NotificationScreen'}
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
    function fetchMoreData () {
    if (lastVisible != undefined) {
      //console.log('first')
    setLoading(true)
    let unsub;
let newData = [];
let fetchedCount = 0;
      const fetchCards = async () => {
        newData = [];
        
        const q = query(collection(db, 'groups', group.id, 'posts'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(4));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              if (blockedUsers.includes(doc.data().userId && actualNewPost.id != doc.id)) {
                fetchedCount++;
                
              }
              else if (actualNewPost.id != doc.id) {
                newData.push({
                    id: doc.id,
                    reportVisible: false,
                    postIndex: 0,
                    ...doc.data()
                  })
              }
              
            });
            if (fetchedCount === 4 && newData.length === 0) {
              // All 3 posts were blocked, fetch more
              const nextQuery = query(
                collection(db, 'groups', group.id, 'posts'),
                orderBy('timestamp', 'desc'),
                startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
                limit(4)
              );
              const nextSnapshot = await getDocs(nextQuery);
              nextSnapshot.forEach((doc) => {
                newData.push({
                    id: doc.id,
                    reportVisible: false,
                    postIndex: 0,
                    ...doc.data()
                  })
              })
            }
            if (newData.length > 0) {
                setPosts(prevState => [...prevState, ...newData])
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
              }
      }
      setTimeout(() => {
                  setLoading(false)
                }, 1000);
      fetchCards();
      return unsub;
    }
  }
      /* const handleHashtagCallback = (dataToSend) => {
    setHashTagItem(dataToSend)
  } */
  //console.log(hashTagItem)
  /* useMemo(() => {
    setLoading(true);
      if (hashTagItem.length > 0) {
        setPosts([]);
        let unsub;
        const fetchCards = async () => {
          const q = query(collection(db, 'hashtags'), where('hashtagClique', '==', hashTagItem), where('cliqueId', '==', group.id), orderBy('timestamp', 'desc'), limit(3));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              if (!blockedUsers.includes(doc.data().userId)) {
                setHashTagPosts(prevState => [...prevState, {id: doc.id, ...doc.data()}])
              }
            });
            setHashtagLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
        } 
        fetchCards();
        setTimeout(() => {
          setDone(true);
        }, 1000);
        return unsub;
      }
    }, [hashTagItem]) */
    //console.log(hashTagSearch)
    /* useMemo(() => {
      if (hashTagPosts.length > 0 && done && actualNewPost.id != null) {
        if (actualNewPost.caption.match(/#[^\s]+/g)) {
        setPosts([actualNewPost])
        let unsub;
        hashTagPosts.map((item) => {
          
        const fetchCards = async () => {
          const docSnap = await getDoc(doc(db, 'groups', group.id, 'posts', item.postId));
          if (!blockedUsers.includes(docSnap.data().userId) && !posts.some(doc2 => doc2.id === docSnap.id) && actualNewPost.id != docSnap.id) {
              setPosts(prevState => [...prevState, {id: docSnap.id, ...docSnap.data()}])
              //newArray.push({id: snapshot.id, ...snapshot.data()})
              //prevDataRef.current = newArray
            }
        } 
        fetchCards();
        setTimeout(() => {
          setLoading(false)
        }, 1000);
        return unsub;
          //console.log(item)
        })
      }
    }
    else if (done && hashTagItem.length > 0) {
      let unsub;
        hashTagPosts.map((item) => {
          
        const fetchCards = async () => {
          const docSnap = await getDoc(doc(db, 'groups', group.id, 'posts', item.postId));
          if (!blockedUsers.includes(docSnap.data().userId) && !posts.some(doc2 => doc2.id === docSnap.id)) {
              setPosts(prevState => [...prevState, {id: docSnap.id, ...docSnap.data()}])
              //newArray.push({id: snapshot.id, ...snapshot.data()})
              //prevDataRef.current = newArray
            }
        } 
        fetchCards();
        setTimeout(() => {
          setLoading(false)
        }, 1000);
        return unsub;
          //console.log(item)
        })
    }
    }, [hashTagPosts, done, actualNewPost]) */
    
    const openMenuFunctionCallback = (dataToSend) => {
    setReportedItem(dataToSend.item)
    setReportModalVisible(true); 
    
  }
  const handleVideoCallback = (dataToSend) => {
    setVideoModalVisible(true)
    setVideo(dataToSend)
  }
  const openMenuCallback = (dataToSend) => {
    openMenu(dataToSend)
  }
  const closeMenuCallback = (dataToSend) => {
    closeMenu(dataToSend)
  }
  const openMenu = (editedItem) => {
        if (group.admins.includes(user.uid)) {
        const editedItemIndex = posts.findIndex((item) => item.id === editedItem.id);
      //console.log(editedItemIndex)
      const newData = [...posts];
      newData[editedItemIndex] = {
        ...newData[editedItemIndex],
        reportVisible: true
      }
      setPosts(newData);
      }
      else {
        const editedItemIndex = posts.findIndex((item) => item.id === editedItem.id);
      //console.log(editedItemIndex)
      const newData = [...posts];
      newData[editedItemIndex] = {
        ...newData[editedItemIndex],
        reportVisible: true
      }
      setPosts(newData);
      }
      
    }
    const closeMenu = (editedItem) => {
        if (group.admins.includes(user.uid)) {
        const editedItemIndex = posts.findIndex((item) => item.id === editedItem.id);
      //console.log(editedItemIndex)
      const newData = [...posts];
      newData[editedItemIndex] = {
        ...newData[editedItemIndex],
        reportVisible: false
      }
      setPosts(newData);
      }
      else {
        const editedItemIndex = posts.findIndex((item) => item.id === editedItem.id);
      //console.log(editedItemIndex)
      const newData = [...posts];
      newData[editedItemIndex] = {
        ...newData[editedItemIndex],
        reportVisible: false
      }
      setPosts(newData);
      }
      
    }
    
    //console.log(route.name)
    //console.log(group.idName)
    //console.log(data.length)
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
    //console.log(posts.length)
    useMemo(() => {
      const getData = async() => {
        const docSnap = await getDoc(doc(db, 'profiles', user.uid))
        setPfp(docSnap.data().pfp)
        setNotificationToken(docSnap.data().notificationToken)
        setSearchKeywords(docSnap.data().searchKeywords)
      }
      getData();
    }, [])
    useEffect(() => {
      let unsub;
    //const reportedMessages = (await getDoc(doc(db, 'profiles', user.uid))).data().reportedMessages
     unsub = onSnapshot(doc(db, "profiles", user.uid), (doc) => {
          setReportedPosts(doc.data().reportedPosts)
        setReportedComments(doc.data().reportedComments)
    });
    return unsub;
    }, [onSnapshot])
    useEffect(() => {
      if (focusedPost != null && !group.id) {
        const getData = async() => {
          const docSnap = await getDoc(doc(db, 'posts', focusedPost.id))
          if (!docSnap.exists()) {
            setAbleToShare(false)
          }
        }
        getData()
      }
    }, [focusedPost])
    useEffect(() => {
      if (group.id && focusedPost != null) {
        //console.log(group.id)
        const getData = async() => {
          const docSnap = await getDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id))
          if (!docSnap.exists()) {
            setAbleToShare(false)
          }
        }
        getData()
      }
    }, [group.id, focusedPost])
    useEffect(() => {
      const getUsernames = async() => {
        (await getDocs(collection(db, 'usernames'))).forEach((doc) => {
          setUsernames(prevState  => [...prevState, doc.data().username])
        })
      }
      getUsernames()
    }, [])
    useEffect(() => {
    if (focusedPost != null) {
      setCommentModal(true)
      setLoading(true)
      
             let unsub;
             let fetchedCount = 0;
      const fetchCards = async () => {
        const q = query(collection(db, 'groups', group.id, 'posts', focusedPost.id, 'comments'), orderBy('timestamp', 'desc'), limit(10));
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
                collection(db, 'groups', group.id, 'posts', focusedPost.id, 'comments'),
                orderBy('timestamp', 'desc'),
                startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
                limit(10)
              );
              const nextSnapshot = await getDocs(nextQuery);
              nextSnapshot.forEach((doc) => {
                setComments(prevState => [...prevState, {id: doc.id, showReply: false, loading: false, ...doc.data()}])
              })
            }
            setCommentsLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
      } 
      fetchCards();
      return unsub;
    }
  }, [focusedPost])
  //console.log(commentsLoading)
    const triggerAudio = async(ref) => {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true})
    }
    useEffect(() => {
      if (status.isPlaying) triggerAudio(videoRef);
      if (status.isPlaying === false) {
          setIsPaused(true);
        }
  }, [videoRef, status.isPlaying]);
    async function schedulePushRequestFriendNotification(id, username, notificationToken) {
      let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
      if (notis) {
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
  async function schedulePushFriendNotification(id, username, notificationToken) {
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    if (notis) {
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
  //console.log(newComment)
  async function schedulePushMentionNotification(id, username, notificationToken, comment) {
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    const deepLink = `nucliqv1://GroupChannels?id=${group.id}&group=${group}&person=${id}&pfp=${group.pfp}&name=${group.name}`;
    let cliqNotis = (await getDoc(doc(db, 'groups', group.id))).data().allowPostNotifications
      if (notis && cliqNotis.includes(id)) {
      //console.log(notificationToken)
      fetch(`${BACKEND_URL}/api/mentionCommentNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, pushToken: notificationToken,  "content-available": 1, comment: comment, name: group.name, data: {routeName: 'GroupChannels', id: group.id, group: group, person: id, pfp: group.pfp, deepLink: deepLink, name: group.name},
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
  async function addNewComment(){
  if (!ableToShare) {
    Alert.alert('Post unavailable to comment')
        setReply('')
        setReplyFocus(false)
  }
  else {
    setSingleCommentLoading(true)
    data = new FormData();
    data.append('text', newComment);
    data.append('lang', 'en');
    data.append('mode', 'standard');
    data.append('api_user', `${MODERATION_API_USER}`);
    data.append('api_secret', `${MODERATION_API_SECRET}`);
    axios({
    url: `${TEXT_MODERATION_URL}`,
    method:'post',
    data: data,
    })
    .then(async function (response) {
      if (response.data) {
                if (response.data.link.matches.length > 0) {
                    linkUsernameAlert()
                }

                else if (response.data.profanity.matches.length > 0 && response.data.profanity.matches.some(obj => obj.intensity === 'high')) {
                  
                    profanityUsernameAlert()
                
                }
                
                else {
                        if (username != focusedPost.username) {
                        const docRef = await addDoc(collection(db, 'groups', group.id, 'posts', focusedPost.id, 'comments'), {
                              comment: newComment,
                              pfp: pfp,
                              notificationToken: notificationToken,
                              username: username,
                              timestamp: serverTimestamp(),
                              likedBy: [],
                              replies: [],
                              user: user.uid,
                              postId: focusedPost.id
                          })
                          
                              await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id), {
                                  comments: increment(1)
                              }).then(() => setComments([...comments, {id: docRef.id, comment: newComment, showReply: false, loading: false,
                                            pfp: pfp,
                                            notificationToken: notificationToken,
                                            username: username,
                                            timestamp: Timestamp.fromDate(new Date()),
                                            likedBy: [],
                                            replies: [],
                                            user: user.uid,
                                            postId: focusedPost.id}])).then(() => {const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = posts.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        const updatedData = [...posts];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        setPosts(updatedData);
      }}).then(commentMentions.map(async(e) => {
                        schedulePushMentionNotification(e.id, username, e.notificationToken, newComment)
                        await setDoc(doc(db, 'groups', group.id, 'notifications', e.id, 'notifications', docRef.id), {
                                      like: false,
                                  comment: false,
                                  friend: false,
                                  item: newComment,
                                  request: false,
                                  mention: true,
                                  acceptRequest: false,
                                  theme: false,
                                  postId: focusedPost.id,
                                  report: false,
                                  requestUser: user.uid,
                                  requestNotificationToken: focusedPost.notificationToken,
                                  likedBy: username,
                                  timestamp: serverTimestamp()
                                    }).then(() => addDoc(collection(db, 'groups', group.id, 'notifications', e.id, 'checkNotifications'), {
                                        userId: e.id
                                      }))                                 
                      })).then(commentMentions.length == 0 ? async() => await setDoc(doc(db, 'groups', group.id, 'notifications', focusedPost.userId, 'notifications', docRef.id), {
                                  like: false,
                                  comment: true,
                                  item: newComment,
                                  friend: false,
                                  request: false,
                                  acceptRequest: false,
                                  postId: focusedPost.id,
                                  theme: false,
                                  report: false,
                                  requestUser: user.uid,
                                  requestNotificationToken: focusedPost.notificationToken,
                                  likedBy: username,
                                  timestamp: serverTimestamp()
                            }) : null).then(commentMentions.length == 0 ? () => addDoc(collection(db, 'groups', group.id, 'notifications', focusedPost.userId, 'checkNotifications'), {
      userId: focusedPost.userId
    }) : null).then(async() => await setDoc(doc(db, 'groups', group.id, 'profiles', user.uid, 'comments', docRef.id), {
                              comment: newComment,
                              username: username, 
                              timestamp: serverTimestamp(),
                              user: user.uid,
                              postId: focusedPost.id,
                            })).then(commentMentions.length == 0 ? () => schedulePushCommentNotification(focusedPost.userId, username, focusedPost.notificationToken, newComment): null).then(() => setNewComment('')).then(() => setSingleCommentLoading(false))
                        }
                        else {
                          const docRef = await addDoc(collection(db, 'groups', group.id, 'posts', focusedPost.id, 'comments'), {
                              comment: newComment,
                              pfp: pfp,
                              notificationToken: notificationToken,
                              username: username,
                              timestamp: serverTimestamp(),
                              likedBy: [],
                              replies: [],
                              user: user.uid,
                              postId: focusedPost.id
                          })
                          console.log(docRef.id)
                              await setDoc(doc(db, 'groups', group.id, 'profiles', user.uid, 'comments', docRef.id), {
                              comment: newComment,
                              username: username, 
                              timestamp: serverTimestamp(),
                              user: user.uid,
                              postId: focusedPost.id,
                            }).then(() => setComments([...comments, {id: docRef.id, comment: newComment, showReply: false, loading: false,
                                            pfp: pfp,
                                            notificationToken: notificationToken,
                                            username: username,
                                            timestamp: Timestamp.fromDate(new Date()),
                                            likedBy: [],
                                            replies: [],
                                            user: user.uid,
                                            postId: focusedPost.id}])).then(() => {const updatedObject = { ...focusedPost };
    
    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = posts.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        const updatedData = [...posts];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        setPosts(updatedData);
      }}).then(commentMentions.map(async(e) => {
                        schedulePushMentionNotification(e.id, username, e.notificationToken, newComment)
                        await setDoc(doc(db, 'groups', group.id, 'notifications', e.id, 'notifications', docRef.id), {
                                      like: false,
                                  comment: false,
                                  friend: false,
                                  item: newComment,
                                  request: false,
                                  mention: true,
                                  acceptRequest: false,
                                  theme: false,
                                  postId: focusedPost.id,
                                  report: false,
                                  requestUser: user.uid,
                                  requestNotificationToken: focusedPost.notificationToken,
                                  likedBy: username,
                                  timestamp: serverTimestamp()
                                    }).then(() => addDoc(collection(db, 'groups', group.id, 'notifications', e.id, 'checkNotifications'), {
                                        userId: e.id
                                      }))                                 
                        
                      })).then(async() => await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id), {
                                  comments: increment(1)
                              })).then(() => setNewComment('')).then(() => setSingleCommentLoading(false))
                      
                        
                      
                      }
                    
                }
                //console.log(data)
                
            }
    
    // on success: handle response
    //console.log(response.data);
    })
    .catch(function (error) {
    // handle error
    console.log(error)
    });

  }
        //console.log(newComment)
    }

  async function addFriend(item) {
    let newFriend = generateId(item.userId, user.uid)
    let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/addFriend'
    try {
    const response = await fetch(url, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, newFriend: newFriend, user: user.uid, username: username, searchKeywords: searchKeywords}}), // Send data as needed
    })
    const data = await response.json();
      if (data.request) {
        schedulePushRequestFriendNotification(item.userId, username, item.notificationToken)
      }
      else if (data.friend) {
        schedulePushFriendNotification(item.userId, username, item.notificationToken)
      }
  } catch (error) {
    console.error('Error:', error);
  }
  }
  async function addCliqueSave(item) {
    const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.savedBy = [...item.savedBy, user.uid];
    await updateDoc(doc(db, 'groups', group.id, 'posts', item.id), {
      savedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'groups', group.id, 'profiles', user.uid, 'saves', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    })).then(() => {
      const objectIndex = posts.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...posts];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setPosts(updatedData);
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
    const objectIndex = posts.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...posts];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setPosts(updatedData);
    }
      await updateDoc(doc(db, 'groups', group.id, 'posts', item.id), {
      likedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'groups', group.id, 'profiles', user.uid, 'likes', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    }))
    }
    else if (!likedBy.includes(user.uid) && !updatedObject.likedBy.includes(user.uid)) {
      updatedObject.likedBy = [...item.likedBy, user.uid];
    const objectIndex = posts.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...posts];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setPosts(updatedData);
    }
      await updateDoc(doc(db, 'groups', group.id, 'posts', item.id), {
      likedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'groups', group.id, 'profiles', user.uid, 'likes', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    })).then(async() => await setDoc(doc(db, 'groups', group.id, 'notifications', item.userId, 'notifications', item.id), {
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
    })).then(() => addDoc(collection(db, 'groups', group.id, 'notifications', item.userId, 'checkNotifications'), {
        userId: user.uid
      })).then(() => schedulePushLikeNotification(item.userId, username, item.notificationToken))
    }
  }
}
  async function addCliqueLike(item, likedBy) {
    const updatedObject = { ...item };

    // Update the array in the copied object
    
    if(item.username == username && !likedBy.includes(user.uid) && !updatedObject.likedBy.includes(user.uid)) {
      //console.log('sec')
      updatedObject.likedBy = [...item.likedBy, user.uid];
    
      const objectIndex = posts.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...posts];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setPosts(updatedData);
    }
      await updateDoc(doc(db, 'groups', group.id, 'posts', item.id), {
      likedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'groups', group.id, 'profiles', user.uid, 'likes', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    }))
    }
    else if (!likedBy.includes(user.uid) && !updatedObject.likedBy.includes(user.uid)) {
      updatedObject.likedBy = [...item.likedBy, user.uid];
    
      const objectIndex = posts.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...posts];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setPosts(updatedData);
    }
      await updateDoc(doc(db, 'groups', group.id, 'posts', item.id), {
      likedBy: arrayUnion(user.uid)
    }).then(async() => await setDoc(doc(db, 'groups', group.id, 'profiles', user.uid, 'likes', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    })).then(async() => await setDoc(doc(db, 'groups', group.id, 'notifications', item.userId, 'notifications', item.id), {
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
    })).then(() => addDoc(collection(db, 'groups', group.id, 'notifications', item.userId, 'checkNotifications'), {
        userId: user.uid
      })).then(() => schedulePushLikeNotification(item.userId, username, item.notificationToken))
    }
  }

  async function removeCliqueLike(item) {
    const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.likedBy = item.likedBy.filter((e) => e != user.uid)
    const objectIndex = posts.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...posts];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setPosts(updatedData);
    }
    await updateDoc(doc(db, 'groups', group.id, 'posts', item.id), {
      likedBy: arrayRemove(user.uid)
    }).then(async() => await deleteDoc(doc(db, 'groups', group.id, 'profiles', user.uid, 'likes', item.id)))

  }
  async function removeCliqueSave(item) {
    const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.savedBy = item.savedBy.filter((e) => e != user.uid)
    const objectIndex = posts.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...posts];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setPosts(updatedData);
    }
    await updateDoc(doc(db, 'groups', group.id, 'posts', item.id), {
      savedBy: arrayRemove(user.uid)
    }).then(async() => await deleteDoc(doc(db, 'groups', group.id, 'profiles', user.uid, 'saves', item.id)))

  }
  async function removeFriend(friendId) {
    let newFriend = generateId(friendId, user.uid)
    let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/removeFriend'
    Alert.alert('Are you sure you want to unfollow?', 'If you unfollow, you will be unable to message them and they will be unable to message you.', [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
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
  } catch (error) {
    console.error('Error:', error);
  }},
  }]);
    
  }
  function fetchMoreCommentData () {
    if (lastCommentVisible != undefined) {
        
        setDone(false)
    let newData = [];
    let fetchedCount= 0;
      const fetchCards = async () => {
        const q = query(collection(db, 'groups', group.id, 'posts',  focusedPost.id, 'comments'), orderBy('timestamp', 'desc'), startAfter(lastCommentVisible), limit(10));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              if (blockedUsers.includes(doc.data().userId)) {
                fetchedCount++;
                
              }
              else {
                newData.push({
                    id: doc.id,
                    showReply: false,
                    loading: false,
                    ...doc.data()
                  })
              }
            });
            if (fetchedCount === 10 && newData.length === 0) {
              // All 3 posts were blocked, fetch more
              const nextQuery = query(
                collection(db, 'groups', group.id, 'posts', focusedPost.id, 'comments'),
                orderBy('timestamp', 'desc'),
                startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
                limit(10)
              );
              const nextSnapshot = await getDocs(nextQuery);
              nextSnapshot.forEach((doc) => {
                newData.push({
                    id: doc.id,
                    showReply: false,
                    loading: false,
                    ...doc.data()
                  })
              })
            }
            if (newData.length > 0) {
                setCommentsLoading(true)
                setComments([...comments, ...newData])
                setDone(true)
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
              }
      }
      fetchCards();
      setTimeout(() => {
        setCommentsLoading(false)
      }, 1000);
      
    
    }
  }
  function fetchMoreReplyData(e) {
    if (replyLastVisible != undefined) {
        //console.log('sec')
        let unsub;
        let newData = []
      const fetchCards = async () => {
        const q = query(collection(db, 'groups', group.id, 'posts', focusedPost.id, 'comments', e.id, 'replies'), orderBy('timestamp', 'asc'), startAfter(replyLastVisible), limit(3));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              if (!blockedUsers.includes(doc.data().userId)) {
                newData.push({
                    id: doc.id,
                    commentId: e.id,
                    loading: false,
                    ...doc.data()
                  })
              }
              
              
            });
            if (newData.length > 0) {
              setReplies([...replies, ...newData])
                setReplyLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
              }
            else {
              setReplyLastVisible(null)
            }
            //console.log(newData)
            
      }
      fetchCards();
      return unsub;
    
    }
  }
    async function schedulePushCommentNotification(id, username, notificationToken, comment) {
    //console.log(username)
    //console.log(notificationToken)
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    const deepLink = `nucliqv1://GroupChannels?id=${group.id}&group=${group}&person=${id}&pfp=${group.pfp}&name=${group.name}`;
     let cliqNotis = (await getDoc(doc(db, 'groups', group.id))).data().allowPostNotifications
      if (notis && cliqNotis.includes(id)) {
      fetch(`${BACKEND_URL}/api/commentNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, pushToken: notificationToken, "content-available": 1, data: {routeName: 'GroupChannels', deepLink: deepLink, id: group.id, group: group, person: id, pfp: group.pfp, name: group.name,}, comment: comment
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
  async function schedulePushCommentLikeNotification(id, username, notificationToken, comment) {
    //console.log(username)
    //console.log(notificationToken)
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    const deepLink = `nucliqv1://GroupChannels?id=${group.id}&group=${group}&person=${id}&pfp=${group.pfp}&name=${group.name}`;
    let cliqNotis = (await getDoc(doc(db, 'groups', group.id))).data().allowPostNotifications
      if (notis && cliqNotis.includes(id)) {
      fetch(`${BACKEND_URL}/api/likeCommentNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, pushToken: notificationToken, "content-available": 1, data: {routeName: 'GroupChannels', deepLink: deepLink, id: group.id, group: group, person: id, pfp: group.pfp, name: group.name,},  comment: comment
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
  async function schedulePushCommentReplyNotification(id, username, notificationToken, comment) {
    //console.log(username)
    //console.log(notificationToken)
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    const deepLink = `nucliqv1://GroupChannels?id=${group.id}&group=${group}&person=${id}&pfp=${group.pfp}&name=${group.name}`;
      let cliqNotis = (await getDoc(doc(db, 'groups', group.id))).data().allowPostNotifications
      if (notis && cliqNotis.includes(id)) {
      fetch(`${BACKEND_URL}/api/replyNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, pushToken: notificationToken, "content-available": 1, "content-available": 1, data: {routeName: 'GroupChannels', deepLink: deepLink, id: group.id, group: group, person: id, pfp: group.pfp, name: group.name,}, comment: comment
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

async function addNewReply(){
  if (!ableToShare) {
    Alert.alert('Post unavailable to reply')
  }
  else {
  setAddingReply(true)
  setSingleCommentLoading(true)
  data = new FormData();
    data.append('text', reply);
    data.append('lang', 'en');
    data.append('mode', 'standard');
    data.append('api_user', `${MODERATION_API_USER}`);
    data.append('api_secret', `${MODERATION_API_SECRET}`);
    axios({
    url: `${TEXT_MODERATION_URL}`,
    method:'post',
    data: data,
    })
    .then(async function (response) {
      if (response.data) {
                if (response.data.link.matches.length > 0) {
                    linkUsernameAlert()
                }

                else if (response.data.profanity.matches.length > 0 && response.data.profanity.matches.some(obj => obj.intensity === 'high')) {
                  
                    profanityUsernameAlert()
                
                }
                
                else {
  const commentDocSnap = await getDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id, 'comments', tempReplyId))
  const newReply = {reply: reply,
            pfp: pfp,
            notificationToken: notificationToken,
            username: username,
            replyToComment: true,
            timestamp: Timestamp.fromDate(new Date()),
            likedBy: [],
            postId: focusedPost.id,
            user: user.uid}
  if (commentDocSnap.exists() && username != commentDocSnap.data().username) {
    schedulePushCommentReplyNotification(commentDocSnap.data().user, username, commentDocSnap.data().notificationToken, reply)
        await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id, 'comments', tempReplyId), {
          replies: arrayUnion(newReply)
        }).then(async() =>
            await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id), {
                comments: increment(1)
            })).then(() =>  {
              const updatedData = comments.filter((e) => e.id == tempReplyId)
              const newObject = {reply: reply,
                commentId: tempReplyId,
                loading: false,
            pfp: pfp,
            notificationToken: notificationToken,
            username: username,
            replyToComment: true,
            timestamp: Timestamp.fromDate(new Date()),
            likedBy: [],
            postId: focusedPost.id,
            user: user.uid}
            // Add the new object to the array
            updatedData[0].replies = [...updatedData[0].replies, newObject]
            const objectInd = comments.findIndex(obj => obj.id === tempReplyId)
            const dataUpdated = [...comments];
            dataUpdated[objectInd] = updatedData[0];
            setComments(dataUpdated)
            }).then(() => {const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = posts.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        console.log(objectIndex)
        const updatedData = [...posts];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        setPosts(updatedData);
      }}).then(() => addDoc(collection(db, 'groups', group.id, 'notifications', commentDocSnap.data().user, 'notifications'), {
                                  like: false,
                                  reply: true,
                                  friend: false,
                                  item: reply,
                                  request: false,
                                  acceptRequest: false,
                                  postId: focusedPost.id,
                                  theme: false,
                                  report: false,
                                  requestUser: user.uid,
                                  requestNotificationToken: focusedPost.notificationToken,
                                  likedBy: username,
                                  timestamp: serverTimestamp()
                            })).then(() => addDoc(collection(db, 'groups', group.id, 'notifications', commentDocSnap.data().user, 'checkNotifications'), {
      userId: user.uid
    })).then(() => setReply('')).then(() => setReplyFocus(false)).then(() => setSingleCommentLoading(false))

  }
  else if (commentDocSnap.exists()) {
        await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id, 'comments', tempReplyId), {
            replies: arrayUnion(newReply)
        }).then(async() => 
            await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id), {
                comments: increment(1)
            })).then(() =>  {
              const updatedData = comments.filter((e) => e.id == tempReplyId)
              const newObject = {reply: reply,
                commentId: tempReplyId,
                loading: false,
            pfp: pfp,
            notificationToken: notificationToken,
            username: username,
            replyToComment: true,
            timestamp: Timestamp.fromDate(new Date()),
            likedBy: [],
            postId: focusedPost.id,
            user: user.uid}
            // Add the new object to the array
            updatedData[0].replies = [...updatedData[0].replies, newObject]
            const objectInd = comments.findIndex(obj => obj.id === tempReplyId)
            const dataUpdated = [...comments];
            dataUpdated[objectInd] = updatedData[0];
            setComments(dataUpdated)
            }).then(() => {const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = posts.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        console.log(objectIndex)
        const updatedData = [...posts];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        setPosts(updatedData);
      }}).then(() => setReply('')).then(() => setReplyFocus(false)).then(() => setSingleCommentLoading(false))
        //console.log(newComment)
    
  }
  else {
        Alert.alert('Post unavailable to comment')
        setReply('')
        setReplyFocus(false)
        setSingleCommentLoading(fals)
    }
  }}})
}
  }
async function addNewReplyToReply(){
if (!ableToShare) {
    Alert.alert('Post unavailable to reply')
  }
  else {
  setAddingReply(true)
  setSingleCommentLoading(true)
  data = new FormData();
    data.append('text', reply);
    data.append('lang', 'en');
    data.append('mode', 'standard');
    data.append('api_user', `${MODERATION_API_USER}`);
    data.append('api_secret', `${MODERATION_API_SECRET}`);
    axios({
    url: `${TEXT_MODERATION_URL}`,
    method:'post',
    data: data,
    })
    .then(async function (response) {
      if (response.data) {
                if (response.data.link.matches.length > 0) {
                    linkUsernameAlert()
                }

                else if (response.data.profanity.matches.length > 0 && response.data.profanity.matches.some(obj => obj.intensity === 'high')) {
                  
                    profanityUsernameAlert()
                
                }
                
                else {
  const commentSnap = await getDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id, 'comments', commentTempId))
  const newReply = {
    reply: reply,
            pfp: pfp,
            notificationToken: notificationToken,
            username: username,
            replyToComment: false,
            replyTo: tempReplyName,
            timestamp: Timestamp.fromDate(new Date()),
            likedBy: [],
            postId: focusedPost.id,
            user: user.uid
  }
  if (commentSnap.exists() && commentSnap.data().username != username) {
    schedulePushCommentReplyNotification(commentSnap.data().user, username, commentSnap.data().notificationToken, reply)
        await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id, 'comments', commentTempId), {
            replies: arrayUnion(newReply)
        }).then(async() => 
            await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id), {
                comments: increment(1)
            })).then(() =>  {
              const updatedData = comments.filter((e) => e.id == commentTempId)
              const newObject = {reply: reply,
                commentId: tempReplyId,
                loading: false,
            pfp: pfp,
            notificationToken: notificationToken,
            username: username,
            replyToComment: false,
            replyTo: tempReplyName,
            timestamp: Timestamp.fromDate(new Date()),
            likedBy: [],
            postId: focusedPost.id,
            user: user.uid}
            // Add the new object to the array
            updatedData[0].replies = [...updatedData[0].replies, newObject]
            const objectInd = comments.findIndex(obj => obj.id === commentTempId)
            const dataUpdated = [...comments];
            dataUpdated[objectInd] = updatedData[0];
            setComments(dataUpdated)
            }).then(() => {const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = posts.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        console.log(objectIndex)
        const updatedData = [...posts];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        setPosts(updatedData);
      }}).then(() =>  addDoc(collection(db, 'groups', group.id, 'notifications', commentSnap.data().user, 'notifications'), {
      like: false,
                                  reply: true,
                                  friend: false,
                                  item: reply,
                                  request: false,
                                  acceptRequest: false,
                                  postId: focusedPost.id,
                                  theme: false,
                                  report: false,
                                  requestUser: user.uid,
                                  requestNotificationToken: focusedPost.notificationToken,
                                  likedBy: username,
                                  timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'groups', group.id, 'notifications', commentSnap.data().user, 'checkNotifications'), {
      userId: focusedPost.userId
    })).then(() => setReply('')).then(() => setReplyFocus(false)).then(() => setSingleCommentLoading(false))
  }
  else if (commentSnap.exists()) {
        await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id, 'comments', commentTempId), {
            replies: arrayUnion(newReply)
        }).then(async() => 
            await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id), {
                comments: increment(1)
            })).then(() =>  {
              const updatedData = comments.filter((e) => e.id == commentTempId)
              const newObject = {reply: reply,
                commentId: tempReplyId,
                loading: false,
            pfp: pfp,
            notificationToken: notificationToken,
            username: username,
            replyToComment: false,
            replyTo: tempReplyName,
            timestamp: Timestamp.fromDate(new Date()),
            likedBy: [],
            postId: focusedPost.id,
            user: user.uid}
            // Add the new object to the array
            updatedData[0].replies = [...updatedData[0].replies, newObject]
            const objectInd = comments.findIndex(obj => obj.id === commentTempId)
            const dataUpdated = [...comments];
            dataUpdated[objectInd] = updatedData[0];
            setComments(dataUpdated)
            }).then(() => {const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = posts.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        console.log(objectIndex)
        const updatedData = [...posts];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        setPosts(updatedData);
      }}).then(() => setReply('')).then(() => setReplyFocus(false)).then(() => setSingleCommentLoading(false)).then(() => commentRecommendPost())
  }
  else {
        Alert.alert('Post unavailable to comment')
        setReply('')
        setReplyFocus(false)
        setSingleCommentLoading(false)
    }
  }}})
}
        
        //console.log(newComment)
    }
     async function removeLike(item) {
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
        await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id, 'comments', item.id), {
      likedBy: arrayRemove(user.uid)
    })
    
  }
  //console.log(replyFocus)
  //console.log(tempReplyId)
  

  const deleteItem = async(item) => {
    console.log(item)
    const updatedObject = { ...item };
      const objectIndex = comments.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...comments];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setComments(updatedData);
    }
      await setDoc(doc(db, 'deletedCliqueComments', item.id), {
        cliqueId: group.id,
        postId: focusedPost.id,
        user: item.user,
        username: item.username,
        info: item,
        timestamp: serverTimestamp()
      }).then(async() => 
      await deleteDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id, 'comments', item.id))).then(async()=> await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id), {
                                                comments: increment(-1)
                                            })).then(async() => await deleteDoc(doc(db, 'groups', group.id, 'profiles', user.uid, 'comments', item.id))).then(() => 
    setComments(comments.filter(e => e.id != item.id))).then(() => {
      const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments - 1;
    const objectIndex = posts.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        const updatedData = [...posts];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        setPosts(updatedData);
      }
    })
    
    }
  const deleteReply = async(item, reply) => {
      await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id, 'comments', item.id), {
        replies: arrayRemove(reply)
      }).then(async()=> await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id), {
                                                comments: increment(-1)
                                            })).then(() => {const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.replies = item.replies.filter((e) => e != reply)
    const objectIndex = comments.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...comments];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setComments(updatedData);
    }}).then(() => {
      const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments - 1;
    const objectIndex = posts.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        const updatedData = [...posts];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        setPosts(updatedData);
      }
    })
    
  }
  async function removeLikeReply(element) {
  const updatedObject = { ...element };

    // Update the array in the copied object
    updatedObject.likedBy = element.likedBy.filter((e) => e != user.uid)
    const objectIndex = replies.findIndex(obj => obj.id === element.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...replies];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setReplies(updatedData);
    }
        await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id, 'comments', element.commentId, 'replies', element.id), {
      likedBy: arrayRemove(user.uid)
    })
    
}
async function toggleShowReply(e) {
    setCommentDone(false)
   const updatedArray = comments.map(item => {
      if (item.id === e.id) {
        // Update the "isActive" property from false to true
        return { ...item, actualReplies: item.replies.slice(0, replyLastVisible + 2), showReply: true};
      }
      
      return item;
    });
    setReplyLastVisible(prevValue => prevValue + 2)
    setComments(updatedArray) 
  }
async function addLike(item) {
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
      
        await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id, 'comments', item.id), {
      likedBy: arrayUnion(user.uid)
    }).then(() => addDoc(doc(db, 'groups', group.id, 'notifications', item.user, 'notifications')), {
      like: false,
                                  comment: true,
                                  likedComment: true,
                                  friend: false,
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
    }).then(() => addDoc(collection(db, 'groups', group.id, 'notifications', focusedPost.userId, 'checkNotifications'), {
      userId: user.uid
    }))
    }
    else {
        await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id, 'comments', item.id), {
      likedBy: arrayUnion(user.uid)
    })
    }
    
    
  }
async function addLikeReply(element) {
  const updatedObject = { ...element };

    // Update the array in the copied object
    updatedObject.likedBy = [...element.likedBy, user.uid];
      const objectIndex = replies.findIndex(obj => obj.id === element.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...replies];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setReplies(updatedData);
    }
    if (username != focusedPost.username) {
      //schedulePushCommentLikeNotification(item.user, username, item.notificationToken, element.reply)
       await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id, 'comments', element.commentId, 'replies', element.id), {
      likedBy: arrayUnion(user.uid)
    }).then(() => addDoc(doc(db, 'groups', group.id, 'notifications', item.user, 'notifications')), {
      like: false,
                                  comment: true,
                                  friend: false,
                                  item: element.reply,
                                  request: false,
                                  acceptRequest: false,
                                  postId: focusedPost.id,
                                  theme: false,
                                  report: false,
                                  requestUser: user.uid,
                                  requestNotificationToken: item.notificationToken,
                                  likedBy: item.username,
                                  timestamp: serverTimestamp()
    }).then(() => addDoc(collection(db, 'groups', group.id, 'notifications', focusedPost.userId, 'checkNotifications'), {
      userId: user.uid
    })) 

  }
  else {
    
        await updateDoc(doc(db, 'groups', group.id, 'posts', focusedPost.id, 'comments', element.commentId, 'replies', element.id), {
      likedBy: arrayUnion(user.uid)
    })
  }
    
}
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
  const CustomCommentText = (props) => {
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
  //console.log(text)
  const onTextLayout = useCallback(e => {
    //console.log(e.nativeEvent.lines.length)
  }, []);
  //console.log(usernames)
  //console.log(props.image)
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
      <Text style={props.image ? [styles.commentText, {color: theme.color}] : [styles.commentText, { fontSize: 12.29, paddingTop: 5, color: theme.color}]}>
      {text.slice(0).map((text) => {
        //console.log(text)
        //console.log(usernames.includes(text.substring(1)))
        //substringsArray.some((substring) => searchString.includes(substring));
        if (text.startsWith('@')) {
          console.log(text)
          return (
              <Text style={text.startsWith('@') ? usernames.some((substring) => text.includes(substring)) ? {fontFamily: 'Montserrat_600SemiBold',} : null : null} 
              onPress={usernames.some((substring) => text.includes(substring)) ? () => findUser(usernames.find((substring) => text.includes(substring))) : null}>
                {text.startsWith('@') ? text.replaceAll('@', '@') : null}{' '}
              </Text>
            
          );
        }
        return `${text} `;
      })}
    </Text>
  );
};
async function buyThemeFunction(image, userId) {
    //console.log(purchased)

    if (userId == user.uid) {
        /* const querySnapshot = await getDocs(query(collection(db, 'profiles', user.uid, 'purchased'), where('images', 'array-contains', image)));
    querySnapshot.forEach((doc) => {
      if (doc.exists()) {
        navigation.navigate('SpecificTheme', {id: doc.data().productId, purchased: true, free: false})
      }
    }); */
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
  //const formattedText = text.replace()
  //console.log(posts[0].likedBy)
  async function schedulePushLikeNotification(id, username, notificationToken) {
    //console.log(username)
    //console.log(notificationToken)
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    const deepLink = `nucliqv1://GroupChannels?id=${group.id}&group=${group}&person=${id}&pfp=${group.pfp}&name=${group.name}`;
     let cliqNotis = (await getDoc(doc(db, 'groups', group.id))).data().allowPostNotifications
      if (notis && cliqNotis.includes(user.uid)) {
          fetch(`${BACKEND_URL}/api/likeNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, pushToken: notificationToken, "content-available": 1, data: {routeName: 'GroupChannels', deepLink: deepLink, id: group.id, group: group, person: id, pfp: group.pfp, name: group.name,}
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
  function onSecondPress(item) {
        setCommentsLoading(true)
        if (reportedContent.length < 10) {
      addDoc(collection(db, 'profiles', reportComment.user, 'reportedContent'), {
      content: reportComment.id,
      reason: item,
      post: focusedPost,
      comment: reportComment.comment == undefined ? reportComment.reply : reportComment.comment,
      message: false,
      cliqueMessage: false,
      timestamp: serverTimestamp()
    }).then(() => addDoc(collection(db, 'groups', group.id, 'notifications', reportComment.user, 'notifications'), {
      like: false,
comment: reportComment.comment == undefined ? reportComment.reply : reportComment.comment,
      friend: false,
      item: item,
      request: false,
      acceptRequest: false,
      theme: false,
      report: true,
      postId: focusedPost.id,
      requestUser: reportComment.user,
      requestNotificationToken: reportNotificationToken,
      post: focusedPost,
       message: false,
      cliqueMessage: false,
      likedBy: [],
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'groups', group.id, 'notifications', reportComment.user, 'checkNotifications'), {
      userId: reportComment.user
    })).then(reportComment ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedComments: arrayUnion(reportComment.id)
    }) : null).then(() => schedulePushReportNotification()).then(() => setFinishedReporting(true)).then(() => setReportCommentModal(false))
    }
    else {

      addDoc(collection(db, 'profiles', reportComment.user, 'reportedContent'), {
      content: reportComment.id,
      reason: item,
      post: focusedPost,
      comment: reportComment.comment == undefined ? reportComment.reply : reportComment.comment,
       message: false,
      cliqueMessage: false,
      timestamp: serverTimestamp()
    }).then(() => addDoc(collection(db, 'groups', group.id, 'notifications', reportComment.user, 'notifications'), {
      like: false,
comment: reportComment.comment == undefined ? reportComment.reply : reportComment.comment,
      friend: false,
      item: item,
      request: false,
      acceptRequest: false,
      theme: false,
      report: true,
      postId: focusedPost.id,
      requestUser: reportComment.user,
      requestNotificationToken: reportNotificationToken,
      post: focusedPost,
       message: false,
      cliqueMessage: false,
      likedBy: [],
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'groups', group.id, 'notifications', reportComment.user, 'checkNotifications'), {
      userId: reportComment.user
    })).then(reportComment ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedComments: arrayUnion(reportComment.id)
    }) : null).then(() => schedulePushReportNotification()).then(() => setFinishedReporting(true)).then(() => setReportCommentModal(false))
    }
    setTimeout(() => {
        setCommentsLoading(false)
    }, 1000);
    }
  //console.log(data.length)
  const renderComments = ({item, index}, onClick) => {
    //console.log(item.id)
    const closeRow = (index) => {
      console.log('closerow');
      if (prevOpenedRow && prevOpenedRow !== row[index]) {
        prevOpenedRow.close();
      }
      prevOpenedRow = row[index];
    };

    const renderRightActions = (progress, dragX, onClick) => {
      return (
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          {item.user === user.uid ? 
            <TouchableOpacity
          style={{
            margin: 0,
            alignContent: 'center',
            justifyContent: 'center',
            width: 70,
          }} onPress={() => deleteItem(item)}>
          <MaterialIcons name='delete-outline' size={35} style={{alignSelf: 'center'}} color="red"/>
        </TouchableOpacity>  : null}
        {item.user !== user.uid && !reportedComments.includes(item.id) ?
        <TouchableOpacity
          style={{
            margin: 0,
            alignContent: 'center',
            justifyContent: 'center',
            width: 70,
          }} onPress={() => {setReportCommentModal(true); setReportComment(item)}}>
          <MaterialIcons name='report' size={40} style={{alignSelf: 'center'}} color="red"/>
         <Text style={{alignSelf: 'center', color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_400Regular'}}>Report</Text>
        </TouchableOpacity> : null
    }
        </View>
      );
    };
    return (
        <Swipeable renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, onClick)
        }
        onSwipeableOpen={() => closeRow(index)}
        ref={(ref) => (row[index] = ref)}
        rightOpenValue={-100}
        enabled={item.showReply ? false : true}>
        <View style={styles.commentHeader}>
          {item.pfp ? <FastImage source={{uri: item.pfp, priority: 'normal'}} style={{height: 35, width: 35, borderRadius: 17.5}}/> :
          <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 35, width: 35, borderRadius: 17.5}}/>}
            
            <View style={styles.commentSection}>
                <TouchableOpacity onPress={item.user == user.uid ? null : () => {setCommentModal(false); navigation.navigate('ViewingProfile', {name: item.user, viewing: true})}}>
                <Text style={[styles.usernameText, {color: theme.color}]}>@{item.username}</Text>
              </TouchableOpacity>
                <CustomCommentText text={`${item.comment}`}/>
                <View style={styles.commentFooterContainer}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={[styles.dateText, {color: theme.color}]}>{getDateAndTime(item.timestamp)}</Text>
                        <TouchableOpacity style={styles.reply} onPress={() => {setReplyFocus(true); if (textInputRef.current) {
      textInputRef.current.focus();
    } setTempReplyName(item.username); setTempReplyId(item.id)}}>
                            <Text style={[styles.replyText, {color: theme.color}]}>Reply</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity style={{flexDirection: 'row'}} onPress={item.likedBy.includes(user.uid) == false ? () => {addLike(item)} : () => {removeLike(item)}}>
                            {item.likedBy.includes(user.uid) ? <MaterialCommunityIcons name='cards-heart' size={20} style={{alignSelf: 'center', paddingRight: 3}} color="red"/> : <MaterialCommunityIcons name='cards-heart-outline' size={22.5} style={{alignSelf: 'center'}} color="#808080"/>}
                        </TouchableOpacity>
                        <Text style={[styles.commentText, {alignSelf: 'center', color: theme.color}]}>{item.likedBy.length}</Text>
                    </View>
                </View>
                {item.replies.length == 1 && item.showReply == false ? <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => toggleShowReply(item)}>
                    <Text style={[styles.viewRepliesText, {color: theme.color}]}>View {item.replies.length} Reply</Text>
                    <MaterialCommunityIcons name='chevron-down' size={25} color="#808080" style={{alignSelf: 'center'}}/>
                </TouchableOpacity> : item.replies.length > 1 && item.showReply == false ? <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => toggleShowReply(item)}>
                    <Text style={[styles.viewRepliesText, {color: theme.color}]}>View {item.replies.length} Replies</Text>
                    <MaterialCommunityIcons name='chevron-down' size={25} color="#808080" style={{alignSelf: 'center'}}/>
                </TouchableOpacity> : <></>}
                {item.showReply ? 
                    <View>
                        {item.actualReplies.map((element) => {
                          const closeRow = (index) => {
                              console.log('closerow');
                              if (prevOpenedRow && prevOpenedRow !== row[index]) {
                                prevOpenedRow.close();
                              }
                              prevOpenedRow = row[index];
                            };
                            //console.log(element)
                            const renderRightActions = (progress, dragX, onClick) => {
                              return (
                                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                  {element.user === user.uid ? 
                                    <TouchableOpacity
                                  style={{
                                    margin: 0,
                                    alignContent: 'center',
                                    justifyContent: 'center',
                                    width: 70,
                                  }} onPress={() => deleteReply(item, element)}>
                                  <MaterialIcons name='delete-outline' size={35} style={{alignSelf: 'center'}} color="red"/>
                                </TouchableOpacity>  : null}
                                {element.user !== user.uid && !reportedComments.includes(element.id) ? 
                                <TouchableOpacity
                                  style={{
                                    margin: 0,
                                    alignContent: 'center',
                                    justifyContent: 'center',
                                    width: 70,
                                  }} onPress={() => {setReportCommentModal(true); setReportComment(element)}}>
                                  <MaterialIcons name='report' size={40} style={{alignSelf: 'center'}} color="red"/>
                                  <Text style={{alignSelf: 'center', color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_400Regular'}}>Report</Text>
                                </TouchableOpacity> : null}
                                </View>
                              );
                            };
                            return (
                              <>
                              <Swipeable renderRightActions={(progress, dragX) =>
                                    renderRightActions(progress, dragX, onClick)
                                  }
                                  onSwipeableOpen={() => closeRow(item.actualReplies.indexOf(element))}
                                  ref={(ref) => (row[item.actualReplies.indexOf(element)] = ref)}
                                  rightOpenValue={-100}>
                                <View style={[styles.commentHeader, {marginLeft: 0}]}>
                                     {element.pfp ? <FastImage source={{uri: element.pfp, priority: 'normal'}} style={{height: 35, width: 35, borderRadius: 17.5}}/> :
          <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 35, width: 35, borderRadius: 17.5}}/>}
                                    <View style={styles.commentSection}>
                                    {element.replyToComment == true ? <TouchableOpacity onPress={item.user == user.uid ? null : () => {setCommentModal(false); navigation.navigate('ViewingProfile', {name: item.user, viewing: true})}}>
                <Text style={[styles.usernameText, {color: theme.color}]}>@{element.username}</Text>
              </TouchableOpacity> : <TouchableOpacity onPress={item.user == user.uid ? null : () => {setCommentModal(false); navigation.navigate('ViewingProfile', {name: item.user, viewing: true})}}>
                                    <Text style={[styles.usernameText, {color: theme.color}]}>@{element.username} {'>'} @{element.replyTo}</Text>
                                    </TouchableOpacity>}
                                    <CustomCommentText text={`${element.reply}`}/>
                                    <View style={[styles.commentFooterContainer, {width: '100%', marginLeft: 2.5}]}>
                                        <View style={{flexDirection: 'row'}}>
                                            <Text style={[styles.dateText, {color: theme.color}]}>{element.timestamp ? getDateAndTime(element.timestamp) : null}</Text>
                                            <TouchableOpacity style={styles.reply} onPress={() => {setReplyToReplyFocus(true); setTempReplyName(element.username); setCommentTempId(item.id); setTempReplyId(element.id)}}>
                                                <Text style={[styles.replyText, {color: theme.color}]}>Reply</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {/* <View style={{flexDirection: 'row'}}>
                                            <TouchableOpacity style={{flexDirection: 'row'}} onPress={element.likedBy.includes(user.uid) == false ? () => {addLikeReply(element)} : () => {removeLikeReply(element)}}>
                                                {element.likedBy.includes(user.uid) ? <MaterialCommunityIcons name='cards-heart' size={22.5} style={{alignSelf: 'center', paddingRight: 3}} color="red"/> : <MaterialCommunityIcons name='cards-heart-outline' size={22.5} style={{alignSelf: 'center'}} color="#808080"/>}
                                            </TouchableOpacity>
                                            <Text style={[styles.commentText, {alignSelf: 'center', color: "#808080"}]}>{element.likedBy.length}</Text>
                                        </View> */}
                                    </View>
                                    
                                    
                                    </View>
                                </View>
                                </Swipeable>
                                {replyLastVisible < item.replies.length && item.actualReplies.indexOf(element) == replyLastVisible - 1 ? <TouchableOpacity style={{marginLeft: '7.5%', paddingLeft: 0, padding: 10,}} onPress={() => toggleShowReply(item)}>
                          <Text style={{textAlign: 'left', fontFamily: 'Montserrat_500Medium', color: theme.color}}>Show more replies</Text>
                        </TouchableOpacity> : null}
                                </>
                            )
                        })}
                    </View> 
                    : 
                    <View>

                    </View>}
            </View>
        </View>
        </Swipeable>
    )
}
    const renderItems = ({item, index}) => {
    return (
      
      <Pinchable>
        <FastImage
          source={{ uri: item.post, priority: 'normal' }}
          style={{
            height: Dimensions.get('screen').height / 2.75, 
            width: Dimensions.get('screen').width / 1.20,
            zIndex: 10,
            resizeMode: 'cover',
            alignSelf: 'center',
            borderRadius: 8,
            //marginLeft: '2.25%'
          }}
          resizeMethod='cover'
        />
      </Pinchable>
    )
    
    //console.log(item)
  }
  /* const hashTagRealFunction = (item) => {
    hashTagFunction(item)
  } */
  const handleScroll = _.debounce((event) => {
    // Your logic for fetching more data
    fetchMoreCommentData()
  }, 500);
    async function deleteCliquePost(id){
      let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/deleteCliqPost'
        Alert.alert('Delete Post', 'Are You Sure You Want to Delete This Post?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: async() => {
        try {
    const response = await fetch(url, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {id: id, groupId: group.id, user: user.uid}}), // Send data as needed
    })
    const data = await response.json();
    if (data.result.done) {
      setPosts(posts.filter((e) => e.id != id.id))
    }
  } catch (error) {
    console.error('Error:', error);
  }
      }
    },
    ]);
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
  async function archiveCliquePost(item) {
    //console.log(item)
    await updateDoc(doc(db, 'groups', group.id, 'posts', item.id), {
      archived: true
    }).then(async() => await setDoc(doc(db, 'groups', group.id, 'profiles', user.uid, 'archivedPosts', item.id), {
      post: item.id,
      timestamp: serverTimestamp()
    }))
  }
  async function unArchiveCliquePost(item) {
    //console.log(item)
    await updateDoc(doc(db, 'groups', group.id, 'posts', item.id), {
      archived: false
    }).then(async() => await deleteDoc(doc(db, 'groups', group.id, 'profiles', user.uid, 'archivedPosts', item.id)))
  }
  const handlePostSnap = (newIndex, actualId) => {
    const updatedArray = posts.map((item) => {
      if (item.id === actualId) {
        return { ...item, postIndex: newIndex };
      }
      return item;
    });
    setPosts(updatedArray)
    // Your logic for fetching more data
    //setActivePostIndex(newIndex)
  }
  const handleSnap = async (index) => {
  setActiveIndex(index);
  setActivePostIndex(0)
  if (index >= posts.length - 2) {
    await fetchMoreData(); // Use async/await for fetching
  }
};
  const renderFriends = ({item, index}) => {
      return (
      <View key={index}>
        <View  style={{flexDirection: 'row', width: '82.5%', alignItems: 'center'}}>
            <TouchableOpacity style={[styles.friendsContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => {setNewComment(newComment.replace(/@([^ ]*)/, '@' + item.userName + ' ')); setCommentMentions(prevState => [...prevState, {id: item.id, username: item.userName, notificationToken: item.notificationToken}])}}>
                <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
                 <View style={{paddingLeft: 20, width: '75%'}}>
                    <Text numberOfLines={1} style={[styles.nameFriendText, {fontFamily: 'Montserrat_600SemiBold', color: theme.color, fontSize: 15.36}]}>{item.firstName} {item.lastName}</Text>
                    <Text numberOfLines={1} style={[styles.nameFriendText, {color: theme.color}]}>@{item.userName}</Text>
                </View>
            
                
            </TouchableOpacity>
          </View>
          <Divider />
      </View>
      )
    }
    const renderItem = (item, index) => {
      if (item.item.likedBy != undefined) {
   if (item.item.post != null && item.item.post.length > 1) {
    //console.log(item.item.userId)
    //console.log(item.item)
    //console.log(index)
    //console.log(item.item.caption.match(/#[^\s]+/g) )
    
    return (
      <>
      <View style={item.item.index == 0 ? [styles.ultimateContainer, {marginTop: '-7.5%', backgroundColor: theme.backgroundColor}] : [styles.ultimateContainer, {backgroundColor: theme.backgroundColor}]} key={item.item.id}>
        <TouchableOpacity onPress={() => addDoubleCliqueLike(item.item, item.item.likedBy)} activeOpacity={1}>
    <FastImage resizeMode='stretch' source={item.item.background ? {uri: item.item.background} : require('../assets/Default_theme.jpg')} style={styles.postingContainer}>
      <View style={[styles.posting, {height: Dimensions.get('screen').height / 2, zIndex: 99, backgroundColor: theme.backgroundColor}]}>
        
        {item.item.username != username ? <View style={styles.postHeader}>
           {item.item.pfp ? <FastImage source={{uri: item.item.pfp, priority: 'normal'}} style={{height: 44, width: 44, borderRadius: 8}}/> : 
          <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 44, width: 44, borderRadius: 8}}/>
          }
            <TouchableOpacity onPress={() => navigation.navigate('ViewingProfile', {name: item.item.userId, viewing: true})} style={styles.titleHeader}>
              <Text numberOfLines={1} style={[styles.addText, {color: theme.color, paddingLeft: 7.5}]}>@{item.item.username}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addContainer} onPress={user.uid != null ? friends.filter(e => e.id === item.item.userId).length > 0 ? () => removeFriend(item.item.userId) : item.item.userId == user.uid || requests.filter(e => e.id === item.item.userId).length > 0 ? null : () => addFriend(item.item): null}>
              {requests.filter(e => e.id === item.item.userId).length > 0 ? <RequestedIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> : 
              friends.filter(e => e.id === item.item.userId).length > 0 ? <FollowingIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
              : item.item.userId == user.uid ? null : <FollowIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/>}
              
            </TouchableOpacity>
            
          </View> 
          : <View style={styles.postHeader}>
            {item.item.pfp ? <FastImage source={{uri: item.item.pfp, priority: 'normal'}} style={{height: 44, width: 44, borderRadius: 8}}/> : 
          <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 44, width: 44, borderRadius: 8}}/>
          }
            <TouchableOpacity onPress={() => navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})} style={[{marginLeft: '2.5%'}, styles.titleHeader]}>
              <Text style={[styles.addText, {color: theme.color, paddingLeft: 7.5}]}>@{item.item.username}</Text>
            </TouchableOpacity>
            
          </View>}
          <GestureHandlerRootView style={{ justifyContent: 'center', alignItems: 'center', flex: 1, zIndex: 999}}>
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
          <View style={{flexDirection: 'row', marginBottom: -10, justifyContent: 'flex-end', marginRight: '2.5%'}}>
            {item.item.post.map((e, index) => (
              <PaginationDot 
                            key={index} 
                            isActive={index === activePostIndex} 
                        />
            ))}
          </View>
            </View>
           <View style={[styles.postFooter, {marginTop: '5%', backgroundColor: theme.backgroundColor}]}>
                  <View style={{flexDirection: 'row', width: '90%', marginLeft: '5%', marginRight: '5%', alignItems: 'center'}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={item.item.likedBy.includes(user.uid) == false ? () => addCliqueLike(item.item) : () => removeCliqueLike(item.item)}>
            {item.item.likedBy.includes(user.uid) ? <MaterialCommunityIcons name='cards-heart' size={27.5} style={{alignSelf: 'center'}} color="red"/> : <MaterialCommunityIcons name='cards-heart-outline' color={theme.color} size={27.5} style={{alignSelf: 'center'}}/>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Likes', {postLikes: item.item.likedBy, friends: friends, requests: requests})}>
            <Text style={[styles.postFooterText, {color: theme.color}]}>{item.item.likedBy.length > 999 && item.item.likedBy.length < 1000000 ? `${item.item.likedBy.length / 1000}k` : item.item.likedBy.length > 999999 ? `${item.item.likedBy.length / 1000000}m` : item.item.likedBy.length}</Text>
          </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row', marginLeft: '2.5%',}}>
          <TouchableOpacity onPress={() => setFocusedPost(item.item)}>
            <MaterialCommunityIcons name='message-outline' color={theme.color} size={26} style={{alignSelf: 'center'}} />
          </TouchableOpacity>
          <Text style={[styles.postFooterText, {color: theme.color}]}>{item.item.comments > 999 && item.item.comments < 1000000 ? `${item.item.comments / 1000}k` : item.item.comments > 999999 ? `${item.item.comments / 1000000}m` : item.item.comments}</Text>
          </View>
           <TouchableOpacity onPress={() => navigation.navigate('GroupChat', {id: group.id, group: group.id, pfp: group.idPfp, groupName: group.name, post: item.item})}>
            <Ionicons name='arrow-redo-outline' color={theme.color} size={28} style={{alignSelf: 'center', marginLeft: '2.5%',}}/>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={item.item.savedBy.includes(user.uid) == false ? () => addCliqueSave(item.item) : () => removeCliqueSave(item.item)}>
            {item.item.savedBy.includes(user.uid) ? <MaterialCommunityIcons name='bookmark' color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={30} style={{alignSelf: 'center'}}/> : <MaterialCommunityIcons name='bookmark-plus-outline' color={theme.color} size={30} style={{alignSelf: 'center'}}/>}
          </TouchableOpacity>
          {item.item.mentions && item.item.mentions.length > 0 ?
          <TouchableOpacity onPress={() => navigation.navigate('Mention', {mentions: item.item.mentions, friends: friends, requests: requests})}>
            <MaterialCommunityIcons name='at' size={25} style={{alignSelf: 'center', paddingLeft: 5}} color={theme.color}/>
          </TouchableOpacity>
          : null}
          {admin || !reportedContent.includes(item.item.id) ?
          <TouchableOpacity style={styles.menuContainer}>
            <Menu visible={item.item.reportVisible}
                    onDismiss={() => closeMenuCallback(item.item)}
                    contentStyle={{backgroundColor: theme.backgroundColor, alignSelf: 'center', borderWidth: 1, borderColor: "#71797E"}}
                    anchor={<Entypo name='dots-three-vertical' size={25} color={theme.color} onPress={() => openMenuCallback(item.item)}/>}>
                  {admin ? <Menu.Item title="Delete" titleStyle={{color: theme.color}} onPress={() => deleteCliquePost(item.item)}/> : null}
                  {!reportedPosts.includes(item.item.id) ? <Menu.Item title="Report" titleStyle={{color: theme.color}} onPress={() => navigation.navigate('ReportPage', {id: item.item.id, theme: false, comment: null, cliqueId: group.id, post: true, comments: false, message: false, cliqueMessage: false, reportedUser: item.item.userId})}/> : null}
            </Menu>
          
            </TouchableOpacity>
            : null}
          </View>
          
            
       {item.item.caption.length > 0 ? 
            <TouchableOpacity style={[styles.captionContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => setFocusedPost(item.item)}>
              <Text numberOfLines={1} style={{color: theme.color}}><Text style={{fontFamily: 'Montserrat_700Bold', fontSize: 15.36}}>{item.item.username}</Text> {`${edit ? caption ? item.item.caption : item.item.caption : item.item.caption}`}</Text>
          </TouchableOpacity> : null}
          <Text style={[styles.postText, {color: theme.color}]}>{getDateAndTime(item.item.timestamp)}</Text>
        </View>
        <View style={[styles.rightArrow, {borderLeftColor: theme.backgroundColor}]} />
        {item.item.background && item.item.postBought ? 
      
      <TouchableOpacity style={[styles.buyThemeContainer, {backgroundColor: theme.color}]} onPress={() => buyThemeFunction(item.item.background, item.item.userId)}>
        <FontAwesome name='photo' size={22.5} style={{alignSelf: 'center'}}/>
      </TouchableOpacity>: null}
        </FastImage>
        
        </TouchableOpacity>
        </View>
          {loading && lastVisible && item.index == posts.length - 1 ? <View style={{height: 25, marginTop: '2.5%'}}>
            <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
          </View>  : null}

        </>
        
    )
   }
   else if (item.item.post != null && item.item.post.length == 1) {
      return (
        <>
        <View style={item.index == 0 ? [styles.ultimateContainer, {marginTop: 0, backgroundColor: theme.backgroundColor}] : [styles.ultimateContainer, {backgroundColor: theme.backgroundColor}]} key={item.item.id}>
          <TouchableOpacity onPress={() => addDoubleCliqueLike(item.item, item.item.likedBy)} activeOpacity={1}>
    <FastImage resizeMode='stretch' source={item.item.background ? {uri: item.item.background} : require('../assets/Default_theme.jpg')} style={ item.item.post[0].image || item.item.post[0].text ? styles.postingContainer : 
    item.item.caption ? [styles.videoPostingContainer, {backgroundColor: theme.theme != 'light' ? "#9EDAFF" : "#005278", height: '100%'}] : [styles.videoPostingContainer, {backgroundColor: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>
      <View>
      <View style={item.item.post[0].image ? [styles.posting, {height: Dimensions.get('screen').height / 2.1, paddingBottom: 5, backgroundColor: theme.backgroundColor}] : item.item.post[0].video ? [styles.captionPosting] : [styles.posting, {backgroundColor: theme.backgroundColor}]}>
        {item.item.post[0].image || item.item.post[0].text ?
        <View style={ styles.postHeader}>
            {item.item.pfp ? <FastImage source={{uri: item.item.pfp, priority: 'normal'}} style={ item.item.post[0].image || item.item.post[0].text ? {height: 44, width: 44, borderRadius: 8} : {height: 33, width: 33, borderRadius: 8}}/> : 
          <FastImage source={require('../assets/defaultpfp.jpg')} style={ item.item.post[0].image || item.item.post[0].text? {height: 44, width: 44, borderRadius: 8} : {height: 33, width: 33, borderRadius: 8}}/>
          }
            <TouchableOpacity onPress={item.item.userId != user.uid ? () => navigation.navigate('ViewingProfile', {name: item.item.userId, viewing: true}) :  () => navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})} style={[styles.titleHeader]}>
              <Text style={[styles.addText, {paddingLeft: 7.5, color: theme.color}]}>@{item.item.username}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addContainer} onPress={user.uid != null ? friends.filter(e => e.id === item.item.userId).length > 0 ? () => removeFriend(item.item.userId) : item.item.userId == user.uid || requests.filter(e => e.id === item.item.userId).length > 0 ? null : () => addFriend(item.item): null}>
              {requests.filter(e => e.id === item.item.userId).length > 0 ? <RequestedIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} width={65} height={32} /> : 
              friends.filter(e => e.id === item.item.userId).length > 0 ? <FollowingIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} width={70} height={32} />
              : item.item.userId == user.uid  ? null : <FollowIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} width={50} height={32}/>}
              
            </TouchableOpacity>
            
          </View> 
          : null}
        {item.item.post[0].image ? 
        <Pinchable>
        <FastImage source={{uri: item.item.post[0].post, priority: 'normal'}}
        style={[{ height: Dimensions.get('screen').height / 2.75, width: Dimensions.get('screen').width / 1.2, borderRadius: 8, alignSelf: 'center'}]}/>
        </Pinchable>
        : item.item.post[0].video ?
          <TouchableOpacity activeOpacity={1} onLongPress={() => openMenuCallback(item.item)} style={{height: '85%', width: '94.5%',
          padding: 5, marginLeft: '2.5%'}}>
            <Suspense fallback={ <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />}>
              <LazyVideo 
              videoRef={videoRef}
             style={styles.video}
                      source={item.item.post[0].post}
                      shouldPlay={item.index == activeIndex && focused && !isPaused ? true : false}
                      onPlaybackStatusUpdate={status => setStatus(() => status)}
                      
              />
            </Suspense> 
            {/* <FastImage source={{uri: item.item.post[0].thumbnail, priority: 'high'}} style={[styles.video]}/> */}
          </TouchableOpacity>: 
          <Text style={[styles.postText, {fontSize: 15.36, color: theme.color}]}>{item.item.post[0].value}</Text>}
          {item.item.post[0].video ?
          <View style={styles.videoShadow}>
          <View style={item.item.caption ? [styles.videoPostHeader, {marginTop: 0}] : styles.videoPostHeader}>
            {item.item.pfp ? <FastImage source={{uri: item.item.pfp, priority: 'normal'}} style={{height: Dimensions.get('screen').height / 37, width: Dimensions.get('screen').height / 37, borderRadius: 8}}/> : 
          <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: Dimensions.get('screen').height / 37, width: Dimensions.get('screen').height / 37, borderRadius: 8}}/>
          }
            <TouchableOpacity onPress={item.item.userId != user.uid ? () => navigation.navigate('ViewingProfile', {name: item.item.userId, viewing: true}) : () => navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})} style={[styles.titleHeader]}>
              <Text numberOfLines={1} style={[styles.addText, {color: "#fafafa", fontSize: 12.29, fontFamily: 'Monserrat_500Medium', paddingLeft: 7.5}]}>@{item.item.username}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addContainer, {marginLeft: 0}]} onPress={user.uid != null ? friends.filter(e => e.id === item.item.userId).length > 0 ? () => removeFriend(item.item.userId) : item.item.userId == user.uid || requests.filter(e => e.id === item.item.userId).length > 0 ? null : () => addFriend(item.item): null}>
              {requests.filter(e => e.id === item.item.userId).length > 0 ? <RequestedIcon color={"#fafafa"} width={60} height={20} /> : 
              friends.filter(e => e.id === item.item.userId).length > 0 ? <FollowingIcon color={"#fafafa"} width={60} height={20} />
              : item.item.userId == user.uid  ? null : <FollowIcon color={"#fafafa"}  width={60} height={20}/>}
              
            </TouchableOpacity>
            {admin || !reportedContent.includes(item.item.id) ?
          <TouchableOpacity style={styles.menuContainer}>
            <Menu visible={item.item.reportVisible}
                    onDismiss={() => closeMenuCallback(item.item)}
                    contentStyle={{backgroundColor: theme.backgroundColor, alignSelf: 'center', borderWidth: 1, borderColor: "#71797E"}}
                    anchor={<Entypo name='dots-three-vertical' size={25} color={"#fafafa"} onPress={null}/>}>
                  {admin ? <Menu.Item title="Delete" titleStyle={{color: "#000"}} onPress={() => deleteCliquePost(item.item)}/> : null}
                  {!reportedPosts.includes(item.item.id) ? <Menu.Item title="Report" titleStyle={{color: "#000"}} onPress={() => navigation.navigate('ReportPage', {id: item.item.id, theme: false, comment: null, cliqueId: group.id, post: true, comments: false, message: false, cliqueMessage: false, reportedUser: item.item.userId})}/> : null}
            </Menu>
          
            </TouchableOpacity>
            : null}
          </View> 
          {item.item.post[0].video ? item.item.caption.length > 0 ? 
            <TouchableOpacity style={styles.videoCaptionContainer} onPress={() => setFocusedPost(item.item)}>
              <Text style={{color: "#fafafa", fontSize: Dimensions.get('screen').height / 68.7, width: '70%'}}><Text style={{fontFamily: 'Montserrat_700Bold', fontSize: 15.36}}>{item.item.username}</Text> {`${edit ? caption ? item.item.caption : item.item.caption : item.item.caption}`}</Text>
          </TouchableOpacity> : null : null}
          </View>
        : null}
            </View>
            {item.item.post[0].video ?
            <View style={item.item.mentions && item.item.mentions.length > 0 ? {flexDirection: 'column', marginTop: '-64%', width: 100, marginLeft: '70%', justifyContent: 'flex-end'} : {flexDirection: 'column', marginTop: '-50%', width: 100, marginLeft: '70%', justifyContent: 'flex-end'} }>
                    <View style={styles.videoButton}>
          <TouchableOpacity onPress={item.item.likedBy != undefined ? item.item.likedBy.includes(user.uid) == false ? () => addCliqueLike(item.item, item.item.likedBy) : () => removeCliqueLike(item.item) : null}>
            {item.item.likedBy != undefined ? item.item.likedBy.includes(user.uid) ? <MaterialCommunityIcons name='cards-heart' size={Dimensions.get('screen').height / 33.76} style={{alignSelf: 'center'}} color="red"/> : <MaterialCommunityIcons name='cards-heart-outline' color={"#fafafa"} size={Dimensions.get('screen').height / 33.76} style={{alignSelf: 'center'}}/> : null}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Likes', {postLikes: item.item.likedBy, friends: friends, requests: requests})}>
            <Text style={[styles.postFooterText, {color: "#fafafa"}]}>{item.item.likedBy.length > 999 && item.item.likedBy.length < 1000000 ? `${item.item.likedBy.length / 1000}k` : item.item.likedBy.length > 999999 ? `${item.item.likedBy.length / 1000000}m` : item.item.likedBy.length}</Text>
          </TouchableOpacity>
          </View>
          <View style={styles.videoButton}>
          <TouchableOpacity onPress={() => setFocusedPost(item.item)}>
            <MaterialCommunityIcons name='message-outline' size={Dimensions.get('screen').height / 35.9} color={"#fafafa"} style={{alignSelf: 'center'}}/>
          </TouchableOpacity>
          <Text style={[styles.postFooterText, {color: "#fafafa"}]}>{item.item.comments > 999 && item.item.comments < 1000000 ? `${item.item.comments / 1000}k` : item.item.comments > 999999 ? `${item.item.comments / 1000000}m` : item.item.comments}</Text>
          </View>
          <TouchableOpacity style={styles.videoButton} onPress={() => navigation.navigate('GroupChat', {id: group.id, group: group.id, pfp: group.idPfp, groupName: group.name, post: item.item})}>
            <Ionicons name='arrow-redo-outline' color={"#fafafa"}  size={Dimensions.get('screen').height / 33.1} style={{alignSelf: 'center', marginLeft: '2.5%', paddingVertical: 5, paddingTop: 2.5}}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.videoButton} onPress={item.item.savedBy.includes(user.uid) == false ? () => addCliqueSave(item.item) : () => removeCliqueSave(item.item)}>
            {item.item.savedBy.includes(user.uid) ? <MaterialCommunityIcons name='bookmark' color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}  size={Dimensions.get('screen').height / 30.7} style={{alignSelf: 'center', paddingVertical: 5}}/> : <MaterialCommunityIcons name='bookmark-plus-outline' color={"#fafafa"} size={Dimensions.get('screen').height / 30.7} style={{alignSelf: 'center', paddingVertical: 5}}/>}
          </TouchableOpacity>
          {item.item.mentions && item.item.mentions.length > 0 ?
          <TouchableOpacity onPress={() => navigation.navigate('Mention', {mentions: item.item.mentions, friends: friends, requests: requests})}>
            <MaterialCommunityIcons name='at' size={Dimensions.get('screen').height / 37.5} style={{alignSelf: 'center', paddingLeft: 2.5, paddingTop: 2.5}} color={"#fafafa"}/>
          </TouchableOpacity>
          : null}
          </View>
           : null}
          {item.item.post[0].image || item.item.post[0].text ?
          <>
           <View style={[styles.postFooter, {marginTop: '5%', zIndex: -1, backgroundColor: theme.backgroundColor}]}>
                  <View style={{flexDirection: 'row', width: '90%', marginLeft: '5%', marginRight: '5%', alignItems: 'center'}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={item.item.likedBy != undefined ? item.item.likedBy.includes(user.uid) == false ? () => addCliqueLike(item.item, item.item.likedBy) : () => removeCliqueLike(item.item) : null}>
            {item.item.likedBy != undefined ? item.item.likedBy.includes(user.uid) ? <MaterialCommunityIcons name='cards-heart' size={27.5} style={{alignSelf: 'center'}} color="red"/> : <MaterialCommunityIcons name='cards-heart-outline' color={theme.color} size={27.5} style={{alignSelf: 'center'}}/> : null}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Likes', {postLikes: item.item.likedBy, friends: friends, requests: requests})}>
            <Text style={[styles.postFooterText, {color: theme.color}]}>{item.item.likedBy.length > 999 && item.item.likedBy.length < 1000000 ? `${item.item.likedBy.length / 1000}k` : item.item.likedBy.length > 999999 ? `${item.item.likedBy.length / 1000000}m` : item.item.likedBy.length}</Text>
          </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row', marginLeft: '2.5%',}}>
          <TouchableOpacity onPress={() => setFocusedPost(item.item)}>
            <MaterialCommunityIcons name='message-outline' size={26} color={theme.color} style={{alignSelf: 'center'}}/>
          </TouchableOpacity>
          <Text style={[styles.postFooterText, {color: theme.color}]}>{item.item.comments > 999 && item.item.comments < 1000000 ? `${item.item.comments / 1000}k` : item.item.comments > 999999 ? `${item.item.comments / 1000000}m` : item.item.comments}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('GroupChat', {id: group.id, group: group.id, pfp: group.idPfp, groupName: group.name, post: item.item})}>
            <Ionicons name='arrow-redo-outline' color={theme.color} size={28} style={{alignSelf: 'center', marginLeft: '2.5%',}}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={item.item.savedBy.includes(user.uid) == false ? () => addCliqueSave(item.item) : () => removeCliqueSave(item.item)}>
            {item.item.savedBy.includes(user.uid) ? <MaterialCommunityIcons name='bookmark' color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}  size={30} style={{alignSelf: 'center'}}/> : <MaterialCommunityIcons name='bookmark-plus-outline' color={theme.color} size={30} style={{alignSelf: 'center'}}/>}
          </TouchableOpacity>
          {item.item.mentions && item.item.mentions.length > 0 ?
          <TouchableOpacity onPress={() => navigation.navigate('Mention', {mentions: item.item.mentions, friends: friends, requests: requests})}>
            <MaterialCommunityIcons name='at' size={25} style={{alignSelf: 'center', paddingLeft: 5}} color={theme.color}/>
          </TouchableOpacity>
          : null}
          {admin || !reportedContent.includes(item.item.id) ?
          <TouchableOpacity style={styles.menuContainer}>
            <Menu visible={item.item.reportVisible}
                    onDismiss={() => closeMenuCallback(item.item)}
                    contentStyle={{backgroundColor: theme.backgroundColor, alignSelf: 'center', borderWidth: 1, borderColor: "#71797E"}}
                    anchor={<Entypo name='dots-three-vertical' size={25} color={theme.color} onPress={() => openMenuCallback(item.item)}/>}>
                  {admin ? <Menu.Item title="Delete" titleStyle={{color: theme.color}} onPress={() => deleteCliquePost(item.item)}/> : null}
                  {!reportedPosts.includes(item.item.id) ? <Menu.Item title="Report" titleStyle={{color: theme.color}} onPress={() => navigation.navigate('ReportPage', {id: item.item.id, theme: false, comment: null, cliqueId: group.id, post: true, comments: false, message: false, cliqueMessage: false, reportedUser: item.item.userId})}/> : null}
            </Menu>
          
            </TouchableOpacity>
            : null}
          </View>
          
            {item.item.caption.length > 0 ? 
            <TouchableOpacity style={[styles.captionContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => setFocusedPost(item.item)}>
              <Text numberOfLines={1} style={item.item.post[0].image ? {color: theme.color} : {color: theme.color, fontSize: 12.29, paddingTop: 5}}><Text style={{fontFamily: 'Montserrat_700Bold', fontSize: 15.36}}>{item.item.username}</Text> {`${edit ? caption ? item.item.caption : item.item.caption : item.item.caption}`}</Text>
          </TouchableOpacity> : null}
          <Text style={[styles.postText, {color: theme.color}]}>{getDateAndTime(item.item.timestamp)}</Text>
        </View> 
        <View style={[styles.rightArrow, {borderLeftColor: theme.backgroundColor}]} />
        </> : null}
        </View>
        {item.item.background && item.item.postBought ? 
      
      <TouchableOpacity style={[styles.buyThemeContainer, {backgroundColor: theme.color}]} onPress={() => buyThemeFunction(item.item.background, item.item.userId)}>
        <FontAwesome name='photo' size={22.5} style={{alignSelf: 'center'}}/>
      </TouchableOpacity>: null}
        </FastImage>
        </TouchableOpacity>
        
        
        </View>
        {loading && lastVisible && item.index == posts.length - 1 ? <View style={{height: 25, marginTop: '2.5%'}}>
            <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
          </View>  : null}
        </>
      )
   }
  }
    
  }
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_700Bold,
    Montserrat_600SemiBold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
          <ThemeHeader backButton={true} text={group.name} groupPosts={true} actualGroup={group} blockedUsers={blockedUsers} username={username} cliqueId={group.id} groupposting={true}/>
          {focusedPost != null ? 
        <Modal visible={commentModal} animationType="slide" transparent onRequestClose={() => {setCommentModal(!commentModal); }}>
            <View style={[styles.modalContainer, styles.overlay]}>
                <View style={[styles.modalView, {backgroundColor: theme.backgroundColor}]}>
                   <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      {reportCommentModal ? <Text style={[styles.headerText, {color: theme.color}]}>Report</Text> : <Text style={[styles.headerText, {color: theme.color}]}>Comments</Text>}
       
        <TouchableOpacity style={{marginLeft: 'auto'}} onPress={() => {setCommentModal(false); setReportCommentModal(false); setFocusedPost(null); setCommentDone(false); setDone(false); setComments([]); setReplies([]); setNewComment('')}}>
            <MaterialCommunityIcons name='close' size={25} style={{marginTop: '-7.5%', paddingRight: 10}} color={theme.color}/>
        </TouchableOpacity>
        {reportCommentModal ? 
        <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
                {commentsLoading ? <View style={{flex: 1, alignItems: 'center', justifyContent:'center', marginBottom: '20%'}}>
        <ActivityIndicator size={'large'} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View> : !finishedReporting ? 
                <>
                <Text style={[styles.reportContentText, {color: theme.color}]}>Why Are You Reporting This Content?</Text>
                <Text style={[styles.reportSupplementText, {marginBottom: '5%', color: theme.color}]}>Don't Worry Your Response is Anonymous! If it is a Dangerous Emergency, Call the Authorities Right Away!</Text>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Discrimination')}>
                  <Text style={[styles.reportContentText, {color: theme.color}]}>Discrimination</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('General Offensiveness')}>
                  <Text style={[styles.reportContentText, {color: theme.color}]}>General Offensiveness</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Gore/Excessive Blood')}>
                  <Text style={[styles.reportContentText, {color: theme.color}]}>Gore / Excessive Blood</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Nudity/NSFW Sexual Content')}>
                  <Text style={[styles.reportContentText, {color: theme.color}]}>Nudity / NSFW Sexual Content</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Scammer/Fraudulent User')}>
                  <Text style={[styles.reportContentText, {color: theme.color}]}>Scammer / Fraudulent User</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Spam')}>
                  <Text style={[styles.reportContentText, {color: theme.color}]}>Spam</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Toxic/Harassment')}>
                  <Text style={[styles.reportContentText, {color: theme.color}]}>Toxic / Harassment</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Violent Behavior')}>
                  <Text style={[styles.reportContentText, {color: theme.color}]}>Violent Behavior</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Other')}>
                  <Text style={[styles.reportContentText, {color: theme.color}]}>Other</Text>
                  
                </TouchableOpacity> 
            </>  : 
            <View style={{flex: 1}}>
            <MaterialCommunityIcons name='close' color={theme.color}  size={35} style={{margin: '5%', textAlign: 'right', marginBottom: 0}} onPress={() => navigation.goBack()}/>
            <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
            <Text style={[styles.reportContentText, {fontSize: 24, color: theme.color, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold', marginVertical: '5%'}]}>Thanks for submitting your anonymous response!</Text>
            <Text style={[styles.reportContentText, {fontSize: 24, color: theme.color, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold', marginVertical: '5%'}]}>User has been notified about the report.</Text>
            <Text style={[styles.reportContentText, {fontSize: 24, color: theme.color, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold', marginVertical: '5%'}]}>Thanks for keeping NuCliq safe!</Text>
            </View>
            </View>
            }
        </View>
        : null}
        {focusedPost.caption.length > 0 && !reportCommentModal ? 
        <>
        <Divider />
        <View style={{flexDirection: 'row', width: '95%', margin: '2.5%'}}>
          <FastImage source={focusedPost.pfp ? {uri: focusedPost.pfp} : require('../assets/defaultpfp.jpg')} style={{width: 40, height: 40, borderRadius: 8, marginRight: 5}}/>
          <View style={{flexWrap: 'wrap'}}>
            <Text style={[styles.usernameText, {color: theme.color}]} numberOfLines={1}>{focusedPost.username}</Text>
            <Text style={[styles.captionText, {color: theme.color}]}>{focusedPost.caption}</Text>
          </View>
          
        </View>
        <Divider /> 
        </>
        : null }
        
        {comments.length == 0 && !reportCommentModal && !commentsLoading && !commentSearching  ? 
        
        <>
        <TouchableHighlight onPress={Keyboard.dismiss} underlayColor={'transparent'} style={{flex: 1}}>
            <>
        <View style={styles.noCommentsContainer}>
            <Text style={[styles.noCommentsText, {color: theme.color,}]}>No Comments Yet</Text>
            <Text style={[styles.noCommentsText, {fontSize: 19.20, fontFamily: 'Montserrat_500Medium', color: theme.color,}]}>Be the First to Comment!</Text>
        </View>
            
        </>
        </TouchableHighlight>
        </>
        :
        !newComment.includes('@')  && !reportCommentModal && !commentSearching  ?
                <>
            <FlatList 
                data={comments.slice().sort((a, b) => b.timestamp - a.timestamp)}
                renderItem={(v) =>
          renderComments(v, () => {
            console.log('Pressed', v);
            deleteItem(v);
          })}
                keyExtractor={item => item.id}
                ListFooterComponent={<View style={{paddingBottom: 30}}/>}
                style={{height: '40%'}}
                onScroll={handleScroll}
            />
            {commentsLoading && !reportCommentModal ? <View style={{justifyContent: 'flex-end', alignItems: 'center', marginBottom: '5%'}}>
              <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
            </View>
          
          : null}
            </> : !reportCommentModal ?
            <FlatList 
                data={filtered}
                renderItem={renderFriends}
                keyExtractor={item => item.id}
                ListFooterComponent={<View style={{paddingBottom: 30}}/>}
                style={{height: '40%'}}
                
            /> : null}
    
    </View>
    {!reportCommentModal ? 
    <>
    <View style={{backgroundColor: 'transparent'}}>
    </View>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.addCommentSecondContainer, {borderColor: theme.color}]}>
              <View style={{flexDirection: 'row', marginTop: '5%', marginHorizontal: '5%', width: '90%'}}>
                 {pfp != undefined ? <FastImage source={{uri: pfp, priority: 'normal'}} style={{height: 35, width: 35, borderRadius: 25}}/> :
          <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 35, width: 35, borderRadius: 25}}/>}
                {replyToReplyFocus ?
                    <TextInput ref={textInputRef} multiline placeholder={tempReplyName != undefined ? `Reply To ${tempReplyName}` : 'Reply To'} maxLength={200} placeholderTextColor={theme.color} autoFocus={true} style={[styles.addCommentText, {color: theme.color}]} value={reply} onChangeText={setReply} returnKeyType="send" onSubmitEditing={addNewReplyToReply}/>
                 : replyFocus ? 
                
                    <TextInput ref={textInputRef} multiline placeholder={tempReplyName != undefined ? `Reply To ${tempReplyName}` : 'Reply To'} maxLength={200} placeholderTextColor={theme.color} autoFocus={replyFocus} style={[styles.addCommentText, {color: theme.color}]} value={reply} onChangeText={setReply} returnKeyType="send" onSubmitEditing={addNewReply}/>
                : 
                    <TextInput ref={textInputRef} autoFocus multiline placeholder='Add Comment...' maxLength={200} style={[styles.addCommentText, {color: theme.color}]} placeholderTextColor={theme.color} value={newComment} onChangeText={setNewComment}/>
                }
                {!singleCommentLoading ?
                <View style={{marginLeft: 'auto'}}>
                <NextButton text={"Send"} textStyle={{paddingHorizontal: 0}} onPress={(newComment.length > 0 || reply.length > 0) ? replyToReplyFocus ? () => addNewReplyToReply() : replyFocus ? () => addNewReply() : () => addNewComment() : null}/>
                </View>
                : 
                <View style={{marginLeft: 'auto', alignItems: 'center', marginTop: '2.5%'}}>
                <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} style={{alignSelf: 'center'}}/>
                </View>
                }
                </View>
            </View>
    </KeyboardAvoidingView>
    </>
                :  null}
                </View>
            </View>
        </Modal>
        : null}
        {postDone && user && posts.length > 0 ? <>
        <Carousel
          width={Dimensions.get('screen').width}
          data={posts}
          vertical
          height={Dimensions.get('screen').height * 0.85}
          ref={flatListRef}


          renderItem={renderItem}
          loop={false}
          onSnapToItem={handleSnap}
          style={{minHeight: '70%'}}
          
            />
        </>
        : loading ? 
        <View style={{alignItems: 'center', flex: 1, backgroundColor: theme.backgroundColor, justifyContent: 'center'}}>
          <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={"large"}/> 
        </View>
        : !loading && !lastVisible ? <View style={{alignItems: 'center', flex: 1, backgroundColor: theme.backgroundColor, justifyContent: 'center'}}>
          <Text style={{fontFamily: 'Montserrat_500Medium', fontSize: 19.20, padding: 10, marginBottom: '5%', textAlign: 'center', color: theme.color}}>No posts yet. Be the first one to post!</Text>
          <NextButton text={`Post to ${group.name}`} textStyle={{fontSize: 15.36}} onPress={group.members.includes(user.uid) ? () => navigation.navigate('NewPost', {group: true, groupName: group.name, actualGroup: group, groupId: group.id, postArray: [], blockedUsers: blockedUsers, admin: group.admins.includes(user.uid), username: username}) : () => Alert.alert('Cannot post', 'Must be part of Cliq to post')}/>
          </View> : <View style={{alignItems: 'center', flex: 1, backgroundColor: theme.backgroundColor, justifyContent: 'center'}}>
          <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={"large"}/> 
        </View>}
          
    </View>
  )
}

export default GroupPosts

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
    marginTop: '5%',
      marginBottom: '3%',
      marginLeft: '2.5%',
      //marginRight: '5%',
      justifyContent: 'space-between',
      flexDirection: 'row',
  },
  ultimateContainer: {
      marginBottom: '7.5%',
      //marginTop: '7.5%',
      shadowColor: "#000000",
      height: '90%',
      elevation: 20,
      shadowOffset: {width: 2, height: 3},
      shadowOpacity: 0.5,
      shadowRadius: 1,
      borderTopWidth: 0.25,
      //borderBottomWidth: 1
      //flex: 1
    },
    captionText: {
      padding: 10,
      fontSize: 15.36,
      fontFamily: 'Monserrat_500Medium'
    },
    captionPosting: {
      //width: '90%',
      //borderRadius: 8,
      //marginLeft: '5%',
      //marginTop: '5%',
      //paddingBottom: 25,
      //height: 500,
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
      elevation: 20,
    },
    video: {
     borderRadius: 8,
      alignSelf: 'center',
      width: Dimensions.get('screen').width / 1.3,
      height: Dimensions.get('screen').height / 1.585,
      backgroundColor: "#121212"
    },
    postingContainer: {
      width: '100%',
      //arginTop: '5%',
      //marginLeft: '-5%',
      height: '100%',
      justifyContent: 'center',
      //flex: 1,
      //justifyContent: 'center',
      flexDirection: 'column',
      //alignItems: 'center',
      backgroundColor: "#005278",
      
      //borderWidth: 1
    },
    captionPostingContainer: {
      width: '100%',
      height: 275,
      flex: 1,
      justifyContent: 'center',
      backgroundColor: "#005278"
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: '2.5%',
      marginLeft: '3.5%',
      //width: '50%',
      //justifyContent: 'space-between'
    },
    videoPostingContainer: {
      //width: '100%',
      //arginTop: '5%',
      //marginLeft: '-5%',
      height: '100%',
      justifyContent: 'center',
      //alignItems: 'center',
    },
    videoPostHeader: {
      //position: 'absolute',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
       marginTop: '5%',
      zIndex: 3,
      //backgroundColor: 'red',
      marginLeft: '15%',
      //top: '5%',
      //width: '45%'
    },
    addContainer: {
      //flex: 1,
      //alignSelf: 'center', 
      marginLeft: 'auto',
      alignItems: 'flex-end',
      marginRight: '2.5%'
    },
    addText: {
      fontSize: 15.36,
      fontFamily: 'Monserrat_500Medium',
      color: "#090909",
      padding: 7.5,
      //width: '99%',
      paddingLeft: 15,
      //width: '98%',
      alignSelf: 'center'
      //paddingTop: 0
    },
    titleHeader: {
      //width: '50%',
      //marginLeft: '2.5%'
    //alignItems: 'center',
    //marginRight: 'auto',
    //width: '50%',
    //justifyContent: 'center'
  },
  paginationContainer: {
    marginTop: -33
    //margin: 10
  },
  buyThemeText: {
    fontSize: 12.29,
    alignSelf: 'center',
    fontFamily: 'Monserrat_700Bold',
    color: "#005278",
    padding: 5
    //padding: 10
  },
  buyThemeContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    padding: 2.5,
    borderRadius: 2.5
    //marginTop: '2.5%'
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
      paddingLeft: 0
      //marginTop: '5%'
    //borderWidth: 1
    },
    postFooterText: {
      fontSize: 12.29,
      fontFamily: 'Monserrat_500Medium',
      color: "#090909",
      padding: 5,
      alignSelf: 'center'
    },
    captionContainer: {
      width: '90%',
      marginLeft: '5%',
      marginTop: '2.5%',
      marginBottom: '1.5%'
    },
    videoCaptionContainer: {
      width: '90%',
      marginLeft: '15%',
    },
    firstName: {
      fontSize: 15.36,
      fontFamily: 'Monserrat_700Bold',
      color: "#090909",
      //width: '90%',
      padding: 7.5,
      paddingBottom: 7.5,
      //paddingTop: 0,
      //paddingLeft: 0
    },
    menuContainer: {
    //alignSelf: 'center',
    marginLeft: 'auto',
    borderRadius: 8,
    marginRight: '-5%',
    //marginRight: '2%',
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
    //borderTopWidth: 50,  // Adjust the width of the triangle
    borderRightWidth: 0,
    borderBottomWidth: 20,  // Adjust the height of the triangle
    borderLeftWidth: 20,  // Adjust the width of the triangle
    //borderTopColor: 'transparent',
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
    borderWidth: 0.5
  },
  postText: {
    fontSize: 12.29,
    fontFamily: 'Monserrat_500Medium',
    padding: 5, 
    marginLeft: '3.5%'
  },
  noPostText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 24,
    margin: '5%',
    marginTop: '-25%'
  },
   modalContainer: {
        flex: 1,
        //justifyContent: 'center',
        //alignItems: 'center',
        marginTop: '10%'
    },
  modalView: {
    width: '100%',
    height: '100%',
    //margin: 20,
    backgroundColor: 'white',
    borderRadius: 0,
    padding: 0,
    paddingTop: 5,
    paddingBottom: 0,
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
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    headerText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        textAlign: 'center',
        padding: 10
    },
    noCommentsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    noCommentsText: {
        fontSize: 24,
        fontFamily: 'Montserrat_500Medium',
        padding: 10,
        color: "#000"
    },
    addCommentSecondContainer: {
        //flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        //flex: 1,
        //marginHorizontal: '5%',
        marginBottom: '17.5%',
        borderTopWidth: 0.25,
        width: '100%',
    },
    addCommentThirdContainer: {
        backgroundColor: "#f5f5f5",
        borderRadius: 20,
        marginLeft: '5%',
        width: '85%',
        justifyContent: 'center',
        height: 40
    },
    addCommentText: {
        fontSize: 12.29,
        fontFamily: 'Montserrat_500Medium',
        color: "#000",
        padding: 10,
        width: '65%',
        alignSelf: 'center'
        
    },
    commentHeader: {
        flexDirection: 'row',
        marginTop: '5%',
        marginLeft: '5%',
        marginRight: '5%'
    },
    commentSection: {
        marginLeft: '1.5%',
        width: '90%'
    },
    usernameText: {
        fontSize: 15.36,
       fontFamily: 'Montserrat_500Medium',
        paddingTop: 0,
        padding: 5,
        paddingBottom: 0
    },
    captionText: {
      fontSize: 15.35, 
      fontFamily: 'Montserrat_400Regular',
      padding: 5,
      paddingTop: 0,
      width: 333
    },
    commentText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 5,
        paddingBottom: 0
        //paddingTop: 0
    },
    dateText: {
        fontSize: 12.29,
        fontFamily: 'Montserrat_500Medium',
        padding: 5,
        //paddingTop: 0,
        //fontWeight: '400',
        color: "#808080",
        alignSelf: 'center'
    },
    commentFooterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    reply: {
        alignSelf: 'center',
        marginLeft: '5%',
    },
    replyText: {
        fontSize: 12.29,
        color: "grey",
       fontFamily: 'Montserrat_400Regular',
    },
    viewRepliesText: {
        fontSize: 12.29,
        padding: 5,
        fontFamily: 'Montserrat_500Medium',
        color: "#808080"
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
  videoShadow: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 2.5,
      shadowRadius: 3.84,
      elevation: 5,
    },
    nameFriendText: {
        fontSize: 12.29,
        padding: 2.5,
        paddingBottom: 0,
        width: '90%',
        fontFamily: 'Montserrat_500Medium'
    },
    friendsContainer: {
        borderRadius: 10,
        borderBottomColor: "#d3d3d3",
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        width: '95%',
        marginLeft: '2.5%'
    },
    reportText: {
    color: "red",
    fontSize: 19.20,
    fontFamily: 'Montserrat_500Medium', 
    textAlign: 'center',
    padding: 10,
    paddingTop: 5
  },
  reportContentText: {
    fontSize: 19.20,
    fontFamily: 'Montserrat_500Medium', 
    textAlign: 'center',
    padding: 10
  },
  reportSupplementText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium', 
    padding: 10,
    alignSelf: 'center'
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
    listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginLeft: '5%',
    padding: 5
  },
})