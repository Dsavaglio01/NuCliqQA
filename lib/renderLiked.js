import { schedulePushLikedMessageNotification } from "../notificationFunctions";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
const renderLiked = async(actualId, friendId, user, newMessages, setNewMessages) => {
    if (actualId.liked == true) {
        await updateDoc(doc(db, 'friends', friendId, 'chats', actualId.id), {
        liked: false
        }).then(() => {
        const updatedArray = newMessages.map((item) => 
        item.id === actualId.id ? { ...item, liked: !actualId.liked } : item
        );
        setNewMessages(updatedArray);
        })
    }
    else {
        await updateDoc(doc(db, 'friends', friendId, 'chats', actualId.id), {
        liked: true
        }).then(() => {
        const updatedArray = newMessages.map((item) => 
        item.id === actualId.id ? { ...item, liked: !actualId.liked } : item
        );
        setNewMessages(updatedArray);

        }).then(actualId.user != user.uid ? () => schedulePushLikedMessageNotification(person.id, profile.firstName, profile.lastName, person.notificationToken) : null)
    
    }
  }
export default renderLiked;