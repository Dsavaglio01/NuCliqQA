import React, {useState, useEffect, useMemo} from 'react'
import useAuth from '../Hooks/useAuth';
import ProfileComponent from '../Components/ProfileComponent';
import { ableToMessageFunction, fetchFriendId, fetchPerson } from '../firebaseUtils';
const ViewingProfile = ({route}) => {
  const {name, preview, previewImage, previewMade}= route.params;
  const [ableToMessage, setAbleToMessage] = useState([]);
  const [friendId, setFriendId] = useState(null);
  const [person, setPerson] = useState(null);
  const {user} = useAuth()
  useMemo(() => {
    if (route.param?.name) {
      const getPerson = async() => {
        const person = await fetchPerson(name)
        setPerson(person)
      }
      getPerson();
    }
  }, [route.params])
  useEffect(() => {
    const getFriendId = async() => {
        const friendId = await fetchFriendId(user.uid, name)
        setFriendId(friendId)
      }
      getFriendId();
  }, [])
  useEffect(() => {
    let unsubscribe;
    if (user?.uid) {
      // Call the utility function and pass state setters as callbacks
      unsubscribe = ableToMessageFunction(user, name, setAbleToMessage);
    }
    // Clean up the listener when the component unmounts
    return () => {
      if (unsubscribe) {
        return unsubscribe;
      }
    };
  }, [])
  return (
    <ProfileComponent preview={preview} previewMade={previewMade} previewImage={previewImage} name={name} person={person} 
     ableToMessage={ableToMessage} friendId={friendId} viewing={true}/>
  )
      
}

export default ViewingProfile