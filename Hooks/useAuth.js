import React, { createContext, useContext, useEffect, useMemo, useState, useRef} from 'react';
import {View, Text, Platform, Alert, Modal, Button} from 'react-native';
//import * as Google from 'expo-google-app-auth';
import { onAuthStateChanged, signOut, updateCurrentUser, sendPasswordResetEmail, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, getAuth, signInWithEmailAndPassword, deleteUser, sendEmailVerification, signInWithEmailLink, sendSignInLinkToEmail, RecaptchaVerifier} from 'firebase/auth';
import {  doc, getFirestore, serverTimestamp, updateDoc, setDoc, getDoc} from 'firebase/firestore';
//import { useNavigation } from '@react-navigation/native';
//import * as GoogleSignIn from 'expo-google-sign-in';
//import auth from '@react-native-firebase/auth'
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { db } from '../firebase';
import {EXPO_FIREBASE_AUTH_DOMAIN} from "@env"
import { useNavigation } from '@react-navigation/native';
GoogleSignin.configure({webClientId: ''})
const AuthContext = createContext({})

export const AuthProvider= ({children}) => {
    const auth = getAuth();
    const [loading, setLoading] = useState(false);
    //const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [specificData, setSpecificData] = useState(null);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [error, setError] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [phoneModalVisible, setPhoneModalVisible] = useState(false);
    const [code, setCode] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    //const [email, setEmail] = useState('');
    //const [password, setPassword] = useState('');
    const [potentialEnabled, setPotentialEnabled] = useState(true);
    const [expiredEnabled, setExpiredEnabled] = useState(true);
    const [accountEnabled, setAccountEnabled] = useState(true);
    
    
   onAuthStateChanged(auth, (user) => {
        //console.log(user)
        if (user) {
              setUser(user);
        } else {

          setUser(null);

        }
        setLoadingInitial(false)
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
  //console.log(user)
    const logout = () => { 
        //console.log('bruh')
        //setLoading(true);
        //signOut(auth).catch((error)=> setError(error)).then(() => ).finally(()=> setLoading(false));
    };
    const deleteAccount = (user) => {
      deleteUser(user).then(() => {
        console.log('deleted user')
      }).catch((error) => {
        if (error.message.includes('requires-recent-login')) {
          Alert.alert('Requires recent login', 'Please sign out and log back in again to delete account.');
          //setLoading(false)
        }
        //console.log(Alert.alert('Title:', error.message))
        //console.log(error)
        //Alert.alert(error, error)
      })
    }
    const forgotPassword = (email) => {

    return sendPasswordResetEmail(auth, email);
  }
  
  const handleSignUp = (email, password) => {
    setLoading(true);
        createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
          const user = userCredential.user
        }).catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          if (errorMessage) {
            Alert.alert(errorMessage)
          }
          
          // ..
        })
  }
  const handleLogin = (email, password) => {
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
      const user = userCredential.user
      //setUser(userCredential.user)
      //console.log(user)
    }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    if (errorMessage) {
      Alert.alert(errorMessage)
    }
    
    // ..
  })
  }
  const signInWithGoogle = async () => {
  try {
    //await GoogleSignin.hasPlayServices();
    //setUserInfo({ userInfo });
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(idToken);
    //console.log(googleCredential)
    // Sign-in the user with the credential
    return signInWithCredential(auth, googleCredential);
    //return auth().
  } catch (error) {
    //console.log(error)
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled the login flow
    } else if (error.code === statusCodes.IN_PROGRESS) {
      // operation (e.g. sign in) is in progress already
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      // play services not available or outdated
    } else {
      // some other error happened
    }
  }
};
  
  const memoedValue = useMemo(() => ({
      user,
      loading,
      error,
      specificData,
      deleteAccount,
      logout,
      forgotPassword,
      handleSignUp,
      handleLogin,
      signInWithGoogle
  }), [user, loading, error, specificData])
//console.log(loadingInitial)
    return (
        <AuthContext.Provider value={memoedValue}>
            {!loadingInitial && children}

        </AuthContext.Provider>
    )
}
export default function useAuth() {
    return useContext(AuthContext);
}