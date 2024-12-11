import React, {useState, useRef} from "react";
import { View, Image,StyleSheet, Text, TouchableOpacity, Button, PanResponder, Pressable, Animated} from "react-native";
import NextButton from "../Components/NextButton";
import * as ImagePicker from 'expo-image-picker';
import MainButton from '../Components/MainButton';
import { useNavigation } from "@react-navigation/native";
import {captureRef,} from 'react-native-view-shot';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { auth } from "../firebase";

const AddStickers = ({route}) => {
    //const pan = useRef(new Animated.ValueXY()).current;
    const viewShotRef= useRef();
    const imageRef = useRef();

    const {source} = route.params;
    //console.log(source)
    const [editorVisible, setEditorVisible] = useState(false);
    const [imageData, setImageData] = useState(null)
    const navigation = useNavigation();
    const [stickers, setStickers] = useState([]);
    const [add, setAdd] = useState(false);
    const [edit, setEdit] = useState(false);
    const [currentSticker, setCurrentSticker] = useState(null);
    const pan = useRef(new Animated.ValueXY()).current;
    const {user} = useAuth()
    const panResponder = useRef(
        PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}]),
        onPanResponderRelease: () => {
            pan.extractOffset();
        },
        }),
    ).current;
    const pickImage = async() => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4,3],
            quality: 0.2
        })
        const sorce = {uri: result.assets[0].uri};
        setStickers(currentState => [...currentState, sorce])
        //navigation.navigate('DesignTheme', {source: source})
    };
    const saveImage = async () => {
       try {
        const localUri = await captureRef(imageRef, {
            height: 440,
            quality: 0.2,
        });
        navigation.navigate('SuccessTheme', {name: user.uid, post: localUri})
        } catch (e) {
        console.log(e);
    } 
    };
    /* const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
        {
          translateY: translateY.value,
        },
      ],
    };
  }); */
    /* const onDoubleTap = useAnimatedGestureHandler({
        onActive: () => {
        if (scaleImage.value) {
            scaleImage.value = scaleImage.value * 2;
        }
        },
    }); */
    /* const imageStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(scaleImage.value),
      height: withSpring(scaleImage.value),
    };
  }); */
    //console.log(imageData)
    //console.log(currentSticker)
    return (
      <GestureHandlerRootView style={styles.container}>
        <Text style={styles.headerText}>Place Stickers on the Image!</Text>
        <View style={styles.imageContainer}>
            <View>
                <ViewShot ref={imageRef} collapsable={false} options={{ fileName: "Your-File-Name", format: "jpg", quality: 0.9 }} style={{marginBottom: '-10%'}}>
                    <Image source={{uri: imageData != null ? imageData.uri : source}} style={{width: 320, height: 500, borderRadius: 18} }/>
                    {stickers.length > 0 ?
                    stickers.map((item) => {
                    //console.log(item)
                    return (
                        <Animated.View
                            style={{
                            transform: [{translateX: pan.x}, {translateY: pan.y}],
                            //marginBottom: '-10%'
                            }}
                            {...panResponder.panHandlers}>
                            <Image source={{uri: item.uri}} style={{height: 100, width: 100, borderRadius: 50, marginTop: '5%'}}/>
                        </Animated.View>
                                    
                    )
                }) : null}
                </ViewShot>
            </View>
        </View>   
        {stickers.length == 0 ? 
        <View style={{marginBottom: '7.5%'}}>
            <Text style={styles.noStickers}>No Stickers Selected Yet</Text>
        </View>  : null}
        {stickers.length > 0 && !add ? <View>
                <View style={[styles.buttonContainer, {marginBottom: '5%'}]}>
                    <NextButton text={stickers.length > 0 && !add ? "Add More Stickers" : null} onPress={() => setAdd(true)} textStyle={{fontSize: 15.36}}/>
                </View>
                <View style={styles.buttonContainer}>
                    <NextButton text={stickers.length > 0 && !add ? "Edit Sticker" : null} onPress={() => setEdit(true)} textStyle={{fontSize: 15.36}}/>
                </View>
            </View> : <View style={styles.buttonContainer}>
                <NextButton text={"Upload Stickers"} textStyle={{fontSize: 15.36}} onPress={() => pickImage()}/>
            </View> }
           
            
            
        
        {/* <ImageEditor
            visible={editorVisible}
            onCloseEditor={() => setEditorVisible(false)}
            imageUri={currentSticker != null ? currentSticker : null}
            fixedCropAspectRatio={16 / 9}
            //lockAspectRatio={aspectLock}
            minimumCropDimensions={{
            width: 100,
            height: 100,
            }}
            onEditingComplete={(result) => {
            setImageData(result);
            }}
            mode="full"
      /> */}
        <View style={{width: '75%', marginBottom: '15%'}}>
            <MainButton text={'Finish'} onPress={() => saveImage()}/>
        </View>
      </GestureHandlerRootView>
    );
  
}
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        //justifyContent: 'center',
        flex: 1
    },
    headerText: {
        padding: 15,
        fontSize: 19.20,
        fontWeight: '700',
        textAlign: 'center',
        paddingBottom: 20,
        marginTop: '5%'
    },
    buttonContainer: {
        marginBottom: '7.5%'
    },
    imageContainer: {
        flex:1, 
        marginBottom: '-10%'
        //paddingTop: '10%'
    },
    noStickers: {
        fontSize: 19.20,
        textAlign: 'center',
        fontWeight: '600'
    }
})
export default AddStickers;