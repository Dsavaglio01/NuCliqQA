import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Platform} from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import * as ImagePicker from 'expo-image-picker'; 
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { getStorage, uploadBytesResumable, ref, getDownloadURL, deleteObject, } from 'firebase/storage'
import axios from 'axios'
import { useNavigation } from '@react-navigation/native';
import NextButton from './NextButton';
import Skip from './Skip';
import useAuth from '../Hooks/useAuth';
import { db } from '../firebase';
import {BACKEND_URL, MODERATION_API_USER, MODERATION_API_SECRET, IMAGE_MODERATION_URL} from "@env"
import FastImage from 'react-native-fast-image';
import { serverTimestamp, updateDoc, doc, addDoc, setDoc, arrayUnion, collection } from 'firebase/firestore';
import {Image} from 'react-native-compressor'
import themeContext from '../lib/themeContext';
const PfpImage = ({name, channelPfp, groupPfp, skipOnPress, id, channelName, security, group, edit,
  pfpRegister, categories, firstName, lastName, userName, interests, age, category, groupName, groupSecurity, description, groupBanner}) => {
    const storage = getStorage();
    const[uploading, setUploading] = useState(false);
    const [image, setImage] = useState(null);
    const {user} = useAuth();
    const theme = useContext(themeContext);
    const navigation = useNavigation();
    const [status, setStatus] = useState(null);
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
    const pickImage = async() => {
      if (status !== false) {
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
              setImage(result)
                      
            })
            }
        })
      }
      else {
        Alert.alert("No Media Permissions", "To select an image, allow media permissions, in order to select images for profile pictures, posts and themes, in your phone's settings", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])
      }
         
    };
    //console.log(image)
    const uploadImage = async() => {
      setUploading(true);
        const response = await fetch(image)
      //console.log(response)
        const blob = await response.blob();
        const filename = `${user.uid}${name}${Date.now()}groupBanner.jpg`
        var storageRef = ref(storage, filename)
        try {
            await storageRef;
        } catch (error) {
            console.log(error)
        }
        await uploadBytesResumable(storageRef, blob).then(() => getLink(filename))
      
    }
    const getLink = (pfp) => {
            const starsRef = ref(storage, pfp);
            getDownloadURL(starsRef).then((url) => checkPfp(url, starsRef))
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
    function createSearchKeywords(str, maxLen, n, limit) {
  console.log(str)
  const result = new Set();
  let count = 0;

  // Prefixes and Suffixes
  for (let i = 1; i <= maxLen; i++) {
    if (count >= limit) break;
    result.add(str.substring(0, i)); // Prefix
    count++;
  }

  for (let i = 1; i <= maxLen; i++) {
    if (count >= limit) break;
    result.add(str.substring(str.length - i)); // Suffix
    count++;
  }

  // N-grams
  for (let i = 0; i <= str.length - n && count < limit; i++) {
    result.add(str.substring(i, i + n));
    count++;
  }

  return Array.from(result).slice(0, limit);
}
    const checkPfp = (url, reference) => {
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
              if (response.data.nudity.erotica >= 0.68) {
                Alert.alert('Unable to Post', `This Goes Against Our Guidelines`, [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => deleteObject(reference).then(() => {setUploading(false);}).catch((error) => {
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
              Alert.alert('Unable to Post', 'This Goes Against Our Guidelines', [
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
              if (pfpRegister) {
                navigation.navigate('Referral', {firstName: firstName, lastName: lastName, userName: userName, age: age, pfp: url})
                setUploading(false)
              }
              else if (groupBanner) {
                const searchleywords = createSearchKeywords(groupName.toLowerCase().trim(), 5, 3, 30);
                let cloudUrl = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/uploadCliq'
    try {
    const response = await fetch(cloudUrl, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {name: groupName, banner: url, groupSecurity: groupSecurity, category: category, description: description,
      searchKeywords: searchleywords, user: user.uid, groupId: id}}), // Send data as needed
    })
    const data = await response.json();
      if (data.result.done) {
        navigation.navigate('MyGroups')
      }
  } catch (error) {
    console.error('Error:', error);
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
  return (
    pfpRegister || channelPfp ? 
    <>
    <View style={{alignItems: 'center', marginTop: '5%'}}>
                <TouchableOpacity style={[styles.addContainer, {backgroundColor: theme.backgroundColor}]} onPress={pickImage}>
                    <FastImage source={image ? {uri: image} : require('../assets/defaultpfp.jpg')} style={!groupPfp ? {height: 151, width: 151, borderRadius: 8, borderWidth: 4} : {height: 190, width: 154, borderRadius: 8, borderWidth: 4}}/>
                </TouchableOpacity>
              
            </View>
            <View style={{marginTop: '10%', marginLeft: '5%', marginRight: '5%'}}>
                {uploading ? <>
                <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />  
                </> : image != null ?  <>
                <NextButton text={'Next'} onPress={uploadImage}/>
                <Skip onPress={skipOnPress}/>
                </> : <Skip onPress={skipOnPress}/>}
            </View>
            </>
            : groupBanner ?
            <>
            <View style={{alignItems: 'center', marginTop: '5%'}}>
                 <TouchableOpacity style={[styles.addContainer, {height: 200, width: 300, backgroundColor: theme.backgroundColor}]} onPress={pickImage}>
                    <FastImage source={image ? {uri: image} : require('../assets/defaultpfp.jpg')} style={{height: 200, width: 300, borderRadius: 8, borderWidth: 4}}/>
                </TouchableOpacity>
            </View>
            <View style={{marginTop: '10%', marginLeft: '5%', marginRight: '5%'}}>
            {uploading ? <>
                <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />  
                </> : image != null && !edit ?  <>
                <NextButton text={'Next'} onPress={uploadImage}/>
                <Skip onPress={skipOnPress}/>
                </> : image != null && edit ? 
                <NextButton text={'Next'} onPress={uploadImage}/>
                : !edit ? <Skip onPress={skipOnPress}/> : null}
            </View>
            </> : null
    
  )
}

export default PfpImage

const styles = StyleSheet.create({
  addContainer: {
        height: 151,
        width: 151,
        borderRadius: 8,
        //justifyContent:'center'
    },
})