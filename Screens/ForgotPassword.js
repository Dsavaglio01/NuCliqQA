import { StyleSheet, Text, View, ImageBackground } from 'react-native'
import React, { useState, useEffect } from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import InputBox from '../Components/InputBox'
import NextButton from '../Components/NextButton'
import useAuth from '../Hooks/useAuth'
import { useNavigation } from '@react-navigation/native'
import { useFonts, Montserrat_400Regular, Montserrat_500Medium } from '@expo-google-fonts/montserrat'
const ForgotPassword = () => {
    const navigation = useNavigation();
    const [submitted, setSubmitted] = useState(false);
    const {user} = useAuth();
    const [email, setEmail] = useState('');
    const {forgotPassword} = useAuth();
    //console.log(email)
    useEffect(() => {
      if (submitted) {
        setTimeout(() => {
        setSubmitted(false)
      }, 60000);
      }
    }, [submitted])
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_400Regular
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <ImageBackground style={styles.logIncontainer} source={require('../assets/background2.jpg')} resizeMode="cover">
      <View style={styles.main}>
        <RegisterHeader onPress={() => navigation.goBack()} forgot={true}/>
        <View style={styles.mainHeader}>
          <Text style={{fontSize: 32, color: "#fff", padding: 10, fontFamily: 'Montserrat_400Regular'}}>Forgot Password?</Text>
          <Text style={styles.paragraph}>No Worries, We'll Send you Reset Instructions</Text>
        </View>
        <View style={{marginLeft: '5%', marginRight: '5%', marginTop: '10%'}}>
          {!submitted ? <InputBox text={'Email Address'} icon='email' onChangeText={setEmail} keyType={'done'} value={email} containerStyle={{width: '90%'}}/> :
          <>
          <Text style={styles.resetText}>Email Sent to <Text style={{fontWeight: '700'}}>{email}</Text>!</Text>
          <Text style={styles.resetText}>Email may Take a Few Moments to Appear</Text>
          </>
          }
          {submitted ? <View style={{marginTop: '15%', width: '90%', marginLeft: '5%'}}>
            <NextButton text={"Reset Password"} onPress={() => {forgotPassword(email); setSubmitted(true)}}/>
          </View> : null}
          
        </View>
      </View>
    </ImageBackground>
  )
}

export default ForgotPassword

const styles = StyleSheet.create({
    logIncontainer: {
      flex: 1,
      alignItems: 'center',
        justifyContent: 'center'
  },
  mainHeader: {
        backgroundColor: "#27293d",
        borderRadius: 8,
        width: '90%',
        marginTop: '7.5%',
        marginLeft: '5%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    main: {
          backgroundColor: '#ffffffe6',
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
    paragraph: {
        fontSize: 15.36,
        paddingBottom: '5%',
        paddingHorizontal: '5%',
        //paddingRight: '22.5%',
        //paddingLeft: 0,
        //paddingTop: 15,
        color: "#fff",
        fontFamily: 'Montserrat_400Regular'
    },
    resetText: {
      fontSize: 19.20,
      color: "#000",
      fontFamily: 'Montserrat_500Medium',
      padding: 5,
      textAlign: 'center'
    }
})