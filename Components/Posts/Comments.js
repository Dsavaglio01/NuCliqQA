import { StyleSheet, Text, View, Modal, TouchableOpacity, TouchableHighlight, FlatList, Keyboard, 
  ActivityIndicator, KeyboardAvoidingView, TextInput, Alert,
  Dimensions} from 'react-native'
import Animated, {useSharedValue, useAnimatedStyle, runOnJS} from 'react-native-reanimated';
import React, { useRef, useState, useEffect, useCallback, useContext } from 'react'
import ReportModal from './ReportModal'
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import { Divider } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import getDateAndTime from '../../lib/getDateAndTime';
import { addCommentLike, fetchMoreComments, removeCommentLike, fetchComments} from '../../firebaseUtils';
import {TEXT_MODERATION_URL} from '@env'
import { Timestamp } from 'firebase/firestore';
import { schedulePushCommentNotification, schedulePushCommentReplyNotification } from '../../notificationFunctions';
import _ from 'lodash';
import NextButton from '../NextButton';
import ProfileContext from '../../lib/profileContext';
import { db } from '../../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

const { width, height } = Dimensions.get('screen');
const CommentsModal = ({commentModal, closeCommentModal, deleteReply, postNull, user, reportedComments, username, focusedPost, ableToShare,
    blockedUsers, pfp, notificationToken, videoStyling, actualData, handleActualData
}) => {
    const profile = useContext(ProfileContext)
    const navigation = useNavigation();
    const textInputRef = useRef(null);
    const handleClose = () => {
        closeCommentModal()
    }
    const handlePost = () => {
        postNull()
    }
    const handleData = (data) => {
      handleActualData(data);
    }
    const handleScroll = _.debounce((event) => {
      // Your logic for fetching more data
      fetchMoreCommentData()
    }, 500);
    let row = [];
    let prevOpenedRow;
    const [reportCommentModal, setReportCommentModal] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyFocus, setReplyFocus] = useState(false);
    const [replyToReplyFocus, setReplyToReplyFocus] = useState(false)
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [reportComment, setReportComment] = useState(null);
    const [singleCommentLoading, setSingleCommentLoading] = useState(false);
    const [tempReplyName, setTempReplyName] = useState('');
    const [tempCommentId, setTempCommentId] = useState(null);
    const [replyLastVisible, setReplyLastVisible] = useState(null);
    const [tempReplyId, setTempReplyId] = useState(0);
    const [reply, setReply] = useState('');
    const [lastCommentVisible, setLastCommentVisible] = useState(null);
    const translationY = useSharedValue(0);
    const prevTranslationY = useSharedValue(0);

    const animatedStyles = useAnimatedStyle(() => ({
      transform: [
        { translateY: translationY.value },
      ],
    }));
    const pan = Gesture.Pan()
    .minDistance(1)
    .onStart(() => {
      prevTranslationY.value = translationY.value;
    })
    .onUpdate((event) => {
      const maxTranslateY = height / 2 - 150;
      translationY.value = clamp(
        prevTranslationY.value + event.translationY,
        0,
        maxTranslateY
      );
    }).onEnd(() => {
    if (translationY.value >= height / 2 - 150) {
      // Activate your function here
      {handleClose(); 
        setReportCommentModal(false); 
        handlePost();
        setComments([]); 
        setNewComment(''); 
        setReplyFocus(false); 
        setReplyToReplyFocus(false)}
    }
  })
    .runOnJS(true);
    useEffect(() => {
      if (textInputRef.current && replyToReplyFocus) { 
        textInputRef.current.focus();
      }
    }, [replyToReplyFocus]);
    useEffect(() => {
      const loadComments = async() => {
        if (videoStyling) {
          const { comments, lastVisible } = await fetchComments(focusedPost, blockedUsers, 'videos')
          setComments(comments)
          setLastCommentVisible(lastVisible);
        }
        else {
          const { comments, lastVisible } = await fetchComments(focusedPost, blockedUsers, 'posts')
          setComments(comments)
          setLastCommentVisible(lastVisible);
        }
        }
       
        loadComments();
    }, [])
    const handleNewComment = (inputText) => {
    const sanitizedText = inputText.replace(/\n/g, ''); // Remove all new line characters
    setNewComment(sanitizedText);
    }
    const handleReply = (inputText) => {
        const sanitizedText = inputText.replace(/\n/g, ''); // Remove all new line characters
        setReply(sanitizedText);
    }
    const handleKeyPress = ({ nativeEvent }) => {
      if (nativeEvent.key === 'Enter') {
        // Prevent user from manually inserting new lines
        return;
      }
    };
    async function fetchMoreCommentData () {
      if (lastCommentVisible != undefined && videoStyling) {
          const { newComments, lastVisible: newLastVisible } = await fetchMoreComments(focusedPost, lastCommentVisible, blockedUsers, 'videos')
          setComments([...comments, ...newComments]);
          setLastCommentVisible(newLastVisible);
      }
      else if (lastCommentVisible != undefined && !videoStyling) {
          const { newComments, lastVisible: newLastVisible } = await fetchMoreComments(focusedPost, lastCommentVisible, blockedUsers, 'posts')
          setComments([...comments, ...newComments]);
          setLastCommentVisible(newLastVisible);
      }
    }
    const deleteReplyFunction = useCallback(
      async(currentItem, currentElement) => {
        if (currentItem && currentElement) {
          await deleteReply(item, element)
        }
        else {
          console.error("Error: 'item' is undefined.");
        }
        
      },
      [deleteReply],
    )
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
    async function addNewReplyToReply(){
if (!ableToShare) {
    Alert.alert('Post unavailable to reply')
  }
  else if (videoStyling) {
  setSingleCommentLoading(true)
  
  const commentSnap = await getDoc(doc(db, 'videos', focusedPost.id, 'comments', tempCommentId))
  const newReply = {
    reply: reply,
            pfp: pfp,
            notificationToken: notificationToken,
            username: profile.userName,
            replyToComment: false,
            replyTo: tempReplyName,
            timestamp: Timestamp.fromDate(new Date()),
            likedBy: [],
            postId: focusedPost.id,
            user: user.uid
  }
  if (commentSnap.exists() && username !== commentSnap.data().username) {
    try {
                            const response = await fetch(`http://10.0.0.225:4000/api/newReplyToReplyVideo`, {
                          method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                          headers: {
                            'Content-Type': 'application/json', // Set content type as needed
                          },
                          body: JSON.stringify({ data: {tempCommentId: tempCommentId, textModerationURL: TEXT_MODERATION_URL, newReply: newReply, commentSnap: commentSnap.data(), reply: reply, user: user.uid, focusedPost: focusedPost, username: profile.userName}}), // Send data as needed
                        })
                        const data = await response.json();
                        if (data.link) {
                          linkUsernameAlert()
                        }
                        else if (data.profanity) {
                          profanityUsernameAlert()
                        }
                        else if (data.done) {
        
              const updatedData = comments.filter((e) => e.id == tempCommentId)
              const newObject = {reply: reply,
                commentId: tempCommentId,
                loading: false,
            pfp: pfp,
            notificationToken: notificationToken,
            username: profile.userName,
            replyToComment: false,
            replyTo: tempReplyName,
            timestamp: Timestamp.fromDate(new Date()),
            likedBy: [],
            postId: focusedPost.id,
            user: user.uid}
            // Add the new object to the array
            updatedData[0].actualReplies = [...updatedData[0].actualReplies, newObject]
            const objectInd = comments.findIndex(obj => obj.id === tempCommentId)
            const dataUpdated = [...comments];
            dataUpdated[objectInd] = updatedData[0];
            setComments(dataUpdated)
            
            const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = actualData.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        console.log(objectIndex)
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        handleData(updatedData);
      }
      setReply('')
      setReplyToReplyFocus(false)
      setSingleCommentLoading(false)
      schedulePushCommentReplyNotification(commentSnap.data().user, profile.userName, commentSnap.data().notificationToken, reply)
    }
  } catch (e) {
    console.error(e);
    
  }
  }
  else if(commentSnap.exists()) {
       try {
                            const response = await fetch(`http://10.0.0.225:4000/api/newReplyToReplyVideoUsername`, {
                          method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                          headers: {
                            'Content-Type': 'application/json', // Set content type as needed
                          },
                          body: JSON.stringify({ data: {tempCommentId: tempCommentId, textModerationURL: TEXT_MODERATION_URL, newReply: newReply, focusedPost: focusedPost}}), // Send data as needed
                        })
                        const data = await response.json();
                        if (data.link) {
                          linkUsernameAlert()
                        }
                        else if (data.profanity) {
                          profanityUsernameAlert()
                        }
                        else if (data.done) {
              const updatedData = comments.filter((e) => e.id == tempCommentId)
              const newObject = {reply: reply,
                commentId: tempCommentId,
                loading: false,
            pfp: pfp,
            notificationToken: notificationToken,
            username: profile.userName,
            replyToComment: false,
            replyTo: tempReplyName,
            timestamp: Timestamp.fromDate(new Date()),
            likedBy: [],
            postId: focusedPost.id,
            user: user.uid}
            // Add the new object to the array
            updatedData[0].actualReplies = [...updatedData[0].actualReplies, newObject]
            const objectInd = comments.findIndex(obj => obj.id === tempCommentId)
            const dataUpdated = [...comments];
            dataUpdated[objectInd] = updatedData[0];
            setComments(dataUpdated)
            const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = actualData.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        console.log(objectIndex)
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        handleData(updatedData);
      }
      setReply('')
      setReplyToReplyFocus(false)
      setSingleCommentLoading(false)
    }
  } catch (e) {
    console.error(e);
    
  }
  }
   else {
        Alert.alert('Post unavailable to comment')
        setReply('')
       setReplyToReplyFocus(false)
      }
  }
  else {
    
  setSingleCommentLoading(true)
  
  const commentSnap = await getDoc(doc(db, 'posts', focusedPost.id, 'comments', tempCommentId))
  const newReply = {
    reply: reply,
            pfp: pfp,
            notificationToken: notificationToken,
            username: profile.userName,
            replyToComment: false,
            replyTo: tempReplyName,
            timestamp: Timestamp.fromDate(new Date()),
            likedBy: [],
            postId: focusedPost.id,
            user: user.uid
  }
  console.log(tempReplyName)
  if (commentSnap.exists() && username !== commentSnap.data().username) {
    try {
                            const response = await fetch(`http://10.0.0.225:4000/api/newReplyToReply`, {
                          method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                          headers: {
                            'Content-Type': 'application/json', // Set content type as needed
                          },
                          body: JSON.stringify({ data: {tempCommentId: tempCommentId, textModerationURL: TEXT_MODERATION_URL, newReply: newReply, commentSnap: commentSnap.data(), reply: reply, user: user.uid, focusedPost: focusedPost, username: profile.userName}}), // Send data as needed
                        })
                        const data = await response.json();
                        if (data.link) {
                          linkUsernameAlert()
                        }
                        else if (data.profanity) {
                          profanityUsernameAlert()
                        }
                        else if (data.done) {
              const updatedData = comments.filter((e) => e.id == tempCommentId)
              const newObject = {reply: reply,
                commentId: tempCommentId,
                loading: false,
            pfp: pfp,
            notificationToken: notificationToken,
            username: profile.userName,
            replyToComment: false,
            replyTo: tempReplyName,
            timestamp: Timestamp.fromDate(new Date()),
            likedBy: [],
            postId: focusedPost.id,
            user: user.uid}
            // Add the new object to the array
            updatedData[0].actualReplies = [...updatedData[0].actualReplies, newObject]
            const objectInd = comments.findIndex(obj => obj.id === tempCommentId)
            const dataUpdated = [...comments];
            dataUpdated[objectInd] = updatedData[0];
            setComments(dataUpdated)
            
            const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = actualData.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        console.log(objectIndex)
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        handleData(updatedData);
      }
      setReply('')
      setReplyToReplyFocus(false)
      setSingleCommentLoading(false)
      schedulePushCommentReplyNotification(commentSnap.data().user, username, commentSnap.data().notificationToken, reply)
    }
  } catch (e) {
    console.error(e);
    
  }
  }
  else if(commentSnap.exists()) {
        try {
                            const response = await fetch(`http://10.0.0.225:4000/api/newReplyToReplyUsername`, {
                          method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                          headers: {
                            'Content-Type': 'application/json', // Set content type as needed
                          },
                          body: JSON.stringify({ data: {tempCommentId: tempCommentId, textModerationURL: TEXT_MODERATION_URL, newReply: newReply, focusedPost: focusedPost}}), // Send data as needed
                        })
                        const data = await response.json();
                       if (data.link) {
                          linkUsernameAlert()
                        }
                        else if (data.profanity) {
                          profanityUsernameAlert()
                        }
                        else if (data.done) {
        
              const updatedData = comments.filter((e) => e.id == tempCommentId)
              const newObject = {reply: reply,
                commentId: tempCommentId,
                loading: false,
            pfp: pfp,
            notificationToken: notificationToken,
            username: profile.userName,
            replyToComment: false,
            replyTo: tempReplyName,
            timestamp: Timestamp.fromDate(new Date()),
            likedBy: [],
            postId: focusedPost.id,
            user: user.uid}
            // Add the new object to the array
            updatedData[0].actualReplies = [...updatedData[0].actualReplies, newObject]
            const objectInd = comments.findIndex(obj => obj.id === tempCommentId)
            const dataUpdated = [...comments];
            dataUpdated[objectInd] = updatedData[0];
            setComments(dataUpdated)
            
           const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = actualData.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        console.log(objectIndex)
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        handleData(updatedData);
      }
      setReply('')
     setReplyToReplyFocus(false)
      setSingleCommentLoading(false)
    }
  } catch (e) {
    console.error(e);
    
  }
  }
   else {
        Alert.alert('Post unavailable to comment')
        setReply('')
        setReplyToReplyFocus(false)
      }
  }
}
    async function addNewReply(){
  if (!ableToShare) {
    Alert.alert('Post unavailable to reply')
  }
  else if (videoStyling) {
    
  setSingleCommentLoading(true)
  const commentSnap = await getDoc(doc(db, 'videos', focusedPost.id, 'comments', tempReplyId))
    const newReply = {reply: reply,
            pfp: pfp,
            notificationToken: notificationToken,
            username: profile.userName,
            replyToComment: true,
            timestamp: Timestamp.fromDate(new Date()),
            likedBy: [],
            postId: focusedPost.id,
            user: user.uid}
  if (commentSnap.exists() && commentSnap.data().username !== profile.userName) {
    try {
                            const response = await fetch(`http://10.0.0.225:4000/api/newReplyVideo`, {
                          method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                          headers: {
                            'Content-Type': 'application/json', // Set content type as needed
                          },
                          body: JSON.stringify({ data: {tempReplyId: tempReplyId, textModerationURL: TEXT_MODERATION_URL, newReply: newReply, commentSnap: commentSnap.data(), reply: reply, user: user.uid, focusedPost: focusedPost, username: profile.userName}}), // Send data as needed
                        })
                        const data = await response.json();
                        if (data.link) {
                          linkUsernameAlert()
                        }
                        else if (data.profanity) {
                          profanityUsernameAlert()
                        }
                        else if (data.done) {
              const updatedData = comments.filter((e) => e.id == tempReplyId)
              const newObject = {reply: reply,
                commentId: tempReplyId,
                loading: false,
            pfp: pfp,
            notificationToken: notificationToken,
            username: profile.userName,
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
            const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = actualData.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        console.log(objectIndex)
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        handleData(updatedData);
      }
     setReply('')
     setReplyFocus(false)
     setSingleCommentLoading(false)
     schedulePushCommentReplyNotification(commentSnap.data().user, profile.userName, commentSnap.data().notificationToken, reply)
    }
  }
  catch (e) {
    console.error(e);
    
  }
  }
  else if (commentSnap.exists()) {
    console.log('bruh')
    try {
                            const response = await fetch(`http://10.0.0.225:4000/api/newReplyVideoUsername`, {
                          method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                          headers: {
                            'Content-Type': 'application/json', // Set content type as needed
                          },
                          body: JSON.stringify({ data: {tempReplyId: tempReplyId, reply: reply, textModerationURL: TEXT_MODERATION_URL, newReply: newReply, user: user.uid, focusedPost: focusedPost,}}), // Send data as needed
                        })
                        const data = await response.json();
                        if (data.link) {
                          linkUsernameAlert()
                        }
                        else if (data.profanity) {
                          profanityUsernameAlert()
                        }
                        else if (data.done) {
                        console.log(data)
              const updatedData = comments.filter((e) => e.id == tempReplyId)
              const newObject = {reply: reply,
                commentId: tempReplyId,
                loading: false,
            pfp: pfp,
            notificationToken: notificationToken,
            username: profile.userName,
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
            
            const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = actualData.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        console.log(objectIndex)
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        handleData(updatedData);
      }
      setReply('')
      setSingleCommentLoading(false)
      setReplyFocus(false)
    }
  } catch (e) {
    console.error(e);
    
  }
  }
  else {
        Alert.alert('Post unavailable to comment')
        setReply('')
        setReplyFocus(false)
      }
  }
  else {
    console.log('fjdsklfsdklfksklfdkldfsljk')
  setSingleCommentLoading(true)
  console.log(`tempReplyId: ${tempReplyId}`)
  const commentSnap = await getDoc(doc(db, 'posts', focusedPost.id, 'comments', tempReplyId))
  console.log(commentSnap.exists())
    const newReply = {reply: reply,
            pfp: pfp,
            notificationToken: notificationToken,
            username: profile.userName,
            replyToComment: true,
            timestamp: Timestamp.fromDate(new Date()),
            likedBy: [],
            postId: focusedPost.id,
            user: user.uid}
  //console.log(commentSnap.exists() && commentSnap.data().username !== username)
  if (commentSnap.exists() && commentSnap.data().username !== profile.userName) {
    //console.log(tempReplyId, newReply, commentSnap, reply, user.uid, focusedPost, username)
   try {
                            const response = await fetch(`http://10.0.0.225:4000/api/newReply`, {
                          method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                          headers: {
                            'Content-Type': 'application/json', // Set content type as needed
                          },
                          body: JSON.stringify({ data: {tempReplyId: tempReplyId, textModerationURL: TEXT_MODERATION_URL, newReply: newReply, commentSnap: commentSnap.data(), reply: reply, user: user.uid, focusedPost: focusedPost, username: profile.userName}}), // Send data as needed
                        })
                        const data = await response.json();
                        if (data.link) {
                          linkUsernameAlert()
                        }
                        else if (data.profanity) {
                          profanityUsernameAlert()
                        }
                        else if (data.done) {
   //console.log(data)
   
              const updatedData = comments.filter((e) => e.id == tempReplyId)
              const newObject = {reply: reply,
                commentId: tempReplyId,
                loading: false,
            pfp: pfp,
            notificationToken: notificationToken,
            username: profile.userName,
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
            const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = actualData.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        console.log(objectIndex)
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        handleData(updatedData);
      }
            
      setReply('')
      setReplyFocus(false)
      setSingleCommentLoading(false)
      schedulePushCommentReplyNotification(commentSnap.data().user, username, commentSnap.data().notificationToken, reply)
    }
  }
    catch (e) {
      console.error(e);
      
    }
  }
  else if (commentSnap.exists()) {
    console.log('j')
    try {
                            const response = await fetch(`http://10.0.0.225:4000/api/newReplyUsername`, {
                          method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                          headers: {
                            'Content-Type': 'application/json', // Set content type as needed
                          },
                          body: JSON.stringify({ data: {tempReplyId: tempReplyId, reply: reply, textModerationURL: TEXT_MODERATION_URL, newReply: newReply, user: user.uid, focusedPost: focusedPost,}}), // Send data as needed
                        })
                        const data = await response.json();
                        //console.log(data)
                        if (data.link) {
                          linkUsernameAlert()
                        }
                        else if (data.profanity) {
                          profanityUsernameAlert()
                        }
                        else if (data.done) {
              const updatedData = comments.filter((e) => e.id == tempReplyId)
              const newObject = {reply: reply,
                commentId: tempReplyId,
                loading: false,
            pfp: pfp,
            notificationToken: notificationToken,
            username: profile.userName,
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
            
           const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = actualData.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        console.log(objectIndex)
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        handleData(updatedData);
      }
      setReply('')
        setSingleCommentLoading(false)
        setReplyFocus(false)
    } 
  }
    catch (e) {
      console.error(e);
      
    }
  }
  else {
        Alert.alert('Post unavailable to comment')
        setReply('')
        setReplyFocus(false)
      }
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
    if (!videoStyling) {
                    if (username == focusedPost.username) {
                                        try {
                            const response = await fetch(`http://10.0.0.225:4000/api/newCommentUsername`, {
                          method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                          headers: {
                            'Content-Type': 'application/json', // Set content type as needed
                          },
                          body: JSON.stringify({ data: {newComment: newComment, textModerationURL: TEXT_MODERATION_URL, blockedUsers: blockedUsers, pfp: pfp, notificationToken: notificationToken, user: user.uid, focusedPost: focusedPost, username: profile.userName}}), // Send data as needed
                        })
                        const data = await response.json();
                        if (data.link) {
                          linkUsernameAlert()
                        }
                        else if (data.profanity) {
                          profanityUsernameAlert()
                        }
                        else if (data.done) {
                                        setComments([...comments, {id: data.docRef, comment: newComment, showReply: false, loading: false,
                                            pfp: pfp,
                                            notificationToken: notificationToken,
                                            username: profile.userName,
                                            timestamp: Timestamp.fromDate(new Date()),
                                            likedBy: [],
                                            replies: [],
                                            user: user.uid,
                                            postId: focusedPost.id}])
                        const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = actualData.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        handleData(updatedData);
      }
        setNewComment('')
        setSingleCommentLoading(false)
        }
        }
                          catch (e) {
                            console.error(e);
                            
                          }
                    }
                    else {
                     try {
                            const response = await fetch(`http://10.0.0.225:4000/api/newComment`, {
                          method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                          headers: {
                            'Content-Type': 'application/json', // Set content type as needed
                          },
                          body: JSON.stringify({ data: {newComment: newComment, textModerationURL: TEXT_MODERATION_URL, blockedUsers: blockedUsers, pfp: pfp, notificationToken: notificationToken, user: user.uid, focusedPost: focusedPost, username: profile.userName}}), // Send data as needed
                        })
                        const data = await response.json();
                        if (data.link) {
                          linkUsernameAlert()
                        }
                        else if (data.profanity) {
                          profanityUsernameAlert()
                        }
                        else if (data.done) {
                          
                      setComments([...comments, {id: data.docRef, comment: newComment, showReply: false, loading: false,
                                            pfp: pfp,
                                            notificationToken: notificationToken,
                                            username: profile.userName,
                                            timestamp: Timestamp.fromDate(new Date()),
                                            likedBy: [],
                                            replies: [],
                                            user: user.uid,
                                            postId: focusedPost.id}])
                      const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = actualData.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        console.log(objectIndex)
        // Create a new array with the replaced object
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        handleData(updatedData);
      }
      setNewComment('')
        setSingleCommentLoading(false)
        schedulePushCommentNotification(focusedPost.userId, username, focusedPost.notificationToken, newComment)
    }
        }
                          catch (e) {
                            console.error(e);
                            
                          }
                    }
                      }
                      else {
                        if (username == focusedPost.username) {
                                        try {
                            const response = await fetch(`http://10.0.0.225:4000/api/newCommentVideoUsername`, {
                          method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                          headers: {
                            'Content-Type': 'application/json', // Set content type as needed
                          },
                          body: JSON.stringify({ data: {newComment: newComment, textModerationURL: TEXT_MODERATION_URL, blockedUsers: blockedUsers, pfp: pfp, notificationToken: notificationToken, user: user.uid, focusedPost: focusedPost, username: profile.userName}}), // Send data as needed
                        })
                        const data = await response.json();
                        if (data.link) {
                          linkUsernameAlert()
                        }
                        else if (data.profanity) {
                          profanityUsernameAlert()
                        }
                        else if (data.done) {
                                        setComments([...comments, {id: data.docRef, comment: newComment, showReply: false, loading: false,
                                            pfp: pfp,
                                            notificationToken: notificationToken,
                                            username: profile.userName,
                                            timestamp: Timestamp.fromDate(new Date()),
                                            likedBy: [],
                                            replies: [],
                                            user: user.uid,
                                            postId: focusedPost.id}])
                                            const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = actualData.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        // Create a new array with the replaced object
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        handleData(updatedData);
      }
      setNewComment('')
      setSingleCommentLoading(false)
    }
  } catch (e) {
    console.error(e);
    
  }
                    }
                    else {
                      console.log('fkdsjfklskl')
                      try {
                            const response = await fetch(`http://10.0.0.225:4000/api/newCommentVideo`, {
                          method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                          headers: {
                            'Content-Type': 'application/json', // Set content type as needed
                          },
                          body: JSON.stringify({ data: {newComment: newComment, textModerationURL: TEXT_MODERATION_URL, blockedUsers: blockedUsers, pfp: pfp, notificationToken: notificationToken, user: user.uid, focusedPost: focusedPost, username: profile.userName}}), // Send data as needed
                        })
                        const data = await response.json();
                        if (data.link) {
                          linkUsernameAlert()
                        }
                        else if (data.profanity) {
                          profanityUsernameAlert()
                        }
                        else if (data.done) {
                      setComments([...comments, {id: data.docRef, comment: newComment, showReply: false, loading: false,
                                            pfp: pfp,
                                            notificationToken: notificationToken,
                                            username: profile.userName,
                                            timestamp: Timestamp.fromDate(new Date()),
                                            likedBy: [],
                                            replies: [],
                                            user: user.uid,
                                            postId: focusedPost.id}])
                     const updatedObject = { ...focusedPost };

    // Update the array in the copied object
    updatedObject.comments = updatedObject.comments + 1;
    const objectIndex = actualData.findIndex(obj => obj.id === focusedPost.id);
      if (objectIndex !== -1) {
        console.log(objectIndex)
        // Create a new array with the replaced object
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        handleData(updatedData);
      }
      setNewComment('')
      setSingleCommentLoading(false)
      schedulePushCommentNotification(focusedPost.userId, username, focusedPost.notificationToken, newComment)
    } 
  } catch (e) {
    console.error(e);
    
  }
                    }
                      
                      }
                    
                }
        //console.log(newComment)
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
        handleClose()
        postNull();
        setComments([]);
        if (item.id == user.uid) {
          navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})
        }
        else {
        navigation.navigate('ViewingProfile', {name: item.id, viewing: true})
        }
      } 
      })
    }
    getData();
  }
  
  return (
      <Text style={props.image ? [styles.commentText, {color: "#fafafa"}] : [styles.commentText, { fontSize: 12.29, paddingTop: 5, color: "#fafafa"}]}>
      {text.slice(0).map((text) => {

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
function replySecondFunction(item) {
  setReplyFocus(true); 
  if (textInputRef.current) {
    textInputRef.current.focus();
  }
  setTempReplyName(item.username); 
  setTempReplyId(item.id);
}
function replyFunction(item, element) {
  
  setReplyToReplyFocus(true); 
  if (textInputRef.current) {
    console.log(textInputRef.current)
    textInputRef.current.focus(); 
  }
  else {
    console.log('fds')
  }
  
  setTempReplyName(element.username); 
  setTempCommentId(item.id); 
  setTempReplyId(element.id);
}
async function toggleShowReply(e) {
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
  await addCommentLike(item, user, setComments, comments, username, focusedPost)
  }
  async function removeLike(item) {
  await removeCommentLike(item, user, setComments, comments, focusedPost)
  }
  
    const renderComments = ({item, index}, onClick) => {
    const closeRow = (index) => {
      if (prevOpenedRow && prevOpenedRow !== row[index]) {
        prevOpenedRow.close();
      }
      prevOpenedRow = row[index];
    };
    const renderRightActions = (progress, dragX, onClick) => {
      return (
        <View style={styles.commentsContainer}>
          {item.user === user.uid ? 
            <TouchableOpacity style={styles.swipeContainer} onPress={() => deleteItem(item)}>
          <MaterialIcons name='delete-outline' size={35} style={{alignSelf: 'center'}} color="red"/>
        </TouchableOpacity>  : null}
        {item.user !== user.uid && !reportedComments.includes(item.id) ?
        <TouchableOpacity style={styles.swipeContainer} onPress={() => {setReportCommentModal(true); setReportComment(item)}}>
          <MaterialIcons name='report' size={40} style={{alignSelf: 'center'}} color="red"/>
          <Text style={styles.reportText}>Report</Text>
        </TouchableOpacity> : null
    }
        </View>
      );
    };
      if (item.loading) {
        return (
          <View style={{margin: '2.5%'}}>
            <ActivityIndicator color={"#9EDAFF"}/>
          </View>
          
        )
      }
      else {
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
          <FastImage source={require('../../assets/defaultpfp.jpg')} style={{height: 35, width: 35, borderRadius: 17.5}}/>}
            <View style={styles.commentSection}>
              <TouchableOpacity onPress={item.user == user.uid ? null : () => {handleClose(); navigation.navigate('ViewingProfile', {name: item.user, viewing: true})}}>
                <Text style={styles.usernameText}>@{item.username}</Text>
              </TouchableOpacity>
                <CustomCommentText text={`${item.comment}`}/>
                <View style={styles.commentFooterContainer}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={styles.dateText}>{getDateAndTime(item.timestamp)}</Text>
                        <TouchableOpacity style={styles.reply} onPress={() => replySecondFunction(item)}>
                            <Text style={styles.replyText}>Reply</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity style={{flexDirection: 'row'}} onPress={item.likedBy.includes(user.uid) == false ? () => addLike(item) : () => removeLike(item)}>
                            {item.likedBy.includes(user.uid) ? <MaterialCommunityIcons name='cards-heart' size={20} style={styles.liked} color="red"/> 
                            : <MaterialCommunityIcons name='cards-heart-outline' size={20} style={{alignSelf: 'center'}} color="#808080"/>}
                        </TouchableOpacity>
                        <Text style={styles.likedCommentText}>{item.likedBy.length}</Text>
                    </View>
                </View>
                {item.replies.length == 1 && item.showReply == false ? <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => toggleShowReply(item)}>
                    <Text style={styles.viewRepliesText}>View {item.replies.length} Reply</Text>
                    <MaterialCommunityIcons name='chevron-down' size={25} color="#808080" style={{alignSelf: 'center'}}/>
                </TouchableOpacity> : item.replies.length > 1 && item.showReply == false ? <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => toggleShowReply(item)}>
                    <Text style={styles.viewRepliesText}>View {item.replies.length} Replies</Text>
                    <MaterialCommunityIcons name='chevron-down' size={25} color="#808080" style={{alignSelf: 'center'}}/>
                </TouchableOpacity> : <></>}
                {item.showReply ? 
                    <View>
                        {item.actualReplies.map((element) => {
                          const closeRow = (index) => {
                              if (prevOpenedRow && prevOpenedRow !== row[index]) {
                                prevOpenedRow.close();
                              }
                              prevOpenedRow = row[index];
                            };
                            const renderRightActions = () => {
                              return (
                                <View style={styles.commentsContainer}>
                                  {element.user === user.uid ? 
                                    <TouchableOpacity style={styles.swipeContainer} onPress={() => deleteReplyFunction(item, element)}>
                                  <MaterialIcons name='delete-outline' size={35} style={{alignSelf: 'center'}} color="red"/>
                                </TouchableOpacity>  : null}
                                {element.user !== user.uid && !reportedComments.includes(element.id) ? 
                                <TouchableOpacity style={styles.swipeContainer} onPress={() => {setReportCommentModal(true); setReportComment(item)}}>
                                  <MaterialIcons name='report' size={40} style={{alignSelf: 'center'}} color="red"/>
                                  <Text style={styles.reportText}>Report</Text>
                                </TouchableOpacity> : null}
                                </View>
                              );
                            };
                            return (
                              !item.loading ? 
                              <>
                              <Swipeable renderRightActions={(progress, dragX) =>
                                    renderRightActions(progress, dragX, onClick)
                                  }
                                  onSwipeableOpen={() => closeRow(item.actualReplies.indexOf(element))}
                                  ref={(ref) => (row[item.actualReplies.indexOf(element)] = ref)}
                                  rightOpenValue={-100}>
                                <View style={styles.commentHeader}>
                                     {element.pfp ? <FastImage source={{uri: element.pfp, priority: 'normal'}} style={styles.replyPfp}/> :
          <FastImage source={require('../../assets/defaultpfp.jpg')} style={styles.replyPfp}/>}
                                    <View style={styles.commentSection}>
                                    {element.replyToComment == true ? <TouchableOpacity onPress={item.user == user.uid ? null 
                                        : () => {handleClose(); navigation.navigate('ViewingProfile', {name: item.user, viewing: true})}}>
                <Text style={styles.usernameText}>@{element.username}</Text>
              </TouchableOpacity> : <TouchableOpacity onPress={item.user == user.uid ? null : () => {handleClose(); navigation.navigate('ViewingProfile', {name: item.user, viewing: true})}}>
                                    <Text style={styles.usernameText}>@{element.username} {'>'} @{element.replyTo}</Text>
                                    </TouchableOpacity>}
                                    <CustomCommentText text={`${element.reply}`}/>
                                    <View style={styles.replyFooterContainer}>
                                        <View style={{flexDirection: 'row'}}>
                                            <Text style={styles.dateText}>{element.timestamp ? getDateAndTime(element.timestamp) : null}</Text>
                                            <TouchableOpacity style={styles.reply} onPress={() => replyFunction(item, element)}>
                                                <Text style={styles.replyText}>Reply</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    
                                    
                                    </View>
                                </View>
                                </Swipeable>
                                {replyLastVisible < item.replies.length && item.actualReplies.indexOf(element) == replyLastVisible - 1 ? 
                                <TouchableOpacity style={styles.showMoreContainer} onPress={() => toggleShowReply(item)}>
                          <Text style={styles.showMoreText}>Show more replies</Text>
                        </TouchableOpacity> : null}
                        </> : <View style={{margin: '2.5%'}}>
            <ActivityIndicator color={"#9EDAFF"}/>
          </View>
                            )
                        })}
                        
                        
                    
                    </View> 
                    : null}
            </View>
            
        </View>
        </Swipeable> 
        )
      }
}
  return (
    
   <Modal visible={commentModal} animationType="slide" transparent onRequestClose={() => handleClose()}>
    <GestureHandlerRootView>
    <GestureDetector gesture={pan}>
            <Animated.View style={[styles.modalContainer, animatedStyles]}>
                <View style={styles.modalView}>
                   <View style={styles.container}>
                    <View style={styles.line}/>
      {reportCommentModal ? <Text style={styles.headerText}>Report</Text> : <Text style={styles.headerText}>Comments</Text> }
       {/* <TouchableOpacity style={{marginLeft: 'auto'}} onPress={() => {handleClose(); setReportCommentModal(false); handlePost();
        setComments([]); setNewComment(''); setReplyFocus(false); setReplyToReplyFocus(false)}}>
            <MaterialCommunityIcons name='close' size={25} style={styles.close} color={"#fafafa"}/>
        </TouchableOpacity> */}
        
        {reportCommentModal ? 
        <ReportModal />
        : null}
        {focusedPost.caption.length > 0 && !reportCommentModal ? 
        <>
        <Divider />
        <View style={styles.userContainer}>
          <FastImage source={focusedPost.pfp ? {uri: focusedPost.pfp} : require('../../assets/defaultpfp.jpg')} style={styles.pfp}/>
          <View style={{flexWrap: 'wrap'}}>
            <Text style={styles.usernameText} numberOfLines={1}>{focusedPost.username}</Text>
            <Text style={styles.captionText}>{focusedPost.caption}</Text>
          </View>
          
        </View>
        <Divider /> 
        </>
        : null }
        
        {!reportCommentModal && comments.length == 0 && !commentsLoading ? 
        
        <>
        <TouchableHighlight onPress={Keyboard.dismiss} underlayColor={'transparent'} style={{flex: 1}}>
            <>
        <View style={styles.noCommentsContainer}>
            <Text style={styles.noCommentsText}>No Comments Yet</Text>
            <Text style={styles.firstCommentsText}>Be the First to Comment!</Text>
        </View>
            
        </>
        </TouchableHighlight>
        </>
        : !reportCommentModal ?
                <>
            <FlatList 
                data={comments.slice().sort((a, b) => b.timestamp - a.timestamp)}
                renderItem={(v) =>
          renderComments(v, () => {
            deleteItem(v);
          })}
                keyExtractor={item => item.id}
                ListFooterComponent={<View style={{paddingBottom: 30}}/>}
                style={{height: '40%'}}
                onScroll={handleScroll}
            />
            {commentsLoading && !reportCommentModal ? <View style={{justifyContent: 'flex-end', alignItems: 'center', marginBottom: '5%'}}>
              <ActivityIndicator color={"#9EDAFF"}/> 
            </View>
          
          : null}
            
            </>
   : !reportCommentModal ?
              <FlatList 
                data={filtered}
                renderItem={renderFriends}
                keyExtractor={item => item.id}
                ListFooterComponent={<View style={{paddingBottom: 30}}/>}
                style={{height: '40%'}}
                
            />
                
            : null
            }
    
    </View>
    {!reportCommentModal ? 
    <>
    <View style={{backgroundColor: 'transparent'}}>
    {/* <Text style={styles.characterCountText}>{replyToReplyFocus || replyFocus  ? reply.length : newComment.length}/200</Text> */}
    </View>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      <View behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.addCommentSecondContainer}>
              <View style={{flexDirection: 'row', marginTop: '5%', marginHorizontal: '5%', width: '90%'}}>
                 {pfp != undefined ? <FastImage source={{uri: pfp, priority: 'normal'}} style={{height: 35, width: 35, borderRadius: 25}}/> :
          <FastImage source={require('../../assets/defaultpfp.jpg')} style={{height: 35, width: 35, borderRadius: 25}}/>}
                {replyToReplyFocus ?
                    <TextInput ref={textInputRef} multiline onKeyPress={handleKeyPress} placeholder={tempReplyName != undefined ? `Reply To ${tempReplyName}` : 'Reply To'} maxLength={200} placeholderTextColor={"#fafafa"} autoFocus={replyToReplyFocus} style={styles.addCommentText} value={reply} onChangeText={handleReply} returnKeyType="send" onSubmitEditing={addNewReplyToReply}/>
                 : replyFocus ? 
                
                    <TextInput ref={textInputRef} multiline onKeyPress={handleKeyPress} placeholder={tempReplyName != undefined ? `Reply To ${tempReplyName}` : 'Reply To'} maxLength={200} placeholderTextColor={"#fafafa"} autoFocus={replyFocus} style={styles.addCommentText} value={reply} onChangeText={handleReply} returnKeyType="send" onSubmitEditing={addNewReply}/>
                : 
                    <TextInput ref={textInputRef} onKeyPress={handleKeyPress} autoFocus multiline placeholder='Add Comment...' maxLength={200} style={styles.addCommentText} placeholderTextColor={"#fafafa"} value={newComment} onChangeText={handleNewComment}/>
                }
                {!singleCommentLoading ?
                <View style={{marginLeft: 'auto'}}>
                <NextButton text={"Send"} textStyle={{paddingHorizontal: 0}} onPress={(newComment.length > 0 || reply.length > 0) ? replyToReplyFocus ? () => addNewReplyToReply() : replyFocus ? () => addNewReply() : () => addNewComment() : null}/>
                </View>
                : 
                <View style={{marginLeft: 'auto', alignItems: 'center', marginTop: '2.5%'}}>
                <ActivityIndicator color={"#9EDAFF"} style={{alignSelf: 'center'}}/>
                </View>
                }
                </View>
            </View>
    </KeyboardAvoidingView> 
    </>: null}
                </View>
            </Animated.View>
            </GestureDetector>
    </GestureHandlerRootView>
        </Modal>
    
  )
}

