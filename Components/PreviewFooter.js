import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import MainButton from './MainButton'
import NextButton from './NextButton'
import { useNavigation } from '@react-navigation/native'

const PreviewFooter = ({onPress, text, containerStyle, onPressCancel}) => {
  const navigation = useNavigation();
  return (
    <View style={[styles.container, containerStyle]}>
      <MainButton text={"CANCEL"} onPress={onPressCancel} textStyle={{fontWeight: '700'}}/>
      <NextButton text={text} onPress={onPress} textStyle={{fontWeight: '700'}}/>
    </View>
  )
}

export default PreviewFooter

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        //margin: '3%',
        marginTop: '3%',
        marginBottom: '5.5%',
        backgroundColor: "#eeeeee"
    },
    
})