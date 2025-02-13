import { StyleSheet, Text, View, Modal, Alert, TouchableOpacity} from 'react-native'
import React from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';
import {BACKEND_URL} from '@env';
import { schedulePushRemoveNotifications, schedulePushBanNotifications } from '../../notificationFunctions';
const AdminModal = ({adminModal, closeAdminModal, person, admins, navigation, groupId, profile, filterMemberInfo, groupName}) => {
    const handleAdminModal = () => {
        closeAdminModal();
    }
    const handleMemberInfo = () => {
        filterMemberInfo();
    }
    function removeFromClique() {
        Alert.alert(`Are you sure you want to remove ${person.firstName} ${person.lastName} from this clique?`, `If you do remove ${person.firstName} ${person.lastName} from this clique, they will be notified and may be able to join again`, [
        {
            text: 'No',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
        },
        {text: 'Yes', onPress: async () => 
            {try {
                const response = await fetch(`${BACKEND_URL}/api/removeFromClique`, {
                method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                },
                body: JSON.stringify({ data: {person: person, groupId: groupId, username: profile.userName}}), // Send data as needed
                })
                const data = await response.json();
                if (data.result.done) {
                    handleMemberInfo()
                    handleAdminModal()
                    schedulePushRemoveNotifications(person.notificationToken, groupName)
                }
            } catch (error) {
                console.error('Error:', error);
            }}},
        ]);
    }
    function banUser() {
    Alert.alert(`Are you sure you want to ban ${person.firstName} ${person.lastName}?`, `If you do ban ${person.firstName} ${person.lastName}, they will be unable to interact with this clique again`, [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Yes', onPress: async() => 
        {try {
            const response = await fetch(`${BACKEND_URL}/api/banUser`, {
            method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
            headers: {
                'Content-Type': 'application/json', // Set content type as needed
            },
            body: JSON.stringify({ data: {person: person, groupId: groupId}}), // Send data as needed
            })
            const data = await response.json();
            if (data.result.done) {
                handleMemberInfo()
                handleAdminModal()
                schedulePushBanNotifications(person.notificationToken, groupName)
            }
        } catch (error) {
            console.error('Error:', error);
        }}},
    ]);
  }
  return (
    <Modal visible={adminModal} animationType="slide" transparent onRequestClose={() => handleAdminModal()}>
        <View style={[styles.modalContainer, styles.overlay]}>
            <View style={styles.modalView}>
                <MaterialCommunityIcons name='close' color={"#fafafa"} size={30} style={styles.closeIcon} onPress={() => handleAdminModal()}/>
                <View style={styles.header}>
                    <FastImage source={person.pfp ? {uri: person.pfp} : require('../../assets/defaultpfp.jpg')} style={styles.pfp}/>
                    <Text numberOfLines={1} style={styles.nameText}>{person.firstName} {person.lastName}</Text>
                </View>
                {!admins.includes(person.id) ? 
                    <TouchableOpacity style={styles.optionContainer} onPress={() => removeFromClique()}>
                        <MaterialCommunityIcons name='account-remove' size={25} color={"#fafafa"}/>
                        <Text style={styles.optionText}>Remove {person.firstName} {person.lastName} from cliq</Text>
                    </TouchableOpacity> 
                : null}
                {!admins.includes(person.id) ? 
                    <TouchableOpacity style={styles.optionContainer} onPress={() => banUser()}>
                        <MaterialCommunityIcons name='account-cancel' size={25} color={"#fafafa"}/>
                        <Text style={styles.optionText}>Ban {person.firstName} {person.lastName} from cliq</Text>
                    </TouchableOpacity> 
                : null}
                <TouchableOpacity style={styles.optionContainer} onPress={() => {navigation.navigate('ViewingProfile', {name: person.id, viewing: true}); handleAdminModal()}}>
                    <MaterialCommunityIcons name='account-circle-outline' size={25} color={"#fafafa"}/>
                    <Text style={styles.optionText}>View {person.firstName} {person.lastName}'s profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
  )
}

export default AdminModal

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        marginTop: '10%'
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '100%',
        height: '100%',
        backgroundColor: '#121212',
        borderRadius: 20,
        padding: 35,
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
    closeIcon: {
        textAlign: 'right', 
        padding: 10, 
        paddingRight: 0
    },
    header: {
        alignItems: 'center', 
        justifyContent: 'center'
    },
    pfp: {
        borderRadius: 8, 
        height: 60, 
        width: 60
    },
    nameText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 2.5,
        paddingBottom: 0,
        width: '90%',
        textAlign: 'center', 
        fontWeight: '600', 
        color: "#fafafa"
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: '5%'
    },
    optionText: {
        fontSize: 19.20,
        fontWeight: '600',
        fontFamily: 'Montserrat_500Medium',
        padding: 10,
        width: '90%',
        color: "#fafafa"
    },

})