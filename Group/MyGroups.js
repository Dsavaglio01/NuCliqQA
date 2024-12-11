import { StyleSheet, Text, View, Keyboard, TouchableOpacity, FlatList, Alert, ActivityIndicator} from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import themeContext from '../lib/themeContext'
import ThemeHeader from '../Components/ThemeHeader'
import SearchInput from '../Components/SearchInput'
import RecentSearches from '../Components/RecentSearches'
import {MaterialCommunityIcons, Entypo} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'
import MainButton from '../Components/MainButton'
import { onSnapshot, doc, addDoc, deleteDoc, getDoc, increment, arrayUnion, arrayRemove, setDoc, updateDoc, serverTimestamp, getDocs, query, collection, limit, orderBy, startAfter } from 'firebase/firestore'
import useAuth from '../Hooks/useAuth'
import { db } from '../firebase'
import FastImage from 'react-native-fast-image'
import _ from 'lodash';
import { Divider } from 'react-native-paper'
const MyGroups = () => {
    const theme = useContext(themeContext)
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [recentSearches, setRecentSearches] = useState(false);
    const [specificSearch, setSpecificSearch] = useState('');
    const [chosenClique, setChosenClique] = useState(null);
    const [filtered, setFiltered] = useState([]);
    const [moreResults, setMoreResults] = useState(false);
    const [adminList, setAdminList] = useState(false);
    const [searches, setSearches] = useState([]);
  const [tempSearches, setTempSearches] = useState([]);
  const [groupsJoined, setGroupsJoined] = useState([]);
  const navigation = useNavigation();
  const [tempPosts, setTempPosts] = useState([]);
  const [groupSearches, setGroupSearches] = useState([]);
    const [moreResultButton, setMoreResultButton] = useState(false);
    const {user} = useAuth();
  const [filteredGroup, setFilteredGroup] = useState([]);
  const [completeGroups, setCompleteGroups] = useState([]);
  const [completeFilteredGroup, setCompleteFilteredGroup] = useState([]);
  useEffect(() => {
    const getData = async() => {
      const docSnap = await getDoc(doc(db, 'profiles', user.uid))
      setTempPosts(docSnap.data().groupsJoined.slice(0, 5))
      setTimeout(() => {
        setDone(true)
      }, 100);
    }
    getData()
  }, [])
   useEffect(() => {
      if (done) {
        if (tempPosts.length > 0) {
          let newList = []
       Promise.all(tempPosts.map(async(e) => {
         const docSnap = await getDoc(doc(db, 'groups', e))
         newList.push({id: docSnap.id, ...docSnap.data()})
         //console.log(newList)
        })).then(() => 
        setCompleteGroups(newList))
      }
      }
    }, [tempPosts, done])
   // console.log(tempPosts.length)
   //console.log(completeGroups.length)
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
    useEffect(() => {
    let unsub;
    const getProfileDetails = async() => {
      unsub = onSnapshot(doc(db, 'profiles', user.uid), (doc) => {
        if (doc.exists()) {
          setGroupsJoined(doc.data().groupsJoined)

        }
      })
      setShouldgetData(false)
  }
  
  getProfileDetails();
  return unsub;
  }, [onSnapshot])
    /* useEffect(() => {
      if (completeGroups.length == 0) {
      //console.log('fir')
      setLoading(true)
      setCompleteGroups([])


    const getData = () => {
      const unsub2 = onSnapshot(doc(db, 'profiles', user.uid), (doc) => {
        setAdminList(doc.data().adminGroups)
        //console.log(adminList)
      
      })
      return unsub2;
    }
    getData()
  }
    }, [onSnapshot, completeGroups]) */
    useEffect(() => {
      if (adminList.length > 0) {
        adminList.map((item) => {
          //console.log(item)
      const fetchCards = async () => {
        const docSnap = await getDoc(doc(db, 'groups', item))
        //console.log(docSnap)
        if (docSnap.exists()) {
          //console.log(docSnap.id)
        setCompleteGroups(prevState => [{id: docSnap.id, ...docSnap.data()}, ...prevState])
        }
      } 
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
      
      })
      }
    }, [adminList])
    useEffect(() => {
        if (specificSearch.length > 0 && groupSearches.length > 0) {
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
    const handleSearchCallback = (dataToSend) => {
    setSearching(dataToSend)
    setFiltered([]);
    setSpecificSearch('')
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
        })).then(() => cliqueRecommend(item.id)).catch((e) => console.log(e))
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
        <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => {setFilteredGroup([item]); addToRecentSearches(item); setSearching(false)}}>
            <FastImage source={item.banner ? {uri: item.banner} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: theme.color}]}>{item.name}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center', marginLeft: 'auto'}} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
        </TouchableOpacity>
    )
  }
  const renderCliqueSearches = ({item}) => {
    //console.log(item)
    return (
        <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => {setFilteredGroup([item]); setSearching(false)}}>
            <FastImage source={item.banner ? {uri: item.banner} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: theme.color}]}>{item.name}</Text>
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
      //console.log(item)
      return (
        <>
    <View style={[styles.posting, {borderColor: theme.color}]}>
      <TouchableOpacity style={{alignItems: 'center'}} activeOpacity={1} onPress={item.groupSecurity !== 'private' || groupsJoined.includes(item.id) ? () => navigation.navigate('GroupHome', {name: item.id, newPost: false, postId: null}) : item.groupSecurity == 'private' ? () =>  Alert.alert('Private Cliq', 'Must join Cliq in order to view') : null}>
        <FastImage source={item.banner ? {uri: item.banner} : require('../assets/defaultpfp.jpg')} style={{height: 190, width: '100%', marginBottom: 7.5}}/>
      </TouchableOpacity>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', marginLeft: '1%'}}>
          <Text style={[styles.nameText, {width: '90%', color: theme.color}]} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity onPress={() => itemAllToTransparent(item)}>
            <Entypo name="dots-three-vertical" style={{alignSelf: 'center'}} size={17.5} color={theme.color}/>
          </TouchableOpacity>
          
        </View>
      {item.transparent ? 
        <View style={styles.overlay}>
          <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}} onPress={() => {itemAllNotToTransparent(item); setChosenClique(null)}}>
            <Text style={[styles.closeText]}>Close</Text>
            <MaterialCommunityIcons name='close' size={30} color={'#fafafa'}/>
          </TouchableOpacity>
          <View style={{alignItems: 'center'}}>
             {item.groupSecurity == 'private' && requests.filter(e => e.id === item.id).length > 0 ?
             <View style={[styles.joinContainer, {padding: 5, backgroundColor: theme.backgroundColor}]}>
              <RequestedIcon color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
              </View>
               :
            user ? !groupsJoined.includes(item.id) ? <TouchableOpacity style={[styles.joinContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => {updateGroup(item)}}>
                  <Text style={[styles.joinText, {color: theme.color}]}>Join</Text>
                  <MaterialCommunityIcons name='account-plus' size={20} style={{alignSelf: 'center', padding: 5, paddingRight: 15}} color={theme.color}/>
              </TouchableOpacity> :  
              <TouchableOpacity style={[styles.joinContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => removeGroup(item)}>
                  <Text style={[styles.joinText, {color: theme.color}]}>Joined</Text>
                  <MaterialCommunityIcons name='check' size={20} style={{alignSelf: 'center', padding: 5, paddingRight: 15}} color={theme.color}/>
              </TouchableOpacity> : null}
              <TouchableOpacity style={[styles.joinContainer, {backgroundColor: theme.backgroundColor}]} onPress={item.groupSecurity == 'private' ? () =>  Alert.alert('Private Cliq', 'Must join Cliq in order to share') : () => navigation.navigate('Chat', {sending: true, message: true, payloadGroup: {name: item.name, pfp: item.banner, id: item.id, group: item.id}})}>
                <Text style={[styles.joinText, {color: theme.color}]}>Share Cliq</Text>
              </TouchableOpacity>
             
            </View>
        </View>
      : null
      }
      </View>
    </>
    )
    }
    //console.log(item)
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
          <View style={{backgroundColor: theme.backgroundColor, marginLeft: '5%'}}>
                  <ThemeHeader backButton={true} myCliques={true} text={"My Cliqs"} searching={handleSearchCallback}/>
          </View>
          {searching ? 
          <View style={styles.homeContainer}>
            <Divider style={{marginTop: '-2.5%', marginLeft: '-10%', width: '115%', color: theme.color, borderWidth: 0.5}}/>
            <TouchableOpacity activeOpacity={1} style={{width: '100%', marginTop: '2.5%', zIndex: 0}}>
              <View style={{flexDirection: 'row'}}>
                  <SearchInput autoFocus={true} value={specificSearch} icon={'magnify'} placeholder={'Search'} onFocus={() => {setRecentSearches(true); setSearching(true)}} iconStyle={styles.homeIcon}
                  containerStyle={{borderWidth: 1, borderColor: theme.color, width: '85%'}} onSubmitEditing={() => {setRecentSearches(false)}} text={searching ? true : false} onChangeText={setSpecificSearch} 
                  onPress={() => {setRecentSearches(true); setSearching(true)}}/>
                  <MaterialCommunityIcons name='close' size={40} color={theme.color} style={styles.closeHomeIcon} onPress={() => {setRecentSearches(false); setSearching(false); Keyboard.dismiss(); setFiltered([]); setSpecificSearch('')}}/>
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
            //onScroll={handleScroll}
            ListFooterComponent={<View style={{paddingBottom: 10}}/> }
          /> : !searching && !loading ? <View style={{justifyContent: 'center', alignItems: 'center', flex: 1, marginBottom: '30%'}}>
              <Text style={[styles.noGroupsText, {color: theme.color}]}>No More Cliqs</Text>
              <MainButton text={"Make a Cliq"} onPress={() => navigation.navigate('GroupName')}/>
            </View> : null}
          </View>
          {/* {loading ? <View style={{height: 25, marginTop: '-10%', flex: 1, justifyContent: 'flex-end'}}>
            <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
          </View>  : null} */}
      </View>
  )
}

export default MyGroups

const styles = StyleSheet.create({
    container: {flex: 1},
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
  posting: {
    //height: 200,
    width: '90%',
    marginLeft: '5%',
    borderWidth: 1,
    borderRadius: 5,
      marginBottom: 20,
      overflow: 'hidden'
      
  },
  nameText: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      textAlign: 'left',
      paddingBottom: 5
    },
     overlay: {
      position: 'absolute',
      width: '107%', // Adjust the overlay width as needed
      height: '105%', // Adjust the overlay height as needed
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    closeText: {
      fontSize: 12.29,
      padding: 2.5,
      color: "#fafafa",
      fontFamily: 'Montserrat_700Bold',
    },
    joinContainer: {
      marginTop: 10,
      borderRadius: 8,
      width: '80%',
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center'
    },
    joinText: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      padding: 7.5
    },
    homeContainer: {marginLeft: '5%', marginBottom: '5%'},
    homeIcon: {position: 'absolute', left: 280, top: 8.5},
  closeHomeIcon: {marginLeft: '1%'},
  noGroupsText: {
    fontSize: 24,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    paddingBottom: 30
  },
})