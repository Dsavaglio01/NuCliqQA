import React, {useState, useContext} from "react";
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native";
//import { ImageEditor } from "expo-image-crop-editor";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../Hooks/useAuth";
import ThemeHeader from "../Components/ThemeHeader";
import { Divider } from "react-native-paper";
import PreviewFooter from "../Components/PreviewFooter";
import FastImage from "react-native-fast-image";
import themeContext from "../lib/themeContext";
const DesignTheme = ({route}) => {
  const theme = useContext(themeContext)
    const {source, edit, themeId, selling, themeName, keywords, searchKeywords, price, groupId} = route.params;
    const [editorVisible, setEditorVisible] = useState(false);
    const [imageData, setImageData] = useState(null)
    const {user} = useAuth()
    const navigation = useNavigation();
    async function finishEditing() {
      navigation.navigate('SuccessTheme', {edit: true, groupId: groupId, themeId: themeId, actualPrice: price, selling: selling, name: user.uid, post: imageData != null ? imageData.uri : source, actualThemeName: themeName, actualKeywords: keywords, searchKeywords: searchKeywords})
    }
    return (
      <View style={styles.container}>
        <ThemeHeader text={edit ? "Edit Theme" : "Create Theme"} video={false} backButton={true}/>
        <Divider borderWidth={0.4} style={{borderColor: theme.color}}/>
        <View style={styles.header}>
          <View style={styles.main}>
            <View style={styles.themeContainer}>
              <FastImage source={{uri: imageData != null ? imageData.uri : source}} style={styles.theme}/>
            </View>
            <View style={styles.overlay}>
              <TouchableOpacity style={styles.previewButton} onPress={() => navigation.navigate('ViewingProfile', {previewImage: imageData != null ? imageData.uri : source, preview: true, name: user.uid, viewing: true})}>
                <Text style={styles.previewText}>Preview w/ Profile Page</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.previewButton} onPress={() => navigation.navigate('HomeScreenPreview', {source: imageData != null ? imageData.uri : source, name: user.uid})}>
                <Text style={styles.previewText}>Preview w/ Posts</Text>
              </TouchableOpacity>
            </View>
            {/* <ImageEditor
              visible={editorVisible}
              onCloseEditor={() => setEditorVisible(false)}
              imageUri={imageData != null ? imageData.uri : source}
              fixedCropAspectRatio={16 / 9}
              minimumCropDimensions={{
              width: 100,
              height: 100,
              }}
              onEditingComplete={(result) => {
              setImageData(result);
              }}
              mode="full"
            /> */}
          </View>
          <PreviewFooter containerStyle={styles.previewFooter} text={"CONTINUE"} onPressCancel={() => navigation.navigate('All', {name: null})} 
          onPress={!edit ? () => navigation.navigate('SuccessTheme', {name: user.uid, post: imageData != null ? imageData.uri : source}) : () => finishEditing()}/>
        </View>
      </View>
    );
  
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#121212"
    },
    header: {
      marginTop: '5%', 
      marginLeft: '5%',
      marginRight: '5%'
    },
    main: {
      alignItems: 'center', 
      justifyContent: 'center'
    },
    themeContainer: {
      borderWidth: 1, 
      padding: 5, 
      borderColor: "#fafafa"
    },
    theme: {
      width: 320, 
      height: Dimensions.get('screen').height / 1.68
    },
    overlay: {
      position: 'absolute',
      //backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the background color and opacity of the overlay
      width: '80%', // Adjust the overlay width as needed
      height: '50%', // Adjust the overlay height as needed
      borderRadius: 10, // Optional: Add border radius to the overlay
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewButton: {
      marginBottom: 10,
      borderRadius: 8,
      width: '90%',
      alignItems: 'center',
      backgroundColor: "#121212"
    },
    previewText: {
      fontSize: 15.36,
      fontWeight: '700',
      padding: 15,
      color: "#9edaff"
    },
    previewFooter: {
      backgroundColor: "#121212", 
      marginTop: '15%'
    }
})
export default DesignTheme;