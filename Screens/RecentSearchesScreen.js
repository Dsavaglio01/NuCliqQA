import { FlatList, StyleSheet, Text, View, TouchableOpacity, Button } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { query, collection, where, orderBy, onSnapshot, deleteDoc, doc, getDoc, getFirestore, getDocs, limit } from 'firebase/firestore';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import RegisterHeader from '../Components/RegisterHeader';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../Hooks/useAuth';
import ThemeHeader from '../Components/ThemeHeader';
import FastImage from 'react-native-fast-image';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
import { db } from '../firebase'
const RecentSearchesScreen = ({route}) => {
    const {group, theme, friend, home, ai, get, my, free, purchased} = route.params;
    const {user} = useAuth();
    const [searches, setSearches] = useState([]);
    const [tempSearches, setTempSearches] = useState([]);
    const [done, setDone] = useState(false)
    const navigation = useNavigation();
    const modeTheme = useContext(themeContext)
  
    //console.log(theme)
    //console.log(get)
    useEffect(() => {
        if (group) {
        let unsub;
        const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('group', '==', true), orderBy('timestamp', 'desc')), limit(50), (snapshot) => {
          setSearches(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
        })
      } 
      fetchCards();
      return unsub;
        }
    else if (home) {
        let unsub;
        const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('user', '==', true), orderBy('timestamp', 'desc')), limit(50), (snapshot) => {
          setSearches(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
        })
      } 
      fetchCards();
      return unsub;
    }
    else if (get) {

        let unsub;
        const fetchCards = () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('getTheme', '==', true), orderBy('timestamp', 'desc')), limit(50), (snapshot) => {
          setSearches(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
        })
      } 
      fetchCards();
      return unsub;
    }
    else if (my) {
        let unsub;
        const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('myTheme', '==', true), orderBy('timestamp', 'desc')), limit(50), (snapshot) => {
          setSearches(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
        })
      } 
      fetchCards();
      return unsub;
    }
    else if (free) {
        let unsub;
        const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('freeTheme', '==', true), orderBy('timestamp', 'desc')), limit(50), (snapshot) => {
          setSearches(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
        })
      } 
      fetchCards();
      return unsub;
    }
    else if (purchased) {
        let unsub;
        const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('purchasedTheme', '==', true), orderBy('timestamp', 'desc')), limit(50), (snapshot) => {
          setSearches(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
        })
      } 
      fetchCards();
      return unsub;
    }
    else if (friend) {
        let unsub;
        const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('friend', '==', true), orderBy('timestamp', 'desc')), (snapshot) => {
          setSearches(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
        })
      } 
      fetchCards();
      return unsub;
    }
     }, [group, home, friend, get, free, my, purchased, onSnapshot])
     //console.log(searches)
     //console.log(tempSearches)
     useEffect(() => {
      if (searches.length > 0 && home) {
        searches.map(async(item) => {
        const docSnap = await getDoc(doc(db, 'profiles', item.element.id))
        if (docSnap.exists()) {
          setTempSearches(prevState => [...prevState, {id: docSnap.id, searchId: item.id, ...docSnap.data()}])
        }
        
      })
      setTimeout(() => {
        setDone(true)
      }, 1000);
      }
      else if (searches.length > 0 && group) {
        searches.map(async(item) => {
          //console.log(item)
        const docSnap = await getDoc(doc(db, 'groups', item.element.id))
        if (docSnap.exists()) {
          setTempSearches(prevState => [...prevState, {id: docSnap.id, searchId: item.id, ...docSnap.data()}])
        }
        
      })
      setTimeout(() => {
        setDone(true)
      }, 1000);
      }
      else if (searches.length > 0 && my) {
        searches.map(async(item) => {
        const docSnap = await getDoc(doc(db, 'profiles', user.uid, 'myThemes', item.element.id))
        if (docSnap.exists()) {
          setTempSearches(prevState => [...prevState, {id: docSnap.id, searchId: item.id, ...docSnap.data()}])
        }
        
      })
      setTimeout(() => {
        setDone(true)
      }, 1000);
      }
      else if (searches.length > 0 && free) {
        searches.map(async(item) => {
        const docSnap = await getDoc(doc(db, 'freeThemes', item.element.id))
        if (docSnap.exists()) {
          setTempSearches(prevState => [...prevState, {id: docSnap.id, searchId: item.id, ...docSnap.data()}])
        }
      })
      setTimeout(() => {
        setDone(true)
      }, 1000);
      }
      else if (searches.length > 0 && get) {
        searches.map(async(item) => {
        const docSnap = await getDoc(doc(db, 'products', item.element.id))
        if (docSnap.exists()) {
          setTempSearches(prevState => [...prevState, {id: docSnap.id, searchId: item.id, ...docSnap.data()}])
        }
        
      })
       setTimeout(() => {
        setDone(true)
      }, 1000);
      }
      else if (searches.length > 0 && purchased) {
        searches.map(async(item) => {
        const docSnap = await getDoc(doc(db, 'profiles', user.uid, 'purchased', item.id))
        if (docSnap.exists()) {
          setTempSearches(prevState => [...prevState, {id: docSnap.id, searchId: item.id, ...docSnap.data()}])
        }
        
      })
      setTimeout(() => {
        setDone(true)
      }, 1000);
      }
     }, [searches, home])
     async function deleteSearch(item) {
      if (home) {
        
            await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', item.searchId))
            setTempSearches(tempSearches.filter((e) => e.searchId !== item.searchId))
          
      }
      else if (group || free || get || purchased || my) {
        await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', item.searchId))
        setTempSearches(tempSearches.filter((e) => e.searchId !== item.searchId))
    }
      
     }
     //console.log(home)

    async function deleteAllSearches() {
      if (ai) {
        const docSnap = await getDocs(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('ai', '==', true)))
        docSnap.forEach(async(e) => {
          await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id))
        })
      }
      else if (home) {
        const docSnap = await getDocs(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('user', '==', true)))
        docSnap.forEach(async(e) => {
          await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id))
        })
        setTempSearches([])
      }
      else if (group) {
        const docSnap = await getDocs(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('group', '==', true)))
        docSnap.forEach(async(e) => {
          await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id))
        })
        setTempSearches([])
      }

      else if (friend) {
        const docSnap = await getDocs(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('friend', '==', true)))
        docSnap.forEach(async(e) => {
          await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id))
        })
      }
      else if (get) {
        const docSnap = await getDocs(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('getTheme', '==', true)))
        docSnap.forEach(async(e) => {
          await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id))
        })
        setTempSearches([])
      }
      else if (free) {
        const docSnap = await getDocs(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('freeTheme', '==', true)))
        docSnap.forEach(async(e) => {
          await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id))
        })
        setTempSearches([])
      }
      else if (purchased) {
        const docSnap = await getDocs(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('purchasedTheme', '==', true)))
        docSnap.forEach(async(e) => {
          await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id))
        })
        setTempSearches([])
      }
      else if (my) {
       setTempSearches([])
        const docSnap = await getDocs(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('myTheme', '==', true)))
       docSnap.forEach(async(e) => {
          await deleteDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id))
        })
        setTempSearches([])
      }
      
    }
    //console.log(tempSearches.length)
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
    const renderSearches  = ({item}) => {
        //console.log(item)
        if (home) {
            return (
            <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}]} activeOpacity={1}>
                <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
                    <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.firstName} {item.lastName} | @{item.userName}</Text>
                    <TouchableOpacity style={[styles.close, {color: modeTheme.color}]} onPress={() => deleteSearch(item)}>
                      <MaterialCommunityIcons name='close' size={27.5} color={modeTheme.color}/>
                    </TouchableOpacity>
                    
                </TouchableOpacity>
        )
        }
        else if (ai) {
          return (
            <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}]} activeOpacity={1}>
                    <Text numberOfLines={1} style={styles.categories}>{item.element.name}</Text>
                    <TouchableOpacity style={[styles.close, {color: modeTheme.color}]} onPress={() => deleteSearch(item)}>
                      <MaterialCommunityIcons name='close' size={27.5} />
                    </TouchableOpacity>
                    
                </TouchableOpacity>
        )
        }
        else if (group) {
          return (
            <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}]} activeOpacity={1}>
              <FastImage source={item.banner ? {uri: item.banner} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
                    <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.name}</Text>
                    <TouchableOpacity style={[styles.close, {color: modeTheme.color}]} onPress={() => deleteSearch(item)}>
                      <MaterialCommunityIcons name='close' size={27.5} color={modeTheme.color} />
                    </TouchableOpacity>
                    
                </TouchableOpacity>
        )
        }
        else if (my || free|| purchased || get) {
          return (
            <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}]} activeOpacity={1}>
              <FastImage source={item.images[0] ? {uri: item.images[0]} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
                    <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.name}</Text>
                    <TouchableOpacity style={[styles.close, {color: modeTheme.color}]} onPress={() => deleteSearch(item)}>
                      <MaterialCommunityIcons name='close' size={27.5} color={modeTheme.color}/>
                    </TouchableOpacity>
                    
                </TouchableOpacity>
        )
        }
        else if (friend) {
          return (
            <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: modeTheme.backgroundColor}]} activeOpacity={1}>
                    <Text numberOfLines={1} style={[styles.categories, {color: modeTheme.color}]}>{item.element.name}</Text>
                    <TouchableOpacity style={[styles.close]} onPress={() => deleteSearch(item)}>
                      <MaterialCommunityIcons name='close' size={27.5} />
                    </TouchableOpacity>
                    
                </TouchableOpacity>
        )
        }
        
    }
    //console.log(searches)
    //console.log(tempSearches)
  return (
    <View style={[styles.container, { backgroundColor : modeTheme.backgroundColor}]}>
        {/* <RegisterHeader onPress={() => navigation.goBack()}/> */}
        <ThemeHeader text={"Recent Searches"} video={false} backButton={true} style={{marginLeft: 0}}/>
        <View style={styles.main}>
            <View style={[styles.recentCategories]}>
                <Text style={styles.recentCategoriesText}>Recent</Text>
                <TouchableOpacity onPress={() => deleteAllSearches()}>
                <Text style={styles.clearAllText}>Clear all</Text>
                </TouchableOpacity>
            </View>
            {tempSearches.length > 0 && done ? <FlatList 
                data={tempSearches.filter((obj, index, self) => index === self.findIndex((o) => o.searchId === obj.searchId))}
                renderItem={renderSearches}
                keyExtractor={item => item.id}
                style={{height: '50%'}}
            /> : <View style={styles.noRecentSearchesContainer}>
                    <Text style={[styles.noRecentSearches, {color: modeTheme.color}]}>No Recent Searches</Text>
                
                </View>}
            
        </View>
    </View>
  )
}

