import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import MainLogo from './MainLogo';
import { useFonts, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
import FastImage from 'react-native-fast-image';
const RegisterHeader = ({onPress, colorOne, privateInvite, paymentMethod, createChat, login, forgot, colorTwo, channel, colorThree, colorFour, colorFive, colorSix, group}) => {
  const theme = useContext(themeContext)
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_700Bold,
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return ( 
    <View style={{backgroundColor: theme.backgroundColor, borderRadius: 35}}>
      <View style={[styles.newHeader, {backgroundColor: theme.backgroundColor}]}>
        <View style={{flexDirection: 'row', alignSelf: 'center', alignItems: 'center'}}>
          <TouchableOpacity onPress={onPress} style={{marginRight: 15}}>
            <MaterialCommunityIcons name='chevron-left' size={37.5} style={{alignSelf: 'center'}} color={theme.color}/> 
          </TouchableOpacity>
            <FastImage source={require('../assets/DarkMode5.png')} style={{height: 60, width: 150}}/>
          
        </View>
        
        {/* */}
      
      </View>
      <View style={{backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: theme.theme != 'light' ? "#9EDAFF" : "#005278", width: '95%', borderTopRightRadius: 10, borderBottomRightRadius: 10, marginTop: '2.5%'}}>
        {group ? <Text numberOfLines={1} style={[styles.header]}>{"Create Cliq"}</Text> : channel ? <Text numberOfLines={1} style={[styles.header, {color: theme.color}]}>{"Create Cliq Chat"}</Text>
        : login ? <Text numberOfLines={1} style={[styles.header]}>{"Login"}</Text> : forgot ? <Text numberOfLines={1} style={[styles.header, {color: theme.color}]}>{"Forgot Password"}</Text> 
        : paymentMethod ? <Text numberOfLines={1} style={[styles.header]}>{"Add Payment Method"}</Text> : 
        createChat ? <Text numberOfLines={1} style={[styles.header]}>{"Create Chat"}</Text> : privateInvite ? <Text numberOfLines={1} style={[styles.header, {color: theme.color}]}>{"Invite Friends"}</Text> :
        <Text numberOfLines={1} style={[styles.header]}>{"Account Registration"}</Text>
        } 
      
      {group ? 
      <View style={styles.container}>
          <View style={[styles.fiveBar, colorOne]}/>
          <View style={[styles.fiveBar, colorTwo]}/>
          <View style={[styles.fiveBar, colorThree]}/>
          <View style={[styles.fiveBar, colorFour]}/>
          <View style={[styles.fiveBar, colorFive]}/>
      </View> : channel ? <View style={styles.container}>
          <View style={[styles.fourBar, colorOne]}/>
          <View style={[styles.fourBar, colorTwo]}/>
          <View style={[styles.fourBar, colorThree]}/>
          <View style={[styles.fourBar, colorFour]}/>
      </View> : !login && !forgot && !paymentMethod && !createChat && !privateInvite ? <View style={styles.container}>
          <View style={[styles.sixBar, colorOne]}/>
          <View style={[styles.sixBar, colorTwo]}/>
          <View style={[styles.sixBar, colorThree]}/>
          <View style={[styles.sixBar, colorFour]}/>
          <View style={[styles.sixBar, colorFive]}/>
          <View style={[styles.sixBar, colorSix]}/>
      </View>
      : null}
      </View>
    
    </View>

  )
}

export default RegisterHeader

const styles = StyleSheet.create({
    header: {
        fontSize: 24,
        fontFamily: 'Montserrat_700Bold',
        textAlign: 'center',
        padding: 10,
        paddingTop: 4,
        marginTop: 8,
        color: "#fafafa",
        alignSelf: 'center',
        //width: '70%'
    },
    newHeader: {
      marginTop: '3%',
      marginLeft: '5%',
      //marginBottom: '2.5%',
      //justifyContent: 'space-evenly',
      //marginRight: '20%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: "#f2f2f2",
      width: '90%'
    },
    container: {
        //flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '3%',
        marginTop: '1%',
    },
    fiveBar: {
        borderWidth: 3,
        width: 50,
        marginHorizontal: 1,
        borderColor: '#c3c3c3'
    },
    fourBar: {
      borderWidth: 3,
        width: 65,
        marginHorizontal: 1,
        borderColor: '#c3c3c3'
    },
    sixBar: {
        borderWidth: 3,
        width: 35,
        marginHorizontal: 1,
        borderColor: '#c3c3c3'
    }
})