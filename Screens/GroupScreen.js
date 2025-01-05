import { StyleSheet, Text, View, TouchableOpacity, FlatList, Keyboard, Alert, ActivityIndicator} from 'react-native'
import React, { useState, useEffect, useMemo, useContext } from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'
import { query, onSnapshot, collection, updateDoc, doc, arrayUnion, deleteDoc, documentId, getDoc, where, startAfter, limit, arrayRemove, addDoc, serverTimestamp, setDoc, orderBy, getDocs, increment} from 'firebase/firestore'
import useAuth from '../Hooks/useAuth'
import SearchInput from '../Components/SearchInput'
import { Provider, Divider } from 'react-native-paper'
import MainButton from '../Components/MainButton'
import FastImage from 'react-native-fast-image';
import RequestedIcon from '../Components/RequestedIcon';
import ThemeHeader from '../Components/ThemeHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RecentSearches from '../Components/RecentSearches';
import _ from 'lodash'
import themeContext from '../lib/themeContext';
import { db } from '../firebase'
const GroupScreen = ({route}) => {
  const [groups, setGroups] = useState([]);
  const theme = useContext(themeContext)
  const [filteredGroup, setFilteredGroup] = useState([]);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [completeFilteredGroup, setCompleteFilteredGroup] = useState([]);
  const [shouldgetdata, setShouldgetData] = useState(true);
  const [groupSearches, setGroupSearches] = useState([]);
  const [recentSearches, setRecentSearches] = useState(false);
  const [moreResults, setMoreResults] = useState(false);
  const [moreResultButton, setMoreResultButton] = useState(false);
  const [tempPosts, setTempPosts] = useState([])
  const [completeGroups, setCompleteGroups] = useState([]);
  const [specificSearch, setSpecificSearch] = useState('');
  const [lastVisible, setLastVisible] = useState();
  const [searching, setSearching] = useState(false)
  const [searches, setSearches] = useState([]);
  const [tempSearches, setTempSearches] = useState([]);
  const [cliqueSearches, setCliqueSearches] = useState([]);
  const navigation = useNavigation();
  const [filtered, setFiltered] = useState();
  const [bannedFrom, setBannedFrom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chosenClique, setChosenClique] = useState(null);
  const [groupsJoined, setGroupsJoined] = useState([]);
  const [requests, setRequests] = useState([]);
  const {user} = useAuth()
  const [done, setDone] = useState(false)
  const [following, setFollowing] = useState(false);
  const [explore, setExplore] = useState(true);
    const removeCurrentUser = async(item) => {
      await updateDoc(doc(db, 'profiles', user.uid), {
      adminGroups: arrayRemove(item)
    }).then(async() => (await getDocs(collection(db, 'profiles'))).forEach(async(document) => {
      await deleteDoc(doc(db, 'profiles', user.uid, 'channels', item))
        if (document.data().groupsJoined.includes(item)) {
              await updateDoc(doc(db, 'profiles', document.id), {
                groupsJoined: arrayRemove(item)
            })
        }
        
    }))
    }
  useEffect(() => {
    if (route.params?.firstTime) {
        setIsFirstTime(false)
      }
  }, [route.params])
  useMemo(() => {
    let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'groupRequests')), (snapshot) => {
          setRequests(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
        })
      } 
      fetchCards();
      return unsub;
  }, [])
  useMemo(() => {
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
  function skipWalkthrough() {
    const check = async() => {
      await AsyncStorage.setItem('isFirstTime', 'false');
      setIsFirstTime(false)
    }
    check()
  }
  useEffect(() => {
    //console.log(specificSearch.toLowerCase())
    if (specificSearch.length > 0) {
      //console.log('first')
      setCliqueSearches([])
      const getData = async() => {
        const q = query(collection(db, "groups"), where('searchkeywords', 'array-contains', specificSearch.toLowerCase()), limit(10));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          //console.log(doc.id)
          // doc.data() is never undefined for query doc snapshots
          setCliqueSearches(prevState => [...prevState, {id: doc.id, ...doc.data()}])
        });
      }
      getData();
    } 
  }, [specificSearch])
  useEffect(() => {
    let unsub;
    const getProfileDetails = async() => {
      unsub = onSnapshot(doc(db, 'profiles', user.uid), (doc) => {
        if (doc.exists()) {
          setGroupsJoined(doc.data().groupsJoined)
          setBannedFrom(doc.data().bannedFrom)
        }
      })
      setShouldgetData(false)
  }
  
  getProfileDetails();
  return unsub;
  }, [onSnapshot])
    useEffect(() => {
      if (explore && bannedFrom != null && completeGroups.length == 0) {

        setTempPosts([]);
        let fetchedCount = 0;
        new Promise(resolve => {
          const fetchCards = async() => {
            const q = query(collection(db, 'groups'), limit(10-groups.length), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              if (!groups.some(obj => obj.id == doc.id) && bannedFrom.includes(doc.id)) {
                fetchedCount++;
                
              }
              else if (!groups.some(obj => obj.id == doc.id)) {
                 setTempPosts(prevState => [...prevState, {id: doc.id, transparent: false, ...doc.data()}])
              }
                
            });
            if (fetchedCount === 10-groups.length && tempPosts.length === 0) {
              // All 3 posts were blocked, fetch more
              const nextQuery = query(
                collection(db, 'groups'),
                orderBy('timestamp', 'desc'),
                startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
                limit(10-groups.length)
              );
              const nextSnapshot = await getDocs(nextQuery);
              nextSnapshot.forEach((doc) => {
                setTempPosts(prevState => [...prevState, {id: doc.id, transparent: false, ...doc.data()}])
              })
            }
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
          }
          fetchCards();
          resolve()
          
        }).finally(() => {setDone(true); 
          setLoading(false);
          });
          
      }
      else if (following && completeGroups.length == 0) {
        //setTempPosts([]);
        new Promise(resolve => {
        const loopCount = Math.ceil(groupsJoined.length / 30)

          for (let i = 0; i < loopCount; i++) {

            const fetchCards = async () => {
              const q = query(collection(db, 'groups'), where(documentId(), 'in', groupsJoined.slice(30 * i, 30 * (i+1))), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              //console.log(doc.id)
              if (!groups.some(doc2 => doc2.id === doc.id)) {
                setTempPosts(prevState => [...prevState, {id: doc.id, transparent: false, ...doc.data()}])                
              }
                
            });
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
          }
          fetchCards();
          
          }
          resolve()
        }).finally(() => {setDone(true); 
          
              setLoading(false)
          });
      }

    }, [explore, following, bannedFrom, completeGroups])
    useEffect(() => {
      if (done) {
        if (tempPosts.length > 0) {
        setCompleteGroups([...tempPosts])
      }
      }
    }, [tempPosts, done])
    useMemo(() => {
    if (specificSearch.length > 0 && bannedFrom != null) {
      //console.log('first')
      setGroupSearches([])
      const getData = async() => {
        const firstQ = query(collection(db, "groups"), where('searchkeywords', 'array-contains', specificSearch.toLowerCase()), limit(10));
        const firstQuerySnapshot = await getDocs(firstQ)
        firstQuerySnapshot.forEach((doc) => {
          if (!bannedFrom.includes(doc.id))
            setGroupSearches(prevState => [...prevState, {id: doc.id, ...doc.data()}])
        })
      }
      
      getData();
    } 
  }, [specificSearch, bannedFrom])
    useEffect(() => {
        if (specificSearch.length > 0 && groupSearches.length > 0) {
          console.log('ft')
      setSearching(true)
      setMoreResultButton(false)
      setMoreResults(false)
      setRecentSearches(true)
      const temp = specificSearch.toLowerCase()
      const tempList = Array.from(new Set(groupSearches.map(JSON.stringify))).map(JSON.parse).filter(item => {
        if (item.name.toLowerCase().match(temp)) {
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
    }, [groupSearches, specificSearch])
  useMemo(() => {

      let unsub;
      const fetchSearches = async() => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('group', '==', true), orderBy('timestamp', 'desc'), limit(3)), (snapshot) => {
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
        //console.log(item)
         const docSnap = await getDoc(doc(db, 'groups', item.id))
         if (docSnap.exists()) {
          setTempSearches(prevState => [...prevState, {id: docSnap.id, searchId: item.searchId, ...docSnap.data()}])
         }
        
      })
    }
  }, [searches])
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
      const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.members = [...item.members, user.uid];
      const objectIndex = completeGroups.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...completeGroups];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setCompleteGroups(updatedData);
      setGroupsJoined(prevState => [...prevState, item.id])
    }
      //setCompleteGroups(completeGroups)
      await updateDoc(doc(db, 'groups', item.id), {
      members: arrayUnion(user.uid),
      allowMessageNotifications: arrayUnion(user.uid),
      allowPostNotifications: arrayUnion(user.uid)
      //timestamp: serverTimestamp()
    }).then(async() => await updateDoc(doc(db, 'groups', item.id, 'channels', item.id), {
                    members: arrayUnion(user.uid),
                    member_count: increment(1),
                    lastMessageTimestamp: serverTimestamp(),
                    allowNotifications: arrayUnion(user.uid)
                })).then(async() => await setDoc(doc(db, 'profiles', user.uid, 'channels', item.id), {
                  channelsJoined: arrayUnion(item.id)
                })).then(async() => await updateDoc(doc(db, "profiles", user.uid), {
            groupsJoined: arrayUnion(item.id)  
        })).catch((e) => console.log(e))
    }
      
  }
  async function removeGroup(item) {
    const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.members = item.members.filter((e) => e != user.uid)
    const objectIndex = completeGroups.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...completeGroups];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setCompleteGroups(updatedData);
      //console.log(item.id)
      setGroupsJoined(groupsJoined.filter((e) => e !== item.id))
    }
    const docSnap  = (await getDoc(doc(db, 'groups', item.id)))
    if (docSnap.data().admins.includes(user.uid) && docSnap.data().admins.length == 1) {
      Alert.alert('Delete Clique?', 'By leaving the Clique, since you are the only admin, the Clique will be deleted', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => Promise.all(item.members.map(async(e) => await updateDoc(doc(db, 'profiles', e), {
                    groupsJoined: arrayRemove(user.uid)
                }))).then(async() => await deleteDoc(doc(db, 'groups', item.id)).then(async() => await setDoc(doc(db, 'deletedCliques', item.id), {
        timestamp: serverTimestamp(),
        members: docSnap.data().members,
        admins: docSnap.data().admins,
        info: docSnap.data()
      }))).then(() => removeCurrentUser(item.id)).then(() => setCompleteGroups(completeGroups.filter((e) => e.id != item.id))).catch((e) => console.log(e))},
    ]);
    }
    else if (docSnap.data().admins.includes(user.uid) && docSnap.data().admins.length > 1) {
      Alert.alert('Leave Clique?', "By leaving the Clique, if you re-join, you won't automatically be an admin again.", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: async() => await updateDoc(doc(db, 'groups', item.id), {
        members: arrayRemove(user.uid),
        admins: arrayRemove(user.uid)
      }).catch((e) => console.log(e)).then(() => removeCurrentUser(item.id))},
    ]);
    }
    else {
      
      await updateDoc(doc(db, 'groups', item.id), {
        members: arrayRemove(user.uid),
      }).then(() => removeCurrentUser(item.id))
    }
    
    }
  

  function fetchMoreData () {
    if (lastVisible != undefined && explore) {
    setDone(false)
    let newData = [];
    let fetchedCount = 0;
      const fetchCards = async () => {
        const q = query(collection(db, 'groups'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              if (!completeGroups.some(doc2 => doc2.id === doc.id) && bannedFrom.includes(doc.id)) {
                fetchedCount++;
                
              }
              else if (!completeGroups.some(doc2 => doc2.id === doc.id)) {
                newData.push({
                    id: doc.id,
                    transparent: false,
                    ...doc.data()
                  })
              }
              
              
            });
            if (fetchedCount === 10 && newData.length === 0) {
              // All 3 posts were blocked, fetch more
              const nextQuery = query(
                collection(db, 'groups'),
                orderBy('timestamp', 'desc'),
                startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
                limit(10)
              );
              const nextSnapshot = await getDocs(nextQuery);
              nextSnapshot.forEach((doc) => {
                 newData.push({
                    id: doc.id,
                    transparent: false,
                    ...doc.data()
                  })
              })
            }
            if (newData.length > 0) {
                setLoading(true)
                
                setTempPosts([...tempPosts, ...newData])
                setDone(true)
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
              }
      }
      fetchCards();
      setTimeout(() => {
        setLoading(false) 
      }, 1000);
    }
    else if (lastVisible != undefined && following) {
    setLoading(true)
    setDone(false)
    let unsub;
      const loopCount = Math.ceil(groupsJoined.length / 30)
          for (let i = 0; i < loopCount; i++) {
      const fetchCards = async () => {
        const q = query(collection(db, 'groups'), where(documentId(), 'in', groupsJoined.slice(30 * i, 30 * (i+1))), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10 / groupsJoined.length));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              if (!groups.some(doc2 => doc2.id === doc.id)) {
                newData.push({
                    id: doc.id,
                    transparent: false,
                    ...doc.data()
                  })
              }
              if (newData.length > 0) {
                
                setTempPosts([...tempPosts, ...newData])
                setDone(true)
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
              }
            });
      }
      fetchCards();
    }
      setTimeout(() => {
          setLoading(false)
        }, 1000);
      return unsub;
    }
    
  }
  const handleSearchCallback = (dataToSend) => {
    setSearching(dataToSend)
    setFiltered([]);
    setSpecificSearch('')
  }
  useEffect(() => {
    if (filteredGroup.length > 0) {
      const getData = async() => {
       const docSnap = await getDoc(doc(db, 'groups', filteredGroup[0].id))
       setCompleteFilteredGroup([{id: docSnap.id, ...docSnap.data()}])
      }
      getData()
     }
  }, [filteredGroup])
  function itemAllToTransparent(item) {
    if (completeFilteredGroup.length > 0) {
      const updatedThemes = [...completeFilteredGroup];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.id)
    updatedThemes[objectIndex].transparent = true
    setCompleteFilteredGroup(updatedThemes)
    }
    else {
      const updatedThemes = [...completeGroups];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.id)
    updatedThemes[objectIndex].transparent = true
    setCompleteGroups(updatedThemes)
    }
    
  }
  function itemAllNotToTransparent(item) {
    if (completeFilteredGroup.length > 0) {
      const updatedThemes = [...completeFilteredGroup];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.id)
    updatedThemes[objectIndex].transparent = false
    setCompleteFilteredGroup(updatedThemes)
    }
    else {
      const updatedThemes = [...completeGroups];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.id)
    updatedThemes[objectIndex].transparent = false
    setCompleteGroups(updatedThemes)
    }
  }
  //console.log(groupsJoined)
  function addToRecentSearches(item) {
      //console.log(item)
      var element = item
      if (tempSearches.filter(e => e.id == item.id).length > 0) {
      //console.log('bruh')
      tempSearches.map(async(e) => {
        if (e.id == e.id) {
          //setTempId(element.id)
          await updateDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id), {
            group: true,
            element,
            user: false,
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
        group: true,
        element,
        user: false,
        ai: false,
        friend: false,
        theme: false,
        timestamp: serverTimestamp()
      })
    }
  }
  const renderCliqueEvents = ({item, index}) => {
    //console.log(item)
    return (
        <TouchableOpacity style={styles.categoriesContainer} onPress={() => {setFilteredGroup([item]); addToRecentSearches(item); setSearching(false)}}>
            <FastImage source={item.banner ? {uri: item.banner} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={styles.categories}>{item.name}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center', marginLeft: 'auto'}} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
        </TouchableOpacity>
    )
  }
  const renderCliqueSearches = ({item}) => {
    //console.log(item)
    return (
        <TouchableOpacity style={styles.categoriesContainer} onPress={() => {setFilteredGroup([item]); setSearching(false)}}>
            <FastImage source={item.banner ? {uri: item.banner} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={styles.categories}>{item.name}</Text>
            <TouchableOpacity onPress={() => removeSearch(item)} style={{alignSelf: 'center', marginLeft: "auto"}}>
                <MaterialCommunityIcons name='close' size={30} color={theme.color}  />
            </TouchableOpacity>
        </TouchableOpacity>
    )
  }
  async function removeSearch(item) {
      await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', item.searchId))
      setTempSearches(tempSearches.filter((e) => e.searchId !== item.searchId))
  }
  const renderItem = ({item, index}) => {
    if (item.members != undefined) {
      return (
        <>
    <View style={styles.posting}>
      <TouchableOpacity style={{alignItems: 'flex-start', flexDirection: 'row',
      }} activeOpacity={1} onPress={item.groupSecurity !== 'private' || groupsJoined.includes(item.id) ? () => navigation.navigate('GroupHome', {name: item.id, newPost: false, postId: null}) : item.groupSecurity == 'private' ? () =>  Alert.alert('Private Cliq', 'Must join Cliq in order to view') : null}>
        <FastImage source={item.banner ? {uri: item.banner} : require('../assets/defaultpfp.jpg')} style={{height: 50, width: 50, borderRadius: 10, marginTop: 5}}/>
        <View style={{flexDirection: 'column', marginLeft: 5}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{width: '40%'}}>
        <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
        {item.members.length == 1 ? <Text style={styles.type}>{item.members.length} Member</Text> 
            : <Text style={styles.type}>{item.members.length > 999 && item.members.length < 1000000 ? `${item.members.length / 1000}k` : item.members.length > 999999 ? `${item.members.length / 1000000}m` : item.members.length} Members</Text>}
        </View>
        <View style={{alignItems: 'flex-end'}}>
             {item.groupSecurity == 'private' && requests.filter(e => e.id === item.id).length > 0 ?
             <View style={styles.requestedJoinContainer}>
              <RequestedIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
              </View>
               :
            user ? !groupsJoined.includes(item.id) ? <TouchableOpacity style={[styles.joinContainer, {backgroundColor: "#005278"}]} onPress={() => {updateGroup(item)}}>
                  <Text style={styles.joinText}>Join</Text>
                  
              </TouchableOpacity> :  
              <TouchableOpacity style={[styles.joinContainer, {backgroundColor: "#005278"}]} onPress={() => removeGroup(item)}>
                  <Text style={styles.joinText}>Joined</Text>
                 
              </TouchableOpacity> : null}
             
            </View>
            
            </View>
       <Text numberOfLines={3} style={styles.descriptionText}>{item.description}</Text>
       </View>
      </TouchableOpacity>
      {/* <View style={{flexDirection: 'row', justifyContent: 'space-between', marginLeft: '1%'}}>
          
          {bannedFrom != null && bannedFrom.includes(item.id) ? null : 
          <TouchableOpacity onPress={() => itemAllToTransparent(item)}>
            <Entypo name="dots-three-vertical" style={{alignSelf: 'center'}} size={17.5} color={theme.color}/>
          </TouchableOpacity>}
          
        </View> */}
      {item.transparent ? 
        <View style={styles.overlay}>
          <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}} onPress={() => {itemAllNotToTransparent(item); setChosenClique(null)}}>
            <Text style={styles.closeText}>Close</Text>
            <MaterialCommunityIcons name='close' size={30} color={'#fafafa'}/>
          </TouchableOpacity>
          <View style={{alignItems: 'center'}}>
             {item.groupSecurity == 'private' && requests.filter(e => e.id === item.id).length > 0 ?
             <View style={styles.requestedJoinContainer}>
              <RequestedIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
              </View>
               :
            user ? !groupsJoined.includes(item.id) ? <TouchableOpacity style={styles.joinContainer} onPress={() => {updateGroup(item)}}>
                  <Text style={styles.joinText}>Join</Text>
                  <MaterialCommunityIcons name='account-plus' size={20} style={{alignSelf: 'center', padding: 5, paddingRight: 15}} color={theme.color}/>
              </TouchableOpacity> :  
              <TouchableOpacity style={styles.joinContainer} onPress={() => removeGroup(item)}>
                  <Text style={styles.joinText}>Joined</Text>
                  <MaterialCommunityIcons name='check' size={20} style={{alignSelf: 'center', padding: 5, paddingRight: 15}} color={theme.color}/>
              </TouchableOpacity> : null}
              <TouchableOpacity style={styles.joinContainer} onPress={item.groupSecurity == 'private' ? () =>  Alert.alert('Private Cliq', 'Must join Cliq in order to share') : () => navigation.navigate('Chat', {sending: true, message: true, payloadGroup: {name: item.name, pfp: item.banner, id: item.id, group: item.id}})}>
                <Text style={styles.joinText}>Share Cliq</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={styles.joinContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, theme: false, comment: null, cliqueId: item.id, post: false, cliq: true, comments: false, message: false, cliqueMessage: false, reportedUser: item.id})}>
                <Text style={styles.joinText}>Report Cliq</Text>
              </TouchableOpacity> */}
             
            </View>
        </View>
      : null
      }
      </View>
    </>
    )
    }
    
  }
  
  const handleMeetCallback = (dataToSend) => {
    setExplore(dataToSend)
    setCompleteGroups([])
    setFilteredGroup([]);
    setCompleteFilteredGroup([]);
  }
  const handleFollowingCallback = (dataToSend) => {
    setFollowing(dataToSend)
    setCompleteGroups([])
    setTempPosts([]);
    setFilteredGroup([]);
    setCompleteFilteredGroup([]);
  }
  //console.log(myCliques)
  const handleFilteredGroupCallback = (dataToSend) => {
    setFilteredGroup(dataToSend)
  }
  const handleScroll = _.debounce((event) => {
    // Your logic for fetching more data
    setLoading(true)
      fetchMoreData()
      setTimeout(() => {
        setLoading(false)
      }, 1000);
  }, 500);

  return (
    <Provider>
    <View style={styles.container}>
          <View style={{backgroundColor: theme.backgroundColor}}>
                  <ThemeHeader adminCliques={() => navigation.navigate('MyGroups')} text={"Cliqs For You"} actuallyExplore={explore ? true: false} actuallyJoined={following ? true: false} groupsJoined={groupsJoined} filteredGroup={handleFilteredGroupCallback}
                  clique={true} searching={handleSearchCallback} actuallyFilteredGroup={filteredGroup} following={handleFollowingCallback} explore={handleMeetCallback}/>
          </View>
          {searching ? 
          <View style={styles.homeContainer}>
            <Divider style={{marginTop: '-2.5%', marginLeft: '-10%', width: '115%', color: theme.color, borderWidth: 0.5}}/>
            <TouchableOpacity activeOpacity={1} style={{width: '100%', marginTop: '2.5%', zIndex: 0}}>
              <View style={{flexDirection: 'row'}}>
                  <SearchInput autoFocus={true} value={specificSearch} icon={'magnify'} placeholder={'Search'} onFocus={() => {setRecentSearches(true); setSearching(true)}} iconStyle={styles.homeIcon}
                  containerStyle={{borderWidth: 1, borderColor: theme.color, width: '85%'}} onSubmitEditing={() => {setRecentSearches(false)}} text={searching ? true : false} onChangeText={setSpecificSearch} 
                  onPress={() => {setRecentSearches(true); setSearching(true)}}/>
                  <MaterialCommunityIcons name='close' size={40} color={theme.color} style={{marginLeft: '1%'}} onPress={() => {setRecentSearches(false); setSearching(false); Keyboard.dismiss(); setFiltered([]); setSpecificSearch('')}}/>
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
                      renderItem={renderCliqueEvents}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{flexGrow: 1}}
                      //contentContainerStyle={{width: '100%', zIndex: 3, flewGrow: 1}}
                      scrollEnabled={moreResultButton ? false: true}
                  /> 
                  {
                    recentSearches && searching ?
                    <RecentSearches data={tempSearches.filter((obj, index, self) => index === self.findIndex((o) => o.searchId === obj.searchId)).reverse()} 
                    theme={false} group={true} home={false} friend={false} ai={false} extraStyling={{width: '95%'}}
                    renderSearches={renderCliqueSearches}/> : null
                  }
                  </>
                  : searching && (moreResults || specificSearch.length > 0) ? 
                  <View>
                  <FlatList 
                      data={!moreResults ? filtered.slice(0, 3) : filtered.slice(0, 10)}
                      renderItem={renderCliqueEvents}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{flexGrow: 1}}
                      scrollEnabled={moreResultButton ? false: true}
                  /> 
                  
                  <TouchableOpacity style={{alignItems: 'center', marginRight: '5%'}} onPress={() => {setRecentSearches(false); setMoreResults(true); setMoreResultButton(false);}}>
                    <Text style={{paddingTop: 5, color: theme.theme != 'light' ? "#9EDAFF" : "#005278", fontFamily: 'Montserrat_400Regular'}}>See more results</Text>
                    </TouchableOpacity>
                  </View> : <></>}
                  {
                    recentSearches && searching ?
                    <RecentSearches data={tempSearches.filter((obj, index, self) => index === self.findIndex((o) => o.searchId === obj.searchId)).reverse()} 
                    theme={false} group={true} home={false} friend={false} ai={false} extraStyling={{width: '95%'}}
                    renderSearches={renderCliqueSearches}/> : null
                  }
                  </View>
                  
                  
              </TouchableOpacity>
              
          </View>
                  : null}
          <View style={loading ? {height: '87%', backgroundColor: theme.backgroundColor} : searching ? {height: '87%', backgroundColor: theme.backgroundColor} : {height: '87%'}}>
          {completeFilteredGroup.length > 0 && !searching ? <FlatList
            data={completeFilteredGroup}
            renderItem={renderItem}
            keyExtractor={(item) => (item.id)}
            style={{height: '70%', marginTop: 5}}
            ListFooterComponent={<View style={{paddingBottom: 100}}/> }
          /> : completeGroups.length > 0 && !searching ? <FlatList 
            data={completeGroups.filter((obj, index, self) => index === self.findIndex((o) => o.id === obj.id))}
            renderItem={renderItem}
            keyExtractor={(item) => (item.id)}
            style={{height: '70%', marginTop: 5}}
            onScroll={handleScroll}
            extraData={loading}
            ListFooterComponent={loading ? <View style={{ alignItems: 'center', paddingBottom: 10}}> 
                <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
              </View> : <View style={{paddingBottom: 10}}/>
          }
          /> : !searching && !loading ? <View style={{justifyContent: 'center', alignItems: 'center', flex: 1, marginBottom: '30%'}}>
              <Text style={styles.noGroupsText}>No More Cliqs</Text>
              <MainButton text={"Make a Cliq"} onPress={() => navigation.navigate('GroupName')}/>
            </View> : null}
          </View>
      </View>
    </Provider>
  )
}

