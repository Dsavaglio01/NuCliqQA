import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator} from 'react-native'
import React, { useState, useMemo, useEffect, useContext} from 'react'
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import ThemeHeader from '../Components/ThemeHeader';
import { Divider } from 'react-native-paper';
import SearchBar from '../Components/SearchBar';
import useAuth from '../Hooks/useAuth';
import { db } from '../firebase';
import { onSnapshot, query, collection, where, doc, getDocs, getDoc, limit } from 'firebase/firestore';
import {MaterialCommunityIcons} from '@expo/vector-icons'
import NextButton from '../Components/NextButton';
import themeContext from '../lib/themeContext';
const MentionPreview = ({route}) => {
    const {groupName, userName, actualGroup, groupPfp, blockedUsers, admin, postArray, group, groupId, value, edit, oGmentions} = route.params;
    const [mentions, setMentions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [specificSearch, setSpecificSearch] = useState('');
    const [mentionSearches, setMentionSearches] = useState([]);
    const theme = useContext(themeContext)
    const [searching, setSearching] = useState(false);
    const [done, setDone] = useState(false);
    const [filteredGroup, setFilteredGroup] = useState([]);
    const [friends, setFriends] = useState([]);
    const [finalMentions, setFinalMentions] = useState([]);
    const [usersThatBlocked, setUsersThatBlocked] = useState(null);
    const {user} = useAuth();

    const navigation = useNavigation();
    const handleSearchCallback = (dataToSend) => {
      //console.log(dataToSend)
      setSearching(dataToSend)
    }
    //console.log(finalMentions)
    const handleGroupCallback = (dataToSend) => {
    // console.log(dataToSend[0].id)
      setFilteredGroup(prevState => [...prevState, dataToSend[0]])
      //finalMentions.filter((e) => e.id !== data)
      if (!finalMentions.some(e => e.username === dataToSend[0].userName)) {
          setFinalMentions(prevState => [...prevState, dataToSend[0]]);
      }
  }
  useEffect(() => {
    if (route.params?.oGmentions) {
        setFinalMentions(oGmentions)
    }
  }, [route.params?.oGmentions])
  useEffect(() => {
    const getData = async() => {
      const docSnap = await getDoc(doc(db, 'profiles', user.uid))
      setUsersThatBlocked(docSnap.data().usersThatBlocked)
    }
    getData()
  }, [])
  useEffect(() => {
    if (!groupId && usersThatBlocked != null) {
      let unsub;

      const fetchCards = async () => {
  
        unsub = onSnapshot(query(collection(db, 'friends'), where('active', '==', true), where('users', 'array-contains', user.uid)), (snapshot) => {
          setFriends(snapshot.docs.map((doc)=> ( {
            users: doc.data().users
          })))
        })
      } 
      fetchCards();
      return unsub;
    }
    else if (usersThatBlocked != null) {
      const fetchCards = async() => {
       const docSnap = await getDoc(doc(db, "groups", groupId))
       if (docSnap.exists()) {
        //const friendSnap = docSnap.data().members.filter((e) => !docSnap.data().members.includes())
        //setFriends(docSnap.data().members)
        setFriends(docSnap.data().members.slice(0, 100).filter(item => !usersThatBlocked.includes(item)))
       }
        //setFriends(querySnapshot)
      }
      fetchCards()
      
    }
    
  }, [groupId, usersThatBlocked])
  useMemo(() => {
    if (friends.length > 0 && !groupId) {
      setMentions([])
      friends.map((item) => {
        item.users.map((e) => {
          if (e != user.uid) {
            let unsub;
      const fetchCards = () => {
        unsub = onSnapshot(query(doc(db, 'profiles', e)), (snapshot) => {
          setMentions(prevState => [...prevState, {id: snapshot.id, ...snapshot.data()}])
        })
      }
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
      return unsub;
          } 
        })
      })
    }
    else if (friends.length > 0 && groupId) {
      setMentions([])
      friends.map((item) => {
        //console.log(item)
        if (item !== user.uid) {
        let unsub;
      const fetchCards = () => {
        unsub = onSnapshot(query(doc(db, 'profiles', item)), (snapshot) => {
          setMentions(prevState => [...prevState, {id: snapshot.id, ...snapshot.data()}])
        })
      }
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
      return unsub;
    }
      })
    }
  }, [friends, groupId])
  //console.log(finalMentions[1])
  const addToMentions = (data) => {
    if (!finalMentions.some(e => e.username === data.userName)) {
      setFinalMentions(prevState => [...prevState, data])
    }
    
  }
  const removeFromMentions = (data) => {
    setFinalMentions(finalMentions.filter((e) => e.id !== data))
  }
  const renderMentions = ({item, index}) => {
    //console.log(item)
    return (
        <View key={index}>
            <TouchableOpacity activeOpacity={1} style={[styles.friendsContainer, {backgroundColor: theme.backgroundColor}]} onPress={finalMentions.some(doc2 => doc2.id === item.id) ? () => removeFromMentions(item.id) : () => addToMentions({id: item.id, username: item.userName, notificationToken: item.notificationToken})}>
                <View style={{flexDirection: 'row'}}>
                  {item.pfp ? 
                  <FastImage source={{uri: item.pfp}} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/> :
                  <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
                  }
                    
                 <View style={{paddingLeft: 20, width: '70%', justifyContent: 'center'}}>
                    <Text numberOfLines={1} style={[styles.name, {color: theme.color}]}>{item.firstName} {item.lastName}</Text>
                    <Text numberOfLines={1} style={[styles.message, {color: theme.color}]}>@{item.userName}</Text>
                </View>
                {finalMentions.some(doc2 => doc2.id === item.id) ? <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                    <MaterialCommunityIcons name='check' size={25} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} style={{alignSelf: 'center'}}/>
                    </View> : null}
                </View>
            </TouchableOpacity>
          </View>
    )
  }
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <ThemeHeader text={"Post's  Mentions"} video={false} backButton={true}/>
      <Divider borderBottomWidth={0.4}/>
      {<>
      <View style={{marginTop: '5%', width: '95%', marginLeft: '5%'}}>
        <SearchBar mentions={mentions} isSearching={handleSearchCallback} filteredGroup={handleGroupCallback} likes={true}/>
      </View>
      {!searching && !loading && filteredGroup.length == 0 ?
      <FlatList 
        data={mentions.slice(0, 100)}
        renderItem={renderMentions}
        keyExtractor={(item) => item.id}
        style={{maxHeight: 484}}
      /> :
      filteredGroup.length > 0 ?
      <FlatList 
        data={filteredGroup}
        renderItem={renderMentions}
        keyExtractor={(item) => item.id}
        style={{maxHeight: 484}}
      /> 
      : loading ? <View style={{flex: 1, alignItems: 'center', justifyContent:'center', marginBottom: '50%'}}>
        <ActivityIndicator size={'large'} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View> : null}
        </>
}
    {!searching ?
    <View style={{ width: '90%', alignItems: 'flex-end', marginTop: '5%'}}>
        <NextButton text={"Save"} onPress={() => navigation.navigate('Caption', {mentions: finalMentions, groupPfp: groupPfp, groupName: groupName, userName: userName, actualGroup: actualGroup, blockedUsers: blockedUsers, admin: admin, postArray: postArray, group: group, groupId: groupId, value: value, edit: false})}/>
    </View> : null}
    </View>
  )
}

export default MentionPreview

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    friendsContainer: {
        borderRadius: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#d3d3d3",
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '95%',
        marginLeft: '2.5%'
    },
    name: {
        fontSize: 15.36,
        paddingTop: 5,
        fontFamily: 'Montserrat_700Bold',
        //width: '95%'
    },
    message: {
        fontSize: 15.36,
        paddingBottom: 5,
        fontFamily: 'Montserrat_500Medium'
    },
})