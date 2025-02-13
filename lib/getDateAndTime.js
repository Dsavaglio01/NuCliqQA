import getCalculatedTime from "./getTime";
function getDateAndTime(timestamp) {
      if (timestamp != null) {
        //const formattedDate = new Date(timestamp.seconds*1000)
        //return formattedDate.toLocaleString()
      //console.log(date)
      var t = new Date(Date.UTC(1970, 0, 1)); // Epoch
      t.setUTCSeconds(timestamp.seconds);
      const date = new Date(t);
      const yesterday = new Date();
      const twodays = new Date();
      const threedays = new Date();
      const fourdays = new Date();
      const fivedays = new Date();
      const sixdays = new Date();
      const lastWeek = new Date();
      const twoWeeks = new Date();
      const threeWeeks = new Date();
      const fourWeeks = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      twoWeeks.setDate(twoWeeks.getDate() - 14);
      threeWeeks.setDate(threeWeeks.getDate() - 21);
      fourWeeks.setDate(fourWeeks.getDate() - 28);
      twodays.setDate(twodays.getDate() - 2);
      threedays.setDate(threedays.getDate() - 3);
      fourdays.setDate(fourdays.getDate() - 4);
      fivedays.setDate(fivedays.getDate() - 5);
      sixdays.setDate(sixdays.getDate() - 6);
      yesterday.setDate(yesterday.getDate() - 1);
      if  (date.getTime() >= yesterday.getTime()) {
        return `${getCalculatedTime(timestamp)}`
      }
      else if (date.getTime() <= fourWeeks.getTime()) {
        return `${new Date(timestamp.seconds*1000).toLocaleDateString()}`
      }
      else if (date.getTime() <= threeWeeks.getTime()) {
        return `3w ago`
      }
      else if (date.getTime() <= twoWeeks.getTime()) {
        return `2w ago`
      }
      else if (date.getTime() <= lastWeek.getTime()) {
        return `1w ago`
      }
      else if (date.getTime() <= sixdays.getTime()) {
        return `6d ago`
      }
      else if (date.getTime() <= fivedays.getTime()) {
        return `5d ago`
      }
      else if (date.getTime() <= fourdays.getTime()) {
        return `4d ago`
      }
      else if (date.getTime() <= threedays.getTime()) {
        return `3d ago`
      }
      else if (date.getTime() <= twodays.getTime()) {
        return `2d ago`
      }
      else if (date.getTime() <= yesterday.getTime()) {
        return `Yesterday`
      } 
      }
      
    }
    export default getDateAndTime;