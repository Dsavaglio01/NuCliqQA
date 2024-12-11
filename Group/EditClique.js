import { StyleSheet, Text, View, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import ThemeHeader from '../Components/ThemeHeader';
import { Divider } from 'react-native-paper';
import { doc, getDoc, updateDoc, collection, query, onSnapshot} from 'firebase/firestore';
import { db } from '../firebase';
import InputBox from '../Components/InputBox';
import PreviewFooter from '../Components/PreviewFooter';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import useAuth from '../Hooks/useAuth';
import axios from 'axios';
import { ref, uploadBytesResumable, getDownloadURL, getStorage, deleteObject,} from 'firebase/storage'
import FastImage from 'react-native-fast-image';
import {MODERATION_API_USER, MODERATION_API_SECRET, TEXT_MODERATION_URL, IMAGE_MODERATION_URL, BACKEND_URL} from "@env"
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { Image } from 'react-native-compressor';
import themeContext from '../lib/themeContext';
const EditClique = ({route}) => {
    const {id, name, banner, privacy} = route.params;
    const [description, setDescription] = useState('');
    const [initialDescription, setInitialDescription] = useState('');
    const [editedBanner, setEditedBanner] = useState(null);
    const [initialBanner, setInitialBanner] = useState();
    const [initialName, setInitialName] = useState('');
    const [editedName, setEditedName] = useState('');
    const [loading, setLoading] = useState(false);
    const theme = useContext(themeContext)
    const [names, setNames] = useState([]); 
    const [initialPrivacy, setInitialPrivacy] = useState(null);
    const [editedPrivacy, setEditedPrivacy] = useState('');
    const [errorUserName, setErrorUserName] = useState(false);
    const [errorPersonalUserName, setErrorPersonalUserName] = useState(false);
    const [errorMisleadingUserName, setErrorMisleadingUserName] = useState(false);
    const [errorLinkUserName, setErrorLinkUserName] = useState(false);
    const [errorProfanityUserName, setErrorProfanityUserName] = useState(false);
    const [errorExistsUserName, setErrorExistsUserName] = useState(false);
    const [errorDescription, setErrorDescription] = useState(false);
    const [errorPersonalDescription, setErrorPersonalDescription] = useState(false);
    const [errorMisleadingDescription, setErrorMisleadingDescription] = useState(false);
    const [errorLinkDescription, setErrorLinkDescription] = useState(false);
    const [errorProfanityDescription, setErrorProfanityDescription] = useState(false);
    const [errorExistsDescription, setErrorExistsDescription] = useState(false);
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState(null);
    const navigation = useNavigation();
    const {user} = useAuth();
    const storage = getStorage();
    useEffect(() => {
      if (initialName.length > 0) {
        setEditedName(initialName)
      }
    }, [initialName])
    useEffect(() => {
      if (initialDescription.length > 0) {
        setDescription(initialDescription)
      }
    }, [initialDescription])
    //console.log(editedName)
    useEffect(() => {
      let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'groups')), (snapshot) => {
          setNames(snapshot.docs.map((doc)=> ( {
          ...doc.data().name.toLowerCase()
          })))
        })
      } 
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
      return unsub;
    }, [])
    useEffect(() => {
        if (name) {
            const getData = async() => {
                const docSnap = (await getDoc(doc(db, 'groups', id)))
                //setDescription(docSnap)

                setInitialDescription(docSnap.data().description)
                setInitialName(docSnap.data().name)
            }
            getData();
        }
    }, [id, name])
    useEffect(() => {
        if (banner) {
            const getData = async() => {
                const docSnap = (await getDoc(doc(db, 'groups', id))).data().banner
                setEditedBanner(docSnap)
                setInitialBanner(docSnap)
            }
            getData();
        }
    }, [id, banner])
    useEffect(() => {
        if (privacy) {
            const getData = async() => {
                const docSnap = (await getDoc(doc(db, 'groups', id))).data().groupSecurity
                setInitialPrivacy(docSnap)
                setEditedPrivacy(docSnap)
            }
            getData();
        }
    }, [id, privacy])
    const pickBannerImage = async() => {
      await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          //allowsMultipleSelection: true,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        }).then(async(image) => {
          if (!image.canceled) {
              image.assets.map(async(ite, index) => {
              const result = await Image.compress(
                ite.uri,
                {},
              );
              //console.log(result)
              setEditedBanner(result)
                      
            })
            }
        })
    };
    useEffect(() => {
    const getPermissions = async() => {
      const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync()
      let finalStatus = existingStatus;
      //console.log(existingCameraStatus)
      if (existingStatus !== 'granted') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        setStatus(false)
      }
      }
    getPermissions()
  }, [])
    const uploadBannerImage = async() => {
      setUploading(true);
            const response = await fetch(editedBanner)
            const blob = await response.blob();
            const filename = `${user.uid}${initialName}groupBanner.jpg`
            //console.log(filename)
            //setPfp(filename)
            var storageRef = ref(storage, filename)
            try {
                await storageRef;
            } catch (error) {
                console.log(error)
            }
            await uploadBytesResumable(storageRef, blob).then(() => getBannerLink(filename))
            
    }
    const getBannerLink = (pfp) => {
        const starsRef = ref(storage, pfp);
         getDownloadURL(starsRef).then((url) => (checkBannerPfp(url)))
    }
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
      console.log(tempList)
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
    function filterByType(arr, type) {
      return arr.filter(function(item) {
        return typeof item !== type;
      });
    }
    const checkBannerPfp = (url, reference) => {
        axios.get(`${IMAGE_MODERATION_URL}`, {
            params: {
                'url': url,
                'models': 'nudity-2.0,wad,offensive,scam,gore,qr-content',
                'api_user': `${MODERATION_API_USER}`,
                'api_secret': `${MODERATION_API_SECRET}`,
            }
            })
            .then(async function (response) {
            if(response.data.nudity.hasOwnProperty('none')) {
              delete response.data.nudity['none']
            }
            if (response.data.nudity.hasOwnProperty('context')) {
              delete response.data.nudity.context
            }
            if (response.data.nudity.hasOwnProperty('erotica')) {
              if (response.data.nudity.erotica >= 0.68) {
                Alert.alert('Unable to Post', `This Goes Against Our Guidelines`, [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => deleteObject(reference).catch((error) => {
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
              Alert.alert('Unable to Post', 'This Post Goes Against Our Guidelines', [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => deleteObject(reference).then(() => console.log('first')).catch((error) => {
                  console.error(error)
                })},
              ]);
            }
            else {
             await updateDoc(doc(db, "groups", id), {
            banner: url
        }).then(() => fetch(`${BACKEND_URL}/api/createRecommendClique`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cliqueId: id,
        banner: url,
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
    })).then(() => setUploading(false)).finally(() => navigation.goBack())
        }
            })
            .catch(function (error) {
            // handle error
            if (error.response) console.log(error.response.data);
            else console.log(error.message);
            });
    }
    async function updateDB() {
      if (editedName != initialName) {
        setErrorUserName(false)
      setErrorExistsUserName(false)
      setErrorLinkUserName(false)
      setErrorMisleadingUserName(false)
      setErrorPersonalUserName(false)
      setErrorProfanityUserName(false)
      if (editedName.length == 0) {
        usernameAlert();
      }
      if (names.includes(editedName.toLowerCase())) {
        userNameExistsAlert();
      }
      else { 
        try {
          
        data = new FormData();
        data.append('text', editedName);
        data.append('lang', 'en');
        data.append('mode', 'username');
        data.append('api_user', `${MODERATION_API_USER}`);
        data.append('api_secret', `${MODERATION_API_SECRET}`);
        //console.log(data)
        axios({
          url: `${TEXT_MODERATION_URL}`,
          method:'post',
          data: data,
          //headers: data.getHeaders()
        })
        .then(async function (response) {
          
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
                   await updateDoc(doc(db, 'groups', id), {
                    name: editedName.trim()
                   }).then(() => fetch(`${BACKEND_URL}/api/createRecommendClique`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cliqueId: id,
                    name: editedName.trim(),
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
    }))
                }
                //console.log(data)
            }
          // on success: handle response
          //console.log(response.data);
        })
        .catch(function (error) {
          // handle error
          if (error.response) console.log(error.response.data);
          else console.log(error.message);
        });
        }
        catch (error) {
            console.error(error)
        }
      }
      }
      if (description != initialDescription) {
      setErrorDescription(false)
      setErrorExistsDescription(false)
      setErrorLinkDescription(false)
      setErrorMisleadingDescription(false)
      setErrorPersonalDescription(false)
      setErrorProfanityDescription(false)
      if (description.length == 0) {
        descriptionAlert();
      } 
      else { 
        //console.log(userName)
        try {
          
        data = new FormData();
        data.append('text', description);
        data.append('lang', 'en');
        data.append('mode', 'username');
        data.append('api_user', `${MODERATION_API_USER}`);
        data.append('api_secret', `${MODERATION_API_SECRET}`);
        //console.log(data)
        axios({
          url: `${TEXT_MODERATION_URL}`,
          method:'post',
          data: data,
          //headers: data.getHeaders()
        })
        .then(async function (response) {
          
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
                    await updateDoc(doc(db, 'groups', id), {
                      description: description.trim(),
                    }).then(() => fetch(`${BACKEND_URL}/api/createRecommendClique`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cliqueId: id,
        description: initialDescription != description ? description : initialDescription,
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
    })).then(() => navigation.goBack())
                }
                //console.log(data)
            }
          // on success: handle response
          //console.log(response.data);
        })
        .catch(function (error) {
          // handle error
          if (error.response) console.log(error.response.data);
          else console.log(error.message);
        });
        }
        catch (error) {
            console.error(error)
        }
      }
      }
      //(await getDoc(doc(db, 'groups', id))).data().description
      //          setDescription(docSnap)
      if (initialBanner != editedBanner) {
         uploadBannerImage()
      }
      if (editedPrivacy != initialPrivacy) {
        await updateDoc(doc(db, 'groups', id), {
        groupSecurity: editedPrivacy == 'private' ? 'private' : 'public',
      }).then(() => fetch(`${BACKEND_URL}/api/createRecommendClique`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cliqueId: id,
        groupSecurity: editedPrivacy == 'private' ? 'private' : 'public'
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
    })).then(() => navigation.goBack())
      }
      
    }
    async function privateFunction() {
        //console.log('first')
        setEditedPrivacy(editedPrivacy == 'private' ? 'public' : 'private')
    }
    const linkUsernameAlert = () => {
      setErrorLinkUserName(true)
    }
    const misleadingUsernameAlert = () => {
      setErrorMisleadingUserName(true)
    }
    const personalUsernameAlert = () => {
      setErrorPersonalUserName(true)
    }
    const profanityUsernameAlert = () => {
      setErrorProfanityUserName(true)
    }
    const usernameAlert = () => {
      setErrorUserName(true)
    }
    const userNameExistsAlert = () => {
      setErrorExistsUserName(true)
    }
    const linkDescriptionAlert = () => {
      setErrorLinkDescription(true)
    }
    const misleadingDescriptionAlert = () => {
      setErrorMisleadingDescription(true)
    }
    const personalDescriptionAlert = () => {
      setErrorPersonalDescription(true)
    }
    const profanityDescriptionAlert = () => {
      setErrorProfanityDescription(true)
    }
    const descriptionAlert = () => {
      setErrorDescription(true)
    }
    const handleDescription = (inputText) => {
    const sanitizedText = inputText.replace(/\n/g, ''); // Remove all new line characters
    setDescription(sanitizedText);
  }
  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === 'Enter') {
      // Prevent user from manually inserting new lines
      return;
    }
  };
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
    <ThemeHeader text={"Edit Cliq"}/>
      <Divider borderWidth={0.4} borderColor={theme.color}/>
      {name ? 
      <>
      <Text style={[styles.titleText, {color: theme.color}]}>Cliq Name</Text>
      <View>
        <InputBox maxLength={100} value={editedName} onChangeText={setEditedName}/>
      </View>
      <Text style={[styles.characterCountText, {color: theme.color}]}>{editedName.length}/100</Text>
      <Text style={[styles.titleText, {color: theme.color}]}>Description</Text>
      <View>
        <InputBox maxLength={200} value={description} key={handleKeyPress} onChangeText={handleDescription} multiline={true}/>
      </View>
      <Text style={[styles.characterCountText, {color: theme.color}]}>{description.length}/200</Text>
      </> : banner ? 
      <>
        <Text style={[styles.titleText, {color: theme.color}]}>Banner</Text>
      <View style={{alignItems: 'center'}}>
       <TouchableOpacity style={styles.addContainer} onPress={pickBannerImage}>
            <FastImage source={editedBanner ? {uri: editedBanner} : require('../assets/defaultpfp.jpg')} style={{height: 200, width: 300, borderRadius: 8, borderWidth: 2}}/>
        </TouchableOpacity>
      </View>     
      </> : privacy ? 
      <View style={{alignItems: 'center'}}>
         <View>
                <Text style={[styles.titleText, {color: theme.color}]}>Tap to Change Privacy Setting</Text>
            </View>
       
      <Switch
                    trackColor={editedPrivacy == 'private' ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : '#005278'}
                    thumbColor={'#f4f3f4'} 
                    onValueChange={privateFunction}
                    value={editedPrivacy == 'private'}
                />   
        <Text style={[styles.titleText, {paddingBottom: 0, color: theme.color}]}>Cliq is {editedPrivacy.charAt(0).toUpperCase() + editedPrivacy.slice(1)}</Text>
      </View> :
      null
      }
      {uploading ? 
      <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} /> : <View style={{marginLeft: '5%', marginRight: '5%', marginTop: '2.5%'}}>
        <PreviewFooter containerStyle={{backgroundColor: theme.backgroundColor, marginTop: '5%'}} text={"SAVE"} onPressCancel={() => navigation.goBack()} onPress={() => updateDB()}/>
      </View>}
      
    </View>
  )
}

export default EditClique

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleText: {
        margin: '5%',
        fontSize: 19.20,
        fontFamily: 'Montserrat_600SemiBold'
    },
    supplementaryText: {
        fontSize: 12.29,
        fontFamily: 'Montserrat_500Medium',
        margin: '5%'
    },
    addContainer: {
        //backgroundColor: "#000",
        height: 190, width: 154,
        //borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        //justifyContent:'center'
    },
    characterCountText: {
      fontSize: 12.29,
      fontFamily: 'Montserrat_500Medium',
      padding: 10,
      textAlign: 'right',
      paddingRight: 0,
      marginRight: '7.5%'
    }
})