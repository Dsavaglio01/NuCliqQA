import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native'
import React, {useContext, useRef} from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { useFonts, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
const InputBox = ({text, icon, onChangeText, onChange, containerStyle, keyboardType, blurOnSubmit, secondIconStyle, inputMode, placeholderStyle, onEndEditing, password, key, value, secondIcon, submit, keyType, contentType, maxLength, multilineStyle, inputStyle, secondIconName, secondOnPress, multiline}) => {
    //console.log(icon)
    const inputRef = useRef(null)
    const theme = useContext(themeContext)
    function handleClick() {
    if (inputRef.current) {
        inputRef.current.focus();
    }
    }
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_400Regular,
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
    return (
    <TouchableOpacity activeOpacity={1} onPress={handleClick} style={[styles.container, {backgroundColor: theme.backgroundColor, borderColor: theme.color}, containerStyle]}>
        <MaterialCommunityIcons name={icon} size={25} style={{alignSelf: "center", marginLeft: '5.5%'}} color={theme.color}/>
        <TextInput onChange={onChange} ref={inputRef} keyboardType={keyboardType} autoCorrect={true} blurOnSubmit={blurOnSubmit} onEndEditing={onEndEditing} inputMode={inputMode} scrollEnabled={false} onKeyPress={key} placeholder={text} placeholderTextColor={placeholderStyle ? placeholderStyle : "grey"} returnKeyType={keyType} maxLength={maxLength} multiline={multiline}
         onSubmitEditing={submit} style={!multiline && icon != undefined ? [styles.textinput, {color: theme.color}, inputStyle] : multiline ? [styles.multilineInput, {color: theme.color}, multilineStyle] : [styles.textinput, {color: theme.color}, inputStyle]} textContentType={'oneTimeCode'} secureTextEntry={password} value={value} onChangeText={onChangeText} />
        {secondIcon ? <MaterialCommunityIcons name={secondIconName} size={25} color={theme.color} style={[{position: 'absolute', top: 10, left: 240}, secondIconStyle]} onPress={secondOnPress}/> : null}
    </TouchableOpacity>
  )
}

export default InputBox

const styles = StyleSheet.create({
    container: {
        borderRadius: 9,
        borderWidth: 1,
        width: '90%',
        marginLeft: '5%',
        //width: '95%',
        //marginLeft: '5%',
        flexDirection: 'row',
        //borderWidth: 1.25,
        //borderColor: 'red'
    },
    textinput: {
        //flex: 1,
        fontSize: 15.36,
        padding: 12,
        width: '90%',
        //paddingLeft: 0,
        alignSelf: 'center',
        fontFamily: 'Montserrat_400Regular',
        //paddingLeft: 0
    },
    multilineInput: {
        fontSize: 15.36,
        //padding: 12,
        paddingTop: 13,
        //alignSelf: 'center',
        fontFamily: 'Montserrat_400Regular',
        minHeight: 100,
        maxHeight: 250,
        //height: 100,
        //marginLeft: -40,
        //padding: 0,
        //paddingLeft: 0,
        width: '90%',
    }
})