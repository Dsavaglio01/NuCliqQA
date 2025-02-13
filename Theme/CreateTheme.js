import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView} from 'react-native'
import React, {useContext, useState} from 'react'
import { useNavigation } from '@react-navigation/native';
import ThemeHeader from '../Components/ThemeHeader';
import { Divider } from 'react-native-paper';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import PreviewFooter from '../Components/PreviewFooter';
import themeContext from '../lib/themeContext';
const CreateTheme = () => {
    const theme = useContext(themeContext)
    const navigation = useNavigation();
    const [designing, setDesigning] = useState(false);
    const [copyright, setCopyright] = useState(false);
    const [credits, setCredits] = useState(false);
  return (
    <View style={styles.container}>
      <ThemeHeader video={false} text={'Get Themes'}/>
      <Divider borderWidth={0.4} borderColor={theme.color}/>
      <View style={styles.title}>
        <Text style={styles.header}>{'Designing New Themes'}</Text>
        <Divider borderWidth={0.4} style={styles.divider}/>
        <ScrollView contentContainerStyle={{flexGrow: 1}} showsVerticalScrollIndicator={false}>
          <Text style={styles.guidelineHeader}>DESIGN GUIDELINES</Text>
          <Text style={styles.supplementaryText}>NuCliq allows you to create your own themes! Please read the information below before uploading your theme.</Text> 
          <View style={{marginTop: '5%'}}>
            <TouchableOpacity style={styles.optionsContainer} onPress={() => setDesigning(!designing)}>
              <Text style={designing ? styles.openOptionsText : styles.optionsText}>Designing your own themes</Text>
              {designing ? <MaterialCommunityIcons name='chevron-up' size={27.5} style={{paddingTop: 10}} color={theme.color}/> : <MaterialCommunityIcons name='chevron-down' size={27.5} color={theme.color}/>}
              
            </TouchableOpacity>
          {designing ? <View>
            <Text style={styles.explainText}><Text style={{fontSize: Dimensions.get('screen').height / 35.2}}>{`\u2022 `}</Text><Text style={{fontWeight: '700'}}>Unique Designs</Text>: NuCliq prefers that you design unique themes. Uniquely designed themes help your design to be memorable and different and help you showcase your personality. Creating your own theme also enables you to stand out from the rest of the crowd.</Text>
            </View> : null}
          <TouchableOpacity style={styles.optionsContainer} onPress={() => setCopyright(!copyright)}>
            <Text style={copyright ? styles.openOptionsText : styles.optionsText}>Copyright guidelines</Text>
            {copyright ? <MaterialCommunityIcons name='chevron-up' size={27.5} style={{paddingTop: 10}} color={theme.color}/> : <MaterialCommunityIcons name='chevron-down' size={27.5} color={theme.color}/>}
          </TouchableOpacity>
          {copyright ? <View>
            <Text style={styles.explainText}><Text style={{fontSize: Dimensions.get('screen').height / 35.2}}>{`\u2022 `}</Text>Using graphical images, photos, vectors, or other images from third-party technologies (websites, apps, etc.) is not allowed on NuCliq. You may only use these graphical images if the third-party website will enable you to do so. You must carefully read the terms and conditions of the websites. NuCliq is not responsible for copyright infringement or legal actions resulting from the violation.</Text>
            </View> : null}
          <TouchableOpacity style={styles.optionsContainer} onPress={() => setCredits(!credits)}>
            <Text style={styles.optionsText}>Credits for uploading</Text>
            {credits ? <MaterialCommunityIcons name='chevron-up' size={27.5} style={{paddingTop: 10}} color={theme.color}/> : <MaterialCommunityIcons name='chevron-down' size={27.5} color={theme.color}/>}
          </TouchableOpacity>
          {credits ? 
          <View>
            <Text style={styles.explainText}><Text style={{fontSize: Dimensions.get('screen').height / 35.2}}>{`\u2022 `}</Text>In order for you to upload images as themes, you must have at least 1 NuCliq credit in order to do so. If you have 0 credits you must purchase credits in order to upload images. Credit purchases come in bundles of 20 credits (20 SUCCESSFUL uploads) to purchase. Purchase of credits are non-refundable.</Text>
          </View> : null}
          </View>
        </ScrollView>
        <View style={{marginBottom: '7.5%'}}>
          <Divider borderWidth={0.4} style={styles.secondDivider}/>
          <PreviewFooter containerStyle={{backgroundColor: "#121212"}} text={"CONTINUE"} onPressCancel={() => navigation.goBack()} onPress={() => navigation.navigate('Choose')}/>
        </View>
    </View>
    </View>
  )
}

export default CreateTheme

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212"
  },
  title: {
    marginLeft: '5%', 
    marginRight: '5%', 
    flex: 1
  },
  header: {
    fontSize: Dimensions.get('screen').height / 35.2,
    textAlign: 'left',
    fontFamily: 'Montserrat_700Bold',
    padding: 10,
    paddingLeft: 0, 
    color: "#fafafa"
  },
  divider: {
    borderStyle: 'dashed', 
    borderRadius: 1
  },
  guidelineHeader: {
    fontSize: 19.20,
    fontFamily: 'Montserrat_400Regular',
    padding: 10,
    paddingLeft: 0,
    color: "#fafafa"
  },
  supplementaryText: {
    fontSize: 19.20,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    paddingTop: 0,
    paddingLeft: 0,
    color: "#fafafa"
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  optionsText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_700Bold',
    padding: 10,
    paddingLeft: 0,
    color: "#fafafa"
  },
  openOptionsText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_700Bold',
    padding: 10,
    paddingBottom: 0,
    paddingLeft: 0,
    color: "#fafafa"
  },
  explainText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    color: "#fafafa"
  },
  secondDivider: {
    borderStyle: 'dashed', 
    marginBottom: '2.5%', 
    borderRadius: 1
  }
})