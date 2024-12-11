import { StyleSheet, Text, View, TouchableOpacity, TextInput, Keyboard, FlatList} from 'react-native'
import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Divider } from 'react-native-paper'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import RecentSearches from './RecentSearches';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { onSnapshot } from 'firebase/firestore';
import { fetchRecentSearches, fetchUserSearchesLarge, fetchUserSearchesSmall} from '../firebaseUtils';
const SearchComponent = ({user, home, closeSearching}) => {
  const navigation = useNavigation();
  const textInputRef = useRef(null);
  const [recentSearches, setRecentSearches] = useState(false);
  const [tempSearches, setTempSearches] = useState([]);
  const [searches, setSearches] = useState([]);
  const [actualSearches, setActualSearches] = useState([]);
  const [specificSearch, setSpecificSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [moreResults, setMoreResults] = useState(false);
  const [moreResultButton, setMoreResultButton] = useState(false);
  useEffect(() => {
    let unsubscribe;
    if (user?.uid) {
      unsubscribe = fetchRecentSearches(user, 'user', setSearches)
    }
    return () => {
      if (unsubscribe) {
        return unsubscribe;
      }
    };
  }, [onSnapshot])
  useEffect(() => {
    if (specificSearch.length > 0) {
      setMoreResultButton(false)
      setMoreResults(false)
      setRecentSearches(true)
      const tempList = Array.from(new Set(actualSearches.map(JSON.stringify))).map(JSON.parse).filter(item => {
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
    }, [actualSearches])
  useMemo(() => {
    if (specificSearch.length > 0) {
      setSearches([])
      const getData = async() => {
        if (specificSearch.length < 4) {
          const {userSearches} = await fetchUserSearchesSmall(specificSearch);
          setActualSearches(userSearches)
        }
        else {
          const {userSearches} = await fetchUserSearchesLarge(specificSearch);
          setActualSearches(userSearches)
        }
      }
      getData();
    }
  }, [specificSearch])
  useEffect(() => {
    if (searches.length > 0) {
      searches.map(async(item) => {
        const docSnap = await getDoc(doc(db, 'profiles', item.id))
        if (docSnap.exists()) {
            setTempSearches(prevState => [...prevState, {id: docSnap.id, searchId: item.searchId, ...docSnap.data()}])
        }
      })
    }
  }, [searches])
  function searchFunction(item) {
    if (item.id != user.uid) {
        {navigation.navigate('ViewingProfile', {name: item.id, viewing: true}); addToRecentSearches(item)}
    }
    else {
        navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, 
        previewImage: null, previewMade: false, applying: false}})
    }
    
  }
  function recentSearchFunction(item) {
    if (item.id != user.uid) {
        {navigation.navigate('ViewingProfile', {name: item.id, viewing: true});}
    }
    else {
        navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, 
        previewMade: false, applying: false}})
    }
  }
  const handleClose = () => {
    closeSearching();
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
    setTempSearches((prevSearches) => 
        prevSearches.filter((e) => e.searchId !== item.searchId)
    );
    await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', item.searchId))       
  }
  const renderEvents = ({item, index}) => {
    return (
      <View key={index}>
        <TouchableOpacity style={styles.categoriesContainer} onPress={() => searchFunction(item)}>
            <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={styles.pfp}/>
            <Text numberOfLines={1} style={styles.categories}>{item.firstName} {item.lastName} | @{item.username ? item.username : item.userName}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={styles.arrow} color={"#9EDAFF"}/>
        </TouchableOpacity>
      </View>
    )
  }
  const renderSearches = ({item}) => {
    return (
      <TouchableOpacity style={styles.categoriesContainer} onPress={() => recentSearchFunction(item)}>
        <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={styles.pfp}/>
            <Text numberOfLines={1} style={styles.categories}>{item.firstName} {item.lastName} | @{item.username ? item.username : item.userName}</Text>
            <TouchableOpacity onPress={() => removeSearch(item)} style={styles.arrow}>
                <MaterialCommunityIcons name='close' size={30} color={"#fafafa"} />
            </TouchableOpacity>
        </TouchableOpacity>
    )
  }
  return (
    <View style={styles.homeContainer}>
        <Divider style={styles.divider}/>
        <TouchableOpacity activeOpacity={1} style={styles.searchContainer}>
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={styles.searchInputContainer} onPress={ () => {setRecentSearches(true); textInputRef.current.focus()}} activeOpacity={1}>
                <MaterialCommunityIcons name={'magnify'} size={20} style={styles.magnifyIcon} color={"#fafafa"}/>
                <TextInput ref={textInputRef} autoFocus={true} placeholder={'Search'} onFocus={() => setRecentSearches(true)}
                onSubmitEditing={() => setRecentSearches(false)} placeholderTextColor="#676767" style={styles.textInput} 
                value={specificSearch} onChangeText={setSpecificSearch}/> 
                <MaterialCommunityIcons name='eraser' color={"#fafafa"} size={20} 
                style={styles.homeIcon} onPress={() => {setRecentSearches(true); setSpecificSearch('')}} />
            </TouchableOpacity>
            <MaterialCommunityIcons name='close' size={40} style={{marginLeft: '1%'}} color={"#fafafa"} 
            onPress={() => {setRecentSearches(false); Keyboard.dismiss(); handleClose(); setFiltered([]); setSpecificSearch('')}}/>
        </View>
        <View>
            {filtered.length == 0 && specificSearch.length > 0 ?
            <View>
                <Text style={styles.noSearchText}>No Search Results</Text>
            </View> :  
            specificSearch.length > 0 ?
            <>
                <FlatList 
                    data={!moreResults ? filtered.slice(0, 3) : filtered.slice(0, 10)}
                    renderItem={renderEvents}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{flexGrow: 1}}
                    scrollEnabled={moreResultButton ? false: true}
                /> 
                {
                recentSearches ?
                <RecentSearches data={tempSearches.filter((obj, index, self) => index === self.findIndex((o) => o.userName === obj.userName)).reverse()} 
                theme={false} group={false} home={true} friend={false} extraStyling={{width: '95%'}}
                renderSearches={renderSearches}/> : null
                }
            </>
            : <></>}
        </View>
                
                
            </TouchableOpacity>
              
          </View>
  )
}

