import { StyleSheet, Text, View, Modal, Animated, TouchableOpacity, Dimensions, FlatList, TextInput } from 'react-native'
import React, {useState, useRef, useEffect} from 'react'
import FastImage from 'react-native-fast-image'
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import getDateAndTime from '../../lib/getDateAndTime';
import NextButton from '../NextButton';
import { usePickImage } from '../../Hooks/usePickImage';
import { usePickVideo } from '../../Hooks/usePickVideo';
import { Divider } from 'react-native-paper';
import MainButton from '../MainButton';
import { useDownloadImage } from '../../Hooks/useDownloadImage';
const storyWidth = Dimensions.get('screen').width
const StoryModal = ({userStoryModal, closeStoryModal, storyItem, closeUserStoryModal, openUserStoryModal, user}) => {
    const storyRef = useRef(null);
    const handleClose = () => {
        if (userStoryModal) {
            closeUserStoryModal()
        }
        else {
            closeStoryModal()
        }
        
    }
    const handleSwitch = () => {
        closeStoryModal();
        openUserStoryModal();
    }
    const handleInputText = (text) => {
        setText(text); 
    };
    const [story, setStory] = useState([]);
    const [storyLoading, setStoryLoading] = useState(false);
    const {imageLoading, data, pickImage} = usePickImage();
    const {videoLoading, videoData, pickVideo} = usePickVideo();
    const [activeStoryIndex, setActiveStoryIndex] = useState(0);
    const [textOpen, setTextOpen] = useState(false);
    const [text, setText] = useState('');
    useEffect(() => {
      if (storyItem) {
        setStory(storyItem)
      }
    }, [storyItem])
    const renderStory = ({item, index}) => {
      return (
        <TouchableOpacity style={{ width: storyWidth, height: '100%', alignItems: 'center', justifyContent: 'center'}} onPress={handleScreenPress} activeOpacity={1}> 
      {item.post[0].image ? (
        <FastImage source={{ uri: item.content }} style={styles.image} resizeMode="cover" />
      ) : item.post[0].video ? (
        // Render video component here
        <View style={styles.videoPlaceholder}>
          <Text>Video Placeholder</Text>
        </View>
      ) : 
                  <Text style={styles.actualStoryText}>{item.post[0].value}</Text> }
    </TouchableOpacity>
      )
    }
    const handleScreenPress = (event) => {
    const { locationX } = event.nativeEvent;

    if (locationX < storyWidth / 2) {
      // Left side pressed
      handleItemChange('previous');
    } else {
      // Right side pressed
      handleItemChange('next');
    }
  };
    async function addToArray() {
        if (text.length > 0) {
          const response = await fetch(`http://10.0.0.225:4000/api/uploadStory`, {
            method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
            headers: {
                'Content-Type': 'application/json', // Set content type as needed
            },
            body: JSON.stringify({ data: {user: user.uid, background: background, forSale: forSale, post: [{id: 1, image: false, visible: false, value: text, text: true, textSize: 15.36, textColor: "#fafafa", textAlign: 'left', backgroundColor: '#121212'}]}}), // Send data as needed
            })
            const responseData = await response.json();
            if (responseData.done) {
                
            setStoryLoading(false)
            handleClose();
            }
        }
    }
    //console.log(user)
    //console.log(data)
    const {addImage, downloadLoading} = useDownloadImage({
        fileName: data.length > 0 ? `stories/${user.uid}story${Date.now()}${data[0].id}.jpg` : null,
        data: data,
        backendURL: "http://localhost:4000/api/uploadStory",
        dataForURL: data.length > 0 ? {user: user.uid, background: background, forSale: forSale, post: data[0]} : null
    })
    const handleItemChange = (direction) => {
        setActiveStoryIndex((prevIndex) => {
        let newIndex = prevIndex;
        if (direction === 'next' && prevIndex < story.length - 1) {
            newIndex = prevIndex + 1;
        } else if (direction === 'previous' && prevIndex > 0) {
            newIndex = prevIndex - 1;
        } else if (direction === 'next' && prevIndex === story.length - 1) {
            newIndex = 0;
        }

        // Smoothly scroll to the updated index
        storyRef.current.scrollToIndex({ index: newIndex, animated: true });
        return newIndex;
        });
    };
    const ProgressBar = ({ isActive, duration = 5000, onComplete }) => {
        const progress = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            if (isActive) {
            Animated.timing(progress, {
                toValue: 1,
                duration: duration, // duration in milliseconds (5 seconds)
                useNativeDriver: false,
            }).start(({ finished }) => {
                if (finished) {
                onComplete(); // Call onComplete when the animation finishes
                }
            });
            } else {
            progress.setValue(0); // reset progress for inactive bars
            }
        }, [isActive]);

        const widthInterpolation = progress.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
        });

        return (
            <View style={[styles.progressBarContainer, {width: (storyWidth / story.length) - (storyWidth * 0.025)}]}>
            <Animated.View style={[styles.progressBar, { width: widthInterpolation }]} />
            </View>
        );
    };
  return (
    !userStoryModal ? 
    <Modal visible={!userStoryModal} transparent animationType='slide' onRequestClose={() => handleClose()}>
          <View style={[styles.modalContainer, styles.overlay]}>
            <View style={styles.modalView}>
              <View style={{height: '90%'}}>
                <View style={styles.progressBarContainerContainer}>
                {story.map((e, index) => (
                  <ProgressBar key={index} isActive={index === activeStoryIndex} onComplete={() => handleItemChange('next')}/>
                  ))}
                </View>
              <View style={styles.headerContainer}>
                <FastImage source={pfp ? {uri: pfp } : require('../../assets/defaultpfp.jpg')} style={styles.pfp}/>
                <Text style={styles.usernameText}>{username}</Text>
                {story.map((e, index) => {
                  if (index == activeStoryIndex) {
                    return (
                      <Text style={styles.timestampText}>{getDateAndTime(e.timestamp)}</Text>
                    )
                  }
                })}
                <View style={styles.closeContainer}>
                  <MaterialCommunityIcons name='close' size={30} color={"#fafafa"} style={{alignSelf: 'center'}} onPress={() => handleClose()}/>
                </View>
              </View>
              <View style={{flex: 1}}>
                {story.length > 0 ?
                <FlatList 
                ref={storyRef}
                  data={story.reverse()}
                  horizontal
                  contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
                  renderItem={renderStory}
                  removeClippedSubviews={false}
                  keyExtractor={item => item.id.toString()}
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScrollToIndexFailed={(info) => {
                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                    wait.then(() => {
                      storyRef.current?.scrollToIndex({ index: info.index, animated: true });
                    });
                  }}
                /> :
                <View style={styles.noPostsContainer}>
                  <Text style={styles.noPostsText}>No Story Yet!</Text>
                </View>}
              </View>
              {story.length > 0 ? story[0].userId == user.uid ? 
              <View style={{marginHorizontal: '5%'}}>
                <NextButton text={"Add To Story →"} onPress={() => {handleSwitch()}}/>
              </View>
              : null : null}
              </View>
            </View>
          </View>
        </Modal> :
        <Modal visible={userStoryModal} transparent animationType='slide' onRequestClose={() => handleClose()}>
          <View style={[styles.modalContainer, styles.overlay]}>
            <View style={styles.modalView}>
              <View style={{height: '90%'}}>
                <TouchableOpacity onPress={() => {handleClose(); setTextOpen(false)}}>
                  <MaterialCommunityIcons name='close' size={30} style={styles.close} color={"#fafafa"}/>
                </TouchableOpacity>
                <View style={styles.toggleView}>
                    <View style={{flexDirection: 'row'}}>
                  <View style={styles.postingContainer}>
                  <TouchableOpacity style={styles.photoIconContainer} onPress={data.length > 0 ? null : () => {pickImage(); setTextOpen(false)}}>
                    <MaterialIcons name='photo-library' size={30} style={{alignSelf: 'center'}} color={'#005278'}/>
                    <View>
                      <Text style={styles.editPostText}>Select Image</Text>
                      <Text style={styles.postPostText}>Single Image</Text>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.videoPostingContainer}/>
                  <TouchableOpacity style={styles.videoIconContainer} onPress={data.length > 0 ? null : () => {pickVideo(); setTextOpen(false)}}>
                    <MaterialIcons name='video-library' size={30} style={{alignSelf: 'center'}} color={'#005278'}/>
                    <View>
                      <Text style={[styles.editPostText]}>Select Vid</Text>
                      <Text style={styles.postPostText}>up to 60 seconds</Text>
                    </View>
                  </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity style={styles.textContainer} onPress={data.length > 0 ? null : () => setTextOpen(true)}>
                  <MaterialCommunityIcons name='text-box-outline' size={35} style={{alignSelf: 'center'}} color={"#005278"}/>
                  <View>
                  <Text style={styles.editPostText}>What's vibing?</Text>
                    <Text style={styles.postPostText}>Post Text</Text>
                  </View>
                  
                </TouchableOpacity>
                
                </View>
            {textOpen ? 
            <View style={{flex: 1}}>
      <View style={styles.inputTextContainer}>
         <>
         <View style={{flexDirection: 'row'}}>
          <MaterialCommunityIcons name='chat-processing-outline' size={30} style={{alignSelf: 'center'}} color={"#9EDAFF"}/>
          <Text style={styles.editText}>Type your message below</Text>
        </View>
          
         </>
      </View>
      <Divider />
      <>
     <View style={{marginTop: '5%'}}>
        <TextInput placeholder={"What's Vibing?"} placeholderTextColor={'grey'} value={text} style={styles.input} 
              onChangeText={handleInputText} multiline maxLength={300} blurOnSubmit/>
              <Text style={styles.postLength}>{text.length}/300</Text>
      </View>
      <View style={styles.buttonContainer}>
      <View style={styles.storyButtonContainer}>
        {text.length > 0 ? <View style={styles.storyButton}>
        <MainButton text={"ADD TO STORY"} onPress={() => addToArray()} />
        </View> : null}
      </View>

      </View>
      </>

      
      </View>
  : data.length > 0 && !textOpen ? 
    data[0].image ? 
    <View style={{marginTop: '10%'}}>
      <TouchableOpacity activeOpacity={1}>
              <View style={styles.postingContainer}>
                <TouchableOpacity >
                  <FastImage source={{uri: data[0].post}} style={styles.storyImage}/>
                </TouchableOpacity>
              </View>
                </TouchableOpacity>
                <View style={styles.storyButton}>
        <MainButton text={"ADD TO STORY"} onPress={() => addImage()} />
        </View>
      </View> : data[0].video ?
      <View>
        <TouchableOpacity >
                  <View style={[styles.placeholderContainer, {height: 255 / data.length}]}>
                   <View style={styles.postingContainer}>
                <TouchableOpacity>
                 
                      <FastImage source={{uri: item.thumbnail}} style={{width:((255 / data.length) - 20) / 1.77777778,
              height: (255 / data.length) - 20,
              borderRadius: 8,}}/>
                </TouchableOpacity>
                
              </View>
   
                    
                  </View>
                </TouchableOpacity>
                <View style={styles.buttonContainer}>
      <View style={styles.storyButtonContainer}>
         <View>
        <MainButton text={"ADD TO STORY"} onPress={() => addVideoToStory()} />
        </View>
      </View>

      </View>
        </View> : null
    : null
  }


              </View>
               
            </View>
          </View>
        </Modal>
  )
}

