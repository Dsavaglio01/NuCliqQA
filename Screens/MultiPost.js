import { StyleSheet, Text, View, FlatList, Keyboard, TouchableOpacity, TextInput, Image, Alert, SafeAreaView, Button, TouchableWithoutFeedback} from 'react-native'
import React, {useState, useEffect, useRef, useContext} from 'react'
import Header from '../Components/Header'
import NewPostHeader from '../Components/NewPostHeader'
import { useNavigation } from '@react-navigation/native'
import {MaterialCommunityIcons, Foundation, MaterialIcons} from '@expo/vector-icons'
import { Divider, Provider, Menu } from 'react-native-paper'
import MainButton from '../Components/MainButton'
import NextButton from '../Components/NextButton'
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera'
import { useFonts, Montserrat_500Medium, Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat'
import themeContext from '../lib/themeContext'
import { query, collection, where, limit, getDocs} from 'firebase/firestore'
import { db } from '../firebase'
import FastImage from 'react-native-fast-image'
import { clearCache } from 'react-native-compressor'
const MultiPost = ({route}) => {
  const {group, groupId, picture, initialText, groupName, textSize, actualGroup} = route.params;
    const [postImage, setPostImage] = useState(true);
    const [postText, setPostText] = useState(false);
    const [text, setText] = useState('');
    const navigation = useNavigation();
    const [image, setImage] = useState(null);
    const [editorVisible, setEditorVisible] = useState(false);
    const [count, setCount] = useState(0)
    const theme = useContext(themeContext);
    const [parts, setParts] = useState([]);
    const mentionRegex = /@[\w]+/g; // Matches '@' followed by one or more word characters
    const [imageCount, setImageCount] = useState(0);
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [textCount, setTextCount] = useState(0);
    const [finished, setFinished] = useState(false);
    const [editPic, setEditPic] = useState(null);
    const [sizeVisible, setSizeVisible] = useState(false)
    const openSizeMenu = () => setSizeVisible(true)
    const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
    const closeSizeMenu = () => setSizeVisible(false)
    const [actualTextSize, setActualTextSize] = useState(15.36)
    const [alignVisible, setAlignVisible] = useState(false)
    const openAlignMenu = () => setAlignVisible(true)
    const closeAlignMenu = () => setAlignVisible(false)
    const [postArray, setPostArray] = useState([]);
    const [textAlign, setTextAlign] = useState('left')
    const [textColorVisible, setTextColorVisible] = useState(false)
    const openTextColorMenu = () => setTextColorVisible(true)
    const closeTextColorMenu = () => setTextColorVisible(false)
    const [textColor, setTextColor] = useState('black');
    const [backgroundColorVisible, setBackgroundColorVisible] = useState(false)
    const openBackgroundColorMenu = () => setBackgroundColorVisible(true)
    const closeBackgroundColorMenu = () => setBackgroundColorVisible(false)
    const [backgroundColor, setBackgroundColor] = useState('white');
    const inputRef = useRef()
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    useEffect(() => {
        setActualTextSize(textSize)
    }, [textSize])
  const handleFocus = () => {
    setIsKeyboardOpen(true);
  };

  const handleBlur = () => {
    setIsKeyboardOpen(false);
  };
  const styledText = parts.map((part, index) => {
    if (mentionRegex.test(part)) {
      return (
        <Text key={index} style={{color: "#9edaff"}}>
          {part}
        </Text>
      );
    } else {
      return (
        <Text key={index}>
          {part}
        </Text>
      );
    }
  });
  //console.log(showSuggestions)
  const handleInputText = (text) => {
    setText(text);
    //console.log(text[])
    //console.log(text[lastAtIndex - 1] == ' ')
     const lastAtIndex = text.lastIndexOf('@'); // Find the last occurrence of '@'

  // Check if '@' exists and is not the first character
  if (lastAtIndex > 0 &&
  text[lastAtIndex] === '@' &&
  !text.endsWith(' ')) { 
      setShowSuggestions(true);
      
      // Fetch suggestions (replace with your actual logic)
      getSuggestions(text.substring(lastAtIndex));
      
    } else {
      setShowSuggestions(false);
    }

    // Check for space to complete the mention
    
  };
  //console.log(suggestions)
  const getSuggestions = async (text) => {
   // console.log(text)
   const newText = text.substring(1, text.length)
  // console.log(newText)
   setSuggestions([]);
  try {
    let querySnapshot;
    if (newText.length < 4 && newText.length > 0) {
      const firstQ = query(collection(db, "profiles"), where('smallKeywords', 'array-contains', newText.toLowerCase()), limit(10));
      querySnapshot = await getDocs(firstQ);
    //  console.log(querySnapshot.docs.length)
    } else if (newText.length == 0) { 
        const secondQ = query(collection(db, "profiles"), limit(10));
      querySnapshot = await getDocs(secondQ);
      //console.log(querySnapshot.docs.length)
    }
    else {
      const thirdQ = query(collection(db, "profiles"), where('largeKeywords', 'array-contains', newText.toLowerCase()), limit(10));
      querySnapshot = await getDocs(thirdQ);
    }
    const newSuggestions = querySnapshot.docs.map((doc) => ({
      key: doc.id, // Or generate a unique key if needed
      id: doc.id,
      ...doc.data(),
    }));

    setSuggestions(newSuggestions); 
    //const suggestions = querySnapshot.docs.map(doc => `@${doc.data().username}`); // Assuming you have a 'username' field
    //console.log(suggestions)
    //return suggestions;

  } catch (error) {
    console.error("Error fetching suggestions: ", error);
    return []; // Return an empty array in case of an error
  }
};

 const handleSuggestionPress = (username) => {
  setShowSuggestions(false)
  const mentionStart = text.lastIndexOf('@');
  const newText = text.substring(0, mentionStart) + '@' + username + ' '; // Keep the '@'
  setText(newText);
  
};
  useEffect(() => {
    if (route.params?.initialText) {
      setText(initialText.value)
    }
  }, [route.params?.initialText])
    function addToArray() {
        if (text.length > 0) {
            setPostArray(prevState => [...prevState, {id: count, image: false, visible: false, value: text, text: true, textSize: actualTextSize, textColor: textColor, textAlign: textAlign, backgroundColor: backgroundColor}])
            setText('')
            setTextCount(textCount + 1) 
        }
    }
    //console.log(initialText)
    const secondPickImage = async(object) => {
      //console.log(object)
      const newArray=[...postArray]
      await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          //allowsMultipleSelection: true,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        }).then(image => {
          if (image) {
            image.assets.map((item) => {
              newArray[postArray.findIndex(obj => obj == object)] = {id: imageCount, image: true, post: item.uri, visible: false};
              setPostArray(newArray)
              //setArrayOfObjects(newArray);
            })
          }
        })  
    };

    //console.log(postArray.filter(item) => item.image == true)
    //console.log(image)
    //console.log(initialText)
    //console.log(group)
    //console.log(groupId)
    //console.log(showSuggestions)
    const putKeys = () => {
      //console.log(postArray)
      if (text.length > 0) {
        /* const updatedData = postArray.map((item, index) => ({
          ...item,
          id: index + 1
        })) */
        //console.log(updatedData)
        //console.log('first')
        navigation.navigate('NewPost', {postArray: [{id: count, image: false, visible: false, value: text, text: true, textSize: actualTextSize, textColor: textColor, textAlign: textAlign, backgroundColor: backgroundColor}], group:group, actualGroup: actualGroup, groupId: groupId, groupName: groupName})
        /* if (updatedData.filter((word) => word.image == true).length < 6) {
          navigation.navigate('NewPost', {postArray: updatedData, group:group, groupId: groupId})
        }
        else if (updatedData.filter((word) => word.image == false).length < 6) {
          navigation.navigate('NewPost', {postArray: updatedData, group:group, groupId: groupId})
        }
        else {
          Alert.alert('Max Posts Reached', 'Please Remove a Post to Continue!', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])
      
      } */
    }
      }
      const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_400Regular
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <Provider>
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} activeOpacity={1}>
            <View style={{flex: 1}}>
      <View style={{flexDirection: 'row', marginTop: '10%', marginLeft: '5%', marginRight: '5%', justifyContent: 'space-between', paddingBottom: 5}}>
         <>
         <View style={{flexDirection: 'row'}}>
          <MaterialCommunityIcons name='chat-processing-outline' size={30} style={{alignSelf: 'center'}} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
          <Text style={[styles.editText, {color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}]}>Type your message below</Text>
        </View>
          
         </>
        <MaterialCommunityIcons name='close' size={30} style={{alignSelf: 'center'}} color={theme.color} onPress={() => navigation.goBack()}/>
      </View>
      <Divider borderBottomWidth={0.8} borderColor={theme.color}/>
      {picture ? 
      <SafeAreaView style={{marginLeft: '1%', marginRight: '1%', flexWrap: 'wrap', flexDirection: 'row'}}>
        {postArray.length > 0 ? 
        postArray.map((item) => {
          //console.log(item.post)
            if (item.image) {
              return (
                <TouchableOpacity style={styles.editContainer} onPress={() => secondPickImage(item)}>
                  <Image source={{uri: item.post}} style={{height: 170, width: 170}}/>
                </TouchableOpacity>
              )
            }
        }) : null}
      </SafeAreaView> : null
      }
      {picture ? 
      <View style={{justifyContent: 'flex-end', flex: 1, marginBottom: '22.5%', alignItems: 'flex-end', marginRight: '10%'}}>
        {postArray != undefined ? postArray.length > 0 ? 
        <NextButton text={"CONTINUE"} onPress={() => putKeys()}/> : null : null
        }
        
      </View> : 
      <>
      <View style={{marginTop: '5%'}}>
        <TextInput placeholder={initialText ? initialText.value : "What's Vibing?"} placeholderTextColor={'grey'} value={text} style={[styles.input, 
        {fontSize: actualTextSize, textAlign: 'left', color: theme.color, backgroundColor: theme.backgroundColor, borderColor: theme.color, fontFamily: 'Montserrat_500Medium'}]} 
              onChangeText={setText} multiline maxLength={300} blurOnSubmit onFocus={handleFocus} onBlur={handleBlur}/>
              <Text style={[styles.postLength, {color: theme.color}]}>{text.length}/300</Text>
      </View>
      {showSuggestions && (
        <FlatList
          data={suggestions}
          
          keyExtractor={(item, index) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSuggestionPress(item.userName)} style={{flexDirection: 'row', alignItems: 'center', marginLeft: 10, margin: 5}}>
              {item.pfp ? 
              <FastImage source={{uri: item.pfp}} style={{height: 40, width: 40, borderRadius: 25}}/> : 
              <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 25}}/>}
            <View>
            <Text style={styles.suggestionName}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.suggestion}>
              {item.userName}
            </Text>
          </View>
          </TouchableOpacity>
          )}
          style={styles.suggestionsList}
        />
      )}
      <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginHorizontal: '10%'}}>
        {/* <Menu 
            visible={sizeVisible}
            onDismiss={closeSizeMenu}
            contentStyle={{backgroundColor: theme.backgroundColor, borderColor: theme.color}}
            anchor={<MaterialCommunityIcons name='format-size' color={theme.color} size={30} onPress={openSizeMenu}/>}>
            <Menu.Item onPress={() => setActualTextSize(15.36)} title="Small" titleStyle={{color: theme.color}}/>
            <Divider />
            <Menu.Item onPress={() => setActualTextSize(19.20)} title="Medium" titleStyle={{color: theme.color}}/>
            <Divider />
            <Menu.Item onPress={() => setActualTextSize(24)} title="Large" titleStyle={{color: theme.color}}/>
          </Menu> */}
          {!picture ?
      <View style={{alignSelf: 'center', marginTop: '5%'}}>
        {textCount < 5 && text.length > 0 && initialText ? <View>
        <MainButton text={initialText ? "FINISH EDIT" : "ADD"} onPress={text.length > 0 ? initialText ? () => putKeys() : () => addToArray() : null} />
        </View> : null}
        
        <View style={{marginLeft: '5%'}}>
        
        {!initialText ? <NextButton text={"FINISH"} onPress={() => putKeys()}/> : null}
        </View>
      </View> : null}

      </View>
      </>
      }

      
      </View>
      </TouchableWithoutFeedback>
    </View>
    </Provider>
  )
}

