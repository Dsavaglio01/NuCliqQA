import { FlatList, StyleSheet, Text, TouchableOpacity, View, Modal, Alert} from 'react-native'
import React, {useEffect, useState, useMemo, useContext} from 'react'
import { onSnapshot, query, collection, orderBy, addDoc, increment, serverTimestamp, setDoc, where, deleteDoc, doc, getFirestore, updateDoc, arrayRemove, arrayUnion, getDoc, getDocs } from 'firebase/firestore';
import MainButton from '../Components/MainButton';
import RegisterHeader from '../Components/RegisterHeader';
import { useNavigation } from '@react-navigation/native';
import {MaterialCommunityIcons, Ionicons, MaterialIcons} from '@expo/vector-icons';
import SearchInput from '../Components/SearchInput';
import SearchDropDown from '../Components/DropdownSearch';
import { Divider } from 'react-native-paper';
import useAuth from '../Hooks/useAuth';
import MainLogo from '../Components/MainLogo';
import FollowIcon from '../Components/FollowIcon';
import SearchBar from '../Components/SearchBar';
import {BACKEND_URL} from "@env"
import FastImage from 'react-native-fast-image';
import { useFonts, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import generateId from '../lib/generateId';
import themeContext from '../lib/themeContext';
import _ from 'lodash';
import { db } from '../firebase';
const GroupMembers = ({route}) => {
    const {groupId, name, admins} = route.params;
    //console.log(admins)
    const [specificSearch, setSpecificSearch] = useState('');
    const [friends, setFriends] = useState([]);
    const theme = useContext(themeContext)
    const [friendList, setFriendList] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [memberInfo, setMemberInfo] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [person, setPerson] = useState({});
    const [searches, setSearches] = useState([]);
    const [username, setUsername] = useState('');
    const [members, setMembers] = useState([]);
    const [searching, setSearching] = useState(false)
    const [lastVisible, setLastVisible] = useState();
    const [filtered, setFiltered] = useState([]);
    const [followingCount, setFollowingCount] = useState(20);
    const [adminModal, setAdminModal] = useState(false)
    const [filteredGroup, setFilteredGroup] = useState([]);
    const navigation = useNavigation();
     const [moreResults, setMoreResults] = useState(false);
  const [moreResultButton, setMoreResultButton] = useState(false);
    const {user} = useAuth();
    const handleGroupCallback = (dataToSend) => {
    setFilteredGroup(dataToSend)
  }
    useEffect(() => {
    const getData = async() => {
      const docSnap = await getDoc(doc(db, 'groups', groupId))
      setGroupName(docSnap.data().name)
      setMembers(docSnap.data().members.slice(followingCount - 20, followingCount))
    } 
    getData()
    setTimeout(() => {
          setFollowingCount(followingCount + 20)
          }, 1000);
  },[])
    useEffect(()=> {
      const getRequest = async() => {
        const docSnap = await getDoc(doc(db, 'profiles', user.uid))
          setUsername(docSnap.data().userName)
      } 
      getRequest()
    }, []);
    useMemo(() => {
    if (specificSearch.length > 0) {
      //console.log(specificSearch)
      setSearches([])
      const getData = async() => {
        const firstQ = query(collection(db, "groups", groupId, 'profiles'), where('searchKeywords', 'array-contains', specificSearch.toLowerCase()), limit(10));
        const firstQuerySnapshot = await getDocs(firstQ)
        firstQuerySnapshot.forEach(async(document) => {
          const docSnap = await getDoc(doc(db, 'profiles', document.id))
          if (docSnap.exists()) {
          setSearches(prevState => [...prevState, {id: docSnap.id, ...docSnap.data()}])
          }
        })
      }
      
      getData();
    } 
  }, [specificSearch])
  useEffect(() => {
        if (specificSearch.length > 0) {
      setSearching(true)
      setMoreResultButton(false)
      setMoreResults(false)
      const temp = specificSearch.toLowerCase()
      const tempList = Array.from(new Set(searches.map(JSON.stringify))).map(JSON.parse).filter(item => {
        if (item.searchusername.toLowerCase().match(temp)) {
          return item
        } 
      })
      if (tempList.length > 3) {
        setMoreResultButton(true)
      }
      setFiltered(tempList)
    }
    else {
      setFiltered([])
    }
    }, [searches])
  useMemo(() => {
      members.map((item) => {
        let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(doc(db, 'profiles', item)), (snapshot) => {        
            setMemberInfo(prevState => [...prevState, {id: snapshot.id, ...snapshot.data()}])
        })
      } 
      fetchCards();

      setTimeout(() => {
        setLoading(false)
      }, 1000);
      return unsub;
      })
    }, [members])
    //console.log(memberInfo)
  
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  //console.log(friends[0])
  const renderMember = ({item, index}) => {
    //console.log(item)
    return (
        <View key={item.id}>
        <View  style={{flexDirection: 'row', width: '82.5%', alignItems: 'center'}}>
            <TouchableOpacity style={[styles.friendsContainer, {backgroundColor: theme.backgroundColor}]} activeOpacity={1} onPress={item.id == user.uid ? null : admins.includes(user.uid) ? () => {setAdminModal(true); setPerson(item)}  : () => navigation.navigate('ViewingProfile', {name: item.id, viewing: true})}>
                <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
                 <View style={{paddingLeft: 20, width: '75%'}}>
                    <Text numberOfLines={1} style={[styles.nameText, {fontWeight: '700', fontSize: 19.20, color: theme.color, fontFamily: 'Montserrat_700Bold'}]}>{item.firstName} {item.lastName}</Text>
                    <Text numberOfLines={1} style={[styles.nameText, {color: theme.color}]}>@{item.userName}</Text>
                </View>
            
                
            </TouchableOpacity>
            <View style={{justifyContent: 'center'}}>
              {admins.includes(item.id) ? 
              <MaterialCommunityIcons name='crown-outline' color={theme.color} size={35} style={{alignSelf: 'center'}}/> : null}
              
            </View>
          </View>
          <Divider />
      </View>
    )
  }
  
  //console.log(person.id)
  //console.log(groupId)
  function schedulePushRemoveCliqueNotifications(notificationToken) {
    //console.log(username)
    //console.log(notificationToken)
      fetch(`${BACKEND_URL}/api/removeCliqueNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pushToken: notificationToken, "content-available": 1
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
  function schedulePushAdminNotifications(notificationToken, groupName) {
    //console.log(username)
    //console.log(notificationToken)
      fetch(`${BACKEND_URL}/api/removeCliqueNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pushToken: notificationToken, "content-available": 1, groupName: groupName
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
  function schedulePushSuspendNotifications(notificationToken, groupName) {
    //console.log(username)
    //console.log(notificationToken)
      fetch(`${BACKEND_URL}/api/removeCliqueNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
         pushToken: notificationToken, "content-available": 1, groupName: groupName
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
  //console.log(memberInfo)
  function schedulePushBanNotifications(notificationToken, groupName) {
      fetch(`${BACKEND_URL}/api/banCliqueNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
         pushToken: notificationToken, "content-available": 1, groupName: groupName, data: {routeName: 'NotificationScreen', deepLink: 'nucliqv1://NotificationScreen'}
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
  function schedulePushRemoveNotifications(notificationToken, groupName) {
      fetch(`${BACKEND_URL}/api/removeCliqueNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
         pushToken: notificationToken, "content-available": 1, groupName: groupName, data: {routeName: 'NotificationScreen', deepLink: 'nucliqv1://NotificationScreen'} 
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
  function removeFromClique() {
    let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/removeFromCliq'
    Alert.alert(`Are you sure you want to remove ${person.firstName} ${person.lastName} from this clique?`, `If you do remove ${person.firstName} ${person.lastName} from this clique, they will be notified and may be able to join again`, [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Yes', onPress: async () => 
        {try {
    const response = await fetch(url, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {person: person, groupId: groupId, username: username}}), // Send data as needed
    })
    const data = await response.json();
    if (data.result.done) {
       setMemberInfo(memberInfo.filter((e) => person.id !== e.id))
       setAdminModal(false)
       schedulePushRemoveNotifications(person.notificationToken, groupName)
    }
  } catch (error) {
    console.error('Error:', error);
  }}},
    ]);
  }
  function addAsAdmin() {
    Alert.alert(`Are you sure you want to add ${person.firstName} ${person.lastName} as an admin?`, `If you do add ${person.firstName} ${person.lastName} as an admin, they will be notified and be granted admin privileges`, [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Yes', onPress: async() => await updateDoc(doc(db, 'groups', groupId), {
        admins: arrayUnion(person.id)
      }).then(() => {
        schedulePushAdminNotifications(person.notificationToken, groupName)
      })},
    ]);
  }
  function suspendUser() {
    Alert.alert(`Are you sure you want to suspend ${person.firstName} ${person.lastName}?`, `If you do suspend ${person.firstName} ${person.lastName}, they will be notified and unable to interact with this clique for a week`, [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Yes', onPress: async() => await updateDoc(doc(db, 'groups', groupId), {
        suspendedUsers: arrayUnion(person.id)
      }).then(() => {
        schedulePushSuspendNotifications(person.notificationToken, groupName)
      })},
    ]);
  }
  const renderEvents = ({item, index}) => {
    //console.log(item)
    return (
      <View key={index}>
        <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => {setFilteredGroup([item]); setSearching(false)}}>
            <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: theme.color}]}>{item.firstName} {item.lastName} | @{item.username != undefined ? item.username : item.userName}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center', marginLeft: 'auto'}} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
        </TouchableOpacity>
      </View>
    )
  }
  function banUser() {
    let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/banUser'
    Alert.alert(`Are you sure you want to ban ${person.firstName} ${person.lastName}?`, `If you do ban ${person.firstName} ${person.lastName}, they will be unable to interact with this clique again`, [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Yes', onPress: async() => 
        {try {
    const response = await fetch(url, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {person: person, groupId: groupId}}), // Send data as needed
    })
    const data = await response.json();
    console.log(data)
    if (data.result.done) {
       setMemberInfo(memberInfo.filter((e) => person.id !== e.id))
       setAdminModal(false)
       schedulePushBanNotifications(person.notificationToken, groupName)
    }
  } catch (error) {
    console.error('Error:', error);
  }}},
    ]);
  }
  const handleSearchCallback = (dataToSend) => {
      //console.log(dataToSend)
      setSearching(dataToSend)
    }
    const handleScroll = _.debounce((event) => {
    // Your logic for fetching more data
    fetchMoreData()
  }, 500);
  //console.log(members)
  const fetchMoreData = () => {
    console.log('thi')
    setLoading(true)
        const fetchCards = async () => {
          newData = [];
          const docSnap = await getDoc(doc(db, 'groups', groupId))
          setMembers([...members, ...docSnap.data().members.slice(followingCount - 20, followingCount)])
          
        }
        fetchCards();
        setTimeout(() => {
          setFollowingCount(followingCount + 20)
            setLoading(false)
          }, 1000);
  }
  const handleFunctionCallback = (dataToSend) => {
    if (dataToSend.id == user.uid) {
      return;
    }
    else if (admins.includes(user.uid)) {
      setAdminModal(true); setPerson(dataToSend) 
    }
    else {
      console.log(dataToSend)
      navigation.navigate('ViewingProfile', {name: dataToSend.id, viewing: true})
    } 
    //console.log(dataToSend)
  }
  
  //console.log(members.length)
    //console.log(admins)
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}> 
    <Modal visible={adminModal} animationType="slide" transparent onRequestClose={() => {setAdminModal(!adminModal); }}>
            <View style={[styles.modalContainer, styles.overlay]}>
                <View style={[styles.modalView, {backgroundColor: theme.backgroundColor}]}>
                    <MaterialCommunityIcons name='close' color={theme.color} size={30} style={{textAlign: 'right', padding: 10, paddingRight: 0}} onPress={() => setAdminModal(false)}/>
                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                      <FastImage source={person.pfp ? {uri: person.pfp} : require('../assets/defaultpfp.jpg')} style={{borderRadius: 8, height: 60, width: 60}}/>
                      <Text numberOfLines={1} style={[styles.nameText, {textAlign: 'center', fontWeight: '600', color: theme.color}]}>{person.firstName} {person.lastName}</Text>
                    </View>
                    {!admins.includes(person.id) ? 
                    <TouchableOpacity style={styles.optionContainer} onPress={() => removeFromClique()}>
                    <MaterialCommunityIcons name='account-remove' size={25} color={theme.color}/>
                    <Text style={[styles.optionText, {color: theme.color}]}>Remove {person.firstName} {person.lastName} from cliq</Text>
                    </TouchableOpacity> : null}
                    {!admins.includes(person.id) ? 
                    <TouchableOpacity style={styles.optionContainer} onPress={() => banUser()}>
                    <MaterialCommunityIcons name='account-cancel' size={25} color={theme.color}/>
                    <Text style={[styles.optionText, {color: theme.color}]}>Ban {person.firstName} {person.lastName} from cliq</Text>
                    </TouchableOpacity> : null}
                    <TouchableOpacity style={styles.optionContainer} onPress={() => {navigation.navigate('ViewingProfile', {name: person.id, viewing: true}); setAdminModal(false)}}>
                    <MaterialCommunityIcons name='account-circle-outline' size={25} color={theme.color}/>
                    <Text style={[styles.optionText, {color: theme.color}]}>View {person.firstName} {person.lastName}'s profile</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    {!searching ? 
    <>
    <View style={styles.innerContainer}>
      <View style={{flexDirection: 'row'}}>
        <MaterialCommunityIcons name='chevron-left' size={37.5} color={theme.color} style={{marginLeft: '5%', marginTop: 25}} onPress={() => navigation.goBack()}/>
              <View style={{alignSelf: 'center', marginTop: '15%', marginLeft: '5%'}}>
                 <FastImage source={require('../assets/DarkMode5.png')} style={{height: 27.5, width: 68.75}}/>
              </View>
      </View>   
              {/* <Ionicons name='search' size={27.5} color={theme.color} style={{alignSelf: 'center', marginRight: '10%', marginTop: 25}} onPress={() => setSearching(true)}/> */}
          </View>
    <Divider borderBottomWidth={0.4} color={theme.color} style={{borderBottomColor: theme.color}}/>
    <Text style={[styles.header, {color: theme.color}]}>All Members: {Array.from(new Set(memberInfo.map(item => item.id))).map(id => memberInfo.find(obj => obj.id === id)).length > 999 && Array.from(new Set(memberInfo.map(item => item.id))).map(id => memberInfo.find(obj => obj.id === id)).length < 1000000 
    ? `${Array.from(new Set(memberInfo.map(item => item.id))).map(id => memberInfo.find(obj => obj.id === id)).length / 1000}k` : Array.from(new Set(memberInfo.map(item => item.id))).map(id => memberInfo.find(obj => obj.id === id)).length > 999999 ? `${Array.from(new Set(memberInfo.map(item => item.id))).map(id => memberInfo.find(obj => obj.id === id)).length / 1000000}m` : Array.from(new Set(memberInfo.map(item => item.id))).map(id => memberInfo.find(obj => obj.id === id)).length}</Text>
          
      <FlatList 
        data={filteredGroup.length > 0 ? Array.from(new Set(filteredGroup.map(item => item.id))).map(id => filteredGroup.find(obj => obj.id === id)) : Array.from(new Set(memberInfo.map(item => item.id))).map(id => memberInfo.find(obj => obj.id === id))}
        renderItem={renderMember}
        keyExtractor={(item, index) => item.id + index}
        onScroll={handleScroll}
      /> 
      </>
      : 
      <> 
          <View style={{marginTop: '10%'}}>
            <Text style={[styles.header, {marginLeft: '5%', color: theme.color}]}>All Members: {members.length}</Text>
            <View style={{margin: '5%'}}>
            <TouchableOpacity activeOpacity={1} style={{width: '100%', marginTop: '2.5%', zIndex: 0}}>
            <View style={{flexDirection: 'row'}}>
                  <SearchInput value={specificSearch} icon={'magnify'} placeholder={'Search'} onFocus={() => { setSearching(true)}} iconStyle={styles.homeIcon}
                  containerStyle={!searching ? {borderWidth: 1, borderColor: theme.color, width: '100%'} : {borderWidth: 1, borderColor: theme.color, width: '90%'}} text={searching ? true : false} onChangeText={setSpecificSearch} 
                  onPress={() => {  setSpecificSearch(''); setSearching(true)}}/>
                  {searching ?
                  <MaterialCommunityIcons name='close' size={40} style={styles.closeHomeIcon} color={theme.color} onPress={() => { setSearching(false); Keyboard.dismiss(); setFiltered([]); setSpecificSearch('')}}/> : null}
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
                  
                  <TouchableOpacity style={{alignItems: 'center', marginRight: '5%'}} onPress={() => { setMoreResults(true); setMoreResultButton(false);}}>
                    <Text style={{paddingTop: 5, fontFamily: 'Montserrat_400Regular', color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}}>See more results</Text>
                    </TouchableOpacity>
                  </View> : <></>}
                  </View>
                  
                  
              </TouchableOpacity>
              
          </View>
            
          </View>
      </>
      }
    
    </View>
  )
}

export default GroupMembers

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
    firstNameText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 2.5,
        paddingBottom: 0
    },
    membersContainer: {
        flexDirection: 'row', 
        marginTop: '5%', 
        marginLeft: '5%', 
        marginRight: '5%', 
        justifyContent: 'space-between',
    },
    header: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        marginLeft: '5%',
        //padding: 10,
        marginTop: '5%'
    },
    innerContainer: {
    marginTop: '5%',
      marginBottom: '3%',
      //marginLeft: '5%',
      //marginRight: '5%',
      justifyContent: 'space-between',
      flexDirection: 'row',
  },
  modalContainer: {
        flex: 1,
        //justifyContent: 'center',
        //alignItems: 'center',
        marginTop: '10%'
    },
  modalView: {
    width: '100%',
    height: '100%',
    //margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    paddingTop: 5,
    paddingBottom: 0,
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
  nameText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 2.5,
        paddingBottom: 0,
        width: '90%'
    },
    optionText: {
        fontSize: 19.20,
        fontWeight: '600',
        fontFamily: 'Montserrat_500Medium',
        padding: 10,
        width: '90%',
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        //marginLeft: '5%',
        //marginRight: '5%',
        marginTop: '5%'
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
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    homeIcon: {position: 'absolute', left: 280, top: 8.5},
    closeHomeIcon: {marginLeft: '1%'},
})