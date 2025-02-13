import { useContext } from 'react';
import { db } from './firebase';
import { getDoc, doc, collection, where, onSnapshot, setDoc, getDocs, startAfter, arrayUnion, serverTimestamp, updateDoc, 
arrayRemove, increment, orderBy, limit, startAt, endAt, query, or, documentId, deleteDoc, addDoc, getCountFromServer,
writeBatch} from 'firebase/firestore';
export const addCommentLike = async(item, user, setComments, comments, username, focusedItem) => {
  const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.likedBy = [...item.likedBy, user.uid];
      const objectIndex = comments.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...comments];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setComments(updatedData);
    }
    if (username != focusedItem.username) {
      try {
      //schedulePushCommentLikeNotification(item.user, username, item.notificationToken, item.comment)
      await updateDoc(doc(db, 'posts', focusedItem.id, 'comments', item.id), {
      likedBy: arrayUnion(user.uid)
    })
      await addDoc(collection(db, 'profiles', item.user, 'notifications'), {
                                  like: false,
                                  comment: true,
                                  likedComment: true,
                                  friend: false,
                                  item: item.comment,
                                  request: false,
                                  acceptRequest: false,
                                  postId: focusedItem.id,
                                  theme: false,
                                  report: false,
                                  requestUser: user.uid,
                                  requestNotificationToken: item.notificationToken,
                                  likedBy: item.username,
                                  timestamp: serverTimestamp()
    })
    
    }
    catch (error) {
      console.error(error)
    }
    }
    else {
      try {
        await updateDoc(doc(db, 'posts', focusedItem.id, 'comments', item.id), {
      likedBy: arrayUnion(user.uid)
    })
  } catch (error) {
      console.error(error)
    }
    }
}
export const removeCommentLike = async(item, user, setComments, comments, focusedItem) => {
  const updatedObject = { ...item };

    // Update the array in the copied object
    updatedObject.likedBy = item.likedBy.filter((e) => e != user.uid)
      const objectIndex = comments.findIndex(obj => obj.id === item.id);
    if (objectIndex !== -1) {
      // Create a new array with the replaced object
      const updatedData = [...comments];
      updatedData[objectIndex] = updatedObject;
      // Set the new array as the state
      setComments(updatedData);
    }
    try {
        await updateDoc(doc(db, 'posts', focusedItem.id, 'comments', item.id), {
      likedBy: arrayRemove(user.uid)
    })
  }
  catch (error) {
    console.error(error)
  }
}
export const deleteReplyFunction = async (item, reply, focusedItem, comments, setComments, tempPosts, setTempPosts) => {
  if (!item || !reply || !focusedItem) {
    throw new Error("Error: Missing required parameters.");
  }

  try {
    // Remove reply from the specific comment in Firebase
    await updateDoc(doc(db, 'posts', focusedItem.id, 'comments', item.id), {
      replies: arrayRemove(reply)
    });

    // Decrement the comment count in the main post document
    await updateDoc(doc(db, 'posts', focusedItem.id), {
      comments: increment(-1)
    });

    // Update the `comments` state locally
    const updatedCommentObject = { ...item };
    updatedCommentObject.actualReplies = item.actualReplies.filter((e) => e !== reply);
    const commentIndex = comments.findIndex((obj) => obj.id === item.id);
    if (commentIndex !== -1) {
      const updatedComments = [...comments];
      updatedComments[commentIndex] = updatedCommentObject;
      setComments(updatedComments);
    }

    // Update the `tempPosts` state locally
    const updatedFocusedObject = { ...focusedItem };
    updatedFocusedObject.comments = updatedFocusedObject.comments - 1;
    const postIndex = tempPosts.findIndex((obj) => obj.id === focusedItem.id);
    if (postIndex !== -1) {
      const updatedPosts = [...tempPosts];
      updatedPosts[postIndex] = updatedFocusedObject;
      setTempPosts(updatedPosts);
    }
  } catch (error) {
    console.error("Error deleting reply:", error);
  }
};
export const fetchComments = async(focusedPost, blockedUsers, collectionName) => {
    //console.log(blockedUsers)
    let fetchedCount = 0;
    const comments = [];
    const q = query(collection(db, collectionName, focusedPost.id, 'comments'), orderBy('timestamp', 'desc'), limit(10))
    const querySnapshot = await getDocs(q);
    //console.log(querySnapshot.docs.length)
    querySnapshot.forEach((doc) => {
        if (!blockedUsers.includes(doc.data().userId)) {
            comments.push({id: doc.id, loading: false, showReply: false, ...doc.data()})
        }
        else {
            fetchedCount++;
        }
    });
    if (fetchedCount === 10 && comments.length === 0) {
        const nextQuery = query(
        collection(db, collectionName, focusedPost.id, 'comments'),
        orderBy('timestamp', 'desc'),
        startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
        limit(10)
        );
        const nextSnapshot = await getDocs(nextQuery);
        nextSnapshot.forEach((doc) => {
            comments.push({id: doc.id, loading: false, showReply: false, ...doc.data()})
        })
    }
    return { comments, lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] };
}
export const fetchMoreComments = async(focusedPost, lastCommentVisible, blockedUsers, collectionName) => {
    const newComments = [];
    let fetchedCount = 0;
    const q = query(collection(db, collectionName, focusedPost.id, 'comments'), orderBy('timestamp', 'desc'), startAfter(lastCommentVisible), limit(10));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        if (!blockedUsers.includes(doc.data().userId)) {
            newComments.push({
            id: doc.id,
            showReply: false,
            loading: false,
            ...doc.data()
            })
        }
        else {
            fetchedCount++;
        }
        
    });
    if (fetchedCount === 10 && newComments.length === 0) {
        // All 3 posts were blocked, fetch more
        const nextQuery = query(
        collection(db, collectionName, focusedPost.id, 'comments'),
        orderBy('timestamp', 'desc'),
        startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
        limit(10)
        );
        const nextSnapshot = await getDocs(nextQuery);
        nextSnapshot.forEach((doc) => {
        newComments.push({
            id: doc.id,
            showReply: false,
            loading: false,
            ...doc.data()
            })
        })
    }
    return {newComments, lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1]}
}
export const getChangingProfileDetails = async(userId) => {
    if (!userId) {
        throw new Error("Error: 'userId' is undefined.");
    }
    try {
        const docRef = doc(db, 'profiles', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            reportedPosts: data.reportedPosts,
            reportedComments: data.reportedComments,
            messageNotifications: data.messageNotifications
        };
        } else {
        console.warn("Profile does not exist.");
        return null;
        }
    } catch (error) {
        console.error("Error fetching profile details:", error);
        return null;
    }
}
export const getRealProfileDetails = (userId) => {
  if (!userId) {
    throw new Error("Error: 'userId' is undefined.");
  }

  return new Promise((resolve, reject) => {
    const unsub = onSnapshot(doc(db, "profiles", userId), (doc) => {
      if (doc.exists()) {
        resolve(doc.data()); // Resolve with actual data
      } else {
        console.warn("Profile does not exist.");
        resolve(null);
      }
    }, (error) => {
      console.error("Error fetching profile details:", error);
      reject(error);
    });

    // Return unsubscribe function so it can be used if needed
    return () => unsub();
  });
};


