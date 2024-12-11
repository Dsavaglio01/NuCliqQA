import { StyleSheet, Text, TextInput, View, ImageBackground, Modal, TouchableOpacity, FlatList, Alert} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
import InputBox from '../Components/InputBox'
import { setDoc, doc, updateDoc, getDoc } from 'firebase/firestore'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { storage } from '../firebase'
import { ref, getDownloadURL } from 'firebase/storage'
import SearchDropDown from '../Components/DropdownSearch'
import { db } from '../firebase'
import {BACKEND_URL} from "@env"
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold} from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
const GroupCategory = ({route}) => {
    const {name, groupSecurity, edit, id} = route.params
    const navigation = useNavigation();
    const theme = useContext(themeContext)
    const [data, setData] = useState(categories)
    const [category, setCategory] = useState('');
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [searching, setSearching] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const [url, setUrl] = useState();
    const [searchTerm, setSearchTerm] = useState('');
    
  const [categories, setCategories] = useState(['Animals/Pets', 'Animation/Comics', 'Arts/Culture', 'Books', 'Business/Finance', 'Careers', 'Entertainment', 'Family/Relationships',
'Fashion/Beauty', 'Fitness', 'Food', 'Gaming', 'Music', 'Outdoors', 'Science', 'Sports', 'Technology', 'Travel']);
  const [customTerms, setCustomTerms] = useState([]);
    const updateCurrentGroup = async() => {
      if (searchTerm.trim().length == 0) {
        Alert.alert('Cliq must have a category associated with it')
      }
      else {
      if (edit) {
        await updateDoc(doc(db, 'groups', id), {
          category: searchTerm
        }).then(() => fetch(`${BACKEND_URL}/api/createRecommendClique`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cliqueId: id,
                    category: searchTerm,
      }),
      })
    .then(response => response.json())
    .then(responseData => {
      // Handle the response from the server
      console.log(responseData);
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error(error);
    })).then(() => navigation.goBack())
      }
      else {
        navigation.navigate('GroupAbout', {name: name, groupSecurity: groupSecurity, category: searchTerm})
      }
    }
        
    }
    const handleSearch = () => {
    // Perform search logic here based on searchTerm
    console.log('Search term:', searchTerm);
  };

  const handleCategoryPress = (category) => {
    setSearchTerm(category);
    handleSearch();
    setCategoryModalVisible(false)
  };

  const handleAddTerm = () => {
    if (searchTerm && !categories.includes(searchTerm) && !customTerms.includes(searchTerm)) {
      //setCustomTerms((prevTerms) => [...prevTerms, searchTerm]);
      //setSearchTerm();
      setCategoryModalVisible(false)
    }
  };
    const onSearch = (text) => {
    //console.log(text)
    if (text) {
      console.log(text)
      setSearching(true)
      setSearchTerm(text)
      /* const temp = text.toLowerCase()
      //console.log(temp)
      const tempList = data.filter(item => {
        //console.log(item)
        if (item.toLowerCase().match(temp)) {
          //console.log(item)
          return item
        }
      })
      setFiltered(tempList) */
    }
    else {
      /* setSearching(false)
      setFiltered(data) */
    }

  }
  const renderCategories = (item) => {
    return (
        <TouchableOpacity style={styles.categoriesContainer} onPress={() => {setCategory(item.item); setCategoryModalVisible(false)}}>
            <Text style={styles.categories}>{item.item}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center'}} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
        </TouchableOpacity>
    )
  }
  useEffect(() => {
    if (searchTerm.length > 0) {
      const temp = searchTerm.toLowerCase()
      //console.log(temp)
      const tempList = categories.filter(item => {
        //console.log(item)
        if (item.toLowerCase().match(temp)) {
          //console.log(item)
          return item
        }
      })
      setFiltered(tempList)
    }
    else {
      setFiltered(categories)
    }
  }, [searchTerm])
  useEffect(() => {
    if (route.params?.edit) {
      const getData = async() => {
        const docSnap = await getDoc(doc(db, 'groups', id))
        setSearchTerm(docSnap.data().category)
      }
      getData()
    }
  }, [route.params?.edit])
  //console.log(filtered)
  //console.log(customTerms)
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <ImageBackground style={styles.container} source={require('../assets/background2.jpg')} resizeMode="cover">
        
        <Modal visible={categoryModalVisible} animationType="slide" transparent onRequestClose={() => {setCategoryModalVisible(!categoryModalVisible); }}>
        
            <View style={[styles.modalContainer, styles.overlay]}>
                <View style={[styles.modalView, {backgroundColor: theme.backgroundColor}]}>
                    <MaterialCommunityIcons name='close' size={30} style={{textAlign: 'right', paddingRight: 10, paddingBottom: 10, marginRight: '-5%'}} onPress={() => {setCategoryModalVisible(false)}} color={theme.color}/>
                    <TextInput
                        style={{ height: 40, borderColor: 'gray', color: theme.color, borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 }}
                        placeholder="Search Categories"
                        placeholderTextColor={"#979797"}
                        value={searchTerm}
                        onChangeText={(text) => setSearchTerm(text)}
                        maxLength={150}
                      />
                                    {/* <SearchInput autoFocus={true} icon={'magnify'} text={searching ? true : false} containerStyle={{borderWidth: 1, marginRight: '5%', marginLeft: '-5%'}} placeholder={'Search Categories'} 
                    onChangeText={onSearch} onPress={() => setSearching(true)} iconStyle={{position: 'absolute', left: 280, top: 7}}/> */}
                {
                    <>
                    <FlatList
                        data={[...customTerms, ...filtered]}
                        keyExtractor={(item) => item}
                        //horizontal
                        //contentContainerStyle={{ flexWrap: 'wrap' }}
                        numColumns={2}
                        renderItem={({ item }) => (
                          <TouchableOpacity onPress={() => handleCategoryPress(item)}>
                            <Text style={{ padding: 8, marginHorizontal: 5, color: theme.color, borderRadius: 5, marginVertical: 5, borderWidth: 1, borderColor: 'gray' }}>{item}</Text>
                          </TouchableOpacity>
                        )}
                      />
                      <View style={{marginTop: '5%'}}>
                        {searchTerm.length > 0 ? 
        <NextButton text={"Add Custom Term"} onPress={handleAddTerm}/> : null}
        </View>
      </>
                }
                </View>
            </View>
        </Modal>
        <View style={[styles.main, {backgroundColor: theme.backgroundColor}]}>
          <RegisterHeader onPress={() => navigation.goBack()} colorOne={{borderColor: '#3286ac'}} colorTwo={{borderColor: '#3286ac'}} colorThree={{borderColor: '#3286ac'}} group={true}/>
            <Text style={[styles.headerText, {color: theme.color}]}>What's the Most Accurate Category for the Group?</Text>
            <TouchableOpacity style={[styles.placeholderContainer, {borderColor: theme.color}]} onPress={() => setCategoryModalVisible(true)}>
                <MaterialCommunityIcons name='magnify' size={20} style={{alignSelf: "center", paddingLeft: 5}} color={theme.color}/>
                <Text style={[styles.placeholder, {color: "#979797"}]}>{searchTerm.length > 0 ? searchTerm : 'Search Categories'}</Text>
            </TouchableOpacity>
            {/* <View style={{marginTop: '5%', marginLeft: '5%'}}>
                <SearchInput icon={'magnify'} text={searching ? true : false} containerStyle={{borderWidth: 1, marginRight: '5%'}} placeholder={'Search Categories'} onChangeText={onSearch} onPress={() => setSearching(false)}/>

                {
                    searching &&
                    <SearchDropDown
                    onPress={() => {setSearching(false)}}
                    items={filtered} 
                    />
                }
            </View> */}
            <View style={{marginTop: '10%', marginLeft: '5%', marginRight: '5%'}}>
                <NextButton text={'Next'} onPress={updateCurrentGroup}/>
            </View>
        </View>
    </ImageBackground>
  )
}

export default GroupCategory

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        padding: 25,
        paddingBottom: 10
    },
    input: {
        marginTop: '25%',
        borderWidth: 1,
        padding: 10,
        borderColor: "#cdcdcd",
        borderRadius: 30,
    },
    main: {
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
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  modalView: {
    width: '90%',
    height: '70%',
    //margin: 20,
    borderRadius: 20,
    padding: 35,
    paddingTop: 5,
    paddingBottom: 25,
    //alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  placeholder: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_600SemiBold',
        fontWeight: '600',
        //width: '85%',
        paddingLeft: 10,
        alignSelf: 'center'
  },
  placeholderContainer: {
    borderRadius: 5,
        height: 45,
        //borderWidth: 1,
        //width: '95%',
        //marginLeft: '5%',
        flexDirection: 'row',
        borderWidth: 1,
        width: '90%',
        marginLeft: '5%',
        marginTop: '5%'
  },
  categories: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    width: '80%',
  },
  categoriesContainer: {
    borderRadius: 5,
    marginRight: '5%',
    //marginLeft: '-5%',
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})