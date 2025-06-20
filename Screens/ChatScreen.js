import { StyleSheet, Text, TouchableOpacity, View, Keyboard, FlatList, ActivityIndicator, KeyboardAvoidingView} from 'react-native'
import React, {useState, useEffect, useMemo, useContext} from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../Hooks/useAuth';
import { onSnapshot, doc, getDoc, query, where, collection, getDocs, documentId} from 'firebase/firestore';
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
import generateId from '../lib/generateId';
import ShareApp from '../Components/Chat/ShareApp';
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
    const [filteredGroup, setFilteredGroup] = useState([]);
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

    useMemo(() => {
      if (profile && completeMessages.length == 0) {
        const followingSet = new Set(profile.following);
        const mutuals = profile.followers.filter(id => followingSet.has(id));
        const queryRef = collection(db, 'friends')
        mutuals.map(async(item) => {
          try { 
            const firstName = (await getDoc(doc(db, 'profiles', item))).data().firstName
            const lastName = (await getDoc(doc(db, 'profiles', item))).data().lastName
            const q = query(queryRef, where(documentId(), '==', generateId(item, user.uid)))
            const querySnapshot = await getDocs(q);
            console.log(querySnapshot.docs.length)
            querySnapshot.forEach((doc) => {
              // doc.data() is never undefined for query doc snapshots
              setCompleteMessages([...completeMessages, {id: doc.id, firstName: firstName, lastName: lastName, ...doc.data()}])
            });
          } catch (e) {
            console.error(e)
          }
        })
        setTimeout(() => {
          setLoading(false)
        }, 250);
      }
    }, [profile, completeMessages])

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
          <ShareApp profile={profile}/>
        </View>
        <Divider />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        {message ? <>
        {loading && completeMessages.length == 0 ? <View style={styles.loadingContainer}>
            <ActivityIndicator color={"#9EDAFF"}/> 
          </View> :
        <>
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
          {!searching ? <View style={{flex: 1}}>
              {filteredGroup.length > 0 ? 
              <FlatList 
                  data={filteredGroup}
                  renderItem={({item}) => <PreviewChat item={item} filteredGroup={filteredGroup} group={false} 
                  messageNotifications={messageNotifications}/>}
                  keyExtractor={(item) => item.id.toString()}
                  style={{height: '50%'}}
                  contentContainerStyle={{zIndex: 0}}
              /> : loading && completeMessages.length == 0 ? <View>
              <ActivityIndicator color={"#9EDAFF"}/> 
          </View> :
              completeMessages.length > 0 ? 
              <FlatList 
                  data={completeMessages}
                  renderItem={({item}) => <PreviewChat item={item} filteredGroup={filteredGroup} group={false} 
                  messageNotifications={messageNotifications}/>}
                  keyExtractor={(item) => item.id.toString()}
                  style={{height: '100%'}}
                  ListFooterComponent={<View style={{paddingBottom: 75}}/>}
                  onScroll={handleScroll}
              /> : <></>}

              
              
          </View> : null}
        </>} 
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
    color: "#fafafa",
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
  noTextContainer: {
    justifyContent: 'center', 
    flex: 1, 
    marginBottom: '40%', 
    alignItems: 'center'
  },
  sadEmoji: {
    alignSelf: 'center', 
    marginTop: '10%'
  },
  loadingContainer: {
    alignItems: 'center', 
    flex: 1, 
    justifyContent: 'center'
  }
})