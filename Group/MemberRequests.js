import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Image, FlatList, Alert} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import { Divider } from 'react-native-paper'
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import ThemeHeader from '../Components/ThemeHeader';
import NextButton from '../Components/NextButton';
import { Swipeable } from 'react-native-gesture-handler';
import { db } from '../firebase';
import useAuth from '../Hooks/useAuth';
import FastImage from 'react-native-fast-image';
import { deleteDoc, doc, setDoc, increment, updateDoc, serverTimestamp, getDoc, addDoc, collection, arrayUnion} from 'firebase/firestore';
import {BACKEND_URL} from "@env"
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
const MemberRequests = ({route}) => {
    let row = [];
    let prevOpenedRow;
    const {memberRequests, groupId} = route.params
    const [data, setData] = useState([])
    const theme = useContext(themeContext)
    const {user} = useAuth();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      const getData = () => {
        memberRequests.slice(0, 100).map(async(item) => {
         const docSnap = await getDoc(doc(db, 'profiles', item.id))
         const cliqSnap = await getDoc(doc(db, 'groups', groupId))
         setName(cliqSnap.data().name)
         setData(prevState => [...prevState, {id: item.id, userId: docSnap.id, ...docSnap.data()}])
        })
        //await getDoc(doc(db, 'profiles', ))
      }
      setTimeout(() => {
            setLoading(false)
        }, 1000);
      getData()
        //setData(memberRequests)
        
    }, [route.params?.memberRquests])
    const renderRequest = ({item, index}, onClick) => {
      //console.log(item)
        const closeRow = (index) => {
      //onsole.log('closerow');
      if (prevOpenedRow && prevOpenedRow !== row[index]) {
        prevOpenedRow.close();
      }
      prevOpenedRow = row[index];
    };
    async function deleteMemberRequest(item) {
      setData(data.filter(e => e.id != item.id))
     await deleteDoc(doc(db, 'profiles', item.userId, 'groupRequests',
      groupId)).then(async() => await deleteDoc(doc(db, 'groups', groupId, 'memberRequests', item.userId)))
    }
    const renderRightActions = (progress, dragX, onClick) => {
      return (
        <TouchableOpacity
          style={{
            margin: 0,
            alignContent: 'center',
            justifyContent: 'center',
            width: 70,
          }} onPress={() => deleteMemberRequest(item)}>
          <MaterialIcons name='delete-outline' size={35} style={{alignSelf: 'center', paddingBottom: 10}} color="red"/>
        </TouchableOpacity>
      );
    };
    return (
        <Swipeable renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, onClick)
        }
        onSwipeableOpen={() => closeRow(index)}
        ref={(ref) => (row[index] = ref)}
        rightOpenValue={-100}>
        <View style={index == 0 ? {margin: '2.5%', flexDirection: 'row', borderTopColor: "#d3d3d3", borderTopWidth: 1, paddingBottom: 10, width: '95%'} :
      {margin: '2.5%', marginTop: 0, flexDirection: 'row', borderTopColor: "#d3d3d3", borderTopWidth: 1, paddingBottom: 10, width: '95%'}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, marginTop: '5%'}}/>
          <View style={{alignItems: 'center', margin: '5%', marginLeft: '2.5%', marginRight: '7.5%', marginBottom: 0}}>
            <Text numberOfLines={1} style={[styles.addText, {paddingBottom: 0, color: theme.color}]}>@{item.userName}</Text>
            <Text style={[styles.addText, {color: theme.color}]}>Requested to be a member</Text>
          </View>
          <View style={{alignItems: 'center', justifyContent: 'center', marginTop: '5%'}}>
            <NextButton text={"Accept"} textStyle={{padding: 10, fontSize: 12.29,  fontFamily: 'Montserrat_500Medium',}} onPress={() => acceptRequest(item)}/>
            </View>
        </View>
        </View>
        </Swipeable>
    )
    }
    function cliqueRecommend() {
    fetch(`${BACKEND_URL}/api/cliqueRecommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cliqueId: groupId, userId: user.uid
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
  async function schedulePushAcceptNotification(id, cliqName, notificationToken) {
    //console.log(username)
    //console.log(notificationToken)
    console.log(id)
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
      if (notis) {
        console.log(cliqName) 
        console.log(notificationToken)
      fetch(`${BACKEND_URL}/api/acceptCliqNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cliqName: cliqName, pushToken: notificationToken, "content-available": 1,
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
    async function acceptRequest(item) {
      const docSnap = await getDoc(doc(db, 'groups', groupId))
      if (!docSnap.exists()) {
        Alert.alert('Cliq unavailable to accept member request')
      }
      else {
      setLoading(true)
      await deleteDoc(doc(db, 'profiles', item.userId, 'groupRequests',
      groupId)).then(async() => await deleteDoc(doc(db, 'groups', groupId, 'memberRequests', item.userId))).then(() => addDoc(collection(db, 'groups', groupId, 'notifications', item.userId, 'notifications'), {
      like: false,
      comment: false,
      friend: true,
      item: null,
      request: false,
      acceptRequest: true,
      postId: item.id,
      theme: false,
      report: false,
      requestUser: item.userId,
      requestNotificationToken: item.notificationToken,
      likedBy: [],
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'groups', groupId, 'notifications', item.userId, 'checkNotifications'), {
      userId: item.userId
    })).then(async() => await updateDoc(doc(db, 'groups', groupId), {
      members: arrayUnion(item.userId),
      allowMessageNotifications: arrayUnion(user.uid),
      allowPostNotifications: arrayUnion(user.uid)
      //timestamp: serverTimestamp()
    }).then(async() => await updateDoc(doc(db, "profiles", item.userId), {
            groupsJoined: arrayUnion(groupId)  
        })).then(() => setData(data.filter(e => e.id != item.id))).then(() => schedulePushAcceptNotification(item.userId, name, item.notificationToken)).catch((e) => console.log(e)))
        setTimeout(() => {
          setLoading(false)
        }, 1000);
      }
    }
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <ThemeHeader text={"Member Requests"} backButton={true}/>
        <Divider borderBottomWidth={0.4} borderColor={theme.color}/>
        {loading ? <View style={styles.noContentContainer}>
        <ActivityIndicator size={'large'} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View> : data.length > 0 ? 
        <View>
        <Text style={[styles.totalText, {color: theme.color}]}>Total no. of member requests: {data.length}</Text>
            <FlatList data={data}
            renderItem={renderRequest}
            keyExtractor={(item) => item.id}
            style={{height: '100%'}}
            ListFooterComponent={<View style={{paddingBottom: 200}}/>}
            />
            {/*  */}
        </View>
        : data.length == 0 ?
            <View style={styles.noContentContainer}>
                <Text style={[styles.noContentText, {color: theme.color}]}>No Member Requests!</Text>
                <MaterialCommunityIcons name='emoticon-happy-outline' color={theme.color} size={50} style={{alignSelf: 'center', marginTop: '5%'}}/>
            </View> : <View style={styles.noContentContainer}>
        <ActivityIndicator size={'large'} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View>}
    </View>
  )
}

export default MemberRequests

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContainer: {
        marginTop: '5%',
        marginLeft: '5%', 
        marginRight: '5%'
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    reportedText: {
        fontSize: 24,
         fontFamily: 'Montserrat_500Medium',
    },
    seeAllText: {
        color: '#007AFF',
        fontSize: 19.20,
         fontFamily: 'Montserrat_500Medium',
        alignSelf: 'center'
    },
    noContentText: {
        fontSize: 19.20,
         fontFamily: 'Montserrat_500Medium',
        //textAlign: 'center',
    },
    noContentContainer: {
        zIndex: 3,
        alignItems: 'center',
        marginTop: '60%'
        //marginTop: '-5%'
    },
    addText: {
        fontSize: 12.29,
         fontFamily: 'Montserrat_500Medium',
      color: "#090909",
      padding: 5,
      //width: '100%'
      //paddingLeft: 15,
    },
    totalText: {
         fontSize: 19.20,
          fontFamily: 'Montserrat_500Medium',
      color: "#090909",
      padding: 5,
      textAlign: 'center',
      marginTop: '2.5%'
    }
})