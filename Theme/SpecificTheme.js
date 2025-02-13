import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Modal, Dimensions} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import { useNavigation } from '@react-navigation/native';
import NextButton from '../Components/NextButton';
import useAuth from '../Hooks/useAuth';
import { Provider, Divider } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import ThemeHeader from '../Components/ThemeHeader';
import {BACKEND_URL} from '@env';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import themeContext from '../lib/themeContext';
import ProfileContext from '../lib/profileContext';
import { applyTheme, fetchSpecificTheme } from '../firebaseUtils';
const SpecificTheme = ({route}) => {
    const {free, purchased, productId, my, myId} = route.params;
    const navigation = useNavigation();
    const [selling, setSelling] = useState(true);
    const modeTheme = useContext(themeContext)
    const [name, setName] = useState('');
    const [applyLoading, setApplyLoading] = useState(false);
    const [theme, setTheme] = useState(null);
    const [keywords, setKeywords] = useState('');
    const [searchKeywords, setSearchKeywords] = useState([])
    const [themeLoading, setThemeLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [appliedThemeModal, setAppliedThemeModal] = useState(false);
    const profile = useContext(ProfileContext);
    const [postDoneApplying, setPostDoneApplying] = useState(false);
  const [profileDoneApplying, setProfileDoneApplying] = useState(false);
  const [bothDoneApplying, setBothDoneApplying] = useState(false)
    const {user} = useAuth()
    useEffect(() => {
      const getTheme = async() => {
        if (my) {
          const themeSnap = await fetchSpecificTheme(my, free, myId, user.uid) 
          setName(themeSnap.name)
          setTheme(themeSnap.images[0])
          setKeywords(themeSnap.keywords)
          setSearchKeywords(themeSnap.searchKeywords)
          setSelling(themeSnap.forSale)
        }
        else {
          if (free) {
            const themeSnap = await fetchSpecificTheme(my, free, productId, user.uid)                     
            setName(themeSnap.name)
            setTheme(themeSnap.images[0])
            setKeywords(themeSnap.keywords)
            setSearchKeywords(themeSnap.searchKeywords)
            setSelling(true)     
          }
        }
      }
      getTheme();
      setTimeout(() => {
        setLoading(false)
      }, 500);
    }, [myId, productId])
    async function freeTheme() {
      setThemeLoading(true)
       try {
        const response = await fetch(`http://10.0.0.225:4000/api/getFreeTheme`, {
          method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
          headers: {
            'Content-Type': 'application/json', // Set content type as needed
          },
          body: JSON.stringify({ data: {notificationToken: profile.notificationToken, user: user.uid, keywords: keywords, searchKeywords: searchKeywords, theme: theme, name: name, 
            productId: productId, themeId: productId
          }}), // Send data as needed
        })
        const data = await response.json();
        if (data.done) {
          
          setThemeLoading(false)
          schedulePushThemeNotification(profile.userName, profile.notificationToken, name)
          navigation.navigate('All', {goToPurchased: true})
        }
      } catch (e) {
        console.error(e);
        
      }
    }
  const handleApply = async(profile, post, both) => {
    await applyTheme(user.uid, theme, selling, profile, post, both, setApplyLoading, setAppliedThemeModal, setProfileDoneApplying,
      setPostDoneApplying, setBothDoneApplying
    )
  }
  return (
    <Provider>
      <View style={styles.container}>
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
          {loading ? <ActivityIndicator color={"#9EDAFF"} size={'large'} style={{marginTop: '20%'}}/> : theme == null ?
          <>
          <ThemeHeader video={false} text={my ? "My Themes" : purchased ? "Collected Themes" : "Get Themes"
          } backButton={true}/> 
          <Divider borderWidth={0.4} borderColor={modeTheme.color}/>

          <View style={styles.notAvailable}>

            <Text style={styles.notAvailableText}>Sorry, Theme is not available</Text>
          </View>
          </> :
          <>
          <View>
              <ThemeHeader text={my ? "My Themes" : purchased ? "Collected Themes" : "Get Themes"
          } video={false} backButton={true}/>
          </View>
          <Divider />
          <Text numberOfLines={1} style={styles.header}>{name}</Text>
          {profile.userName ? <Text numberOfLines={1} style={[styles.header, {fontFamily: 'Montserrat_500Medium', paddingTop: 0, fontSize: 15.36, marginTop: 0}]}>Created by @{profile.userName}</Text> : null}
          <View style={styles.imageContainerContainer}>
          <View style={styles.imageContainer}>
            <FastImage source={{uri: theme, priority: 'normal'}} style={styles.image}/>
          </View>
          <View style={styles.overlay}>
            {applyLoading ? <ActivityIndicator color={"#9EDAFF"}/> : <>
            <TouchableOpacity style={styles.previewButton} onPress={() => navigation.navigate('ViewingProfile', {previewImage: theme, preview: true, name: user.uid, viewing: true})}>
              <Text style={styles.previewText}>Preview w/ Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewButton} onPress={() => navigation.navigate('HomeScreenPreview', {source: theme, bought: true, name: user.uid})}>
              <Text style={styles.previewText}>Preview w/ Posts</Text>
            </TouchableOpacity>
            {profile.themeIds && (profile.themeIds.includes(productId) || profile.themeIds.includes(myId)) ?  <>
              <TouchableOpacity style={styles.previewButton} onPress={() => {handleApply(true, false, false)}}>
              <Text style={styles.previewText}>Apply to Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewButton} onPress={() => handleApply(false, true, false)}>
              <Text style={styles.previewText}>Apply to Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewButton} onPress={() => handleApply(false, false, true)}>
              <Text style={styles.previewText}>Apply to Both Profile & Posts</Text>
            </TouchableOpacity>
            </> : null
          }
          </>}
          </View>
          {themeLoading ? <ActivityIndicator color={"#9EDAFF"} style={{alignItems: 'center'}}/> : 
          profile.themeIds && (profile.themeIds.includes(productId) || profile.themeIds.includes(myId)) ? <Text style={styles.header}>You have this theme!</Text> : <View style={styles.purchaseButton}>
              <NextButton text={'Get Theme for FREE'} onPress={() => freeTheme()}/>
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
      backgroundColor: "#121212"
    },
    header: {
      padding: 10,
      color: "#fafafa",
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
    imageContainerContainer: {
      alignItems: 'center', 
      justifyContent:'center' 
    },
    imageContainer: {
      borderWidth: 1,
      padding: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: '5%',
      marginRight: '5%',
      borderColor: "#fafafa"
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
      backgroundColor: "#121212",
      marginBottom: 10,
      borderRadius: 8,
      width: '90%',
      alignItems: 'center'
    },
    previewText: {
      fontSize: 15.36,
      color: "#9EDAFF",
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
    notAvailable: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center'
    },
    notAvailableText: {
      fontSize: 19.20, 
      fontFamily: 'Montserrat_500Medium', 
      color: "#fafafa"
    }
})