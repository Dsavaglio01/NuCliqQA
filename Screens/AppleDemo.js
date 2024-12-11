import { StyleSheet, Text, View, ImageBackground, Alert, TouchableOpacity, TextInput, Button, TouchableWithoutFeedback, Keyboard, Modal} from 'react-native'
import React, {useEffect, useState, useRef, useContext} from 'react'
import RegisterHeader from '../Components/RegisterHeader';
import InputBox from '../Components/InputBox';
import zxcvbn from 'zxcvbn';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import NextButton from '../Components/NextButton';
import ThemeHeader from '../Components/ThemeHeader';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {MaterialCommunityIcons} from '@expo/vector-icons'
import { getAuth, createUserWithEmailAndPassword, sendSignInLinkToEmail, signInWithEmailLink, fetchSignInMethodsForEmail, signInWithEmailAndPassword} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import {BACKEND_URL} from "@env"
import { useFonts, Montserrat_500Medium, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { firebase } from '@react-native-firebase/auth';
import themeContext from '../lib/themeContext';
const AppleDemo = () => {
  const recaptcha = useRef();
  const [email, setEmail] = useState('');
  const [randomNumberOne, setRandomNumberOne] = useState(Math.floor(Math.random() * 1000000) + 1);
  const [captchaHolder, setCaptchaHolder] = useState(0);
  const [textInputHolder, setTextInputHolder] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [actualCode, setActualCode] = useState(null)
  const [code, setCode] = useState(null);
  const [password, setPassword] = useState('');
  const attemptInvisibleVerification = false;
  const [captchaMatched, setCaptchaMatched] = useState(false);
  const [noCaptcha, setNoCaptcha] = useState(false);
  const [verificationScreen, setVerificationScreen] = useState(false);
  const[catpchaTries, setCaptchaTries] = useState(0);
  const theme = useContext(themeContext)
  const [showConfirmedPassword, setShowConfirmedPassword] = useState(false);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const auth = getAuth();
  const [success, setSuccess] = useState(false);
  const {user} = getAuth();
  const [url, setUrl] = useState(null);
  const handleOpenURL = Linking.addEventListener('url', ({ url }) => {
    setUrl(url)
})
  const renderStrengthBar = () => {
    const bars = Array.from({ length: 5 }, (_, index) => (
      <View
        key={index}
        style={[styles.bar, { backgroundColor: index < strength ? 'green' : 'lightgray' }]}
      />
    ));
      
    return (
      <View style={{height: 30}}> 
      <View style={styles.strengthBar}>{bars}</View>
      {strength == 1 ? <Text style={{fontSize: 12.29, paddingTop: 5, fontFamily: 'Montserrat_500Medium'}}>Very weak</Text> : strength == 2 ? <Text style={{fontSize: 12.29, paddingTop: 5, fontFamily: 'Montserrat_500Medium'}}>Weak</Text> : strength == 3 ? 
      <Text style={{fontSize: 12.29, paddingTop: 5, fontFamily: 'Montserrat_500Medium'}}>Average</Text> : strength == 4 ? <Text style={{fontSize: 12.29, paddingTop: 5, fontFamily: 'Montserrat_500Medium'}}>Strong</Text> : strength == 5 ?
    <Text style={{fontSize: 12.29, paddingTop: 5, fontFamily: 'Montserrat_500Medium'}}>Very strong</Text> : null}
    </View>
    )
    
  };
  Linking.addEventListener('url', async (event) => {
  const link = event.url;
  console.log(link)
  // Parse dynamic link and handle sign-in
  //await firebase.auth().signInWithEmailLink(email, link);
});
  /* const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_400Regular
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  } */
  const handleSignUp = (email, password) => {
    //setLoading(true);
    //console.log(email)
    signInWithEmailAndPassword(auth, email, password).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorCode)
      throw error
      // ...
    }).then(() => navigation.navigate('Home', {screen: 'Home', params: {newPost: false, post: null, hashtag: false}}))
        
  }
  //console.log(url)
  useEffect(() => {
    if (url != null && url != undefined) {
      const httpsMatch = url.match(/https:\/\/[^ ]+/);

      // Extract the HTTPS part from the match
      const httpsPart = httpsMatch ? httpsMatch[0] : null;

      console.log(httpsPart); 
      try {
        console.log(email, httpsPart)
        signInWithEmailLink(auth, email, httpsPart).then(() => navigation.navigate('Name'))
      }
      catch (error) {
        console.error(error)
      }
      
    }
  }, [url])
  useEffect(() => {
    if (user) {
      setEmail(user.email)
    }
  }, [user])
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
      Alert.alert('Your Account has Been Disabled.', 'Please Create a new one', [
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
  const generateCaptcha = () => {
    var numberOne = Math.floor(Math.random() * 1000000) + 1;   
    var captchaCode = numberOne ;
    setRandomNumberOne(numberOne)
    setCaptchaHolder(captchaCode)
  }
  const validateEmail = (email) => {
    // Regular expression for email validation
    //return emailRegex.test(email);
  };
  const validateCaptchaCode = () => {
    if (catpchaTries < 4) {
      var temp = randomNumberOne ;
    setCaptchaTries(catpchaTries + 1)
    if (textInputHolder == temp) {
      //Captcha match
      handleSignUp(email)
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
  const onVerify = token => {
        console.log('success!', token);
    }

    const onExpire = () => {
        console.warn('expired!');
    }
    const send = () => {
        console.log('send!');
        recaptcha.current.open()
    }
    function verifyEmail() {
      fetch(`${BACKEND_URL}/api/verifyEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email: email})
      }).then(response => response.json())
        .then(responseData => {
          // Handle the response from the server
          //setActualCode(responseData.)
          if (responseData) {
            setModalVisible(true)
          }
        })
        .catch(error => {
          // Handle any errors that occur during the request
          console.error(error);
        })
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

   function sendVerificationCode() {
      fetch(`${BACKEND_URL}/api/verifyCodeEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({code: code, email: email})
      }).then(response => response.json())
        .then(responseData => {
          //console.log(responseData)
          // Handle the response from the server
          if (responseData.status == 'approved' && responseData.valid) {
            setModalVisible(false)
            //setLoading(false)
            setSuccess(true)
            handleSignUp(email)
          }
          else {
            setModalVisible(false)
            setCode('')
            Alert.alert(`Code did not match.`)
          }
        })
        .catch(error => {
          // Handle any errors that occur during the request
          throw error
        })
   }
  return (
    <ImageBackground style={styles.signUpcontainer} source={require('../assets/background2.jpg')} resizeMode="cover">
        <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => {setModalVisible(!modalVisible); }}>
          <View style={[styles.modalContainer, styles.overlay]}>
          <View style={styles.modalView}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <>
            <MaterialCommunityIcons name='close' color={theme.color}  size={30} style={{textAlign: 'right', marginRight: -20}} onPress={() => setModalVisible(false)}/>
            
             <View style={styles.Container}>

              <View style={styles.captchaContainerView}>

                <Text style={{fontSize: 15.36, padding: 10, textAlign: 'center', fontFamily: 'Montserrat_500Medium'}}>Please enter code sent to email below in text field to verify</Text>
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
                <InputBox text={email.length > 0 ? email : 'Apple Username'} icon={'email-outline'} password={false} value={email} onChangeText={setEmail}/>
                {/* <View style={{marginTop: '5%'}}>
                    <InputBox text={password.length > 0 ? password : 'Apple Password'} icon={'lock-outline'} password={true} value={password} onChangeText={setPassword}/>
                </View> */}
                 <InputBox text={password.length > 0 && showConfirmedPassword == true ? password : password.length > 0 && showConfirmedPassword == false ? '*'.repeat(password.length) : 'Apple Password'}
                password={!showConfirmedPassword ? true : false} inputStyle={{width: '90%'}} value={password} onChangeText={setPassword} secondIcon={true} secondIconName={showConfirmedPassword ? 'eye-outline' : 'eye-off-outline'}
                secondOnPress={showConfirmedPassword ? () => setShowConfirmedPassword(false) : () => setShowConfirmedPassword(true)} containerStyle={{marginTop: '5%'}} icon={'lock-outline'}/>
                {/* <InputBox text={phoneNumber.length > 0 ? phoneNumber : '215-123-1234'} keyboardType={'phone-pad'} icon={'phone-outline'} password={false} value={phoneNumber} onChangeText={setPhoneNumber} containerStyle={{marginTop: '5%'}}/> */}
                <Text style={[styles.agreed, {color: theme.color}]}>By continuing, you agree to our <Text style={{textDecorationLine:'underline'}} onPress={() => navigation.navigate('TandC')}>
                        Terms and Conditions</Text> and acknowledge that you understand the <Text style={{textDecorationLine: 'underline'}} 
                        onPress={() => navigation.navigate('PrivacyPolicy')}>Privacy Policy</Text> and the <Text style={{textDecorationLine:'underline'}} onPress={() => navigation.navigate('DataPolicy')}>
                        Data Usage Policy</Text>and <Text style={{textDecorationLine:'underline'}} onPress={() => navigation.navigate('DataRetentionPolicy')}>Data Retention Policy</Text></Text>
                
                <View style={{marginHorizontal: '5%'}}>
                    {!success ? 
                    <NextButton text={'Log in'} onPress={email.length == 0 ? () => Alert.alert('No email', 'Valid Email must be present to create an account', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? () => handleSignUp(email, password) : () => Alert.alert('Invalid Email', 'Please enter a valid email address')}/> : password.length == 0 ? () => Alert.alert('No password', 'Valid password must be present to create an account', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]) :
    () => handleSignUp(email, password)}
                </View>
            </View>
        </View>
        </TouchableWithoutFeedback>
    </ImageBackground>
  )
}

export default AppleDemo

const styles = StyleSheet.create({
    agreed: {
        textAlign: 'left',
        padding: 28,
        paddingTop: 15,
        fontFamily: 'Montserrat_400Regular',
        fontSize: 12.29, 
        color:'#005278',
        marginTop: '5%'
    },
    signUpcontainer: {
      flex: 1,
      alignItems: 'center',
        justifyContent: 'center'
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
    strengthBar: {
    flexDirection: 'row',
    height: 10,
    marginTop: 5,

  },
  bar: {
    flex: 1,
    marginHorizontal: 1,
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
    marginTop: '5%'
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
    alignItems: 'center',
    marginBottom: '5%'
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