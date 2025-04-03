import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native'
import React, {useContext, useState} from 'react'
import {MaterialCommunityIcons, Entypo, Ionicons} from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { Menu, Divider } from 'react-native-paper'
import {BACKEND_URL} from '@env'
import useAuth from '../Hooks/useAuth'
import themeContext from '../lib/themeContext'
import FastImage from 'react-native-fast-image'
import ProfileContext from '../lib/profileContext'
const ThemeHeader = ({text, subscription, cancelButton, style, video, adminCliques, backButton, searching, groupsJoined, following, myCliques, groupPosts, cliqueId, postArray, caption, id, groupposting, 
  filteredGroup, explore, timestamp, post, actualPost, groupName, blockedUsers, username, actualGroup, userId, homePost, cliquePost, clique, actuallyExplore, actuallyJoined, name, actuallyFilteredGroup, viewingProfile}) => {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const theme = useContext(themeContext)
  const profile = useContext(ProfileContext);
  const {user} = useAuth();
  const openMenu = () => setVisible(true)
  const closeMenu = () => setVisible(false)
  const sendSearchingDataBack = () => {
      searching(true)
  }
  const sendFollowingDataBack = () => {
    following(true);
    filteredGroup([]);  
    explore(false);
  }
  const sendMeetDataBack = () => {
    following(false);
    explore(true);
    filteredGroup([]); 
  }
    async function deletePost(id){ 
      Alert.alert('Delete Post', 'Are You Sure You Want to Delete This Post?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: async() => {
      try {
    const response = await fetch(`${BACKEND_URL}/api/deletePost`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {id: id, user: user.uid}}), // Send data as needed
    })
    const data = await response.json();
    if (data.done) {
      navigation.goBack()
    }
  } catch (error) {
    console.error('Error:', error);
  }
      }},
    ]);
      
    //console.log(id)
        
    }
    async function deleteCliquePost(id){
      let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/deleteCliqPost'
        Alert.alert('Delete Post', 'Are You Sure You Want to Delete This Post?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: async() => {
        try {
    const response = await fetch(url, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {id: id, groupId: cliqueId, user: user.uid}}), // Send data as needed
    })
    const data = await response.json();
    if (data.result.done) {
      navigation.goBack()
    }
  } catch (error) {
    console.error('Error:', error);
  }
      }
    },
    ]);

    }
    function getHour(timestamp) {
      let milliseconds = timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000);
      let currentTime = new Date()
      let yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1);
      let currentHour = currentTime.getHours()
      var t = new Date(Date.UTC(1970, 0, 1)); // Epoch
      t.setUTCSeconds(timestamp.seconds);
      const date = new Date(t);
      let newTimestamp = new Date(milliseconds)
      let timestampHour = newTimestamp.getHours()
      if  (date.getTime() <= yesterday.getTime() && timestampHour <= currentHour) {
        return false
        
        }
        else {
          return true
        }
      
    }
  return (

    <View style={clique ? [styles.innerContainer, style, {marginLeft: '9.5%', backgroundColor: theme.backgroundColor}] : [styles.innerContainer, {backgroundColor: theme.backgroundColor}, style]}>
      {backButton ? 
      <TouchableOpacity style={{alignItems: 'center', marginTop: '3%', marginLeft: '5%'}} onPress={viewingProfile ? () => navigation.navigate('ViewingProfile', {name: name, viewing: true}) : groupPosts ? () => navigation.navigate('GroupHome', {name: cliqueId}) : () => navigation.goBack() }>
      <MaterialCommunityIcons name='chevron-left' size={35} style={{alignSelf: 'center'}} color={theme.color}/> 
      </TouchableOpacity>
      : null}
      <View style={backButton ? {flexDirection: 'row', alignItems: 'center', marginLeft: '5%'} : {flexDirection: 'row', alignItems: 'center'}}>
      <View style={{marginTop: '3%', marginLeft: '5%'}}>
        <FastImage source={require('../assets/DarkMode5.png')} style={{height: 27.5, width: 68.75}}/>
      </View>
              
              <Text style={backButton ? {fontSize: 37.5, fontWeight: '200', color: theme.theme != 'light' ? "#9EDAFF" : "#005278", marginLeft: '5%'} : clique ? {fontSize: 37.5, fontWeight: '200', color: theme.theme != 'light' ? "#9EDAFF" : "#005278", marginLeft: '5.5%'} :
               {fontSize: 37.5, fontWeight: '200', color: theme.theme != 'light' ? "#9EDAFF" : "#005278", marginLeft: '5%'}}>|</Text>
                <Text numberOfLines={1} style={[styles.header, {fontFamily: 'Montserrat_500Medium', color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>{text}</Text>
                </View>
                {clique ? 
                <View style={{flexDirection: 'row', marginTop: '4%'}}>
                    <Ionicons name='search' size={27.5} color={theme.color} style={{alignSelf: 'center', marginRight: '5%'}} onPress={sendSearchingDataBack}/>
                <Menu 
                  visible={visible}
                  onDismiss={closeMenu}
                  contentStyle={{backgroundColor: theme.backgroundColor, borderWidth: 1, borderColor: "#71797E"}}
                  anchor={<MaterialCommunityIcons name='chevron-down-circle-outline' size={28.5} color={theme.color} style={{alignSelf: 'center', marginLeft: 8}} onPress={openMenu}/>}>
                  <Menu.Item onPress={() => {sendMeetDataBack()}} title="For You" titleStyle={actuallyExplore && actuallyFilteredGroup.length == 0 ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"} : {color: theme.color}}/>
                  <Divider />
                  <Menu.Item onPress={() => {sendFollowingDataBack()}} title="Joined" titleStyle={actuallyJoined && actuallyFilteredGroup.length == 0 ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"} : {color: theme.color}}/>
                  {subscription ?
                  <> 
                  <Divider />
                  <Menu.Item onPress={() => navigation.navigate('GroupName')} title="Create Cliq" titleStyle={{color: theme.color}}/>
                    </>
                  : null}
                  {groupsJoined.length > 0 ? groupsJoined.length == 1 ? <>
                  <Divider /> 
                  <Menu.Item onPress={() => navigation.navigate('GroupHome', {name: groupsJoined[0], newPost: false, postId: null})} title="My Cliq" titleStyle={{color: theme.color}} />
                  </> :
                  <>
                  <Divider />
                  <Menu.Item onPress={() => {navigation.navigate('MyGroups')}} title="My Cliqs" titleStyle={!actuallyExplore && !actuallyJoined && actuallyFilteredGroup.length == 0 ? {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"} : {color: theme.color}} /> 
                  </>: null}
                  
                  
                  
                </Menu>

                  </View>
              
              
               : myCliques ? <View style={{flexDirection: 'row', marginTop: '4%', marginRight: '5%'}}>
                    <Ionicons name='search' size={27.5} color={theme.color} style={{alignSelf: 'center', marginRight: '5%'}} onPress={sendSearchingDataBack}/>
                    <MaterialCommunityIcons name='plus' size={27.5} color={theme.color} style={{alignSelf: 'center'}} onPress={() => navigation.navigate('GroupName')}/>
                  </View> : null}
                {cancelButton ? <TouchableOpacity style={{flexDirection: 'column', marginTop: '5%'}} onPress={() => navigation.navigate('All', {name: null})}>
                  <MaterialCommunityIcons name='close' color={theme.color} size={30} style={{alignSelf: 'center'}}/>
                  <Text style={{fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}}>Cancel</Text>
                </TouchableOpacity> : null}
                {post ? 
                <Menu 
                visible={visible}
                onDismiss={closeMenu}
                contentStyle={{backgroundColor: theme.backgroundColor, borderWidth: 1, borderColor: "#71797E"}}
                anchor={<Entypo name='dots-three-vertical' size={25} color={theme.color} style={{paddingTop: '3.5%'}} onPress={openMenu}/>}>
                {name == user.uid ? <Menu.Item title="Delete" titleStyle={{color: theme.color}} onPress={homePost ? () => deletePost(actualPost) : cliquePost ?  () => deleteCliquePost(actualPost) : null}/> : null}
                  {name == user.uid ? postArray != null ? postArray[0].text ? getHour(timestamp) ? null : null 
                  : <Menu.Item title="Edit" titleStyle={{color: theme.color}} onPress={ cliquePost ? () => navigation.navigate('Caption', {edit: true, group: actualGroup, groupPfp: actualGroup.banner, groupName: groupName, postArray: postArray, groupId: cliqueId, editCaption: caption, editId: id}) : () =>  navigation.navigate('Caption', {edit: true, postArray: postArray, editCaption: caption, editId: id})}/> : null : null}
                  {!profile.reportedPosts.includes(id) ? <Menu.Item title="Report" titleStyle={{color: theme.color}} onPress={cliqueId ? () => navigation.navigate('ReportPage', {id: id, comment: null, video: video, theme: false, cliqueId: cliqueId, post: true, comments: false, message: false, cliqueMessage: false, reportedUser: userId}) : () => navigation.navigate('ReportPage', {id: id, comment: null, video: video, cliqueId: null, post: true, theme: false, comments: false, message: false, cliqueMessage: false, reportedUser: userId})}/> : null}
              </Menu>
               : null
                }
                {groupposting ? 
                <TouchableOpacity onPress={() => navigation.navigate('NewPost', {group: true, groupName: text, actualGroup: actualGroup, groupId: cliqueId, postArray: [], blockedUsers: blockedUsers, admin: actualGroup.admins.includes(user.uid), username: username})}>
                  <MaterialCommunityIcons name='plus' style={{paddingTop: '3.5%'}} color={theme.color} size={27.5}/>
                </TouchableOpacity>
                 : null}
          </View>
  )
}

export default ThemeHeader

const styles = StyleSheet.create({
    innerContainer:{
        marginTop: '8%',
      marginBottom: '2.5%',
      //marginLeft: '10%',
      marginRight: '5%',
      justifyContent: 'space-evenly',
      flexDirection: 'row',
      alignItems: 'center',
    },
    header: {
        fontSize: 19.20,
        padding: 10,
        paddingLeft: 0,
        marginTop: 8,
        
        width: '60%',
        marginLeft: '5%',
        fontFamily: 'Montserrat_500Medium'
    },

})