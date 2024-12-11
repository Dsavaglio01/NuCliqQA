import { StyleSheet, Text, View, Modal, TouchableHighlight, Keyboard, TextInput, TouchableOpacity, ActivityIndicator, Alert} from 'react-native'
import React, {useState} from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { repostFunction } from '../../firebaseUtils';
import { schedulePushRepostNotification } from '../../notificationFunctions';
import NextButton from '../NextButton';
const RepostModal = ({repostModal, closeRepostModal, repostItem, handleKeyPress, user, ableToShare, blockedUsers, forSale, notificationToken, 
    username, background, pfp}) => {
    const navigation = useNavigation();
    const handleClose = () => {
        closeRepostModal()
    }
    const [repostComment, setRepostComment] = useState([]);
    const [repostLoading, setRepostLoading] = useState(false);
    const handleRepostComment = (inputText) => {
        const sanitizedText = inputText.replace(/\n/g, ''); // Remove all new line characters
        setRepostComment(sanitizedText);
    }
    async function rePostFunction() {
    if (!ableToShare) {
    Alert.alert('Post unavailable to reply')
    closeRepostModal()
  }
  else {
    setRepostLoading(true)
   await repostFunction(user, blockedUsers, repostComment, forSale, notificationToken, username, background, pfp, repostItem, setRepostLoading, 
    handleClose, schedulePushRepostNotification)

  }
}
  return (
    <Modal visible={repostModal} transparent animationType='slide' onRequestClose={() => handleClose()}>
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <View style={styles.closeContainer}>
                <MaterialCommunityIcons name='close' color={"#fafafa"} size={30} onPress={() => handleClose()}/>
              </View>
              
              <TouchableHighlight onPress={Keyboard.dismiss} underlayColor={'transparent'} style={{flex: 1}}>
                <>
              {repostItem ? <View style={{justifyContent: 'center'}}>
              <>
              <TextInput multiline maxLength={200} value={repostComment} onKeyPress={handleKeyPress} onChangeText={handleRepostComment} placeholder='Add a comment...' placeholderTextColor={"#fafafa"} style={styles.repostComment}/>
              <Text style={styles.length}>{repostComment.length}/200</Text>
              <View style={styles.repostContainer}>
                <View style={ styles.postHeader}>
            {repostItem.pfp ? <FastImage source={{uri: repostItem.pfp, priority: 'normal'}} style={styles.pfp}/> : 
          <FastImage source={require('../../assets/defaultpfp.jpg')} style={styles.pfp}/>
          }
            <TouchableOpacity onPress={repostItem.userId != user.uid ? () => navigation.navigate('ViewingProfile', {name: repostItem.userId, viewing: true}) 
            : () => navigation.navigate('Profile', {screen: 'ProfileScreen', params: {name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}})}>
              <Text style={styles.addText}>@{repostItem.username}</Text>
            </TouchableOpacity>
          </View> 
                <Text style={styles.repost}>{repostItem.post[0].value}</Text>
              </View>
              </>
              </View> 
              : <Text>Sorry, something went wrong, please try again.</Text>}
              

              <View style={styles.loadContainer}>
                {repostLoading ? <ActivityIndicator color={"9edaff"}/> : 
                <NextButton text={"Re-vibe"} onPress={rePostFunction}/> }
              </View>
              </>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
  )
}

export default RepostModal

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        maxHeight: '60%', 
        marginTop: '40%', 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    modalView: {
    flexGrow: 1,
    padding: 0,
    width: '90%', 
    borderRadius: 20, 
    backgroundColor: "#121212",
    paddingTop: 5,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    },
    closeContainer: {
        alignItems: 'flex-end', 
        padding: 10, 
        paddingTop: 5
    },
    repostComment: {
        fontSize: 19.20, 
        maxHeight: 200, 
        paddingBottom: 20,
        fontFamily: 'Monserrat_500Medium',
        marginLeft: '5%',
        padding: 5,
        color: "#fafafa"
    },
    length: {
        textAlign: 'right', 
        marginRight: '5%', 
        marginBottom: '5%', 
        fontSize: 12.29, 
        color: "#fafafa"
    },
    repostContainer: {
      borderWidth: 1,
      borderRadius: 10,
      borderColor: "#fafafa",
      width: '90%',
      marginLeft: '5%'
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: '2.5%',
      marginLeft: '3.5%',
    },
    pfp: {
        height: 33, 
        width: 33, 
        borderRadius: 8
    },
    addText: {
      fontSize: 15.36,
      fontFamily: 'Monserrat_500Medium',
      padding: 7.5,
      color: "#fafafa",
      alignSelf: 'center',
    },
    repost: {
       fontFamily: 'Monserrat_500Medium',
      fontSize: 15.36,
      marginLeft: '5%',
      padding: 5,
      paddingLeft: 0,
      color: "#fafafa",
    },
    loadContainer: {
        flex: 1, 
        alignItems: 'flex-end', 
        marginRight: '5%', 
        marginTop: '5%'
    }
})