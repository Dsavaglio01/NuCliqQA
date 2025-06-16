import { StyleSheet, Text, View, ActivityIndicator} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import { useNavigation} from '@react-navigation/native';
import { onSnapshot} from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import {MaterialCommunityIcons, Ionicons} from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash'
import themeContext from '../lib/themeContext';
import FirstTimeModal from '../Components/FirstTimeModal';
import { fetchNotifications, fetchPublicPostsExcludingBlockedUsers, fetchStory, getChangingProfileDetails, fetchUserFeedPosts, 
  fetchMorePublicPostsExcludingBlockedUsers, fetchPublicMoodPostsExcludingBlockedUsers, fetchMorePublicMoodPostsExcludingBlockedUsers} from '../firebaseUtils';
import PostComponent from '../Components/PostComponent';
import SearchComponent from '../Components/SearchComponent';
import profileContext from '../lib/profileContext';
import MoodComponent from '../Components/MoodComponent';
import StoriesArray from '../Components/StoriesArray';
import showToast from '../lib/toastService';
const HomeScreen = ({route}) => {
  const profile = useContext(profileContext)
  const {user} = useAuth();
  const [posts, setPosts] = useState([]);
  const [story, setStory] = useState([]);
  const [reloadPage, setReloadPage] = useState(true);
  const [postDone, setPostDone] = useState(false);
  const [tempPosts, setTempPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [ogUserStoryModal, setOgUserStoryModal] = useState(false);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const theme = useContext(themeContext);
  const [following, setFollowing] = useState(false);
  const [meet, setMeet] = useState(true);
  const [mood, setMood] = useState(false);
  const [mStatus, setMediaStatus] = useState(null);
  const [lastVisible, setLastVisible] = useState();
  const [followingCount, setFollowingCount] = useState(7);
  const navigation = useNavigation();
  const [searching, setSearching] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0);
  const [messageNotifications, setMessageNotifications] = useState([]);
  const [nonMessageNotifications, setNonMessageNotifications] = useState([]);
  //showToast('Friend Request', 'EdwinD has requested to follow you.')

useEffect(() => {
    const loadStory = async() => {
      const {story} = await fetchStory(user)
      setStory(story)
    }
    loadStory();
  }, [])
useEffect(() => {
  if (route.params?.reloading) {
    //
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
    const loadPosts = async () => {
      setLoading(true);
      setTempPosts([]);
      setPostDone(false);

      if (meet && reloadPage && profile.blockedUsers !== null) {
        const { posts, lastVisible } = await fetchPublicPostsExcludingBlockedUsers(profile.blockedUsers)
        setTempPosts(posts);
        setLastVisible(lastVisible);
      } else if (following && reloadPage) {
        const posts = await fetchUserFeedPosts(user.uid, followingCount);
        setTempPosts(posts);
        setFollowingCount(followingCount + 7);
      }
      else if (mood && reloadPage) {
        const { posts, lastVisible } = await fetchPublicMoodPostsExcludingBlockedUsers(mood, profile.blockedUsers)
        setTempPosts(posts);
        setLastVisible(lastVisible);
      }

      setLoading(false);
      setPostDone(true);
    };

    if (reloadPage) {
      loadPosts();
    }
  }, [meet, following, reloadPage, profile.blockedUsers, followingCount]);
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
  const handlePostScroll = _.debounce(() => {
    fetchMoreData();
  }, 500)
  async function fetchMoreData() {
    if (lastVisible != undefined && meet) {
        const { posts, lastVisible: newLastVisible } = await fetchMorePublicPostsExcludingBlockedUsers(profile.blockedUsers, lastVisible);
        setTempPosts([...tempPosts, ...posts]);
        setLastVisible(newLastVisible);
    }
    else if (lastVisible != undefined && following) {
      const posts = await fetchUserFeedPosts(user.uid, followingCount);
        setTempPosts([...tempPosts, ...posts]);
        setFollowingCount(followingCount + 7);
    }
    else if (lastVisible != undefined && mood) {
        const { posts, lastVisible: newLastVisible } = await fetchMorePublicMoodPostsExcludingBlockedUsers(mood, profile.blockedUsers, lastVisible);
        setTempPosts([...tempPosts, ...posts]);
        setLastVisible(newLastVisible);
    }
    
  }
  return (
      <View style={styles.container}>
        <FirstTimeModal isFirstTime={isFirstTime} home={true} closeFirstTimeModal={() => setIsFirstTime(false)}/>
        <View style={[styles.innerContainer, {backgroundColor: theme.backgroundColor}]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{marginTop: '3%'}}>
              <FastImage source={require('../assets/DarkMode5.png')} style={{height: 27.5, width: 68.75}}/>
            </View>
            <Text style={{fontSize: 37.5, fontWeight: '200', color: theme.theme != 'light' ? "#9EDAFF" : "#005278", marginLeft: '6%'}}>|</Text>
            <Text numberOfLines={1} style={[styles.header, { fontFamily: 'Montserrat_500Medium', color: theme.theme != 'light' ? "#9EDAFF" : "#005278", backgroundColor: theme.backgroundColor}]}>{meet ? "For You" : following ? "Following" : null}</Text>
          </View>
          <View style={styles.buttonsContainer}>
            <Ionicons name='search' size={27} color={theme.color} style={{alignSelf: 'center'}} onPress={sendSearchingDataBack}/>
            {messageNotifications.length > 0 ? <MaterialCommunityIcons name='message-badge-outline' size={27} color="#33FF68" style={styles.bellButtons} onPress={() => navigation.navigate('Chat', {sending: false, message: true,  })}/> :
            <MaterialCommunityIcons name='message-outline' size={27} color={theme.color} style={styles.bellButtons} onPress={() => navigation.navigate('Chat', {sending: false, message: true, })}/>}
            {nonMessageNotifications > 0 ? 
            <MaterialCommunityIcons name='bell-badge-outline' size={29} color="#33FF68" style={styles.bellButtons} onPress={() => navigation.navigate('NotificationScreen')}/> :
            <MaterialCommunityIcons name='bell-outline' size={29} color={theme.color} style={styles.bellButtons} onPress={() => navigation.navigate('NotificationScreen')}/>
            }
            <View style={{marginLeft: '5%'}}> 
              <MoodComponent meet={meet} subscription={profile.subscription || profile.subscription2} following={following} mood={mood} sendMeetDataBack={sendMeetDataBack} sendFollowingDataBack={sendFollowingDataBack} sendMoodDataBack={sendMoodDataBack}/>
            </View>
          </View>
        </View>
        {searching ? 
          <SearchComponent user={user} home={true} closeSearching={() => setSearching(false)}/> : <></>}
        <View>
          {/* {!searching ? 
            <StoriesArray story={story} user={user} profile={profile} userId={user.uid}/>
          : null} */}
          {!searching && postDone && user && tempPosts.length > 0 ? 
          <PostComponent fetchMoreData={handlePostScroll} data={tempPosts} forSale={profile.forSale} background={profile.background} home={true} loading={loading} lastVisible={lastVisible} 
          actualClique={null} videoStyling={null || false} cliqueIdPfp={null} cliqueIdName={null} post={null} blockedUsers={profile.blockedUsers}
          openPostMenu={null} clique={false} cliqueId={null} pfp={profile.pfp} ogUsername={profile.userName} admin={false} edit={false} caption={null} 
          notificationToken={profile.notificationToken} smallKeywords={profile.smallKeywords} largeKeywords={profile.largeKeywords} reportedPosts={reportedPosts}
          reportedComments={reportedComments} privacy={profile.privacy}/>
          : loading && !lastVisible && !searching ? 
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={"#9EDAFF"}/> 
          </View> : !searching ? <View style={styles.loadingContainer}>
            <ActivityIndicator color={"#9EDAFF"}/> 
          </View> : null}
        </View> 
      </View>
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
  loadingContainer: {
    alignItems: 'center', 
    flex: 1, 
    justifyContent: 'center', 
    marginTop: '20%'
  },
  buttonsContainer: {
    flexDirection: 'row', 
    alignSelf: 'center', 
    marginTop: 10, 
    justifyContent: 'space-between', 
    width: 150, 
    marginRight: '5%'
  },
  buttons: {
    alignSelf: 'center', 
    marginTop: 1,
    padding: 5
  },
  bellButtons: {
    alignSelf: 'center',
    marginTop: 1,
    padding: 0
  }


})