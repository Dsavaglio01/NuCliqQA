import { Image, StyleSheet, Text, View, ScrollView, FlatList, TouchableOpacity} from 'react-native'
import React, {useState, useEffect, useLayoutEffect} from 'react'
import SearchInput from '../Components/SearchInput'
import SearchDropDown from '../Components/DropdownSearch'
import { useNavigation } from '@react-navigation/native'
const DATA = [{id: 1, template: 'https://i.pinimg.com/originals/c4/0c/e9/c40ce92453203b0696836274350a6063.png', name: 'Cat in Pumpkin'}, 
{id: 2, template: 'https://img.freepik.com/free-vector/cute-witch-cat-hug-pumpkin-halloween-cartoon-illustration_138676-2775.jpg', name: 'Witch Cat and Pumpkin'}, 
{id: 3, template: 'https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/cute-kawaii-halloween-anime-pumpkin-girl-demon-shannon-nelson-art.jpg', name: 'Nezuko in Pumpkin'}, 
{id: 4, template: 'https://img.freepik.com/premium-vector/cartoon-cute-halloween-big-ice-cream-fancy-trick-treat_39961-1991.jpg', name: 'Halloween Toppings'},
{id: 5, template: 'https://i.pinimg.com/originals/59/7b/46/597b46c02030ab864b2f8a858ef34a97.jpg', name: 'Happy Halloween!'},
{id: 6, template: 'https://cdn2.vectorstock.com/i/1000x1000/61/21/cute-halloween-drawing-vector-33986121.jpg', name: 'Cute Bat'}, 
{id: 7, template: 'https://www.cudenver.com/getattachment/4ca4f28f-adb3-40ea-aa64-c3f0ba24c4fc/History-of-Halloween', name: 'Happy Halloween'}, 
{id: 8, template: 'https://cdn.sfstation.com/wp-content/uploads/2018/09/Alex-Pardee-1.jpg', name: 'Exploding Pumpkin Head'},
{id: 9, template: 'https://i.etsystatic.com/16509843/r/il/8a27b7/3470017394/il_570xN.3470017394_szq5.jpg', name: 'Pumpkin Head'},
{id: 10, template: 'https://www.chadsavage.com/wp-content/uploads/2014/10/Autumn-People-07-Society-6-800x800.jpg', name: 'Scary Pumpkin Skeleton'},
{id: 11, template: 'https://design4users.com/wp-content/uploads/2019/10/halloween-illustration-art-1024x768.jpg.pagespeed.ce.f7PQHyl4xF.jpg', name: 'Halloween Art'},
{id: 12, template: 'https://i.etsystatic.com/13432603/r/il/75a115/1621638772/il_fullxfull.1621638772_piwv.jpg', name: 'Halloween Mirror'},]

const Stickers = () => {
  const [searching, setSearching] = useState(false); 
  const [filtered, setFiltered] = useState([]);
  const [stickers, setStickers] = useState(DATA);
  const [filteredGroup, setFilteredGroup] = useState([]);
  const navigation = useNavigation();
  const onSearch = (text) => {
    //console.log(text)
    if (text && stickers.length > 0) {
      setSearching(true)
      const temp = text.toLowerCase()
      //console.log(temp)
      const tempList = stickers.filter(item => {
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
      setFiltered(stickers)
    }

  }
  //console.log(filtered)
  const onSubmitEditing = (text) => {
    console.log(text)
  }
  const renderStickers = (item) => {
    //console.log(item.item)
    return (
      <TouchableOpacity onPress={() => navigation.navigate('SpecificTemplate', {template: item.item.template, name: item.item.name})}>
        <Image source={{uri: item.item.template}} style={{height: 100, width: 100, borderRadius: 50, marginHorizontal: 10, marginBottom: 10}}/>
      </TouchableOpacity>
    )
  }
  const renderSpecific = (item) => {
    //console.log(item)
    return (
      <TouchableOpacity onPress={() => navigation.navigate('SpecificTemplate', {template: item.item.item.template, name: item.item.name})}>
        <Image source={{uri: item.item.item.template}} style={{height: 100, width: 100, borderRadius: 10, marginHorizontal: 10, marginBottom: 10}}/>
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
  //console.log(filteredGroup.length)
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Get Stickers!</Text>
      <View style={{borderTopWidth: 0 }}/>
          <SearchInput icon={'magnify'} text={searching ? true : false} iconStyle={{position: 'absolute', left: 320, top: 12}} onSubmitEditing={(event) => onSearch(event.nativeEvent.text)}
          containerStyle={{width: '90%', marginHorizontal: '5%', marginTop: '10%'}} placeholder={'Find Stickers'} onChangeText={onSearch} onPress={() => setSearching(false)}/>
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
            numColumns={3}
          /> : <FlatList 
            data={stickers}
            renderItem={renderStickers}
            numColumns={3}
            keyExtractor={({item, index}) => (index)}
            style={{height: '150%'}}
          />  }
        {/* <Image source={{uri: 'https://i1.sndcdn.com/artworks-000432461661-4h8frt-t500x500.jpg'}} style={{height: 200, width: '48%', borderRadius: 10}}/>
        <Image source={{uri: 'https://i.redd.it/7swu0cti0tw91.jpg'}} style={{marginLeft: '4%', height: 200, width: '48%', borderRadius: 10}}/> */}
      </View>
    </View>
  )
}

export default Stickers

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