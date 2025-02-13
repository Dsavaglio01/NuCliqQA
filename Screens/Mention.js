import { StyleSheet, Text, View, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import ThemeHeader from '../Components/ThemeHeader'
import { Divider } from 'react-native-paper'
import SearchBar from '../Components/SearchBar'
import { getDoc, doc, updateDoc, increment, arrayRemove} from '@firebase/firestore'
import { db } from '../firebase'
import useAuth from '../Hooks/useAuth'

import { useNavigation } from '@react-navigation/native'
import FastImage from 'react-native-fast-image'
import {BACKEND_URL} from "@env"
import generateId from '../lib/generateId';
import themeContext from '../lib/themeContext'
const Mention = ({route}) => {
    const {mentions} = route.params;
    const navigation = useNavigation();
    const theme = useContext(themeContext)
    const [searching, setSearching] = useState(false)
    const [filteredGroup, setFilteredGroup] = useState([]);
    const [mentionInfo, setMentionInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const {user} = useAuth();
    
    const handleSearchCallback = (dataToSend) => {
      //console.log(dataToSend)
      setSearching(dataToSend)
    }
    const handleGroupCallback = (dataToSend) => {
    setFilteredGroup(dataToSend)
  }
  
    useEffect(() => {
        if (route.params?.mentions.length > 0) {
            mentions.map((item) => {
                const getData = async() => {
                    const userSnap = (await getDoc(doc(db, 'profiles', user.uid)))
                    if (userSnap.exists() && !userSnap.data().blockedUsers.includes(item.id)) {
                      const docSnap = (await getDoc(doc(db, 'profiles', item.id)))
                      if (docSnap.exists()) {
                      setMentionInfo(prevState => [...prevState, {id: docSnap.id, ...docSnap.data()}])
                      }
                    }         
                }
                getData();
            })
            setTimeout(() => {
                setLoading(false)
            }, 1000);
        }
        else {
            setTimeout(() => {
                setLoading(false)
            }, 1000);
        }
    }, [route.params?.mentions])
    const renderMentions = ({item, index}) => {
    return (
        <View key={index}>
            <TouchableOpacity style={[styles.friendsContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => navigation.navigate('ViewingProfile', {name: item.id, viewing: true})}>
                <View style={{flexDirection: 'row'}}>
                  {item.pfp ? 
                  <FastImage source={{uri: item.pfp}} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5, borderColor: theme.color}}/> :
                  <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5, borderColor: theme.color}}/>
                  }
                    
                 <View style={{paddingLeft: 20, width: '70%', justifyContent: 'center'}}>
                    <Text numberOfLines={1} style={[styles.name, {color: theme.color}]}>{item.firstName} {item.lastName}</Text>
                    <Text numberOfLines={1} style={[styles.message, {color: theme.color}]}>@{item.userName}</Text>
                </View>
                </View>
                {/* <TouchableOpacity style={styles.addContainer} onPress={user.uid != null ? friends.filter(e => e.id === item.id).length > 0 ? () => removeFriend(item.id) : item.id == user.uid || requests.filter(e => e.id === item.id).length > 0 ? null : () => addFriend(item): null}>
              {requests.filter(e => e.id === item.id).length > 0 ? <RequestedIcon /> : 
              friends.filter(e => e.id === item.id).length > 0 ? <FollowingIcon />
              : item.id == user.uid ? null : <FollowIcon />}
              
            </TouchableOpacity> */}
                {/* <TouchableOpacity style={styles.addContainer} onPress={friends.filter(e => e.id === item.id).length > 0 ? null : item.id == user.uid ? null : () => addFriend(item.id)}>
                    {friends.filter(e => e.id === item.id).length > 0 ? <FollowingIcon />
                    : item.id == user.uid ? null : <FollowIcon />}
                    
                </TouchableOpacity> */}

            </TouchableOpacity>
          </View>
    )
  }
  return (
    <View style={styles.container}>
      <ThemeHeader text={"Post's  Mentions"} video={false} backButton={true}/>
      <Divider borderBottomWidth={0.4}/>
      {
        <>
          <View style={styles.searchBarContainer}>
            <SearchBar friendsInfo={mentionInfo} mentionPreview={true} isSearching={handleSearchCallback} filteredGroup={handleGroupCallback} likes={true}/>
          </View>
          {!searching && !loading && filteredGroup.length == 0 ?
            <FlatList 
              data={mentionInfo}
              renderItem={renderMentions}
              keyExtractor={(item) => item.id}
            /> : filteredGroup.length > 0 ?
            <FlatList 
              data={filteredGroup}
              renderItem={renderMentions}
              keyExtractor={(item) => item.id}
            /> 
            : loading ? 
            <View style={styles.loading}>
              <ActivityIndicator size={'large'} color={"#9EDAFF"}/> 
            </View> 
          : null}
        </>
      }
    </View>
  )
}

export default Mention

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212"
  },
  searchBarContainer: {
    marginTop: '5%', 
    width: '95%', 
    marginLeft: '5%'
  },
  loading: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent:'center', 
    marginBottom: '50%'
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
    addContainer: {
    //flex: 1,
      //alignSelf: 'center', 
      //alignItems: 'flex-end',
      //marginRight: '5%',
      //width: '50%'
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