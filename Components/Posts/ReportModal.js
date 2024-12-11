import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ReportModal = () => {
  function onSecondPress(item) {
        setCommentsLoading(true)
        if (reportedContent.length < 10) {
      addDoc(collection(db, 'profiles', reportComment.user, 'reportedContent'), {
      content: reportComment.id,
      reason: item,
      post: focusedPost,
      comment: reportComment.comment == undefined ? reportComment.reply : reportComment.comment,
      message: false,
      cliqueMessage: false,
      timestamp: serverTimestamp()
    }).then(() => addDoc(collection(db, 'profiles', reportComment.user, 'notifications'), {
      like: false,
comment: reportComment.comment == undefined ? reportComment.reply : reportComment.comment,
      friend: false,
      item: item,
      request: false,
      acceptRequest: false,
      theme: false,
      report: true,
      postId: focusedPost.id,
      requestUser: reportComment.user,
      requestNotificationToken: reportNotificationToken,
      post: focusedPost,
      comments: comments,
       message: false,
      cliqueMessage: false,
      likedBy: [],
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'profiles', reportComment.user, 'checkNotifications'), {
      userId: reportComment.user
    })).then(reportComment ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedComments: arrayUnion(reportComment.id)
    }) : null).then(() => schedulePushReportNotification()).then(() => setFinishedReporting(true)).then(() => setReportCommentModal(false))
    }
    else {

      addDoc(collection(db, 'profiles', reportComment.user, 'reportedContent'), {
      content: reportComment.id,
      reason: item,
      post: focusedPost,
      comment: reportComment.comment == undefined ? reportComment.reply : reportComment.comment,
       message: false,
      cliqueMessage: false,
      timestamp: serverTimestamp()
    }).then(() => addDoc(collection(db, 'profiles', reportComment.user, 'notifications'), {
      like: false,
comment: reportComment.comment == undefined ? reportComment.reply : reportComment.comment,
      friend: false,
      item: item,
      request: false,
      acceptRequest: false,
      theme: false,
      report: true,
      postId: focusedPost.id,
      requestUser: reportComment.user,
      requestNotificationToken: reportNotificationToken,
      post: focusedPost,
       message: false,
      cliqueMessage: false,
      likedBy: [],
      timestamp: serverTimestamp()
    })).then(() => addDoc(collection(db, 'profiles', reportComment.user, 'checkNotifications'), {
      userId: reportComment.user
    })).then(reportComment ? async() => await updateDoc(doc(db, 'profiles', user.uid), {
      reportedComments: arrayUnion(reportComment.id)
    }) : null).then(() => schedulePushReportNotification()).then(() => setFinishedReporting(true)).then(() => setReportCommentModal(false))
    }
    setTimeout(() => {
        setCommentsLoading(false)
    }, 1000);
    }
  return (
    <View style={styles.container}>
                {commentsLoading ? <View style={{flex: 1, alignItems: 'center', justifyContent:'center', marginBottom: '20%'}}>
        <ActivityIndicator size={'large'} color={"#9EDAFF"}/> 
        </View> : !finishedReporting ? 
                <>
                <Text style={[styles.reportContentText, {color: "#fafafa"}]}>Why Are You Reporting This Content?</Text>
                <Text style={[styles.reportSupplementText, {marginBottom: '5%', color: "#fafafa"}]}>Don't Worry Your Response is Anonymous! If it is a Dangerous Emergency, Call the Authorities Right Away!</Text>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Discrimination')}>
                  <Text style={[styles.reportSupplementText, {color: "#fafafa"}]}>Discrimination</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('General Offensiveness')}>
                  <Text style={[styles.reportSupplementText, {color: "#fafafa"}]}>General Offensiveness</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Gore/Excessive Blood')}>
                  <Text style={[styles.reportSupplementText, {color: "#fafafa"}]}>Gore / Excessive Blood</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Nudity/NSFW Sexual Content')}>
                  <Text style={[styles.reportSupplementText, {color: "#fafafa"}]}>Nudity / NSFW Sexual Content</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Scammer/Fraudulent User')}>
                  <Text style={[styles.reportSupplementText, {color: "#fafafa"}]}>Scammer / Fraudulent User</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Spam')}>
                  <Text style={[styles.reportSupplementText, {color: "#fafafa"}]}>Spam</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Toxic/Harassment')}>
                  <Text style={[styles.reportSupplementText, {color: "#fafafa"}]}>Toxic / Harassment</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Violent Behavior')}>
                  <Text style={[styles.reportSupplementText, {color: "#fafafa"}]}>Violent Behavior</Text>
                  
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.listItemContainer} onPress={() => onSecondPress('Other')}>
                  <Text style={[styles.reportSupplementText, {color: "#fafafa"}]}>Other</Text>
                  
                </TouchableOpacity> 
            </>  : 
            <View style={{flex: 1}}>
            <MaterialCommunityIcons name='close' color={"#fafafa"}  size={35} style={{margin: '5%', textAlign: 'right', marginBottom: 0}} onPress={() => navigation.goBack()}/>
            <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
            <Text style={[styles.reportContentText, {fontSize: 24, color: "#fafafa", fontWeight: '600', fontFamily: 'Montserrat_600SemiBold', marginVertical: '5%'}]}>Thanks for submitting your anonymous response!</Text>
            <Text style={[styles.reportContentText, {fontSize: 24, color: "#fafafa", fontWeight: '600', fontFamily: 'Montserrat_600SemiBold', marginVertical: '5%'}]}>User has been notified about the report.</Text>
            <Text style={[styles.reportContentText, {fontSize: 24, color: "#fafafa", fontWeight: '600', fontFamily: 'Montserrat_600SemiBold', marginVertical: '5%'}]}>Thanks for keeping NuCliq safe!</Text>
            </View>
            </View>
            }
        </View>
  )
}

export default ReportModal

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212"
    }
})