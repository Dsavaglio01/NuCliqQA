import { StyleSheet, Text, View, ScrollView} from 'react-native'
import React, { useContext } from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useFonts, Montserrat_500Medium, Montserrat_400Regular, Montserrat_600SemiBold} from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
const DataPolicy = () => {
    const navigation = useNavigation();
    const theme = useContext(themeContext)
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_400Regular,
    Montserrat_600SemiBold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={{marginVertical: '10%', marginHorizontal: '5%'}}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}> 
                <Text style={[styles.header, {color: theme.color}]}>NuCliq Data Usage Policy</Text>
                <MaterialCommunityIcons name='close' size={30} onPress={() => navigation.goBack()} color={theme.color}/>
            </View>
      <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 25}}>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>1. Introduction</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>Welcome to NuCliq! This Data Usage Policy explains how we collect, use, and share your data when you use our website, app, and other services (collectively, the "Platform"). We recognize the importance of your privacy and are committed to protecting it.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>2. Types of Information We Collect</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>We collect several types of information from you, including:</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>A. Information You Provide: </Text>
      <View>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                Account information: such as your name, username, email address, password, phone number, and profile picture.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Content you share: such as photos, images, videos, text, and comments.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Information you share in messages and other communications.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Information about your contacts and other users you interact with.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
             Payment information: if you make purchases through the Platform.
            </Text>
            
            
        </View>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>B. Information We Collect Automatically:</Text>
       <View>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                Device information: such as your device type, operating system, browser type, and IP address.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Usage data: such as your browsing history, search queries, multimedia such as photos and videos (if enabled) and how you interact with the Platform.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Location data: if you enable location services on your device.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Information from cookies and similar technologies: we use cookies or other technology to remember your preferences, identify you across devices, and improve your experience.
            </Text>
        </View>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>III. How We Use Your Information</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>We use your information for various purposes, including:</Text>
      <View>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                To provide and operate the Platform
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               To personalize your experience and show you content that is relevant to you
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               To send you important information about the Platform and account updates
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               To respond to your requests and inquiries
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               To market and advertise our services to you and others
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               To analyze and improve the Platform
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               To detect and prevent fraud and abuse
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               To comply with applicable laws and regulations
            </Text>
        </View>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>IV. Sharing Your Information</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>We may share your information with third-parties in the following circumstances:</Text>
      <View>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                Service Providers: We share your information with service providers who help us operate the Platform, such as, but not limited to, cloud storage providers and data analytics companies.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                Business Partners: We may share your information with business partners with whom we offer co-branded services or engage in joint marketing activities.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Law Enforcement and Legal Process: We may disclose your information to law enforcement agencies or other third parties if we are required to do so by law or to comply with a legal process.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Mergers and Acquisitions: We may disclose your information if we are involved in a merger, acquisition, or other business transaction.
            </Text>
        </View>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>V. Data Retention and Security</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>We will retain your information for as long as necessary to fulfill the purposes for which it was collected, including as required by law, accounting, or similar reporting purposes. We take reasonable security measures to protect your information from unauthorized access, disclosure, alteration, or destruction.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>VI. Your Choices and Rights</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>You have certain choices and rights regarding your information, including:</Text>
      <View>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                Access: You have the right to access your information and request a copy of it.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                Correction: You have the right to correct inaccurate or incomplete information.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Deletion: You have the right to request that we delete your information.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Marketing and Advertising: You can opt out of receiving marketing and advertising communications from us.
            </Text>
        </View>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>VII. International Data Transfers</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>If you are located outside of the United States, please be aware that your information may be transferred to and processed in the United States. The United States has different data protection laws than other countries, and your information may not be subject to the same level of protection as in your home country.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>VIII. Children's Privacy</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>Our Platform is not intended for people under the age of 13. We do not knowingly collect personal information from people under the age of 13. We do not knowingly collect personal information from people under the age of 18 WITHOUT parent's permission. You MUST have parent's permission in order to use NuCliq if below the age of 18. When making an account, a Date of Birth that indicates 18 years of age or older must be provided with no parent permission. With parent permission, a Date of Birth can indicate 13-17 years of age. If you are a parent or guardian and you are aware that your child has provided us with personal information that you have NOT consented to, please contact us.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>IX. Changes to this Policy</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>We may update this Data Usage Policy from time to time. We may notify you of any changes by posting the new Data Usage Policy on the Platform.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>X. Contact Us</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}>If you have any questions about this Data Usage Policy, please contact us </Text>
      </ScrollView>
      </View>
    </View>
  )
}

export default DataPolicy

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
        fontFamily: 'Montserrat_600SemiBold',
    }
})