export default CommentsModal

const styles = StyleSheet.create({
    modalContainer: {
        marginTop: '20%',
        height: '100%',
        backgroundColor: "#121212"
    },
    modalView: {
        width: '100%',
        height: '100%',
    flexGrow: 1,
    backgroundColor: '#121212',
    borderRadius: 0,
    padding: 0,
    paddingTop: 5,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    },
    container: {
      flex: 1,
      backgroundColor: "#121212"
    },
    line: {
      height: 3,
      alignSelf: 'center',
      marginTop: '5%',
      width: 30,
      backgroundColor: "#fafafa",
      borderRadius: 1
    },
    headerText: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      textAlign: 'center',
      padding: 10,
      color: "#fafafa"
    },
    close: {
        marginTop: '-7.5%', 
        paddingRight: 10
    },
    userContainer: {
        flexDirection: 'row', 
        width: '95%', 
        margin: '2.5%'
    },
    pfp: {
        width: 40, 
        height: 40, 
        borderRadius: 8, 
        marginRight: 5
    },
    replyPfp: {
        height: 35, 
        width: 35, 
        borderRadius: 17.5
    },
    usernameText: {
        fontSize: 15.36,
       fontFamily: 'Montserrat_500Medium',
        paddingTop: 0,
        padding: 5,
        paddingBottom: 0,
        color: "#fafafa"
    },
    captionText: {
      fontSize: 15.35, 
      fontFamily: 'Montserrat_400Regular',
      padding: 5,
      paddingTop: 0,
      width: 333,
      color: "#fafafa"
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
        color: "#fafafa"
    },
    firstCommentsText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        padding: 10,
        color: "#fafafa"
    },
    commentsContainer: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    swipeContainer: {
        margin: 0,
        alignContent: 'center',
        justifyContent: 'center',
        width: 70,
    },
    reportText: {
        alignSelf: 'center', 
        color: 'red', 
        fontSize: 12.29, 
        fontFamily: 'Montserrat_400Regular'
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
    commentFooterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    replyFooterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginLeft: 2.5
    },
    dateText: {
        fontSize: 12.29,
        fontFamily: 'Montserrat_500Medium',
        padding: 5,
        color: "#fafafa",
        alignSelf: 'center'
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
    liked: {
        alignSelf: 'center', 
        paddingRight: 3
    },
    likedCommentText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 5,
        paddingBottom: 0,
        color: "#fafafa",
        alignSelf: 'center'
    },
    commentText: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      padding: 5,
      paddingBottom: 0
    },
    viewRepliesText: {
        fontSize: 12.29,
        padding: 5,
        fontFamily: 'Montserrat_500Medium',
        color: "#808080"
    },
    showMoreContainer: {
        marginLeft: '7.5%', 
        paddingLeft: 0, 
        padding: 10,
    },
    showMoreText: {
        textAlign: 'left', 
        fontFamily: 'Montserrat_500Medium', 
        color: "#fafafa",
    },
    addCommentSecondContainer: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        borderColor: "#fafafa",
        marginBottom: '25%',
        borderTopWidth: 0.25,
        width: '100%',
        backgroundColor: "transparent"
    },
    addCommentText: {
        fontSize: 12.29,
        fontFamily: 'Montserrat_500Medium',
        color: "#fafafa",
        padding: 10,
        width: '65%',
        alignSelf: 'center'
    },
})