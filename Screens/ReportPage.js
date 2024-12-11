import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebase';
import { getDoc, doc, serverTimestamp, getDocs, collection, addDoc, updateDoc, arrayUnion} from 'firebase/firestore';
import {BACKEND_URL} from "@env";
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold} from '@expo-google-fonts/montserrat';
import useAuth from '../Hooks/useAuth';
import themeContext from '../lib/themeContext';
const ReportPage = ({route}) => {
    const {id, comments, message, cliqueMessage, cliq, cliqueId, post, reportedUser, video, comment, theme} = route.params;
    const [finishedReporting, setFinishedReporting] = useState(false);
    const [reportedContent, setReportedContent] = useState([]);
    const [notificationToken, setNotificationToken] = useState(null);
    const modeTheme = useContext(themeContext);
    const [loading, setLoading] = useState(false);
    const [cliqueName, setCliqueName] = useState('');
    const navigation = useNavigation();
    const {user} = useAuth();
    //console.log(theme)
    useEffect(() => {
    if (reportedUser) {
      const getData = async() => {
        const docSnap = await getDoc(doc(db, 'profiles', reportedUser))
        if (docSnap.exists()) {
        setNotificationToken(docSnap.data().notificationToken)
        }
      }
      getData();
    }
  }, [reportedUser])
  useEffect(() => {
     if (cliqueId) {
      const getData = async() => {
        const docSnap = await getDoc(doc(db, 'groups', cliqueId))
        setCliqueName(docSnap.data().name)
      }
      getData();
     }
  }, [cliqueId])
  async function schedulePushReportNotification(notificationToken) {
      let notis = (await getDoc(doc(db, 'profiles', reportedUser))).data().allowNotifications
      let banned = (await getDoc(doc(db, 'profiles', reportedUser))).data().banned
      if (notis && !banned) {
     fetch(`${BACKEND_URL}/api/reportNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pushToken: notificationToken, post: post, video: video, cliqueMessage: cliqueMessage, message: message, comment: comments, "content-available": 1, data: {routeName: 'NotificationScreen', deepLink: 'nucliqv1://NotificationScreen'}
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
  }
  }
  useEffect(() => {
    const getData = async() => {
        const querySnapshot = await getDocs(collection(db, 'profiles', reportedUser, 'reportedContent'))
        querySnapshot.forEach((doc) => {
          if (doc.exists()) {
            setReportedContent(prevState => [...prevState, doc.id])
          }
          
        })

      }
      getData();
  }, [])
    function onSecondPress(item) {
        setLoading(true)
        if (reportedContent.length < 10) {
      if (cliqueId) {
      addDoc(collection(db, 'profiles', reportedUser, 'reportedContent'), {
      content: id,
      reason: item,
      comment: comment,
      post: post,
      comments: comments,
      message: message,
      active: true,
      cliqueMessage: cliqueMessage,
      timestamp: serverTimestamp()
    }).then(post ? () => addDoc(collection(db, 'groups', cliqueId, 'reportedContent'), {
      content: id,
      reason: item,
      post: post,
      comments: comments,
      message: message,
      cliqueMessage: cliqueMessage,
      user: reportedUser,
      timestamp: serverTimestamp()
    }) : null).then(() => addDoc(collection(db, 'groups', cliqueId, 'notifications', reportedUser, 'notifications'), {
      like: false,
      comment: comment,
      friend: false,
      item: item,
      request: false,
      acceptRequest: false,
      theme: false,
      report: true,
      postId: id,
      requestUser: reportedUser,
      requestNotificationToken: notificationToken,
      likedBy: [],
      post: post,
      comments: comments,
      message: message,
      cliqueMessage: cliqueMessage,
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'groups', cliqueId, 'notifications', reportedUser, 'checkNotifications'), {
      userId: reportedUser
    })).then(post && video ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedPosts: arrayUnion(id)
    }).then(async() => await updateDoc(doc(db, 'videos', id), {
      reportedIds: arrayUnion(user.uid)
    })) : post && !video ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedPosts: arrayUnion(id)
    }).then(async() => await updateDoc(doc(db, 'posts', id), {
      reportedIds: arrayUnion(user.uid)
    })) : theme ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedThemes: arrayUnion(id)
    }) : message ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedMessages: arrayUnion(id)
    }) : comment ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedComments: arrayUnion(id)
    }) : null).then(() => schedulePushReportNotification(notificationToken)).then(() => setFinishedReporting(true))
    } 
    else {
      addDoc(collection(db, 'profiles', reportedUser, 'reportedContent'), {
      content: id,
      reason: item,
      post: post,
      comment: comment,
      comments: comments,
      message: message,
      cliqueMessage: cliqueMessage,
      theme: theme,
      timestamp: serverTimestamp()
    }).then(() => addDoc(collection(db, 'profiles', reportedUser, 'notifications'), {
      like: false,
comment: comment,
video: video,
      friend: false,
      item: item,
      request: false,
      acceptRequest: false,
      theme: theme,
      report: true,
      postId: id,
      requestUser: reportedUser,
      requestNotificationToken: notificationToken,
      post: post,
      comments: comments,
      message: message,
      cliqueMessage: cliqueMessage,
      likedBy: [],
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'profiles', reportedUser, 'checkNotifications'), {
      userId: reportedUser
    })).then(post && video ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedPosts: arrayUnion(id)
    }).then(async() => await updateDoc(doc(db, 'videos', id), {
      reportedIds: arrayUnion(user.uid)
    })) : post && !video ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedPosts: arrayUnion(id)
    }).then(async() => await updateDoc(doc(db, 'posts', id), {
      reportedIds: arrayUnion(user.uid)
    })): theme ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedThemes: arrayUnion(id)
    }) : message ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedMessages: arrayUnion(id)
    }) : comment ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedComments: arrayUnion(id)
    }) : null).then(() => schedulePushReportNotification(notificationToken)).then(() => setFinishedReporting(true))
    }
    }
    else {
      if (cliqueId) {
      addDoc(collection(db, 'profiles', reportedUser, 'reportedContent'), {
      content: id,
      reason: item,
      comment: comment,
      post: post,
      comments: comments,
      message: message,
      active: true,
      cliqueMessage: cliqueMessage,
      timestamp: serverTimestamp()
    }).then(post ? () => addDoc(collection(db, 'groups', cliqueId, 'reportedContent'), {
      content: id,
      reason: item,
      post: post,
      comments: comments,
      message: message,
      cliqueMessage: cliqueMessage,
      user: reportedUser,
      timestamp: serverTimestamp()
    }) : null).then(() => addDoc(collection(db, 'groups', cliqueId, 'notifications', reportedUser, 'notifications'), {
      like: false,
      comment: false,
      friend: false,
      item: item,
      comment: comment,
      request: false,
      acceptRequest: false,
      theme: false,
      report: true,
      postId: id,
      requestUser: reportedUser,
      requestNotificationToken: notificationToken,
      likedBy: [],
      post: post,
      comments: comments,
      message: message,
      cliqueMessage: cliqueMessage,
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'groups', cliqueId, 'notifications', reportedUser, 'checkNotifications'), {
      userId: reportedUser
    })).then(post && video ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedPosts: arrayUnion(id)
    }).then(async() => await updateDoc(doc(db, 'videos', id), {
      reportedIds: arrayUnion(user.uid)
    })) : post && !video ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedPosts: arrayUnion(id)
    }).then(async() => await updateDoc(doc(db, 'posts', id), {
      reportedIds: arrayUnion(user.uid)
    })) : theme ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedThemes: arrayUnion(id)
    }) : message ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedMessages: arrayUnion(id)
    }) : comment ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedComments: arrayUnion(id)
    }) : null).then(() => schedulePushReportNotification(notificationToken)).then(() => setFinishedReporting(true))
    } 
    else {
      addDoc(collection(db, 'profiles', reportedUser, 'reportedContent'), {
      content: id,
      reason: item,
      post: post,
      theme: theme,
      comment: comment,
      comments: comments,
      message: message,
      cliqueMessage: cliqueMessage,
      timestamp: serverTimestamp()
    }).then(() => addDoc(collection(db, 'profiles', reportedUser, 'notifications'), {
      like: false,
comment: comment,
      friend: false,
      item: item,
      request: false,
      video: video,
      acceptRequest: false,
      theme: theme,
      report: true,
      postId: id,
      requestUser: reportedUser,
      requestNotificationToken: notificationToken,
      post: post,
      comments: comments,
      message: message,
      cliqueMessage: cliqueMessage,
      likedBy: [],
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'profiles', reportedUser, 'checkNotifications'), {
      userId: reportedUser
    })).then(post && video ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedPosts: arrayUnion(id)
    }).then(async() => await updateDoc(doc(db, 'videos', id), {
      reportedIds: arrayUnion(user.uid)
    })) : post && !video ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedPosts: arrayUnion(id)
    }).then(async() => await updateDoc(doc(db, 'posts', id), {
      reportedIds: arrayUnion(user.uid)
    })) : theme ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedThemes: arrayUnion(id)
    }) : message ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedMessages: arrayUnion(id)
    }) : comment ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedComments: arrayUnion(id)
    }) : null).then(() => schedulePushReportNotification(notificationToken)).then(() => setFinishedReporting(true))
    }
    }
    setTimeout(() => {
        setLoading(false)
    }, 1000);
    }
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
            <View style={[styles.container, {backgroundColor: modeTheme.backgroundColor}]}>
                {loading ? <View style={{flex: 1, alignItems: 'center', justifyContent:'center', marginBottom: '20%'}}>
        <ActivityIndicator size={'large'} color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View> : !finishedReporting ? 
                <>
                <MaterialCommunityIcons name='close' size={30} color={modeTheme.color} style={{margin: '5%', textAlign: 'right', marginBottom: 0}} onPress={() => navigation.goBack()}/>
                <Text style={[styles.reportContentText, {color: modeTheme.color}]}>Why Are You Reporting This Content?</Text>
                <Text style={[styles.reportSupplementText, {marginBottom: '5%', color: modeTheme.color}]}>Don't Worry Your Response is Anonymous! If it is a Dangerous Emergency, Call the Authorities Right Away!</Text>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Discrimination')}>
                  <Text style={[styles.reportSupplementText, {color: modeTheme.color}]}>Discrimination</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('General Offensiveness')}>
                  <Text style={[styles.reportSupplementText, {color: modeTheme.color}]}>General Offensiveness</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Gore/Excessive Blood')}>
                  <Text style={[styles.reportSupplementText, {color: modeTheme.color}]}>Gore / Excessive Blood</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Nudity/NSFW Sexual Content')}>
                  <Text style={[styles.reportSupplementText, {color: modeTheme.color}]}>Nudity / NSFW Sexual Content</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Scammer/Fraudulent User')}>
                  <Text style={[styles.reportSupplementText, {color: modeTheme.color}]}>Scammer / Fraudulent User</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Spam')}>
                  <Text style={[styles.reportSupplementText, {color: modeTheme.color}]}>Spam</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Toxic/Harassment')}>
                  <Text style={[styles.reportSupplementText, {color: modeTheme.color}]}>Toxic / Harassment</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Violent Behavior')}>
                  <Text style={[styles.reportSupplementText, {color: modeTheme.color}]}>Violent Behavior</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Other')}>
                  <Text style={[styles.reportSupplementText, {color: modeTheme.color}]}>Other</Text>
                  
                </TouchableOpacity> 
            </>  : 
            <View style={{flex: 1}}>
            <MaterialCommunityIcons name='close' color={modeTheme.color} size={35} style={{margin: '5%', textAlign: 'right', marginBottom: 0}} onPress={() => navigation.goBack()}/>
            <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
            <Text style={[styles.reportContentText, {fontSize: 24, fontWeight: '600', color: modeTheme.color, fontFamily: 'Montserrat_600SemiBold', marginVertical: '5%'}]}>Thanks for submitting your anonymous response!</Text>
            <Text style={[styles.reportContentText, {fontSize: 24, fontWeight: '600', color: modeTheme.color, fontFamily: 'Montserrat_600SemiBold', marginVertical: '5%'}]}>User has been notified about the report.</Text>
            <Text style={[styles.reportContentText, {fontSize: 24, fontWeight: '600', color: modeTheme.color, fontFamily: 'Montserrat_600SemiBold', marginVertical: '5%'}]}>Thanks for keeping NuCliq safe!</Text>
            </View>
            </View>
            }
        </View>
  )
}

export default ReportPage

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    reportText: {
    color: "red",
    fontSize: 19.20,
    fontFamily: 'Montserrat_500Medium', 
    textAlign: 'center',
    padding: 10,
    paddingTop: 5
  },
  reportContentText: {
    fontSize: 19.20,
    fontFamily: 'Montserrat_500Medium', 
    textAlign: 'center',
    padding: 10
  },
  reportSupplementText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium', 
    padding: 10,
    alignSelf: 'center'
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginLeft: '5%',
    padding: 5
  }
})