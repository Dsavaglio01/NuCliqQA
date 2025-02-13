import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert} from 'react-native'
import React, {useContext, useState} from 'react'
import { useNavigation } from '@react-navigation/native'
import {Entypo, MaterialCommunityIcons} from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';
import ProfileContext from '../../lib/profileContext';
const ThemeComponent = ({get, specific, free, my, purchased, myThemes, updateMyThemes, user, item, groupId, name, freeTempPosts, updateFreeTempPosts}) => {
    const [chosenTheme, setChosenTheme] = useState(null);
    const [useThemeModal, setUseThemeModal] = useState(false);
    const profile = useContext(ProfileContext);
    const navigation = useNavigation();
    function itemFreeToTransparent(item) {
    const updatedThemes = [...freeTempPosts];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.id)
    updatedThemes[objectIndex].transparent = true
    updateFreeTempPosts(updatedThemes)
  }
  function itemFreeNotToTransparent(item) {
    const updatedThemes = [...freeTempPosts];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.id)
    updatedThemes[objectIndex].transparent = false
    updateFreeTempPosts(updatedThemes)
  }
  function itemAllToTransparent(item) {
    const updatedThemes = [...tempPosts];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.id)
    
    updatedThemes[objectIndex].transparent = true
    setTempPosts(updatedThemes)
  }
  function itemAllNotToTransparent(item) {
    const updatedThemes = [...tempPosts];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.id)
    updatedThemes[objectIndex].transparent = false
    setTempPosts(updatedThemes)
  }
  function itemToTransparent(item) {
    const updatedMyThemes = [...myThemes];
    const objectIndex = updatedMyThemes.findIndex(obj => obj.id === item.id)
    updatedMyThemes[objectIndex].transparent = true
    updateMyThemes(updatedMyThemes)
  }
  function itemNotToTransparent(item) {
    const updatedMyThemes = [...myThemes];
    const objectIndex = updatedMyThemes.findIndex(obj => obj.id === item.id)
    updatedMyThemes[objectIndex].transparent = false
    updateMyThemes(updatedMyThemes)
  }
  function itemPurchaseToTransparent(item) {
    const updatedMyThemes = [...purchasedThemes];
    const objectIndex = updatedMyThemes.findIndex(obj => obj.id === item.id)
    updatedMyThemes[objectIndex].transparent = true
    setPurchasedThemes(updatedMyThemes)
  }
  function itemPurchaseNotToTransparent(item) {
    const updatedMyThemes = [...purchasedThemes];
    const objectIndex = updatedMyThemes.findIndex(obj => obj.id === item.id)
    updatedMyThemes[objectIndex].transparent = false
    setPurchasedThemes(updatedMyThemes)
  }
  async function deleteTheme(item) {
      Alert.alert('Delete Theme?', 'If applied to your profile page or posts, it will be removed from there as well', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: async() => {
      try {
    const response = await fetch(`${BACKEND_URL}/api/deleteTheme`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: { background: background, theme: item.images[0], postBackground: postBackground, item: item, user: user.uid}}), // Send data as needed
    })
    const data = await response.json();
    if (data.done) {
      //navigation.goBack()
    }
  } catch (error) {
    console.error('Error:', error);
  }
      }},
    ]);
  }
  return (
    <View style={specific ? [styles.themeContainer, {height: '45%'}] : styles.themeContainer}>
      <TouchableOpacity onPress={my ? () => navigation.navigate('SpecificTheme', {myId: item.id, my: true}) : purchased ? item.price > 0 ? () => navigation.navigate('SpecificTheme', {chargeId: item.chargeId, bought: item.bought, 
      id: item.productId, metadata: item.metadata, theme: item.images[0], name: item.name, description: item.description, free: false, purchased: true}) 
      : () => navigation.navigate('SpecificTheme', {id: item.productId, productId: item.productId, metadata: {userId: user.uid}, theme: item.images[0], name: item.name, description: item.description, free: true, purchased: false}) : 
        item.metadata != undefined || item.bought != undefined && !groupId && !free ? () => navigation.navigate('SpecificTheme', {id: item.id, groupTheme: null, free: false, username: item.username}) 
      : groupId && !free ? ()  => navigation.navigate('SpecificTheme', {id: item.id, groupId: groupId, groupTheme: item.images[0], groupName: name,
        free: false, username: item.username}) : free && !groupId ? () => navigation.navigate('SpecificTheme', {productId: item.id, groupTheme: null, free: true, username: item.username}) :
      free && groupId ? () => navigation.navigate('SpecificTheme', {productId: item.id, groupName: name, username: item.username, groupTheme: item.images[0], free: true, groupId: groupId}) : null}>
        <FastImage source={{uri: item.images[0]}} style={styles.theme}/>
      </TouchableOpacity>
      <View style={styles.dotContainer}>
        <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
        <TouchableOpacity onPress={purchased ? itemPurchaseToTransparent : free ? () => itemFreeToTransparent(item) : my ? () => itemToTransparent(item) : () => itemAllToTransparent(item)}>
        <Entypo name="dots-three-vertical" style={{alignSelf: 'center'}} size={17.5} color={"#fafafa"}/>
        </TouchableOpacity>
      </View>
      {item.transparent ? 
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeContainer} onPress={purchased ? () => {itemPurchaseNotToTransparent(item); setChosenTheme(null)} :
            free ? () => {itemFreeNotToTransparent(item); setChosenTheme(null)} :
            my ? () => {itemNotToTransparent(item); setChosenTheme(null)} : () => {itemAllNotToTransparent(item); setChosenTheme(null)}}>
            <Text style={styles.closeText}>Close</Text>
            <MaterialCommunityIcons name='close' size={30} color={"#fff"}/>
          </TouchableOpacity>
          <View style={{alignItems: 'center'}}>
            {my || purchased ? <View style={{alignItems: 'center', marginTop: '-5%'}}>
              <TouchableOpacity style={styles.applyContainer} onPress={() => {setChosenTheme(item); setUseThemeModal(true)}}>
                <Text style={styles.applyText}>Use Theme</Text>
              </TouchableOpacity>
              {!purchased ? 
              <>
                <TouchableOpacity style={styles.applyContainer} onPress={() => navigation.navigate('DesignTheme', {groupId: groupId, themeName: item.name, keywords: item.keywords, searchKeywords: item.searchKeywords, edit: true, source: item.images[0], themeId: item.id, selling: item.forSale, price: item.price})}>
                    <Text style={styles.applyText}>Edit Theme</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyContainer} onPress={() => deleteTheme(item)}>
                    <Text style={styles.applyText}>Delete Theme</Text>
                </TouchableOpacity> 
              </>
              : null}
            </View> : 
            free ? <TouchableOpacity style={styles.applyContainer} onPress={!groupId ? () => navigation.navigate('SpecificTheme', {productId: item.id, groupTheme: null, free: true, username: item.username}) : groupId ? 
            () => navigation.navigate('SpecificTheme', {productId: item.id, groupName: name, groupTheme: item.images[0], free: true, groupId: groupId, username: item.username}) : null}>
                <Text style={styles.applyText}>Get Theme</Text>
              </TouchableOpacity>  :<TouchableOpacity style={styles.applyContainer} onPress={item.metadata != undefined || item.bought != undefined && !groupId ? () => navigation.navigate('SpecificTheme', {id: item.id, groupTheme: null, free: false, username: item.username}) : item.metadata != undefined || item.bought != undefined ?
              () => navigation.navigate('SpecificTheme', {id: item.id, groupName: name, groupTheme: item.images[0], groupId: groupId, free: false, username: item.username}) : null}>
                <Text style={styles.applyText}>Buy Theme</Text>
              </TouchableOpacity> }
              {my ? null : <TouchableOpacity style={styles.applyContainer} onPress={groupId ? () => navigation.navigate('GroupChannels', {id: groupId, name: name, sending: true, theme: item, group: group}) 
              :() => navigation.navigate('SendingModal', {payload: item, payloadUsername: null, video: false, theme: true})}>
                <Text style={styles.applyText}>Share Theme</Text>
              </TouchableOpacity>}
              {my ? null : !free ? item.stripe_metadata_userId && item.stripe_metadata_userId != user.uid && !profile.reportedThemes.includes(item.id) ? 
              <TouchableOpacity style={styles.applyContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, video: false, comment: null, cliqueId: null, post: false, comments: false, message: false, cliqueMessage: false, theme: true, reportedUser: item.stripe_metadata_userId})}>
                <Text style={styles.applyText}>Report Theme</Text>
              </TouchableOpacity>
              : null : item.userId && item.userId != user.uid && !profile.reportedThemes.includes(item.id) ? 
              <TouchableOpacity style={styles.applyContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, video: false, comment: null, cliqueId: null, post: false, comments: false, message: false, cliqueMessage: false, theme: true, reportedUser: item.userId})}>
                <Text style={styles.applyText}>Report Theme</Text>
              </TouchableOpacity>
              : null}
          </View>
        </View> : null}
    </View>
  )
}

export default ThemeComponent

const styles = StyleSheet.create({
    themeContainer: {
      borderWidth: 1,
      marginHorizontal: 10,
      padding: 5,
      marginBottom: 20,
      width: '44.5%', 
      justifyContent: 'center',
      borderColor: "#fafafa"
    },
    dotContainer: {
        flexDirection: 'row', 
        justifyContent: 'space-between'
    },
    theme: {
        height: 190, 
        width: '100%', 
        marginBottom: 7.5
    },
    nameText: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      textAlign: 'left',
      paddingBottom: 5,
      width: '90%',
      color: "#fafafa"
    },
    overlay: {
      position: 'absolute',
      width: '107%', // Adjust the overlay width as needed
      height: '105%', // Adjust the overlay height as needed
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    closeContainer: {
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        alignItems: 'center'
    },
    closeText: {
        fontSize: 12.29,
        padding: 2.5,
        color: "#fafafa",
        fontFamily: 'Montserrat_700Bold'
    },
    applyContainer: {
        marginTop: '10%',
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
        backgroundColor: "#121212"
    },
    applyText: {
      fontSize: Dimensions.get('screen').height / 54.9,
      fontFamily: 'Montserrat_500Medium',
      padding: 7.5,
      color: "#fafafa"
    },
})