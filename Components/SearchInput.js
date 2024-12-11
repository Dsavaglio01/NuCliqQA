import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, {useContext, useRef} from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
const SearchInput = ({text, icon, ref, onChangeText, containerStyle, password, value, onPress, returnKeyType, onFocus, placeholder, autoFocus, iconStyle, onSubmitEditing}) => {
  const textInputRef = useRef(null)
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
    <TouchableOpacity style={[styles.container, {backgroundColor: theme.backgroundColor}, containerStyle]} onPress={ () => {onPress; textInputRef.current.focus()}} activeOpacity={1}>
        <MaterialCommunityIcons name={icon} size={20} style={{alignSelf: "center", paddingLeft: 5}} color={theme.color}/>
        <TextInput ref={textInputRef} autoFocus={autoFocus} placeholder={placeholder} onFocus={onFocus} returnKeyType={returnKeyType} onSubmitEditing={onSubmitEditing} placeholderTextColor="#676767" style={[styles.textinput, {color: theme.color}]} secureTextEntry={password} value={text == true ? value : ''} 
        onChangeText={onChangeText}/> 
        {text == true ? <MaterialCommunityIcons name='eraser' color={theme.color} size={20} style={iconStyle} onPress={onPress} /> : null}
        
    </TouchableOpacity>
  )
}

export default SearchInput

const styles = StyleSheet.create({
    container: {
        borderRadius: 5,
        height: 40,
        //borderWidth: 1,
        //width: '95%',
        //marginLeft: '5%',
        flexDirection: 'row',
        //borderWidth: 1.25,
        //borderColor: 'red'
    },
    textinput: {
        //padding: 20,
        fontSize: 15.36,
        fontWeight: '600',
        fontFamily: 'Montserrat_500Medium',
        //width: '85%',
        //padding: 5,
        paddingLeft: 10
    }
})