import { StyleSheet, Text, TouchableOpacity, View, FlatList,  Alert} from 'react-native'
import React, {useState, useEffect, useMemo, useContext} from 'react'
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../Hooks/useAuth';
import { onSnapshot, query, collection, orderBy, getDocs, doc, getDoc, deleteDoc, where, limit } from 'firebase/firestore';
import FastImage from 'react-native-fast-image';
import { Swipeable } from 'react-native-gesture-handler';
import RequestedIcon from '../Components/RequestedIcon';
import themeContext from '../lib/themeContext';
import { db } from '../firebase';
const GroupChannels = ({route}) => {
    let row = [];
    let prevOpenedRow;
    const {pfp, id, name, sending, payload, theme, group} = route.params;
    const navigation = useNavigation();
    const modeTheme = useContext(themeContext)
    const [notificationDone, setNotificationDone] = useState(false);
    const [admins, setAdmins] = useState([])
    const [completeNotifications, setCompleteNotifications] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState(true);
    const [chats, setChats] = useState([]);
    const [userNotifications, setUserNotifications] = useState([]);
    const [messageNotifications, setMessageNotifications] = useState([]);
    const [ableToShare, setAbleToShare] = useState(true);
    const {user} = useAuth()
    const docRef = doc(db, 'groups', id)
    useEffect(() => {
      if (route.params?.payload) {
        const getData = async() => {
          const docSnap = await getDoc(doc(db, 'groups', id, 'posts', payload.id))
          if (!docSnap.exists()) {
            setAbleToShare(false)
          }
        }
        getData();
      }
    }, [route.params?.payload])
    useEffect(() => {
      if (route.params?.notifications) {
        const deleteData = async() => {
          const querySnapshot = await getDocs(collection(db, 'groups', id, 'notifications', user.uid, 'checkNotifications'));
        querySnapshot.forEach(async(docu) => {
          await deleteDoc(doc(db, 'groups', group.id, 'notifications', user.uid, 'checkNotifications', docu.id))
        });
        }
        deleteData()
      }
    }, [route.params?.notifications])
    useEffect(() => {
      let unsub;
      const fetchCards = () => {
        unsub = onSnapshot(query(collection(db, 'groups', id, 'notifications', user.uid, 'messageNotifications')), (snapshot) => {
          setMessageNotifications(snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })))
        })
      }
      fetchCards();
      return unsub
    }, [])
     useEffect(() => {
        const getData = async() => {
            const docRef= doc(db, 'groups', id)
            setAdmins((await getDoc(docRef)).data().admins)
        }
        getData()
    }, [])
    useEffect(() => {
      let unsub = [];
      const fetchCards = async () => {
        const q = query(collection(db, 'groups', id, 'notifications', user.uid, 'notifications'), orderBy('timestamp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            unsub.push({id: doc.id, ...doc.data()})
          });
          setUserNotifications(unsub)
      }
      fetchCards();
      setTimeout(() => {
        setNotificationDone(true)
      }, 1000);
    }, [])
    //console.log(userNotifications.length)
    useMemo(()=> {
      
        if (notificationDone) {
          let newData = [];
          setCompleteNotifications([])
        userNotifications.map(async(item) => {
          if (item.like) {  
            //console.log('first')       
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'groups', id, 'posts', item.item))
            if (dataSnap.exists() && docSnap.exists()) {
              if (!newData.includes(dataSnap.id)) {
              setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
              newData.push(dataSnap.id)
              }
            }
            
          }
          else if (item.report) {
            if (item.comments) {
              setCompleteNotifications(prevState => [...prevState, {item}])
            }
            else if (item.post) {
              const postSnap = await getDoc(doc(db, 'groups', id, 'posts', item.postId))
              if (postSnap.exists()) {
                setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: postSnap.id, ...postSnap.data()}}])
              }
              
            }
            else if (item.cliqueMessage) {
              setCompleteNotifications(prevState => [...prevState, {item}])
            }
            
          }
          else if (item.comment) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'groups', id, 'posts', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
               setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
           
          } 
          else if (item.reply) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'groups', id, 'posts', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
               setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.request) {
            //console.log(item)
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'groups', id, 'channels', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
              setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
            
          }
          else if (item.mention) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'groups', id, 'posts', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
             setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.postMention) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = await getDoc(doc(db, 'groups', id, 'posts', item.postId))
            if (dataSnap.exists() && docSnap.exists()) {
             setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data()}])
            }
          }
          else if (item.theme) {
            const docSnap = (await getDoc(doc(db, 'profiles', item.requestUser)))
            const dataSnap = (await getDoc(doc(db, 'products', item.postId)))
            const freeDataSnap = (await getDoc(doc(db, 'freeThemes', item.postId)))
            if (dataSnap.exists() && docSnap.exists()) {
              setCompleteNotifications(prevState => [...prevState, {item, postInfo: {id: dataSnap.id, ...dataSnap.data()}, info: docSnap.data(), free: false}])
            }
            else if (freeDataSnap.exists() && docSnap.exists()) {
              setCompleteNotifications(prevState => [...prevState, {item,postInfo: {id: freeDataSnap.id, ...freeDataSnap.data()}, info: docSnap.data(), free: true}])
            }
          }
          
          
        })
        setTimeout(() => {
        setLoading(false)
      }, 1500);
      }
      
    }, [notificationDone]);
  useEffect(()=> {
      let unsub;
      const fetchCards = async () => {
        //const passes = await getDocs(collection(db, 'users', user.uid, 'passes')).then((snapshot) => snapshot.docs.map((doc) => doc.id));
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'requests'), where('actualRequest', '==', true)), (snapshot) => {
          setFriendRequests(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
            //info: doc.data().info
          })))
        })
      } 
      fetchCards();
      return unsub;
    }, []);
    useEffect(() => {
      if (!route.params?.notifications && chats.length == 0) {
        const getData = async() => {
          const q = query(collection(db, "groups", id, 'channels'), where("member_count", "<", 150));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setChats(prevState => [...prevState, {id: doc.id, ...doc.data()}])
        })
        }
        getData()
      }
    }, [route.params?.notifications])
    /* useEffect(()=> {
      let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'chats'), orderBy('createdAt', 'desc')), (snapshot) => {
          setLastMessages(snapshot.docs.map((doc)=> ( {
            id: doc.data()._id,
            ...doc.data()
          })))
        })
      } 
      fetchCards();
      return unsub;
    }, [db]); */
    
    
    function getCalculatedTime(time) {
        return time.toDate().toLocaleTimeString([], {hour: 'numeric', minute:'numeric'})
        
    }
    function getDay(time) {
      //const output = new Date(time * 1000);
      //console.log(output)
      //console.log(new Date())
      if (time != null) {
      var t = new Date(Date.UTC(1970, 0, 1)); // Epoch
      t.setUTCSeconds(time.seconds);
      const date = new Date(t);
      const yesterday = new Date();
      const twodays = new Date();
      const threedays = new Date();
      const fourdays = new Date();
      const fivedays = new Date();
      const sixdays = new Date();
      const lastWeek = new Date();
      const twoWeeks = new Date();
      const threeWeeks = new Date();
      const fourWeeks = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      twoWeeks.setDate(twoWeeks.getDate() - 14);
      threeWeeks.setDate(threeWeeks.getDate() - 21);
      fourWeeks.setDate(fourWeeks.getDate() - 28);
      twodays.setDate(twodays.getDate() - 2);
      threedays.setDate(threedays.getDate() - 3);
      fourdays.setDate(threedays.getDate() - 4);
      fivedays.setDate(threedays.getDate() - 5);
      sixdays.setDate(threedays.getDate() - 6);
      yesterday.setDate(yesterday.getDate() - 1);
      //console.log(yesterday.getTime())
      if  (date.getTime() >= yesterday.getTime()) {
        return `Sent at ${getCalculatedTime(time)}`
      }
      else if (date.getTime() <= yesterday.getTime() && yesterday.getTime() <= twodays.getTime()) {
        return 'Sent Yesterday'
      } 
      else if (date.getTime() <= twodays.getTime() && twodays.getTime() <= threedays.getTime()) {
        return 'Sent 2 days ago'
      }
      else if (date.getTime() <= threedays.getTime() && threedays.getTime() <= fourdays.getTime()) {
        return 'Sent 3 days ago'
      }
      else if (date.getTime() <= fourdays.getTime() && fourdays.getTime() <= fivedays.getTime()) {
        return 'Sent 4 days ago'
      }
      else if (date.getTime() <= fivedays.getTime() && fivedays.getTime() <= sixdays.getTime()) {
        return 'Sent 5 days ago'
      }
      else if (date.getTime() <= sixdays.getTime() && sixdays.getTime() <= lastWeek.getTime()) {
        return 'Sent 6 days ago'
      }
      else if (date.getTime() <= lastWeek.getTime() && lastWeek.getTime() <= twoWeeks.getTime()) {
        return 'Sent 1 week ago'
      }
      else if (date.getTime() <= twoWeeks.getTime() && twoWeeks.getTime() <= threeWeeks.getTime()) {
        return 'Sent 2 weeks ago'
      }
      else if (date.getTime() <= threeWeeks.getTime() && threeWeeks.getTime() <= fourWeeks.getTime()) {
        return 'Sent 3 weeks ago'
      }
      else {
        return 'Sent'
      }
    }
      //console.log(new Date() - t)
    }
    function getDateAndTime(timestamp) {
      if (timestamp != null) {
        //const formattedDate = new Date(timestamp.seconds*1000)
        //return formattedDate.toLocaleString()
      //console.log(date)
      var t = new Date(Date.UTC(1970, 0, 1)); // Epoch
      t.setUTCSeconds(timestamp.seconds);
      const date = new Date(t);
      const yesterday = new Date();
      const twodays = new Date();
      const threedays = new Date();
      const fourdays = new Date();
      const fivedays = new Date();
      const sixdays = new Date();
      const lastWeek = new Date();
      const twoWeeks = new Date();
      const threeWeeks = new Date();
      const fourWeeks = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      twoWeeks.setDate(twoWeeks.getDate() - 14);
      threeWeeks.setDate(threeWeeks.getDate() - 21);
      fourWeeks.setDate(fourWeeks.getDate() - 28);
      twodays.setDate(twodays.getDate() - 2);
      threedays.setDate(threedays.getDate() - 3);
      fourdays.setDate(fourdays.getDate() - 4);
      fivedays.setDate(fivedays.getDate() - 5);
      sixdays.setDate(sixdays.getDate() - 6);
      yesterday.setDate(yesterday.getDate() - 1);
      //console.log(twodays.getTime())
      //console.log(yesterday.getTime())
      //console.log(date.getTime())
      //console.log(threedays.getTime())
      //console.log(fourdays.getTime())
      if  (date.getTime() >= yesterday.getTime()) {
        return `${getCalculatedTime(timestamp)}`
      }
      else if (date.getTime() <= fourWeeks.getTime()) {
        return `${new Date(timestamp.seconds*1000).toLocaleDateString()}`
      }
      else if (date.getTime() <= threeWeeks.getTime()) {
        return `3 weeks ago`
      }
      else if (date.getTime() <= twoWeeks.getTime()) {
        return `2 weeks ago`
      }
      else if (date.getTime() <= lastWeek.getTime()) {
        return `1 week ago`
      }
      else if (date.getTime() <= sixdays.getTime()) {
        return `6 days ago`
      }
      else if (date.getTime() <= fivedays.getTime()) {
        return `5 days ago`
      }
      else if (date.getTime() <= fourdays.getTime()) {
        return `4 days ago`
      }
      else if (date.getTime() <= threedays.getTime()) {
        return `3 days ago`
      }
      else if (date.getTime() <= twodays.getTime()) {
        return `2 days ago`
      }
      else if (date.getTime() <= yesterday.getTime()) {
        return `Yesterday`
      } 
      }
      
    }
    async function deleteNotification(item)  {
      setCompleteNotifications(completeNotifications.filter((e) => e.item.id != item.item.id))
      await deleteDoc(doc(db, 'groups', id, 'notifications', user.uid, 'notifications', item.item.id))
      //console.log(item)
    }
  const deleteMessageNotifications = async(item) => {
    const querySnapshot = await getDocs(collection(db, 'groups', id, 'notifications', user.uid, 'messageNotifications'));
    querySnapshot.forEach(async(document) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(document.data())
      if (document.data().channelId == item.id) {
        await deleteDoc(doc(db, 'groups', id, 'notifications', user.uid, 'messageNotifications', document.id))
      }
    });
    //await deleteDoc(doc())
  }
    const renderChats = ({item, index}, onClick) => {
      //console.log(item)
      if (item != undefined && item.members != undefined) {
        //console.log(item)
      //onsole.log(item.item.lastMessage)
      const closeRow = (index) => {
      //console.log('closerow');
      if (prevOpenedRow && prevOpenedRow !== row[index]) {
        prevOpenedRow.close();
      }
      prevOpenedRow = row[index];
    };
    
    const renderRightActions = (progress, dragX, onClick) => {
      return (
        <View style={{flexDirection: 'row'}}>
          {item.id != id && item.admins.includes(user.uid) ? 
            <TouchableOpacity
          style={{
            margin: 0,
            alignContent: 'center',
            justifyContent: 'center',
            width: 70,
          }} onPress={() => deleteMessage(item)}>
          <MaterialIcons name='delete-outline' size={35} style={{alignSelf: 'center'}} color="red"/>
        </TouchableOpacity>  : null}
        </View>
        
      );
    };
        return (
          <Swipeable renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, onClick)
        }
        onSwipeableOpen={() => closeRow(index)}
        ref={(ref) => (row[index] = ref)}
        rightOpenValue={-100}>
          {!sending ? 
          <View>
            <TouchableOpacity style={messageNotifications.length > 0 ? messageNotifications.filter((element) => element.channelId == item.id && element.user != user.uid).length > 0 ? [styles.messageContainer, {borderColor: 'green',
        borderBottomColor: 'green',
        borderWidth: 1, backgroundColor: modeTheme.backgroundColor}] : [styles.messageContainer, {backgroundColor: modeTheme.backgroundColor}] : [styles.messageContainer, {backgroundColor: modeTheme.backgroundColor}]} activeOpacity={1} onPress={!item.members.includes(user.uid) ? () => Alert.alert("Can't Access Channel", 'Unable to access channel until you join', [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => console.log('first')},
              ]) : () => {navigation.navigate('GroupChat', {group: id, id: item.id, groupName: name, name: item.to == user.uid ? item.secondName : item.name, 
              pfp: item.to == user.uid ? item.secondPfp : item.pfp}); deleteMessageNotifications(item)}}>
              {item.to == user.uid ? item.secondPfp : item.pfp ? <FastImage source={{uri: item.to == user.uid ? item.secondPfp : item.pfp}} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/> :
              <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
              }
                
                 <View style={{paddingLeft: 7.5, width: '60%'}}>
                    <Text numberOfLines={1} style={styles.name}>{item.to == user.uid ? item.secondName : item.name}</Text>
                    <Text numberOfLines={1} style={styles.message}>{item.lastMessage == undefined ? 'Start the Conversation!' : item.lastMessage.post != undefined ?
                    `Sent a post by ${item.lastMessage.userName}` : item.lastMessage.image != undefined ? 'Sent a photo' : 
                    item.lastMessage.image && item.lastMessage.text.length > 0 ? item.lastMessage.text : item.lastMessage.text}</Text>
                    {/* <Text style={styles.message}>{}</Text> */}
                </View>
                <View style={{flexDirection: 'column', marginLeft: 'auto', marginRight: 5}}>
                  <Text style={{fontSize: 12.29, color: "#fafafa", paddingBottom: 5, alignSelf: 'center', fontFamily: 'Montserrat_500Medium'}}>{getDateAndTime(item.lastMessageTimestamp)}</Text>
                  {item.id !== id ? 
                item.security == 'private' && item.requests.includes(user.uid) ? <RequestedIcon /> :
            !item.members.includes(user.uid) ? <TouchableOpacity style={styles.joinContainer} onPress={() => {updateGroup(item)}}>
                  <Text style={styles.joinText}>Join</Text>
                  <MaterialCommunityIcons name='account-plus' size={20} color={"#9edaff"} style={{alignSelf: 'center', padding: 5, paddingRight: 15}}/>
              </TouchableOpacity> :  
              <TouchableOpacity style={styles.joinContainer} onPress={() => removeGroup(item.id)}>
                  <Text style={styles.joinText}>Joined</Text>
                  <MaterialCommunityIcons name='check' size={20} color={"#9edaff"} style={{alignSelf: 'center', padding: 5, paddingRight: 15}}/>
              </TouchableOpacity> : null}
              </View>
                
            </TouchableOpacity>
          </View>
          : 
           <TouchableOpacity style={[styles.messageContainer, {backgroundColor: modeTheme.backgroundColor}]} onPress={() => renderChecked(item)}>
                {item.to == user.uid ? item.secondPfp : item.pfp ? <FastImage source={{uri: item.to == user.uid ? item.secondPfp : item.pfp}} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/> :
              <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
              }
                 <View style={{paddingLeft: 7.5, width: '75%'}}>
                    <Text numberOfLines={1} style={styles.name}>{item.to == user.uid ? item.secondName : item.name}</Text>
                </View>
                {item.checked ? <View style={{marginRight: '10%'}}>
                  <MaterialCommunityIcons name='message-arrow-right-outline' style={{alignSelf: 'center'}} size={25} color="#005278"/>
                </View> : <View style={{marginRight: '10%'}}>
                  <MaterialCommunityIcons name='message-outline' style={{alignSelf: 'center'}} size={25}/>
                </View>}
           </TouchableOpacity>}
           </Swipeable>
        )
            } 
    }
  return (
    <View style={styles.container}>
      <View style={{backgroundColor: "#121212"}}>
        <View style={styles.header}>
          <View style={styles.backContainer}>
            <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name='chevron-left' size={35} color={modeTheme.color} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1} style={styles.titleContainer} onPress={() => {setMessages(true)}}>
              <FastImage source={pfp ? {uri: pfp} : require('../assets/defaultpfp.jpg')} style={styles.pfp}/>
              <Text numberOfLines={1} style={styles.messageText}>{name} Messages</Text>
            </TouchableOpacity>
            <MaterialCommunityIcons name='plus' size={30} color={"#fafafa"} onPress={() => navigation.navigate('ChannelsName', {id: id})}/>
          </View>
        </View>
      </View>
      <FlatList 
        data={chats}
        renderItem={renderChats}
        keyExtractor={(item, index) => item.id.toString()}
        style={{height: '50%'}} 
        contentContainerStyle={{zIndex: 0}}
        ListFooterComponent={<View style={{paddingBottom: 50}}/>}
      /> 
    </View>
  )
}

