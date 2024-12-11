import { StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import ThemeHeader from '../Components/ThemeHeader';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Divider } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import { StripeProvider, AddressSheet, AddressSheetError } from '@stripe/stripe-react-native';
import NextButton from '../Components/NextButton';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../Hooks/useAuth';
import themeContext from '../lib/themeContext';
const BeforePurchaseSummary = ({route}) => {
    const {groupId, notificationToken, themeName, userId, name, keywords, source, free, price, userName, product, metadata} = route.params;
    //console.log(notificationToken)
    const navigation = useNavigation();
    const [addressStreetVisible, setAddressSheetVisible] = useState(false)
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const theme = useContext(themeContext);
    const [loading, setLoading] = useState(false);
    const {user} = useAuth();
    useEffect(() => {
        const getData = async() => {
            const docSnap = await getDoc(doc(db, 'profiles', user.uid))
            setFirstName(docSnap.data().firstName)
            setLastName(docSnap.data().lastName)
        }
        getData()
    }, [])
    //console.log(addressStreetVisible)
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
      <ThemeHeader text={"Theme Review"} backButton={true}/>
      <Divider borderBottomWidth={0.4}/>
      {loading && !addressStreetVisible ? <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>

              <ActivityIndicator size={'large'} color={"#005278"} />


            </View> :
<>
      <View style={{alignItems: 'center', marginTop: '5%'}}>
        <FastImage source={{uri: source}} style={styles.image}/>
      </View>
      <StripeProvider publishableKey={'pk_live_51N5AxSJM3BhfSRhsCg2NNuvCrh2vYQAy3c2WPvYUIn4ijgvlREwEZG6aVfn2opRofDwkHoqw3RQaPvHYVw0JsdCt00mEdYGM3s'}>
         <AddressSheet
            visible={addressStreetVisible}
                appearance={{
                    colors: {
                    primary: '#005278',
                    background: '#ffffff'
                    }
                }}
                defaultValues={{
                    phone: '111-222-3333',
                    name: `${firstName} ${lastName}`,
                    address: {
                    country: 'United States',
                    city: 'San Francisco',
                    state: 'California',
                    
                    },
                }}
                allowedCountries={['US']}
                
                primaryButtonTitle={'Use this address'}
                sheetTitle={'Billing Address'}
                onError={(error) => {
                    if (error.code === AddressSheetError.Failed) {
                    Alert.alert('There was an error.', 'Please try again.');
                    console.log(error.localizedMessage);
                    }
                // Make sure to set `visible` back to false to dismiss the address element.
                    setAddressSheetVisible(false);
                }}
                onSubmit={(addressDetails) => {
                    // Make sure to set `visible` back to false to dismiss the address element.
                     if (addressStreetVisible) {
                        setLoading(false)
                        setAddressSheetVisible(false); // Only set to false if currently visible
                    }
                    console.log(addressDetails)
                    navigation.navigate('PurchaseTheme', { groupId: groupId,  notificationToken: notificationToken, themeName: themeName, userId: userId, name: name, keywords: keywords, source: source, free: free, price: price, userName: userName, product: product, metadata: metadata, addressDetails: addressDetails})
                    //console.log(addressDetails)

                    // Handle result and update your UI
                }}
                
            />
                        
      </StripeProvider>
      <View style={{backgroundColor: "#d3d3d3", marginHorizontal: '5%', borderWidth: 1, marginTop: '5%'}}>
                <Text style={[styles.dataReceiptText, {width: '100%'}]}>Theme Price Summary</Text>
                <Divider borderBottomWidth={1}/>
                <View style={{backgroundColor: "#fff"}}>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText]}>Theme:</Text>
                      <Text numberOfLines={1} style={[styles.dataReceiptText]}>{themeName}</Text>
                  </View>
                  </View>
                  <View style={{backgroundColor: "#e8e8e8"}}>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText]}>Theme Price:</Text>
                      <Text style={[styles.dataReceiptText]}>${(price / 100).toFixed(2)}</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText, {paddingTop: 0}]}>Tax:</Text>
                      <Text style={[styles.dataReceiptText, {paddingTop: 0}]}>$-.-- (-%)*</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText, {paddingTop: 0}]}>Processing Fee:</Text>
                      <Text style={[styles.dataReceiptText, {paddingTop: 0}]}>${(((price * 0.03) / 100) + 0.3).toFixed(2)} (3% + 30&#162;)</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.receiptText, {paddingTop: 0}]}>Total Amount:</Text>
                      <Text style={[styles.dataReceiptText, {paddingTop: 0}]}>${((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3).toFixed(2)}</Text>
                  </View>
                  </View>
              </View>
              <Text style={[styles.receiptText, {width: '100%', textAlign: 'center'}]}>* State Sales Tax may apply to total amount.</Text>
      <View style={{ marginHorizontal: '20%', width: '60%'}}>
          <NextButton text={`Purchase Theme For $${((price / 100) + ((price * 0.06) / 100)+ ((price * 0.03) / 100) + 0.3).toFixed(2)}`} onPress={ () => navigation.navigate('PurchaseTheme', {groupId: groupId,  notificationToken: notificationToken, themeName: themeName, userId: userId, name: name, keywords: keywords, source: source, free: free, price: price, userName: userName, product: product, metadata: metadata})}/>
      
      </View>
      </>}
    </View>
  )
}

export default BeforePurchaseSummary

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    header: {
        padding: 10,
        fontSize: 19.20,
        margin: 5,
        marginTop: 0,
        fontFamily: 'Montserrat_600SemiBold',
        textAlign: 'center',
    },
    image: {
        width: 325 / 1.30382570115, height: 325, borderRadius: 5
    },
    calcText: {
      fontFamily: 'Montserrat_500Medium',
      paddingTop: 12.5,
      fontSize: 19.20,
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
    fontFamily: 'Montserrat_700Bold',
    width: '50%',
    textAlign: 'left'
  }
})