import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import ThemeHeader from '../Components/ThemeHeader'
import { Divider } from 'react-native-paper'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Montserrat_500Medium, useFonts} from '@expo-google-fonts/montserrat';
import useAuth from '../Hooks/useAuth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import themeContext from '../lib/themeContext';
const AccountInfoTemp = () => {
    const navigation = useNavigation();
    const {user} = useAuth();
    const theme = useContext(themeContext)
    const [username, setUsername] = useState('');
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium
  });
    useEffect(() => {
      const getData = async() => {
        const docSnap = await getDoc(doc(db, 'profiles', user.uid))
        setUsername(docSnap.data().userName)

      }
      getData()
    }, [])
  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <ThemeHeader text={"Account Information"} video={false} backButton={true}/>
      <Divider borderWidth={0.4} borderColor={theme.color}/>
      <View style={styles.optionContainer}>
      <Text style={[styles.optionText, {color: theme.color}]}>Email: <Text style={{fontSize: 15.36}}>{user.email}</Text></Text>
      </View>
      <Divider borderWidth={0.4} borderColor={theme.color}/>
      <View style={styles.optionContainer} >
      <Text style={[styles.optionText, {color: theme.color}]}>Username: <Text style={{fontSize: 15.36}}>{username}</Text></Text>
      </View>
      <Divider borderWidth={0.4} borderColor={theme.color}/>
      <TouchableOpacity style={styles.optionContainer} onPress={() => navigation.navigate('AccountInfo', {email: true, password: false})}>
        <Text style={[styles.optionText, {color: theme.color}]}>Change Email</Text>
        <MaterialCommunityIcons name='chevron-right' size={30} style={{alignSelf: 'center'}} color={theme.color}/>
      </TouchableOpacity>
      
    </View>
  )
}

export default AccountInfoTemp

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15
    },
    optionText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
    }
})