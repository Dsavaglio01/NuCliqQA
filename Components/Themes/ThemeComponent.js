import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert} from 'react-native'
import React, {useState} from 'react'
import { useNavigation } from '@react-navigation/native'
import {Entypo, MaterialCommunityIcons} from '@expo/vector-icons';
const ThemeComponent = ({get, free, my, purchased, user, item, groupId, name}) => {
    const [chosenTheme, setChosenTheme] = useState(null);
    const [useThemeModal, setUseThemeModal] = useState(false);
    const navigation = useNavigation();
    function itemFreeToTransparent(item) {
    const updatedThemes = [...freeTempPosts];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.item.id)
    updatedThemes[objectIndex].transparent = true
    setFreeTempPosts(updatedThemes)
  }
  function itemFreeNotToTransparent(item) {
    const updatedThemes = [...freeTempPosts];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.item.id)
    updatedThemes[objectIndex].transparent = false
    setFreeTempPosts(updatedThemes)
  }
  function itemAllToTransparent(item) {
    const updatedThemes = [...tempPosts];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.item.id)
    
    updatedThemes[objectIndex].transparent = true
    setTempPosts(updatedThemes)
  }
  function itemAllNotToTransparent(item) {
    const updatedThemes = [...tempPosts];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.item.id)
    updatedThemes[objectIndex].transparent = false
    setTempPosts(updatedThemes)
  }
  function itemToTransparent(item) {
    const updatedMyThemes = [...myThemes];
    const objectIndex = updatedMyThemes.findIndex(obj => obj.id === item.item.id)
    updatedMyThemes[objectIndex].transparent = true
    setMyThemes(updatedMyThemes)
  }
  function itemNotToTransparent(item) {
    const updatedMyThemes = [...myThemes];
    const objectIndex = updatedMyThemes.findIndex(obj => obj.id === item.item.id)
    updatedMyThemes[objectIndex].transparent = false
    setMyThemes(updatedMyThemes)
  }
  function itemPurchaseToTransparent(item) {
    const updatedMyThemes = [...purchasedThemes];
    const objectIndex = updatedMyThemes.findIndex(obj => obj.id === item.item.id)
    updatedMyThemes[objectIndex].transparent = true
    setPurchasedThemes(updatedMyThemes)
  }
  function itemPurchaseNotToTransparent(item) {
    const updatedMyThemes = [...purchasedThemes];
    const objectIndex = updatedMyThemes.findIndex(obj => obj.id === item.item.id)
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
      body: JSON.stringify({ data: { background: background, theme: item.item.images[0], postBackground: postBackground, item: item, user: user.uid}}), // Send data as needed
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
    <View style={styles.themeContainer}>
      <TouchableOpacity onPress={my ? () => navigation.navigate('SpecificTheme', {myId: item.item.id, my: true}) : purchased ? item.item.price > 0 ? () => navigation.navigate('SpecificTheme', {chargeId: item.item.chargeId, bought: item.item.bought, 
      id: item.item.productId, metadata: item.item.metadata, theme: item.item.images[0], name: item.item.name, description: item.item.description, free: false, purchased: true}) 
      : () => navigation.navigate('SpecificTheme', {id: item.item.productId, productId: item.item.productId, metadata: {userId: user.uid}, theme: item.item.images[0], name: item.item.name, description: item.item.description, free: true, purchased: false}) : 
        item.item.metadata != undefined || item.item.bought != undefined && !groupId && !free ? () => navigation.navigate('SpecificTheme', {id: item.item.id, groupTheme: null, free: false, username: item.item.username}) 
      : groupId && !free ? ()  => navigation.navigate('SpecificTheme', {id: item.item.id, groupId: groupId, groupTheme: item.item.images[0], groupName: name,
        free: false, username: item.item.username}) : free && !groupId ? () => navigation.navigate('SpecificTheme', {productId: item.item.id, groupTheme: null, free: true, username: item.item.username}) :
      free && groupId ? () => navigation.navigate('SpecificTheme', {productId: item.item.id, groupName: name, username: item.item.username, groupTheme: item.item.images[0], free: true, groupId: groupId}) : null}>
        <FastImage source={{uri: item.item.images[0]}} style={styles.theme}/>
      </TouchableOpacity>
      <View style={styles.dotContainer}>
        <Text style={styles.nameText} numberOfLines={1}>{item.item.name}</Text>
        <TouchableOpacity onPress={purchased ? itemPurchaseToTransparent : free ? () => itemFreeToTransparent(item) : my ? itemToTransparent(item) : () => itemAllToTransparent(item)}>
        <Entypo name="dots-three-vertical" style={{alignSelf: 'center'}} size={17.5} color={"#fafafa"}/>
        </TouchableOpacity>
      </View>
      {item.item.transparent ? 
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
                <TouchableOpacity style={styles.applyContainer} onPress={() => navigation.navigate('DesignTheme', {groupId: groupId, themeName: item.item.name, keywords: item.item.keywords, searchKeywords: item.item.searchKeywords, edit: true, source: item.item.images[0], themeId: item.item.id, selling: item.item.forSale, price: item.item.price})}>
                    <Text style={styles.applyText}>Edit Theme</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyContainer} onPress={() => deleteTheme(item)}>
                    <Text style={styles.applyText}>Delete Theme</Text>
                </TouchableOpacity> 
              </>
              : null}
            </View> : 
            free ? <TouchableOpacity style={styles.applyContainer} onPress={!groupId ? () => navigation.navigate('SpecificTheme', {productId: item.item.id, groupTheme: null, free: true, username: item.item.username}) : groupId ? 
            () => navigation.navigate('SpecificTheme', {productId: item.item.id, groupName: name, groupTheme: item.item.images[0], free: true, groupId: groupId, username: item.item.username}) : null}>
                <Text style={styles.applyText}>Get Theme</Text>
              </TouchableOpacity>  :<TouchableOpacity style={styles.applyContainer} onPress={item.item.metadata != undefined || item.item.bought != undefined && !groupId ? () => navigation.navigate('SpecificTheme', {id: item.item.id, groupTheme: null, free: false, username: item.item.username}) : item.item.metadata != undefined || item.item.bought != undefined ?
              () => navigation.navigate('SpecificTheme', {id: item.item.id, groupName: name, groupTheme: item.item.images[0], groupId: groupId, free: false, username: item.item.username}) : null}>
                <Text style={styles.applyText}>Buy Theme</Text>
              </TouchableOpacity> }
              {my ? null : <TouchableOpacity style={styles.applyContainer} onPress={groupId ? () => navigation.navigate('GroupChannels', {id: groupId, name: name, sending: true, theme: item.item, group: group}) 
              :() => navigation.navigate('SendingModal', {payload: item.item, payloadUsername: null, video: false, theme: true})}>
                <Text style={styles.applyText}>Share Theme</Text>
              </TouchableOpacity>}
              {my ? null : !free ? item.item.stripe_metadata_userId && item.item.stripe_metadata_userId != user.uid && !reportedThemes.includes(item.item.id) ? 
              <TouchableOpacity style={styles.applyContainer} onPress={() => navigation.navigate('ReportPage', {id: item.item.id, video: false, comment: null, cliqueId: null, post: false, comments: false, message: false, cliqueMessage: false, theme: true, reportedUser: item.item.stripe_metadata_userId})}>
                <Text style={styles.applyText}>Report Theme</Text>
              </TouchableOpacity>
              : null : item.item.userId && item.item.userId != user.uid && !reportedThemes.includes(item.item.id) ? 
              <TouchableOpacity style={styles.applyContainer} onPress={() => navigation.navigate('ReportPage', {id: item.item.id, video: false, comment: null, cliqueId: null, post: false, comments: false, message: false, cliqueMessage: false, theme: true, reportedUser: item.item.userId})}>
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
      padding: 7.5
    },
})