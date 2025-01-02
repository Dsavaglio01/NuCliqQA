import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React, {useEffect, useState, useContext} from 'react'
import { onSnapshot, doc, arrayUnion, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import {MaterialCommunityIcons, Feather} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { ScrollView } from 'react-native-gesture-handler';
import RequestedIcon from '../Components/RequestedIcon';
import { db } from '../firebase';
import ProfileContext from '../lib/profileContext';
import { fetchCliqueData, fetchGroupNotifications } from '../firebaseUtils';
import { useSinglePickImage } from '../Hooks/useSinglePickImage';
const GroupHome = ({route}) => {
    const { name} = route.params;
    const [group, setGroup] = useState({members: [], admins: []});
    const {user} = useAuth()
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [messageNotifications, setMessageNotifications] = useState([]);
    const [background, setBackground] = useState();
    const [groupsJoined, setGroupsJoined] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [reported, setReported] = useState([]);
    const [memberRequests, setMemberRequests] = useState([]);
    const [requests, setRequests] = useState([]);
    const [notifications, setNotifications] = useState(false)
    const [userRequests, setUserRequests] = useState([]);
    const [nonMessageNotifications, setNonMessageNotifications] = useState([]);
    const [isDead, setIsDead] = useState(false);
    const navState = navigation.getState()?.routes
    const prevRoute = navState[navState.length -2]
    const profile = useContext(ProfileContext)
    const {imageLoading, imageBackground, pickImage} = useSinglePickImage({cliquePfp: true, name: `${user.uid}cliquePfp.jpg`, group: group});
    useEffect(() => {
      if (profile) {
        setGroupsJoined(profile.groupsJoined)
      }
    }, [profile])
    useEffect(() => {
      let unsubscribe1;
      let unsubscribe2;
      if (user?.uid && name) {
        // Call the utility function and pass state setters as callbacks
        unsubscribe1 = fetchGroupNotifications(name, user.uid, 'checkNotifications', setNonMessageNotifications);
        unsubscribe2 = fetchGroupNotifications(name, user.uid, 'messageNotifications', setMessageNotifications);
        // Handle loading state
        setLoading(false);
      }

      // Clean up the listener when the component unmounts
      return () => {
        if (unsubscribe1 && unsubscribe2) {
          return unsubscribe1, unsubscribe2;
        }
      };
    }, [name]);
    useEffect(() => {
      if (user.uid) {
        const fetchRequestData = async () => {
          await fetchGroupRequests(user.uid, (data) => {
            setUserRequests(data); // Update the state with the fetched data
          });
        };
        fetchRequestData();
      }
    }, [user?.uid])
    useEffect(() => {
      if (messageNotifications > 0 || nonMessageNotifications > 0) {
        setNotifications(true)
      }
      else {
        setNotifications(false)
      }
    }, [nonMessageNotifications, messageNotifications])
    useEffect(() => {
      if (group.admins.includes(user.uid)) {
        let unsub;
        // Call the utility function and pass state setters as callbacks
        unsub = fetchCliqueData(group.id, setContacts, setRequests, setReported, setMemberRequests);
        // Handle loading state
        setLoading(false);

        // Clean up the listener when the component unmounts
        return () => {
          if (unsub) {
            return unsub;
          }
        };
      }
      else {
        setTimeout(() => {
          setLoading(false)
        }, 500);
      }
    }, [group, onSnapshot])
    useEffect(()=> {
      const docRef = doc(db, "groups", name);
      let unsub;
      const docSnap = () => {
        unsub = onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            setGroup({id: doc.id, ...doc.data()})
          }
          else {
            setIsDead(true)
          }
        });
      } 
      docSnap()
      return unsub;
    }, [name]);
    useEffect(() => {
      if (group.members.length > 0) {
        if (group.bannedUsers.includes(user.uid)) {
          setIsDead(true)
        }
      }
    }, [group])

    useEffect(() => {
      if (group != undefined) {
        if (group.banner != undefined) {
          if (group.banner.length > 0) {
            setBackground(group.banner)
          }
        }
        
      }
    }, [group])
  function settingsAlert() {
    Alert.alert('Cannot access settings', 'You must join this clique in order to access the settings', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  }
  
  function channelAlert() {
    Alert.alert('Cannot access chat', 'You must join this clique in order to access the chat', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  }
  async function updateGroup(item) {
    if (item.groupSecurity == 'private') {
      const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.groupSecurity == 'private'
      const objectIndex = completeGroups.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...completeGroups];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setCompleteGroups(updatedData);
    }
      await setDoc(doc(db, 'profiles', user.uid, 'groupRequests', item.id), {
        id: item.id,
        timestamp: serverTimestamp()
      }).then(async() => await setDoc(doc(db, 'groups', item.id, 'memberRequests', user.uid), {
      id: user.uid,
      timestamp: serverTimestamp()
    }))
    }
    else {
      setGroupsJoined(prevState => [...prevState, item.id])
      await updateDoc(doc(db, 'groups', item.id), {
      members: arrayUnion(user.uid),
      memberUsernames: arrayUnion(profile.username),
      allowMessageNotifications: arrayUnion(user.uid),
      allowPostNotifications: arrayUnion(user.uid)
    }).then(async() => await updateDoc(doc(db, 'groups', item.id, 'channels', item.id), {
                    members: arrayUnion(user.uid),
                    member_count: increment(1),
                    lastMessageTimestamp: serverTimestamp(),
                    allowNotifications: arrayUnion(user.uid)
                })).then(async() => await setDoc(doc(db, 'profiles', user.uid, 'channels', item.id), {
                  channelsJoined: arrayUnion(item.id)
                })).then(async() => await updateDoc(doc(db, "profiles", user.uid), {
            groupsJoined: arrayUnion(item.id)
        })).then(async() => await setDoc(doc(db, 'groups', item.id, 'profiles', user.uid), {
          smallKeywords: profile.smallKeywords,
          largeKeywords: profile.largeKeywords
        })).catch((e) => console.log(e))
    }
      
  }
  return (
    <View style={styles.container}>
      {isDead ? 
        <>
          <View style={styles.innerContainer}>
            <View style={styles.header}>
              {prevRoute?.name ? 
                <MaterialCommunityIcons name='chevron-left' color={"#fafafa"} size={37.5} style={styles.left} onPress={() => navigation.goBack()}/> : null}
                <View style={styles.logo}>
                  <FastImage source={require('../assets/DarkMode5.png')} style={{height: 27.5, width: 68.75}}/>
                </View>
            </View>      
          </View>
          <View style={styles.deadContainer}>
            <Text style={styles.unavailableText}>Sorry, cliq is unavailable</Text>
            <MaterialCommunityIcons name='emoticon-sad-outline' color={"#fafafa"} size={50} style={{alignSelf: 'center', marginTop: '10%'}}/>
            </View>
              </> : 
              loading ? 
              <View style={{flex: 1,
              justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator color={"#9edaff"} size={"large"}/> 
              </View>
              :
              group ? 
      <>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          {prevRoute?.name ? 
          <MaterialCommunityIcons name='chevron-left' size={37.5} color={"#fafafa"} style={styles.left} onPress={() => navigation.goBack()}/> : null}
          <View style={styles.logo}>
             <FastImage source={require('../assets/DarkMode5.png')} style={{height: 27.5, width: 68.75}}/>
          </View>
            
        </View>
            { group ?
              group.members.includes(user.uid) ? <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: 20, justifyContent: 'space-between', width: 70, marginRight: '5%'}}>
                    {notifications ? 
              <TouchableOpacity style={{alignSelf: 'center'}} 
              onPress={() => navigation.navigate('GroupChannels', {id: group.id, group: group, person: user.uid, pfp: group.banner, name: group.name, sending: false, notifications: true})}>
                        <MaterialCommunityIcons name='bell-badge-outline' size={29.5} color="#33FF68"/>
                    </TouchableOpacity> : <TouchableOpacity style={{alignSelf: 'center'}} 
                    onPress={() => navigation.navigate('GroupChannels', {id: group.id, group: group, person: user.uid, pfp: group.banner, name: group.name, sending: false, notifications: true})}>
                        <MaterialCommunityIcons name='bell-outline' size={29.5} color={"#fafafa"}/>
                    </TouchableOpacity>
              }
                    
                    <TouchableOpacity style={{alignSelf: 'center'}} onPress={() => navigation.navigate('NewPost', {group: true, groupName: group.name, actualGroup: group, groupId: group.id, postArray: [], blockedUsers: profile.blockedUsers, admin: group.admins.includes(user.uid), username: profile.username})}>
                      <MaterialCommunityIcons name='plus' size={29.5} color={"#fafafa"} />
                    </TouchableOpacity>
                  </View> : null : null
            }
                  
          </View>
          {
         <ScrollView style={{flex: 1}} >
          {imageLoading ? <ActivityIndicator style={{margin: '5%'}} color={"#9EDAFF"} /> : imageBackground || background ? 
          <FastImage source={background && !imageBackground ? {uri: background} : imageBackground ? {uri: imageBackground} 
          : require('../assets/defaultpfp.jpg')} style={styles.profileCircle} /> 
              : <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.profileCircle} /> }
        {group != undefined ? group.admins.includes(user.uid) ? <MaterialCommunityIcons name='image-edit' size={30} style={{position: 'absolute', top: 170, left: 360}} color="#f5f5f5" onPress={() => pickImage()}/> : <></> : <ActivityIndicator color={"#9EDAFF"} />}
        <View style={{marginLeft: '5%', marginRight: '5%', flex: 1}}>
        <View style={{backgroundColor: "#121212", marginLeft: '-5%', marginRight: '-5%'}}>
          <View style={styles.headerHeader}>
            {group ? <Text style={styles.type}>{group.groupSecurity ? group.groupSecurity.charAt(0).toUpperCase() + group.groupSecurity.slice(1) : null} Cliq</Text> : <></>}
            <Text style={styles.type}>|</Text>
            {group ? group.members.length == 1 ? <Text style={styles.type}>{group.members.length} Member</Text> 
            : <Text style={styles.type}>{group.members.length > 999 && group.members.length < 1000000 ? `${group.members.length / 1000}k` : group.members.length > 999999 ? `${group.members.length / 1000000}m` : group.members.length} Members</Text> : null}
          </View>

        {group ? 
        <>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 10, marginLeft: '5%', width: '90%'}}>
          {
            group.banner ?
            <FastImage source={{uri: group.banner}} style={{height: 42, width: 42, borderRadius: 8}}/> : null
          }
        <Text style={styles.name}>{group.name}</Text> 
        
        </View>
        <Text style={styles.categoryText}>{group.category}</Text>
        {group.description ? <Text style={styles.description}>{group.description}</Text> : null}
        
        </>
        : <></>}
        {group != undefined ? !group.admins.includes(user.uid) ? 
        <View style={styles.middleContainer}>
        {group.groupSecurity == 'private' && userRequests.filter(e => e.id === group.id).length > 0 ?
             <View style={[styles.middleContainers, {padding: 2.5, paddingHorizontal: 10, alignItems: 'center', borderColor: 'transparent'}]}>
              <RequestedIcon /> 
              </View>
               :
            !groupsJoined.includes(group.id) ? <TouchableOpacity style={styles.middleContainers} onPress={() => {updateGroup(group)}}>
                  <Text style={[styles.middleText, {paddingLeft: 10}]}>Join</Text>
                  <MaterialCommunityIcons name='account-plus' size={20} style={[styles.middleIcon, {paddingRight: 10, paddingLeft: 0}]} color={"#fafafa"}/>
              </TouchableOpacity> :  
               <TouchableOpacity style={styles.middleContainers} onPress={group.members.includes(user.uid) ? () => navigation.navigate('GroupSettings', {name: group.name, id: group.id, pfp: group.banner, group: group}) : () => settingsAlert()}>
            <Feather name='settings' size={25} style={styles.middleIcon} color={"#fafafa"}/>
            <Text style={styles.middleText}>Settings</Text>
          </TouchableOpacity> }
          <TouchableOpacity style={styles.middleContainers} onPress={() => navigation.navigate('Chat', {sending: true, message: true, payloadGroup: {name: group.name, pfp: group.banner, id: group.id, group: group.id}})}>
            <MaterialCommunityIcons name='share-outline' size={25} style={styles.middleIcon} color={"#fafafa"}/>
            <Text style={styles.middleText}>Share</Text>
          </TouchableOpacity>
          </View>
           : group.admins.includes(user.uid) ?
          <View style={styles.middleContainer}>
          <TouchableOpacity style={styles.middleContainers} onPress={group.members.includes(user.uid) ? () => navigation.navigate('GroupSettings', {name: group.name, id: group.id, pfp: group.banner, group: group}) : () => settingsAlert()}>
            <MaterialCommunityIcons name='shield-crown-outline' size={25} style={styles.middleIcon} color={"#fafafa"}/>
            <Text style={styles.middleText}>Manage</Text>
            {requests.length > 0 || contacts.length > 0 || reported.length > 0 || memberRequests.length > 0 ? <View style={[styles.greenDot, { left: 3, top:-4, position: 'relative', zIndex: 3}] }/> : null}
          </TouchableOpacity>
          <TouchableOpacity style={styles.middleContainers} onPress={() => navigation.navigate('Chat', {sending: true, message: true, payloadGroup: {name: group.name, pfp: group.banner, id: group.id, group: group.id}})}>
            <MaterialCommunityIcons name='share-outline' size={25} style={styles.middleIcon} color={"#fafafa"}/>
            <Text style={styles.middleText}>Share</Text>
          </TouchableOpacity>
          </View> : <ActivityIndicator color={"#9edaff"} /> : <ActivityIndicator color={"#9edaff"}/>}
        
          <View style={{margin: '5%', flexDirection: 'column'}} >
            <TouchableOpacity style={styles.buttonHeaders} onPress={group ? () => navigation.navigate('GroupPosts', {group: group, admin: group.admins.includes(user.uid) ? true : false, username: profile.username, blockedUsers: profile.blockedUsers}): null}>
              <Text style={styles.buttonText}>{group.name} Posts</Text>
              <MaterialCommunityIcons name='chevron-right' size={25} color={"#fafafa"} style={{marginLeft: 'auto'}}/>
            </TouchableOpacity >
            
            <TouchableOpacity style={styles.buttonHeaders} onPress={() => navigation.navigate('GroupMembers', {groupId: group.id, members: group.members.slice(0, 100), name: group.name, admins: group.admins})}>
              <Text style={styles.buttonText}>{group.name} Members</Text>
              <MaterialCommunityIcons name='chevron-right' size={25} color={"#fafafa"} style={{marginLeft: 'auto'}}/>
            </TouchableOpacity>
            {messageNotifications.length > 0 ? <View style={[styles.greenDot, {position: 'relative', top: 7.5, zIndex: 3, left: '95%', height: 13, width: 13, borderRadius: 10}] }/> : null}
            <TouchableOpacity style={messageNotifications.length > 0 ? [styles.buttonHeaders, {marginTop: -2}] : styles.buttonHeaders} onPress={group.members.includes(user.uid) ? () => navigation.navigate('GroupChannels', {id: group.id, pfp: group.banner, group: group, name: group.name, notifications: false}) : () => channelAlert()}>
              <Text style={styles.buttonText}>{group.name} Chats</Text>
              <MaterialCommunityIcons name='chevron-right' size={25} color={"#fafafa"} style={{marginLeft: 'auto'}}/>
            </TouchableOpacity>
          </View>
          </View>
          
          
        </View>
        </ScrollView> }

      </>
      : null}
    </View>
  )
}

