import { StyleSheet, Text, View, TouchableOpacity, Switch, FlatList, Image, Platform, ActivityIndicator, ScrollView} from 'react-native'
import React, {useState, useEffect, useRef, useContext} from 'react'
import { useNavigation } from '@react-navigation/native'
import {MaterialCommunityIcons, Entypo} from '@expo/vector-icons'
import { Divider, Provider, Menu} from 'react-native-paper'
import { onSnapshot, query, collection, orderBy, where, getFirestore, arrayRemove, arrayUnion, getDoc, updateDoc, doc, getDocs, limit, startAfter } from 'firebase/firestore'
import useAuth from '../Hooks/useAuth'
import FastImage from 'react-native-fast-image'
import * as Notifications from 'expo-notifications';
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold} from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
import { db } from '../firebase'
const GroupAccountSettings = ({route}) => {
    const {id} = route.params;
    const navigation = useNavigation();
    const theme = useContext(themeContext)
    const [isPostEnabled, setIsPostEnabled] = useState(false);
    const [isMessageEnabled, setIsMessageEnabled] = useState(false);
    const [isBothEnabled, setIsBothEnabled] = useState(false);
    const [notificationToken, setNotificationToken] = useState(null);
    const [posts, setPosts] = useState([])
    const [lastVisible, setLastVisible] = useState();
    const [loading, setLoading] = useState(true)
    const [isDead, setIsDead] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [requests, setRequests] = useState([]);
    const [notifications, setNotifications] = useState(true)

    const {user} = useAuth();
    const notificationListener = useRef();
    const responseListener = useRef();
    function getDateAndTime(timestamp) {
      if (timestamp != null) {
        const formattedDate = new Date(timestamp.seconds*1000)
        return formattedDate.toLocaleString()
      }
      
    }
    useEffect(() => {
      const getData = async() => {
        const docSnap = await getDoc(doc(db, 'groups', id))
        if (!docSnap.exists()) {
          setIsDead(true)
        }
        setGroupName(docSnap.data().name)
      }
      getData()
    }, [])
    useEffect(()=> {
      let unsub;
      const fetchCards = async () => {
        //const passes = await getDocs(collection(db, 'users', user.uid, 'passes')).then((snapshot) => snapshot.docs.map((doc) => doc.id));
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'requests'), where('actualRequest', '==', true)), (snapshot) => {
          setRequests(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
            //info: doc.data().info
          })))
        })
      } 
      fetchCards();
      return unsub;
    }, []);
    const getData = async() => {
        registerForPushNotificationsAsync().then(async(token) => setNotificationToken(token));

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
            setIsPostEnabled(false)
            setIsMessageEnabled(false)
            setIsBothEnabled(false)
            //alert('Failed to get push token for push notification!');
            return;
            }
            token = (await Notifications.getExpoPushTokenAsync()).data;

        return token;
        }
    useEffect(() => {
      const getNotiData = async() => {
        const postNoti = (await getDoc(doc(db, 'groups', id))).data().allowPostNotifications
        const messageNoti = (await getDoc(doc(db, 'groups', id))).data().allowMessageNotifications
        if (postNoti.includes(user.uid) && messageNoti.includes(user.uid)) {
          setIsBothEnabled(true)
          setIsPostEnabled(false)
          setIsMessageEnabled(false)
        } 
        else if (postNoti.includes(user.uid)) {
          setIsBothEnabled(false)
          setIsPostEnabled(true)
          setIsMessageEnabled(false)
        } 
        else if (messageNoti.includes(user.uid)) {
          setIsBothEnabled(false)
          setIsPostEnabled(false)
          setIsMessageEnabled(true)
        } 

      }
      getNotiData()
    }, [])
    useEffect(() => {
      const getData = async() => {
            const docSnap = await getDoc(doc(db, 'profiles', user.uid))
            setNotificationToken(docSnap.data().notificationToken)
        }
        getData()
    }, [])
    useEffect(() => {
      let unsub;
      const fetchCards = () => {
        unsub = onSnapshot(query(collection(db, 'groups', id, 'posts'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(10)), (snapshot) => {
        //console.log(snapshot.docs.length)
          setPosts(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            reportVisible: false,
            ...doc.data()
          })))
          setLastVisible(snapshot.docs[snapshot.docs.length - 1])
        })
      }
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
      return unsub;
    }, [])
    function fetchMoreData() {
      if (lastVisible != undefined) {
        let unsub;
        const fetchCards = () => {
          unsub = onSnapshot(query(collection(db, 'groups', id, 'posts'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10)), (snapshot) => {
          //console.log(snapshot.docs.length)
          const newData = [];
          snapshot.docs.map((doc) => {
            newData.push({
              id: doc.id,
              reportVisible: false,
              ...doc.data()
            })
          })
          setPosts([...posts, ...newData])
            setLastVisible(snapshot.docs[snapshot.docs.length - 1])
          })
        }
        fetchCards();
        return unsub;
      }
    }
    async function postNotificationFunction() {
      if (notificationToken != null) {
        await updateDoc(doc(db, 'groups', id), {
            allowPostNotifications: isPostEnabled ? arrayRemove(user.uid) : arrayUnion(user.uid),
            allowMessageNotifications: arrayRemove(user.uid)
        }).then(() => setIsPostEnabled(previousState => !previousState))
        .then(() => setIsMessageEnabled(false)).then(() => setIsBothEnabled(false))
      }
      else {
        getData()
      } 
    }
    async function postBothFunction() {
      if (notificationToken != null) {
        await updateDoc(doc(db, 'groups', id), {
            allowPostNotifications: arrayRemove(user.uid),
            allowMessageNotifications: arrayRemove(user.uid)
        }).then(async() => await updateDoc(doc(db, 'groups', id), {
            allowPostNotifications: arrayUnion(user.uid),
            allowMessageNotifications: arrayUnion(user.uid)
        })).then(() => setIsBothEnabled(previousState => !previousState))
        .then(() => setIsMessageEnabled(false)).then(() => setIsPostEnabled(false))
      }
      else {
        getData()
      } 
    }
    async function messageNotificationFunction() {
      if (notificationToken != null) {
        await updateDoc(doc(db, 'groups', id), {
            allowMessageNotifications: isMessageEnabled ? arrayRemove(user.uid) : arrayUnion(user.uid),
            allowPostNotifications: arrayRemove(user.uid)
        }).then(() => setIsMessageEnabled(previousState => !previousState))
        .then(() => setIsPostEnabled(false)).then(() => setIsBothEnabled(false))
      }
      else {
        getData()
      }
    }
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <Provider>
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      {isDead ? 
      <>
      <View style={styles.header}>
            <TouchableOpacity style={{alignSelf: 'center', marginRight: 'auto'}} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name='chevron-left' size={35} color={theme.color}/>
            </TouchableOpacity>
            <Text style={[styles.headerText, {color: theme.color}]}>Content Settings</Text>
        </View>
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginBottom: '25%'}}>
              <Text style={{fontSize: 24, padding: 10, fontFamily: 'Montserrat_500Medium', color: theme.color}}>Sorry, Cliq is unavailable</Text>
              <MaterialCommunityIcons name='emoticon-sad-outline' size={50} color={theme.color} style={{alignSelf: 'center', marginTop: '10%'}}/>
            </View>
            </>
            : 
        <>
      <View style={styles.header}>
            <TouchableOpacity style={{alignSelf: 'center', marginRight: 'auto'}} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name='chevron-left' size={35} color={theme.color}/>
            </TouchableOpacity>
            <Text style={[styles.headerText, {color: theme.color}]}>Content Settings</Text>
        </View>
        <Divider borderBottomWidth={0.8}/>
        <ScrollView style={styles.mainContainer}>
          <Divider />
            {/* <Text style={styles.notificationHeader}>Notifications</Text> */}
            <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('CliqueContentList', {likes: false,
            comments: false, saves: false, archived: false, posts: true, id: id, name: groupName})}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>My Posts</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            {/* <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('CliqueContentList', {likes: false,
            comments: false, saves: false, archived: true, posts: false, id: id})}>
                <Text style={styles.pushNotiText}>My Archived Posts</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}}/>
            </TouchableOpacity>
            <Divider /> */}
            <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('CliqueContentList', {likes: true, mentions: false,
            comments: false, saves: false, archived: false, posts: false, id: id, name: groupName})}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>My Likes</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('CliqueContentList', {likes: false, mentions: false,
            comments: true, saves: false, posts: false, archived: false, id: id, name: groupName})}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>My Comments</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('CliqueContentList', {likes: false, mentions: false,
            comments: false, saves: true, archived: false, posts: false, id: id, name: groupName})}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>My Bookmarks</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={[styles.sections, {paddingBottom: 10}]} onPress={() => navigation.navigate('CliqueContentList', {likes: false, mentions: true,
            comments: false, saves: false, archived: false, posts: false, id: id, name: groupName})}>
                <Text style={[styles.pushNotiText, {color: theme.color}]}>My Mentions</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
            </TouchableOpacity>
            <Divider />
             <>
             <View style={styles.sections}>
              <View>
                   <Text style={[styles.pushNotiText, {color: theme.color}]}>Post & Message Notifications</Text>
                 <Text style={[styles.tapToReceiveText, {width: '75%', color: theme.color}]}>Tap to Receive BOTH POST and MESSAGE Notifications</Text>
                </View>
                <Switch
                    trackColor={{false: '#767577', true: '#005278'}}
                    thumbColor={isBothEnabled ? '#f4f3f4' : '#f4f3f4'} 
                    onValueChange={postBothFunction}
                    value={isBothEnabled}
                    style={styles.switch}
                />
            </View>
            <View style={styles.sections}>
              <View>
                   <Text style={[styles.pushNotiText, {color: theme.color}]}>Post Notifications</Text>
                 <Text style={[styles.tapToReceiveText, {color: theme.color}]}>Tap to Receive ONLY POST Notifications</Text>
                </View>
                <Switch
                    trackColor={{false: '#767577', true: '#005278'}}
                    thumbColor={isPostEnabled ? '#f4f3f4' : '#f4f3f4'} 
                    onValueChange={postNotificationFunction}
                    value={isPostEnabled}
                    style={styles.switch}
                />
            </View>
            <View style={styles.sections}>
              <View>
                   <Text style={[styles.pushNotiText, {color: theme.color}]}>Message Notifications</Text>
                 <Text style={[styles.tapToReceiveText, {color: theme.color}]}>Tap to Receive ONLY MESSAGE Notifications</Text>
                </View>
                <Switch
                    trackColor={{false: '#767577', true: '#005278'}}
                    thumbColor={isMessageEnabled ? '#f4f3f4' : '#f4f3f4'} 
                    onValueChange={messageNotificationFunction}
                    value={isMessageEnabled}
                    style={styles.switch}
                />
            </View>
            </>
            
            
            
        </ScrollView>
        </>}
    </View>
    </Provider>
  )
}

