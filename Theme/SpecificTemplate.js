import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import NextButton from '../Components/NextButton'
import { useNavigation } from '@react-navigation/native'
import useAuth from '../Hooks/useAuth'

const SpecificTemplate = ({route}) => {
    const {template, name} = route.params
    const navigation = useNavigation();
    const {user} = useAuth();
    //console.log(theme)
    
  return (
    <View style={styles.container}>
        <View style={styles.main}>
            <Text style={styles.nameText}>{name}</Text>
            <Image source={{uri: template}} style={styles.template}/>
        </View>
        <View style={styles.footer}>
            <NextButton text={"Add Template"} onPress={{}} />
        </View>
    </View>
  )
}

export default SpecificTemplate

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    footer: {
        justifyContent: 'flex-end',
        flex: 1,
        marginBottom: '10%',
        marginLeft: '5%',
        marginRight: '5%'
    },
    template: {
       height: '80%', 
       width: '80%', 
       borderRadius: 10, 
       marginHorizontal: 10, 
       marginBottom: 10
    },
    nameText: {
      fontSize: 24,
      marginBottom: '7.5%',
      fontWeight: '700'
    },
    main: {
        marginTop: '10%',
        marginRight: '5%',
        marginLeft: '5%',
        alignItems: 'center'
    }
})