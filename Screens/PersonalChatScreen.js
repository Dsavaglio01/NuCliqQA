import { collection, onSnapshot, query,  where, orderBy, startAfter, updateDoc, doc, getCountFromServer, limit, getDoc, getDocs, deleteDoc, arrayUnion } from 'firebase/firestore';
import React, { useState, useEffect, useRef, useMemo, useCallback, useContext } from 'react';
import {View, Text, FlatList, ActivityIndicator, Animated, Dimensions, StyleSheet} from 'react-native';
import useAuth from '../Hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import MainButton from '../Components/MainButton';
import uuid from 'react-native-uuid';
import FastImage from 'react-native-fast-image';
import { useIsFocused } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native';
import themeContext from '../lib/themeContext';
import TypingIndicator from '../Components/TypingIndicator';
import { db } from '../firebase'
import ProfileContext from '../lib/profileContext';
import { useSinglePickImage } from '../Hooks/useSinglePickImage';
import ThemeChat from '../Components/Chat/ThemeChat';
import PostChat from '../Components/Chat/PostChat';
import TextChat from '../Components/Chat/TextChat';
import ChatInput from '../Components/Chat/ChatInput';
import ChatHeader from '../Components/Chat/ChatHeader';
const PersonalChatScreen = ({route}) => {
  const {person, friendId} = route.params;
  const [loading, setLoading] = useState(true) 
  const isFocused = useIsFocused();
  const [typing, setTyping] = useState(false);
  const [lastMessageId, setLastMessageId] = useState('');
  const [readBy, setReadBy] = useState([]);
  const [lastVisible, setLastVisible] = useState();
  const [messages, setMessages] = useState([]);
  const [animatedValue] = useState(new Animated.Value(0))
  const [active, setActive] = useState(true);
  const [newMessages, setNewMessages] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // To track if it's the first render
  const hasScrolled = useRef(false);
  const theme = useContext(themeContext)
  const [reportedContent, setReportedContent] = useState([]);
  const [friends, setFriends] = useState(0);
  const {user} = useAuth()
  const navigation = useNavigation();
  const profile = useContext(ProfileContext);
  const {imageLoading} = useSinglePickImage({messagePfp: true, firstName: profile.firstName, lastName: profile.lastName, person: person,
    friendId: friendId, name: `${uuid.v4()}${user.uid}${friendId}${Date.now()}message.jpg`});
  useEffect(() => {
    let unsub;
    unsub = onSnapshot(doc(db, "friends", friendId), (document) => {
        setActive(document.data().active)
  });
  return unsub;
  }, [onSnapshot])
  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        await updateDoc(doc(db, 'profiles', user.uid), {
        activeOnMessage: true
      })
      }
      fetchData()
      // This block of code will run when the screen is focused
      // Clean-up function when the component unmounts or the screen loses focus
      return async() => {
        await updateDoc(doc(db, 'profiles', user.uid), {
        activeOnMessage: false,
        messageTyping: false
      })
      };
    }, []))
  useEffect(() => {
    if (isFocused) {
      // User is on this screen
      const getActive = async() => {
        await updateDoc(doc(db, 'profiles', user.uid), {
          messageActive: true
        })
      }
      getActive();
      // Implement any additional logic you need
    } else {
      // User has left this screen
      const getActive = async() => {
        await updateDoc(doc(db, 'profiles', user.uid), {
          messageActive: false
        })
      }
      getActive();
      // Implement any cleanup or additional logic as needed
    }

    // You can also integrate Firebase analytics events here if needed

    return () => {
      // Cleanup logic when component unmounts or screen changes
    };
  }, [isFocused]);
  
  //console.log(friendId)
  useEffect(() => {
    let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'friends', friendId, 'chats'), orderBy('timestamp', 'desc'), limit(25)), (snapshot) => {
          //console.log(snapshot)
          setMessages(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data(),
            copyModal: false,
            saveModal: false
          })))
          setLastVisible(snapshot.docs[snapshot.docs.length-1])
        })
      } 

      fetchCards();
      return unsub;
  }, [])
  function fetchMoreData() {
    
      if (lastVisible != undefined) {
        
    let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'friends', friendId, 'chats'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(25)), (snapshot) => {
          const newData = [];
          setMessages(snapshot.docs.map((doc)=> {
            newData.push({
              id: doc.id,
            ...doc.data(),
            copyModal: false,
            saveModal: false
            })
            
          }))
          if (newData.length > 0) {
        setLoading(true)
            setMessages([...messages, ...newData])
          setLastVisible(snapshot.docs[snapshot.docs.length-1])
          }
          
          
        })
      } 
      setTimeout(() => {
        setLoading(false)
      }, 1000);
      fetchCards();
      return unsub;
    }
    }
  useEffect(() => {
    let unsub;
    //const reportedMessages = (await getDoc(doc(db, 'profiles', user.uid))).data().reportedMessages
     unsub = onSnapshot(doc(db, "profiles", user.uid), (doc) => {
          setReportedContent(doc.data().reportedMessages)
    });
    return unsub;
  }, [onSnapshot])
  useMemo(() => {
    if (messages.length > 0) {
      //
      new Promise(resolve => {
      const newArray = [...messages];
      messages.map((item, index) => {
        //console.log(item)
        if (item) {
      if (item.message.post != undefined) {
        if (item.message.post.group == undefined && item.video) {
          //
          const getData = async() => {
          const docSnap = await getDoc(doc(db, 'videos', item.message.post.id))
          if (docSnap.exists()) {
           
            newArray[index].message.post = {id: docSnap.id, ...docSnap.data()}
            //console.log(newArray[index])
            setNewMessages(newArray)
            //console.log(newArray[0])
          }
          else {
            newArray[index].message.post = null
            setNewMessages(newArray)
          }
          
        }
        getData()
        }
        else if (item.message.post.group == undefined && !item.video) {
          //console.log(item.message.post)
          //
          const getData = async() => {
          const docSnap = await getDoc(doc(db, 'posts', item.message.post.id))
          if (docSnap.exists()) {
           
            newArray[index].message.post = {id: docSnap.id, ...docSnap.data()}
            //console.log(newArray[index])
            setNewMessages(newArray)
            //console.log(newArray[0])
          }
          else {
            newArray[index].message.post = null
            setNewMessages(newArray)
          }
          
        }
        getData()
        }

        //console.log(index)
        
      }
      else if (item.message.theme != undefined) {
        //console.log(item.message.theme.images[0])
        const getData = async() => {
          //const docSnap = await getDoc(doc(db, 'products', item.message.theme.id))
          const themeRef = collection(db, 'products')
                const q = query(themeRef, where('images', 'array-contains', item.message.theme.images[0]))
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                  if (doc.exists()) {
                    newArray[index].message.theme = {...item, id: doc.id, ...doc.data(), purchased: true, free: false}
                  //console.log(newArray)
                  //console.log(newArray)
                  setNewMessages(newArray)
                  }
                  else {
                    newArray[index].message.theme == null
                    setNewMessages(newArray)
                  }
                  //console.log(doc)
                  
                })
        const freeThemeRef = collection(db, 'freeThemes')
                const freeQ = query(freeThemeRef, where('images', 'array-contains', item.message.theme.images[0]))
                const freeQuerySnapshot = await getDocs(freeQ);
                freeQuerySnapshot.forEach((doc) => {
                  if (doc.exists()) {
                    newArray[index].message.theme = {...item, id: doc.id, ...doc.data(), free: true, purchased: false}
                  //console.log(newArray)
                  //console.log(newArray)
                  setNewMessages(newArray)
                  }
                  
                  //console.log(doc)
                  
                }) 
        }
          getData()
      }
      else {
       setNewMessages(newArray)
      }
      //console.log(item)
      //console.log(newArray[0])
    }
    })
    resolve()
  }).finally(() => setLoading(false)); 
    }
  }, [messages])
    useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);
