import { StyleSheet, Text, TextInput, View, AppState, Platform, ImageBackground, Modal, TouchableOpacity, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert} from 'react-native'
import React, {useState, useRef, useEffect, useContext} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
import InputBox from '../Components/InputBox'
import { updateDoc, doc, getFirestore, serverTimestamp, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import Skip from '../Components/Skip'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import useAuth from '../Hooks/useAuth'
import axios from 'axios'
import {MODERATION_API_USER, MODERATION_API_SECRET, TEXT_MODERATION_URL, BACKEND_URL} from "@env"
import * as Notifications from 'expo-notifications';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
const BioScreen = ({route}) => {
    const navigation = useNavigation();
    const [bio, setBio] = useState('');

    const notificationListener = useRef();
    const theme = useContext(themeContext)
    const [errorPersonalUserName, setErrorPersonalUserName] = useState(false);
    const [errorMisleadingUserName, setErrorMisleadingUserName] = useState(false);
    const [errorLinkUserName, setErrorLinkUserName] = useState(false);
    const [errorProfanityUserName, setErrorProfanityUserName] = useState(false);
    const {firstName, lastName, userName, age, pfp} = route.params;
    const [bioModalVisible, setBioModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const {user, deleteAccount} = useAuth()
    const responseListener = useRef();
    const updateCurrentUser = () => {
        setErrorLinkUserName(false)
        setErrorMisleadingUserName(false)
        setErrorPersonalUserName(false)
        setErrorProfanityUserName(false)
        try {
          
        data = new FormData();
        data.append('text', bio);
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
                    linkUsernameAlert()
                }
               else if (response.data.personal.matches.length > 0) {
                    personalUsernameAlert()
                }
                else if (response.data.profanity.matches.length > 0 && response.data.profanity.matches.some(obj => obj.intensity === 'high')) {
                  
                    profanityUsernameAlert()
                
                }
                
                else {
                 // Alert.alert('Working', 'Working')
                   getData()
                }
                //console.log(data)
            }
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
    const linkUsernameAlert = () => {
      setErrorLinkUserName(true)
    }
    const personalUsernameAlert = () => {
      setErrorPersonalUserName(true)
    }
    const profanityUsernameAlert = () => {
      setErrorProfanityUserName(true)
    }
    function createSearchKeywordsWithHybridTokenization(field, limit) {
  // Regular expression to match emojis
  const emojiRegex = /([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{200D}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F9C0}]|[\u{1F9D0}-\u{1F9FF}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F004}]|[\u{1F004}])/gu;

  // Remove emojis from the input field
  const sanitizedField = field.replace(emojiRegex, '');

  const words = sanitizedField.split(',').map(word => word.trim());
  const shortTokens = new Set();
  const longTokens = new Set();
  let shortCount = 0;
  let longCount = 0;

  // 1. Add whole words to longTokens
  for (const word of words) {
    if (longCount < limit) {
      longTokens.add(word);
      longCount++;
    }
  }

  // 2. Generate n-grams and include edge n-grams in shortTokens
  const minNgramLength = 3;
  const maxEdgeNgramLength = 3; // Adjust as needed
  for (const word of words) {
    for (let n = word.length; n >= 1 && (shortCount < limit || longCount < limit); n--) {
      // Edge n-grams (prefixes) up to maxEdgeNgramLength
      if (n <= maxEdgeNgramLength && shortCount < limit) {
        const edgeNgram = word.substring(0, n);
        shortTokens.add(edgeNgram);
        shortCount++;
      }

      // Regular n-grams
      for (let i = 0; i <= word.length - n && (shortCount < limit || longCount < limit); i++) {
        const ngram = word.substring(i, i + n);
        if (n <= 3 && shortCount < limit) {
          shortTokens.add(ngram);
          shortCount++;
        } else if (n >= 4 && longCount < limit) {
          longTokens.add(ngram);
          longCount++;
        }
      }
    }

    if (shortCount >= limit && longCount >= limit) break;
  }

  return [Array.from(shortTokens), Array.from(longTokens)];
}

    function createAccount(token) {
      const combinedField = `${userName.toLowerCase().trim()}, ${firstName.toLowerCase().trim()}, ${lastName.toLowerCase().trim()}`
      const searchKeywords = createSearchKeywordsWithHybridTokenization(combinedField, 30);
      setLoading(true)
      setTimeout(async() => {
        //let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/createAccount'
    try {
    const response = await fetch(`${BACKEND_URL}/api/createAccount`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {firstName: firstName, lastName: lastName, bio: bio, age: age, pfp: pfp, token: token, user: user.uid, userName: userName, smallKeywords: searchKeywords[0], largeKeywords: searchKeywords[1]}}), // Send data as needed
    })
    const data = await response.json();
      if (data.done) {
        navigation.navigate('Themes', {screen: 'All', params: { registers: true, group: null, groupId: null, name: null, goToMy: false}})
      }
  } catch (error) {
    console.error('Error:', error);
  }
         
      }, 1000);
  }

  //
  async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      //alert('Failed to get push token for push notification!');
      token = null;
      return token;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);

  return token;
}
  const getData = async() => {
        registerForPushNotificationsAsync().then(async(token) => createAccount(token));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          console.log(notification)
          //setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log(response);
        });

        return () => {
          Notifications.removeNotificationSubscription(notificationListener.current);
          Notifications.removeNotificationSubscription(responseListener.current);
        };
      
    }
    const handleBio = (inputText) => {
    const sanitizedText = inputText.replace(/\n/g, ''); // Remove all new line characters
    setBio(sanitizedText);
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
    Montserrat_600SemiBold,
    Montserrat_400Regular
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover" >
       
        <View style={[styles.main, {backgroundColor: theme.backgroundColor}]}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View>
             <RegisterHeader onPress={() => navigation.goBack()} colorSix={styles.barColor} colorOne={styles.barColor} colorTwo={styles.barColor} colorThree={styles.barColor} colorFour={styles.barColor} colorFive={styles.barColor}/>
            <Text style={[styles.headerText, {color: theme.color}]}>Bio</Text>
            <Text style={[styles.supplementaryText, {color: theme.color}]}>Tell People About Yourself</Text>
            <View style={{marginTop: '5%'}}>
                <InputBox text={'Bio'} onChangeText={handleBio} key={handleKeyPress} multiline={true} containerStyle={errorPersonalUserName || errorLinkUserName || errorMisleadingUserName || errorProfanityUserName ? [styles.inputContainer, {borderColor: 'red', backgroundColor: theme.backgroundColor}] : [styles.inputContainer, {backgroundColor: theme.backgroundColor}]}
                maxLength={200} value={bio}/>
                {errorLinkUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium',}]}>Bio must not contain link(s)</Text> :
                errorMisleadingUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium',}]}>Bio must not be misleading</Text> : errorPersonalUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium',}]}>Bio must not contain personal information</Text> : 
                errorProfanityUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium',}]}>Bio must not contain profanity</Text> : null}
            </View>
            <Text style={{textAlign: 'right', padding: 15, color: theme.color}}>{bio.length}/200</Text>
            {loading ? <View style={styles.noDataContainer}>
        <ActivityIndicator size={'large'} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View> : 
            <View style={{marginTop: '10%', marginLeft: '5%', marginRight: '5%'}}>
                <NextButton text={'Finish and Create Account'} onPress={bio.length > 0 ? () => updateCurrentUser() : () => getData()} />
                  {bio.length == 0 ? 
                <Skip bio={true} onPress={() => getData()}/> : null}
            </View> }
            </View>
            </TouchableWithoutFeedback>
            
        </View>
    </ImageBackground>
  )
}

export default BioScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_600SemiBold',
        padding: 25,
        fontWeight: '600',
        paddingBottom: 0
    },
    supplementaryText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 25,
        paddingBottom: 0,
        paddingTop: 10
    },
    input: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_400Regular',
        padding: 12,
        color: "#000",
    },
    textinput: {
        paddingTop: 20,
        padding: 20,
        fontSize: 15.36,
        fontFamily: 'Montserrat_600SemiBold',
        width: '110%',
        //height: '50%'
    },
  modalView: {
    width: '90%',
    height: '50%',
    //margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    paddingRight: 0,
    paddingTop: 5,
    //paddingBottom: 20,
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
    barColor: {
        borderColor: '#3286ac'
    },
    inputContainer: {
        borderRadius: 9,
        borderWidth: 1,
        width: '90%',
        height: 150,
        marginLeft: '5%',
        //width: '95%',
        //marginLeft: '5%',
        flexDirection: 'row',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '40%'
    },
})  