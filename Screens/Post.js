import { Image, StyleSheet, Text, View, ImageBackground, Dimensions, TouchableOpacity, Alert, FlatList, ActivityIndicator, Modal} from 'react-native'
import React, {useRef, useState, useEffect, useContext} from 'react'
import { useNavigation } from '@react-navigation/native';
import { Provider, Menu, Divider } from 'react-native-paper';
import { deleteDoc, doc, getDoc, getFirestore, updateDoc, onSnapshot, setDoc, query, collection, arrayRemove, arrayUnion, serverTimestamp } from 'firebase/firestore';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import PostComponent from '../Components/PostComponent';
import ThemeHeader from '../Components/ThemeHeader';
import useAuth from '../Hooks/useAuth';
import {BACKEND_URL} from "@env";
import { useFonts, Montserrat_400Regular, Montserrat_700Bold, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
//import ReportModal from '../Components/ReportModal';
import * as Haptics from 'expo-haptics';
import themeContext from '../lib/themeContext';
import { db } from '../firebase'
const Post = ({route}) => {
    const {post, requests, name, groupId, edit, caption, video} = route.params;
    //console.log(post, name)
    const [completePosts, setCompletePosts] = useState([]);
    const [username, setUsername] = useState('');
    const [visible, setVisible] = useState(false);
    const [notificationToken, setNotificationToken] = useState(null);
    const [forSale, setForSale] = useState(null);
    const [background, setBackground] = useState(null);
    const [loading, setLoading] = useState(true);
    const {user} = useAuth();
    const theme = useContext(themeContext)
    const videoRef = useRef(null);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportedItem, setReportedItem] = useState(null);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [secondReport, setSecondReport] = useState(false);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [postNotifications, setPostNotifications] = useState([]);
    const [tapCount, setTapCount] = useState(0);
    const [actualGroup, setActualGroup] = useState(null);
    const [actualPfp, setActualPfp] = useState(null);
    const [userPfp, setUserPfp] = useState(null);
    const [groupName, setGroupName] = useState('')
    const timerRef = useRef(null);
    const [doesNotExist, setDoesNotExist] = useState(false);
    //console.log(background)
    //console.log(pfp)
    //console.log(completePosts.length)
    //console.log(post)
    const navigation = useNavigation();
    //console.log(groupId)
    //console.log(completePosts<.length)
    useEffect(() => {
      if (route.params?.groupId)
      {
      const getData = async() => {
        const docSnap = await getDoc(doc(db, 'groups', groupId))
        if (docSnap.exists()) {
          setActualGroup({id: docSnap.id, ...docSnap.data()})
          setGroupName(docSnap.data().name)
          setActualPfp(docSnap.data().banner)
        }
      }
      getData();
      }
  }, [route.params?.groupId])
  useEffect(() => {
    if (name != undefined) {
      if (!video) {
    const fetchData = async() => {
      try {
        const [profileSnap, postSnap] = await Promise.all([
          getDoc(doc(db, 'profiles', name)),
          getDoc(doc(db, 'posts', post))
        ]);

        if (profileSnap.exists() && postSnap.exists()) {
          setUsername(profileSnap.data().userName);
          setNotificationToken(profileSnap.data().notificationToken)
       setForSale(profileSnap.data().forSale)
       setBackground(profileSnap.data().postBackground)
       setBlockedUsers(profileSnap.data().blockedUsers)

          const postBackground = profileSnap.data().postBackground;
          setCompletePosts([{ 
            id: postSnap.id, 
            ...postSnap.data(),
            background: postBackground 
          }]);
        } else {
          setDoesNotExist(true); 
        }
      }
       catch (e) {
        console.error(e)
       }
       finally {
        setLoading(false)
       }
    }
    fetchData()
  }
  else {
    const fetchData = async() => {
      try {
        const [profileSnap, postSnap] = await Promise.all([
          getDoc(doc(db, 'profiles', name)),
          getDoc(doc(db, 'videos', post))
        ]);

        if (profileSnap.exists() && postSnap.exists()) {
          setUsername(profileSnap.data().userName);
          setNotificationToken(profileSnap.data().notificationToken)
       setForSale(profileSnap.data().forSale)
       setBackground(profileSnap.data().postBackground)
       setBlockedUsers(profileSnap.data().blockedUsers)

          const postBackground = profileSnap.data().postBackground;
          setCompletePosts([{ 
            id: postSnap.id, 
            ...postSnap.data(),
            background: postBackground 
          }]);
        } else {
          setDoesNotExist(true); 
        }
      }
       catch (e) {
        console.error(e)
       }
       finally {
        setLoading(false)
       }
    }
    fetchData()
  }
  }
  }, [name, post, video])
    /* useEffect(() => {
      if (name != undefined) {
        if (!video) {
          new Promise(resolve => {
          const getData = async() => {
       const docSnap =  await getDoc(doc(db, 'profiles', name))
       setUsername(docSnap.data().userName)
       setNotificationToken(docSnap.data().notificationToken)
       setForSale(docSnap.data().forSale)
       setBackground(docSnap.data().postBackground)
       setBlockedUsers(docSnap.data().blockedUsers)
       const postBackground = docSnap.data().postBackground
       let unsub;
      const fetchRequests = async() => {
        const docSnap = await getDoc(doc(db, 'posts', post))
        unsub = onSnapshot(doc(db, 'posts', post), (doc) => { 
          //console.log(doc.exists())
            if (docSnap.exists() && doc.exists()) {
          setCompletePosts([{id: docSnap.id, ...docSnap.data(), caption: doc.data().caption, background: postBackground}])
        }
        else {
          setDoesNotExist(true)
        }
        });
        
      }
      fetchRequests();
      
      return unsub;
    
      }
      getData();
      resolve()
    }).then(() => setLoading(false))
        }
        else if (video) {
          new Promise(resolve => {
          const getData = async() => {
       const docSnap =  await getDoc(doc(db, 'profiles', name))
       setUsername(docSnap.data().userName)
       setNotificationToken(docSnap.data().notificationToken)
        setForSale(docSnap.data().forSale)
        setBackground(docSnap.data().postBackground)
       setBlockedUsers(docSnap.data().blockedUsers)
       const postBackground = docSnap.data().postBackground
       let unsub;
      const fetchRequests = async() => {
        const docSnap = await getDoc(doc(db, 'videos', post))
        console.log(docSnap.exists())
        unsub = onSnapshot(doc(db, 'videos', post), (doc) => { 
            if (docSnap.exists() && doc.exists()) {
          setCompletePosts([{id: docSnap.id, ...docSnap.data(), caption: doc.data().caption, background: postBackground}])
        }
        else {
          setDoesNotExist(true)
        }
        });
        
      }
      fetchRequests();
      return unsub;
      }
      getData();
      resolve()
    }).then(() => setLoading(false))
        }
        else {
          null
        }
      
    }
    }, [name, groupId, post]) */
  //console.log(post.post)
  const openMenuCallback = (dataToSend) => {
    //console.log(dataToSend)
    openMenu(dataToSend)
  }
  const closeMenuCallback = (dataToSend) => {
    closeMenu(dataToSend)
  }
  const openMenuFunctionCallback = (dataToSend) => {
    setReportedItem(dataToSend.item);
    setReportModalVisible(true)
    
  }
  const handleVideoCallback = (dataToSend) => {
    setVideoModalVisible(true)
    setVideo(dataToSend)
  }
  /* const handleHashtagCallback = (dataToSend) => {
    //setHashTagItem(dataToSend)
    navigation.navigate('Home', {screen: 'HomeScreen', params: {hashtag: dataToSend, post: null, newPost: false}})

  } */

  
  
  function addRecommendLike (item) {
    //console.log(item)
    fetch(`${BACKEND_URL}/api/likeRecommendPost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: item.id, likedBy: item.likedBy, userId: user.uid
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
  function addRecommendSave (item) {
    fetch(`${BACKEND_URL}/api/saveRecommendPost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: item.id, savedBy: item.savedBy, userId: user.uid
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

  
  
  function openMenu(editedItem) {
    //console.log(editedItem)
    const editedItemIndex = completePosts.findIndex((item) => item.id === editedItem.id);
      //console.log(editedItemIndex)
      const newData = [...completePosts];
      newData[editedItemIndex] = {
        ...newData[editedItemIndex],
        reportVisible: true
      }
      setCompletePosts(newData);
  }
  function closeMenu(editedItem) {
    const editedItemIndex = completePosts.findIndex((item) => item.id === editedItem.id);
      //console.log(editedItemIndex)
      const newData = [...completePosts];
      newData[editedItemIndex] = {
        ...newData[editedItemIndex],
        reportVisible: false
      }
      setCompletePosts(newData);
  }
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_400Regular
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  //console.log(completePosts.repost)
  //console.log(groupId)
  //console.log(post)
  //console.log(completePosts[0])
  return (
    <Provider>
        <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
          {completePosts.length > 0 || doesNotExist ? 
            <ThemeHeader name={name} video={video} text={"Viewing Post"} actualGroup={actualGroup} groupName={groupName} cliqueId={groupId} postArray={completePosts[0] != undefined ? completePosts[0].post : null} repost={completePosts.repost ? true : false} caption={completePosts[0] != undefined ? completePosts[0].caption : null} id={completePosts[0] != undefined ? completePosts[0].id : null}
             backButton={true} post={true} timestamp={completePosts[0] != undefined ? completePosts[0].timestamp : null} actualPost={completePosts != undefined ? completePosts[0] : null} userId={completePosts[0] != undefined ? completePosts[0].userId : null} homePost={groupId ? false: true} cliquePost={groupId? true: false} style={{marginLeft: '2.5%'}}/> : null}
            {loading ? 
            <View style={{alignItems: 'center', flex: 1, justifyContent: 'center', marginBottom: '10%'}}>
          <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={"large"}/> 
        </View> 
            : completePosts.length > 0 ?
            <PostComponent videoStyling={video ? true : false} forSale={forSale} video={video} background={background} notificationToken={notificationToken} edit={edit} caption={caption} individualPost={true} blockedUsers={blockedUsers} data={[completePosts[0]]} fetchMoreData={null} home={groupId ? false : true}
            clique={groupId ? true : false} cliqueId={groupId} username={username} cliqueIdName={groupName} cliqueIdPfp={actualPfp} actualClique={actualGroup} openPostMenuFunction={openMenuFunctionCallback} requests={requests}
        closePostMenu={closeMenuCallback} openPostMenu={openMenuCallback}/> : 
        <View style={{alignItems: 'center', flex: 1, justifyContent: 'center', marginBottom: '10%'}}> 
          <Text style={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium', color: theme.color}}>Post unavailable</Text>
        </View> }
        </View>
    </Provider>
  )
}

export default Post

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    captionText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        padding: 10
    },
    postingContainer: {
        width: '100%',
        //marginLeft: '-5%',
        height: '100%',
        //alignItems: 'center'
        justifyContent: 'center',
        backgroundColor: "#005278",
        
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: '2.5%',
    },
    addText: {
      fontSize: 12.29,
      fontFamily: 'Montserrat_500Medium',
      padding: 10,
      color: "#090909"
    },
    multiSlideDot: {
      width: 6,
      height: 7,
      backgroundColor: "#000",
      margin: '2%'
    },
    firstName: {
      fontSize: 12.29,
      fontFamily: 'Montserrat_700Bold',
      color: "#090909",
      padding: 7.5,
      paddingBottom: 15
    },
    previewThemeContainer: {
    margin: '5%',
    marginTop: '10%',
    marginBottom: "2.5%",
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  barColor: {
        borderColor: '#3286ac'
    },
  previewHeader: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_600SemiBold',
    padding: 5,
    textAlign: 'center'
  },
  previewContainer: {
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    borderColor: "#979797"
  },
  previewText: {
    padding: 5,
    fontSize: 15.36,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  paginationContainer: {
    marginTop: -33
    //margin: 10
  },
  modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
  modalView: {
    width: '100%',
    height: '100%',
    //margin: 20,
    //backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    //paddingRight: 0,
    paddingTop: 5,
    paddingBottom: 25,
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
  postFooter: {
    position: 'absolute',
    left: '102.5%',
    top: '75%'
    //flexDirection: 'column'
  },
  postFooterText: {
      fontSize: 12.29,
      fontFamily: 'Montserrat_500Medium',
      color: "grey",
      padding: 5,
      alignSelf: 'center'
    },
})