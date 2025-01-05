import * as ImagePicker from 'expo-image-picker'
import { Alert } from 'react-native';
import { useState } from 'react';
import {Image} from 'react-native-compressor';
import useAuth from './useAuth';
import axios from 'axios';
import {IMAGE_MODERATION_URL, MODERATION_API_SECRET, MODERATION_API_USER} from '@env';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject} from 'firebase/storage';
import { addImageToMessage, updateCliquePfp, updatePfp } from '../firebaseUtils';
import {BACKEND_URL} from '@env'
import createSearchKeywords from '../lib/searchKeywords';
import { useNavigation } from '@react-navigation/native';
import { schedulePushImageNotification } from '../notificationFunctions';
export const useSinglePickImage = ({profilePfp, cliquePfp, name, group, firstName, lastName, userName, age, groupName, groupSecurity, category,
  description, id, messagePfp, channelPfpImage, pfpRegisterImage, groupBanner, person, friendId}) => {
    const [imageLoading, setImageLoading] = useState(false);
    const {user} = useAuth();
    const [image, setImage] = useState(null);
    const [imageBackground, setImageBackground] = useState(null);
    const storage = getStorage();
    const navigation = useNavigation();
    const uploadImage = async(image) => {
        setImageLoading(true);
        const response = await fetch(image)
        const blob = await response.blob();
        const filename = name
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
                {text: 'OK', onPress: () => deleteObject(reference).then(() => {setImageLoading(false)}).catch((error) => {
                  throw error;
                  
                })},
              ]);
              throw null;
              }
              else {
                delete response.data.nudity.erotica
              }
            }
            if (response.data.drugs || response.data.gore.prob || response.data.recreational_drugs || response.data.medical_drugs || response.data.scam
            || response.data.weapon_knife || response.data.skull.prob || response.data.weapon || response.data.weapon_firearm > 0.9 
            || containsNumberGreaterThan(getValuesFromImages(Object.values(response.data.nudity)), 0.95)
            || containsNumberGreaterThan(Object.values(response.data.offensive), 0.9)) {
              Alert.alert('Unable to Post', 'This Post Goes Against Our Guidelines', [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => deleteObject(reference).then(() => setImageLoading(false)).catch((error) => {
                  console.error(error)
                })},
              ]);
            }
            else {
              if (profilePfp) {
                try {
                  updatePfp(user.uid, url)
                } catch (e) {
                  console.error(e)
                  setImageLoading(false)
                }
                setImageLoading(false)
              }
              else if (cliquePfp) {
                try {
                  updateCliquePfp(group.id, url)
                  setImageBackground(url)
                } catch (e) {
                  console.error(e)
                  setImageLoading(false)
                }
              }
              else if (pfpRegisterImage) {
                navigation.navigate('Referral', {firstName: firstName, lastName: lastName, userName: userName, age: age, pfp: url})
              }
              else if (groupBanner) {
                const searchKeywords = createSearchKeywords(groupName.toLowerCase().trim(), 5, 3, 30)
                  try {
                  const response = await fetch(`${BACKEND_URL}/api/uploadCliq`, {
                    method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                    headers: {
                      'Content-Type': 'application/json', // Set content type as needed
                    },
                    body: JSON.stringify({ data: {name: groupName, banner: url, groupSecurity: groupSecurity, category: category, description: description,
                    searchKeywords: searchKeywords, user: user.uid, groupId: id}}), // Send data as needed
                  })
                  const data = await response.json();
                    if (data.result.done) {
                      navigation.navigate('MyGroups')
                    }
                } catch (error) {
                  console.error('Error:', error);
                }
              }
              else if (messagePfp) {
                await addImageToMessage(friendId, url, person, user, firstName, lastName)
                schedulePushImageNotification(person.id, firstName, lastName, person.notificationToken, friendId)
              }
            }  
            })
            .catch(function (error) {
            // handle error
            if (error.response) console.log(error.response.data);
              else console.log(error.message);
            });
            }
    const pickImage = async () => {
      setImageLoading(true)
      await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          allowsMultipleSelection: false,
          aspect: [4, 3],
          quality: 0.8,
        }).then((image) => {
          if (!image.canceled) {
              image.assets.map(async(ite, index) => {
              const result = await Image.compress(ite.uri, {
                compressionMethod: "auto",
                quality: 0.8
              })
              setImage(result)
              uploadImage(result)
                      
            })
            }
            else {
              setImageLoading(false)
            }
        }) 
    }
    return {imageBackground, image, imageLoading, pickImage}
      
    };