export default GroupChannels

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212"
  },
  header: {
    backgroundColor: "#121212", 
    borderBottomWidth: 1, 
    borderColor: "#fafafa"
  },
  backContainer: {
    width: '95%', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: '10%', 
    marginBottom: '2.5%'
  },
  titleContainer: {
    alignSelf: 'center', 
    flexDirection: 'row', 
    marginLeft: '1%'
  },
  back: { 
    alignSelf: 'center', 
    marginLeft: '2.5%'
  },
  pfp: {
    height: 35, 
    width: 35, 
    borderRadius: 8, 
    marginLeft: 0, 
    marginRight: 10, 
    alignSelf: 'center', 
    borderWidth: 1.5, 
    borderColor: '#000'
  },
  profilesContainer: {
      flexDirection: 'row'
  },
  searchContainer: {
      height: 60,
      width: 60,
      borderRadius: 30,
      backgroundColor: '#005278',
      justifyContent: 'center',
      //flex: 1,
      alignItems: 'center',
      marginRight: '5%',
      //marginLeft: '2.5%'
  },
  online: {
      height: 12,
      width: 12,
      borderRadius: 6,
      backgroundColor: 'green',
      position: 'absolute',
      //top: 2,
      bottom: 45,
      left: 45,
      zIndex: 3
  },
  messageContainer: {
      borderRadius: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#d3d3d3",
      padding: 10,
      marginBottom: '2.5%',
      flexDirection: 'row',
      alignItems: 'center',
  },
  name: {
      fontSize: 15.36,
      paddingTop: 5,
      fontFamily: 'Montserrat_700Bold',
      color: "#fafafa", 
      //width: '95%'
  },
  message: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      paddingBottom: 5,
      color: "#fafafa"
    
  },
  clock: {
      paddingTop: 5,
      fontSize: 12.29,
      fontFamily: 'Montserrat_500Medium',
      //paddingRight: 5
  },
