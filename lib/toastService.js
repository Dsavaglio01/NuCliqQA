import Toast from 'react-native-toast-message';

const showToast = (title, message, imageUri = null) => {
  Toast.show({
    type: 'success', // 'success', 'error', 'info'
    text1: title,
    text2: message,
    props: {imageUri}
  });
};

export default showToast;
