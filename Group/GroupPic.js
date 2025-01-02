import { StyleSheet, Text,  View, ImageBackground} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import useAuth from '../Hooks/useAuth'
import * as Crypto from 'expo-crypto';
import PfpImage from '../Components/PfpImage'
import {BACKEND_URL} from '@env';
import ProfileContext from '../lib/profileContext'
const GroupPic = ({route}) => {
    const {name, groupSecurity, category, description} = route.params
    const navigation = useNavigation();
    const [id, setId] = useState();
    const {user} = useAuth()
    const profile = useContext(ProfileContext);
    useEffect(() => {
    (async () => {
      const initialDigest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.MD5,
        `${name}`
      );
      setId(initialDigest)
    })();
  }, []);
    function createSearchKeywords(str, maxLen, n, limit) {
      const result = new Set();
      let count = 0;

      // Prefixes and Suffixes
      for (let i = 1; i <= maxLen; i++) {
        if (count >= limit) break;
        result.add(str.substring(0, i)); // Prefix
        count++;
      }

      for (let i = 1; i <= maxLen; i++) {
        if (count >= limit) break;
        result.add(str.substring(str.length - i)); // Suffix
        count++;
      }

      // N-grams
      for (let i = 0; i <= str.length - n && count < limit; i++) {
        result.add(str.substring(i, i + n));
        count++;
      }

      return Array.from(result).slice(0, limit);
}
 async function uploadClique() {
     const searchKeywords = createSearchKeywords(name.toLowerCase().trim(), 5, 3, 30);
    try {
    const response = await fetch(`http://10.0.0.225:4000/api/uploadCliq`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {name: name, banner: null, groupSecurity: groupSecurity, category: category, description: description,
      searchKeywords: searchKeywords, user: user.uid, groupId: id}}), // Send data as needed
    })
    const data = await response.json();
      if (data.done) {
        navigation.navigate('MyGroups')
      }
  } catch (error) {
    console.error('Error:', error);
  }
  }
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover">
        <View style={styles.main}>
          <RegisterHeader onPress={() => navigation.goBack()} colorOne={{borderColor: '#3286ac'}} colorTwo={{borderColor: '#3286ac'}} colorThree={{borderColor: '#3286ac'}} colorFour={{borderColor: '#3286ac'}} colorFive={{borderColor: '#3286ac'}} colorSix={{borderColor: "#3286ac"}} group={true}/>
            <Text style={styles.addText}>Add a Cliq Photo Banner</Text>
            <PfpImage groupBanner={true} name={`${user.uid}${name}groupPic.jpg`} userName={profile.username} searchKeywords={profile.searchKeywords} groupName={name} id={id} category={category} 
            description={description} groupSecurity={groupSecurity} skipOnPress={() => uploadClique()} />
        </View>
    </ImageBackground> 
  )
}

export default GroupPic

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
      paddingBottom: 10,
      color: "#fafafa"
    },
    main: {
      borderRadius: 35,
      backgroundColor: "#121212",
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
    }
})