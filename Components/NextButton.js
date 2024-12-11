import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native'
import React, { useContext } from 'react'
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
const NextButton = ({text, onPress, textStyle, button}) => {
  const theme = useContext(themeContext)
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <TouchableOpacity style={[styles.logInButton, button, {borderColor: theme.theme != 'light' ? "#9EDAFF" : "#005278", backgroundColor: theme.theme != 'light' ? "#9EDAFF" : "#005278",}]} onPress={onPress}>
        <Text style={[styles.alreadyText, textStyle, {color: theme.backgroundColor}]}>{text}</Text>
    </TouchableOpacity>
  )
}

export default NextButton

const styles = StyleSheet.create({
    logInButton: {
        borderRadius: 10,
        borderWidth: 1,
    },
    alreadyText: {
        fontSize: Dimensions.get('screen').height / 68.7,
        padding: 12,
        fontFamily: 'Montserrat_500Medium',
        paddingLeft: 25,
        paddingRight: 25,
        textAlign: 'center'
    }
})