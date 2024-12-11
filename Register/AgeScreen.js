import { Alert, ImageBackground, StyleSheet, Text, TextInput, View } from 'react-native'
import React, {useContext, useState} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
import InputBox from '../Components/InputBox'
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateDoc, doc, getFirestore } from 'firebase/firestore'
import useAuth from '../Hooks/useAuth'
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
import { db } from '../firebase'
const AgeScreen = ({route}) => {
    const navigation = useNavigation();
    const {firstName, lastName, userName} = route.params;
    const {user} = useAuth()
    const [age, setAge] = useState('');
    const [date, setDate] = useState(new Date());
    const theme = useContext(themeContext)
    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setDate(currentDate);
    };

    const showMode = (currentMode) => {
        DateTimePickerAndroid.open({
        value: date,
        onChange,
        mode: currentMode,
        is24Hour: true,
        });
    };
    //console.log(date)
    function calculate_age(dob){
        var today = new Date();
        var birthDate = new Date(dob);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    const updateCurrentUser = async() => {
      console.log(calculate_age(date))
        if (calculate_age(date) < 13) {
             Alert.alert('Invalid age', 'Age must be at least 13 years old', [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => console.log('first')},
              ]);
        }
        else if (calculate_age(date) >= 13 && calculate_age(date) < 18) {
             Alert.alert('Parental Consent', "Parents have consented on my behalf to use this app since I'm a minor", [
                {
                  text: 'NO',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'YES', onPress: () => navigation.navigate('Pfp', {firstName: firstName, lastName: lastName, userName: userName, age: calculate_age(date)})},
              ]);
        }
        else {
            navigation.navigate('Pfp', {firstName: firstName, lastName: lastName, userName: userName, age: calculate_age(date)})
        }
        
    }
    //console.log(calculate_age(date))
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
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover"> 
       
        <View style={[styles.main, {backgroundColor: theme.backgroundColor}]}>
             <RegisterHeader onPress={() => navigation.goBack()} colorOne={{borderColor: '#3286ac'}} colorTwo={{borderColor: '#3286ac'}} colorThree={{borderColor: '#3286ac'}}/>
            <Text style={[styles.addText, {color: theme.color}]}>Date of Birth</Text>
            <View style={{marginTop: '15%'}}>
                <DateTimePicker 
                        //testID="dateTimePicker"
                        value={date}
                        display={'spinner'}
                        //maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                        textColor={theme.color}
                        accentColor={theme.color}
                        //is24Hour={true}
                        onChange={onChange}
                        style={{marginLeft: '2.5%', marginRight: '2.5%', height: '50%'}}
                    />
            </View>
            <View style={{ marginTop: '-30%', marginLeft: '5%', marginRight: '5%'}}>
                <NextButton text={'Next'} onPress={updateCurrentUser}/>
            </View>
        </View>
    </ImageBackground>
  )
}

export default AgeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    supplementaryText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 25,
        paddingBottom: 0,
        paddingTop: 10
    },
    input: {
        marginTop: '25%',
        borderWidth: 1,
        padding: 10,
        borderColor: "#cdcdcd",
        borderRadius: 30,
    },
    main: {
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
    mainHeader: {
        backgroundColor: "#27293d",
        borderRadius: 8,
        width: '75%',
        marginTop: '7.5%',
        marginLeft: '1.5%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    addText: {
    fontSize: 19.20,
    padding: 25,
    fontFamily: 'Montserrat_600SemiBold',
    paddingBottom: 0
  },
  barColor: {
        borderColor: '#3286ac'
    },
})