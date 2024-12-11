import { StyleSheet, Text, View, ScrollView, Modal, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import ThemeHeader from '../Components/ThemeHeader'
import { Divider } from 'react-native-paper'
import InputBox from '../Components/InputBox'
import NextButton from '../Components/NextButton'
import PreviewFooter from '../Components/PreviewFooter'
import useAuth from '../Hooks/useAuth'
import Theme from '../Theme/Theme'
import { useNavigation } from '@react-navigation/native'
import {BACKEND_URL} from '@env'
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updateEmail, updatePassword } from 'firebase/auth'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import zxcvbn from 'zxcvbn';
import { useFonts, Montserrat_500Medium, Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
const AccountInfo = ({route}) => {
  const {email, password} = route.params;
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmedPassword, setShowConfirmedPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const theme = useContext(themeContext)
  const [modalVisible, setModalVisible] = useState(false);
  const [actualPassword, setActualPassword] = useState('')
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigation = useNavigation();
  const [success, setSuccess] = useState(false);
  const {user} = useAuth();
  const [isEditable, setIsEditable] = useState(true);
  const [actualCode, setActualCode] = useState(null);
  const [code, setCode] = useState(null);
  const [updatedEmail, setUpdatedEmail] = useState(user.email);
  const auth = getAuth();
  const passwordCredential = EmailAuthProvider.credential(
    user.email,
    actualPassword
  )
  
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
  function handleReauthentication() {
    reauthenticateWithCredential(user, passwordCredential).then(() => {

    }).catch((error) => {
      const errorCode = error.code;
      interpretError(errorCode)
      throw error
}).then(() => updateEmail(user, updatedEmail).then(() => {
  Alert.alert('Email updated!', 'When logging back in, make sure to use that email!', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => navigation.goBack()},
    ]);
}))

  }
  function handleNewPassword() {
    updatePassword(user, confirmPassword).then(() => {
      Alert.alert('Password updated!', 'When logging back in, make sure to use that password!', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => navigation.goBack()},
    ]);
    }).catch((error) => {
      const errorCode = error.code;
      interpretError(errorCode)
      throw error
    });
  }
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
            if (email) {
               handleReauthentication()
            }
            else {
              handleNewPassword()
            }
           
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
  //const [password, setPassword] = useState('')
    //console.log(user)
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_400Regular,
    Montserrat_600SemiBold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <ThemeHeader text={"Account Information"} video={false} backButton={true}/>
      <Divider borderWidth={0.4}/>
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => {setModalVisible(!modalVisible); }}>
          <View style={[styles.modalContainer, styles.overlay]}>
          <View style={styles.modalView}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <>
            <MaterialCommunityIcons name='close' color={theme.color} size={30} style={{textAlign: 'right', marginRight: -20}} onPress={() => setModalVisible(false)}/>
            
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
      
      {email ? 
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{flex: 1}}>
        
        <Text style={[styles.titleText, {color: theme.color}]}>In order to change your email, you need to verify the new email by clicking on the code sent to that new email.</Text>
        <InputBox text={user.email} icon='email' maxLength={200} onChangeText={setUpdatedEmail} keyType={'done'} value={updatedEmail}/>

     <View style={{marginHorizontal: '5%', marginVertical: '10%'}}>
     {!success ? 
                    <NextButton text={'Change Email'} onPress={user.email == updatedEmail ? null : email.length == 0 ? () => Alert.alert('No Email', 'Valid Email must be present to change Email', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]) : () => handleReauthentication(updatedEmail)}/> : 
      <Text style={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium'}}>An email has been sent to {updatedEmail}. Click on the link provided to verify new Email.</Text>}
    </View>
      </View> 

      </TouchableWithoutFeedback>
      : 
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{flex: 1}}>
        
        <Text style={[styles.titleText, {color: theme.color}]}>In order to change your password, you need to enter your initial password, confirm your new one, and verify with phone number.</Text>
       <InputBox inputStyle={{width: '90%'}} text={actualPassword.length > 0 && showPassword == true ? actualPassword : actualPassword.length > 0 && showPassword == false ? '*'.repeat(actualPassword.length) : 'Initial Password'}
                password={!showPassword ? true : false} value={actualPassword} onChangeText={setActualPassword} secondIcon={true} secondIconName={showPassword ? 'eye-outline' : 'eye-off-outline'}
                secondOnPress={showPassword ? () => setShowPassword(false) : () => setShowPassword(true)} containerStyle={{marginTop: '5%'}} icon={'lock-outline'} secondIconStyle={{left: 300}}/>
                <TouchableOpacity style={{marginLeft: 'auto'}} onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.loginagreed}>Forgot Password?</Text>
                </TouchableOpacity>
        <InputBox inputStyle={{width: '90%'}} text={newPassword.length > 0 && showNewPassword == true ? newPassword : newPassword.length > 0 && showNewPassword == false ? '*'.repeat(newPassword.length) : 'New Password'}
                password={!showNewPassword ? true : false} value={newPassword} onChangeText={setNewPassword} secondIcon={true} secondIconName={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                secondOnPress={showNewPassword ? () => setShowNewPassword(false) : () => setShowNewPassword(true)} containerStyle={{marginTop: '5%'}} icon={'lock-outline'} secondIconStyle={{left: 300}}/> 
        {newPassword.length > 0 ? 
                <View style={{width: '90%', marginLeft: '5%', marginTop: '5%'}}>
                  {renderStrengthBar()}
                </View> : null}
         <InputBox inputStyle={{width: '90%'}} text={confirmPassword.length > 0 && showConfirmedPassword == true ? confirmPassword : confirmPassword.length > 0 && showConfirmedPassword == false ? '*'.repeat(confirmPassword.length) : 'Confirm Password'}
                password={!showConfirmedPassword ? true : false} value={confirmPassword} onChangeText={setConfirmPassword} secondIcon={true} secondIconName={showConfirmedPassword ? 'eye-outline' : 'eye-off-outline'}
                secondOnPress={showConfirmedPassword ? () => setShowConfirmedPassword(false) : () => setShowConfirmedPassword(true)} containerStyle={{marginTop: '5%'}} icon={'lock-outline'} secondIconStyle={{left: 300}}/>      
        <InputBox text={phoneNumber.length > 0 ? phoneNumber : '215-123-1234'} keyboardType={'phone-pad'} icon={'phone-outline'} password={false} value={phoneNumber} onChangeText={handlePhoneNumberChange} containerStyle={{marginTop: '5%'}} />
     <View style={{marginHorizontal: '5%', marginVertical: '10%'}}>
      <NextButton text={'Change Password'} onPress={confirmPassword.length == 0 || newPassword.length == 0 ? () => Alert.alert('No new password', 'New password must be present to change password', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])
     : newPassword != confirmPassword ? () => Alert.alert('New Password Mismatch', 'New passwords must match', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]) : strength <= 1 ? () => Alert.alert('New password not strong enough', 'New password must be strong enough to create an account', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]) : !success && strength > 1 && phoneNumber.replace(/\D/g, '').length == 10 ? () => sendPhoneNumber() : success ? () => handleNewPassword() : () => Alert.alert('Invalid phone number', 'Sorry, phone number must be in format "215-123-1234"', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])}/>
    </View>
      </View> 

      </TouchableWithoutFeedback>}
    </View>
  )
}

export default AccountInfo

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    main: {
        marginHorizontal: '5%',
        marginVertical: '10%'
    },
    header: {
        fontSize: 24, 
        fontFamily: 'Montserrat_600SemiBold'
    },
    titleText: {
        margin: '5%',
        fontSize: 19.20,
        fontFamily: 'Montserrat_400Regular'
    },
    alertText: {
        color: 'red',
        fontSize: 12.29,
        fontFamily: 'Montserrat_500Medium',
        marginLeft: '5%',
        padding: 5

    },
  loginagreed: {
      textAlign: 'left',
        padding: 30,
        paddingTop: 10,
        paddingBottom: 10,
       fontFamily: 'Montserrat_400Regular',
        fontSize: 12.29, 
        color:'#005278',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 100
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
  strengthBar: {
    flexDirection: 'row',
    height: 10,
    marginTop: 5,

  },
  bar: {
    flex: 1,
    marginHorizontal: 1,
  },
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
})