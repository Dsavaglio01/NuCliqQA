import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator, Dimensions} from 'react-native'
import React,{useEffect, useState, useReducer, useRef, useContext} from 'react'
import {MaterialCommunityIcons, FontAwesome, Entypo, MaterialIcons} from '@expo/vector-icons'
import { Divider, Provider, Menu } from 'react-native-paper'
import MainButton from '../Components/MainButton'
import NextButton from '../Components/NextButton'
import * as ImagePicker from 'expo-image-picker';
import RadioButtonGroup, { RadioButtonItem } from "expo-radio-button"
import { useNavigation } from '@react-navigation/native'
import NewPostHeader from '../Components/NewPostHeader'
import DraggableFlatlist, {ScaleDecorator} from 'react-native-draggable-flatlist'
import FastImage from 'react-native-fast-image'
import { ImageEditor } from 'expo-image-crop-editor'
import { Camera } from 'expo-camera'
import ThemeHeader from '../Components/ThemeHeader'
import { Video, ResizeMode } from 'expo-av';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Video as VideoCompress, Image, getVideoMetaData } from 'react-native-compressor';
import { useFonts, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import * as Permissions from 'expo-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system'
import themeContext from '../lib/themeContext'
import useAuth from '../Hooks/useAuth'
import { db } from '../firebase'
import { getDoc,doc } from 'firebase/firestore'

const NewPost = ({route}) => {
    const {group, groupId, firstTime, groupName, groupPfp, postArray, admin, username, actualGroup} = route.params;
    //console.log(postArray)
    //console.log(group)
    //console.log(groupId)const c
    const {user} = useAuth();
    const navigation = useNavigation();
    const [cameraPermission, setCameraPermission] = useState(null);
    const [galleryPermission, setGalleryPermission] = useState(null);
    const [current, setCurrent] = useState('Single Post')
    const [isFirstTime, setIsFirstTime] = useState(false);
      const [blockedUsers, setBlockedUsers] = useState([]);
    const [data, setData] = useState([])
    const theme = useContext(themeContext)
    const [visible, setVisible] = useState(false);
    const [value, setValue] = useState('public');
    const [image, setImage] = useState(null);
    const [editorVisible, setEditorVisible] = useState(false);
    const [editedImage, setEditedImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageData, setImageData] = useState(null)
    const [imageCount, setImageCount] = useState(0);
    const [imageModal, setImageModal] = useState(false);
    const [imagePostModal, setImagePostModal] = useState(false);
    const [desiredImage, setDesiredImage] = useState(null);
    const [editModal, setEditModal] = useState(false)
    const [videoStatus, setVideoStatus] = useState([]);
    const [cStatus, setCameraStatus] = useState(null);
    const [mStatus, setMediaStatus] = useState(null);
    const video = useRef(null)
    const openMenu = (obj) => {
      //console.log(obj)
      const newArray = data.map((obj) => ({ ...obj }));
      //console.log(newArray)
    // Find the index of the item you want to modify (e.g., item with id 2)
    const index = newArray.findIndex(item => item.id === obj.id);
    //console.log(index)
    if (index !== -1) {
      // Update the value of the specific object
      newArray[index].visible = true;
      //console.log(newArray)
      // Update the state with the modified array
      setData(newArray);
    }
  }
  useEffect(() => {
    const getPermissions = async() => {
      const { status: existingMediaStatus } = await ImagePicker.getMediaLibraryPermissionsAsync()
      let finalMediaStatus = existingMediaStatus;
      //console.log(finalMediaStatus)
      //console.log(existingCameraStatus)
      if (existingMediaStatus !== 'granted') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        finalMediaStatus = status;
      }
      if (finalMediaStatus !== 'granted') {
        setMediaStatus(false)
      }
      }
    getPermissions()
  }, [])
  function skipWalkthrough() {
    const check = async() => {
      await AsyncStorage.setItem('isFirstTime', 'false');
      setIsFirstTime(false)
    }
    check()
  }
  useEffect(() => {
      if (route.params?.firstTime) {
        setIsFirstTime(false)
      }
    }, [route.params?.firstTime])
  useEffect(() => {
    const getData = async() => {
      const isFirstTimeValue = await AsyncStorage.getItem('isFirstTime');
      if (isFirstTimeValue === null) {
        setIsFirstTime(true)
      }
      else {
        setIsFirstTime(false)
      }
    }
    getData();
    
  }, [])
  const takeVideo = async() => {
      if (cStatus !== false) {
        setLoading(true)
        await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          //allowsMultipleSelection: true,
          videoMaxDuration: 59,
         //allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        }).then(image => {
          if (image) {
            if (!image.canceled) {
              image.assets.map(async(ite, index) => {
              const result = await VideoCompress.compress(
                ite.uri,
                {},
              );
              //console.log(result)
              addImageToArray(result, ite.type, index+1+data.length)
                      
            })
            }
            else {
            setLoading(false)
          }
          }
          
        }) 
      }
      else {
        Alert.alert("No Camera Permissions", "To take a video, allow camera permissions in your phone's settings", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])
      
      }
      
    }
  const takePhoto = async() => {

      if (cStatus !== false) {
        setLoading(true)
        await ImagePicker.launchCameraAsync({
          
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          allowsEditing: false,
          aspect: [4, 3],
          quality: 0.8,
        })
        .then(async(image) => {
          if (!image.canceled) {
              image.assets.map(async(ite, index) => {
              const result = await Image.compress(
                ite.uri,
                {},
              );
              //console.log(result)
              addImageToArray(result, ite.type, index+1+data.length)
                      
            })
            }
            else {
              setLoading(false)
            }
        })
      }
      else {
        Alert.alert("No Camera Permissions", "To take a photo, allow camera permissions in your phone's settings", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])
      
      }
      
    }

  
  const closeMenu = (obj) => {
    const newArray = [...data];
    
    // Find the index of the item you want to modify (e.g., item with id 2)
    const index = newArray.findIndex(item => item === obj);
    if (index !== -1) {
      // Update the value of the specific object
      newArray[index].visible = false;

      // Update the state with the modified array
      setData(newArray);
    }
  }

  useEffect(() => {
    if (route.params?.postArray) {
      //console.log('first')
      setData(route.params?.postArray)
      
    }
    //console.log(route.params?.postArray)
  }, [route.params?.postArray])
  async function addImageToArray(item, type, index) {
      if (type == 'video') {
        try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(
        item,
      );
       setData([{id: index, image: false, video: true, thumbnail: uri, post: item, visible: false}])
       setTimeout(() => {
        setLoading(false)
       }, 1000);
    } catch (e) {
      console.warn(e);
    }
      }
      else {
         setData(prevState => [...prevState, {id: index, image: true, video: false, thumbnail: null, post: item, visible: false}])
         setTimeout(() => {
            setLoading(false)
          }, 1000);
      }
     
      setImageModal(false)
    }

  const replaceImage = async(e) => {
    
    if (!mStatus != false) {
    await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: false,
          aspect: [4, 3],
          allowsEditing: true,
          quality: 0.8,
        }).then(async(image) => {
          if (!image.canceled) {
              image.assets.map(async(ite, index) => {
              const result = await Image.compress(
                ite.uri,
                {},
              );
              //console.log(result)
             const updatedItems = data.map(item => (item.post === e.post ? {id: item.id, image: true, post: result, visible: item.visible} : item));
            //image.assets[0].uri
            setData(updatedItems)
                      
            })
            }
        }) 
      }
  }
  const pickVideo = async() => {
    if (mStatus !== false) {
      setLoading(true)
      await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          //allowsMultipleSelection: true,
          aspect: [4, 3],
          allowsEditing: true,
          videoMaxDuration: 60,
          quality: 0.8,
        }).then(image => {
          if (image) {
            //console.log(image)
            if (!image.canceled) {
              image.assets.map(async(ite, index) => {
              const result = await VideoCompress.compress(
                ite.uri,
                {},
              );
              addImageToArray(result, ite.type, index+1+data.length)
              
            })
            }
            else {
            setLoading(false)
          }
          }
          
        })  
    }
    else {
        Alert.alert("No Media Permissions", "To select a video, allow media permissions in your phone's settings", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])
      
      }

    
  }
  const getFileSize = async (uri) => {
  const { uri: fileUri, exists, size } = await FileSystem.getInfoAsync(uri);
   console.log(size)
};
useEffect(() => {
        async function fetchData() {
            setBlockedUsers((await getDoc(doc(db, 'profiles', user.uid))).data().blockedUsers)
        }
        fetchData()
  }, [])
  const pickImage = async(e) => {
    //console.log(e)
    if (mStatus !== false) {
      setLoading(true)
      await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          allowsMultipleSelection: false,
          aspect: [4, 3],
          quality: 0.8,
        }).then((image) => {
          if (!image.canceled) {
              image.assets.map(async(ite, index) => {
              const result = await Image.compress(ite.uri, {
                compressionMethod: "auto",
                quality: 0.8
              })
              addImageToArray(result, ite.type, index+1+data.length)
                      
            })
            }
            else {
              setLoading(false)
            }
        }) 
    }
    else {
        Alert.alert("No Media Permissions", "To select photos, allow media permissions in your phone's settings", [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ])
      
      }
      
    };
    //console.log(video.current)
  const deleteData = (obj) => {
    const updatedItems = data.filter(item => item != obj)
    updatedItems.map((item) => {
      item.id = item.id - 1
    })
    setData(updatedItems)
  }
  const handleValueCallback = (dataToSend) => {
    setValue(dataToSend)
    //console.log('first')
    //console.log(dataToSend)
  }
  const goToCaption = () => {
    const updatedData = data.map((item, index) => {
      return { ...item, id: `${index + 1}` }; // Assign new IDs based on index
    });
    navigation.navigate('Caption', {groupName: groupName, groupPfp: actualGroup ? actualGroup.banner : null, userName: username, actualGroup: actualGroup, blockedUsers: blockedUsers, admin: admin, postArray: updatedData, group: group, groupId: groupId, value: value, edit: false})
  }
  //console.log(data)
  
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  //console.log(data.filter((item) => item.image == true).length < 5)
  //console.log(group)
  //console.log(postArray)
  
  return (
    <Provider>
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
       <Modal visible={isFirstTime} transparent animationType='slide' onRequestClose={() => {setIsFirstTime(!isFirstTime); }}>
          <View style={[styles.modalContainer, styles.overlay, {alignItems: 'center', justifyContent: 'center'}]}>
            <View style={[styles.modalView, {height: 245, width: '90%', borderRadius: 20, backgroundColor: theme.backgroundColor}]}>
                <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', marginRight: '2.5%', marginVertical: 5}} onPress={() => {skipWalkthrough()}}>
                  <Text style={{fontFamily: 'Montserrat_400Regular', fontSize: 15.36, color: theme.color}}>Skip</Text>
              </TouchableOpacity>
              <Text style={{fontFamily: 'Montserrat_700Bold', fontSize: 19.20, marginRight: '5%', marginLeft: '-5%', paddingBottom: 10, paddingTop: 0, color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}}>Posts</Text>
              <Divider style={{borderWidth: 0.5, width: '100%', marginRight: '5%', marginLeft: '-5%', borderColor: theme.color}}/>
              <Text style={{fontFamily: 'Montserrat_500Medium', fontSize: 15.36, paddingVertical: 10, marginRight: '5%', marginLeft: '-5%', color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}}>Welcome, this is the Posting page of NuCliq where you can post multiple images, a single video, or a single text post, and post to your friends or within a Cliq that you're in!</Text>
              <View style={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', marginRight: '5%'}}>
              {/* <View style={{ marginTop: '2.5%'}}>
                 <MainButton text={"BACK"} onPress={() => {setIsFirstTime(true); navigation.navigate('Cliqs', {screen: 'GroupScreen', params: {post: null, firstTime: true}})}}/>
              </View> */}             
              <View style={{marginLeft: '2.5%', marginTop: '2.5%'}}>
                <NextButton text={"NEXT"} onPress={() => {setIsFirstTime(false); navigation.navigate('Vidz', {screen: 'Vidz'})}}/>
              </View>
            </View>
            </View>
          </View>
        </Modal>
      <ThemeHeader text={group ? `${groupName} Post` : 'New Post'} video={false} backButton={group ? true: false} />
      <Divider borderBottomWidth={0.85} borderBottomColor={theme.color}/>
      <View style={styles.main}>

        <NewPostHeader group={group} groupPfp={actualGroup ? actualGroup.banner : null} groupName={groupName} actualGroup={actualGroup} admin={admin} username={username} chooseValueFunction={handleValueCallback} data={data} groupId={groupId}/>
        <Modal visible={imagePostModal} animationType="slide" transparent onRequestClose={() => {setImagePostModal(false); }}>
            <View style={[styles.modalContainer, styles.overlay]}>
                <View style={desiredImage != null ? desiredImage.image == false && desiredImage.video == true ? [styles.modalView, {height: '70%', paddingLeft: 0}] : [styles.modalView, {height: '45%', paddingLeft: 0}] : null}>
                  <MaterialCommunityIcons name='close' size={30} color={theme.backgroundColor}  style={{textAlign: 'right', paddingRight: 10, paddingBottom: 10}} onPress={desiredImage != null ? () => {setImagePostModal(false)} : null}/>
                  <View style={{alignItems: 'center', justifyContent: 'center'}}>
                    {desiredImage != null ? desiredImage.image == false && desiredImage.video == true ?
                    <Video
                      ref={video}
                      style={{height: Dimensions.get('screen').height / 1.65, width: Dimensions.get('screen').width / 1.35, borderRadius: 8}}
                      source={{
                        uri: desiredImage.post,
                      }}
                      useNativeControls
                      volume={1.0}
                      shouldPlay={true}
                      isLooping
                      onPlaybackStatusUpdate={status => setVideoStatus(() => status)}
                    /> :
                    <FastImage source={{uri: desiredImage.post}} style={{height: Dimensions.get('screen').height / 2.81, width: Dimensions.get('screen').height / 2.81, borderRadius: 8}} /> : null}
                  </View>
                </View>
            </View> 
        </Modal>
        <View style={styles.toggleView}>
          <View style={{flexDirection: 'row'}}>
         <View style={{alignItems: 'center', flexDirection: 'row', justifyContent: 'center'}}>
         <TouchableOpacity style={{flexDirection: 'row', marginLeft: '5%'}} onPress={(data.filter((item) => item.image == true).length < 5 && data.filter((item) => item.image == false).length < 1)
         ? () => pickImage() : (data.filter((item) => item.image == true).length > 4 || data.filter((item) => item.image == false).length > 0) ? () => Alert.alert('Max Posts Reached', 'Please remove at least one post (Max of 5 Image Posts)', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]) : data.filter((item) => item.image == true).length > 5 ? () => Alert.alert('Max Posts Reached', 'Please remove an image (Only 5 per post)', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]) : null}>
          <MaterialIcons name='photo-library' size={30} style={{alignSelf: 'center'}} color={'#005278'}/>
          <View>
            <Text style={styles.editPostText}>Select Images</Text>
            <Text style={styles.postPostText}>up to {5 - (data.filter((item) => item.image == true)).length} images</Text>
          </View>
        </TouchableOpacity>
        <View style={{height: 35, borderWidth: 0.5, alignSelf: 'center', borderColor: "grey"}}/>
        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: '4%'}} onPress={(data.filter((item) => item.image == true).length < 1 && data.filter((item) => item.image == false).length < 1)
         ? () => pickVideo() : (data.filter((item) => item.image == true).length > 0 || data.filter((item) => item.image == false).length > 0) ? () => Alert.alert('Max Posts Reached', 'Please remove previous post(s)', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]) : data.filter((item) => item.image == true).length > 5 ? () => Alert.alert('Max Posts Reached', 'Please remove an image (Only 5 per post)', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]) : null}>
          <MaterialIcons name='video-library' size={30} style={{alignSelf: 'center'}} color={'#005278'}/>
          <View>
            <Text style={[styles.editPostText]}>Select Vid</Text>
            <Text style={styles.postPostText}>up to 60 seconds</Text>
          </View>
        </TouchableOpacity>
         </View>
      </View>
      <TouchableOpacity style={{alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: '-2.5%'}} onPress={(data.filter((item) => item.image == true).length < 1 && data.filter((item) => item.image == false).length < 1)
         ? () => navigation.navigate('MultiPost', {group: group, actualGroup: actualGroup, textSize: 15.36, groupName: groupName, groupId: groupId, }) : (data.filter((item) => item.image == true).length > 0 || data.filter((item) => item.image == false).length > 0) ? () => Alert.alert('Max Posts Reached', 'Please remove previous post(s) (Text must be standalone)', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]) : data.filter((item) => item.image == true).length > 5 ? () => Alert.alert('Max Posts Reached', 'Please remove an image (Only 5 per post)', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]) : null}>
        <MaterialCommunityIcons name='text-box-outline' size={35} style={{alignSelf: 'center'}} color={"#005278"}/>
        <View>
         <Text style={styles.editPostText}>What's vibing?</Text>
          <Text style={styles.postPostText}>Post Text</Text>
        </View>
        
      </TouchableOpacity>
      
      </View>
       
        <Text style={[styles.editText, {color: theme.color}]}>Hold, drag and drop to change order of your posts</Text>
        <Text style={[styles.editText, {marginTop: 0, color: theme.color}]}>To edit/adjust your post, press the three dots</Text>
        {loading ? 
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}> 
          <ActivityIndicator size={'large'} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
          </View> : postArray != undefined && !loading ? 
        <DraggableFlatlist 
          data={data}
          scrollEnabled={false}
          onDragEnd={({ data }) => setData(data)}
          keyExtractor={(item) => item.id}
          containerStyle={{flex: 1}}
          
          //}}
          //ListFooterComponent={() => <View style={{paddingBottom: 400}}/>}
          renderItem={({ item, drag, isActive }) => {
            if (item.image == true) {
              return ( 
                <ScaleDecorator>
                <TouchableOpacity activeOpacity={1} onLongPress={drag} disabled={isActive}>
                <View style={[styles.placeholderContainer, {borderStyle: 'none', borderRadius: 1, height: Dimensions.get('screen').height / 4 / data.length}]}>
              <View style={{justifyContent: 'center', flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => {setImagePostModal(true); setDesiredImage(item)}}>
                
                  <FastImage source={{uri: item.post}} style={{width: (Dimensions.get('screen').height / 4 / data.length -20) * 1.01625, height: (Dimensions.get('screen').height / 4) / data.length - 20}}/>
                </TouchableOpacity>
                <Text style={[styles.placeholderText, {color: theme.backgroundColor}]}>Post #{data.indexOf(item) + 1}</Text>
              </View>
              <View style={{alignSelf: 'center'}}>
              <Menu visible={item.visible}
                  onDismiss={() => closeMenu(item)}
                  contentStyle={{backgroundColor: theme.backgroundColor, alignSelf: 'center', marginBottom: '10%', borderWidth: 1, borderColor: "#71797E"}}
                  anchor={<Entypo name='dots-three-vertical' size={Dimensions.get('screen').height / 37.5} color={theme.backgroundColor} onPress={() => openMenu(item)}/>}>
              {/* <Menu.Item title="Edit" titleStyle={{color: "#000"}} onPress={() => {setEditorVisible(true); setEditedImage(item)}}/>
              <Menu.Item title="Replace" titleStyle={{color: "#000"}} onPress={item.image ? () => replaceImage(item) : null}/> */}
              {/* <Menu.Item title='Filters' titleStyle={{color: theme.color}} onPress={() => navigation.navigate('FilterPost', {post: item.post})}/> */}
             {/*  <Menu.Item title="Edit" titleStyle={{color: theme.color}} onPress={() => navigation.navigate('EditImage', {imageData: item.post})}/> */}
              <Menu.Item title="Replace" titleStyle={{color: theme.color}} onPress={() => replaceImage(item)}/>
              <Menu.Item title="Delete" titleStyle={{color: theme.color}} onPress={() => deleteData(item)}/>

              </Menu>
              </View>
             
            </View>
                </TouchableOpacity>
              
              </ScaleDecorator>
              )
              
              
            }
          else if (item.video == true) {
            //console.log(item)
            return (
              <ScaleDecorator>
                <TouchableOpacity onLongPress={drag} disabled={isActive}>
                  <View style={[styles.placeholderContainer, {borderStyle: 'none', borderRadius: 1, height: 255 / data.length}]}>
                   <View style={{justifyContent: 'center', flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => {setImagePostModal(true); setDesiredImage(item)}}>
                 
                      <FastImage source={{uri: item.thumbnail}} style={{width:((255 / data.length) - 20) / 1.77777778,
              height: (255 / data.length) - 20,
              borderRadius: 8,}}/>
                </TouchableOpacity>
                <Text style={[styles.placeholderText, {color: theme.backgroundColor}]}>Post #{data.indexOf(item) + 1}</Text>
              </View>
                    <View style={{alignSelf: 'center'}}>
                      <Menu visible={item.visible}
                        onDismiss={() => closeMenu(item)}
                        contentStyle={{backgroundColor: theme.backgroundColor, alignSelf: 'center', borderWidth: 1, borderColor: "#71797E"}}
                        anchor={<Entypo name='dots-three-vertical' size={22.5} color={theme.backgroundColor} onPress={() => openMenu(item)}/>}>
                    <Menu.Item title="Replace" titleStyle={{color: theme.color}} onPress={() => pickVideo()}/>
                    <Menu.Item title="Delete" titleStyle={{color: theme.color}} onPress={() => deleteData(item)}/>

                    </Menu>
                    </View>
                    
                  </View>
                </TouchableOpacity>
              </ScaleDecorator>
            )
              
          }
          else {
            return (
              <ScaleDecorator>
                <TouchableOpacity activeOpacity={1} onLongPress={drag} disabled={isActive}>
                <View style={[styles.placeholderContainer, {borderStyle: 'none'}]}>
              <View style={{width: '90%'}}>
                {data.filter((e) => e.text == true).map((ite) => {
                  return (
                    <Text style={[styles.placeholderText, {fontSize: item.textSize, color: theme.backgroundColor}]}>{ite.value}</Text>
                  )
                })}
              </View>
              <View style={{alignSelf: 'center'}}>
              <Menu visible={item.visible}
                  onDismiss={() => closeMenu(item)}
                  contentStyle={{backgroundColor: theme.backgroundColor, alignSelf: 'center', marginBottom: '10%', borderWidth: 1, borderColor: "#71797E"}}
                  anchor={<Entypo name='dots-three-vertical' size={22.5} color={theme.backgroundColor} onPress={() => openMenu(item)}/>}>
              <Menu.Item title="Edit" titleStyle={{color: theme.color}} onPress={() => navigation.navigate('MultiPost', {initialText: data[0], textSize: data[0].textSize, group: group, groupName: groupName, actualGroup: actualGroup, groupId: groupId, picture: false})}/>
              <Menu.Item title="Delete" titleStyle={{color: theme.color}} onPress={() => deleteData(item)}/>

              </Menu>
              </View>
             
            </View>
                </TouchableOpacity>
              
              </ScaleDecorator>
            )
          }
          
          }}
        />
         : null}
         {data.length > 0 ?<View style={{justifyContent: 'flex-end', alignItems: 'flex-end', marginHorizontal: '5%', marginVertical: '2.5%'}}>
          <NextButton text={"NEXT"} onPress={goToCaption} textStyle={{fontSize: 9,}}/>
         </View> : null}
         
         {data.length < 3 ? 
         <>
        </>
        : null }
          
             
      <ImageEditor
                      visible={editorVisible}
                      
                      onCloseEditor={() => {setEditorVisible(false)}}
                      imageUri={imageData != null ? imageData.uri : editedImage.post}
                      fixedCropAspectRatio={16 / 9}
                      //lockAspectRatio={aspectLock}
                      minimumCropDimensions={{
                      width: 100,
                      height: 100,
                      }}
                      onEditingComplete={(result) => {
                      setImageData(result);
                        const updatedArray = data.map((item) => {
                          if (item.id === editedImage.id) {
                            return { ...item, post: result.uri };
                          }
                          return item;
                        })
                        setData(updatedArray)
                      }}
                      mode='full'
                />
      </View>
      
      
      
    </View>
    
    </Provider>
  )
}

