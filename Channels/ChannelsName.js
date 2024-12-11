import { StyleSheet, Text, View, ImageBackground, Modal, TouchableOpacity, Alert, TouchableHighlight, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, {useState, useEffect} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
import InputBox from '../Components/InputBox'
import { db } from '../firebase'
import axios from 'axios'
import {MODERATION_API_USER, MODERATION_API_SECRET, TEXT_MODERATION_URL} from "@env"
import { onSnapshot, query, collection, updateDoc,doc } from 'firebase/firestore'
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat'
const ChannelsName = ({route}) => {
    const {id, group, edit, name, pfp, groupName} = route.params;
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [channelName, setChannelName] = useState('');
    const [nameModalVisible, setNameModalVisible] = useState(false);
    const [groupError, setGroupError] = useState(false);
    const [errorFirstName, setErrorFirstName] = useState(false);
    const [channelNames, setChannelNames] = useState([]);
    const [errorPersonalUserName, setErrorPersonalUserName] = useState(false);
    const [errorMisleadingUserName, setErrorMisleadingUserName] = useState(false);
    const [errorLinkUserName, setErrorLinkUserName] = useState(false);
    const [errorProfanityUserName, setErrorProfanityUserName] = useState(false);
    //console.log(edit)
    const updateCurrentChannel = async() => {
      setGroupError(false)
      setErrorFirstName(false)
      setErrorLinkUserName(false)
      setErrorMisleadingUserName(false)
      setErrorPersonalUserName(false)
      setErrorProfanityUserName(false)
      if (channelName.trim().length == 0) {
        firstNameAlert();
      }
      if (channelNames.includes(channelName.toLowerCase())) {
        setGroupError(true)
      }
      else { 
        //console.log(userName)
        try {
          
        data = new FormData();
        data.append('text', channelName);
        data.append('lang', 'en');
        data.append('mode', 'rules');
        data.append('api_user', `${MODERATION_API_USER}`);
        data.append('api_secret', `${MODERATION_API_SECRET}`);
        //console.log(data)
        axios({
          url: `${TEXT_MODERATION_URL}`,
          method:'post',
          data: data,
          //headers: data.getHeaders()
        })
        .then(async function (response) {
          if (response.data) {
                if (response.data.link.matches.length > 0) {
                    linkUsernameAlert()
                }
               else if (response.data.personal.matches.length > 0) {
                    personalUsernameAlert()
                }
                else if (response.data.profanity.matches.length > 0) {
                  const containsValue = response.data.profanity.matches.some(obj => obj.intensity === 'high');
                if (containsValue) {
                    profanityUsernameAlert()
                }
                }
                else {
                  if (edit) {

                    await updateDoc(doc(db, 'groups', group, 'channels', id), {
                      name: channelName
                    }).then(() => navigation.goBack())
                  }
                  else {
                    navigation.navigate('ChannelSecurity', {name: channelName, id: id, group: group})
                  }
                    
                }
                
                //console.log(data)
            }
        })
        .catch(function (error) {
          // handle error
          if (error.response) console.log(error.response.data);
          else console.log(error.message);
        });
        }
        catch (error) {
            console.error(error)
        }
      }
    }
    useEffect(() => {
        if (route.params?.edit) {
            const getData = async() => {
                const docSnap = await getDoc(doc(db, 'groups', group, 'channels', id))
                setPfp(docSnap.data().pfp)
            }
            getData();
        }
    }, [route.params?.edit])
    useEffect(() => {
      let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'groups', id, 'channels')), (snapshot) => {
          setChannelNames(snapshot.docs.filter(doc => doc.data().name != route.params?.name).map((doc)=> ( {
          ...doc.data().name.toLowerCase()
          })))
        })
      } 
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
      return unsub;
    }, [])
    const firstNameAlert = () => {
      setErrorFirstName(true)
    }
    const linkUsernameAlert = () => {
      setErrorLinkUserName(true)
    }
    const misleadingUsernameAlert = () => {
      setErrorMisleadingUserName(true)
    }
    const personalUsernameAlert = () => {
      setErrorPersonalUserName(true)
    }
    const profanityUsernameAlert = () => {
      setErrorProfanityUserName(true)
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
    <ImageBackground style={styles.container} source={require('../assets/loginBackground.png')} resizeMode="cover">

        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.main}>
            <RegisterHeader onPress={edit ? () => navigation.navigate('GroupChat', {id: id, group: group, name: name, pfp: pfp, groupName: groupName}) : () => navigation.goBack()} colorOne={{borderColor: '#3286ac'}} channel={true}/>
            <Text style={styles.headerText}>What's the Cliq Chat's Name?</Text>
            <Text style={styles.supplementaryText}>This Cannot Be Changed</Text>
            <View style={{marginTop: '5%'}}>
                 <InputBox text={route.params?.name ? name : 'Cliq Chat Name'} containerStyle={groupError || errorFirstName || errorPersonalUserName || errorLinkUserName || errorMisleadingUserName || errorProfanityUserName ? [styles.inputContainer, {borderColor: 'red'}] : styles.inputContainer} 
                 onChangeText={setChannelName} keyType={'done'} value={channelName}/>
                {errorFirstName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium',}]}>Cliq Chat must have a name</Text> : groupError ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29}]}>Name already in use</Text>
                : errorLinkUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium',}]}>Name must not contain link(s)</Text> :
                errorMisleadingUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium',}]}>Name must not be misleading</Text> : errorPersonalUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29}]}>Name must not contain personal information</Text> : 
                errorProfanityUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium',}]}>Name must not contain profanity</Text> : null}
            </View>
            <View style={{marginRight: '5%', marginLeft: '5%', marginTop: '10%'}}>
                <NextButton text={'Next'} onPress={updateCurrentChannel}/>
            </View> 
        </View>
        </TouchableWithoutFeedback>
    </ImageBackground>
  )
}

export default ChannelsName

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        fontSize: 19.20,
        padding: 25,
        fontFamily: 'Montserrat_500Medium',
        paddingBottom: 0,
        color: "#fafafa"
    },
    supplementaryText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 25,
        paddingBottom: 0,
        paddingTop: 5,
        color: "#fafafa"
    },
    main: {
          backgroundColor: '#121212',
      borderRadius: 35,
      marginTop: '7.5%',
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
    inputContainer: {
        borderRadius: 9,
        borderWidth: 1,
        backgroundColor: "#121212",
        width: '90%',
        marginLeft: '5%',
        //width: '95%',
        //marginLeft: '5%',
        flexDirection: 'row',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
  modalView: {
    width: '90%',
    height: '15%',
    //margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    paddingRight: 0,
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
  barColor: {
    borderColor: '#3286ac'
  }
})