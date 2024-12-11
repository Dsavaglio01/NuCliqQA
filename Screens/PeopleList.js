import { ActivityIndicator, StyleSheet, Modal, Animated, Text, View, Keyboard, TouchableOpacity, FlatList, Alert} from 'react-native'
import React, { useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useFonts, Montserrat_700Bold, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { collection, documentId, setDoc, serverTimestamp, updateDoc, increment, arrayUnion, addDoc, deleteDoc, doc, getDoc, getDocs, endAt, startAt, limit, where, onSnapshot, query, orderBy, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../Hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NextButton from '../Components/NextButton';
import FollowIcon from '../Components/FollowIcon';
import RequestedIcon from '../Components/RequestedIcon';
import FollowingIcon from '../Components/FollowingIcon';
import themeContext from '../lib/themeContext';
import FastImage from 'react-native-fast-image';
import { Divider } from 'react-native-paper';
import SearchInput from '../Components/SearchInput';
import RecentSearches from '../Components/RecentSearches';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons'
import generateId from '../lib/generateId';
import _ from 'lodash';
import {BACKEND_URL} from '@env';
import Swiper from 'react-native-deck-swiper';
const PeopleList = ({route}) => {
    const [list, setList] = useState([]);
    const [isFirstTime, setIsFirstTime] = useState(false);
    const [listDone, setListDone] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actualList, setActualList] = useState([]);
    const [friendLoading, setFriendLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState(false)
    const [homeSearches, setHomeSearches] = useState([]);
  const [specificSearch, setSpecificSearch] = useState('');
  const [searches, setSearches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tempSearches, setTempSearches] = useState([]);
    const navigation = useNavigation();
    const [bioOpen, setBioOpen] = useState(false);
    const bioAnimated = useRef(new Animated.Value(0)).current
    //const [searchKeywords, setSearchKeywords] = useState([]);
    const [smallKeywords, setSmallKeywords] = useState([]);
    const [largeKeywords, setLargeKeywords] = useState([]);
    const [moreResults, setMoreResults] = useState(false);
    const [username, setUsername] = useState('');
    const [blockedUsers, setBlockedUsers] = useState(null);
  const [moreResultButton, setMoreResultButton] = useState(false);
    const [searching, setSearching] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [friendsDone, setFriendsDone] = useState(false)
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const {user} = useAuth();
    const listDoneRef = useRef(null);
    const theme = useContext(themeContext)
    useEffect(() => {
      if (route.params?.firstTime) {
        //console.log('first')
        setIsFirstTime(false)
      }
    }, [route.params?.firstTime])
    function skipWalkthrough() {
    const check = async() => {
      await AsyncStorage.setItem('isFirstTime', 'false');
      setIsFirstTime(false)
    }
    check()
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
    }, [onSnapshot])
    const toggleBio = () => {
    if (bioOpen) {
      // Collapse the bio
      Animated.timing(bioAnimated, {
        toValue: 0,
        duration: 300, 
        useNativeDriver: true,
      }).start(() => {
        setBioOpen(false)
      });
    } else {
      // Expand the bio
      Animated.timing(bioAnimated, {
        toValue: 1,
        duration: 300, 
        useNativeDriver: true,
      }).start(() => {
        setBioOpen(true);
      });
    }
  };
    async function schedulePushRequestFriendNotification(id, username, notificationToken) {
        setFriendLoading(false)
      let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
      let banned = (await getDoc(doc(db, 'profiles', id))).data().banned
      if (notis && !banned) {
      fetch(`${BACKEND_URL}/api/requestedNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, pushToken: notificationToken, data: {routeName: 'NotificationScreen', deepLink: 'nucliqv1://NotificationScreen'} 
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
    setFriendLoading(false)
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
      let banned = (await getDoc(doc(db, 'profiles', id))).data().banned
      if (notis && !banned) {
      fetch(`${BACKEND_URL}/api/friendNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, pushToken: notificationToken, data: {routeName: 'NotificationScreen', deepLink: 'nucliqv1://NotificationScreen'} 
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
  async function removeFriend(item, friendId) {
    const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.loading = true
      const objectIndex = actualList.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...actualList];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualList(updatedData);
    }
    let newFriend = generateId(friendId, user.uid)
   // let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/removeFriend'
    Alert.alert('Are you sure you want to unfollow?', 'If you unfollow, you will be unable to message them and they will be unable to message you.', [
                {
                  text: 'Cancel',
                  onPress: () => {const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.loading = false
      const objectIndex = actualList.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...actualList];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualList(updatedData);
    }},
                  style: 'cancel',
                },
                {text: 'OK', onPress: async() => {try {
    const response = await fetch(`${BACKEND_URL}/api/removeFriend`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {newFriend: newFriend, user: user.uid, friendId: friendId}}), // Send data as needed
    })
    const data = await response.json();
    if (data.done ) {
      const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.loading = false
      const objectIndex = actualList.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...actualList];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualList(updatedData);
    }
    }
  } catch (error) {
    console.error('Error:', error);
  }},
  }]);
    
  }
  async function addFriend(item) {
  //setFriendLoading(true)
    const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.loading = true
      const objectIndex = actualList.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...actualList];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setActualList(updatedData);
    }
    let newFriend = generateId(item.id, user.uid)
    //let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/addFriendTwo'
    try {
    const response = await fetch(`${BACKEND_URL}/api/addFriendTwo`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, newFriend: newFriend, user: user.uid, username: username, smallKeywords: smallKeywords, largeKeywords: largeKeywords,}}), // Send data as needed
    })
    const data = await response.json();
    //console.log(data)
      if (data.request) {
        setActualList(actualList.filter((e) => e.id !== item.id))
        schedulePushRequestFriendNotification(item.id, username, item.notificationToken)
      }
      else if (data.friend) {
        setActualList(actualList.filter((e) => e.id !== item.id))
        schedulePushFriendNotification(item.id, username, item.notificationToken)
      }
  } catch (error) {
    console.error('Error:', error);
  }
  }
    
  const renderFriend = ({item, index}) => {
    //console.log(item)
    return (
      <View key={index}>
        <View  style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity style={[styles.friendsContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => navigation.navigate('ViewingProfile', {name: item.id, viewing: true})}>
                <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
                 <View style={{paddingLeft: 20, width: '65%'}}>
                    <Text numberOfLines={1} style={[styles.nameText, {fontFamily: 'Montserrat_700Bold', fontSize: 19.20, color: theme.color}]}>{item.firstName} {item.lastName}</Text>
                    <Text numberOfLines={1} style={[styles.nameText, {color: theme.color}]}>@{item.userName}</Text>
                </View>
            
                
            </TouchableOpacity>
            {!item.blockedUsers.includes(user.uid) ? item.loading ? 
            <View style={{justifyContent: 'center'}}>
                <ActivityIndicator color={"#9edaff"}/>
            </View> : 
            <TouchableOpacity style={{justifyContent: 'center'}} onPress={user.uid != null ? friends.filter(e => e === item.id).length > 0 ? () => removeFriend(item, item.id) : item.id == user.uid || requests.filter(e => e.id === item.id).length > 0 ? null : () => addFriend(item): null}>
              {requests.filter(e => e.id === item.id).length > 0 ? <RequestedIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} /> : 
              friends.filter(e => e === item.id).length > 0 ? <FollowingIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
              : item.id == user.uid ? null : <FollowIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />}
              
            </TouchableOpacity> : null}
          </View>
          <Divider />
      </View>
        
    )
  }
  const renderSearches = ({item}) => {
    //console.log(item)
    return (
      <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => recentSearchFunction(item)}>
        <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: theme.color}]}>{item.firstName} {item.lastName} | @{item.username ? item.username : item.userName}</Text>
            <TouchableOpacity onPress={() => removeSearch(item)} style={{alignSelf: 'center', marginLeft: "auto"}}>
                <MaterialCommunityIcons name='close' size={30} color={theme.color} />
            </TouchableOpacity>
        </TouchableOpacity>
    )
  }
  const renderEvents = ({item, index}) => {
    //console.log(item)
    return (
      <View key={index}>
        <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => searchFunction(item)}>
            <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: theme.color}]}>{item.firstName} {item.lastName} | @{item.username != undefined ? item.username : item.userName}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center', marginLeft: 'auto'}} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
        </TouchableOpacity>
      </View>
    )
  }
  function recentSearchFunction(item) {
    if (item.id != user.uid) {
       navigation.navigate('ViewingProfile', {name: item.id, viewing: true})
     }
     else {
      navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})
     }
  }
  function searchFunction(item) {
    //console.log(item)
    console.log(item.id)
     if (item.id != user.uid) {
        navigation.navigate('ViewingProfile', {name: item.id, viewing: true})
     }
     else {
      navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})
     }
    
  }
  
  function addToRecentSearches(item) {
    var element = item
        if (tempSearches.filter(e => e.id == item.id).length > 0) {
      
      tempSearches.map(async(e) => {
        if (e.id == e.id) {
          //setTempId(element.id)
          await updateDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id), {
            group: false,
            event: false,
            element,
            user: true,
            ai: false,
            theme: false,
            friend: false,
            timestamp: serverTimestamp()
          })
        }
      })
    } 
    else {
        addDoc(collection(db, 'profiles', user.uid, 'recentSearches'), {
        group: false,
        event: false,
        element,
        user: true,
        ai: false,
        friend: false,
        theme: false,
        timestamp: serverTimestamp()
      })
    }
  }
  async function removeSearch(item) {
    setTempSearches(tempSearches.filter((e) => e.searchId !== item.searchId))
            await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', item.searchId))
            
  }
  /* useMemo(() => {
    if (list.length == 0 && !listDoneRef.current) {
        setListDone(false);
        setList([]);
    const getData = async() => {
        const docSnap = await getDocs(collection(db, 'usernames'), orderBy('pfp'), limit(20))
        const tempList = [];
        let lastDocument = null;

        docSnap.forEach((item) => {
            tempList.push({ id: item.id, ...item.data() });
            lastDocument = item; // Update the last document in each iteration
        });

        setList(prevState => [...prevState, ...tempList]);
        setLastVisible(lastDocument);
        listDoneRef.current = true;
    }
    getData()
    setListDone(true)
    }
    
  }, [list]) */
  console.log(list.length)
  
  useMemo(() => {
    if (listDone && list.length !== 0) {
        setFriendsDone(false); // Reset friends done state

        const getData = async () => {
            const newList = await Promise.all(list.map(async (item) => {
                // Batch fetching documents for 'profiles', 'friends', and 'requests'
                const [profileSnapshot, friendSnapshot, requestSnapshot] = await Promise.all([
                    getDoc(doc(db, 'profiles', item.id)),
                    getDoc(doc(db, 'profiles', user.uid, 'friends', item.id)),
                    getDoc(doc(db, 'profiles', user.uid, 'requests', item.id))
                ]);

                // Check friend or request status
                if (!friendSnapshot.exists() && !requestSnapshot.exists() && item.id !== user.uid) {
                    // Only return the profile if it's not the current user and no friend/request doc exists
                    return { id: item.id, ...profileSnapshot.data() };
                } else if (friendSnapshot.exists() && !friendSnapshot.data().actualFriend) {
                    // Check if it's a pending friend request
                    return { id: item.id, ...profileSnapshot.data() };
                }
                return null; // If none of the conditions are met, return null
            }));

            // Filter out null values and update the state
            setActualList(newList.filter(item => item !== null));
            setFriendsDone(true); // Mark the task as done
        };

        getData();
    }
}, [listDone, list]);


  //console.log(list.length)
  useEffect(() => {
    const getData = async() => {
      const unsub = onSnapshot(doc(db, "profiles", user.uid), (doc) => {
        setFriends(doc.data().following)
})
return unsub;
    }
    
    getData()
  }, [])
  useEffect(() => {

      let unsub;
      const fetchSearches = async() => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('user', '==', true), orderBy('timestamp', 'desc'), limit(3)), (snapshot) => {
          setSearches(snapshot.docs.map((doc) => ({
            id: doc.data().element.id,
            searchId: doc.id
          })))
        })
      }
      fetchSearches();
      return unsub;
  }, [onSnapshot])
  useEffect(() => {
    if (searches.length > 0) {
      searches.map(async(item) => {
        //console.log(item.id)
        const docSnap = await getDoc(doc(db, 'profiles', item.id))
        if(docSnap.exists()) {
        setTempSearches(prevState => [...prevState, {id: docSnap.id, searchId: item.searchId, ...docSnap.data()}])
        }
      })
    }
  }, [searches])
  useEffect(() => { 
    const getProfileDetails = async() => {
    const docSnap = await getDoc(doc(db, 'profiles', user.uid)); 
      
    if (docSnap.exists()) {
      const profileSnap = (await getDoc(doc(db, 'profiles', user.uid))).data()
      
      setBlockedUsers(profileSnap.blockedUsers)
      setUsername(profileSnap.userName)
      setSmallKeywords(profileSnap.smallKeywords)
      setLargeKeywords(profileSnap.largeKeywords)
    } 
  }
  getProfileDetails();
  }, [])
  useMemo(() => {
    if (specificSearch.length > 0) {
      setHomeSearches([])
      const getData = async() => {
        if (specificSearch.length < 4) {
        const firstQ = query(collection(db, "profiles"), where('smallKeywords', 'array-contains', specificSearch.toLowerCase()), limit(10));
        const firstQuerySnapshot = await getDocs(firstQ)
        firstQuerySnapshot.forEach((doc) => {
          if (!blockedUsers.includes(doc.id)) {
            setHomeSearches(prevState => [...prevState, {id: doc.id, ...doc.data()}])
          }
        })
      }
      else {
        const firstQ = query(collection(db, "profiles"), where('largeKeywords', 'array-contains', specificSearch.toLowerCase()), limit(10));
        const firstQuerySnapshot = await getDocs(firstQ)
        firstQuerySnapshot.forEach((doc) => {
          if (!blockedUsers.includes(doc.id)) {
            setHomeSearches(prevState => [...prevState, {id: doc.id, ...doc.data()}])
          }
        })
      }
      }
      
      getData();
    } 
  }, [specificSearch])
  useEffect(() => {
        if (specificSearch.length > 0) {
      setSearching(true)
      setMoreResultButton(false)
      setMoreResults(false)
      setRecentSearches(true)
      //const temp = specificSearch.toLowerCase()
      const tempList = Array.from(new Set(homeSearches.map(JSON.stringify))).map(JSON.parse).filter(item => {
          return item
      })
      if (tempList.length > 3) {
        setMoreResultButton(true)
      }
      setFiltered(tempList)
    }
    else {
      setFiltered([])
    }
    }, [homeSearches])
    //console.log(list.length)
   useEffect(() => {
        setListDone(false);
        new Promise(resolve => {
    const getData = async() => {
        const docSnap = await getDocs(query(collection(db, 'usernames'), limit(10)))
        const tempList = [];
        let lastDocument = null;

        docSnap.forEach((item) => {
            tempList.push({ id: item.id, ...item.data() });
            lastDocument = item; // Update the last document in each iteration
        });

        setList(prevState => [...prevState, ...tempList]);
        setLastVisible(lastDocument);
        listDoneRef.current = true;
    }
     getData()
  resolve(); // Resolve the Promise after setCompleteMessages is done
      }).finally(() => {setLoading(false);  setListDone(true)}); 
   
   
    
  }, [])
  
