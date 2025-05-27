import { StyleSheet, Text, TouchableOpacity, View, Keyboard, FlatList, ActivityIndicator, KeyboardAvoidingView, Share} from 'react-native'
import React, {useState, useEffect, useMemo, useContext} from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../Hooks/useAuth';
import { onSnapshot, doc, getDoc} from 'firebase/firestore';
import SearchInput from '../Components/SearchInput';
import { Provider } from 'react-native-paper';
import {Divider} from 'react-native-paper'
import FastImage from 'react-native-fast-image';
import themeContext from '../lib/themeContext';
import _ from 'lodash';
import { db } from '../firebase'
import ProfileContext from '../lib/profileContext';
import PreviewChat from '../Components/Chat/PreviewChat';
import { fetchFriendsForMessages, fetchFriendsForActiveUsers, fetchMoreFriendsForMessages, deleteCheckedNotifications, fetchMessageNotifications} 
from '../firebaseUtils';

const ChatScreen = ({route}) => {
    const profile = useContext(ProfileContext);
    const navigation = useNavigation();
    const {message} = route.params; 
    const [searches, setSearches] = useState([]);
    const [friends, setFriends] = useState([]);
    const modeTheme = useContext(themeContext)
    const [specificSearch, setSpecificSearch] = useState('');
    const [filtered, setFiltered] = useState([]);
    const [completeMessages, setCompleteMessages] = useState([]);
    const [messageNotifications, setMessageNotifications] = useState([]);
    const [completeFriends, setCompleteFriends] = useState([]);
    const [ogActiveFriends, setOgActiveFriends] = useState([]);
    const [activeFriends, setActiveFriends] = useState([]);
    const [activeFriendsInfo, setActiveFriendsInfo] = useState([]);
    const [filteredGroup, setFilteredGroup] = useState([]);
    const [friendsInfo, setFriendsInfo] = useState([]);
    const [lastMessages, setLastMessages] = useState([]);
    const [searching, setSearching] = useState(false)
    const [moreResults, setMoreResults] = useState(false);
  const [moreResultButton, setMoreResultButton] = useState(false);
    const [lastVisible, setLastVisible] = useState();
    const [loading, setLoading] = useState(true);
    const {user} = useAuth()
    
    useMemo(() => {
      let unsubscribe;
        if (user?.uid) {
          unsubscribe = fetchMessageNotifications(user.uid, setMessageNotifications)
        }
        return () => {
          if (unsubscribe) {
            return unsubscribe;
          }
        };
    }, [onSnapshot])
  useMemo(()=> {
    let unsubscribe;
    if (user?.uid && profile) {
      // Call the utility function and pass state setters as callbacks
      unsubscribe = fetchFriendsForActiveUsers(user.uid, setFriends, profile, setLastVisible);
    }
    // Clean up the listener when the component unmounts
    return () => {
      if (unsubscribe) {
        return unsubscribe;
      }
    };
  }, [user, profile]);
  useMemo(()=> {
    setFriends([])
    let unsubscribe;
    if (user?.uid) {
      // Call the utility function and pass state setters as callbacks
      unsubscribe = fetchFriendsForMessages(user.uid, setFriends, profile, setLastVisible);
    }
    // Clean up the listener when the component unmounts
    return () => {
      if (unsubscribe) {
        return unsubscribe;
      }
    };
  }, [profile, user]);
    
    useMemo(() => {
      if (friends.length > 0) {
        Promise.all(friends.map(async(item) => await getDoc(doc(db, 'profiles', item.id))))
      .then(snapshots => {
        setFriendsInfo(snapshots.map(snapshot => ({id: snapshot.id, ...snapshot.data(), checked: false})))
      })
      .catch(error => {
        // Handle errors
      });
      }
    }, [friends])
    useMemo(() => {
      if (ogActiveFriends.length > 0) {
        Promise.all(ogActiveFriends.map(async(item) => await getDoc(doc(db, 'profiles', item.id))))
      .then(snapshots => {

        setActiveFriendsInfo(snapshots.map(snapshot => ({id: snapshot.id, ...snapshot.data(), checked: false})))
      })
      .catch(error => {
        // Handle errors
      });
      }
    }, [ogActiveFriends])
    //console.log(friendsInfo)
    useMemo(() => {
      
      Promise.all(friends.map(async(item) => await getDoc(doc(db, 'friends', item.friendId))))
      .then(snapshots => {
        setCompleteFriends(snapshots.map(snapshot => ({id: snapshot.id, ...snapshot.data()})))
      })
      .catch(error => {
        // Handle errors
      });
    }, [friends])
    //console.log(friends.length)
    useMemo(() => {
       const newArray = activeFriendsInfo.map((item) => {
          if (item.active == true) {
            return item;
          }
          else {
            return null;
          }
        })
        const filtered = newArray.filter((item) => item !== null);
        setActiveFriends(filtered);
    }, [activeFriendsInfo])

    function fetchMoreData() {
      if (lastVisible != undefined) {
        let unsubscribe;
        // Call the utility function and pass state setters as callbacks
        unsubscribe = fetchMoreFriendsForMessages(user.uid, friends, lastVisible, setFriends, profile, setLastVisible)
        // Clean up the listener when the component unmounts
        return () => {
          if (unsubscribe) {
            return unsubscribe;
          }
        }
      }
    }
    console.log(friends)
    useMemo(()=> {
      if (completeFriends.length > 0){
        Promise.all(completeFriends.map(async(item) => await getDoc(doc(db, 'friends', item.id))))
      .then(snapshots => {
        setLastMessages(snapshots.map(snapshot => ({id: snapshot.id, ...snapshot.data()})))
      })
      .catch(error => {
        // Handle errors
      });
  }

    }, [completeFriends]);
    useEffect(() => {
      // Find the corresponding object in array2 and replace its value
      const updatedArray2 = friendsInfo.map(obj2 => {
        if (lastMessages.find(obj1 => obj1.id.includes(obj2.id))) {
          return { ...obj2, messageActive:lastMessages.find(obj1 => obj1.id.includes(obj2.id)).active, messageId: lastMessages.find(obj1 => obj1.id.includes(obj2.id)).messageId, lastMessage: lastMessages.find(obj1 => obj1.id.includes(obj2.id)).lastMessage,
          lastMessageTimestamp: lastMessages.find(obj1 => obj1.id.includes(obj2.id)).lastMessageTimestamp};
        }
        return obj2;
      });
      // Update the state variable array2 with the modified array
      new Promise(resolve => {
        setCompleteMessages(updatedArray2
        .filter((e) => e.lastMessageTimestamp != undefined)
        .slice()
              .sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp));
          resolve(); // Resolve the Promise after setCompleteMessages is done
      }).finally(() => setLoading(false)); 
    }, [lastMessages])
    const url = 'https://apps.apple.com/us/app/nucliq/id6451544113'
    const shareApp = async() => {
      try {
        const result = await Share.share({
          message: (`Join me on NuCliq! Use my referral code when you sign up:\n${profile.referralCode}\n${url}`)
        });
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            console.log('shared with activity type of: ', result.activityType)
          }
          else {
            console.log('shared')
          }
        } else if (result.action === Share.dismissedAction) {
          console.log('dismissed')
        }
      }
      catch (error) {
        console.log(error)
      }
    }
    useEffect(() => {
        if (specificSearch.length > 0) {
      setSearching(true)
      setMoreResultButton(false)
      setMoreResults(false)
      const tempList = Array.from(new Set(searches.map(JSON.stringify))).map(JSON.parse).filter(item => {
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
    }, [searches])
    useMemo(() => {
    if (specificSearch.length > 0) {
      setSearches([])
      const getData = async() => {
        if (specificSearch.length < 4) {
          const {userSearches} = await fetchUserSearchesSmall('smallKeywords', specificSearch);
          setActualSearches(userSearches)
        }
        else {
          const {userSearches} = await fetchUserSearchesLarge('largeKeywords', specificSearch);
          setActualSearches(userSearches)
        }
      }
      getData();
    } 
  }, [specificSearch])
    useEffect(() => {
      if (route.params?.notification == true) {
        deleteCheckedNotifications(user.uid, false, null)
      }
    }, [route.params?.notification])

const handleScroll = _.debounce((event) => {
    // Your logic for fetching more data
    setLoading(true)
    fetchMoreData()
    setTimeout(() => {
      setLoading(false)
    }, 1000);
  }, 500);


const renderEvents = ({item, index}) => {
    //console.log(item)
    return (
      <View key={index}>
        <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}]} onPress={() => {setFilteredGroup([item]); setSearching(false)}}>
            <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.firstName} {item.lastName} | @{item.username != undefined ? item.username : item.userName}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center', marginLeft: 'auto'}} color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
        </TouchableOpacity>
      </View>
    )
  }


  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={{alignSelf: 'center'}} hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }} onPress={() => navigation.goBack()} >
            <MaterialCommunityIcons name='chevron-left' color={"#fafafa"} size={35}/>
          </TouchableOpacity>
          <Text style={styles.headerText}>Messages</Text>
          <MaterialCommunityIcons name='share-variant-outline' size={27.5} color={"#fafafa"} onPress={shareApp}/>
        </View>
        <Divider />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        {message ? <>
        {loading && completeMessages.length == 0 ?  <View style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
            <ActivityIndicator color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"} size={"large"}/> 
          </View> : friendsInfo.filter(obj => completeMessages.some(otherObj => otherObj.id === obj.id)).length > 0 ?
        <>
        {friendsInfo.filter(obj => completeMessages.some(otherObj => otherObj.id === obj.id)).length > 0 ? 
            <View style={{margin: '5%'}}>
              <TouchableOpacity activeOpacity={1} style={{width: '100%', marginTop: '2.5%', zIndex: 0}}>
              <View style={{flexDirection: 'row'}}>
                    <SearchInput value={specificSearch} icon={'magnify'} placeholder={'Search'} onFocus={() => {setSearching(true)}} iconStyle={styles.homeIcon}
                    containerStyle={!searching ? {borderWidth: 1, borderColor: modeTheme.color, width: '100%'} : {borderWidth: 1, borderColor: modeTheme.color, width: '90%'}} text={searching ? true : false} onChangeText={setSpecificSearch} 
                    onPress={() => { setSpecificSearch(''); setSearching(true)}}/>
                    {searching ?
                    <MaterialCommunityIcons name='close' size={40} style={styles.closeHomeIcon} color={modeTheme.color} onPress={() => {setSearching(false); Keyboard.dismiss(); setFiltered([]); setSpecificSearch('')}}/> : null}
                    </View>
                    <View>
                    {searching && filtered.length == 0 && specificSearch.length > 0 ?
                    <View>
                      <Text style={{fontFamily: 'Montserrat_500Medium', color: modeTheme.color, fontSize: 15.36, paddingHorizontal: 10, textAlign: 'center', marginRight: '5%', marginTop: '5%'}}>No Search Results</Text>
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
                    {moreResults ? 
                    <TouchableOpacity style={{alignItems: 'center', marginRight: '5%'}} onPress={() => { setMoreResults(true); setMoreResultButton(false);}}>
                      <Text style={{paddingTop: 5, fontFamily: 'Montserrat_400Regular', color: modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}}>See more results</Text>
                      </TouchableOpacity> : null}
                    </View> : <></>}
                    </View>
                    
                    
                </TouchableOpacity>
                
            </View>
        : null}
          {!searching ? <View style={{flex: 1}}>
              {filteredGroup.length > 0 ? 
              <FlatList 
                  data={filteredGroup}
                  renderItem={({item}) => <PreviewChat item={item} completeFriends={completeFriends} filteredGroup={filteredGroup} group={false} 
                  messageNotifications={messageNotifications}/>}
                  keyExtractor={(item) => item.id.toString()}
                  style={{height: '50%'}}
                  contentContainerStyle={{zIndex: 0}}
              /> :
              completeMessages.length > 0 ? 
              <FlatList 
                  data={completeMessages}
                  renderItem={({item}) => <PreviewChat item={item} completeFriends={completeFriends} filteredGroup={filteredGroup} group={false} 
                  messageNotifications={messageNotifications}/>}
                  keyExtractor={(item) => item.id.toString()}
                  style={activeFriends.filter(obj => completeMessages.some(otherObj => otherObj.id === obj.id)).length > 0 ? {height: '100%'} : {height: '100%'}}
                  ListFooterComponent={<View style={{paddingBottom: 75}}/>}
                  onScroll={handleScroll}
              /> : null
              }
              {loading ? 
              <View>
            <ActivityIndicator color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
          </View> : null
              }

              
              
          </View> : null}
        </> : !loading && friendsInfo.filter(obj => completeMessages.some(otherObj => otherObj.id === obj.id)).length == 0 ? 
        <View style={{justifyContent: 'center', flex: 1, marginBottom: '40%', alignItems: 'center'}}>
          <Text style={[styles.noFriendsText, {color: modeTheme.color}]}>Sorry no Friends to Chat With</Text>
          <MaterialCommunityIcons name='emoticon-sad-outline' color={modeTheme.color} size={50} style={{alignSelf: 'center', marginTop: '10%'}}/>
        </View> : null}
        </> : null}
              
        </KeyboardAvoidingView>
    </View>
    
      
    </Provider>
  )
}