export default GroupHome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212"
  },
  header: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  left: {
    alignSelf: 'center', 
    marginTop: 18
  },
  logo: {
    marginTop: '12.5%', 
    marginLeft: '5%'
  },
  headerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  type: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    color: "#fafafa"
  },
  name: {
    fontSize: 24,
    fontFamily: 'Montserrat_500Medium',
    fontWeight: '600',
    textAlign: 'center',
    padding: 10,
    color: "#fafafa"
  },
  buttonHeaders: {
    backgroundColor: "#005278",
    alignItems: 'center', 
    flexDirection: 'row',
    borderRadius: 8,
    padding: 5,
    margin: 10
  },
  buttonText: {
    fontSize: 15.36,
    padding: 10,
    color: "#fafafa",
    fontFamily: 'Montserrat_500Medium',
  },
  middleContainers: {
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    backgroundColor: "#121212",
    borderColor: "#fafafa"
  },
  middleText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    paddingLeft: 5,
    color: "#fafafa",
  },
  middleContainer: {
    flexDirection: 'row',
    width: '90%',
    marginHorizontal: '5%',
    justifyContent: 'space-evenly'
  },
  middleIcon: {
    alignSelf: 'center',
    padding: 5
  },
  greenDot: {
    height: 10,
    width: 10,
    backgroundColor: "#33FF68",
    borderRadius: 5,
    position: 'absolute',
  },
  innerContainer: {
    marginTop: '5%',
    marginBottom: '3%',
    marginLeft: '2.5%',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  profileCircle: {
    height: 200, 
    width: '100%', 
    backgroundColor: "#005278", 
    resizeMode: 'contain'
  },
  description: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 15.36,
    padding: 10,
    paddingTop: 0,
    marginBottom: '5%',
    textAlign: 'center',
    width: '90%',
    marginLeft: '5%',
    color: "#fafafa"
  },
  categoryText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12.29,
    marginBottom: '5%',
    textAlign: 'center',
    width: '90%',
    marginLeft: '5%',
    color: "#fafafa"
  },
  deadContainer: {
    alignItems: 'center', 
    justifyContent: 'center', 
    flex: 1, 
    marginBottom: '25%'
  },
  unavailableText: {
    fontSize: 24, 
    padding: 10, 
    fontFamily: 'Montserrat_500Medium', 
    color: "#fafafa"
  }

})