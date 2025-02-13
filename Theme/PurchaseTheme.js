import { Button, StyleSheet, Text, Alert, TouchableOpacity, View, Image, TextInput, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Modal, ActivityIndicator } from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import { AddToWalletButton, CardField, CardForm, CardFormView, createPaymentMethod, confirmPaymentMethod, initPaymentSheet, PaymentSheet, StripeProvider, SetupIntent, PaymentIntent, useStripe } from '@stripe/stripe-react-native'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import useAuth from '../Hooks/useAuth';
import { where, collection, onSnapshot, query, getDocs, setDoc, getDoc, addDoc, orderBy, updateDoc, getFirestore, doc, arrayUnion, serverTimestamp, increment } from 'firebase/firestore';

import { useNavigation } from '@react-navigation/native';
import Theme from './Theme';
import { Divider } from 'react-native-paper';
import ThemeHeader from '../Components/ThemeHeader';
import RadioButtonGroup, { RadioButtonItem } from "expo-radio-button"
import {BACKEND_URL} from "@env"
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
import { db } from '../firebase'
const PurchaseTheme = ({route}) => {
    const {groupId, product, free, price, metadata, keywords, themeName, source, userName, userId, notificationToken, addressDetails} = route.params
    //console.log(themeName)
    //console.log(userName)
    const [products, setProducts] = useState([]);
    const [cvc, setCvc] = useState();
    const [CVCModal, setCVCModal] = useState(false);
    const [prices, setPrices] = useState([]);
    const {user} = useAuth()
    const [currency, setCurrency] = useState('usd');
    const navigation = useNavigation();
    const [finalPrice, setFinalPrice] = useState(0);
    //const [id, setId] = useState(null);
    const [streetAddress, setStreetAddress] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [stateModal, setStateModal] = useState(false);
    const [firstName, setFirstName] = useState('');
    const modeTheme = useContext(themeContext);
    const [done, setDone] = useState(false);
    const [lastName, setLastName] = useState('');
    const [stripeId, setStripeId] = useState();
    //const [keywords, setkeywords] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [username, setUserName] = useState(null);
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const email = user.email
    const [chargeCVCId, setChargeCVCId] = useState(null);
    const [saveCard, setSaveCard] = useState(false);
    const [customer, setCustomer] = useState(null);
    const [customerId, setCustomerId] = useState()
    const { initPaymentSheet, presentPaymentSheet, confirmPayment, createTokenForCVCUpdate} = useStripe();
    const [chargeId, setChargeId] = useState();
    const [futureUsage, setFutureUsage] = useState();
    const [paymentMethodID, setPaymentMethodID] = useState(null);
    const [lastFour, setLastFour] = useState([]);
    const [useOtherCard, setUseOtherCard] = useState(false);
    const docRef = doc(db, "profiles", user.uid);
  useEffect(() => {
    const getProfileDetails = async() => {
    const docSnap = await getDoc(docRef); 
    const idSnap = await getDoc(doc(db, 'products', product))
    if (docSnap.exists()) {
      const profileVariables = {
        firstName: await (await getDoc(doc(db, 'profiles', user.uid))).data().firstName,
        lastName: await (await getDoc(doc(db, 'profiles', user.uid))).data().lastName,
        paymentMethodID: await (await getDoc(doc(db, 'profiles', user.uid))).data().paymentMethodID,
        lastFour: await (await getDoc(doc(db, 'profiles', user.uid))).data().paymentMethodLast4,
        customerId: await (await getDoc(doc(db, 'profiles', user.uid))).data().customerId
      };
      if (profileVariables.paymentMethodID == undefined) {
        setPaymentMethodID(null)
      }
      else {
        setPaymentMethodID(profileVariables.paymentMethodID)
      }
      setFirstName(profileVariables.firstName);
      setLastName(profileVariables.lastName)
      setLastFour(profileVariables.lastFour)
      setCustomerId(profileVariables.customerId)
    } 
    if (idSnap.exists()) {
      const profileVariables = {
        stripeId: await (await getDoc(doc(db, 'profiles', userId))).data().stripeAccountID,
        previewImage: await (await getDoc(doc(db, 'products', product))).data().images[0]
      };
      setStripeId(profileVariables.stripeId)
      setPreviewImage(profileVariables.previewImage)
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
    price: Math.round((((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3) * 100)),
    id: stripeId,
    userId: userId,
    email: user.email,
  }
  //console.log(stripeId
  //console.log(dataToSend)
    const fetchPaymentSheetParams = async () => {
      //console.log('third')
      //console.log(paymentMethodID)
        const response = await fetch(`${BACKEND_URL}/api/purchaseEndpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend)
    });
    const { paymentIntent, ephemeralKey, customer, paymentIntentId} = await response.json()
    setCustomer(customer)
    //console.log(customer);
    return {
      paymentIntent,
      ephemeralKey,
      customer,
      paymentIntentId,
    };
    
  };
  //console.log(paymentMethodID)
  const initializePaymentSheet = async () => {
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
                    country: 'US',
                },
                
      },
      
    });
    if (!error) {
      setChargeId(paymentIntentId)
      setCustomer(customer)
    }
  };
  //console.log(chargeId)
  const schedulePushThemeNotification = (username, notificationToken, themeName) => {
      fetch(`${BACKEND_URL}/api/themeNotification`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, pushToken: notificationToken, "content-available": 1,
        themeName: themeName
      }),
      }).then(response => response.json())
    .then(responseData => {
      // Handle the response from the server
      console.log(responseData);
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error(error);
    })
    }
  useEffect(() => {
    if (chargeCVCId != null) {
      retreivePayment()
    }
    else if (chargeId != null || chargeId != undefined) {

        openPaymentSheet();
      }
    
  }, [chargeId, chargeCVCId])
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
  function recommmendThemeBought() {
    fetch(`${BACKEND_URL}/api/boughtRecommendPost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        themeId: product, userId: user.uid
      }),
      })
    .then(response => response.json())
    .then(responseData => {
      // Handle the response from the server
      console.log(responseData);
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error(error);
    })
  }
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
    price: Math.round((((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3) * 100)),
    id: stripeId,
    userId: userId,
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
      .then(responseData => {
      // Handle the response from the server
        if (responseData.futureUsage != null) {
        addDoc(collection(db, 'profiles', user.uid, 'purchased'), {
        active: true,
        keywords: keywords,
        name: themeName,
        images: arrayUnion(source),
        price: Math.round((((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3) * 100)),
        timestamp: serverTimestamp(),
        bought: true,
        bought_count: 0,
        paymentIntent: chargeCVCId,
        metadata: metadata,
        chargeId: responseData.chargeId,
        customerId: customer,
        selling: true,
        //metadata: {},
        productId: product
      }).then(async() => await updateDoc(doc(db, 'profiles', user.uid), {
        paymentMethodID: responseData.paymentMethodID,
        paymentMethodLast4: arrayUnion(responseData.lastFour),
        customerId: customer,
      })).then(async() => await updateDoc(doc(db, 'products', product), {
        stripe_metadata_bought_count: increment(1)
      })).then(() => recommmendThemeBought()).then(() => Alert.alert('Success', 'Your order is confirmed! The Theme Will Show up in Your Inventory Shortly!')).then(() => setLoading(false)).finally(() =>
      navigation.navigate('TransactionSummary', {chargeId: chargeCVCId, customer: customer, userName: userName, themeName: themeName, price: Math.round((((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3) * 100))})).then(() => 
      schedulePushThemeNotification(userName, notificationToken, themeName)).then(() => {
        addDoc(collection(db, 'profiles', metadata.userId, 'notifications'), {
          like: false,
          comment: false,
          friend: false,
          item: product,
          request: false,
          acceptRequest: false,
          postId: product,
          theme: true,
          report: false,
          requestUser: user.uid,
          requestNotificationToken: notificationToken,
          likedBy: [],
          timestamp: serverTimestamp()
        }).then(() => addDoc(collection(db, 'profiles', metadata.userId, 'sold'), {
        user: user.uid,
        item: product,
        timestamp: serverTimestamp(),
        keywords: keywords,
        name: themeName,
        images: arrayUnion(source),
        price: Math.round((((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3) * 100)),
        bought: true,
        bought_count: 0,
        paymentIntent: chargeCVCId,
        metadata: metadata,
        chargeId: responseData.chargeId,
        customerId: customer,
        selling: true,
      }))
      })
      }
      else {
        addDoc(collection(db, 'profiles', user.uid, 'purchased'), {
        active: true,
        keywords: keywords,
        name: themeName,
        images: arrayUnion(source),
        price: Math.round((((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3) * 100)),
        timestamp: serverTimestamp(),
        bought: true,
        bought_count: 0,
        metadata: metadata,
        chargeId: responseData.chargeId,
        paymentIntent: chargeCVCId,
        customerId: customer,
        selling: true,
        //metadata: {},
        productId: product
      }).then(async() => await updateDoc(doc(db, 'products', product), {
        stripe_metadata_bought_count: increment(1)
      })).then(() => recommmendThemeBought()).then(() => Alert.alert('Success', 'Your order is confirmed! The Theme Will Show up in Your Inventory Shortly!')).then(() => setLoading(false)).finally(() =>
      navigation.navigate('TransactionSummary', {chargeId: chargeCVCId, customer: customer, userName: userName, themeName: themeName, price: Math.round((((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3) * 100))})).then(() => schedulePushThemeNotification(userName, notificationToken, themeName)).then(() => 
      schedulePushThemeNotification(userName, notificationToken, themeName)).then(() => {
        addDoc(collection(db, 'profiles', metadata.userId, 'notifications'), {
          like: false,
          comment: false,
          friend: false,
          item: product,
          request: false,
          acceptRequest: false,
          postId: product,
          theme: true,
          report: false,
          requestUser: user.uid,
          requestNotificationToken: notificationToken,
          likedBy: [],
          timestamp: serverTimestamp()
        })
      }).then(() => addDoc(collection(db, 'profiles', metadata.userId, 'sold'), {
        user: user.uid,
        item: product,
        timestamp: serverTimestamp(),
        keywords: keywords,
        name: themeName,
        images: arrayUnion(source),
        price: Math.round((((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3) * 100)),
        bought: true,
        bought_count: 0,
        paymentIntent: chargeCVCId,
        metadata: metadata,
        chargeId: responseData.chargeId,
        customerId: customer,
        selling: true,
      }))
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
      .then(responseData => {
      // Handle the response from the server
        if (responseData.futureUsage != null) {
        console.log(responseData)
        addDoc(collection(db, 'profiles', user.uid, 'purchased'), {
        active: true,
        keywords: keywords,
        name: themeName,
        bought_count: 0,
        images: arrayUnion(source),
        price: Math.round((((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3) * 100)),
        timestamp: serverTimestamp(),
        bought: true,
        metadata: metadata,
        chargeId: responseData.chargeId,
        customerId: customer,
        paymentIntent: chargeId,
        selling: true,
        //metadata: {},
        productId: product
      }).then(async() => await updateDoc(doc(db, 'profiles', user.uid), {
        paymentMethodID: responseData.paymentMethodID,
        paymentMethodLast4: arrayUnion(responseData.lastFour),
        customerId: customer,
      })).then(async() => await updateDoc(doc(db, 'products', product), {
        stripe_metadata_bought_count: increment(1)
      })).then(() => recommmendThemeBought()).then(() => Alert.alert('Success', 'Your order is confirmed! The Theme Will Show up in Your Inventory Shortly!')).then(() => setLoading(false)).finally(() =>
      navigation.navigate('TransactionSummary', {chargeId: chargeId, customer: customer, userName: userName, themeName: themeName, price: Math.round((((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3) * 100))})).then(() => schedulePushThemeNotification(userName, notificationToken, themeName)).then(() => 
      schedulePushThemeNotification(userName, notificationToken, themeName)).then(() => {
        addDoc(collection(db, 'profiles', metadata.userId, 'notifications'), {
          like: false,
          comment: false,
          friend: false,
          item: product,
          request: false,
          acceptRequest: false,
          postId: product,
          theme: true,
          report: false,
          requestUser: user.uid,
          requestNotificationToken: notificationToken,
          likedBy: [],
          timestamp: serverTimestamp()
        }).then(() => addDoc(collection(db, 'profiles', metadata.userId, 'sold'), {
        user: user.uid,
        item: product,
        timestamp: serverTimestamp(),
        keywords: keywords,
        name: themeName,
        images: arrayUnion(source),
        price: Math.round((((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3) * 100)),
        bought: true,
        bought_count: 0,
        paymentIntent: chargeCVCId,
        metadata: metadata,
        chargeId: responseData.chargeId,
        customerId: customer,
        selling: true,
      }))
      })
      }
      else {
        addDoc(collection(db, 'profiles', user.uid, 'purchased'), {
        active: true,
        keywords: keywords,
        name: themeName,
        bought_count: 0,
        images: arrayUnion(source),
        price: Math.round((((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3) * 100)),
        timestamp: serverTimestamp(),
        bought: true,
        metadata: metadata,
        chargeId: responseData.chargeId,
        paymentIntent: chargeId,
        customerId: customer,
        selling: true,
        //metadata: {},
        productId: product
      }).then(async() => await updateDoc(doc(db, 'products', product), {
        stripe_metadata_bought_count: increment(1)
      })).then(() => recommmendThemeBought()).then(() => Alert.alert('Success', 'Your order is confirmed! The Theme Will Show up in Your Inventory Shortly!')).then(() => setLoading(false)).finally(() =>
      navigation.navigate('TransactionSummary', {chargeId: chargeId, customer: customer, userName: userName, themeName: themeName, price: Math.round((((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3) * 100))})).then(() => schedulePushThemeNotification(userName, notificationToken, themeName)).then(() => 
      schedulePushThemeNotification(userName, notificationToken, themeName)).then(() => {
        addDoc(collection(db, 'profiles', metadata.userId, 'notifications'), {
          like: false,
          comment: false,
          friend: false,
          item: product,
          request: false,
          acceptRequest: false,
          postId: product,
          theme: true,
          report: false,
          requestUser: user.uid,
          requestNotificationToken: notificationToken,
          likedBy: [],
          timestamp: serverTimestamp()
        }).then(() => addDoc(collection(db, 'profiles', metadata.userId, 'sold'), {
        user: user.uid,
        item: product,
        timestamp: serverTimestamp(),
        keywords: keywords,
        name: themeName,
        images: arrayUnion(source),
        price: Math.round((((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3) * 100)),
        bought: true,
        bought_count: 0,
        paymentIntent: chargeCVCId,
        metadata: metadata,
        chargeId: responseData.chargeId,
        customerId: customer,
        selling: true,
      }))
      })
      }
      

      //console.log(responseData);
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error(error);
    })
    }
    
    //console.log(CVCModal)
        
    //console.log(prices)
    //console.log(Object.entries(products))
  //console.log(selectedState)
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
    <View style={{ flex : 1, backgroundColor: modeTheme.backgroundColor}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <>
      <ThemeHeader video={false} text={"Get Themes"} backButton={true}/>
      <Divider borderWidth={0.4} borderColor={modeTheme.color}/>
      <Modal visible={CVCModal} animationType='slide' onRequestClose={() => setCVCModal(false)} transparent>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <MaterialCommunityIcons name='close' color={modeTheme.color}  size={30} style={{textAlign: 'right', padding: 10}} onPress={() => {setCVCModal(false); navigation.goBack()}}/>
            <Text style={{fontSize: 19.20, textAlign: 'center', fontFamily: 'Montserrat_500Medium',}}>Please enter CVC for card ending in {lastFour != undefined && lastFour.length > 0 ? lastFour[0] : <ActivityIndicator color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"} />}</Text>
            <View style={{alignItems: 'center'}}>
              <TextInput value={cvc} onChangeText={setCvc} placeholder='CVC' onSubmitEditing={() => {setCVCModal(false); payUsingCVC()}} style={{borderWidth: 1, marginTop: '5%', fontSize: 15.36, fontFamily: 'Montserrat_500Medium', padding: 10, borderRadius: 8}} returnKeyType='done' keyboardType='numeric'/>
            </View>
            <RadioButtonGroup
                containerStyle={{ marginTop: '25%', marginLeft: '2.5%'}}
                selected={useOtherCard}
                onSelected={() => {setUseOtherCard(true); setCVCModal(false); setPaymentMethodID(null); initializePaymentSheet()}}
                containerOptionStyle={{margin: 5, marginBottom: '10%'}}
                radioBackground="#005278"
                size={22.5}
                radioStyle={{alignSelf: 'flex-start'}}
      >
        <RadioButtonItem value={useOtherCard == true ? useOtherCard: null} label={
        <View style={{marginLeft: '2.5%'}}>
            <Text style={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium',}}>Use Another Card</Text>
        </View>
    }/>
    </RadioButtonGroup>
          </View>
        </View>
      </Modal>
      <StripeProvider publishableKey={'pk_live_51N5AxSJM3BhfSRhsCg2NNuvCrh2vYQAy3c2WPvYUIn4ijgvlREwEZG6aVfn2opRofDwkHoqw3RQaPvHYVw0JsdCt00mEdYGM3s'}>
            {loading ? <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>

              <ActivityIndicator size={'large'} color={modeTheme.theme != 'light' ? "#9EDAFF" : "#005278"} />


            </View> : null}
            
      </StripeProvider>
      </>
    </TouchableWithoutFeedback>
    </View>
  )
}

export default PurchaseTheme

const styles = StyleSheet.create({
    previewThemeContainer: {
    margin: '5%',
    marginTop: '10%',
    marginBottom: "2.5%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewThemeText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    color: "#fff",
    alignSelf: 'center',
    padding: 5,
    //marginLeft: '37.5%',
    paddingBottom: 0
  },
  previewMainContainer: {
    backgroundColor: "#fff"
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
  price: {
    position: 'absolute',
    top: 105,
    left: 330,
    color: "#fff",
    fontSize: 15.36,
    fontFamily: 'Montserrat_700Bold',
  },
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
})