import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React, { useContext } from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Montserrat_600SemiBold, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
const TandC = () => {
    const navigation = useNavigation();
    const theme = useContext(themeContext)
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <View style={{marginVertical: '10%', marginHorizontal: '5%'}}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}> 
                <Text style={[styles.header, {color: theme.color}]}>NuCliq Terms & Conditions</Text>
                <MaterialCommunityIcons name='close' size={30} color={theme.color} onPress={() => navigation.goBack()}/>
            </View>
      <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 25}}>
      <Text style={[[styles.supplementText, {color: theme.color}], {fontWeight: '500'}]}>Welcome to NuCliq! We're excited to have you join our vibrant community where you can connect, share, and express yourself. These Terms of Service ("Terms") govern your access to and use of our services, including the NuCliq website, mobile app, and any other features, products, or services offered by NuCliq (collectively, the "Services").</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>1. Eligibility</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>You must be at least 18 years old or at least 13 years old WITH parent's permission to use the Services. When making an account, a Date of Birth that indicates 13-17 years of age (WITH parent's permission) or older must be provided.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>2. Content and Conduct</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>You are responsible for the content you submit to the Services ("Content"). This includes, but is not limited to, your profile information, photos, videos, themes, any images, comments, and messages.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>You agree that your Content will <Text style={{textDecorationLine: 'underline'}}>not</Text>:</Text>
      <View>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                Be illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Infringe any intellectual property rights, including copyrights, trademarks, or patents, of any third party.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Contain any malware, viruses, worms, spam, or other harmful code.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Impersonate any person or entity, or falsely state or misrepresent your affiliation with a person or entity.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
              Interfere with or disrupt the Services or any servers or networks connected to the Services.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                Promote or encourage illegal activity.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Contain political content, such as campaigning for or against political candidates, or parties.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                Contain nudity or sexually suggestive content.
            </Text>
            
        </View>
        <Text style={[styles.secondaryHeader, {color: theme.color}]}>3. Intellectual Property</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>The Services and all content contained therein are owned by NuCliq or its licensors. You may not copy, modify, distribute, transmit, sell, create derivative works from, or exploit any of the Services or Content without our express written permission.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>4. User Accounts</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>You are responsible for maintaining the confidentiality of your account password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>5. Moderation</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>While we strive to moderate content in all languages, some languages may not be as thoroughly moderated due to current limitations. We encourage users to report any content they believe violates our community guidelines, regardless of the language. Please note that content in unsupported languages might be subject to delayed moderation or potential removal if reported. We are committed to continuously improving our moderation capabilities and expanding language support.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>6. Termination</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>We may terminate your account or your access to the Services at any time, for any reason, without notice.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>7. Disclaimer of Warranties</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>The Services are provided "as is" and without warranty of any kind, express or implied. We disclaim all warranties, including, but not limited to, warranties of merchantability, fitness for a particular purpose, and non-infringement.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>8. Limitation of Liability</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>We will not be liable for any damages arising out of your use of the Services, including, but not limited to, direct, indirect, incidental, consequential, and punitive damages.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>9. Governing Law</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>These Terms will be governed by and construed in accordance with the laws of the State of Pennsylvania, without regard to its conflict of laws provisions.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>10. Entire Agreement</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>These Terms constitute the entire agreement between you and NuCliq regarding your use of the Services.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>11. Changes to Terms</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>We may modify these Terms at any time by posting the revised Terms on the Services. Your continued use of the Services after the posting of the revised Terms constitutes your acceptance of the revised Terms.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>12. Contact Us</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>If you have any questions about these Terms, please contact us at contact@nucliq.com.</Text>
      </ScrollView>
      </View>
    </View>
  )
}

export default TandC

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        fontSize: 24,
        fontFamily: 'Montserrat_700Bold',
        padding: 10,
        textAlign: 'center'
    },
    supplementText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 5
    },
    secondaryHeader: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_600SemiBold',
        padding: 5,
    }
})