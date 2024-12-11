import { StyleSheet, Text, View, ImageBackground, ActivityIndicator} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
import GuidelineProgression from '../Components/GuidelineProgression'
import * as Linking from 'expo-linking'
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import themeContext from '../lib/themeContext'
const BackgroundGuidelines = ({route}) => {
    const{ai, design, upload} = route.params;
    const [isDesign, setIsDesign] = useState(false);
    const navigation = useNavigation();
    const theme = useContext(themeContext);
    const url = 'https://www.canva.com/free/'
    const pickImage = async() => {
        //console.log('bruh')
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4,3],
            quality: 0.2
        })
        if (!result.canceled) {
            const source = {uri: result.assets[0].uri};
            //console.log(source)
            navigation.navigate('DesignTheme', {source: source.uri})
        }
        //console.log(result)
        
    };
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover">
        <RegisterHeader onPress={() => navigation.goBack()}/>
        <View style={styles.main}>
            <GuidelineProgression text={"Background"} colorOne={styles.barColor}/>
            {ai ? 
            <>
            <Text style={styles.description}>When generating your background using our AI tool, make sure...</Text> 
            <View> 
                <Text style={styles.description}>{'\u2022'} The Image is Appropriate, Safe For Work, and abides by the <Text style={styles.guidelineText}>Guidelines</Text></Text>
                <Text style={styles.description}>{'\u2022'} The Image is Fun, Distinct and Unique to Showcase Who You Are!</Text>
            </View>
            </>
            : 
            design ? <Text style={styles.description}>When designing your own background, make sure...</Text> 
            : upload ? <>
            <Text style={styles.description}>When uploading an image as your background, make sure...</Text> 
            <View> 
                <Text style={styles.description}>{'\u2022'} The Image is Appropriate, Safe For Work, and abides by the <Text style={styles.guidelineText}>Guidelines</Text></Text>
                <Text style={styles.description}>{'\u2022'} The Image is Fun, Distinct and Unique to Showcase Who You Are!</Text>
            </View>
            </>
            : <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />} 
            {ai ? <View style={{marginTop: '15%', marginLeft: '5%', marginRight: '5%'}}>
                <NextButton text={'Next'} onPress={() => navigation.navigate('FinalizeTheme')}/>
            </View> : design ? <View style={{marginTop: '15%', marginLeft: '5%', marginRight: '5%'}}>
                <NextButton text={'Next'} onPress={() => navigation.navigate('DesignTheme')}/>
            </View> : upload ?<View style={{marginTop: '15%', marginLeft: '5%', marginRight: '5%'}}>
                <NextButton text={'Next'} onPress={pickImage}/>
            </View> : <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />}
        </View>
    </ImageBackground>
    
  )
}

export default BackgroundGuidelines

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        //marginTop: '10%'
        //margin: '5%'
    },
    barColor: {
        borderColor: '#3286ac'
    },
    main: {
          backgroundColor: '#ffffffe6',
      borderRadius: 35,
      width: '90%',
      height: '90%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    description: {
       fontSize: 19.20,
        padding: 25,
        paddingBottom: 0
    },
    guidelineText: {
        textDecorationLine: 'underline',
        color: "blue"
    }
})