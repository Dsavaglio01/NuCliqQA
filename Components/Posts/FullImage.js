import { StyleSheet, Modal, View, Dimensions} from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image'
import { Video } from 'expo-av';
import {MaterialCommunityIcons} from '@expo/vector-icons';
const FullImage = ({imagePostModal, video, closeImagePostModal, desiredImage}) => {
    const handleClose = () => {
        closeImagePostModal()
    }
  return (
    <Modal visible={imagePostModal} animationType="slide" transparent onRequestClose={() => handleClose()}>
        <View style={[styles.modalContainer, styles.overlay]}>
            <View style={desiredImage != null ? desiredImage.image == false && desiredImage.video == true ? 
                [styles.modalView, {height: '70%'}] : [styles.modalView, {height: '45%'}] : null}>
                <MaterialCommunityIcons name='close' size={30} color={"#121212"}  style={styles.closeIcon} onPress={desiredImage != null ? () => handleClose() : null}/>
                <View style={styles.content}>
                    {desiredImage != null ? desiredImage.image == false && desiredImage.video == true ?
                    <Video
                        ref={video}
                        style={styles.video}
                        source={{
                            uri: desiredImage.post,
                        }}
                        useNativeControls
                        volume={1.0}
                        shouldPlay={true}
                        isLooping
                        //onPlaybackStatusUpdate={status => setVideoStatus(() => status)}
                    /> :
                    <FastImage source={{uri: desiredImage.post}} style={styles.image} /> : null}
                </View>
            </View>
        </View> 
    </Modal>
  )
}

export default FullImage

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        height: '15%',
        paddingLeft: 0,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        paddingRight: 0,
        paddingTop: 5,
        paddingBottom: 25,
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    closeIcon: {
        textAlign: 'right', 
        paddingRight: 10, 
        paddingBottom: 10
    },
    content: {
        alignItems: 'center', 
        justifyContent: 'center'
    },
    video: {
        height: Dimensions.get('screen').height / 1.65, 
        width: Dimensions.get('screen').width / 1.35, 
        borderRadius: 8
    },
    image: {
        height: Dimensions.get('screen').height / 2.81, 
        width: Dimensions.get('screen').height / 2.81, 
        borderRadius: 8
    }
})