useEffect(() => {
  //
  let unsub;
  const queryData = async() => {
    unsub = onSnapshot(doc(db, 'friends', friendId), async(doc) => {
        setLastMessageId(doc.data().messageId)
        setReadBy(doc.data().readBy)
    });
    await updateDoc(doc(db, 'friends', friendId), {
      readBy: arrayUnion(user.uid)
    }).then(async() => await updateDoc(doc(db, 'profiles', user.uid), {
      messageNotifications: []
    }))
    const querySnapshot = await getDocs(collection(db, 'friends', friendId, 'messageNotifications'));
    querySnapshot.forEach(async(document) => {
      if (document.data().toUser == user.uid) {
      await deleteDoc(doc(db, 'friends', friendId, 'messageNotifications', document.id)).then(async() => {
        await updateDoc(doc(db, 'friends', friendId), {
          toUser: null
        })
      })
      }
    })
  } 
  queryData()
  return unsub;
}, [])
  useEffect(() =>{
    const getFriends = async() => {
      const coll = collection(db, 'profiles', person.id, 'friends');
      const snapshot = await getCountFromServer(coll)
      let count = snapshot.data().count.toString()
      //console.log(snapshot.data().count
      setFriends(count)
    } 
    getFriends()
    return;
  }, [])
  useEffect(() => {
    let unsub;
    unsub = onSnapshot(doc(db, 'profiles', person.id), (document) => {
      if (document.data().messageTyping) {
        if (document.data().messageTyping == user.uid) {
          setTyping(true)
        }
      }
      else {
        setTyping(false)
      }
    })
    return unsub;
  }, [onSnapshot])
  return (
    <View style={styles.container}>
      {newMessages.length >= 0 ? 
        <ChatHeader pfp={profile.pfp} text={`${person.firstName} ${person.lastName}`}/>
        : null}
        {loading && lastVisible ? <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start', marginTop: '2.5%'}}>
        <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} /> 
        </View> : null}
        {/* 
        :  */
         newMessages.length > 0 ? 
         <>
        <FlatList
        //ref={flatListRef}
        data={newMessages}
        keyExtractor={(item, index) => index.toString()}
        inverted
        style={{marginTop: '2.5%'}}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{paddingBottom: 10}}/>}
        onScroll={({ nativeEvent }) => {
        const offsetY = nativeEvent.contentOffset.y;
        const contentHeight = nativeEvent.contentSize.height;
        const scrollViewHeight = nativeEvent.layoutMeasurement.height;

        // Check if user has manually scrolled
        if (!hasScrolled.current && offsetY > 0) {
          hasScrolled.current = true; // Mark that the user has scrolled
        }

        // Prevent fetching more data on initial load
        if (!isInitialLoad && hasScrolled.current) {
          if (offsetY + scrollViewHeight >= contentHeight - 50) {
            // Fetch more data when close to the end
            fetchMoreData();
          }
        }
      }}
      onContentSizeChange={() => {
        // Set isInitialLoad to false once content size has changed (i.e. initial load is done)
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }}
          
        renderItem={({ item, index }) => 
        {
            return (
              item.message.theme != undefined ? 
              <ThemeChat themeNull={item.message.theme== null ? true: false} item={item} user={user} person={person} lastMessageId={lastMessageId} readBy={readBy} 
                newMessages={newMessages} updateNewMessages={setNewMessages} reportedContent={reportedContent} friendId={friendId} 
                updateLastMessageId={setLastMessageId}/> 
            :
            item.message.post == undefined && item.message.text !== "" ? 
            <TextChat item={item} user={user} person={person} lastMessageId={lastMessageId} readBy={readBy} newMessages={newMessages} updateLastMessageId={setLastMessageId}
                updateNewMessages={setNewMessages} reportedContent={reportedContent} friendId={friendId}/> :
          item.message.post != undefined ? 
              <PostChat postNull={item.message.post == null ? true : false} item={item} user={user} person={person} 
                lastMessageId={lastMessageId} readBy={readBy} newMessages={newMessages} updateLastMessageId={setLastMessageId}
                updateNewMessages={setNewMessages} reportedContent={reportedContent} friendId={friendId}/>  
          : <></>
          
            
        )
        }
      }
      />
      {typing ? <View style={{marginLeft: '5%'}}>
      <TypingIndicator />
    </View> : null}
      
      </> : !loading ? <View style={{marginTop: '10%',}}>
        {person.pfp  ? <FastImage source={{uri: person.pfp}} style={{height: Dimensions.get('screen').height / 7, width: Dimensions.get('screen').height / 7, borderRadius: 70, alignSelf: 'center', borderWidth: 1.25, borderColor: '#9edaff'}}/> :
        <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: Dimensions.get('screen').height / 7, width: Dimensions.get('screen').height / 7, borderRadius: 70, alignSelf: 'center', borderWidth: 1.25, borderColor: '#9edaff'}}/>
         }
                    
                    <Text allowFontScaling={false} style={styles.username}>{person.firstName} {person.lastName}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <Text allowFontScaling={false} style={[styles.supplementHeader, {color: theme.color}]}>{friends} {friends != 1 ? 'Friends' : 'Friend'}</Text>
                    </View>
                    {/* <Text allowFontScaling={false} style={[styles.supplementHeader, {width: '75%', textAlign: 'center', marginLeft: '10%'}]}>You both like music and are friends with @Edavid192</Text> */}
                    <View style={{width: '70%', marginLeft: '15%', marginTop: '5%'}}>
                        <MainButton text={"Go to Profile"} onPress={() => navigation.navigate('ViewingProfile', {name: person.id, viewing: true})}/>
                    </View>
                </View> : newMessages.length != 0 ? <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                  <ActivityIndicator color={"#9edaff"} />
                  </View> : <View style={{marginTop: '10%',}}>
        {person.pfp  ? <FastImage source={{uri: person.pfp}} style={{height: Dimensions.get('screen').height / 7, width: Dimensions.get('screen').height / 7, borderRadius: 70, alignSelf: 'center', borderWidth: 1.25, borderColor: '#9edaff'}}/> :
        <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: Dimensions.get('screen').height / 7, width: Dimensions.get('screen').height / 7, borderRadius: 70, alignSelf: 'center', borderWidth: 1.25, borderColor: '#9edaff'}}/>
         }
                    
                    <Text allowFontScaling={false} style={styles.username}>{person.firstName} {person.lastName}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <Text allowFontScaling={false} style={[styles.supplementHeader, {color: theme.color}]}>{friends} {friends != 1 ? 'Friends' : 'Friend'}</Text>
                    </View>
                    {/* <Text allowFontScaling={false} style={[styles.supplementHeader, {width: '75%', textAlign: 'center', marginLeft: '10%'}]}>You both like music and are friends with @Edavid192</Text> */}
                    <View style={{width: '70%', marginLeft: '15%', marginTop: '5%'}}>
                        <MainButton text={"Go to Profile"} onPress={() => navigation.navigate('ViewingProfile', {name: person.id, viewing: true})}/>
                    </View>
                </View>
                }
      {!imageLoading ? 
      <ChatInput newMessages={newMessages} friendId={friendId} person={person} profile={profile} active={active} />
        : 
        <ActivityIndicator color={"#9edaff"}/>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212"
  },
  username: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      padding: 10,
      textAlign: 'center',
      color: "#fafafa"
    },
});

export default PersonalChatScreen;