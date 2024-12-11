import { Image, StyleSheet, Text, View, ScrollView, FlatList, TouchableOpacity} from 'react-native'
import React, {useState, useEffect, useLayoutEffect} from 'react'
import SearchInput from '../Components/SearchInput'
import SearchDropDown from '../Components/DropdownSearch'
import { useNavigation } from '@react-navigation/native'
const DATA = [{id: 1, theme: 'https://i1.sndcdn.com/artworks-000432461661-4h8frt-t500x500.jpg', name: 'Outdoors'}, {id: 2, theme: 'https://i.redd.it/7swu0cti0tw91.jpg', name: 'City'}, 
{id: 3, theme: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/a6798865-e26f-4565-8753-2ff2e142c176/deli8j0-c3717c05-e239-4789-8a61-81c07fa4bc2f.jpg/v1/fill/w_1280,h_1792,q_75,strp/aesthetic_vibes_by_nikkiarts0_deli8j0-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTc5MiIsInBhdGgiOiJcL2ZcL2E2Nzk4ODY1LWUyNmYtNDU2NS04NzUzLTJmZjJlMTQyYzE3NlwvZGVsaThqMC1jMzcxN2MwNS1lMjM5LTQ3ODktOGE2MS04MWMwN2ZhNGJjMmYuanBnIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.NwQC49wE0yMU-qcEjgZes-Hwj4piJC_Y4rkZl-d84EI'
, name: 'Landscape'}, {id: 4, theme: 'https://i.pinimg.com/736x/40/0c/75/400c75c876d03218f961bf5581001343.jpg', name: 'Carnival'}]
const UserCreated = () => {
  const [searching, setSearching] = useState(false); 
  const [filtered, setFiltered] = useState([]);
  const [themes, setThemes] = useState(DATA);
  const [filteredGroup, setFilteredGroup] = useState([]);
  const navigation = useNavigation();
  const onSearch = (text) => {
    //console.log(text)
    if (text && themes.length > 0) {
      setSearching(true)
      const temp = text.toLowerCase()
      //console.log(temp)
      const tempList = themes.filter(item => {
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
      setFiltered(themes)
    }

  }
  const renderAll = (item) => {
    //console.log(item.item)
    return (
      <TouchableOpacity onPress={() => navigation.navigate('SpecificTheme', {theme: item.item.theme})}>
        <Image source={{uri: item.item.theme}} style={{height: 190, width: 165, borderRadius: 10, marginHorizontal: 10, marginBottom: 10}}/>
        <Text style={styles.nameText}>{item.item.name}</Text>
      </TouchableOpacity>
    )
  }
  const renderSpecific = (item) => {
    //console.log(item)
    return (
      <TouchableOpacity onPress={() => navigation.navigate('SpecificTheme', {theme: item.item.item.theme})}>
        <Image source={{uri: item.item.item.theme}} style={{height: 190, width: 165, borderRadius: 10, marginHorizontal: 10, marginBottom: 10}}/>
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
      <Text style={styles.header}>Get Themes!</Text>
      <View style={{borderTopWidth: 0 }}/>
          <SearchInput icon={'magnify'} text={searching ? true : false} iconStyle={{position: 'absolute', left: 320, top: 12}}
          containerStyle={{width: '90%', marginHorizontal: '5%', marginTop: '10%'}} placeholder={'Find Themes'} onChangeText={onSearch} onPress={() => setSearching(false)}/>
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
            data={themes}
            renderItem={renderAll}
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

export default UserCreated

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