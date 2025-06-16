import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ActivityIndicator, Alert} from 'react-native'
import React, { useRef, useState } from 'react'
import handleKeyPress from '../../lib/handleKeyPress';
import {FontAwesome} from "@expo/vector-icons";
import { useSinglePickImage } from '../../Hooks/useSinglePickImage';
import { schedulePushTextNotification } from '../../notificationFunctions';
import { sendMessage } from '../../firebaseUtils';
import uuid from 'react-native-uuid'
import useAuth from '../../Hooks/useAuth';
import { db } from '../../firebase';
import { updateDoc, doc } from 'firebase/firestore';
const ChatInput = ({newMessages, friendId, person, profile, active}) => {
    const [inputText, setInputText] = useState('');
    const {user} = useAuth();
    const [keyboardFocused, setKeyboardFocused] = useState(false);
    const [singleMessageLoading, setSingleMessageLoading] = useState(false);
    const {imageLoading, pickImage} = useSinglePickImage({messagePfp: true, firstName: profile.firstName, lastName: profile.lastName, person: person,
    friendId: friendId, name: `${uuid.v4()}${user.uid}${friendId}${Date.now()}message.jpg`});
    const inputRef = useRef(null);
    const sendChat = async() => {
        if (active && inputText.trim() !== '') {
            if (inputText.trim() === '') {
                return;
            }
            const newMessage = {
                text: inputText,
            };
            setSingleMessageLoading(true)
            inputRef.current.blur()
            sendMessage(friendId, newMessage, person, user, profile.firstName, profile.lastName)
            schedulePushTextNotification(person.id, friendId, profile.firstName, profile.lastName, newMessage, person.notificationToken)
            setInputText('');
            setSingleMessageLoading(false)
            setKeyboardFocused(false)
        }
        else if (!active && inputText.trim() !== 0) {
            Alert.alert('You must both be following each other first (mutual friends) in order to message!')
        }
    }
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
    style={newMessages.length == 0 ? styles.top : styles.bottom}>
        <View style={inputText.length > 0 ? [styles.input, {width: '75%'}] : styles.input}>
          <TextInput
            placeholder="Type message..."
            value={inputText}
            multiline
            onKeyPress={handleKeyPress}
            placeholderTextColor={"#fafafa"}
            onChangeText={async(text) => {
              const sanitizedText = text.replace(/\n/g, ''); // Remove all new line characters
              setInputText(sanitizedText); 
              if (text.length > 0) {
                await updateDoc(doc(db, 'profiles', user.uid), {
                    messageTyping: person.id
                })
            }
            else {
              await updateDoc(doc(db, 'profiles', user.uid), {
                messageTyping: ''
            })
            }
          }}
            style={keyboardFocused ? styles.keyboardFocused : styles.notFocused}
            ref={inputRef}
            maxLength={200}
            enablesReturnKeyAutomatically={true}
          />
          {inputText.length == 0 && !keyboardFocused && (profile.subscription || profile.subscription2) ? 
            <>
                <FontAwesome name='picture-o' color={"#fafafa"} size={25} style={{alignSelf: 'center'}} onPress={pickImage}/>
            </> 
          : null }
        
        </View>
        {!singleMessageLoading || !imageLoading ?
            inputText.length > 0 ? 
            <TouchableOpacity style={styles.sendButton} onPress={ () => sendChat()}>
                <Text allowFontScaling={false} style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity> : null : 
            <View style={styles.loading}>
                <ActivityIndicator color={"#9EDAFF"} style={{alignSelf: 'center'}}/>
            </View>
        }
    </KeyboardAvoidingView> 
  )
}

export default ChatInput

const styles = StyleSheet.create({
    top: {
        flexDirection: 'row', 
        marginTop: '5%'
    },
    bottom: {
        flexDirection: 'row', 
        marginBottom: '5%'
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: '2.5%',
        marginLeft: '3.75%',
        width: '92.5%',
        //marginRight: '2.5%',
        flexDirection: 'row'
    }, 
    keyboardFocused: {
        width: '100%', 
        color: "#fafafa", 
        padding: 5, 
        alignSelf: 'center'
    },
    notFocused: {
        width: '92.25%', 
        color: "#fafafa", 
        padding: 5, 
        alignSelf: 'center'
    },
    sendButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#005278',
        borderRadius: 8,
        marginBottom: '2.5%',
        justifyContent: 'center',
    },
    sendButtonText: {
        fontWeight: 'bold',
        color: "#fafafa"
    },
    loading: { 
        flex: 1, 
        alignItems: 'center', 
        marginTop: '2.5%'
    }
})