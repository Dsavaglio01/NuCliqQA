import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Image, Alert, Platform } from 'react-native'
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
import { collection, getDocs, updateDoc, where, doc, getDoc} from 'firebase/firestore';
import {BACKEND_URL, MODERATION_API_USER, MODERATION_API_SECRET, TEXT_MODERATION_URL, IMAGE_MODERATION_URL} from "@env"
import themeContext from '../lib/themeContext';
import ProfileContext from '../lib/profileContext';
import InfoModal from '../Components/Themes/InfoModal';
import { fetchThemeNames } from '../firebaseUtils';
import FastImage from 'react-native-fast-image';
const SuccessTheme = ({route}) => {
    const {post, name, edit, themeId, actualThemeName, actualKeywords, searchKeywords} = route.params; 
    const navigation = useNavigation();
    const [themeName, setThemeName] = useState(edit ? actualThemeName : '');
    const [acutalThemeId, setActualThemeId] = useState(null);
    const [keywords, setKeywords] = useState(edit ? searchKeywords : '');
    const {user} = useAuth()
    const theme = useContext(themeContext);
    const storage = getStorage();
    const [sellChecked, setSellChecked] = useState(false);
    const [profileChecked, setProfileChecked] = useState(false);
    const [postChecked, setPostChecked] = useState(false);
    const [emptyThemeName, setEmptyThemeName] = useState(false);
    const [emptyKeywords, setEmptyKeywords] = useState(false);
    const [originalKeywords, setOriginalKeywords] = useState(edit ? actualKeywords : '');
    const [infoModal, setInfoModal] = useState(false);
    const [errorPersonalThemeName, setErrorPersonalThemeName] = useState(false);
    const [errorLinkThemeName, setErrorLinkThemeName] = useState(false);
    const [errorProfanityThemeName, setErrorProfanityThemeName] = useState(false);
    const [errorPersonalKeywords, setErrorPersonalKeywords] = useState(false);
    const [errorLinkKeywords, setErrorLinkKeywords] = useState(false);
    const [errorProfanityKeywords, setErrorProfanityKeywords] = useState(false);
    const [errorThemeName, setErrorThemeName] = useState(false);
    const [themeNames, setThemeNames] = useState([])
    const [uploading, setUploading] = useState(false);
    const profile = useContext(ProfileContext);
    useEffect(() => {
      if (route.params?.edit == true && route.params?.post) {
        const getData = async() => {
                const freeDocSnap = await getDocs(collection(db, 'freeThemes'), where('images', 'array-contains', post))
                if (freeDocSnap.docs.length > 0) {
                    setActualThemeId(freeDocSnap.docs[0].id)
                }

            if (profile.postBackground == post) {
                setPostChecked(true)
            }
            if (profile.background == post) {
                //
                setProfileChecked(true)
            }
        }
        getData()
      }
    }, [route.params?.edit, route.params?.post])
    useEffect(() => {
      const getNames = async() => {
        const { themes } = await fetchThemeNames(user.uid)
        setThemeNames(themes)
      }
      getNames()
    }, [])
    function containsNumberGreaterThan(array, threshold) {
      return array.some(function(element) {
        return element > threshold;
      });
    }
    const getValuesFromImages = (list) => {
      let newList = filterByType(list, 'object')
      let tempList = filterByType(list, 'number')
      tempList.forEach((obj) => {
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
      })
      return newList
    }
    function filterByType(arr, type) {
      return arr.filter(function(item) {
        return typeof item !== type;
      });
    }
    const checkPfp = async(url, reference) => {
       console.log(url)
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
                const response = await fetch(`http://10.0.0.225:4000/api/sellprofilepost`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: 0, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                if (data.done) {
                  navigation.navigate('All', {name: null, goToMy: true})
                }
              } catch (error) {
                console.error('Error:', error);
              }
            }
            else if (profileChecked && postChecked && !sellChecked) {
              try {
                const response = await fetch(`http://10.0.0.225:4000/api/profilepostnotsell`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: 0, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                  if (data.done) {
                    navigation.navigate('All', {name: null, goToMy: true})
                  }
              } catch (error) {
                console.error('Error:', error);
              }
            }
                else if (sellChecked && profileChecked && !postChecked) {
                try {
                const response = await fetch(`http://10.0.0.225:4000/api/sellprofilenotpost`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: 0, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                  if (data.done) {
                    navigation.navigate('All', {name: null, goToMy: true})
                    
                  }
              } catch (error) {
                console.error('Error:', error);
              }
                    //.then(() => navigation.navigate('All', {name: null, goToMy: true}))
                }
                else if (profileChecked && !postChecked && !sellChecked) {
                try {
                const response = await fetch(`http://10.0.0.225:4000/api/profilenotpostnotsell`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: 0, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                  if (data.done) {
                    navigation.navigate('All', {name: null, goToMy: true})
                    
                  }
              } catch (error) {
                console.error('Error:', error);
              }
                    //.then(() => navigation.navigate('All', {name: null, goToMy: true}))
                }
                else if ( sellChecked && postChecked && !profileChecked) {
                try {
                const response = await fetch(`http://10.0.0.225:4000/api/sellpostnotprofile`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: 0, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                  if (data.done) {
                    navigation.navigate('All', {name: null, goToMy: true})
                    
                  }
              } catch (error) {
                console.error('Error:', error);
              }
                }
                else if (postChecked && !profileChecked && !sellChecked) {
                try {
                const response = await fetch(`http://10.0.0.225:4000/api/postnotprofilenotsell`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: 0, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                  if (data.done) {
                    navigation.navigate('All', {name: null, goToMy: true})
                    
                  }
              } catch (error) {
                console.error('Error:', error);
              }
          }
                else if (sellChecked && !profileChecked && !postChecked) {
                try {
                const response = await fetch(`http://10.0.0.225:4000/api/sellnotprofilenotpost`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: 0, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                  if (data.done) {
                    navigation.navigate('All', {name: null, goToMy: true})
                    
                  }
              } catch (error) {
                console.error('Error:', error);
              }
                }
                else {
                try {
                const response = await fetch(`http://10.0.0.225:4000/api/notsellnotprofilenotpost`, {
                  method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                  headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                  },
                  body: JSON.stringify({ data: {themeName: themeName, price: 0, sellChecked: sellChecked, user: user.uid, url: url, keywords: keywords, originalKeywords: originalKeywords}}), // Send data as needed
                })
                const data = await response.json();
                  if (data.done) {
                    navigation.navigate('All', {name: null, goToMy: true})
                    
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
                        if (profile.stripeAccountID == null && sellChecked && Number.parseFloat(price) > 0) {
                        setUploading(false)
                        navigation.navigate('AddCard', {name: name, groupsJoined: profile.groupsJoined, themeName: themeName, price: 0, post: post,  keywords: originalKeywords,
            searchKeywords: keywords, sellChecked: sellChecked,
                        profileChecked: profileChecked, postChecked: postChecked, notificationToken: profile.notificationToken})
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
    })
}
    async function sendThemeToDB() {
        console.log('fdksllk')
        setUploading(true)
        setErrorLinkKeywords(false)
        setErrorLinkThemeName(false)
        setErrorPersonalThemeName(false)
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
                        const filename = `themes/${name}${themeName}${Date.now()}theme.jpg`
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
        
    }
  return (
    <View style={styles.container}>
      <InfoModal infoModal={infoModal} closeInfoModal={() => setInfoModal(false)}/>
        <ThemeHeader text={"Create Theme"} video={false} backButton={true}/>
        <Divider borderWidth={0.4} borderColor={theme.color}/>
        <KeyboardAwareScrollView extraScrollHeight={50}>
        <View style={{margin: '5%'}}>
          <Text style={styles.successText}>Name & Keywords</Text>
          <Divider borderWidth={0.4} style={styles.dashedBorder}/>
          <View style={styles.main}>
              <View>
                <Text style={styles.superscript}>* <Text style={styles.headerText}>Name of Theme: </Text></Text>
                <View style={styles.nameContainer}>
                    {!edit ? <>
                    <InputBox containerStyle={emptyThemeName || errorThemeName ||  errorLinkThemeName || errorPersonalThemeName || errorProfanityThemeName ? {borderColor: 'red'}: null} 
                    multiline={true} placeholderStyle={emptyThemeName ? 'red' : null} key={handleKeyPress}
                    multilineStyle={{minHeight: 80}} maxLength={50} onChangeText={handleThemeName} value={themeName} text={"Name of Theme"}/>
                    {errorLinkThemeName ? <Text style={styles.supplementaryText}>Name must not contain link(s)</Text> :
                    errorPersonalThemeName ? <Text style={styles.supplementaryText}>Name must not contain personal information</Text> : 
                    errorProfanityThemeName ? <Text style={styles.supplementaryText}>Name must not contain profanity</Text> : 
                    errorThemeName ? <Text style={styles.supplementaryText}>You already have a theme with that name</Text> :  null}
                    </> : <View style={{ borderRadius: 9, borderWidth: 1, backgroundColor: "#fff", width: '90%', marginLeft: '5%', flexDirection: 'row',}}> 
                        <Text style={{fontSize: 15.36, paddingTop: 13, fontWeight: '300', color: "#000", minHeight: 80, maxHeight: 200, width: '90%', marginLeft: '3%'}}>{themeName}</Text>
                        </View>}
                    
                </View>
                
                <View style={{marginLeft: 'auto', marginRight: '5%', marginTop: '2.5%'}}>
                    {edit ? <Text style={styles.redCharsText}>Name cannot be changed</Text> :
                    <Text style={styles.whiteCharsText}>{`${50 - themeName.length}`} Chars Remaining</Text>}
                    
                </View>
              </View>
              <View style={{borderWidth: 1, padding: 2.5}}>
                  <FastImage source={{uri: post}} style={{height: 175, width: 85}}/>
              </View>
          </View>
          <View behavior={Platform.OS === 'ios' ? 'padding' : null} style={{marginTop: '2.5%'}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.superscript}>* <Text style={styles.headerText}>Keywords: </Text></Text> 
                  <TouchableOpacity onPress={() => setInfoModal(true)}>
                      <MaterialCommunityIcons name='information-outline' size={20} color={"#fff"} style={{alignSelf: 'center'}}/>
                    </TouchableOpacity>  
                  
                </View>
                  <Text style={styles.commaText}>Separate by Comma</Text>
              </View>
              <View style={{marginTop: '2.5%', marginLeft: '-5%', width: '111%'}}>
                  <InputBox multiline={true} key={handleKeyPress} containerStyle={emptyKeywords || errorLinkKeywords || errorPersonalKeywords || errorProfanityKeywords ? {borderColor: 'red'}: null} multilineStyle={{height: 90}} maxLength={100} placeholderStyle={emptyKeywords ? 'red' : null} onChangeText={keywordFunction} value={originalKeywords} text={"Type Search Keywords"}/>
                  {errorLinkKeywords ? <Text style={styles.supplementaryText}>Keyword(s) must not contain link(s)</Text> :
              errorPersonalKeywords ? <Text style={styles.supplementaryText}>Keyword(s) must not contain personal information</Text> : 
              errorProfanityKeywords ? <Text style={styles.supplementaryText}>Keyword(s) must not contain profanity</Text> : null}
              </View>
              <View style={{marginLeft: 'auto', marginRight: '5%', marginTop: '2.5%'}}>
                  <Text style={styles.whiteCharsText}>{`${100 - originalKeywords.length}`} Chars Remaining</Text>
              </View>
          </View>
          {!edit && !profile.private ? 
          <>
          <View style={{flexDirection: 'row', marginTop: '5%', marginLeft: '2.5%'}}>
          <TouchableOpacity activeOpacity={1} onPress={edit ? null : () => {setSellChecked(!sellChecked)}} style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Checkbox value={sellChecked} onValueChange={edit ? null : () => {setSellChecked(!sellChecked)}} color={sellChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                  <View >
                  <Text style={styles.paragraph}>I want to share my theme</Text>
                  </View>
              </TouchableOpacity>   
          </View>
          </>
          : null}
          <View style={{marginTop: '5%'}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={styles.paragraph}>Use my theme on: </Text>
                  
              </View>
              
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: '2.5%'}}>
                  <TouchableOpacity activeOpacity={1} onPress={() => {setProfileChecked(!profileChecked)}} style={styles.checkContainer}>
                  <Checkbox value={profileChecked} onValueChange={() => {setProfileChecked(!profileChecked)}} color={profileChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                  <Text style={styles.paragraph}>Profile Page</Text>
              </TouchableOpacity>  
              <TouchableOpacity activeOpacity={1} onPress={() => {setPostChecked(!postChecked)}} style={styles.checkContainer}>
                  <Checkbox value={postChecked} onValueChange={() => {setPostChecked(!postChecked)}} color={postChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                  <Text style={styles.paragraph}>Posts</Text>
              </TouchableOpacity>  
                  
              <View>         
              </View>
              
              </View>
              
              
          </View>
          
          <View style={!edit ? {flexDirection: 'row', justifyContent: 'space-between', marginTop: '10%'} : {flexDirection: 'row', justifyContent: 'space-between', marginTop: '15%'}}>
              <MainButton text={"CANCEL"} onPress={uploading ? null : () => navigation.navigate('All', {name: null})}/>
              {uploading ? <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} style={{marginRight: '10%'}} /> : <NextButton text={"CONTINUE"} onPress={themeName.length == 0 ? () => setEmptyThemeName(true) : themeNames.includes(themeName) ? () => nameAlert() : sellChecked ? originalKeywords.length == 0 ? 
              () => setEmptyKeywords(true) : () => sendThemeToDB() : ()  => sendThemeToDB()}/> }
              
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
      backgroundColor: "#121212"
    },
    successText: {
      fontSize: 24,
      fontWeight: '700',
      padding: 0,
      paddingBottom: '5%',
      color: "#9edaff"
    },
    dashedBorder: {
      borderStyle: 'dashed', 
      borderRadius: 1,
    },
    main: {
      flexDirection: 'row', 
      marginTop: '5%', 
      alignItems: 'center'
    },
    headerText: {
      fontSize: 19.20,
      fontWeight: '700',
      color: "#fafafa"
    },
    superscript: {
      color: "red",
      fontSize: 19.20
    },
    nameContainer: {
      marginTop: '2.5%',
      marginLeft: '-5%', 
      width: '103%', 
      marginRight: '-13%'
    },
    commaText: {
      fontSize: 12.29,
      fontWeight: '700',
      alignSelf: 'center',
      color: "#fafafa"
    },
    redCharsText: {
      fontSize: 12.29,
      color: 'red'
    },
    whiteCharsText: {
      fontSize: 12.29,
      color: "#fafafa"
    },
    paragraph: {
      fontSize: 15.36,
      paddingLeft: 10,
      color: "#fafafa"
    },
    checkContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      marginTop: '5%',
      marginLeft: '5%'
    },
    supplementaryText: {
      fontSize: 12.29,
      padding: 25,
      paddingBottom: 0,
      paddingTop: 5,
      color: 'red'
    },
})