import { StyleSheet, Text, View, Modal, ActivityIndicator} from 'react-native'
import React, { useState } from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { Divider } from 'react-native-paper';
import RadioButtonGroup, { RadioButtonItem } from "expo-radio-button"
const UseModal = ({useThemeModal, closeUseThemeModal, chosenTheme, name, groupId}) => {
    const handleClose = () => {
        closeUseThemeModal();
    }
    const [profileDoneApplying, setProfileDoneApplying] = useState(false);
    const [postDoneApplying, setPostDoneApplying] = useState(false);
    const [bothDoneApplying, setBothDoneApplying] = useState(false);
    const [useThemeModalLoading, setUseThemeModalLoading] = useState(false);
    const [current, setCurrent] = useState('')
    const [applyLoading, setApplyLoading]= useState(false);
    async function applyToPosts() {
      setApplyLoading(true);
      await updateDoc(doc(db, 'profiles', user.uid), {
            postBackground: chosenTheme.item.images[0],
            postBought: chosenTheme.item.selling != undefined && chosenTheme.item.selling == true ? true : chosenTheme.item.forSale != undefined && chosenTheme.item.forSale == true ? true : false,
            postBought: chosenTheme.item.selling != undefined && chosenTheme.item.selling == true ? true : chosenTheme.item.forSale != undefined && chosenTheme.item.forSale == true ? true : false,
        }).then(() => {setTimeout(() => {
          setApplyLoading(false)
          setUseThemeModalLoading(false); setPostDoneApplying(true); setChosenTheme(null);
        }, 1000); })
    //setUseThemeModalLoading(true)
    
  }
  async function applyToProfile() {
   // setUseThemeModalLoading(true)
   setApplyLoading(true)
    await updateDoc(doc(db, 'profiles', user.uid), {
            background: chosenTheme.item.images[0],
            forSale: chosenTheme.item.selling != undefined && chosenTheme.item.selling == true ? true : chosenTheme.item.forSale != undefined && chosenTheme.item.forSale == true ? true : false,
        }).then(() => { setTimeout(() => {
          setApplyLoading(false)
          setUseThemeModalLoading(false); setProfileDoneApplying(true); setChosenTheme(null);
        }, 1000);})
  }
  async function applyToBoth() {
    setApplyLoading(true)
   //console.log(chosenTheme.item.images[0])
    await updateDoc(doc(db, 'profiles', user.uid), {
            background: chosenTheme.item.images[0],
            postBackground: chosenTheme.item.images[0],
            postBought: chosenTheme.item.selling != undefined && chosenTheme.item.selling == true ? true : chosenTheme.item.forSale != undefined && chosenTheme.item.forSale == true ? true : false,
        }).then(() => {
        setTimeout(() => {
          setApplyLoading(false)
          setUseThemeModalLoading(false); 
          setBothDoneApplying(true); 
          setChosenTheme(null); 
        }, 1000);})
  }
  return (
   <Modal visible={useThemeModal} animationType="slide" transparent onRequestClose={() => handleClose()}>
    <View style={[styles.modalContainer, styles.overlay]}>
        <View style={styles.modalView}>
            <View style={styles.mainContainer}>
                <Text style={styles.useThemeText}>Use Theme</Text>
                <TouchableOpacity style={styles.closeContainer} onPress={() => handleClose()}>
                    <Text style={styles.closeText}>Close</Text>
                    <MaterialCommunityIcons name='close' size={30} color={"#121212"}/>
                </TouchableOpacity>
            </View> 
            <Divider borderWidth={0.4}/>
            {profileDoneApplying || postDoneApplying || bothDoneApplying ? null : <Text style={styles.questionText}>Where do you want to apply the "{chosenTheme != null ? chosenTheme.item.name : null}" theme?</Text>}
            {useThemeModalLoading ? <View style={{marginTop: '5%'}}> 
            <ActivityIndicator color={"#9EDAFF"}/> 
            </View> : profileDoneApplying ? 
            <View style={{marginTop: '5%'}}>
                <Text style={styles.postText}>Your profile is now updated with this theme. You can check by going to your profile!</Text>
            </View> : postDoneApplying ? 
            <View style={{marginTop: '5%'}}>
                <Text style={styles.postText}>Your posts are now updated with this theme. You can check by clicking on your posts on your profile!</Text>
            </View> : bothDoneApplying ? 
            <View>
                <Text style={styles.postText}>Your profile and posts are now updated with this theme. You can check by going to your profile and clicking on your posts on your profile!</Text>
            </View> :
            <>
                <RadioButtonGroup
                    containerStyle={styles.containerStyle}
                    selected={current}
                    onSelected={(value) => setCurrent(value)}
                    containerOptionStyle={styles.containerOptionStyle}
                    radioBackground="#005278"
                    size={22.5}
                    radioStyle={{alignSelf: 'flex-start'}}
                >
                    <RadioButtonItem value="Posts" label={
                        <View style={styles.label}>
                            {groupId ? <Text style={styles.postText}>My {name} Posts</Text> : 
                            <Text style={styles.postText}>My Posts</Text>}
                        </View>
                    }/>
                    <RadioButtonItem value="Profile" label={
                        <View style={{alignSelf: 'flex-end'}}>
                            <Text style={styles.postText}>My Profile Page</Text>
                        </View>
                    }/>
                    <RadioButtonItem value="Both" label={
                        <View style={{alignSelf: 'flex-end',}}>
                            <Text style={styles.postText}>Both</Text>
                        </View>
                    }/>
                </RadioButtonGroup>
            </>}
            
        <View style={styles.loadingContainer}> 
        {applyLoading ? <ActivityIndicator color={"#9EDAFF"}/> : 
        <NextButton text={profileDoneApplying || postDoneApplying || bothDoneApplying ? "OK" : "CONTINUE"} button={{width: '45%'}} onPress={profileDoneApplying || postDoneApplying || bothDoneApplying ? 
            () => {handleClose(); setProfileDoneApplying(false); setBothDoneApplying(false); setPostDoneApplying(false)} : current == 'Posts' ? () => applyToPosts() : current == 'Profile' ? () => applyToProfile()
        : current == 'Both' ? () => applyToBoth() : null}/>
    }
        </View>
        </View>
    </View>
</Modal>
  )
}

export default UseModal

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalView: {
        width: '90%',
        height: '40%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 35,
        paddingLeft: '5%',
        paddingRight: '5%',
        paddingTop: 5,
        paddingBottom: 25,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    mainContainer: {
        flexDirection: 'row', 
        justifyContent: 'space-between'
    },
    useThemeText: {
        fontSize: 15.36,
        padding: 10,
        fontFamily: 'Montserrat_700Bold',
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
    questionText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 10,
    },
    postText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_600SemiBold',
        padding: 10,
        paddingTop: 0,
    },
    containerStyle: { 
        marginTop: '2.5%', 
        marginLeft: '2.5%'
    },
    containerOptionStyle: {
        margin: 5, 
        marginBottom: '5%'
    },
    label: {
        alignSelf: 'flex-end', 
        width: '90%'
    },
    postText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_600SemiBold',
        padding: 10,
        paddingTop: 0,
    },
    loadingContainer: {
        alignItems: 'flex-end', 
        flex: 1,
        justifyContent: 'flex-end'
    }
})