import { Image, StyleSheet, Text, View, ScrollView, FlatList, Alert, TouchableOpacity, Keyboard, Modal, ActivityIndicator, Dimensions} from 'react-native'
import React, {useState, useEffect, useLayoutEffect, useMemo, useCallback, useContext} from 'react'
import SearchInput from '../Components/SearchInput'
import SearchDropDown from '../Components/DropdownSearch'
import { useNavigation } from '@react-navigation/native'
import { collection, getDoc, getDocs, getFirestore, onSnapshot, setDoc, query, where, addDoc, limit, updateDoc, orderBy, startAfter, doc, serverTimestamp, deleteDoc, arrayUnion, documentId, startAt, endAt } from 'firebase/firestore'
import RegisterHeader from '../Components/RegisterHeader'
import NextButton from '../Components/NextButton'
import { Menu, Provider, Divider} from 'react-native-paper'
import {MaterialCommunityIcons, Ionicons, Entypo} from '@expo/vector-icons';
import useAuth from '../Hooks/useAuth'
import ThemeHeader from '../Components/ThemeHeader'
import RadioButtonGroup, { RadioButtonItem } from "expo-radio-button"
import SearchBar from '../Components/SearchBar'
import FastImage from 'react-native-fast-image'
import {BACKEND_URL} from "@env"
import { useFonts, Montserrat_500Medium, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import PurchaseTheme from './PurchaseTheme'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MainButton from '../Components/MainButton'
import _ from 'lodash'
import RecentSearches from '../Components/RecentSearches'
import { useFocusEffect } from '@react-navigation/native'
import themeContext from '../lib/themeContext'
import { db } from '../firebase'
//import {usePreventScreenCapture} from 'expo-scree'
const DATA = [{
  
}]
const All = ({route}) => {
  //usePreventScreenCapture();
  const {name, groupId, goToMy, group, registers, goToPurchased} = route.params;
  //console.log(groupThemes)
  const [searching, setSearching] = useState(false);
  const [get, setGet] = useState(false);
  const [my, setMy] = useState(false);
  const [register, setRegister] = useState(false);
  const [recentSearches, setRecentSearches] = useState(false);
  const [completeThemes, setCompleteThemes] = useState([]);
  const [completeFreeThemes, setCompleteFreeThemes] = useState([]);
  const {user} = useAuth()
  const [filtered, setFiltered] = useState([]);
  const [themes, setThemes] = useState([]);
  const [applyLoading, setApplyLoading] = useState(false);
  const [free, setFree] = useState(true);
  const [bought, setBought] = useState(false);
  const [specificSearch, setSpecificSearch] = useState('');
  const [clearFilter, setClearFilter] = useState(false)
  const [lastVisible, setLastVisible] = useState();
  const [done, setDone] = useState(false);
  const [myDone, setMyDone] = useState(false);
  const [reportedThemes, setReportedThemes] = useState([]);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [purchasedDone, setPurchasedDone] = useState(false);
  const [moreResultButton, setMoreResultButton] = useState(false);
  const [moreResults, setMoreResults] = useState(false);
  const [freeDone, setFreeDone] = useState(false);
  const [myLastVisible, setMyLastVisible] = useState([]);
  const [purchasedLastVisible, setPurchasedLastVisible] = useState([]);
  const [tempPosts, setTempPosts] = useState([]);
  const [freeTempPosts, setFreeTempPosts] = useState([]);
  const [purchased, setPurchased] = useState(false);
  const [myThemes, setMyThemes] = useState(null);
  const [mostPopular, setMostPopular] = useState(true);
  const theme = useContext(themeContext)
  //const [groupMyThemes, setGroupMyThemes] = useState([]);
  const [purchasedThemes, setPurchasedThemes] = useState(null);
  const [freeThemes, setFreeThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postIds, setPostIds] = useState([])
  const [groupPostIds, setGroupPostIds] = useState([]);
  const [themeSearches, setThemeSearches] = useState([]);
  const [filteredGroup, setFilteredGroup] = useState(null);
  const navigation = useNavigation();
  const [getSearches, setGetSearches] = useState([]);
  const [freeSearches, setFreeSearches] = useState([]);
  const [mySearches, setMySearches] = useState([]);
  const [purchasedSearch, setPurchasedSearch] = useState([]);
  const [tempSearches, setTempSearches] = useState([]);
  const [visible, setVisible] = useState(false);
  const [newThemes, setNewThemes] = useState([]);
  const [sortIncreasingDate, setSortIncreasingDate] = useState(false);
  const [sortDecreasingDate, setSortDecreasingDate] = useState(false);
  const [sortIncreasingPrice, setIncreasingPrice] = useState(false);
  const [sortDecreasingPrice, setDecreasingPrice] = useState(false);
  const [sortVisible, setSortVisible] = useState(false)
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [lastRecommendedPost, setLastRecommendedPost] = useState(null);
  const [getRecommendedPosts, setGetRecommendedPosts] = useState(false);
  const [postDoneApplying, setPostDoneApplying] = useState(false);
  const [profileDoneApplying, setProfileDoneApplying] = useState(false);
  const [bothDoneApplying, setBothDoneApplying] = useState(false);
  const [postBackground, setPostBackground] = useState(null);
  const [background, setBackground] = useState(null);
  const [groupsJoined, setGroupsJoined] = useState([]);
  const [registrationModal, setRegistrationModal] = useState(false);
  const openMenu = () => setVisible(true)
  const closeMenu = () => setVisible(false)
  const openSortMenu = () => setSortVisible(true);
  const [chosenTheme, setChosenTheme] = useState(null);
  const [useThemeModal, setUseThemeModal] = useState(false)
  const [useThemeModalLoading, setUseThemeModalLoading] = useState(false);
  const closeSortMenu = () => setSortVisible(false)
  const [current, setCurrent] = useState('')
  useEffect(() => {
    if (route.params?.registers) {
      setRegistrationModal(registers)
    }
    if (route.params?.goToMy) {
      new Promise (resolve => {
      setMy(true);
      setGet(false);
      setFree(false);
      setPurchased(false);
      resolve()
      }).then(() => setLoading(false))
    }
    else if (route.params?.goToPurchased) {
      new Promise (resolve => {
      setMy(false);
      setGet(false);
      setFree(false);
      setPurchased(true);
      resolve()
      }).then(() => setLoading(false))
    }
  }, [route.params])
  useFocusEffect(
      useCallback(() => {
        //setFocused(true)
      // This block of code will run when the screen is focused
      

      // Clean-up function when the component unmounts or the screen loses focus
      return () => {
        setSortVisible(false)
        //setFocused(false)
      };
    }, [])
  )
 /* useEffect(() => {
    const getRecommendations = async() => {
      await fetch(`${BACKEND_URL}/api/getRecommendedThemes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({userId: user.uid})
          })
        .then(response => response.json())
        .then(responseData => {
          if (responseData.recomms) {
            //console.log(responseData.recomms)
            responseData.recomms.map((e) => {
              setRecommendedPosts(prevState => [...prevState, e.id])
              setLastRecommendedPost(responseData.recommId)

            })
            //setRecommendedPosts(responseData.recomms)
          }
          
        })
        .catch(error => {
          // Handle any errors that occur during the request
          console.error(error);
        })
        setGetRecommendedPosts(true)
    }
    setTimeout(() => {
      setLoading(false)
    }, 2000);
    getRecommendations()
  }, []) */
    useEffect(() => {
      if (freeDone) {
        setCompleteFreeThemes(freeTempPosts)
      }
    }, [freeTempPosts, freeDone])
    useEffect(() => {
      let unsub
      const getData = async() =>{
        unsub = onSnapshot(doc(db, 'profiles', user.uid), (doc) => {
          setBackground(doc.data().background)
          setPostBackground(doc.data().postBackground)
          setGroupsJoined(doc.data().groupsJoined)
        })
      }
      getData()
      return unsub
    }, [])
    useEffect(() => {
      let unsub;
     unsub = onSnapshot(doc(db, "profiles", user.uid), (doc) => {
          setReportedThemes(doc.data().reportedThemes)
    });
    return unsub;
    }, [onSnapshot])
    //console.log(completeThemes.length)
  useEffect(() => {
      if (freeTempPosts.length > 0) {
        setCompleteFreeThemes([...freeThemes, ...freeTempPosts])
      }
    }, [freeThemes, freeTempPosts])
    useEffect(() => {
      if (specificSearch.length > 0) {
      setMoreResultButton(false)
      setMoreResults(false)
      setRecentSearches(true)
      const temp = specificSearch.toLowerCase()
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
    setPurchasedThemes([]);
    //console.log(groupId)
    
      let unsub;
    const getThemes = async() => {
      new Promise(resolve => {
      unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased'), orderBy('timestamp', 'desc'), limit(10)), (snapshot) => {
       // new Promise(resolve => )
        setPurchasedThemes(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          transparent: false
        })))
        setPurchasedLastVisible(snapshot.docs[snapshot.docs.length - 1])
      })
      resolve()
    }).finally(() => setPurchasedDone(true))
    }
    getThemes();
    return unsub;
    
    
  }, [])
  useEffect(() => {
      if (route.params?.firstTime) {
        setIsFirstTime(false)
      }
    }, [route.params?.firstTime])
    function skipWalkthrough() {
    const check = async() => {
      await AsyncStorage.setItem('isFirstTime', 'false');
      setIsFirstTime(false)
    }
    check()
  }
  useMemo(() => {
    if (specificSearch.length > 0 && get) {
      setThemeSearches([])
      const getData = async() => {
        const q = query(collection(db, "products"), orderBy('stripe_metadata_keywords'), startAt(specificSearch), endAt(specificSearch + '\uf8ff'));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          setThemeSearches(prevState => [...prevState, {id: doc.id, ...doc.data()}])
        });
      }
      getData();
    } 
    if (specificSearch.length > 0 && free) {
      setThemeSearches([])
      const getData = async() => {
        const q = query(collection(db, "freeThemes"), where('searchKeywords', 'array-contains', specificSearch.toLowerCase()), limit(10));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          setThemeSearches(prevState => [...prevState, {id: doc.id, ...doc.data()}])
        });
      }
      getData();
    } 
    if (specificSearch.length > 0 && my) {
      setThemeSearches([])
      const getData = async() => {
        const q = query(collection(db, "profiles", user.uid, 'myThemes'), where('searchKeywords', 'array-contains', specificSearch.toLowerCase()), limit(10));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          setThemeSearches(prevState => [...prevState, {id: doc.id, ...doc.data()}])
        });
      }
      getData();
    } 
    if (specificSearch.length > 0 && purchased) {
      setThemeSearches([])
      const getData = async() => {
        const q = query(collection(db, "profiles", user.uid, 'purchased'), where('searchKeywords', 'array-contains', specificSearch.toLowerCase()), limit(10));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          setThemeSearches(prevState => [...prevState, {id: doc.id, ...doc.data()}])
        });
      }
      getData();
    } 
  }, [specificSearch, get, free, my, purchased])
  function fetchPurchasedData() {
    if (purchasedLastVisible != undefined && mostPopular) {
    let newData = [];
    let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased'), orderBy('timestamp', 'desc'), startAfter(purchasedLastVisible), limit(10)), (snapshot) => {
          snapshot.docs.map((doc) => {
            if (!purchasedThemes.some((doc2 => doc2.id == doc.id))) {
              newData.push({
              id: doc.id,
              transparent: false,
              ...doc.data()
            })
            }
          })
          
          //console.log(newData)
          if (newData.length > 0 ) {
          setPurchasedThemes([...purchasedThemes, ...newData])
          //console.log(posts.map((item) => (item.id)))
          setPurchasedLastVisible(snapshot.docs[snapshot.docs.length-1])
          }
        })
      }
      fetchCards();
      return unsub;
    }
    else if (purchasedLastVisible != undefined && sortDecreasingDate) {
      let newData = [];
    let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased'), orderBy('timestamp', 'asc'), startAfter(purchasedLastVisible), limit(10)), (snapshot) => {
          snapshot.docs.map((doc) => {
            if (!purchasedThemes.some((doc2 => doc2.id == doc.id))) {
              newData.push({
              id: doc.id,
              transparent: false,
              ...doc.data()
            })
            }
          })
          
          //console.log(newData)
          if (newData.length > 0 ) {
          setPurchasedThemes([...purchasedThemes, ...newData])
          //console.log(posts.map((item) => (item.id)))
          setPurchasedLastVisible(snapshot.docs[snapshot.docs.length-1])
          }
        })
      }
      fetchCards();
      return unsub;
    }
    else if (purchasedLastVisible != undefined && sortDecreasingPrice) {
      let newData = [];
    let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased'), orderBy('price', 'asc'), startAfter(purchasedLastVisible), limit(10)), (snapshot) => {
          snapshot.docs.map((doc) => {
            if (!purchasedThemes.some((doc2 => doc2.id == doc.id))) {
              newData.push({
              id: doc.id,
              transparent: false,
              ...doc.data()
            })
            }
          })
          
          //console.log(newData)
          if (newData.length > 0 ) {
          setPurchasedThemes([...purchasedThemes, ...newData])
          //console.log(posts.map((item) => (item.id)))
          setPurchasedLastVisible(snapshot.docs[snapshot.docs.length-1])
          }
        })
      }
      fetchCards();
      return unsub;
    }
    else if (purchasedLastVisible != undefined && sortIncreasingDate) {
      let newData = [];
    let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased'), orderBy('timestamp', 'desc'), startAfter(purchasedLastVisible), limit(10)), (snapshot) => {
          snapshot.docs.map((doc) => {
            if (!purchasedThemes.some((doc2 => doc2.id == doc.id))) {
              newData.push({
              id: doc.id,
              transparent: false,
              ...doc.data()
            })
            }
          })
          
          //console.log(newData)
          if (newData.length > 0 ) {
          setPurchasedThemes([...purchasedThemes, ...newData])
          //console.log(posts.map((item) => (item.id)))
          setPurchasedLastVisible(snapshot.docs[snapshot.docs.length-1])
          }
        })
      }
      fetchCards();
      return unsub;
    }
    else if (purchasedLastVisible != undefined && sortIncreasingPrice) {
      let newData = [];
    let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased'), orderBy('price', 'desc'), startAfter(purchasedLastVisible), limit(10)), (snapshot) => {
          snapshot.docs.map((doc) => {
            if (!purchasedThemes.some((doc2 => doc2.id == doc.id))) {
              newData.push({
              id: doc.id,
              transparent: false,
              ...doc.data()
            })
            }
          })
          
          //console.log(newData)
          if (newData.length > 0 ) {
          setPurchasedThemes([...purchasedThemes, ...newData])
          //console.log(posts.map((item) => (item.id)))
          setPurchasedLastVisible(snapshot.docs[snapshot.docs.length-1])
          }
        })
      }
      fetchCards();
      return unsub;
    }
    
  }
  //console.log(loading)
  function fetchMoreFreeData () {
    if (mostPopular) {
      //console.log('seocng')
        let newData = [];
      const fetchCards = async () => {
        const q = query(collection(db, 'freeThemes'), orderBy('bought_count', 'desc'), startAfter(lastVisible), limit(10));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                newData.push({
                    id: doc.id,
                    transparent: false,
                    ...doc.data()
                  })
                
                if (newData.length > 0) {
                //setLoading(true)
                new Promise(resolve => {
        setFreeTempPosts([...freeTempPosts, ...newData])
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
          resolve(); // Resolve the Promise after setCompleteMessages is done
      }) 
                
              }
            });
      }
      fetchCards();
    }
    else if (sortIncreasingDate) {
      let newData = [];
      const fetchCards = async () => {
        const q = query(collection(db, 'freeThemes'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                newData.push({
                    id: doc.id,
                    transparent: false,
                    ...doc.data()
                  })
      
              if (newData.length > 0) {
                
                setFreeTempPosts([...freeTempPosts, ...newData])
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
              }
            });
      }
      fetchCards();
    }
    else if (sortDecreasingDate) {
      let newData = [];
      const fetchCards = async () => {
        const q = query(collection(db, 'freeThemes'), orderBy('timestamp', 'asc'), startAfter(lastVisible), limit(10));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                newData.push({
                    id: doc.id,
                    transparent: false,
                    ...doc.data()
                  })
      
              if (newData.length > 0) {
                
                setFreeTempPosts([...freeTempPosts, ...newData])
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
              }
            });
      }
      fetchCards();
    }
  }
  function fetchMyData () {
    if (myLastVisible != undefined && mostPopular) {
      //console.log('first')
    let newData = [];
    let unsub;

      const fetchCards = async () => {
        newData = [];
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'myThemes'), orderBy('timestamp', 'desc'), startAfter(myLastVisible), limit(10)), (snapshot) => {
          snapshot.docs.map((doc) => {
            if (!myThemes.some(doc2 => doc2.id === doc.id))
              newData.push({
              id: doc.id,
              transparent: false,
              ...doc.data()
            })
            
          })
          //console.log(newData)
          if (newData.length > 0) {
                
                setMyThemes([...myThemes, ...newData])
                setMyLastVisible(snapshot.docs[snapshot.docs.length-1])
              }
        })
      }
      fetchCards();
      return unsub;
    }
    else if (myLastVisible != undefined && sortDecreasingDate) {
      //console.log('first')
    let newData = [];
    let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'myThemes'), orderBy('timestamp', 'asc'), startAfter(myLastVisible), limit(10)), (snapshot) => {
          snapshot.docs.map((doc) => {
            if (!myThemes.some(doc2 => doc2.id === doc.id))
              newData.push({
              id: doc.id,
              transparent: false,
              ...doc.data()
            })
            
          })
          //console.log(newData)
          if (newData.length > 0) {
                
                setMyThemes([...myThemes, ...newData])
                setMyLastVisible(snapshot.docs[snapshot.docs.length-1])
              }
        })
      }
      fetchCards();
      return unsub;
    }
    else if (myLastVisible != undefined && sortIncreasingDate) {
      //console.log('first')
    let newData = [];
    let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'myThemes'), orderBy('timestamp', 'desc'), startAfter(myLastVisible), limit(10)), (snapshot) => {
          snapshot.docs.map((doc) => {
            if (!myThemes.some(doc2 => doc2.id === doc.id))
              newData.push({
              id: doc.id,
              transparent: false,
              ...doc.data()
            })
            
          })
          //console.log(newData)
          if (newData.length > 0) {

                
                setMyThemes([...myThemes, ...newData])
                setMyLastVisible(snapshot.docs[snapshot.docs.length-1])
              }
        })
      }
      fetchCards();
      return unsub;
    }
  }

  function fetchMoreData () {
    if (mostPopular) {
        let newData = [];
      const fetchCards = async () => {
        const q = query(collection(db, 'products'), orderBy('stripe_metadata_bought_count', 'desc'), startAfter(lastVisible), limit(10));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                newData.push({
                    id: doc.id,
                    transparent: false,
                    ...doc.data()
                  })
              if (newData.length > 0) {
                setLoading(true)
                new Promise(resolve => {
        setTempPosts([...tempPosts, ...newData])
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
          resolve(); // Resolve the Promise after setCompleteMessages is done
      }).finally(() => setLoading(false)); 
                
              }
            });
      }
      fetchCards();
      
    }
    else if (sortIncreasingDate) {
      let newData = [];
      const fetchCards = async () => {
        const q = query(collection(db, 'products'), orderBy('stripe_metadata_timestamp', 'desc'), startAfter(lastVisible), limit(10));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                newData.push({
                    id: doc.id,
                    transparent: false,
                    ...doc.data()
                  })
              if (newData.length > 0) {
                setLoading(true)
                
                setTempPosts([...tempPosts, ...newData])
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
              }
            });
      }
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
    }
    else if (sortDecreasingDate) {
      let newData = [];
      const fetchCards = async () => {
        const q = query(collection(db, 'products'), orderBy('stripe_metadata_timestamp', 'asc'), startAfter(lastVisible), limit(10));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                newData.push({
                    id: doc.id,
                    transparent: false,
                    ...doc.data()
                  })
              if (newData.length > 0) {
                setLoading(true)
                
                setTempPosts([...tempPosts, ...newData])
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
              }
            });
      }
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
    }
    else if (sortDecreasingPrice) {
      let newData = [];
      const fetchCards = async () => {
        const q = query(collection(db, 'products'), orderBy('stripe_metadata_price', 'asc'), startAfter(lastVisible), limit(10));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                newData.push({
                    id: doc.id,
                    transparent: false,
                    ...doc.data()
                  })
              if (newData.length > 0) {
                setLoading(true)
                
                setTempPosts([...tempPosts, ...newData])
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
              }
            });
      }
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
    }
    else if (sortIncreasingPrice) {
      let newData = [];
      const fetchCards = async () => {
        const q = query(collection(db, 'products'), orderBy('stripe_metadata_price', 'desc'), startAfter(lastVisible), limit(10));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                newData.push({
                    id: doc.id,
                    transparent: false,
                    ...doc.data()
                  })
              if (newData.length > 0) {
                setLoading(true)
                
                setTempPosts([...tempPosts, ...newData])
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
              }
            });
      }
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
    }
  }
  useEffect(() => {

      let unsub;
      const fetchSearches = async() => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('getTheme', '==', true), orderBy('timestamp', 'desc'), limit(3)), (snapshot) => {
          setGetSearches(snapshot.docs.map((doc) => ({
            id: doc.id,
            searchId: doc.data().element.id
          })))
        })
      }
      fetchSearches();
      return unsub;
  }, [])
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
        //console.log('first')
        //console.log(item)
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
        //console.log('first')
        //console.log(item)
        const docSnap = await getDoc(doc(db, 'profiles', user.uid, 'purchased', item.id))
        if (docSnap.exists()) {
          setTempSearches(prevState => [...prevState, {id: docSnap.id, searchId: item.id, ...docSnap.data()}])
        }
      })
    }
    
  }, [purchasedSearch, purchased])
  useEffect(() => {
    if (getSearches.length > 0 && get) {
      setTempSearches([])
      getSearches.map(async(item) => {
        //console.log('first')
        const docSnap = await getDoc(doc(db, 'products', item.searchId))
        if (docSnap.exists()) {
          setTempSearches(prevState => [...prevState, {id: docSnap.id, searchId: item.id, ...docSnap.data()}])
        }
         /* const docSnap = await getDocs(collection(db, 'profiles', user.uid, 'myThemes'), where('images', 'array-contains', item.id))
         console.log(docSnap.docs.length)
         docSnap.forEach((e) => {
            if (e.exists()) {
          setTempSearches(prevState => [...prevState, {id: e.id, ...e.data()}])
         }
         }) */
        
      })
    }
    
  }, [getSearches, get])
  useEffect(() => {
    if (freeSearches.length > 0 && free) {
      setTempSearches([])
      freeSearches.map(async(item) => {
        //console.log('first')
        //console.log(item)
        const docSnap = await getDoc(doc(db, 'freeThemes', item.id))
        if (docSnap.exists()) {
          setTempSearches(prevState => [...prevState, {id: docSnap.id, searchId: item.id, ...docSnap.data()}])
        }
         /* const docSnap = await getDocs(collection(db, 'profiles', user.uid, 'myThemes'), where('images', 'array-contains', item.id))
         console.log(docSnap.docs.length)
         docSnap.forEach((e) => {
            if (e.exists()) {
          setTempSearches(prevState => [...prevState, {id: e.id, ...e.data()}])
         }
         }) */
        
      })
    }
    
  }, [freeSearches, free])
  
  useEffect(() => {
      let unsub;
    const getThemes = async() => {
      new Promise(resolve => {
      unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'myThemes'), orderBy('timestamp', 'desc'), limit(10)), (snapshot) => {
        setMyThemes(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          transparent: false
        })))
        setMyLastVisible(snapshot.docs[snapshot.docs.length - 1])
      })
      resolve()
    }).finally(() => setLoading(false))
    }
    getThemes();
    return unsub;
      
  }, [my])
  //console.log(myThemes.length)
  useEffect(() => {
    if (sortIncreasingDate && my) {
      setLoading(true)
      let unsub;
    const getThemes = async() => {
      new Promise(resolve => {
      unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'myThemes'), orderBy('timestamp', 'desc')), (snapshot) => {
        setMyThemes(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          transparent: false,
        })))
        setMyLastVisible(snapshot.docs[snapshot.docs.length - 1])
      })
      resolve()
    }).finally(() => setLoading(false))
    }
    getThemes();
    return unsub;
    }
  }, [sortIncreasingDate, my])
  useEffect(() => {
    if (sortIncreasingDate && purchased) {
      setLoading(true)
      let unsub;
    const getThemes = async() => {
      new Promise(resolve => {
      unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased'), orderBy('timestamp', 'desc')), (snapshot) => {
        setPurchasedThemes(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          transparent: false
        })))
        setPurchasedLastVisible(snapshot.docs[snapshot.docs.length - 1])
      })
      resolve()
      }).finally(() => setLoading(false))
    }
    getThemes();
    return unsub;
    }
  }, [sortIncreasingDate, purchased])
  useEffect(() => {
    if (sortDecreasingDate && get) {
    //console.log(themes.length)
    setTempPosts([])
    setLoading(true)
    const getThemes = async() => {
      const querySnapshot = await getDocs(query(collection(db, 'products'), orderBy('stripe_metadata_timestamp', 'asc'), limit(10)));
        querySnapshot.forEach((doc) => {
          setTempPosts(prevState => [...prevState, {id: doc.id, transparent: false, ...doc.data()}])
        });
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
    }
    getThemes();
    setTimeout(() => {
      setLoading(false)
    }, 1000);
    }
  }, [sortDecreasingDate, get])
  useEffect(() => {
    if (sortDecreasingDate && free) {
    //console.log(themes.length)
    setLoading(true)
    setFreeTempPosts([]);
    const getThemes = async() => {
      const querySnapshot = await getDocs(query(collection(db, 'freeThemes'), orderBy('timestamp', 'asc'), limit(10)));
      new Promise(resolve => {
        querySnapshot.forEach((doc) => {
          setFreeTempPosts(prevState => [...prevState, {id: doc.id, transparent: false, ...doc.data()}])
        });
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
        resolve()
      }).finally(() => setLoading(false))
    }
    getThemes();
    }
  }, [sortDecreasingDate, free])
  useEffect(() => {
    if (mostPopular && free) {
      setFreeTempPosts([]);
    setLoading(true)
    const getThemes = async() => {
      const querySnapshot = await getDocs(query(collection(db, 'freeThemes'), orderBy('bought_count', 'desc'), limit(10)));
      new Promise(resolve => {
        querySnapshot.forEach((doc) => {
          setFreeTempPosts(prevState => [...prevState, {id: doc.id, transparent: false, ...doc.data()}])
        });
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
          resolve(); // Resolve the Promise after setCompleteMessages is done
      }).finally(() => setLoading(false)); 
        
    }
    getThemes();
    }
  }, [mostPopular, free])
  useEffect(() => {
    if (sortIncreasingDate && get) {
      setTempPosts([])
    setLoading(true)
    const getThemes = async() => {
      const querySnapshot = await getDocs(query(collection(db, 'products'), orderBy('stripe_metadata_timestamp', 'desc'), limit(10)));
        querySnapshot.forEach((doc) => {
          setTempPosts(prevState => [...prevState, {id: doc.id, transparent: false, ...doc.data()}])
        });
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
    }
    getThemes();
    setTimeout(() => {
      setLoading(false)
    }, 1000);
    }
  }, [sortIncreasingDate, get])
  useEffect(() => {
    if (sortIncreasingDate && free) {
      setFreeTempPosts([]);
      setLoading(true)
    const getThemes = async() => {
      const querySnapshot = await getDocs(query(collection(db, 'freeThemes'), orderBy('timestamp', 'desc'), limit(10)));
      new Promise(resolve => {
        querySnapshot.forEach((doc) => {
          setFreeTempPosts(prevState => [...prevState, {id: doc.id, transparent: false, ...doc.data()}])
        });
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
        resolve()
      }).finally(() => setLoading(false))
    }
    getThemes();
    }
  }, [sortIncreasingDate, free])
  useEffect(() => {
    if (sortDecreasingDate && my) {
      setLoading(true)
      let unsub;
    const getThemes = async() => {
      new Promise(resolve => {
      unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'myThemes'), orderBy('timestamp', 'asc')), (snapshot) => {
        setMyThemes(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          transparent: false
        })))
        setMyLastVisible(snapshot.docs[snapshot.docs.length - 1])
      })
      resolve()
    }).finally(() => setLoading(false))
    }
    getThemes();
    setTimeout(() => {
      setLoading(false)
    }, 2000);
    return unsub;
    }
  }, [sortDecreasingDate, my])
  useEffect(() => {
    if (sortDecreasingDate && purchased) {
      setLoading(true)
      let unsub;
    const getThemes = async() => {
      new Promise(resolve => {
      unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased'), orderBy('timestamp', 'asc')), (snapshot) => {
        setPurchasedThemes(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          transparent: false
        })))
        setPurchasedLastVisible(snapshot.docs[snapshot.docs.length - 1])
      })
      resolve()
    }).finally(() => setLoading(false))
    }
    getThemes();
    return unsub;
    }
  }, [sortDecreasingDate, purchased])
  useEffect(() => {
    if (sortIncreasingPrice && my) {
      setLoading(true)
      let unsub;

    const getThemes = async() => {
      new Promise(resolve => {
      unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'myThemes'), orderBy('price')), (snapshot) => {
        setMyThemes(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          transparent: false
        })))
        setMyLastVisible(snapshot.docs[snapshot.docs.length - 1])
      })
      resolve()
    }).finally(() => setLoading(false))
    }
    getThemes();
    return unsub;
    }
  }, [sortIncreasingPrice, my])
  useEffect(() => {
    if (sortIncreasingPrice && purchased) {
      setLoading(true)
      let unsub;
    const getThemes = async() => {
      new Promise(resolve => {
      unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased'), orderBy('price', 'desc')), (snapshot) => {
        setPurchasedThemes(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })))
        setPurchasedLastVisible(snapshot.docs[snapshot.docs.length - 1])
      })
    }).finally(() => setLoading(false))
    }
    getThemes();
    return unsub;
    }
  }, [sortIncreasingPrice, purchased])
  useEffect(() => {
    if (mostPopular && purchased) {
      let unsub;
    const getThemes = async() => {
      unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased'), orderBy('bought_count')), (snapshot) => {
        setPurchased(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })))
        setPurchasedLastVisible(snapshot.docs[snapshot.docs.length - 1])
      })
    }
    getThemes();
    setTimeout(() => {
      setLoading(false)
    }, 2000);
    return unsub;
    }
  }, [mostPopular, purchased])
  useEffect(() => {
    if (sortIncreasingPrice && get) {
      setTempPosts([])
      setLoading(true)
    const getThemes = async() => {
      const querySnapshot = await getDocs(query(collection(db, 'products'), orderBy('stripe_metadata_price', 'desc'), limit(10)));
        querySnapshot.forEach((doc) => {
          setTempPosts(prevState => [...prevState, {id: doc.id, transparent: false, ...doc.data()}])
        });
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
    }
    getThemes();
    setTimeout(() => {
      setLoading(false)
    }, 1000);
    }
  }, [sortIncreasingPrice, get])
  useEffect(() => {
    if (mostPopular && get) {
      setTempPosts([])
    const getThemes = async() => {
      const querySnapshot = await getDocs(query(collection(db, 'products'), orderBy('stripe_metadata_bought_count', 'desc'), limit(10)));
      
        new Promise(resolve => {
        querySnapshot.forEach((doc) => {
          setTempPosts(prevState => [...prevState, {id: doc.id, transparent: false, ...doc.data()}])
        });
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
          resolve(); // Resolve the Promise after setCompleteMessages is done
      }).finally(() => setLoading(false)); 
    }
    getThemes();
    }
  }, [mostPopular, get])
  //console.log(mostPopular)
  useEffect(() => {
    if (sortDecreasingPrice && get) {
      setTempPosts([])
      setLoading(true)
    const getThemes = async() => {
      const querySnapshot = await getDocs(query(collection(db, 'products'), orderBy('stripe_metadata_price', 'asc'), limit(10)));
        querySnapshot.forEach((doc) => {
          setTempPosts(prevState => [...prevState, {id: doc.id, transparent: false, ...doc.data()}])
        });
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
    }
    getThemes();
    setTimeout(() => {
      setLoading(false)
    }, 1000);
    }
  }, [sortDecreasingPrice, get])
  //console.log(freeThemes.length)
  useEffect(() => {
    if (getRecommendedPosts) {
      if (free == true && name == null) {
      let unsub;
    const getThemes = async() => {
      unsub = onSnapshot(query(collection(db, 'freeThemes'), where(documentId(), 'in', recommendedPosts)), (snapshot) => {
        setFreeThemes(snapshot.docs.filter(doc => !purchasedThemes.some(doc2 => doc2.productId === doc.id)).map((doc) => ({
          id: doc.id,
          ...doc.data(),
          transparent: false
        })))
      })
    }
    getThemes();
    setTimeout(() => {
      setLoading(false)
    }, 2000);
    return unsub;
    }
    }
    
  }, [free, myThemes, purchasedThemes, getRecommendedPosts, recommendedPosts])
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
  //console.log(freeThemes.length)
  //console.log(themes.length)
  //console.log(themes)
  useEffect(() => {
    if (sortDecreasingPrice && my) {
      setLoading(true)
      let unsub;
    const getThemes = async() => {
      new Promise(resolve => {
      unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'myThemes'), orderBy('price', 'desc')), (snapshot) => {
        setMyThemes(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          transparent: false
        })))
        setMyLastVisible(snapshot.docs[snapshot.docs.length - 1])
      })
      resolve()
    }).finally(() => setLoading(false))
    }
    getThemes();
    return unsub;
    }
  }, [sortDecreasingPrice, my])
  useEffect(() => {
    if (sortDecreasingPrice && purchased) {
      setLoading(true)
      let unsub;
    const getThemes = async() => {
      new Promise(resolve => {
      unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased'), orderBy('price', 'asc')), (snapshot) => {
        setPurchasedThemes(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })))
        setPurchasedLastVisible(snapshot.docs[snapshot.docs.length - 1])
      })
    }).finally(() => setLoading(false))
    }
    getThemes();
    return unsub;
    }
  }, [sortDecreasingPrice, purchased])
  //console.log(themes.length)
  //console.log(user.uid)
  async function addToRecentSearches(item){
    var element = item
    if (get) {
      if (tempSearches.filter(e => e.id == item.id).length > 0) {
      //console.log('bruh')
      tempSearches.map(async(e) => {
        if (e.id == e.id) {
          //setTempId(element.id)
          await updateDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id), {
            group: false,
            event: false,
            element,
            user: false,
            ai: false,
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
        ai: false,
        friend: false,
        getTheme: true,
        timestamp: serverTimestamp()
      })
    }
    }
    else if (free) {
      if (tempSearches.filter(e => e.id == item.id).length > 0) {
      //console.log('bruh')
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
      //console.log('bruh')
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
      //console.log('bruh')
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
  
  function itemFreeToTransparent(item) {
    const updatedThemes = [...freeTempPosts];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.item.id)
    updatedThemes[objectIndex].transparent = true
    setFreeTempPosts(updatedThemes)
  }
  function itemFreeNotToTransparent(item) {
    const updatedThemes = [...freeTempPosts];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.item.id)
    updatedThemes[objectIndex].transparent = false
    setFreeTempPosts(updatedThemes)
  }
  function itemAllToTransparent(item) {
    const updatedThemes = [...tempPosts];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.item.id)
    
    updatedThemes[objectIndex].transparent = true
    setTempPosts(updatedThemes)
  }
  function itemAllNotToTransparent(item) {
    const updatedThemes = [...tempPosts];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.item.id)
    updatedThemes[objectIndex].transparent = false
    setTempPosts(updatedThemes)
  }
  function itemToTransparent(item) {
    const updatedMyThemes = [...myThemes];
    const objectIndex = updatedMyThemes.findIndex(obj => obj.id === item.item.id)
    updatedMyThemes[objectIndex].transparent = true
    setMyThemes(updatedMyThemes)
  }
  function itemPurchaseToTransparent(item) {
    const updatedMyThemes = [...purchasedThemes];
    const objectIndex = updatedMyThemes.findIndex(obj => obj.id === item.item.id)
    updatedMyThemes[objectIndex].transparent = true
    setPurchasedThemes(updatedMyThemes)
  }
  function itemPurchaseNotToTransparent(item) {
    const updatedMyThemes = [...purchasedThemes];
    const objectIndex = updatedMyThemes.findIndex(obj => obj.id === item.item.id)
    updatedMyThemes[objectIndex].transparent = false
    setPurchasedThemes(updatedMyThemes)
  }
  function itemNotToTransparent(item) {
    const updatedMyThemes = [...myThemes];
    const objectIndex = updatedMyThemes.findIndex(obj => obj.id === item.item.id)
    updatedMyThemes[objectIndex].transparent = false
    setMyThemes(updatedMyThemes)
  }
  const handleScroll = _.debounce((event) => {
    // Your logic for fetching more data
    if (get) {
      fetchMoreData()
    }
    else if (free) {
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
  /* useEffect(() => {
    const getData = async() => {
      setPostIds([])
      (await getDocs(collection(db, 'profiles', user.uid, 'posts'))).forEach((document) => {
        setPostIds(prevState => [...prevState, document.id])
      })
    }
    getData()
  }, [])
  useEffect(() => {
    const getData = async() => {
    groupsJoined.map(async(item) => {
      setGroupPostIds([]);
        (await getDocs(collection(db, 'groups', item, 'profiles', user.uid, 'posts'))).forEach((document) => {
        setGroupPostIds(prevState => [...prevState, {id: document.id, group: item}])
      })
      })
    }
    getData()
  }, [groupsJoined]) */
  async function applyToPosts() {
    console.log(chosenTheme.item.selling)
    //console.log(chosenTheme.item)
      setApplyLoading(true);
      await updateDoc(doc(db, 'profiles', user.uid), {
            postBackground: chosenTheme.item.images[0],
            postBought: chosenTheme.item.selling != undefined && chosenTheme.item.selling == true ? true : chosenTheme.item.forSale != undefined && chosenTheme.item.forSale == true ? true : false,
            postBought: chosenTheme.item.selling != undefined && chosenTheme.item.selling == true ? true : chosenTheme.item.forSale != undefined && chosenTheme.item.forSale == true ? true : false,
        }).then(() => {setTimeout(() => {
          setApplyLoading(false)
          setUseThemeModalLoading(false); setPostDoneApplying(true); setChosenTheme(null);
        }, 1000); })
    //setUseThemeModalLoading(true)
    
  }
  async function applyToProfile() {
   // setUseThemeModalLoading(true)
   setApplyLoading(true)
    await updateDoc(doc(db, 'profiles', user.uid), {
            background: chosenTheme.item.images[0],
            forSale: chosenTheme.item.selling != undefined && chosenTheme.item.selling == true ? true : chosenTheme.item.forSale != undefined && chosenTheme.item.forSale == true ? true : false,
        }).then(() => { setTimeout(() => {
          setApplyLoading(false)
          setUseThemeModalLoading(false); setProfileDoneApplying(true); setChosenTheme(null);
        }, 1000);})
  }
  async function applyToBoth() {
    setApplyLoading(true)
   //console.log(chosenTheme.item.images[0])
    await updateDoc(doc(db, 'profiles', user.uid), {
            background: chosenTheme.item.images[0],
            postBackground: chosenTheme.item.images[0],
            postBought: chosenTheme.item.selling != undefined && chosenTheme.item.selling == true ? true : chosenTheme.item.forSale != undefined && chosenTheme.item.forSale == true ? true : false,
        }).then(() => {
        setTimeout(() => {
          setApplyLoading(false)
          setUseThemeModalLoading(false); 
          setBothDoneApplying(true); 
          setChosenTheme(null); 
        }, 1000);})
  }
  async function deleteTheme(item) {

    //let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/deleteTheme'
      Alert.alert('Delete Theme?', 'If applied to your profile page or posts, it will be removed from there as well', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: async() => {
      try {
    const response = await fetch(`${BACKEND_URL}/api/deleteTheme`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: { background: background, theme: item.item.images[0], postBackground: postBackground, item: item, user: user.uid}}), // Send data as needed
    })
    const data = await response.json();
    if (data.done) {
      //navigation.goBack()
    }
  } catch (error) {
    console.error('Error:', error);
  }
      }},
    ]);
  }
  async function deletePurchasedTheme(item) {
    Alert.alert('Are you sure you want to delete this theme?', 'If applied to your profile page or posts, it will be removed from there as well.', [
      {
        text: 'No',
        onPress: () => console.log(item),
        style: 'cancel',
      },
      {text: 'Yes', onPress: 
      async() => await deleteDoc(doc(db, 'profiles', user.uid, 'purchased', item.item.id)).then(async() => {
        const docSnap = await getDocs(query(collection(db, 'products'), where('images', 'array-contains', item.item.images[0])))
        const freeDocSnap = await getDocs(query(collection(db, 'freeThemes'), where('images', 'array-contains', item.item.images[0])))
        docSnap.forEach(async(e) => {
          if (e.id) {
            await deleteDoc(doc(db, 'products', e.id))
          }
        })
        freeDocSnap.forEach(async(e) => {
          if (e.id) {
            await deleteDoc(doc(db, 'freeThemes', e.id))
          }
        })
      }).then(async() => {
        const snap = await getDoc(doc(db, 'profiles', user.uid))
        let list = snap.data().cliqueBackgrounds
        let uniqueList = Array.from(new Set(list.map(JSON.stringify))).map(JSON.parse)
        uniqueList.map(async(el) => {
          const docSnap = await getDocs(query(collection(db, 'groups', el.id, 'themes'), where('images', 'array-contains', item.item.images[0])))
          const freeDocSnap = await getDocs(query(collection(db, 'groups', el.id, 'freeThemes'), where('images', 'array-contains', item.item.images[0])))
            docSnap.forEach(async(e) => {
            if (e.id) {
              await deleteDoc(doc(db, 'groups', el.id, 'themes', e.id))
            }
          })
          freeDocSnap.forEach(async(e) => {
            if (e.id) {
              await deleteDoc(doc(db, 'groups', el.id, 'freeThemes', e.id))
            }
          })
        })
      }).then(background == item.item.images[0] && postBackground == item.item.images[0] ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
        background: null,
        postBackground: null
      }).then(async() => {(await getDocs(query(collection(db, 'posts'), where('userId', '==', user.uid)))).forEach(async(document) => {
          await updateDoc(doc(db, 'posts', document.id), {
            background: null
          })
        })}) : postBackground == item.item.images[0] ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
        postBackground: null
      }).then(async() => {(await getDocs(query(collection(db, 'posts'), where('userId', '==', user.uid)))).forEach(async(document) => {
          await updateDoc(doc(db, 'posts', document.id), {
            background: null
          })
        })}) : background == item.item.images[0] ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
        background: null
      }) : null)},

    ]);
    /* async() => await updateDoc(doc(db, 'profiles', user.uid), {
            background: null
        }).then(async() => (await getDocs(query(collection(db, 'posts'), where('userId', '==', name)))).forEach(async(document) => {
            await updateDoc(doc(db, 'posts', document.id), {
                background: null,
            })
        })).then( */
  }
  //console.log(filtered)
  //console.log(filteredGroup.length)
  const renderThemes = ({item}) => {
    //console.log(item)
    return (
        <TouchableOpacity style={[styles.categoriesContainer, {width: '100%', backgroundColor: theme.backgroundColor}]} onPress={() => {setFilteredGroup([item]); addToRecentSearches(item); setSearching(false)}}>
            <FastImage source={{uri: item.images[0]}} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: theme.color}]}>{item.name}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center', marginLeft: 'auto'}} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
        </TouchableOpacity>
    )
  }
  function recentSearchFunction(item) {

      setFilteredGroup([item])
        setSearching(false)
  }
  const renderRecentThemes = ({item}) => {
    return (
      <TouchableOpacity style={[styles.categoriesContainer, {width: '100%', backgroundColor: theme.backgroundColor}]} onPress={() => recentSearchFunction(item)}>
        <FastImage source={{uri: item.images[0]}} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: theme.color}]}>{item.name}</Text>
            <TouchableOpacity onPress={() => removeSearch(item)} style={{alignSelf: 'center', marginLeft: "auto"}}>
                <MaterialCommunityIcons name='close' size={30} color={theme.color} />
            </TouchableOpacity>
        </TouchableOpacity>
    )
  }
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  const renderAll = (item) => {
    //console.log(item)
    return (
      <View style={[styles.themeContainer, {borderColor: theme.color}]}>
      <TouchableOpacity onPress={item.item.metadata != undefined || item.item.bought != undefined && !groupId && !free ? () => navigation.navigate('SpecificTheme', {id: item.item.id, groupTheme: null, free: false, username: item.item.username}) 
      : groupId && !free ? ()  => navigation.navigate('SpecificTheme', {id: item.item.id, groupId: groupId, groupTheme: item.item.images[0], groupName: name,
        free: false, username: item.item.username}) : free && !groupId ? () => navigation.navigate('SpecificTheme', {productId: item.item.id, groupTheme: null, free: true, username: item.item.username}) :
      free && groupId ? () => navigation.navigate('SpecificTheme', {productId: item.item.id, groupName: name, username: item.item.username, groupTheme: item.item.images[0], free: true, groupId: groupId}) : null}>
        <FastImage source={{uri: item.item.images[0]}} style={{height: 190, width: '100%', marginBottom: 7.5}}/>
      </TouchableOpacity>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={[styles.nameText, {width: '90%', color: theme.color}]} numberOfLines={1}>{item.item.name}</Text>
          <TouchableOpacity onPress={free ? () => itemFreeToTransparent(item) : () => itemAllToTransparent(item)}>
            <Entypo name="dots-three-vertical" style={{alignSelf: 'center'}} size={17.5} color={theme.color}/>
          </TouchableOpacity>
          
        </View>
      {item.item.transparent ? 
        <View style={styles.overlay}>
          <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}} onPress={free ? () => {itemFreeNotToTransparent(item); setChosenTheme(null)} :
            () => {itemAllNotToTransparent(item); setChosenTheme(null)}}>
            <Text style={[styles.closeText]}>Close</Text>
            <MaterialCommunityIcons name='close' size={30} color={"#fff"}/>
          </TouchableOpacity>
          <View style={{alignItems: 'center'}}>
            {free ? <TouchableOpacity style={[styles.applyContainer, {backgroundColor: theme.backgroundColor}]} onPress={!groupId ? () => navigation.navigate('SpecificTheme', {productId: item.item.id, groupTheme: null, free: true, username: item.item.username}) : groupId ? 
            () => navigation.navigate('SpecificTheme', {productId: item.item.id, groupName: name, groupTheme: item.item.images[0], free: true, groupId: groupId, username: item.item.username}) : null}>
                <Text style={[styles.applyText, {color: theme.color}]}>Get Theme</Text>
              </TouchableOpacity>  :<TouchableOpacity style={[styles.applyContainer, {backgroundColor: theme.backgroundColor}]} onPress={item.item.metadata != undefined || item.item.bought != undefined && !groupId ? () => navigation.navigate('SpecificTheme', {id: item.item.id, groupTheme: null, free: false, username: item.item.username}) : item.item.metadata != undefined || item.item.bought != undefined ?
              () => navigation.navigate('SpecificTheme', {id: item.item.id, groupName: name, groupTheme: item.item.images[0], groupId: groupId, free: false, username: item.item.username}) : null}>
                <Text style={[styles.applyText, {color: theme.color}]}>Buy Theme</Text>
              </TouchableOpacity> }
              <TouchableOpacity style={[styles.applyContainer, {backgroundColor: theme.backgroundColor}]} onPress={groupId ? () => navigation.navigate('GroupChannels', {id: groupId, name: name, sending: true, theme: item.item, group: group}) 
              :() => navigation.navigate('SendingModal', {payload: item.item, payloadUsername: null, video: false, theme: true})}>
                <Text style={[styles.applyText, {color: theme.color}]}>Share Theme</Text>
              </TouchableOpacity>
              {!free ? item.item.stripe_metadata_userId && item.item.stripe_metadata_userId != user.uid && !reportedThemes.includes(item.item.id) ? 
              <TouchableOpacity style={[styles.applyContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => navigation.navigate('ReportPage', {id: item.item.id, video: false, comment: null, cliqueId: null, post: false, comments: false, message: false, cliqueMessage: false, theme: true, reportedUser: item.item.stripe_metadata_userId})}>
                <Text style={[styles.applyText, {color: theme.color}]}>Report Theme</Text>
              </TouchableOpacity>
              : null : item.item.userId && item.item.userId != user.uid && !reportedThemes.includes(item.item.id) ? 
              <TouchableOpacity style={[styles.applyContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => navigation.navigate('ReportPage', {id: item.item.id, video: false, comment: null, cliqueId: null, post: false, comments: false, message: false, cliqueMessage: false, theme: true, reportedUser: item.item.userId})}>
                <Text style={[styles.applyText, {color: theme.color}]}>Report Theme</Text>
              </TouchableOpacity>
              : null}
            </View>
        </View>
      : null
      }
      </View>
    )
  }
  const renderMy = (item) => {
    return (
      <View style={[styles.themeContainer, {borderColor: theme.color}]}>
        <TouchableOpacity onPress={() => navigation.navigate('SpecificTheme', {myId: item.item.id, my: true}) } >
          <FastImage source={{uri: item.item.images[0]}} style={{height: 190, width: '100%', marginBottom: 7.5}} />
        </TouchableOpacity>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={[styles.nameText, {width: '90%', color: theme.color}]} numberOfLines={1}>{item.item.name}</Text>
          <TouchableOpacity onPress={() => itemToTransparent(item)}>
            <Entypo name="dots-three-vertical" style={{alignSelf: 'center'}} size={17.5} color={theme.color}/>
          </TouchableOpacity>
          
        </View>
        {item.item.transparent ? 
        <View style={styles.overlay}>
          <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}} onPress={() => {itemNotToTransparent(item); setChosenTheme(null)}}>
            <Text style={[styles.closeText]}>Close</Text>
            <MaterialCommunityIcons name='close' size={30} color={"#fff"}/>
          </TouchableOpacity>
          <View style={{alignItems: 'center', marginTop: '-5%'}}>
              <TouchableOpacity style={[styles.applyContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => {setChosenTheme(item); setUseThemeModal(true)}}>
                <Text style={[styles.applyText, {color: theme.color}]}>Use Theme</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.applyContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => navigation.navigate('DesignTheme', {groupId: groupId, themeName: item.item.name, keywords: item.item.keywords, searchKeywords: item.item.searchKeywords, edit: true, source: item.item.images[0], themeId: item.item.id, selling: item.item.forSale, price: item.item.price})}>
                <Text style={[styles.applyText, {color: theme.color}]}>Edit Theme</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.applyContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => deleteTheme(item)}>
                <Text style={[styles.applyText, {color: theme.color}]}>Delete Theme</Text>
              </TouchableOpacity>
            </View>
        </View>
      : null
      }
        
      </View>
    )
  }
  async function refundTheme(item) {
    console.log(item)
      Alert.alert('Are you sure you want to refund this theme?', 'If applied to your profile page or posts, it will be removed from there as well', [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Yes', onPress: async() => await fetch(`${BACKEND_URL}/api/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({chargeId: item.item.chargeId, stripeAccount: item.item.metadata.user})
    })
    .then(response => response.json())
    .then(responseData => {
      // Handle the response from the server
      //console.log(responseData);
      async() => await updateDoc(doc(db, 'profiles', user.uid), {
            background: null
        }).then(async() => (await getDocs(query(collection(db, 'posts'), where('userId', '==', name)))).forEach(async(document) => {
            await updateDoc(doc(db, 'posts', document.id), {
                background: null,
            })
        })).then(async() => await deleteDoc(doc(db, 'profiles', user.uid, 'myThemes', item.item.id)))
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error(error);
    })},
    ]);
    
    //return refund
    }
    //console.log(myThemes)
   //console.log(purchasedThemes)
   async function removeSearch(item) {
    console.log(item)
      await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', item.searchId)).then(() => setTempSearches(tempSearches.filter((e) => e.id !== item.id)))
      

    //
    //console.log(item.id)
  }
  const renderPurchase = (item) => {
    return (
      <View style={[styles.themeContainer, {borderColor: theme.color}]}>
        <TouchableOpacity onPress={item.item.price > 0 ? () => navigation.navigate('SpecificTheme', {chargeId: item.item.chargeId, bought: item.item.bought, id: item.item.productId, metadata: item.item.metadata, theme: item.item.images[0], name: item.item.name, description: item.item.description, free: false, purchased: true}) 
      : () => navigation.navigate('SpecificTheme', {id: item.item.productId, productId: item.item.productId, metadata: {userId: user.uid}, theme: item.item.images[0], name: item.item.name, description: item.item.description, free: true, purchased: false})} >
          <FastImage source={item ? {uri: item.item.images[0]} : null} style={{height: 190, width: '100%', marginBottom: 7.5}} />
        </TouchableOpacity> 
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={[styles.nameText, {width: '90%', color: theme.color}]} numberOfLines={1}>{item.item.name}</Text>
          <TouchableOpacity onPress={() => itemPurchaseToTransparent(item)}>
            <Entypo name="dots-three-vertical" style={{alignSelf: 'center'}} size={17.5} color={theme.color}/>
          </TouchableOpacity>
          
        </View>
        {item.item.transparent ? 
        <View style={styles.overlay}>
          <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}} onPress={() => {itemPurchaseNotToTransparent(item); setChosenTheme(null)}}>
            <Text style={[styles.closeText]}>Close</Text>
            <MaterialCommunityIcons name='close' size={30} color={"#fff"}/>
          </TouchableOpacity>
          <View style={{alignItems: 'center', marginTop: '10%'}}>
              <TouchableOpacity style={[styles.applyContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => {setChosenTheme(item); setUseThemeModal(true)}}>
                <Text style={[styles.applyText, {color: theme.color}]}>Use Theme</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.applyContainer, {backgroundColor: theme.backgroundColor}]} onPress={groupId ? () => navigation.navigate('GroupChannels', {id: groupId, name: name, sending: true, theme: item.item, group: group}) 
              :() => navigation.navigate('SendingModal', {payload: item.item, payloadUsername: null, video: false, theme: true})}>
                <Text style={[styles.applyText, {color: theme.color}]}>Share Theme</Text>
              </TouchableOpacity>
            </View>
        </View>
      : null
      }
        
      </View>
    )
  }
  //console.log(loading)
  const renderSpecific = (item) => {
    //console.log(item)
    //console.log(item.item.images[0])
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
    <View style={!loading && chosenTheme == null ? [styles.container, {backgroundColor: theme.backgroundColor}] : chosenTheme != null ? [styles.container, {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)'}] : [styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={{backgroundColor: theme.backgroundColor}}>
        <ThemeHeader video={false} text={searching ? 'Search Themes' : name != null ? `${name} Themes` : get ? 'Get Themes' : goToMy || my ?  'My Themes' : goToPurchased ||  purchased ? 'Collected Themes' : 'Get Themes'}
        backButton={goToMy || name != null ? true: false}/>
        
                  </View>
     <Divider borderBottomWidth={0.4} style={{borderColor: theme.color}}/>
     <View style={{marginLeft: '5%', marginRight: '5%'}}>
      <Modal visible={registrationModal} animationType='slide' transparent onRequestClose={() => setRegistrationModal(false)}>
        <View style={[styles.modalContainer, styles.overlay]}>
          <View style={[styles.modalView, {height: '75%'}]}>
            <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}} onPress={() => {setRegistrationModal(false);}}>
              <Text style={[styles.closeText]}>Close</Text>
              <MaterialCommunityIcons name='close' size={30} color={"#fff"}/>
            </TouchableOpacity>
            <Text style={[styles.registrationText, {color: theme.color}]}>This is where you can get themes to put on your posts and your profile to showcase more of who you are!</Text>
            <Text style={[styles.registrationText, {color: theme.color}]}>Themes are able to be collected for free from both NuCliq and other users on NuCliq</Text>
            <Text style={[styles.registrationText, {color: theme.color}]}>You can also share these themes at any time with any of your fellow Cliquers</Text>
            <Text style={[styles.registrationText, {color: theme.color}]}>Example Themes: </Text>
            {/* {completeThemes.length > 0 ? 
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: '5%'}}>

              <FastImage source={{uri: completeThemes[0].images[0]}} style={{width: 150, height: 200, borderRadius: 8}}/>
              <FastImage source={{uri: completeThemes[1].images[0]}} style={{width: 150, height: 200, borderRadius: 8}}/>
            </View> : null
            } */}
          </View>
        </View>
      </Modal>
      <Modal visible={useThemeModal} animationType="slide" transparent onRequestClose={() => {setUseThemeModal(false); }}>
            <View style={[styles.modalContainer, styles.overlay]}>
                <View style={styles.modalView}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={[styles.useThemeText, {color: theme.color}]}>Use Theme</Text>
                    <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}} onPress={() => {setUseThemeModal(false);}}>
                      <Text style={[styles.closeText]}>Close</Text>
                      <MaterialCommunityIcons name='close' size={30} color={theme.backgroundColor}/>
                    </TouchableOpacity>
                  </View> 
                  <Divider borderWidth={0.4}/>
                  {profileDoneApplying || postDoneApplying || bothDoneApplying ? null : <Text style={styles.questionText}>Where do you want to apply the "{chosenTheme != null ? chosenTheme.item.name : null}" theme?</Text>}
                  {useThemeModalLoading ? <View style={{marginTop: '5%'}}> 
                    <ActivityIndicator color={theme.theme == 'light' ? "#9EDAFF" : "#005278"}/> 
                    </View> : profileDoneApplying ? 
                    <View style={{marginTop: '5%'}}>
                      <Text style={styles.postText}>Your profile is now updated with this theme. You can check by going to your profile!</Text>
                    </View> : postDoneApplying ? 
                    <View style={{marginTop: '5%'}}>
                      <Text style={styles.postText}>Your posts are now updated with this theme. You can check by clicking on your posts on your profile!</Text>
                    </View> : bothDoneApplying ? 
                    <View>
                      <Text style={styles.postText}>Your profile and posts are now updated with this theme. You can check by going to your profile and clicking on your posts on your profile!</Text>
                    </View>:
                    <>
                    <RadioButtonGroup
                    containerStyle={{ marginTop: '2.5%', marginLeft: '2.5%'}}
                    selected={current}
                    onSelected={(value) => setCurrent(value)}
                    containerOptionStyle={{margin: 5, marginBottom: '5%'}}
                    radioBackground="#005278"
                    size={22.5}
                    radioStyle={{alignSelf: 'flex-start'}}
      >
                <RadioButtonItem value="Posts" label={
                <View style={{alignSelf: 'flex-end', width: '90%'}}>
                  {groupId ? <Text style={styles.postText}>My {name} Posts</Text> : 
                    <Text style={styles.postText}>My Posts</Text>}
                    
                </View>
            }/>
                <RadioButtonItem value="Profile" label={
                <View style={{alignSelf: 'flex-end'}}>
                    <Text style={styles.postText}>My Profile Page</Text>
                </View>
            }/>
            <RadioButtonItem value="Both" label={
                <View style={{alignSelf: 'flex-end',}}>
                    <Text style={styles.postText}>Both</Text>
                    
                </View>
            }/>
              </RadioButtonGroup>
                    </>}
                   
              <View style={{alignItems: 'flex-end', flex: 1, justifyContent: 'flex-end'}}> 
              {applyLoading ? <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> : 
                <NextButton text={profileDoneApplying || postDoneApplying || bothDoneApplying ? "OK" : "CONTINUE"} button={{width: '45%'}} onPress={profileDoneApplying || postDoneApplying || bothDoneApplying ? () => {setUseThemeModal(false); setProfileDoneApplying(false); setBothDoneApplying(false); setPostDoneApplying(false)} : current == 'Posts' ? () => applyToPosts() : current == 'Profile' ? () => applyToProfile()
                : current == 'Both' ? () => applyToBoth() : null}/>
          }
              </View>
                </View>
            </View>
        </Modal>
        <Modal visible={isFirstTime} transparent animationType='slide' onRequestClose={() => {setIsFirstTime(!isFirstTime); }}>
          <View style={[styles.modalContainer, styles.overlay, {alignItems: 'center', justifyContent: 'center'}]}>
            <View style={[styles.modalView, {height: 265, width: '90%', borderRadius: 20, backgroundColor: theme.backgroundColor}]}>
                <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', marginRight: '-3.5%', marginVertical: 5}} onPress={() => {skipWalkthrough()}}>
                  <Text style={{fontFamily: 'Montserrat_400Regular', fontSize: 15.36, color: theme.color}}>Skip</Text>
                  {/* <MaterialCommunityIcons name='close' size={20} style={{alignSelf: 'center'}}/> */}
              </TouchableOpacity>
              <Text style={{fontFamily: 'Montserrat_700Bold', fontSize: 19.20, marginRight: '5%', paddingBottom: 10, paddingTop: 0, color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}}>Themes (Backgrounds)</Text>
              <Divider style={{borderWidth: 0.5, width: '100%', marginRight: '5%', borderColor: theme.color}}/>
              <Text style={{fontFamily: 'Montserrat_500Medium', fontSize: 15.36, paddingVertical: 10, marginRight: '5%', color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}}>Welcome, this is the Theme page of NuCliq where you can create your own theme, get themes, and apply your themes to your profile page and posts within the NuCliq app!</Text>
              <View style={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', marginRight: '5%'}}>
             {/*  <View style={{ marginTop: '2.5%'}}>
                 <MainButton text={"BACK"} onPress={() => {setIsFirstTime(true); navigation.navigate('New Post', {screen: 'NewPost', params: {group: null, groupId: null, postArray: [], firstTime: true}})}}/>
              </View>   */}           
              <View style={{marginLeft: '2.5%', marginTop: '2.5%'}}>
                <NextButton text={"NEXT"} onPress={() => {setIsFirstTime(false); navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})}}/>
              </View>
            </View>
            </View>
          </View>
        </Modal>
        {searching ? 
        <View style={{marginTop: '10%'}}>
          <View style={{marginLeft: 0, marginBottom: '5%'}}>
            <TouchableOpacity activeOpacity={1} style={{ marginTop: '-2.5%', zIndex: 0}}>
                  <View style={{flexDirection: 'row'}}>
                  <SearchInput autoFocus={true} value={specificSearch} icon={'magnify'} placeholder={get ? 'Search Themes to Buy' : free ? 'Search Themes to Get' : my ? 'Search My Themes' : purchased ? 'Search Collected Themes' 
                  : null} onFocus={() => {setRecentSearches(true); setSearching(true)}} iconStyle={styles.postIcon}
                  containerStyle={{borderWidth: 1, borderColor: theme.color, width: '85%'}} onSubmitEditing={() => {setRecentSearches(false) }} text={searching ? true : false} onChangeText={setSpecificSearch} 
                  onPress={() => {setSpecificSearch(''); setRecentSearches(true); setSearching(true)}}/>
                  {<MaterialCommunityIcons name='close' size={40} color={theme.color} style={styles.closeChatIcon} onPress={() => { setRecentSearches(false); setSearching(false); Keyboard.dismiss(); setFiltered([]); setSpecificSearch('')}}/>}
                  </View>
                  <View style={!moreResultButton ? {height: '100%'} : {}}>
                  {searching && filtered.length == 0 && specificSearch.length > 0 ?
                  <View>
                    <Text style={{fontFamily: 'Montserrat_500Medium', color: theme.theme != 'light' ? "#9EDAFF" : "#005278", fontSize: 15.36, paddingHorizontal: 10, textAlign: 'center', marginRight: '5%', marginTop: '5%'}}>No Search Results</Text>
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
                    get={get} free={free} my={my} purchased={purchased} extraStyling={{width: '100%'}}
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
                    <Text style={{paddingTop: 5, color: theme.theme != 'light' ? "#9EDAFF" : "#005278", fontFamily: 'Montserrat_400Regular'}}>See more results</Text>
                    </TouchableOpacity> : null}
                  </View> : <></>}
                  {
                    recentSearches && searching ?
                    <RecentSearches data={tempSearches.filter((obj, index, self) => index === self.findIndex((o) => o.searchId === obj.searchId)).reverse()} 
                    get={get} free={free} my={my} purchased={purchased} extraStyling={{width: '100%'}}
                    renderSearches={renderRecentThemes}/> : null
                  }
                  </View>
                  
                  
              </TouchableOpacity>
              
          </View>
        {/* <SearchBar isSearching={handleSearchCallback} recentSearch={handleRecentSearchCallback} searchTerm={handleSearchTermCallback} themeSearch={my ? 'Search my themes' : purchased ? 'Search purchased themes' : 'Search themes to buy'} 
        searches={tempSearches} theme={true} my={my} get={get} purchased={purchased} free={free} themeNames={themeSearches ? Array.from(new Set(themeSearches.map(JSON.stringify))).map(JSON.parse) : []} filteredGroup={handleGroupCallback} /> */}
        </View> 
        : null}
      {!searching ? 
      <>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
      <View style={styles.titleContainer}>
          <TouchableOpacity style={[styles.logInButton, {backgroundColor: theme.theme != 'light' ? "#9EDAFF" : "#005278", borderColor: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]} onPress={() => navigation.navigate('CreateTheme', {avatar: false})}>
            <MaterialCommunityIcons name='plus' size={20} color={theme.backgroundColor} style={{alignSelf: 'center', paddingLeft: 10}}/>
            <Text style={[styles.alreadyText, {color: theme.backgroundColor}]}>{"Create Theme"}</Text>
        </TouchableOpacity>
         
      </View>
      <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={() => {setSearching(true); setFiltered([]); setSpecificSearch('')}} style={{alignSelf: 'center', paddingRight: 10}}>
              <Ionicons name='search' size={30} color={theme.color} />
          </TouchableOpacity>
          <Menu 
            visible={sortVisible}
            onDismiss={closeSortMenu}
            contentStyle={{backgroundColor: theme.backgroundColor, borderWidth: 1, borderColor: "#71797E"}}
            anchor={<MaterialCommunityIcons name='sort-variant' size={45} color={theme.color} style={{alignSelf: 'center'}} onPress={openSortMenu}/>}>
              {!purchased && !my ? <>
              <Menu.Item onPress={() => {setSortIncreasingDate(false); setSortDecreasingDate(false); setIncreasingPrice(false); setDecreasingPrice(false); setMostPopular(true)}} title="Most Popular" titleStyle={!sortIncreasingDate && !sortDecreasingDate && !sortIncreasingPrice && !sortDecreasingPrice ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278", fontFamily: 'Montserrat_700Bold'} : {color: theme.color}}/> 
            <Divider /> 
              </> : null}
            
            <Menu.Item onPress={() => {setSortIncreasingDate(true); setSortDecreasingDate(false); setIncreasingPrice(false); setDecreasingPrice(false); setMostPopular(false)}} title="Newest" titleStyle={sortIncreasingDate ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278", fontFamily: 'Montserrat_700Bold'} : {color: theme.color}}/> 
            <Divider />    
            <Menu.Item onPress={() => {setSortDecreasingDate(true); setSortIncreasingDate(false); setIncreasingPrice(false); setDecreasingPrice(false); setMostPopular(false)}} title="Oldest" titleStyle={sortDecreasingDate ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278", fontFamily: 'Montserrat_700Bold'} : {color: theme.color}}/>
            {free ? null : <>
            <Divider />    
            <Menu.Item onPress={() => {setSortDecreasingDate(false); setSortIncreasingDate(false); setIncreasingPrice(true); setDecreasingPrice(false); setMostPopular(false)}} title="Price ↑" titleStyle={sortIncreasingPrice ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278", fontFamily: 'Montserrat_700Bold'} : {color: theme.color}}/>   
            <Divider />    
            <Menu.Item onPress={() => {setSortDecreasingDate(false); setSortIncreasingDate(false); setIncreasingPrice(false); setDecreasingPrice(true); setMostPopular(false)}} title="Price ↓" titleStyle={sortDecreasingPrice ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278", fontFamily: 'Montserrat_700Bold'} : {color: theme.color}}/>   
            </>
            }
            

          </Menu>
          </View>
          </View>

      <View style={{flexDirection: 'row', marginTop: '2.5%', justifyContent: 'space-between'}}>
       {/*  <TouchableOpacity style={get && !filteredGroup ? [styles.buttons, {backgroundColor: theme.color, borderColor: theme.color}] : [styles.buttons, {borderColor: theme.color, backgroundColor: theme.backgroundColor,}]} onPress={() => {setMy(false); setGet(true); setPurchased(false); setFilteredGroup(null); setFree(false); setTempSearches([]); setSpecificSearch(''); setFiltered([])}}>
          <Text style={get && !filteredGroup ? [styles.buttonText, {color: theme.backgroundColor}] : [styles.buttonText, {color: theme.color}]}>Buy</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={free && !filteredGroup ? [styles.buttons, {backgroundColor: theme.color, borderColor: theme.color}] : [styles.buttons, {borderColor: theme.color, backgroundColor: theme.backgroundColor,}]} onPress={() => {setFree(true); setMy(false); setPurchased(false);  setFilteredGroup(null); setGet(false); setTempSearches([]); setSpecificSearch(''); setFiltered([])}}>
          <Text style={free  && !filteredGroup ? [styles.buttonText, {color: theme.backgroundColor}] : [styles.buttonText, {color: theme.color}]}>Get Themes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={my && !filteredGroup ? [styles.buttons, {backgroundColor: theme.color, borderColor: theme.color}] : [styles.buttons, {borderColor: theme.color, backgroundColor: theme.backgroundColor,}]} onPress={() => {setFree(false); setMy(true); setPurchased(false);  setFilteredGroup(null); setGet(false); setTempSearches([]); setSpecificSearch(''); setFiltered([])}}>
          <Text style={my  && !filteredGroup ? [styles.buttonText, {color: theme.backgroundColor}] : [styles.buttonText, {color: theme.color}]}>My Themes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={purchased && !filteredGroup ? [styles.buttons, {backgroundColor: theme.color, borderColor: theme.color}] : [styles.buttons, {borderColor: theme.color, backgroundColor: theme.backgroundColor,}]} onPress={() => {setPurchased(true); setMy(false); setFree(false); setFilteredGroup(null); setGet(false); setTempSearches([]); setSpecificSearch(''); setFiltered([])}}>
          <Text style={purchased && !filteredGroup ? [styles.buttonText, {color: theme.backgroundColor}] : [styles.buttonText, {color: theme.color}]}>Collected</Text>
        </TouchableOpacity>
        
      </View>
      <View style={styles.main}>
        {filteredGroup != null ? 
            renderSpecific(filteredGroup)
          : 
          get == true && name == null && tempPosts.length > 0 ? <FlatList 
            data={tempPosts}
            renderItem={renderAll}
            numColumns={2}
            keyExtractor={(item) => item.id}
            style={{ height: '130%'}}
            ListFooterComponent={
            loading ? (
              <View style={{ alignItems: 'center', paddingBottom: 140}}> 
                <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
              </View>
            ) : (
              <View style={{ paddingBottom: 140 }} /> 
            )
          }
            onScroll={handleScroll}
          /> :
          free && freeTempPosts.length > 0
          ? 
          <FlatList 
          data={freeTempPosts}
            renderItem={renderAll}
            numColumns={2}
            keyExtractor={(item) => item.id}
            style={{ height: '130%'}}
            extraData={loading}
            ListFooterComponent={loading ? <View style={{ alignItems: 'center', paddingBottom: 140}}> 
                <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
              </View> : <View style={{paddingBottom: 140}}/>
          }
            //ListFooterComponent={<View style={{paddingBottom: 140}}/>}
            onScroll={handleScroll}
          />
          : my && myThemes.length > 0 ? 
          <FlatList 
              data={myThemes}
            renderItem={renderMy}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            ListFooterComponent={loading ? <View style={{ alignItems: 'center', paddingBottom: 140}}> 
                <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
              </View> : <View style={{paddingBottom: 140}}/>
          }
            style={{height: '130%'}}
            onScroll={handleScroll}
          />
          : purchased && purchasedThemes.length > 0 ?
          <>
          <FlatList 
              data={purchasedThemes}
            renderItem={renderPurchase}
            numColumns={2}
            ListFooterComponent={loading ? <View style={{ alignItems: 'center', paddingBottom: 140}}> 
                <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
              </View> : <View style={{paddingBottom: 140}}/>
          }
            keyExtractor={(item) => item.id}
            style={{height: '130%'}}
            onScroll={handleScroll}
          />
          
          </>
          : loading ? <View style={{alignItems: 'center', flex: 1, backgroundColor: theme.backgroundColor, justifyContent: 'flex-end'}}>
            <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
          </View> : <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            {purchased ? <Text style={[styles.noThemesText, {color: theme.color}]}>Sorry you have no Purchased Themes!</Text> : my ? <Text style={[styles.noThemesText, {color: theme.color}]}>Sorry you have no themes created right now!</Text> :
            free ? <Text style={[styles.noThemesText, {color: theme.color}]}>Sorry no Themes to Get Right Now!</Text> : <Text style={[styles.noThemesText, {color: theme.color}]}>Sorry no Themes to Get Right Now!</Text>}
            
          </View>}
      </View>
      </>
       : null}
      {/* {loading && lastVisible ? <View style={{alignItems: 'center', flex: 1, backgroundColor: theme.backgroundColor, justifyContent: 'flex-end', marginBottom: '5%'}}>
            <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} /> 
          </View> : null
          } */}
      </View>
      
    </View>
    </Provider>
  )
}

export default All

const styles = StyleSheet.create({
    container: {
      flex: 1,
      
    },
    main: {
      //marginHorizontal: '5%',
      marginLeft: -10,
      marginRight: -10,
      flexDirection: 'row',
      //flex: 1,
      marginTop: '5%',
      //backgroundColor: "red"
      height: '75%'
    },
    nameText: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      textAlign: 'left',
      paddingBottom: 5
    },
    header: {
        fontSize: 24,
        textAlign: 'center',
        fontFamily: 'Montserrat_400Regular',
        color: "#005278",
        padding: 10,
        paddingLeft: 0,
        marginTop: 8,
        alignSelf: 'center',
        //width: '70%'
    },
  categories: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    width: '80%',
    padding: 10
  },
  registrationText: {
    fontSize: 19.20,
    fontFamily: 'Montserrat_500Medium',
    padding: 10
  },
  recentCategoriesContainer: {
    backgroundColor: "#d4d4d4",
    flexDirection: 'row',
    width: '100%',
    marginTop: '5%',
    justifyContent: 'space-between'
  },
  recentCategories: {
    fontSize: 15.36,
    padding: 5,
    //backgroundColor: "#d4d4d4",
    fontFamily: 'Montserrat_700Bold',
    //width: '95%',
    //marginTop: '5%'
  },
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
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //width: '90%',
    marginTop: '2.5%',
    alignItems: 'center',
    
  },
  noThemesText: {
      fontSize: 24,
      fontFamily: 'Montserrat_500Medium',
      padding: 10,
      textAlign: 'center'
  },
  logInButton: {
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#005278',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#005278'
    },
    alreadyText: {
        fontSize: 15.36,
        padding: 12,
        fontFamily: 'Montserrat_500Medium',
        color: "#fafafa",
        //paddingLeft: 35,
        paddingLeft: 5,
        paddingRight: 15,
        textAlign: 'center'
    },
    buttons: {
      borderRadius: 5,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    buttonText: {
      fontSize: 15.36,
      padding: 10,
      fontFamily: 'Montserrat_600SemiBold',
    },
    themeContainer: {
      borderWidth: 1,
      marginHorizontal: 10,
      padding: 5,
      marginBottom: 20,
      width: '44.5%', 
      justifyContent: 'center'
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
    applyContainer: {
      marginTop: '10%',
      borderRadius: 8,
      width: '80%',
      alignItems: 'center'
    },
    applyText: {
      fontSize: Dimensions.get('screen').height / 54.9,
      fontFamily: 'Montserrat_500Medium',
      padding: 7.5
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
  modalView: {
    width: '90%',
    height: '40%',
    //margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    paddingLeft: '5%',
    paddingRight: '5%',
    //paddingRight: 0,
    paddingTop: 5,
    paddingBottom: 25,

    //alignItems: 'center',
  },
  useThemeText: {
    fontSize: 15.36,
    padding: 10,
    fontFamily: 'Montserrat_700Bold',
  },
  questionText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,

  },
  postText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_600SemiBold',
    padding: 10,
    paddingTop: 0,
  },
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    closeChatIcon : {
    marginLeft: '5%'
  },
  postIcon: {position: 'absolute', left: 260, top: 8.5},
})