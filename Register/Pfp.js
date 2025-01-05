import {StyleSheet, Text, View, ImageBackground} from 'react-native'
import React, {useContext} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import PfpImage from '../Components/PfpImage'
import themeContext from '../lib/themeContext'
const Pfp = ({route}) => {
    const navigation = useNavigation();
    const {firstName, lastName, userName, age} = route.params;
    const theme = useContext(themeContext)
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover">
        
        <View style={[styles.main, {backgroundColor: theme.backgroundColor}]}>
            <RegisterHeader onPress={() => navigation.goBack()} colorOne={{borderColor: '#3286ac'}} colorTwo={{borderColor: '#3286ac'}} colorThree={{borderColor: '#3286ac'}} colorFour={{borderColor: '#3286ac'}} />
            <Text style={[styles.addText, {color: theme.color}]}>Add a Profile Picture</Text>
            <PfpImage pfpRegister={true} name={`${userName}profile.jpg`} skipOnPress={() =>  navigation.navigate('Referral', {firstName: firstName, lastName: lastName, userName: userName, age: age,
            pfp: null})}
            firstName={firstName} lastName={lastName} userName={userName} age={age}/>

            
        </View>
    </ImageBackground>
  )
}

export default Pfp

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    addText: {
        fontSize: 19.20,
        padding: 25,
        paddingBottom: 10,
         fontFamily: 'Montserrat_500Medium'
    },
    addContainer: {
        backgroundColor: "#000",
        height: 151,
        width: 151,
        borderRadius: 8,
        //justifyContent:'center'
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
})