/**
 * Gets a user's profile details provided by the fieldValues from their user document via the Firestore database.
 * @param {Object} userId - The userId performing the action.
 * @throws {Error} - If `userId` is undefined.
 * @returns {Promise<void>} - A promise that resolves when the Firestore update is complete.
*/
export const getProfileDetails = async(userId) => {
  if (!userId) {
    throw new Error("Error: 'userId' is undefined.");
  }
  try {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data;
    } else {
      console.warn("Profile does not exist.");
      return null;
    }
  } 
  catch (error) {
    console.error("Error fetching profile details:", error);
    return null;
  }
}
export const fetchStory = async({user}) => {
    const story = [];
      (await getDocs(collection(db, 'profiles', user.uid, 'stories'))).forEach((doc) => {
        story.push({id: doc.id, ...doc.data()})
      })
      return {story}
}
export const fetchGroupNotifications = async(groupId, userId, collectionName, setMessageNotifications) => {
  const q = query(collection(db, "groups", groupId, 'notifications', userId, collectionName));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const cities = [];
    querySnapshot.forEach((doc) => {
        cities.push(doc.id);
    });
    setMessageNotifications(cities.length)
  });
  return unsubscribe;
}
export const fetchNotifications = async(user, setNonMessageNotifications) => {
    const q = query(collection(db, "profiles", user.uid, 'checkNotifications'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const cities = [];
        querySnapshot.forEach((doc) => {
            cities.push(doc.id);
        });
        setNonMessageNotifications(cities.length)
      });
      return unsubscribe;
}
export const fetchRecentSearches = async({user, fieldValue, setSearches}) => {
    const q = query(collection(db, 'profiles', user.uid, 'recentSearches'), where(fieldValue, '==', true), orderBy('timestamp', 'desc'), limit(3))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const searches = [];
        querySnapshot.forEach((doc) => {
            searches.push({id: doc.data().element.id, searchId: doc.id})
        })
        setSearches(searches);
    })
    return unsubscribe;
}
export const fetchUsernames = async () => {
  try {
    const usernames = [];
    const querySnapshot = await getDocs(collection(db, 'usernames'));
    querySnapshot.forEach((doc) => {
      usernames.push(doc.data().username);
    });
    return usernames;
  } catch (error) {
    console.error("Error fetching usernames:", error);
    return []; // Return an empty array if there's an error
  }
}
export const fetchCliquePostsExcludingBlockedUsers = async (groupId, blockedUsers) => {
  const posts = [];
  let fetchedCount = 0;
  const q = query(collection(db, 'groups', groupId, 'posts'), orderBy('timestamp', 'desc'), limit(3))
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    if (blockedUsers.includes(doc.data().userId)) {
        fetchedCount++; // Increment blocked count
      } else {
        posts.push({ id: doc.id, loading: false, postIndex: 0, ...doc.data() });
      }
  });
  // Fetch more posts if all initial ones are blocked
  if (fetchedCount === 3 && posts.length === 0) {
    const nextQuery = query(
      collection(db, 'groups', groupId, 'posts'),
      orderBy('timestamp', 'desc'),
      startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
      limit(3)
    );
    const nextSnapshot = await getDocs(nextQuery);
    nextSnapshot.forEach((doc) => {
      posts.push({ id: doc.id, postIndex: 0, loading: false, ...doc.data() });
    })
  }
  return { posts, lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] };
}
export const fetchMoreCliquePostsExcludingBlockedUsers = async (groupId, blockedUsers, lastVisible) => {
  const tempPosts = [];
  let fetchedCount = 0;
  const q = query(collection(db, 'groups', groupId, 'posts'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(3))
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    if (blockedUsers.includes(doc.data().userId)) {
        fetchedCount++; // Increment blocked count
      } else {
        tempPosts.push({ id: doc.id, loading: false, postIndex: 0, ...doc.data() });
      }
  });
  // Fetch more posts if all initial ones are blocked
  if (fetchedCount === 3 && tempPosts.length === 0) {
    const nextQuery = query(
      collection(db, 'groups', groupId, 'posts'),
      orderBy('timestamp', 'desc'),
      startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
      limit(3)
    );
    const nextSnapshot = await getDocs(nextQuery);
    nextSnapshot.forEach((doc) => {
      tempPosts.push({ id: doc.id, postIndex: 0, loading: false, ...doc.data() });
    })
  }
  return { tempPosts, lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] };
}
export const fetchCliquePostsExcludingBlockedUsersWithActualNewPost = async (groupId, blockedUsers, actualNewPost) => {
  const posts = [];
  let fetchedCount = 0;
  const q = query(collection(db, 'groups', groupId, 'posts'), orderBy('timestamp', 'desc'), limit(3))
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    if (blockedUsers.includes(doc.data().userId) && actualNewPost.id !== doc.id) {
        fetchedCount++; // Increment blocked count
      } else if (actualNewPost.id !== doc.id) {
        posts.push({ id: doc.id, loading: false, postIndex: 0, ...doc.data() });
      }
  });
  // Fetch more posts if all initial ones are blocked
  if (fetchedCount === 3 && posts.length === 0) {
    const nextQuery = query(
      collection(db, 'groups', groupId, 'posts'),
      orderBy('timestamp', 'desc'),
      startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
      limit(3)
    );
    const nextSnapshot = await getDocs(nextQuery);
    nextSnapshot.forEach((doc) => {
      posts.push({ id: doc.id, postIndex: 0, loading: false, ...doc.data() });
    })
  }
  return { posts, lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] };
}
export const fetchPublicPostsExcludingBlockedUsers = async (blockedUsers) => {
  const posts = [];
  let fetchedCount = 0;

  const q = query(
    collection(db, 'posts'),
    where('private', '==', false),
    orderBy('timestamp', 'desc'),
    limit(7)
  );

  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    if (!blockedUsers.includes(doc.data().userId)) {
      posts.push({ id: doc.id, loading: false, postIndex: 0, ...doc.data() });
    } else {
      fetchedCount++;
    }
  });

  // Fetch more posts if all initial ones are blocked
  if (fetchedCount === 3 && posts.length === 0) {
    const nextQuery = query(
      collection(db, 'posts'),
      where('private', '==', false),
      orderBy('timestamp', 'desc'),
      startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]),
      limit(3)
    );
    const nextSnapshot = await getDocs(nextQuery);
    nextSnapshot.forEach((doc) => {
      posts.push({ id: doc.id, loading: false, postIndex: 0, ...doc.data() });
    });
  }

  return { posts, lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] };
};
export const fetchUserFeedPosts = async (userId, followingCount) => {
  const docRef = doc(db, 'userFeeds', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().posts.slice(followingCount - 7, followingCount);
  }
  return [];
};
export const fetchMorePublicPostsExcludingBlockedUsers = async (blockedUsers, lastVisible) => {
  const posts = [];
  let fetchedCount = 0;
  const q = query(
    collection(db, 'posts'),
    where('private', '==', false),
    orderBy('timestamp', 'desc'),
    startAfter(lastVisible),
    limit(4)
  );
  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    if (!blockedUsers.includes(doc.data().userId)) {
      posts.push({ id: doc.id, loading: false, postIndex: 0, ...doc.data() });
    } else {
      fetchedCount++;
    }
  });
  if (fetchedCount === 4 && posts.length === 0) {
    const nextQuery = query(
      collection(db, 'posts'),
      where('private', '==', false),
      orderBy('timestamp', 'desc'),
      startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]),
      limit(4)
    );
    const nextSnapshot = await getDocs(nextQuery);
    nextSnapshot.forEach((doc) => {
      posts.push({ id: doc.id, loading: false, postIndex: 0, ...doc.data() });
    });
  }
  return { posts, lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] };
}
export const ableToMessageFunction = async(userOneId, userTwoId, setAbleToMessage) => {
  if (!userOneId || !userTwoId) {
    throw new Error("Error: 'userIds' are not defined.");
  }
  const q = query(collection(db, "friends"), or(where(documentId(), '==', userOneId + userTwoId), where(documentId(), '==', userTwoId + userOneId)));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
          messages.push({id: doc.id, ...doc.data()});
      });
      setAbleToMessage(messages)
    });
    return unsubscribe;
}
export const fetchFriends = async (userId, setFriends) => {
  if (!userId) {
    throw new Error("Error: 'userId' is not defined.");
  }
  const q = query(collection(db, 'profiles', userId, 'friends'), where('actualFriend', '==', true));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const friends = [];
    querySnapshot.forEach((doc) => {
      friends.push({id: doc.id});
    });
    setFriends(friends)
  });
  return unsubscribe;
}
export const fetchNewPost = async (groupId, postId) => {
  if (!groupId || !postId) {
    throw new Error("Error: 'group and/or post' is undefined.");
  }
  const docSnap = await getDoc(doc(db, 'groups', groupId, 'posts', postId))
  if (docSnap.exists()) {
    return {id: docSnap.id, ...docSnap.data()}
  }
}
export const ableToShareFunction = async (itemId) => {
  if (!itemId) {
    throw new Error("Error: 'itemId' is undefined.");
  }
  const docRef = doc(db, 'posts', itemId);
  const docSnap = await getDoc(docRef);
  
  return docSnap.exists();
}
export const ableToShareCliqueFunction = async (groupId, itemId) => {
  if (!itemId || !groupId) {
    throw new Error("Error: 'itemId or groupId' is undefined.");
  }
  const docRef = doc(db, 'groups', groupId, 'posts', itemId);
  const docSnap = await getDoc(docRef);
  
  return docSnap.exists();
}
export const fetchGroupRequests = async(userId, callback) => {
  if (!userId) {
    throw new Error("Error: 'groupId' is undefined.");
  }
  const q = query(collection(db, 'profiles', userId, 'groupRequests'))
  // Set up the onSnapshot listener
  const unsub = onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(requests); // Pass the data to the callback function
  });
  return unsub;
}
export const getRequests = async (userId, callback) => {
    if (!userId) {
      throw new Error("Error: 'userId' is undefined.");
    }
    const q = query(
    collection(db, 'profiles', userId, 'requests'),
    where('actualRequest', '==', true)
  );

  // Set up the onSnapshot listener
  const unsub = onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(requests); // Pass the data to the callback function
  });
  return unsub;
}
export const ableToShareVideoFunction = async (itemId) => {
    if (!itemId) {
        throw new Error("Error: 'itemId' is undefined.");
    }
    const docRef = doc(db, 'videos', itemId);
    const docSnap = await getDoc(docRef);
    
    return docSnap.exists();
}
export const fetchUserSearchesSmall = async (specificSearch) => {
  const userSearches = [];
  const q = query(collection(db, "profiles"), where('smallKeywords', 'array-contains', specificSearch.toLowerCase()), limit(10))
  const firstQuerySnapshot = await getDocs(q)
  firstQuerySnapshot.forEach((doc) => {
    userSearches.push({id: doc.id, ...doc.data()})
  })
  return {userSearches}
}
export const fetchUserSearchesLarge = async (specificSearch) => {
  const userSearches = [];
  const q = query(collection(db, "profiles"), where('largeKeywords', 'array-contains', specificSearch.toLowerCase()), limit(10))
  const firstQuerySnapshot = await getDocs(q)
  firstQuerySnapshot.forEach((doc) => {
    userSearches.push({id: doc.id, ...doc.data()})

  })
  return {userSearches}
}
/**
 * Gets first 9 posts that aren't reposts for the profile screen ordered by latest posts first.
 * @param {String} userId - The id of the user whose profile is being viewed.
 * @param {Function} setPosts - State setter function for updating `posts` after fetching the first 9 non-repost posts.
 * @param {Function} setLastVisible - State setter function for updating `lastVisible` after fetching the first 9 posts to fetch the next 9 when applicable.
 * @returns {Function} - An unsubscribe function to stop listening to changes.
 * @throws {Error} - If `userId` is not provided.
*/
export const fetchPosts = (userId, setPosts, setLastVisible) => {
  if (!userId) {
    throw new Error("userId is undefined");
  }
  const q = query(collection(db, 'profiles', userId, 'posts'), where('repost', '==', false), orderBy('timestamp', 'desc'), limit(9))
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setPosts(posts);
    if (snapshot.docs.length > 0) {
      setLastVisible(snapshot.docs[snapshot.docs.length - 1])
    }
  })
  return unsubscribe;
}
export const fetchMorePosts = (userId, setPosts, posts, setLastVisible, lastVisible) => {
  if (!userId) {
    throw new Error("userId is undefined");
  }
  const q = query(collection(db, 'profiles', userId, 'posts'), where('repost', '==', false), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(9))
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const post = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setPosts([...posts, ...post]);
    if (snapshot.docs.length > 0) {
      setLastVisible(snapshot.docs[snapshot.docs.length - 1])
    }
  })
  return unsubscribe;
}
/**
 * Gets the number of posts or reposts that a user has. The number is useful to show users on the profile screen.
 * @param {String} userId - The id of the user to perform this action.
 * @param {String} subCollection - The name of the collection we are querying in Firestore (usually `posts`).
 * @param {Array} conditions - The query conditions we specify (`reposts` == false, `reposts` == true, etc.)
 * @param {Function} callback - A callback function that receives the number of posts/reposts a user has.
 * @returns {Function} - An unsubscribe function to stop listening to changes.
 * @throws {Error} - If `userId` or `subCollection` is not provided or exists.
*/   
export const fetchCount = async (userId, subCollection, conditions = [], callback) => {
  if (!userId || !subCollection) {
    throw new Error("Invalid parameters: userId or subCollection is undefined");
  }
  let coll = collection(db, "profiles", userId, subCollection);
  if (conditions.length > 0) {
    coll = query(coll, ...conditions);
  }
  try {
    const snapshot = await getCountFromServer(coll);
    callback(snapshot.data().count);
  } 
  catch (error) {
    console.error("Error fetching count:", error);
    callback(0); // Fallback to 0 on error
  }
};
/**
 * Gets first 9 posts that are reposts for the profile screen ordered by latest posts first.
 * @param {String} userId - The id of the user whose profile is being viewed.
 * @param {Function} setPosts - State setter function for updating `posts` after fetching the first 9 repost posts.
 * @param {Function} setLastVisible - State setter function for updating `lastVisible` after fetching the first 9 posts to fetch the next 9 when applicable.
 * @returns {Function} - An unsubscribe function to stop listening to changes.
 * @throws {Error} - If `userId` is not provided.
*/
export const fetchReposts = (userId, setReposts, setLastVisible) => {
  if (!userId) {
    throw new Error("userId is undefined");
  }
  const q = query(collection(db, 'profiles', userId, 'posts'), where('repost', '==', true), orderBy('timestamp', 'desc'), limit(9))
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const reposts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setReposts(reposts);
    if (snapshot.docs.length > 0) {
      setLastVisible(snapshot.docs[snapshot.docs.length - 1])
    }
  })
  return unsubscribe;
}
export const fetchMoreReposts = (userId, setReposts, reposts, setLastVisible, lastVisible) => {
  if (!userId) {
    throw new Error("userId is undefined");
  }
  const q = query(collection(db, 'profiles', userId, 'posts'), where('repost', '==', true), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(9))
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const repost = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setReposts([...reposts, ...repost]);
    if (snapshot.docs.length > 0) {
      setLastVisible(snapshot.docs[snapshot.docs.length - 1])
    }
  })
  return unsubscribe;
}
export const updateCliquePfp = async(groupId, url) => {
  if (!groupId)  {
    throw new Error("groupId is undefined");
  }
  try {
    const profileDocRef = doc(db, 'groups', groupId);
    await updateDoc(profileDocRef, {
      banner: url
    })
  }
  catch (e) {
    console.error(e)
  }
}
export const updatePfp = async(userId, url) => {
  if (!userId)  {
    throw new Error("userId is undefined");
  }
  try {
    const batch = writeBatch(db)
    const profileDocRef = doc(db, 'profiles', userId);
    batch.update(profileDocRef, {pfp: url})
    const usernameDocRef = doc(db, 'usernames', userId);
    batch.update(usernameDocRef, {pfp: url})
    await batch.commit();
  }
  catch (e) {
    console.error(e)
  }
}
export const fetchPerson = async(userId) => {
  const docRef = doc(db, 'profiles', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return {id: docSnap.id, ...docSnap.data()}
  }
  return {};
}
export const fetchFriendId = async(ogUserId, userId) => {
  const docRef = doc(db, 'profiles', ogUserId, 'friends', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().friendId
  }
  return '';
}
export const fetchCliqueData = async(groupId, setContacts, setRequests, setReported, setMemberRequests) => {
  if (!groupId)  {
    throw new Error("groupId is undefined");
  }
  try {
    const contactQ = query(collection(db, 'groups', groupId, 'adminContacts'))
    const requestQ = query(collection(db, 'groups', groupId, 'adminRequests'))
    const reportedQ = query(collection(db, 'groups', groupId, 'reportedContent'))
    const memberQ = query(collection(db, 'groups', groupId, 'memberRequests'))
    const contactUnsub = onSnapshot(contactQ, (querySnapshot) => {
      const contacts = [];
      querySnapshot.forEach((doc) => {
        contacts.push({id: doc.id});
      });
      setContacts(contacts)
    });
    const requestUnsub = onSnapshot(requestQ, (querySnapshot) => {
      const requests = [];
      querySnapshot.forEach((doc) => {
        requests.push({id: doc.id});
      });
      setRequests(requests)
    });
    const reportedUnsub = onSnapshot(reportedQ, (querySnapshot) => {
      const reported = [];
      querySnapshot.forEach((doc) => {
        reported.push({id: doc.id});
      });
      setReported(reported)
    });
    const memberUnsub = onSnapshot(memberQ, (querySnapshot) => {
      const members = [];
      querySnapshot.forEach((doc) => {
        members.push({id: doc.id});
      });
      setMemberRequests(members)
    });
    return contactUnsub, requestUnsub, reportedUnsub, memberUnsub;
  }
  catch (e) {
    console.error(e)
  }
}
/**
 * Gets first 10 themes based on subCollection (price, date, etc.) and order (ascending, descending) that were collected/purchased by a user.
 * @param {String} userId - The id of the user perfoming this action.
 * @param {String} subCollection - The name of the field/subCollection that we are ordering the query by (price, date, etc.).
 * @param {String} order - The name of the order that we are ordering the query by (ascending, descending, etc.).
 * @param {Function} setPurchasedThemes - State setter function for updating `purchasedThemes` after fetching the first 10 purchased themes.
 * @param {Function} setPurchasedLastVisible - State setter function for updating `purchasedLastVisible` after fetching the first 10 purchasedThemes.
 * Used to get the last document in our query in case user fetches more (separate function).
 * @returns {Function} - An unsubscribe function to stop listening to changes.
 * @throws {Error} - If `userId` or `subCollection` is not provided.
*/
export const fetchPurchasedThemes = (userId, subCollection, order, setPurchasedThemes, setPurchasedLastVisible) => {
  if (!userId || !subCollection) {
    throw new Error("userId is undefined");
  }
  const purchasedQuery = query(collection(db, 'profiles', userId, 'purchased'), orderBy(subCollection, order), limit(10))
  const unsubscribe = onSnapshot(purchasedQuery, (snapshot) => {
    const purchased = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      transparent: false
    }));
    if (purchased) {
      setPurchasedThemes(purchased);
    }
    else {
      setPurchasedThemes([]);
    }
    
    if (snapshot.docs.length > 0) {
      setPurchasedLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    }

  return unsubscribe;
  });
}
/**
 * Gets next 10 themes based on subCollection (price, date, etc.) and order (ascending, descending) that were collected/purchased by a user.
 * @param {String} userId - The id of the user perfoming this action.
 * @param {String} subCollection - The name of the field/subCollection that we are ordering the query by (price, date, etc.).
 * @param {String} order - The name of the order that we are ordering the query by (ascending, descending, etc.).
 * @param {Object} lastVisible - The Firestore document object (last purchased theme object) to `startAfter` when fetching more data.
 * @returns {Function} - An unsubscribe function to stop listening to changes.
 * @throws {Error} - If `userId` or `subCollection` is not provided.
*/
export const fetchMorePurchasedThemes = async(userId, subCollection, order, lastVisible) => {
  if (!userId || !subCollection) {
    throw new Error("userId is undefined");
  }
  const tempPosts = [];
  try {
    const purchasedQuery = query(collection(db, 'profiles', userId, 'purchased'), orderBy(subCollection, order), startAfter(lastVisible), limit(10))
    const querySnapshot = await getDocs(purchasedQuery)
    querySnapshot.forEach((doc) => {
      tempPosts.push({id: doc.id, ...doc.data(), transparent: false})
    });
    return {tempPosts, lastPurchasedVisible: querySnapshot.docs[querySnapshot.docs.length - 1]}
  } 
  catch (e) {
    console.error(e)
  }
}
export const fetchMoreFreeThemes = async(subCollection, order, freeLastVisible) => {
  if (!subCollection) {
    throw new Error("subcollection is undefined");
  }
  const tempPosts = []
  try {
    const q = query(collection(db, 'freeThemes'), orderBy(subCollection, order), startAfter(freeLastVisible), limit(10))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((doc) => {
      tempPosts.push({id: doc.id, ...doc.data(), transparent: false})
    });
    return {tempPosts, lastFreeVisible: querySnapshot.docs[querySnapshot.docs.length - 1]}
  } 
  catch (e) {
    console.error(e)
  }
}
/**
 * Gets first 10 themes based on subCollection (price, date, etc.) and order (ascending, descending) that are 'free'.
 * @param {String} subCollection - The name of the field/subCollection that we are ordering the query by (date, count, etc.).
 * @param {String} order - The name of the order that we are ordering the query by (ascending, descending, etc.).
 * @returns {Function} - An unsubscribe function to stop listening to changes.
 * @throws {Error} - If `subCollection` is not provided.
*/
export const fetchFreeThemes = async(subCollection, order) => {
  if (!subCollection) {
    throw new Error("subcollection is undefined");
  }
  const tempPosts = []
  try {
    const q = query(collection(db, 'freeThemes'), orderBy(subCollection, order), limit(10))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((doc) => {
      tempPosts.push({id: doc.id, ...doc.data(), transparent: false})
    });
    //console.log(tempPosts)
    return {tempPosts, lastFreeVisible: querySnapshot.docs[querySnapshot.docs.length - 1]}
  } 
  catch (e) {
    console.error(e)
  }

}
/**
 * Gets first 10 themes based on subCollection (price, date, etc.) and order (ascending, descending) that were created by the user.
 * @param {String} userId - The id of the user perfoming this action.
 * @param {String} subCollection - The name of the field/subCollection that we are ordering the query by (date, price, etc.).
 * @param {String} order - The name of the order that we are ordering the query by (ascending, descending, etc.).
 * @returns {Function} - An unsubscribe function to stop listening to changes.
 * @throws {Error} - If `myId` or `subCollection` is not provided.
*/
export const fetchMyThemes = async(userId, subCollection, order) => {
  if (!userId) {
    throw new Error("userId is undefined");
  }
  else if (subCollection == 'bought_count') {
    const tempPosts = []
    try { 
      const myQuery = query(collection(db, 'profiles', userId, 'myThemes'), limit(10))
      const querySnapshot = await getDocs(myQuery)
      querySnapshot.forEach((doc) => {
        tempPosts.push({id: doc.id, ...doc.data(), transparent: false})
      });
      return {tempPosts, lastMyVisible: querySnapshot.docs[querySnapshot.docs.length - 1]}
    }
    catch (e) {
      console.error(e)
    }
  }
  else {
    const tempPosts = []
    try { 
      const myQuery = query(collection(db, 'profiles', userId, 'myThemes'), orderBy(subCollection, order), limit(10))
      const querySnapshot = await getDocs(myQuery)
      querySnapshot.forEach((doc) => {
        tempPosts.push({id: doc.id, ...doc.data(), transparent: false})
      });
      return {tempPosts, lastMyVisible: querySnapshot.docs[querySnapshot.docs.length - 1]}
    }
    catch (e) {
      console.error(e)
    }
  }
}
export const fetchMoreMyThemes = async(userId, subCollection, order, lastVisible) => {
  if (!userId) {
    throw new Error("userId is undefined");
  }
  else if (subCollection == 'bought_count') {
    const tempPosts = []
    try { 
      const myQuery = query(collection(db, 'profiles', userId, 'myThemes'), startAfter(lastVisible), limit(10))
      const querySnapshot = await getDocs(myQuery)
      querySnapshot.forEach((doc) => {
        tempPosts.push({id: doc.id, ...doc.data(), transparent: false})
      });
      return {tempPosts, lastMyVisible: querySnapshot.docs[querySnapshot.docs.length - 1]}
    }
    catch (e) {
      console.error(e)
    }
  }
  else {
    const tempPosts = []
    try { 
      const myQuery = query(collection(db, 'profiles', userId, 'myThemes'), orderBy(subCollection, order), startAfter(lastVisible), limit(10))
      const querySnapshot = await getDocs(myQuery)
      querySnapshot.forEach((doc) => {
        tempPosts.push({id: doc.id, ...doc.data(), transparent: false})
      });
      return {tempPosts, lastMyVisible: querySnapshot.docs[querySnapshot.docs.length - 1]}
    }
    catch (e) {
      console.error(e)
    }
  }
}
/**
 * Gets first 10 themes based on a search performed by a user categorized by collectionName (if they are searching free themes for instance).
 * @param {String} userId - The id of the user perfoming this action. Useful for queries that require userId.
 * @param {String} collectionname - The name of the collection that we are fetching (products, freeThemes, myThemes, etc.)
 * @param {String} specificSearch - The search being performed by the user.
 * @returns {Promise<Object>} - A promise that resolves with an object containing a `themeSearches` array of theme objects based on the collectionName. 
 * Each post object includes the document ID, and theme data.
 * @throws {Error} - If `userId` or `collectionName` is not provided.
*/
export const fetchThemeSearches = async(collectionName, specificSearch, userId) => {
  if (!userId || !collectionName) {
    throw new Error("userId and/or collectionName is undefined");
  }
  try {
    if (collectionName == 'products') {
      const themeSearches = [];
      const q = query(collection(db, collectionName), orderBy('stripe_metadata_keywords'), startAt(specificSearch), endAt(specificSearch + '\uf8ff'))
      const firstQuerySnapshot = await getDocs(q)
      firstQuerySnapshot.forEach((doc) => {
        themeSearches.push({id: doc.id, ...doc.data()})
      })
      return {themeSearches}
    }
    else if (collectionName == 'freeThemes') {
      const themeSearches = []
      const q = query(collection(db, collectionName), where('searchKeywords', 'array-contains', specificSearch.toLowerCase()), limit(10))
      const firstQuerySnapshot = await getDocs(q)
      firstQuerySnapshot.forEach((doc) => {
        themeSearches.push({id: doc.id, ...doc.data()})
      })
      return {themeSearches}
    }
    else if (collectionName == 'myThemes') {
      const themeSearches = []
      const q = query(collection(db, "profiles", userId, collectionName), where('searchKeywords', 'array-contains', specificSearch.toLowerCase()), limit(10));
      const firstQuerySnapshot = await getDocs(q)
      firstQuerySnapshot.forEach((doc) => {
        themeSearches.push({id: doc.id, ...doc.data()})
      })
      return {themeSearches}
    }
    else if (collectionName == 'purchased') {
      const themeSearches = []
      const q = query(collection(db, "profiles", userId, collectionName), where('searchKeywords', 'array-contains', specificSearch.toLowerCase()), limit(10));
      const firstQuerySnapshot = await getDocs(q)
      firstQuerySnapshot.forEach((doc) => {
        themeSearches.push({id: doc.id, ...doc.data()})
      })
      return {themeSearches}
    }
  }
  catch (e) {
    console.error(e)
  }
}
export const fetchThemeNames = async(userId, ) => {
  const themes = [];
  const q = collection(db, 'profiles', userId, 'myThemes')
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    themes.push(doc.data().name.toLowerCase())
  });
  return {themes}
}
export const removeCurrentUser = async(item, userId) => {
  if (!userId)  {
    throw new Error("userId is undefined");
  }
  try {
    const batch = writeBatch(db)
    const profileDocRef = doc(db, 'profiles', userId);
    batch.update(profileDocRef, {adminGroups: arrayRemove(item)})
    const q = collection(db, 'profiles')
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      
    });
    await batch.commit();
  }
  catch (e) {
    console.error(e)
  }
}
export const addImageToMessage = async(friendId, url, person, user, firstName, lastName) => {
  if (!friendId)  {
    throw new Error("friendId is undefined");
  }
  try {
    const batch = writeBatch(db)
    const profileDocRef = doc(db, 'profiles', person.id)
    const friendRef = doc(db, 'friends', friendId)
    const oneFriendRef = doc(db, 'profiles', user.uid, 'friends', person.id)
    const twoFriendRef = doc(db, 'profiles', person.id, 'friends', user.uid)
    const docRef = await addDoc(collection(db, 'friends', friendId, 'chats'), {
      message: {image: url},
      liked: false,
      toUser: person.id,
      user: user.uid,
      firstName: firstName,
      lastName: lastName,
      pfp: person.pfp,
      readBy: [],
      timestamp: serverTimestamp()
    })
    addDoc(collection(db, 'friends', friendId, 'messageNotifications'), {
      //message: true,
      id: docRef.id,
      toUser: person.id,
      readBy: [],
      timestamp: serverTimestamp()
    })
    batch.update(profileDocRef, {messageNotifications: arrayUnion({id: docRef.id, user: user.uid})})
    batch.update(friendRef, {
      lastMessage: {image: url},
      messageId: docRef.id,
      active: true,
      readBy: [],
      toUser: person.id,
      lastMessageTimestamp: serverTimestamp()
    })
    batch.update(oneFriendRef, {lastMessageTimestamp: serverTimestamp()})
    batch.update(twoFriendRef, {lastMessageTimestamp: serverTimestamp()})
    await batch.commit();
  }
  catch (e) {
    console.error(e)
  }
}
export const sendMessage = async(friendId, newMessage, person, user, firstName, lastName) => {
  if (!friendId || !person || !user)  {
    throw new Error("friendId or person or user is undefined");
  }
  try {
    const batch = writeBatch(db)
    const personRef = doc(db, 'profiles', person.id)
    const friendRef = doc(db, 'friends', friendId)
    const firstFriendIdRef = doc(db, 'profiles', user.uid, 'friends', person.id)
    const secondFriendIdRef = doc(db, 'profiles', person.id, 'friends', user.uid)
    const docRef = await addDoc(collection(db, 'friends', friendId, 'chats'), {
      message: newMessage,
      liked: false,
      toUser: person.id,
      user: user.uid,
      firstName: firstName,
      lastName: lastName,
      pfp: person.pfp,
      readBy: [],
      timestamp: serverTimestamp()
    })
    console.log(docRef)
    addDoc(collection(db, 'friends', friendId, 'messageNotifications'), {
      id: docRef.id,
      toUser: person.id,
      readBy: [],
      timestamp: serverTimestamp()
    })
    batch.update(personRef, {messageNotifications: arrayUnion({id: docRef.id, user: user.uid})})
    batch.update(friendRef, {
      lastMessage: newMessage,
      messageId: docRef.id,
      readBy: [],
      active: true,
      toUser: person.id,
      lastMessageTimestamp: serverTimestamp()
    })
    batch.update(firstFriendIdRef, {lastMessageTimestamp: serverTimestamp()})
    batch.update(secondFriendIdRef, {lastMessageTimestamp: serverTimestamp()})
    await batch.commit();
  }
  catch (e) {
    console.error(e)
  }

}
export const fetchActualNotifications = async(group, id, notifications) => {
  let newData = [];
  const tempList = [];
  //console.log(notifications.length)
  await Promise.all(notifications.map(async(item) => {
      let firstVideoSnap = null
      let firstPostSnap = null
      let postSnap = null
      let videoSnap = null;
      if (group) {
        firstVideoSnap = await getDoc(doc(db, 'groups', id, 'videos', item.item))
        firstPostSnap = await getDoc(doc(db, 'groups', id, 'posts', item.item))
        postSnap = await getDoc(doc(db, 'groups', id, 'posts', item.postId))
        videoSnap = await getDoc(doc(db, 'groups', id, 'videos', item.postId))
      }
      else if (!item.friend && !item.comment) {
        firstVideoSnap = await getDoc(doc(db, 'videos', item.item))
        firstPostSnap = await getDoc(doc(db, 'posts', item.item))
        postSnap = await getDoc(doc(db, 'posts', item.postId))
        videoSnap = await getDoc(doc(db, 'videos', item.postId))
      }
      const docSnap = await getDoc(doc(db, 'profiles', item.requestUser))
      if (!item.friend) {
        const freeDataSnap = await getDoc(doc(db, 'freeThemes', item.postId))
        const groupSnap = await getDoc(doc(db, 'groups', item.postId))
      }
      
      if (item.like && !item.video) {    
        console.log('e')
        if (postSnap.exists() && docSnap.exists()) {
          //console.log('first')
          if (!newData.includes(postSnap.id)) {
            tempList.push({item, postInfo: {id: postSnap.id, ...postSnap.data()}, info: docSnap.data()})
            newData.push(postSnap.id)
          }
        }
      }
      else if (item.like && item.video) {
        console.log('d')
        if (firstVideoSnap.exists() && docSnap.exists()) {
          if (!newData.includes(firstVideoSnap.id)) {
            tempList.push({item, postInfo: {id: firstVideoSnap.id, ...firstVideoSnap.data()}, info: docSnap.data()})
            newData.push(firstVideoSnap.id)
          }
        }
      }
      else if (item.report) {
        console.log('c')
        if (item.comments) {
          tempList.push({item})
        }
        else if (item.post && !item.video) {
          if (postSnap.exists()) {
            tempList.push({item, postInfo: {id: postSnap.id, ...postSnap.data()}})
          }
        }
        else if (item.post && item.video) {
          if (videoSnap.exists()) {
            tempList.push({item, postInfo: {id: videoSnap.id, ...videoSnap.data()}})
          }
        }
        else if (item.message) {
          tempList.push({item})
        }
        else if (item.theme) {
          if (freeDataSnap.exists() && docSnap.exists()) {
            tempList.push({item, postInfo: {id: freeDataSnap.id, ...freeDataSnap.data()}, info: docSnap.data(), free: true})
          }
        }
      }
      else if (item.comment && !item.video) {
        console.log('b')
        if (postSnap.exists() && docSnap.exists()) {
          tempList.push({item, postInfo: {id: postSnap.id, ...postSnap.data()}, info: docSnap.data()})
        }
      } 
      else if (item.comment && item.video) {
        console.log('a')
        if (videoSnap.exists() && docSnap.exists()) {
          tempList.push({item, postInfo: {id: videoSnap.id, ...videoSnap.data()}, info: docSnap.data()})
        }
      }
      else if (item.reply && !item.video) {
        console.log('f')
        if (postSnap.exists() && docSnap.exists()) {
          console.log(postSnap.exists())
          tempList.push({item, postInfo: {id: postSnap.id, ...postSnap.data()}, info: docSnap.data()})
        }
      }
      else if (item.reply && item.video) {
        console.log('fds')
        if (videoSnap.exists() && docSnap.exists()) {
          tempList.push({item, postInfo: {id: videoSnap.id, ...videoSnap.data()}, info: docSnap.data()})
        }
      }
      else if (item.acceptRequest) {
        console.log('fk')
        if (docSnap.exists()) {
          tempList.push({item, info: {id: docSnap.id, ...docSnap.data()}})
        }
      }
      else if (item.request) {
        console.log('first')
        if (docSnap.exists()) {
          tempList.push({item, info: {id: docSnap.id, ...docSnap.data()}})
        }
      }
      else if (item.friend) {
        console.log('klkl')
        if (docSnap.exists()) {
          tempList.push({item, info: {id: docSnap.id, ...docSnap.data()}})
        }
      }
      else if (item.mention && !item.video) {
      if (postSnap.exists() && docSnap.exists()) {
        tempList.push({item, postInfo: {id: postSnap.id, ...postSnap.data()}, info: docSnap.data()})
      }
    }
    else if (item.mention && item.video) {
      if (videoSnap.exists() && docSnap.exists()) {
        tempList.push({item, postInfo: {id: videoSnap.id, ...videoSnap.data()}, info: docSnap.data()})
      }
    }
    else if (item.postMention && !item.video) {
      if (postSnap.exists() && docSnap.exists()) {
        tempList.push({item, postInfo: {id: postSnap.id, ...postSnap.data()}, info: docSnap.data()})
      }
    }
    else if (item.postMention && item.video) {
      if (videoSnap.exists() && docSnap.exists()) {
        tempList.push({item, postInfo: {id: videoSnap.id, ...videoSnap.data()}, info: docSnap.data()})
      }
    }
    else if (item.repost) {
      if (postSnap.exists() && docSnap.exists()) {
        tempList.push({item, postInfo: {id: postSnap.id, ...postSnap.data()}, info: docSnap.data()})
      }
    }
    else if (item.remove || item.ban) {
      if (groupSnap.exists() && docSnap.exists()) {
        tempList.push({item, postInfo: {id: groupSnap.id, ...groupSnap.data()}, info: docSnap.data()})
      }
    }
    else if (item.theme) {
      if (freeDataSnap.exists() && docSnap.exists()) {
        tempList.push({item, postInfo: {id: freeDataSnap.id, ...freeDataSnap.data()}, info: docSnap.data(), free: true})
      }
    }
    
    }))
    return tempList
}
export const deleteCheckedNotifications = async(userId, group, id) => {
  try {
  if (group) {
    const querySnapshot = await getDocs(collection(db, 'groups', id, "profiles", userId, 'checkNotifications'));
    querySnapshot.forEach(async(docu) => {
      await deleteDoc(doc(db, 'groups', id, 'profiles', userId, 'checkNotifications', docu.id))
    });
  }
  else {
    const querySnapshot = await getDocs(collection(db, "profiles", userId, 'checkNotifications'));
    querySnapshot.forEach(async(docu) => {
      await deleteDoc(doc(db, 'profiles', userId, 'checkNotifications', docu.id))
    });
  }
} catch (error) {
  console.error(error)
}
  
}
export const fetchFirstNotifications = async(userId, group, id) => {
  try {
    console.log(userId)
    let templist = []
    if (group) {
      const q = query(collection(db, 'groups', id, "profiles", userId, 'notifications'), orderBy('timestamp', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
          templist.push({id: doc.id, loading: false, ...doc.data()})
      });
    }
    else {
      const q = query(collection(db, "profiles", userId, 'notifications'), orderBy('timestamp', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
          templist.push({id: doc.id, loading: false, ...doc.data()})
      });
    }
    return templist;
  }
  catch (error) {
    console.error(error)
  }
}
export const buyThemeFunction = async(image, navigation) => {
  const freeQuerySnapshot = await getDocs(query(collection(db, 'freeThemes'), where('images', 'array-contains', image)));
  freeQuerySnapshot.forEach((doc) => {
    if (doc.exists()) {
      navigation.navigate('SpecificTheme', {productId: doc.id, free: true, purchased: false})
    }
  });
}
export const addLikeToPost = async(itemId, userId) => {
  if (!itemId || !userId) {
    throw new Error("Error: Missing required parameters.");
  }
  const batch = writeBatch(db)
  const postRef = doc(db, 'posts', itemId)
  const profileRef = doc(db, 'profiles', userId, 'likes', itemId)
  batch.update(postRef, {likedBy: arrayUnion(userId)})
  batch.set(profileRef, {post: itemId, timestamp: serverTimestamp()})
  await batch.commit();
}
export const addSaveToPost = async(itemId, userId, video) => {
  if (!itemId || !userId) {
    throw new Error("Error: Missing required parameters.");
  }
  if (video) {
    try {
      const batch = writeBatch(db)
      const postRef = doc(db, 'videos', itemId)
      const profileRef = doc(db, 'profiles', userId, 'saves', itemId)
      batch.update(postRef, {savedBy: arrayUnion(userId)})
      batch.set(profileRef, {post: itemId, timestamp: serverTimestamp()})
      await batch.commit();
    }
    catch (error) {
      console.error(error)
    }
  }
  else {
    try {
      const batch = writeBatch(db)
      const postRef = doc(db, 'posts', itemId)
      const profileRef = doc(db, 'profiles', userId, 'saves', itemId)
      batch.update(postRef, {savedBy: arrayUnion(userId)})
      batch.set(profileRef, {post: itemId, timestamp: serverTimestamp()})
      await batch.commit();
    }
    catch (error) {
      console.error(error)
    }
  }
}
export const removeLikeFromPost = async(itemId, userId) => {
  if (!itemId || !userId) {
    throw new Error("Error: Missing required parameters.");
  }
  const batch = writeBatch(db)
  const postRef = doc(db, 'posts', itemId)
  const profileRef = doc(db, 'profiles', userId, 'likes', itemId)
  batch.update(postRef, {likedBy: arrayRemove(userId)})
  batch.delete(profileRef)
  await batch.commit();
}
export const removeSaveFromPost = async(itemId, userId, video) => {
  if (!itemId || !userId) {
    throw new Error("Error: Missing required parameters.");
  }
  if (video) {
    try {
      const batch = writeBatch(db)
      const postRef = doc(db, 'videos', itemId)
      const profileRef = doc(db, 'profiles', userId, 'saves', itemId)
      batch.update(postRef, {savedBy: arrayRemove(userId)})
      batch.delete(profileRef)
      await batch.commit();
    }
    catch (error) {
      console.error(error)
    }
  }
  else {
    try {
      const batch = writeBatch(db)
      const postRef = doc(db, 'posts', itemId)
      const profileRef = doc(db, 'profiles', userId, 'saves', itemId)
      batch.update(postRef, {savedBy: arrayRemove(userId)})
      batch.delete(profileRef)
      await batch.commit();
    }
    catch (error) {
      console.error(error)
    }
  }
  
}
export const deleteNotificationFunction = async(userId, itemId, requestUser, request) => {
  if (!itemId || !userId) {
    throw new Error("Error: Missing required parameters.");
  }
  const profileRef = doc(db, 'profiles', userId, 'notifications', itemId)
  if (request) {
    const requestUserRef = doc(db, 'profiles', userId, 'requests', requestUser)
    const userRef = doc(db, 'profiles', requestUser, 'requests', userId)
    const batch = writeBatch(db)
    batch.delete(profileRef)
    batch.delete(requestUserRef)
    batch.delete(userRef)
    await batch.commit();
  }
  else {
    await deleteDoc(profileRef)
  }
  

}
export const fetchLimitedFriends = async(userId, followers, following) => {
  const friendsArray = [];
  const q = query(collection(db, 'profiles', userId, 'friends'), where('actualFriend', '==', true), 
  orderBy('lastMessageTimestamp', 'desc'), limit(20))
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    if (followers.includes(doc.id) && following.includes(doc.id)) {
      friendsArray.push({id: doc.id, ...doc.data()})
    }
  })
  return {friendsArray}
}
export const fetchLimitedFriendsInfo = async(friends) => {
  const completeFriendsArray = [];
  friends.map(async(item) => await getDoc(doc(db, 'friends', item.friendId))
    .then(snapshot => {
      completeFriendsArray.push({id: snapshot.id, ...snapshot.data()})
    })
    .catch(error => {
      console.error(error)
    }))
  return completeFriendsArray;
}
export const repostFunction = async(user, blockedUsers, repostComment, forSale, notificationToken, 
    username, background, pfp, repostItem, setRepostLoading, handleClose, schedulePushRepostNotification) => {
      try {
        const docRef = await addDoc(collection(db, 'posts'), {
      userId: user.uid,
    repost: true,
    blockedUsers: blockedUsers,
    caption: repostComment,
    post: repostItem,
    forSale: forSale,
    postIndex: 0,
    mentions: [],
    pfp: pfp,
    likedBy: [],
    comments: 0,
    shares: 0,
    usersSeen: [],
    commentsHidden: false,
    likesHidden: false,
    archived: false,
    savedBy: [],
    multiPost: true,
    timestamp: serverTimestamp(),
    notificationToken: notificationToken,
    username: username,
    
    reportVisible: false,
    background: background
    })
    await setDoc(doc(db, 'profiles', user.uid, 'posts', docRef.id), {
      userId: user.uid,
      repost: true,
    caption: repostComment,
    post: repostItem,
    forSale: forSale,
    postIndex: 0,
    likedBy: [],
    mentions: [],
    comments: 0,
    shares: 0,
    usersSeen: [],
    commentsHidden: false,
    likesHidden: false,
    archived: false,
    savedBy: [],
    multiPost: true,
    timestamp: serverTimestamp(),
    notificationToken: notificationToken,
    username: username,
    pfp: pfp,
    reportVisible: false,
    })
    await updateDoc(doc(db, 'posts', repostItem.id), {
      reposts: increment(1)
    })
    await addDoc(collection(db, 'profiles', repostItem.userId, 'notifications'), {
              like: true,
              comment: false,
              friend: false,
              item: repostItem.id,
              repost: true,
              request: false,
              acceptRequest: false,
              theme: false,
              report: false,
              postId: repostItem.id,
              requestUser: user.uid,
              requestNotificationToken: repostItem.notificationToken,
              likedBy: [],
              timestamp: serverTimestamp()
            })
        await addDoc(collection(db, 'profiles', repostItem.userId, 'checkNotifications'), {
                userId: repostItem.userId
              })
        setRepostLoading(false)
        handleClose()
        schedulePushRepostNotification(repostItem.userId, username, repostItem.notificationToken)
            } catch (error) {
              console.error(error)
            }
}
export const fetchSpecificTheme = async(my, free, themeId, userId) => {
  if (!themeId || !userId) {
    throw new Error("themeId or userId is undefined");
  }
  try {
    if (my) {
      const themeSnap = (await getDoc(doc(db, 'profiles', userId, 'myThemes', themeId))).data()
      return themeSnap;
    }
    else if (free) {
      const themeSnap = (await getDoc(doc(db, 'freeThemes', themeId))).data()
      return themeSnap;
    }
  }
  catch (error) {
    console.error(error)
  }
}
export const applyTheme = async(userId, theme, selling, profile, posts, both, setApplyLoading, setAppliedThemeModal,
  setProfileDoneApplying, setPostDoneApplying, setBothDoneApplying
) => {
  if (!userId) {
    throw new Error("userId is undefined");
  }
  try {
    setApplyLoading(true)
    if (profile) {
      await updateDoc(doc(db, 'profiles', userId), {
        background: theme,
        forSale: selling,
      }).then(() => {
        setTimeout(() => {
          setApplyLoading(false)
          setAppliedThemeModal(true); 
          setProfileDoneApplying(true);
        }, 500);
      })
    }
    else if (posts) {
      await updateDoc(doc(db, 'profiles', user.uid), {
        postBackground: theme,
        forSale: selling,
        postBought: selling
      }).then(() => { 
        setTimeout(() => {
        setAppliedThemeModal(true); 
        setPostDoneApplying(true);
        setApplyLoading(false)
        }, 500);
      })
    }
    else if (both) {
      setApplyLoading(true)
      await updateDoc(doc(db, 'profiles', user.uid), {
        background: theme,
        postBackground: theme,
        forSale: selling,
        postBought: selling
      }).then(() => {
        setTimeout(() => {
          setAppliedThemeModal(true); 
          setBothDoneApplying(true); 
          setApplyLoading(false)
        }, 500);
      })
    }
  }
  catch (error) {
    console.error(error)
  }
}