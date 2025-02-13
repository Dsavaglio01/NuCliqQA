import { StyleSheet, Text, TouchableOpacity, View, FlatList,  Alert} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../Hooks/useAuth';
import { onSnapshot, query, collection, getDocs, doc, getDoc, deleteDoc, where,} from 'firebase/firestore';
import FastImage from 'react-native-fast-image';
import { Swipeable } from 'react-native-gesture-handler';
import RequestedIcon from '../Components/RequestedIcon';
import themeContext from '../lib/themeContext';
import { db } from '../firebase';
import getDateAndTime from '../lib/getDateAndTime';
const GroupChannels = ({route}) => {
    let row = [];
    let prevOpenedRow;
    const {pfp, id, name, sending, payload, group} = route.params;
    const navigation = useNavigation();
    const modeTheme = useContext(themeContext)
    const [admins, setAdmins] = useState([])
    const [chats, setChats] = useState([]);
    const [messageNotifications, setMessageNotifications] = useState([]);
    const [ableToShare, setAbleToShare] = useState(true);
    const {user} = useAuth()
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
  const deleteMessageNotifications = async(item) => {
    const querySnapshot = await getDocs(collection(db, 'groups', id, 'notifications', user.uid, 'messageNotifications'));
    querySnapshot.forEach(async(document) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(document.data())
      if (document.data().channelId == item.id) {
        await deleteDoc(doc(db, 'groups', id, 'notifications', user.uid, 'messageNotifications', document.id))
      }
    });
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
            <View style={styles.titleContainer}>
              <FastImage source={pfp ? {uri: pfp} : require('../assets/defaultpfp.jpg')} style={styles.pfp}/>
              <Text numberOfLines={1} style={styles.messageText}>{name} Messages</Text>
            </View>
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