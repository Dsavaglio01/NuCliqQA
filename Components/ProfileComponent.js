import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Dimensions, FlatList, Alert} from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import ThemeMadeProgression from './ThemeMadeProgression'
import { useNavigation } from '@react-navigation/native'
import {MaterialCommunityIcons, MaterialIcons, FontAwesome} from '@expo/vector-icons'
import ThemeHeader from './ThemeHeader'
import FastImage from 'react-native-fast-image'
import { Divider } from 'react-native-paper'
import ProfileContext from '../lib/profileContext'
import useAuth from '../Hooks/useAuth'
import {BACKEND_URL} from '@expo/vector-icons';
import { buyThemeFunction, fetchCount, fetchMorePosts, fetchMoreReposts, fetchPosts, fetchReposts } from '../firebaseUtils'
import FollowButtons from './FollowButtons'
import { useSinglePickImage } from '../Hooks/useSinglePickImage'
import MiniPost from './MiniPost'
import { where } from 'firebase/firestore'
const ProfileComponent = ({preview, previewMade, applying, viewing, previewImage, name, person, ableToMessage, friendId}) => {
    const navigation = useNavigation();
    const {user} = useAuth();
    const profile = useContext(ProfileContext);
    const [lastVisible, setLastVisible] = useState(null);
    const [posts, setPosts] = useState([]);
    const [reposts, setReposts] = useState([]);
    const [repostSetting, setRepostSetting] = useState(false);
    const [postSetting, setPostSetting] = useState(true);
    const [imageModal, setImageModal] = useState(false);
    const [additionalInfoMode, setAdditionalInfoMode] = useState(false);
    const [numberOfPosts, setNumberOfPosts] = useState(0);
    const [numberOfReposts, setNumberOfReposts] = useState(0);
    const [friendLoading, setFriendLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const {imageLoading, pickImage} = useSinglePickImage({profilePfp: true, name: `${user.uid}pfp.jpg`});
    const renderPosts = ({item, index}) => {
      return (
        <MiniPost item={item} index={index} repost={false} name={name}/>
      )
    }
    const renderReposts = ({item, index}) => {
      return (
        <MiniPost item={item} index={index} repost={true} name={name}/>
      )
    }
    useEffect(() => {
      if (name) {
        fetchCount(name, 'posts', [where('repost', '==', false)], setNumberOfPosts);
        fetchCount(name, 'posts', [where('repost', '==', true)], setNumberOfReposts);
      }
    }, [name]);
    useEffect(() => {
      let unsubscribe;
      if (name == user.uid && postSetting && posts.length == 0) {
        console.log('first')
        // Call the utility function and pass state setters as callbacks
        unsubscribe = fetchPosts(user.uid, setPosts, setLastVisible);
        // Handle loading state
        setLoading(false);
      }
      else if (person && name == person.id && posts.length == 0 && postSetting && (!person.blockedUsers.includes(user.uid) && !profile.blockedUsers.includes(person.id))) {
        // Call the utility function and pass state setters as callbacks
        unsubscribe = fetchPosts(person.id, setPosts, setLastVisible);
        // Handle loading state
        setLoading(false);
      }
      // Clean up the listener when the component unmounts
      return () => {
        if (unsubscribe) {
          return unsubscribe;
        }
      };
    }, [name, postSetting, person, profile.blockedUsers]);
    console.log(posts.length)
    useEffect(() => {
      let unsubscribe;
      if (user.uid == name && repostSetting && reposts.length == 0) {
        // Call the utility function and pass state setters as callbacks
        unsubscribe = fetchReposts(user.uid, setReposts, setLastVisible);
        // Handle loading state
        setLoading(false);
      }
      else if (person && name == person.id && reposts.length == 0 && repostSetting && (!person.blockedUsers.includes(user.uid) && !profile.blockedUsers.includes(person.id))) {
        // Call the utility function and pass state setters as callbacks
        unsubscribe = fetchReposts(person.id, setPosts, setLastVisible);
        // Handle loading state
        setLoading(false);
      }
      // Clean up the listener when the component unmounts
      return () => {
        if (unsubscribe) {
            return unsubscribe;
        }
      };
    }, [name, repostSetting, person, profile.blockedUsers]);
    async function unBlockUser() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/unBlockUser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: {name: name, user: user.uid,}}), // Send data as needed
        })
        const data = await response.json();
          if (data.done) {
            navigation.goBack()
          }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    async function blockUser() {
        Alert.alert('Are you sure you want to block this user?', 'If you block them, you will not be able to interact with their content and they will not be able to interact with your content', [
                  {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                  {text: 'OK', onPress: async() => {
      try {
      const response = await fetch(`${BACKEND_URL}/api/blockUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: {name: name, user: user.uid}}), // Send data as needed
      })
      const data = await response.json();
        if (data.done) {
          navigation.goBack()
        }
    } catch (error) {
      console.error('Error:', error);
    }
        }}
    ]);
    }
    async function messageFriend() {
      if (ableToMessage.length > 0 && ableToMessage.filter((e) => e.active == true).length > 0) {
        navigation.navigate('PersonalChat', {friendId: friendId, person: person, active: true})
      }
      else {
        Alert.alert('You must both be following each other first (mutual friends) in order to message!')
      }
    }
    async function buyTheme(image) {
      await buyThemeFunction(image, navigation)
    }
    function fetchMoreRepostData () {
      if (lastVisible != undefined) {
        let unsubscribe;
        // Call the utility function and pass state setters as callbacks
        unsubscribe = fetchMoreReposts(user.uid, setReposts, reposts, setLastVisible, lastVisible)
        // Handle loading state
        setLoading(false);
        // Clean up the listener when the component unmounts
        return () => {
          if (unsubscribe) {
            return unsubscribe;
          }
        }
      }
    }
  function fetchMoreData () {
    if (lastVisible != undefined) {
      let unsubscribe;
      // Call the utility function and pass state setters as callbacks
      unsubscribe = fetchMorePosts(user.uid, setPosts, posts, setLastVisible, lastVisible)
      // Handle loading state
      setLoading(false);
      // Clean up the listener when the component unmounts
      return () => {
        if (unsubscribe) {
          return unsubscribe;
        }
      }
    }
  }
  return (
    <>
    {preview ? <View style={{backgroundColor: "#121212"}}>
      <ThemeMadeProgression text={"Profile Theme Preview"} noAdditional={true}/> 
        </View>
        : applying ? 
      <View style={{backgroundColor: "#005278"}}>
        <View style={styles.previewThemeContainer}> 
          <Text style={styles.previewThemeText}>My Themes</Text>
          <TouchableOpacity style={styles.closeContainer} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name='close' size={20} color={"#fafafa"}  />
          </TouchableOpacity>
        </View>
        <View style={styles.previewContainer}>
          <Text style={styles.previewHeader}>PROFILE THEME PREVIEW</Text>
          <Text style={styles.previewText}>This is how your feeds will look like using this theme.</Text>
        </View>
      </View> 
       : viewing ? 
      <View style={{backgroundColor: "#121212"}}>
        <ThemeHeader video={false} text={person != null && (person.blockedUsers.includes(user.uid) || profile.blockedUsers.includes(person.id)) ? "User Unavailable" : "Viewing Profile"} backButton={true}/>
      </View> :
       <>
      </>}
      
    
    <ScrollView style={styles.container}
        onScroll={({ nativeEvent }) => {
            const offsetY = nativeEvent.contentOffset.y;
            const contentHeight = nativeEvent.contentSize.height;
            const scrollViewHeight = nativeEvent.layoutMeasurement.height;

            // Detect when the user is near the end of the ScrollView
            if (offsetY + scrollViewHeight >= contentHeight - 20) {
              // Load more data when close to the end
              if (repostSetting) {
                fetchMoreRepostData();
              }
              else {
                fetchMoreData();
              }
              
            }
          }}>
        <Modal visible={imageModal} animationType="fade" transparent onRequestClose={() => setImageModal(!imageModal)}>
            <View style={[styles.pfpModalContainer, styles.overlay]}>
                <View style={styles.pfpModalView}> 
                    <MaterialCommunityIcons name='close' color={"#fafafa"}  size={35} style={styles.closePfp} onPress={preview ? null : () => setImageModal(false)}/>
                    <View style={{alignItems: 'center'}}>
                        {viewing ? person.pfp : profile.pfp ? <FastImage source={{uri: viewing ? person.pfp : profile.pfp}} style={styles.fullImage}/> : <ActivityIndicator color={"#9EDAFF"} />}
                    </View>
                </View>
            </View>
        </Modal>
        {viewing && person.background && person.forSale ? 
          <TouchableOpacity style={styles.buyThemeContainer} onPress={preview ? null : () => buyTheme(person.background)}>
            <FontAwesome name='photo' size={22.5} style={{alignSelf: 'center'}}/>
          </TouchableOpacity> : null}
        <FastImage style={styles.profileContainer} source={!loading ? previewImage ? {uri: previewImage} 
        : viewing ? person.background : profile.background ? {uri: viewing ? person.background : profile.background} : require('../assets/Default_theme.jpg') : null} />
      <View style={{flexDirection: 'row'}}>
          <View style={{width: '77.5%'}}>
            <View style={styles.usernameContainer}>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.nameAge} numberOfLines={1}>@{viewing ? person.username : profile.userName}</Text>
                {viewing && person.privacy ? <MaterialCommunityIcons name='lock-outline' size={20} color={"#fff"} style={styles.lock}/> : null}
              </View>
              <Text style={styles.nameAge}>|</Text>
                <Text style={styles.nameAge} numberOfLines={1}>{viewing ? person.firstName : profile.firstName} {viewing ? person.lastName : profile.lastName}</Text>
            </View>
              
          </View>
          <TouchableOpacity style={styles.pfpLoading} activeOpacity={1} onPress={!profile.pfp ? null : viewing ? () => setImageModal(true) : () => pickImage()} onLongPress={!profile.pfp || viewing ? null : () => setImageModal(true)}>
              {(loading || imageLoading) && person != null && !(person.blockedUsers.includes(user.uid) || profile.blockedUsers.includes(person.id)) ? 
              <ActivityIndicator style={styles.profileCircle} color={"#9EDAFF"} /> : viewing ? person.pfp : profile.pfp ? <FastImage source={{uri: viewing ? person.pfp : profile.pfp}} style={styles.profileCircle} /> 
              : <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.profileCircle} />}
            </TouchableOpacity>
          </View>
          {viewing ? person.bio : profile.bio.length > 0 ? 
            <TouchableOpacity onPress={() => setAdditionalInfoMode(!additionalInfoMode)} style={styles.bioContainer}>
              <Divider borderWidth={1} style={{width: '45%'}} borderColor={"#fafafa"}/>
              {additionalInfoMode ? <MaterialCommunityIcons name='chevron-up' style={{alignSelf: 'center'}} color={"#9EDAFF"} size={25} /> : <MaterialCommunityIcons name='chevron-down' style={{alignSelf: 'center'}} color={"#9EDAFF"} size={25}/> }
              <Divider borderWidth={1} style={{width: '45%'}} borderColor={"#fafafa"}/>
            </TouchableOpacity> : null}
            {(viewing ? person.bio : profile.bio != undefined || null) && additionalInfoMode ? 
            <Text style={styles.bioText}>{ viewing ? person.bio : profile.bio != undefined || null ? viewing ? person.bio : profile.bio : null}</Text> 
            : null}
             <View style={styles.friendsContainer}>
          {user != null ? name == user.uid ? <TouchableOpacity style={[styles.friendsHeader, {flexDirection: 'row'}]} 
          onPress={preview ? null :() => navigation.navigate('Edit', {firstName: profile.firstName, lastName: profile.lastName, 
            pfp: profile.pfp, username: profile.userName, id: profile.id, bio: profile.bio})}>
            <Text style={styles.friendsText}>Edit</Text>
          </TouchableOpacity> : user != null && user.uid != name && person != null && !(person.blockedUsers.includes(user.uid) || profile.blockedUsers.includes(person.id)) ? 
          friendLoading ? 
          <View style={styles.secondFriendsHeader}>
          <ActivityIndicator style={{padding: 7}} color={"#121212"}/> 
          </View>
          : <FollowButtons style={styles.secondFriendsHeader} friendId={name} preview={preview} user={user}/> : null : null}
          {user != null ? name == user.uid ? <TouchableOpacity style={styles.friendsHeader} onPress={preview ? null :() => navigation.navigate('Settings', {username: profile.userName})}>
            <Text style={styles.friendsText}>Settings</Text>
          </TouchableOpacity> : ableToMessage.filter((e) => e.active == true).length > 0 && friendId && person != null && (!person.blockedUsers.includes(user.uid) && !profile.blockedUsers.includes(person.id)) 
            ? <TouchableOpacity style={styles.friendsHeader} onPress={preview ? null : () => messageFriend()}>
            <Text style={styles.friendsText}>Message</Text>
          </TouchableOpacity> : null : null}
          {user != null && user.uid != name && person != null && (!person.blockedUsers.includes(user.uid) && !profile.blockedUsers.includes(person.id)) ? 
          <TouchableOpacity style={styles.friendsHeader} onPress={preview ? null :() => blockUser()}>
            <Text style={styles.friendsText}>Block</Text>
          </TouchableOpacity>
          : user != null && user.uid != name && person != null && (profile.blockedUsers.includes(person.id)) ? 
          <TouchableOpacity style={styles.friendsHeader} onPress={preview ? null :() => unBlockUser()}>
            <Text style={styles.friendsText}>Un-Block</Text>
          </TouchableOpacity> : null}
        </View>
        <View style={styles.headerContainer}>
              <TouchableOpacity  onPress={!viewing ? postSetting ? null : () => {setPostSetting(true); setRepostSetting(false)} :
                !profile.blockedUsers.includes(person.id) ? postSetting ? null : () => {setPostSetting(true); setRepostSetting(false)} : null} style={styles.noOfPosts}>
                <Text style={styles.headerText}>{numberOfPosts > 999 && numberOfPosts < 1000000 ? `${numberOfPosts / 1000}k` : numberOfPosts > 999999 ? `${numberOfPosts / 1000000}m` : numberOfPosts}</Text>
                <Text style={styles.headerSupplementText}>{numberOfPosts == 1 ? 'Post' : 'Posts'}</Text>
              </TouchableOpacity >
              <TouchableOpacity onPress={!viewing ? repostSetting ? null : () => {setRepostSetting(true); setPostSetting(false)} :
                !profile.blockedUsers.includes(person.id) ? repostSetting ? null : () => {setRepostSetting(true); setPostSetting(false)} : null} style={styles.noOfPosts}>
                <Text style={styles.headerText}>{numberOfReposts > 999 && numberOfReposts < 1000000 ? `${numberOfReposts / 1000}k` : numberOfReposts > 999999 ? `${numberOfReposts / 1000000}m` : numberOfReposts}</Text>
                <Text style={styles.headerSupplementText}>{numberOfReposts == 1 ? 'Repost' : 'Reposts'}</Text>
              </TouchableOpacity >
              <TouchableOpacity style={styles.noOfPosts} onPress={(person != null && !profile.blockedUsers.includes(person.id)) || !viewing ? () => navigation.navigate('Friends', {profile: viewing ? name : profile.id, ogUser: name == user.uid ? true : false, username: viewing ? person.username : profile.userName}) : null}>
                {!viewing ? <Text style={styles.headerText}>{profile.following.length > 999 && profile.following.length < 1000000 ? `${profile.following.length / 1000}k` : profile.following.length > 999999 ? `${profile.following.length / 1000000}m` : profile.following.length}</Text> :
                <Text style={styles.headerText}>{person.following.length > 999 && person.following.length < 1000000 ? `${person.following.length / 1000}k` : person.following.length > 999999 ? `${person.following.length / 1000000}m` : person.following.length}</Text>}
                <Text style={styles.headerSupplementText}>{'Following'}</Text> 
              </TouchableOpacity>
              <TouchableOpacity style={styles.noOfPosts} onPress={(person != null && !profile.blockedUsers.includes(person.id)) || !viewing ? () => navigation.navigate('ViewingFollowers', {profile: viewing ? name : profile.id, ogUser: name == user.uid ? true : false, username: viewing ? person.username : profile.userName}) : null}>
                <Text style={styles.headerText}>{profile.followers.length > 999 && profile.followers.length < 1000000 ? `${profile.followers.length / 1000}k` : profile.followers.length > 999999 ? `${profile.followers.length / 1000000}m` : profile.followers.length}</Text>
                <Text style={styles.headerSupplementText}>{'Followers'}</Text>
              </TouchableOpacity>
            </View>
            {loading ? 
              <ActivityIndicator color={"#9edaff"} style={{alignSelf: 'center'}}/> 
            : posts.length > 0 && postSetting && viewing ? !person.privacy : true ? <FlatList 
            data={additionalInfoMode ? posts.slice(0, 6) : previewMade | preview | applying ? posts.slice(0, 6) : posts}
            renderItem={renderPosts}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={styles.postContainer}
            style={styles.secondMain}
          /> : reposts.length > 0 && repostSetting && viewing ? !person.privacy : true ? <FlatList 
            data={additionalInfoMode ? reposts.slice(0, 6) : previewMade | preview | applying ? reposts.slice(0, 6) : reposts}
            renderItem={renderReposts}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={styles.postContainer}
            style={styles.secondMain}
          /> : viewing && person.privacy && !loading ? <View style={styles.noPostContainer}>
            <Text style={styles.noPosts}>Private Account</Text>
            <Text style={[styles.noPosts, {paddingTop: 0, fontSize: 15.36}]}>Must follow user in order to see posts</Text>
          </View> : loading && person != null && !(person.blockedUsers.includes(user.uid) || profile.blockedUsers.includes(person.id)) ? 
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={"#9EDAFF"}/> 
          </View>  :
          <View style={styles.noPostContainer}>
            <Text style={styles.noPosts}>{postSetting ? 'No Posts Yet!' : 'No Reposts Yet!'}</Text>
            {name == user.uid && postSetting ? 
              <>
            <TouchableOpacity style={styles.newPostContainer} onPress={() => navigation.navigate('New Post', {screen: 'NewPost', params: {group: false, postArray: []}})}>
              <MaterialIcons name='library-add' size={50} style={{paddingVertical: 25}}/>
            </TouchableOpacity>
            <Text style={styles.noPosts}>Create a New Post!</Text>
            </> : null}
            
          </View>}       
    </ScrollView>
    </>
  )
}

export default ProfileComponent

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: "#121212"
    },
    profileContainer: {
        height: Dimensions.get('screen').height * 0.25,
        backgroundColor: "#005278"
    },
    previewThemeContainer: {
        margin: '5%',
        marginTop: '10%',
        marginBottom: "2.5%",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    previewThemeText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        alignSelf: 'center',
        padding: 5,
        paddingBottom: 0,
        color: "#fafafa"
    },
    closeContainer: {
        alignSelf: 'center', 
        padding: 5, 
        paddingTop: 10, 
        marginLeft: 'auto'
    },
    previewContainer: {
        backgroundColor: "#f2f2f2",
        borderWidth: 1,
        borderColor: "#979797"
    },
    previewHeader: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_600SemiBold',
        padding: 5,
        textAlign: 'center'
    },
    previewText: {
        padding: 5,
        fontSize: 15.36,
        fontFamily: 'Montserrat_400Regular',
        textAlign: 'center',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    fullImage: {
        width: 350, // Specific width (optional)
        height: 350,
        resizeMode: 'contain',
        borderRadius: 10
    },
    pfpModalContainer: {
      flex: 1,
      alignItems: 'center',
    }, 
    pfpModalView: {
      width: '100%',
      height: '100%',
      backgroundColor: '#cdcdcd',
      borderRadius: 20,
      padding: 35,
      paddingTop: 25,
      shadowColor: '#000',
      shadowOffset: {
      width: 0,
      height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    closePfp: {
      textAlign: 'right', 
      paddingRight: -30, 
      paddingBottom: 10, 
      paddingTop: 10
    },
    nameAge: {
      fontSize: 19.20,
      color: "#fafafa",
      fontFamily: 'Montserrat_700Bold',
      padding: 7.5,
      paddingBottom: 0,
    },
    pfpLoading: {
      marginTop: '-7.5%', 
      alignItems: 'flex-end', 
      marginRight: '5%', 
      flex: 1
    },
    bioContainer: {
      flexDirection: 'row', 
      alignItems: 'center', 
      marginLeft: '3.5%', 
      marginRight: '3.5%', 
      justifyContent: 'space-between'
    },
    friendsContainer:{
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      width: '90%',
      marginLeft: '5%',
    },
    friendsHeader: {
      borderRadius: 5,
      backgroundColor: "lightblue",
      marginTop: '2%',
      flex: 1,
      marginHorizontal: '2.5%',
      alignItems: 'center',
      justifyContent: 'center'
    },
    secondFriendsHeader: {
      alignSelf: 'center', 
      paddingLeft: 18, 
      padding: 3,
      borderRadius: 5,
      backgroundColor: "lightblue",
      marginTop: '2%',
      flex: 1,
      marginHorizontal: '2.5%',
      alignItems: 'center',
      justifyContent: 'center'
    },
    friendsText: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      padding: 10,
      color: "#000",
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '90%',
      marginTop: '2%',
    },
    noOfPosts: {
      flexDirection: 'column',
      alignItems: 'center',
      marginLeft: '5%',
      backgroundColor: "#121212"
    },
    headerText: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_700Bold',
      color: "#fafafa",
      padding: 5,
      paddingTop: 0,
      paddingBottom: 0,
      textAlign: 'center'
    },
    headerSupplementText: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      color: "#fafafa",
      padding: 5,
      paddingTop: 0,
      paddingBottom: 0,
      textAlign: 'center'
    },
    postContainer: { 
      marginHorizontal: '5%', 
      marginVertical: '5%'
    },
    secondMain: {
      borderBottomLeftRadius: 25, 
      borderBottomRightRadius: 25,
      borderColor: "grey",
      backgroundColor: "#121212", 
      marginTop: 0
    },
    loadingContainer: {
      alignItems: 'center', 
      flex: 1, 
      justifyContent: 'center', 
      marginTop: '20%'
    },
    noPostContainer: {
      alignItems: 'center', 
      flex: 1, 
      justifyContent: 'center'
    },
    noPosts: {
      fontSize: 19.20,
      fontFamily: 'Montserrat_500Medium',
      textAlign: 'center',
      padding: 20,
      color: "#fafafa"
    },
    newPostContainer: {
      backgroundColor: "#eee", 
      alignItems: 'center',
      justifyContent: 'center',
      width: '30%', 
      borderRadius: 8
    },
    buyThemeContainer: {
      flexDirection: 'row',
      alignSelf: 'flex-end',
      backgroundColor: "#fff",
      padding: 5,
      marginBottom: '-10%',
      zIndex: 3
    },
    usernameContainer: {
      flexDirection: 'row', 
      width: '90%',
      marginVertical: '2.5%'
    },
    lock: {
      alignSelf: 'center', 
      paddingTop: 7.5
    },
    bioText: {
      fontSize: 12.29,
      fontFamily: 'Montserrat_500Medium',
      width: '90%',
      paddingLeft: 8.75,
      lineHeight: 14.5
    },
})