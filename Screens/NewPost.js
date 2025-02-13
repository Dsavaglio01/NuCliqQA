import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, Dimensions} from 'react-native'
import React,{useEffect, useState, useContext} from 'react'
import {MaterialCommunityIcons, Entypo, MaterialIcons} from '@expo/vector-icons'
import { Divider, Provider, Menu } from 'react-native-paper'
import NextButton from '../Components/NextButton'
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native'
import NewPostHeader from '../Components/NewPostHeader'
import DraggableFlatlist, {ScaleDecorator} from 'react-native-draggable-flatlist'
import FastImage from 'react-native-fast-image'
import ThemeHeader from '../Components/ThemeHeader'
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Video as VideoCompress, Image,} from 'react-native-compressor';
import AsyncStorage from '@react-native-async-storage/async-storage'
import themeContext from '../lib/themeContext'
import useAuth from '../Hooks/useAuth'
import FirstTimeModal from '../Components/FirstTimeModal'
import FullImage from '../Components/Posts/FullImage'
import ProfileContext from '../lib/profileContext'

const NewPost = ({route}) => {
    const {group, groupId, groupName, postArray, admin, username, actualGroup} = route.params;
    const navigation = useNavigation();
    const [isFirstTime, setIsFirstTime] = useState(false);
    const [data, setData] = useState([])
    const theme = useContext(themeContext)
    const [value, setValue] = useState('public');
    const [loading, setLoading] = useState(false);
    const [imagePostModal, setImagePostModal] = useState(false);
    const [desiredImage, setDesiredImage] = useState(null);
    const [mStatus, setMediaStatus] = useState(null);
    const profile = useContext(ProfileContext);
    const openMenu = (obj) => {
      const newArray = data.map((obj) => ({ ...obj }));
      // Find the index of the item you want to modify (e.g., item with id 2)
      const index = newArray.findIndex(item => item.id === obj.id);
      if (index !== -1) {
        // Update the value of the specific object
        newArray[index].visible = true;
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
      setData(route.params?.postArray)
      
    }
  }, [route.params?.postArray])
  async function addImageToArray(item, type, index) {
      if (type == 'video') {
        try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(
        item,
      );
      console.log(uri)
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
  }
  const goToCaption = () => {
    const updatedData = data.map((item, index) => {
      return { ...item, id: `${index + 1}` }; // Assign new IDs based on index
    });
    navigation.navigate('Caption', {groupName: groupName, groupPfp: actualGroup ? actualGroup.banner : null, userName: username, actualGroup: actualGroup, blockedUsers: profile.blockedUsers, admin: admin, postArray: updatedData, group: group, groupId: groupId, value: value, edit: false})
  }
  
  return (
    <Provider>
      <View style={styles.container}>
        <FirstTimeModal isFirstTime={isFirstTime}/>
        <ThemeHeader text={group ? `${groupName} Post` : 'New Post'} video={false} backButton={group ? true: false} />
        <Divider borderBottomWidth={0.85} borderBottomColor={theme.color}/>
        <FullImage imagePostModal={imagePostModal} closeImagePostModal={() => setImagePostModal(false)} desiredImage={desiredImage}/>
        <View style={{flex: 1}}>
          <NewPostHeader group={group} groupPfp={actualGroup ? actualGroup.banner : null} groupName={groupName} actualGroup={actualGroup} admin={admin} username={username} chooseValueFunction={handleValueCallback} data={data} groupId={groupId}/>
          <View style={styles.toggleView}>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.main}>
                <TouchableOpacity style={styles.button} onPress={(data.filter((item) => item.image == true).length < 5 && data.filter((item) => item.image == false).length < 1)
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
                <View style={styles.line}/>
                <TouchableOpacity style={styles.videoButton} onPress={(data.filter((item) => item.image == true).length < 1 && data.filter((item) => item.image == false).length < 1)
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
                    <Text style={styles.editPostText}>Select Vid</Text>
                    <Text style={styles.postPostText}>up to 60 seconds</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.textButton} onPress={(data.filter((item) => item.image == true).length < 1 && data.filter((item) => item.image == false).length < 1)
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
          <Text style={styles.editText}>Hold, drag and drop to change order of your posts</Text>
          <Text style={[styles.editText, {marginTop: 0}]}>To edit/adjust your post, press the three dots</Text>
          {loading ? 
            <View style={styles.loading}> 
              <ActivityIndicator size={'large'} color={"#9EDAFF"}/>
            </View> : postArray != undefined && !loading ? 
            <DraggableFlatlist 
              data={data}
              scrollEnabled={false}
              onDragEnd={({ data }) => setData(data)}
              keyExtractor={(item) => item.id}
              containerStyle={{flex: 1}}
              renderItem={({ item, drag, isActive }) => {
                if (item.image == true) {
                  return ( 
                    <ScaleDecorator>
                      <TouchableOpacity activeOpacity={1} onLongPress={drag} disabled={isActive}>
                        <View style={[styles.placeholderContainer, {borderRadius: 1, height: Dimensions.get('screen').height / 4 / data.length}]}>
                          <View style={styles.main}>
                            <TouchableOpacity onPress={() => {setImagePostModal(true); setDesiredImage(item)}}>
                              <FastImage source={{uri: item.post}} style={{width: (Dimensions.get('screen').height / 4 / data.length -20) * 1.01625, 
                                height: (Dimensions.get('screen').height / 4) / data.length - 20}}/>
                            </TouchableOpacity>
                            <Text style={styles.placeholderText}>Post #{data.indexOf(item) + 1}</Text>
                          </View>
                          <View style={{alignSelf: 'center'}}>
                            <Menu visible={item.visible}
                              onDismiss={() => closeMenu(item)}
                              contentStyle={styles.menu}
                              anchor={<Entypo name='dots-three-vertical' size={Dimensions.get('screen').height / 37.5} color={theme.backgroundColor} onPress={() => openMenu(item)}/>}>
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
                return (
                  <ScaleDecorator>
                    <TouchableOpacity onLongPress={drag} disabled={isActive}>
                      <View style={[styles.placeholderContainer, {borderRadius: 1, height: 255 / data.length}]}>
                        <View style={styles.main}>
                          <TouchableOpacity onPress={() => {setImagePostModal(true); setDesiredImage(item)}}>
                            <FastImage source={{uri: item.thumbnail}} style={{width:((255 / data.length) - 20) / 1.77777778,
                              height: (255 / data.length) - 20,
                              borderRadius: 8}}/>
                          </TouchableOpacity>
                          <Text style={styles.placeholderText}>Post #{data.indexOf(item) + 1}</Text>
                        </View>
                        <View style={{alignSelf: 'center'}}>
                          <Menu visible={item.visible}
                            onDismiss={() => closeMenu(item)}
                            contentStyle={styles.menu}
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
                      <View style={styles.placeholderContainer}>
                        <View style={{width: '90%'}}>
                          {data.filter((e) => e.text == true).map((ite) => {
                            return (
                              <Text style={styles.placeholderText}>{ite.value}</Text>
                            )
                          })}
                        </View>
                        <View style={{alignSelf: 'center'}}>
                          <Menu visible={item.visible}
                            onDismiss={() => closeMenu(item)}
                            contentStyle={styles.menu}
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
          {data.length > 0 ?
            <View style={styles.next}>
              <NextButton text={"NEXT"} onPress={goToCaption} textStyle={{fontSize: 9,}}/>
            </View> 
          : null}
        </View>
      </View>
    </Provider>
  )
}

export default NewPost

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212"
  },
  main: {
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent: 'center'
  },
  button: {
    flexDirection: 'row', 
    marginLeft: '5%'
  },
  line: {
    height: 35, 
    borderWidth: 0.5, 
    alignSelf: 'center', 
    borderColor: "grey"
  },
  videoButton: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginLeft: '4%'
  },
  textButton: {
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: '-2.5%'
  },
  loading: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  next: {
    justifyContent: 'flex-end', 
    alignItems: 'flex-end', 
    marginHorizontal: '5%', 
    marginVertical: '2.5%'
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
    backgroundColor: "#f5f5f5"
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
    color: "#fafafa",
    textAlign: 'center'
  },
  placeholderContainer: {
    width: '90%',
    marginLeft: '5%',
    marginRight: '5%',
    marginTop: '2.5%',
    marginBottom: '1.5%',
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: 'none',
    backgroundColor: "#f5f5f5",
    paddingLeft: '2.5%',
    paddingRight: '2.5%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  placeholderText: {
    fontSize: Dimensions.get('screen').height / 54.9,
    color: "#121212",
    padding: 10,
    fontFamily: 'Montserrat_600SemiBold'
  },
  postPostText: {
    fontSize: Dimensions.get('screen').height / 68.7,
    padding: 10,
    paddingTop: 0,
    color: "#005278",
    fontFamily: 'Montserrat_500Medium'
  },
  menu: {
    backgroundColor: "#121212", 
    alignSelf: 'center', 
    marginBottom: '10%', 
    borderWidth: 1, 
    borderColor: "#71797E"
  }
})