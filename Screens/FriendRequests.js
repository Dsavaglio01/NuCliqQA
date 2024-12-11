import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, Button} from 'react-native'
import React, {useEffect, useState} from 'react'
import { onSnapshot, query, collection, orderBy, deleteDoc, doc, getFirestore, updateDoc } from 'firebase/firestore';
import MainButton from '../Components/MainButton';
import RegisterHeader from '../Components/RegisterHeader';
import NextButton from '../Components/NextButton';
import { useNavigation } from '@react-navigation/native';
import {MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import useAuth from '../Hooks/useAuth';
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
const FriendRequests = () => {
    //const {user} = route.params;
    //const [friends, setFriends] = useState([]);
    const [actuallySending, setActuallySending] = useState(false);
    const navigation = useNavigation();
    const db = getFirestore();
    const {user} = useAuth()
    const [searching, setSearching] = useState(false);
    const [friendRequests, setFriendRequests] = useState([]);
    useEffect(() => {
    let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'friendRequests')), (snapshot) => {
          setFriendRequests(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
        })
      } 
      fetchCards();
      return unsub;
  }, [])
  //console.log(friends)
  const renderChecked = (id) => {
      let list = friendRequests
      list[id].checked = !list[id].checked
      //console.log(list[id].checked)
      //console.log(list)
      if (list[id].checked) {
        setActuallySending(true)
      }
      else {
        setActuallySending(false)
      }
      var newList = list.slice()
      setFriendRequests(newList)
      //console.log(friends[id])
    }
    async function confirmRequest(requestId)  {
       //await updateDoc(doc())
    }
    async function deleteRequest(requestId) {
        await deleteDoc(doc(db, 'profiles', user.uid, 'friendRequests', requestId))
    }
  const renderFriend = ({item, index}) => {
    //console.log(item)
    return (
        <View style={{flexDirection: 'row'}}>
            <View style={styles.messageContainer}>
                <Image source={{uri: item.info.pfp}} style={{height: 50, width: 50, borderTopLeftRadius: 10, borderBottomLeftRadius: 10}}/>
                <View style={{paddingLeft: 7.5, width: '40%'}}>
                    <Text numberOfLines={1} style={styles.name}>@{item.info.userName}</Text>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{alignSelf: 'center', marginRight: '5%'}}>
                    <NextButton text={'Confirm'} textStyle={{paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5}}/>
                </View>
                <View style={{alignSelf: 'center'}}>
                    <MainButton text={"Delete"} textStyle={{paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5}} onPress={() => deleteRequest()}/>
                </View>
                </View>
            </View>
          {/* <View style={styles.messageContainer}>
                <Image source={{uri: item.pfp}} style={{height: 65, width: 65, borderTopLeftRadius: 10, borderBottomLeftRadius: 10}}/>
                 <View style={{paddingLeft: 7.5, width: '65%'}}>
                    <Text style={styles.name}>{item.info.firstName} {item.info.lastName}</Text>
                    <Text>{item.info.username}</Text>
                </View>
              
            </View>   */}
          </View>
    )
    
  }
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={styles.container}> 
    <RegisterHeader onPress={() => navigation.goBack()}/>
    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <Text style={styles.header}>Friend Requests: </Text>
        <View style={{flexDirection: 'row'}}>
        <Ionicons name='search' size={25} color="#000" style={{alignSelf: 'center', marginTop: 20}} onPress={() => setSearching(true)}/>
        <TouchableOpacity style={{alignSelf: 'center'}}>
            <Text style={[styles.header, {fontSize: 19.20, marginTop: 20, color: '#007AFF', fontFamily: 'Montserrat_500Medium'}]}>Select</Text>
        </TouchableOpacity>
        </View>
    </View>
    <View style={{borderBottomWidth: 0.25, marginTop: '5%'}}/>
      <FlatList 
        data={friendRequests}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id}
      />
    {actuallySending ? 
        <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: '20%', marginHorizontal: '5%'}}>
          <NextButton text={"Create Chat"}/>
        </View> : <></>}
    </View>

  )
}

export default FriendRequests

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        fontSize: 24,
        marginLeft: '5%',
        padding: 10,
        marginTop: '5%',
        fontFamily: 'Montserrat_500Medium'
    },
    messageContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        flexDirection: 'row',
        marginTop: '5%',
        marginLeft: '2.5%',
        shadowColor: '#171717',
        shadowOffset: {width: -2, height: 8},
        shadowOpacity: 0.25,
        shadowRadius: 3,
        width: '95%'
    },
    name: {
        fontSize: 15.36,
        padding: 10,
        fontFamily: 'Montserrat_500Medium'
    },
    checkbox: {
        borderWidth: 1.5,
        height: 25,
        width: 25,
        borderRadius: 12.5,
        marginVertical: '5.5%',
        marginHorizontal: '5%'
    }
})