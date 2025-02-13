


function toggleCopy(copied, e, newMessages, setNewMessages) {
    if (copied) {
        const updatedArray = newMessages.map(item => {
            if (item.id === e.id) {
            // Update the "isActive" property from false to true
            return { ...item, copyModal: true, saveModal: false};
            }
            return item;
        });
        setNewMessages(updatedArray) 
    }
    else {
        const updatedArray = newMessages.map(item => {
        if (item.id === e.id) {
            // Update the "isActive" property from false to true
            return { ...item, copyModal: false, saveModal: false };
        }
        return item;
        });
        setNewMessages(updatedArray)
    }

  }
export default toggleCopy;