import { ImageBackground, StyleSheet, Text, View, Image, TouchableOpacity, Alert, Dimensions } from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import {MaterialCommunityIcons, Ionicons, Entypo, FontAwesome} from '@expo/vector-icons';
import ThemeMadeProgression from '../Components/ThemeMadeProgression';
import { getFirestore, onSnapshot, query, doc, addDoc, collection, serverTimestamp, arrayUnion, updateDoc } from 'firebase/firestore';
import PreviewFooter from '../Components/PreviewFooter';
import { useNavigation } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage'
import useAuth from '../Hooks/useAuth';
import {BACKEND_URL} from "@env"
import FastImage from 'react-native-fast-image';
import { useFonts, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import BuyThemeIcon from '../Components/BuyThemeIcon';
import GetThemeIcon from '../Components/GetThemeIcon';
import themeContext from '../lib/themeContext';
import { db } from '../firebase'
const HomeScreenPreview = ({route}) => {
    const {name, source, productId, applying, metadata, themeName, themeDescription, themePrice, stripeId, bought, themeFree} = route.params;
    //console.log(previewImage)
    //console.log(source)
    //console.log(themeName)
    //console.log(metadata)
    const theme = useContext(themeContext)
    const [pfp, setPfp] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [wantChecked, setWantChecked] = useState(false);
    const [notWantChecked, setNotWantChecked] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const storage = getStorage();
    const {user} = useAuth();
    const [personal, setPersonal] = useState();
    const [free, setFree] = useState();
    const [sale, setSale] = useState();
    useEffect(() => {
        let unsub;
        const fetchProfileDetails = () => {
            unsub = onSnapshot(query(doc(db, 'profiles', name)), (snapshot) => {
                setPfp(snapshot.data().pfp)
                setLastName(snapshot.data().lastName)
                setFirstName(snapshot.data().firstName)
                setUsername(snapshot.data().userName)
            })
        }
        fetchProfileDetails()
        setTimeout(() => {
            setLoading(false);
        }, 1000);
        return unsub;
    }, [name])
  //onsole.log(pfp)
    const handlePersonalCallback = (dataToSend) => {
      setPersonal(dataToSend)
    }
    const handleFreeCallback = (dataToSend) => {
      setFree(dataToSend)
    }
    const handleSaleCallback = (dataToSend) => {
      setSale(dataToSend)
    }
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <>
    <View style={{flex: 1, backgroundColor: theme.backgroundColor}}>
        <View style={{marginTop: '2.5%'}}>
        {bought ?  <ThemeMadeProgression text={"Posts Theme Preview"} noAdditional={true}/> : 
        <ThemeMadeProgression text={"Posts Theme Preview"} personal={handlePersonalCallback} free={handleFreeCallback} sale={handleSaleCallback} 
        personalStyle={personal ? {backgroundColor: "#005278"} : {backgroundColor: theme.backgroundColor}} freeStyle={free ? {backgroundColor: "#005278"} : {backgroundColor: theme.backgroundColor}}
        saleStyle={sale ? {backgroundColor: "#005278"} : {backgroundColor: theme.backgroundColor}}/>}
        </View>
        
    <View style={[styles.ultimateContainer, {backgroundColor: theme.backgroundColor}]} >
    <FastImage source={{uri: source}} style={styles.postingContainer}>
      <View style={[styles.posting, {backgroundColor: theme.backgroundColor}]}>
        <View style={{flexDirection: 'row', margin: '2.5%'}}>
            {pfp ? <FastImage source={{uri: pfp, priority: 'normal'}} style={{height: 44, width: 44, borderRadius: 8}}/> : 
          <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 44, width: 44, borderRadius: 8}}/>
          }
            <View style={[{marginLeft: '2.5%'}, styles.titleHeader]}>
              <Text style={[styles.addText, {color: theme.color}]}>@{username}</Text>
            </View>
            
          </View>
          <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
          <MaterialCommunityIcons name='post-outline' style={{alignSelf: 'center'}} size={Dimensions.get('screen').height / 2.8} color={theme.color}/>  
          </View>
            
            </View>
           <View style={[styles.postFooter, {marginTop: '5%', backgroundColor: theme.backgroundColor}]}>
                  <View style={{flexDirection: 'row', width: '90%', marginLeft: '5%', marginRight: '5%', alignItems: 'center'}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View>
             <MaterialCommunityIcons name='cards-heart' size={27.5} style={{alignSelf: 'center'}} color="red"/>
          </View>
          <View >
            <Text style={[styles.postFooterText, {color: theme.color}]}>100</Text>
          </View>
          </View>
          <View style={{flexDirection: 'row', marginLeft: '2.5%',}}>
          <View>
            <MaterialCommunityIcons name='message-outline' size={26} color={theme.color} style={{alignSelf: 'center'}}/>
          </View>
          <Text style={[styles.postFooterText, {color: theme.color}]}>20</Text>
          </View>
          <View >
            <Ionicons name='arrow-redo-outline' color={theme.color} size={28} style={{alignSelf: 'center', marginLeft: '2.5%',}}/>
          </View>
          <View>
            <MaterialCommunityIcons name='bookmark' color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}  size={30} style={{alignSelf: 'center'}}/>
          </View>
          <View style={styles.menuContainer}>
          <Entypo name='dots-three-vertical' size={25} color={theme.color}/>
            </View>
          </View>
            <View style={[styles.captionContainer, {backgroundColor: theme.backgroundColor}]}>
              <Text style={[styles.firstName, {color: theme.color}]}>{`${username}- Example Caption`}</Text>
              <Text style={[styles.postText, {color: theme.color}]}>Today</Text>
          </View>
        </View>
        <View style={[styles.rightArrow, {borderLeftColor: theme.backgroundColor}]} />
              <View style={[styles.buyThemeContainer, {backgroundColor: theme.color}]}>
                <FontAwesome name='photo' size={22.5} style={{alignSelf: 'center'}}/>
              </View>
        </FastImage>
        
        
        </View>
    </View>
    </>
  )
}

