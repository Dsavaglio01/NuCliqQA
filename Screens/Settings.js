import { StyleSheet, Switch, Text, TouchableOpacity, View, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native'
import React, {useState, useEffect, useRef, useContext} from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-paper';
import {  deleteUser, getAuth, signOut } from 'firebase/auth';
import {  updateDoc, doc, onSnapshot} from 'firebase/firestore';
import useAuth from '../Hooks/useAuth'
import * as Notifications from 'expo-notifications';
import {BACKEND_URL} from "@env";
import themeContext from '../lib/themeContext';
import { db } from '../firebase'
const Settings = ({route}) => {
    const {username} = route.params;
    const navigation = useNavigation();
    const notificationListener = useRef();
    const theme = useContext(themeContext)
    const [isEnabled, setIsEnabled] = useState(true);
    const [notification, setNotification] = useState(null);
    const [notificationToken, setNotificationToken] = useState(null);
    const [privacyEnabled, setPrivacyEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const auth = getAuth();
    const {user} = useAuth()
    const responseListener = useRef();
    async function privateFunction(newValue) {
    setPrivacyEnabled(newValue);  // Update the UI immediately
    try {
        await fetch(`http://10.0.0.225:4000/api/privacy`, {
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
            setNotificationToken(docSnap.data().notificationToken)
        });
        return unsub;
    }, [])
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
                }},
              ]);
    }
  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity style={styles.left} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} onPress={!loading ? () => navigation.goBack() : null}>
                <MaterialCommunityIcons name='chevron-left' size={35} color={theme.color}/>
            </TouchableOpacity>
            <Text style={styles.headerText}>Settings</Text>
        </View>
        <Divider borderBottomWidth={0.8} style={{backgroundColor: '#fafafa'}}/>
        {loading ? <View style={styles.loading}>
        <ActivityIndicator size={'large'} color={"#9EDAFF"}/> 
        </View>: 
        <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
            <Divider />
            <TouchableOpacity style={styles.sections} onPress={() => navigation.navigate('LikedPosts')}>
                <Text style={styles.pushNotiText}>My Likes</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.sections} onPress={() => navigation.navigate('ContentList', {likes: false, mentions: false, history: false,
            comments: true, saves: false, events: false, groups: false, archived: false, cards: false, username: username, blocked: false})}>
                <Text style={styles.pushNotiText}>My Comments</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.sections} onPress={() => navigation.navigate('ContentList', {likes: false, mentions: false, history: false,
            comments: false, saves: true, events: false, groups: false, archived: false, cards: false, username: username, blocked: false})}>
                <Text style={styles.pushNotiText}>My Bookmarks</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.sections} onPress={() => navigation.navigate('ContentList', {likes: false, mentions: true, history: false,
            comments: false, saves: false, events: false, groups: false, archived: false, cards: false, username: username, blocked: false})}>
                <Text style={styles.pushNotiText}>My Mentions</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.sections} onPress={() => navigation.navigate('TransactionHistory')}>
                <Text style={styles.pushNotiText}>Transaction History</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.sections} onPress={() => navigation.navigate('ContentList', {likes: false, mentions: false, history: false,
            comments: false, saves: false, events: false, groups: false, archived: false, cards: false, username: username, blocked: true})}>
                <Text style={styles.pushNotiText}>Blocked Users</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.sections} onPress={() => navigation.navigate('Subscription')}>
                <Text style={styles.pushNotiText}>Subscriptions</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.sections} onPress={() => navigation.navigate('ReportProblem')}>
                <Text style={styles.pushNotiText}>Report a Problem</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <View style={styles.secondSections}>
                <Text style={styles.pushNotiText}>Push Notifications</Text>
                <Switch
                    trackColor={{false: '#767577', true: '#005278'}}
                    thumbColor={isEnabled ? '#f4f3f4' : '#f4f3f4'} 
                    onValueChange={(newValue) => notificationFunction(newValue)}
                    value={isEnabled}
                />
            </View>
            <View>
                <Text style={styles.tapToReceiveText}>Tap to Receive Notifications</Text>
            </View>
            <Divider />
            <View style={styles.secondSections}>
                <Text style={styles.pushNotiText}>Private Account</Text>
                <Switch
                    trackColor={{false: '#767577', true: '#005278'}}
                    thumbColor={privacyEnabled ? '#f4f3f4' : '#f4f3f4'} 
                    onValueChange={() => privateFunction(!privacyEnabled)}
                    value={privacyEnabled}
                />
            </View>
            <View>
                <Text style={styles.tapToReceiveText}>Tap to Make Account Private</Text>
            </View>
            <Divider />
            <TouchableOpacity style={styles.thirdSections} onPress={() => navigation.navigate('DataPolicy')}>
                <Text style={styles.bottomText}>Data Usage Policy</Text>
                <MaterialCommunityIcons name='chevron-right' size={25} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.thirdSections} onPress={() => navigation.navigate('DataRetentionPolicy')}>
                <Text style={styles.bottomText}>Data Retention Policy</Text>
                <MaterialCommunityIcons name='chevron-right' size={25} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.thirdSections} onPress={() => navigation.navigate('PrivacyPolicy')}>
                <Text style={styles.bottomText}>Privacy Policy</Text>
                <MaterialCommunityIcons name='chevron-right' size={25} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.thirdSections} onPress={() => navigation.navigate('TandC')}>
                <Text style={styles.bottomText}>Terms and Conditions</Text>
                 <MaterialCommunityIcons name='chevron-right' size={25} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={{padding: 5}} onPress={async() => await updateDoc(doc(db, 'profiles', user.uid),{
                notificationToken: null
            }).then(() => signOut(auth).catch((error) => {
                    Alert.alert(error.message)
                    throw error;
                }))}>
                <Text style={styles.bottomText}>Log Out</Text>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={{padding: 5}} onPress={() => deleteAccountFunction(user)}>
                <Text style={[styles.bottomText, {color: 'red'}]}>Delete Account</Text>
            </TouchableOpacity>
            
        </ScrollView> }
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212"
    },
    left: {
        alignSelf: 'center', 
        marginRight: 'auto'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: '8%',
        marginLeft: '5%',
        marginRight: '5%'
    },
    bottomText: {
        fontSize: 15.36,
        padding: 10,
        fontFamily: 'Montserrat_500Medium',
        paddingLeft: 5,
        color: "#fafafa"
    },
    pushNotiText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        padding: 5,
        color: "#fafafa"
    },
    tapToReceiveText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 5,
        paddingBottom: 10,
        color: "#fafafa"
    },
    sections: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: '5%',
        alignItems: 'center',
        paddingBottom: 10
    },
    secondSections: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: '5%',
        alignItems: 'center',
    },
    thirdSections: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: 0,
        alignItems: 'center',
        padding: 10,
    },
    headerText: {
        fontSize: 24,
        flex: 1,
        textAlign: 'center',
        paddingLeft: 0,
        fontFamily: 'Montserrat_700Bold',
        alignSelf: 'center',
        padding: 10,
        marginRight: '5%',
        color: "#fafafa"
    },
    loading: {
        flex: 1, 
        alignItems: 'center', 
        justifyContent:'center'
    },
    main: {
        marginLeft: '5%', 
        marginRight: '5%'
    }
})