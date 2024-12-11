import { StyleSheet, Text, TextInput, View, ImageBackground, TouchableOpacity, Alert} from 'react-native'
import React, {useContext, useState} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
import Checkbox from 'expo-checkbox'
import { useFonts, Montserrat_400Regular, Montserrat_500Medium } from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
const GroupSecurity = ({route}) => {
    const {name} = route.params
    const theme = useContext(themeContext)
    const navigation = useNavigation();
    const [privateChecked, setPrivateChecked] = useState(false);
    const [publicChecked, setPublicChecked] = useState(false);
    const updateCurrentGroup = () => {
        if (!privateChecked && !publicChecked) {
            Alert.alert('Cliq must have a privacy setting')
        }
        else {
            navigation.navigate('GroupCategory', {name: name, groupSecurity: privateChecked ? 'private' : 'public',})
        }
       
    }
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
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover">
        
        <View style={[styles.main, {backgroundColor: theme.backgroundColor}]}>
            <RegisterHeader onPress={() => navigation.goBack()} colorOne={{borderColor: '#3286ac'}} colorTwo={{borderColor: '#3286ac'}} group={true}/>
            <Text style={[styles.headerText, {color: theme.color}]}>Will the Clique be Private or Public?</Text>
            <Text style={[styles.supplementaryText, {color: theme.color}]}>This Will be Displayed to Users</Text>
            <View style={{marginTop: '5%', marginLeft: '10%'}}>
                <TouchableOpacity activeOpacity={1} onPress={() => {setPrivateChecked(true); setPublicChecked(false)}} style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Checkbox value={privateChecked} onValueChange={() => {setPrivateChecked(true); setPublicChecked(false)}} color={privateChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                    <Text style={[styles.paragraph, {color: theme.color}]}>Private</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1} onPress={() => {setPublicChecked(true); setPrivateChecked(false)}} style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Checkbox value={publicChecked} onValueChange={() => {setPrivateChecked(false); setPublicChecked(true)}} color={publicChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color}  />
                    <Text style={[styles.paragraph, {color: theme.color}]}>Public</Text>
                </TouchableOpacity>
            </View>
            <View style={{marginTop: '10%', marginLeft: '5%', marginRight: '5%'}}>
                <NextButton text={'Next'} onPress={updateCurrentGroup}/>
            </View>
        </View>
   </ImageBackground>
  )
}

export default GroupSecurity

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        padding: 25,
        paddingBottom: 0
    },
    supplementaryText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 25,
        paddingBottom: 0,
        paddingTop: 5
    },
    input: {
        marginTop: '25%',
        borderWidth: 1,
        padding: 10,
        borderColor: "#cdcdcd",
        borderRadius: 30,
    },
    paragraph:{
        fontSize: 15.36,
        padding: 12,
        alignSelf: 'center',
        fontFamily: 'Montserrat_400Regular',
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
    barColor: {
    borderColor: '#3286ac'
  }
})