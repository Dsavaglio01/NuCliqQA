import { Image, StyleSheet, Text, View, ImageBackground, Dimensions, TouchableOpacity, Alert, FlatList, ActivityIndicator, Modal} from 'react-native'
import React, {useRef, useState, useEffect, useContext} from 'react'
import { useNavigation } from '@react-navigation/native';
import { Provider, Menu, Divider } from 'react-native-paper';
import { deleteDoc, doc, getDoc, getFirestore, updateDoc, onSnapshot, setDoc, query, collection, arrayRemove, arrayUnion, serverTimestamp } from 'firebase/firestore';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import PostComponent from '../Components/PostComponent';
import RepostThemeHeader from '../Components/RepostThemeHeader';
import useAuth from '../Hooks/useAuth';
import {BACKEND_URL} from "@env";
import { useFonts, Montserrat_400Regular, Montserrat_700Bold, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
//import ReportModal from '../Components/ReportModal';
import * as Haptics from 'expo-haptics';
import { db } from '../firebase'
import themeContext from '../lib/themeContext';
const Repost = ({route}) => {
    const {post, requests, name, groupId, edit, caption, video} = route.params;
    const [completePosts, setCompletePosts] = useState([]);
    const [username, setUsername] = useState('');
    const [notificationToken, setNotificationToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const {user} = useAuth();
    const theme = useContext(themeContext)
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportedItem, setReportedItem] = useState(null);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [postNotifications, setPostNotifications] = useState([]);
    const [actualGroup, setActualGroup] = useState(null);
    const [actualPfp, setActualPfp] = useState(null);
    const [usersThatBlocked, setUsersThatBlocked] = useState([]);
    const [groupName, setGroupName] = useState('')
    const timerRef = useRef(null);
    const [doesNotExist, setDoesNotExist] = useState(false);
    
    useEffect(() => {
      if (name != undefined) {
          const getData = async() => {
       const docSnap =  await getDoc(doc(db, 'profiles', name))
       setUsername(docSnap.data().userName)
       setNotificationToken(docSnap.data().notificationToken)
       setBlockedUsers(docSnap.data().blockedUsers)
       //setUsersThatBlocked(docSnap.data().usersThatBlocked)
       const postBackground = docSnap.data().postBackground
       let unsub;
      const fetchRequests = async() => {
        const docSnap = await getDoc(doc(db, 'posts', post))
        const profileSnap = await getDoc(doc(db, 'profiles', name))
        unsub = onSnapshot(doc(db, 'posts', post), (doc) => { 
          console.log(doc.data())
            if (docSnap.exists() && doc.exists() && !docSnap.data().blockedUsers.includes(user.uid) && ((docSnap.data().private &&  profileSnap.data().followers.includes(user.uid)) || !docSnap.data().private)) {
          setCompletePosts([{id: docSnap.id, ...docSnap.data(), caption: doc.data().caption, background: postBackground}])
        }
        else {
          setDoesNotExist(true)
        }
        });
        
      }
      fetchRequests();
      setTimeout(() => {
        setLoading(false)
      }, 1500);
      return unsub;
      }
      getData();
      
    }
    }, [name, groupId, post])
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
  async function schedulePushLikeNotification(id, username, notificationToken) {
    //console.log(username)
    //console.log(notificationToken)
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    if (groupId) {
        if (postNotifications.includes(user.uid)) {
          fetch(`${BACKEND_URL}/api/likeNotification`, {
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
    else if (notis) {
      //console.log(notificationToken)
      fetch(`${BACKEND_URL}/api/likeNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, pushToken: notificationToken, "content-available": 1
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
         
            <RepostThemeHeader name={name} text={"Viewing Repost"} postArray={completePosts[0] != undefined ? completePosts[0].post : null} repost={completePosts.repost ? true : false} caption={completePosts[0] != undefined ? completePosts[0].caption : null} id={completePosts[0] != undefined ? completePosts[0].id : null}
             backButton={true} post={true} timestamp={completePosts[0] != undefined ? completePosts[0].timestamp : null} actualPost={completePosts != undefined ? completePosts[0] : null} userId={completePosts[0] != undefined ? completePosts[0].userId : null} homePost={groupId ? false: true} style={{marginLeft: '2.5%'}}/>
            {loading ? 
            <View style={{alignItems: 'center', flex: 1, justifyContent: 'center', marginBottom: '10%'}}>
          <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={"large"}/> 
        </View> 
            : completePosts.length > 0 ?
            <PostComponent videoStyling={video ? true : false} notificationToken={notificationToken} edit={edit} caption={caption} individualPost={true} blockedUsers={blockedUsers} data={[completePosts[0]]} fetchMoreData={null} home={groupId ? false : true}
            clique={groupId ? true : false} cliqueId={groupId} username={username} cliqueIdName={groupName} cliqueIdPfp={actualPfp} actualClique={actualGroup} openPostMenuFunction={openMenuFunctionCallback} requests={requests}
        closePostMenu={closeMenuCallback} openPostMenu={openMenuCallback}/> : 
        <View style={{alignItems: 'center', flex: 1, justifyContent: 'center', marginBottom: '10%'}}> 
          <Text style={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium', color: theme.color}}>Post unavailable</Text>
        </View> }
        </View>
    </Provider>
  )
}

export default Repost

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