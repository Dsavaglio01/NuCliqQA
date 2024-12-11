import { FlatList, StyleSheet, Text, View, TouchableOpacity} from 'react-native'
import React, {useState, useEffect, useMemo} from 'react'
import SearchBar from '../Components/SearchBar'

import { useNavigation } from '@react-navigation/native'
import { db } from '../firebase'
import {doc, getDoc} from 'firebase/firestore'
import FastImage from 'react-native-fast-image'
import {MaterialCommunityIcons} from '@expo/vector-icons'
import NextButton from '../Components/NextButton'
const SearchClique = ({route}) => {
    const {cliquesJoined, cliqueData, post, name, cliques, edit, selling, actualThemeName, actualKeywords, actualPrice, themeId} = route.params;
    const [data, setData] = useState([]);
    const [searching, setSearching] = useState(false);
    const [filteredGroup, setFilteredGroup] = useState([]);
    //console.log(cliquesJoined)
    console.log(cliqueData.length)
    useMemo(() => {
        if (route.params?.cliquesJoined) {
            cliquesJoined.map(async(item) => {
                const docRef = doc(db, "groups", item);
                const docSnap = await getDoc(docRef);
                if (cliqueData.filter((e) => e.name == docSnap.data().name).length > 0) {
                  setData(prevState => [...prevState, {cliqueId: docSnap.id, checked: true, ...docSnap.data()}])
                }
                else {
                  setData(prevState => [...prevState, {cliqueId: docSnap.id, checked: false, ...docSnap.data()}])
                }
                
                
            })
            //setData(cliquesJoined)
        }
    }, [route.params?.cliquesJoined])
    const renderFriend = ({item, index}) => {
    return (
        <View style={styles.messageContainer}>
          {item.pfp ? <FastImage source={{uri: item.pfp, priority: 'normal'}} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/> :
          <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
          }
                
                 <View style={{paddingLeft: 7.5, width: '75%'}}>
                    <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
                </View>
                {item.checked == true ? <TouchableOpacity style={{marginRight: '10%'}} onPress={() => renderRemoved(index)}>
                  <MaterialCommunityIcons name='check' style={{alignSelf: 'center'}} size={25} color="#005278"/>
                </TouchableOpacity> : <TouchableOpacity style={{marginRight: '10%'}} onPress={() => renderChecked(index)}>
                  <MaterialCommunityIcons name='plus' style={{alignSelf: 'center'}} size={25}/>
                </TouchableOpacity>}
           </View>
    )
  }
  const renderChecked = (id) => {
      let list = data
      list[id].checked = !list[id].checked
      var newList = list.slice()
      setData(newList)
      //console.log(friends[id])
    }
  const renderRemoved = (id) => {
    let list = data
      list[id].checked = false
      var newList = list.slice()
      setData(newList)
  }
    const handleSearchCallback = (dataToSend) => {
        setSearching(dataToSend)
    }
    const handleGroupCallback = (dataToSend) => {
        setFilteredGroup(dataToSend)
    }
    const handleFunctionCallback = (dataToSend) => {
      const newArray = [dataToSend, ...data]
      setData(newArray)
    }
    const navigation = useNavigation();
    //console.log(cliquesJoined)
    //console.log(data)
    //console.log(filteredGroup)
    //console.log(cliqueData)
  return (
    <View style={styles.container}>
      <View style={{marginTop: '15%', marginHorizontal: '5%'}}>
        <SearchBar isSearching={handleSearchCallback} cliqueSearches={data} cliqueData={cliqueData} cliquePost={post} cliqueName={name} handleCliqueSearchFunction={handleFunctionCallback}
        cliqueSearch = {true} cliqueSearchFunction={() => navigation.navigate('SuccessTheme', {groupChecked: false, post: post, name: name
        , cliques: cliques, edit: edit, selling: selling, actualThemeName: actualThemeName, actualPrice: actualPrice, themeId: themeId, actualKeywords: actualKeywords})} filteredGroup={handleGroupCallback} />
      </View>
      <FlatList 
      data={data}
      renderItem={renderFriend}
      keyExtractor={(item) => item.cliqueId.toString()}
      />
      {data.filter(item => item.checked == true).length > 0 ? 
      <View style={{justifyContent: 'flex-end', flex: 1, marginBottom: '20%', marginHorizontal: '5%'}}>
              <NextButton text={"Add Themes to Cliqs"} onPress={() => navigation.navigate('SuccessTheme', {cliques: data.filter(item => item.checked == true), post: post, name: name, groupChecked: true})}/>
            </View> : null}
      
    </View>
  )
}

export default SearchClique

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    },
    messageContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#d3d3d3",
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        marginLeft: '5%'
    },
    name: {
        fontSize: 15.36,
        paddingTop: 5,
        fontWeight: '700'
    },
})