export default NewPost

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    main: {
      flex: 1
      //marginTop: '5%'
    },
    toggleView: {
      borderWidth: 2,
      width: '90%',
      marginLeft: '5%',
      marginRight: '5%',
      borderRadius: 10,
      height: Dimensions.get('screen').height / 8,
      marginTop: '5%',
      borderColor: '#005278',
      //flexDirection: 'row',
      //justifyContent: 'space-between',
      backgroundColor: "#f5f5f5"
    },
    secondaryToggleView: {
      flexDirection: 'column'
    },
    toggleOption: {
      flexDirection: 'row',
      marginLeft: '5%',
      marginRight: '5%'
    },
  edit: {
    alignItems: 'center',
    marginTop: '5%'
  },
  editPostText: {
    fontSize: Dimensions.get('screen').height / 54.9,
    padding: 10,
    paddingBottom: 0,
    fontFamily: 'Montserrat_700Bold',
    color: "#005278"
  },
  editText: {
    fontSize: Dimensions.get('screen').height / 68.7,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    paddingTop: 0,
    marginTop: '5%',
    color: "#005278",
    textAlign: 'center'
  },
  postText: {
    fontSize: Dimensions.get('screen').height / 54.9,
    fontFamily: 'Montserrat_600SemiBold',
    margin: '5%'
    //paddingTop: 0
  },
  toggleText: {
    fontSize: Dimensions.get('screen').height / 68.7,
   fontFamily: 'Montserrat_500Medium',
    padding: 10,
    alignSelf: 'center',
    color: "#005278"
  },
  icon: {
    alignSelf: 'center'
  },
  postSupplementaryText: {
    fontSize: Dimensions.get('screen').height / 54.9,
    fontFamily: 'Montserrat_500Medium',
    padding: 10,
    paddingTop: 0,
    width: '75%'
  },
  remainingText: {
    fontSize: Dimensions.get('screen').height / 68.7,
    padding: 5,
    marginLeft: '5%',
    marginRight: '5%',
    fontFamily: 'Montserrat_500Medium'
  },
  placeholderContainer: {
    //borderWidth: 2,
      width: '90%',
      marginLeft: '5%',
      marginRight: '5%',
      marginTop: '2.5%',
      marginBottom: '1.5%',
      borderRadius: 5,
      borderWidth: 1,
      borderStyle: 'dashed',
      
      backgroundColor: "#f5f5f5",
      //justifyContent: 'center',
      paddingLeft: '2.5%',
      paddingRight: '2.5%',
      flexDirection: 'row',
      justifyContent: 'space-between'
      //borderColor: '#005278',
  },
  placeholderText: {
    fontSize: Dimensions.get('screen').height / 54.9,
    padding: 10,
    fontFamily: 'Montserrat_600SemiBold'
  },
  modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        //marginTop: 22
    },
  modalView: {
    width: '90%',
    height: '15%',
    //margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    paddingRight: 0,
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
  postPostText: {
        fontSize: Dimensions.get('screen').height / 68.7,
        padding: 10,
        paddingTop: 0,
        color: "#005278",
        fontFamily: 'Montserrat_500Medium'
  },
  optionText: {
    fontSize: Dimensions.get('screen').height / 54.9,
    padding: 2.5,
    fontFamily: 'Montserrat_500Medium'
  },
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
})