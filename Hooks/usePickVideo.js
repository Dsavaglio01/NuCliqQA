import * as ImagePicker from 'expo-image-picker'
import { Alert } from 'react-native';
import { useState } from 'react';
import { Video as VideoCompress} from 'react-native-compressor';
import * as VideoThumbnails from 'expo-video-thumbnails';
export const usePickVideo = () => {
    const [videoLoading, setLoading] = useState(false);
    const [videoData, setData] = useState();
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
const pickVideo = async() => {
    if (mStatus !== false) {
      setLoading(true)
      await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
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
              addImageToArray(result, ite.type, index+1+videoData.length)
              
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
  return {videoData, videoLoading, pickVideo}
}