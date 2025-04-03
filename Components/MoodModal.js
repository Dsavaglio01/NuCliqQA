import { StyleSheet, Text, View, Modal } from 'react-native'
import React, {useState} from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import RadioButtonGroup, {RadioButtonItem} from 'expo-radio-button';
const MoodModal = ({moodModal, closeModal, isMood}) => {
    const [mood, setMood] = useState('');
    const handleClose = () => {
        closeModal();
    }
  return (
    <Modal transparent animationType='slide' onRequestClose={() => handleClose()} visible={moodModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <MaterialCommunityIcons onPress={() => handleClose()} name='close' size={30} color={"#fff"} style={{textAlign: 'right', marginLeft: 'auto', justifyContent: 'flex-end'}}/>
            <RadioButtonGroup
                        containerStyle={{marginLeft: '2.5%', flexDirection: 'row', flexWrap: 'wrap'}}
                        selected={mood}
                        onSelected={(value) => {isMood(value); setMood(value)}}
                        containerOptionStyle={{margin: 5, marginBottom: '10%'}}
                        radioBackground={"#9EDAFF"}
                        size={22.5}
                        radioStyle={{alignSelf: 'flex-start'}}
              >
                <RadioButtonItem value={"Excited 😆"} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={styles.optionText}>Excited 😆</Text>
                </View>
            }/>
            <RadioButtonItem value={"Funny 😂"} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={styles.optionText}>Funny 😂</Text>
                </View>
            }/>
            <RadioButtonItem value={"Grateful 🥹"} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={styles.optionText}>Grateful 🥹</Text>
                </View>
            }/>
            <RadioButtonItem value={"Happy 😃"} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={styles.optionText}>Happy 😃</Text>
                </View>
            }/>
            <RadioButtonItem value={"Mad 😡"} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={styles.optionText}>Mad 😡</Text>
                </View>
            }/>
            <RadioButtonItem value={"Sad 😢"} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={styles.optionText}>Sad 😢</Text>
                </View>
            }/>
            <RadioButtonItem value={"Scared 😱"} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={styles.optionText}>Scared 😱</Text>
                </View>
            }/>
            <RadioButtonItem value={""} label={
                <View style={{marginLeft: '2.5%'}}>
                    <Text style={styles.optionText}>No Mood</Text>
                </View>
            }/>
            </RadioButtonGroup>
          </View>
        </View>
      </Modal>
  )
}

export default MoodModal

const styles = StyleSheet.create({
    optionText: {
        fontSize: 15.36, 
        fontFamily: 'Montserrat_500Medium', 
        color: "#fafafa"
    },
    modalContainer: {
    flex: 1,
    justifyContent: 'center',
    //alignItems: 'center',
    marginTop: '10%',
  },
  modalView: {
    //margin: 20,
    backgroundColor: '#121212',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fafafa",
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
})