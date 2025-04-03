import { StyleSheet, Text, View, Animated, TouchableOpacity} from 'react-native'
import React, {useRef, useState} from 'react'
import FastImage from 'react-native-fast-image'
import getDateAndTime from '../../lib/getDateAndTime'
import {Ionicons, MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import { Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import deleteMessage from '../../lib/deleteChatMessage';
import renderLiked from '../../lib/renderLiked';
import toggleCopy from '../../lib/toggleCopy';
import toggleSave from '../../lib/toggleSave';
import * as Clipboard from 'expo-clipboard';
import handleMessagePress from '../../lib/handleMessagePress';
import MessageImageModal from './MessageImageModal';
const TextChat = React.memo(({item, user, person, lastMessageId, readBy, newMessages, updateNewMessages, reportedContent, friendId, 
    updateLastMessageId, subscription}) => {
    const [animatedValue] = useState(new Animated.Value(0))
    const navigation = useNavigation();
    const [tapCount, setTapCount] = useState(0);
    const timerRef = useRef(null); 
    const [imageModal, setImageModal] = useState(false);
    const [image, setImage] = useState(null);
    const userBubbleStyle = {
    backgroundColor: '#9edaff',
    padding: 10,
    
    marginHorizontal: 5,
    borderRadius: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 5,
    maxWidth: 200,
    alignSelf: 'flex-end',
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  }
   const bubbleStyle = {
    backgroundColor: '#005278',
    padding: 10,
    
    marginHorizontal: 5,
    borderRadius: 20,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 20,
    maxWidth: 200,
    alignSelf: 'flex-start',
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  };
  async function copyFunction(item) {
    await Clipboard.setStringAsync(item.message.text).then(()=> toggleCopy(false, item, newMessages, updateNewMessages)).catch((error) => console.warn(error))
  }
  function handleImagePress(item) {
    setTapCount(tapCount + 1);

    if (tapCount === 0) {
      // Set a timer for the second tap
      timerRef.current = setTimeout(() => {
        // If no second tap occurs within the timer, treat it as a single tap
        setTapCount(0);
        setImage(item.message.image)
        setImageModal(true)
        //console.log('Single Tap!');
      }, 300); // Adjust the time limit according to your requirements
    } else if (tapCount === 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      // If it's the second tap and the timer is still active, treat it as a double tap
      clearTimeout(timerRef.current);
      setTapCount(0);
      if (channelNotifications.filter((e) => e.id == item.user)[0]) {
        renderLiked(item, channelNotifications.filter((e) => e.id == item.user)[0].notificationToken, updateNewMessages)
      }
      else {
        renderLiked(item, null, updateNewMessages)
      }
    }
  }
  return (
    <View style={{marginVertical: '-2.5%'}}>
        <MessageImageModal imageModal={imageModal} closeImageModal={() => setImageModal(false)} image={image}/>
        {item.message.text != undefined ?
            <View style={item.user == user.uid ? styles.user : styles.notUser}>
                {item.user != user.uid && ( // Only show image for non-user messages
                    <FastImage
                        source={person.pfp ? { uri: person.pfp } : require('../../assets/defaultpfp.jpg')} // Replace with actual image URL
                        style={styles.profileImage}
                    />
                )}
                <Animated.View style={item.user == user.uid ? userBubbleStyle : bubbleStyle}>
                    <TouchableOpacity style={{alignItems: 'flex-end'}} activeOpacity={1} onPress={() => handleMessagePress(item)}
                        onLongPress={() => {toggleCopy(true, item, newMessages, updateNewMessages);}}>
                        {item.message.text !== "" ?
                            <Text allowFontScaling={false} style={[item.user == user.uid ? styles.userText : styles.text]}>{item.message.text}</Text>
                        : null}
                    </TouchableOpacity> 
                    <View style={[styles.timestampContainer, item.user != user.uid && styles.userTimestampContainer]}>
                        {getDateAndTime(item.timestamp) ? 
                            <Text style={item.user == user.uid ? styles.userTimestamp : styles.timestamp}>{getDateAndTime(item.timestamp)}</Text> : null}
                    </View>
                    <TouchableOpacity activeOpacity={1} style={[styles.likeButton, item.user == user.uid && styles.userLikeButton]} onPress={item.user != user.uid ? () => renderLiked(item,
                    friendId, user, null, updateNewMessages) : null}>
                        <Ionicons name="heart" size={20} color={item.liked ? "red" : "grey"} /> 
                    </TouchableOpacity>
                </Animated.View>
                {lastMessageId == item.id && readBy.includes(item.toUser) && item.user == user.uid && <Text style={styles.readReceipt}>Read</Text>}
            </View> : null}
            {item.copyModal ?
              <View style={item.user == user.uid ? styles.copyModal : [styles.copyModal, {alignSelf: 'flex-start'}]}>
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => copyFunction(item)}>
                  <Text allowFontScaling={false} style={[styles.copyText, {color: "#fafafa"}]}>Copy</Text>
                  <MaterialCommunityIcons name='content-copy' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
                <Divider color={"#fafafa"}/>
                {item.user == user.uid && subscription ? 
                    <>
                        <TouchableOpacity style={styles.copyTextContainer} onPress={() => deleteMessage(item, newMessages, friendId, updateNewMessages, updateLastMessageId)}>
                        <Text allowFontScaling={false} style={[styles.copyText, {color: "#fafafa"}]}>Delete Message</Text>
                        <MaterialCommunityIcons name='delete' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                        </TouchableOpacity>
                        <Divider color={"#fafafa"}/> 
                    </>
                : null}
               {!reportedContent.includes(item.id) ? 
                <>
                    <TouchableOpacity style={styles.copyTextContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, video: false, theme: false, comment: null, cliqueId: null, post: false, comments: false, message: true, cliqueMessage: false, reportedUser: item.user})}>
                    <Text allowFontScaling={false} style={[styles.copyText, {color: '#fafafa'}]}>Report</Text>
                    <MaterialIcons name='report' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                    </TouchableOpacity> 
                    <Divider color={"#fafafa"}/> 
                </>
                : null}
                <TouchableOpacity style={styles.copyTextContainer} onPress={() => toggleCopy(false, item, newMessages, updateNewMessages)}>
                  <Text allowFontScaling={false} style={[styles.copyText]}>Cancel</Text>
                  <MaterialIcons name='cancel' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                </TouchableOpacity>
              </View> 
              :
               <View style={{margin: '5%'}}>
                <TouchableOpacity activeOpacity={1} onPress={() => handleImagePress(item)} 
                    onLongPress={() => {toggleSave(true, item, newMessages, updateNewMessages)}}>
                    {item.message.image != undefined ? 
                        <View style={item.user == user.uid ? styles.user : styles.notUser}>
                            {item.user != user.uid && ( // Only show image for non-user messages
                                <FastImage
                                source={person.pfp ? { uri: person.pfp } : require('../../assets/defaultpfp.jpg')} // Replace with actual image URL
                                style={styles.profileImage}
                                />
                            )}
                    <FastImage source={{uri: item.message.image}} style={[styles.regImage, {marginRight: -5}]}/>
                    {lastMessageId == item.id && readBy.includes(item.toUser) && item.user == user.uid && <Text style={styles.readReceipt}>Read</Text>}
                    {(item.saveModal && item.user == user.uid) || (item.saveModal && !reportedContent.includes(item.id)) ?  
                        <View style={[styles.copyModal, {marginTop: '5%'}]}>
                            {item.user == user.uid ?
                                <>
                                    <TouchableOpacity style={styles.copyTextContainer} onPress={() => deleteMessage(item, newMessages, friendId, updateNewMessages, updateLastMessageId)}>
                                        <Text allowFontScaling={false} style={[styles.copyText, {color: "#fafafa"}]}>Delete Message</Text>
                                        <MaterialCommunityIcons name='delete' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                                    </TouchableOpacity>
                                    <Divider color={"#fafafa"}/> 
                                </>
                            : null}
                            {!reportedContent.includes(item.id) ? 
                                <>
                                <TouchableOpacity style={styles.copyTextContainer} onPress={() => navigation.navigate('ReportPage', {id: item.id, video: false, theme: false, comment: null, cliqueId: null, post: false, comments: false, message: true, cliqueMessage: false, reportedUser: item.user})}>
                                    <Text allowFontScaling={false} style={[styles.copyText, {color: '#fafafa'}]}>Report</Text>
                                    <MaterialIcons name='report' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                                </TouchableOpacity> 
                                <Divider color={"#fafafa"}/> 
                                </>
                            : null}
                                <TouchableOpacity style={styles.copyTextContainer} onPress={() => toggleSave(false, item, newMessages, updateNewMessages)}>
                                    <Text allowFontScaling={false} style={[styles.copyText]}>Cancel</Text>
                                    <MaterialIcons name='cancel' size={20} style={{alignSelf: 'center'}} color={"#fafafa"}/>
                                </TouchableOpacity>
                            </View> 
                        : null}
                        </View>
                    : null}
                    </TouchableOpacity>
                </View>}
       </View>
  )
})