categories: {
  fontSize: 15.36,
  fontFamily: 'Montserrat_500Medium',
  width: '80%',
  padding: 10
},
iconStyle: {
  alignSelf: "center", 
  position: 'absolute', 
  left: 320
},
  noChats: {
    fontSize: 24,
    padding: 10,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center'
  },
  messageText: {
    fontSize: 19.20, 
    alignSelf: 'center', 
    fontWeight: '600', 
    fontFamily: 'Montserrat_600SemiBold',
    padding: 5,
    paddingHorizontal: 0, 
    width: '70%', 
    color: "#fafafa"
  },
  input: {
    borderTopWidth: 0.25,
    width: '110%',
    marginLeft: '-5%',
    padding: 15,
    margin: '2.5%',
    marginTop: 0
    //backgroundColor: 'red'
  },
  joinContainer: {
    flexDirection: 'row', 
    borderWidth: 1, 
    borderRadius: 8, 
    borderColor: "#9edaff",
    alignItems: 'center', 
    alignSelf: 'flex-start', 
    //marginRight: '10%', 
    //marginTop: '3%'
},
joinText: {
    fontSize: 12.29,
    padding: 5,
    fontFamily: 'Montserrat_500Medium',
    paddingLeft: 15,
    color: "#9edaff", 
  },
  addText: {
    fontSize: 15.36,
    color: "#090909",
    padding: 7.5,
    paddingLeft: 15,
    fontFamily: 'Montserrat_500Medium',
    maxWidth: '90%'
    //paddingTop: 0
  },
  image: {height: 40, width: 40, borderRadius: 8, alignSelf: 'center'}
})