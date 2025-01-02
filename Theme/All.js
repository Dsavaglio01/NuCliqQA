import { StyleSheet, Text, View, FlatList, TouchableOpacity, Keyboard, ActivityIndicator, Dimensions} from 'react-native'
import React, {useState, useEffect, useMemo, useCallback, useContext} from 'react'
import SearchInput from '../Components/SearchInput'
import { useNavigation } from '@react-navigation/native'
import { collection, getDoc, getDocs, onSnapshot, query, where, addDoc, limit, updateDoc, orderBy, startAfter, doc, serverTimestamp, deleteDoc, startAt, endAt } from 'firebase/firestore'
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
const All = ({route}) => {
  const {name, groupId, goToMy, registers, goToPurchased} = route.params;
  const [searching, setSearching] = useState(false);
  const [get, setGet] = useState(false);
  const [my, setMy] = useState(false);
  const [recentSearches, setRecentSearches] = useState(false);
  const {user} = useAuth()
  const [filtered, setFiltered] = useState([]);
  const [free, setFree] = useState(true);
  const [specificSearch, setSpecificSearch] = useState('');
  const [lastVisible, setLastVisible] = useState();
  const [reportedThemes, setReportedThemes] = useState([]);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [purchasedDone, setPurchasedDone] = useState(false);
  const [moreResultButton, setMoreResultButton] = useState(false);
  const [moreResults, setMoreResults] = useState(false);
  const [myLastVisible, setMyLastVisible] = useState([]);
  const [purchasedLastVisible, setPurchasedLastVisible] = useState([]);
  const [tempPosts, setTempPosts] = useState([]);
  const [freeTempPosts, setFreeTempPosts] = useState([]);
  const [purchased, setPurchased] = useState(false);
  const [myThemes, setMyThemes] = useState(null);
  const [mostPopular, setMostPopular] = useState(true);
  const theme = useContext(themeContext)
  const [purchasedThemes, setPurchasedThemes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [themeSearches, setThemeSearches] = useState([]);
  const [filteredGroup, setFilteredGroup] = useState(null);
  const navigation = useNavigation();
  const [getSearches, setGetSearches] = useState([]);
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
  const renderThemes = ({item}) => {
    //console.log(item)
    return (
        <TouchableOpacity style={[styles.categoriesContainer, {width: '100%', backgroundColor: "#121212"}]} onPress={() => {setFilteredGroup([item]); addToRecentSearches(item); setSearching(false)}}>
            <FastImage source={{uri: item.images[0]}} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: theme.color}]}>{item.name}</Text>
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
      <TouchableOpacity style={[styles.categoriesContainer, {width: '100%', backgroundColor: "#121212"}]} onPress={() => recentSearchFunction(item)}>
        <FastImage source={{uri: item.images[0]}} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: theme.color}]}>{item.name}</Text>
            <TouchableOpacity onPress={() => removeSearch(item)} style={{alignSelf: 'center', marginLeft: "auto"}}>
                <MaterialCommunityIcons name='close' size={30} color={theme.color} />
            </TouchableOpacity>
        </TouchableOpacity>
    )
  }
   async function removeSearch(item) {
    console.log(item)
      await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', item.searchId)).then(() => setTempSearches(tempSearches.filter((e) => e.id !== item.id)))
      

    //
    //console.log(item.id)
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
    <View style={styles.container}>
      <View style={{backgroundColor: "#121212"}}>
        <ThemeHeader video={false} text={searching ? 'Search Themes' : name != null ? `${name} Themes` : get ? 'Get Themes' : goToMy || my ?  'My Themes' : goToPurchased ||  purchased ? 'Collected Themes' : 'Get Themes'}
        backButton={goToMy || name != null ? true: false}/>
      </View>
     <Divider borderBottomWidth={0.4} style={{borderColor: theme.color}}/>
     <View style={styles.mainContainer}>
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
                    <Text style={{paddingTop: 5, color: "#9edaff", fontFamily: 'Montserrat_400Regular'}}>See more results</Text>
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
        </View> 
        : null}
      {!searching ? 
      <>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
      <View style={styles.titleContainer}>
          <TouchableOpacity style={[styles.logInButton, {backgroundColor: "#9edaff", borderColor: "#9edaff"}]} onPress={() => navigation.navigate('CreateTheme', {avatar: false})}>
            <MaterialCommunityIcons name='plus' size={20} color={"#121212"} style={{alignSelf: 'center', paddingLeft: 10}}/>
            <Text style={[styles.alreadyText, {color: "#121212"}]}>{"Create Theme"}</Text>
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
        <TouchableOpacity style={free && !filteredGroup ? [styles.buttons, {backgroundColor: theme.color, borderColor: theme.color}] : [styles.buttons, {borderColor: theme.color, backgroundColor: "#121212",}]} onPress={() => {setFree(true); setMy(false); setPurchased(false);  setFilteredGroup(null); setGet(false); setTempSearches([]); setSpecificSearch(''); setFiltered([])}}>
          <Text style={free  && !filteredGroup ? [styles.buttonText, {color: "#121212"}] : [styles.buttonText, {color: theme.color}]}>Get Themes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={my && !filteredGroup ? [styles.buttons, {backgroundColor: theme.color, borderColor: theme.color}] : [styles.buttons, {borderColor: theme.color, backgroundColor: "#121212",}]} onPress={() => {setFree(false); setMy(true); setPurchased(false);  setFilteredGroup(null); setGet(false); setTempSearches([]); setSpecificSearch(''); setFiltered([])}}>
          <Text style={my  && !filteredGroup ? [styles.buttonText, {color: "#121212"}] : [styles.buttonText, {color: theme.color}]}>My Themes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={purchased && !filteredGroup ? [styles.buttons, {backgroundColor: theme.color, borderColor: theme.color}] : [styles.buttons, {borderColor: theme.color, backgroundColor: "#121212",}]} onPress={() => {setPurchased(true); setMy(false); setFree(false); setFilteredGroup(null); setGet(false); setTempSearches([]); setSpecificSearch(''); setFiltered([])}}>
          <Text style={purchased && !filteredGroup ? [styles.buttonText, {color: "#121212"}] : [styles.buttonText, {color: theme.color}]}>Collected</Text>
        </TouchableOpacity>
        
      </View>
      <View style={styles.main}>
        {filteredGroup != null ? 
            renderSpecific(filteredGroup)
          : 
          get == true && name == null && tempPosts.length > 0 ? <FlatList 
            data={tempPosts}
            renderItem={<ThemeComponent free={free} get={get} purchased={purchased} my={my} user={user}
            item={item} groupId={groupId} name={name}/>}
            numColumns={2}
            keyExtractor={(item) => item.id}
            style={{ height: '130%'}}
            ListFooterComponent={
            loading ? (
              <View style={{ alignItems: 'center', paddingBottom: 140}}> 
                <ActivityIndicator color={"#9edaff"} />
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
            renderItem={<ThemeComponent free={free} get={get} purchased={purchased} my={my} user={user}
            item={item} groupId={groupId} name={name}/>}
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
            renderItem={<ThemeComponent free={free} get={get} purchased={purchased} my={my} user={user}
            item={item} groupId={groupId} name={name}/>}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            ListFooterComponent={<FooterComponent loading={loading} />
          }
            style={{height: '130%'}}
            onScroll={handleScroll}
          />
          : purchased && purchasedThemes.length > 0 ?
          <>
          <FlatList 
              data={purchasedThemes}
            renderItem={<ThemeComponent free={free} get={get} purchased={purchased} my={my} user={user}
            item={item} groupId={groupId} name={name}/>}
            numColumns={2}
            ListFooterComponent={<FooterComponent loading={loading} />
          }
            keyExtractor={(item) => item.id}
            style={{height: '130%'}}
            onScroll={handleScroll}
          />
          
          </>
          : loading ? <View style={{alignItems: 'center', flex: 1, backgroundColor: "#121212", justifyContent: 'flex-end'}}>
            <ActivityIndicator color={"#9edaff"}/> 
          </View> : <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            {purchased ? <Text style={[styles.noThemesText, {color: theme.color}]}>Sorry you have no Purchased Themes!</Text> : my ? <Text style={[styles.noThemesText, {color: theme.color}]}>Sorry you have no themes created right now!</Text> :
            free ? <Text style={[styles.noThemesText, {color: theme.color}]}>Sorry no Themes to Get Right Now!</Text> : <Text style={[styles.noThemesText, {color: theme.color}]}>Sorry no Themes to Get Right Now!</Text>}
            
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
      //marginHorizontal: '5%',
      marginLeft: -10,
      marginRight: -10,
      flexDirection: 'row',
      //flex: 1,
      marginTop: '5%',
      //backgroundColor: "red"
      height: '75%'
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
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    closeChatIcon : {
    marginLeft: '5%'
  },
  postIcon: {position: 'absolute', left: 260, top: 8.5},
})