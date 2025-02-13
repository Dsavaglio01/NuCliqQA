import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Dimensions} from 'react-native'
import React, {useState, useRef, useCallback, useEffect, useContext, Suspense} from 'react'
import Carousel from 'react-native-reanimated-carousel'
import {MaterialCommunityIcons, Entypo, Ionicons} from '@expo/vector-icons';
import { Menu } from 'react-native-paper';
import useAuth from '../Hooks/useAuth';
import { useFocusEffect, useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image'
import { updateDoc, doc, setDoc, collection, serverTimestamp, arrayUnion, arrayRemove, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import {BACKEND_URL} from "@env"
import { Audio } from 'expo-av';
import NextButton from './NextButton';
import themeContext from '../lib/themeContext';
import _ from 'lodash'
import FollowButtons from './FollowButtons';
import CommentsModal from './Posts/Comments';
import { ableToShareVideoFunction, addSaveToPost, removeSaveFromPost} from '../firebaseUtils';
import LikeButton from './Posts/LikeButton';
import SaveButton from './Posts/SaveButton';
import { LazyVideo } from './Posts/LazyVideo';
import { schedulePushLikeNotification } from '../notificationFunctions';
//import Slider from '@react-native-community/slider';
const VideoPostComponent = ({data, fetchMoreData, home, loading, lastVisible, actualClique, blockedUsers, smallKeywords, largeKeywords, 
    ogUsername, pfp, reportedComments, reportedPosts, clique, cliqueId, username, admin, edit, caption, notificationToken}) => {
    const {user} = useAuth();
    const flatListRef = useRef(null);
    const videoRef = useRef(null);
    const [videoStatus, setVideoStatus] = useState({position: 0, duration: 0});
    const navigation = useNavigation();
    const [requests, setRequests] = useState([]);
    const [ableToShare, setAbleToShare] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const theme = useContext(themeContext)
    const [status, setStatus] = useState({})
    const [activeIndex, setActiveIndex] = useState(0);
    const [focusedPost, setFocusedPost] = useState(null);
    const [friends, setFriends] = useState([]);
    const [focused, setFocused] = useState(false);
    const [actualData, setActualData] = useState([]);
    const [activePostIndex, setActivePostIndex] = useState(0);
    const [commentModal, setCommentModal] = useState(false);
    const shouldShowProgressBar = videoStatus.duration > 15000;
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
      const fetchPostExistence = async () => {
        if (focusedPost != null) {
          try {
            const exists = await ableToShareVideoFunction(focusedPost.id);
            setAbleToShare(exists);
          } catch (error) {
            console.error(error.message);
            setAbleToShare(false); // Handle error by setting `ableToShare` to false
          }
          setCommentModal(true)
        }
    };
    fetchPostExistence();
    }, [focusedPost])
    const triggerAudio = async() => {
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
  async function addHomeLike(item, likedBy) {
      const updatedObject = { ...item };

    // Update the array in the copied object
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
        const response = await fetch(`http://10.0.0.225:4000/api/likeVideoPost`, {
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
  async function removeHomeLike(item) {
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
    removeSaveFromPost(item.id, user.uid, true)
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

  async function addHomeSave(item) {
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
    addSaveToPost(item.id, user.uid, true)
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
  const handleStatusUpdate = _.debounce((status) => {
    /* if (status.isLoaded) {
      setVideoStatus({
        position: status.positionMillis,
        duration: status.durationMillis,
      });
    } */
  }, 100)

  const handleSeek = async (value) => {
    console.log(value)
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value);
      
    }
  };
  const handleSnap = async (index) => {
    setActivePostIndex(0)
    setActiveIndex(0);
    if (index >= actualData.length - 2) {
      fetchMoreData();
    }
  };
  const handleSlidingComplete = async (value) => {
  if (videoRef.current) {
    await videoRef.current.setPositionAsync(value); 
    setIsPaused(false)
  }
};
    const renderItem = (item, index) => {
    if (item.item.likedBy != undefined) {
      if (item.item.post != null && item.item.post.length == 1 && item.item.post[0].video) {
    return (
    <>
        <View style={styles.ultimateVideoContainer} key={item.item.id}>
     <TouchableOpacity onPress={() => setIsPaused(!isPaused)} activeOpacity={1} style={{flex: 1}} onLongPress={() => openMenu(item.item)}>
      <View style={styles.captionPosting}>
            {!item.item ? <ActivityIndicator color={"#9EDAFF"} /> :
            
            <Suspense fallback={ <ActivityIndicator color={"#9EDAFF"} />}>
              <LazyVideo 
                videoRef={videoRef}
                style={styles.video}
                source={item.item.post[0].post}
                shouldPlay={item.index == activeIndex && focused && !isPaused ? true : false}
                onPlaybackStatusUpdate={handleStatusUpdate}  
              />
              
            </Suspense> 
        }
          {/* <Slider
            style={styles.slider}
            value={videoStatus.position}
            minimumValue={0}
            maximumValue={videoStatus.duration}
            onValueChange={handleSeek}
            onSlidingComplete={handleSlidingComplete}
            minimumTrackTintColor="#9edaff"
            maximumTrackTintColor="#000000"
            thumbTintColor="#9edaff"
          /> */}
          {/* {isPaused ? 
            <View style={styles.playButton}>
              <MaterialCommunityIcons name='play' size={60} color={"grey"}/>
            </View> 
          : null} */}
            </View>
            <View style={item.item.caption ? [styles.videoContainer, {marginTop: '-40%'}] : [styles.videoContainer, {marginTop: '-35%'}]}>
            {item.item.pfp ? <FastImage source={{uri: item.item.pfp, priority: 'normal'}} style={styles.pfp}/> : 
          <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.pfp}/>
          }
          <View style={styles.userHeader}>
            <TouchableOpacity onPress={item.item.userId != user.uid ? () => navigation.navigate('ViewingProfile', {name: item.item.userId, viewing: true}) : () => navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})}>
              <Text numberOfLines={1} style={styles.addText}>@{item.item.username}</Text>
            </TouchableOpacity>
            {!item.item.blockedUsers.includes(user.uid) ? item.item.loading ? <View style={styles.rightAddContainer}>
            <ActivityIndicator color={"#9edaff"}/> 
            </View> :
            <FollowButtons actualData={actualData} friendId={item.item.userId} updateActualData={setActualData} username={username} user={user} item={item.item} ogUsername={ogUsername} smallKeywords={smallKeywords} largeKeywords={largeKeywords} style={{marginTop: 5}}/> : null
   }
          </View>
            {!reportedPosts.includes(item.item.id) ? 
          <TouchableOpacity style={styles.menuContainer}>
            <Menu visible={item.item.reportVisible}
                    onDismiss={() => closeMenu(item.item)}
                    contentStyle={styles.menuContentStyle}
                    anchor={<Entypo name='dots-three-vertical' size={25} color={"transparent"} onPress={null}/>}>
                  <Menu.Item title="Report" titleStyle={{color: "#fafafa"}} onPress={() => navigation.navigate('ReportPage', {id: item.item.id, theme: false, comment: null, cliqueId: null, post: true, video: true, comments: false, message: false, cliqueMessage: false, reportedUser: item.item.userId})}/>
            </Menu>
          
            </TouchableOpacity>
            : null }
          </View> 
          {item.item.post[0].video ? item.item.caption.length > 0 ? 
            <TouchableOpacity style={styles.videoCaptionContainer} onPress={() => setFocusedPost(item.item)}>
              <Text numberOfLines={1} style={styles.username}><Text style={styles.usernameCaption}>{item.item.username}</Text> 
              {`${edit ? caption ? item.item.caption : item.item.caption : item.item.caption}`}</Text>
          </TouchableOpacity> : null : null}
            {
            <View style={item.item.mentions && item.item.mentions.length > 0 ? {flexDirection: 'column', marginTop: '-64%', width: 100, marginLeft: '80%', justifyContent: 'flex-end'} : {flexDirection: 'column', marginTop: '-50%', width: 100, marginLeft: '80%', justifyContent: 'flex-end'} }>
              <LikeButton videoStyling={true} item={item} user={user} updateTempPostsAddLike={addHomeLike} friends={friends} requests={requests} 
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
          <SaveButton item={item} user={user} updateTempPostsAddSave={addHomeSave} home={home} clique={clique} videoStyling={true}
          updateTempPostsCliqueAddSave={addCliqueSave} updateTempPostsCliqueRemoveSave={removeCliqueSave} 
          updateTempPostsRemoveSave={removeHomeSave}/>
          {item.item.mentions && item.item.mentions.length > 0 ?
          <TouchableOpacity style={{margin: '5%'}} onPress={() => navigation.navigate('Mention', {mentions: item.item.mentions, friends: friends, requests: requests})}>
            <MaterialCommunityIcons name='at' size={Dimensions.get('screen').height / 37.5} style={styles.at} color={"#fafafa"}/>
          </TouchableOpacity>
          : null}
          </View>}
        
        </TouchableOpacity>
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
      {focusedPost != null && commentModal ? 
    <CommentsModal actualData={actualData} handleActualData={setActualData} commentModal={commentModal} videoStyling={true} closeCommentModal={() => setCommentModal(false)}
    postNull={() => setFocusedPost(null)} user={user} username={username} reportedComments={reportedComments} focusedPost={focusedPost}
    ableToShare={ableToShare} pfp={pfp} notificationToken={notificationToken} blockedUsers={blockedUsers}/> : null}
    {actualData.length > 0 ? 
          <Carousel
          width={Dimensions.get('screen').width}
          data={actualData}
          vertical

          height={Dimensions.get('screen').height}
          ref={flatListRef}
          renderItem={renderItem}
          loop={false}
          onSnapToItem={handleSnap}
          
          
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

export default VideoPostComponent

const styles = StyleSheet.create({
    ultimateVideoContainer: {
      shadowColor: "#000000",
      elevation: 20,
      shadowOffset: {width: 2, height: 3},
      shadowOpacity: 0.5,
      shadowRadius: 1,
      backgroundColor: "#121212",
      height: '100%',
      borderTopWidth: 0.25,
      marginTop: 0
    },
    video: {
      width: '100%',
      height: '100%',
      backgroundColor: "#121212"
    },
    rightAddContainer: {
      marginLeft: 'auto',
      alignItems: 'flex-end',
      marginRight: 5
    },
    addText: {
      fontFamily: 'Monserrat_500Medium',
      color: "#fafafa",
      padding: 7.5,
      alignSelf: 'center',
      marginRight: 'auto', 
      fontSize: Dimensions.get('screen').height / 54.95
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
    sendingVideo: {
      alignSelf: 'center', 
      marginLeft: '2.5%', 
      paddingVertical: 5, 
      paddingTop: 2.5
    },
    usernameCaption: {
      fontFamily: 'Montserrat_700Bold', 
      fontSize: Dimensions.get('screen').height / 54.95
    },
    loadingContainer: {
      height: 25, 
      marginTop: '2.5%'
    },
    pfp: {
        height: Dimensions.get('screen').height / 30.36,
        width: Dimensions.get('screen').height / 30.36, 
        borderRadius: 8
    },
    userHeader: {
        flexDirection: 'row', 
        width: '70%'
    },
    videoContainer: {
        flexDirection: 'row', 
        width: '90%', 
        marginLeft: '5%', 
        justifyContent: 'flex-start'
    },
    menuContentStyle: {
        backgroundColor: "#121212",
        alignSelf: 'center', 
        borderWidth: 1, 
        borderColor: "#71797E"
    },
    username: {
      color: "#fafafa",
      fontSize: Dimensions.get('screen').height / 54.95, 
      width: '80%'
    },
    at: {
      alignSelf: 'center', 
      paddingLeft: 2.5, 
      paddingTop: 2.5
    },
    playButton: {
      position: 'absolute',
      bottom: '47.5%',
      left: '45%'
    },
    slider: { 
      position: 'absolute',
      bottom: 75,
      width: "98%",
      marginLeft: '1%', 
      height: 20 
    },
})