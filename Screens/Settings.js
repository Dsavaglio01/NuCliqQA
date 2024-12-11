import { StyleSheet, Switch, Text, Touchable, TouchableOpacity, View, ScrollView, Alert, Platform, ActivityIndicator, DeviceEventEmitter } from 'react-native'
import React, {useState, useCallback, useEffect, useRef, useContext} from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
//import Slider from '@react-native-community/slider';
import { Divider } from 'react-native-paper';
import { deleteAccount, deleteUser, getAuth, signOut } from 'firebase/auth';
import { getFirestore, updateDoc, doc, getDoc, setDoc, query, onSnapshot, deleteDoc, where, getDocs, collection, increment } from 'firebase/firestore';
import useAuth from '../Hooks/useAuth'
import * as Notifications from 'expo-notifications';
import {BACKEND_URL} from "@env";
import { useFonts, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
//import {EventRegister} from 'react-native-event-listeners'
import themeContext from '../lib/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase'
const Settings = ({route}) => {

    const {username} = route.params;
    //const {logout} = useAuth();
    const navigation = useNavigation();
    const notificationListener = useRef();
    const theme = useContext(themeContext)
    const [isEnabled, setIsEnabled] = useState(true);
    const [notification, setNotification] = useState(null);
    const [activityEnabled, setActivityEnabled] = useState(true);
    const [isLocationEnabled, setIsLocationEnabled] = useState(true);
    const [notificationToken, setNotificationToken] = useState(null);
    const [privacyEnabled, setPrivacyEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [darkmode, setDarkmode] = useState(false);
    const [range, setRange] = useState(30);
    const [posts, setPosts] = useState([]);
    const [groupsJoined, setGroupsJoined] = useState([]);

    const [friends, setFriends] = useState([]);
    const [gettingData, setGettingData] = useState(false);
    const [comments, setComments] = useState([]);
    const [cliqueComments, setCliqueComments] = useState([]);
    const [cliquePosts, setCliquePosts] = useState([]);
    const auth = getAuth();
    const {user} = useAuth()
    const responseListener = useRef();
    //console.log(user.uid)
    const toggleActivitySwitch = () => setActivityEnabled(previousState => !previousState);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    const toggleLocationSwitch = () => setIsLocationEnabled(previousState => !previousState);
    //const togglePrivacySwitch = () => setPrivacyEnabled(previousState => !previousState);
    //const auth = getAuth();
    const saveDarkmode = async (value) => {
  try {
    await AsyncStorage.setItem('darkmode', JSON.stringify(value));
  } catch (error) {
    console.error('Error saving darkmode:', error);
  }
};
async function activeFunction(newValue) {
    setActivityEnabled(newValue)
    try {
        await updateDoc(doc(db, 'profiles', user.uid), {
            showStatus: newValue
        })
    } catch (error) {
         console.error("Error updating document: ", error);
        setActivityEnabled(!newValue);  // Revert state if the update fails
    }
    }
    async function privateFunction(newValue) {
    setPrivacyEnabled(newValue);  // Update the UI immediately
    try {
        const response = await fetch(`${BACKEND_URL}/api/privacy`, {
                          method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                          headers: {
                            'Content-Type': 'application/json', // Set content type as needed
                          },
                          body: JSON.stringify({ data: {user: user.uid, newValue: newValue
                          }}), // Send data as needed
                        })
    } catch (error) {
        console.error("Error updating document: ", error);
        setPrivacyEnabled(!newValue);  // Revert state if the update fails
    }
}
    
    
async function notificationFunction(newValue) {
    setIsEnabled(newValue);  // Update the state immediately

    if (notificationToken != null) {
        try {
            await updateDoc(doc(db, 'profiles', user.uid), {
                allowNotifications: newValue
            });
        } catch (error) {
            console.error("Error updating document: ", error);
            setIsEnabled(!newValue);  // Revert state if the update fails
        }
    } else {
        getData();
    }
}
    const getData = async() => {
        registerForPushNotificationsAsync().then(async(token) => {
        await updateDoc(doc(db, 'profiles', user.uid), {
            notificationToken: token,
            allowNotifications: true
        })});

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log(response);
        });

        return () => {
          Notifications.removeNotificationSubscription(notificationListener.current);
          Notifications.removeNotificationSubscription(responseListener.current);
        };
      
    }
    const deleteAccount = (user) => {
        deleteUser(user).then(() => {
        console.log('deleted user')
      }).catch((error) => {
        if (error.message.includes('requires-recent-login')) {
          Alert.alert('Requires recent login', 'Please sign out and log back in again to delete account.');
          setLoading(false)
        }
        //console.log(Alert.alert('Title:', error.message))
        //console.log(error)
        //Alert.alert(error, error)
      })
    }
    async function registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            });
        }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
            }
            if (finalStatus !== 'granted') {
            setIsEnabled(false)
            //alert('Failed to get push token for push notification!');
            return;
            }
            token = (await Notifications.getExpoPushTokenAsync()).data;

        return token;
        }
    
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "profiles", user.uid), (docSnap) => {
            setPrivacyEnabled(docSnap.data().private)
            if (docSnap.data().allowNotifications && docSnap.data().notificationToken) {
                setIsEnabled(true)
            }
            else {
                setIsEnabled(false)
            }
            //setIsEnabled(docSnap.data().allowNotifications)
            setActivityEnabled(docSnap.data().showStatus)
            setNotificationToken(docSnap.data().notificationToken)
        });
        return unsub;
        /* const getData = async() => {
            const docSnap = await getDoc(doc(db, 'profiles', user.uid))
            setPrivacyEnabled(docSnap.data().private)
            if (docSnap.data().allowNotifications && docSnap.data().notificationToken) {
                setIsEnabled(true)
            }
            else {
                setIsEnabled(false)
            }
            //setIsEnabled(docSnap.data().allowNotifications)
            setActivityEnabled(docSnap.data().showStatus)
            setNotificationToken(docSnap.data().notificationToken)
        }
        setGettingData(true)
        getData() */
    }, [])
    /* useEffect(() => {
        if (gettingData) {
            let unsub2;
            let unsub3;
            const getData = async() => {
                
            const postSnap = await getDocs(collection(db, 'profiles', user.uid, 'posts'))
            const commentSnap = await getDocs(collection(db, 'profiles', user.uid, 'comments'))
            postSnap.forEach((doc) => {
            setPosts(prevState => [...prevState, {id: doc.id, ...doc.data()}])
            
            });
            commentSnap.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            setComments(prevState => [...prevState, {id: doc.id, ...doc.data()}])
            
            });
            groupsJoined.forEach(async(item) => {
                const docSnap = await getDocs(collection(db, 'groups', item, 'profiles', user.uid, 'posts'))
                docSnap.forEach((doc) => {
            setCliquePosts(prevState => [...prevState, {id: doc.id, groupId: item, ...doc.data()}])
            
            });

                const commentSnap = await getDocs(collection(db, 'groups', item, 'profiles', user.uid, 'comments'))
                commentSnap.forEach((e) => {
                    setCliqueComments(prevState => [...prevState, {id: e.id, groupId: item, ...e.data()}])
                })
            })
            
        }
        getData()
        let unsub;
        const fetchCards = async () => {
            unsub = onSnapshot(query(collection(db, 'friends'), where('users', 'array-contains', user.uid)), (snapshot) => {
            setFriends(snapshot.docs.map((doc)=> ( {
            id: doc.id
            })))
            })
        } 
        fetchCards();
        setTimeout(() => {
            setLoading(false)
        }, 1000);
        return unsub, unsub2, unsub3;
        
        
        }
    }, [gettingData]) */
    const deleteAccountFunction = async() => {
        Alert.alert('Are you sure you want to delete your account?', 'If you do delete your account, you will be unable to access this account and the content associated with this account again including credits. To make a new account, make sure to completely close app to restart the process.', [
                {
                  text: 'NO',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'YES', onPress: () => {
                    setLoading(true)
                    deleteAccount(user)
                    //deleteUser(user)
                    //signOut(auth)
                    /* await setDoc(doc(db, 'deletedProfiles', user.uid)).then(async() => await deleteDoc(doc(db, 'usernames', user.uid)))
                    .then(() => posts.map(async(item) => await deleteDoc(doc(db, 'posts', item.id)).then(async() => await setDoc(doc(db, 'deletedPosts', item.id), {
        info: item,
        username: item.username,
        userId: item.userId,
        timestamp: serverTimestamp()
      })))).then(() => cliquePosts.map(async(item) => await deleteDoc(doc(db, 'groups', item.groupId, 'posts', item.id)).then(async() => await setDoc(doc(db, 'deletedCliquePosts', item.id), {
        info: item,
        cliqueId: item.groupId,
        username: item.username,
        userId: item.userId,
        timestamp: serverTimestamp()
      })))).then(() => friends.map(async(item) => await deleteDoc(db, 'friends', item.id)))
                    .then(() => adminGroups.map(async(item) => { const docSnap  = (await getDoc(doc(db, 'groups', item.id)))
    if (docSnap.data().admins.length == 1) {
      await deleteDoc(doc(db, 'groups', item.id)).then(async() => await setDoc(doc(db, 'deletedCliques', item.id), {
        timestamp: serverTimestamp(),
        members: docSnap.data().members,
        admins: docSnap.data().admins,
        info: docSnap.data()
      }))
    }
    else if (docSnap.data().admins.length > 1) {
      await updateDoc(doc(db, 'groups', item.id), {
        members: arrayRemove(user.uid),
        admins: arrayRemove(user.uid)
      }).catch((e) => console.log(e))
    }
    
                    })).then(() => groups.filter((e) => !adminGroups.includes(e)).map(async(item) => 
                    await updateDoc(doc(db, 'groups', item.id), {
                        members: arrayRemove(user.uid)
                    }).catch((e) => console.log(e)))).then(() => comments.map(async(item) => await deleteDoc(doc(db, 'posts', item.postId, 'comments', item.id)).then(async() => await setDoc(doc(db, 'deletedComments', item.id), {
        postId: item.postId,
        user: item.user,
        username: item.username,
        info: item,
        timestamp: serverTimestamp()
      })).then(async() => await updateDoc(doc(db, 'posts', item.postId), {
                        comments: increment(-1)
                    }))))
                    .then(() => cliqueComments.map(async(item) => await deleteDoc(doc(db, 'groups', item.groupId, 'posts', item.postId, 'comments', item.id)).then(async() => await setDoc(doc(db, 'deletedCliqueComments', item.id), {
        cliqueId: item.groupId,
        postId: item.postId,
        user: item.user,
        username: item.username,
        info: item,
        timestamp: serverTimestamp()
      })).then(async() => await updateDoc(doc(db, 'groups', item.groupId, 'posts', item.postId), {
                        comments: increment(-1)
                    })))) */
                }},
              ]);
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
        <View style={styles.header}>
            <TouchableOpacity style={{alignSelf: 'center', marginRight: 'auto'}} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} onPress={!loading ? () => navigation.goBack() : null}>
                <MaterialCommunityIcons name='chevron-left' size={35} color={theme.color}/>
            </TouchableOpacity>
            <Text style={[styles.headerText,  {color: theme.color}]}>Settings</Text>
        </View>
        <Divider borderBottomWidth={0.8} style={{backgroundColor: theme.color}}/>
        {loading ? <View style={{flex: 1, alignItems: 'center', justifyContent:'center'}}>
        <ActivityIndicator size={'large'} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View>: 
        <ScrollView style={{marginLeft: '5%', marginRight: '5%'}} showsVerticalScrollIndicator={false}>
            
            
            <Divider />
            {/* <Text style={styles.notificationHeader}>Notifications</Text> */}
            {/* <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('ContentList', {likes: false,
            comments: false, saves: false, events: false, groups: false, archived: true, cards: false, username: username, blocked: false})}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>My Archived Posts</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}}/>
            </TouchableOpacity>
            <Divider /> */}
            <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('LikedPosts')}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>My Likes</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('ContentList', {likes: false, mentions: false, history: false,
            comments: true, saves: false, events: false, groups: false, archived: false, cards: false, username: username, blocked: false})}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>My Comments</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('ContentList', {likes: false, mentions: false, history: false,
            comments: false, saves: true, events: false, groups: false, archived: false, cards: false, username: username, blocked: false})}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>My Bookmarks</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('ContentList', {likes: false, mentions: true, history: false,
            comments: false, saves: false, events: false, groups: false, archived: false, cards: false, username: username, blocked: false})}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>My Mentions</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            {/* <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('All', {goToPurchased: true, name: null})}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>My Themes</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}}/>
            </TouchableOpacity>
            <Divider /> */}
            <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('TransactionHistory')}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>Transaction History</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            {/* <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('ContentList', {likes: false, mentions: false, history: false,
            comments: false, saves: false, events: false, groups: false, archived: false, cards: true, username: username, blocked: false})}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>My Saved Payments Methods</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider /> */}
            <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('ContentList', {likes: false, mentions: false, history: false,
            comments: false, saves: false, events: false, groups: false, archived: false, cards: false, username: username, blocked: true})}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>Blocked Users</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('ReportProblem')}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>Report a Problem</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            {/* <View style={[styles.sections, {paddingBottom: 10}]}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>Dark Mode</Text>
                <Switch
                    trackColor={{false: '#767577', true: '#005278'}}
                    thumbColor={darkmode ? '#f4f3f4' : '#f4f3f4'} 
                    onValueChange={(value) =>{setDarkmode(value);
                    DeviceEventEmitter.emit('ChangeTheme', value); saveDarkmode(value);}}
                    value={theme.theme == 'light' ? false : true}
                />
            </View>
            <Divider /> */}
            {/* <View style={[styles.sections, {paddingBottom: 10}]}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>Show Active Status</Text>
                <Switch
                    trackColor={{false: '#767577', true: '#005278'}}
                    thumbColor={activityEnabled ? '#f4f3f4' : '#f4f3f4'} 
                    onValueChange={() => activeFunction(!activityEnabled)}
                    value={activityEnabled}
                />
            </View>
            <Divider /> */}
            <View style={styles.sections}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>Push Notifications</Text>
                <Switch
                    trackColor={{false: '#767577', true: '#005278'}}
                    thumbColor={isEnabled ? '#f4f3f4' : '#f4f3f4'} 
                    onValueChange={(newValue) => notificationFunction(newValue)}
                    value={isEnabled}
                />
            </View>
            <View>
                <Text style={[styles.tapToReceiveText, {color: theme.color}]}>Tap to Receive Notifications</Text>
            </View>
            <Divider />
            <View style={styles.sections}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>Private Account</Text>
                <Switch
                    trackColor={{false: '#767577', true: '#005278'}}
                    thumbColor={privacyEnabled ? '#f4f3f4' : '#f4f3f4'} 
                    onValueChange={() => privateFunction(!privacyEnabled)}
                    value={privacyEnabled}
                />
            </View>
            <View>
                <Text style={[styles.tapToReceiveText, {color: theme.color}]}>Tap to Make Account Private</Text>
            </View>
            <Divider />
            {/* <TouchableOpacity onPress={() => navigation.navigate('AccountInfoTemp')}>
            <View style={styles.sections}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>Account Information</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </View>
            <View>
                <Text style={[styles.tapToReceiveText, {color: theme.color}]}>See account information such as Email and Username</Text>
            </View>
            </TouchableOpacity>
            <Divider /> */}
            <TouchableOpacity style={[styles.sections, {alignItems: 'center', marginTop: 0, padding: 10}]} onPress={() => navigation.navigate('DataPolicy')}>
                <Text style={[styles.bottomText, {color: theme.color}]}>Data Usage Policy</Text>
                <MaterialCommunityIcons name='chevron-right' size={25} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={[styles.sections, {alignItems: 'center', marginTop: 0, padding: 10}]} onPress={() => navigation.navigate('DataRetentionPolicy')}>
                <Text style={[styles.bottomText, {color: theme.color}]}>Data Retention Policy</Text>
                <MaterialCommunityIcons name='chevron-right' size={25} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={[styles.sections, {alignItems: 'center', marginTop: 0, padding: 10}]} onPress={() => navigation.navigate('PrivacyPolicy')}>
                <Text style={[styles.bottomText, {color: theme.color}]}>Privacy Policy</Text>
                <MaterialCommunityIcons name='chevron-right' size={25} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={[styles.sections, {alignItems: 'center', marginTop: 0, padding: 10}]} onPress={() => navigation.navigate('TandC')}>
                <Text style={[styles.bottomText, {color: theme.color}]}>Terms and Conditions</Text>
                 <MaterialCommunityIcons name='chevron-right' size={25} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            {/* <TouchableOpacity style={[styles.sections, {alignItems: 'center', marginTop: 0}]} onPress={() => navigation.navigate('Licensing')}>
                <Text style={[styles.bottomText, {color: theme.color}]}>Licensing</Text>
                 <MaterialCommunityIcons name='chevron-right' size={25} style={{alignSelf: 'center'}}/>
            </TouchableOpacity>
            <Divider /> */}
            <TouchableOpacity style={{padding: 5}} onPress={async() => await updateDoc(doc(db, 'profiles', user.uid),{
                notificationToken: null
            }).then(() => signOut(auth).catch((error) => {
                    Alert.alert(error.message)
                    throw error;
                }))}>
                <Text style={[styles.bottomText, {color: theme.color}]}>Log Out</Text>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={{padding: 5}} onPress={() => deleteAccountFunction(user)}>
                <Text style={[[styles.bottomText, {color: theme.color}], {color: 'red'}]}>Delete Account</Text>
            </TouchableOpacity>
            
        </ScrollView> }
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        //justifyContent: 'space-between',
        marginTop: '8%',
        marginLeft: '5%',
        marginRight: '5%'
    },
    
    bottomText: {
        fontSize: 15.36,
        padding: 10,
         fontFamily: 'Montserrat_500Medium',
        paddingLeft: 5,
        //paddingLeft: 5,
        //paddingTop: 0
    },
    pushNotiText: {
        fontSize: 19.20,
         fontFamily: 'Montserrat_500Medium',
        padding: 5,
    },
    tapToReceiveText: {
        fontSize: 15.36,
         fontFamily: 'Montserrat_500Medium',
        padding: 5,
        paddingBottom: 10,
    },
    notificationHeader: {
        fontSize: 24,
         fontFamily: 'Montserrat_500Medium',
        fontWeight: '600',
        padding: 5
    },
    sections: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: '5%',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 24,
        flex: 1,
        textAlign: 'center',
        paddingLeft: 0,
         fontFamily: 'Montserrat_700Bold',
        alignSelf: 'center',
        padding: 10,
       // marginLeft: '-5%'
        
        marginRight: '5%'
    },
})