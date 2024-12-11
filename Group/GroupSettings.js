import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator} from 'react-native'
import React, {useEffect, useState, useContext} from 'react'
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import { Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { arrayRemove, collection, deleteDoc, doc, getDoc, setDoc, onSnapshot, query, getFirestore, updateDoc, getDocs, serverTimestamp, orderBy} from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import FastImage from 'react-native-fast-image';
import NextButton from '../Components/NextButton';
import {BACKEND_URL} from "@env";
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
import { db } from '../firebase'
const GroupSettings = ({route}) => {
    const {name, pfp, id, group} = route.params;
    //console.log(id)
    const navigation = useNavigation();
    const theme = useContext(themeContext)
    const [admins, setAdmins] = useState([])
    const [privacy, setPrivacy] = useState('');
    const [bannedUsers, setBannedUsers] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [requests, setRequests] = useState([]);
    const [reported, setReported] = useState([]);
    const [memberRequests, setMemberRequests] = useState([]);
    const [flagged, setFlagged] = useState(0);
    const {user} = useAuth()
    const [isDead, setIsDead] = useState(false);
    //console.log(group)
    useEffect(() => {
        
        const getData = async() => {
            const docSnap = await getDoc(doc(db, 'groups', id))
            if (docSnap.exists()) {
            const contactRef = onSnapshot(query(collection(db, 'groups', id, 'adminContacts'), orderBy('timestamp', 'desc')), (snapshot) => {
               setContacts(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
            })
            const adminRef = onSnapshot(query(doc(db, 'groups', id)), (snapshot) => {
                if (snapshot.data()) {
                    setAdmins(snapshot.data().admins)
                }
              
            })
            const bannedRef = onSnapshot(query(doc(db, 'groups', id)), (snapshot) => {
                if (snapshot.data()) {
                    setBannedUsers(snapshot.data().bannedUsers)
                }
                
            })
            const flaggedRef = onSnapshot(query(doc(db, 'groups', id)), (snapshot) => {
                if (snapshot.data()) {
                    setFlagged(snapshot.data().flagged)
                }
              
            })
            const privacyRef = onSnapshot(query(doc(db, 'groups', id)), (snapshot) => {
                if (snapshot.data()) {
                    setPrivacy(snapshot.data().groupSecurity)
                }
              
            })
            /* const flaggedRef
            const privacyRef */
            const requestRef = onSnapshot(query(collection(db, 'groups', id, 'adminRequests'), orderBy('timestamp', 'desc')), (snapshot) => {
              setRequests(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
            })
            const reportedRef = onSnapshot(query(collection(db, 'groups', id, 'reportedContent'), orderBy('timestamp', 'desc')), (snapshot) => {
              setReported(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
            })
            const memberRef = onSnapshot(query(collection(db, 'groups', id, 'memberRequests'), orderBy('timestamp', 'desc')), (snapshot) => {
              setMemberRequests(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
          })))
            })
            return memberRef, bannedRef, contactRef, requestRef, reportedRef, adminRef, privacyRef, flaggedRef
        }
        else {
            setIsDead(true)
            }
    }
    
        getData()
    }, [])
    /* useEffect(() => {
        if (route.params?.requestData) {
            setRequests(requestData)
        }
    }, [route.params?.requestData])
    useEffect(() => {
        if (route.params?.reportedData) {
            setReported(reportedData)
        }
    }, [route.params?.reportedData])
    useEffect(() => {
        if (route.params?.adminData) {
            setAdmins(adminData)
        }
    }, [route.params?.adminData])
    useEffect(() => {
        if (route.params?.contactData) {
            setContacts(contactData)
        }
    }, [route.params?.contactData])
    useEffect(() => {
        if (route.params?.memberData) {
            setMemberRequests(memberData)
        }
    }, [route.params?.memberData])
    useEffect(() => {
        if (route.params?.flaggedData) {
            setFlagged(flaggedData)
        }
    }, [route.params?.flaggedData])
    useEffect(() => {
        if (route.params?.privacyData) {
            setPrivacy(privacyData)
        }
    }, [route.params?.privacyData]) */
    //console.log(id)
    const yesterday = new Date();
    //console.log(admins)
    yesterday.setDate(yesterday.getDate() - 1);
    //console.log(yesterday.getTime())
    //console.log(yesterday.getTime().toPrecision(10))
    //contacts.filter(obj => console.log(parseInt(obj.timestamp.seconds.toString() + obj.timestamp.nanoseconds.toString().slice(0, 3))))
    
    //console.log(startOfDay)
    //contacts.filter(obj => console.log(obj.timestamp))
    async function leaveGroup() {
        Alert.alert(`Are you sure you want to leave this clique?`, `If you do leave this clique, your content will be saved (unless deleted) and you can join back at anytime`, [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Yes', onPress: async() => await updateDoc(doc(db, 'groups', id), {
            members: arrayRemove(user.uid),
            admins: arrayRemove(user.uid)
        }).then(async() => await updateDoc(doc(db, 'profiles', user.uid), {
            groupsJoined: arrayRemove(id)
        })).then(() => navigation.navigate('Group', {post: null}))},
    ]);
        
    }
    function pauseGroup() {
    
    Alert.alert(`Are you sure you want to pause this clique?`, `If you do pause this clique, you and the members will be unable to access it until it is unpaused in your (or other admin's) settings.`, [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Yes', onPress: async() => await updateDoc(doc(db, 'groups', id), {
        paused: true
      })},
    ]);
  }
    async function deleteGroup() {
        let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/deleteCliq'
        Alert.alert('Delete Cliq?', 'Are you sure your want to delete this cliq? If deleted you and other members will be unable to have access to this cliq again', [
                {
                  text: 'No',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'Yes', onPress: async() => {try {
    const response = await fetch(url, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {group: group, id: id, admins: admins}}), // Send data as needed
    })
    const data = await response.json();
    if (data.result.done) {
        navigation.navigate('Group')
    }
  } catch (error) {
    console.error('Error:', error);
  }}}
        ]);
    }
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
    //console.log(reported)
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        {isDead ? 
        <View style={{flex: 1, backgroundColor: theme.backgroundColor}}>
            <>
      <View style={{flexDirection: 'row',
        marginLeft: '2.5%',
        marginRight: '2.5%',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '8%'}}>
            <MaterialCommunityIcons name='chevron-left' size={35} style={{marginRight: '-10%'}} color={theme.color} onPress={() => navigation.goBack()}/>
        </View> 
        <Divider />
        </>
        <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginBottom: '25%'}}>
              <Text style={{fontSize: 24, padding: 10, fontFamily: 'Montserrat_500Medium'}}>Sorry, cliq is unavailable</Text>
              <MaterialCommunityIcons name='emoticon-sad-outline' color={theme.color} size={50} style={{alignSelf: 'center', marginTop: '10%'}}/>
            </View>
            </View> : 
        <>
        <>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity style={{margin: '10%', marginBottom: 0, marginRight: 0, marginLeft: '2.5%'}} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name='chevron-left' size={35} color={theme.color} />
            </TouchableOpacity>
              <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: '5%', marginTop: '10.5%', marginBottom: '2.5%'}}>
               <FastImage source={pfp ? {uri: pfp} : require('../assets/defaultpfp.jpg') } style={{height: 35, width: 35, borderRadius: 8, borderWidth: 1.5, borderColor: '#000'}}/> 
               <Text style={{fontSize: 15.36, marginLeft: '5%', color: theme.color, width: '65%', fontFamily: 'Montserrat_500Medium'}}>{name}</Text>
              </View>
        </View>
        <Divider />
        </>
        <>
        <ScrollView style={{marginHorizontal: '5%', flex: 1}}>
        {admins.includes(user.uid) ? <> 
    <Text style={[styles.header, {color: theme.color}]}>Admin Review</Text>
      <View style={[styles.reviewContainer, {backgroundColor: theme.backgroundColor}]}>
        <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('AdminRequests', {requests: requests, name: name, groupId: id, admins: admins})}>
            <View style={{flexDirection: 'row'}}>
                <MaterialIcons name='admin-panel-settings' size={21} style={styles.icon} color={theme.color}/>
                <View>
                    <Text style={[styles.itemText, {color: theme.color}]}>Admin Requests</Text>
                    {requests.filter(obj => parseInt(obj.timestamp.seconds.toString() + obj.timestamp.nanoseconds.toString().slice(0, 3)) >= yesterday.getTime()).length == 0 ? <Text style={[styles.countText, {color: theme.color}]}>Nothing today</Text> :
                    <Text style={[styles.countText, {color: theme.color}]}>{requests.filter(obj => parseInt(obj.timestamp.seconds.toString() + obj.timestamp.nanoseconds.toString().slice(0, 3)) >= yesterday.getTime()).length} admin requests today</Text>}
                </View>
            </View>
            <Text style={[styles.itemText, {alignSelf: 'center', color: theme.color}]}>{requests.length}</Text>
        </TouchableOpacity>
        {bannedUsers.length > 0 ? 
        <>
        <Divider style={{borderWidth: 0.33, marginTop: 5, borderColor: theme.color}}/>
        <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('CliqueBans', {bannedUsers: bannedUsers, groupId: id})}>
            <View style={{flexDirection: 'row'}}>
                <MaterialIcons name='person-remove' size={20} style={styles.icon} color={theme.color}/>
                <View>
                    <Text style={[styles.itemText, {color: theme.color}]}>Banned Users</Text>
                    {/* {bannedUsers.filter(obj => parseInt(obj.timestamp.seconds.toString() + obj.timestamp.nanoseconds.toString().slice(0, 3)) >= yesterday.getTime()).length == 0 ? <Text style={styles.countText}>Nothing today</Text> :
                    <Text style={styles.countText}>{bannedUsers.filter(obj => parseInt(obj.timestamp.seconds.toString() + obj.timestamp.nanoseconds.toString().slice(0, 3)) >= yesterday.getTime()).length} banned users today</Text>} */}
                </View>
            </View>
            <Text style={[styles.itemText, {alignSelf: 'center', color: theme.color}]}>{bannedUsers.length}</Text>
        </TouchableOpacity>
        </> : null
        }
        {privacy == 'private' ? 
        <>
        <Divider style={{borderWidth: 0.33, marginTop: 5, borderColor: theme.color}}/>
        <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('MemberRequests', {memberRequests: memberRequests, groupId: id})}>
            <View style={{flexDirection: 'row'}}>
                <MaterialIcons name='person-add' size={20} style={styles.icon} color={theme.color}/>
                <View>
                    <Text style={[styles.itemText, {color: theme.color}]}>Member Requests</Text>
                    {memberRequests.filter(obj => parseInt(obj.timestamp.seconds.toString() + obj.timestamp.nanoseconds.toString().slice(0, 3)) >= yesterday.getTime()).length == 0 ? <Text style={[styles.countText, {color: theme.color}]}>Nothing today</Text> :
                    <Text style={[styles.countText, {color: theme.color}]}>{memberRequests.filter(obj => parseInt(obj.timestamp.seconds.toString() + obj.timestamp.nanoseconds.toString().slice(0, 3)) >= yesterday.getTime()).length} member requests today</Text>}
                </View>
            </View>
            <Text style={[styles.itemText, {alignSelf: 'center', color: theme.color}]}>{memberRequests.length}</Text>
        </TouchableOpacity>
        </>
        :
        null
        }
        <Divider style={{borderWidth: 0.33, marginTop: 5, borderColor: theme.color}}/>
        <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('ReportedContent', {reported: reported, groupId: id})}>
            <View style={{flexDirection: 'row'}}>
                <MaterialIcons name='warning' size={20} style={styles.icon} color={theme.color} />
                <View>
                    <Text style={[styles.itemText, {color: theme.color}]}>Reported Content</Text>
                    {reported.filter(obj => obj != undefined? parseInt(obj.timestamp.seconds.toString() + obj.timestamp.nanoseconds.toString().slice(0, 3)) >= yesterday.getTime() : null).length == 0 ? <Text style={[styles.countText, {color: theme.color}]}>Nothing today</Text> :
                    <Text style={[styles.countText, {color: theme.color}]}>{reported.filter(obj => parseInt(obj.timestamp.seconds.toString() + obj.timestamp.nanoseconds.toString().slice(0, 3)) >= yesterday.getTime()).length} reported today</Text>}
                </View>
            </View>
            <Text style={[styles.itemText, {alignSelf: 'center', color: theme.color}]}>{reported.length}</Text>
        </TouchableOpacity>
        
      </View>
    <Divider style={{borderWidth: 0.33, marginTop: 5, borderColor: theme.color}}/> 
    </> : <>
    </>}      
    <Text style={[styles.header, {color: theme.color}]}>Settings</Text>
      <TouchableOpacity style={[styles.settingsContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => navigation.navigate('GroupSettingsSettings', {id: id, cliqueName: name, admin: admins.includes(user.uid)})}>
        <MaterialCommunityIcons name='account-group-outline' color={theme.color} size={20} style={styles.icon}/>
        <View style={{width: '100%'}}>
            <Text style={[styles.itemText, {color: theme.color}]}>Cliq Settings</Text>
            <Text style={[styles.countText, {color: theme.color}]}>{admins.includes(user.uid) ? 'Edit Cliq' : 'Request to be an Admin'}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.settingsContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => navigation.navigate('GroupAccountSettings', {id: id})}>
        <MaterialCommunityIcons name='account-settings-outline' size={20} color={theme.color} style={styles.icon}/>
        <View>
            <Text style={[styles.itemText, {color: theme.color}]}>Account Settings</Text>
            <Text style={[styles.countText, {color: theme.color}]}>Change Notifications & See Your Content</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
    <View style={styles.footer}>
        <NextButton text={"Leave Cliq"} onPress={leaveGroup} textStyle={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium',}}/>
        {admins.includes(user.uid) ? 
        <NextButton text={"Delete Cliq"} textStyle={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium',}} onPress={deleteGroup}/> : null
        }
        
    </View>
        </>
        </>
}
    </View>
  )
}

export default GroupSettings

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    reviewContainer: {
        borderRadius: 5
    },
    settingsContainer: {
        borderRadius: 5,
        flexDirection: 'row',
        marginBottom: '5%'
    },
    header: {
        fontSize: 24,
        padding: 10,
        fontFamily: 'Montserrat_600SemiBold',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    icon: {
        alignSelf: 'center',
        padding: 10
    },
    itemText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        padding: 10,
        paddingBottom: 0,
        //alignSelf: 'center'
    },
    countText: {
        fontSize: 15.36,
        padding: 5,
        alignSelf: 'center',
        fontFamily: 'Montserrat_500Medium',
        width: '85%',
        paddingLeft: 0,
        //marginLeft: '5%',
        marginRight: '5%'
    },
    footer: {
        //flex: 1,
        alignItems: 'flex-end',
        marginBottom: '5%',
        //width: '40%',
        marginHorizontal: '5%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    footerText: {
        fontSize: 15.36,
        padding: 10,
        fontFamily: 'Montserrat_500Medium',
        color: "#000",
    }
})