export default ChatScreen

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#121212"
    },
    profilesContainer: {
        flexDirection: 'row'
    },
    messageText: {
      fontSize: 19.20, 
      alignSelf: 'center', 
      fontFamily: 'Montserrat_600SemiBold',
      padding: 7.5,
      paddingRight: 0, 
      paddingLeft: 0,
    },
    input: {
      borderTopWidth: 0.25,
      width: '110%',
      marginLeft: '-5%',
      padding: 15,
      margin: '2.5%',
      marginTop: 0,
      
      //backgroundColor: 'red'
    },
    searchContainer: {
        height: 60,
        width: 60,
        borderRadius: 30,
        backgroundColor: '#005278',
        justifyContent: 'center',
        //flex: 1,
        alignItems: 'center',
        marginRight: '5%',
        //marginLeft: '2.5%'
    },
    online: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: 'green',
        position: 'absolute',
        //top: 2,
        bottom: 45,
        left: 45,
        zIndex: 3
    },
    messageContainer: {
        borderRadius: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#d3d3d3",
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    name: {
        fontSize: 15.36,
        paddingTop: 5,
        fontFamily: 'Montserrat_700Bold'
        //width: '95%'
    },
    message: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        paddingBottom: 5,
    },
    clock: {
        paddingTop: 5,
        fontSize: 12.29,
        fontFamily: 'Montserrat_500Medium'
        //paddingRight: 5
    },
  iconStyle: {
    position: 'absolute', left: 280, top: 8.5
  },
  checkbox: {
    borderWidth: 1.5,
    height: 25,
    width: 25,
    borderRadius: 12.5,
    marginVertical: '5.5%',
    marginHorizontal: '5%'
  },
  noFriendsText: {
    fontSize: 19.20,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    textAlign: 'center'
  },
  greenDot: {
    height: 10,
    width: 10,
    backgroundColor: "#33FF68",
    borderRadius: 5,
    position: 'absolute',
  },
  addText: {
      fontSize: 15.36,
      padding: 7.5,
      paddingLeft: 15,
      fontFamily: 'Montserrat_500Medium',
      maxWidth: '90%'
      //maxWidth: '98%'
      //paddingTop: 0
    },
    image: {height: 40, width: 40, borderRadius: 8, alignSelf: 'center', borderWidth: 1},
    addCommentSecondContainer: {
        //flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        //flex: 1,
        //marginHorizontal: '5%',
        //marginBottom: '17.5%',
        width: '100%',
    },
    addContainer: {
      flex: 1,
      alignSelf: 'center', 
      alignItems: 'flex-end',
      marginRight: '2.5%'
    },
    characterCountText: {
      fontSize: 9,
      fontFamily: 'Montserrat_500Medium',
      padding: 5,
      textAlign: 'right',
      paddingRight: 0,
      marginRight: '7.5%',
      backgroundColor: "transparent"
    },
    modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '9%',
    marginLeft: '5%',
    marginRight: '5%'
  },
  headerText: {
    fontSize: 19.20,
    flex: 1,
    textAlign: 'center',
    paddingLeft: 0,
    fontFamily: 'Montserrat_700Bold',
    alignSelf: 'center',
    padding: 10,
    marginRight: '5%',
    color: "#fafafa"
  },
    homeIcon: {position: 'absolute', left: 280, top: 8.5},
  homeContainer: {marginLeft: '5%', marginBottom: '5%'},
  closeHomeIcon: {marginLeft: '1%'},
  categoriesContainer: {
    borderRadius: 5,
    flexDirection: 'row',
    //marginRight: '5%',
    marginTop: 5,
    padding: 5,
    alignItems: 'center',
    //justifyContent: 'space-between',
    //width: '95%',
  },
  categories: {
    fontSize: 15.36,
    padding: 10,
    width: '80%',
    fontFamily: 'Montserrat_500Medium'
  },
})