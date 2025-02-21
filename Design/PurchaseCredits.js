import { Button, StyleSheet, Text, Alert, TouchableOpacity, View, Image, TextInput, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Modal, ActivityIndicator } from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import { PaymentSheet, StripeProvider, SetupIntent, PaymentIntent, useStripe } from '@stripe/stripe-react-native'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import useAuth from '../Hooks/useAuth';
import { getDoc, addDoc, orderBy, updateDoc, getFirestore, collection, doc, arrayUnion, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-paper';
import ThemeHeader from '../Components/ThemeHeader';
import RadioButtonGroup, { RadioButtonItem } from "expo-radio-button"
import {BACKEND_URL} from "@env"
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
import Purchases from 'react-native-purchases'
const PurchaseCredits = ({route}) => {
    const [cvc, setCvc] = useState();
    const theme = useContext(themeContext)
    const [CVCModal, setCVCModal] = useState(false);
    const {user} = useAuth()
    const navigation = useNavigation();
    const [firstName, setFirstName] = useState();
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(true);
    const email = user.email
    const [done, setDone] = useState(false);
    const [chargeCVCId, setChargeCVCId] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [customerId, setCustomerId] = useState()
    const { initPaymentSheet, presentPaymentSheet, createTokenForCVCUpdate} = useStripe();
    const [chargeId, setChargeId] = useState();
    const [packages, setPackages] = useState([])
    const [paymentMethodID, setPaymentMethodID] = useState(null);
    const [lastFour, setLastFour] = useState([]);
    const [useOtherCard, setUseOtherCard] = useState(false);
    useEffect(() => {
    // Get current available packages
    const getPackages = async () => {
      try {
        const offerings = await Purchases.getOfferings()
        console.log(offerings)
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          console.log(offerings.current.availablePackages[0].product)
  }

      } catch (e) {
        Alert.alert('Error getting offers', e.message);
      }
    };

    getPackages();
  }, []);
  useEffect(() => {
    const getProfileDetails = async() => {
    const docSnap = await getDoc(doc(db, 'profiles', user.uid)); 
    if (docSnap.exists()) {
      const profileSnap = (await getDoc(doc(db, 'profiles', user.uid))).data()
      if (profileSnap.paymentMethodID == undefined) {
        setPaymentMethodID(null)
      }
      else {
        setPaymentMethodID(profileSnap.paymentMethodID)
      }
      setFirstName(profileSnap.firstName);
      setLastName(profileSnap.lastName)
      setLastFour(profileSnap.paymentMethodLast4)
      setCustomerId(profileSnap.customerId)
    } 
    
  }
   setTimeout(() => {
    setDone(true);
  }, 1000);
  getProfileDetails();
  }, [])
  useEffect(() => {
        if (done) {
    const performFunction = async() => {
        if ((firstName != undefined) && paymentMethodID == null ) {
      
      await initializePaymentSheet();
    }
    else if ((firstName != undefined) && paymentMethodID != null ) {
      setCVCModal(true)
    }
      }
    performFunction()
        }
  }, [done])

  //onsole.log(product)
  
  
  const dataToSend = {
    price: 100,
    email: user.email
  }
  const dataToSendToSaved = {
    email: user.email,
    paymentMethodID: paymentMethodID,
    cvcToken: cvc,
    customer: customerId
    //paymentIntentID: paymentIntentID
  }
  //console.log(stripeId)
    const fetchPaymentSheetParams = async () => {
        const response = await fetch(`${BACKEND_URL}/api/purchaseEndpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend)
    });
    const { paymentIntent, ephemeralKey, customer, paymentIntentId} = await response.json()
    setCustomer(customer)
    console.log(customer);
    return {
      paymentIntent,
      ephemeralKey,
      customer,
      paymentIntentId
    };
    
  };
  //console.log(paymentMethodID)
  const initializePaymentSheet = async () => {
    console.log('seconf')
      const {
      paymentIntent,
      ephemeralKey,
      customer,
      paymentIntentId
    } = await fetchPaymentSheetParams()
    const { error } = await initPaymentSheet({
      merchantDisplayName: "NuCliq",
      customerId: customer,
      
      //amount: price,
      customerEphemeralKeySecret: ephemeralKey,
      //etupIntentClientSecret: true,
      //setupIntentClientSecret
      paymentIntentClientSecret: paymentIntent,
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
      //methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: false,
      billingDetailsCollectionConfiguration: {
          address: PaymentSheet.AddressCollectionMode.FULL,
          name: PaymentSheet.CollectionMode.ALWAYS,
        
      },
      defaultBillingDetails: {
        name: `${firstName} ${lastName}`,
        address: {
                    country: 'US'
                },
                
      },
      
    });
    if (!error) {
      //setLoading(true);
      setChargeId(paymentIntentId)
      setCustomer(customer)
    }
    else {
      console.log(error)
    }
  
  };
  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet()
    
    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
      navigation.goBack()
    } 
    else {
      retreivePayment()

    } 
  };
  async function payUsingCVC() {
    const { tokenId, error } = await createTokenForCVCUpdate(cvc);
    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
      return;
    } else if (tokenId) {
      //console.log('second')
      const response = await fetch(`${BACKEND_URL}/api/savedCardEndpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
    price: 100,
    email: user.email,
    paymentMethodID: paymentMethodID,
    cvcToken: tokenId,
    customer: customerId
  })
    });
    const {customer, paymentIntentId, error} = await response.json()
    //retreivePayment()
    //setCustomer(customer)
    //console.log(customer);
    //console.log(tempResponse)
    if (!error) {
      //setLoading(true);
      //setChargeId(paymentIntentId)
      setChargeCVCId(paymentIntentId)
      //openPaymentSheet()
      //console.log(customer)
      setCustomer(customer)
    }
    else {
      Alert.alert(error)
      navigation.goBack()
    }
    return {
      customer, paymentIntentId
    };
      //setCvc(tokenId)
      //fetchPaymentSheetParams()
  }
}
const retreivePayment = async() => {
    //
    if (chargeCVCId != null) {
      fetch(`${BACKEND_URL}/api/retrieveEndpoint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: chargeCVCId, customerId: customer})
      }).then(response => response.json())
      .then(async(responseData) => {
      // Handle the response from the server
        if (responseData.futureUsage != null) {
        await updateDoc(doc(db, 'profiles', user.uid), {
        paymentMethodID: responseData.paymentMethodID,
        paymentMethodLast4: arrayUnion(responseData.lastFour),
        customerId: customer,
        credits: increment(10)
      }).then(() => Alert.alert('Success', 'Your order is confirmed! The NuCliq Credits will be updated shortly!')).then(() => setLoading(false)).finally(() =>
      setTimeout(() => {
        navigation.goBack()
      }, 3000))
      
      }
      else {
         
        await updateDoc(doc(db, 'profiles', user.uid), {
        credits: increment(10)
      }).then(() => Alert.alert('Success', 'Your order is confirmed! The NuCliq Credits will be updated shortly!')).then(() => setLoading(false)).finally(() =>
      setTimeout(() => {
        navigation.goBack()
      }, 3000))
      }
      

      //console.log(responseData);
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error(error);
    })
    } 
    else {
      fetch(`${BACKEND_URL}/api/retrieveEndpoint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: chargeId, customerId: customer})
      }).then(response => response.json())
      .then(async(responseData) => {
        if (responseData.futureUsage != null) {
           
        await updateDoc(doc(db, 'profiles', user.uid), {
        paymentMethodID: responseData.paymentMethodID,
        paymentMethodLast4: arrayUnion(responseData.lastFour),
        customerId: customer,
        credits: increment(10)
      }).then(() => Alert.alert('Success', 'Your order is confirmed! The NuCliq Credits will be updated shortly!')).then(() => setLoading(false)).then(() =>
      setPurchasing(false)).finally(() => navigation.goBack())
      }
      else {
         
        await updateDoc(doc(db, 'profiles', user.uid), {
        credits: increment(10)
      }).then(() => Alert.alert('Success', 'Your order is confirmed! The NuCliq Credits will be updated shortly!')).then(() => setLoading(false)).then(() =>
      setPurchasing(false)).finally(() => navigation.goBack())
      }
      

      //console.log(responseData);
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error(error);
    })
    }
}
//console.log(useOtherCard)
const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_400Regular,
    Montserrat_700Bold,
    Montserrat_500Medium,
    Montserrat_600SemiBold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={{ flex : 1, backgroundColor: theme.backgroundColor}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <>
      <ThemeHeader text={"Get Themes"} video={false} backButton={true}/>
      <Divider borderWidth={0.4} borderColor={theme.color}/>
      <Modal visible={CVCModal} animationType='slide' onRequestClose={() => setCVCModal(false)} transparent>
        <View style={styles.centeredView}>
          <View style={[styles.modalView, {backgroundColor: theme.backgroundColor}]}>
            <MaterialCommunityIcons name='close' color={theme.color} size={30} style={{textAlign: 'right', padding: 10}} onPress={() => {setCVCModal(false); navigation.goBack()}}/>
            <Text style={{fontSize: 19.20, textAlign: 'center', fontFamily: 'Montserrat_500Medium', color: theme.color}}>Please enter CVC for card ending in {lastFour != undefined && lastFour.length > 0 ? lastFour[0] : <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />}</Text>
            <View style={{alignItems: 'center'}}>
              <TextInput value={cvc} onChangeText={setCvc} placeholder='CVC' onSubmitEditing={() => {setCVCModal(false); payUsingCVC()}} style={{borderWidth: 1, borderColor: theme.color, marginTop: '5%', fontSize: 15.36, fontFamily: 'Montserrat_500Medium', padding: 10, borderRadius: 8, color: theme.color}} returnKeyType='done' keyboardType='numeric'/>
            </View>
            <RadioButtonGroup
                containerStyle={{ marginTop: '25%', marginLeft: '2.5%'}}
                selected={useOtherCard}
                onSelected={() => {setUseOtherCard(true); setCVCModal(false); setPaymentMethodID(null); initializePaymentSheet()}}
                containerOptionStyle={{margin: 5, marginBottom: '10%'}}
                radioBackground={theme.theme != 'light' ? "#9EDAFF" : "#005278"}
                size={22.5}
                radioStyle={{alignSelf: 'flex-start'}}
      >
        <RadioButtonItem value={useOtherCard == true ? useOtherCard: null} label={
        <View style={{marginLeft: '2.5%'}}>
            <Text style={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium', color: theme.color}}>Use Another Card</Text>
        </View>
    }/>
    </RadioButtonGroup>
          </View>
        </View>
      </Modal>
      <StripeProvider publishableKey={'pk_live_51N5AxSJM3BhfSRhsCg2NNuvCrh2vYQAy3c2WPvYUIn4ijgvlREwEZG6aVfn2opRofDwkHoqw3RQaPvHYVw0JsdCt00mEdYGM3s'}>
            {loading ? <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>

              <ActivityIndicator size={'large'} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />


            </View> : null}
            
      </StripeProvider>
      </>
    </TouchableWithoutFeedback>
    </View>
  )
}

export default PurchaseCredits

const styles = StyleSheet.create({
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
  previewText: {
    padding: 5,
    fontSize: 12.29,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  fieldText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    color: "#090909"
  },
  transactionText: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    alignSelf: 'center',
    paddingLeft: 15
  },
  emailText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
  },
  nameInput: {
    borderTopWidth: 1,
    width: '105%',
    marginLeft: '-1.5%',
    borderColor: "lightgray",
    //margin: '2.5%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 10,
    paddingLeft: 18,
    //color: 'grey'
  },
  futureText: {
    alignSelf: 'center',
    paddingLeft: 15,
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
  },
  selectStateText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    alignSelf: 'center'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: '10%'
  },
  modalView: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    //padding: 150,
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
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
})