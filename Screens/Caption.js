import { StyleSheet, Text, View, Image, Modal, TouchableOpacity, ScrollView, Dimensions, Alert, ActivityIndicator, 
  TextInput,} from 'react-native'
import React, {useEffect, useState, useRef, useContext} from 'react'
import { serverTimestamp, getDoc, doc, updateDoc, setDoc} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import InputBox from '../Components/InputBox';
import MainButton from '../Components/MainButton';
import RadioButtonGroup, {RadioButtonItem} from 'expo-radio-button';
import useAuth from '../Hooks/useAuth';
import NextButton from '../Components/NextButton';
import axios from 'axios';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Divider, Provider } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import {BACKEND_URL, MODERATION_API_USER, MODERATION_API_SECRET, TEXT_MODERATION_URL, IMAGE_MODERATION_URL} from "@env"
import ThemeHeader from '../Components/ThemeHeader';
import themeContext from '../lib/themeContext';
import { db } from '../firebase'
import ProfileContext from '../lib/profileContext';
import { useMultiDownloadImage } from '../Hooks/useMultiDownloadImage';
const Caption = ({route}) => {
    const {post, postArray, group, mentions, groupPfp, actualGroup, groupName, groupId, text, value, edit, editCaption, editId, blockedUsers, admin} = route.params;
    const carouselRef = useRef(null);
    const [moodModal, setMoodModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [finished, setFinished] = useState(false);
    const [textInputValue, setTextInputValue] = useState('');
    const navigation = useNavigation();
    const [mood, setMood] = useState('');
    const [uploading, setUploading] = useState(false);
    const [actualPostArray, setActualPostArray] = useState([]);
    const [caption, setCaption] = useState('');
    const theme = useContext(themeContext)
    const {user} = useAuth()
    const [activeIndex, setActiveIndex] = useState(0);
    const [newPostArray, setNewPostArray] = useState([]);
    const [finalMentions, setFinalMentions] = useState([]);
    const profile = useContext(ProfileContext);
    //console.log(`Caption: ${caption}`)
    const {addImage, addVideo} = useMultiDownloadImage({user: user, caption: caption ?? '', actualPostArray: actualPostArray, setNewPostArray: setNewPostArray});
    /* useEffect(() => {
      if (route.params?.editCaption) {
        console.log('bruh')
        setCaption(editCaption)
      }
    }, [route.params?.editCaption]) */
    useEffect(() => {
      if (route.params?.mentions) {
        setFinalMentions(mentions)
      }
      
    }, [route.params?.mentions])
    useEffect(() => {
      if (route.params?.postArray) {
        if (postArray[0].text) {
          setTextInputValue(postArray[0].value)
        }
        setActualPostArray(postArray)
      }
    }, [route.params?.postArray])
  const updateCurrentUser = () => {
    setLoading(true)
    if (actualPostArray.length > 1 || (actualPostArray.length == 1 && !actualPostArray[0].text)) {
      uploadImages()
    }
    else {
      uploadText(actualPostArray[0])
    }

  }
  const updateEdit = async() => {
    setLoading(true)
    setUploading(true)
    if (actualPostArray[0].text) {
      data = new FormData();
    data.append('text', actualPostArray[0].value);
    data.append('lang', 'en');
    data.append('mode', 'rules');
    data.append('api_user', `${MODERATION_API_USER}`);
    data.append('api_secret', `${MODERATION_API_SECRET}`);
    axios({
    url: `${TEXT_MODERATION_URL}`,
    method:'post',
    data: data,
    })
    .then(async function (response) {
      if (response.data) {
                if (response.data.link.matches.length > 0) {
                    linkUsernameAlert()
                }
               
                else if (response.data.profanity.matches.length > 0 && response.data.profanity.matches.some(obj => obj.intensity === 'high')) {
                  
                    profanityUsernameAlert()
                
                }
                
                else {
                    if (!groupId) {
                                        await updateDoc(doc(db, 'posts', editId), {
                        post: actualPostArray
                        }).then(() => updateDoc(doc(db, 'profiles', user.uid, 'posts', editId), {
                          post: actualPostArray
                        })).then(() => navigation.goBack())
                                      }
                                      else {
                                        await updateDoc(doc(db, 'groups', groupId, 'posts', editId), {
                                    post: actualPostArray
                                   }).then(() => updateDoc(doc(db, 'groups', groupId, 'profiles', user.uid, 'posts', editId), {
                          post: actualPostArray
                        })).then(() => setFinished(true)).then(() => setUploading(false))
                                      }
                                  
                        } 
                      }
                    })

    }
    else {
      if (groupId) {
                
                if (caption.length > 0 && caption != editCaption) {
                    data = new FormData();
                        data.append('text', caption);
                        data.append('lang', 'en');
                        data.append('mode', 'rules');
                        data.append('api_user', `${MODERATION_API_USER}`);
                        data.append('api_secret', `${MODERATION_API_SECRET}`);
                        axios({
                        url: `${TEXT_MODERATION_URL}`,
                        method:'post',
                        data: data,
                        })
                        .then(async function (response) {
                          if (response.data) {
                                    if (response.data.link.matches.length > 0) {
                                        linkUsernameAlert()
                                    }
                                  
                                    else if (response.data.profanity.matches.length > 0 && response.data.profanity.matches.some(obj => obj.intensity === 'high')) {
                  
                    profanityUsernameAlert()
                
                }
                                    
                                    else { 
                                   await updateDoc(doc(db, 'groups', groupId, 'posts', editId), {
                                    caption: caption
                                   }).then(() => updateDoc(doc(db, 'groups', groupId, 'profiles', user.uid, 'posts', editId), {
                          caption: caption
                        })).then(() => navigation.goBack())
                                      
                        } 
                      }
                    })
                  }
                  else if (caption.length == 0 || caption == editCaption) {
                    await updateDoc(doc(db, 'groups', groupId, 'posts', editId), {
                        caption: caption
                        }).then(() => updateDoc(doc(db, 'groups', groupId, 'profiles', user.uid, 'posts', editId), {
                          caption: caption
                        })).then(() => navigation.goBack())
                  }
              }
              else {
                if (caption.length > 0 && caption != editCaption) {
                    data = new FormData();
                        data.append('text', caption);
                        data.append('lang', 'en');
                        data.append('mode', 'rules');
                        data.append('api_user', `${MODERATION_API_USER}`);
                        data.append('api_secret', `${MODERATION_API_SECRET}`);
                        axios({
                        url: `${TEXT_MODERATION_URL}`,
                        method:'post',
                        data: data,
                        })
                        .then(async function (response) {
                          if (response.data) {
                                    if (response.data.link.matches.length > 0) {
                                        linkUsernameAlert()
                                    }
                                  
                                    else if (response.data.profanity.matches.length > 0 && response.data.profanity.matches.some(obj => obj.intensity === 'high')) {
                  
                    profanityUsernameAlert()
                
                }
                                    
                                    else { 
                                      if (postArray[0].video) {
                                        await updateDoc(doc(db, 'videos', editId), {
                                            caption: caption
                                          }).then(() => updateDoc(doc(db, 'profiles', user.uid, 'posts', editId), {
                          caption: caption
                        })).then(() => navigation.goBack())
                                      }
                                      else {
                                        await updateDoc(doc(db, 'posts', editId), {
                                            caption: caption
                                          }).then(() => updateDoc(doc(db, 'profiles', user.uid, 'posts', editId), {
                          caption: caption
                        })).then(() => navigation.goBack())
                                      }
                                      
                                        
                                      }
                                   
                      }
                    })
                  }
                  else if (caption.length == 0 || caption == editCaption) {
                    if (postArray[0].video) {
                      await updateDoc(doc(db, 'videos', editId), {
                        caption: caption
                        }).then(() => updateDoc(doc(db, 'profiles', user.uid, 'posts', editId), {
                          caption: caption
                        })).then(() => navigation.goBack())
                    }
                    else {
                      await updateDoc(doc(db, 'posts', editId), {
                        caption: caption
                        }).then(() => updateDoc(doc(db, 'profiles', user.uid, 'posts', editId), {
                          caption: caption
                        })).then(() => navigation.goBack())
                    }
                    
                  }
              }
    }
              
  }
  
  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === 'Enter') {
      // Prevent user from manually inserting new lines
      return;
    }
  };
  const handleCaption = (inputText) => {
    const sanitizedText = inputText.replace(/\n/g, ''); // Remove all new line characters
    setCaption(sanitizedText);
  }
  const handleTextInputChange = (newValue) => {
    const sanitizedText = newValue.replace(/\n/g, ''); // Remove all new line characters
    setTextInputValue(sanitizedText);
    setActualPostArray(actualPostArray.map((item, index) => index === 0 ? { ...item, value: newValue } : item));
    //setActualPostArray([{ value: newValue }]); // Update the text in the data array
  };
  const scheduleMentionNotification = async(id, username, notificationToken) => {
    let notis = (await getDoc(doc(db, 'profiles', id))).data().allowNotifications
    let banned = (await getDoc(doc(db, 'profiles', id))).data().banned
    const deepLink = `nucliqv1://GroupChannels?id=${groupId}&group=${actualGroup}&person=${id}&pfp=${groupPfp}&name=${groupName}`;
     //let cliqNotis = (await getDoc(doc(db, 'groups', groupId))).data().allowPostNotifications
     if (groupId) {
      console.log('third')
      if (notis && cliqNotis.includes(user.uid)) {
      fetch(`${BACKEND_URL}/api/mentionCliqNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, clique: groupName, pushToken: notificationToken, "content-available": 1, data: {routeName: 'GroupChannels', deepLink: deepLink, id: groupId, group: actualGroup, person: id, pfp: groupPfp, name: groupName,}
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
    else {
      if (notis && !banned) {
      fetch(`${BACKEND_URL}/api/mentionNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, pushToken: notificationToken, "content-available": 1, data: {routeName: 'NotificationScreen', deepLink: 'nucliqv1://NotificationScreen'}
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
    
  }
  const linkUsernameAlert = () => {
        Alert.alert('Cannot post', 'Post/Caption cannot contain link', [
      {
        text: 'Cancel',
        onPress: () => {setUploading(false); setLoading(false)},
        style: 'cancel',
      },
      {text: 'OK', onPress: () => {setUploading(false); setLoading(false)}},
    ]);
    }
    
    const profanityUsernameAlert = () => {
        Alert.alert('Cannot post', 'Post/Caption cannot contain obscenities/slurs', [
      {
        text: 'Cancel',
        onPress: () => {setUploading(false); setLoading(false)},
        style: 'cancel',
      },
      {text: 'OK', onPress: () => {setUploading(false); setLoading(false)}},
    ]);
    }
    const uploadText = (item) => {
      setUploading(true)
    data = new FormData();
    data.append('text', item.value);
    data.append('lang', 'en');
    data.append('mode', 'rules');
    data.append('api_user', `${MODERATION_API_USER}`);
    data.append('api_secret', `${MODERATION_API_SECRET}`);
    axios({
    url: `${TEXT_MODERATION_URL}`,
    method:'post',
    data: data,
    })
    .then(async function (response) {
      if (response.data) {
        //console.log(response.data)
                if (response.data.link.matches.length > 0) {
                    linkUsernameAlert()
                }
                else if (response.data.profanity.matches.length > 0 && response.data.profanity.matches.some(obj => obj.intensity === 'high')) {
                  
                    profanityUsernameAlert()
                
                }
                
                else {
                  if (caption.length > 0) {
                    data = new FormData();
                        data.append('text', caption);
                        data.append('lang', 'en');
                        data.append('mode', 'rules');
                        data.append('api_user', `${MODERATION_API_USER}`);
                        data.append('api_secret', `${MODERATION_API_SECRET}`);
                        axios({
                        url: `${TEXT_MODERATION_URL}`,
                        method:'post',
                        data: data,
                        })
                        .then(async function (response) {
                          if (response.data) {
                                    if (response.data.link.matches.length > 0) {
                                        linkUsernameAlert()
                                    }
               
                                   else if (response.data.profanity.matches.length > 0 && response.data.profanity.matches.some(obj => obj.intensity === 'high')) {
                  
                    profanityUsernameAlert()
                
                }
                                    
                                    else { 
                                        const updatedArray = actualPostArray.slice();
                                  updatedArray[actualPostArray.findIndex(e => e.value == item.value)].visible = true
                                  updatedArray[actualPostArray.findIndex(e => e.value == item.value)].visible = true
                                  setNewPostArray(updatedArray)      
                        } 
                      }
                    })
                  } 
                  else {
                    //console.log(Localization.getLocales())
                    const updatedArray = actualPostArray.map((obj) => ({ ...obj }));
              updatedArray[actualPostArray.findIndex(e => e.value == item.value)].visible = true
              setNewPostArray(updatedArray)
                  }
                  
    } 
  }
})
    }
    const uploadImages = () => {
      setUploading(true);
        actualPostArray.map(async(item) => {
          if (item.image) {
            addImage(item)
          }
          else {
            addVideo(item)
          }
        })
    }
   

    useEffect(() => {
      if (newPostArray.length > 0) {
        
        if ((newPostArray.filter((item) => item.image == true).every(obj => obj['post'].includes('https://firebasestorage.googleapis.com')) && newPostArray.length == actualPostArray.length) || (newPostArray.filter((item) => item.text).every(obj => obj['visible'] == true) && newPostArray.length == actualPostArray.length)) {
            const doFunction = async() => {
    try {
    const response = await fetch(`http://10.0.0.225:4000/api/uploadPost`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {caption: caption, blockedUsers: blockedUsers, newPostArray: newPostArray, forSale: profile.forSale, value: value, finalMentions: finalMentions, pfp: profile.pfp, notificationToken: profile.notificationToken,
        background: profile.postBackground, user: user.uid, username: profile.userName, value: profile.private}}), // Send data as needed
    })
    const data = await response.json();
    //console.log(data)
      if (data.done) {
        if (finalMentions.length > 0 && newPostArray.length == 1 && newPostArray[0].video) {
         setFinished(true)
         setUploading(false)
         finalMentions.map(async(item) => {
          //Alert.alert('test', data)
      await setDoc(doc(db, 'profiles', item.id, 'notifications', data.docRefId), {
                                      like: false,
                                  comment: false,
                                  friend: false,
                                  item: data.docRefId,
                                  request: false,
                                  postMention: true,
                                  video: true,
                                  acceptRequest: false,
                                  theme: false,
                                  postId: data.docRefId,
                                  report: false,
                                  requestUser: user.uid,
                                  requestNotificationToken: item.notificationToken,
                                  likedBy: profile.userName,
                                  timestamp: serverTimestamp()
                                    }).then(async() => 
      await setDoc(doc(db, 'profiles', item.id, 'mentions', data.docRefId), {
      id: data.docRefId,
      video: true,
      timestamp: serverTimestamp()
    })).then(() => scheduleMentionNotification(item.id, profile.userName, item.notificationToken))})
  }
  else if (finalMentions.length > 0) {
    setFinished(true)
         setUploading(false)
         finalMentions.map(async(item) => {
          //Alert.alert('test', data)
      await setDoc(doc(db, 'profiles', item.id, 'notifications', data.docRefId), {
                                      like: false,
                                  comment: false,
                                  friend: false,
                                  item: data.docRefId,
                                  request: false,
                                  postMention: true,
                                  video: false,
                                  acceptRequest: false,
                                  theme: false,
                                  postId: data.docRefId,
                                  report: false,
                                  requestUser: user.uid,
                                  requestNotificationToken: item.notificationToken,
                                  likedBy: profile.userName,
                                  timestamp: serverTimestamp()
                                    }).then(async() => 
      await setDoc(doc(db, 'profiles', item.id, 'mentions', data.docRefId), {
      id: data.docRefId,
      timestamp: serverTimestamp()
    })).then(() => scheduleMentionNotification(item.id, profile.userName, item.notificationToken))})
  }
  else {
    setFinished(true)
    setUploading(false)
  }

   //then(() => 
      }
    
  } 
  catch (error) {
    console.error('Error:', error);
  }
   
       }
      
        doFunction()
          } 

      }
    }, [newPostArray])
    
  const renderItems = ({item, index}) => {
    //console.log(item)
    return (
      <View style={{
              backgroundColor: theme.backgroundColor,
              borderRadius: 8,
              padding: 10,
              elevation: 3,
              //width: '110%',
              flex: 1,
              alignItems: 'center',
              }}>
        {item.image ? <FastImage source={{uri: item.post}} style={{width: (Dimensions.get('screen').height / 2.91) * 1.01625,
    height: Dimensions.get('screen').height / 2.91,
    borderRadius: 8,}}/> : 
    <View style={{backgroundColor: item.backgroundColor, height: 200, width: '95%', borderRadius: 5,
    borderWidth: 0.25,
    padding: 5,}}>
    </View>
    }
      </View>
    )
    
  }
   return (
    <Provider>
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <ThemeHeader text={group ? `${groupName} Post` : 'New Post'} video={false}/>
      <Divider borderBottomWidth={0.85} borderColor={theme.color}/>
      <Modal transparent animationType='slide' onRequestClose={() => setMoodModal(false)} visible={moodModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <MaterialCommunityIcons onPress={() => setMoodModal(false)} name='close' size={30} color={"#fff"} style={{textAlign: 'right', marginLeft: 'auto', justifyContent: 'flex-end'}}/>
            <RadioButtonGroup
                        containerStyle={{ marginTop: '5%', marginLeft: '2.5%', flexDirection: 'row', flexWrap: 'wrap'}}
                        selected={mood}
                        onSelected={(value) => {setMood(value)}}
                        containerOptionStyle={{margin: 5, marginBottom: '10%'}}
                        radioBackground={theme.theme != 'light' ? "#9EDAFF" : "#005278"}
                        size={22.5}
                        radioStyle={{alignSelf: 'flex-start'}}
              >
                <RadioButtonItem value={"Excited"} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium', color: theme.color}}>Excited</Text>
                </View>
            }/>
            <RadioButtonItem value={"Funny"} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium', color: theme.color}}>Funny</Text>
                </View>
            }/>
            <RadioButtonItem value={"Grateful"} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium', color: theme.color}}>Grateful</Text>
                </View>
            }/>
            <RadioButtonItem value={"Happy"} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium', color: theme.color}}>Happy</Text>
                </View>
            }/>
            <RadioButtonItem value={"Mad"} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium', color: theme.color}}>Mad</Text>
                </View>
            }/>
            <RadioButtonItem value={"Sad"} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium', color: theme.color}}>Sad</Text>
                </View>
            }/>
            <RadioButtonItem value={"Scared"} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium', color: theme.color}}>Scared</Text>
                </View>
            }/>
            <RadioButtonItem value={""} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium', color: theme.color}}>No Mood</Text>
                </View>
            }/>
            </RadioButtonGroup>
            
            {/* <View style={{flexWrap: 'wrap', flexDirection: 'row'}}>
              <TouchableOpacity activeOpacity={1} onPress={() => setMood('Excited')}  style={{flexDirection: 'row', alignItems: 'center', marginTop: '5%', marginLeft: '5%'}}>
                <Checkbox value={mood} onValueChange={() => setMood('Excited')} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
                <Text style={[styles.editText, {color: theme.color}]}>Excited</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={1} onPress={() => setMood('Funny')}  style={{flexDirection: 'row', alignItems: 'center', marginTop: '5%', marginLeft: '5%'}}>
                <Checkbox value={mood} onValueChange={() => setMood('Funny')} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
                <Text style={[styles.editText, {color: theme.color}]}>Funny</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={1} onPress={() => setMood('Grateful')}  style={{flexDirection: 'row', alignItems: 'center', marginTop: '5%', marginLeft: '5%'}}>
                <Checkbox value={mood} onValueChange={() => setMood('Grateful')} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
                <Text style={[styles.editText, {color: theme.color}]}>Grateful</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={1} onPress={() => setMood('Happy')}  style={{flexDirection: 'row', alignItems: 'center', marginTop: '5%', marginLeft: '5%'}}>
                <Checkbox value={mood} onValueChange={() => setMood('Happy')} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
                <Text style={[styles.editText, {color: theme.color}]}>Happy</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={1} onPress={() => setMood('Mad')}  style={{flexDirection: 'row', alignItems: 'center', marginTop: '5%', marginLeft: '5%'}}>
                <Checkbox value={mood} onValueChange={() => setMood('Mad')} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
                <Text style={[styles.editText, {color: theme.color}]}>Mad</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={1} onPress={() => setMood('Sad')}  style={{flexDirection: 'row', alignItems: 'center', marginTop: '5%', marginLeft: '5%'}}>
                <Checkbox value={mood} onValueChange={() => setMood('Sad')} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
                <Text style={[styles.editText, {color: theme.color}]}>Sad</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={1} onPress={() => setMood('Scared')}  style={{flexDirection: 'row', alignItems: 'center', marginTop: '5%', marginLeft: '5%'}}>
                <Checkbox value={mood} onValueChange={() => setMood('Scared')} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
                <Text style={[styles.editText, {color: theme.color}]}>Scared</Text>
              </TouchableOpacity>
              
              
            </View> */}
          </View>
        </View>
      </Modal>
        <View style={styles.main}>
          {finished ? 
          <View style={{alignItems: 'center'}}>
          <View style={{flexDirection: 'row'}}>
            <Text style={[styles.successText, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Success!</Text>
            <MaterialCommunityIcons name='check' size={30} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} style={{alignSelf: 'center'}}/>
            </View> 
          {group ? 
          <>
          <Text style={[styles.successText, {fontFamily: 'Montserrat_500Medium', fontSize: 19.20, color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Your post is now uploaded in the {groupName} Cliq!</Text> 
          <View style={{marginTop: '5%'}}>
            <NextButton  text={`Go to ${groupName} Cliq`} onPress={() => navigation.navigate('Cliqs', {screen: 'GroupHome', params: {name: groupId, newPost: false, postId: null}})}/>
          </View>
          </>
          : <Text style={[styles.successText, {fontFamily: 'Montserrat_500Medium', fontSize: 19.20, color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>{newPostArray.length == 1 ? newPostArray[0].text ?  'Your vibe is now uploaded on the home page!' : newPostArray[0].video ?
            'Your vid is now uploaded on the vidz page!' : 'Your post is now uploaded on the home page!' : 'Your post is now uploaded on the home page!'}</Text>}
            </View>: 
          <KeyboardAwareScrollView style={{marginTop: '5%',}} >
            {loading ? 
            <View>
              <Text style={{fontSize: 15.36, textAlign: 'center', fontFamily: 'Montserrat_400Regular', padding: 10, color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}}> Moderating post, may take a few moments...</Text>
              <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} style={{marginBottom: '5%'}}/> 
            </View>
            : 
          <View style={{ justifyContent: 'center', alignItems: 'center'}}>
            {route.params?.postArray.length == 1 ?  
            actualPostArray.map((item) => {
              if (item.image) {
                return (
                   <View style={{
              backgroundColor: theme.backgroundColor,
              borderRadius: 8,
              padding: 10,
              elevation: 3,
              //width: '110%',
              flex: 1,
              alignItems: 'center',
              }}>
                  <FastImage source={{uri: item.post}} style={{width: (Dimensions.get('screen').height / 2.91) * 1.01625,
              height: (Dimensions.get('screen').height / 2.91),
              borderRadius: 8,}}/>

                  </View>
                )
              }
              else if (item.video) {
                return (
                <View style={{
              backgroundColor: theme.backgroundColor,
              borderRadius: 8,
              padding: 10,
              elevation: 3,
              //width: '110%',
              flex: 1,
              alignItems: 'center',
              }}>
                <FastImage source={{uri: item.thumbnail}} style={{width: Dimensions.get('screen').height / 6.3288,
              height: Dimensions.get('screen').height / 2.93,
              borderRadius: 8,}}/>
                  </View>
                )
              }
              else {
                return (
                  <TextInput style={{borderRadius: 5, color: theme.color,
                  borderWidth: 0.5,
                  borderColor: theme.color,
                  padding: 5,
                  width: '95%',
                  margin: '5%',
                  marginTop: '2.5%', fontFamily: 'Montserrat_500Medium', fontSize: actualPostArray[0].textSize}} multiline
                  editable={edit} value={textInputValue} onChangeText={handleTextInputChange} onKeyPress={handleKeyPress}/>
                )
              }
            }) :
            route.params?.postArray.length > 1 ? <>
            <Carousel
              layout={"default"}
              ref={carouselRef}
              data={actualPostArray}
              sliderWidth={300}
              itemWidth={300}
              renderItem={renderItems}
              onSnapToItem = { index => setActiveIndex(index) } />
          <Pagination 
            dotsLength={actualPostArray.length}
            activeDotIndex={activeIndex}
            containerStyle={styles.paginationContainer}
            dotStyle={[styles.paginationDot, {backgroundColor: theme.color}]}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.6}
          />
          </> : <View style={{
              backgroundColor: theme.backgroundColor,
              borderRadius: 8,
              padding: 10,
              elevation: 3,
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1}}>
                {post != undefined ? <Image source={{uri: post}} style={{width: 300,
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,}}/> : 
    <View style={{width: 300, height: 100}}>
      <Text>{text}</Text>
    </View>
    }
        
    </View>}
          
          </View>}
        {actualPostArray.length > 1 || (actualPostArray.length == 1 && !actualPostArray[0].text)? <>
        <View style={{marginTop: '2.5%'}}>
        <InputBox text={'Caption...'} onChangeText={handleCaption} key={handleKeyPress} multiline={true} inputStyle={{paddingLeft: -10}} multilineStyle={{minHeight: Dimensions.get('screen').height / 8.44, maxHeight: Dimensions.get('screen').height / 2.44}} maxLength={200} value={caption} />
                  </View>
          <Text style={{textAlign: 'right', padding: 10, paddingRight: 15, paddingBottom: 5, color: theme.color}}>{caption.length}/200</Text></> : null}

          {edit && actualPostArray != null && actualPostArray[0].text ? <View style={{flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: '10%'}}>
      </View> : null}
      {!edit ? 
      <View style={{flexDirection: 'column'}}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginLeft: 20, width: '90%'}}>
          <TouchableOpacity onPress={!edit && !uploading ? () => navigation.navigate('MentionPreview', {groupName: groupName, userName: profile.userName, actualGroup: actualGroup, groupPfp: groupPfp, blockedUsers: blockedUsers, admin: admin, postArray: actualPostArray, group: group, groupId: groupId, value: value, edit: false, oGmentions: finalMentions}): null}>
            {!finalMentions && !edit || finalMentions.length == 0 && !edit ? <Text style={{fontFamily: 'Montserrat_500Medium', fontSize: 15.36, color: theme.color}}>T@g</Text> : 
            <View style={{flexDirection: 'row'}} >
            {finalMentions.map((item, index) => {
              //console.log(item)
              if (index != finalMentions.length - 1) {
                return (
              <Text style={{fontFamily: 'Montserrat_500Medium', fontSize: 15.36, color: theme.color}}>@{item.username ? item.username : item.userName}, </Text>
              )
              }
              else {
                return (
                   <Text style={{fontFamily: 'Montserrat_500Medium', fontSize: 15.36, color: theme.color}}>@{item.username ? item.username: item.userName}</Text>
                )
              }
              
            }
            )}
            </View>}
            
          </TouchableOpacity>
          </ScrollView> 
          </View>
          : null
}
          <Divider style={{borderWidth: 0.5, width: '95%', marginLeft: '2.5%', marginTop: '2.5%'}} />
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginLeft: '2.5%', marginRight: '2.5%', marginTop: '2.5%',}}>
            {!uploading ? 
            <MainButton textStyle={{fontSize: 12.29}} text={edit ? "CANCEL" : "BACK"} onPress={() => navigation.goBack()}/> : 
            null
            }
            
            {uploading ? 
            <ActivityIndicator style={{justifyContent: 'flex-end', alignItems: 'flex-end', flex: 1, margin: '5%'}} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> : 
            <View style={{justifyContent: 'flex-end', alignItems: 'flex-end', flex: 1}}>
            <NextButton text={edit ? "SAVE" : "POST"} onPress={route.params?.postArray && !edit ? () => updateCurrentUser() : edit ? () => updateEdit() :  null}/> 
            </View>
            }
            
          </View>
        </KeyboardAwareScrollView> 
}
        </View>
          
    </View>
    </Provider>
  )
}

export default Caption

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    main: {
        
    //flex: 1,
    },
    cardContainer: {
      alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
    //ackgroundColor: 'red'
    },
    cardWrapper: {
      borderRadius: 8,
    overflow: 'hidden',
    },
    postText: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      textAlign: 'left',
      padding: 10,
      
    },
    paginationContainer: {
      //marginTop: -110,
      marginTop: -30,
      marginBottom: -15
  },
  paginationDot: {
     width: 12.5,
    height: 12.5,
    margin: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderWidth: 0.5
  },
    centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    //alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    //margin: 20,
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 24,
    padding: 10,
    textAlign: 'center',
    color: "#005278"
  },
  editText: {
    fontSize: 19.20,
    fontFamily: 'Montserrat_500Medium',
    marginLeft: '5%'
  },
})