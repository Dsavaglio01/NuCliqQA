import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import PreviewFooter from '../Components/PreviewFooter';
import { useNavigation } from '@react-navigation/native';
import ThemeHeader from '../Components/ThemeHeader';
import { Divider } from 'react-native-paper';
import NextButton from '../Components/NextButton';
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
import { db } from '../firebase'
const TransactionSummary = ({route}) => {
  const {price, chargeId, customer, themeName, userName} = route.params;
  //console.log(chargeId)
  const navigation = useNavigation();
  const theme = useContext(themeContext)
    // const price = '200'
    // const chargeId = '123456789'
    // const customer = 'NUCUS12345'
    // const themeName = 'Nature'
    // const userName = 'stem369'
   
    const {user} = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    useEffect(() => {
        const docSnap = async() => {
            setFirstName((await getDoc(doc(db, 'profiles', user.uid))).data().firstName)
            setLastName((await getDoc(doc(db, 'profiles', user.uid))).data().lastName)
        }
        docSnap();
    }, [])
    const options = { timeZoneName: 'short' };
    //console.log(new Date().toLocaleString(undefined, options).split(' '))
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
        <ThemeHeader text={"Get Themes"} video={false}/>
        <Divider borderWidth={0.4}/>
        {/* <View style={{borderBottomWidth: 1}}>
            <Text style={styles.headerText}>NU Transaction ID: {chargeId}</Text>
        </View> */}
        <View style={{backgroundColor: theme.backgroundColor}}>
            <View style={{flexDirection: 'row'}}>
                <Text style={styles.receiptText}>Transaction Date:</Text>
                <Text style={styles.dataReceiptText}>{new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()} {new Date().toLocaleString(undefined, options).split(' ')[3]}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
                <Text style={styles.receiptText}>Payment Intent (Transaction) ID:</Text>
                <Text style={styles.dataReceiptText}>{chargeId}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
                <Text style={styles.receiptText}>Customer ID:</Text>
                <Text style={styles.dataReceiptText}>{customer}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
                <Text style={styles.receiptText}>Purchased Item:</Text>
                <Text style={styles.dataReceiptText}>{`${themeName}`} Theme</Text>
            </View>
            {/* <Text style={styles.receiptText}>Customer Name: <Text style={{fontWeight: '600'}}>{firstName} {lastName}</Text></Text>
            <Text style={styles.receiptText}>Customer ID: <Text style={{fontWeight: '600'}}>{customer}</Text></Text>
            <Text style={styles.receiptText}>Purchased Item: <Text style={{fontWeight: '600'}}>{`${userName}'s`} {`${themeName}`} Theme</Text></Text> */}
        </View>
        <View>
            <View style={{flexDirection: 'row'}}>
                <Text style={styles.receiptText}>Item Price:</Text>
                <Text style={styles.dataReceiptText}>${(price / 100).toFixed(2)}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
                <Text style={styles.receiptText}>Tax:</Text>
                <Text style={styles.dataReceiptText}>${((price * 0.06) / 100).toFixed(2)} (6%)</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
                <Text style={styles.receiptText}>Processing Fee:</Text>
                <Text style={styles.dataReceiptText}>${(((price * 0.03) / 100) + 0.3).toFixed(2)} (3% + 30&#162;)</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
                <Text style={styles.receiptText}>Total Amount:</Text>
                <Text style={styles.dataReceiptText}>${((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3).toFixed(2)}</Text>
            </View>
        </View>
        <Text style={[styles.headerText, {textAlign: 'center', backgroundColor: 'transparent', marginTop: '5%'}]}>An Email Has Been Sent to {user.email} And Your Theme Will be Present Under 'My Themes' Shortly!</Text>
        {/* <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: '5%'}}>
            <PreviewFooter text={"Continue"} onPress={() => navigation.navigate('All', {name: null})}/>
        </View> */}
        <View style={{marginLeft: '5%', marginRight: '5%', marginTop: '15%'}}>
          <NextButton text={"FINISH"} onPress={() => navigation.navigate('All', {name: null, goToPurchased: true})}/>
        </View>
    </View>
  )
}

export default TransactionSummary

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    previewThemeContainer: {
    margin: '5%',
    marginTop: '10%',
    marginBottom: "2.5%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  barColor: {
        borderColor: '#3286ac'
    },
  previewHeader: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_600SemiBold',
    padding: 5,
    textAlign: 'center'
  },
  previewContainer: {
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    borderColor: "#979797"
  },
  headerText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_600SemiBold',
    padding: 15,
    backgroundColor: "#eee",
    
    //borderColor: "#000"
  },
  receiptText: {
    padding: 10,
    paddingLeft: 10,
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    width: '50%',
    textAlign: 'right'
  },
  dataReceiptText: {
    padding: 10,
    paddingLeft: 10,
    fontSize: 15.36,
    fontFamily: 'Montserrat_600SemiBold',
    width: '50%',
    textAlign: 'left'
  }

})