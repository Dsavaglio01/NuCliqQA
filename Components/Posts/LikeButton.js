import React, {useCallback} from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { StyleSheet, Dimensions, View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
function LikeButton({item, user, updateTempPostsAddLike, friends, requests, updateTempPostsRemoveLike, videoStyling}) {
  const navigation = useNavigation();
  const addHomeLike = useCallback(async() => {
      await updateTempPostsAddLike(item.item, item.item.likedBy)
    },
    [item, updateTempPostsAddLike]);
  const removeHomeLike = useCallback(async() => {
      await updateTempPostsRemoveLike(item.item, item.item.likedBy)
    },
    [item, updateTempPostsRemoveLike]);
  return (
    <View style={videoStyling ? styles.videoButton : styles.container}>
        <TouchableOpacity onPress={item.item.likedBy.includes(user.uid) == false ? () => {addHomeLike(item.item, item.item.likedBy)} 
        : () => {removeHomeLike(item.item)}}>
            {item.item.likedBy != undefined ? item.item.likedBy.includes(user.uid) ? <MaterialCommunityIcons name='cards-heart' 
            size={videoStyling ? Dimensions.get('screen').height / 33.76 : 27.5} style={{alignSelf: 'center'}} color="red"/> 
            : <MaterialCommunityIcons name='cards-heart-outline' color={"#fafafa"} 
            size={videoStyling ? Dimensions.get('screen').height / 33.76 : 27.5}  
            style={{alignSelf: 'center'}}/> : null}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Likes', {postLikes: item.item.likedBy, friends: friends, requests: requests})}>
            <Text style={styles.postFooterText}>{item.item.likedBy.length > 999 && item.item.likedBy.length < 1000000 ? 
            `${item.item.likedBy.length / 1000}k` : item.item.likedBy.length > 999999 ? `${item.item.likedBy.length / 1000000}m` 
            : item.item.likedBy.length}</Text>
        </TouchableOpacity>
    </View>
  )
}

export default LikeButton
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    postFooterText: {
        fontSize: 12.29,
        fontFamily: 'Monserrat_500Medium',
        color: "#090909",
        padding: 5,
        alignSelf: 'center',
        color: "#fafafa"
    },
    videoButton: {
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 2,
        },
        shadowOpacity: .5,
        shadowRadius: 3.84,
        elevation: 5,
    },
})