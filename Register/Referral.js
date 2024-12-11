import { StyleSheet, Text, View, ImageBackground, TouchableWithoutFeedback, ActivityIndicator, Keyboard } from 'react-native'
import React, {useState} from 'react'
import RegisterHeader from '../Components/RegisterHeader';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat'
import InputBox from '../Components/InputBox';
import NextButton from '../Components/NextButton';
import Skip from '../Components/Skip';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, increment} from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../Hooks/useAuth';
const Referral = ({route}) => {
    const {firstName, lastName, userName, age, pfp} = route.params;
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const {user} = useAuth();
    const [referralCodeError, setReferralCodeError] = useState(null);
    const [referralCode, setReferralCode] = useState('');
    async function updateReferralUser() {
        setLoading(true)
        const citiesRef = collection(db, "profiles");
        const q = query(citiesRef, where("refferalCode", "==", referralCode));
        const querySnapshot = await getDocs(q);
        //console.log(querySnapshot.docs.length)
        if (querySnapshot.docs.length == 0) {
            setReferralCodeError(true)
            setLoading(false)
        }
        else {
        querySnapshot.forEach(async(document) => {
        // doc.data() is never undefined for query doc snapshots
        if (document.exists()) {
            await updateDoc(doc(db, 'profiles', document.id), {
                referrals: arrayUnion(userName)
            }).then(() => setLoading(false)).then(() => navigation.navigate('Bio', {firstName: firstName, lastName: lastName, userName: userName, age: age,
            pfp: pfp}))
        }
        else {
        console.log('firrst')
            setReferralCodeError(true)
            setLoading(false)
        }
        });
    }
        //await getDoc(doc(db, 'profiles', user.uid))
    }
     const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_400Regular
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover" >
        <View style={styles.main}>
             <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View>
                    <RegisterHeader onPress={() => navigation.goBack()} colorOne={styles.barColor} colorTwo={styles.barColor} colorThree={styles.barColor} colorFour={styles.barColor} colorFive={styles.barColor}/>
                    <Text style={[styles.headerText]}>Referral Code</Text>
                    <Text style={[styles.supplementaryText]}>If you got referred to the app, put in the code below!</Text>
                    <View style={{marginTop: '5%'}}>
                        <InputBox text={'Referral Code'} onChangeText={setReferralCode} containerStyle={referralCodeError ? [styles.inputContainer, {borderColor: 'red'}] : [styles.inputContainer]}
                        maxLength={200} value={referralCode}/>
                        {referralCodeError ? <Text style={[styles.supplementaryText, {color: 'red', fontSize: 12.29, fontFamily: 'Montserrat_500Medium',}]}>Invalid Referral Code</Text> : null}
                    </View>
                    {loading ? <View style={styles.noDataContainer}>
        <ActivityIndicator size={'large'} color={"#9EDAFF"}/> 
        </View> : 
            <View style={{marginTop: '10%', marginLeft: '5%', marginRight: '5%'}}>
                <NextButton text={'CONTINUE'} onPress={referralCode.length > 0 ? () => updateReferralUser() : () => navigation.navigate('Bio', {firstName: firstName, lastName: lastName, userName: userName, age: age,
            pfp: pfp})} />
                  {referralCode.length == 0 ? 
                <Skip bio={true} onPress={() => navigation.navigate('Bio', {firstName: firstName, lastName: lastName, userName: userName, age: age,
            pfp: pfp})}/> : null}
            </View> }
                </View>
            </TouchableWithoutFeedback>
        </View>
    </ImageBackground>
  )
}

export default Referral

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    main: {
        borderRadius: 35,
        backgroundColor: "#121212",
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
    barColor: {
        borderColor: '#3286ac'
    },
    headerText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_600SemiBold',
        padding: 25,
        fontWeight: '600',
        paddingBottom: 0,
        color: "#fafafa"
    },
    supplementaryText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 25,
        paddingBottom: 0,
        paddingTop: 10,
        color: "#fafafa"
    },
    inputContainer: {
        borderRadius: 9,
        borderWidth: 1,
        width: '90%',
        height: 50,
        marginLeft: '5%',
        backgroundColor: "#121212",
        //width: '95%',
        //marginLeft: '5%',
        flexDirection: 'row',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '5%'
    },
})