import { StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, ImageBackground, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView} from 'react-native'
import React, {useState, useEffect, useRoute, useContext} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import InputBox from '../Components/InputBox'
import { auth, db } from '../firebase'
import NextButton from '../Components/NextButton'
import { onSnapshot, collection, query, getDoc, where, or, doc, getDocs } from 'firebase/firestore'
import axios from 'axios'
import {MODERATION_API_USER, MODERATION_API_SECRET, TEXT_MODERATION_URL} from "@env"
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
import useAuth from '../Hooks/useAuth'
import { deleteUser } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
const NameScreen = () => {
    const emojiRegex = /([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{200D}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F9C0}]|[\u{1F9D0}-\u{1F9FF}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F004}]|[\u{1F004}])/gu;
    const navigation = useNavigation();
    const [firstName, setFirstName] = useState('');
    const theme = useContext(themeContext)

    
    const [loading, setLoading] = useState(true);
    const [errorFirstName, setErrorFirstName] = useState(false);
    const [errorSpaceUserName, setErrorSpaceUserName] = useState(false);
    const [errorCliqName, setErrorCliqName] = useState(false);
    const [lastName, setLastName] = useState('');
    const [userName, setUserName] = useState('');
    const [UsernameAvailability, setUsernameAvailability] = useState(false);
    const [errorUserName, setErrorUserName] = useState(false);
    const [errorPersonalUserName, setErrorPersonalUserName] = useState(false);
    const [errorMisleadingUserName, setErrorMisleadingUserName] = useState(false);
    const [errorLinkUserName, setErrorLinkUserName] = useState(false);
    const [errorProfanityUserName, setErrorProfanityUserName] = useState(false);
    const [errorPersonalFirstName, setErrorPersonalFirstName] = useState(false);
    const [errorMisleadingFirstName, setErrorMisleadingFirstName] = useState(false);
    const [errorLinkFirstName, setErrorLinkFirstName] = useState(false);
    const [errorProfanityFirstName, setErrorProfanityFirstName] = useState(false);
    const [errorPersonalLastName, setErrorPersonalLastName] = useState(false);
    const [errorMisleadingLastName, setErrorMisleadingLastName] = useState(false);
    const [errorLinkLastName, setErrorLinkLastName] = useState(false);
    const [errorProfanityLastName, setErrorProfanityLastName] = useState(false);
    const [errorExistsUserName, setErrorExistsUserName] = useState(false);
    //console.log(usernames)
    const {user} = useAuth(); 
    useEffect(() => {
      const getData = async() => {
        const keys = await AsyncStorage.getAllKeys()
       // console.log(keys)
        const appleName = JSON.parse(await AsyncStorage.getItem('FULL_NAME_STORAGE_KEY'))
        //console.log(appleName)
        if (appleName) {
          //console.log('b')
          //console.log(appleName.givenName)
          setFirstName(appleName.givenName)
          setLastName(appleName.familyName)
        }
      }
      getData()
      //setFirstName(user.ui)
    }, [])
    //console.log(firstName)
    const checkUsernameAvailability = async () => {
    if (!userName) return; // Don't check if username is empty

    try {
      
      const docSnapshot = await getDocs(query(collection(db, 'usernames'), where('username', '==', userName.toLowerCase())))
      //docSnapshot // Update availability based on doc existence
      if (docSnapshot.docs.length > 0) {
        docSnapshot.forEach((e) => {
        if (e.exists()) {
          console.log(e.id)
          setUsernameAvailability(true)
        }
        else {
          console.log('second')
          setUsernameAvailability(false)
        }
      })
      }
      else {
        setUsernameAvailability(false)
      }
      
    } catch (error) {
      console.error('Error checking username availability:', error);
      setUsernameAvailability(null); // Reset availability on error
    }
  };
  //console.log(UsernameAvailability)
    useEffect(() => {
    const timeoutId = setTimeout(checkUsernameAvailability, 100); // Debounce check (optional)
    return () => clearTimeout(timeoutId); // Cleanup on unmount
  }, [userName]);
    const checkCurrentUser = async() => {
      //console.log(firstName.length)
      setErrorFirstName(false)
      setErrorUserName(false)
      setErrorExistsUserName(false)
      setErrorLinkUserName(false)
      setErrorMisleadingUserName(false)
      setErrorPersonalUserName(false)
      setErrorProfanityUserName(false)
      setErrorLinkFirstName(false)
      setErrorMisleadingFirstName(false)
      setErrorPersonalFirstName(false)
      setErrorProfanityFirstName(false)
      setErrorLinkLastName(false)
      setErrorMisleadingLastName(false)
      setErrorPersonalLastName(false)
      setErrorProfanityLastName(false)
      setErrorSpaceUserName(false)
      setErrorCliqName(false)
      if (firstName.trim().length == 0) {
                   firstNameAlert();
                }
      if (userName.trim().length == 0) {
        usernameAlert();
      } 
      if (userName.includes(' ')) {
        usernameSpaceAlert();
      }
      if (userName.toLowerCase().includes('nucliq')) {
        userNameCliqAlert()
      }
      if (UsernameAvailability) {
        return;
      }
      /* if (usernames.includes(userName.toLowerCase()) || usernames.includes(userName)) {
        userNameExistsAlert();
      } */
      else { 

        try {
          data = new FormData();
        data.append('text', firstName);
        data.append('lang', 'en');
        data.append('mode', 'rules');
        data.append('api_user', `${MODERATION_API_USER}`);
        data.append('api_secret', `${MODERATION_API_SECRET}`);
        //console.log(data)
        axios({
          url: `${TEXT_MODERATION_URL}`,
          method:'post',
          data: data,
          //headers: data.getHeaders()
        })
        .then(function (response) {
          
          if (response.data) {
                if (response.data.link.matches.length > 0) {
                    linkFirstnameAlert()
                }
               else if (response.data.personal.matches.length > 0) {
                    personalFirstnameAlert()
                }

                else if (response.data.profanity.matches.length > 0 && response.data.profanity.matches.some(obj => obj.intensity === 'high')) {
                  
                    profanityUsernameAlert()
                
                }
                
                else {
                    data = new FormData();
                  data.append('text', userName);
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
                  .then(function (response) {
                    
                    if (response.data) {
                          if (response.data.link.matches.length > 0) {
                              linkUsernameAlert()
                          }
                          else if (response.data.misleading.matches.length > 0) {
                              misleadingUsernameAlert()
                          }
                        else if (response.data.personal.matches.length > 0) {
                              personalUsernameAlert()
                          }
                          else if (response.data.profanity.matches.length > 0 && response.data.profanity.matches.some(obj => obj.intensity === 'high')) {
                  
                    profanityUsernameAlert()
                
                }
                          
                          else {
                              if (lastName.trim().length==0 || lastName == undefined || lastName == null) {
                                navigation.navigate('Age', {firstName: firstName, lastName: lastName, userName: userName})
                              }
                              else {
                                data = new FormData();
                                data.append('text', lastName);
                                data.append('lang', 'en');
                                data.append('mode', 'rules');
                                data.append('api_user', `${MODERATION_API_USER}`);
                                data.append('api_secret', `${MODERATION_API_SECRET}`);
                                //console.log(data)
                                axios({
                                  url: `${TEXT_MODERATION_URL}`,
                                  method:'post',
                                  data: data,
                                  //headers: data.getHeaders()
                                })
                                .then(function (response) {
                                  
                                  if (response.data) {
                                        if (response.data.link.matches.length > 0) {
                                            linkLastnameAlert()
                                        }
                                      else if (response.data.personal.matches.length > 0) {
                                            personalLastnameAlert()
                                        }
                                        else if (response.data.profanity.matches.length > 0 && response.data.profanity.matches.some(obj => obj.intensity === 'high')) {
                  
                    profanityUsernameAlert()
                
                }
                                        
                                        else {
                                          if (UsernameAvailability || firstName.trim().length == 0 || userName.trim().length == 0 || userName.includes(' ') || userName.toLowerCase().includes('nucliq')) {
                                            null
                                          }
                                          else {
                                             navigation.navigate('Age', {firstName: firstName, lastName: lastName, userName: userName})
                                          }
                                           
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
    const handleInputChange = (text) => {
      const sanitizedText = text.replace(emojiRegex, '');
      setUserName(sanitizedText);
    };
    const deleteAccount = async() => {
      Alert.alert('Exit Sign Up?', 'All information provided will be deleted if you exit.', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel', 
      },
      {text: 'OK', onPress: () => deleteUser(user).catch((error) => {
        if (error.message.includes('requires-recent-login')) {
          Alert.alert('Requires recent login', 'Please make account, log out and log back in again to delete account.');
        }

      }).then(() => {
        navigation.navigate('FirstLogin')
      })
    }
    ])
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
    const linkFirstnameAlert = () => {
      setErrorLinkFirstName(true)
    }
    const misleadingFirstnameAlert = () => {
      setErrorMisleadingFirstName(true)
    }
    const personalFirstnameAlert = () => {
      setErrorPersonalFirstName(true)
    }
    const profanityFirstnameAlert = () => {
      setErrorProfanityFirstName(true)
    }
    const linkLastnameAlert = () => {
      setErrorLinkLastName(true)
    }
    const misleadingLastnameAlert = () => {
      setErrorMisleadingLastName(true)
    }
    const personalLastnameAlert = () => {
      setErrorPersonalLastName(true)
    }
    const profanityLastnameAlert = () => {
      setErrorProfanityLastName(true)
    }
    const firstNameAlert = () => {
      setErrorFirstName(true)
    }
    const usernameAlert = () => {
      setErrorUserName(true)
    }
    const userNameExistsAlert = () => {
      setErrorExistsUserName(true)
    }
    const usernameSpaceAlert = () => {
      setErrorSpaceUserName(true)
    }
    const userNameCliqAlert = () => {
      setErrorCliqName(true)
    }
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_400Regular
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  //console.log(errorFirstName)
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView style={[styles.main, {backgroundColor: theme.backgroundColor}]}>
          <RegisterHeader onPress={() => deleteAccount()} colorOne={{borderColor: '#3286ac'}} colorTwo={{borderColor: '#3286ac'}}/>
            <Text style={[styles.addText, {color: theme.color}]}>Name</Text>
            <Text style={[styles.supplementaryText, {color: theme.color}]}>This Will be Displayed on Your Profile and is Required</Text>
            <View style={{marginTop: '5%'}}>
                <InputBox text={'First Name (Required)'} maxLength={100} containerStyle={errorFirstName ? [styles.inputContainer, {borderColor: 'red', backgroundColor: theme.backgroundColor}] : [styles.inputContainer, {backgroundColor: theme.backgroundColor}]} onChangeText={setFirstName} value={firstName} keyType={'done'}/>
                {errorFirstName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}]}>You must have a first name</Text> : null}
            </View>
             <Text style={[styles.characterCountText, {color: theme.color}]}>{firstName != undefined ? firstName.length : 0}/100</Text>
            <View style={{marginTop: '5%'}}>
               <InputBox text={'Last Name (Required)'} maxLength={100} onChangeText={setLastName} value={lastName} keyType={'done'}/>
            </View>
            <Text style={[styles.characterCountText, {color: theme.color}]}>{lastName != undefined ? lastName.length : 0}/100</Text>
            <Text style={[styles.unchange, {color: theme.color}]}>This Cannot be Changed!</Text>
            <View style={{marginTop: '1%'}}>
                <InputBox text={'Username/Handle'} maxLength={100} containerStyle={UsernameAvailability || errorUserName || errorExistsUserName || errorPersonalUserName || errorLinkUserName || errorMisleadingUserName || errorProfanityUserName ? [styles.inputContainer, {borderColor: 'red', backgroundColor: theme.backgroundColor}] : [styles.inputContainer, {backgroundColor: theme.backgroundColor}]} onChangeText={handleInputChange} value={userName} keyType={'done'}/>
                {UsernameAvailability ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}]}>Username must be unique</Text> : errorUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}]}>You must have a username</Text> : errorExistsUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}]}>Username already in use</Text>
                : errorLinkUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}]}>Username must not contain link(s)</Text> :
                errorMisleadingUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}]}>Username must not be misleading</Text> : errorPersonalUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}]}>Username must not contain personal information</Text> : 
                errorProfanityUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}]}>Username must not contain profanity</Text> : errorSpaceUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}]}>Username cannot have a space</Text> : errorCliqName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}]}>Username cannot include 'NuCliq'</Text>
                 : null}
            </View>
            <Text style={[styles.characterCountText, {color: theme.color}]}>{userName.length}/100</Text>
             
            <View style={{marginTop: '5%', marginLeft: '5%', marginRight: '5%'}}>
                <NextButton text={'Next'} onPress={checkCurrentUser}/>
            </View>
        </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
    </ImageBackground>
  )
}

