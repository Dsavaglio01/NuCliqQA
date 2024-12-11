import { StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import ThemeHeader from '../Components/ThemeHeader'
import { useFonts, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
const Licensing = () => {
    const theme = useContext(themeContext)
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_700Bold
  });
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <ThemeHeader text={"Licenses"} backButton={true} video={false}/>
        <View style={styles.licenseContainer}>
            <Text style={styles.headerText}>Firebase</Text>
            <Text style={styles.text}> - This app uses Firebase for authentication, database, storage, and analytics services for a multitude of utilization within NuCliq form (but not limited to) storing posts in Firebase Cloud Firestore to storing images in Firebase storage.</Text>
        </View>
        <View style={styles.licenseContainer}>
            <Text style={styles.headerText}>Google Cloud</Text>
            <Text style={styles.text}> - This app uses the Google Cloud Platform for any and all back-end services including (but not limited to) sending notifications from the back-end server to users and processing payments through Stripe on the server.</Text>
        </View>
        <View style={styles.licenseContainer}>
            <Text style={styles.headerText}>Recombee</Text>
            <Text style={styles.text}> - This app uses Recombee for the processing of data to better recommend posts, cliqs, and themes to end users on NuCliq with Recombee's algorithmic methods.</Text>
        </View>
        <View style={styles.licenseContainer}>
            <Text style={styles.headerText}>Sightengine</Text>
            <Text style={styles.text}> - This app uses Sightengine for the moderation of multimedia such as images, text, and video.</Text>
        </View>
        <View style={styles.licenseContainer}>
            <Text style={styles.headerText}>Stripe</Text>
            <Text style={styles.text}> - This app uses Stripe for secure payment processing between NuCliq and a user and between multiple users.</Text>
        </View>
      
    </View>
  )
}

export default Licensing

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    licenseContainer: {
        flexDirection: 'column',
        width: '90%',
        marginLeft: '5%'
    },
    headerText: {
        fontSize: 24,
        fontFamily: 'Montserrat_700Bold'
    },
    text: {
        fontFamily: 'Montserrat_500Medium',
        fontSize: 15.36
    }
})