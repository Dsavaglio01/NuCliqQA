import { StyleSheet, Text, View, Alert, TouchableOpacity} from 'react-native'
import React, {useState} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import Checkbox from 'expo-checkbox'
import NextButton from '../Components/NextButton'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, auth } from '../firebase'

const Or = () => {
    const navigation = useNavigation();
    const [userChecked, setUserChecked] = useState(false);
    const [businessChecked, setBusinessChecked] = useState(false);
    const {user} = useAuth()
    const setUserProfile = async(item) => {
    
        await setDoc(doc(db, item, user.uid), {
            timestamp: serverTimestamp()
        }).then(() => navigation.navigate('Name', {type: item}))
    }
    const noSelectionAlert = () => {
        Alert.alert('No Account Selected', 'Please Select an Account Type to Continue', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])
    }
  return (
    <View style={styles.container}>
        <RegisterHeader onPress={() => navigation.goBack()}/>
        <View style={styles.main}>
            <Text style={styles.header}>Type of Account</Text>
            <TouchableOpacity activeOpacity={1} onPress={() => {setUserChecked(true); setBusinessChecked(false)}} style={userChecked ? [styles.optionContainer, {borderColor: "#005278"}] : styles.optionContainer}>
                <Checkbox style={{marginLeft: '2.5%'}} onValueChange={() => {setUserChecked(true); setBusinessChecked(false)}} value={userChecked} color={userChecked ? '#005278' : "#191b1e"}/>
                <Text style={styles.optionText}>User</Text>
            </TouchableOpacity>
            <Text style={styles.optionHeaderText}>With a Regular User Account you are Able to: </Text>
            <Text style={styles.optionSupplementaryText}>{'\u2B24'} Lorem ipsum dolor sit amet, consectetur adipiscing elit</Text>
            <Text style={[styles.optionSupplementaryText, {paddingTop: 0}]}>{'\u2B24'} Lorem ipsum dolor sit amet, consectetur adipiscing elit</Text>
            <Text style={[styles.optionSupplementaryText, {paddingTop: 0}]}>{'\u2B24'} Lorem ipsum dolor sit amet, consectetur adipiscing elit</Text>
            <TouchableOpacity activeOpacity={1} onPress={() => {setBusinessChecked(true); setUserChecked(false)}}  style={businessChecked ? [styles.optionContainer, {borderColor: "#005278"}] : styles.optionContainer}>
                <Checkbox style={{marginLeft: '2.5%'}} onValueChange={() => {setBusinessChecked(true); setUserChecked(false)}} value={businessChecked} color={businessChecked ? '#005278' : "#191b1e"}/>
                <Text style={styles.optionText}>Business</Text>
            </TouchableOpacity>
            <Text style={styles.optionHeaderText}>With a Business Account you are Able to: </Text>
            <Text style={styles.optionSupplementaryText}>{'\u2B24'} Lorem ipsum dolor sit amet, consectetur adipiscing elit</Text>
            <Text style={[styles.optionSupplementaryText, {paddingTop: 0}]}>{'\u2B24'} Lorem ipsum dolor sit amet, consectetur adipiscing elit</Text>
            <Text style={[styles.optionSupplementaryText, {paddingTop: 0}]}>{'\u2B24'} Lorem ipsum dolor sit amet, consectetur adipiscing elit</Text>
            <View style={{marginTop: '10%'}}>
                <NextButton text={'Next'} onPress={!userChecked && !businessChecked ? () => noSelectionAlert() : userChecked ? () => setUserProfile('user') : () => setUserProfile('business') }/>
            </View>
        </View>
        
    </View>
  )
}

export default Or

const styles = StyleSheet.create({
    container: {
        flex:1,
    },
    main: {
        marginHorizontal: '5%',
        marginVertical: '5%'
    },
    header: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center'
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: "transparent",
        margin: '2.5%',
        borderRadius: 8,
    },
    optionText: {
        padding: 10,
        fontSize: 19.20
    },
    optionHeaderText: {
        fontSize: 15.36
    },
    optionSupplementaryText: {
        fontSize: 12.29,
        padding: 25
    }
})