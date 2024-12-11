import * as ImagePicker from 'expo-image-picker'
import { Alert } from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useState } from 'react';
import {Image} from 'react-native-compressor';
export const usePickImage = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
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

    }
    const pickImage = async () => {
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
             // setData(result, ite.type,)
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
    }
    return {data, loading, pickImage}
      
    };