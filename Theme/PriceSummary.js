import { StyleSheet, Text, View, ActivityIndicator, Alert} from 'react-native'
import React, {useState, useContext} from 'react'
import ThemeHeader from '../Components/ThemeHeader'
import FastImage from 'react-native-fast-image';
import { useFonts, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Divider } from 'react-native-paper';
import MainButton from '../Components/MainButton';
import NextButton from '../Components/NextButton';
import { useNavigation } from '@react-navigation/native';
import {MODERATION_API_SECRET, MODERATION_API_USER, TEXT_MODERATION_URL, BACKEND_URL, IMAGE_MODERATION_URL} from '@env'
import useAuth from '../Hooks/useAuth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import axios from 'axios';
import { updateDoc, doc, setDoc, increment, getDocs, query, collection, where, addDoc, serverTimestamp, arrayUnion} from 'firebase/firestore';
import { db } from '../firebase';
import themeContext from '../lib/themeContext';
const PriceSummary = ({route}) => {
    const {name, theme, price, keywords, stripeId, groupsJoined, profileChecked, postChecked, notificationToken} = route.params;
    const [uploading, setUploading] = useState(false);
    const {user} = useAuth();
    const modeTheme = useContext(themeContext)
    const storage = getStorage()
    const navigation = useNavigation();
    const linkUsernameAlert = () => {
      Alert.alert("Name must not contain link(s)", "Please go back and change name of theme", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])
      setUploading(false)
    }
    const personalUsernameAlert = () => {
      Alert.alert("Name must not contain personal info", "Please go back and change name of theme", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])
      setUploading(false)
    }
    const profanityUsernameAlert = () => {
      Alert.alert("Name must not contain profanity", "Please go back and change name of theme", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])
      setUploading(false)
  }
  const linkKeywordsAlert = () => {
      Alert.alert("Keywords must not contain link(s)", "Please go back and change keywords of theme", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])
      setUploading(false)
    }
    const personalKeywordsAlert = () => {
      Alert.alert("Keywords must not contain personal info", "Please go back and change keywords of theme", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])
      setUploading(false)
    }
    const profanityKeywordsAlert = () => {
      Alert.alert("Keywords must not contain profanity", "Please go back and change keywords of theme", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])
      setUploading(false)
  }
    function checkName() {
    setUploading(true)
    data = new FormData();
    data.append('text', name);
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
                    if (keywords.length > 0) {
                        checkKeywords()
                    }
                    else {
                        if (stripeId == null) {
                        setUploading(false)
                        navigation.navigate('AddCard', {name: user.uid, groupsJoined: groupsJoined, themeName: name, price: price, post: theme, keywords: keywords, sellChecked: true,
                        profileChecked: profileChecked, postChecked: postChecked, notificationToken: notificationToken})
                    } 
                    else {
                        const response = await fetch(theme)
                        const blob = await response.blob();
                        const filename = `themes/${user.uid}${name}${Date.now()}theme.jpg`
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
function checkKeywords() {
    data = new FormData();
    data.append('text', keywords);
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
                  
                    profanityUsernameAlert()
                
                }
                else {
                    if (stripeId == null) {
                      setUploading(false)
                        navigation.navigate('AddCard', {name: user.uid, groupsJoined: groupsJoined, themeName: name, price: price, post: theme, keywords: keywords, sellChecked: true,
                        profileChecked: profileChecked, postChecked: postChecked, notificationToken: notificationToken})
                    } 
                    else {
                    const response = await fetch(theme)
                        const blob = await response.blob();
                        const filename = `themes/${user.uid}${name}${Date.now()}theme.jpg`
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
const getLink = (pfp) => {
        const starsRef = ref(storage, pfp);
        getDownloadURL(starsRef).then((url) => checkPfp(url, starsRef))
        /*  */
        
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
    const backEndProduct = (url) => {
      fetch(`${BACKEND_URL}/api/productEndpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        keywords: keywords,
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
            if (profileChecked && postChecked) {
              
                    await updateDoc(doc(db, 'profiles', user.uid), {
            background: url,
            postBackground: url,
            free: Number.parseFloat(price) > 0 ? false : true,
            themeName: name.trim(),
            forSale: true,
            credits: increment(-1)
        }).then(async() => await updateDoc(doc(db, 'profiles', user.uid), {
            postBackground: url,
            forSale: true,
        }).then(async() => {(await getDocs(query(collection(db, 'posts'), where('userId', '==', user.uid)))).forEach(async(document) => {
          await updateDoc(doc(db, 'posts', document.id), {
            background: url,
            forSale: true,
          })
        })}).then(() => groupsJoined.map(async(item) => {
          {(await getDocs(query(collection(db, 'groups', item, 'posts'), where('userId', '==', user.uid)))).forEach(async(document) => {
          await updateDoc(doc(db, 'groups', item, 'posts', document.id), {
            background: url,
            forSale: true,
          })
        })}
        }))).then(async() => {const docRef = await addDoc(collection(db, 'profiles', user.uid, 'myThemes'), {
            timestamp: serverTimestamp(),
            images: arrayUnion(url),
            active: true,
            name: name.trim(),
            keywords: keywords,
            bought: false,
            forSale: true,
            price: Number.parseFloat(price),
     
        }).then(async() => 
        Number.parseFloat(price) > 0 ? 
        backEndProduct(url) :
        await setDoc(doc(db, 'freeThemes', docRef.id), {
            timestamp: serverTimestamp(),
                        images: arrayUnion(url),
                        active: true,
                        name: name.trim(),
                        keywords: keywords,
                        bought: false,
                        forSale: true,
                        bought_count: 0,
                        userId: user.uid,
                        stripe_metadata_price: 0
        }))}).then(() => navigation.navigate('All', {name: null, goToMy: true}))
                }
                else if (profileChecked && !postChecked) {
                     await updateDoc(doc(db, 'profiles', user.uid), {
            background: url,
            free: Number.parseFloat(price) > 0 ? false : true,
            forSale: true,
            credits: increment(-1)
        }).then(async() => {const docRef = await addDoc(collection(db, 'profiles', user.uid, 'myThemes'), {
            timestamp: serverTimestamp(),
            images: arrayUnion(url),
            active: true,
            name: name.trim(),
            keywords: keywords,
            bought: false,
            price: Number.parseFloat(price),
            forSale: true,
        })
        Number.parseFloat(price) > 0 ? backEndProduct(url) :
        await setDoc(doc(db, 'freeThemes', docRef.id), {
            timestamp: serverTimestamp(),
                        images: arrayUnion(url),
                        active: true,
                        name: name.trim(),
                        keywords: keywords,
                        bought: false,
                        forSale: true,
                        bought_count: 0,
                        userId: user.uid,
                        stripe_metadata_price: 0
        }).then(() => navigation.navigate('All', {name: null, goToMy: true}))})
                }
                else if (postChecked && !profileChecked) {
                  await updateDoc(doc(db, 'profiles', user.uid), {
            postBackground: url,
            forSale: true,
            credits: increment(-1)
        }).then(async() => {(await getDocs(query(collection(db, 'posts'), where('userId', '==', user.uid)))).forEach(async(document) => {
          await updateDoc(doc(db, 'posts', document.id), {
            background: url,
            forSale: true,
          })
        })}).then(() => groupsJoined.map(async(item) => {
          {(await getDocs(query(collection(db, 'groups', item, 'posts'), where('userId', '==', user.uid)))).forEach(async(document) => {
          await updateDoc(doc(db, 'groups', item, 'posts', document.id), {
            background: url,
            forSale: true,
          })
        })}
        })).then(async() => {
        const docRef = await addDoc(collection(db, 'profiles', user.uid, 'myThemes'), {
            timestamp: serverTimestamp(),
            images: arrayUnion(url),
            keywords: keywords,
            active: true,
            name: name.trim(),
            bought: false,
            price: Number.parseFloat(price),
            forSale: true,
        })
        Number.parseFloat(price) > 0 ? await updateDoc(doc(db, 'profiles', user.uid), {
                postBackground: url,
                free: Number.parseFloat(price) > 0 ? false : true,
                themeName: name.trim(),
                forSale: true
            }).then(() => backEndProduct(url)).then(() => navigation.navigate('All', {name: null, goToMy: true})) : 
        await setDoc(doc(db, 'freeThemes', docRef.id), {
            timestamp: serverTimestamp(),
                        images: arrayUnion(url),
                        active: true,
                        userId: user.uid,
                        name: name.trim(),
                        keywords: keywords,
                        bought: false,
                        forSale: true,
                        bought_count: 0,
                        stripe_metadata_price: 0
        }).then(async() => await updateDoc(doc(db, 'profiles', user.uid), {
                postBackground: url,
                free: Number.parseFloat(price) > 0 ? false : true,
                themeName: name.trim(),
                forSale: true,
            })).then(() => navigation.navigate('All', {name: null, goToMy: true}))})
                }
                else if (!profileChecked && !postChecked) {
                    if (Number.parseFloat(price) > 0) {
                      addDoc(collection(db, 'profiles', user.uid, 'myThemes'), {
                    timestamp: serverTimestamp(),
                    images: arrayUnion(url),
                    active: true,
                    name: name.trim(),
                    keywords: keywords,
                    bought: false,
                    price: Number.parseFloat(price),
                    forSale: true
                }).then(() => backEndProduct(url)).then(async() => await updateDoc(doc(db, 'profiles', user.uid), {
            credits: increment(-1)
        })).then(() => navigation.navigate('All', {name: null, goToMy: true}))
                        
                    } 
                    else {
                        addDoc(collection(db, 'freeThemes'), {
            timestamp: serverTimestamp(),
                        images: arrayUnion(url),
                        userId: user.uid,
                        active: true,
                        name: name.trim(),
                        keywords: keywords,
                        bought: false,
                        forSale: true,
                        bought_count: 0,
                        stripe_metadata_price: 0
        }).then(() => addDoc(collection(db, 'profiles', user.uid, 'myThemes'), {
                    timestamp: serverTimestamp(),
                    images: arrayUnion(url),
                    active: true,
                    name: name.trim(),
                    keywords: keywords,
                    bought: false,
                    price: Number.parseFloat(price),
                    forSale: true
                })).then(async() => await updateDoc(doc(db, 'profiles', user.uid), {
            credits: increment(-1)
        })).then(() => navigation.navigate('All', {name: null, goToMy: true}))
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
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_700Bold,
  });
  return (
    <View style={[styles.container, {backgroundColor: modeTheme.backgroundColor}]}>
      <ThemeHeader video={false} text={"Price Summary"} backButton={true}/>
      <Divider borderBottomWidth={0.4} borderColor={modeTheme.color}/>
      {/* <Text numberOfLines={1} style={styles.header}>{name}</Text> */}
      <View style={{alignItems: 'center', marginTop: '5%'}}>
        <FastImage source={{uri: theme}} style={styles.image}/>
      </View>
      {/* <View style={{alignItems: 'center'}}>
        <Text style={styles.calcText}>Base Price: ${(price / 100).toFixed(2)}</Text>
        <Text style={styles.calcText}>Tax: ${((price * 0.06) / 100).toFixed(2)} (6%)</Text>
        <Text style={styles.calcText}>Processing fee: $0.90 (30% + 30&#162;)</Text>
        <Text style={[styles.calcText, {fontFamily: 'Montserrat_700Bold'}]}>Final (Shown) Price: $3.01</Text>
      </View> */}
      <View style={{backgroundColor: "#d3d3d3", marginHorizontal: '5%', borderWidth: 1, marginTop: '5%'}}>
                <Text style={[styles.dataReceiptText, {width: '100%'}]}>Theme Price Summary</Text>
                <Divider borderBottomWidth={1}/>
                <View style={{backgroundColor: "#fff"}}>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText]}>Selling Item:</Text>
                      <Text numberOfLines={1} style={[styles.dataReceiptText]}>{name}</Text>
                  </View>
                  </View>
                  <View style={{backgroundColor: "#e8e8e8"}}>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText]}>Theme Price:</Text>
                      <Text style={[styles.dataReceiptText]}>${(price / 100).toFixed(2)}</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText, {paddingTop: 0}]}>Tax:</Text>
                      <Text style={[styles.dataReceiptText, {paddingTop: 0}]}>$-.-- (-%)*</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText, {paddingTop: 0}]}>Processing Fee:</Text>
                      <Text style={[styles.dataReceiptText, {paddingTop: 0}]}>${(((price * 0.03) / 100) + 0.3).toFixed(2)} (3% + 30&#162;)</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText, {paddingTop: 0}]}>Total Amount:</Text>
                      <Text style={[styles.dataReceiptText, {paddingTop: 0}]}>${((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3).toFixed(2)}</Text>
                  </View>
                  </View>
                  <View style={{backgroundColor: "#d3d3d3", borderTopWidth: 1, borderBottomWidth: 1}}>
                    <Text style={[styles.dataReceiptText, { width: '100%'}]}>Transaction Summary</Text>
                  </View>
                  <View style={{backgroundColor: "#fff"}}>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText]}>Theme Price:</Text>
                      <Text style={[styles.dataReceiptText]}>${(price / 100).toFixed(2)}</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText, {paddingTop: 0}]}>NuCliq Fee:</Text>
                      <Text style={[styles.dataReceiptText, {paddingTop: 0}]}>${(price * 0.3 / 100).toFixed(2)} (30%)</Text>
                  </View>
                  <Divider borderBottomWidth={1}/>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText]}>$$$ Paid To You:</Text>
                      <Text style={[styles.dataReceiptText]}>${(price / 100 - (price * 0.3 / 100)).toFixed(2)}</Text>
                  </View>
                  </View>
              </View>
          <Text style={[styles.receiptText, {width: '100%', textAlign: 'center'}]}>* State Sales Tax may apply to total amount.</Text>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginLeft: '5%'}}>
          <MainButton text={"CANCEL"} onPress={uploading ? null : () => navigation.navigate('All', {name: null})}/>
          {uploading ? <ActivityIndicator color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"} style={{marginRight: '10%'}} /> : <NextButton text={"FINISH"} onPress={() => checkName()}/> }
          
      </View>
    </View>

  )
}

export default PriceSummary

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    header: {
        padding: 10,
        fontSize: 19.20,
        margin: 5,
        marginTop: 0,
        fontFamily: 'Montserrat_600SemiBold',
        textAlign: 'center',
    },
    image: {
        width: 175 / 1.30382570115, height: 175, borderRadius: 5
    },
    calcText: {
      fontFamily: 'Montserrat_500Medium',
      paddingTop: 12.5,
      fontSize: 19.20,
    },
    receiptText: {
    padding: 10,
    paddingLeft: 10,
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    width: '50%',
    textAlign: 'right'
  },
  dataReceiptText: {
    padding: 10,
    paddingLeft: 10,
    fontSize: 15.36,
    fontFamily: 'Montserrat_700Bold',
    width: '50%',
    textAlign: 'left'
  }
})