export default GroupAccountSettings

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContainer: {
       // marginTop: '5%',
       flex: 1,
        marginLeft: '5%', 
        marginRight: '5%'
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    headerText: {
        fontSize: 24,
        fontFamily: 'Montserrat_500Medium',
        flex: 1,
        textAlign: 'center',
        paddingLeft: 0,
        fontWeight: '700',
        alignSelf: 'center',
        padding: 10,
        
        marginRight: '5%'
    },
    reportedText: {
        fontSize: 24,
        fontFamily: 'Montserrat_500Medium',
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
        width: '99.8%'
    },
    notificationHeader: {
        fontSize: 24,
        fontFamily: 'Montserrat_600SemiBold',
        fontWeight: '600',
        padding: 5
    },
    noContentText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        //flex: 1,
        textAlign: 'center',
        marginTop: '50%'
    },
    postName: {
    //alignSelf: 'center',
    paddingLeft: 20,
    fontSize: 15.36,
    fontFamily: 'Montserrat_700Bold',
    fontWeight: '700'
  },
  timestamp: {
    //alignSelf: 'center',
    paddingLeft: 20,
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    color: '#676767',
    paddingTop: 2.5
  },
  caption: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    //paddingLeft: 5,
    padding: 10
  },
  middleContainers: {
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  middleText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
        padding: 10,
        color: "#000",
  },
  middleContainer: {
    flexDirection: 'row',
    width: '90%',
    marginHorizontal: '5%',
    justifyContent: 'space-evenly'
  },
  middleIcon: {
    alignSelf: 'center',
    padding: 5
  },
  image: {
      height: 158,
    width: 158,
    borderRadius: 10
    },
  postFooter: {
      flexDirection: 'row',
      marginTop: '4%',
      width: '112%',
      //height: '10%',
      marginLeft: '-2%',
      justifyContent: 'space-between'
    },
    postFooterText: {
      fontSize: 12.29,
      color: "#090909",
      fontFamily: 'Montserrat_500Medium',
      padding: 5,
      alignSelf: 'center'
    },
    messageText: {
      fontSize: 19.20, color: "#000", alignSelf: 'center', fontWeight: '600', fontFamily: 'Montserrat_600SemiBold',
      padding: 7.5
    },
    postContainer: {
      borderWidth: 1,
      marginHorizontal: 10,
      padding: 5,
      marginBottom: 20,
      width: '44.6%', 
    },
    switch: {
      marginLeft: 'auto',
      marginRight: '2.5%'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        //justifyContent: 'space-between',
        marginTop: '8%',
        marginLeft: '5%',
        marginRight: '5%'
    },
    sections: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: '5%',
        alignItems: 'center',
    }
})