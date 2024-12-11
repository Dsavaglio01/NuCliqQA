import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert} from 'react-native'
import React, {useEffect, useState, useMemo, useContext} from 'react'
import { onSnapshot, query, collection, setDoc, getDoc, doc, getFirestore, where, limit, getDocs, updateDoc, startAfter, arrayRemove, arrayUnion } from 'firebase/firestore';
import MainButton from '../Components/MainButton';
import RegisterHeader from '../Components/RegisterHeader';
import { useNavigation } from '@react-navigation/native';
import ThemeHeader from '../Components/ThemeHeader';
import SearchBar from '../Components/SearchBar';
import useAuth from '../Hooks/useAuth';
import { Divider } from 'react-native-paper';
import FollowIcon from '../Components/FollowIcon';
import FollowingIcon from '../Components/FollowingIcon';
import RequestedIcon from '../Components/RequestedIcon';
import FastImage from 'react-native-fast-image';
import { useFonts, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import {BACKEND_URL} from '@env';
import { db } from '../firebase'
import generateId from '../lib/generateId';
import themeContext from '../lib/themeContext';
const ViewingFriends = ({route}) => {
    const {profile, ogUser, username} = route.params;
    const [friends, setFriends] = useState([]);
    const [followingCount, setFollowingCount] = useState(50);
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const theme = useContext(themeContext)
    const [friendsInfo, setFriendsInfo] = useState([]);
     const [searching, setSearching] = useState(false)
     const [ogUsername, setOgUsername] = useState('');
     const [filteredGroup, setFilteredGroup] = useState([]);
      const [userFollowing, setUserFollowing] = useState([]);
    const [lastVisible, setLastVisible] = useState();
    const [searches, setSearches] = useState([]);
    const navigation = useNavigation();
    //const [searchKeywords, setSearchKeywords] = useState([]);
    const [smallKeywords, setSmallKeywords] = useState([]);
    const [largeKeywords, setLargeKeywords] = useState([]);
    const {user} = useAuth();
    const handleGroupCallback = (dataToSend) => {
    setFilteredGroup(dataToSend)
  }
  useEffect(() => {
    const getData = async() => {
      let unsub;
      unsub = onSnapshot(doc(db, 'profiles', user.uid), (e) => {
        setSmallKeywords(e.data().smallKeywords)
        setLargeKeywords(e.data().largeKeywords)
      setUserFollowing(e.data().following)
      setOgUsername(e.data().userName)
      })
      
    }
    getData()
  }, [onSnapshot])
    useEffect(() => {
    //console.log('first')
    let unsub;

      const fetchCards = async () => {
          const docSnap = await getDoc(doc(db, 'profiles', profile))
          setFriends(docSnap.data().following.slice(0, 50))

        }
      fetchCards();
      return unsub;
  }, [profile])
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

  const handleSearchCallback = (dataToSend) => {
      //console.log(dataToSend)
      setSearching(dataToSend)
    }
  useMemo(() => {
    if (friends.length > 0) {
      setFriendsInfo([])
      friends.map((item) => {
        //console.log(item)
        let unsub;
      const fetchCards = () => {
        unsub = onSnapshot(query(doc(db, 'profiles', item)), (snapshot) => {
          setFriendsInfo(prevState => [...prevState, {id: snapshot.id, loading: false, ...snapshot.data()}])
        })
      }
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
      return unsub;
      })
    }
  }, [friends])
  //console.log(friendsInfo)
  async function removeFriend(item, friendId) {
    const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.loading = true
      const objectIndex = friendsInfo.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...friendsInfo];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setFriendsInfo(updatedData);
    }
    let newFriend = generateId(friendId, user.uid)
    //let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/removeFriend'
    Alert.alert('Are you sure you want to unfollow?', 'If you unfollow, you will be unable to message them and they will be unable to message you.', [
                {
                  text: 'Cancel',
                  onPress: () => {const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.loading = false
      const objectIndex = friendsInfo.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...friendsInfo];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setFriendsInfo(updatedData);
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
    if (data.done) {
      const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.loading = false
      const objectIndex = friendsInfo.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...friendsInfo];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setFriendsInfo(updatedData);
    }
    }
  } catch (error) {
    console.error('Error:', error);
  }},
  }]);
    
  }
  async function schedulePushRequestFriendNotification(id, username, notificationToken) {
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
  async function addFriend(item) {
    const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.loading = true
      const objectIndex = friendsInfo.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...friendsInfo];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setFriendsInfo(updatedData);
    }
    let newFriend = generateId(item.id, user.uid)
    //let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/addFriendTwo'
    try {
    const response = await fetch(`${BACKEND_URL}/api/addFriendTwo`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, newFriend: newFriend, user: user.uid, username: ogUsername, largeKeywords: largeKeywords, smallKeywords: smallKeywords}}), // Send data as needed
    })
    const data = await response.json();
      if (data.request) {
        const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.loading = false
      const objectIndex = friendsInfo.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...friendsInfo];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setFriendsInfo(updatedData);
    }
        schedulePushRequestFriendNotification(item.id, ogUsername, item.notificationToken)
      }
      else if (data.friend) {
        const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.loading = false
      const objectIndex = friendsInfo.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...friendsInfo];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setFriendsInfo(updatedData);
    }
        schedulePushFriendNotification(item.id, ogUsername, item.notificationToken)
      }
  } catch (error) {
    console.error('Error:', error);
  }
  }
  const renderFriend = ({item, index}) => {
    //console.log(item)
    return (
      <View key={index}>
        <View  style={{flexDirection: 'row', width: '82.5%', alignItems: 'center'}}>
            <TouchableOpacity style={[styles.friendsContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => navigation.navigate('ViewingProfile', {name: item.id, viewing: true})}>
                <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
                 <View style={{paddingLeft: 20, width: '75%'}}>
                    <Text numberOfLines={1} style={[styles.nameText, {fontFamily: 'Montserrat_700Bold', fontSize: 19.20, color: theme.color}]}>{item.firstName} {item.lastName}</Text>
                    <Text numberOfLines={1} style={[styles.nameText, {color: theme.color}]}>@{item.userName}</Text>
                </View>
            
                
            </TouchableOpacity>
            {!item.blockedUsers.includes(user.uid) ? item.loading ? <ActivityIndicator color={"#9edaff"}/> :
            <TouchableOpacity style={{justifyContent: 'center'}} onPress={user.uid != null ? userFollowing.filter(e => e === item.id).length > 0 ? () => removeFriend(item, item.id) : item.id == user.uid || requests.filter(e => e.id === item.id).length > 0 ? null : () => addFriend(item): null}>
              {requests.filter(e => e.id === item.id).length > 0 ? <RequestedIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} /> : 
              userFollowing.filter(e => e === item.id).length > 0 ? <FollowingIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
              : item.id == user.uid ? null : <FollowIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />}
              
            </TouchableOpacity> : null
  }
          </View>
          <Divider />
      </View>
        
    )
  }
  //console.log(friends)
  function fetchMoreData() {
    if (lastVisible != undefined) {
      setLoading(true)
    let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'profiles', profile, 'friends'), where('actualFriend', '==', true), startAfter(lastVisible), limit(10)), (snapshot) => {
          const newData = [];
          snapshot.docs.map((doc) => {
            newData.push({
              id: doc.id,
            })
          })
          //console.log(newData)
          setFriends([...friends, ...newData])
          //console.log(posts.map((item) => (item.id)))
          setLastVisible(snapshot.docs[snapshot.docs.length-1])
        })
      }
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
      return unsub;
    }
  }
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}> 
    <View>
      <ThemeHeader text={`@${username}'s Friends`} video={false} backButton={true}/>
    </View>
    <View style={{marginLeft: '5%'}}>
      <SearchBar friendsInfo={friendsInfo.filter((obj, index, self) => index === self.findIndex((o) => o.id === obj.id))} filteredGroup={handleGroupCallback} searches={searches} chat={true} isSearching={handleSearchCallback}/>
    </View>
    {!searching && !loading ?
      <FlatList 
        data={filteredGroup.length > 0 ? filteredGroup : friendsInfo.filter((obj, index, self) => index === self.findIndex((o) => o.id === obj.id))}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id}
        onScroll={({ nativeEvent }) => {
            const offsetY = nativeEvent.contentOffset.y;
            const contentHeight = nativeEvent.contentSize.height;
            const scrollViewHeight = nativeEvent.layoutMeasurement.height;

            // Detect when the user is near the end of the ScrollView
            if (offsetY + scrollViewHeight >= contentHeight - 20) {
              // Load more data when close to the end
              //fetchMoreData()
              
            }
          }}
      /> : loading ? 
    <View style={{alignItems: 'center', flex: 1, justifyContent: 'center', marginBottom: '20%'}}>
          <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={"large"}/> 
        </View> : null}
      
    </View>
  )
}

export default ViewingFriends

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    removeButton: {
        alignSelf: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#005278',
        //marginLeft: '-15%'
    },
    removeButtonText: {
        padding: 10,
        fontSize: 12.29,
        fontFamily: 'Montserrat_500Medium',
        color: '#005278',
        paddingLeft: 12,
        paddingRight: 12
    },
    nameText: {
        fontSize: 15.36,
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
    header: {
        fontSize: 24,
        marginLeft: '5%',
        //padding: 10,
        marginBottom: '5%',
        fontFamily: 'Montserrat_500Medium'
        
    }
})