export default RecentSearchesScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    main: {
        marginHorizontal: '5%',
        
        //marginTop: '5%',
        //marginVertical: '10%'
    },
    header: {
        fontSize: 24,
        fontFamily: 'Montserrat_600SemiBold',

    },
    categoriesContainer: {
        borderRadius: 5,
        flexDirection: 'row',
        marginTop: '5%',
        //width: '95%'
        //marginLeft: '20%'
    },
    categories: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        width: '80%',
        padding: 10
    },
    searchContainer: {
        flexDirection: 'row'
    },
    noRecentSearches: {
        fontSize: 19.20,
        color: "#000",
        fontFamily: 'Montserrat_600SemiBold',
    },
    noRecentSearchesContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        //flex: 1
        marginTop: '80%'
        //flex: 1
    },
    recentCategories: {
    backgroundColor: "#d4d4d4",
    fontWeight: 'bold',
    //width: '95%',
    marginTop: '2.5%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  recentCategoriesText: {
    fontSize: 19.20,
    padding: 5,
    fontFamily: 'Montserrat_700Bold',
  },
  clearAllText: {
    fontSize: 19.20,
    padding: 5,
   fontFamily: 'Montserrat_400Regular',
  },
  close: {
    marginLeft: 'auto',
    alignSelf: 'center'
  }
})