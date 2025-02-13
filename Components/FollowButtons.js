import React, {useContext} from 'react'
import { TouchableOpacity, Alert } from 'react-native';
import RequestedIcon from './RequestedIcon';
import FollowIcon from './FollowIcon';
import FollowingIcon from './FollowingIcon';
import {BACKEND_URL} from '@env';
import generateId from '../lib/generateId';
import { schedulePushFriendNotification, schedulePushRequestFriendNotification } from '../notificationFunctions';
import RequestContext from '../lib/requestContext';
import ProfileContext from '../lib/profileContext';
import RealProfileContext from '../lib/realProfileContext';
function FollowButtons({user, item, style, actualData, updateActualData, preview, viewing, friendId}) {
    const requests = useContext(RequestContext);
    const profile = useContext(ProfileContext);
    const realProfile = useContext(RealProfileContext)
    /* const fetchNotifications = async() => {
            const tempList = await fetchFirstNotifications(user.uid, false, null)
            setNotifications(tempList)
          }
          fetchNotifications(); */
    function actualDataFunction (updatedObject, item) {
        //console.log(item)
        const objectIndex = actualData.findIndex(obj => obj.id === item.id);
        if (objectIndex !== -1) {
            // Create a new array with the replaced object
            const updatedData = [...actualData];
            updatedData[objectIndex] = updatedObject;
            // Set the new array as the state
            updateActualData(updatedData);
        }
    }
    async function addFriend(item) {
        const updatedObject = { ...item };
        // Update the array in the copied object
        updatedObject.loading = true
        actualDataFunction(updatedObject, item)
        let newFriend;
        if (viewing) {
            newFriend = generateId(item.id, user.uid)
        }
        else {
            newFriend = generateId(item.userId, user.uid)
        }
        try {
            const response = await fetch(`http://10.0.0.225:4000/api/addFriend`, {
                method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                },
                body: JSON.stringify({ data: {item: item, newFriend: newFriend, user: user.uid, username: profile.userName, 
                    smallKeywords: profile.smallKeywords, largeKeywords: profile.largeKeywords}}), // Send data as needed
            })
            const data = await response.json();
            if (data.request) {
                const updatedObject = { ...item };

                // Update the array in the copied object
                updatedObject.loading = false
                actualDataFunction(updatedObject, item)
                schedulePushRequestFriendNotification(item.userId, profile.userName, item.notificationToken)
            }
            else if (data.friend) {
                const updatedObject = { ...item };

                // Update the array in the copied object
                
                updatedObject.loading = false
                actualDataFunction(updatedObject, item)
                schedulePushFriendNotification(item.userId, profile.userName, item.notificationToken)
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    async function removeFriend(item, friendId) {
        console.log(friendId)
        const updatedObject = { ...item };
        // Update the array in the copied object
        updatedObject.loading = true
        const objectIndex = actualData.findIndex(obj => obj.id === item.id);
        if (objectIndex !== -1) {
        // Create a new array with the replaced object
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        updateActualData(updatedData);
        }
        let newFriend = generateId(friendId, user.uid)
        Alert.alert('Are you sure you want to unfollow?', 
            'If you unfollow, you will be unable to message them and they will be unable to message you.', [
                {
                    text: 'Cancel',
                    onPress: () => {
                        const updatedObject = { ...item };
                        // Update the array in the copied object
                        updatedObject.loading = false
                        const objectIndex = actualData.findIndex(obj => obj.id === item.id);
                        if (objectIndex !== -1) {
                        // Create a new array with the replaced object
                        const updatedData = [...actualData];
                        updatedData[objectIndex] = updatedObject;
                        // Set the new array as the state
                        updateActualData(updatedData);
                    }},
                    style: 'cancel',
                    },
                    {text: 'OK', onPress: async() => {
                    try {
        const response = await fetch(`http://10.0.0.225:4000/api/removeFriend`, {
        method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
        headers: {
            'Content-Type': 'application/json', // Set content type as needed
        },
        body: JSON.stringify({ data: {newFriend: newFriend, user: user.uid, friendId: friendId}}), // Send data as needed
        })
        const data = await response.json();
        if (data.done) {
        const updatedObject = { ...item };

        // Update the array in the copied object
        updatedObject.loading = false
        const objectIndex = actualData.findIndex(obj => obj.id === item.id);
        if (objectIndex !== -1) {
        // Create a new array with the replaced object
        const updatedData = [...actualData];
        updatedData[objectIndex] = updatedObject;
        // Set the new array as the state
        updateActualData(updatedData);
        }
        }
    } catch (error) {
        console.error('Error:', error);
    }},
    }]);
    }
    
  return (
    <TouchableOpacity style={style} onPress={viewing ? preview ? null : user.uid != null ? realProfile.following.filter(e => e === item.id).length > 0 ? () => removeFriend(item.id, friendId) 
        : item.id == user.uid || requests.filter(e => e.id === item.id).length > 0 ? null : () => addFriend(item) : null :
        user.uid != null ? realProfile.following.filter(e => e === item.userId).length > 0 ? () => removeFriend(item.userId, friendId) 
        : item.userId == user.uid || requests.filter(e => e.id === item.userId).length > 0 ? null : () => addFriend(item): null}>
        {viewing ? requests.filter(e => e.id === item.id).length > 0 ? <RequestedIcon color={"#9EDAFF"} width={65} height={32} /> : 
        realProfile.following.filter(e => e === item.id).length > 0 ? <FollowingIcon color={"#9EDAFF"} width={70} height={32} />
        : item.id == user.uid ? null : <FollowIcon color={"#9EDAFF"}  width={50} height={32}/> 
        : requests.filter(e => e.id === item.userId).length > 0 ? <RequestedIcon color={"#9EDAFF"} width={65} height={32} /> : 
        realProfile.following.filter(e => e === item.userId).length > 0 ? <FollowingIcon color={"#9EDAFF"} width={70} height={32} />
        : item.userId == user.uid ? null : <FollowIcon color={"#9EDAFF"}  width={50} height={32}/>}
    </TouchableOpacity>
  )
}

export default FollowButtons