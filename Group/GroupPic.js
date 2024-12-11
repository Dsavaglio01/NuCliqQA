import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ImageBackground, ActivityIndicator} from 'react-native'
import React, {useState, useEffect, useRef, useContext} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
import { updateDoc, doc, collection, addDoc, serverTimestamp, arrayUnion, getFirestore, setDoc, getDoc, increment} from 'firebase/firestore'
import useAuth from '../Hooks/useAuth'
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage'
import * as Crypto from 'expo-crypto';
import PfpImage from '../Components/PfpImage'
import {BACKEND_URL} from '@env';
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
import { db } from '../firebase'
const GroupPic = ({route}) => {
    const {name, groupSecurity, category, description} = route.params
    const navigation = useNavigation();
    const [image, setImage] = useState(null);
    const [id, setId] = useState();
    const theme = useContext(themeContext)
    const [searchKeywords, setSearchKeywords] = useState([]);
    const {user} = useAuth()
    const [firstName, setFirstName] = useState();
    const [lastName, setLastName] = useState();
    const [username, setUsername] = useState();
    const [userPfp, setUserPfp] = useState();
    const [notificationToken, setNotificationToken] = useState(null);
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
                    searchKeywords: await (await getDoc(doc(db, 'profiles', user.uid))).data().searchKeywords
                }
                setUserPfp(profileVariables.pfp)
                setFirstName(profileVariables.firstName);
                setLastName(profileVariables.lastName);
                setSearchKeywords(profileVariables.searchKeywords);
                setUsername(profileVariables.username);
            }
        }
        getProfileDetails();
    }, [])
    function createSearchKeywords(str, maxLen, n, limit) {
  console.log(str)
  const result = new Set();
  let count = 0;

  // Prefixes and Suffixes
  for (let i = 1; i <= maxLen; i++) {
    if (count >= limit) break;
    result.add(str.substring(0, i)); // Prefix
    count++;
  }

  for (let i = 1; i <= maxLen; i++) {
    if (count >= limit) break;
    result.add(str.substring(str.length - i)); // Suffix
    count++;
  }

  // N-grams
  for (let i = 0; i <= str.length - n && count < limit; i++) {
    result.add(str.substring(i, i + n));
    count++;
  }

  return Array.from(result).slice(0, limit);
}
 async function uploadClique() {
     const searchKeywords = createSearchKeywords(name.toLowerCase().trim(), 5, 3, 30);
    //let url = 'https://us-central1-nucliq-c6d24.cloudfunctions.net/uploadCliq'
    try {
    const response = await fetch(`${BACKEND_URL}/api/uploadCliq`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {name: name, banner: null, groupSecurity: groupSecurity, category: category, description: description,
      searchKeywords: searchKeywords, user: user.uid, groupId: id}}), // Send data as needed
    })
    const data = await response.json();
      if (data.done) {
        navigation.navigate('MyGroups')
      }
  } catch (error) {
    console.error('Error:', error);
  }
  }
    function createRecommendClique() {
      fetch(`${BACKEND_URL}/api/createRecommendClique`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cliqueId: id,
        banner: null,
                    name: name,
                    groupSecurity: groupSecurity,
                    category: category,
                    description: description,
                    members: [user.uid]
      }),
      })
    .then(response => response.json())
    .then(responseData => {
      // Handle the response from the server
      console.log(responseData);
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error(error);
    })
    }
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
          <RegisterHeader onPress={() => navigation.goBack()} colorOne={{borderColor: '#3286ac'}} colorTwo={{borderColor: '#3286ac'}} colorThree={{borderColor: '#3286ac'}} colorFour={{borderColor: '#3286ac'}} colorFive={{borderColor: '#3286ac'}} colorSix={{borderColor: "#3286ac"}} group={true}/>
            <Text style={[styles.addText, {color: theme.color}]}>Add a Cliq Photo Banner</Text>
            <PfpImage groupBanner={true} name={`${user.uid}${name}groupPic.jpg`} userName={username} searchKeywords={searchKeywords} groupName={name} id={id} category={category} 
            description={description} groupSecurity={groupSecurity} skipOnPress={() => uploadClique()} />
        </View>
    </ImageBackground> 
  )
}

export default GroupPic

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
        height: 150,
        width: 300,
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