const handleScroll = _.debounce((event) => {
    // Your logic for fetching more data
   fetchMoreData()
  }, 500);
  const fetchMoreData = () => {
    if (lastVisible != undefined || lastVisible != null) {
    setLoading(true)
    let newData = [];
    const getData = async() => {
        setListDone(false);
        const docSnap = await getDocs(query(collection(db, 'usernames'), startAfter(lastVisible), limit(10)))
        const tempList = [];
        let lastDocument = null;

        docSnap.forEach((item) => {
            newData.push({
                    id: item.id,
                    loading: false,
                    ...item.data()
                  })
            lastDocument = item
        });
        if (newData.length > 0) {
             setList([...list, ...newData]);
        setLastVisible(lastDocument);
        }
       

    }
    getData()
    setTimeout(() => {
          setLoading(false)
          setListDone(true)
        }, 500);
}
  }
  
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold
  });
  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={styles.container}>
      <Modal visible={isFirstTime} transparent animationType='slide' onRequestClose={() => {setIsFirstTime(!isFirstTime); }}>
          <View style={[styles.modalContainer, styles.overlay, {alignItems: 'center', justifyContent: 'center'}]}>
            <View style={[styles.modalView, {height: 230, width: '90%', borderRadius: 20, backgroundColor: theme.backgroundColor}]}>
                <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', marginRight: '2.5%', marginVertical: 5}} onPress={() => {skipWalkthrough()}}>
                  <Text style={{fontFamily: 'Montserrat_400Regular', fontSize: 15.36, color: theme.color}}>Skip</Text>
              </TouchableOpacity>
              <Text style={{fontFamily: 'Montserrat_700Bold', fontSize: 19.20, marginLeft: '5%', paddingBottom: 10, paddingTop: 0, color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}}>Users</Text>
              <Divider style={{borderWidth: 0.5, width: '90%', marginLeft: '5%', borderColor: theme.color}}/>
              <Text style={{fontFamily: 'Montserrat_500Medium', fontSize: 15.36, marginHorizontal: '5%', paddingVertical: 10, color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}}>Welcome, this is the users page of NuCliq where you can see and follow users on NuCliq!</Text>
              <View style={{marginRight: '5%', alignItems: 'flex-end', marginTop: '2.5%'}}>
                <NextButton text={"NEXT"} onPress={() => {setIsFirstTime(false); navigation.navigate('Themes', {screen: 'All', params: {name: null, groupId: null, goToMy: false, groupTheme: null, group: null, registers: false}})}}/>
              </View>
            </View>
          </View>
        </Modal>
     <View style={styles.main}>
        <View style={{flexDirection: 'row', marginBottom: '2.5%', justifyContent: 'space-between'}}>
            <Text style={styles.users}>Discover Cliqers</Text>
            <Ionicons name='search' size={27} color={theme.color} style={{alignSelf: 'center'}} onPress={() => {setSearching(true); setSpecificSearch('')}}/>
        </View>
        
        <Divider style={{borderWidth: 0.5, borderColor: "#fff"}}/>
        {(listDone || actualList.length != 0) && !searching ? 
        <FlatList 
        data={actualList}
        style={{height: '100%'}}
        ListFooterComponent={
            loading ? (
              <View style={{ alignItems: 'center', paddingBottom: 50, marginTop: 5}}> 
                <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
              </View>
            ) : (
              <View style={{ paddingBottom: 50 }} /> 
            )
          }
        renderItem={renderFriend}
        keyExtractor={(item) => item.id}

        onScroll={handleScroll}
      />
        : 
      searching ? 
          <View style={styles.homeContainer}>
            <TouchableOpacity activeOpacity={1} style={{width: '100%', zIndex: 0}}>
            <View style={{flexDirection: 'row'}}>
                  <SearchInput autoFocus={true} value={specificSearch} icon={'magnify'} placeholder={'Search'} onFocus={() => {setRecentSearches(true); setSearching(true)}} iconStyle={styles.homeIcon}
                  containerStyle={{borderWidth: 1, borderColor: theme.color, width: '85%'}} onSubmitEditing={ () => {setRecentSearches(false)}} text={searching ? true : false} onChangeText={setSpecificSearch} 
                  onPress={() => { setRecentSearches(true); setSpecificSearch(''); setSearching(true)}}/>
                  <MaterialCommunityIcons name='close' size={40} style={styles.closeHomeIcon} color={theme.color} onPress={() => {setRecentSearches(false); setSearching(false); Keyboard.dismiss(); setFiltered([]); setSpecificSearch('')}}/>
                  </View>
                  <View>
                  {searching && filtered.length == 0 && specificSearch.length > 0 ?
                  <View>
                    <Text style={{fontFamily: 'Montserrat_500Medium', color: theme.color, fontSize: 15.36, paddingHorizontal: 10, textAlign: 'center', marginRight: '5%', marginTop: '5%'}}>No Search Results</Text>
                  </View> :  
                  searching && moreResults
                  ?
                  <>
                  <FlatList 
                      data={!moreResults ? filtered.slice(0, 3) : filtered.slice(0, 10)}
                      renderItem={renderEvents}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{flexGrow: 1}}
                      //contentContainerStyle={{width: '100%', zIndex: 3, flewGrow: 1}}
                      scrollEnabled={moreResultButton ? false: true}
                  /> 
                  {
                    recentSearches && searching ?
                    <RecentSearches data={tempSearches.filter((obj, index, self) => index === self.findIndex((o) => o.userName === obj.userName)).reverse()} 
                    theme={false} group={false} home={true} friend={false} ai={false} extraStyling={{width: '95%'}}
                    renderSearches={renderSearches}/> : null
                  }
                  </>
                  : searching && (moreResults || specificSearch.length > 0) ? 
                  <View>
                  <FlatList 
                      data={!moreResults ? filtered.slice(0, 3) : filtered.slice(0, 10)}
                      renderItem={renderEvents}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{flexGrow: 1}}
                      scrollEnabled={moreResultButton ? false: true}
                  /> 
                  {moreResults ? 
                  <TouchableOpacity style={{alignItems: 'center', marginRight: '5%'}} onPress={() => {setRecentSearches(false); setMoreResults(true); setMoreResultButton(false);}}>
                    <Text style={{paddingTop: 5, color: theme.theme != 'light' ? "#9EDAFF" : "#005278", fontFamily: 'Montserrat_400Regular'}}>See more results</Text>
                    </TouchableOpacity> : null}
                  </View> : <></>}
                  {
                    recentSearches && searching ?
                    <RecentSearches data={tempSearches.filter((obj, index, self) => index === self.findIndex((o) => o.userName === obj.userName)).reverse()} 
                    theme={false} group={false} home={true} friend={false} ai={false} extraStyling={{width: '95%'}}
                    renderSearches={renderSearches}/>: null
                  }
                  </View>
                  
                  
              </TouchableOpacity>
              
          </View> :
       <ActivityIndicator color={"#9edaff"}/>
      }
     </View>
    </View>
  )
}

