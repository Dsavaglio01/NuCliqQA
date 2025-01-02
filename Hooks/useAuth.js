import React, { createContext, useContext, useMemo, useState} from 'react';
import { Alert} from 'react-native';
import { onAuthStateChanged, sendPasswordResetEmail, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, getAuth, signInWithEmailAndPassword, deleteUser} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
GoogleSignin.configure({webClientId: ''})
const AuthContext = createContext({})

export const AuthProvider= ({children}) => {
    const auth = getAuth();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [specificData, setSpecificData] = useState(null);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [error, setError] = useState(null);
    
    
   onAuthStateChanged(auth, (user) => {
        //console.log(user)
        if (user) {
              setUser(user);
        } else {

          setUser(null);

        }
        setLoadingInitial(false)
    })
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
      forgotPassword,
      handleSignUp,
      handleLogin,
      signInWithGoogle
  }), [user, loading, error, specificData])
    return (
      <AuthContext.Provider value={memoedValue}>
        {!loadingInitial && children}
      </AuthContext.Provider>
    )
}
export default function useAuth() {
    return useContext(AuthContext);
}