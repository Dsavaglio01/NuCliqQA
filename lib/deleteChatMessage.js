async function deleteMessage(item, newMessages, friendId, setNewMessages, setLastMessageId) {
      const newMessage = newMessages[newMessages.indexOf(item.id) + 2]
      if (newMessage) {
        if (item.message.image) {
            try {
    const response = await fetch(`http://10.0.0.225:4000/api/deleteImageMessageNewMessage`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, image: item.message.image, friendId: friendId, newMessageId: newMessage.id, newMessageTimestamp: newMessage.timestamp}}), // Send data as needed
    })
    const data = await response.json();
    //console.log(data)
      if (data.done) {
        setNewMessages(newMessages.filter((e) => e.id != item.id))
        setLastMessageId(newMessage.id)
      }
    } catch (e) {
      console.error(e);
      
    }
        }
        else {
          console.log(item)
          try {
    const response = await fetch(`http://10.0.0.225:4000/api/deleteMessageNewMessage`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {itemId: item.id, itemUser: item.user, itemToUser: item.toUser, 
        friendId: friendId, newMessageId: newMessage.id, newMessageTimestamp: newMessage.timestamp}}), // Send data as needed
    })
    const data = await response.json();
    //console.log(data)
      if (data.done) {
        setNewMessages(newMessages.filter((e) => e.id != item.id))
        setLastMessageId(newMessage.id)
      }
    } catch (e) {
      console.error(e);
      
    }
        }
        
      }
      else {
        if (item.message.image) {
          console.log(item)
          try {
    const response = await fetch(`http://10.0.0.225:4000/api/deleteImageMessage`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {item: item, image: item.message.image, friendId: friendId, newMessage: newMessage}}), // Send data as needed
    })
    const data = await response.json();
    //console.log(data)
      if (data.done) {
          setNewMessages(newMessages.filter((e) => e.id != item.id))
      }
    } catch 
    (e) {
      console.error(e);
      
    }
        }
        else {
          try {
            
    const response = await fetch(`http://10.0.0.225:4000/api/deleteMessage`, {
      method: 'POST', // Use appropriate HTTP method (GET, POST, etc.)
      headers: {
        'Content-Type': 'application/json', // Set content type as needed
      },
      body: JSON.stringify({ data: {itemId: item.id, itemUser: item.user, itemToUser: item.toUser, 
         friendId: friendId, newMessage: newMessage}}), // Send data as needed
    })
    const data = await response.json();
    //console.log(data)
      if (data.done) {
          setNewMessages(newMessages.filter((e) => e.id != item.id))
      }
    } catch 
    (e) {
      console.error(e);
      
    }
        }
        
      }

  }
export default deleteMessage