import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ImageBackground, ActivityIndicator} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
import { updateDoc, doc, getFirestore } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL, getStorage } from 'firebase/storage'

import axios from 'axios'
import useAuth from '../Hooks/useAuth'
import PfpImage from '../Components/PfpImage'
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
import { db } from '../firebase'
const Pfp = ({route}) => {
    const navigation = useNavigation();
    const {firstName, lastName, userName, age} = route.params;
    const [image, setImage] = useState(null);
    const [pfp, setPfp] = useState();
    const theme = useContext(themeContext)
    const [uploading, setUploading] = useState(false);
    //const [uploaded, setUploaded] = useState(false);
    const storage = getStorage();
    const {user} = useAuth()
    /* useEffect(() => {
        setPfp(`${user.uid}profile.jpg`)
    }, []) */
    const updateCurrentUser = () => {
        uploadImage()
    }
    const uploadImage = async() => {
        setUploading(true);
        const response = await fetch(image.uri)
        const blob = await response.blob();
        const filename = `${userName}profile.jpg`
        setPfp(filename)
        var storageRef = ref(storage, filename)
        try {
            await storageRef;
        } catch (error) {
            console.log(error)
        }
        await uploadBytesResumable(storageRef, blob).then(() => getLink(filename))
        //setUploaded(true)
        
    }
    //console.log(profilePic)
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
            <RegisterHeader onPress={() => navigation.goBack()} colorOne={{borderColor: '#3286ac'}} colorTwo={{borderColor: '#3286ac'}} colorThree={{borderColor: '#3286ac'}} colorFour={{borderColor: '#3286ac'}} />
            <Text style={[styles.addText, {color: theme.color}]}>Add a Profile Picture</Text>
            <PfpImage pfpRegister={true} name={`${userName}profile.jpg`} skipOnPress={() =>  navigation.navigate('Referral', {firstName: firstName, lastName: lastName, userName: userName, age: age,
            pfp: null})}
            firstName={firstName} lastName={lastName} userName={userName} age={age}/>

            
        </View>
    </ImageBackground>
  )
}

export default Pfp

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    addText: {
        fontSize: 19.20,
        padding: 25,
        paddingBottom: 10,
         fontFamily: 'Montserrat_500Medium'
    },
    addContainer: {
        backgroundColor: "#000",
        height: 151,
        width: 151,
        borderRadius: 8,
        //justifyContent:'center'
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