export default SearchComponent

const styles = StyleSheet.create({
    homeContainer: {
        marginLeft: '5%', 
        marginBottom: '5%'
    },
    divider: {
        marginTop: '-2.5%', 
        marginLeft: '-10%', 
        width: '115%',
        color: "#979797", 
        borderWidth: 0.5
    },
    searchContainer: {
        width: '100%', 
        marginTop: '2.5%', 
        zIndex: 0
    },
    searchInputContainer: {
        borderRadius: 5,
        height: 40,
        borderWidth: 1,
        borderColor: "#fafafa",
        flexDirection: 'row',
        width: '85%',
        backgroundColor: "#121212"
    },
    magnifyIcon: {
        alignSelf: "center", 
        paddingLeft: 5
    },
    textInput: {
        fontSize: 15.36,
        fontWeight: '600',
        fontFamily: 'Montserrat_500Medium',
        color: "#fafafa",
        paddingLeft: 10
    },
    homeIcon: {
        position: 'absolute', 
        left: 315, 
        top: 8.5
    },
    noSearchText: {
        fontFamily: 'Montserrat_500Medium', 
        color: "#fafafa", 
        fontSize: 15.36, 
        paddingHorizontal: 10, 
        textAlign: 'center', 
        marginRight: '5%', 
        marginTop: '5%'
    },
    categoriesContainer: {
        borderRadius: 5,
        flexDirection: 'row',
        backgroundColor: "#121212",
        marginTop: 5,
        padding: 5,
        alignItems: 'center',
        width: '95%',
    },
    pfp: {
        height: 40, width: 40, borderRadius: 8
    },
    categories: {
        fontSize: 15.36,
        padding: 10,
        width: '80%',
        fontFamily: 'Montserrat_500Medium',
        color: "#fafafa"
    },
    arrow: {
        alignSelf: 'center', 
        marginLeft: 'auto'
    }
})