import { FlatList, StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native'
import React,{useState, useEffect} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import { onSnapshot, query, collection, getFirestore, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import useAuth from '../Hooks/useAuth'
import {Entypo, MaterialCommunityIcons} from '@expo/vector-icons';
import {Picker} from '@react-native-picker/picker';
import { db } from '../firebase'
const MyThemes = () => {

  const navigation = useNavigation();

  const {user} = useAuth()
  const [themes, setThemes] = useState([]);
  const [cliques, setCliques] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState();
  const [isPicker, setIsPicker] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#fff")
  useEffect(() => {
    let unsub;
            const getThemes = async() => {
                unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'themes')), (snapshot) => {
                  setThemes(snapshot.docs.map((doc) => ({
                    id: doc.id,
                    data: doc.data()
                  })))
                })
            }
            getThemes();
  }, [])
  useEffect(() => {
    const getData = async() => {
      const docRef = doc(db, "profiles", user.uid);
      const docSnap = await getDoc(docRef);
      setCliques(docSnap.data().groupsJoined)
    }
    getData();
  }, [])
  const handleSelect = async() => {
    await updateDoc(doc(db, 'profiles', user.uid), {
      selectedTheme: selectedTheme
    }).then(() => navigation.navigate('Profile', {name: user.uid, viewing: true}))
  }
  const deleteSelect = async(item) => {
    console.log(item)
    /* if (cliques.length > 0) {
      cliques.map((e) => {

      })
    } */

  }
  const renderThemes = ({item, index}) => {
      //console.log(item)
      return (
        <TouchableOpacity onPress={() => {setIsPicker(true); setSelectedTheme(item.data.theme); setBackgroundColor("#d8d8d8")}} style={isPicker ? {borderWidth: 2, borderRadius: 20} : {}}>
          <Image source={{uri: item.data.theme}} style={styles.image}/>
          {isPicker ? <MaterialCommunityIcons name='check-circle-outline' style={{position: 'absolute', top: 120, left: 120}} size={25} color="blue"/> : null}
        </TouchableOpacity>
      )
    }
  return (
    <View style={{flex: 1, backgroundColor: backgroundColor}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <RegisterHeader onPress={() => navigation.goBack()}/>
        <Entypo name='dots-three-vertical' size={30} style={{alignSelf: 'center', marginRight: '10%', marginTop: '5%'}}/>
      </View>
      <Text style={styles.headerText}>My Themes</Text>
      <FlatList 
        data={themes}
        renderItem={renderThemes}
        keyExtractor={(item) => item}
        contentContainerStyle={{margin: '5%', marginTop: 0}}
        numColumns={2}
      />
      {isPicker ? 
      <View style={styles.pickerContainer}>
        <TouchableOpacity style={styles.pickerInnerContainer} onPress={handleSelect}>
          <Text style={[styles.themeText, {color: 'blue'}]}>Select Theme</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.pickerInnerContainer, {marginBottom: '10%'}]} onPress={deleteSelect}>
          <Text style={[styles.themeText, {color: 'red'}]}>Delete Theme</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pickerInnerContainer} onPress={() => {setIsPicker(false); setBackgroundColor("#fff")}}>
          <Text style={[styles.themeText, {color: '#ff2400'}]}>Cancel</Text>
        </TouchableOpacity>
      </View> 
      : null}
      
    </View>
  )
}

export default MyThemes

const styles = StyleSheet.create({
  headerText: {
    fontSize: 24,
    textAlign: 'center',
    padding: 10,
    margin: '2.5%',
    //marginTop: '8%',
    fontWeight: '700'
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 15
  },
  pickerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: '10%',
  },
  pickerInnerContainer: {
    //borderWidth: 0.2,
    borderRadius: 10,
    width: '90%',
    marginLeft: '5%',
    marginBottom: '2.5%',
    backgroundColor: "#fff"
  },
  themeText: {
    fontSize: 15.36,
    padding: 12.5,
    fontWeight: '600',
    textAlign: 'center'
  }
})