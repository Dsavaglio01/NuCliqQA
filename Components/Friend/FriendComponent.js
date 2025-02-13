import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import FastImage from 'react-native-fast-image'
import FollowButtons from '../FollowButtons'
import { Divider } from 'react-native-paper'
const FriendComponent = ({index, item, user, friendsInfo, updateFriendsInfo}) => {
    const navigation = useNavigation();
    const handleFriendsInfo = () => {
        updateFriendsInfo()
    }
    console.log(`item: ${item.userName}`)
  return (
    <View key={index}>
        <View style={styles.header}>
            <TouchableOpacity style={styles.friendsContainer} onPress={() => navigation.navigate('ViewingProfile', {name: item.id, viewing: true})}>
                <FastImage source={item.pfp ? {uri: item.pfp} : require('../../assets/defaultpfp.jpg')} style={styles.pfp}/>
                <View style={styles.titleContainer}>
                    <Text numberOfLines={1} style={[styles.nameText, {fontFamily: 'Montserrat_700Bold', fontSize: 19.20}]}>{item.firstName} {item.lastName}</Text>
                    <Text numberOfLines={1} style={styles.nameText}>@{item.userName}</Text>
                </View>
            </TouchableOpacity>
            <FollowButtons user={user} item={item} friendId={item.id} viewing={false} preview={false} actualData={friendsInfo} updateActualData={() => handleFriendsInfo()}/>
        </View>
        <Divider />
    </View>
  )
}

export default FriendComponent

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', 
        width: '82.5%', 
        alignItems: 'center'
    },
    friendsContainer: {
        borderRadius: 10,
        borderBottomColor: "#d3d3d3",
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        width: '95%',
        marginLeft: '2.5%',
        backgroundColor: "#121212"
    },
    pfp: {
        height: 45, 
        width: 45,
        borderRadius: 8, 
        borderWidth: 1.5
    },
    titleContainer: {
        paddingLeft: 20, 
        width: '75%'
    },
    nameText: {
        fontSize: 15.36,
        padding: 2.5,
        paddingBottom: 0,
        width: '90%',
        color: "#fafafa",
        fontFamily: 'Montserrat_500Medium'
    },
})