export default MultiPost

const styles = StyleSheet.create({
    container: {
        flex : 1,
    },
    editText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_700Bold',
    padding: 10,
    alignSelf: 'center',
    //paddingBottom: 0,
    fontWeight: '700',
    color: "#005278"
  },
    postContainer: {
        borderWidth: 1,
        flex: 1,
        alignItems: 'center'
    },
    edit: {
    alignItems: 'center',
    marginTop: '5%'
  },
  input: {
    //marginTop: '5%',
    //height: 250,
    minHeight: 150,
    borderRadius: 5,
    borderWidth: 0.25,
    padding: 5,
    width: '95%',
    marginLeft: '2.5%',
  },
  postLength: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    paddingBottom: 10,
    paddingTop: 5,
    textAlign: 'right',
    marginRight: '5%'
  },
  editContainer: {
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginLeft: '1.5%',
    marginTop: '5%'
    //margin: '1%', 
    //marginLeft: 0
  },
  blank: {
    marginLeft: '3%'
  },
  suggestionsList: {
    borderWidth: 1,
    borderColor: 'gray',
    marginHorizontal: '2.5%',
    maxHeight: '55%'
  },
  suggestion: {
    padding: 10,
    paddingVertical: 2.5,
    fontFamily: 'Montserrat_500Medium',
    color: "#fafafa",
    fontSize: 15.36
  },
  suggestionName:
  {
    padding: 10,
    paddingVertical: 2.5,
    fontFamily: 'Montserrat_600SemiBold',
    color: "#fafafa",
    fontSize: 15.36
  }
})