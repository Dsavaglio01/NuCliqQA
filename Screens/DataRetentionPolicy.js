import { StyleSheet, Text, View, ScrollView} from 'react-native'
import React, { useContext } from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useFonts, Montserrat_500Medium, Montserrat_400Regular, Montserrat_600SemiBold} from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
const DataRetentionPolicy = () => {
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
                <Text style={[styles.header, {color: theme.color}]}>NuCliq Data Retention Policy</Text>
                <MaterialCommunityIcons name='close' size={30} onPress={() => navigation.goBack()} color={theme.color}/>
            </View>
      <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 25}}>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>Purpose: </Text>
      <View>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                To establish guidelines for the retention and disposal of data within NuCliq.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               To ensure compliance with legal, regulatory, and contractual obligations.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               To minimize storage costs and optimize resource utilization.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               To protect user privacy by securely deleting data that is no longer needed.
            </Text> 
        </View>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>Scope:</Text>
       <View>
        <Text style={[styles.supplementText, {color: theme.color}]}>This policy applies to all data stored, processed, and transmitted within NuCliq, including:</Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                User-generated content (e.g., profiles, posts, messages, themes, images, etc.)
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Application settings and configurations
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               System logs and events
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Transactional data (e.g., purchases, subscriptions)
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
               Analytics and reporting data
            </Text>
        </View>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>Policy: </Text>
      <Text style={[styles.supplementText, {color: theme.color}]}><Text style={{fontFamily: 'Montserrat_700Bold'}}>1. Data Classification:</Text> All data will be classified based on its sensitivity, legal requirements, and business value:</Text>
      <View>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                <Text style={{fontFamily: 'Montserrat_700Bold'}}>Personal Data:</Text> Data that can be used to identify an individual (e.g., names, email addresses, phone numbers). Retention periods will be determined based on applicable privacy laws and user consent.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                <Text style={{fontFamily: 'Montserrat_700Bold'}}>Financial Data:</Text> Data related to financial transactions (e.g., purchases, subscriptions, invoices). Retention periods will be determined based on tax and accounting regulations.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                <Text style={{fontFamily: 'Montserrat_700Bold'}}>Legal and Regulatory Data:</Text> Data required for compliance with legal or regulatory obligations (e.g., audit logs, consent records). Retention periods will be determined based on specific legal requirements.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                <Text style={{fontFamily: 'Montserrat_700Bold'}}>Business Data:</Text> Data that is valuable for business operations but not subject to specific legal requirements (e.g., analytics data, marketing data). Retention periods will be determined based on business needs and storage costs.
            </Text>
        </View>
      <Text style={[styles.supplementText, {color: theme.color}]}><Text style={{fontFamily: 'Montserrat_700Bold'}}>2. Retention Periods:</Text> Specific retention periods will be assigned to each data category based on its classification and the factors mentioned above. Retention periods may vary depending on the type of data, the purpose for which it was collected, and any contractual obligations.</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}><Text style={{fontFamily: 'Montserrat_700Bold'}}>3. Data Disposal:</Text> At the end of the retention period, data will be securely disposed of in accordance with industry best practices and applicable regulations. Disposal methods may include:</Text>
      <View>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
            Permanent deletion of data from all storage locations.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                Anonymization of data to remove personally identifiable information.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                Aggregation of data to remove individual-level detail.
            </Text>
        </View>
      <Text style={[styles.supplementText, {color: theme.color}]}><Text style={{fontFamily: 'Montserrat_700Bold'}}>4. Exceptions:</Text> Certain data may be retained for longer periods than specified in this policy if required for legal or regulatory purposes, ongoing investigations, or to resolve disputes.</Text>
      <Text style={[styles.supplementText, {color: theme.color}]}><Text style={{fontFamily: 'Montserrat_700Bold'}}>5. Review and Updates:</Text> This policy will be reviewed and updated at least annually or whenever significant changes are made to the application, infrastructure, or regulatory environment.</Text>
      <Text style={[styles.secondaryHeader, {color: theme.color}]}>Additional Considerations: </Text>
      <View>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                <Text style={{fontFamily: 'Montserrat_700Bold'}}>User Consent:</Text> Users should be informed about the data retention policy and given the option to request deletion of their data before the end of the retention period.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                <Text style={{fontFamily: 'Montserrat_700Bold'}}>Data Minimization:</Text> Collect and retain only the data that is necessary for the intended purpose.
            </Text>
            <Text style={[styles.supplementText, {color: theme.color}]}>
                <Text style={{ marginRight: 10 }}>
                    <MaterialCommunityIcons name="circle-medium" size={16}/>
                </Text>
                <Text style={{fontFamily: 'Montserrat_700Bold'}}>Security Measures:</Text> Implement appropriate security measures to protect data from unauthorized access, disclosure, alteration, or destruction.
            </Text>
        </View>
      
      </ScrollView>
      </View>
    </View>
  )
}

export default DataRetentionPolicy

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