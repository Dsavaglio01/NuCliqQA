import AsyncStorage from "@react-native-async-storage/async-storage";
export const getComments = async (postId) => {
  const key = `comments_${postId}`
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}
export const saveComments = async (postId, comments) => {
  const key = `comments_${postId}`
  await AsyncStorage.setItem(key, JSON.stringify(comments));
}
export const getChatMessages = async (friendId) => {
  const chatKey = `chat_${friendId}`;
  try {
    const cachedMessages = await AsyncStorage.getItem(chatKey);
    return cachedMessages ? JSON.parse(cachedMessages) : [];
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }
};
export const saveChatMessages = async (friendId, messages) => {
  const chatKey = `chat_${friendId}`;
  try {
    await AsyncStorage.setItem(chatKey, JSON.stringify(messages));
  } catch (error) {
    console.error("Error saving chat messages:", error);
  }
};
export const getLastPersonalChatDocId = async (friendId) => {
  const key = `lastDocId_${friendId}`;
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error("Error fetching last document ID:", error);
    return null;
  }
};
export const saveLastPersonalChatDocId = async(friendId, docId) => {
    const chatKey = `lastDocId_${friendId}`;
  try {
    await AsyncStorage.setItem(chatKey, docId);
  } catch (error) {
    console.error("Error saving chat messages:", error);
  }
}
export const getCachedImages = async (userId, collection, subCollection, order) => {
    const key = `${collection}Themes_${subCollection}${order}${userId}`
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};
export const saveCachedImages = async (userId, collection, subCollection, order, images) => {
    const key = `${collection}Themes_${subCollection}${order}${userId}`
    await AsyncStorage.setItem(key, JSON.stringify(images));
};
export const getLastDocId = async (userId, collection, subCollection, order) => {
    const key = `${collection}ThemesLastId_${subCollection}${order}${userId}`
    return await AsyncStorage.getItem(key);
};
export const saveLastDocId = async (userId, collection, subCollection, order, docId) => {
    const key = `${collection}ThemesLastId_${subCollection}${order}${userId}`
    if (docId) await AsyncStorage.setItem(key, docId);
};
export const getPersonalPostId = async (userId, name) => {
  const key = `personalPostsLastId_${userId}`
  return await AsyncStorage.getItem(key);
};
export const savePersonalPostId = async (userId, name, personalPostId) => {
  const key = `personalPostsLastId_${userId}`
  if (personalPostId) await AsyncStorage.setItem(key, personalPostId);
}
export const getPersonalPosts = async(userId, name) => {
  const key = `personalPosts_${userId}`
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}
export const savePersonalPosts = async (userId, name, posts) => {
  const key = `personalPosts_${userId}`
  await AsyncStorage.setItem(key, JSON.stringify(posts));
}