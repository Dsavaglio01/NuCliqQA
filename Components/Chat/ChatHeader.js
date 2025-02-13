import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-paper';
const ChatHeader = ({text, pfp}) => {
    const navigation = useNavigation();
  return (
    <>
        <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name='chevron-left' size={35} color={"#fafafa"} />
            </TouchableOpacity>
            <View style={styles.header}>
               <FastImage source={pfp ? {uri: pfp} : require('../../assets/defaultpfp.jpg') } style={styles.pfp}/> 
               <Text style={styles.text}>{text}</Text>
            </View>
        </View>
        <Divider borderBottomWidth={1} borderColor={"#fafafa"}/>
    </>
  )
}

export default ChatHeader

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row', 
        alignItems: 'center'
    },
    backIcon: {
        margin: '10%', 
        marginBottom: 0, 
        marginRight: 0, 
        marginLeft: '2.5%'
    },
    header: {
        flexDirection: 'row', 
        alignItems: 'center', 
        marginLeft: '5%',
        marginTop: '11%', 
        marginBottom: '2.5%'
    },
    pfp: {
        height: 35, 
        width: 35, 
        borderRadius: 8, 
        borderWidth: 1.5, 
        borderColor: '#000'
    },
    text: {
        fontSize: 15.36, 
        marginLeft: '5%', 
        width: '65%', 
        fontFamily: 'Montserrat_500Medium', 
        color: "#fafafa"
    }

})