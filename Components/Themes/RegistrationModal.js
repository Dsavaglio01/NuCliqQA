import { StyleSheet, Text, View, Modal } from 'react-native'
import React from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
const RegistrationModal = ({registrationModal, closeRegistrationModal}) => {
    const handleClose = () => {
        closeRegistrationModal();
    }
  return (
   <Modal visible={registrationModal} animationType='slide' transparent onRequestClose={() => handleClose()}>
        <View style={[styles.modalContainer, styles.overlay]}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeContainer} onPress={() => handleClose()}>
              <Text style={styles.closeText}>Close</Text>
              <MaterialCommunityIcons name='close' size={30} color={"#fff"}/>
            </TouchableOpacity>
            <Text style={styles.registrationText}>This is where you can get themes to put on your posts and your profile to showcase more of who you are!</Text>
            <Text style={styles.registrationText}>Themes are able to be collected for free from both NuCliq and other users on NuCliq</Text>
            <Text style={styles.registrationText}>You can also share these themes at any time with any of your fellow Cliquers</Text>
            <Text style={styles.registrationText}>Example Themes: </Text>
          </View>
        </View>
      </Modal>
  )
}

export default RegistrationModal

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        height: '75%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 35,
        paddingLeft: '5%',
        paddingRight: '5%',
        paddingTop: 5,
        paddingBottom: 25,
    },
    closeContainer: {
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        alignItems: 'center'
    },
    closeText: {
      fontSize: 12.29,
      padding: 2.5,
      color: "#fafafa",
      fontFamily: 'Montserrat_700Bold',
    },
    registrationText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        padding: 10,
        color: "#fafafa"
    },
})