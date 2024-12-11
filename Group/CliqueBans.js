import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect, useContext} from 'react'
import FastImage from 'react-native-fast-image';
import NextButton from '../Components/NextButton';
import ThemeHeader from '../Components/ThemeHeader';
import { Divider } from 'react-native-paper';
import { doc, getDoc, updateDoc, arrayRemove} from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import {MaterialCommunityIcons} from '@expo/vector-icons'
import themeContext from '../lib/themeContext';
const CliqueBans = ({route}) => {
    const {bannedUsers, groupId} = route.params;
    const theme = useContext(themeContext)
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    useEffect(() => {
        bannedUsers.map(async(item) => {
            const docSnap = await getDoc(doc(db, 'profiles', item))
            //let pfp = await getDoc(doc(db, 'profiles', item.data.userId)).data().pfp
            //let username = await getDoc(doc(db, 'profiles', item.data.userId)).data().userName
            setData(prevState => [...prevState, {id: item, ...docSnap.data()}])
            //console.log(item.data.userId)
        })
        setTimeout(() => {
            setLoading(false)
        }, 1000);
    }, [route.params?.bannedUsers])
    async function unBlock(firstName, lastName, id) {
      console.log(firstName, lastName, id)
      const docSnap = await getDoc(doc(db, 'groups', groupId))
      if (!docSnap.exists()) {
        Alert.alert('Cliq unavailable to un-ban user')
      }
      else {
        Alert.alert(`Are you sure you want to un-ban ${firstName} ${lastName}?`, `If you do un-ban ${firstName} ${lastName}, they will be able to interact with this cliq again`, [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Yes', onPress: async() => await updateDoc(doc(db, 'groups', groupId), {
        bannedUsers: arrayRemove(id),
      }).then(async() => await updateDoc(doc(db, "profiles", id), {
            bannedFrom: arrayRemove(groupId)
        }).then(() => setData(data.filter((e) => e.id != id))))},
    ]);
  }
    }
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
    const renderBlocked = ({item, index}) => {
      return (
            <View style={{margin: '2.5%', paddingBottom: 5,}} key={index}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                  <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8}}/>
                    
                 <TouchableOpacity style={{alignItems: 'center', margin: '5%', marginLeft: '2.5%', marginRight: '7.5%'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.id, viewing: true})}>
                    <Text numberOfLines={1} style={[styles.name, {color: theme.color}]}>{item.firstName} {item.lastName}</Text>
                    <Text numberOfLines={1} style={[styles.message, {color: theme.color}]}>@{item.userName}</Text>
                </TouchableOpacity>
               <View style={{marginLeft: 'auto'}}>
                <NextButton text={"Un-Ban"} textStyle={{fontSize: 12.29, padding: 10, fontFamily: 'Montserrat_500Medium'}} onPress={() => unBlock(item.firstName, item.lastName, item.id)}/>
                </View>
                </View>
            </View>
      )
      
     //console.log(item.id)
    }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <ThemeHeader text={"Banned Users"} video={false} backButton={true}/>
      <Divider borderBottomWidth={0.4} borderColor={theme.color}/>
      {loading ? <View style={styles.noDataContainer}>
        <ActivityIndicator size={'large'} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View>
        : data.length > 0 ? 
        <View>
            <Text style={[styles.totalText, {color: theme.color}]}>Total no. of banned users: {data.length}</Text>
            <FlatList data={data}
            renderItem={renderBlocked}
            keyExtractor={(item) => item.id}
            style={{height: '55%'}}
            ItemSeparatorComponent={<View style={{backgroundColor: '#000', height: 0.6,}} />}
            />
        </View> : data.length == 0 ? <View style={styles.noDataContainer}>
            <Text style={[styles.noData, {color: theme.color}]}> No banned users at the moment! </Text>
            <MaterialCommunityIcons name='emoticon-happy-outline' size={50} color={theme.color} style={{alignSelf: 'center', marginTop: '5%'}}/>
        </View> : <View style={{flex: 1, alignItems: 'center', justifyContent:'center'}}>
        <ActivityIndicator size={'large'} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View>}
    </View>
  )
}

export default CliqueBans

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    noData: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium'
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '40%'
    },
    totalText: {
         fontSize: 19.20,
         fontFamily: 'Montserrat_500Medium',
      color: "#090909",
      padding: 5,
      textAlign: 'center',
      marginTop: '2.5%'
    },
    name: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        paddingTop: 5,
        fontWeight: '700'
        //width: '95%'
    },
    message: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        paddingBottom: 5
    },
}
)