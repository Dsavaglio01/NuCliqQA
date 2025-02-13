import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native'
import React, {useContext, useState} from 'react'
import ThemeHeader from '../Components/ThemeHeader'
import { Divider } from 'react-native-paper'
import {Octicons} from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import PreviewFooter from '../Components/PreviewFooter';
import { useNavigation } from '@react-navigation/native';
import themeContext from '../lib/themeContext';
import { useSinglePickImage } from '../Hooks/useSinglePickImage';
const UploadGuidelines = ({route}) => {
    const {upload} = route.params;
    const theme = useContext(themeContext)
    const [isChecked, setIsChecked] = useState(false);
    const navigation = useNavigation();
    const {pickImage} = useSinglePickImage({theme: true});
    
  return (
    <View style={styles.container}>
      <ThemeHeader text={"Get Themes"} video={false} backButton={true}/>
      <Divider borderWidth={0.4} style={{borderColor: "#fafafa"}}/>
      <View style={{marginHorizontal: '5%'}}>
        <Text style={styles.header}>{upload ? 'Upload Theme' : 'Generate Theme'}</Text>
        <Divider borderWidth={0.4} style={styles.divider}/>
        <Text style={styles.supplementaryText}>Please review and agree to the NuCliq Terms and Conditions below.</Text>
        <View style={styles.main}>
          <Text style={styles.tandctext}>Terms & Conditions</Text>
          <Divider borderWidth={0.4}/>
          <Text style={styles.tandctext}>When uploading an image as your theme for your timeline and profile make sure you follow these guidelines:</Text>
          <View style={styles.optionContainer}>
            <Octicons name='dot-fill' size={30} color={theme.color}/>
            <Text style={styles.tandctextsupplement}>Make sure the image is not infringing any copyright or you did not copy or use it without permission from the owner.</Text>
          </View>
          <View style={[styles.optionContainer, {paddingTop: 0}]}>
            <Octicons name='dot-fill' size={30} color={theme.color}/>
            <Text style={styles.tandctextsupplement}>The image is appropriate, safe for work and the community.</Text>
          </View>
          <TouchableOpacity activeOpacity={1} onPress={() => {setIsChecked(!isChecked)}} style={styles.checkBox}>
              <Checkbox value={isChecked} onValueChange={() => {setIsChecked(!isChecked)}} color={isChecked ? "#9EDAFF" : "#fafafa"} />
              <Text style={[styles.tandctext, {fontWeight: '700'}]}>I agree with the <Text style={{textDecorationLine: 'underline', color: "#fafafa"}} onPress={() => navigation.navigate('TandC')}>Terms and Conditions</Text></Text>
          </TouchableOpacity>
            
        </View>
        <PreviewFooter containerStyle={styles.button} text={"CONTINUE"} onPressCancel={() => navigation.navigate('All', {name: null})} onPress={!isChecked ? null : upload ? pickImage : () => navigation.navigate('FinalizeTheme')}/>
      </View>
      
    </View>
  )
}

export default UploadGuidelines

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#121212"
    },
    header: {
      fontSize: Dimensions.get('screen').height / 35.2,
      textAlign: 'left',
      fontFamily: 'Montserrat_700Bold',
      padding: 10,
      color: "#fafafa",
      paddingLeft: 0, 
    },
    divider: {
      borderStyle: 'dashed', 
      borderRadius: 1,
    },
    supplementaryText: {
      fontSize: Dimensions.get('screen').height / 44,
      fontFamily: 'Montserrat_500Medium',
      padding: 10,
      paddingLeft: 0,
      color: "#9edaff"
    },
    main: {
      borderWidth: 1, 
      marginTop: '5%', 
      borderColor: "#fafafa"
    },
    tandctext: {
      fontSize: Dimensions.get('screen').height / 54.9,
      fontFamily: 'Montserrat_500Medium',
      padding: 10,
      color: "#fafafa"
    },
    tandctextsupplement: {
      fontSize: Dimensions.get('screen').height / 54.9,
      fontFamily: 'Montserrat_500Medium',
      padding: 10,
      color: "#fafafa",
      paddingTop: 5, 
      alignSelf: 'center', 
    },
    optionContainer: {
      padding: 10, 
      flexDirection: 'row',
    },
    checkBox: {
      flexDirection: 'row', 
      padding: 10, 
      alignItems: 'center'
    },
    button: {
      backgroundColor: "#121212", 
      marginTop: '5%'
    }

})