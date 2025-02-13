import { StyleSheet, Text, TextInput, View, ImageBackground, Keyboard, Modal, TouchableOpacity, Alert, TouchableWithoutFeedback } from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
import InputBox from '../Components/InputBox'
import { setDoc, doc, addDoc, collection, getDocs, onSnapshot, query } from 'firebase/firestore'
import { db } from '../firebase'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useFonts, Montserrat_400Regular, Montserrat_500Medium } from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
const GroupName = () => {
    const navigation = useNavigation();
    const [groupName, setGroupName] = useState('');
    const theme = useContext(themeContext)
    const [loading, setLoading] = useState(true);
    const [nameModalVisible, setNameModalVisible] = useState(false);
  const [groupNames, setGroupNames] = useState([]);
  const [groupError, setGroupError] = useState(false);
    const updateCurrentGroup = () => {
      if (groupNames.includes(groupName.toLowerCase())) {
        setGroupError(true)
        Alert.alert('Name is already in use', 'Please choose another name for your cliq', [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => console.log('first') },
              ]);
      }
      else if (groupName.trim().length == 0) {
        Alert.alert('Cliq must have a name')
      }
      else {
        navigation.navigate('GroupSecurity', {name: groupName})
      }
        
    }
    useEffect(() => {
      let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(collection(db, 'groups')), (snapshot) => {
          setGroupNames(snapshot.docs.map((doc)=> ( {
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
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_400Regular
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
    //console.log(groupNames)
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover">
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={[styles.main, {backgroundColor: theme.backgroundColor}]}>
            <RegisterHeader onPress={() => navigation.goBack()} colorOne={{borderColor: '#3286ac'}} group={true}/>
            <Text style={[styles.headerText, { color: theme.color}]}>What's the Cliq's Name?</Text>
            <View style={{marginTop: '7.5%'}}>
                <InputBox text={"Cliq Name"} maxLength={100} value={groupName} onChangeText={setGroupName} containerStyle={groupError ? {borderColor: 'red'} : {}} />
                {groupError ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium',}]}>Name already in use</Text> : null}
            </View>
            <Text style={[styles.characterCountText, {color: theme.color}]}>{groupName.length}/100</Text>
            <View style={{marginTop: '10%', marginRight: '5%', marginLeft: '5%'}}>
                <NextButton text={'Next'} onPress={updateCurrentGroup}/>
            </View>
          </View>
        </TouchableWithoutFeedback>
        
    </ImageBackground>
  )
}

export default GroupName

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
        //paddingTop: 40,
        paddingBottom: 0
    },
    supplementaryText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 25,
        paddingBottom: 0,
        paddingTop: 5
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
    input: {
        fontSize: 15.36,
        padding: 12,
        alignSelf: 'center',
        fontFamily: 'Montserrat_400Regular',
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
  },
  characterCountText: {
      fontSize: 12.29,
      fontFamily: 'Montserrat_500Medium',
      paddingBottom: 0,
      padding: 10,
      textAlign: 'right',
      paddingRight: 0,
      marginRight: '7.5%'
    }
})