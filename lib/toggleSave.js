function toggleSave(saved, e, newMessages, setNewMessages) {
    if (saved) {
        const updatedArray = newMessages.map(item => {
        if (item.id === e.id) {
            // Update the "isActive" property from false to true
            return { ...item, saveModal: true };
        }
        return item;
        });
        setNewMessages(updatedArray)
    }
    else {
        const updatedArray = newMessages.map(item => {
        if (item.id === e.id) {
            // Update the "isActive" property from false to true
            return { ...item, saveModal: false };
        }
        return item;
        });
        setNewMessages(updatedArray)
    }
   
  }
export default toggleSave
