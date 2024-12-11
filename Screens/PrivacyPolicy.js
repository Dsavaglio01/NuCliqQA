import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
const PrivacyPolicy = () => {
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
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '95%'}}> 
                <Text style={[styles.header, {color: theme.color}]}>NuCliq Privacy Policy (US and International)</Text>
                <MaterialCommunityIcons name='close' size={30} color={theme.color} onPress={() => navigation.goBack()}/>
            </View>
            <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 55}}>
                <Text style={[[styles.supplementText, {color: theme.color}], {fontWeight: '500'}]}>Welcome to NuCliq! We take your privacy seriously and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, share, and store your data based on your location:</Text>
                <Text style={[styles.secondaryHeader, {color: theme.color}]}>For users in the United States:</Text>
                <Text style={[styles.secondaryHeader, {color: theme.color}]}>Information We May Collect:</Text>
                <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Account Information: Name, username, email address, password, phone number, and date of birth.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Profile Information: Gender, location, interests, bio, and other optional details.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Content: Photos, images, videos, comments, messages, likes, saves, and other uploaded content.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Device Information: Device type, operating system, IP address, and unique identifiers.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Usage Information: Features accessed, content viewed, interactions with other users, and browsing history within the app.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Contact Information: Your phone contact list (optional) to help you find friends and connect with them. You can control this access anytime through your device settings.
            </Text>
            <Text style={[styles.secondaryHeader, {color: theme.color}]}>How We Use Your Information:</Text>
                <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Operate and improve the Services
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Personalize your experience and recommend content
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Communicate important service updates and announcements
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Provide customer support and troubleshoot issues
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Prevent fraud and abuse
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
              Analyze data for trends and insights to improve the platform
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
              (Optional) Target relevant advertising based on your interests and activity (with your consent)
            </Text>
            <Text style={[styles.secondaryHeader, {color: theme.color}]}>Sharing Your Information:</Text>
                <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Service Providers: We may share your information with trusted third-party service providers who help us operate the platform, such as cloud storage, data analytics, and customer service providers.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Other Users: When you share content publicly or connect with other users, your information may be visible to them.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Legal Compliance: We may disclose your information if required by law or to comply with legal process, court orders, or government requests.
            </Text>
            <Text style={[styles.secondaryHeader, {color: theme.color}]}>Your Choices:</Text>
                <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               You have the right to access, update, delete, and restrict processing of your information through your account settings.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               You can manage your contact list access, notifications, and advertising preferences within the app settings (if applicable).
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               You can opt out of certain data collection practices through your device settings.
            </Text>
            <Text style={[styles.secondaryHeader, {color: theme.color}]}>Data Retention:</Text>
                <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               We retain your information for as long as necessary to provide the Services and fulfill the purposes described in this Policy. Legal or compliance requirements may extend this period.
            </Text>
            <Text style={[styles.secondaryHeader, {color: theme.color}]}>Security:</Text>
                <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               We take reasonable measures to protect your information from unauthorized access, disclosure, alteration, or destruction. However, no security measures are perfect, and we cannot guarantee complete security.
            </Text>
            <Text style={[styles.secondaryHeader, {color: theme.color}]}>International Data Transfers:</Text>
                <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Your information may be transferred and processed in countries outside your own. These countries may have different data protection laws than your own.
            </Text>
            <Text style={[styles.secondaryHeader, {color: theme.color}]}>Changes to this Policy:</Text>
                <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               We may update this Policy from time to time. We may notify you of any changes by posting the revised Policy on the platform.
            </Text>
            <Text style={[styles.secondaryHeader, {color: theme.color}]}>Contact Us:</Text>
                <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               If you have any questions about this Policy, please contact us at contact@nucliq.com.
            </Text>
            <Text style={[styles.secondaryHeader, {color: theme.color}]}>Additional Information:</Text>
                <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               This policy adheres to the requirements of the California Consumer Privacy Act (CCPA) and the General Data Protection Regulation (GDPR) for users in the respective jurisdictions.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               We recommend reviewing this Policy periodically for any changes.
            </Text>
            <Text style={[styles.secondaryHeader, {color: theme.color}]}>For users outside the United States:</Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               <Text style={{fontWeight: '600'}}>Scope:</Text> Applies to all users globally, with specific sections adapted for regions like EU (GDPR).
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               <Text style={{fontWeight: '600'}}>Information We Collect:</Text> Account, profile, content, device, usage, and (optional) contact information.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               <Text style={{fontWeight: '600'}}>Legal Basis:</Text> Contract, legitimate interests, and consent (for specific activities).
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               <Text style={{fontWeight: '600'}}>Sharing Your Information:</Text> Service providers, other users (public content/connections), legal compliance.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               <Text style={{fontWeight: '600'}}>Your Choices & Rights:</Text> Access, rectification, deletion, restriction, objection, and data portability.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               <Text style={{fontWeight: '600'}}>International Data Transfers:</Text> With safeguards to protect your data in all countries.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               <Text style={{fontWeight: '600'}}>Data Retention:</Text> As long as needed for Services and legal/compliance reasons.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               <Text style={{fontWeight: '600'}}>Security:</Text> Strong measures to protect your information, but no guarantee of perfect security.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               <Text style={{fontWeight: '600'}}>Policy Updates:</Text> We may update this Policy, so please check back regularly.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               <Text style={{fontWeight: '600'}}>Contact Us:</Text> Have questions? Contact Us at contact@nucliq.com
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>By using NuCliq, you agree to this Privacy Policy. If you have any questions or concerns, please don't hesitate to contact us.</Text>
            </ScrollView>
        </View>
    </View>
  )
}

export default PrivacyPolicy

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
        padding: 5,
        ///textAlign: 'center',
        fontFamily: 'Montserrat_600SemiBold'
    }
})