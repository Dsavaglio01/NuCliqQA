import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ImageBackground, ActivityIndicator} from 'react-native'
import React, {useState, useEffect} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
import { updateDoc, doc, collection, addDoc, serverTimestamp, arrayUnion, getDoc, getFirestore } from 'firebase/firestore'
import useAuth from '../Hooks/useAuth'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage } from 'firebase/storage'
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat'
import PfpImage from '../Components/PfpImage'
import { db } from '../firebase'
const ChannelPfp = ({route}) => {
    const {id, name, security, group, edit, groupName} = route.params;
    //console.log(id)
    const navigation = useNavigation();
    const [image, setImage] = useState(null);
    const [pfp, setPfp] = useState();
    const [profilePic, setProfilePic] = useState();
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const {user} = useAuth();
    const storage = getStorage();
    const [firstName, setFirstName] = useState();
    const [lastName, setLastName] = useState();
    const [username, setUsername] = useState();
    const [userPfp, setUserPfp] = useState();
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
    useEffect(() => {
        if (route.params?.edit) {
            const getData = async() => {
                const docSnap = await getDoc(doc(db, 'groups', group, 'channels', id))
                setPfp(docSnap.data().pfp)
            }
            getData();
        }
    }, [route.params?.edit])
    const [fontsLoaded, fontError] = useFonts({
        // your other fonts here
        Montserrat_500Medium
    });

    if (!fontsLoaded || fontError) {
        // Handle loading errors
        return null;
    }
    
    
  return (
    <ImageBackground style={styles.container} source={require('../assets/loginBackground.png')} resizeMode="cover">
        
        <View style={styles.main}>
            <RegisterHeader onPress={edit ? () => navigation.navigate('GroupChat', {id: id, group: group, name: name, pfp: pfp, groupName: groupName}) : () => navigation.goBack()}  colorOne={{borderColor: '#3286ac'}} colorTwo={styles.barColor} colorThree={styles.barColor} channel={true}/>
            <Text style={styles.addText}>Add a Cliq Chat Picture</Text>
            <PfpImage channelPfp={true} name={`${id}${name}channelPfp.jpg`} id={id} edit={edit} group={group} channelName={name} security={security} skipOnPress={() =>  navigation.navigate('ChannelInvite', {id: id, name: name, group: group, security: security, pfp: null})} />
        </View>
    </ImageBackground> 
  )
}

export default ChannelPfp

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
        paddingBottom: 10,
        color: "#fafafa"
    },
    addContainer: {
        backgroundColor: "#fafafa",
        height: 150,
        width: 300,
        //borderRadius: 90,
        justifyContent:'center'
    },
    main: {
          backgroundColor: '#121212',
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