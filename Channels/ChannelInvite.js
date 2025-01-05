import { StyleSheet, Text, View, FlatList } from 'react-native'
import React, {useState, useEffect} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import { onSnapshot, query, collection, doc, getDoc, addDoc, serverTimestamp, updateDoc, arrayUnion } from 'firebase/firestore'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Skip from '../Components/Skip'
import SearchBar from '../Components/SearchBar'
import {MaterialCommunityIcons} from '@expo/vector-icons'
import NextButton from '../Components/NextButton'
import FastImage from 'react-native-fast-image'
import useAuth from '../Hooks/useAuth'
import { db } from '../firebase'
const ChannelInvite = ({route}) => {
  const {id, name, security, pfp, privateInvite, channelId} = route.params;
  const navigation = useNavigation();
  const [searching, setSearching] = useState(false)
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState();
  const [filteredGroup, setFilteredGroup] = useState([]);
  const [friendsInfo, setFriendsInfo] = useState([]);
  const {user} = useAuth()
  const [groupName, setGroupName] = useState('');
  const [groupPfp, setGroupPfp] = useState('');
  const [inviteSent, setInviteSent] = useState(false);
  const [actuallySending, setActuallySending] = useState(false);
  const [inviteArray, setInviteArray] = useState([]);
  useEffect(()=> {
    let unsub;
      const getData = async() => {
        const docRef = doc(db, "groups", id);
        const docSnap = await getDoc(docRef);
        docSnap.data().members.map((item) => {
          if (item != user.uid) {
            const fetchCards = async () => {
              unsub = onSnapshot(query(doc(db, 'profiles', item)), (snapshot) => {
                setFriendsInfo(prevState => [...prevState, {id: snapshot.id, checked: false, ...snapshot.data()}])
              })
          } 
          fetchCards();
          return unsub;
          }
          
        })
      }
      getData();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
    }, []);
    //console.log(friends.length)
    useEffect(() => {
      const getGroupData = async() => {
        setGroupName((await getDoc(doc(db, 'groups', id))).data().name)
        setGroupPfp((await getDoc(doc(db, 'groups', id))).data().pfp)
      }
      getUserData()
      getGroupData()
    }, [])
  const renderChecked = (id) => {
      //console.log(id)
      let list = friendsInfo
      //console.log(list[id])
      list[id].checked = !list[id].checked
      if (list[id].checked == true) {
        setInviteArray(prevState => [...prevState, list[id]])
        setActuallySending(true)
      }
      else {
        setActuallySending(false)
        setInviteArray(inviteArray.filter(item => item !== list[id]))
      }
      var newList = list.slice()
      setFriendsInfo(newList)
    }
  const renderFriends = ({item, index}) => {
    //console.log(item)
    return (
      <TouchableOpacity style={styles.friendsContainer} key={index} onPress={() => renderChecked(index)}>
        <View style={{flexDirection: 'row'}}>
          <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={styles.pfp}/>
          <Text style={styles.firstName}>{item.firstName} {item.lastName}</Text>
        </View>
        {item.checked ? <View style={{marginRight: '10%', alignSelf: 'center'}}>
                  <MaterialCommunityIcons name='message-arrow-right-outline' style={{alignSelf: 'center'}} size={25} color="#9edaff"/>
                </View> : <View style={{marginRight: '10%', alignSelf: 'center'}}>
                  <MaterialCommunityIcons name='message-outline' style={{alignSelf: 'center'}} size={25} color={"#fafafa"}/>
                </View>}
      </TouchableOpacity>
    )
  }
  const renderSearches = ({item}) => {
    return (
        <TouchableOpacity style={styles.categoriesContainer} onPress={() => {setFilteredGroup(item); setSearching(false)}}>
            <Text style={styles.categories}>{item.info.firstName} {item.info.lastName}</Text>
        </TouchableOpacity>
    )
  }
  const handleSearchCallback = (dataToSend) => {
      //console.log(dataToSend)
      setSearching(dataToSend)
    }
  const handleGroupCallback = (dataToSend) => {
    setFilteredGroup(dataToSend)
  }
  const uploadImage = async() => {
      if (actuallySending) {
          addPostToChatter(null)
        }
        else {
          const docRef = await addDoc(collection(db, 'groups', id, 'channels'), {
      lastMessage: null,
      lastMessageTimestamp: null,
      members: [user.uid],
      name: name,
      admins: [user.uid],
      official: false,
      pfp: pfp,
      member_count: 1,
      security: security,
      timestamp: serverTimestamp(),
      allowNotifications: arrayUnion(user.uid),
      requests: []
    })
    Promise.all(inviteArray.map(async(item) => {
      addDoc(collection(db, 'groups', id, 'notifications', item.id, 'notifications'), {
        like: false,
        comment: false,
        friend: item.id,
        item: null,
        request: true,
        acceptRequest: false,
        postId: docRef.id,
        theme: false,
        report: false,
        requestUser: user.uid,
        requestNotificationToken: item.notificationToken,
        likedBy: [],
        timestamp: serverTimestamp()
      }).then(() => addDoc(collection(db, 'groups', id, 'notifications', item.id, 'checkNotifications'), {
        userId: user.uid
      }))
    })).then(async() => await updateDoc(doc(db, 'profiles', user.uid, 'channels', id), {
        channelsJoined: arrayUnion(docRef.id)
      })).then(() => navigation.navigate('GroupChannels', {id: id, person: user.uid, pfp: groupPfp, name: groupName, newPost: docRef.id}))
      
    }
    }
  async function addPostToChatter() {
    //console.log(url)if (pr)
    if (!privateInvite) {
        const docRef = await addDoc(collection(db, 'groups', id, 'channels'), {
      lastMessage: null,
      lastMessageTimestamp: null,
      members: [user.uid],
      name: name,
      admins: [user.uid],
      pfp: pfp,
      member_count: 1,
      official: false,
      security: security,
      timestamp: serverTimestamp(),
      allowNotifications: arrayUnion(user.uid),
      requests: []
    })
    Promise.all(inviteArray.map(async(item) => {
      addDoc(collection(db, 'groups', id, 'notifications', item.id, 'notifications'), {
        like: false,
        comment: false,
        friend: item.id,
        item: null,
        request: true,
        acceptRequest: false,
        postId: docRef.id,
        theme: false,
        report: false,
        requestUser: user.uid,
        requestNotificationToken: item.notificationToken,
        likedBy: [],
        timestamp: serverTimestamp()
      }).then(() => addDoc(collection(db, 'groups', id, 'notifications', item.id, 'checkNotifications'), {
        userId: user.uid
      }))
    })).then(async() => await updateDoc(doc(db, 'profiles', user.uid, 'channels', id), {
        channelsJoined: arrayUnion(docRef.id)
      })).then(() => navigation.navigate('GroupChannels', {id: id, person: user.uid, pfp: groupPfp, name: groupName, newPost: docRef.id}))
    
    }
    else {
      Promise.all(inviteArray.map(async(item) => {
      addDoc(collection(db, 'groups', id, 'notifications', item.id, 'notifications'), {
        like: false,
        comment: false,
        friend: item.id,
        item: null,
        request: true,
        acceptRequest: false,
        postId: channelId,
        theme: false,
        report: false,
        requestUser: user.uid,
        requestNotificationToken: item.notificationToken,
        likedBy: [],
        timestamp: serverTimestamp()
      }).then(() => addDoc(collection(db, 'groups', id, 'notifications', item.id, 'checkNotifications'), {
        userId: user.uid
      }))
    })).then(() => navigation.goBack())
    }
    
  }
  return (
    <View style={styles.container}>
        <View style={{marginTop: '5%'}}>
      {privateInvite ? <RegisterHeader onPress={() => navigation.goBack()} colorOne={{borderColor: '#3286ac'}} colorFour={styles.barColor} colorTwo={styles.barColor} colorThree={styles.barColor} privateInvite={true}/> : 
      <RegisterHeader onPress={() => navigation.goBack()} colorOne={{borderColor: '#3286ac'}} colorFour={styles.barColor} colorTwo={styles.barColor} colorThree={styles.barColor} channel={true}/>}
      <View style={{width: '90%', marginHorizontal: '5%', marginTop: '5%'}}>  
      <Text style={styles.header}>Invite Clique Members</Text>   
        <SearchBar friendsInfo={friendsInfo} searches={searches} channel={true} isSearching={handleSearchCallback} filteredGroup={handleGroupCallback}/>
        { searching && 
        <FlatList 
          data={filtered}
          renderItem={renderSearches}
          keyExtractor={item => item}
          style={{width: '100%'}}
          />
        }
        </View>
      {filteredGroup.length > 0 && inviteSent == false ? <FlatList 
            data={filteredGroup}
            renderItem={renderFriends}
            keyExtractor={(item) => (item)}
          /> : friendsInfo.length > 0 ? <FlatList 
            data={friendsInfo}
            renderItem={renderFriends}
            keyExtractor={(item) => (item.id)}
            style={{height: '55%'}}
          /> : null }
      {actuallySending ? <View style={privateInvite ? {flex: 1, justifyContent: 'flex-end', width: '75%', marginHorizontal: '12.5%', marginTop: '7.5%', marginBottom: '5%'} :
    {marginHorizontal: '5%', marginTop:'2.5%'}}>
          {/* <TextInput style={styles.input} placeholder={"Add message..."} placeholderTextColor={"#000"} maxLength={200} value={caption} onChangeText={setCaption}/> */}
          <NextButton text={"Send"} onPress={() => addPostToChatter(null)}/>
        </View> : null}
        {!privateInvite ? <View style={{marginBottom: '4%', marginTop: '-1%'}}>
              <Skip styling={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium'}} onPress={() => uploadImage()}/>
            </View> : null}
            
      </View>
    </View>
  )
}

export default ChannelInvite

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    //marginTop: '6%'
  },
  header: {
    fontSize: 19.20,
    fontFamily: 'Montserrat_700Bold',
    padding: 20,
    paddingTop: 0,
    color: "#fafafa"
  },
  friendsContainer: {
    flexDirection: 'row',
    backgroundColor: "#121212",
    width: '90%',
    marginHorizontal: '5%',
    borderRadius: 10,
    marginTop: '2.5%',
    padding: '1.5%',
    justifyContent: 'space-between'
  },
  pfp: {
    height: 35,
    width: 35,
    borderRadius: 17.5,
    margin: '2.5%'
  },
  firstName: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    padding: 5,
    alignSelf: 'center',
    color: "#fafafa"
  },
  inviteContainer: {
    backgroundColor: '#9edaff',
    borderRadius: 10,
    //alignSelf: 'center',
    margin: 5
  },
  categoriesContainer: {
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: "#121212",
    //marginRight: '5%',
    marginTop: 5,
    //marginLeft: '20%'
  },
  categories: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    color: "#fafafa"
  },
  iconStyle: {
    alignSelf: "center", 
    position: 'absolute', 
    left: 320
  },
  barColor: {
    borderColor: '#3286ac'
  }
})