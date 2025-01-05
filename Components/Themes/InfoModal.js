import { StyleSheet, Text, View, Modal} from 'react-native'
import React from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
const InfoModal = ({infoModal, closeInfoModal}) => {
    const handleClose = () => {
        closeInfoModal();
    }
  return (
    <Modal animationType='fade' visible={infoModal} transparent onRequestClose={() => handleClose()}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <MaterialCommunityIcons name='close' size={25} color={"#fff"} style={styles.close} onPress={() => handleClose()}/>
            <Text style={styles.modalText}>Type keywords that will allow you and other users to easily search this Theme!</Text>
          </View>
        </View>
    </Modal>
  )
}

export default InfoModal

const styles = StyleSheet.create({
    close: {
        textAlign: 'right', 
        padding: 5
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '15%'
    },
    modalView: {
        width: '95%',
        height: '14%',
        backgroundColor: '#121212',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#fff",
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
    modalText: {
        fontSize: 15.36,
        color: "#fff",
        padding: 5,
        paddingLeft: 10,
        fontFamily: 'Montserrat_500Medium'
    }
})