export default GroupScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212"
  },
  posting: {
    width: '90%',
    marginLeft: '5%',
    borderWidth: 1,
    padding: 10,
    borderColor: "#fafafa",
    paddingBottom: 5,
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden'
  },
  requestedJoinContainer: {
    marginTop: 10,
    borderRadius: 8,
    width: '65%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 5, 
    backgroundColor: "#121212"
    },
  joinContainer: {
    marginTop: 10,
    borderRadius: 8,
    width: '65%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: "#121212"
  },
  blueJoinContainer: {
    marginTop: 10,
    borderRadius: 8,
    width: '65%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: "#121212",
    backgroundColor: "#005278"
  },
  joinText: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    padding: 5,
    paddingRight: 0,
    color: "#fafafa"
  },
  noGroupsText: {
    fontSize: 24,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    paddingBottom: 30,
    color: "#fafafa"
  },
  nameText: {
    marginHorizontal: '5%',
    marginVertical: '2.5%',
    fontSize: 19.20,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'left',
    color: "#fafafa"
  },
  descriptionText: {
    marginHorizontal: '5%',
    marginVertical: '2.5%',
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'left',
    color: "#fafafa",
    width: '90%', 
    fontSize: 15.36, 
    marginLeft: 0, 
    paddingLeft: 10, 
    paddingTop: 0, 
    marginTop: 0
  },
  closeText: {
    fontSize: 12.29,
    padding: 2.5,
    color: "#fafafa",
    fontFamily: 'Montserrat_700Bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  homeContainer: {
    marginLeft: '5%', 
    marginBottom: '5%'
  },
  homeIcon: {
    position: 'absolute', 
    left: 280, 
    top: 8.5
  },
  categoriesContainer: {
    borderRadius: 5,
    flexDirection: 'row',
    marginTop: 5,
    padding: 5,
    alignItems: 'center',
    backgroundColor: "#121212",
    width: '95%',
  },
  categories: {
    fontSize: 15.36,
    padding: 10,
    width: '80%',
    color: "#fafafa",
    fontFamily: 'Montserrat_500Medium'
  },
  type: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    padding: 5,
    paddingLeft: 10,
    paddingTop: 0,
    color: "#fafafa"
  },
})