export default HomeScreenPreview

const styles = StyleSheet.create({
   previewThemeContainer: {
    margin: '5%',
    marginTop: '6%',
    marginBottom: "2.5%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  barColor: {
        borderColor: '#3286ac'
    },
  previewContainer: {
    //backgroundColor: "#f2f2f2",
    //borderWidth: 1,
    borderColor: "#979797",
    //margin: '5%',
    marginTop: '10%',
    marginBottom: '2.5%',
    borderBottomWidth: 1,
  },
  postingContainer: {
    width: '100%',
    //aspectRatio: 4 / 3,
    //resizeMode: 'contain',
      //arginTop: '5%',
      //aspectRatio: 1 / 1.01625,
      height: '96%',
      //marginLeft: '-5%',
      //height:'100%',
      justifyContent: 'center',
      //flex: 1,
      //justifyContent: 'center',
      flexDirection: 'column',
      //alignItems: 'center',
      backgroundColor: "#005278",
  },
  posting: {
      width: '90%',
      shadowColor: '#171717',
      //shadowOffset: {width: -3, height: 3},
      shadowOpacity: 0.25,
      shadowRadius: 0.5,
      height: Dimensions.get('screen').height / 2.11,
      borderRadius: 8,
      marginLeft: '5%',
      paddingBottom: 25,
      marginTop: '5%',
      elevation: 20,
  },
  addText: {
      fontSize: Dimensions.get('screen').height / 54.9,
      fontFamily: 'Montserrat_500Medium',
      color: "#090909",
      padding: 7.5,
      paddingLeft: 15,
      alignSelf: 'center'
      //paddingTop: 0
    },
    titleHeader: {
    alignItems: 'center',
    justifyContent: 'center'
  },
    ultimateContainer: {
      marginBottom: '7.5%',
      //marginTop: '7.5%',
      height: '90%',
      width: '100%',
      shadowColor: "#000000",
      elevation: 20,
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.5,
      shadowRadius: 1,
      borderTopWidth: 0.25,
    },
    postFooter: {
    borderRadius: 10,
    padding: 10,
    width: '90%',
    elevation: 20,
    shadowColor: '#171717',
      shadowOffset: {width: -1, height: 3},
      shadowOpacity: 0.25,
      shadowRadius: 0.5,
      marginLeft: '5%',
      paddingLeft: 0
      //marginTop: '5%'
    //borderWidth: 1
    },
    postFooterText: {
      fontSize: Dimensions.get('screen').height / 68.7,
      fontFamily: 'Montserrat_500Medium',
      color: "#090909",
      padding: 5,
      alignSelf: 'center'
    },
    multiSlideDot: {
      width: 6,
      height: 7,
      backgroundColor: "#000",
      margin: '2%'
    },
    captionContainer: {
      width: '90%',
      marginLeft: '5%',
      marginTop: '2.5%',
      marginBottom: '1.5%'
    },
  buyThemeText: {
    fontSize: Dimensions.get('screen').height / 68.7,
    alignSelf: 'center',
    fontFamily: 'Montserrat_700Bold',
    color: "#005278",
    padding: 5
    //padding: 10
  },
  buyThemeContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    padding: 2.5,
    borderRadius: 2.5
    //marginTop: '2.5%'
  },
  menuContainer: {
    //alignSelf: 'center',
    marginLeft: 'auto',
    borderRadius: 8,
    marginRight: '-5%',
    //marginRight: '2%',
    alignSelf: 'center'
  },
  rightArrow: {
    left: 50,
    bottom: 0.1,
  width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRadius: 1,
    //borderTopWidth: 50,  // Adjust the width of the triangle
    borderRightWidth: 0,
    borderBottomWidth: 20,  // Adjust the height of the triangle
    borderLeftWidth: 20,  // Adjust the width of the triangle
    //borderTopColor: 'transparent',
    borderLeftColor: "#fafafa",
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '90deg' }],
    shadowColor: "#171717",
      elevation: 20,
      shadowOffset: {width: 2, height: 4},
      shadowOpacity: 0.5,
      shadowRadius: 1,
},
postText: {
    fontSize: Dimensions.get('screen').height / 68.7,
    fontFamily: 'Montserrat_500Medium',
    padding: 5, 
    paddingLeft: 0
   // marginLeft: '3.5%'
  },
  firstName: {
      fontSize: Dimensions.get('screen').height / 54.9,
      fontFamily: 'Montserrat_700Bold',
      color: "#090909",
      //width: '90%',
      padding: 7.5,
      paddingLeft: 2.5,
      paddingVertical: 0
      //paddingBottom: 7.5,
      //paddingTop: 0,
      //paddingLeft: 0
    },
})