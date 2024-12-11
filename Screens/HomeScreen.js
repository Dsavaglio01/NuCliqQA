import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator} from 'react-native'
import React, {useState, useEffect, useRef, useMemo, useCallback, useContext} from 'react'
import { Divider, Menu, Provider } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { onSnapshot, getDocs, collection, doc, getDoc} from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../firebase';
import {MaterialCommunityIcons, Ionicons} from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash'
import themeContext from '../lib/themeContext';
import FirstTimeModal from '../Components/FirstTimeModal';
import RepostModal from '../Components/Posts/RepostModal';
import StoryModal from '../Components/Posts/StoryModal';
import { fetchNotifications, fetchPublicPostsExcludingBlockedUsers, fetchStory, getChangingProfileDetails, getProfileDetails, 
  fetchUserFeedPosts, fetchMorePublicPostsExcludingBlockedUsers } from '../firebaseUtils';
import PostComponent from '../Components/PostComponent';
import SearchComponent from '../Components/SearchComponent';
const HomeScreen = ({route}) => {
  const videoRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [posts, setPosts] = useState([]);
  const [story, setStory] = useState([]);
  const [reloadPage, setReloadPage] = useState(true);
  const [reportComment, setReportComment] = useState(null);
  const [postDone, setPostDone] = useState(false);
  const [reportNotificationToken, setReportNotificationToken] = useState(null);
  const [tempPosts, setTempPosts] = useState([]);
  const [repostModal, setRepostModal] = useState(false);
  const [storyModal, setStoryModal] = useState(false);
  const [userStoryModal, setUserStoryModal] = useState(false);
  const [storyItem, setStoryItem] = useState(null);
  const [repostItem, setRepostItem] = useState(null);
  const [reportCommentModal, setReportCommentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState(null);
  const [ogUserStoryModal, setOgUserStoryModal] = useState(false);
  const [reportedContent, setReportedContent] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const theme = useContext(themeContext);
  const [filtered, setFiltered] = useState([]);
  const [following, setFollowing] = useState(false);
  const [meet, setMeet] = useState(true);
  const [mood, setMood] = useState(false);
  const [mStatus, setMediaStatus] = useState(null);
  const [smallKeywords, setSmallKeywords] = useState([]);
  const [largeKeywords, setLargeKeywords] = useState([]);
  const [privacy, setPrivacy] = useState(false);
  const [follow, setFollow] = useState([]);
  const [lastVisible, setLastVisible] = useState();
  const [username, setUsername] = useState('');
  const [followingCount, setFollowingCount] = useState(7);
  const navigation = useNavigation();
  const [searching, setSearching] = useState(false)
  const [notificationToken, setNotificationToken] = useState('');
  const [forSale, setForSale] = useState(false);
  const [background, setBackground] = useState(null);
     const textInputRef = useRef(null);
    const [ableToShare, setAbleToShare] = useState(true);
    const [status, setStatus] = useState({})
    const [activeIndex, setActiveIndex] = useState(0);
    const [pfp, setPfp] = useState(null);
    const [focusedPost, setFocusedPost] = useState(null);
    const [replyToReplyFocus, setReplyToReplyFocus] = useState(false);
    const [focused, setFocused] = useState(false);
    const [commentModal, setCommentModal] = useState(false);
  const {user} = useAuth();
   const [visible, setVisible] = useState(false);
    const [messageNotifications, setMessageNotifications] = useState([]);
    const [nonMessageNotifications, setNonMessageNotifications] = useState([]);
/* useEffect(() => {
  if (userStoryModal) {
    let interval = null;

  if (activeIndex < story.length) {
    interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + (1000 / animationDuration) * 1.5; 
        if (newProgress >= 100) { // Check if progress reaches 100%
          clearInterval(interval);
          handleItemChange('next'); 
          return 0; 
        }
        return newProgress;
      });
    }, 1000 / 60); // Update roughly 60 times per second 
  }

  setCurrentInterval(interval);

  return () => clearInterval(interval); 
  }
  }, [activeIndex, story.length, userStoryModal]); */
useEffect(() => {
    const loadStory = async() => {
      const {story} = await fetchStory(user)
      setStory(story)
    }
    loadStory();
  }, [])
useEffect(() => {
  if (route.params?.reloading) {
    //console.log('first')
    setPosts([]);
      setActiveIndex(0)
      setReloadPage(true)
  }
}, [route.params?.reloading])
    const sendSearchingDataBack = () => {
      setSearching(true)
      setLoading(true)
      //setFiltered([]);
      //setSpecificSearch('')
    }
    const sendFollowingDataBack = () => {
      //console.log('fst')
      setFollowing(true);
      //setLoading(true)
      setActiveIndex(0)
      setMeet(false);
      setTempPosts([]);
      setReloadPage(true)
      setMood(false)
    }
    const sendMoodDataBack = (moodItem) => {
      setFollowing(false);
      setActiveIndex(0);
      setMeet(false);
      setTempPosts([]);
      setReloadPage(true);
      setMood(moodItem)
    }
    const sendMeetDataBack = () => {
      setFollowing(false);
      //setLoading(true);
      setMeet(true);
      setTempPosts([]);
      setMood(false);
      setReloadPage(true)
    }
    useEffect(() => {
      if (route.params?.firstTime) {
        setIsFirstTime(false)
      }
    }, [route.params?.firstTime])
  useEffect(() => {
    if (ogUserStoryModal) {
    const getPermissions = async() => {
      const { status: existingMediaStatus } = await ImagePicker.getMediaLibraryPermissionsAsync()
      let finalMediaStatus = existingMediaStatus;
      //console.log(finalMediaStatus)
      //console.log(existingCameraStatus)
      if (existingMediaStatus !== 'granted') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        finalMediaStatus = status;
      }
      if (finalMediaStatus !== 'granted') {
        setMediaStatus(false)
      }
      }
    getPermissions()
    }
  }, [ogUserStoryModal])
  useEffect(() => {
    let unsubscribe;

    if (user?.uid) {
      // Call the utility function and pass state setters as callbacks
      unsubscribe = fetchNotifications(user, setNonMessageNotifications);

      // Handle loading state
      setLoading(false);
    }

    // Clean up the listener when the component unmounts
    return () => {
      if (unsubscribe) {
        return unsubscribe;
      }
    };
  }, [user]);
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
    useMemo(() => {
      const getData = async () => {
  const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
  const followList = profileDoc.data().following;

  const followPromises = followList.map((e) => 
    getDoc(doc(db, 'profiles', e))
  );

  const followDocs = await Promise.all(followPromises);
  const followData = followDocs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  setFollow(followData);
};

getData();
    }, [])
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
    const fetchProfileData = async () => {
      const profileData = await getChangingProfileDetails(user.uid)

      if (profileData) {
        setReportedComments(profileData.reportedComments);
        setReportedPosts(profileData.reportedPosts);
        setMessageNotifications(profileData.messageNotifications);
      }
    };

    fetchProfileData();
  }, [onSnapshot])
   useEffect(() => {
    if (focusedPost != null) {
      setCommentModal(true)
    }
  }, [focusedPost])

    
    const renderStories = ({item, index}) => {
     //console.log(item.pfp)
      return (
        <TouchableOpacity style={styles.storyContainer} onPress={() => {setStoryModal(true); setStoryItem(item)}}>
           <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} 
           style={styles.storyImage}/>
           <Text numberOfLines={1} style={styles.storyText}>{item.userName}</Text>
        </TouchableOpacity>
      )
    }
    useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setTempPosts([]);
      setPostDone(false);

      if (meet && reloadPage && blockedUsers !== null) {
        const { posts, lastVisible } = await fetchPublicPostsExcludingBlockedUsers(blockedUsers)
        setTempPosts(posts);
        setLastVisible(lastVisible);
      } else if (following && reloadPage) {
        const posts = await fetchUserFeedPosts(user.uid, followingCount);
        setTempPosts(posts);
        setFollowingCount(followingCount + 7);
      }

      setLoading(false);
      setPostDone(true);
    };

    if (reloadPage) {
      loadPosts();
    }
  }, [meet, following, reloadPage, blockedUsers, followingCount]);
    const openHeaderMenu = () => setVisible(true)
    const closeHeaderMenu = () => setVisible(false)
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
  async function fetchMoreData() {
    if (lastVisible != undefined && meet) {
        const { posts, lastVisible: newLastVisible } = await fetchMorePublicPostsExcludingBlockedUsers(blockedUsers, lastVisible);
        setTempPosts([...tempPosts, ...posts]);
        setLastVisible(newLastVisible);
    }
    else if (lastVisible != undefined && following) {
      const posts = await fetchUserFeedPosts(user.uid, followingCount);
        setTempPosts([...tempPosts, ...posts]);
        setFollowingCount(followingCount + 7);
    }
    
  }
  
 useEffect(() => {
    const fetchPostExistence = async () => {
      if (focusedPost != null) {
        try {
          const exists = await ableToShareFunction(focusedPost.id);
          setAbleToShare(exists);
        } catch (error) {
          console.error(error.message);
          setAbleToShare(false); // Handle error by setting `ableToShare` to false
        }
      }
    };

    fetchPostExistence();
  }, [focusedPost]); 
  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === 'Enter') {
      // Prevent user from manually inserting new lines
      return;
    }
  };
  useEffect(() => {
  if (textInputRef.current && replyToReplyFocus) { 
    textInputRef.current.focus();
  }
}, [replyToReplyFocus]);
  const handlePostScroll = _.debounce((event) => {
    fetchMoreData()
  },  500)
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
        <FirstTimeModal isFirstTime={isFirstTime} home={true} closeFirstTimeModal={() => setIsFirstTime(false)}/>
          <RepostModal repostModal={repostModal} closeRepostModal={() => setRepostModal(false)} repostItem={repostItem} 
          handleKeyPress={handleKeyPress} user={user} ableToShare={ableToShare} blockedUsers={blockedUsers} forSale={forSale} 
          notificationToken={notificationToken} username={username} background={background} pfp={pfp}/>
          {ogUserStoryModal || userStoryModal ? 
          <StoryModal userStoryModal={ogUserStoryModal} closeStoryModal={() => setUserStoryModal(false)} username={username} user={user}
          background={background} forSale={forSale} openUserStoryModal={() => setOgUserStoryModal(true)} 
          closeUserStoryModal={() => setOgUserStoryModal(false)} pfp={pfp}/> : null}
        <View style={[styles.innerContainer, {backgroundColor: theme.backgroundColor}]}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <View style={{marginTop: '3%'}}>
         <FastImage source={require('../assets/DarkMode5.png')} style={{height: 27.5, width: 68.75}}/>
      </View>
              
              <Text style={{fontSize: 37.5, fontWeight: '200', color: theme.theme != 'light' ? "#9EDAFF" : "#005278", marginLeft: '6%'}}>|</Text>
                <Text numberOfLines={1} style={[styles.header, { fontFamily: 'Montserrat_500Medium', color: theme.theme != 'light' ? "#9EDAFF" : "#005278", backgroundColor: theme.backgroundColor}]}>{meet ? "For You" : following ? "Following" : null}</Text>
                </View>
            <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: 10, justifyContent: 'space-between', width: 127, marginRight: '5%'}}>
              <Ionicons name='search' size={27} color={theme.color} style={{alignSelf: 'center'}} onPress={sendSearchingDataBack}/>
              {messageNotifications.length > 0 ? <MaterialCommunityIcons name='message-badge-outline' size={27} color="#33FF68" style={{alignSelf: 'center', marginTop: 1}} onPress={() => navigation.navigate('Chat', {sending: false, message: true,  })}/> :
              <MaterialCommunityIcons name='message-outline' size={27} color={theme.color} style={{alignSelf: 'center', marginTop: 1}} onPress={() => navigation.navigate('Chat', {sending: false, message: true, })}/>}
              {nonMessageNotifications > 0 ? 
              <MaterialCommunityIcons name='bell-badge-outline' size={29} color="#33FF68" style={{alignSelf: 'center', marginTop: 1}} onPress={() => navigation.navigate('NotificationScreen')}/> :
              <MaterialCommunityIcons name='bell-outline' size={29} color={theme.color} style={{alignSelf: 'center', marginTop: 1}} onPress={() => navigation.navigate('NotificationScreen')}/>
              }
              {following.length > 0 ?
              <Menu 
                visible={visible}
                onDismiss={closeHeaderMenu}
                contentStyle={{backgroundColor: theme.backgroundColor, borderWidth: 1, borderColor: "#71797E"}}
                anchor={<MaterialCommunityIcons name='chevron-down-circle-outline' size={28} color={theme.color} style={{alignSelf: 'center', marginTop: 2}} onPress={openHeaderMenu}/>}>
                <Menu.Item onPress={meet ? null : sendMeetDataBack} title="For You" titleStyle={meet ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278",} : {color: theme.color}}/>
                <Divider />
                <Menu.Item onPress={following ? null : sendFollowingDataBack} title="Following" titleStyle={!meet ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278",} : {color: theme.color}}/>
                {/* <Divider />
                <Menu.Item onPress={mood == 'Excited' ? null : () => sendMoodDataBack('Excited')} title="Excited" titleStyle={!meet ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278",} : {color: theme.color}}/>
                <Divider />
                <Menu.Item onPress={mood == 'Funny' ? null : () => sendMoodDataBack('Funny')} title="Funny" titleStyle={!meet ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278",} : {color: theme.color}}/>
                <Divider />
                <Menu.Item onPress={mood == 'Grateful' ? null : () => sendMoodDataBack('Grateful')} title="Grateful" titleStyle={!meet ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278",} : {color: theme.color}}/>
                <Divider />
                <Menu.Item onPress={mood == 'Happy' ? null : () => sendMoodDataBack('Happy')} title="Happy" titleStyle={!meet ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278",} : {color: theme.color}}/>
                <Divider />
                <Menu.Item onPress={mood == 'Mad' ? null : () => sendMoodDataBack('Mad')} title="Mad" titleStyle={!meet ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278",} : {color: theme.color}}/>
                <Divider />
                <Menu.Item onPress={mood == 'Sad' ? null : () => sendMoodDataBack('Sad')} title="Sad" titleStyle={!meet ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278",} : {color: theme.color}}/>
                <Divider />
                <Menu.Item onPress={mood == 'Scared' ? null : () => sendMoodDataBack('Scared')} title="Scared" titleStyle={!meet ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278",} : {color: theme.color}}/> */}
              </Menu> : null}
            </View>
          </View>
          {searching ? 
          <SearchComponent user={user} home={true} closeSearching={() => setSearching(false)}/> : <></>}
        <View>
          {!searching ? 
         <View style={{flexDirection: 'row'}}>
             <TouchableOpacity style={{marginHorizontal: 10, borderRadius: 999, alignItems: 'center'}} onPress={() => {setUserStoryModal(true)}}>
              <FastImage source={pfp ? {uri: pfp} : require('../assets/defaultpfp.jpg')} 
              style={story.length > 0 ? {height: 50, borderRadius: 999, width: 50, borderWidth: 2, borderColor: "#005278"} : {height: 50, borderRadius: 999, width: 50}}/>
              <TouchableOpacity onPress={() => setOgUserStoryModal(true)} style={{position: 'relative', backgroundColor: "#fafafa", bottom: 20, left: 20, borderRadius: 999}}>
              <MaterialCommunityIcons name='plus' size={17.5} color={"#005278"}/>
              </TouchableOpacity>
              <Text numberOfLines={1} style={[styles.storyText, {paddingTop: -10, marginTop: -10, fontSize: 12.29}]}>{username}</Text>
              </TouchableOpacity>
                  <FlatList 
          data={follow}
          renderItem={renderStories}
         keyExtractor={item => item.id}
          horizontal={true}
        />
        </View>
        : null}
        {!searching && postDone && user && tempPosts.length > 0 ? 
        <PostComponent data={tempPosts} forSale={forSale} background={background} home={true} loading={loading} lastVisible={lastVisible} 
        actualClique={null} videoStyling={null || false} cliqueIdPfp={null} cliqueIdName={null} post={null} blockedUsers={blockedUsers}
        openPostMenu={null} clique={false} cliqueId={null} pfp={pfp} ogUsername={username} admin={false} edit={false} caption={null} 
        notificationToken={notificationToken} smallKeywords={smallKeywords} largeKeywords={largeKeywords} reportedPosts={reportedPosts}
        reportedComments={reportedComments} privacy={privacy}/>
        : loading && !lastVisible && !searching ? 
        <View style={{alignItems: 'center', flex: 1, backgroundColor: theme.backgroundColor, justifyContent: 'center', marginTop: '20%'}}>
          <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View> : !searching ? <View style={{alignItems: 'center', flex: 1, backgroundColor: theme.backgroundColor, justifyContent: 'center', marginTop: 
          '20%'
        }}>
          <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View> : null}
        </View> 
      </View>
    </Provider>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: "#121212"
  },
  postText: {
    fontSize: 12.29,
    fontFamily: 'Monserrat_500Medium',
    padding: 5, 
    marginHorizontal: '3.5%'
  },
  innerContainer: {
      marginTop: '8%',
      marginBottom: '2.5%',
      marginLeft: '15.85%',
      marginRight: '9%',
      justifyContent: 'space-evenly',
      flexDirection: 'row',
      alignItems: 'center',
    },
    header: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        //textAlign: 'center',
        color: "#9EDAFF",
        padding: 10,
        paddingLeft: 0,
        marginTop: 8,
        alignSelf: 'center',
        width: '60%',
        marginLeft: '5%',
    },
  storyContainer: {
    marginHorizontal: 10, 
    borderRadius: 999, 
    alignItems: 'center'
  },
  storyImage: {
    height: 50, 
    borderRadius: 999, 
    width: 50
  }

})