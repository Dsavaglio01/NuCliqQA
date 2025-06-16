import { StyleSheet, Text, View, TouchableOpacity} from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import FastImage from 'react-native-fast-image'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import getDateAndTime from '../../lib/getDateAndTime';
const PreviewChat = ({item, completeFriends, filteredGroup, group, messageNotifications}) => {
    const navigation = useNavigation();
    async function deleteMessageNotifications (item) {
    }
  return ( 
    <View>
        <TouchableOpacity style={styles.messageContainer} activeOpacity={1} onPress={() => {deleteMessageNotifications(item); navigation.navigate('PersonalChat', {person: item, friendId: item.id})}}>
            <FastImage source={item.pfp ? {uri: item.pfp} : require('../../assets/defaultpfp.jpg')} style={styles.pfp}/>
            <View style={styles.header}>
                <Text numberOfLines={1} style={styles.name}>{item.firstName} {item.lastName}</Text>
                {filteredGroup.length > 0 ? <Text numberOfLines={1} style={styles.message}>{item.userName}</Text> : 
                <Text numberOfLines={1} style={styles.message}>{item.lastMessage == undefined ? 'Start the Conversation!' : item.lastMessage.userSent != undefined ?
                `Sent a profile`: item.lastMessage.post != undefined ? item.lastMessage.post.group != undefined ? 'Sent a Cliq' : `Sent a post by ${item.lastMessage.userName}` 
                : item.lastMessage.theme != undefined ? `Sent a theme` : item.lastMessage.image != undefined ? 'Sent a photo' : 
                item.lastMessage.image && item.lastMessage.text.length > 0 ? item.lastMessage.text : item.lastMessage.text}</Text>}
            </View>
            <View style={styles.iconContainer}>
                <Text style={styles.time}>{getDateAndTime(item.lastMessageTimestamp)}</Text>
            {messageNotifications.length > 0 ? messageNotifications.filter((element) => element.id == item.messageId).length > 0 ? 
                <View>
                    <MaterialCommunityIcons name='message-badge-outline' style={styles.icon} size={25} color={"#33FF68"}/>
                </View> : 
                <View>
                    <MaterialCommunityIcons name='message-outline' style={styles.icon}  size={25} color={"#fafafa"}/>
                </View> :
                <View>
                    <MaterialCommunityIcons name='message-outline' style={styles.icon} size={25} color={"#fafafa"}/>
                </View> 
            }
            </View>
        </TouchableOpacity>
    </View>
  )
}

export default PreviewChat

const styles = StyleSheet.create({
    messageContainer: {
        borderRadius: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#d3d3d3",
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#121212"
    },
    pfp: {
        height: 45, 
        width: 45, 
        borderRadius: 8, 
        borderWidth: 1.5
    },
    header: {
        paddingLeft: 7.5, 
        width: '75%'
    },
    name: {
        fontSize: 15.36,
        paddingTop: 5,
        color: "#fafafa",
        fontFamily: 'Montserrat_700Bold'
    },
    message: {
        fontSize: 15.36,
        color: "#fafafa",
        fontFamily: 'Montserrat_500Medium',
        paddingBottom: 5,
    },
    iconContainer: {
        flexDirection: 'column', 
        marginLeft: 'auto'
    },
    icon: {
        textAlign: 'right', 
        paddingRight: 5
    },
    time: {
        fontSize: 12.29, 
        paddingBottom: 5, 
        color: "#fafafa",
        fontFamily: 'Montserrat_500Medium'
    }
})