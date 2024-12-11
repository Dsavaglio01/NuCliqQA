import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ImageBackground, ActivityIndicator} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
import { updateDoc, doc, collection, addDoc, serverTimestamp, arrayUnion, getFirestore, setDoc, getDoc} from 'firebase/firestore'
import useAuth from '../Hooks/useAuth'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage'
import * as Crypto from 'expo-crypto';
import PfpImage from '../Components/PfpImage'
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
import { db } from '../firebase'
const GroupPfp = ({route}) => {
    const {name, groupSecurity, category, description} = route.params
    const navigation = useNavigation();
    const [image, setImage] = useState(null);
    const [id, setId] = useState();
    const theme = useContext(themeContext)
    const [pfp, setPfp] = useState();
    const [profilePic, setProfilePic] = useState();
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const {user} = useAuth()
    const [firstName, setFirstName] = useState();
    const [lastName, setLastName] = useState();
    const [username, setUsername] = useState();
    const [userPfp, setUserPfp] = useState();
    const storage = getStorage();
    useEffect(() => {
    (async () => {
      const initialDigest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.MD5,
        `${name}`
      );
      //console.log(initialDigest)
      //console.log('Digest: ', digest);
      setId(initialDigest)
      /* Some crypto operation... */
    })();
  }, []);
    useEffect(() => {
        const getProfileDetails = async() => {
            const docSnap = await getDoc(doc(db, 'profiles', user.uid));
            if (docSnap.exists()) {
                const profileVariables = {
                    pfp: await(await getDoc(doc(db, 'profiles', user.uid))).data().pfp,
                    username: await(await getDoc(doc(db, 'profiles', user.uid))).data().userName,
                    firstName: await (await getDoc(doc(db, 'profiles', user.uid))).data().firstName,
                    lastName: await (await getDoc(doc(db, 'profiles', user.uid))).data().lastName,
                }
                setUserPfp(profileVariables.pfp)
                setFirstName(profileVariables.firstName);
                setLastName(profileVariables.lastName);
                setUsername(profileVariables.username);
            }
        }
        getProfileDetails();
    }, [])
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
    
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover">
       
        <View style={[styles.main, {backgroundColor: theme.backgroundColor}]}>
             <RegisterHeader onPress={() => navigation.goBack()} colorOne={{borderColor: '#3286ac'}} colorTwo={{borderColor: '#3286ac'}} colorThree={{borderColor: '#3286ac'}} colorFour={{borderColor: '#3286ac'}} colorFive={{borderColor: '#3286ac'}} group={true}/>
            <Text style={styles.addText}>Add a Profile Picture for the Clique!</Text>
            <PfpImage name={`${user.uid}${name}GroupPfp.jpg`} skipOnPress={() => navigation.navigate('GroupPic', {name: name, groupSecurity: groupSecurity, description: description, 
            category: category, grouppfp: null})} groupName={name} id={id} category={category} 
            description={description} groupPfp={true} groupSecurity={groupSecurity}/>
            
        </View>
    </ImageBackground> 
  )
}

export default GroupPfp

const styles = StyleSheet.create({
    container: {
        flex: 1,
       alignItems: 'center',
        justifyContent: 'center'
    },
    addText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        padding: 25,
        paddingBottom: 10
    },
    addContainer: {
        backgroundColor: "#000",
        height: 151,
        width: 151,
        //borderRadius: 90,
        justifyContent:'center'
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
  }
})