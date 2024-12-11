import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Modal, Image, KeyboardAvoidingView, Alert, Platform } from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import NextButton from '../Components/NextButton';
import { useNavigation } from '@react-navigation/native';
import MainButton from '../Components/MainButton';
import useAuth from '../Hooks/useAuth';
import { ref, getDownloadURL, getStorage, deleteObject, uploadBytesResumable } from 'firebase/storage'
import { Divider } from 'react-native-paper';
import ThemeHeader from '../Components/ThemeHeader';
import InputBox from '../Components/InputBox';
import Checkbox from 'expo-checkbox';
import { db } from '../firebase';
import axios from 'axios';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { collection, getDocs, query, updateDoc, where, doc, onSnapshot, addDoc, setDoc, serverTimestamp, arrayUnion, getDoc, deleteDoc, increment} from 'firebase/firestore';
import PreviewFooter from '../Components/PreviewFooter';
import {BACKEND_URL, MODERATION_API_USER, MODERATION_API_SECRET, TEXT_MODERATION_URL, IMAGE_MODERATION_URL} from "@env"
import { useFonts, Montserrat_700Bold, Montserrat_500Medium, Montserrat_400Regular } from '@expo-google-fonts/montserrat'
import FastImage from 'react-native-fast-image';
import themeContext from '../lib/themeContext';
const SuccessTheme = ({route}) => {
    const {post, name, edit, themeId, actualThemeName, actualKeywords, searchKeywords, selling, actualPrice} = route.params; 
    //console.log(actualKeywords)
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const [time, setTime] = useState(10);
    const [themeName, setThemeName] = useState(edit ? actualThemeName : '');
    const [acutalThemeId, setActualThemeId] = useState(null);
    const [keywords, setKeywords] = useState(edit ? searchKeywords : '');
    const {user} = useAuth()
    const theme = useContext(themeContext);
    const [price, setPrice] = useState(0);
    const [errorPriceRange, setErrorPriceRange] = useState(false);
    const storage = getStorage();
    const [sellChecked, setSellChecked] = useState(false);
    const [groupsJoined, setGroupsJoined ] = useState([]);
    const [profilePic, setProfilePic] = useState(null);
    const [profileChecked, setProfileChecked] = useState(false);
    const [privacy, setPrivacy] = useState([]);
    const [postChecked, setPostChecked] = useState(false);
    const [emptyThemeName, setEmptyThemeName] = useState(false);
    const [emptyKeywords, setEmptyKeywords] = useState(false);
    const [originalKeywords, setOriginalKeywords] = useState(edit ? actualKeywords : '');
    const [infoModal, setInfoModal] = useState(false);
    const [formattedPrice, setFormattedPrice] = useState(0);
    const [errorPersonalThemeName, setErrorPersonalThemeName] = useState(false);
    const [errorLinkThemeName, setErrorLinkThemeName] = useState(false);
    const [errorProfanityThemeName, setErrorProfanityThemeName] = useState(false);
    const [errorPersonalKeywords, setErrorPersonalKeywords] = useState(false);
    const [errorLinkKeywords, setErrorLinkKeywords] = useState(false);
    const [errorProfanityKeywords, setErrorProfanityKeywords] = useState(false);
    const [errorThemeName, setErrorThemeName] = useState(false);
    const [themeNames, setThemeNames] = useState([])
    const [stripeId, setStripeId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [notificationToken, setNotificationToken] = useState(null);
    //console.log(themeId)
    useEffect(() => {
        if (route.params?.edit == true && route.params?.post) {
            const getData = async() => {
                const background = await getDoc(doc(db, 'profiles', user.uid))
                    const docSnap = await getDocs(collection(db, 'products'), where('images', 'array-contains', post))
                    const freeDocSnap = await getDocs(collection(db, 'freeThemes'), where('images', 'array-contains', post))
                    if (docSnap.docs.length > 0) {
                      setActualThemeId(docSnap.docs[0].id)
                    }
                    else if (freeDocSnap.docs.length > 0) {
                        setActualThemeId(freeDocSnap.docs[0].id)
                    }

                if (background.data().postBackground == post) {
                    setPostChecked(true)
                }
                if (background.data().background == post) {
                    //console.log('first')
                    setProfileChecked(true)
                }
            }
            getData()
        }
    }, [route.params?.edit, route.params?.post])
    useEffect(() => {
      let unsub;
      const getData = () => {
        unsub = onSnapshot(doc(db, 'profiles', user.uid), (doc) => {
          setGroupsJoined(doc.data().groupsJoined)
          setPrivacy(doc.data().private)
        })
      }
      getData()
      return unsub;
    }, [])
    useEffect(() => {
        const getProfileDetails = async() => {
          const profileSnap = (await getDoc(doc(db, 'profiles', user.uid))).data()
      setStripeId(profileSnap.stripeAccountID)
      setNotificationToken(profileSnap.notificationToken)
        }   
        getProfileDetails()
    }, [])
    useEffect(() => {
      const getNames = async() => {
        const querySnapshot = await getDocs(collection(db, "profiles", user.uid, 'myThemes'));
          querySnapshot.forEach((doc) => {
            setThemeNames(prevState => [...prevState, doc.data().name.toLowerCase()])
            // doc.data() is never undefined for query doc snapshots
            
          });
      }
      getNames()
    }, [])
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
      //console.log(tempList)
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
    //console.log(stripeId)
    function filterByType(arr, type) {
      return arr.filter(function(item) {
        return typeof item !== type;
      });
    }
    //console.log(themeId)
    //console.log(Number.parseFloat(price))
    const checkPfp = async(url, reference) => {
       //console.log(url)
       await axios.get(`${IMAGE_MODERATION_URL}`, {
            params: {
                'url': url,
                'models': 'nudity-2.0,wad,offensive,scam,gore,qr-content',
                'api_user': `${MODERATION_API_USER}`,
                'api_secret': `${MODERATION_API_SECRET}`,
            }
            })
            .then(async function (response) {
                //console.log(response)
            if(response.data.nudity.hasOwnProperty('none')) {
              delete response.data.nudity['none']
            }
            if (response.data.nudity.hasOwnProperty('context')) {
              delete response.data.nudity.context

            }
            if (response.data.nudity.hasOwnProperty('erotica')) {
              if (response.data.nudity.erotica >= 0.68) {
                Alert.alert('Unable to Post', `This Theme Goes Against Our Guidelines`, [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => deleteObject(reference).then(() => {setUploading(false)}).catch((error) => {
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
            if (response.data.drugs > 0.9 || response.data.gore.prob > 0.9 || containsNumberGreaterThan(getValuesFromImages(Object.values(response.data.nudity)), 0.95)
            || containsNumberGreaterThan(Object.values(response.data.offensive), 0.9) || response.data.recreational_drugs > 0.9 || response.data.medical_drugs > 0.9 || response.data.scam > 0.9 ||
            response.data.skull.prob > 0.9 || response.data.weapon > 0.9 || response.data.weapon_firearm > 0.9 || response.data.weapon_knife > 0.9) {
              Alert.alert('Unable to Post', 'This Theme Goes Against Our Guidelines', [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => deleteObject(reference).then(() => setUploading(false)).catch((error) => {
                  console.error(error)
                })},
              ]);
            }
            else {
                /* https://us-central1-nucliq-c6d24.cloudfunctions.net/editprofilepostnotsell
                https://us-central1-nucliq-c6d24.cloudfunctions.net/editprofilenotpostnotsell
                https://us-central1-nucliq-c6d24.cloudfunctions.net/editpostnotprofilenotsell
                https://us-central1-nucliq-c6d24.cloudfunctions.net/editnotprofilenotpostnotsell 
                */

                if (edit) {
                if (profileChecked && postChecked && !sellChecked) {
                    await updateDoc(doc(db, 'profiles', user.uid), {
            background: url,
            postBackground: url,
            themeName: themeName.trim(),
            free: Number.parseFloat(price) > 0 ? false : true,
            forSale: sellChecked ? true: false,
            postBought: sellChecked ? true: false
        }).then(async() => await updateDoc(doc(db, 'profiles', user.uid, 'myThemes', themeId), {
            active: true,
            name: themeName.trim(),
            images: [url],
            keywords: originalKeywords,
            searchKeywords: keywords,
            bought: false,
            forSale: sellChecked ? true: false,
            price: Number.parseFloat(price),
        })).then(() => navigation.navigate('All', {name: null, goToMy: true})) 

                }
                else if (profileChecked && !postChecked && !sellChecked) {
                     await updateDoc(doc(db, 'profiles', user.uid), {
                        background: url,
                        free: Number.parseFloat(price) > 0 ? false : true,
                        forSale: sellChecked ? true: false,
                    }).then(async() => await updateDoc(doc(db, 'profiles', user.uid, 'myThemes', themeId), {
                        images: [url],
                        active: true,
                        name: themeName.trim(),
                         keywords: originalKeywords,
            searchKeywords: keywords,
                        bought: false,
                        price: Number.parseFloat(price),
                        forSale: sellChecked ? true: false
                    })).then(() => navigation.navigate('All', {name: null, goToMy: true}))
                }
                else if (postChecked && !profileChecked && !sellChecked) {
                    await updateDoc(doc(db, 'profiles', user.uid, 'myThemes', themeId), {
            images: [url],
            active: true,
            name: themeName.trim(),
             keywords: originalKeywords,
            searchKeywords: keywords,
            bought: false,
            price: Number.parseFloat(price),
              
            forSale: sellChecked ? true: false
        }).then(async() => await updateDoc(doc(db, 'profiles', user.uid), {
                postBackground: url,
                free: Number.parseFloat(price) > 0 ? false : true,
                themeName: themeName.trim(),
            postBought: sellChecked ? true: false
            })).then(() => navigation.navigate('All', {name: null, goToMy: true}))
                }
                else {
        await updateDoc(doc(db, 'profiles', user.uid, 'myThemes', themeId), {
                    images: [url],
                    active: true,
                    name: themeName.trim(),
                     keywords: originalKeywords,
            searchKeywords: keywords,
                    bought: false,
        
                    price: Number.parseFloat(price),
                    forSale: sellChecked ? true: false
                }).then(() => navigation.navigate('All', {name: null, goToMy: true}))
                }
                } 
        else {
            if (sellChecked && profileChecked && postChecked) {
                try {
                const response = await fetch(`${BACKEND_URL}/api/sellprofilepost`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: price, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                  if (data.done) {
                    navigation.navigate('All', {name: null, goToMy: true})
                    //schedulePushRequestFriendNotification(item.id, username, item.notificationToken)
                  }
              } catch (error) {
                console.error('Error:', error);
              }
                    //.then(() => navigation.navigate('All', {name: null, goToMy: true}))
                }
                else if (profileChecked && postChecked && !sellChecked) {
                try {
                const response = await fetch(`${BACKEND_URL}/api/profilepostnotsell`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: price, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                  if (data.done) {
                    navigation.navigate('All', {name: null, goToMy: true})
                    //schedulePushRequestFriendNotification(item.id, username, item.notificationToken)
                  }
              } catch (error) {
                console.error('Error:', error);
              }
                    //.then(() => navigation.navigate('All', {name: null, goToMy: true}))

                }
                else if (sellChecked && profileChecked && !postChecked) {
                try {
                const response = await fetch(`${BACKEND_URL}/api/sellprofilenotpost`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: price, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                  if (data.done) {
                    navigation.navigate('All', {name: null, goToMy: true})
                    //schedulePushRequestFriendNotification(item.id, username, item.notificationToken)
                  }
              } catch (error) {
                console.error('Error:', error);
              }
                    //.then(() => navigation.navigate('All', {name: null, goToMy: true}))
                }
                else if (profileChecked && !postChecked && !sellChecked) {
                try {
                const response = await fetch(`${BACKEND_URL}/api/profilenotpostnotsell`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: price, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                  if (data.done) {
                    navigation.navigate('All', {name: null, goToMy: true})
                    //schedulePushRequestFriendNotification(item.id, username, item.notificationToken)
                  }
              } catch (error) {
                console.error('Error:', error);
              }
                    //.then(() => navigation.navigate('All', {name: null, goToMy: true}))
                }
                else if ( sellChecked && postChecked && !profileChecked) {
                try {
                const response = await fetch(`${BACKEND_URL}/api/sellpostnotprofile`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: price, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                  if (data.done) {
                    navigation.navigate('All', {name: null, goToMy: true})
                    //schedulePushRequestFriendNotification(item.id, username, item.notificationToken)
                  }
              } catch (error) {
                console.error('Error:', error);
              }
                }
                else if (postChecked && !profileChecked && !sellChecked) {
                try {
                const response = await fetch(`${BACKEND_URL}/api/postnotprofilenotsell`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: price, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                  if (data.done) {
                    navigation.navigate('All', {name: null, goToMy: true})
                    //schedulePushRequestFriendNotification(item.id, username, item.notificationToken)
                  }
              } catch (error) {
                console.error('Error:', error);
              }
          }
                else if (sellChecked && !profileChecked && !postChecked) {
                try {
                const response = await fetch(`${BACKEND_URL}/api/sellnotprofilenotpost`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: price, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                  if (data.done) {
                    navigation.navigate('All', {name: null, goToMy: true})
                    //schedulePushRequestFriendNotification(item.id, username, item.notificationToken)
                  }
              } catch (error) {
                console.error('Error:', error);
              }
                }
                else {
                try {
                const response = await fetch(`${BACKEND_URL}/api/notsellnotprofilenotpost`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: price, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                  if (data.done) {
                    navigation.navigate('All', {name: null, goToMy: true})
                    //schedulePushRequestFriendNotification(item.id, username, item.notificationToken)
                  }
              } catch (error) {
                console.error('Error:', error);
              }
        
                }
              }
                
                    }
                    
                
                })
            .catch(function (error) {
            // handle error
            if (error.response) console.log(error.response.data);
            else console.log(error.message);
            });
    }
const linkUsernameAlert = () => {
      setErrorLinkThemeName(true)
      setUploading(false)
    }
const nameAlert = () => {
    setErrorThemeName(true)
    setUploading(false)
}
    const personalUsernameAlert = () => {
      setErrorPersonalThemeName(true)
      setUploading(false)
    }
    const profanityUsernameAlert = () => {
      setErrorProfanityThemeName(true)
      setUploading(false)
    }
    const backEndProduct = (url) => {
      fetch(`${BACKEND_URL}/api/productEndpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: themeName.trim(),
         keywords: originalKeywords,
            searchKeywords: keywords,
    price: Number.parseFloat(price),
    post: [url],
    userId: user.uid,
    stripeId: stripeId,
    notificationToken: notificationToken,
    timestamp: new Date().toLocaleString()
      }),
      })
    .then(response => response.json())
    .then(responseData => {
      // Handle the response from the server
        //console.log(responseData)
        return responseData
    })
    .catch(error => {
      // Handle any errors that occur during the request
      return error
    }).then(() => navigation.navigate('All', {name: null, goToMy: true}))
    return url
    }
const linkKeywordsAlert = () => {
      setErrorLinkKeywords(true)
      setUploading(false)
    }
    const personalKeywordsAlert = () => {
      setErrorPersonalKeywords(true)
      setUploading(false)
    }
    const profanityKeywordsAlert = () => {
      setErrorProfanityKeywords(true)
      setUploading(false)
    } 
    const priceAlert = () => {
        setErrorPriceRange(true)
        setUploading(false)
    }

    function checkName() {

    if (themeNames.includes(themeName.toLowerCase())) {
        nameAlert()
    }

    else {
    data = new FormData();
    data.append('text', themeName);
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
        //console.log(response.data)
      if (response.data) {
                if (response.data.link.matches.length > 0) {
                    linkUsernameAlert()
                }
               else if (response.data.personal.matches.length > 0) {
                    personalUsernameAlert()
                }
                else if (response.data.profanity.matches.length > 0 && response.data.profanity.matches.some(obj => obj.intensity === 'high')) {
                  
                    profanityUsernameAlert()
                
                }
                else {
                    if (originalKeywords.length > 0) {
                        checkKeywords()
                    }
                    else {
                        if (stripeId == null && sellChecked && Number.parseFloat(price) > 0) {
                        setUploading(false)
                        navigation.navigate('AddCard', {name: name, groupsJoined: groupsJoined, themeName: themeName, price: price, post: post,  keywords: originalKeywords,
            searchKeywords: keywords, sellChecked: sellChecked,
                        profileChecked: profileChecked, postChecked: postChecked, notificationToken: notificationToken})
                    } 
                    else {
                        const response = await fetch(post)
                        const blob = await response.blob();
                        const filename = `themes/${name}${themeName}${Date.now()}theme.jpg`
                        var storageRef = ref(storage, filename)
                        try {
                            await storageRef;
                        } catch (error) {
                            console.log(error)
                        }
                        await uploadBytesResumable(storageRef, blob).then(() => getLink(filename))
                    }
                }
                    
                }
            }
    })
    }
    
}
function createSearchKeywordsForMultipleWords(field, maxLen, n, limit) {
  const words = field.split(' ').map(word => word.trim()); // Split the field by spaces and trim spaces
  const result = new Set(); // Store unique keywords
  let count = 0; // Counter for added keywords

  // Loop through each word
  for (const word of words) {
    // Generate prefixes (from length 1 to maxLen)
    for (let i = 1; i <= maxLen && i <= word.length && count < limit; i++) {
      const prefix = word.substring(0, i);
      result.add(prefix);
      count++;
      if (count >= limit) break;
    }

    // Generate suffixes (from length 1 to maxLen)
    for (let i = 1; i <= maxLen && i <= word.length && count < limit; i++) {
      const suffix = word.substring(word.length - i);
      result.add(suffix);
      count++;
      if (count >= limit) break;
    }

    // Generate n-grams (of length n)
    for (let i = 0; i <= word.length - n && count < limit; i++) {
      const ngram = word.substring(i, i + n);
      result.add(ngram);
      count++;
      if (count >= limit) break;
    }

    if (count >= limit) break;
  }

  return Array.from(result).slice(0, limit); // Return as an array
}


const handleThemeName = (inputText) => {
    const sanitizedText = inputText.replace(/\n/g, ''); // Remove all new line characters
    setThemeName(sanitizedText);
  }
    const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === 'Enter') {
      // Prevent user from manually inserting new lines
      return;
    }
  };
function keywordFunction(text) {
  const sanitizedText = text.replace(/\n/g, '');
  const keywords = createSearchKeywordsForMultipleWords(sanitizedText.toLowerCase(), 5, 3, 30)
  setKeywords(keywords)
  setOriginalKeywords(sanitizedText)
}
function checkKeywords() {
    data = new FormData();
    data.append('text', originalKeywords);
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
        //console.log(response)
      if (response.data) {
                if (response.data.link.matches.length > 0) {
                    linkKeywordsAlert()
                }
               else if (response.data.personal.matches.length > 0) {
                    personalKeywordsAlert()
                }
                else if (response.data.profanity.matches.length > 0 && response.data.profanity.matches.some(obj => obj.intensity === 'high')) {
                  
                    profanityKeywordsAlert()
                
                }
                else {
                    if (stripeId == null && sellChecked && Number.parseFloat(price) > 0) {
                      setUploading(false)
                        navigation.navigate('AddCard', {name: name, groupsJoined: groupsJoined, themeName: themeName, price: price, post: post,  keywords: originalKeywords,
            searchKeywords: keywords, sellChecked: sellChecked,
                        profileChecked: profileChecked, postChecked: postChecked, notificationToken: notificationToken})
                    } 
                    else {
                    const response = await fetch(post)
                        const blob = await response.blob();
                        const filename = `themes/${name}${themeName}${Date.now()}theme.jpg`
                        var storageRef = ref(storage, filename)
                        try {
                            await storageRef;
                        } catch (error) {
                            console.log(error)
                        }
                        await uploadBytesResumable(storageRef, blob).then(() => getLink(filename))
                }
            }
            }
    })
}
    async function sendThemeToDB() {
        
        setUploading(true)
        setErrorLinkKeywords(false)
        setErrorLinkThemeName(false)
        setErrorPersonalThemeName(false)
        setErrorPriceRange(false)
        setErrorPersonalKeywords(false)
        setErrorProfanityKeywords(false)
        setErrorProfanityThemeName(false)
        setErrorThemeName(false)
        if (edit) {
          if (originalKeywords.length > 0) {
            checkKeywords()
          }
          else {
            const response = await fetch(post)
                        const blob = await response.blob();
                        const filename = themes/`${name}${themeName}${Date.now()}theme.jpg`
                        var storageRef = ref(storage, filename)
                        try {
                            await storageRef;
                        } catch (error) {
                            console.log(error)
                        }
                        await uploadBytesResumable(storageRef, blob).then(() => getLink(filename))
          }
             //checkKeywords()
        }
        else {
            checkName()
        }
        
    }
    const getLink = (pfp) => {
        const starsRef = ref(storage, pfp);
        getDownloadURL(starsRef).then((url) => checkPfp(url, starsRef))
        /*  */
        
    }
    const onChangeText = (text) => {
         if (text === "") {
    // Set the state to an empty string or 0 (your preference)
    setPrice(0); // For empty string
    // setValue(0); // For default 0
  } else {
    // Parse the number here
    const parsedValue = parseFloat(text);
    setPrice(parsedValue);
  }
      };
      useEffect(() => {
  const formatPrice = () => {
    if (price) {
      const formattedValue = Number.parseFloat(price) > 100 ? 
        Number.parseFloat(price / 100).toFixed(2) : Number.parseFloat(price);
      setFormattedPrice(formattedValue);
    } else {
      setFormattedPrice(0); // Set to empty string for empty price
    }
  };

  formatPrice(); // Call initially with current price
  // Add price as a dependency for useEffect to re-format on price change
}, [price]);
//console.log(originalKeywords)
    /* useEffect(() => {
        var counter = 10;
        
        setInterval(() => {
            counter --;
            setTime(counter)

            if (counter == 0) {
                navigation.navigate('Profile', {name: name})
            }
        }, 1000);
    }, []) */
    /* useEffect(() => {
        async function fetchData() {
            //console.log(post)
            const response = await fetch(post)
            const blob = await response.blob();
            const filename = `${user.uid}channelPfp.jpg`
            //setPfp(filename)
            var storageRef = ref(storage, filename)
            try {
                await storageRef;
            } catch (error) {
                console.log(error)
            }
            //console.log(blob)
            await uploadBytes(storageRef, blob).then(() => getLink(filename))
            return;
        }
        if (!loading) {
            //console.log('first')
            fetchData()
        }
    }, [loading]) 
    themeName.length == 0 ? () => setEmptyThemeName(true) : sellChecked ? keywords.length == 0 ? 
                () => setEmptyKeywords(true) : Number.parseFloat(price) != 0 && (Number.parseFloat(price) > 499 || Number.parseFloat(price) < 199) ? () => priceAlert() : () => sendThemeToDB() :
                () => sendThemeToDB() 
    */
    /* useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 2000)
        //setLoading(false)
    }, []) */
    //
    //console.log(Number.parseFloat(price))
    //console.log(Number.parseFloat(price))
const [fontsLoaded, fontError] = useFonts({
    Montserrat_700Bold,
    Montserrat_500Medium,
    Montserrat_400Regular
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <Modal animationType='fade' visible={infoModal} transparent onRequestClose={() => setInfoModal(!infoModal)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <MaterialCommunityIcons name='close' size={25} color={"#fff"} style={{textAlign: 'right', padding: 5}} onPress={() => setInfoModal(!infoModal)}/>
            <Text style={styles.modalText}>Type keywords that will allow you and other users to easily search this Theme!</Text>
          </View>
        </View>
      </Modal>
        <ThemeHeader text={"Create Theme"} video={false} backButton={true}/>
        <Divider borderWidth={0.4} borderColor={theme.color}/>
        <KeyboardAwareScrollView extraScrollHeight={50}>
        <View style={styles.main}>
            <Text style={[styles.successText, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Name & Keywords</Text>
            <Divider borderWidth={0.4} style={{borderStyle: 'dashed', borderRadius: 1,}}/>
            <View style={{flexDirection: 'row', marginTop: '5%', alignItems: 'center'}}>
                <View>
                    <Text style={styles.superscript}>* <Text style={[styles.headerText, {color: theme.color}]}>Name of Theme: </Text></Text>
                    <View style={ {marginTop: '2.5%', marginLeft: '-5%', width: '103%', marginRight: '-13%'}}>
                        {!edit ? <>
                        <InputBox containerStyle={emptyThemeName || errorThemeName ||  errorLinkThemeName || errorPersonalThemeName || errorProfanityThemeName ? {borderColor: 'red'}: null} 
                        multiline={true} placeholderStyle={emptyThemeName ? 'red' : null} key={handleKeyPress}
                        multilineStyle={{minHeight: 80}} maxLength={50} onChangeText={handleThemeName} value={themeName} text={"Name of Theme"}/>
                        {errorLinkThemeName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29}]}>Name must not contain link(s)</Text> :
                        errorPersonalThemeName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29}]}>Name must not contain personal information</Text> : 
                        errorProfanityThemeName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29}]}>Name must not contain profanity</Text> : 
                        errorThemeName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29}]}>You already have a theme with that name</Text> :  null}
                        </> : <View style={{ borderRadius: 9, borderWidth: 1, backgroundColor: "#fff", width: '90%', marginLeft: '5%', flexDirection: 'row',}}> 
                            <Text style={{fontSize: 15.36, paddingTop: 13, fontWeight: '300', color: "#000", minHeight: 80, maxHeight: 200, width: '90%', marginLeft: '3%'}}>{themeName}</Text>
                            </View>}
                        
                    </View>
                    
                    <View style={{marginLeft: 'auto', marginRight: '5%', marginTop: '2.5%'}}>
                        {edit ? <Text style={[styles.charsText, {color: 'red'}]}>Name cannot be changed</Text> :
                        <Text style={[styles.charsText, {color: theme.color}]}>{`${50 - themeName.length}`} Chars Remaining</Text>}
                        
                    </View>
                </View>
                <View style={{borderWidth: 1, padding: 2.5}}>
                    <Image source={{uri: post}} style={{height: 175, width: 85}}/>
                </View>
            </View>
            <View behavior={Platform.OS === 'ios' ? 'padding' : null} style={{marginTop: '2.5%'}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={styles.superscript}>* <Text style={[styles.headerText, {color: theme.color}]}>Keywords: </Text></Text> 
                    <TouchableOpacity onPress={() => setInfoModal(true)}>
                       <MaterialCommunityIcons name='information-outline' size={20} color={"#fff"} style={{alignSelf: 'center'}}/>
                      </TouchableOpacity>  
                   
                  </View>
                    <Text style={[styles.commaText, {color: theme.color}]}>Separate by Comma</Text>
                </View>
                <View style={{marginTop: '2.5%', marginLeft: '-5%', width: '111%'}}>
                    <InputBox multiline={true} key={handleKeyPress} containerStyle={emptyKeywords || errorLinkKeywords || errorPersonalKeywords || errorProfanityKeywords ? {borderColor: 'red'}: null} multilineStyle={{height: 90}} maxLength={100} placeholderStyle={emptyKeywords ? 'red' : null} onChangeText={keywordFunction} value={originalKeywords} text={"Type Search Keywords"}/>
                    {errorLinkKeywords ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29}]}>Keyword(s) must not contain link(s)</Text> :
                errorPersonalKeywords ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29}]}>Keyword(s) must not contain personal information</Text> : 
                errorProfanityKeywords ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29}]}>Keyword(s) must not contain profanity</Text> : null}
                </View>
                <View style={{marginLeft: 'auto', marginRight: '5%', marginTop: '2.5%'}}>
                    <Text style={[styles.charsText, {color: theme.color}]}>{`${100 - originalKeywords.length}`} Chars Remaining</Text>
                </View>
            </View>
            {!edit && !privacy ? 
            <>
            <View style={{flexDirection: 'row', marginTop: '5%', marginLeft: '2.5%'}}>
            <TouchableOpacity activeOpacity={1} onPress={edit ? null : () => {setSellChecked(!sellChecked)}} style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Checkbox value={sellChecked} onValueChange={edit ? null : () => {setSellChecked(!sellChecked)}} color={sellChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                    <View >
                    <Text style={[styles.paragraph, {color: theme.color}]}>I want to share my theme</Text>
                    </View>
                </TouchableOpacity>   
                
            {/* <View style={{flexDirection: 'row', marginLeft: '10%'}}>
                <Text style={{fontSize: 24, fontWeight: '700', marginTop: '7.5%', color: theme.color}}>$</Text>
                <View style={{width: '75%', marginTop: '5%'}}>
                    <InputBox containerStyle={errorPriceRange ? {width: '45%', borderColor: 'red'} : {width: '45%'}} maxLength={4} text={Number.parseFloat(price).toFixed(2)} onChangeText={!edit ? onChangeText : null} 
                    value={formattedPrice} inputMode={'numeric'}/>
                {errorPriceRange ? <Text style={[styles.supplementaryText, {color: 'red', width: '75%', fontSize: 12.29, paddingLeft: 10}]}>{Number.parseFloat(price) != 0 ? Number.parseFloat(price) > 499 ?  'Price cannot be above $4.99' : 'Price cannot be below $1.99' : null}</Text> : null}
                </View>
                
            </View> */}
            
            
            </View>
            {/* <Text style={{padding: 5, fontSize: 12.29, color: theme.color}}>Leave price at $0.00 to sell for free</Text> */}
            </>
            : null}
            <View style={{marginTop: '5%'}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={[styles.paragraph, {color: theme.color}]}>Use my theme on: </Text>
                    
                </View>
                
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: '2.5%'}}>
                    <TouchableOpacity activeOpacity={1} onPress={() => {setProfileChecked(!profileChecked)}} style={styles.checkContainer}>
                    <Checkbox value={profileChecked} onValueChange={() => {setProfileChecked(!profileChecked)}} color={profileChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                    <Text style={[styles.paragraph, {color: theme.color}]}>Profile Page</Text>
                </TouchableOpacity>  
                <TouchableOpacity activeOpacity={1} onPress={() => {setPostChecked(!postChecked)}} style={styles.checkContainer}>
                    <Checkbox value={postChecked} onValueChange={() => {setPostChecked(!postChecked)}} color={postChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                    <Text style={[styles.paragraph, {color: theme.color}]}>Posts</Text>
                </TouchableOpacity>  
                    
                <View>         
                </View>
                
                </View>
                
                
            </View>
            
            <View style={!edit ? {flexDirection: 'row', justifyContent: 'space-between', marginTop: '10%'} : {flexDirection: 'row', justifyContent: 'space-between', marginTop: '15%'}}>
                <MainButton text={"CANCEL"} onPress={uploading ? null : () => navigation.navigate('All', {name: null})}/>
                {uploading ? <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} style={{marginRight: '10%'}} /> : <NextButton text={"CONTINUE"} onPress={themeName.length == 0 ? () => setEmptyThemeName(true) : themeNames.includes(themeName) ? () => nameAlert() : sellChecked ? originalKeywords.length == 0 ? 
                () => setEmptyKeywords(true) : Number.parseFloat(price) != 0 && (Number.parseFloat(price) > 499 || Number.parseFloat(price) < 199) ? () => priceAlert() : price > 0 ? () => navigation.navigate('PriceSummary', {name: themeName, searchKeywords: keywords, keywords: originalKeywords, price: price, stripeId: stripeId, theme: post, groupsJoined: groupsJoined, profileChecked: profileChecked, postChecked: postChecked, notificationToken: notificationToken}) 
                : () => sendThemeToDB() : ()  => sendThemeToDB()}/> }
                
            </View>
        </View>
        </KeyboardAwareScrollView> 
    </View>
  )
}

export default SuccessTheme

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    main: {
        margin: '5%'
    },
    successText: {
        fontSize: 24,
        color: "#090909",
        fontWeight: '700',
        padding: 0,
        paddingBottom: '5%',
        color: "#005278"
        
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    headerText: {
        fontSize: 19.20,
        fontWeight: '700',
        color: "#000"
    },
    superscript: {
        color: "red",
        fontSize: 19.20
    },
    commaText: {
        fontSize: 12.29,
        fontWeight: '700',
        alignSelf: 'center'
    },
    charsText: {
        fontSize: 12.29
    },
    paragraph: {
        fontSize: 15.36,
        paddingLeft: 10
    },
    checkContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: '5%',
        marginLeft: '5%'
    },
    supplementaryText: {
        fontSize: 15.36,
        padding: 25,
        paddingBottom: 0,
        paddingTop: 5
    },
     modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '15%'
    },
  modalView: {
    width: '95%',
    height: '14%',
    //margin: 20,
    backgroundColor: '#121212',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fff",
    padding: 0,
    paddingTop: 5,
    paddingBottom: 0,
    //alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 15.36,
    color: "#fff",
    padding: 5,
    paddingLeft: 10,
    fontFamily: 'Montserrat_500Medium'
  }
})