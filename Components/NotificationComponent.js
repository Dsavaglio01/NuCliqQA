import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import {MaterialIcons} from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import {BACKEND_URL} from '@expo/vector-icons';
import ProfileContext from '../lib/profileContext';
import FastImage from 'react-native-fast-image';
import NextButton from './NextButton';
import { schedulePushAcceptNotification } from '../notificationFunctions';
import generateId from '../lib/generateId';
let row = [];
let prevOpenedRow;
const NotificationComponent = ({clique, item, index, user, filterCompleteNotifications}) => {
    const navigation = useNavigation();
    const profile = useContext(ProfileContext);
    async function acceptRequest(item) {
        const newUser = generateId(item.item.requestUser, user.uid)
            try {
                const response = await fetch(`${BACKEND_URL}/api/acceptRequestInd`, {
                method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                },
                body: JSON.stringify({ data: {item: item, newUser: newUser, username: profile.username, 
                    smallKeywords: profile.smallKeywords, largeKeywords: profile.largeKeywords, user: user.uid}}), // Send data as needed
                })
                const data = await response.json();
                if (data.done) {
                    schedulePushAcceptNotification(item.item.requestUser, profile.username, item.info.notificationToken)
                    handleFilter();
                }
            } catch (error) {
                console.error('Error:', error);
            }
    }
    const handleFilter = () => {
        filterCompleteNotifications();
    }
    async function deleteNotification(item)  {
        if (item.item.request) {
            handleFilter();
            await deleteDoc(doc(db, 'profiles', user.uid, 'notifications', item.item.id))
            .then(async() => await deleteDoc(doc(db, 'profiles', user.uid, 'requests', item.item.requestUser))).then(async() => await deleteDoc(doc(db, 'profiles', item.item.requestUser, 'requests', user.uid))) 
        }
        else {
            handleFilter();
            await deleteDoc(doc(db, 'profiles', user.uid, 'notifications', item.item.id))
        }
    }
    const closeRow = (index) => {
      if (prevOpenedRow && prevOpenedRow !== row[index]) {
        prevOpenedRow.close();
      }
      prevOpenedRow = row[index];
    };
    const renderRightActions = () => {
      return (
        <TouchableOpacity
          style={styles.deleteIcon} onPress={() => deleteNotification(item)}>
          <MaterialIcons name='delete-outline' size={35} style={styles.delete} color="red"/>
        </TouchableOpacity>
      );
    };
    return (
        <Swipeable renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, onClick)
        }
        onSwipeableOpen={() => closeRow(index)}
        ref={(ref) => (row[index] = ref)}
        rightOpenValue={-100}>
        {item.item.like && !item.item.repost ? 
        <View style={styles.likeNotificationContainer}>
        <View style={styles.pfp}>
          <FastImage source={item.info.pfp ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={styles.addText}><Text style={{fontFamily: 'Montserrat_700Bold'}} 
          onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.info.userName}
          </Text> liked your {!item.postInfo.repost ? item.postInfo.post[0].image ? 'post' : item.postInfo.post[0].video ? 'vid' : 'vibe' : 're-vibe'}: </Text>
        </View>
        {!item.postInfo.repost ? item.postInfo.post[0].image ? 
      <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].post}} style={styles.borderImage}/>
      </TouchableOpacity> : item.postInfo.post[0].video ? <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].thumbnail}} style={styles.borderImage}/>
      </TouchableOpacity> : <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <Text style={styles.text}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity> : item.postInfo.post.post[0].image ? <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].post}} style={styles.borderImage}/>
      </TouchableOpacity> : item.postInfo.post.post[0].video ? <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].thumbnail}} style={styles.borderImage}/>
      </TouchableOpacity> : <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <Text style={styles.text}>{item.postInfo.post.post[0].value}</Text>
      </TouchableOpacity>}
        
        </View> : item.item.request ? 
        <View style={styles.likeNotificationContainer}>
        <View style={styles.secondPfp}>
          <FastImage source={item.info.pfp ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={styles.addText}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.info.userName}</Text> requested to add you as a friend.</Text>
        </View>
        <View style={styles.acceptContainer}>
          <NextButton text={"Accept"} textStyle={styles.acceptText} onPress={() => acceptRequest(item)}/>
        </View>
        
        </View>
        : item.item.repost ? 
        <View style={styles.likeNotificationContainer}>
        <View style={styles.pfp}>
          <FastImage source={item.info.pfp ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={styles.addText}><Text style={{fontFamily: 'Montserrat_700Bold'}} 
          onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.info.userName}</Text> re-vibed your vibe: </Text>
        </View>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false})}>
        <Text style={styles.text}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity>
        
        </View> :
        item.item.acceptRequest ? 
        <View style={styles.likeNotificationContainer}>
        <View style={styles.pfp}>
          <FastImage source={item.info.pfp ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={styles.addText}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.info.userName}</Text> accepted your friend request!</Text>
        </View>
        </View> :
        item.item.friend ? 
        <View style={styles.likeNotificationContainer}>
        <View style={styles.secondPfp}>
          <FastImage source={item.info.pfp ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={styles.addText}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.info.userName}</Text> added you as a friend!</Text>
        </View>
        </View> :
        item.item.report ? 
        <View style={styles.likeNotificationContainer}>
        <View style={styles.commentContainer}>
          {item.item.comments ? <View>
            <Text numberOfLines={2} style={styles.reportedText}>You have been reported for this comment: {item.item.postId.comment} for {item.item.item}</Text>
          </View> : item.item.post ? 
          <View style={styles.reportText}>
            <Text numberOfLines={2} style={styles.reportedText}>This post has been reported for {item.item.item}:</Text>
            {!item.postInfo.repost ? item.postInfo.post[0].image ? 
            <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
              <FastImage source={{uri: item.postInfo.post[0].post}} style={styles.borderImage}/>
            </TouchableOpacity> : item.postInfo.post[0].video ? <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].thumbnail}} style={styles.borderImage}/>
      </TouchableOpacity> : <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <Text style={styles.text}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity> : item.postInfo.post.post[0].image ? 
            <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
              <FastImage source={{uri: item.postInfo.post.post[0].post}} style={styles.borderImage}/>
            </TouchableOpacity> : item.postInfo.post.post[0].video ? <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].thumbnail}} style={styles.borderImage}/>
      </TouchableOpacity> : <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <Text style={styles.text}>{item.postInfo.post.post[0].value}</Text>
      </TouchableOpacity>}
          </View> : item.item.message ? 
          <View style={styles.messageReport}> 
             <Text numberOfLines={2} style={styles.addText}>You have been reported for a chat message for {item.item.item}</Text>
          </View> : item.item.theme ? 
          <View style={styles.reportText}>
            <Text numberOfLines={2} style={styles.reportedText}>This theme has been reported:</Text>
            <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('SpecificTheme', {productId: item.postInfo.id, free: true, purchased: false})}>
              <FastImage source={{uri: item.postInfo.images[0]}} style={styles.image}/>
            </TouchableOpacity>
          </View>  : null}
        </View>
        
        </View> 
        :
        item.item.comment ? item.item.likedComment ? 
        <View style={styles.likeNotificationContainer}>
        <View style={styles.secondPfp}>
          <FastImage source={item.info.pfp != undefined ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={styles.addText}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.item.likedBy}</Text> liked your comment:  {item.item.item} </Text>
        </View>
        {!item.postInfo.repost ? item.postInfo.post[0].image ? 
      <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].post}} style={styles.borderImage}/>
      </TouchableOpacity> : item.postInfo.post[0].video ? <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].thumbnail}} style={styles.borderImage}/>
      </TouchableOpacity> : <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <Text style={styles.text}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity> : item.postInfo.post.post[0].image ? 
      <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].post}} style={styles.borderImage}/>
      </TouchableOpacity> : item.postInfo.post.post[0].video ? <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].thumbnail}} style={styles.borderImage}/>
      </TouchableOpacity> : <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <Text style={styles.text}>{item.postInfo.post.post[0].value}</Text>
      </TouchableOpacity>}
        </View> : 
        <View style={styles.likeNotificationContainer}>
        <View style={styles.secondPfp}>
          <FastImage source={item.info.pfp != undefined ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={styles.addText}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.item.likedBy}</Text> commented:  {item.item.item} </Text>
        </View>
        {!item.postInfo.repost ? item.postInfo.post[0].image ? 
      <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].post}} style={styles.borderImage}/>
      </TouchableOpacity> : item.postInfo.post[0].video ? <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].thumbnail}} style={styles.borderImage}/>
      </TouchableOpacity> : <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <Text style={styles.text}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity> : item.postInfo.post.post[0].image ? 
      <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].post}} style={styles.borderImage}/>
      </TouchableOpacity> : item.postInfo.post.post[0].video ? <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].thumbnail}} style={styles.borderImage}/>
      </TouchableOpacity> : <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <Text style={styles.text}>{item.postInfo.post.post[0].value}</Text>
      </TouchableOpacity>}
        </View>
        : item.item.reply ? 
        <View style={styles.likeNotificationContainer}>
        <View style={styles.secondPfp}>
          <FastImage source={item.info.pfp != undefined ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={styles.addText}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.item.likedBy}</Text> replied to you:  {item.item.item} </Text>
        </View>
        {!item.postInfo.repost ? item.postInfo.post[0].image ? 
      <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].post}} style={styles.borderImage}/>
      </TouchableOpacity> : item.postInfo.post[0].video ? <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].thumbnail}} style={styles.borderImage}/>
      </TouchableOpacity> : <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <Text style={styles.text}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity> :item.postInfo.post.post[0].image ? 
      <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].post}} style={styles.borderImage}/>
      </TouchableOpacity> : item.postInfo.post.post[0].video ? <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].thumbnail}} style={styles.borderImage}/>
      </TouchableOpacity> : <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <Text style={styles.text}>{item.postInfo.post.post[0].value}</Text>
      </TouchableOpacity>}
        </View> :
        item.item.theme ? 
        <View style={styles.likeNotificationContainer}>
        <View style={styles.secondPfp}>
          <FastImage source={item.info.pfp != undefined ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={styles.addText}><Text  style={{fontWeight: '700'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.info.userName}</Text> bought your theme: </Text>
        </View>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('SpecificTheme', {productId: item.postInfo.id, free: true, purchased: false})}>
              <FastImage source={{uri: item.postInfo.images[0]}} style={styles.image}/>
            </TouchableOpacity>
        
        </View> :
        item.item.mention ? 
         <View style={styles.likeNotificationContainer}>
        <View style={styles.secondPfp}>
          <FastImage source={item.info.pfp != undefined ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={styles.addText}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.item.likedBy}</Text> mentioned you in a comment.</Text>
        </View>
        {!item.postInfo.repost ? item.postInfo.post[0].image ? 
      <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].post}} style={styles.borderImage}/>
      </TouchableOpacity> : item.postInfo.post[0].video ? <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post[0].thumbnail}} style={styles.borderImage}/>
      </TouchableOpacity> : <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <Text style={styles.text}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity> : item.postInfo.post.post[0].image ? 
      <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].post}} style={styles.borderImage}/>
      </TouchableOpacity> : item.postInfo.post.post[0].video ? <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <FastImage source={{uri: item.postInfo.post.post[0].thumbnail}} style={styles.borderImage}/>
      </TouchableOpacity> : <TouchableOpacity style={styles.item} onPress={!item.postInfo.repost ? () => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null})}>
        <Text style={styles.text}>{item.postInfo.post.post[0].value}</Text>
      </TouchableOpacity>}
        </View> : item.item.remove ? 
        <View style={styles.likeNotificationContainer}>
          <View style={styles.reportText}>
            <Text numberOfLines={2} style={styles.reportedText}>You have been removed from this Cliq: {item.postInfo.name}</Text>
            {<View style={styles.item}>
              <FastImage source={item.postInfo.banner ? {uri: item.postInfo.banner} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
            </View>}
          </View>
        </View> 
        : item.item.postMention ? 
        <View style={styles.likeNotificationContainer}>
        <View style={styles.secondPfp}>
          <FastImage source={item.info.pfp != undefined ? {uri: item.info.pfp} : require('../assets/defaultpfp.jpg')} style={styles.image}/>
          <Text numberOfLines={2} style={styles.addText}><Text  style={{fontFamily: 'Montserrat_700Bold'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.item.requestUser, viewing: true})}>@{item.item.likedBy}</Text> mentioned you in a post.</Text>
        </View>
        {item.postInfo.post[0].image ? 
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false})}>
        <FastImage source={{uri: item.postInfo.post[0].post}} style={styles.borderImage}/>
      </TouchableOpacity> : item.postInfo.post[0].video ? <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: true})}>
        <FastImage source={{uri: item.postInfo.post[0].thumbnail}} style={styles.borderImage}/>
      </TouchableOpacity> : <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Post', {post: item.postInfo.id, name: item.postInfo.userId, groupId: null, video: false})}>
        <Text style={styles.text}>{item.postInfo.post[0].value}</Text>
      </TouchableOpacity>}
        </View>
        : item.item.ban ? 
        <View style={styles.likeNotificationContainer}>
          <View style={styles.reportText}>
            <Text numberOfLines={2} style={styles.reportedText}>You have been banned from this Cliq: {item.postInfo.name}</Text>
            {<View style={styles.item}>
              <FastImage source={{uri: item.postInfo.banner}} style={styles.image}/>
            </View>}
          </View>
        </View > :
        null
        }
        </Swipeable>
  )
}

