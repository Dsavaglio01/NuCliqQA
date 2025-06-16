import { StyleSheet, Text, View, TouchableOpacity, Dimensions} from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native'
import ChatBubble from 'react-native-chat-bubble'
import {MaterialCommunityIcons} from '@expo/vector-icons';
const MiniPost = ({item, index, repost, name}) => {
    const navigation = useNavigation();
      return (
        <View key={index}>
            {repost ? 
             <TouchableOpacity style={styles.border} onPress={() => navigation.navigate('Repost', {post: item.id, name: name, groupId: null, video: false})}>
                <View style={{ padding: 10}}>
                    <ChatBubble bubbleColor='#fff' tailColor='#fff'>
                        <Text style={styles.text}>{item.post.post[0].value}</Text>
                    </ChatBubble>
                </View>
            </TouchableOpacity> :
            item.post[0] &&
            item.post[0].image ? 
                <TouchableOpacity style={styles.border} onPress={() => navigation.navigate('Post', {post: item.id, name: name, groupId: null, video: false})}>
                    <FastImage source={{uri: item.post[0].post}} style={styles.image}/>
                </TouchableOpacity> : item.post[0] && item.post[0].video ? <>
                <TouchableOpacity style={styles.border} onPress={() => navigation.navigate('Post', {post: item.id, name: name, groupId: null, video: true})}>
                    <MaterialCommunityIcons name='play' size={30} style={styles.playIcon} color={"#000"}/>
                    <FastImage source={{uri: item.post[0].thumbnail}} style={styles.image}/>
                </TouchableOpacity>
                </> :item.post[0] ? <TouchableOpacity style={styles.border} onPress={() => navigation.navigate('Post', {post: item.id, name: name, groupId: null, video: false})}>
                    <View style={{padding: 10}}>
                    <ChatBubble bubbleColor='#fff' tailColor='#fff'>
                        <Text style={styles.text}>{item.post[0].value}</Text>
                    </ChatBubble>
                    </View>
                </TouchableOpacity> : <></>
            }
        </View>
    ) 
}

export default MiniPost

const styles = StyleSheet.create({
    border: {
        borderWidth: 1, 
        borderColor: "#000"
    },
    image: {
        height: Dimensions.get('screen').height / 7,
        width: (Dimensions.get('screen').height / 7.5) * 1.01625,
        resizeMode: 'contain'
    },
    playIcon: {
        position: 'absolute', 
        zIndex: 3, 
        left: 110
    },
    text: {
        fontSize: 12.29, 
        height: Dimensions.get('screen').height / 12.25, 
        width: (Dimensions.get('screen').height / 12.25) * 1.01625, 
        color: "#121212", 
        paddingLeft: 5, 
        paddingTop: 2.5
    }
})