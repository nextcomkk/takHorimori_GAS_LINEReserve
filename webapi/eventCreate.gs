function eventCreate() {
  lastrow = calendarSheet.getLastRow();
  var calRow = calendarSheet.getRange(2,1,lastrow,11).getValues()
  var today = new Date()
  today.setHours(0,0,0,0);
  var titleUp="";
  var startTime;
  var endTime;
  var cal;
  //var event;
  for(var i=0; i<lastrow-1; i++){
    var eventDate = new Date(calRow[i][0])
    eventDate.setHours(0,0,0,0)
    if(calRow[i][9]==""){
      if(eventDate.getTime()<=today.getTime() || calRow[i][4]=="" || calRow[i][0]=="") continue;

      titleUp = "[" + Number(calRow[i][5]) + "/" + Number(calRow[i][4]) + "]" + calRow[i][3]
      startTime = new Date(Utilities.formatDate(calRow[i][0], "Asia/Tokyo", "yyyy/MM/dd") + " " +
                            Utilities.formatDate(calRow[i][1], "Asia/Tokyo", "HH:mm:ss"))
      endTime = new Date(Utilities.formatDate(calRow[i][0], "Asia/Tokyo", "yyyy/MM/dd") + " " +
                            Utilities.formatDate(calRow[i][2], "Asia/Tokyo", "HH:mm:ss"))
//      Logger.log(calRow[i][8]);
//      Logger.log(titleUp);
//      Logger.log(startTime);
//      Logger.log(endTime);
      // カレンダーを取得する(ID未入力のときデフォルトカレンダー)
      if(calRow[i][8]==""){
        cal = CalendarApp.getDefaultCalendar();
      } else {
        cal = CalendarApp.getCalendarById(calRow[i][8]);
      }
      var event = cal.createEvent(
                            titleUp, startTime, endTime, 
                            {description:calRow[i][7],
                            location:calRow[i][6]
                            });
//      Logger.log(event.getId());
      //eventId
      calendarSheet.getRange(i+2,10).setValue(event.getId());

    } else if(calRow[i][10]!=""){
      if(calRow[i][8]==""){
        cal = CalendarApp.getDefaultCalendar();
      } else {
        cal = CalendarApp.getCalendarById(calRow[i][8]);
      }      
      var event = cal.getEventById(calRow[i][9]);

      if(calRow[i][10]=="d"){
        //削除コマンド
        event.deleteEvent();
        //eventId
        calendarSheet.getRange(i+2,10).setValue("削除済");
      } else if(calRow[i][10]=="u"){
        //更新コマンド
        titleUp = "[" + Number(calRow[i][5]) + "/" + Number(calRow[i][4]) + "]" + calRow[i][3];
//Logger.log(titleUp);
        event.setTitle(titleUp);
        event.setDescription(calRow[i][7]);
        event.setLocation(calRow[i][6]);
        calendarSheet.getRange(i+2,11).setValue("更新済");
      } else {
        //なにもしない
      }
      
    }
  }
}
function eventAllDelete() {
  lastrow = calendarSheet.getLastRow();
  var calRow = calendarSheet.getRange(2,1,lastrow,10).getValues()
  var today = new Date()
  today.setHours(0,0,0,0);
  var titleUp="";
  var startTime;
  var endTime;
  var cal;
  //var event;
  for(var i=0; i<lastrow-1; i++){
    if(calRow[i][9]!=""){
      // カレンダーを取得する(ID未入力のときデフォルトカレンダー)
      if(calRow[i][8]==""){
        cal = CalendarApp.getDefaultCalendar();
      } else {
        cal = CalendarApp.getCalendarById(calRow[i][8]);
      }      
      var event = cal.getEventById(calRow[i][9]);
      event.deleteEvent();
      //eventId
      calendarSheet.getRange(i+2,10).setValue("");
    }
  }
}

function eventAllGet() {
  lastRow = calendarSheet.getLastRow();
  var row =  configSheet.getRange(1, 1).getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow();
  //アクセス可能なカレンダーのIDを指定して、Googleカレンダーを取得する
  var calendarID = configSheet.getRange(1,1,row,1).getValues()
  var startDate = new Date();
  //var startDate = new Date(2022,6,20);
  var endDate = new Date(startDate);
  endDate.setDate(endDate.getDate()+200);
  var myEvent = [];	
  calendarID.forEach(function(ID){	
    let myCalendar = CalendarApp.getCalendarById(ID[0]);	
    try{	
      let events = myCalendar.getEvents(startDate, endDate);	
      Array.prototype.push.apply(myEvent,events)	
Logger.log(ID[0]);
Logger.log(events.length);
    }catch{	
      Logger.log("エラー")	
Logger.log(ID[0]);
    }	
  });
  myEvent.sort((a, b) => {
    if (a.getStartTime() > b.getStartTime()) {
      return 1;
    } else {
      return -1;
    }	
  });
  var row = lastRow + 1;
  for(var i=0; i<myEvent.length-1; i++){
    var teiin;
    var ninzu;

    if(myEvent[i].getTitle().indexOf("[")>=0){
      var titArr = myEvent[i].getTitle().match(/[0-9]+\/[0-9]+/)[0].split("/")
      teiin = titArr[1];
      ninzu = titArr[0];
    }else{
      teiin = "";
      ninzu = "";
    }    
    calendarSheet.getRange(row,1).setValue(Utilities.formatDate(new Date(myEvent[i].getStartTime()), 'JST', 'yyyy/MM/dd'));
    calendarSheet.getRange(row,2).setValue(Utilities.formatDate(new Date(myEvent[i].getStartTime()), 'JST', 'HH:mm'));
    calendarSheet.getRange(row,3).setValue(Utilities.formatDate(new Date(myEvent[i].getEndTime()), 'JST', 'HH:mm'));
    calendarSheet.getRange(row,4).setValue(myEvent[i].getTitle().replace(/\[[0-9]+\/[0-9]+\]/, ""));
    calendarSheet.getRange(row,5).setValue(teiin);
    calendarSheet.getRange(row,6).setValue(ninzu);
    calendarSheet.getRange(row,7).setValue(myEvent[i].getLocation());
    calendarSheet.getRange(row,8).setValue(myEvent[i].getDescription());
    calendarSheet.getRange(row,9).setValue(myEvent[i].getOriginalCalendarId());
    calendarSheet.getRange(row,10).setValue(myEvent[i].getId());
    row = row + 1;
  }
}


function eventGetTest() {
  let myCalendar = CalendarApp.getCalendarById("catclnr15qegcdfbiprrolv6oc@group.calendar.google.com");	
  let myEvent = myCalendar.getEvents(new Date("2022/7/23 00:00:00"), new Date("2022/7/24 23:59:00"));	

  for(var i=0; i<myEvent.length-1; i++){
    Logger.log(myEvent[i].getTitle());
    Logger.log(Utilities.formatDate(new Date(myEvent[i].getStartTime()), 'JST', 'yyyy/MM/dd'));
    Logger.log(Utilities.formatDate(new Date(myEvent[i].getStartTime()), 'JST', 'HH:mm'));
    Logger.log(Utilities.formatDate(new Date(myEvent[i].getEndTime()), 'JST', 'HH:mm'));
    Logger.log(myEvent[i].getTitle().replace(/\[[0-9]+\/[0-9]+\]/, ""));
    Logger.log(myEvent[i].getLocation());
    Logger.log(myEvent[i].getDescription());
    Logger.log(myEvent[i].getOriginalCalendarId());
    Logger.log(myEvent[i].getId());
  }
}