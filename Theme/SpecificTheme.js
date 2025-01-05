import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Modal, Dimensions} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import { useNavigation } from '@react-navigation/native';
import NextButton from '../Components/NextButton';
import { collection, doc, getDoc, getDocs, updateDoc, onSnapshot, query} from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import { Provider, Divider } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import ThemeHeader from '../Components/ThemeHeader';
import {BACKEND_URL} from '@env';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import themeContext from '../lib/themeContext';
import { db } from '../firebase'
const SpecificTheme = ({route}) => {
    const {id, groupId, free, purchased, productId, my, myId} = route.params;
    //console.log(id)
    const navigation = useNavigation();
    const [price, setPrice] = useState(0);
    const [selling, setSelling] = useState(true);
    const modeTheme = useContext(themeContext)
    const [name, setName] = useState('');
    const [applyLoading, setApplyLoading] = useState(false);
    const [theme, setTheme] = useState(null);
    const [keywords, setKeywords] = useState('');
    const [searchKeywords, setSearchKeywords] = useState([])
    const [purchasedThemes, setPurchasedThemes] = useState([]);
    const [myThemes, setMyThemes] = useState([]);
    const [notificationToken, setNotificationToken] = useState(null);
    const [metadata, setMetadata] = useState();
    const [themeLoading, setThemeLoading] = useState(false);
    const [themeId, setThemeId] = useState('');
    const [loading, setLoading] = useState(true);
    const [appliedThemeModal, setAppliedThemeModal] = useState(false);
    const [userName, setUserName] = useState(null);
    const [postDoneApplying, setPostDoneApplying] = useState(false);
  const [profileDoneApplying, setProfileDoneApplying] = useState(false);
  const [bothDoneApplying, setBothDoneApplying] = useState(false)
    const [userId, setUserId] = useState(null);
    const {user} = useAuth()
    useEffect(() => {
      let unsub1;
      let unsub2;
      const getPurchasedThemes = async() => {
        unsub1 = onSnapshot(query(collection(db, 'profiles', user.uid, 'purchased')), (snapshot) => {
          setPurchasedThemes(snapshot.docs.map((doc) => ({
            productId: doc.data().productId
          })))
        })
      }
      const getMyThemes = async() => {
        unsub2 = onSnapshot(query(collection(db, 'profiles', user.uid, 'myThemes')), (snapshot) => {
          setMyThemes(snapshot.docs.map((doc) => ({
            image: doc.data().images[0]
          })))
        })
      }
      getMyThemes()
      getPurchasedThemes()
      return unsub1, unsub2;
    }, [])
    useEffect(() => {
      new Promise(resolve => {
            async function fetchData() {
              if (purchased) {

                        (await getDocs(collection(db, 'products', id, 'prices'))).forEach((doc) => {
                                setPrice(doc.data().unit_amount)
                            })
                            const profileVariables = {
                                    name: await(await getDoc(doc(db, 'products', id))).data().name,
                                    theme: await(await getDoc(doc(db, 'products', id))).data().images[0],
                                    keywords: await (await getDoc(doc(db, 'products', id))).data().stripe_metadata_keywords,
                                    metadata: await (await getDoc(doc(db, 'products', id))).data().metadata,
                                    userId: await (await getDoc(doc(db, 'products', id))).data().userId,
                                   
                                    
                                }
                            //console.log(profileVariables.name)
  
                            setUserId(profileVariables.userId)
                            setName(profileVariables.name)
                            setTheme(profileVariables.theme)
                            setKeywords(profileVariables.keywords)
                            setMetadata(profileVariables.metadata)
                            setSelling(true)
                           
                            //setMetadata((await getDoc(doc(db, 'products', id))).data().metadata
                
              }
              else if (my) {
                  const themeSnap = (await getDoc(doc(db, 'profiles', user.uid, 'myThemes', myId))).data()
                            setName(themeSnap.name)
                            setTheme(themeSnap.images[0])
                            setKeywords(themeSnap.keywords)
                            setSearchKeywords(themeSnap.searchKeywords)
                            setSelling(themeSnap.forSale)
                          }
              else
              {
                  if (groupId == undefined) {
                    if (free) {
                        
                        const themeSnap = (await getDoc(doc(db, 'freeThemes', productId))).data()
                            
                            setName(themeSnap.name)
                            setTheme(themeSnap.images[0])
                            setUserId(themeSnap.userId)
                            setKeywords(themeSnap.keywords)
                            setSearchKeywords(themeSnap.searchKeywords)
                            setSelling(true)
                           
                                } 
                    else {
                        (await getDocs(collection(db, 'products', id, 'prices'))).forEach((doc) => {
                                setPrice(doc.data().unit_amount)
                            })
                            const profileVariables = {
                                    name: await(await getDoc(doc(db, 'products', id))).data().name,
                                    theme: await(await getDoc(doc(db, 'products', id))).data().images[0],
                                    keywords: await (await getDoc(doc(db, 'products', id))).data().stripe_metadata_keywords,
                                    metadata: await (await getDoc(doc(db, 'products', id))).data().metadata,
                                    
                                    
                                }
                            //console.log(profileVariables.name)
                            
                            setName(profileVariables.name)
                            setTheme(profileVariables.theme)
                            setKeywords(profileVariables.keywords)
                            setMetadata(profileVariables.metadata)
                            setSelling(true)
                    }
                    
                }

                else {
                    if (free) {
                        
                        const profileVariables = {
                        name: await(await getDoc(doc(db, 'groups', groupId, 'freeThemes', id))).data().name,
                        theme: await(await getDoc(doc(db, 'groups', groupId, 'freeThemes', id))).data().images[0],
                        keywords: await (await getDoc(doc(db, 'groups', groupId, 'freeThemes', id))).data().keywords,
                        
                }
                setName(profileVariables.name)
                setTheme(profileVariables.theme)
   
                setKeywords(profileVariables.keywords)
          
                    }
                    else {
                        
                    }
                }
            
              }
                

        }
        
        fetchData()
        resolve()
      }).finally(() => setTimeout(() => {
        setLoading(false)
      }, 200))
    }, [route.params?.free])
    useEffect(() => {
        if (metadata != undefined) {
            if (metadata.userId) {
            const getUsername = async() => {
                const username = (await getDoc(doc(db, 'profiles', metadata.userId))).data().userName
                setUserName(username)
                setUserId(metadata.userId)
            }
            getUsername();
        }
        }
        
    }, [metadata])
    useEffect(() => {
      if (userId) {
        const getNotificationToken = async() => {
          const docSnap = await getDoc(doc(db, 'profiles', userId))
          setNotificationToken(docSnap.data().notificationToken)
        }
        getNotificationToken()
      }
    }, [userId])
    //console.log(metadata)
    async function freeTheme() {
      setThemeLoading(true)
       try {
                            const response = await fetch(`${BACKEND_URL}/api/getFreeTheme`, {
                          method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                          headers: {
                            'Content-Type': 'application/json', // Set content type as needed
                          },
                          body: JSON.stringify({ data: {notificationToken: notificationToken, user: user.uid, keywords: keywords, searchKeywords: searchKeywords, theme: theme, name: name, 
                            productId: productId, themeId: themeId
                          }}), // Send data as needed
                        })
                        const data = await response.json();
                        if (data.done) {
                         /*  console.log(`themeId: ${themeId}`)
                          console.log(`theme: ${theme}`)
                          addDoc(collection(db, 'profiles', userId, 'notifications'), {
          like: false,
          comment: false,
          friend: false,
          item: theme,
          request: false,
          acceptRequest: false,
          postId: themeId,
          theme: true,
          report: false,
          requestUser: user.uid,
          requestNotificationToken: notificationToken,
          likedBy: [],
          timestamp: serverTimestamp()
        }).then(() => addDoc(collection(db, 'profiles', userId, 'checkNotifications'), {
        userId: userId
      })) */
      setThemeLoading(false)
      schedulePushThemeNotification(userName, notificationToken, name)
      navigation.navigate('All', {goToPurchased: true})
                        }
                      } catch (e) {
                        console.error(e);
                        
                      }
      
        
    }
    async function applyToProfile() {
      
   // setUseThemeModalLoading(true)
   setApplyLoading(true)
    await updateDoc(doc(db, 'profiles', user.uid), {
            background: theme,
            forSale: selling,
        }).then(() => {
          setTimeout(() => {
            setApplyLoading(false)
            setAppliedThemeModal(true); setProfileDoneApplying(true);
          }, 1000);
          
        })
  }
  async function applyToPosts() {
    setApplyLoading(true)
    await updateDoc(doc(db, 'profiles', user.uid), {
      postBackground: theme,
      forSale: selling,
      postBought: selling
    }).then(() => { 
      setTimeout(() => {
      setAppliedThemeModal(true); 
      setPostDoneApplying(true);
      setApplyLoading(false)
      }, 1000);
    })
  }
  async function applyToBoth() {
   setApplyLoading(true)
    await updateDoc(doc(db, 'profiles', user.uid), {
            background: theme,
            postBackground: theme,
            forSale: selling,
            postBought: selling
        }).then(() => {
          setTimeout(() => {
            setAppliedThemeModal(true); 
            setBothDoneApplying(true); 
            setApplyLoading(false)
          }, 1000);
          
        })
  }
  return (
    <Provider>
    <View style={[styles.container, {backgroundColor: modeTheme.backgroundColor}]}>
      <Modal visible={appliedThemeModal} animationType="slide" transparent onRequestClose={() => {setAppliedThemeModal(false); }}>
            <View style={[styles.modalContainer, styles.modalOverlay]}>
                <View style={styles.modalView}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={styles.useThemeText}>Use Theme</Text>
                    <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}} onPress={() => {setAppliedThemeModal(false);}}>
                      <Text style={[styles.closeText, {color: "#000"}]}>Close</Text>
                      <MaterialCommunityIcons name='close' size={30} color={"#000"}/>
                    </TouchableOpacity>
                  </View> 
                  <Divider borderWidth={0.4}/>
                  {profileDoneApplying ? 
                    <View style={{marginTop: '5%', alignItems: 'center', marginTop: '5%'}}>
                      <Text style={styles.postText}>Your profile is now updated with this theme. You can check by going to your profile!</Text>
                    </View> : postDoneApplying ? 
                    <View style={{marginTop: '5%', alignItems: 'center', marginTop: '5%'}}>
                      <Text style={styles.postText}>Your posts are now updated with this theme. You can check by clicking on your posts on your profile!</Text>
                    </View> : bothDoneApplying ? 
                    <View style={{marginTop: '5%', alignItems: 'center', marginTop: '5%'}}>
                      <Text style={styles.postText}>Your profile and posts are now updated with this theme. You can check by going to your profile and clicking on your posts on your profile!</Text>
                    </View>:
                    null}
                </View>
            </View>
        </Modal>
        {loading ? <ActivityIndicator color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"} size={'large'} style={{marginTop: '20%'}}/> : theme == null ?
        <>
        <ThemeHeader video={false} text={my ? "My Themes" : purchased ? "Collected Themes" : "Get Themes"
        } backButton={true}/> 
        <Divider borderWidth={0.4} borderColor={modeTheme.color}/>

        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>

          <Text style={{fontSize: 19.20, fontFamily: 'Montserrat_500Medium', color: modeTheme.color}}>Sorry, Theme is not available</Text>
        </View>
        </> :
        <>
        {metadata != undefined ? metadata.userId !== user.uid ? 
        <>
        <ThemeHeader text={my ? "My Themes" : purchased ? "Collected Themes" : "Get Themes"
        } video={false} backButton={true}/> 
        <Divider borderWidth={0.4}/>
        </>
        :
        <View>
            <ThemeHeader text={"My Themes"} video={false} backButton={true}/>
        </View>
        : <View>
            <ThemeHeader text={my ? "My Themes" : purchased ? "Collected Themes" : "Get Themes"
        } video={false} backButton={true}/>
        </View>}
        <Divider />
        <Text numberOfLines={1} style={[styles.header, {color: modeTheme.color}]}>{name}</Text>
        {userName ? <Text numberOfLines={1} style={[styles.header, {fontFamily: 'Montserrat_500Medium', color: modeTheme.color, paddingTop: 0, fontSize: 15.36, marginTop: 0}]}>Created by @{userName}</Text> : null}
        <View style={{alignItems: 'center', justifyContent:'center' }}>
        <View style={[styles.imageContainer, {borderColor: theme.color}]}>
            <FastImage source={{uri: theme, priority: 'normal'}} style={styles.image}/>
        </View>
        <View style={styles.overlay}>
          {applyLoading ? <ActivityIndicator color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}/> : <>
          <TouchableOpacity style={[styles.previewButton, { backgroundColor: modeTheme.backgroundColor}]} onPress={() => navigation.navigate('ViewingProfile', {previewImage: theme, preview: true, name: user.uid, viewing: true})}>
            <Text style={[styles.previewText, {color: modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Preview w/ Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.previewButton, { backgroundColor: modeTheme.backgroundColor}]} onPress={() => navigation.navigate('HomeScreenPreview', {source: theme, bought: true, name: user.uid})}>
            <Text style={[styles.previewText, {color: modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Preview w/ Posts</Text>
          </TouchableOpacity>
          {id ? purchasedThemes.filter((e) => e.id === id).length > 0 || purchasedThemes.filter((e) => e.productId === id).length > 0 || myThemes.filter((e) => e.image === theme).length > 0 ? <>
            <TouchableOpacity style={[styles.previewButton, { backgroundColor: modeTheme.backgroundColor}]} onPress={() => {applyToProfile()}}>
            <Text style={[styles.previewText, {color: modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Apply to Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.previewButton, { backgroundColor: modeTheme.backgroundColor}]} onPress={() => applyToPosts()}>
            <Text style={[styles.previewText, {color: modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Apply to Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.previewButton, { backgroundColor: modeTheme.backgroundColor}]} onPress={() => applyToBoth()}>
            <Text style={[styles.previewText, {color: modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Apply to Both Profile & Posts</Text>
          </TouchableOpacity>
          </> : null : purchasedThemes.filter((e) => e.productId === productId).length > 0 || myThemes.filter((e) => e.image === theme).length > 0 ? <>
            <TouchableOpacity style={[styles.previewButton, { backgroundColor: modeTheme.backgroundColor}]} onPress={() => {applyToProfile()}}>
            <Text style={[styles.previewText, {color: modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Apply to Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.previewButton, { backgroundColor: modeTheme.backgroundColor}]} onPress={() => applyToPosts()}>
            <Text style={[styles.previewText, {color: modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Apply to Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.previewButton, { backgroundColor: modeTheme.backgroundColor}]} onPress={() => applyToBoth()}>
            <Text style={[styles.previewText, {color: modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Apply to Both Profile & Posts</Text>
          </TouchableOpacity>
          </> : null
        }
        </>}
        </View>
        {themeLoading ? <ActivityIndicator color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"} style={{alignItems: 'center'}}/> : 
        id ? purchasedThemes.filter((e) => e.id === id).length > 0 || purchasedThemes.filter((e) => e.productId === id).length > 0 || myThemes.filter((e) => e.image === theme).length > 0 ? <Text style={[styles.header, {color: modeTheme.color}]}>You have this theme!</Text> : <View style={styles.purchaseButton}>
            <NextButton text={price == 0 ? 'Get Theme for FREE' : `Get Theme For $${(price / 100).toFixed(2)}`} onPress={free ? () => freeTheme() : () => navigation.navigate('BeforePurchaseSummary', { groupId: groupId,  notificationToken: notificationToken, themeName: name, userId: userId, name: user.uid, keywords: keywords, source: theme, free: price > 0 ? false : true, price: price, userName: userName, product: themeId.length > 0 ? themeId : id, metadata: metadata})}/>
        </View> : purchasedThemes.filter((e) => e.productId === productId).length > 0 || myThemes.filter((e) => e.image === theme).length > 0 ? <Text style={[styles.header, {color: modeTheme.color}]}>You have this theme!</Text> : <View style={styles.purchaseButton}>
            <NextButton text={price == 0 ? 'Get Theme for FREE' : `Get Theme For $${(price / 100).toFixed(2)}`} onPress={free ? () => freeTheme() : () => navigation.navigate('BeforePurchaseSummary', { groupId: groupId,  notificationToken: notificationToken, themeName: name, userId: userId, name: user.uid, keywords: keywords, source: theme, free: price > 0 ? false : true, price: price, userName: userName, product: themeId.length > 0 ? themeId : id, metadata: metadata})}/>
        </View>}
        
        </View>
        </>
        }
        
    </View>
    </Provider>
  )
}

export default SpecificTheme

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    header: {
        padding: 10,
        //paddingTop: 5,
        fontSize: 19.20,
        margin: 5,
        fontFamily: 'Montserrat_600SemiBold',
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 15,
        paddingTop: 0,
        textAlign: 'center'
    },
    included: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_600SemiBold',
        padding: 10,
        textAlign: 'left'
    },
    purchaseButton: {
        marginHorizontal: '5%',
        marginTop: '5%',
        width: '80%'
    },
    image: {
        width: 335, height: Dimensions.get('screen').height / 1.78
    },
    imageContainer: {
        borderWidth: 1,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: '5%',
        marginRight: '5%'
    },
    settingsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    overlay: {
      position: 'absolute',
      width: '80%', 
      height: '50%', // Adjust the overlay height as needed
      borderRadius: 10, // Optional: Add border radius to the overlay
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewButton: {
      backgroundColor: "#fff",
      marginBottom: 10,
      borderRadius: 8,
      width: '90%',
      alignItems: 'center'
    },
    previewText: {
      fontSize: 15.36,
      color: "#005278",
      fontFamily: 'Montserrat_700Bold',
      padding: 15,
    },
    onlyText: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      padding: 10,
      margin: 5,
      textAlign: 'center'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
  modalView: {
    width: '90%',
    height: '45%',
    //margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    paddingLeft: '5%',
    paddingRight: '5%',
    //paddingRight: 0,
    paddingTop: 5,
    paddingBottom: 25,

    //alignItems: 'center',
  },
  useThemeText: {
    fontSize: 15.36,
    padding: 10,
    fontFamily: 'Montserrat_700Bold',
  },
  postText: {
    fontSize: 24,
    fontFamily: 'Montserrat_600SemiBold',
    padding: 10,
    paddingTop: 0,
  },
  closeText: {
      fontSize: 12.29,
      padding: 2.5,
      color: "#fff",
      fontFamily: 'Montserrat_700Bold',
    },
    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
})