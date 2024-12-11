import { StyleSheet, Text, View, ImageBackground, Modal, TouchableOpacity, Button, Alert, ActivityIndicator } from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
import InputBox from '../Components/InputBox'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {StripeProvider, collectBankAccountToken, collectFinancialConnectionsAccounts} from '@stripe/stripe-react-native';
import { resolveDiscoveryAsync } from 'expo-auth-session'
import axios from 'axios'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser';
import { addDoc, getFirestore, doc, where, getDoc, onSnapshot, increment, query, updateDoc, collection, getDocs, serverTimestamp, arrayUnion, setDoc} from 'firebase/firestore'
import useAuth from '../Hooks/useAuth'
import { uploadBytesResumable, ref, getDownloadURL, getStorage } from 'firebase/storage'
import {BACKEND_URL, MODERATION_API_USER, MODERATION_API_SECRET, IMAGE_MODERATION_URL} from "@env"
import themeContext from '../lib/themeContext'
import { db } from '../firebase'
const AddCard = ({route}) => {
    const {name, price, keywords, post, themeName, searchKeywords, groupsJoined, sellChecked, profileChecked, cliqueData, postChecked, notificationToken} = route.params;
    const navigation = useNavigation();
    const {user} = useAuth();
    const [SellingName, setSellingName] = useState(''); 
    const [stripeId, setStripeId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [nameModalVisible, setNameModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const storage = getStorage();
    const theme = useContext(themeContext)
    //console.log(user.email, user.displayName)
    async function sendThemeToDB() {
      setUploading(true)
      const response = await fetch(post)
      const blob = await response.blob();
      const filename = `themes/${name}${themeName}${Date.now()}theme.jpg`
      //setPfp(filename)
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
    function filterByType(arr, type) {
      return arr.filter(function(item) {
        return typeof item !== type;
      });
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
              //console.log(response.data.nudity.context)
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
                if (sellChecked && profileChecked && postChecked) {
                    await updateDoc(doc(db, 'profiles', user.uid), {
            background: url,
            postBackground: url,
            postBought: sellChecked ? true: false,
            free: Number.parseFloat(price) > 0 ? false : true,
            themeName: themeName.trim(),
            forSale: sellChecked ? true: false,
            credits: increment(-1)
        }).then(async() => {const docRef = await addDoc(collection(db, 'profiles', user.uid, 'myThemes'), {
            timestamp: serverTimestamp(),
            images: arrayUnion(url),
            active: true,
            name: themeName.trim(),
             keywords: keywords,
            searchKeywords: searchKeywords,
            bought: false,
            forSale: sellChecked ? true: false,
            price: Number.parseFloat(price),
     
        }).then(async() => 
        Number.parseFloat(price) > 0 ? 
        backEndProduct(url) :
        await setDoc(doc(db, 'freeThemes', docRef.id), {
            timestamp: serverTimestamp(),
                        images: arrayUnion(url),
                        active: true,
                        name: themeName.trim(),
                        keywords: keywords,
            searchKeywords: searchKeywords,
                        bought: false,
                        forSale: sellChecked ? true: false,
                        bought_count: 0,
                        userId: user.uid,
                        stripe_metadata_price: 0
        }))}).then(() => navigation.navigate('All', {name: null, goToMy: true}))
                }
                else if (profileChecked && postChecked && !sellChecked) {
                    await updateDoc(doc(db, 'profiles', user.uid), {
            background: url,
            postBackground: url,
            postBought: sellChecked ? true: false,
            themeName: themeName.trim(),
            free: Number.parseFloat(price) > 0 ? false : true,
            forSale: sellChecked ? true: false,
            credits: increment(-1)
        }).then(() => addDoc(collection(db, 'profiles', user.uid, 'myThemes'), {
            timestamp: serverTimestamp(),
            images: arrayUnion(url),
            active: true,
            name: themeName.trim(),
            keywords: keywords,
            searchKeywords: searchKeywords,
            bought: false,
            forSale: sellChecked ? true: false,
            price: Number.parseFloat(price),

        })).then(() => navigation.navigate('All', {name: null, goToMy: true})) 

                }
                else if (sellChecked && profileChecked && !postChecked) {
                     await updateDoc(doc(db, 'profiles', user.uid), {
            background: url,
            free: Number.parseFloat(price) > 0 ? false : true,
            forSale: sellChecked ? true: false,
            credits: increment(-1)
        }).then(async() => {const docRef = await addDoc(collection(db, 'profiles', user.uid, 'myThemes'), {
            timestamp: serverTimestamp(),
            images: arrayUnion(url),
            active: true,
            name: themeName.trim(),
            keywords: keywords,
            searchKeywords: searchKeywords,
            bought: false,
            price: Number.parseFloat(price),
            forSale: sellChecked ? true: false,
        })
        Number.parseFloat(price) > 0 ? backEndProduct(url) :
        await setDoc(doc(db, 'freeThemes', docRef.id), {
            timestamp: serverTimestamp(),
                        images: arrayUnion(url),
                        active: true,
                        name: themeName.trim(),
                        keywords: keywords,
            searchKeywords: searchKeywords,
                        bought: false,
                        forSale: sellChecked ? true: false,
                        bought_count: 0,
                        userId: user.uid,
                        stripe_metadata_price: 0
        }).then(() => navigation.navigate('All', {name: null, goToMy: true}))})
                }
                else if (profileChecked && !postChecked && !sellChecked) {
                     await updateDoc(doc(db, 'profiles', user.uid), {
                        background: url,
                        free: Number.parseFloat(price) > 0 ? false : true,
                        forSale: sellChecked ? true: false,
                        credits: increment(-1)
                    }).then(() => addDoc(collection(db, 'profiles', user.uid, 'myThemes'), {
                        timestamp: serverTimestamp(),
                        images: arrayUnion(url),
                        active: true,
                        name: themeName.trim(),
                        keywords: keywords,
            searchKeywords: searchKeywords,
                        bought: false,
                        price: Number.parseFloat(price),
                        forSale: sellChecked ? true: false,
                    })).then(() => navigation.navigate('All', {name: null, goToMy: true}))
                }
                else if ( sellChecked && postChecked && !profileChecked) {
                  await updateDoc(doc(db, 'profiles', user.uid), {
            postBackground: url,
            postBought: sellChecked ? true: false,
            credits: increment(-1),
            free: Number.parseFloat(price) > 0 ? false : true,
                themeName: themeName.trim(),
        }).then(async() => {
        const docRef = await addDoc(collection(db, 'profiles', user.uid, 'myThemes'), {
            timestamp: serverTimestamp(),
            images: arrayUnion(url),
            active: true,
            name: themeName.trim(),
            bought: false,
            price: Number.parseFloat(price),
            forSale: sellChecked ? true: false,
        })
        Number.parseFloat(price) > 0 ? await updateDoc(doc(db, 'profiles', user.uid), {
                postBackground: url,
                postBought: sellChecked ? true: false,
                free: Number.parseFloat(price) > 0 ? false : true,
                themeName: themeName.trim(),
                forSale: sellChecked ? true: false
            }).then(() => backEndProduct(url)).then(() => navigation.navigate('All', {name: null, goToMy: true})) : 
        await setDoc(doc(db, 'freeThemes', docRef.id), {
            timestamp: serverTimestamp(),
                        images: arrayUnion(url),
                        active: true,
                        userId: user.uid,
                        name: themeName.trim(),
                        keywords: keywords,
            searchKeywords: searchKeywords,
                        bought: false,
                        forSale: sellChecked ? true: false,
                        bought_count: 0,
                        stripe_metadata_price: 0
        }).then(() => navigation.navigate('All', {name: null, goToMy: true}))})
                }
                else if (postChecked && !profileChecked && !sellChecked) {
                    await addDoc(collection(db, 'profiles', user.uid, 'myThemes'), {
            timestamp: serverTimestamp(),
            images: arrayUnion(url),
            active: true,
            name: themeName.trim(),
            keywords: keywords,
            searchKeywords: searchKeywords,
            bought: false,
            price: Number.parseFloat(price),
            forSale: sellChecked ? true: false,
        }).then(async() => await updateDoc(doc(db, 'profiles', user.uid), {
                postBackground: url,
                free: Number.parseFloat(price) > 0 ? false : true,
                themeName: themeName.trim(),
                postBought: sellChecked ? true: false,
                credits: increment(-1)
            })).then(() => navigation.navigate('All', {name: null, goToMy: true}))
          }
                else if (sellChecked && !profileChecked && !postChecked) {
                    if (Number.parseFloat(price) > 0) {
                        addDoc(collection(db, 'profiles', user.uid, 'myThemes'), {
                    timestamp: serverTimestamp(),
                    images: arrayUnion(url),
                    active: true,
                    name: themeName.trim(),
                    keywords: keywords,
            searchKeywords: searchKeywords,
                    bought: false,
                    price: Number.parseFloat(price),
                    forSale: true
                }).then(() => backEndProduct(url)).then(async() => await updateDoc(doc(db, 'profiles', user.uid), {
            credits: increment(-1)
        })).then(() => navigation.navigate('All', {name: null, goToMy: true}))
                    } else {
                        addDoc(collection(db, 'freeThemes'), {
            timestamp: serverTimestamp(),
                        images: arrayUnion(url),
                        userId: user.uid,
                        active: true,
                        name: themeName.trim(),
                        keywords: keywords,
            searchKeywords: searchKeywords,
                        bought: false,
                        forSale: sellChecked ? true: false,
                        bought_count: 0,
                        stripe_metadata_price: 0
        }).then(() => addDoc(collection(db, 'profiles', user.uid, 'myThemes'), {
                    timestamp: serverTimestamp(),
                    images: arrayUnion(url),
                    active: true,
                    name: themeName.trim(),
                    keywords: keywords,
            searchKeywords: searchKeywords,
                    bought: false,
                    price: Number.parseFloat(price),
                    forSale: sellChecked ? true: false
                })).then(async() => await updateDoc(doc(db, 'profiles', user.uid), {
            credits: increment(-1)
        })).then(() => navigation.navigate('All', {name: null, goToMy: true}))
                    }            
                }
                else {
        addDoc(collection(db, 'profiles', user.uid, 'myThemes'), {
                    timestamp: serverTimestamp(),
                    images: arrayUnion(url),
                    active: true,
                    name: themeName.trim(),
                    keywords: keywords,
            searchKeywords: searchKeywords,
                    bought: false,
                    price: Number.parseFloat(price),
                    forSale: sellChecked ? true: false
                }).then(() => navigation.navigate('All', {name: null, goToMy: true}))
                }
              }
    
                })
            .catch(function (error) {
            // handle error
            if (error.response) console.log(error.response.data);
            else console.log(error.message);
            });
    }
    const backEndProduct = (url) => {
      fetch(`${BACKEND_URL}/api/productEndpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: themeName.trim(),
        keywords: keywords,
            searchKeywords: searchKeywords,
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
  const handleAddCard = async() => {
    console.log('first')
    try {
      const response = await fetch(`${BACKEND_URL}/api/endpoint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      try {
          const result = async() => {
            return WebBrowser.openAuthSessionAsync(`${data.accountLink.url}?linkingUri=${Linking.createURL('/')}`)
          }
          result().then(async(myVar) => {
            console.log(myVar)
            if (myVar.url && myVar.type == 'success') {
              await updateDoc(doc(db, 'profiles', user.uid), {
                stripeAccountID: data.accountId
              })
            }
          })
      } catch (error) {
          console.error(error)        
      }
    }
    catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    let unsub;
    const fetchStripeId = () => {
      unsub = onSnapshot(query(doc(db, 'profiles', user.uid)), (snapshot) => {
        setStripeId(snapshot.data().stripeAccountID)
      })
    }
    fetchStripeId()
    return unsub;
  }, [])
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover">
        <View style={[styles.main, {backgroundColor: theme.backgroundColor}]}>
          <RegisterHeader onPress={() => navigation.navigate('SuccessTheme', {name: name, themeName: themeName, price: price, post: post, actualKeywords: keywords,
            searchKeywords: searchKeywords, sellChecked: sellChecked,
                        profileChecked: profileChecked, postChecked: postChecked, cliqueData: cliqueData, notificationToken: notificationToken})} paymentMethod={true}/>
            <>
              <Text style={[styles.headerText, {color: theme.color}]}>We need to collect your debit information so that we can deposit your earnings. Click the <Text style={{fontWeight: '700'}}>Add Card</Text> button below to fill out that information.</Text>
            {loading && stripeId == null ? <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} style={{marginTop: '5%'}}/> : stripeId == null ?
            <View style={{marginTop: '5%'}}>
                <StripeProvider publishableKey={'pk_live_51N5AxSJM3BhfSRhsCg2NNuvCrh2vYQAy3c2WPvYUIn4ijgvlREwEZG6aVfn2opRofDwkHoqw3RQaPvHYVw0JsdCt00mEdYGM3s'}>
                    <Button title='Add Card' color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} onPress={() => {handleAddCard(); setLoading(true)}}/>
                </StripeProvider>
                
            </View>  :null}
            </>
            {stripeId != null && !uploading ? <View style={{marginTop: '10%', marginRight: '5%', marginLeft: '5%'}}>
              <StripeProvider publishableKey={'pk_live_51N5AxSJM3BhfSRhsCg2NNuvCrh2vYQAy3c2WPvYUIn4ijgvlREwEZG6aVfn2opRofDwkHoqw3RQaPvHYVw0JsdCt00mEdYGM3s'}>
                  <NextButton text={'Next'} onPress={() => sendThemeToDB()}/>
              </StripeProvider>
            </View> : uploading ? <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> : null}
            
        </View>
    </ImageBackground>
  )
}

export default AddCard

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        fontSize: 15.36,
        padding: 25,
        paddingBottom: 0
    },
    supplementaryText: {
        fontSize: 15.36,
        padding: 25,
        paddingBottom: 0,
        paddingTop: 5
    },
    input: {
        marginTop: '25%',
        borderWidth: 1,
        padding: 10,
        borderColor: "#cdcdcd",
        borderRadius: 30,
    },
    main: {
      borderRadius: 35,
      width: '90%',
      height: '90%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    input: {
        fontSize: 15.36,
        padding: 12,
        alignSelf: 'center',
        fontWeight: '300',
        color: "#000",
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22
    },
  modalView: {
    width: '90%',
    height: '15%',
    //margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    paddingRight: 0,
    paddingTop: 5,
    paddingBottom: 25,
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
  barColor: {
    borderColor: '#3286ac'
  }
})