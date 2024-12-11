import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
const Skip = ({onPress, bio, styling}) => {
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
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {bio ? <Text style={[styles.text, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Skip and Create Account</Text> : <Text style={[styles.text, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}, styling]}>Skip</Text>}
    </TouchableOpacity>
  )
}

export default Skip

const styles = StyleSheet.create({
    container: {
        marginTop: '5%',
        alignItems: 'center'
    },
    text: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
    }
})