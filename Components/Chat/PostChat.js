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
import * as Haptics from 'expo-haptics';
import handleMessagePress from '../../lib/handleMessagePress';
import ChatBubble from 'react-native-chat-bubble';
const PostChat = React.memo(({item, user, person, lastMessageId, postNull,
  readBy, newMessages, updateNewMessages, reportedContent, friendId, updateLastMessageId}) => {
    const [animatedValue] = useState(new Animated.Value(0))
    const navigation = useNavigation();
    const [tapCount, setTapCount] = useState(0);
    const timerRef = useRef(null); 
    const userBubbleStyle = {
    backgroundColor: '#9edaff',
    padding: 10,
    margin: 5,
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
    margin: 5,
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
  const userPostContainer = {
    margin: 5,
    marginRight: '-2.5%',
    //marginBottom: 0,
    paddingTop: 5,
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 5,
    maxWidth: 270,
    alignSelf: 'flex-end',
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
    borderRadius: 20,
    backgroundColor: '#9edaff',
  }
  const postContainer = {
    margin: 5,
    marginLeft: '-2.5%',
    padding: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 20,
    maxWidth: 270,
    alignSelf: 'flex-start',
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
    borderRadius: 20,
    backgroundColor: '#005278',
    //alignSelf: 'center'
  }
   function handlePostPress(item) {

    setTapCount(tapCount + 1);

    if (tapCount === 0) {
      // Set a timer for the second tap
      timerRef.current = setTimeout(() => {
        // If no second tap occurs within the timer, treat it as a single tap
        setTapCount(0);
        if (!item.message.post.repost && !item.message.post.post[0].video) {
          navigation.navigate('Post', {post: item.message.post.id, name: item.message.post.userId, groupId: null, video: false})
        }
        else if (!item.message.post.repost && item.message.post.post[0].video) {
          navigation.navigate('Post', {post: item.message.post.id, name: item.message.post.userId, groupId: null, video: true})
        }
        else {
          navigation.navigate('Repost', {post: item.message.post.id, name: item.message.post.userId, groupId: null, video: false})
        }
        
        //console.log('Single Tap!');
      }, 500); // Adjust the time limit according to your requirements
    } else if (tapCount === 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      // If it's the second tap and the timer is still active, treat it as a double tap
      clearTimeout(timerRef.current);
      setTapCount(0);
      renderLiked(item, friendId, user, newMessages, updateNewMessages)
    }
  }
  
  return (
    postNull ? 
        <View style={item.user == user.uid ? styles.user : styles.notUser}>
            {item.user != user.uid && ( // Only show image for non-user messages
                <FastImage source={person.pfp ? { uri: person.pfp } : require('../../assets/defaultpfp.jpg')} // Replace with actual image URL
                    style={styles.profileImage}
                />
            )}
              <Animated.View style={item.user == user.uid ? userBubbleStyle : bubbleStyle}>
                <Text allowFontScaling={false} style={item.user == user.uid ? [styles.postUsername, {color: "#121212"}] : [styles.postUsername, {color: "#fafafa"}]}>Post unavailable</Text>
                <View style={[styles.timestampContainer, item.user != user.uid && styles.userTimestampContainer]}>
                   {getDateAndTime(item.timestamp) ?  <Text style={item.user == user.uid ? styles.userTimestamp : styles.timestamp}>{getDateAndTime(item.timestamp)}</Text> : null}
                </View>
              </Animated.View>
            
            {lastMessageId == item.id && readBy.includes(item.toUser) && item.user == user.uid && <Text style={styles.readReceipt}>Read</Text>}
        </View> : 
          <View style={{flexDirection: 'column'}}>
           <View style={item.user == user.uid ? styles.user : styles.notUser}>
                {item.user != user.uid && ( // Only show image for non-user messages
                <FastImage source={person.pfp ? { uri: person.pfp } : require('../../assets/defaultpfp.jpg')} // Replace with actual image URL
                    style={styles.profileImage}
                />
                )}
            <Animated.View style={item.user == user.uid ? userPostContainer : postContainer}>
                <TouchableOpacity  activeOpacity={1} onPress={() => handlePostPress(item)} onLongPress={() => toggleSave(true, item, newMessages, updateNewMessages)}>
                    <View style={{flexDirection: 'row'}}>
                    {item.message.post.pfp ?  <FastImage source={{uri: item.message.post.pfp}} style={styles.imagepfp}/> :
                        <FastImage source={require('../../assets/defaultpfp.jpg')} style={styles.imagepfp}/>
                    }
                        <Text allowFontScaling={false} style={item.user == user.uid ? [styles.postUsername, {color: "#121212"}] : [styles.postUsername, {color: "#fafafa"}]}>@{item.message.post.username}</Text>
                    </View>
                    {item.message.post.post[0].image ?
                        <FastImage source={{uri: item.message.post.post[0].post}} style={item.message.post.caption.length == 0 ? styles.image
                        : styles.noBorderImage}/>: item.message.post.post[0].video ?
                        <FastImage source={{uri: item.message.post.post[0].thumbnail}} style={item.message.post.caption.length == 0 ? [styles.image]
                        : styles.noBorderImage}/> : 
                        <View style={{marginTop: -5}}>
                            <ChatBubble bubbleColor='#fff' tailColor='#fff'>
                                <Text allowFontScaling={false} style={styles.imageText}>{item.message.post.post[0].value}</Text>
                            </ChatBubble>
                        </View>
                    }
                    {item.message.post.caption.length > 0 ? 
                        <View style={{width: '90%'}}>
                            <Text allowFontScaling={false} numberOfLines={1} style={item.user == user.uid ? [styles.captionText, {color: "#121212"}] : [styles.captionText, {color: "#fafafa"}]}>{item.message.post.username} - {item.message.post.caption}</Text> 
                        </View>
                    : null}
                </TouchableOpacity> 
                <View style={[styles.timestampContainer, item.user != user.uid && styles.userTimestampContainer]}>
                    {getDateAndTime(item.timestamp) ?  <Text style={item.user == user.uid ? styles.userTimestamp : styles.timestamp}>{getDateAndTime(item.timestamp)}</Text> : null}
                </View>
                <TouchableOpacity activeOpacity={1} style={[styles.likeButton, item.user == user.uid && styles.userLikeButton]} onPress={item.user != user.uid ? () => 
                  renderLiked(item, friendId, user, newMessages, updateNewMessages) : null}>
                    <Ionicons name="heart" size={20} color={item.liked ? 'red' : 'grey'} /> 
                </TouchableOpacity>
            </Animated.View>
          </View>
          {item.message.text.length > 0 ? 
            <View style={item.user == user.uid ? styles.user : styles.notUser}>
                {item.user != user.uid && ( // Only show image for non-user messages
                    <FastImage source={person.pfp ? { uri: person.pfp } : require('../../assets/defaultpfp.jpg')} // Replace with actual image URL
                        style={styles.profileImage}
                    />
                )}
                <Animated.View style={item.user == user.uid ? userBubbleStyle : bubbleStyle}>
                    <TouchableOpacity activeOpacity={1}  onPress={() => handleMessagePress(item)} onLongPress={() => 
                        {toggleCopy(true, item, newMessages, updateNewMessages);}}>
                        {item.message.text !== "" ?
                            <Text allowFontScaling={false} style={[item.user == user.uid ? styles.userText : styles.text]}>{item.message.text}</Text>
                        : null}
                    </TouchableOpacity> 
                    <View style={[styles.timestampContainer, item.user != user.uid && styles.userTimestampContainer]}>
                        {getDateAndTime(item.timestamp) ?  <Text style={item.user == user.uid ? styles.userTimestamp : styles.timestamp}>{getDateAndTime(item.timestamp)}</Text> : null}
                    </View>
                    <TouchableOpacity activeOpacity={1} style={[styles.likeButton, item.user == user.uid && styles.userLikeButton]} onPress={item.user != user.uid ? () => 
                      renderLiked(item, friendId, user, newMessages, updateNewMessages) : null}>
                        <Ionicons name="heart" size={20} color={item.liked ? 'red' : 'grey'} /> 
                    </TouchableOpacity>
                </Animated.View> 
            </View>
           : null}
          {(item.saveModal && item.user == user.uid) || (item.saveModal && !reportedContent.includes(item.id)) ?  
          <View style={item.user == user.uid ? styles.copyModal : [styles.copyModal, {alignSelf: 'flex-start', marginLeft: '17%', width: '48%'}] }>
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
            {lastMessageId == item.id && readBy.includes(item.toUser) && item.user == user.uid && <Text style={styles.readReceipt}>Read</Text>}
          </View>
  )
})

export default PostChat

const styles = StyleSheet.create({
    user: {
        alignSelf: 'flex-end', 
        marginLeft: 'auto',
    },
    notUser: {
        alignSelf: 'flex-start', 
        flexDirection: 'row',
    },
    profileImage: {
        width: 40,
        height: 40,
        backgroundColor: "#fafafa",
        borderRadius: 20,
        marginRight: 10, // Add spacing between image and text
    },
    postUsername: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        alignSelf: 'center',
        padding: 5
    },
    timestampContainer: { 
        width: 80, 
        alignSelf: 'flex-end', 
        alignItems: 'flex-end', // Align timestamp to the right
    },
    userTimestampContainer: {
        width: 80,
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
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
        paddingBottom: 10
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    header: {
        alignSelf: 'center', 
        paddingTop: 5
    },
    image: {
        height: 220,
        width: 223.4375, 
        borderRadius: 8, 
        marginLeft: 5
    },
    imageText: {
        maxHeight: 220,
        borderRadius: 8, 
        marginLeft: 5,
        fontSize: 15.36, 
        width: 191, 
        color: "#121212", 
        fontFamily: 'Montserrat_500Medium'
    },
    noBorderImage: {
        height: 220,
        width: 223.4375, 
        borderRadius: 8, 
        marginLeft: 5,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
    },
    text: {
        fontSize: 15.36, 
        color: "#fafafa",
        alignSelf: 'flex-start',
        textAlign: 'left'
    },
    userText: {
        fontSize: 15.36,
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
        bottom: 5,
        position: 'absolute' 
    }, 
    copyModal: {
        borderRadius: 10,
        backgroundColor: "gray",
        marginRight: '5%',
        marginTop: '5%',
        marginLeft: '5%',
        alignSelf: 'flex-end',
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
    captionText: {
        fontSize: 12.29,
        fontFamily: 'Montserrat_500Medium',
        padding: 10,
        paddingBottom: 0,
        paddingHorizontal: 5,
        paddingRight: 0,
    },
})