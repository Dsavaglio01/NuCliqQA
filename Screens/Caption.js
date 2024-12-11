import { StyleSheet, Text, View, Image, Modal, TouchableOpacity, ScrollView, Dimensions, KeyboardAvoidingView,
  Platform, Alert,
  ActivityIndicator,
  TextInput,} from 'react-native'
import React, {useEffect, useState, useRef, useContext} from 'react'
import { ref, getDownloadURL, getStorage, deleteObject, uploadBytesResumable} from 'firebase/storage';
import { addDoc, collection, serverTimestamp, getDoc, doc, getFirestore, where, getDocs, query, updateDoc, setDoc, deleteDoc} from 'firebase/firestore';
import RegisterHeader from '../Components/RegisterHeader';
import { useNavigation } from '@react-navigation/native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import InputBox from '../Components/InputBox';
import MainButton from '../Components/MainButton';
import Checkbox from 'expo-checkbox';
import RadioButtonGroup, {RadioButtonItem} from 'expo-radio-button';
import useAuth from '../Hooks/useAuth';
import NextButton from '../Components/NextButton';
import axios from 'axios';
import Header from '../Components/Header';
import NewPostHeader from '../Components/NewPostHeader';
import Carousel, {Pagination} from 'react-native-snap-carousel';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Divider, Menu, Provider } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import {BACKEND_URL, MODERATION_API_USER, MODERATION_API_SECRET, TEXT_MODERATION_URL, IMAGE_MODERATION_URL} from "@env"
import ThemeHeader from '../Components/ThemeHeader';
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
import {francAll, franc} from 'franc'
import { db } from '../firebase'
const Caption = ({route}) => {
    const {post, postArray, group, mentions, groupPfp, actualGroup, groupName, groupId, text, value, edit, editCaption, editId, blockedUsers, admin, userName} = route.params;
    console.log(postArray, edit, editCaption, editId)
    //console.log(group)
    //console.log(groupId)
    //console.log(postArray)
    //console.log(mentions)
    //console.log(actualGroup)x
    const storage = getStorage();
    const video = useRef(null);
    const carouselRef = useRef(null);
    const [moodModal, setMoodModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [link, setLink] = useState();
    const [privacy, setPrivacy] = useState(false);
    const [finished, setFinished] = useState(false);
    const [textInputValue, setTextInputValue] = useState('');
    const [newPost, setNewPost] = useState();
    const navigation = useNavigation();
    const [mood, setMood] = useState('');
    const [uploading, setUploading] = useState(false);
    const [actualPostArray, setActualPostArray] = useState([]);
    const [caption, setCaption] = useState('');
    const theme = useContext(themeContext)
    const {user} = useAuth()
    const openSizeMenu = () => setSizeVisible(true)
    const [alertIsVisible, setAlertIsVisible] = useState(false);
    const closeSizeMenu = () => setSizeVisible(false)
    const [sizeVisible, setSizeVisible] = useState(false)
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [pfp, setPfp] = useState('');
    const [backButton, setBackButton] = useState(true);
    const [background, setBackground] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [newPostArray, setNewPostArray] = useState([]);
    // const [hashtagId, setHashTagId] = useState([]);
    const [forSale, setForSale] = useState(false);
    const [imageArray, setImageArray] = useState([]);
    const [finalMentions, setFinalMentions] = useState([]);
    const [finalPostArray, setFinalPostArray] = useState([]);
    const [notificationToken, setNotificationToken] = useState('');
    useEffect(() => {
      if (route.params?.editCaption) {
        setCaption(editCaption)
        /* if (route.params?.editCaption.match(/#[^\s]+/g)) {
          const getData = async() => {
            const q = query(collection(db, 'hashtags'), where("postId", "==", editId));
            const querySnapshot = await getDocs(q);
              querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                setHashTagId(prevState => [...prevState, doc.id])
              });
            //await getDocs(collection(db, 'hashtags'))
          }
          getData()
        } */
      }
    }, [route.params?.editCaption])
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
    useEffect(() => {
    const getProfileDetails = async() => {
    const docSnap = await getDoc(doc(db, 'profiles', user.uid)); 
      
    if (docSnap.exists()) {
      const profileSnap = (await getDoc(doc(db, 'profiles', user.uid))).data()
      setFirstName(profileSnap.firstName);
      setLastName(profileSnap.lastName);
      setUsername(profileSnap.userName);
      setPfp(profileSnap.pfp);
      setPrivacy(profileSnap.private);
      setBackground(profileSnap.postBackground);
      setNotificationToken(profileSnap.notificationToken)
      setForSale(profileSnap.forSale)
    } 
  }
  
  getProfileDetails();
  }, [])

  const updateCurrentUser = () => {
    setLoading(true)
    if (actualPostArray.length > 1 || (actualPostArray.length == 1 && !actualPostArray[0].text)) {
      uploadImages()
    }
    else {
      uploadText(actualPostArray[0])
    }
    
    setBackButton(false)
    /*  */

  }
  //console.log(groupId)
  const updateEdit = async() => {
    setLoading(true)
    setUploading(true)
    setBackButton(false)
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
  function uploadPostRecommend (id, post) {
      fetch(`${BACKEND_URL}/api/createRecommendPost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: id, caption: text, likedBy: [], comments: 0, shares: 0, usersSeen: [],
        savedBy: [], username: username, post: post,
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
    //console.log(post)
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
  const handleActualTextSize = (newValue) => {
    setActualPostArray(actualPostArray.map((item, index) => index === 0 ? { ...item, textSize: newValue } : item));
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
      //console.log(notificationToken)
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
      //console.log('first')
      setUploading(true);
        actualPostArray.map(async(item) => {
          if (item.image) {
            const response = await fetch(item.post)
        //console.log(response)
        const blob = await response.blob();
        //console.log(blob)
        const filename = `posts/${user.uid}post${Date.now()}${item.id}.jpg`

        var storageRef = ref(storage, filename)
        try {
            await storageRef;
        } catch (error) {
            console.log(error)
        }
        await uploadBytesResumable(storageRef, blob).then(() => getLink(filename, item))
          }
          else {
            const response = await fetch(item.post)
        //console.log(response)
        const blob = await response.blob();
        //console.log(blob)
        const filename = `posts/${user.uid}post${Date.now()}.mp4`

        var storageRef = ref(storage, filename)
        try {
            await storageRef;
        } catch (error) {
            console.log(error)
        }
        await uploadBytesResumable(storageRef, blob).then(() => getVideoLink(filename, item))
            //uploadVideo(item)
            //uploadText(item)
          }
        })
        //setUploading(false)
    }
    const getLink = (post, item) => {
  
        const starsRef = ref(storage, post);
        getDownloadURL(starsRef).then((url) => CheckMultiplePfp(url, starsRef, item)).catch((e) => console.error(e))
    }
    const getVideoLink = (post, item) => {
      const starsRef = ref(storage, post);
        getDownloadURL(starsRef).then((url) => checkVideo(url, starsRef, item)).catch((e) => console.error(e))
    }
    const checkVideo = (url, reference, item) => {
      fetch(`${BACKEND_URL}/api/videoModeration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video: url,
      }),
      })
    .then(responseData => responseData.json())
    .then(response => {
     Promise.all(response.data.frames.map(async(ele) => {
        if(ele.nudity.hasOwnProperty('none')) {
              delete ele.nudity['none']
            }
          if (ele.nudity.hasOwnProperty('context')) {
               delete ele.nudity.context
            }
            if (ele.nudity.hasOwnProperty('erotica')) {
              if (ele.nudity.erotica >= 0.68) {
                Alert.alert('Unable to Post', `Post Goes Against Our Guidelines`, [
                {
                  text: 'Cancel',
                  onPress: () => deleteObject(reference).then(() => {setUploading(false); setLoading(false);}).catch((error) => {
                  throw error;
                  
                }),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => deleteObject(reference).then(() => {setUploading(false); setLoading(false);}).catch((error) => {
                  throw error;
                  
                })},
              ]);
              throw null;
              }
              else {
                delete ele.nudity.erotica
              }
              //console.log(response.data.nudity.suggestive)
            }
            if (ele.drugs > 0.9 || ele.gore.prob > 0.9 || containsNumberGreaterThan(getValuesFromImages(Object.values(ele.nudity)), 0.95)
            || containsNumberGreaterThan(Object.values(ele.offensive), 0.9) || ele.recreational_drugs > 0.9 || ele.medical_drugs > 0.9 || ele.scam > 0.9 ||
            ele.skull.prob > 0.9 || ele.weapon > 0.9 || ele.weapon_firearm > 0.9 || ele.weapon_knife > 0.9) {
              Alert.alert('Unable to Post', 'This Post Goes Against Our Guidelines', [
                {
                  text: 'Cancel',
                  onPress: () => deleteObject(reference).then(() => {setUploading(false); setLoading(false)}).catch((error) => {
                  console.error(error)
                }),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => deleteObject(reference).then(() => {setUploading(false); setLoading(false)}).catch((error) => {
                  console.error(error)
                })},
              ]);
              throw 'error';
            }
                  })).then(async() => {
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
                                      const response = await fetch(actualPostArray[0].thumbnail)
                                      //console.log(response)
                                      const blob = await response.blob();
                                      //console.log(blob)
                                      const filename = `posts/${user.uid}postThumbnail${Date.now()}.jpg`

                                      var storageRef = ref(storage, filename)
                                      try {
                                          await storageRef;
                                      } catch (error) {
                                          console.log(error)
                                      }
                                      await uploadBytesResumable(storageRef, blob).then(() => {
                                        const starsRef = ref(storage, filename);
                                          getDownloadURL(starsRef).then((thumbUrl) => {
                                            const updatedArray = actualPostArray.map((obj) => ({ ...obj }));
                                      
                                      
                                      updatedArray[actualPostArray.findIndex(e => e.thumbnail == item.thumbnail)].thumbnail = thumbUrl
                                      updatedArray[0].post = url
                                      setNewPostArray(updatedArray) 
                                      }).catch((e) => console.error(e))
                                      })
                                      
                                     
                        } 
                      }
                    })
                  } 
                  else {
             const response = await fetch(actualPostArray[0].thumbnail)
                                      //console.log(response)
                                      const blob = await response.blob();
                                      //console.log(blob)
                                      const filename = `posts/${user.uid}postThumbnail${Date.now()}.jpg`

                                      var storageRef = ref(storage, filename)
                                      try {
                                          await storageRef;
                                      } catch (error) {
                                          console.log(error)
                                      }
                                      await uploadBytesResumable(storageRef, blob).then(() => {
                                        const starsRef = ref(storage, filename);
                                      getDownloadURL(starsRef).then((thumbUrl) => {
                                        const updatedArray = actualPostArray.map((obj) => ({ ...obj }));
                                  //console.log(postArray)
                                  updatedArray[actualPostArray.findIndex(e => e.thumbnail == item.thumbnail)].thumbnail = thumbUrl
                                  updatedArray[0].post = url
                                  setNewPostArray(updatedArray) 
                                      }).catch((e) => console.error(e))
                                      })
                  }
                    })
            .catch(function (error) {
            // handle error
            if (error.response) console.log(error.response.data);
            else console.log(error.message);
      });
      
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error(error);
    })
    }
    //console.log(newPostArray)
    const areObjectsEqual = (obj1, obj2, property) => {
      return obj1[property] === obj2[property];
    };
      const hasCommonItem = (array1, array2, property) => {
      for (let i = 0; i < array1.length; i++) {
        for (let j = 0; j < array2.length; j++) {
          if (areObjectsEqual(array1[i], array2[j], property)) {
            return true; // Found a common item
          }
        }
      }
      return false; // No common item found
    };
   

    useEffect(() => {
      if (newPostArray.length > 0) {
        
        if ((newPostArray.filter((item) => item.image == true).every(obj => obj['post'].includes('https://firebasestorage.googleapis.com')) && newPostArray.length == actualPostArray.length) || (newPostArray.filter((item) => item.text).every(obj => obj['visible'] == true) && newPostArray.length == actualPostArray.length)) {
            const doFunction = async() => {
          //
          //let cloudUrl = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/uploadPost'
    try {
    //await fetch(`{
    //)
    const response = await fetch(`${BACKEND_URL}/api/uploadPost`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {caption: caption, blockedUsers: blockedUsers, newPostArray: newPostArray, forSale: forSale, value: value, finalMentions: finalMentions, pfp: pfp, notificationToken: notificationToken,
        background: background, user: user.uid, username: username, value: privacy}}), // Send data as needed
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
                                  likedBy: username,
                                  timestamp: serverTimestamp()
                                    }).then(async() => 
      await setDoc(doc(db, 'profiles', item.id, 'mentions', data.docRefId), {
      id: data.docRefId,
      video: true,
      timestamp: serverTimestamp()
    })).then(() => scheduleMentionNotification(item.id, username, item.notificationToken))})
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
                                  likedBy: username,
                                  timestamp: serverTimestamp()
                                    }).then(async() => 
      await setDoc(doc(db, 'profiles', item.id, 'mentions', data.docRefId), {
      id: data.docRefId,
      timestamp: serverTimestamp()
    })).then(() => scheduleMentionNotification(item.id, username, item.notificationToken))})
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
    //console.log(finished)
    //{screen: 'All', params: { registers: true, group: null, groupId: null, name: null, goToMy: false}})) 
    function containsNumberGreaterThan(array, threshold) {
      return array.some(function(element) {
        return element > threshold;
      });
    }
    const getValuesFromImages = (list) => {
      //console.log(list)
      let newList = filterByType(list, 'object')
      //console.log(newList)
      let tempList = filterByType(list, 'number')
      tempList.forEach((obj) => {
        //console.log(obj)
        filterByType(Object.values(obj), 'object').forEach((e) => {
          newList.push(e)
        })
        filterByType(Object.values(obj), 'number').forEach((e) => {
          if (e.hasOwnProperty('none')) {
            delete e['none']
            Object.values(e).forEach((element) => {
              newList.push(element)
            })
          }

        })
        //newList.push(filterByType(Object.values(obj), 'object'))
      })
      //console.log(newList)
      return newList
    }
    //console.log(postArray)
    
    function filterByType(arr, type) {
      return arr.filter(function(item) {
        return typeof item !== type;
      });
    }
    const CheckMultiplePfp = async(url, reference, item) => {
      axios.get(`${IMAGE_MODERATION_URL}`, {
            params: {
                'url': url,
                'models': 'nudity-2.0,wad,offensive,scam,gore,qr-content',
                'api_user': `${MODERATION_API_USER}`,
                'api_secret': `${MODERATION_API_SECRET}`,
            }
            })
            .then(async function (response) {
              console.log(response.data)
            if(response.data.nudity.hasOwnProperty('none')) {
              delete response.data.nudity['none']
            }
            if (response.data.nudity.hasOwnProperty('context')) {
              delete response.data.nudity.context
            }
            if (response.data.nudity.hasOwnProperty('erotica')) {
              if (response.data.nudity.erotica >= 0.5) {
                console.log('first')
                Alert.alert('Unable to Post', `Post #${item.id} Goes Against Our Guidelines`, [
                {
                  text: 'Cancel',
                  onPress: () => deleteObject(reference).then(() => {setUploading(false); setLoading(false);}).catch((error) => {
                  throw error;
                  
                }),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => deleteObject(reference).then(() => {setUploading(false); setLoading(false);}).catch((error) => {
                  throw error;
                  
                })},
              ]);
              throw null;
              }
              else {
                delete response.data.nudity.erotica
              }
              //console.log(response.data.nudity.suggestive)
            }
            //console.log(response.data.nudity)
            //console.log(response.data.nudity.hasOwnProperty('none'))
            if (response.data.drugs > 0.9 || response.data.gore.prob > 0.9 || containsNumberGreaterThan(getValuesFromImages(Object.values(response.data.nudity)), 0.95)
            || containsNumberGreaterThan(Object.values(response.data.offensive), 0.9) || response.data.recreational_drugs > 0.9 || response.data.medical_drugs > 0.9 || response.data.scam > 0.9 ||
            response.data.skull.prob > 0.9 || response.data.weapon > 0.9 || response.data.weapon_firearm > 0.9 || response.data.weapon_knife > 0.9) {
              
              Alert.alert('Unable to Post', `Post #${item.id} Goes Against Our Guidelines`, [
                {
                  text: 'Cancel',
                  onPress: () => deleteObject(reference).then(() => {setUploading(false); setLoading(false);}).catch((error) => {
                  throw error;
                  
                }),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => deleteObject(reference).then(() => {setUploading(false); setLoading(false);}).catch((error) => {
                  throw error;
                  
                })},
              ]);
              throw null;
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
                                      
                                        const updatedArray = actualPostArray.map((obj) => ({ ...obj }));
                                  
                                  
                                  updatedArray[actualPostArray.findIndex(e => e.post === item.post)].post = url
                                  //console.log(updatedArray)
                                  
                                  setNewPostArray(prevState => [updatedArray[actualPostArray.findIndex(e => e.post === item.post)], ...prevState])
                                      
                                      
                        } 
                      }
                    })
                  } 
                  else {
                    //console.log(url)
              const updatedArray = actualPostArray.map((obj) => ({ ...obj }));
                                  //console.log(postArray)
                                  
                                  updatedArray[actualPostArray.findIndex(e => e.post === item.post)].post = url
                                  //console.log(updatedArray)
                                  
                                  setNewPostArray(prevState => [updatedArray[actualPostArray.findIndex(e => e.post === item.post)], ...prevState])
                  }
                    }
                    })
            .catch(function (error) {
            // handle error
            if (error.response) console.log(error.response.data);
            else console.log(error.message);
            });
    }
    //console.log(postArray)
    //console.log(newPostArray)
    //console.log(newPost)
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
    //console.log(item)
    
  }
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  //console.log(group)
  console.log(newPostArray)
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
        
        {/* <Menu 
            visible={sizeVisible}
            onDismiss={closeSizeMenu}
            contentStyle={{backgroundColor: theme.backgroundColor, borderWidth: 1, borderColor: "#71797E"}}
            anchor={<MaterialCommunityIcons name='format-size' size={30} onPress={openSizeMenu}/>}>
            <Menu.Item onPress={() => handleActualTextSize(15.36)} title="Small" titleStyle={{color: "#000"}}/>
            <Divider />
            <Menu.Item onPress={() => handleActualTextSize(19.20)} title="Medium" titleStyle={{color: "#000"}}/>
            <Divider />
            <Menu.Item onPress={() => handleActualTextSize(24)} title="Large" titleStyle={{color: "#000"}}/>
          </Menu> */}
        {/* <TouchableOpacity style={{alignSelf: 'center', justifyContent: 'flex-end', flex: 1}} onPress={() => {handleActualTextSize(postArray[0].textSize)}}>
          <Text style={{fontSize: 19.20, fontWeight: '600', color: "#9edaff"}}>Clear</Text>
        </TouchableOpacity> */}
      </View> : null}
      {!edit ? 
      <View style={{flexDirection: 'column'}}>
      {/* <TouchableOpacity style={{marginLeft: '5%', marginBottom: 5}} onPress={() => setMoodModal(true)}>
        <Text style={{fontFamily: 'Montserrat_500Medium', fontSize: 15.36, color: theme.color}}>{mood.length > 0 ? mood : 'Add Mood'}</Text>
      </TouchableOpacity> */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginLeft: 20, width: '90%'}}>
          <TouchableOpacity onPress={!edit && !uploading ? () => navigation.navigate('MentionPreview', {groupName: groupName, userName: username, actualGroup: actualGroup, groupPfp: groupPfp, blockedUsers: blockedUsers, admin: admin, postArray: actualPostArray, group: group, groupId: groupId, value: value, edit: false, oGmentions: finalMentions}): null}>
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