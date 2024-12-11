import { TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Text, View, Keyboard } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { collection, getDoc, getDocs, getFirestore, onSnapshot, query, where, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import RegisterHeader from '../Components/RegisterHeader';
import {MaterialCommunityIcons} from '@expo/vector-icons'
import NextButton from '../Components/NextButton';
import ThemeHeader from '../Components/ThemeHeader';
import { Divider } from 'react-native-paper';
import InputBox from '../Components/InputBox';
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
import Checkbox from 'expo-checkbox';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { db } from '../firebase'
const ReportProblem = () => {
  
    const {user} = useAuth()
    const navigation = useNavigation();
    const theme = useContext(themeContext)
    const [sentReport, setSentReport] = useState(false);
    const [report, setReport] = useState('');
    const [bugChecked, setBugChecked] = useState(false);
    const [uxChecked, setUxChecked] = useState(false);
    const [securityChecked, setSecurityChecked] = useState(false);
    const [messagesChecked, setMessagesChecked] = useState(false);
    const [notificationsChecked, setNotificationsChecked] = useState(false);
    const [themesChecked, setThemesChecked] = useState(false);
    const [postingChecked, setPostingChecked] = useState(false);
    const [addingChecked, setAddingChecked] = useState(false);
    const [othersChecked, setOthersChecked] = useState(false);
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
    //console.log(posts[0])
  //console.log(posts.length)
  const sendReport = () => {
    addDoc(collection(db, 'feedback'), {
      userId: user.uid,
      timestamp: serverTimestamp(),
      category: bugChecked ? 'Bugs/Errors' : uxChecked ? 'User Experience' : securityChecked ? 'Security' : messagesChecked ? 'Messages' : notificationsChecked ? 'Notifications' : themesChecked ? 'Themes' : postingChecked ? 'Posting(Images, Videos, Vibes)' : addingChecked ? 'Adding/Removing Friends' : othersChecked ? 'Other' : null,
      feedback: report
    }).then(() => setSentReport(true))
  }
  
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <ThemeHeader backButton={true} video={false} text={"Report a Problem"}/>
      <Divider borderWidth={0.4} borderColor={theme.color}/>
      {sentReport ? <View style={{alignItems: 'center'}}>
        <Text style={[styles.headerText, {color: theme.color}]}>Report Sent!</Text>
        </View> : 
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView>
        <Text style={[styles.headerText, {color: theme.color}]}>We will help you as soon as we can if you can describe the problem below!</Text>
        <View style={{flexDirection: 'row', marginLeft: '2.5%', width: '90%', marginBottom: '5%', flexWrap: 'wrap'}}>
            <TouchableOpacity activeOpacity={1} onPress={() => {setBugChecked(!bugChecked)}} style={{flexDirection: 'row', alignItems: 'center', marginLeft: '5%'}}>
                    <Checkbox value={bugChecked} onValueChange={() => {setBugChecked(!bugChecked)}} color={bugChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                    <View >
                    <Text style={[styles.paragraph, {color: theme.color}]}>Bugs/Errors</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1} onPress={() => {setUxChecked(!uxChecked)}} style={{flexDirection: 'row', alignItems: 'center', marginLeft: '5%'}}>
                    <Checkbox value={uxChecked} onValueChange={() => {setUxChecked(!uxChecked)}} color={uxChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                    <View >
                    <Text style={[styles.paragraph, {color: theme.color}]}>User Experience</Text>
                    </View>
                </TouchableOpacity>   
                <TouchableOpacity activeOpacity={1} onPress={() => {setSecurityChecked(!securityChecked)}} style={{flexDirection: 'row', alignItems: 'center', marginLeft: '5%', marginTop: '5%'}}>
                    <Checkbox value={securityChecked} onValueChange={() => {setSecurityChecked(!securityChecked)}} color={securityChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                    <View >
                    <Text style={[styles.paragraph, {color: theme.color}]}>Security</Text>
                    </View>
                </TouchableOpacity>   
                <TouchableOpacity activeOpacity={1} onPress={() => {setMessagesChecked(!messagesChecked)}} style={{flexDirection: 'row', alignItems: 'center', marginLeft: '5%', marginTop: '5%'}}>
                    <Checkbox value={messagesChecked} onValueChange={() => {setMessagesChecked(!messagesChecked)}} color={messagesChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                    <View >
                    <Text style={[styles.paragraph, {color: theme.color}]}>Messages</Text>
                    </View>
                </TouchableOpacity>   
                <TouchableOpacity activeOpacity={1} onPress={() => {setNotificationsChecked(!notificationsChecked)}} style={{flexDirection: 'row', alignItems: 'center', marginLeft: '5%', marginTop: '5%'}}>
                    <Checkbox value={notificationsChecked} onValueChange={() => {setNotificationsChecked(!notificationsChecked)}} color={notificationsChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                    <View >
                    <Text style={[styles.paragraph, {color: theme.color}]}>Notifications</Text>
                    </View>
                </TouchableOpacity>   
                <TouchableOpacity activeOpacity={1} onPress={() => {setThemesChecked(!themesChecked)}} style={{flexDirection: 'row', alignItems: 'center', marginLeft: '5%', marginTop: '5%'}}>
                    <Checkbox value={themesChecked} onValueChange={() => {setThemesChecked(!themesChecked)}} color={themesChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                    <View >
                    <Text style={[styles.paragraph, {color: theme.color}]}>Themes</Text>
                    </View>
                </TouchableOpacity>   
                <TouchableOpacity activeOpacity={1} onPress={() => {setPostingChecked(!postingChecked)}} style={{flexDirection: 'row', alignItems: 'center', marginLeft: '5%', marginTop: '5%'}}>
                    <Checkbox value={postingChecked} onValueChange={() => {setPostingChecked(!postingChecked)}} color={postingChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                    <View >
                    <Text style={[styles.paragraph, {color: theme.color}]}>Posting(Images, Videos, Vibes)</Text>
                    </View>
                </TouchableOpacity> 
                <TouchableOpacity activeOpacity={1} onPress={() => {setAddingChecked(!addingChecked)}} style={{flexDirection: 'row', alignItems: 'center', marginLeft: '5%', marginTop: '5%'}}>
                    <Checkbox value={addingChecked} onValueChange={() => {setAddingChecked(!addingChecked)}} color={addingChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                    <View >
                    <Text style={[styles.paragraph, {color: theme.color}]}>Adding/Removing Friends</Text>
                    </View>
                </TouchableOpacity> 
                <TouchableOpacity activeOpacity={1} onPress={() => {setOthersChecked(!othersChecked)}} style={{flexDirection: 'row', alignItems: 'center', marginLeft: '5%', marginTop: '5%'}}>
                    <Checkbox value={othersChecked} onValueChange={() => {setOthersChecked(!othersChecked)}} color={othersChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                    <View >
                    <Text style={[styles.paragraph, {color: theme.color}]}>Others</Text>
                    </View>
                </TouchableOpacity>      
            </View>
        <InputBox maxLength={200} key={handleKeyPress} multiline={true} multilineStyle={{height: 200}} value={report} onChangeText={handleReport}/>
        <Text style={[styles.editText, {color: theme.color}]}>{report.length}/200</Text>
        <View style={{margin: '5%', marginTop: 0}}>
            <NextButton text={"Send Report"} onPress={report.length > 0 && (bugChecked || uxChecked || addingChecked || othersChecked || themesChecked || postingChecked || messagesChecked || securityChecked || notificationsChecked) ? () => sendReport() : null}/>
        </View>
        
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>}
      
    </View>
  )
}

export default ReportProblem

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    marginTop: '5%'
    },
  headerText: {
    fontSize: 19.20,
    textAlign: 'left',
    padding: 10,
    margin: '2.5%',
    //marginTop: '8%',
    fontFamily: 'Montserrat_500Medium', 
  },
  image: {
    width: 165,
    height: 165,
    borderRadius: 15
  },
  editText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium', 
    margin: '5%',
    textAlign: 'right'
  },
  paragraph: {
    paddingLeft: 5,
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
  }
})