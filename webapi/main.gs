var spreadsheet_id = SpreadsheetApp.getActiveSpreadsheet().getId()
//シート内のコンテンツをクリアして始める
var logSheet = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('Log');
logSheet.clearContents();
Logger = BetterLog.useSpreadsheet(spreadsheet_id);
Logger.log("Start");
Logger.log("spreadsheet_id=" + spreadsheet_id);

var reserveSheet = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('予約リスト');
var configSheet = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('カレンダー設定');
var access_token = configSheet.getRange(1, 8).getValue()
var lastrow = 0;

function GetReserved(lineId) {
  lastrow = reserveSheet.getLastRow();
  if (lastrow > 1) {
    var lineIdCheckSheet = reserveSheet.getRange(2, 2, lastrow - 1, 10).getValues()
    var checkedRows = []
    var date = new Date()
    date.setDate(date.getDate() - 1)
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    for (var i = 0; i < lineIdCheckSheet.length; i++) {
      //予約リストに同LINEIDで予約済みのものがあるかどうか
      if (lineIdCheckSheet[i][1] == lineId && lineIdCheckSheet[i][0] == "完了" && lineIdCheckSheet[i][5].getTime() > date.getTime()) {
        checkedRows.push(i + 2);
      }
    }
    if (checkedRows.length == 0) {
      //なし
      return;
    } else {
      //存在する場合
      var arr = [];
      for (var i = 0; i < checkedRows.length; i++) {
        var rowData = reserveSheet.getRange(checkedRows[i], 4, 1, 8).getValues();
        var date = Utilities.formatDate(new Date(rowData[0][3]), 'JST', 'yyyy年MM月dd日');
        val =
        {
          "calId": rowData[0][0],
          "eventName": rowData[0][1].replace(/\[[0-9]+\/[0-9]+\]/, ""),
          "eventId": rowData[0][2],
          "eventDate": date,
          "eventTime": rowData[0][4],
          "num": rowData[0][5],
          "name": rowData[0][6],
          "tel": rowData[0][7],
          "memo": rowData[0][8],
        }
        arr.push(val);
      }
    }
    var json = arr;
Logger.log(JSON.stringify(json));
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(JSON.stringify(json));
    return output;

  } else {
    //はじめての予約者
    return;
  }
}

