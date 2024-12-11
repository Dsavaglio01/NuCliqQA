import { KeyboardAvoidingView, StyleSheet, Text, View, TouchableWithoutFeedback,Keyboard, Alert, SafeAreaView } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import MainLogo from '../Components/MainLogo'
import {MaterialIcons, MaterialCommunityIcons} from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, getDocs, where } from 'firebase/firestore'
import { db } from '../firebase'
import useAuth from '../Hooks/useAuth'
import InputBox from '../Components/InputBox'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import NextButton from '../Components/NextButton'
import { getAuth, signOut } from 'firebase/auth'
import FastImage from 'react-native-fast-image'
const ReportScreen = ({route}) => {
    const {suspended, banned} = route.params;
    const theme = useContext(themeContext)
    const [suspendedTimestamp, setSuspendedTimestamp] = useState(null);
    const navigation = useNavigation();
    const [report, setReport] = useState('');
    const [numberOfContacts, setNumberOfContacts] = useState([]);
    const [sentReport, setSentReport] = useState(false);
    const [countdownString, setCountdownString] = useState(null);
    const {user} = useAuth();
    const auth = getAuth();
    const handleReport = (inputText) => {
    const sanitizedText = inputText.replace(/\n/g, ''); // Remove all new line characters
    setReport(sanitizedText);
  }
    const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === 'Enter') {
      // Prevent user from manually inserting new lines
      return;
    }
  };
    useEffect(() => {
        const getData = async() => {
            const docSnap = await getDoc(doc(db, 'profiles', user.uid))
            setSuspendedTimestamp(docSnap.data().suspendedTimestamp)
        }
        getData()
    }, [])
    useEffect(() => {
        const getData = async() => {
            const docSnap = await getDocs(collection(db, 'feedback'), where('userId', '==', user.uid), where('banned', '==', true))
            docSnap.docs.forEach((item) => {
                setNumberOfContacts(prevState => [...prevState, item.id])
            })
        }
        getData()
    }, [])
    const sendReport = () => {
    addDoc(collection(db, 'feedback'), {
      userId: user.uid,
      timestamp: serverTimestamp(),
      feedback: report,
      banned: true
    }).then(() => setSentReport(true))
  }
  //console.log(suspendedTimestamp)
    useEffect(() => {
        if (suspendedTimestamp != undefined && suspendedTimestamp != null) {
            //console.log(Date.now().seconds)
            const currentTime = suspendedTimestamp.seconds

// Calculate the future timestamp (3 days later)
const futureTime = currentTime + (3 * 24 * 60 * 60 * 1000);

// Calculate the difference in milliseconds
const differenceInMilliseconds = futureTime - currentTime;

// Convert milliseconds to seconds
const differenceInSeconds = differenceInMilliseconds / 1000;

// Calculate remaining days, hours, and minutes
const remainingDays = Math.floor(differenceInSeconds / (24 * 60 * 60));
const remainingHours = Math.floor((differenceInSeconds % (24 * 60 * 60)) / (60 * 60));
const remainingMinutes = Math.floor((differenceInSeconds % (60 * 60)) / 60);
setCountdownString((remainingDays > 0 ? `${remainingDays} days ` : '') +
  (remainingHours > 0 ? `${remainingHours} hours ` : '') +
  (remainingMinutes > 0 ? `${remainingMinutes} minutes` : ''))
  
        }
    }, [suspendedTimestamp])
    
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  //console.log(sentReport)
  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <View style={{marginHorizontal: '5%', marginVertical: '5%'}}>
                    <KeyboardAwareScrollView>
            <View style={{marginTop: '2.5%'}}>
                 <FastImage source={require('../assets/DarkMode5.png')} style={{height: 27.5, width: 68.75}}/>
            </View>
            <Text style={[styles.header, {color: theme.color}]}>We {suspended ? 'suspended' : 'banned'} your account on {new Date().toLocaleDateString()}</Text>
            {banned ? null : <Text style={[styles.supplementaryheader, {fontSize: 15.36, color: theme.color}]}>You will be able to log back into your account within a week</Text>}
            
            <View>
                <Text style={[styles.supplementaryheader, {color: theme.color}]}>Why was your account {suspended ? 'suspended' : 'banned'}?</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '90%'}}>
                    <MaterialIcons name='report' size={35} style={{alignSelf: 'center'}} color={"red"}/>
                    <Text style={[styles.supplementaryheader, {fontSize: 15.36, textAlign: 'left', color: theme.color}]}>Your account and/or content got reported at least {suspended ? '10' : '20'} times on uniquely separate occasions</Text>
                </View>
            </View>
            {suspended ? 
            <>
            <Text style={[styles.supplementaryheader, {color: theme.color}]}>What to do now?</Text>
            <Text style={[styles.supplementaryheader, {fontSize: 15.36, color: theme.color}]}>Within a week you will be able to log back into your account. While waiting, consider reviewing our <Text style={{textDecorationLine: 'underline', color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}} onPress={() => navigation.navigate('TandC')}>Terms and Conditions</Text> and <Text style={{textDecorationLine: 'underline', color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}}>Privacy Policy</Text> so that this doesn't happen again!</Text>
            <View>
                    <Text style={[styles.supplementaryheader, {fontSize: 24, color: theme.color}]}>Remaining Time: </Text>
                    <Text style={[styles.supplementaryheader, {color: theme.color}]}>{countdownString}</Text>
                </View>
            </> : <>
            {sentReport || numberOfContacts.length >= 3 ? null : <Text style={[styles.supplementaryheader, {color: theme.color}]}>Contact us if you have any questions:</Text>}
            {sentReport || numberOfContacts.length >= 3 ? <View >
                <View style={{alignItems: 'center', marginTop: '5%'}}>
        <Text style={[styles.headerText, {color: theme.color}]}>Feedback Sent!</Text>
        <MaterialCommunityIcons name='check' size={50} color={theme.color}/>
        </View>
        <View style={{margin: '5%', marginTop: '10%',}}>
            <NextButton text={"Log out"} onPress={async() => await updateDoc(doc(db, 'profiles', user.uid),{
                notificationToken: null,
                disableAccount: true
            })}/>
        </View>
        </View> : 
        <View>
        <InputBox maxLength={400} multiline={true} key={handleKeyPress} multilineStyle={{height: 400}} value={report} onChangeText={handleReport}/>
        <Text style={[styles.editText, {color: theme.color}]}>{report.length}/400</Text>
        {sentReport ? <View style={{margin: '5%', marginTop: 0}}>
            <NextButton text={"Log out"} onPress={async() => await updateDoc(doc(db, 'profiles', user.uid),{
                notificationToken: null
            }).then(() => signOut(auth).catch((error) => {
                    Alert.alert(error.message)
                    throw error;
                }))}/>
        </View> : report.length > 0 ? <View style={{margin: '5%', marginTop: 0}}>
            <NextButton text={"Send Report"} onPress={() => sendReport()}/>
        </View> : null}
        </View>}
            
            
            </>}
            </KeyboardAwareScrollView>
        </View>
      
    </SafeAreaView>
  )
}

export default ReportScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        fontSize: 32,
        fontFamily: 'Montserrat_500Medium',
        padding: 15,
        textAlign: 'center'
    },
    supplementaryheader: {
        fontSize: 19.20,
         fontFamily: 'Montserrat_500Medium',
        padding: 15,
        textAlign: 'center'
    },
    editText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium', 
    margin: '5%',
    textAlign: 'right'
  },
  headerText: {
    fontSize: 19.20,
    textAlign: 'left',
    padding: 10,
    margin: '2.5%',
    //marginTop: '8%',
    fontFamily: 'Montserrat_500Medium', 
  },
})