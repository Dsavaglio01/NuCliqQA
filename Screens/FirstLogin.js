import { StyleSheet, Text, View, ImageBackground, Image, Platform, SafeAreaView, Dimensions, TouchableOpacity} from 'react-native'
import React, {useState, useRef, useEffect, useContext} from 'react'
import SignUpButton from '../Components/SignUpButton';
import MainButton from '../Components/MainButton';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import NextButton from '../Components/NextButton';
import themeContext from '../lib/themeContext';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';
import FirstLoginLogo from '../Components/FirstLoginLogo';
import * as AppleAuthentication from 'expo-apple-authentication';
import { OAuthProvider, getAdditionalUserInfo, fetchSignInMethodsForEmail, getAuth, signInWithCredential, signInWithPopup, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import {jwtDecode} from 'jwt-decode'
import AsyncStorage from '@react-native-async-storage/async-storage';
import "core-js/stable/atob";
import useAuth from '../Hooks/useAuth';
import { getDoc, doc} from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
const FirstLogin = () => {
  const navigation = useNavigation();
  const theme = useContext(themeContext)
  const auth = getAuth();
  const [userInfo, setUserInfo] = useState('');
  const {user} = useAuth();
  const provider = new OAuthProvider('apple.com')
  const signIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const {idToken} = await GoogleSignin.signIn();
    console.log(idToken)
    const googleCredential = GoogleAuthProvider.credential(idToken)
    console.log(googleCredential)
    return signInWithCredential(auth, googleCredential)
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('User canceled the sign-in process.'); 
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE)   
 {
      console.error("Google Play Services are needed");
    } else {
      console.error('Google Sign-in error:', error); // Catch other errors
    }
  }
};
  
  const configGoogleSignIn = () => {
    GoogleSignin.configure({
      webClientId: '452926887272-jl5kckgv1ee8d30pmg2r5k97dcgl3i08.apps.googleusercontent.com',
      androidClientId: '452926887272-op5r3dmll18e2q242n9vf9694nmsu9tr.apps.googleusercontent.com',
      iosClientId: '452926887272-qgmm4plle2819uvd03qr0brakp4ompl5.apps.googleusercontent.com'
    })
  }
  useEffect(() => {
    configGoogleSignIn(); // will execute everytime the component mounts
}, []);
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover">
      
      <SafeAreaView style={[styles.innerContainer, {backgroundColor: theme.backgroundColor}]}>
              <View style={{ marginLeft: '5%', marginRight: '5%', marginTop: '5%'}}>
                
                  <FastImage source={require('../assets/DarkMode3.png')} style={{height: '21%', width: '100%'}}/>
                  <View style={{marginTop: '7.5%'}}>
                      <Text style={[styles.header, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Be Creative.</Text>
                      <Text style={[styles.header, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Be Different.</Text>
                      <Text style={[styles.header, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Be You.</Text>
                  </View>
                  <Text style={[styles.politicsText, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Leave politics at the door and let's enjoy connecting over shared interests. Politics free-zone.</Text>
                  <View style={{marginTop: '15%', marginLeft: '5%'}}>
                   <AppleAuthentication.AppleAuthenticationButton
                          // ... (button styling) ...
                           buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                        cornerRadius={10}
                        style={styles.button}
                          onPress={async () => {
                            try {
                              const credential = await AppleAuthentication.signInAsync({
                                requestedScopes: [
                                  AppleAuthentication.AppleAuthenticationScope.FULL_NAME, // Requesting full name
                                  AppleAuthentication.AppleAuthenticationScope.EMAIL
                                ],
                              });
                              console.log(credential.fullName); // Log credentials

                              if (credential) {
                                const provider = new OAuthProvider('apple.com');
                                const authCredential = provider.credential({ 
                                  idToken: credential.identityToken,
                                });

                                try {
                                  const result = await signInWithCredential(auth, authCredential);
                                  // Decode ID Token (with error handling)
                                  let decodedToken = null;
                                  try {
                                    decodedToken = jwtDecode(credential.identityToken);
                                  } catch (decodeError) {
                                    console.error("Error decoding ID token:", decodeError);
                                    return; // Exit early if there's a decoding error
                                  }

                                  // Check for Full Name
                                  //Store FullName in AsyncStorage:
                                    try {
                                      console.log(credential.fullName)
                                      await AsyncStorage.setItem('FULL_NAME_STORAGE_KEY', JSON.stringify(credential.fullName));
                                    }
                                  catch (err) {
                                    console.log(err)
                                    // Error saving data
                                  }

                                  // Check if it's a new user based on fullName
                                  const additionalUserInfo = getAdditionalUserInfo(result)
                                  if (additionalUserInfo?.isNewUser) {
                                    navigation.navigate('Name')
                                  }
                                  else {
                                  
                                    navigation.navigate('Home', {screen: "Home"})
                                    
                                   
                                    
                                  }
                                  
                                /* const signInMethods = credential.email
                                    ? await fetchSignInMethodsForEmail(auth, credential.email)
                                    : [];

                                  if (signInMethods.includes('apple.com')) {
                                    const user = auth.currentUser;
                                    let userEmail = credential.email; // Start with potentially null value

                                    if (!userEmail && user) {
                                      // Retrieve the email from the user object in Firebase
                                      userEmail = user.providerData.find(
                                        (provider) => provider.providerId === "apple.com"
                                      )?.email;
                                    }

                                    if (userEmail && userEmail.endsWith('@privaterelay.appleid.com')) {
                                      console.warn('User signed in with Apple and has hidden their email. Using private relay:', userEmail);
                                      // Store this private relay email for future communication
                                      // You can use it to send emails through your backend

                                    }

                                    navigation.navigate('Home', { screen: 'Home' }); // User has Apple account linked
                                  } else if (credential.email) {
                                    // ... the rest of your existing code ...
                                  } */

                                } catch (firebaseError) {
                                  console.error('Firebase Sign-In Error:', firebaseError);
                                }
                              }
                            } catch (appleSignInError) {
                              // Handle Apple Sign-In errors here
                              console.error('Apple Sign-In Error:', appleSignInError);
                              if (appleSignInError.code === 'ERR_REQUEST_CANCELED') {
                                // User canceled sign-in
                              }
                            }
                          }}
                        />
                        <TouchableOpacity style={styles.googleButton} onPress={signIn}>
                          <MaterialCommunityIcons name='google' size={17.5} style={{alignSelf: 'center'}} />
                          <Text style={styles.googleText}>Sign in with Google</Text>
                        </TouchableOpacity>
                        {/* <GoogleSigninButton size={GoogleSigninButton.Size.Standard} style={styles.googleButton} onPress={signIn}/> */}
                      {/* <SignUpButton text={'Continue with Apple'} icon='apple' onPress={() => navigation.navigate('SignUp')}/> */}
                  </View>
                  {/* <View style={{marginTop: '5%'}}>
                      <SignUpButton text={'Apple Demo Log in'} icon='apple' onPress={() => navigation.navigate('AppleDemo')}/>
                  </View> */}
                  <View style={{marginTop: '10%'}}>
                      <Text style={[styles.paragraph, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>By continuing, you agree to our <Text style={{textDecorationLine:'underline'}} onPress={() => navigation.navigate('TandC')}>
                        Terms and Conditions</Text> and acknowledge that you understand the <Text style={{textDecorationLine: 'underline'}} 
                        onPress={() => navigation.navigate('PrivacyPolicy')}>Privacy Policy</Text>, <Text style={{textDecorationLine:'underline'}} onPress={() => navigation.navigate('DataPolicy')}>
                        Data Usage Policy</Text>and <Text style={{textDecorationLine:'underline'}} onPress={() => navigation.navigate('DataRetentionPolicy')}>Data Retention Policy</Text></Text>
                  </View>
                 {/*  <View style={styles.footer}>
                      <Text style={[styles.alreadyText, {width: '70%', color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Already have an Account?</Text>
                      <View style={{marginTop: '5%'}}>
                        <NextButton text={'LOG IN'} onPress={() => navigation.navigate('Login')}/>
                      </View>
                  </View> */}

              </View>
      </SafeAreaView>
    </ImageBackground>
  )
}

export default FirstLogin

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
        //backgroundColor: "#699fa1"
    },
    innerContainer: {
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
    header: {
        fontSize: Dimensions.get('screen').height / 22.5,
        color:"#005278",
        fontFamily: 'Montserrat_500Medium'
        //fontFamily: 'montserrat',
    },
  paragraph: {
        textAlign: 'left',
        padding: '5%',
        paddingTop: '2.5%',
        //fontFamily: 'montserrat',
        fontSize: Dimensions.get('screen').height / 68.67, 
        fontFamily: 'Montserrat_500Medium',
        color:'#005278'
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: '5%',
        width: '90%',
        //marginLeft: '5%'
    },
    alreadyText: {
        fontSize: Dimensions.get('screen').height / 54.9,
        padding: 12,
        color: '#005278',
        alignSelf: 'center',
        fontFamily: 'Montserrat_500Medium',
        //fontFamily: 'montserrat',
    },
    politicsText: {
      fontFamily: 'Montserrat_500Medium',
      fontSize: Dimensions.get('screen').height / 54.9,
      color: "#005278",
      padding: 2.5,
      paddingTop: 5
    },
    button: {
    width: '95%',
    height: 50,
    borderRadius: 10,
  fontSize: 12.29,
  },
  googleButton: {
    width: '95%',
    marginTop: '5%',
    height: 45,
    backgroundColor: "#fff",
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  googleText: {
    fontSize: 19.20,
    alignSelf: 'center',
    paddingLeft: 5,
    fontWeight: '500'
  }

})