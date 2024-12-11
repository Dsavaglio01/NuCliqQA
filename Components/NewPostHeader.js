import { StyleSheet, Text, View, Image, Dimensions } from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons'
import DropDownPicker from 'react-native-dropdown-picker'
import useAuth from '../Hooks/useAuth'
import {getDoc, doc, getFirestore} from 'firebase/firestore';
import { Divider } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import FastImage from 'react-native-fast-image'
import NextButton from './NextButton'
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
import { db } from '../firebase'
const NewPostHeader = ({group, chooseValueFunction, button, data, groupName, groupPfp, groupId, username, admin, actualGroup}) => {
const navigation = useNavigation();
const theme = useContext(themeContext)
    useEffect(() => {
        async function fetchData() {
            setPfp((await getDoc(doc(db, 'profiles', user.uid))).data().pfp)
            setBlockedUsers((await getDoc(doc(db, 'profiles', user.uid))).data().blockedUsers)
        }
        fetchData()
  }, [])
  const {user} = useAuth()
  const [pfp, setPfp] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('public');
    const [items, setItems] = useState([
    {label: 'Public', value: 'public'},
    {label: 'Followers Only', value: 'followers'}
  ]);
  //console.log(items)
  //console.log(value)
  const valueFunction = () => {
    chooseValueFunction(value)
  }
  const goToCaption= () => {
    const updatedData = data.map((item, index) => {
      return { ...item, id: `${index + 1}` }; // Assign new IDs based on index
    });
    navigation.navigate('Caption', {groupName: groupName, groupPfp: groupPfp, userName: username, actualGroup: actualGroup, blockedUsers: blockedUsers, admin: admin, postArray: updatedData, group: group, groupId: groupId, value: value, edit: false})
  }
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <>
            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: '2.5%', marginHorizontal: '5%'}}>
                <FastImage source={pfp ? {uri: pfp} : require('../assets/defaultpfp.jpg')} style={styles.pfp}/>
                    <Text style={[styles.newPostText, {color: theme.color}]}>You can post up to 5 images or a single video or a single text post</Text>
                {button ?  <View style={
                 { zIndex: 3, backgroundColor: theme.backgroundColor, height: 70, alignSelf: 'center', alignItems: 'center'}}>
                  <View style={{alignSelf: 'center', alignItems: 'center', marginTop: '20%'}}>

                    <NextButton text={"DONE"} textStyle={{fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}}
                    onPress={goToCaption}/>
                    </View>
                </View> : group ? null :
                null
                }
            </View>
        {open ? <Divider style={{borderWidth: 0.5, width: '95%', marginLeft: '2.5%', marginTop: '10%', borderColor: theme.color}}/> 
        : <Divider style={{borderWidth: 0.5, width: '95%', marginLeft: '2.5%', borderColor: theme.color}}/>}
    </>
  )
}

export default NewPostHeader

const styles = StyleSheet.create({
    pfp: {
    height: Dimensions.get('screen').height / 18.7,
    width: (Dimensions.get('screen').height / 18.7) * 1.01625,
    borderRadius: 8
  },
  newPostText: {
    fontSize: Dimensions.get('screen').height / 68.7,
    fontFamily: 'Montserrat_600SemiBold',
    width: '90%',
    padding: 10
  },
})