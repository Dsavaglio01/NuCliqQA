import React, {useState, useEffect, useContext} from "react";
import { View, Image,StyleSheet, Text, TouchableOpacity, Button, Touchable, Dimensions } from "react-native";
import NextButton from "../Components/NextButton";
import {Feather, MaterialCommunityIcons} from '@expo/vector-icons';
import { ImageEditor } from "expo-image-crop-editor";
//import ImageFilters from 'react-native-gl-image-filters';
import Filter from "./Filter";
import MainButton from '../Components/MainButton';
import { useNavigation } from "@react-navigation/native";
import useAuth from "../Hooks/useAuth";
import ThemeHeader from "../Components/ThemeHeader";
import { Divider } from "react-native-paper";
import { arrayRemove, doc, serverTimestamp, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { ref, uploadBytes, getDownloadURL, getStorage, deleteObject } from 'firebase/storage'
import PreviewFooter from "../Components/PreviewFooter";
import FastImage from "react-native-fast-image";
import themeContext from "../lib/themeContext";

const settings = [
  {
    name: 'hue',
    minValue: 0,
    maxValue: 6.3,
  },
  {
    name: 'blur',
    minValue: 0,
    maxValue: 30,
  },
  {
    name: 'sepia',
    minValue: -5,
    maxValue: 5,
  },
  {
    name: 'sharpen',
    minValue: 0,
    maxValue: 15,
  },
  {
    name: 'negative',
    minValue: -2.0,
    maxValue: 2.0,
  },
  {
    name: 'contrast',
    minValue: -10.0,
    maxValue: 10.0,
  },
  {
    name: 'saturation',
    minValue: 0.0,
    maxValue: 2,
  },
  {
    name: 'brightness',
    minValue: 0,
    maxValue: 5,
  },
  {
    name: 'temperature',
    minValue: 0.0,
    maxValue: 40000.0,
  },
  {
    name: 'exposure',
    step: 0.05,
    minValue: -1.0,
    maxValue: 1.0,
  },
];
const DesignTheme = ({route}) => {
  const theme = useContext(themeContext)
    const {source, edit, themeId, selling, themeName, keywords, searchKeywords, price, groupId} = route.params;
    const [editorVisible, setEditorVisible] = useState(false);
    const [imageData, setImageData] = useState(null)
    const [filters, setFilters] = useState(false);
    const {user} = useAuth()
    const storage = getStorage();
    const [imageFilter, setImageFilter] = useState({...settings,
    hue: 0,
    blur: 0,
    sepia: 0,
    sharpen: 0,
    negative: 0,
    contrast: 1,
    saturation: 1,
    brightness: 1,
    temperature: 6500,
    exposure: 0})
    const [filter, setFilter] = useState();
    const navigation = useNavigation();
    //console.log(imageData)
    /* useEffect(() => {
      if (imageData != null) {
        const deletePreviousItem = async() => {
          await updateDoc(doc(db, 'profiles', user.uid, 'myThemes', themeId), {
            images: arrayRemove(source)
          })
        }
        deletePreviousItem()
      }
    }, [imageData]) */
    const getLink = (pfp) => {
        const starsRef = ref(storage, pfp);
        getDownloadURL(starsRef).then(async(url) => await updateDoc(doc(db, 'profiles', user.uid, 'myThemes', themeId), {
            images: arrayUnion(url),
            timestamp: serverTimestamp()
          })).then(async() => await updateDoc(doc(db, 'profiles', user.uid, 'myThemes', themeId), {
            images: arrayRemove(source),
            timestamp: serverTimestamp()
          })).finally(() => navigation.navigate('All', {goToMy: true, name: null, groupId: null}))
    }
    async function finishEditing() {
      navigation.navigate('SuccessTheme', {edit: true, groupId: groupId, themeId: themeId, actualPrice: price, selling: selling, name: user.uid, post: imageData != null ? imageData.uri : source, actualThemeName: themeName, actualKeywords: keywords, searchKeywords: searchKeywords})
     /*  if (imageData != null) {
        const response = await fetch(imageData.uri)
      const blob = await response.blob();
      const filename = `${user.uid}${themeId}theme.jpg`
      //setPfp(filename)
      var storageRef = ref(storage, filename)
      try {
          await storageRef;
      } catch (error) {
          console.log(error)
      }
      await uploadBytes(storageRef, blob).then(() => getLink(filename))
    }
    else {
      navigation.navigate('All', {goToMy: true, name: null, groupId: null})
    } */
    

      }
      
    /* const resetImage = () => {
        this.setState({
        ...Constants.DefaultValues,
        });
    } */
    /* async function finishEditing() {
      await updateDoc(doc(db, 'profiles', user.uid, 'myThemes', themeId), {
        images: 
      })
    } */
    
    

    return (
      <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <ThemeHeader text={edit ? "Edit Theme" : "Create Theme"} video={false} backButton={true}/>
        <Divider borderWidth={0.4} style={{borderColor: theme.color}}/>
        <View style={{marginTop: '5%', marginLeft: '5%', marginRight: '5%'}}>
        {/* <Text style={styles.headerText}>Edit the Image by Making it Your Own!</Text> */}
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
        <View style={{borderWidth: 1, padding: 5, borderColor: theme.color}}>
          <FastImage source={{uri: imageData != null ? imageData.uri : source}} style={{width: 320, height: Dimensions.get('screen').height / 1.68}}/>
        </View>
        <View style={styles.overlay}>
          <TouchableOpacity style={[styles.previewButton, {backgroundColor: theme.backgroundColor}]} onPress={() => navigation.navigate('ViewingProfile', {previewImage: imageData != null ? imageData.uri : source, preview: true, name: user.uid, viewing: true})}>
            <Text style={[styles.previewText, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Preview w/ Profile Page</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.previewButton, {backgroundColor: theme.backgroundColor}]} onPress={() => navigation.navigate('HomeScreenPreview', {source: imageData != null ? imageData.uri : source, name: user.uid})}>
            <Text style={[styles.previewText, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Preview w/ Posts</Text>
          </TouchableOpacity>
        </View>
        
        <ImageEditor
            visible={editorVisible}
            onCloseEditor={() => setEditorVisible(false)}
            imageUri={imageData != null ? imageData.uri : source}
            fixedCropAspectRatio={16 / 9}
            //lockAspectRatio={aspectLock}
            minimumCropDimensions={{
            width: 100,
            height: 100,
            }}
            onEditingComplete={(result) => {
            setImageData(result);
            }}
            mode="full"
      />
       {/*  <View style={{width: '75%', marginTop: '2.5%'}}>
            <NextButton text={'Add Stickers'} textStyle={{fontSize: 15.36}} onPress={() => navigation.navigate('StickerGuidelines', {source: source.uri})}/>
        </View> */}
        </View>
        <PreviewFooter containerStyle={{backgroundColor: theme.backgroundColor, marginTop: '15%'}} text={"CONTINUE"} onPressCancel={() => navigation.navigate('All', {name: null})} 
        onPress={!edit ? () => navigation.navigate('SuccessTheme', {name: user.uid, post: imageData != null ? imageData.uri : source}) : () => finishEditing()}/>
        </View>
      </View>
    );
  
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    headerText: {
        padding: 10,
        fontSize: 19.20,
        fontWeight: '700',
        paddingBottom: 20,
        marginTop: '7.5%',
        
    },
    icon: {
        alignSelf: 'center',
        paddingLeft: 25,
        paddingRight: 10
    },
    columns: {
        flexDirection: 'row',
        marginTop: '2.5%'
    },
    overlay: {
      position: 'absolute',
      //backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the background color and opacity of the overlay
      width: '80%', // Adjust the overlay width as needed
      height: '50%', // Adjust the overlay height as needed
      borderRadius: 10, // Optional: Add border radius to the overlay
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewButton: {
      marginBottom: 10,
      borderRadius: 8,
      width: '90%',
      alignItems: 'center'
    },
    previewText: {
      fontSize: 15.36,
      fontWeight: '700',
      padding: 15,
    }
})
export default DesignTheme;