export default NameScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    input: {
        fontSize: 15.36,
        padding: 12,
        alignSelf: 'center',
         fontFamily: 'Montserrat_400Regular',
        color: "#000",
        marginLeft: '10%'
    },
    supplementaryText: {
        fontSize: 15.36,
        padding: 25,
         fontFamily: 'Montserrat_500Medium',
        paddingBottom: 0,
        paddingTop: 10
    },
    barColor: {
        borderColor: '#3286ac'
    },
    addText: {
        fontSize: 19.20,
        padding: 25,
         fontFamily: 'Montserrat_600SemiBold',
        paddingBottom: 0
    },
    inputContainer: {
        borderRadius: 9,
        borderWidth: 1,
        width: '90%',
        marginLeft: '5%',
        //width: '95%',
        //marginLeft: '5%',
        flexDirection: 'row',
    },
    main: {
      borderRadius: 35,
      width: '90%',
      marginVertical: '15%',
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
    unchange: {
        fontSize: 12.29,
        color: '#172f48',
         fontFamily: 'Montserrat_500Medium',
        marginLeft: '7.5%',
        marginTop: '5%'
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
  characterCountText: {
      fontSize: 12.29,
      fontFamily: 'Montserrat_500Medium',
      paddingBottom: 0,
      padding: 10,
      textAlign: 'right',
      paddingRight: 0,
      marginRight: '7.5%'
    }
})