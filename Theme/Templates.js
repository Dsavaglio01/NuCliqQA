import { Image, StyleSheet, Text, View, ScrollView, FlatList, TouchableOpacity} from 'react-native'
import React, {useState, useEffect, useLayoutEffect} from 'react'
import SearchInput from '../Components/SearchInput'
import SearchDropDown from '../Components/DropdownSearch'
import { useNavigation } from '@react-navigation/native'
import { SubInfo, Price, People, Title, EndDate, ImageCMP } from './SubInfo'
const DATA = [{id: 1, template: 'https://wallpapers.com/images/hd/aesthetic-retro-road-trip-vibe-uf5i4ola8eiungbw.jpg', name: 'Synthwave'}, 
{id: 2, template: 'https://wallpaper.dog/large/20473465.jpg', name: 'Spacewave'}, 
{id: 3, template: 'https://i.pinimg.com/originals/a3/26/12/a326120b6ade4debf4655dc24004b7f8.jpg', name: 'Palm Trees'}, 
{id: 4, template: 'https://i.pinimg.com/originals/bd/03/5d/bd035d59eb7ee0fdd5eedfed72e64547.jpg', name: 'Street Vibe'}]
const Templates = () => {
  const [searching, setSearching] = useState(false); 
  const [filtered, setFiltered] = useState([]);
  const [templates, setTemplates] = useState(DATA);
  const [filteredGroup, setFilteredGroup] = useState([]);
  const navigation = useNavigation();
  const onSearch = (text) => {
    //console.log(text)
    if (text && templates.length > 0) {
      setSearching(true)
      const temp = text.toLowerCase()
      //console.log(temp)
      const tempList = templates.filter(item => {
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
      setFiltered(templates)
    }

  }
  const renderTemplates = (item) => {
    //console.log(item.item)
    return (
      <TouchableOpacity onPress={() => navigation.navigate('SpecificTemplate', {template: item.item.template, name: item.item.name})}>
        <Image source={{uri: item.item.template}} style={{height: 190, width: 165, borderRadius: 10, marginHorizontal: 10, marginBottom: 10}}/>
        <Text style={styles.nameText}>{item.item.name}</Text>
      </TouchableOpacity>
    )
  }
  const renderSpecific = (item) => {
    //console.log(item)
    return (
      <TouchableOpacity onPress={() => navigation.navigate('SpecificTemplate', {template: item.item.item.template, name: item.item.name})}>
        <Image source={{uri: item.item.item.template}} style={{height: 190, width: 165, borderRadius: 10, marginHorizontal: 10, marginBottom: 10}}/>
        <Text style={styles.nameText}>{item.item.item.name}</Text>
      </TouchableOpacity>
    )
  }
  const renderSearches = (item) => {
    //console.log(item)
    return (
        <TouchableOpacity style={styles.categoriesContainer} onPress={() => {setFilteredGroup([item]); setSearching(false);}}>
            <Text style={styles.categories}>{item.item.name}</Text>
        </TouchableOpacity>
    )
  }
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Get Templates!</Text>
      <View style={{borderTopWidth: 0 }}/>
          <SearchInput icon={'magnify'} text={searching ? true : false} iconStyle={{position: 'absolute', left: 320, top: 12}}
          containerStyle={{width: '90%', marginHorizontal: '5%', marginTop: '10%'}} placeholder={'Find Templates'} onChangeText={onSearch} onPress={() => setSearching(false)}/>
                {
                    searching &&
                    <SearchDropDown
                    onPress={() => {setSearching(false)}}
                    items={filtered} 
                    
                    />
                }
                { searching && 
                  <FlatList 
                    data={filtered}
                    renderItem={renderSearches}
                    keyExtractor={item => item}
                    style={{width: '90%', marginLeft: '5%'}}
                    />
                  }
          <View style={{borderBottomWidth: 0, marginBottom: '5%' }}/>
      <View style={styles.main}>
        {filteredGroup.length > 0 ? <FlatList 
            data={filteredGroup}
            renderItem={renderSpecific}
            keyExtractor={(item) => item.id}
            numColumns={2}
          /> : <FlatList 
            data={templates}
            renderItem={renderTemplates}
            numColumns={2}
            keyExtractor={(item) => item.id}
            //style={{height: '72.5%'}}
          />  }
        {/* <FlatList 
          data={DATA}
          renderItem={renderAll}
          keyExtractor={({item}) => item}
          numColumns={2}
        /> */}
        {/* <Image source={{uri: 'https://i1.sndcdn.com/artworks-000432461661-4h8frt-t500x500.jpg'}} style={{height: 200, width: '48%', borderRadius: 10}}/>
        <Image source={{uri: 'https://i.redd.it/7swu0cti0tw91.jpg'}} style={{marginLeft: '4%', height: 200, width: '48%', borderRadius: 10}}/> */}
      </View>
    </View>
  )
}

export default Templates

const styles = StyleSheet.create({
    container: {
      marginTop: -60
        //flex: 1,
    },
    main: {
      marginHorizontal: '2.5%',
      flexDirection: 'row'
    },
    nameText: {
      fontSize: 15.36,
      alignSelf: 'center',
      paddingBottom: 10
    },
    header: {
      fontSize: 19.20,
      textAlign: 'center',
      marginTop: -15,
    },
    categoriesContainer: {
      borderRadius: 5,
      borderWidth: 1,
      backgroundColor: "#fff",
      //marginRight: '5%',
      marginTop: 5,
      //marginLeft: '20%'
    },
  categories: {
    fontSize: 15.36,
    padding: 10
  },
})