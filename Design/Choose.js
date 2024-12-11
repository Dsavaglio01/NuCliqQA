import { Alert, StyleSheet, Text, View, ActivityIndicator, Modal, TextInput } from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import { Divider } from 'react-native-paper'
import ThemeHeader from '../Components/ThemeHeader'
import NextButton from '../Components/NextButton'
import { useNavigation } from '@react-navigation/native'
import { useFonts, Montserrat_700Bold, Montserrat_500Medium } from '@expo-google-fonts/montserrat'
import { doc, getDoc, onSnapshot, increment, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase'
import {MaterialCommunityIcons} from "@expo/vector-icons";
import useAuth from '../Hooks/useAuth'
import MainButton from '../Components/MainButton'
import {BACKEND_URL} from "@env";
import { PaymentSheet, StripeProvider, SetupIntent, PaymentIntent, useStripe } from '@stripe/stripe-react-native'
import RadioButtonGroup, { RadioButtonItem } from "expo-radio-button"
import themeContext from '../lib/themeContext'
import Purchases from 'react-native-purchases'
const Choose = () => {
    const navigation = useNavigation();
    const [credits, setCredits] = useState(0);
    const theme = useContext(themeContext)
    const [cvc, setCvc] = useState();
    const [CVCModal, setCVCModal] = useState(false);
    const [chargeCVCId, setChargeCVCId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastFour, setLastFour] = useState([]);
    const [useOtherCard, setUseOtherCard] = useState(false);
    const [purchasing, setPurchasing] = useState(false);
    const [lastName, setLastName] = useState('');
    const [pack, setPack] = useState(null);
    const [customer, setCustomer] = useState();
    const [customerId, setCustomerId] = useState(null);
    const [chargeId, setChargeId] = useState();
    const [firstName, setFirstName] = useState('');
     const { initPaymentSheet, presentPaymentSheet, confirmPayment, createTokenForCVCUpdate} = useStripe();
    const [paymentMethodID, setPaymentMethodID] = useState(null);
    const {user} = useAuth();
    useEffect(() => {
    // Get current available packages
    const getPackages = async () => {
      try {
        const offerings = await Purchases.getOfferings()
        //console.log(offerings)
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          setPack(offerings.current.availablePackages[0])
         // console.log(offerings.current.availablePackages[0].product)
  }

      } catch (e) {
        Alert.alert('Error getting offers', e.message);
      }
    };

    getPackages();
  }, []);
  
const MAX_RETRY_ATTEMPTS = 3;

const purchaseCredits = async (pack, attempt = 1) => {
  setLoading(true);

  try {
    const { customerInfo } = await Purchases.purchasePackage(pack).then((result) => {
      console.log("Purchase response:", result); // Log the successful response
      return result;
    })
    .catch((error) => {
      console.error("Error in Purchases.purchasePackage:", error); // Log the error
      throw error; // Re-throw the error to be caught by the outer try...catch
    });
    console.log("Purchase response:", customerInfo);
    if (customerInfo) {
      await updateDoc(doc(db, 'profiles', user.uid), {
        credits: increment(10)
      })
      // ... your credit update and receipt validation logic ...
    } else {
      throw new Error('Customer info not available');
    }
  } catch (error) {
    console.error(error)
    if (attempt < MAX_RETRY_ATTEMPTS) {
      console.warn('Purchase failed, retrying...', error);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      return purchaseCredits(pack, attempt + 1);
    } else {
      console.log(error);
    }
  } finally {
    setLoading(false);
  }
};

  /*  */
    useEffect(() => {
      let unsub;
        const getData = async() => {
          unsub = onSnapshot(doc(db, "profiles", user.uid), (doc) => {
              setCredits(doc.data().credits)
          });
            /* const docSnap = await getDoc(doc(db, 'profiles', user.uid))
            setCredits(docSnap.data().credits) */
        }
        getData()
        return unsub;
    }, [])
    useEffect(() => {
    const getProfileDetails = async() => {
    const docSnap = await getDoc(doc(db, "profiles", user.uid)); 
    if (docSnap.exists()) {
      const profileVariables = {
        firstName: await (await getDoc(doc(db, 'profiles', user.uid))).data().firstName,
        lastName: await (await getDoc(doc(db, 'profiles', user.uid))).data().lastName,
        paymentMethodID: await (await getDoc(doc(db, 'profiles', user.uid))).data().paymentMethodID,
        lastFour: await (await getDoc(doc(db, 'profiles', user.uid))).data().paymentMethodLast4,
        customerId: await (await getDoc(doc(db, 'profiles', user.uid))).data().customerId
      };
      //console.log(profileVariables)
      setFirstName(profileVariables.firstName);
      setLastName(profileVariables.lastName)
      setLastFour(profileVariables.lastFour)
      setCustomerId(profileVariables.customerId)
      if (profileVariables.paymentMethodID == undefined) {
        setPaymentMethodID(null)
      }
      else {
        setPaymentMethodID(profileVariables.paymentMethodID)
      }
      //)
      
    } 
  }
  
  getProfileDetails();
  }, [])
  //console.log(lastFour)

  
 
    const [fontsLoaded, fontError] = useFonts({
    Montserrat_700Bold,
    Montserrat_500Medium
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  //fconsole.log(lastFour)
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <ThemeHeader text={"Get Themes"} backButton={true} video={false}/>
        <Divider borderWidth={0.4} borderColor={theme.color}/>
        <View style={{marginLeft: '5%', marginRight: '5%'}}>
        <Text style={[styles.header, {color: theme.color}]}>Designing New Themes</Text>
        <Text style={[styles.supplementaryText, {color: theme.color}]}>Each SUCCESSFUL upload of a theme costs 1 NuCliq Credit</Text>
        <Text style={[styles.supplementaryText, {fontSize: 15.36, color: theme.color}]}>{credits == undefined ? '0' : credits} credits remaining</Text>
        <View style={styles.mainContainer}>
            <View style={styles.buttonContainer}>
                <NextButton text={"UPLOAD THEME"} onPress={credits != undefined && credits > 0 ? () => navigation.navigate('UploadGuidelines', {ai: false, upload: true,}) : () => Alert.alert('Insufficient credit amount')}/>
            </View>
            <View style={styles.buttonContainer}>
                <MainButton text={"PURCHASE 10 CREDITS for $0.99!"} onPress={() => purchaseCredits(pack)}/>
            </View>
            {/* <View style={styles.buttonContainer}>
                <NextButton text={"GENERATE WITH AI"} onPress={() => navigation.navigate('UploadGuidelines', {ai: true, upload: false,})}/>
            </View> */}
        </View>
        </View>
    </View>
  )
}

export default Choose

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        fontSize: 24,
        textAlign: 'left',
        fontFamily: 'Montserrat_700Bold',
        padding: 10,
        paddingLeft: 0, 
        //marginTop: '5%'
    },
    supplementaryText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        padding: 10,
        textAlign: 'left',
        paddingLeft: 0,
        //letterSpacing: 1.25
    },
     buttonContainer: {
        marginVertical: '2.5%',
        //marginHorizontal: '5%'
    },
    centeredView: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: '10%'
  },
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
})