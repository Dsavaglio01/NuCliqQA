import { StyleSheet, Text, View, ImageBackground} from 'react-native'
import React from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
import GuidelineProgression from '../Components/GuidelineProgression'
const StickerGuidelines = ({route}) => {
    const {source} = route.params;
    //console.log(source)
    const navigation = useNavigation();
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover">
        <RegisterHeader onPress={() => navigation.goBack()}/>
        <View style={styles.main}>
            <GuidelineProgression text={"Stickers"} colorOne={styles.barColor} colorTwo={styles.barColor}/>
            <Text style={styles.description}>When Designing or Generating your own Stickers, make sure...</Text>
            <View> 
                <Text style={styles.description}>{'\u2022'} The Sticker(s) are Appropriate, Safe For Work, and abides by the <Text style={styles.guidelineText}>Guidelines</Text></Text>
                <Text style={styles.description}>{'\u2022'} The Sticker(s) are Fun, Distinct and Unique to Showcase Who You Are!</Text>
            </View>
            <View style={{marginTop: '15%', marginLeft: '5%', marginRight: '5%'}}>
                <NextButton text={'Next'} onPress={() => navigation.navigate('AddStickers', {source: source})}/>
            </View>
        </View>
    </ImageBackground>
  )
}

export default StickerGuidelines

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#699fa1"
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