import { StyleSheet, Text, View,TouchableOpacity, FlatList, TextInput, Image, ActivityIndicator } from 'react-native'
import React, {useState, useEffect} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import SearchInput from '../Components/SearchInput'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import SearchDropDown from '../Components/DropdownSearch'
import NextButton from '../Components/NextButton'
import MainButton from '../Components/MainButton'
import RecentSearches from '../Components/RecentSearches'
import ThemeHeader from '../Components/ThemeHeader'
import { Divider } from 'react-native-paper'
import useAuth from '../Hooks/useAuth'
import { db } from '../firebase'
import { addDoc, collection, serverTimestamp, onSnapshot, query, where, updateDoc, doc } from 'firebase/firestore'
import SearchBar from '../Components/SearchBar'
import {BACKEND_URL} from "@env"
const FinalizeTheme = ({route}) => {
    const navigation = useNavigation();
    const [recentSearches, setRecentSearches] = useState(false);
    const [ searching, setSearching] = useState(false);
    const [filtered, setFiltered] = useState();
    const [searches, setSearches] = useState('');
    const [searchesRecent, setSearchesRecent] = useState([]);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false)
    const {user} = useAuth();
    const [dataToSend, setDataToSend] = useState('');
    const onSearch = (text) => {
        if(text) {
            setSearching(true)
            setSearches(text)
        }
        else {
            setSearching(false)
        }
    useEffect(() => {
      if (route.params?.search) {
        setDataToSend(route.params?.search)
      }
    }, [route.params?.search])
    
        //console.log(text)
    /* if (text) {
      
      
      setFiltered(tempList)
    }
    else {
      //setRecentSearches(false)
      setSearching(false)
      setFiltered(groups)
    } */

  }
  useEffect(() => {
      let unsub;
      const fetchSearches = async() => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'recentSearches'), where('ai', '==', true)), (snapshot) => {
          setSearchesRecent(snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })))
        })
      }
      fetchSearches();
      return unsub;
  }, [])

  function addToRecentSearches(name){
    var element = {name: name}
    if (searchesRecent.filter(e => e.element.name == name).length > 0) {
      //console.log('bruh')
      
      searchesRecent.map(async(e) => {
        if (e.element.name == name) {
          //setTempId(element.id)
          await updateDoc(doc(db, 'profiles', user.uid, 'recentSearches', e.id), {
            group: false,
            event: false,
            element,
            user: false,
            ai: true,
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
        user: false,
        ai: true,
        friend: false,
        theme: false,
        timestamp: serverTimestamp()
      })
    }
    //console.log(item)
  }
  //console.log(searches)
  //console.log(image)
  const handleSearchCallback = (dataToSend) => {
    setSearching(dataToSend)
  }
  const handleAiCallback = async(dataToSend) => {
    if (dataToSend.length > 0) {
      setSearches(dataToSend)
      setLoading(true)
      await fetch(`${BACKEND_URL}/api/aiEndpoint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({searches: dataToSend})
      }).then(response => response.json())
      .then(responseData => { 
        //console.log(responseData.responseData.data)
        //console.log(responseData.responseData.data[0].url)
        setImage(responseData.responseData.data[0].url)
        addToRecentSearches(dataToSend)
        setLoading(false)
        //console.log(responseData)
      }).catch(error => {
      // Handle any errors that occur during the request
      console.error(error);
    })
    }
    
  }
  //console.log(searches)
  return (
    <View style={styles.container}>
      <ThemeHeader video={false} text={"Generate Theme"} backButton={true}/>
      <Divider borderWidth={0.4}/>
      <View style={{marginTop: '5%', marginLeft: '6%'}}>
        <SearchBar ai={true} isSearching={handleSearchCallback} handleSearchFunction={handleAiCallback} searches={searchesRecent}/>
      </View>
        {image != null && loading == false ?
        <>
        <View style={{alignItems: 'center', marginBottom: '6%'}}>
            <Image source={{uri: image}} style={styles.image}/>
        </View>
        <View style={{marginLeft: '15%', width: '70%'}}>
            <MainButton text={"Regenerate"} onPress={() => {setLoading(true); handleAiCallback(searches)}}/>
        </View>
        <View style={{marginLeft: '7.5%', width: '85%', marginTop: '5%'}}>
            <NextButton text={"Select Design"} onPress={() => navigation.navigate('DesignTheme', {source: image})}/>
        </View>
        </>
        : loading ? 
        <View style={{alignItems: 'center', justifyContent: 'center', marginBottom: '30%', flex: 1}}>
        <ActivityIndicator size={"large"} color={"#005278"}/> 
        </View>
        : !searching ? 
        <View style={{alignItems: 'center'}}>
          <View style={[styles.image, {borderWidth: 1, alignItems: 'center', justifyContent: 'center'}]}> 
            <Text style={styles.headerText}>This is Where the Image Will Appear After Generated.</Text>
          </View>
        </View> : null}
        
    </View>
  )
}

export default FinalizeTheme

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    input: {
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        width: '90%',
        margin: '7.5%'
    },
    headerText: {
      fontSize: 24,
      textAlign: 'center',
      fontWeight: '600',
      padding: 10,
      marginTop: '2.5%'
    },
    categoriesContainer: {
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: "#fff",
    //marginRight: '5%',
    marginTop: 5,
    //marginLeft: '20%'
  },
  categories: {
    fontSize: 15.36,
    width: '80%',
    padding: 10
  },
  image: {
    width: 350, height: 450, borderRadius: 18
  }
})