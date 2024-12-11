import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert} from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import { onSnapshot, query, collection, orderBy, getDocs, deleteDoc, doc, getDoc, serverTimestamp, setDoc, getFirestore, updateDoc, arrayRemove } from 'firebase/firestore';
import MainButton from '../Components/MainButton';
import RegisterHeader from '../Components/RegisterHeader';
import { useNavigation } from '@react-navigation/native';
import ThemeHeader from '../Components/ThemeHeader';
import SearchBar from '../Components/SearchBar';
import FastImage from 'react-native-fast-image';
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
import { db } from '../firebase'
const GroupList = ({route}) => {
    const {user, ogUser, username} = route.params;
    //console.log(user)
    const theme = useContext(themeContext)
    const [groups, setGroups] = useState([]);
    const [groupsJoined, setGroupsJoined] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
     const [searching, setSearching] = useState(false)
     const [filteredGroup, setFilteredGroup] = useState([]);
    const [searches, setSearches] = useState([]);
    const handleGroupCallback = (dataToSend) => {
    setFilteredGroup(dataToSend)
  }
    useEffect(() => {
        const getProfileDetails = async() => { 
      const profileVariables = {
        groupsJoined: await(await getDoc(doc(db, 'profiles', user))).data().groupsJoined,

      };
      setGroupsJoined(profileVariables.groupsJoined);

  }
  
  getProfileDetails();
    }, [])
    //console.log(groupsJoined)
    useEffect(() => {
        if (groupsJoined.length > 0) {
            groupsJoined.slice(0, 100).map(async(item) => {
                const docRef = doc(db, "groups", item);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setGroups(currentState => [...currentState, {id: docSnap.id, ...docSnap.data()}])
                }
                //await getDoc(doc(db, 'groups', item)).then(() => console.log(docS))
            })
            setTimeout(() => {
              setLoading(false)
            }, 1000);
        }
    }, [groupsJoined])
    const handleSearchCallback = (dataToSend) => {
      //console.log(dataToSend)
      setSearching(dataToSend)
    }
     
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  const renderFriend = ({item}) => {
    return (
        <>
        <TouchableOpacity style={[styles.friendsContainer, {backgroundColor: theme.backgroundColor}]} onPress={item.groupSecurity == 'private' ? () => Alert.alert('Cannot view Cliq since it is private!') 
            : () => navigation.navigate('GroupHome', {name: item.id, postId: null})}>
            <FastImage source={item.banner ? {uri: item.banner} : require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
            <View style={{paddingLeft: 20, width: '75%'}}>
                <Text numberOfLines={1} style={[styles.nameText, {fontWeight: '700', color:  theme.color}]}>{item.name}</Text>
                <Text numberOfLines={1} style={[styles.nameText, {fontSize: 12.29, color: theme.color, fontFamily: 'Montserrat_500Medium'}]}>{item.category}</Text>
            </View>
            {/* {ogUser ? <TouchableOpacity style={styles.removeButton} onPress={() => removeClique(item.id, item.members)}>
                <Text style={styles.removeButtonText}>Leave</Text>
            </TouchableOpacity> : <TouchableOpacity style={styles.removeButton} onPress={item.groupSecurity == 'private' ? () => Alert.alert('Cannot view Clique since it is private!') 
            : () => navigation.navigate('Cliqs', {screen: 'GroupHome', params: {name: item.id, postId: null}})}>
                <Text style={styles.removeButtonText}>View Group</Text>
            </TouchableOpacity>} */}
            
        </TouchableOpacity>
        
        </>
    )
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}> 
    <View>
      <ThemeHeader text={`@${username}'s Cliqs`} backButton={true}/>
    </View>
    <Text style={[styles.header, {color: theme.color}]}>All Cliqs: {groups.length}</Text>
     <View style={{marginLeft: '5%'}}>
      <SearchBar cliqueSearches={groups} filteredGroup={handleGroupCallback} userCliqueSearch={true} isSearching={handleSearchCallback}/>
    </View>
    {!searching && !loading ?
      <FlatList 
        data={filteredGroup.length > 0 ? filteredGroup : groups}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id}
      /> : loading && groups.length == 0 ? 
    <View style={{alignItems: 'center', flex: 1, justifyContent: 'center', marginBottom: '20%'}}>
          <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={"large"}/> 
        </View> : null}
    </View>
  )
}

export default GroupList

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    removeButton: {
        alignSelf: 'center',
        borderRadius: 20,
        borderWidth: 1,
        marginLeft: 'auto',
        borderColor: '#005278',
        //marginLeft: '-5%'
    },
    removeButtonText: {
        padding: 10,
        fontSize: 12.29,
        fontFamily: 'Montserrat_500Medium',
        color: '#005278',
        paddingLeft: 12,
        paddingRight: 12
    },
    nameText: {
        fontSize: 15.36,
        padding: 2.5,
        fontFamily: 'Montserrat_500Medium',
        paddingBottom: 0
    },
    friendsContainer: {
        borderRadius: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#d3d3d3",
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        width: '95%',
        marginLeft: '2.5%',
        //marginRight: '2.5%'
    },
    header: {
        fontSize: 24,
        marginLeft: '5%',
        marginBottom: '5%',
        fontFamily: 'Montserrat_500Medium'
    }
})