export default PeopleList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212'
    },
    main: {
        marginTop: '12%',
        marginHorizontal: '5%'
    },
    users: {
        color: "#ffffff",
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 24,
        paddingBottom: 5
    },
    friendsContainer: {
        borderRadius: 10,
        borderBottomColor: "#d3d3d3",
        padding: 10,
        flexDirection: 'row',
        //paddingRight: 20,
        alignItems: 'center',
    },
    homeIcon: {position: 'absolute', left: 280, top: 8.5},
  homeContainer: {marginBottom: '5%', marginTop: '5%', width: '105%'},
  closeHomeIcon: {marginLeft: '1%'},
  categoriesContainer: {
    borderRadius: 5,
    flexDirection: 'row',
    //marginRight: '5%',
    marginTop: 5,
    padding: 5,
    alignItems: 'center',
    //justifyContent: 'space-between',
    width: '95%',
  },
  categories: {
    fontSize: 15.36,
    padding: 10,
    width: '80%',
    fontFamily: 'Montserrat_500Medium'
  },
  card: {
    width: '98%',
    marginLeft: '-5%',
    height: '75%',
    borderRadius: 10,
    overflow: 'hidden', // To clip the text within the card bounds
    position: 'relative',
  },
  textContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  name: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#005278',
  },
  bio: {
    fontSize: 15.36,
    color: '#005278',
    fontFamily: 'Montserrat_500Medium'
  },
  headerText: {
    fontSize: 19.20,
    color: "#fafafa",
    fontFamily: 'Montserrat_600SemiBold',
    padding: 10,
    paddingLeft: 0,
    paddingBottom: 0
  },
   bioContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    overflow: 'hidden', 
  },
  bioText: {
    color: '#fafafa',
    fontFamily: 'Montserrat_500Medium',
    fontSize: 15.36,
    padding: 10,
  },
   modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        //marginTop: 22
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
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
})