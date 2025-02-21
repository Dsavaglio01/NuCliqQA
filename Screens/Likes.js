import { StyleSheet, Text, View, ActivityIndicator, FlatList, TouchableOpacity, Image } from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import ThemeHeader from '../Components/ThemeHeader'
import { Divider } from 'react-native-paper'
import SearchBar from '../Components/SearchBar'
import { getDoc, doc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp, arrayUnion, arrayRemove, addDoc, collection} from '@firebase/firestore'
import { db } from '../firebase'
import NextButton from '../Components/NextButton'
import useAuth from '../Hooks/useAuth'
import { useNavigation } from '@react-navigation/native'
import FastImage from 'react-native-fast-image'
import {BACKEND_URL} from "@env"
import RequestedIcon from '../Components/RequestedIcon'
import { useFonts, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import generateId from '../lib/generateId';
import themeContext from '../lib/themeContext'
const Likes = ({route}) => {
    const {postLikes, friends, requests} = route.params;
    //console.log(postLikes)
    const navigation = useNavigation();
    const [searches, setSearches] = useState([]);
    const [searching, setSearching] = useState(false)
    const theme = useContext(themeContext)
    const [filteredGroup, setFilteredGroup] = useState([]);
    const [likesInfo, setLikesInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const {user} = useAuth();
    const handleSearchCallback = (dataToSend) => {
      //console.log(dataToSend)
      setSearching(dataToSend)
    }
    const handleGroupCallback = (dataToSend) => {
    setFilteredGroup(dataToSend)
  }
  useEffect(()=> {
      const getRequest = async() => {
        const docSnap = await getDoc(doc(db, 'profiles', user.uid))
        docSnap.forEach((doc)=> {
          setUsername(doc.data().userName)
        })
      } 
      getRequest()
    }, []);
    async function schedulePushRequestFriendNotification(id, username, notificationToken) {
      let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
      if (notis) {
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
      if (notis) {
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
    async function removeFriend(friendId) {
      let newFriend = generateId(friendId, user.uid)
    Alert.alert('Are you sure you want to unfollow?', 'If you unfollow, you will be unable to message them and they will be unable to message you.', [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: async() => await updateDoc(doc(db, 'profiles', user.uid, 'friends', friendId), {
      actualFriend: false,
      previousFriend: true
    }).then(async() => {
      const docRef = doc(db, 'friends', newFriend);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(doc(db, 'friends', newFriend), {
          active: false
        })
      }
      
    }).then(async() => await updateDoc(doc(db, 'profiles', user.uid), {
      following: arrayRemove(friendId)
    }))},
              ]);
    
  }
  async function addFriend(item) {
    //console.log(item.id)
    let newFriend = generateId(item.id, user.uid)
 
    let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/addFriendTwo'
    try {
    const response = await fetch(url, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, newFriend: newFriend, user: user.uid}}), // Send data as needed
    });
    if (response.ok) {
      const data = await response.json();
      console.log('Cloud Function response:', data);
      // Process the response from your Cloud Function
    } else {
      console.error('Error calling Cloud Function:', response.status);
    }
  } catch (error) {
    console.error('Error:', error);
  }

    
  }
  
    useEffect(() => {
        if (route.params?.postLikes.length > 0) {
            postLikes.slice(0, 100).map((item) => {
                const getData = async() => {
                    const userSnap = (await getDoc(doc(db, 'profiles', user.uid)))
                    if (userSnap.exists() && !userSnap.data().blockedUsers.includes(item)) {
                      const docSnap = (await getDoc(doc(db, 'profiles', item)))
                      if (docSnap.exists()) {
                      setLikesInfo(prevState => [...prevState, {id: docSnap.id, ...docSnap.data()}])
                      }
                    }         
                }
                getData();
            })
            setTimeout(() => {
                setLoading(false)
            }, 1000);
        }
        else {
            setTimeout(() => {
                setLoading(false)
            }, 1000);
        }
    }, [route.params?.postLikes])
    const renderLikes = ({item, index}) => {
    //console.log(item)
    return (
        <View key={index}>
            <TouchableOpacity style={[styles.friendsContainer, {backgroundColor: theme.backgroundColor}]} onPress={item.id !== user.uid ? () => navigation.navigate('ViewingProfile', {name: item.id, viewing: true}) : () => navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})}>
                <View style={{flexDirection: 'row'}}>
                  {item.pfp ? 
                  <FastImage source={{uri: item.pfp}} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/> :
                  <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
                  }
                    
                 <View style={{paddingLeft: 20, width: '70%', justifyContent: 'center'}}>
                    <Text numberOfLines={1} style={[styles.name, {color: theme.color}]}>{item.firstName} {item.lastName}</Text>
                    <Text numberOfLines={1} style={[styles.message, {color: theme.color}]}>@{item.userName}</Text>
                </View>
                </View>
                {/* <TouchableOpacity style={styles.addContainer} onPress={user.uid != null ? friends.filter(e => e.id === item.id).length > 0 ? () => removeFriend(item.id) : item.id == user.uid || requests.filter(e => e.id === item.id).length > 0 ? null : () => addFriend(item): null}>
              {requests.filter(e => e.id === item.id).length > 0 ? <RequestedIcon /> : 
              friends.filter(e => e.id === item.id).length > 0 ? <FollowingIcon />
              : item.id == user.uid ? null : <FollowIcon />}
              
            </TouchableOpacity> */}
                {/* <TouchableOpacity style={styles.addContainer} onPress={friends.filter(e => e.id === item.id).length > 0 ? null : item.id == user.uid ? null : () => addFriend(item.id)}>
                    {friends.filter(e => e.id === item.id).length > 0 ? <FollowingIcon />
                    : item.id == user.uid ? null : <FollowIcon />}
                    
                </TouchableOpacity> */}

            </TouchableOpacity>
          </View>
    )
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
    //console.log(likesInfo)
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <ThemeHeader text={"Post's  Likes"} video={false} backButton={true}/>
      <Divider borderBottomWidth={0.4}/>
      {likesInfo.length == 0 && filteredGroup.length == 0 && !loading ? 
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontSize: 24, fontFamily: 'Montserrat_500Medium', color: theme.color}}>No Likes Yet!</Text>
          </View> 
          :
          <>
      {!searching && !loading && filteredGroup.length == 0 ?
      <FlatList 
        data={likesInfo}
        renderItem={renderLikes}
        keyExtractor={(item) => item.id}
      /> :
      filteredGroup.length > 0 ?
      <FlatList 
        data={filteredGroup}
        renderItem={renderLikes}
        keyExtractor={(item) => item.id}
      /> 
      : loading ? <View style={{flex: 1, alignItems: 'center', justifyContent:'center', marginBottom: '50%'}}>
        <ActivityIndicator size={'large'} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View> : null}
        </>
}
    </View>
  )
}

export default Likes

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    friendsContainer: {
        borderRadius: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#d3d3d3",
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '95%',
        marginLeft: '2.5%'
    },
    addContainer: {
    //flex: 1,
      //alignSelf: 'center', 
      //alignItems: 'flex-end',
      //marginRight: '5%',
      //width: '50%'
    },
    name: {
        fontSize: 15.36,
        paddingTop: 5,
        fontFamily: 'Montserrat_700Bold',
        //width: '95%'
    },
    message: {
        fontSize: 15.36,
        paddingBottom: 5,
        fontFamily: 'Montserrat_500Medium'
    },
})