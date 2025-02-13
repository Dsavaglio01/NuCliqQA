import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator} from 'react-native'
import React, { useContext } from 'react'
import { useState, useEffect, useMemo } from 'react';
import useAuth from '../Hooks/useAuth';
import { MaterialCommunityIcons} from '@expo/vector-icons'
import themeContext from '../lib/themeContext';
import { useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-paper';
import NotificationComponent from '../Components/NotificationComponent';
import { deleteCheckedNotifications, fetchActualNotifications, fetchFirstNotifications } from '../firebaseUtils';
const GroupNotifications = ({name, id}) => {
    const [completeNotificationsDone, setCompleteNotificationsDone] = useState(false);
    const [notificationDone, setNotificationDone] = useState(false);
    const [notifications, setNotifications] = useState([])
    const navigation = useNavigation();
    const [completeNotifications, setCompleteNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const {user} = useAuth();
    const modeTheme = useContext(themeContext)
    useEffect(() => {
      const deleteNotification = async() => {
        await deleteCheckedNotifications(user.uid, true, id)
      }
      deleteNotification();
    }, [user?.uid])
  useEffect(() => {
        setNotificationDone(false)
        const fetchNotifications = async() => {
            const tempList = await fetchFirstNotifications(user.uid, true, id)
            setNotifications(tempList)
        }
        fetchNotifications();
        setTimeout(() => {
            setNotificationDone(true)
        }, 1000);
    }, [])
     useMemo(() => {
      if (notificationDone) {
        setCompleteNotifications([])
        const getNotifications = async() => {
            const templist = await fetchActualNotifications(true, id, notifications)
            setCompleteNotifications(templist)
            setLoading(false)
            setCompleteNotificationsDone(true)
        }
        getNotifications();
      }
    }, [notificationDone])
    
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={{alignSelf: 'center'}} hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }} onPress={() => navigation.goBack()} >
          <MaterialCommunityIcons name='chevron-left' color={"#fafafa"} size={35} onPress={() => navigation.goBack()} />
        </TouchableOpacity>
        <Text style={styles.headerText}>{name} Notifications</Text>
      </View>
      <Divider />
      <View style={{flex: 1}}>
        {<>
        {loading ? <View style={styles.loading}>
            <ActivityIndicator color={"#9EDAFF"}/> 
          </View> : 
          notifications.length > 0 ? 
            <>
              {!loading && completeNotificationsDone ? 
              <View style={styles.contentContainer}>
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

export default GroupNotifications

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