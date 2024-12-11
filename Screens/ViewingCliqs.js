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
const ViewingCliqs = ({route}) => {
    const {user, ogUser, username} = route.params;
    //console.log(user)
    const theme = useContext(themeContext)
    const [groups, setGroups] = useState([]);
    const [groupsJoined, setGroupsJoined] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
     const [searching, setSearching] = useState(false)
     const [filteredGroup, setFilteredGroup] = useState([]);
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
    async function removeClique(id, members) {
    const docSnap  = (await getDoc(doc(db, 'groups', id)))
    if (docSnap.data().admins.includes(user) && docSnap.data().admins.length == 1) {
      Alert.alert('Delete Clique?', 'By leaving the Clique, since you are the only admin, the Clique will be deleted', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => Promise.all(members.map(async(item) => await updateDoc(doc(db, 'profiles', item), {
                    groupsJoined: arrayRemove(user)
                }))).then(async() => await deleteDoc(doc(db, 'groups', id)).then(async() => await setDoc(doc(db, 'deletedCliques', id), {
        timestamp: serverTimestamp(),
        members: docSnap.data().members,
        admins: docSnap.data().admins,
        info: docSnap.data()
      }))).then(() => {
        fetch(`${BACKEND_URL}/api/deleteRecommendClique`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
             itemId: id
              //client.send(new rqs.DeleteItem(itemId), callback);
            }),
            })
          .then(response => response.json())
          .then(responseData => {
            // Handle the response from the server
            console.log(responseData);
          })
          .catch(error => {
            // Handle any errors that occur during the request
            console.error(error);
          })
      }).catch((e) => console.log(e)).then(() => removeCurrentUser(id))},
    ]);
    }
    else if (docSnap.data().admins.includes(user) && docSnap.data().admins.length > 1) {
      Alert.alert('Leave Clique?', "By leaving the Clique, if you re-join, you won't automatically be an admin again.", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: async() => await updateDoc(doc(db, 'groups', id), {
        members: arrayRemove(user),
        admins: arrayRemove(user)
      }).catch((e) => console.log(e)).then(() => removeCurrentUser(id))},
    ]);
    }
    else {
      await updateDoc(doc(db, 'groups', id), {
        members: arrayRemove(user),
      }).then(() => removeCurrentUser(id))
    }
    
    }
     const removeCurrentUser = async(item) => {
      await updateDoc(doc(db, 'profiles', user.uid), {
          adminGroups: arrayRemove(item)
        }).then(async() => await getDocs(collection(db, 'profiles')).forEach(async(document) => {
          await deleteDoc(doc(db, 'profiles', document.id, 'channels', item))
            if (document.data().groupsJoined.includes(item)) {
                await updateDoc(doc(db, 'profiles', document.id), {
                    groupsJoined: arrayRemove(item)
                })
            }
            
        }))
        .then(() => setGroups(groups.filter((e) => e.id != item)))
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
                <Text numberOfLines={1} style={[styles.nameText, {fontWeight: '700', color: theme.color}]}>{item.name}</Text>
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

export default ViewingCliqs

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