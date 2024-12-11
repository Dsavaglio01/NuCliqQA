import { db } from './firebase';
import { getDoc, doc, collection, where, onSnapshot, setDoc, getDocs, startAfter, arrayUnion, serverTimestamp, updateDoc, 
arrayRemove, increment, orderBy, limit, startAt, endAt, query} from 'firebase/firestore';
export const repostFunction = async (user, blockedUsers, repostComment, forSale, notificationToken, 
    username, background, pfp, repostItem, setRepostLoading, handleClose, schedulePushRepostNotification) => {
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
}
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
export const getProfileDetails = async(userId) => {
  if (!userId) {
    throw new Error("Error: 'userId' is undefined.");
  }
  try {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        username: data.userName,
        pfp: data.pfp,
        followers: data.followers,
        private: data.private,
        following: data.following,
        forSale: data.forSale,
        firstName: data.firstName, 
        paymentMethodLast4: data.paymentMethodLast4,
        lastName: data.lastName,
        smallKeywords: data.smallKeywords,
        largeKeywords: data.largeKeywords,
        postBackground: data.postBackground,
        background: data.background,
        blockedUsers: data.blockedUsers,
        notificationToken: data.notificationToken,
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
export const fetchStory = async({user}) => {
    const story = [];
      (await getDocs(collection(db, 'profiles', user.uid, 'stories'))).forEach((doc) => {
        story.push({id: doc.id, ...doc.data()})
      })
      return {story}
}
export const fetchNotifications = async({user, setNonMessageNotifications}) => {
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
export const ableToShareFunction = async (itemId) => {
    if (!itemId) {
        throw new Error("Error: 'itemId' is undefined.");
    }
    const docRef = doc(db, 'posts', itemId);
    const docSnap = await getDoc(docRef);
    
    return docSnap.exists();
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