export default StoryModal

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        marginTop: '10%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalView: {
    width: '100%',
    flexGrow: 1,
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 0,
    paddingTop: 5,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    progressBarContainerContainer: {
        flexDirection: 'row', 
        justifyContent: 'space-evenly'
    },
    headerContainer: {
        flexDirection: 'row', 
        borderBottomWidth: 1, 
        borderBottomColor: '#fafafa', 
        paddingBottom: 7.5
    },
    pfp: {
        height: 35, 
        width: 35, 
        borderRadius: 25, 
        marginLeft: '2.5%', 
        marginVertical: '2.5%'
    },
    usernameText: {
        fontFamily: 'Montserrat_400Light',
        textAlign: 'center', 
        fontSize: 15.36, 
        color: "#fafafa", 
        padding: 5, 
        paddingTop: 7.5, 
        paddingLeft: 10,
        marginVertical: '2.5%'
    },
    timestampText: {
        fontFamily: 'Montserrat_400Light',
        textAlign: 'center', 
        fontSize: 15.36, 
        color: "#fafafa", 
        padding: 5, 
        paddingTop: 7.5, 
        paddingLeft: 10,
        alignSelf: 'center'
    },
    closeContainer: {
        marginLeft: 'auto', 
        marginRight: 5, 
        marginVertical: '2.5%'
    },
    actualStoryText: {
        fontFamily: 'Montserrat_500Medium',
        fontSize: 19.20,
        color: "#fafafa",
        textAlign: 'left'
    },
    close: {
        marginLeft: 'auto', 
        marginRight: '5%'
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
    postingContainer: {
        alignItems: 'center', 
        flexDirection: 'row', 
        justifyContent: 'center'
    },
    photoIconContainer: {
        flexDirection: 'row',
        marginLeft: '5%'
    },
    editPostText: {
    fontSize: Dimensions.get('screen').height / 54.9,
    padding: 10,
    paddingBottom: 0,
    fontFamily: 'Montserrat_700Bold',
    color: "#005278"
  },
  postPostText: {
        fontSize: Dimensions.get('screen').height / 68.7,
        padding: 10,
        paddingTop: 0,
        color: "#005278",
        fontFamily: 'Montserrat_500Medium'
  },
  videoPostingContainer: {
    height: 35, 
    borderWidth: 0.5, 
    alignSelf: 'center', 
    borderColor: "grey"
  },
  videoIconContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginLeft: '4%'
  },
  textContainer: {
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: '-2.5%'
  },
  inputTextContainer: {
    flexDirection: 'row', 
    marginTop: '2.5%', 
    marginLeft: '5%', 
    marginRight: '5%', 
    justifyContent: 'space-between', 
    paddingBottom: 5
  },
  editText: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_700Bold',
    padding: 10,
    alignSelf: 'center',
    fontWeight: '700',
    color: "#9edaff"
  },
  input: {
    fontSize: 15.36,
    minHeight: 150,
    borderRadius: 5,
    borderWidth: 0.25,
    padding: 5,
    width: '95%',
    marginLeft: '2.5%',
    textAlign: 'left',
    color: "#fafafa",
    backgroundColor: "#121212",
    borderColor: "#fafafa", 
    fontFamily: 'Montserrat_500Medium'
  },
  postLength: {
    fontSize: 12.29,
    fontFamily: 'Montserrat_500Medium',
    paddingBottom: 10,
    paddingTop: 5,
    textAlign: 'right',
    color: "#fafafa",
    marginRight: '5%'
  },
  buttonContainer: {
    flexDirection: 'row', 
    display: 'flex', 
    justifyContent: 'flex-end', 
    marginHorizontal: '10%'
  },
  storyButtonContainer: {
    alignSelf: 'center', 
    marginTop: '2.5%'
  },
  storyImage: {
    height: Dimensions.get('screen').height / 2.75, 
    width: Dimensions.get('screen').width / 1.20,
    zIndex: 10,
    resizeMode: 'cover',
    alignSelf: 'center',
    borderRadius: 8
  },
  placeholderContainer: {
    width: '90%',
    marginLeft: '5%',
    marginRight: '5%',
    marginTop: '2.5%',
    marginBottom: '1.5%',
    borderRadius: 1,
    borderWidth: 1,
    borderStyle: 'none',
    backgroundColor: "#f5f5f5",
    paddingLeft: '2.5%',
    paddingRight: '2.5%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  storyButton: {
    marginTop: '10%',
    marginLeft: 'auto',
    marginRight: '7.5%'
  },
  noPostsText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 24,
    margin: '5%',
    color: "#fafafa"
  },
  noPostsContainer: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  }
})