import { StyleSheet, Text, View, ImageBackground} from 'react-native'
import React, {useState, useEffect} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import { doc, getDoc } from 'firebase/firestore'
import PfpImage from '../Components/PfpImage'
import { db } from '../firebase'
const ChannelPfp = ({route}) => {
    const {id, name, security, group, edit, groupName} = route.params;
    //console.log(id)
    const navigation = useNavigation();
    const [pfp, setPfp] = useState();
    useEffect(() => {
        if (route.params?.edit) {
            const getData = async() => {
                const docSnap = await getDoc(doc(db, 'groups', group, 'channels', id))
                setPfp(docSnap.data().pfp)
            }
            getData();
        }
    }, [route.params?.edit])
  return (
    <ImageBackground style={styles.container} source={require('../assets/loginBackground.png')} resizeMode="cover">
        
        <View style={styles.main}>
            <RegisterHeader onPress={edit ? () => navigation.navigate('GroupChat', {id: id, group: group, name: name, pfp: pfp, groupName: groupName}) : () => navigation.goBack()}  colorOne={{borderColor: '#3286ac'}} colorTwo={styles.barColor} colorThree={styles.barColor} channel={true}/>
            <Text style={styles.addText}>Add a Cliq Chat Picture</Text>
            <PfpImage channelPfp={true} name={`${id}${name}channelPfp.jpg`} id={id} edit={edit} group={group} channelName={name} security={security} skipOnPress={() =>  navigation.navigate('ChannelInvite', {id: id, name: name, group: group, security: security, pfp: null})} />
        </View>
    </ImageBackground> 
  )
}

export default ChannelPfp

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    addText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        padding: 25,
        paddingBottom: 10,
        color: "#fafafa"
    },
    addContainer: {
        backgroundColor: "#fafafa",
        height: 150,
        width: 300,
        //borderRadius: 90,
        justifyContent:'center'
    },
    main: {
          backgroundColor: '#121212',
      borderRadius: 35,
      width: '90%',
      height: '90%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    barColor: {
    borderColor: '#3286ac'
  }
})