import { Modal, StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image';
import Pinchable from 'react-native-pinchable'
import {MaterialCommunityIcons} from '@expo/vector-icons'
const MessageImageModal = ({imageModal, closeImageModal, image}) => {
    const handleClose = () => {
        closeImageModal();
    }
  return (
    <Modal visible={imageModal} style={{backgroundColor: "#121212"}} animationType='slide' onRequestClose={() => handleClose()}>
        <View style={[styles.modalImageContainer, styles.overlay]}>
            <View style={styles.modalView}>
                <TouchableOpacity onPress={() => handleClose()} style={{alignItems: 'flex-end'}}>
                    <MaterialCommunityIcons name='close' size={30} color={"#fafafa"}/>
                </TouchableOpacity>
                <View style={styles.center}>
                    <Pinchable>
                        <FastImage source={{uri: image}} style={styles.image}/>
                    </Pinchable>
                </View>
            </View>
        </View>
        
    </Modal>
  )
}

export default MessageImageModal

const styles = StyleSheet.create({
    modalImageContainer: {
    height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: "black",
    },
    modalView: {
        width: '90%',
        height: '92%',
        backgroundColor: 'transparent',
        borderRadius: 5,
        padding: 0,
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    image: {
        height: Dimensions.get('screen').height / 2,
        width: Dimensions.get('screen').width / 1.125,
        borderRadius: 5
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center', 
        flex: 1
    }
})