export default TextChat

const styles = StyleSheet.create({
    user: {
        alignItems: 'flex-end', 
        marginLeft: 'auto',
    },
    notUser: {
        alignItems: 'flex-start', 
        flexDirection: 'row',
    },
    profileImage: {
        width: 40,
        height: 40,
        backgroundColor: "#fafafa",
        borderRadius: 20,
        marginRight: 10, // Add spacing between image and text
    },
    timestampContainer: { 
        width: 80,  
        alignSelf: 'flex-end',
        alignItems: 'flex-end', // Align timestamp to the right
    },
    userTimestampContainer: {
        width: 80,
        alignItems: 'flex-start',
        alignSelf: 'flex-start'
    },
    timestamp: {
        fontSize: 12,
        color: '#fafafa',
        marginRight: 'auto',
        marginTop: 5,
    },
    userTimestamp: {
        fontSize: 12,
        color: '#121212',
        marginTop: 5,
    },
    readReceipt: { 
        fontSize: 12.29,
        color: '#fafafa',
        marginLeft: 'auto', 
        marginRight: 10,
        paddingTop: 10
    },
    text: {
        fontSize: 19.20, 
        color: "#fafafa",
        alignSelf: 'flex-start',
        textAlign: 'left'
    },
    userText: {
        fontSize: 19.20,
        color: "#121212",
        textAlign: 'left'
    },
    likeButton: {
        position: 'absolute',
        bottom: 5,
        right: 10, // Default: right side
    },
    userLikeButton: {
        left: 10, 
        position: 'absolute',
        bottom: 5 
    }, 
    copyModal: {
        borderRadius: 10,
        width: '50%',
        alignSelf: 'flex-end',
        backgroundColor: "gray",
        marginRight: '5%',
        marginLeft: '5%',
        marginBottom: '2.5%'
    },
    copyText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        paddingRight: 10,
        color: "#fafafa",
    },
    copyTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10
    },
    regImage: {
        height: 200,
        width: 200,
        borderRadius: 10,
        resizeMode: 'contain'
    },
})