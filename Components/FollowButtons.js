import React, {useEffect, useMemo, useState} from 'react'
import { getRequests, getProfileDetails } from '../firebaseUtils';
import { TouchableOpacity } from 'react-native';
import RequestedIcon from './RequestedIcon';
import FollowIcon from './FollowIcon';
import FollowingIcon from './FollowingIcon';
import {BACKEND_URL} from '@env';
import generateId from '../lib/generateId';
import { schedulePushFriendNotification, schedulePushRequestFriendNotification } from '../notificationFunctions';
function FollowButtons({user, item, ogUsername, smallKeywords, largeKeywords, username, style}) {
    const [following, setFollowing] = useState([]);
    const [requests, setRequests] = useState([]);
    async function addFriend(item) {
        const updatedObject = { ...item };

        // Update the array in the copied object
        updatedObject.loading = true
        const objectIndex = actualData.findIndex(obj => obj.id === item.id);
        if (objectIndex !== -1) {
            // Create a new array with the replaced object
            const updatedData = [...actualData];
            updatedData[objectIndex] = updatedObject;
            // Set the new array as the state
            setActualData(updatedData);
        }
        let newFriend = generateId(item.userId, user.uid)
        try {
            const response = await fetch(`${BACKEND_URL}/api/addFriend`, {
                method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
                headers: {
                    'Content-Type': 'application/json', // Set content type as needed
                },
                body: JSON.stringify({ data: {item: item, newFriend: newFriend, user: user.uid, username: ogUsername, 
                    smallKeywords: smallKeywords, largeKeywords: largeKeywords}}), // Send data as needed
            })
            const data = await response.json();
            if (data.request) {
                const updatedObject = { ...item };

                // Update the array in the copied object
                updatedObject.loading = false
                const objectIndex = actualData.findIndex(obj => obj.id === item.id);
                if (objectIndex !== -1) {
                    // Create a new array with the replaced object
                    const updatedData = [...actualData];
                    updatedData[objectIndex] = updatedObject;
                    // Set the new array as the state
                    setActualData(updatedData);
                }
                schedulePushRequestFriendNotification(item.userId, username, item.notificationToken)
            }
            else if (data.friend) {
                const updatedObject = { ...item };

                // Update the array in the copied object
                updatedObject.loading = false
                const objectIndex = actualData.findIndex(obj => obj.id === item.id);
                if (objectIndex !== -1) {
                    // Create a new array with the replaced object
                    const updatedData = [...actualData];
                    updatedData[objectIndex] = updatedObject;
                    // Set the new array as the state
                    setActualData(updatedData);
                }
                schedulePushFriendNotification(item.userId, username, item.notificationToken)
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    useEffect(() => {
        if (user.uid) {
        const fetchProfileData = async () => {
        const profileData = await getProfileDetails(user.uid);

        if (profileData) {
            setFollowing(profileData.following);
        }
        };

        fetchProfileData();
    }
    }, []);
  useMemo(() => {
       let unsubscribe;

        if (user.uid) {
        // Call the utility function with the userId and a callback
            unsubscribe = getRequests(user.uid, (data) => {
                setRequests(data); // Update the state with the fetched data
            });
        }

        // Clean up the listener on component unmount
        return () => {
            if (unsubscribe) {
                return unsubscribe
            }
        };
    }, [user.uid])
    
  return (
    <TouchableOpacity style={style} onPress={user.uid != null ? following.filter(e => e === item.userId).length > 0 ? () => removeFriend(item.userId) 
        : item.userId == user.uid || requests.filter(e => e.id === item.userId).length > 0 ? null : () => addFriend(item): null}>
        {requests.filter(e => e.id === item.userId).length > 0 ? <RequestedIcon color={"#9EDAFF"} width={65} height={32} /> : 
        following.filter(e => e === item.userId).length > 0 ? <FollowingIcon color={"#9EDAFF"} width={70} height={32} />
        : item.userId == user.uid ? null : <FollowIcon color={"#9EDAFF"}  width={50} height={32}/>}
    </TouchableOpacity>
  )
}

export default FollowButtons