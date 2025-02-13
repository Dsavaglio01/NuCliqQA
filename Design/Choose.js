import { Alert, StyleSheet, Text, View} from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import { Divider } from 'react-native-paper'
import ThemeHeader from '../Components/ThemeHeader'
import NextButton from '../Components/NextButton'
import { useNavigation } from '@react-navigation/native'
import { doc, onSnapshot, increment, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import useAuth from '../Hooks/useAuth'
import MainButton from '../Components/MainButton'
import themeContext from '../lib/themeContext'
import Purchases from 'react-native-purchases'
const Choose = () => {
    const navigation = useNavigation();
    const [credits, setCredits] = useState(0);
    const theme = useContext(themeContext)
    const [loading, setLoading] = useState(false);
    const [pack, setPack] = useState(null);
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
    useEffect(() => {
      let unsub;
        const getData = async() => {
          unsub = onSnapshot(doc(db, "profiles", user.uid), (doc) => {
            setCredits(doc.data().credits)
          });
        }
        getData()
      return unsub;
    }, [])
  return (
    <View style={styles.container}>
        <ThemeHeader text={"Get Themes"} backButton={true} video={false}/>
        <Divider borderWidth={0.4} borderColor={theme.color}/>
        <View style={{marginHorizontal: '5%'}}>
          <Text style={styles.header}>Designing New Themes</Text>
          <Text style={styles.supplementaryText}>Each SUCCESSFUL upload of a theme costs 1 NuCliq Credit</Text>
          <Text style={[styles.supplementaryText, {fontSize: 15.36}]}>{credits == undefined ? '0' : credits} credits remaining</Text>
          <View>
            <View style={styles.buttonContainer}>
              <NextButton text={"UPLOAD THEME"} onPress={credits != undefined && credits > 0 ? () => navigation.navigate('UploadGuidelines', {ai: false, upload: true,}) : () => Alert.alert('Insufficient credit amount')}/>
            </View>
            <View style={styles.buttonContainer}>
              <MainButton text={"PURCHASE 10 CREDITS for $0.99!"} onPress={() => purchaseCredits(pack)}/>
            </View>
          </View>
        </View>
    </View>
  )
}

export default Choose

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#121212"
    },
    header: {
      fontSize: 24,
      textAlign: 'left',
      fontFamily: 'Montserrat_700Bold',
      padding: 10,
      paddingLeft: 0, 
      color: "#fafafa"
    },
    supplementaryText: {
      fontSize: 19.20,
      fontFamily: 'Montserrat_500Medium',
      padding: 10,
      textAlign: 'left',
      paddingLeft: 0,
      color: "#fafafa"
    },
    buttonContainer: {
      marginVertical: '2.5%',
    },
})