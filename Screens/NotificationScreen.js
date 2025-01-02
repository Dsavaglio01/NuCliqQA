import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator} from 'react-native'
import React, { useContext } from 'react'
import * as Notifications from 'expo-notifications'
import { useState, useEffect, useMemo } from 'react';
import { query, collection, getDoc, getDocs, deleteDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../Hooks/useAuth';
import { MaterialCommunityIcons} from '@expo/vector-icons'
import themeContext from '../lib/themeContext';
import { useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-paper';
import NotificationComponent from '../Components/NotificationComponent';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
const NotificationScreen = () => {
    const [completeNotificationsDone, setCompleteNotificationsDone] = useState(false);
    const [notificationDone, setNotificationDone] = useState(false);
    const [notifications, setNotifications] = useState([])
    const navigation = useNavigation();
    const [completeNotifications, setCompleteNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const {user} = useAuth();
    const modeTheme = useContext(themeContext)
    useEffect(() => {
      deleteCheckedNotifications()
    }, [])
    async function deleteCheckedNotifications() {
      const querySnapshot = await getDocs(collection(db, "profiles", user.uid, 'checkNotifications'));
      querySnapshot.forEach(async(docu) => {
        await deleteDoc(doc(db, 'profiles', user.uid, 'checkNotifications', docu.id))
      });
    }
  useEffect(() => {
        setNotificationDone(false)
        let templist = []
      const fetchCards = async () => {
        const q = query(collection(db, "profiles", user.uid, 'notifications'), orderBy('timestamp', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            templist.push({id: doc.id, loading: false, ...doc.data()})
          });
         setNotifications(templist)
      }
      
      setTimeout(() => {
        setNotificationDone(true)
      }, 1000);
      fetchCards();
    }, [])
     useMemo(() => {
      if (notificationDone) {
        //setLoading(true)
        let newData = [];
        let tempList = [];
        setCompleteNotifications([])
        Promise.all(notifications.map(async(item) => {
    
          if (item.like && !item.video) {   
            //console.log(item)      
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'posts', item.item))
            if (dataSnap.exists() && docSnap.exists()) {
            if (!newData.includes(dataSnap.id)) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
               //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
                newData.push(dataSnap.id)
            }
            
            }
          }
          else if (item.like && item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'videos', item.item))
            if (dataSnap.exists() && docSnap.exists()) {
            if (!newData.includes(dataSnap.id)) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
               //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
                newData.push(dataSnap.id)
            }
            
            }
          }
          else if (item.report) {
            if (item.comments) {
              tempList.push({item})
              //setCompleteNotifications(prevState => [...prevState, {item}])
            }
            else if (item.post && !item.video) {
              const postSnap = await getDoc(doc(db, 'posts', item.postId))
              if (postSnap.exists()) {
                tempList.push({item, postInfo: {id: postSnap.id, ...postSnap.data()}})
              }
            }
            else if (item.post && item.video) {
              const postSnap = await getDoc(doc(db, 'videos', item.postId))
              if (postSnap.exists()) {
                tempList.push({item, postInfo: {id: postSnap.id, ...postSnap.data()}})
              }
            }
            else if (item.message) {
              //setCompleteNotifications(prevState => [...prevState, {item}])
              tempList.push({item})
            }
            else if (item.theme) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = (await getDoc(doc(db, 'products', item.postId)))
            const freeDataSnap = (await getDoc(doc(db, 'freeThemes', item.postId)))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data(), free: false})
              //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data(), free: false}])
            }
            else if (freeDataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: freeDataSnap.id, ...freeDataSnap.data()}, info: docSnap.data(), free: true})
              //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: freeDataSnap.id, ...freeDataSnap.data()}, info: docSnap.data(), free: true}])
            }
          }
          }
          else if (item.comment && !item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'posts', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
            //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          } 
          else if (item.comment && item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'videos', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
            //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.reply && !item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'posts', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
            //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.reply && item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'videos', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
            //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.acceptRequest) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            if (docSnap.exists()) {
              tempList.push({item, info: {id: docSnap.id, ...docSnap.data()}})
              //setCompleteNotifications(prevState => [...prevState, {item, info: {id: docSnap.id, ...docSnap.data()}}])
            }
            
          }
          else if (item.request) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            if (docSnap.exists()) {
              tempList.push({item, info: {id: docSnap.id, ...docSnap.data()}})
              //setCompleteNotifications(prevState => [...prevState, {item, info: {id: docSnap.id, ...docSnap.data()}}])
            }
          }
          else if (item.friend) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            if (docSnap.exists()) {
              tempList.push({item, info: {id: docSnap.id, ...docSnap.data()}})
              //setCompleteNotifications(prevState => [...prevState, {item, info: {id: docSnap.id, ...docSnap.data()}}])
            }
            
          }
          else if (item.mention && !item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'posts', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
             //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.mention && item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'videos', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
             //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.postMention && !item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'posts', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
             //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.postMention && item.video) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'videos', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
             //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.repost) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'posts', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
            //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.remove || item.ban) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'groups', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()})
             //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.theme) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = (await getDoc(doc(db, 'products', item.postId)))
            const freeDataSnap = (await getDoc(doc(db, 'freeThemes', item.postId)))
            if (dataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data(), free: false})
              //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data(), free: false}])
            }
            else if (freeDataSnap.exists() && docSnap.exists()) {
              tempList.push({item, postInfo: {id: freeDataSnap.id, ...freeDataSnap.data()}, info: docSnap.data(), free: true})
              //setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: freeDataSnap.id, ...freeDataSnap.data()}, info: docSnap.data(), free: true}])
            }
          }
          
        })).then(() => setCompleteNotifications(tempList)).finally(() => {setLoading(false); setCompleteNotificationsDone(true)})
       
      }
      
    }, [notificationDone])
    
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={{alignSelf: 'center'}} hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }} onPress={() => navigation.goBack()} >
          <MaterialCommunityIcons name='chevron-left' color={"#fafafa"} size={35} onPress={() => navigation.goBack()} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Notifications</Text>
      </View>
      <Divider />
      <View style={{flex: 1}}>
        {<>
        {loading ? <View style={styles.loading}>
            <ActivityIndicator color={"#9EDAFF"}/> 
          </View> : 
          notifications.length > 0 ? 
            <>
              {!loading && completeNotificationsDone ? <View style={styles.contentContainer}>
                  <FlatList 
                      data={completeNotifications.slice().sort((a, b) => b.item.timestamp - a.item.timestamp)}
                      renderItem={<NotificationComponent clique={false} item={item} index={index} user={user}
                      filterCompleteNotifications={() => setCompleteNotifications(completeNotifications.filter((e) => e.item.id != item.item.id))}/>}
                      keyExtractor={(item) => item.item.id.toString()}
                      style={{height: '50%', marginTop: '2.5%'}}
                      contentContainerStyle={{zIndex: 0}}
                  />
                  
              </View> : null}
            </> 
        :
        <View style={styles.noNotificationContainer}>
          <Text style={styles.noFriendsText}>Sorry no Notifications</Text>
          <MaterialCommunityIcons name='emoticon-sad-outline' color={modeTheme.color} size={50} style={{alignSelf: 'center', marginTop: '10%'}}/>
        </View>}
        </>
        }
            
      </View>
  </View>
  )
}

export default NotificationScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1, 
    margin: '2.5%'
  },
  noFriendsText: {
    fontSize: 19.20,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    textAlign: 'center',
    color: "#fafafa"
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '8%',
    marginLeft: '5%',
    marginRight: '5%'
  },
  headerText: {
    fontSize: 19.20,
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
    justifyContent: 'flex-end', 
    flex: 1
  },
  noNotificationContainer: {
    justifyContent: 'center', 
    flex: 1, 
    marginBottom: '40%'
  }
})