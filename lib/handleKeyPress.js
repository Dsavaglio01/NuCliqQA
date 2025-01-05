const handleKeyPress = ({ nativeEvent }) => {
  if (nativeEvent.key === 'Enter') {
    // Prevent user from manually inserting new lines
    return;
  }
};
export default handleKeyPress