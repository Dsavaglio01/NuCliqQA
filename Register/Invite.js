import { StyleSheet, Text, View, FlatList, TouchableOpacity, ImageBackground} from 'react-native'
import React, {useEffect, useState} from 'react'
import * as Contacts from 'expo-contacts';
import RegisterHeader from '../Components/RegisterHeader';
import NextButton from '../Components/NextButton';
import Checkbox from 'expo-checkbox';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import SearchDropDown from '../Components/DropdownSearch';
import SearchInput from '../Components/SearchInput';
import { useNavigation } from '@react-navigation/native';
import { connectStorageEmulator } from 'firebase/storage';
import {auth} from '../firebase';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import { db } from '../firebase'
const Invite = ({route}) => {
    const [contacts, setContacts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const {categories, firstName, lastName, userName, age, interests, pfp, education, occupation, bio} = route.params;
    const [searching, setSearching] = useState(false)
    const [noMatch, setNoMatch] = useState(false);
    const {user} = useAuth();
    const [searchTerm, setSearchTerm] = useState('')
    const {handleSignUp } = useAuth();
    const navigation = useNavigation();
    useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
          type: [Contacts.ContactTypes.Person]
        });

        if (data.length > 0 ) {
          tempData = []
          data.map((item) => {
            //console.log(item)
            if (item.phoneNumbers != undefined && item.name != undefined) {
              //console.log(item.phoneNumbers[0])
              if (item.phoneNumbers[0].digits.length == 10) {
                tempData.push(item)
                //console.log(tempData.length)
                //console.log(item)
                //setContacts(prevState => [...prevState, item])
              }
            }
        })
          setContacts(tempData)
            //setContacts(data)
        }
      }
    })();
  }, []);
  const onSearch = (text) => {
    //console.log(text)
    if (text) {
      setSearching(true)
      const temp = text.toLowerCase()
      //console.log(temp)
      const tempList = contacts.filter(item => {
        //console.log(item.name)
        if (item.name.toLowerCase().match(temp)) {
          //console.log(item)
          return item
        }
        else {
          setFiltered([])
          //setNoMatch(true)
          //setContacts([])
        }
      })
      setFiltered(tempList)
    }
    else {
      setSearching(false)
      setFiltered(contacts)
    }

  }
  //console.log(contacts)
  //console.log(firstName)
  async function createAccount() {
    await setDoc(doc(db, 'profiles', user.uid), {
        firstName: firstName,
        lastName: lastName,
        userName: userName,
        age: age,
        interests: interests,
        pfp: pfp,
        education: education, 
        occupation: occupation,
        bio: bio,
        categories: categories,
        groupsJoined: [],
        eventsJoined: [],
        private: false,
        allowNotifications: true,
        stripeAccountID: null,
        showStatus: true,
        blockedUsers: []
      }).finally(async() => await setDoc(doc(db, 'usernames', user.uid, {
        username: userName
      })))
  }
  const inviteUser = () => {
    
  }
  const renderItem = (item) => {
  
    return (
        <View style={styles.contactContainer}>
            <MaterialCommunityIcons name='account' size={30} style={{borderRadius: 15, borderWidth: 1, height: 30, width: 30, alignSelf: 'center'}}/>
            <Text numberOfLines={1} style={styles.contactName}>{item.item.name}</Text>
            <TouchableOpacity style={styles.addContainer} onPress={() => inviteUser()}>
              <Text style={styles.addText}>Invite</Text>
              <MaterialCommunityIcons name="plus" size={15} style={{alignSelf: 'center', paddingRight: 10}} color="#fff"/>
            </TouchableOpacity>
            <TouchableOpacity style={{alignSelf: 'center'}} >
              <MaterialCommunityIcons name='close' size={15} color="#676767"/>
            </TouchableOpacity>
        </View>
    )
  }
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover">
        
        <View style={styles.main}>
          <RegisterHeader onPress={() => navigation.goBack()} colorOne={styles.barColor} colorTwo={styles.barColor} colorThree={styles.barColor} colorFour={styles.barColor} colorFive={styles.barColor} colorSix={styles.barColor} 
        colorSeven={styles.barColor} colorEight={styles.barColor} colorNine={styles.barColor}/>
          <Text style={styles.headerText}>Add/Invite Friends</Text>
          <View style={{borderTopWidth: 0.5 }}/>
          <SearchInput icon={'magnify'} text={searching ? true : false} placeholder={'Find Friends'} onChangeText={onSearch} onPress={() => setSearching(false)}/>
                
                {/* your components can stay here like anything */}
                {/* and at the end of view */}
                {
                    searching &&
                    <SearchDropDown
                    onPress={() => {setSearching(false)}}
                    items={filtered} 
                    //setNewData={(e) => setContacts(contacts.filter(item => item.id == e))}
                    />
                }
          <View style={{borderBottomWidth: 0.25 }}/>
            <View style={{alignItems: 'center'}}>
              {noMatch ? <Text>No Matches</Text> : <FlatList 
                    data={filtered.length > 0 ? filtered : contacts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    alwaysBounceHorizontal={false}
                    style={{height: '60%'}}
                />}
                
                {/* <Text>Invite Friends to the App</Text>
                {contacts.map((contact) => {
                    return (
                    <Text>{contact.name}</Text>
                    )
                })} */}
            </View>
            <View style={{ marginTop: '2.5%', marginRight: '5%', marginLeft: '5%'}}>
                <NextButton text={'Finish Creating Account'} onPress={() => createAccount()}/>
            </View>
        </View>
    </ImageBackground>
  )
}

export default Invite

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    addText: {
        fontSize: 15.36,
        color: "#fff",
        textAlign: 'center',
        padding: 5,
        paddingLeft: 15,
    },
    addContainer: {
      flexDirection: 'row',
      borderRadius: 20,
      backgroundColor: '#005278',
      margin: '5%'
    },
    editText: {
        fontSize: 19.20,
        color: "#fff",
        textAlign: 'center',
        marginTop: '10%'
    },
    contactContainer: {
      flexDirection: 'row',
      borderBottomWidth: 0.5
    },
    main: {
        backgroundColor: '#ffffffe6',
      borderRadius: 35,
      width: '90%',
      height: '87%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    headerText: {
      fontSize: 19.20,
        padding: 25,
        paddingBottom: 10,
        
    },
    contactName: {
      fontSize: 15.36,
      width: '50%',
      padding: 5,
      fontWeight: '700',
      paddingTop: 14,
      paddingLeft: 10
    },
    barColor: {
        borderColor: '#3286ac'
    }
})