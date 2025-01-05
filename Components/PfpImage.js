import { StyleSheet, View, TouchableOpacity, ActivityIndicator} from 'react-native'
import React, {useContext} from 'react'
import NextButton from './NextButton';
import Skip from './Skip';
import useAuth from '../Hooks/useAuth';
import FastImage from 'react-native-fast-image';
import themeContext from '../lib/themeContext';
import { useSinglePickImage } from '../Hooks/useSinglePickImage';
const PfpImage = ({name, channelPfp, groupPfp, skipOnPress, id, channelName, security, edit,
  pfpRegister, firstName, lastName, userName, age, category, groupName, groupSecurity, description, groupBanner}) => {
    const {user} = useAuth();
    const theme = useContext(themeContext);
    const {image, imageLoading, pickImage} = useSinglePickImage({firstName: firstName, lastName: lastName, userName: userName, age: age,
      groupName: groupName, groupSecurity: groupSecurity, description: description, category: category, id: id,
      channelPfpImage: channelPfp ? true : false, pfpRegisterImage: pfpRegister ? true : false,
      groupBanner: groupBanner ? true: false, name: channelPfp ? `${user.uid}${name}${Date.now()}channelPfp.jpg` : pfpRegister 
      ? `${userName}profile.jpg` : `${user.uid}${name}${Date.now()}groupBanner.jpg`});
  return (
    pfpRegister || channelPfp ? 
    <>
      <View style={styles.container}>
        <TouchableOpacity style={styles.addContainer} onPress={pickImage}>
          <FastImage source={image ? {uri: image} : require('../assets/defaultpfp.jpg')} 
            style={!groupPfp ? styles.notGroupPfp : styles.groupPfp}/>
        </TouchableOpacity>    
      </View>
      <View style={styles.nextContainer}>
        {imageLoading ? 
        <>
          <ActivityIndicator color={"#9EDAFF"} />  
        </> : image != null ?  
        <>
          <NextButton text={'Next'} onPress={uploadImage}/>
          <Skip onPress={skipOnPress}/>
        </> : <Skip onPress={skipOnPress}/>}
      </View>
    </> : groupBanner ?
    <>
      <View style={styles.container}>
        <TouchableOpacity style={[styles.addContainer, {height: 200, width: 300}]} onPress={pickImage}>
          <FastImage source={image ? {uri: image} : require('../assets/defaultpfp.jpg')} style={styles.groupBanner}/>
        </TouchableOpacity>
      </View>
      <View style={styles.nextContainer}>
        {imageLoading ? 
          <>
            <ActivityIndicator color={"#9EDAFF"} />  
            </> : image != null && !edit ?  
            <>
              <NextButton text={'Next'} onPress={uploadImage}/>
              <Skip onPress={skipOnPress}/>
            </> : image != null && edit ? 
              <NextButton text={'Next'} onPress={uploadImage}/>
            : !edit ? <Skip onPress={skipOnPress}/> : null}
      </View>
    </> : null
    
  )
}

export default PfpImage

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', 
    marginTop: '5%'
  },
  addContainer: {
    height: 151,
    width: 151,
    borderRadius: 8,
    backgroundColor: "#121212"
  },
  nextContainer: {
    marginTop: '10%', 
    marginLeft: '5%', 
    marginRight: '5%'
  },
  notGroupPfp: {
    height: 151, 
    width: 151, 
    borderRadius: 8, 
    borderWidth: 4
  },
  groupPfp: {
    height: 190,
    width: 154, 
    borderRadius: 8, 
    borderWidth: 4
  },
  groupBanner: {
    height: 200, 
    width: 300, 
    borderRadius: 8, 
    borderWidth: 4
  }
})