export default NotificationComponent

const styles = StyleSheet.create({
    deleteIcon: {
        margin: 0,
        alignContent: 'center',
        justifyContent: 'center',
        width: 70,
    },
    delete: {
        alignSelf: 'center', 
        paddingBottom: 10
    },
    likeNotificationContainer: {
        margin: '2.5%', 
        flexDirection: 'row', 
        borderBottomWidth: 1, 
        borderBottomColor: "#d3d3d3", 
        paddingBottom: 10, 
        marginTop: 0
    },
    pfp: {
        flexDirection: 'row', 
        alignItems: 'center',
        width: '91%'
    },
    addText: {
        fontSize: 15.36,
        padding: 7.5,
        paddingLeft: 15,
        fontFamily: 'Montserrat_500Medium',
        maxWidth: '90%'
    },
    image: {
        height: 40, 
        width: 40, 
        borderRadius: 8, 
        alignSelf: 'center', 
        borderWidth: 1
    },
    text: {
        height: 40, 
        width: 40, 
        alignSelf: 'center', 
        borderWidth: 1,
        fontSize: 15.36, 
        borderRadius: 1, 
        color: "#fafafa",
    },
    item: {
        borderRadius: 10, 
        marginLeft: 'auto', 
        alignSelf: 'center'
    },
    borderImage: {
        borderRadius: 1,
        height: 40, 
        width: 40,
        alignSelf: 'center', 
        borderWidth: 1
    },
    secondPfp: {
        flexDirection: 'row', 
        alignItems: 'center', 
        width: '75%'
    },
    acceptContainer: {
        alignItems: 'center', 
        justifyContent: 'center', 
        marginLeft: 'auto'
    },
    acceptText: {
        padding: 7.5, 
        paddingLeft: 7.5, 
        paddingRight: 7.5, 
        fontSize: 12.29, 
        fontFamily: 'Montserrat_500Medium'
    },
    commentContainer: {
        flexDirection: 'row', 
        alignItems: 'center', 
        width: '100%'
    },
    reportText: {
        flexDirection: 'row', 
        flex: 1,
        marginTop: 0
    },
    messageReport: {
        marginLeft: '-3%', 
        width: '110%'
    },
    reportedText: {
        fontSize: 15.36,
        padding: 7.5,
        paddingLeft: 0,
        fontFamily: 'Montserrat_500Medium',
        maxWidth: '90%', 
        marginLeft: 0
    }
})