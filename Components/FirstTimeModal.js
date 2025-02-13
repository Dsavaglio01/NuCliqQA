import { StyleSheet, Text, View, Modal, TouchableOpacity} from 'react-native'
import React from 'react'
import NextButton from './NextButton'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Divider } from 'react-native-paper'
const FirstTimeModal = ({isFirstTime, closeFirstTimeModal, home, vidz}) => {
    const navigation = useNavigation();
    const handleClose = () => {
        closeFirstTimeModal()
    }
    function skipWalkthrough() {
    const check = async() => {
      await AsyncStorage.setItem('isFirstTime', 'false');
      handleClose()
    }
    check()
  }
  return (
    <Modal visible={isFirstTime} transparent animationType='slide' onRequestClose={() => handleClose()}>
          <View style={[styles.modalImageContainer, styles.overlay]}>
            <View style={styles.modalView}>
                <TouchableOpacity style={styles.skipContainer} onPress={() => skipWalkthrough()}>
                  <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
              <Text style={styles.headerText}>Home</Text>
              <Divider style={styles.divider}/>
              <Text style={styles.mainText}>Welcome, this is the home page of NuCliq where you can see your friend's posts, posts just for you, message friends, and search for other users!</Text>
              <View style={styles.nextContainer}>
                <NextButton text={"NEXT"} onPress={() => {handleClose(); navigation.navigate('New Post', {screen: 'NewPost', params: {group: null, groupId: null, postArray: []}})}}/>
              </View>
            </View>
          </View>
        </Modal>
  )
}

export default FirstTimeModal

const styles = StyleSheet.create({
    modalImageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 220
    },
    modalView: {
    width: '90%',
    flexGrow: 1,
    height: 230,
    backgroundColor: '#121212',
    borderRadius: 20,
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
    skipContainer: {
        flexDirection: 'row', 
        alignItems: 'center', 
        marginLeft: 'auto', 
        marginRight: '2.5%', 
        marginVertical: 5
    },
    skipText: {
        fontFamily: 'Montserrat_400Regular', 
        fontSize: 15.36, 
        color: "#fafafa"
    },
    headerText: {
        fontFamily: 'Montserrat_700Bold', 
        fontSize: 19.20, 
        marginLeft: '5%', 
        paddingBottom: 10, 
        paddingTop: 0, 
        color: "#9EDAFF"
    },
    divider: {
        borderWidth: 0.5, 
        width: '90%', 
        marginLeft: '5%', 
        borderColor: "#fafafa"
    },
    mainText: {
        fontFamily: 'Montserrat_500Medium', 
        fontSize: 15.36, 
        marginHorizontal: '5%', 
        paddingVertical: 10, 
        color: "#9EDAFF"
    },
    nextContainer: {
        marginRight: '5%', 
        alignItems: 'flex-end', 
        marginTop: '2.5%'
    }
})