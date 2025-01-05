import { StyleSheet, Text, View, ImageBackground} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import useAuth from '../Hooks/useAuth'
import * as Crypto from 'expo-crypto';
import PfpImage from '../Components/PfpImage'
import themeContext from '../lib/themeContext'
const GroupPfp = ({route}) => {
    const {name, groupSecurity, category, description} = route.params
    const navigation = useNavigation();
    const [id, setId] = useState();
    const theme = useContext(themeContext)
    const {user} = useAuth()
    useEffect(() => {
    (async () => {
      const initialDigest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.MD5,
        `${name}`
      );
      setId(initialDigest)
      /* Some crypto operation... */
    })();
  }, []);
    
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover">
       
        <View style={[styles.main, {backgroundColor: theme.backgroundColor}]}>
             <RegisterHeader onPress={() => navigation.goBack()} colorOne={{borderColor: '#3286ac'}} colorTwo={{borderColor: '#3286ac'}} colorThree={{borderColor: '#3286ac'}} colorFour={{borderColor: '#3286ac'}} colorFive={{borderColor: '#3286ac'}} group={true}/>
            <Text style={styles.addText}>Add a Profile Picture for the Clique!</Text>
            <PfpImage name={`${user.uid}${name}GroupPfp.jpg`} skipOnPress={() => navigation.navigate('GroupPic', {name: name, groupSecurity: groupSecurity, description: description, 
            category: category, grouppfp: null})} groupName={name} id={id} category={category} 
            description={description} groupPfp={true} groupSecurity={groupSecurity}/>
            
        </View>
    </ImageBackground> 
  )
}

export default GroupPfp

const styles = StyleSheet.create({
    container: {
        flex: 1,
       alignItems: 'center',
        justifyContent: 'center'
    },
    addText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        padding: 25,
        paddingBottom: 10
    },
    addContainer: {
        backgroundColor: "#000",
        height: 151,
        width: 151,
        //borderRadius: 90,
        justifyContent:'center'
    },
    main: {
      borderRadius: 35,
      width: '90%',
      height: '90%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    barColor: {
    borderColor: '#3286ac'
  }
})