import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity , FlatList} from 'react-native'
import React, { useEffect, useMemo, useState, useContext } from 'react'
import { Divider } from 'react-native-paper';
import { onSnapshot, collection, query, orderBy, limit, startAfter, where, startAt, endAt, getDocs} from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../Hooks/useAuth';
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_400Regular} from '@expo-google-fonts/montserrat';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import _ from 'lodash';
import SearchInput from '../Components/SearchInput';
import ThemeHeader from '../Components/ThemeHeader';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import themeContext from '../lib/themeContext';
const TransactionHistory = () => {
  const {user} = useAuth();
  const [lastVisible, setLastVisible] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(true);
  const navigation = useNavigation();
  const theme = useContext(themeContext)
  const [descendingDate, setDescendingDate] = useState(true);
  const [sellingSearches, setSellingSearches] = useState([]);
  const [ascendingDate, setAscendingDate] = useState(false);
  const [themeSearches, setThemeSearches] = useState([]);
  const [specificSearch, setSpecificSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [filteredGroup, setFilteredGroup] = useState([]);
      const [moreResultButton, setMoreResultButton] = useState(false);
    const [moreResults, setMoreResults] = useState(false);
  useEffect(() => {
    if (themeSearches.length > 0) {
      if (specificSearch.length > 0) {
      setMoreResultButton(false)
      setMoreResults(false)
      const temp = specificSearch.toLowerCase()
      //console.log(temp)
      const tempList = Array.from(new Set(themeSearches.map(JSON.stringify))).map(JSON.parse).filter(item => {
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
    }
    else if (sellingSearches.length > 0) {
      if (specificSearch.length > 0) {
      setMoreResultButton(false)
      setMoreResults(false)
      const temp = specificSearch.toLowerCase()
      //console.log(temp)
      const tempList = Array.from(new Set(sellingSearches.map(JSON.stringify))).map(JSON.parse).filter(item => {
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
    }
   }, [themeSearches, sellingSearches])
   useMemo(() => {
    if (specificSearch.length > 0 && purchased) {
      setThemeSearches([])
      const getData = async() => {
        const q = query(collection(db, 'profiles', user.uid, 'purchased'), orderBy('name'), startAt(specificSearch), endAt(specificSearch + '\uf8ff'));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          setThemeSearches(prevState => [...prevState, {id: doc.id, ...doc.data()}])
        });
      }
      getData();
    }
    else if (specificSearch.length > 0 && !purchased) {
      setSellingSearches([])
      const getData = async() => {
        const q = query(collection(db, 'profiles', user.uid, 'sold'), orderBy('name'), startAt(specificSearch), endAt(specificSearch + '\uf8ff'));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          setSellingSearches(prevState => [...prevState, {id: doc.id, ...doc.data()}])
        });
      }
      getData();
    } 
   }, [specificSearch, purchased])
  useEffect(() => {
    if (descendingDate && purchased) {
      setPosts([]);
      setLoading(true)
      let unsub;
          const getSaves = async() => {
            unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased'), where('price', '>', 0), orderBy('timestamp', 'desc'), limit(3)), (snapshot) => {
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              snapshot.docs.map(async(document) => {
                setPosts(prevState => [...prevState, {id: document.id, ...document.data()}])
              })
            })
          } 
          getSaves();
          setTimeout(() => {
            setLoading(false)
          }, 1000);
          return unsub;
    }
    else if (ascendingDate && purchased) {
      setPosts([]);
      setLoading(true)
      let unsub;
          const getSaves = async() => {
            unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased'), where('price', '>', 0), orderBy('timestamp', 'asc'), limit(3)), (snapshot) => {
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              snapshot.docs.map(async(document) => {
                setPosts(prevState => [...prevState, {id: document.id, ...document.data()}])
              })
            })
          } 
          getSaves();
          setTimeout(() => {
            setLoading(false)
          }, 1000);
          return unsub;
    }
    else if (descendingDate && !purchased) {
      setPosts([]);
      setLoading(true)
      let unsub;
          const getSaves = async() => {
            unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'sold'), where('price', '>', 0), orderBy('timestamp', 'desc'), limit(3)), (snapshot) => {
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              snapshot.docs.map(async(document) => {
                setPosts(prevState => [...prevState, {id: document.id, ...document.data()}])
              })
            })
          } 
          getSaves();
          setTimeout(() => {
            setLoading(false)
          }, 1000);
          return unsub;
    }
    else if (ascendingDate && !purchased) {
      setPosts([])
      setLoading(true)
      let unsub;
          const getSaves = async() => {
            unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'sold'), where('price', '>', 0), orderBy('timestamp', 'asc'), limit(3)), (snapshot) => {
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              snapshot.docs.map(async(document) => {
                setPosts(prevState => [...prevState, {id: document.id, ...document.data()}])
              })
            })
          } 
          getSaves();
          setTimeout(() => {
            setLoading(false)
          }, 1000);
          return unsub;
    }
      
    }, [descendingDate, ascendingDate, purchased])
  function convertTimestampToDate(timestampObject) {
  // Extract seconds and nanoseconds from the object
  const seconds = timestampObject.seconds;
  const nanoseconds = timestampObject.nanoseconds;

  // Create a new Date object from the seconds
  const date = new Date(seconds * 1000);

  // Add milliseconds from nanoseconds (divide by 1 million for conversion)
  date.setMilliseconds(nanoseconds / 1000000);

  // Format the date using desired format options (optional)
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };

  return date.toLocaleDateString('en-US', options); // Adjust options for formatting
}
const renderThemes = ({item}) => {
    //console.log(item)
    return (
        <TouchableOpacity style={[styles.categoriesContainer, {width: '100%', backgroundColor: theme.backgroundColor}]} onPress={() => {setFilteredGroup([item]); setSearching(false)}}>
            <FastImage source={{uri: item.images[0]}} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: theme.color}]}>{item.name}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center', marginLeft: 'auto'}} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
        </TouchableOpacity>
    )
  }
  const renderHistory = ({item, index}) => {
      //console.log(item)

      return (
        <View style={index == 0 ? {backgroundColor: "#d3d3d3", marginRight: '5%', borderWidth: 1, marginLeft: '5%', borderColor: theme.color} : {backgroundColor: "#d3d3d3", marginRight: '5%', borderWidth: 1, marginLeft: '5%', borderColor: theme.color, marginTop: '5%'}}>
                {/* <Text style={[styles.dataReceiptText, {width: '100%'}]}>Transaction ID: 123456789</Text>
                <Divider borderBottomWidth={1} borderColor={theme.color}/> */}
                <View style={{backgroundColor: theme.backgroundColor}}>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText, {color: theme.color}]}>Transaction Date:</Text>
                      <Text style={[styles.dataReceiptText, {color: theme.color}]}>{convertTimestampToDate(item.timestamp)}</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText, {paddingTop: 0, color: theme.color}]}>Purchased Item:</Text>
                      <Text numberOfLines={2} style={[styles.dataReceiptText, {paddingTop: 0, color: theme.color}]}>{item.name} Theme</Text>
                  </View>
                  </View>
                  <View style={{backgroundColor: "#e8e8e8"}}>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText]}>Item Price:</Text>
                      <Text style={[styles.dataReceiptText]}>${(item.price / 100).toFixed(2)}</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText, {paddingTop: 0}]}>Tax:</Text>
                      <Text style={[styles.dataReceiptText, {paddingTop: 0}]}>${((item.price * 0.06) / 100).toFixed(2)} (6%)</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText, {paddingTop: 0}]}>Processing Fee:</Text>
                      <Text style={[styles.dataReceiptText, {paddingTop: 0}]}>${(((item.price * 0.03) / 100) + 0.3).toFixed(2)} (3% + 30&#162;)</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText, {paddingTop: 0}]}>Total Amount:</Text>
                      <Text style={[styles.dataReceiptText, {paddingTop: 0}]}>${((item.price / 100) + ((item.price * 0.06) / 100)+ ((item.price * 0.03) / 100) + 0.3).toFixed(2)}</Text>
                  </View>
                  </View>
                  {purchased ? null : 
                  <>
                  <View style={{backgroundColor: "#d3d3d3", borderTopWidth: 1, borderBottomWidth: 1}}>
                    <Text style={[styles.dataReceiptText, { width: '100%'}]}>Transaction Summary</Text>
                  </View>
                  <View style={{backgroundColor: theme.backgroundColor}}>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText, {color: theme.color}]}>Item Price:</Text>
                      <Text style={[styles.dataReceiptText, {color: theme.color}]}>${(item.price / 100).toFixed(2)}</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText, {paddingTop: 0, color: theme.color}]}>NuCliq Fee:</Text>
                      <Text style={[styles.dataReceiptText, {paddingTop: 0, color: theme.color}]}>${(item.price * 0.3 / 100).toFixed(2)} (30%)</Text>
                  </View>
                  <Divider borderBottomWidth={1} borderColor={theme.color}/>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText, {color: theme.color}]}>$$$ Paid to You:</Text>
                      <Text style={[styles.dataReceiptText, {color: theme.color}]}>${(item.price / 100 - (item.price * 0.3 / 100)).toFixed(2)}</Text>
                  </View>
                  </View>
                  </>}
              </View>
    ) 
                
    }
    const handleScroll = _.debounce((event) => {
    // Your logic for fetching more data
    fetchMoreData()
  }, 500);
  function fetchMoreData() {
    if (lastVisible != undefined && purchased && descendingDate) {
          setLoading(true)
        let unsub;
           const getLikes = () => {
            unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased'), where('price', '>', 0), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(3)), (snapshot) => {
            //unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'likes'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(3)), (snapshot) => {
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              snapshot.docs.map(async(document) => {
                setPosts(prevState => [...prevState, {id: document.id, ...document.data()}])
              })
            })
          } 
          //console.log(tempPosts)
          getLikes();
          setTimeout(() => {
                    setLoading(false)
                  }, 1000);
          return unsub;
        }
    else if (lastVisible != undefined && purchased && ascendingDate) {
          setLoading(true)
        let unsub;
           const getLikes = () => {
            unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased'), where('price', '>', 0), orderBy('timestamp', 'asc'), startAfter(lastVisible), limit(3)), (snapshot) => {
            //unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'likes'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(3)), (snapshot) => {
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              snapshot.docs.map(async(document) => {
                setPosts(prevState => [...prevState, {id: document.id, ...document.data()}])
              })
            })
          } 
          //console.log(tempPosts)
          getLikes();
          setTimeout(() => {
                    setLoading(false)
                  }, 1000);
          return unsub;
        }
        else if (lastVisible != undefined && !purchased && ascendingDate) {
          setLoading(true)
        let unsub;
           const getLikes = () => {
            unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'myThemes'), where('forSale', '==', true), where('price', '>', 0), orderBy('timestamp', 'asc'), startAfter(lastVisible), limit(3)), (snapshot) => {
            //unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'likes'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(3)), (snapshot) => {
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              snapshot.docs.map(async(document) => {
                setPosts(prevState => [...prevState, {id: document.id, ...document.data()}])
              })
            })
          } 
          //console.log(tempPosts)
          getLikes();
          setTimeout(() => {
                    setLoading(false)
                  }, 1000);
          return unsub;
        }
        else if (lastVisible != undefined && !purchased && descendingDate) {
          setLoading(true)
        let unsub;
           const getLikes = () => {
            unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'myThemes'), where('forSale', '==', true), where('price', '>', 0), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(3)), (snapshot) => {
            //unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'likes'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(3)), (snapshot) => {
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              snapshot.docs.map(async(document) => {
                setPosts(prevState => [...prevState, {id: document.id, ...document.data()}])
              })
            })
          } 
          //console.log(tempPosts)
          getLikes();
          setTimeout(() => {
                    setLoading(false)
                  }, 1000);
          return unsub;
        }
  }
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_400Regular
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      {loading && !lastVisible && posts.length == 0 ?  <View style={{flex: 1, alignItems: 'center', justifyContent:'center'}}>
        <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View> :
        <>
          <View style={{flexDirection: 'row', paddingBottom: 5, backgroundColor: theme.backgroundColor, borderBottomWidth: 1, borderColor: theme.color}}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{alignSelf: 'center', marginTop: 40, marginRight: '7.5%'}}>
          <MaterialCommunityIcons name='chevron-left' size={35} color={theme.color}/>  
        </TouchableOpacity>
          <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginTop: '10%', marginRight: '5%'}}>
          {
            purchased ?
                  <>
                  <TouchableOpacity style={{alignSelf: 'center'}} onPress={() => {setPurchased(true)}}>
            <Text style={[styles.messageText, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Purchased</Text>
            
          </TouchableOpacity>
        
        <View style={{width: 1, height: '60%', backgroundColor: theme.color, alignSelf: 'center', marginLeft: 20, marginRight: 20}}/>
        <TouchableOpacity style={{alignSelf: 'center'}} onPress={() => {setPurchased(false)}}>
          <Text style={[styles.messageText, {color: theme.color}]}>Sold Themes</Text>

        </TouchableOpacity> 
       
        </>
        :
        <>
        <TouchableOpacity style={{alignSelf: 'center'}} onPress={() => {setPurchased(true)}}>
            <Text style={[styles.messageText, {color: theme.color}]}>Purchased</Text>

          </TouchableOpacity>
        
        <View style={{width: 1, height: '60%', backgroundColor: "#000", alignSelf: 'center', marginLeft: 20, marginRight: 20}}/>
        <TouchableOpacity style={{alignSelf: 'center'}} onPress={() => {setPurchased(false)}}>
          <Text style={[styles.messageText, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Sold Themes</Text>
        </TouchableOpacity>
        </>}
          
        </View>
        </View>
       {!loading && posts.length == 0 ?
      <>
      <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
      <Text style={[styles.headerText, {color: theme.color}]}>No Transaction History Yet!</Text> 
      <MaterialCommunityIcons name='emoticon-sad-outline' color={theme.color} size={50} style={{alignSelf: 'center', marginTop: '5%'}}/>
      </View> 
      </> : <>
            <TouchableOpacity activeOpacity={1} style={{width: '90%', marginTop: '5%', zIndex: 0, marginHorizontal: '5%'}}>

                  <SearchInput autoFocus={false} value={specificSearch} icon={'magnify'} placeholder={'Search'} onFocus={() => {setSearching(true)}} iconStyle={styles.homeIcon}
                  containerStyle={{borderWidth: 1, width: '100%', borderColor: theme.color}} text={searching ? true : false} onChangeText={setSpecificSearch} 
                  onPress={() => {setSearching(true); setSpecificSearch('');}}/>
                  <View>
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
                      contentContainerStyle={{flexGrow: 1}}
                      //contentContainerStyle={{width: '100%', zIndex: 3, flewGrow: 1}}
                      scrollEnabled={moreResultButton ? false: true}
                  /> 
                  
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
                  <TouchableOpacity style={{alignItems: 'center', marginRight: '5%'}} onPress={() => { setMoreResults(true); setMoreResultButton(false);}}>
                    <Text style={{paddingTop: 5, color: theme.theme != 'light' ? "#9EDAFF" : "#005278", fontFamily: 'Montserrat_400Regular'}}>See more results</Text>
                    </TouchableOpacity> : null}
                  </View> : <></>}
                  
                  </View>
                  
                  
              </TouchableOpacity>
              <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginHorizontal: '2.5%', marginTop: '2.5%'}}>
                {/* <TouchableOpacity onPress={() => {}} style={styles.buttons}>
                    <Text style={styles.buttonText}>Theme Name</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {}} style={styles.buttons}>
                    <Text style={styles.buttonText}>Username</Text>
                </TouchableOpacity> */}
                <TouchableOpacity style={descendingDate ? [styles.buttons, {borderColor: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]: [styles.buttons, {borderColor: theme.color}]} onPress={descendingDate ? null : () => {setDescendingDate(true); setAscendingDate(false)}}>
                  <Text style={descendingDate ? [styles.buttonText, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]: [styles.buttonText, {color: theme.color}]}>Date ↓</Text>
              </TouchableOpacity>
                <TouchableOpacity style={ascendingDate ? [styles.buttons, {borderColor: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]: [styles.buttons, {borderColor: theme.color}]} onPress={ascendingDate ? null : () => {setAscendingDate(true); setDescendingDate(false)}}>
                  <Text style={ascendingDate ? [styles.buttonText, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]: [styles.buttonText, { color: theme.color}]}>Date ↑</Text>
              </TouchableOpacity>
              </View>
      
      <FlatList 
      data={filteredGroup.length > 0 ? filteredGroup : posts}
      renderItem={renderHistory}
      keyExtractor={(item) =>item.id.toString()}
      numColumns={1}
      scrollEnabled
      style={{margin: '5%'}}
      //contentContainerStyle={{height: '120%'}}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      />
      </>
      }
      </>}
    </View>
  )
}

export default TransactionHistory

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  receiptText: {
    padding: 10,
    paddingLeft: 10,
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    width: '50%',
    textAlign: 'right'
  },
  dataReceiptText: {
    padding: 10,
    paddingLeft: 10,
    fontSize: 15.36,
    fontFamily: 'Montserrat_600SemiBold',
    width: '50%',
    textAlign: 'left'
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
    padding: 10,
    margin: '2.5%',
    //marginTop: '8%',
    fontWeight: '700'
  },
  messageText: {
      fontSize: 19.20, 
      color: "#000", 
      alignSelf: 'center', 
      fontFamily: 'Montserrat_600SemiBold',
      padding: 7.5,
      paddingRight: 0, 
      paddingLeft: 0,
    },
    homeIcon: {position: 'absolute', left: 320, top: 8.5},
  homeContainer: {marginLeft: '5%', marginBottom: '5%'},
  closeHomeIcon: {position: 'absolute', left: 320, top: 10},
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
  buttons: {
    borderWidth: 1,
    //width: '45%',
    borderRadius: 5,
    marginTop: '2.5%'
    
  },
  buttonText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 15.36,
    textAlign: 'center',
    padding: 10
  }
})