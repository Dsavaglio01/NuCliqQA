import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Montserrat_500Medium, Montserrat_700Bold} from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
const ThemeMadeProgression = ({text, personal, personalStyle, freeStyle, saleStyle, free, sale, noAdditional}) => {
  const navigation = useNavigation();
  const theme = useContext(themeContext)
  const sendPersonalDataBack = () => {
        personal(true)
  }
  const sendFreeDataBack = () => {
    free(true)
    sale(false)
  }
  const sendSaleDataBack = () => {
    free(false)
    sale(true)
  }
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  //console.log(personal)
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', }}>
        <View>
          <Text style={[styles.headerText, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>{text}</Text>
          
          
        </View>
        <TouchableOpacity style={styles.icon} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name='close' size={25} color={theme.color}/>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ThemeMadeProgression

const styles = StyleSheet.create({
    container: {
        //flex: 1,
        //borderColor: "#979797",
      //margin: '5%',
      marginTop: '8%',
      marginBottom: '0.5%',
      shadowColor: "#000000",
      elevation: 20,
      shadowOffset: {width: 1, height: 3},
      shadowOpacity: 0.5,
      shadowRadius: 1,
    },
    headerText: {
      fontSize: 19.20,
      fontFamily: 'Montserrat_700Bold',
      padding: 5,
    },
    circle: {
      width: 16,
      height: 16,
      //borderRadius: 8,
      borderWidth: 1,
      margin: '2.5%',
      marginTop: 0,
    },
    optionContainer: {
      flexDirection: 'row'
    },
    icon: {
      marginRight: '2.5%',
      alignItems: 'center',
      justifyContent: 'center'
    }

})