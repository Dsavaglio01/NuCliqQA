import { StyleSheet, Text, View, ImageBackground, Platform, TouchableWithoutFeedback, TextInput, Keyboard, TouchableOpacity, Alert, Modal } from 'react-native'
import React, {useState, useRef, useEffect, useContext} from 'react'
import useAuth from '../Hooks/useAuth';
import RegisterHeader from '../Components/RegisterHeader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import InputBox from '../Components/InputBox';
import { updateDoc, doc } from 'firebase/firestore';
import NextButton from '../Components/NextButton';
import {MaterialCommunityIcons} from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import { getAuth, sendSignInLinkToEmail, fetchSignInMethodsForEmail, signInWithEmailAndPassword, onAuthStateChanged, isSignInWithEmailLink, signInWithEmailLink} from 'firebase/auth';
import {BACKEND_URL} from "@env"
import { useFonts, Montserrat_400Regular, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications'
import { db } from '../firebase';
import themeContext from '../lib/themeContext';
const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const auth = getAuth();
  const [password, setPassword] = useState('');
  const theme = useContext(themeContext)
  const [code, setCode] = useState(null);
  const [actualCode, setActualCode] = useState(null);
  const [error, setError] = useState(null);
  const[catpchaTries, setCaptchaTries] = useState(0);
  const notificationListener = useRef();
  const [isEditable, setIsEditable] = useState(true);
  const responseListener = useRef();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [randomNumberOne, setRandomNumberOne] = useState(Math.floor(Math.random() * 1000000) + 1);
  const [captchaHolder, setCaptchaHolder] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [textInputHolder, setTextInputHolder] = useState(0);
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false)
  const [captchaMatched, setCaptchaMatched] = useState(false);
  const [noCaptcha, setNoCaptcha] = useState(false);
  const [success, setSuccess] = useState(false);
  const {user} = useAuth();
  const [url, setUrl] = useState(null);
  const handleOpenURL = Linking.addEventListener('url', ({ url }) => {
    setUrl(url)
  //console.log('App link received:', url);
  // Parse the deep link URL and handle accordingly
  // (e.g., navigate to a specific screen)
})
  function interpretError(message) {
    //console.log(message)
    if (message.includes('(auth/invalid-phone-number)')) {
      //return 'Invalid Format. Please Try Again.'
      Alert.alert('Invalid Format', 'Please Put Phone # in Correct Format: "+1 999 999 9999"', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/code-expired')) {
      Alert.alert('Verification Code Expired', 'Please Press Button to Resend New Code', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/missing-phone-number')) {
      Alert.alert('Missing Phone Number', 'Please Put Phone Number', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/user-disabled')) {
      //console.log('first')
      Alert.alert('Your Account has Been Disabled/Banned.', 'Please Create a new one', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/maximum-second-factor-count-exceeded')) {
      Alert.alert('You Tried to Sign up too Many Times', 'Please Try Again Later', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/captcha-check-failed')) {
      Alert.alert('Re-Captcha Check Failed', 'Please Try Again', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/second-factor-already-in-use')) {
      Alert.alert('Two-Factor Authentication Already Running', 'Please Close Alert to Continue', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/too-many-requests')) {
      Alert.alert('Too Many Attempts', 'Please Try Again Later', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/unsupported-first-factor')) {
      Alert.alert('Email or Phone Number is not Supported', 'Please Try Again', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/unverified-email')) {
      Alert.alert('Email Not Verified', 'Please Try Again', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/invalid-verification-code')) {
      Alert.alert('Invalid Verification Code', 'Please Try Again', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/invalid-email')) {
      Alert.alert('Invalid Email', 'Please Use a Valid Email', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/invalid-credential')) {
      Alert.alert('Invalid Credential', 'Please Try Again', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/invalid-verification-id')) {
      Alert.alert('Invalid Verification ID', 'Please Try Again', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/missing-verification-id')) {
      Alert.alert('Missing Verification ID', 'Please Try Again', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/account-exists-with-different-credential')) {
      Alert.alert('Account Exists With Different Credential/Credentials', 'Please Try Again', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/weak-password')) {
      Alert.alert('Weak Password', 'Every Password Should Contain at Least 6 Characters', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/user-signed-out')) {
      Alert.alert('User Signed Out', 'Please Use LOGIN button to Log Back in', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/user-not-found')) {
      Alert.alert('User Not Found', 'Please Sign up to Create an Account or Use a Different Credential.', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/null-user')) {
      Alert.alert('No User Signed in', 'Please Sign up or Log in', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('user-cancelled')) {
      Alert.alert('User Cancelled Operation', 'Please Try Again', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/popup-closed-by-user')) {
      Alert.alert('User Cancelled Operation', 'Please Try Again', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/wrong-password')) {
      Alert.alert('Wrong Password', 'Please Try Again', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/missing-multi-factor-info')) {
      Alert.alert('Missing Two Factor Information', 'Please Try Again', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/credential-already-in-use')) {
      Alert.alert('Credential Already in Use', 'Please Log in to Existing Account', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/requires-recent-login')) {
      Alert.alert('Credential Too Old', 'Please Log Back in Again', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/email-change-needs-verification')) {
      Alert.alert('Email Change Needs Verification', 'Please Verify Email Change', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else if (message.includes('auth/email-already-in-use')) {
      Alert.alert('Email Already in Use', 'Please Log Back in With That Email', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
    else {
      Alert.alert('Unknown Error Occurred.', 'Please Try Again', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
  }
  const handleLogin = async(email) => {
    //setLoading(true);
    //console.log(email)
    try {
    // Use fetchSignInMethodsForEmail method to check if email already exists
    //const signInMethods = await auth.fetchSignInMethodsForEmail(email);
    const signInMethods = await fetchSignInMethodsForEmail(auth, email)
    // If signInMethods is not empty, email exists
    if (signInMethods && signInMethods.length > 0) {
      try {
        const actionCodeSettings = {
          url: 'https://nucliq-c6d24.firebaseapp.com/', // Replace with your app's URL
          handleCodeInApp: true, // Handle the sign-in completion in the app
          iOS: {
            bundleId: 'com.drstem369.NuCliqV1'
          },
        };

        await sendSignInLinkToEmail(auth, email, actionCodeSettings)
        setSuccess(true)
      } catch (error) {
        console.log('first')
        interpretError(error.code)
      }
    } else {
      Alert.alert('Email Invalid', 'Please log back in with an email attached to your account', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
    }
  } catch (error) {
    interpretError(error.code)
  }
        
  }
  const getData = (user) => {
       registerForPushNotificationsAsync().then(async(token) => {
        console.log(token)
              await updateDoc(doc(db, 'profiles', user.user.uid), {
                notificationToken: token
              })
            })
      
    }
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

  return token;
}
  useEffect(() => {
    if (url != null && url != undefined) {
      const httpsMatch = url.match(/https:\/\/[^ ]+/);

      // Extract the HTTPS part from the match
      const httpsPart = httpsMatch ? httpsMatch[0] : null;

      console.log(httpsPart); 
      try {
        signInWithEmailLink(auth, email, httpsPart).then((user) => getData(user))
      }
      catch (error) {
        console.error(error)
      }
      
    }
  }, [url])
  const generateCaptcha = () => {
    var numberOne = Math.floor(Math.random() * 1000000) + 1;   
    var captchaCode = numberOne ;
    setRandomNumberOne(numberOne)
    setCaptchaHolder(captchaCode)
  }
  const validateCaptchaCode = () => {
    if (catpchaTries < 4) {
      var temp = randomNumberOne ;
    setCaptchaTries(catpchaTries + 1)
    if (textInputHolder == temp) {
      //Captcha match
      handleLogin(email, password)
      setCaptchaMatched(true)
      setModalVisible(false)
    }
    else {
      //Captcha not match
      Alert.alert("Captcha NOT Matched");
      setCaptchaMatched(false)
    }
    // Calling captcha function, to generate captcha code
    generateCaptcha();
    }
    else {
      Alert.alert("Too many tries for Captcha, please try again later.")
      setNoCaptcha(true)
    }
    
  }
  function sendPhoneNumber() {
    fetch(`${BACKEND_URL}/api/phoneNumber`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({phoneNumber: `1${phoneNumber.replace(/\D/g, '')}`})
      }).then(response => response.json())
        .then(responseData => {
          // Handle the response from the server
          console.log(responseData)
          setActualCode(responseData.code)
        })
        .catch(error => {
          // Handle any errors that occur during the request
          console.error(error);
        }).then(() => setModalVisible(true))
   } 
   const formatPhoneNumber = (inputNumber) => {
    // Remove non-numeric characters from the input
    const cleanedNumber = inputNumber.replace(/\D/g, '');

    // Apply the desired formatting (e.g., XXX-XXX-XXXX)
    const formattedNumber = cleanedNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

    return formattedNumber;
  };
   function handlePhoneNumberChange(input) {
    const formattedNumber = formatPhoneNumber(input);
    setPhoneNumber(formattedNumber);
   }
   function sendVerificationCode() {
      fetch(`${BACKEND_URL}/api/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({code: code, request_id: actualCode})
      }).then(response => response.json())
        .then(responseData => {
          console.log(responseData)
          // Handle the response from the server
          if (responseData.resp.status == '0') {
            setModalVisible(false)
            setSuccess(true)
            handleLogin(email, password)
          }
          else {
            setModalVisible(false)
            setCode('')
            setActualCode(null)
          }
        })
        .catch(error => {
          // Handle any errors that occur during the request
          throw error
        })
   }
   const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_400Regular
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <ImageBackground style={styles.logIncontainer} source={require('../assets/background2.jpg')} resizeMode="cover">
        <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => {setModalVisible(!modalVisible); }}>
          <View style={[styles.modalContainer, styles.overlay]}>
          <View style={styles.modalView}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <>
            <MaterialCommunityIcons name='close' color={theme.color}  size={30} style={{textAlign: 'right', marginRight: -20}} onPress={() => setModalVisible(false)}/>
            
             <View style={styles.Container}>

              <View style={styles.captchaContainerView}>

                <Text style={{fontSize: 15.36, padding: 10, textAlign: 'center', fontFamily: 'Montserrat_500Medium'}}>Please enter code sent to messages below in text field to verify</Text>
                <View  style={ styles.captchaChildContainer}>
                  <TextInput
                    placeholder="Enter Code"
                    onChangeText={data => setCode(data)}
                    style={styles.textInputStyle}
                    underlineColorAndroid='transparent'
                  />
                </View>
              </View>

              <NextButton text={"SUBMIT"} onPress={() => sendVerificationCode()}/>

            </View>
            </>
            </TouchableWithoutFeedback>
          </View>
          </View>
        </Modal>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>  
        <View style={[styles.main, {backgroundColor: theme.backgroundColor}]}>
            <RegisterHeader onPress={() => navigation.navigate('FirstLogin')} login={true} colorOne={{borderColor: '#3286ac'}}/>
            <View style={{marginLeft: '5%', marginRight: '5%', marginTop: '10%'}}>
                <InputBox text={'Email Address'} icon='email' onChangeText={setEmail} keyType={'done'} value={email}/>
              
                {/* <InputBox text={'Password'} icon='lock-outline' onChangeText={setPassword} keyType={'done'} value={password} password={true}
                secondIcon={true} secondIconName={'eye-off-outline'} containerStyle={{marginTop: '5%'}}/>    */}  
                {/* <InputBox text={password.length > 0 && showPassword == true ? password : password.length > 0 && showPassword == false ? '*'.repeat(password.length) : 'Password'}
                password={!showPassword ? true : false} value={password} inputStyle={{width: '90%'}} onChangeText={setPassword} secondIcon={true} secondIconName={showPassword ? 'eye-outline' : 'eye-off-outline'}
                secondOnPress={showPassword ? () => setShowPassword(false) : () => setShowPassword(true)} containerStyle={{marginTop: '5%'}} icon={'lock-outline'}/>    */}   
                {/* <TouchableOpacity style={{marginLeft: 'auto'}} onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.loginagreed}>Forgot Password?</Text>
                </TouchableOpacity> */}
                {/* <InputBox text={phoneNumber.length > 0 ? phoneNumber : '215-123-1234'} keyboardType={'phone-pad'} icon={'phone-outline'} password={false} value={phoneNumber} onChangeText={handlePhoneNumberChange} /> */}
                
                <Text style={[styles.loginagreed, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>By continuing, you agree to our <Text style={{textDecorationLine:'underline'}} onPress={() => navigation.navigate('TandC')}>
                        Terms and Conditions</Text> and acknowledge that you understand the <Text style={{textDecorationLine: 'underline'}} 
                        onPress={() => navigation.navigate('PrivacyPolicy')}>Privacy Policy</Text> and the <Text style={{textDecorationLine:'underline'}} onPress={() => navigation.navigate('DataPolicy')}>
                        Data Usage Policy</Text>and <Text style={{textDecorationLine:'underline'}} onPress={() => navigation.navigate('DataRetentionPolicy')}>Data Retention Policy</Text></Text>
                <View style={{marginTop: '5%', marginVertical: '5%'}}>
                  {!success ? 
                    <NextButton text={'Verify Email to Log in'} onPress={email.length == 0 ? () => Alert.alert('No Email', 'Valid Email must be present to login to account', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? () => handleLogin(email) : () => Alert.alert('Invalid Email', 'Please enter a valid email address')}/> : 
      <Text style={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium', color: theme.color}}>An email has been sent to {email}. Click on the link provided to log in.</Text>}
                </View>
            </View>
        </View>
        </TouchableWithoutFeedback>
    </ImageBackground>
  )
}

export default Login

const styles = StyleSheet.create({
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
    logIncontainer: {
      flex: 1,
      alignItems: 'center',
        justifyContent: 'center'
  },
  mainHeader: {
        backgroundColor: "#27293d",
        borderRadius: 8,
        width: '75%',
        marginTop: '7.5%',
        marginLeft: '1.5%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginagreed: {
      textAlign: 'left',
        padding: 30,
        paddingTop: '7.5%',
        paddingBottom: 10,
        fontFamily: 'Montserrat_400Regular',
        fontSize: 12.29, 
        color:'#005278',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
  modalView: {
    width: '90%',
    height: '50%',
    //margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
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
  Container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
    captchaContainerView: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  captchaChildContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textInputStyle: {
    textAlign: 'center',
    height: 40,
    width: '90%',
    borderWidth: 1,
    borderColor: '#005278',
    borderRadius: 7,
  },
  button: {
    width: '80%',
    paddingTop: 2,
    paddingBottom: 2,
    backgroundColor: '#005278',
    borderRadius: 3,
    marginTop: 20
  },
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
})