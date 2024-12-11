import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
const SignUpButton = ({onPress, text, icon, disabled, textstyle, addContainer}) => {
  const theme = useContext(themeContext)
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, {backgroundColor: theme.backgroundColor, borderColor: theme.color}, addContainer]} disabled={disabled}>
      {icon == 'google' ? <MaterialCommunityIcons name={icon} size={20} style={{alignSelf: 'center', marginLeft: '5%'}}/> :
      <MaterialCommunityIcons name={icon} color={theme.color} size={20} style={{alignSelf: 'center', marginLeft: '5%', paddingRight: 12}}/>}
        
        <Text style={[styles.textStyle, {color: theme.color}, textstyle]}>{text}</Text>
    </TouchableOpacity>
  )
}

export default SignUpButton

const styles = StyleSheet.create({
    container:{
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 25,
        width: '90%',
        marginLeft: '5%',
        justifyContent: 'center',
        height: 50,
        marginTop: 0
    },
    textStyle: {
        fontSize: Dimensions.get('screen').height / 44,
        padding: 12,
        alignSelf: 'center',
        fontFamily: 'Montserrat_500Medium'
    }
})