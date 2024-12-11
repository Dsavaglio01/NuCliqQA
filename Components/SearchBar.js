import { StyleSheet, Text, View, TouchableOpacity, Keyboard, FlatList } from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { Divider } from 'react-native-paper'
import SearchInput from './SearchInput';
import RecentSearches from './RecentSearches';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebase';
import { updateDoc, doc, addDoc, collection, serverTimestamp, deleteDoc, query, where, getDocs} from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import FastImage from 'react-native-fast-image';
import themeContext from '../lib/themeContext';
const SearchBar = ({isSearching, recentSearchesArray, groupChannel, handleCliqueSearchFunction,
   filteredGroup, groupMembers, groupMemberFunction, theme, mentionPreview, themeNames, handleSearchFunction, cliqueSearch, cliqueSearchFunction, likes, themeSearch, searchTerm, recentSearch,
   cliqueSearches, channel, clique, groups, friend, chat, home, my, purchased, free, get, searches, usernames, post, friendsInfo, mentions, cliqueData, cliquePost, cliqueName, userCliqueSearch}) => {
    const [searching, setSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState(recentSearchesArray)
    const modeTheme = useContext(themeContext)
    const [filtered, setFiltered] = useState([]);
    const [specificSearch, setSpecificSearch] = useState('');
    const [cliqueSearchData, setCliqueSearchData] = useState([]);
    const navigation = useNavigation();
    const [moreResults, setMoreResults] = useState(false);
    const [moreResultButton, setMoreResultButton] = useState(false);
    const {user} = useAuth();
   useEffect(() => {
    if (cliqueData) {
       setCliqueSearchData(cliqueData)
    }
   }, [cliqueData])
    useEffect(() => {
        if (home) {
        if (specificSearch.length > 0) {
          searchTerm(specificSearch)
      setSearching(true)
      setMoreResultButton(false)
      setMoreResults(false)
      setRecentSearches(true)
      const temp = specificSearch.toLowerCase()

      /* const tempList = usernames.filter(item => {
        if (item.username.toLowerCase().match(temp))
          return item
      }) */
      const tempList = usernames.filter(item => {
        if (item.firstName.toLowerCase().match(temp)) {
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
        }
    else if (post || chat || friend || channel || likes && !mentions || groupMembers) {
        if (specificSearch.length > 0) {
      setSearching(true)
      const temp = specificSearch.toLowerCase()
      const tempList = friendsInfo.filter(item => {
        console.log(item)
        if (item.userName.toLowerCase().match(temp))
          return item
      })
      setFiltered(tempList.slice(0, 3))
    }
    else {
      setFiltered([])
    }
    }
    else if (likes && mentions) {
      if (specificSearch.length > 0) {
      setSearching(true)
      const temp = specificSearch.toLowerCase()
      const tempList = mentions.filter(item => {
        //console.log(item)
        if (item.userName.toLowerCase().match(temp))
          return item
      })
      setFiltered(tempList.slice(0, 3))
    }
    else {
      setFiltered([])
    }
    }
    else if (clique) {
        if (specificSearch.length > 0) {
          searchTerm(specificSearch)
      setSearching(true)
      setMoreResultButton(false)
      setMoreResults(false)
      setRecentSearches(true)
      const temp = specificSearch.toLowerCase()

      const tempList = groups.filter(item => {
        if (item.name.toLowerCase().match(temp))
          return item
      })
      if (tempList.length > 3) {
        setMoreResultButton(true)
      }
      setFiltered(tempList)
    }
    else {
      setSearching(false)
      setFiltered([])
    } 
}
else if (cliqueSearch) {
  if (specificSearch.length > 0) {
      setSearching(true)
      const temp = specificSearch.toLowerCase()

      const tempList = cliqueSearches.filter(item => {
        //console.log(item)
        if (item.name.toLowerCase().match(temp))
          return item
      })
      setFiltered(tempList.slice(0, 3))
    }
    else {
      setSearching(false)
      setFiltered([])
    } 
}
else if (userCliqueSearch) {
  if (specificSearch.length > 0) {
      setSearching(true)
      const temp = specificSearch.toLowerCase()

      const tempList = cliqueSearches.filter(item => {
        //console.log(item)
        if (item.name.toLowerCase().match(temp))
          return item
      })
      setFiltered(tempList.slice(0, 3))
    }
    else {
      setSearching(false)
      setFiltered([])
    }
}
else if (theme) {
    if (specificSearch.length > 0) {
      searchTerm(specificSearch)
      setSearching(true)
      setMoreResultButton(false)
      setMoreResults(false)
      setRecentSearches(true)
      const temp = specificSearch.toLowerCase()
      //console.log(temp)
      const tempList = themeNames.filter(item => {
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
      setSearching(false)
      setFiltered([])
    }
}
  }, [specificSearch])
    const renderEvents = ({item, index}) => {
    //console.log(item)
    return (
      <View key={index}>
        <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}]} onPress={() => searchFunction(item)}>
            <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.firstName} {item.lastName} | @{item.username != undefined ? item.username : item.userName}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center', marginLeft: 'auto'}} color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
        </TouchableOpacity>
      </View>
    )
  }
  const renderChannels = ({item, index}) => {
    //console.log(item)
    if (item.name != null) {
      return (
      <View key={index}>
        <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}]} onPress={() => searchFunction(item)}>
          {item.pfp ? <FastImage source={{uri: item.pfp}} style={{height: 40, width: 40, borderRadius: 8}}/> 
          :<FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
          }
            
            <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.name}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center', marginLeft: 'auto'}} color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
        </TouchableOpacity>
      </View>
    )
    }
    
  }
  const renderGroupMembers = ({item, index}) => {
    //console.log(item)
    return (
      <View key={index}>
        <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}]} onPress={() => groupMemberFunction(item)}>
            <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.firstName} {item.lastName} | @{item.username != undefined ? item.username : item.userName}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center', marginLeft: 'auto'}} color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
        </TouchableOpacity>
      </View>
    )
  }
  const renderSearches = ({item}) => {
    //console.log(item)
    return (
      <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}]} onPress={() => recentSearchFunction(itemt)}>
        <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.firstName} {item.lastName} | @{item.username ? item.username : item.userName}</Text>
            <TouchableOpacity onPress={() => removeSearch(item)} style={{alignSelf: 'center', marginLeft: "auto"}}>
                <MaterialCommunityIcons name='close' size={30} color={modeTheme.color} />
            </TouchableOpacity>
        </TouchableOpacity>
    )
  }
  const renderRecentThemes = ({item}) => {
    return (
      <TouchableOpacity style={[[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}], {width: '100%'}]} onPress={() => recentSearchFunction(item)}>
        <FastImage source={{uri: item.images[0]}} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.name}</Text>
            <TouchableOpacity onPress={() => removeSearch(item)} style={{alignSelf: 'center', marginLeft: "auto"}}>
                <MaterialCommunityIcons name='close' size={30} color={modeTheme.color}  />
            </TouchableOpacity>
        </TouchableOpacity>
    )
  }
  const renderCliques = ({item}) => {
    //console.log(item)
    return (
      <TouchableOpacity style={[[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}], {width: '100%'}]} onPress={() => searchFunction(item)}>
        <FastImage source={item.banner ? {uri: item.banner} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.name}</Text>
            {<TouchableOpacity onPress={() => removeSearch(item)} style={{alignSelf: 'center', marginLeft: "auto"}}>
                <MaterialCommunityIcons name='close' size={30} color={modeTheme.color} />
            </TouchableOpacity>}
            
        </TouchableOpacity>
    )
  }
  const renderUserCliqueSearches = ({item}) => {
    console.log(item)
    return (
      <TouchableOpacity style={[[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}], {width: '100%'}]} onPress={() => searchFunction(item)}>
        <FastImage source={item.banner ? {uri: item.banner} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.name}</Text>
            <TouchableOpacity onPress={() => removeSearch(item)} style={{alignSelf: 'center', marginLeft: "auto", marginRight: '4%'}}>
                <MaterialCommunityIcons name='close' size={30} color={modeTheme.color} />
            </TouchableOpacity>
        </TouchableOpacity>
    )
  }
  
  const renderCliqueEvents = ({item, index}) => {
    //console.log(item)
    return (
        <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}]} onPress={() => {filteredGroup([item]); addToRecentSearches(item); isSearching(false); setRecentSearches(false)}}>
            <FastImage source={item.banner ? {uri: item.banner} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.name}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center', marginLeft: 'auto'}} color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
        </TouchableOpacity>
    )
  }
  const renderCliqueSearches = ({item}) => {
    //console.log(item)
    return (
        <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}]} onPress={clique ? () => {filteredGroup([item]); isSearching(false)} 
        : () => {navigation.navigate('GroupHome', {name: item.id, newPost: false, postId: null}); isSearching(false)}}>
            <FastImage source={item.banner ? {uri: item.banner} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.name}</Text>
            <TouchableOpacity onPress={() => removeSearch(item)} style={{alignSelf: 'center', marginLeft: "auto"}}>
                <MaterialCommunityIcons name='close' size={30} color={modeTheme.color}  />
            </TouchableOpacity>
        </TouchableOpacity>
    )
  }
  const renderThemes = ({item}) => {
    //console.log(item)
    return (
        <TouchableOpacity style={[[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}], {width: '100%'}]} onPress={() => {filteredGroup([item]); isSearching(false); addToRecentSearches(item)}}>
            <FastImage source={{uri: item.images[0]}} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.name}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center', marginLeft: 'auto'}} color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
        </TouchableOpacity>
    )
  }
  function recentSearchFunction(item) {
    if (home) {
        {navigation.navigate('ViewingProfile', {name: item.id, viewing: true}); isSearching(false)}
     }
     else if (theme) {
      filteredGroup([item])
      isSearching(false)
        setSearching(false)
     }
  }
  function searchFunction(item) {
    //console.log(item)
     if (home) {
        {navigation.navigate('ViewingProfile', {name: item.id, viewing: true}); isSearching(false); addToRecentSearches(item)}
     }
     else if (friend) {
        {navigation.navigate('ViewingProfile', {name: item.id, viewing: true}); isSearching(false)}
     }
     else if (channel || userCliqueSearch || chat || likes || clique || groupChannel) {
        filteredGroup([{checked: false, ...item}])
        isSearching(false)
        setSearching(false)
     }
     else if (cliqueSearch) {
      handleCliqueSearchFunction(item)
     }
    
  }
  async function removeSearch(item) {
    if (home) {
        const q = query(collection(db, "profiles", user.uid, 'recentSearches'), where("user", "==", true));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async(document) => {
          if (document.data().username == item.username) {
            await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', document.id))
            recentSearch(item.id)
          }
          
        })
      }
    else if (clique || theme) {
      await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', item.id))
      recentSearch(item.id)
    }

    //
    //console.log(item.id)
  }
  function removeObject(item) {
    const indexToRemove = cliqueSearchData.findIndex(e => e.cliqueId === item.cliqueId);
    //console.log(indexToRemove)
    //console.log(item)
    // Check if the object was found
    if (indexToRemove !== -1) {
      // Create a new array without the object using filtering
      const newArray = cliqueSearchData.filter(e => e.cliqueId !== item.cliqueId);

      // Update the state with the new array
      setCliqueSearchData(newArray);
    }
  }
  //console.log(searches)
  function addToRecentSearches(item){
    var element = item
    if (home) {
        if (searches.filter(e => e.id == item.id).length > 0) {
      
      searches.map(async(e) => {
        if (e.id == e.id) {
          //setTempId(element.id)
          await updateDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id), {
            group: false,
            event: false,
            element,
            user: true,
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
        friend: false,
        theme: false,
        timestamp: serverTimestamp()
      })
    }
    } 
    if (chat) {
        if (searches.filter(e => e.element.userName == item.userName).length > 0) {
      //console.log('bruh')
      searches.map(async(e) => {
        if (e.element.userName == e.element.userName) {
          //setTempId(element.id)
          await updateDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id), {
            group: false,
            element,
            user: false,
            theme: false,
            friend: true,
            timestamp: serverTimestamp()
          })
        }
      })
    } 
    else {
        addDoc(collection(db, 'profiles', user.uid, 'recentSearches'), {
        group: false,
        element,
        user: false,
        friend: true,
        theme: false,
        timestamp: serverTimestamp()
      })
    }
    }
    else if (theme && get) {
      if (searches.filter(e => e.id == item.id).length > 0) {
      //console.log('bruh')
      searches.map(async(e) => {
        if (e.id == e.id) {
          //setTempId(element.id)
          await updateDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id), {
            group: false,
            event: false,
            element,
            user: false,
            getTheme: true,
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
        user: false,
        friend: false,
        getTheme: true,
        timestamp: serverTimestamp()
      })
    }
    }
    else if (theme && free) {
      if (searches.filter(e => e.id == item.id).length > 0) {
      //console.log('bruh')
      searches.map(async(e) => {
        if (e.id == e.id) {
          //setTempId(element.id)
          await updateDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id), {
            group: false,
            event: false,
            element,
            user: false,
            freeTheme: true,
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
        user: false,
        friend: false,
        freeTheme: true,
        timestamp: serverTimestamp()
      })
    }
    }
    else if (theme && purchased) {
      if (searches.filter(e => e.id == item.id).length > 0) {
      //console.log('bruh')
      searches.map(async(e) => {
        if (e.id == e.id) {
          //setTempId(element.id)
          await updateDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id), {
            group: false,
            event: false,
            element,
            user: false,
            purchasedTheme: true,
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
        user: false,
        friend: false,
        purchasedTheme: true,
        timestamp: serverTimestamp()
      })
    }
    }
    else if (theme && my) {
      if (searches.filter(e => e.id == item.id).length > 0) {
      //console.log('bruh')
      searches.map(async(e) => {
        if (e.id == e.id) {
          //setTempId(element.id)
          await updateDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id), {
            group: false,
            event: false,
            element,
            user: false,
            myTheme: true,
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
        user: false,
       
        friend: false,
        myTheme: true,
        timestamp: serverTimestamp()
      })
    }
    }
    else if (clique) {
      //console.log(item)
      if (searches.filter(e => e.element.id == item.id).length > 0) {
      //console.log('bruh')
      searches.map(async(e) => {
        if (e.element.id == e.element.id) {
          //setTempId(element.id)
          await updateDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id), {
            group: true,
            element,
            user: false,
           
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
       
        friend: false,
        theme: false,
        timestamp: serverTimestamp()
      })
    }
    }
    else {
        if (searches.filter(e => e.username == item.username).length > 0) {
      //console.log('bruh')
      searches.map(async(e) => {
        if (e.username == e.username) {
          //setTempId(element.id)
          await updateDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id), {
            group: false,
            event: false,
            element,
            user: false,
           
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
       
        friend: false,
        theme: false,
        timestamp: serverTimestamp()
      })
    }
    }
    
  }

  return (
    <>
    <View style={home || clique  ? styles.homeContainer : post ? styles.postContainer : styles.chatContainer}>
            {home || clique ? <Divider style={{marginTop: '-2.5%', marginLeft: '-10%', width: '115%', color: "#000", borderWidth: 0.5}}/> : null}
            <TouchableOpacity activeOpacity={1} style={likes && searching ? {width: '100%', marginTop: '-2.5%'} : 
              home || clique  ? {width: '100%', marginTop: '2.5%', zIndex: 0} : friend || likes  && !searching ? {width: '110%', marginTop: '-2.5%', zIndex: 0} : channel && !searching ? {width: '116%', marginTop: '-2.5%', zIndex: 0} : 
            channel && searching ? {width: '105%', marginTop: '-2.5%', zIndex: 0} : userCliqueSearch && !searching ? {width: '110%', marginTop: '-2.5%'} : {width: '100%', marginTop: '-2.5%', zIndex: 0}}>
              <View style={{flexDirection: 'row'}}>
                  <SearchInput autoFocus={!chat && !groupChannel && !likes && !channel && !userCliqueSearch && !moreResults ? true : false} value={specificSearch} icon={'magnify'} placeholder={mentionPreview ? "Search who's tagged" : get ? 'Search Themes to Buy' : free ? 'Search Free Themes' : my ? 'Search My Themes' : purchased ? 'Search Purchased Themes' : likes ? mentions ? 'Search friends to mention!' : theme ? themeSearch : !cliqueSearch ? specificSearch.length > 0 ? specificSearch : 'Search' : 'Search your Cliqs' : 'Search'} onFocus={() => {setRecentSearches(true); isSearching(true); setSearching(true)}} iconStyle={home || clique || chat || friend || channel || groupMembers
                  ||likes || userCliqueSearch || groupChannel ? styles.homeIcon : styles.postIcon}
                  containerStyle={groupChannel && !searching ? {borderWidth: 1, borderColor: modeTheme.color, width: '95%'} : chat && !searching ? {borderWidth: 1, borderColor: modeTheme.color, width: '95%'} : {borderWidth: 1,  borderColor: modeTheme.color, width: '85%'}} 
                  onSubmitEditing={() => setRecentSearches(false)} text={searching ? true : false} onChangeText={setSpecificSearch} 
                  onPress={() => {setSpecificSearch(''); setRecentSearches(true); isSearching(true); setSearching(true)}}/>
                  {chat || friend || userCliqueSearch || channel || likes || groupMembers || groupChannel ? searching ? 
            <MaterialCommunityIcons name='close' color={modeTheme.color} size={40} style={home || clique ? styles.closeHomeIcon : post ? styles.closePostIcon : styles.closeChatIcon} onPress={() => {isSearching(false); setRecentSearches(false); setSearching(false); Keyboard.dismiss()}}/>  
            : null : cliqueSearch  ? <MaterialCommunityIcons color={modeTheme.color} name='close' size={40} style={styles.cliqueIcon} onPress={() => {cliqueSearchFunction()}}/> 
            : clique || home || theme ? <MaterialCommunityIcons color={modeTheme.color} name='close' size={40} style={home || clique ? styles.closeHomeIcon : post ? styles.closePostIcon : styles.closeChatIcon} onPress={() => {isSearching(false); setRecentSearches(false); setSearching(false); Keyboard.dismiss()}}/> :
            <MaterialCommunityIcons color={modeTheme.color} name='close' size={40} style={home || clique  ? styles.closeHomeIcon : post ? styles.closePostIcon : styles.closeChatIcon} onPress={() => {navigation.goBack()}}/>  }
                  </View>
                  <View style={!moreResultButton && (home || clique || theme) ? {height: '100%'} : {}}>
                  {searching && filtered.length == 0 && specificSearch.length > 0 ?
                  <View>
                    <Text style={{fontFamily: 'Montserrat_500Medium', fontSize: 15.36, paddingHorizontal: 10, color: modeTheme.color, textAlign: 'center', marginRight: '5%', marginTop: '5%'}}>No Search Results</Text>
                  </View> :  
                  searching && moreResults
                  ?
                  <>
                  <FlatList 
                      data={!moreResults ? filtered.slice(0, 3) : filtered.slice(0, 10)}
                      renderItem={!clique && !theme && !cliqueSearch && !userCliqueSearch && !groupMembers && !groupChannel
                     ? renderEvents : groupChannel ? renderChannels : groupMembers ? renderGroupMembers : theme ? renderThemes : cliqueSearch ? renderCliques : userCliqueSearch ? renderUserCliqueSearches : renderCliqueEvents}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={moreResultButton ? false: true}
                  /> 
                  {post || friend || channel || groupChannel || cliqueSearch || userCliqueSearch || likes || groupMembers || chat ? null : 
                    recentSearches && searching ?
                    <RecentSearches data={home ? searches.filter((obj, index, self) => index === self.findIndex((o) => o.username === obj.username)) : searches} 
                    theme={theme} group={clique} home={home} friend={chat} extraStyling={!home && !clique ? {width: '100%'} : {width: '95%'}}
                    renderSearches={!clique && !theme ? renderSearches : clique ? renderCliqueSearches : theme ? renderRecentThemes : renderCliqueSearches}/> : null
                  }
                  </>
                  : searching && (moreResults || specificSearch.length > 0) ? 
                  <View>
                  <FlatList 
                      data={!moreResults ? filtered.slice(0, 3) : filtered.slice(0, 10)}
                      renderItem={!clique && !theme && !cliqueSearch && !userCliqueSearch && !groupMembers && !groupChannel
                     ? renderEvents : groupChannel ? renderChannels : groupMembers ? renderGroupMembers : theme ? renderThemes : cliqueSearch ? renderCliques : userCliqueSearch ? renderUserCliqueSearches : renderCliqueEvents}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{flexGrow: 1}}
                      scrollEnabled={moreResultButton ? false: true}
                  /> 
                  {(home || clique || theme) && moreResults ? 
                  <TouchableOpacity style={{alignItems: 'center', marginRight: '5%'}} onPress={() => {setRecentSearches(false); setMoreResults(true); setMoreResultButton(false);}}>
                    <Text style={{paddingTop: 5, color: modeTheme.theme != 'light' ? "#9EDAFF" : "#005278", fontFamily: 'Montserrat_400Regular'}}>See more results</Text>
                    </TouchableOpacity> : null }
                  </View> : <></>}
                  {post || friend || channel || groupChannel || cliqueSearch || userCliqueSearch || likes || groupMembers || chat ? null : 
                    recentSearches && searching ?
                    <RecentSearches data={home ? searches.filter((obj, index, self) => index === self.findIndex((o) => o.username === obj.username)) : searches} 
                    theme={theme} group={clique} home={home} friend={chat} extraStyling={!home && !clique ? {width: '100%'} : {width: '95%'}}
                    renderSearches={!clique && !theme ? renderSearches : clique ? renderCliqueSearches : theme ? renderRecentThemes : renderCliqueSearches}/> : null
                  }
                  </View>
                  
                  
              </TouchableOpacity>
              
          </View>
          </>
  )
}

export default SearchBar

const styles = StyleSheet.create({
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
  homeIcon: {position: 'absolute', left: 280, top: 8.5},
  postIcon: {position: 'absolute', left: 260, top: 8.5},
  chatIcon: {
    position: 'absolute', left: 300, top: 8.5
  },
  homeContainer: {marginLeft: '5%', marginBottom: '5%'},
  postContainer: {marginLeft: 0, marginBottom: '5%'},
  chatContainer: {marginLeft: 0, marginBottom: '5%'},
  closeHomeIcon: {position: 'absolute', left: 320, top: 2},
  closePostIcon : {position: 'absolute', left: 295, top: -7.5},
  closeChatIcon : {
    marginLeft: '2.5%'
  },
  cliqueIcon: {
    position: 'absolute', left: 312.5, top: -8
  },

})