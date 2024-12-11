import { StyleSheet, Text, TextInput, View, ImageBackground, Modal, TouchableOpacity, Keyboard, TouchableWithoutFeedback} from 'react-native'
import React, {useContext, useState} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
import InputBox from '../Components/InputBox'
import Skip from '../Components/Skip'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import axios from 'axios'
import {MODERATION_API_USER, MODERATION_API_SECRET, TEXT_MODERATION_URL} from "@env"
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
const GroupAbout = ({route}) => {
    const navigation = useNavigation();
    const theme = useContext(themeContext)
    const {name, groupSecurity, category} = route.params;
    const [description, setDescription] = useState('');
    const [errorPersonalUserName, setErrorPersonalUserName] = useState(false);
    const [errorMisleadingUserName, setErrorMisleadingUserName] = useState(false);
    const [errorLinkUserName, setErrorLinkUserName] = useState(false);
    const [errorProfanityUserName, setErrorProfanityUserName] = useState(false);
    const updateCurrentUser = () => {
        setErrorLinkUserName(false)
        setErrorMisleadingUserName(false)
        setErrorPersonalUserName(false)
        setErrorProfanityUserName(false)
        try {
          
        data = new FormData();
        data.append('text', description);
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
        .then(function (response) {
          
          if (response.data) {
                if (response.data.link.matches.length > 0) {
                    linkUsernameAlert()
                }
               else if (response.data.personal.matches.length > 0) {
                    personalUsernameAlert()
                }
                else if (response.data.profanity.matches.length > 0 && response.data.profanity.matches.some(obj => obj.intensity === 'high')) {
                  
                    profanityUsernameAlert()
                
                }
                
                else {
                    navigation.navigate('GroupPic', {category: category, name: name, groupSecurity: groupSecurity, description: description})
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
    Montserrat_500Medium,
    Montserrat_600SemiBold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover" >
        
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={[styles.main, {backgroundColor: theme.backgroundColor}]}>
            <RegisterHeader onPress={() => navigation.goBack()} colorOne={{borderColor: '#3286ac'}} colorTwo={{borderColor: '#3286ac'}} colorThree={{borderColor: '#3286ac'}} colorFour={{borderColor: '#3286ac'}} group={true}/>
            <Text style={[styles.headerText, {color: theme.color}]}>About</Text>
            <Text style={[styles.supplementaryText, {paddingTop: 10, color: theme.color}]}>Tell People About the Cliq</Text>
            <View style={{marginTop: '5%'}}>
                <InputBox text={"About"} onChangeText={setDescription} multiline={true} containerStyle={errorPersonalUserName || errorLinkUserName || errorMisleadingUserName || errorProfanityUserName ? [styles.inputContainer, {borderColor: 'red', backgroundColor: theme.backgroundColor}] : [styles.inputContainer, {backgroundColor: theme.backgroundColor}]} 
                multilineStyle={{minHeight: 100, maxHeight: 200}} maxLength={200} value={description}/>
                {errorLinkUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}]}>Description must not contain link(s)</Text> :
                errorMisleadingUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}]}>Description must not be misleading</Text> : errorPersonalUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}]}>Description must not contain personal information</Text> : 
                errorProfanityUserName ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}]}>Description must not contain profanity</Text> : null}
            </View>
            <Text style={{textAlign: 'right', padding: 15, color: theme.color}}>{description.length}/200</Text>
            <View style={{marginTop: '10%', marginLeft: '5%', marginRight: '5%'}}>
                <NextButton text={'Next'} onPress={updateCurrentUser}/>
                <Skip onPress={() => navigation.navigate('GroupPic', {category: category, name: name, groupSecurity: groupSecurity, description: description})}/>
            </View>
        </View>
        </TouchableWithoutFeedback>
    </ImageBackground>
  )
}

export default GroupAbout

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        padding: 25,
        paddingTop: 20,
        paddingBottom: 0
    },
    supplementaryText: {
        fontSize: 15.36,
        padding: 25,
        paddingBottom: 0,
        paddingTop: 5,
        fontFamily: 'Montserrat_500Medium'
    },
    textinput: {
        paddingTop: 20,
        padding: 20,
        fontSize: 15.36,
        fontWeight: '600',
        width: '110%',
        fontFamily: 'Montserrat_600SemiBold'
        //height: '50%'
    },
  modalView: {
    width: '90%',
    height: '50%',
    //margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    paddingRight: 0,
    paddingTop: 5,
    //paddingBottom: 20,
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
    },
    inputContainer: {
        borderRadius: 9,
        borderWidth: 1,
        width: '90%',
        marginLeft: '5%',
        //width: '95%',
        //marginLeft: '5%',
        flexDirection: 'row',
    },
})