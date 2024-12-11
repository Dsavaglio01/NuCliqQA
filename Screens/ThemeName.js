import { StyleSheet, Text, View, ImageBackground, Alert} from 'react-native'
import React, {useState} from 'react'
import RegisterHeader from '../Components/RegisterHeader';
import InputBox from '../Components/InputBox';
import NextButton from '../Components/NextButton';
import { useNavigation } from '@react-navigation/native';
const ThemeName = ({route}) => {
    const {previewImage, name} = route.params;
    const navigation = useNavigation();
    const [themeName, setThemeName] = useState('');
    //console.log(previewImage)
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover">
        <RegisterHeader onPress={() => navigation.goBack()}/>
        <View style={styles.main}>
            <Text style={styles.addText}>Let's Give Your Theme a Name!</Text>
            <Text style={styles.supplementaryText}>This Cannot Be Changed</Text>
            <View style={{marginTop: '5%'}}>
                <InputBox text={'Theme Name'} onChangeText={setThemeName} keyType={'done'} value={themeName}/>
            </View>
            <View style={{marginTop: '10%', marginLeft: '5%', marginRight: '5%'}}>
                
                <NextButton text={'Next'} onPress={themeName.length > 0 ?
                 () => navigation.navigate('Profile', {name: name, previewImage: previewImage, previewMade: true, themeName: themeName, viewing: true})
                : () => Alert.alert('No Theme Name', 'Must Have Theme Name to Proceed', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])}/>

            </View>
        </View>
    </ImageBackground>
  )
}

export default ThemeName

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    main: {
        marginRight: '5%',
        marginLeft: '5%',
        marginTop: '35%',
        backgroundColor: "#fff",
        borderRadius: 25,
        flex: 1
    },
    addText: {
        fontSize: 19.20,
        padding: 25,
        paddingBottom: 10
    },
    supplementaryText: {
        fontSize: 15.36,
        padding: 25,
        paddingBottom: 0,
        paddingTop: 5
    },
})