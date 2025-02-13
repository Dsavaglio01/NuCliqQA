import { StyleSheet, Text, View, FlatList, TouchableOpacity, Keyboard, ActivityIndicator, Dimensions} from 'react-native'
import React, {useState, useEffect, useMemo, useCallback, useContext} from 'react'
import SearchInput from '../Components/SearchInput'
import { useNavigation } from '@react-navigation/native'
import { collection, getDoc, onSnapshot, query, where, addDoc, limit, updateDoc, orderBy, doc, serverTimestamp, deleteDoc } from 'firebase/firestore'
import { Menu, Provider, Divider} from 'react-native-paper'
import {MaterialCommunityIcons, Ionicons} from '@expo/vector-icons';
import useAuth from '../Hooks/useAuth'
import ThemeHeader from '../Components/ThemeHeader'
import FastImage from 'react-native-fast-image'
import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'
import RecentSearches from '../Components/RecentSearches'
import { useFocusEffect } from '@react-navigation/native'
import themeContext from '../lib/themeContext'
import { db } from '../firebase'
import ThemeComponent from '../Components/Themes/ThemeComponent'
import FooterComponent from '../Components/Themes/FooterComponent'
import { fetchPurchasedThemes, fetchMorePurchasedThemes, fetchMyThemes, fetchMoreMyThemes, fetchFreeThemes, fetchThemeSearches,
  fetchMoreFreeThemes } from '../firebaseUtils'
