import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState, useMemo, useContext } from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import ThemeHeader from '../Components/ThemeHeader';
import InputBox from '../Components/InputBox';
import NextButton from '../Components/NextButton';
import { addDoc, collection, doc, serverTimestamp, getDocs, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../Hooks/useAuth';
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
const GroupSettingsSettings = ({route}) => {
    const navigation = useNavigation();
    const {id, cliqueName, admin} = route.params;
    const theme = useContext(themeContext)
    const [contactAdmin, setContactAdmin] = useState(false);
    const [adminFeedback, setAdminFeedback] = useState('');
    const [requestAdmin, setRequestAdmin] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const {user} = useAuth();
    
    useEffect(() => {
        const getData = async() => {
            const feedback = await getDoc(doc(db, 'groups', id))
            if (feedback.exists()) {
                if (feedback.data().adminContacts.includes(user.uid)) {
                setFeedbackSent(true)
            }
            if (feedback.data().requestsSent.includes(user.uid)) {
                setRequestSent(true)
            }
            }
            
        }
        getData()
    }, [])
    const sendRequest = async() => {
       setRequestSent(true)
        await addDoc(collection(db, 'groups', id, 'adminRequests'), {
            userId: user.uid,
            timestamp: serverTimestamp()
        }).then(async() => await updateDoc(doc(db, 'groups', id), {
      requestsSent: arrayUnion(user.uid)
    }))
    }
    const sendFeedback = async() => {
        setFeedbackSent(true)
        await addDoc(collection(db, 'groups', id, 'adminContacts'), {
            userId: user.uid,
            feedback: adminFeedback,
            timestamp: serverTimestamp()
        }).then(async() => await updateDoc(doc(db, 'groups', id), {
            adminContacts: arrayUnion(user.uid)
        }))
    }
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <ThemeHeader text={"Cliq Settings"} backButton={true} />
        <Divider borderBottomWidth={0.4} borderBottomColor={theme.color}/>
        {admin ? <>
        <View style={{margin: '5%'}}>
            <Text style={[styles.titleText, {color: theme.color}]}>Edit Cliq</Text>
            <TouchableOpacity style={styles.optionContainer} onPress={() => navigation.navigate('EditClique', {id: id, cliqueName: cliqueName, name: true, banner: false, pfp: false, privacy: false})}>
                <Text style={[styles.optionText, {color: theme.color}]}>Name and Description</Text>
                <MaterialCommunityIcons name='chevron-right' size={30} color={theme.color}/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionContainer} onPress={() => navigation.navigate('EditClique', {id: id, name: false, banner: true, pfp: false, privacy: false})}>
                <Text style={[styles.optionText, {color: theme.color}]}>Banner</Text>
                <MaterialCommunityIcons name='chevron-right' size={30}  color={theme.color}/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionContainer} onPress={() => navigation.navigate('GroupCategory', {edit: true, id: id})}>
                <Text style={[styles.optionText, {color: theme.color}]}>Category</Text>
                <MaterialCommunityIcons name='chevron-right' size={30}  color={theme.color}/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionContainer} onPress={() => navigation.navigate('EditClique', {id: id, name: false, banner: false, pfp: false, privacy: true})}>
                <Text style={[styles.optionText, {color: theme.color}]}>Privacy</Text>
                <MaterialCommunityIcons name='chevron-right' size={30}  color={theme.color}/>
            </TouchableOpacity>
            
        </View>
        
        </> : <>
        <View style={{marginTop: '2.5%'}}>
            <TouchableOpacity style={!requestAdmin ? styles.userContainer : [styles.userContainer, {borderBottomWidth: 0}]} onPress={() => setRequestAdmin(!requestAdmin)}>
                <Text style={[styles.optionText, {color: theme.color}]}>Request to be an Admin</Text>
                {!requestAdmin ? <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/> : 
                <MaterialCommunityIcons name='chevron-down' size={30} style={{alignSelf: 'center'}} color={theme.color}/>}
                
            </TouchableOpacity>
            {requestAdmin ? 
            <View style={{marginBottom: '5%'}}>
                {!requestSent ? <View style={{marginTop: '2.5%', marginRight: '5%', marginLeft: '5%'}}>
                <View style={{justifyContent: 'flex-end'}}>
                    <NextButton text={"Send Request to be an Admin"} onPress={() => sendRequest()}/>
                    <Text style={[styles.noteText, {color: theme.color}]}>Note: You can only request to be an admin once. Once sent, you will get a notification that you have been accepted as an admin (if accepted).</Text>
                </View>
            </View> : <View>
                <Text style={[styles.sendText, {color: theme.color}]}>Request Sent!</Text>
                </View>
                }
            
            
            </View>
            : null
            }
        </View>
        </>
        }
        
    </View>
  )
}

export default GroupSettingsSettings

const styles = StyleSheet.create({
    container: {
        flex: 1, 
    },
    header: {
        flexDirection: 'row',
        marginLeft: '2.5%',
        marginRight: '2.5%',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '8%',
        marginBottom: '1.5%'
    },
    headerText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_600SemiBold',
        marginRight: 'auto',
        marginLeft: 'auto'
        //textAlign: 'center'
        //marginLeft: 'auto'
    },
    titleText: {
        fontSize: 24,
        fontFamily: 'Montserrat_700Bold',
        paddingBottom: '2.5%'
    },
    optionText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        //fontWeight: '700',
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '2.5%',
         paddingBottom: '2.5%',
         borderBottomWidth: 0.5,
         borderBottomColor: "#d3d3d3"
    },
    userContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: '2.5%',
        paddingBottom: '5%',
        marginHorizontal: '5%',
        borderBottomWidth: 0.4
    },
    noteText: {
        fontSize: 12.29,
        padding: 12.5,
        textAlign: 'center',
         fontFamily: 'Montserrat_500Medium',
    },
    sendText: {
        fontSize: 19.20,
        //padding: 10,
        textAlign: 'center',
        fontFamily: 'Montserrat_500Medium',
    }
})