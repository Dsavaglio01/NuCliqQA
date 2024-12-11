import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native'
import React, {useContext, useState} from 'react'
import ThemeHeader from '../Components/ThemeHeader'
import { Divider } from 'react-native-paper'
import {Octicons} from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import PreviewFooter from '../Components/PreviewFooter';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useFonts, Montserrat_700Bold, Montserrat_500Medium } from '@expo-google-fonts/montserrat'
import { Image } from 'react-native-compressor';
import themeContext from '../lib/themeContext';
import * as FileSystem from 'expo-file-system'
const UploadGuidelines = ({route}) => {
    const {upload, ai} = route.params;
    const theme = useContext(themeContext)
    const [isChecked, setIsChecked] = useState(false);
    const navigation = useNavigation();
    const [fontsLoaded, fontError] = useFonts({
    Montserrat_700Bold,
    Montserrat_500Medium
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  const getFileSize = async (uri) => {
  const { uri: fileUri, exists, size } = await FileSystem.getInfoAsync(uri);
   console.log(size)
};
    const pickImage = async() => {
      await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          //allowsMultipleSelection: true,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        }).then(async(image) => {
          if (!image.canceled) {
              image.assets.map(async(ite, index) => {
              //getFileSize(ite.uri)
              const result = await Image.compress(
                ite.uri,
                {},
              );
              //getFileSize(result)
              //console.log(result)
              navigation.navigate('DesignTheme', {source: result})
                      
            })
            }
        })
    };
    
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <ThemeHeader text={"Get Themes"} video={false} backButton={true}/>
      <Divider borderWidth={0.4} style={{borderColor: theme.color}}/>
      <View style={{marginLeft: '5%', marginRight: '5%'}}>
        <Text style={[styles.header, {color: theme.color}]}>{upload ? 'Upload Theme' : 'Generate Theme'}</Text>
        <Divider borderWidth={0.4} style={{borderStyle: 'dashed', borderRadius: 1,}}/>
        <Text style={[styles.supplementaryText, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Please review and agree to the NuCliq Terms and Conditions below.</Text>
        <View style={{borderWidth: 1, marginTop: '5%', borderColor: theme.color}}>
            <Text style={[styles.tandctext, {color: theme.color}]}>Terms & Conditions</Text>
            <Divider borderWidth={0.4}/>
            <Text style={[styles.tandctext, {color: theme.color}]}>When uploading an image as your theme for your timeline and profile make sure you follow these guidelines:</Text>
            <View style={{padding: 10, flexDirection: 'row',}}>
                <Octicons name='dot-fill' size={30} color={theme.color}/>
                <Text style={[styles.tandctext, {paddingTop: 5, alignSelf: 'center', color: theme.color}]}>Make sure the image is not infringing any copyright or you did not copy or use it without permission from the owner.</Text>
            </View>
            <View style={{padding: 10, paddingTop: 0, flexDirection: 'row', }}>
                <Octicons name='dot-fill' size={30} color={theme.color}/>
                <Text style={[styles.tandctext, {paddingTop: 5, alignSelf: 'center', color: theme.color}]}>The image is appropriate, safe for work and the community.</Text>
            </View>
            {/* <Text style={[styles.tandctext, {textDecorationLine: 'underline', marginLeft: '7.5%', color: theme.color}]}>Read Additional Guidelines</Text> */}
            <TouchableOpacity activeOpacity={1} onPress={() => {setIsChecked(!isChecked)}} style={{flexDirection: 'row', padding: 10, alignItems: 'center'}}>
                <Checkbox value={isChecked} onValueChange={() => {setIsChecked(!isChecked)}} color={isChecked ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                <Text style={[styles.tandctext, {fontWeight: '700', color: theme.color}]}>I agree with the <Text style={{textDecorationLine: 'underline', color: theme.color}} onPress={() => navigation.navigate('TandC')}>Terms and Conditions</Text></Text>
            </TouchableOpacity>
            
        </View>
        <PreviewFooter containerStyle={{backgroundColor: theme.backgroundColor, marginTop: '5%'}} text={"CONTINUE"} onPressCancel={() => navigation.navigate('All', {name: null})} onPress={!isChecked ? null : upload ? pickImage : () => navigation.navigate('FinalizeTheme')}/>
      </View>
      
    </View>
  )
}

export default UploadGuidelines

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
    supplementaryText: {
        fontSize: Dimensions.get('screen').height / 44,
        fontFamily: 'Montserrat_500Medium',
        padding: 10,
        paddingLeft: 0,
    },
    tandctext: {
        fontSize: Dimensions.get('screen').height / 54.9,
        fontFamily: 'Montserrat_500Medium',
        padding: 10,
        //fontWeight: '600'
    }
})