const All = ({route}) => {
  const {name, groupId, goToMy, registers, goToPurchased} = route.params;
  const [searching, setSearching] = useState(false);
  const [my, setMy] = useState(false);
  const [recentSearches, setRecentSearches] = useState(false);
  const {user} = useAuth()
  const [filtered, setFiltered] = useState([]);
  const [free, setFree] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [specificSearch, setSpecificSearch] = useState('');
  const [reportedThemes, setReportedThemes] = useState([]);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [moreResultButton, setMoreResultButton] = useState(false);
  const [moreResults, setMoreResults] = useState(false);
  const [myLastVisible, setMyLastVisible] = useState([]);
  const [purchasedLastVisible, setPurchasedLastVisible] = useState([]);
  const [freeTempPosts, setFreeTempPosts] = useState([]);
  const [purchased, setPurchased] = useState(false);
  const [myThemes, setMyThemes] = useState([]);
  const [mostPopular, setMostPopular] = useState(true);
  const theme = useContext(themeContext)
  const [purchasedThemes, setPurchasedThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [themeSearches, setThemeSearches] = useState([]);
  const [filteredGroup, setFilteredGroup] = useState(null);
  const navigation = useNavigation();
  const [freeSearches, setFreeSearches] = useState([]);
  const [mySearches, setMySearches] = useState([]);
  const [purchasedSearch, setPurchasedSearch] = useState([]);
  const [tempSearches, setTempSearches] = useState([]);
  const [sortIncreasingDate, setSortIncreasingDate] = useState(false);
  const [sortDecreasingDate, setSortDecreasingDate] = useState(false);
  const [sortIncreasingPrice, setIncreasingPrice] = useState(false);
  const [sortDecreasingPrice, setDecreasingPrice] = useState(false);
  const [sortVisible, setSortVisible] = useState(false)
  const [registrationModal, setRegistrationModal] = useState(false);
  const openSortMenu = () => setSortVisible(true);
  const closeSortMenu = () => setSortVisible(false)
  useEffect(() => {
    if (route.params?.registers) {
      setRegistrationModal(registers)
    }
    if (route.params?.goToMy) {
      new Promise (resolve => {
      setMy(true);
      setFree(false);
      setPurchased(false);
      resolve()
      }).then(() => setLoading(false))
    }
    else if (route.params?.goToPurchased) {
      new Promise (resolve => {
      setMy(false);
      setFree(false);
      setPurchased(true);
      resolve()
      }).then(() => setLoading(false))
    }
  }, [route.params])
  useFocusEffect(
      useCallback(() => {
      // This block of code will run when the screen is focused

      // Clean-up function when the component unmounts or the screen loses focus
      return () => {
        setSortVisible(false)
        //setFocused(false)
      };
    }, [])
  )
    useEffect(() => {
      let unsub;
     unsub = onSnapshot(doc(db, "profiles", user.uid), (doc) => {
          setReportedThemes(doc.data().reportedThemes)
    });
    return unsub;
    }, [onSnapshot])
    useEffect(() => {
    let unsubscribe;
    const getThemes = async() => {
      if (user.uid && purchased && mostPopular) {
        unsubscribe = await fetchPurchasedThemes(user.uid, 'bought_count', 'desc', setPurchasedThemes, setPurchasedLastVisible);
      }
      if (user.uid && purchased && sortIncreasingDate) {
        unsubscribe = await fetchPurchasedThemes(user.uid, 'timestamp', 'desc', setPurchasedThemes, setPurchasedLastVisible);
      }
      else if (user.uid && purchased && sortDecreasingDate) {
        unsubscribe = await fetchPurchasedThemes(user.uid, 'timestamp', 'asc', setPurchasedThemes, setPurchasedLastVisible);
      }
      else if (user.uid && purchased && sortDecreasingPrice) {
        unsubscribe = await fetchPurchasedThemes(user.uid, 'price', 'asc', setPurchasedThemes, setPurchasedLastVisible);
      }
      else if (user.uid && purchased && sortIncreasingPrice) {
        unsubscribe = await fetchPurchasedThemes(user.uid, 'price', 'desc', setPurchasedThemes, setPurchasedLastVisible);
      }
    }
    getThemes();
    return () => {
      if (unsubscribe) {
        setTimeout(() => {
          setLoading(false)
        },  500);
        return unsubscribe;
      }
    };
  }, [user?.uid, purchased, mostPopular, sortIncreasingDate, sortDecreasingDate, sortIncreasingPrice, sortDecreasingPrice]);
    useEffect(() => {
      if (specificSearch.length > 0) {
      setMoreResultButton(false)
      setMoreResults(false)
      setRecentSearches(true)
      //console.log(temp)
      const tempList = Array.from(new Set(themeSearches.map(JSON.stringify))).map(JSON.parse).filter(item => {
        //console.log(item)
        return item
        /*  */
        
      })
      if (tempList.length > 3) {
        setMoreResultButton(true)
      }
      setFiltered(tempList)
    }
    else {
      setFiltered([])
    }
   }, [themeSearches])
  useEffect(() => {
      if (route.params?.firstTime) {
        setIsFirstTime(false)
      }
    }, [route.params?.firstTime])
  useMemo(() => {
    const getSearches = async() => {
    if (specificSearch.length > 0 && free) {
      setThemeSearches([])
      const {themeSearches} = await fetchThemeSearches('freeThemes', specificSearch, user.uid);
      setThemeSearches(themeSearches)
    } 
    if (specificSearch.length > 0 && my) {
      setThemeSearches([]);
      const {themeSearches} = await fetchThemeSearches('myThemes', specificSearch, user.uid);
      setThemeSearches(themeSearches)
    } 
    if (specificSearch.length > 0 && purchased) {
     setThemeSearches([]);
      const {themeSearches} = await fetchThemeSearches('purchased', specificSearch, user.uid);
      setThemeSearches(themeSearches)
    } 
  }
  getSearches()
  }, [specificSearch, free, my, purchased])
  useMemo(() => {
    const getThemes = async() => {
      if (user.uid && my && mostPopular) {
        const { tempPosts, lastMyVisible } = await fetchMyThemes(user.uid, 'bought_count', 'desc');
        setMyThemes(tempPosts);
        setMyLastVisible(lastMyVisible);
      }
      else if (user.uid && my && sortIncreasingDate) {
        const { tempPosts, lastMyVisible } = await fetchMyThemes(user.uid, 'timestamp', 'desc');
        setMyThemes(tempPosts);
        setMyLastVisible(lastMyVisible);
      }
      else if (user.uid && my && sortDecreasingDate) {
        const { tempPosts, lastMyVisible } = await fetchMyThemes(user.uid, 'timestamp', 'asc');
        setMyThemes(tempPosts);
        setMyLastVisible(lastMyVisible);
      }
      else if (user.uid && my && sortDecreasingPrice) {
        const { tempPosts, lastMyVisible } = await fetchMyThemes(user.uid, 'price', 'asc');
        setMyThemes(tempPosts);
        setMyLastVisible(lastMyVisible);
      }
      else if (user.uid && my && sortIncreasingPrice) {
        const { tempPosts, lastMyVisible } = await fetchMyThemes(user.uid, 'price', 'desc');
        setMyThemes(tempPosts);
        setMyLastVisible(lastMyVisible);
      }
    }
    getThemes();
    
  }, [my, user?.uid, mostPopular, sortIncreasingDate, sortDecreasingDate, sortIncreasingPrice, sortDecreasingPrice])
  async function fetchMyData () {
    if (myLastVisible != undefined && mostPopular) {
      const { tempPosts, lastMyVisible } = await fetchMoreMyThemes(user.uid, 'bought_count', 'desc', myLastVisible);
      setMyThemes([...myThemes, ...tempPosts]);
      setMyLastVisible(lastMyVisible);
    }
    else if (myLastVisible != undefined && sortIncreasingDate) {
      const { tempPosts, lastMyVisible } = await fetchMoreMyThemes(user.uid, 'timestamp', 'desc', myLastVisible);
      setMyThemes([...myThemes, ...tempPosts]);
      setMyLastVisible(lastMyVisible);
    }
    else if (myLastVisible != undefined && sortDecreasingDate) {
      const { tempPosts, lastMyVisible } = await fetchMoreMyThemes(user.uid, 'timestamp', 'asc', myLastVisible);
      setMyThemes([...myThemes, ...tempPosts]);
      setMyLastVisible(lastMyVisible);
    }
    else if (myLastVisible != undefined && sortDecreasingPrice) {
      const { tempPosts, lastMyVisible } = await fetchMoreMyThemes(user.uid, 'price', 'asc', myLastVisible);
      setMyThemes([...myThemes, ...tempPosts]);
      setMyLastVisible(lastMyVisible);
    }
    else if (myLastVisible != undefined && sortIncreasingPrice) {
      const { tempPosts, lastMyVisible } = await fetchMoreMyThemes(user.uid, 'price', 'desc', myLastVisible);
      setMyThemes([...myThemes, ...tempPosts]);
      setMyLastVisible(lastMyVisible);
    }
    
  }
  async function fetchPurchasedData() {
    if (purchasedLastVisible != undefined && mostPopular) {
      const { tempPosts, lastPurchasedVisible } = await fetchMorePurchasedThemes(user.uid, 'bought_count', 'desc', purchasedLastVisible);
      setPurchasedThemes([...purchasedThemes, ...tempPosts]);
      setPurchasedLastVisible(lastPurchasedVisible);
    }
    else if (purchasedLastVisible != undefined && sortDecreasingDate) {
      const { tempPosts, lastPurchasedVisible } = await fetchMorePurchasedThemes(user.uid, 'timestamp', 'asc', purchasedLastVisible);
      setPurchasedThemes([...purchasedThemes, ...tempPosts]);
      setPurchasedLastVisible(lastPurchasedVisible);
    }
    else if (purchasedLastVisible != undefined && sortDecreasingPrice) {
      const { tempPosts, lastPurchasedVisible } = await fetchMorePurchasedThemes(user.uid, 'price', 'asc', purchasedLastVisible);
      setPurchasedThemes([...purchasedThemes, ...tempPosts]);
      setPurchasedLastVisible(lastPurchasedVisible);
    }
    else if (purchasedLastVisible != undefined && sortIncreasingDate) {
      const { tempPosts, lastPurchasedVisible } = await fetchMorePurchasedThemes(user.uid, 'timestamp', 'desc', purchasedLastVisible);
      setPurchasedThemes([...purchasedThemes, ...tempPosts]);
      setPurchasedLastVisible(lastPurchasedVisible);
    }
    else if (purchasedLastVisible != undefined && sortIncreasingPrice) {
      const { tempPosts, lastPurchasedVisible } = await fetchMorePurchasedThemes(user.uid, 'price', 'desc', purchasedLastVisible);
      setPurchasedThemes([...purchasedThemes, ...tempPosts]);
      setPurchasedLastVisible(lastPurchasedVisible);
    }
    
  }
  useMemo(() => {
    const getThemes = async() => {
    if (user.uid && free && mostPopular) {
      const { tempPosts, lastFreeVisible } = await fetchFreeThemes('bought_count', 'desc');
      setFreeTempPosts(tempPosts);
      setLastVisible(lastFreeVisible);
    }
    else if (user.uid && free && sortIncreasingDate) {
      const { tempPosts, lastFreeVisible } = await fetchFreeThemes('timestamp', 'desc');
      setFreeTempPosts(tempPosts);
      setLastVisible(lastFreeVisible);
    }
    else if (user.uid && free && sortDecreasingDate) {
      const { tempPosts, lastFreeVisible } = await fetchFreeThemes('timestamp', 'asc');
      setFreeTempPosts(tempPosts);
      setLastVisible(lastFreeVisible);
    }
  }
  getThemes();
  }, [mostPopular, free, user?.uid, sortIncreasingDate, sortDecreasingDate])
  async function fetchMoreFreeData () {
    if (mostPopular && lastVisible != undefined) {
      const { tempPosts, lastFreeVisible } = await fetchMoreFreeThemes('bought_count', 'desc', lastVisible);
      setFreeTempPosts([...freeTempPosts, ...tempPosts])
      setLastVisible(lastFreeVisible);
    }
    else if (sortIncreasingDate && lastVisible != undefined) {
      const { tempPosts, lastFreeVisible } = await fetchMoreFreeThemes('timestamp', 'desc', lastVisible);
      setFreeTempPosts([...freeTempPosts, ...tempPosts])
      setLastVisible(lastFreeVisible);
    }
    else if (sortDecreasingDate && lastVisible != undefined) {
      const { tempPosts, lastFreeVisible } = await fetchMoreFreeThemes('timestamp', 'asc', lastVisible);
      setFreeTempPosts([...freeTempPosts, ...tempPosts])
      setLastVisible(lastFreeVisible);
    }
  }
  useEffect(() => {

      let unsub;
      const fetchSearches = async() => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('freeTheme', '==', true), orderBy('timestamp', 'desc'), limit(3)), (snapshot) => {
          setFreeSearches(snapshot.docs.map((doc) => ({
            id: doc.data().element.id
          })))
        })
      }
      fetchSearches();
      return unsub;
  }, [])
  useEffect(() => {

      let unsub;
      let unsub2;
      const fetchSearches = async() => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('myTheme', '==', true), orderBy('timestamp', 'desc'), limit(3)), (snapshot) => {
          setMySearches(snapshot.docs.map((doc) => ({
            id: doc.data().element.id
          })))
        })
        unsub2 = onSnapshot(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('purchasedTheme', '==', true), orderBy('timestamp', 'desc'), limit(3)), 
        (snapshot) => {
          setPurchasedSearch(snapshot.docs.map((doc) => ({
            id: doc.data().element.id
          })))
        })
      }
      fetchSearches();
      return unsub, unsub2;
  }, [])
  useEffect(() => {
    if (mySearches.length > 0 && my) {
      setTempSearches([])
      mySearches.map(async(item) => {
        const docSnap = await getDoc(doc(db, 'profiles', user.uid, 'myThemes', item.id))
        if (docSnap.exists()) {
          setTempSearches(prevState => [...prevState, {id: docSnap.id, searchId: item.id, ...docSnap.data()}])
        }
        
      })
    }
    
  }, [mySearches, my])
  useMemo(() => {
    if (purchasedSearch.length > 0 && purchased) {
      setTempSearches([])
      purchasedSearch.map(async(item) => {
        const docSnap = await getDoc(doc(db, 'profiles', user.uid, 'purchased', item.id))
        if (docSnap.exists()) {
          setTempSearches(prevState => [...prevState, {id: docSnap.id, searchId: item.id, ...docSnap.data()}])
        }
      })
    }
    
  }, [purchasedSearch, purchased])
  useEffect(() => {
    if (freeSearches.length > 0 && free) {
      setTempSearches([])
      freeSearches.map(async(item) => {
        const docSnap = await getDoc(doc(db, 'freeThemes', item.id))
        if (docSnap.exists()) {
          setTempSearches(prevState => [...prevState, {id: docSnap.id, searchId: item.id, ...docSnap.data()}])
        }
        
      })
    }
    
  }, [freeSearches, free])
  useEffect(() => {
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
  async function addToRecentSearches(item){
    var element = item
    if (free) {
      if (tempSearches.filter(e => e.id == item.id).length > 0) {
      tempSearches.map(async(e) => {
        if (e.id == e.id) {
          //setTempId(element.id)
          await updateDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id), {
            group: false,
            event: false,
            element,
            user: false,
            ai: false,
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
        ai: false,
        friend: false,
        freeTheme: true,
        timestamp: serverTimestamp()
      })
    }
    }
    else if (purchased) {
      if (tempSearches.filter(e => e.id == item.id).length > 0) {
      tempSearches.map(async(e) => {
        if (e.id == e.id) {
          //setTempId(element.id)
          await updateDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id), {
            group: false,
            event: false,
            element,
            user: false,
            ai: false,
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
        ai: false,
        friend: false,
        purchasedTheme: true,
        timestamp: serverTimestamp()
      })
    }
    }
    else if (my) {
      if (tempSearches.filter(e => e.id == item.id).length > 0) {
      tempSearches.map(async(e) => {
        if (e.id == e.id) {
          //setTempId(element.id)
          await updateDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id), {
            group: false,
            event: false,
            element,
            user: false,
            ai: false,
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
        ai: false,
        friend: false,
        myTheme: true,
        timestamp: serverTimestamp()
      })
    }
  }
  }
  const handleScroll = _.debounce((event) => {
    // Your logic for fetching more data
    if (free) {
      setLoading(true)
      fetchMoreFreeData()
      setTimeout(() => {
        setLoading(false)
      }, 1000);
    }
    else if (my) {
      setLoading(true)
      fetchMyData()
      setTimeout(() => {
        setLoading(false)
      }, 1000);
    }
    else if (purchased) {
      setLoading(true)
      fetchPurchasedData()
      setTimeout(() => {
        setLoading(false)
      }, 1000);
    }
    
  }, 400);
  const renderThemes = ({item}) => {
    console.log(item)
    return (
        <TouchableOpacity style={styles.categoriesContainer} onPress={() => {setFilteredGroup([item]); addToRecentSearches(item); setSearching(false)}}>
            <FastImage source={{uri: item.images[0]}} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={styles.categories}>{item.name}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center', marginLeft: 'auto'}} color={"#9edaff"}/>
        </TouchableOpacity>
    )
  }
  function recentSearchFunction(item) {

      setFilteredGroup([item])
        setSearching(false)
  }
  const renderRecentThemes = ({item}) => {
    return (
      <TouchableOpacity style={styles.categoriesContainer} onPress={() => recentSearchFunction(item)}>
        <FastImage source={{uri: item.images[0]}} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={styles.categories}>{item.name}</Text>
            <TouchableOpacity onPress={() => removeSearch(item)} style={{alignSelf: 'center', marginLeft: "auto"}}>
                <MaterialCommunityIcons name='close' size={30} color={theme.color} />
            </TouchableOpacity>
        </TouchableOpacity>
    )
  }
   async function removeSearch(item) {
      await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', item.searchId)).then(() => setTempSearches(tempSearches.filter((e) => e.id !== item.id)))
  }
  //console.log(loading)
  const renderSpecific = (item) => {
    return (
      <TouchableOpacity style={[[styles.themeContainer, {borderColor: theme.color}], {height: 230}]} onPress={item[0].metadata != undefined || item[0].bought != undefined && !groupId && !free ? () => navigation.navigate('SpecificTheme', {id: item[0].id, groupTheme: null, free: false, username: item[0].username}) 
      : groupId && !free ? ()  => navigation.navigate('SpecificTheme', {id: item[0].id, groupId: groupId, groupTheme: item[0].images[0], groupName: name,
        free: false, username: item[0].username}) : free && !groupId ? () => navigation.navigate('SpecificTheme', {productId: item[0].id, groupTheme: null, free: true, username: item[0].username}) :
      free && groupId ? () => navigation.navigate('SpecificTheme', {productId: item[0].id, groupName: name, username: item[0].username, groupTheme: item[0].images[0], free: true, groupId: groupId}) : null}>
        <FastImage source={{uri: item[0].images[0]}} style={{height: 190, width: '100%', marginBottom: 7.5}}/>
        <Text style={[styles.nameText, {color: theme.color}]}>{item[0].name}</Text>
      </TouchableOpacity>
    )
  }


  return (
    <Provider>
    <View style={styles.container}>
      <View style={{backgroundColor: "#121212"}}>
        <ThemeHeader video={false} text={searching ? 'Search Themes' : name != null ? `${name} Themes` : goToMy || my ?  'My Themes' : goToPurchased ||  purchased ? 'Collected Themes' : 'Get Themes'}
        backButton={goToMy || name != null ? true: false}/>
      </View>
     <Divider borderBottomWidth={0.4} style={{borderColor: theme.color}}/>
     <View style={styles.mainContainer}>
        {searching ? 
        <View style={{marginTop: '10%'}}>
          <View style={{marginLeft: 0, marginBottom: '5%'}}>
            <TouchableOpacity activeOpacity={1} style={{ marginTop: '-2.5%', zIndex: 0}}>
                  <View style={{flexDirection: 'row'}}>
                  <SearchInput autoFocus={true} value={specificSearch} icon={'magnify'} placeholder={free ? 'Search Themes to Get' : my ? 'Search My Themes' : purchased ? 'Search Collected Themes' 
                  : null} onFocus={() => {setRecentSearches(true); setSearching(true)}} iconStyle={styles.postIcon}
                  containerStyle={{borderWidth: 1, borderColor: theme.color, width: '85%'}} onSubmitEditing={() => {setRecentSearches(false) }} text={searching ? true : false} onChangeText={setSpecificSearch} 
                  onPress={() => {setSpecificSearch(''); setRecentSearches(true); setSearching(true)}}/>
                  {<MaterialCommunityIcons name='close' size={40} color={theme.color} style={styles.closeChatIcon} onPress={() => { setRecentSearches(false); setSearching(false); Keyboard.dismiss(); setFiltered([]); setSpecificSearch('')}}/>}
                  </View>
                  <View style={!moreResultButton ? {height: '100%'} : {}}>
                  {searching && filtered.length == 0 && specificSearch.length > 0 ?
                  <View>
                    <Text style={{fontFamily: 'Montserrat_500Medium', color: "#9edaff", fontSize: 15.36, paddingHorizontal: 10, textAlign: 'center', marginRight: '5%', marginTop: '5%'}}>No Search Results</Text>
                  </View> :  
                  searching && moreResults
                  ?
                  <>
                  <FlatList 
                      data={!moreResults ? filtered.slice(0, 3) : filtered.slice(0, 10)}
                      renderItem={renderThemes}
                      keyExtractor={(item) => item.id}
                      //contentContainerStyle={{width: '100%', zIndex: 3, flewGrow: 1}}
                      scrollEnabled={moreResultButton ? false: true}
                  /> 
                  {
                    recentSearches && searching ?
                    <RecentSearches data={tempSearches.filter((obj, index, self) => index === self.findIndex((o) => o.searchId === obj.searchId)).reverse()} 
                      free={free} my={my} purchased={purchased} extraStyling={{width: '100%'}}
                    renderSearches={renderRecentThemes}/> : null
                  }
                  </>
                  : searching && (moreResults || specificSearch.length > 0) ? 
                  <View>
                  <FlatList 
                      data={!moreResults ? filtered.slice(0, 3) : filtered.slice(0, 10)}
                      renderItem={renderThemes}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{flexGrow: 1}}
                      scrollEnabled={moreResultButton ? false: true}
                  />
                  {moreResults ? 
                  <TouchableOpacity style={{alignItems: 'center', marginRight: '5%'}} onPress={() => {setRecentSearches(false); setMoreResults(true); setMoreResultButton(false);}}>
                    <Text style={{paddingTop: 5, color: "#9edaff", fontFamily: 'Montserrat_400Regular'}}>See more results</Text>
                    </TouchableOpacity> : null}
                  </View> : <></>}
                  {
                    recentSearches && searching ?
                    <RecentSearches data={tempSearches.filter((obj, index, self) => index === self.findIndex((o) => o.searchId === obj.searchId)).reverse()} 
                      free={free} my={my} purchased={purchased} extraStyling={{width: '100%'}}
                    renderSearches={renderRecentThemes}/> : null
                  }
                  </View>
                  
                  
              </TouchableOpacity>
              
          </View>
        </View> 
        : null}
      {!searching ? 
      <>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
      <View style={styles.titleContainer}>
          <TouchableOpacity style={styles.logInButton} onPress={() => navigation.navigate('CreateTheme', {avatar: false})}>
            <MaterialCommunityIcons name='plus' size={20} color={"#121212"} style={{alignSelf: 'center', paddingLeft: 10}}/>
            <Text style={styles.alreadyText}>{"Create Theme"}</Text>
        </TouchableOpacity>
         
      </View>
      <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={() => {setSearching(true); setFiltered([]); setSpecificSearch('')}} style={{alignSelf: 'center', paddingRight: 10}}>
              <Ionicons name='search' size={30} color={theme.color} />
          </TouchableOpacity>
          <Menu 
            visible={sortVisible}
            onDismiss={closeSortMenu}
            contentStyle={{backgroundColor: "#121212", borderWidth: 1, borderColor: "#71797E"}}
            anchor={<MaterialCommunityIcons name='sort-variant' size={45} color={theme.color} style={{alignSelf: 'center'}} onPress={openSortMenu}/>}>
              {!purchased && !my ? <>
              <Menu.Item onPress={() => {setSortIncreasingDate(false); setSortDecreasingDate(false); setIncreasingPrice(false); setDecreasingPrice(false); setMostPopular(true)}} title="Most Popular" titleStyle={!sortIncreasingDate && !sortDecreasingDate && !sortIncreasingPrice && !sortDecreasingPrice ? {color: "#9edaff", fontFamily: 'Montserrat_700Bold'} : {color: theme.color}}/> 
            <Divider /> 
              </> : null}
            
            <Menu.Item onPress={() => {setSortIncreasingDate(true); setSortDecreasingDate(false); setIncreasingPrice(false); setDecreasingPrice(false); setMostPopular(false)}} title="Newest" titleStyle={sortIncreasingDate ? {color: "#9edaff", fontFamily: 'Montserrat_700Bold'} : {color: theme.color}}/> 
            <Divider />    
            <Menu.Item onPress={() => {setSortDecreasingDate(true); setSortIncreasingDate(false); setIncreasingPrice(false); setDecreasingPrice(false); setMostPopular(false)}} title="Oldest" titleStyle={sortDecreasingDate ? {color: "#9edaff", fontFamily: 'Montserrat_700Bold'} : {color: theme.color}}/>
            {free ? null : <>
            <Divider />    
            <Menu.Item onPress={() => {setSortDecreasingDate(false); setSortIncreasingDate(false); setIncreasingPrice(true); setDecreasingPrice(false); setMostPopular(false)}} title="Price ↑" titleStyle={sortIncreasingPrice ? {color: "#9edaff", fontFamily: 'Montserrat_700Bold'} : {color: theme.color}}/>   
            <Divider />    
            <Menu.Item onPress={() => {setSortDecreasingDate(false); setSortIncreasingDate(false); setIncreasingPrice(false); setDecreasingPrice(true); setMostPopular(false)}} title="Price ↓" titleStyle={sortDecreasingPrice ? {color: "#9edaff", fontFamily: 'Montserrat_700Bold'} : {color: theme.color}}/>   
            </>
            }
            

          </Menu>
          </View>
          </View>

      <View style={{flexDirection: 'row', marginTop: '2.5%', justifyContent: 'space-between'}}>
        <TouchableOpacity style={free && !filteredGroup ? styles.selectedButtons : styles.notSelectedButtons} onPress={() => {setFree(true); setMy(false); setPurchased(false);  setFilteredGroup(null); setTempSearches([]); setSpecificSearch(''); setFiltered([])}}>
          <Text style={free  && !filteredGroup ? styles.selectedButtonText : styles.notSelectedButtonText}>Get Themes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={my && !filteredGroup ? styles.selectedButtons : styles.notSelectedButtons} onPress={() => {setFree(false); setMy(true); setPurchased(false);  setFilteredGroup(null); setTempSearches([]); setSpecificSearch(''); setFiltered([])}}>
          <Text style={my  && !filteredGroup ? styles.selectedButtonText : styles.notSelectedButtonText}>My Themes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={purchased && !filteredGroup ? styles.selectedButtons : styles.notSelectedButtons} onPress={() => {setPurchased(true); setMy(false); setFree(false); setFilteredGroup(null); setTempSearches([]); setSpecificSearch(''); setFiltered([])}}>
          <Text style={purchased && !filteredGroup ? styles.selectedButtonText : styles.notSelectedButtonText}>Collected</Text>
        </TouchableOpacity>
        
      </View>
      <View style={styles.main}>
        {filteredGroup != null ? 
            <ThemeComponent specific={true} free={free} purchased={purchased} my={my} user={user}
            item={filteredGroup[0]} groupId={groupId} name={name} freeTempPosts={freeTempPosts} 
            updateMyThemes={setMyThemes} updateFreeTempPosts={setFreeTempPosts}/>
          : free && freeTempPosts.length > 0 ? 
          <FlatList 
          data={freeTempPosts}
            renderItem={({item}) => <ThemeComponent free={free} purchased={purchased} my={my} user={user}
            item={item} groupId={groupId} name={name} freeTempPosts={freeTempPosts} updateFreeTempPosts={setFreeTempPosts}/>}
            numColumns={2}
            keyExtractor={(item) => item.id}
            style={{ height: '130%'}}
            extraData={loading}
            ListFooterComponent={<FooterComponent loading={loading} />
          }
            onScroll={handleScroll}
          />
          : my && myThemes.length > 0 ? 
          <FlatList 
              data={myThemes}
            renderItem={({item}) => <ThemeComponent free={free} myThemes={myThemes} updateMyThemes={setMyThemes} purchased={purchased} my={my} user={user}
            item={item} groupId={groupId} name={name}/>}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            extraData={loading}
            ListFooterComponent={<FooterComponent loading={loading} />}
            style={{height: '130%'}}
            onScroll={handleScroll}
          />
          : purchased && purchasedThemes.length > 0 ?
          <>
          <FlatList 
              data={purchasedThemes}
            renderItem={({item}) => <ThemeComponent free={free} purchased={purchased} my={my} user={user}
            item={item} groupId={groupId} name={name}/>}
            numColumns={2}
            extraData={loading}
            ListFooterComponent={<FooterComponent loading={loading} />}
            keyExtractor={(item) => item.id}
            style={{height: '130%'}}
            onScroll={handleScroll}
          />
          
          </>
          : loading ? <View style={{alignItems: 'center', flex: 1, backgroundColor: "#121212", justifyContent: 'flex-end'}}>
            <ActivityIndicator color={"#9edaff"}/> 
          </View> : <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            {purchased ? <Text style={styles.noThemesText}>Sorry you have no Purchased Themes!</Text> : my ? <Text style={styles.noThemesText}>Sorry you have no themes created right now!</Text> :
            free ? <Text style={styles.noThemesText}>Sorry no Themes to Get Right Now!</Text> : <Text style={styles.noThemesText}>Sorry no Themes to Get Right Now!</Text>}
            
          </View>}
      </View>
      </>
       : null}
      </View>
      
    </View>
    </Provider>
  )
}

export default All

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212"
  },
  mainContainer: {
    marginLeft: '5%', 
    marginRight: '5%'
  },
  main: {
    marginLeft: -10,
    marginRight: -10,
    flexDirection: 'row',
    marginTop: '5%',
    height: '75%'
  },
  categories: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    width: '80%',
    padding: 10,
    color: "#fafafa"
  },
  categoriesContainer: {
    borderRadius: 5,
    flexDirection: 'row',
    marginTop: 5,
    padding: 5,
    alignItems: 'center',
    width: '100%',
    backgroundColor: "#121212"
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '2.5%',
    alignItems: 'center',
  },
  noThemesText: {
    fontSize: 24,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    textAlign: 'center',
    color: "#fafafa"
  },
  logInButton: {
    borderRadius: 10,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: "#9edaff", 
    borderColor: "#9edaff"
  },
  alreadyText: {
    fontSize: 15.36,
    padding: 12,
    fontFamily: 'Montserrat_500Medium',
    color: "#121212",
    paddingLeft: 5,
    paddingRight: 15,
    textAlign: 'center'
  },
  selectedButtons: {
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa', 
    borderColor: '#fafafa'
  },
  notSelectedButtons: {
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212', 
    borderColor: '#fafafa'
  },
  selectedButtonText: {
    fontSize: 15.36,
    padding: 10,
    fontFamily: 'Montserrat_600SemiBold',
    color: "#121212"
  },
  notSelectedButtonText: {
    fontSize: 15.36,
    padding: 10,
    fontFamily: 'Montserrat_600SemiBold',
    color: "#fafafa"
  },  
  closeChatIcon : {
    marginLeft: '5%'
  },
  postIcon: {
    position: 'absolute', 
    left: 260, 
    top: 8.5
  }
})