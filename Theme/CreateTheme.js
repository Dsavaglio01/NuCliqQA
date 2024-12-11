import { StyleSheet, Text, Touchable, View, TouchableOpacity, Dimensions, Image, ScrollView} from 'react-native'
import React, {useContext, useState} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import NextButton from '../Components/NextButton'
import { useNavigation } from '@react-navigation/native';
import ThemeHeader from '../Components/ThemeHeader';
import { Divider } from 'react-native-paper';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import PreviewFooter from '../Components/PreviewFooter';
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { getDoc } from 'firebase/firestore';
import themeContext from '../lib/themeContext';
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing';
const CreateTheme = ({route}) => {
    const {avatar} = route.params;
    const theme = useContext(themeContext)
    const navigation = useNavigation();
    const [designing, setDesigning] = useState(false);
    const [howSell, setHowSell] = useState(false);
    const [copyright, setCopyright] = useState(false);
    const [howEarn, setHowEarn] = useState(false);
    const [credits, setCredits] = useState(false);
    const downloadPdf = async() => {
  const filename = 'NuCliqDesignGuidelines.pdf'; // Set a desired filename

  // Request storage permissions (Android only)

  try {
    const { uri } = await FileSystem.downloadAsync(
      'https://nucliq.com/NuCliqDesignGuidelines.pdf',
      FileSystem.documentDirectory + filename
    );

    
      await Sharing.shareAsync(uri); // Prompts user to save or open using default PDF viewer

    alert('PDF downloaded successfully!');
  } catch (error) {
    console.error('Error downloading PDF:', error);
    alert('An error occurred during download. Please try again.');
}
    }
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_400Regular
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <ThemeHeader video={false} text={'Get Themes'}/>
      <Divider borderWidth={0.4} borderColor={theme.color}/>
      <View style={{marginLeft: '5%', marginRight: '5%', flex: 1}}>
      <Text style={[styles.header, {color: theme.color}]}>{avatar ? 'Create Your Own Avatar' : 'Designing New Themes'}</Text>
      <Divider borderWidth={0.4} style={{borderStyle: 'dashed', borderRadius: 1,}}/>
      <ScrollView contentContainerStyle={{flexGrow: 1}} showsVerticalScrollIndicator={false}>
      <Text style={[styles.guidelineHeader, {color: theme.color}]}>DESIGN GUIDELINES</Text>
      {avatar ? <></> : 
      <Text style={[styles.supplementaryText, {color: theme.color}]}>NuCliq allows you to create your own themes! Please read the information below before uploading your theme.</Text>}     
      {/* <TouchableOpacity style={styles.downloadContainer} onPress={() => downloadPdf()}>
        <MaterialCommunityIcons name='download-outline' size={27.5} style={{alignSelf: 'center', paddingRight: 5}} color={theme.color}/>
        <Text style={[styles.downloadText, {color: theme.color}]}>Download Complete Guidelines</Text>
      </TouchableOpacity> */}
      <View style={{marginTop: '5%'}}>
      <TouchableOpacity style={styles.optionsContainer} onPress={() => setDesigning(!designing)}>
        <Text style={designing ? [styles.optionsText, {paddingBottom: 0, color: theme.color}] : [styles.optionsText, {color: theme.color}]}>Designing your own themes</Text>
        {designing ? <MaterialCommunityIcons name='chevron-up' size={27.5} style={{paddingTop: 10}} color={theme.color}/> : <MaterialCommunityIcons name='chevron-down' size={27.5} color={theme.color}/>}
        
      </TouchableOpacity>
      {designing ? <View>
        <Text style={[styles.explainText, {color: theme.color}]}><Text style={{fontSize: Dimensions.get('screen').height / 35.2}}>{`\u2022 `}</Text><Text style={{fontWeight: '700'}}>Unique Designs</Text>: NuCliq prefers that you design unique themes. Uniquely designed themes help your design to be memorable and different and help you showcase your personality. Creating your own theme also enables you to stand out from the rest of the crowd.</Text>
        {/* <Text style={styles.explainText}><Text style={{fontSize: Dimensions.get('screen').height / 35.2}}>{`\u2022 `}</Text><Text style={{fontWeight: '700'}}>AI-Generated</Text>: Our AI can also generate good themes but can have limited output based on your request.</Text> */}
        </View> : null}
      <TouchableOpacity style={styles.optionsContainer} onPress={() => setCopyright(!copyright)}>
        <Text style={copyright ? [styles.optionsText, {paddingBottom: 0, color: theme.color}] : [styles.optionsText, {color: theme.color}]}>Copyright guidelines</Text>
        {copyright ? <MaterialCommunityIcons name='chevron-up' size={27.5} style={{paddingTop: 10}} color={theme.color}/> : <MaterialCommunityIcons name='chevron-down' size={27.5} color={theme.color}/>}
      </TouchableOpacity>
      {copyright ? <View>
        <Text style={[styles.explainText, {color: theme.color}]}><Text style={{fontSize: Dimensions.get('screen').height / 35.2}}>{`\u2022 `}</Text>Using graphical images, photos, vectors, or other images from third-party technologies (websites, apps, etc.) is not allowed on NuCliq. You may only use these graphical images if the third-party website will enable you to do so. You must carefully read the terms and conditions of the websites. NuCliq is not responsible for copyright infringement or legal actions resulting from the violation.</Text>
        </View> : null}
      <TouchableOpacity style={styles.optionsContainer} onPress={() => setCredits(!credits)}>
        <Text style={[styles.optionsText, {color: theme.color}]}>Credits for uploading</Text>
        {credits ? <MaterialCommunityIcons name='chevron-up' size={27.5} style={{paddingTop: 10}} color={theme.color}/> : <MaterialCommunityIcons name='chevron-down' size={27.5} color={theme.color}/>}
      </TouchableOpacity>
      {credits ? 
      <View>
        <Text style={[styles.explainText, {color: theme.color}]}><Text style={{fontSize: Dimensions.get('screen').height / 35.2}}>{`\u2022 `}</Text>In order for you to upload images as themes, you must have at least 1 NuCliq credit in order to do so. If you have 0 credits you must purchase credits in order to upload images. Credit purchases come in bundles of 20 credits (20 SUCCESSFUL uploads) to purchase. Purchase of credits are non-refundable.</Text>
      </View> : null}
      {/* <TouchableOpacity style={styles.optionsContainer} onPress={() => setHowSell(!howSell)}>
        <Text style={howSell ? [styles.optionsText, {paddingBottom: 0, color: theme.color}] : [styles.optionsText, {color: theme.color}]}>How can I sell my themes?</Text>
        {howSell ? <MaterialCommunityIcons name='chevron-up' size={27.5} style={{paddingTop: 10}} color={theme.color}/> : <MaterialCommunityIcons name='chevron-down' size={27.5} color={theme.color}/>}
      </TouchableOpacity>
      {howSell ? <View>
        <Text style={[styles.explainText, {color: theme.color}]}><Text style={{fontSize: Dimensions.get('screen').height / 35.2}}>{`\u2022 `}</Text>You can sell your uniquely designed themes through the NuCliq marketplace only.</Text>
        <Text style={[styles.explainText, {color: theme.color}]}><Text style={{fontSize: Dimensions.get('screen').height / 35.2}}>{`\u2022 `}</Text><Text style={{fontWeight: '700'}}>Important note</Text>: Once you sell your themes on the NuCliq marketplace, you cannot give them away for free, sell, or resell them on other platforms. You can only provide them for free or sell them through NuCliq. Reselling themes is not allowed.</Text>
        </View> : null} */}
      {/* <TouchableOpacity style={styles.optionsContainer} onPress={() => setHowEarn(!howEarn)}>
        <Text style={howEarn ? [styles.optionsText, {paddingBottom: 0, color: theme.color}] : [styles.optionsText, {color: theme.color}]}>How much can I earn selling themes?</Text>
        {howEarn ? <MaterialCommunityIcons name='chevron-up' size={27.5} style={{paddingTop: 10}} color={theme.color}/> : <MaterialCommunityIcons name='chevron-down' size={27.5} style={{alignSelf: 'center'}} color={theme.color}/>}
      </TouchableOpacity>
      {howEarn ? <View>
        <Text style={[styles.explainText, {color: theme.color}]}><Text style={{fontSize: Dimensions.get('screen').height / 35.2}}>{`\u2022 `}</Text>We require that you sell your themes between $1.99 - $4.99, making it easily affordable for everyone to purchase your themes. You get 70%, and NuCliq gets 30% of the total theme sale after processing fees.</Text>
        </View> : null} */}
      </View>
      </ScrollView>
      <View style={{marginBottom: '7.5%'}}>
      <Divider borderWidth={0.4} style={{borderStyle: 'dashed', marginBottom: '2.5%', borderRadius: 1,}}/>
      
      <PreviewFooter containerStyle={{backgroundColor: theme.backgroundColor}} text={"CONTINUE"} onPressCancel={() => navigation.goBack()} onPress={() => navigation.navigate('Choose')}/>
        </View>
    </View>
    </View>
  )
}

export default CreateTheme

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        fontSize: Dimensions.get('screen').height / 35.2,
        textAlign: 'left',
        fontFamily: 'Montserrat_700Bold',
        padding: 10,
        paddingLeft: 0, 
        //marginTop: '5%'
    },
    guidelineHeader: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_400Regular',
        padding: 10,
        paddingLeft: 0,
        color: "#005278"
    },
    supplementaryText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        padding: 10,
        paddingTop: 0,
        paddingLeft: 0,
    },
    downloadContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    optionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    downloadText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        textDecorationLine: 'underline',
    },
    optionsText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_700Bold',
        padding: 10,
        paddingLeft: 0,
    },
    explainText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        color: "#005278"
    }
})