function GetEvent(dateVal) {
  lastrow = configSheet.getLastRow();
  //アクセス可能なカレンダーのIDを指定して、Googleカレンダーを取得する
  var calendarID = configSheet.getRange(2,1,lastrow-1,1).getValues()

  var startDate = new Date(dateVal);	
  var date = new Date()	
  var h = date.getHours()	
  var m = date.getMinutes()	
  var s = date.getSeconds()	
  var ms = date.getMilliseconds()	
  date.setHours(00);	
  date.setMinutes(00);	
  date.setSeconds(00);	
  date.setMilliseconds(00)	
  startDate.setHours(00);	
  startDate.setMinutes(00);	
  startDate.setSeconds(00);	
  startDate.setMilliseconds(00)	
  if(date.getTime()==startDate.getTime()){	
    startDate.setHours(h);	
    startDate.setMinutes(m);	
    startDate.setSeconds(s);	
    startDate.setMilliseconds(ms)	
  }	
  var endDate = new Date(dateVal);
  endDate.setDate(endDate.getDate()+31);
  var myEvent = [];
  calendarID.forEach(function(ID){	
    let myCalendar = CalendarApp.getCalendarById(ID[0]);
Logger.log(ID[0])	
    try{	
      let event = myCalendar.getEvents(startDate, endDate);	
      //Logger.log(event)	
      Array.prototype.push.apply(myEvent,event)	
    }catch{	
      Logger.log("エラー")	
    }	
  });
  myEvent.sort((a, b) => {
    if (a.getStartTime() > b.getStartTime()) {
      return 1;
    } else {
      return -1;
    }	
  });	
  for(var i=0;i<myEvent.length;i++){
    if(myEvent[i].getStartTime().getDate()==startDate.getDate()){
      if(myEvent[i].getStartTime().getTime()<startDate.getTime()){
        //Logger.log(myEvent[i].getTitle())	
        myEvent.splice(1,1)	
      }
    }	
  }

  var arr = [];
  for (var i = 0; i < myEvent.length; i++) {
    if (myEvent[i].getTitle().match(/\#/)) continue
    var now = new Date();
    if (myEvent[i].getStartTime() < now) continue
    var titArr = myEvent[i].getTitle().match(/[0-9]+\/[0-9]+/)[0].split("/")
    if (Number(titArr[0]) >= Number(titArr[1])) {
      continue
    }

    var nn = titArr[1] - titArr[0]
    var date = Utilities.formatDate(new Date(myEvent[i].getStartTime()), 'JST', 'yyyy年MM月dd日');
    var startTime = Utilities.formatDate(new Date(myEvent[i].getStartTime()), 'JST', 'HH:mm');
    var endTime = Utilities.formatDate(new Date(myEvent[i].getEndTime()), 'JST', 'HH:mm');
    var val = {
            "calId": myEvent[i].getOriginalCalendarId(),
            "eventName": myEvent[i].getTitle().replace(/\[[0-9]+\/[0-9]+\]/, ""),
            "eventId": myEvent[i].getId(),
            "eventDate": date,
            "eventTime": startTime + "～" + endTime,
            "seats": nn,
            "memo": myEvent[i].getDescription().slice(0, myEvent[i].getDescription().indexOf("*****")).replace(/<br>/g, "\n").replace(/<(".*?"|'.*?'|[^'"])*?>/g, ""),
          }
    arr.push(val);
  }
  var json = arr;
  Logger.log(JSON.stringify(json));
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(JSON.stringify(json));
  return output;
}



function doGet(e) {
Logger.log("doGet");
  if(e.parameter.act=="new"){
    return GetEvent(new Date());
  }
  else if (e.parameter.act=="check"){
    return GetReserved(e.parameter.lineId);
  }
}



function doPost(e) {
Logger.log('doPost:' + e.postData.getDataAsString());
  var json = JSON.parse(e.postData.getDataAsString());
  var res = "";
  var lastrow = reserveSheet.getLastRow();
  if (json.action == "reserve"){  
    //予約する　予約シートに書き込み
    var existCheck = reserveSheet.getRange(2, 1, lastrow-1, 7).getValues();
    var row = 0;
    for (var i = 0; i < existCheck.length; i++) {
      if (existCheck[i][3] == json.lineId && existCheck[i][3] == json.eventId) {
        row = i + 2;
        break;
      }
    }
    //見つからない
    if (row == 0) {
      row = lastrow;
    }
    //既に予約済み
    if (row >= 0 && existCheck[row-2][0] == "完了") {
      res = {"status":"error", "message":"すでに予約済みです"}

    }
    //予約する
    else {      
      reserveSheet.getRange(row + 1, 1).setValue(Utilities.formatDate(new Date(), 'JST', 'yyyy/MM/dd HH:mm'));
      reserveSheet.getRange(row + 1, 2).setValue("完了");
      reserveSheet.getRange(row + 1, 3).setValue(json.lineId);
      reserveSheet.getRange(row + 1, 4).setValue(json.calId);
      reserveSheet.getRange(row + 1, 5).setValue(json.eventName.replace(/\[[0-9]+\/[0-9]+\]/, ""));
      reserveSheet.getRange(row + 1, 6).setValue(json.eventId);
      reserveSheet.getRange(row + 1, 7).setValue(json.eventDate);
      reserveSheet.getRange(row + 1, 8).setValue(json.eventTime);
      reserveSheet.getRange(row + 1, 9).setValue(json.num);
      reserveSheet.getRange(row + 1, 10).setValue(json.name);
      reserveSheet.getRange(row + 1, 11).setValue(json.tel);
      reserveSheet.getRange(row + 1, 12).setValue(json.memo);

      //カレンダーの残人数を更新する
      var eventGet = CalendarApp.getCalendarById(json.calId).getEventById(json.eventId);
      var num = eventGet.getTitle().match(/[0-9]+\/[0-9]+/)[0].split("/")
      if (Number(num[0]) + Number(json.num) > Number(num[1])) {
        res = {"status":"error", "message":"定員オーバー"}

      } else {
        var cnum = Number(num[0]) + Number(json.num)
        var numUp = "[" + cnum + "/" + num[1] + "]"
        var titleUp = eventGet.getTitle().replace(/\[[0-9]+\/[0-9]+\]/, numUp)
        eventGet.setTitle(titleUp)
        //postSlackbot(idCheck[0], json.events[0].postback.data)
        res = {"status":"success", "message":"予約完了"}

      }
    }

  } else if(json.action == "cancel"){
    //キャンセルの流れ
    var existCheck = reserveSheet.getRange(2, 1, lastrow - 1, 7).getValues();
    var row = 0;
    for (var i = 0; i < existCheck.length; i++) {
      if (existCheck[i][3] == json.lineId && existCheck[i][3] == json.eventId) {
        row = i + 2;
        break;
      }
    }
    //見つからない
    if (row == 0){
      res = {"status":"error", "message":"予約が見つかりません"}

    }
    //既にキャンセル
    else if (existCheck[row-2][0] == "キャンセル") {
      res = {"status":"error", "message":"キャンセル済みです"}
    }
    //キャンセルする
    else {
      reserveSheet.getRange(row, 2).setValue("キャンセル")

      //カレンダーの残人数を更新する
      var eventGet = CalendarApp.getCalendarById(json.calId).getEventById(json.eventId);
      var num = eventGet.getTitle().match(/[0-9]+\/[0-9]+/)[0].split("/")
      if (Number(num[0]) + Number(json.num) > Number(num[1])) {
        res = {"status":"error", "message":"定員オーバー"}

      } else {
        var cnum = Number(num[0]) - Number(json.num)
        var numUp = "[" + cnum + "/" + num[1] + "]"
        var titleUp = eventGet.getTitle().replace(/\[[0-9]+\/[0-9]+\]/, numUp)
        eventGet.setTitle(titleUp)
        //postSlackbot(idCheck[0], json.events[0].postback.data)
        res = {"status":"success", "message":"キャンセル完了"}
      }
    }
  }
Logger.log(JSON.stringify(res));
  let output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(JSON.stringify(res));
  return output;
}
