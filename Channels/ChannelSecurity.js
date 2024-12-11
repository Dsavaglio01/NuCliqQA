import { StyleSheet, Text, View, ImageBackground, TouchableOpacity} from 'react-native'
import React, {useState, useEffect} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
import Checkbox from 'expo-checkbox'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useFonts, Montserrat_400Regular, Montserrat_500Medium } from '@expo-google-fonts/montserrat'
const ChannelSecurity = ({route}) => {
    const {id, name, group, edit, security} = route.params
    const navigation = useNavigation();
    const [privateChecked, setPrivateChecked] = useState(false);
    const [publicChecked, setPublicChecked] = useState(false);
    useEffect(() => {
        if (security) {
            if (security == 'private') {
            setPrivateChecked(true)
            setPublicChecked(false)
        }
        else {
            setPrivateChecked(false)
            setPublicChecked(true)
        }
        }
        
    }, [route.params?.edit])
    const updateCurrentChannel = async() => {
        if (privateChecked == false && publicChecked == false) {
            
        }
        else {
            if (edit) {
                    await updateDoc(doc(db, 'groups', group, 'channels', id), {
                      security: privateChecked ? 'private' : 'public'
                    }).then(() => navigation.goBack())
                  }
            else {
                navigation.navigate('ChannelPfp', {name: name, security: privateChecked ? 'private' : 'public', group: group, id: id})
            }
            
        }
        
    }
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_400Regular
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <ImageBackground style={styles.container} source={require('../assets/loginBackground.png')} resizeMode="cover">
        
        <View style={styles.main}>
            <RegisterHeader onPress={() => navigation.goBack()} colorOne={{borderColor: '#3286ac'}} colorTwo={styles.barColor} channel={true}/>
            <Text style={styles.headerText}>Will the Cliq Chat be Private or Public?</Text>
            <View style={{marginTop: '5%', marginLeft: '10%'}}>
                <TouchableOpacity activeOpacity={1} onPress={() => {setPrivateChecked(true); setPublicChecked(false)}}  style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Checkbox value={privateChecked} onValueChange={() => {setPrivateChecked(true); setPublicChecked(false)}} color={privateChecked ? '#9edaff' : "#fafafa"} />
                    <Text style={styles.paragraph}>Private</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1} onPress={() => {setPublicChecked(true); setPrivateChecked(false)}} style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Checkbox value={publicChecked} onValueChange={() => {setPrivateChecked(false); setPublicChecked(true)}} color={publicChecked ? '#9edaff' : '#fafafa'}  />
                    <Text style={styles.paragraph}>Public</Text>
                </TouchableOpacity>
            </View>
            <View style={{marginTop: '10%', marginLeft: '5%', marginRight: '5%'}}>
                <NextButton text={'Next'} onPress={updateCurrentChannel}/>
            </View>
        </View>
   </ImageBackground>
  )
}

export default ChannelSecurity

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        padding: 25,
        paddingBottom: 0,
        color: "#fafafa"
    },
    input: {
        marginTop: '25%',
        borderWidth: 1,
        padding: 10,
        borderColor: "#cdcdcd",
        borderRadius: 30,
    },
    paragraph:{
        fontSize: 15.36,
        fontFamily: 'Montserrat_400Regular',
        padding: 12,
        alignSelf: 'center',
        color: "#fafafa",
    },
    main: {
          backgroundColor: '#121212',
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