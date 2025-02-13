const admin = require('firebase-admin')
admin.initializeApp()
const firestore = admin.firestore()
exports.preComputeFeed = functions.firestore.document('profiles/{userId}').onUpdate(async (change, context) => {
    const userId = context.params.userId
    const newData = change.after.data();
    if (!newData.following) {
      return null; // No need to pre-compute if no following data
    }

    const followedUserIds = newData.following;

    // Batching for efficiency (optional, adjust batch size as needed)
    const batchSize = 100;
    const postChunks = [];
    for (let i = 0; i < followedUserIds.length; i += batchSize) {
      const chunk = followedUserIds.slice(i, i + batchSize);
      postChunks.push(chunk);
    }

    const allPosts = [];
    for (const chunk of postChunks) {
      // Query for posts from followed users
      const query = query(firestore.collection('posts').where('userId', 'in', chunk));
      const querySnapshot = await getDocs(query);
      const chunkPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      allPosts.push(...chunkPosts);
    }

    // Optionally apply feed ranking logic here (based on engagement, etc.)
    // ...

    // Store pre-computed feed data (replace with your chosen storage method)
    const userRef = firestore.collection('profiles').doc(userId)
    await setDoc(userRef, { posts: allPosts });

    console.log(`Pre-computed feed for user: ${userId}`);
})
