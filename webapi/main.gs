/**
LINE 予約システム
2022.05 ver.1

仕様
liff内蔵のformから予約内容の送信、spreadに書き込み　のためのWebapi
予約状況をlineidで参照、キャンセル可
前日リマインド
*/
var spreadsheet_id = SpreadsheetApp.getActiveSpreadsheet().getId()
//シート内のコンテンツをクリアして始める
var logSheet = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('Log');
logSheet.clearContents();
Logger = BetterLog.useSpreadsheet(spreadsheet_id);
//Logger.log("Start");
//Logger.log("spreadsheet_id=" + spreadsheet_id);

var reserveSheet = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('予約リスト');
var calendarSheet = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('カレンダー設定');
var configSheet = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('システム設定');
var access_token = configSheet.getRange(1, 8).getValue()
var lastrow = 0;

function GetReserved(lineId) {
  lastrow = reserveSheet.getLastRow();
  if (lastrow > 1) {
    var lineIdCheckSheet = reserveSheet.getRange(2, 2, lastrow - 1, 10).getValues()
    var checkedRows = []
    var now = new Date()
    now.setDate(now.getDate() - 1)
    now.setHours(23);
    now.setMinutes(59);
    now.setSeconds(59);
    for (var i = 0; i < lineIdCheckSheet.length; i++) {
      //予約リストに同LINEIDで予約済みのものがあるかどうか
      if (lineIdCheckSheet[i][1] == lineId && lineIdCheckSheet[i][0] == "完了" && lineIdCheckSheet[i][5].getTime() > now.getTime()) {
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
          "num1": rowData[0][6],
          "num2": rowData[0][7],
          "name": rowData[0][8],
          "tel": rowData[0][9],
          "memo": rowData[0][10],
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
  var now = new Date()
  var h = now.getHours()
  var m = now.getMinutes()
  var s = now.getSeconds()
  var ms = now.getMilliseconds()
  now.setHours(00);	
  now.setMinutes(00);	
  now.setSeconds(00);	
  now.setMilliseconds(00)	
  startDate.setHours(00);	
  startDate.setMinutes(00);	
  startDate.setSeconds(00);	
  startDate.setMilliseconds(00)	
  if(now.getTime()==startDate.getTime()){	
    startDate.setHours(h);	
    startDate.setMinutes(m);	
    startDate.setSeconds(s);	
    startDate.setMilliseconds(ms)	
  }	
  var endDate = new Date(dateVal);
  endDate.setDate(endDate.getDate()+21);
  //endDate.setMonth(endDate.getMonth()+3);
//Logger.log(Utilities.formatDate(new Date(startDate), 'JST', 'yyyy年MM月dd日'));
//Logger.log(Utilities.formatDate(new Date(endDate), 'JST', 'yyyy年MM月dd日'));
  var myEvent = [];
  calendarID.forEach(function(ID){	
//Logger.log(calendarID)
    let myCalendar = CalendarApp.getCalendarById(ID[0]);
    try{	
      let event = myCalendar.getEvents(startDate, endDate);	
//Logger.log(event)
      Array.prototype.push.apply(myEvent,event)	
    }catch{	
      Logger.log("getEvents エラー")	
    }	
  });
  myEvent.sort((a, b) => {
    if (a.getStartTime() > b.getStartTime()) {
      return 1;
    } else {
      return -1;
    }	
  });	

  var arr = [];
  for (var i = 0; i < myEvent.length; i++) {
//Logger.log(myEvent[i].getTitle() + ' ' +  Utilities.formatDate(new Date(myEvent[i].getStartTime()), 'JST', 'yyyy年MM月dd日') + ' ' + Utilities.formatDate(new Date(myEvent[i].getStartTime()), 'JST', 'HH:mm'))	
    //コメント化
    if (myEvent[i].getTitle().match(/\#/)) continue
    //過去イベント
    var now = new Date();
    if (myEvent[i].getStartTime() < now) continue
    if (myEvent[i].getTitle().indexOf("/") < 0) continue
    //定員over
  //Logger.log(myEvent[i].getTitle());
    var titArr = myEvent[i].getTitle().match(/[0-9]+\/[0-9]+/)[0].split("/")
    if (Number(titArr[0]) >= Number(titArr[1])) continue
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
//Logger.log("doGet");
  if(e.parameter.act=="new"){
    return GetEvent(new Date());
  }
  else if (e.parameter.act=="check"){
    return GetReserved(e.parameter.lineId);
  }
}



function doPost(e) {
//Logger.log('doPost:' + e.postData.getDataAsString());
  var json = JSON.parse(e.postData.getDataAsString());
  var res = "";
  var lastrow = reserveSheet.getLastRow();
  if (json.action == "reserve"){  
    //予約する　予約シートに書き込み
    var existCheck = reserveSheet.getRange(1, 1, lastrow, 14).getValues();
    var row = 0;
    //ヘッダーあり　1から開始
    for (var i = 1; i < existCheck.length; i++) {
      if (existCheck[i][2] == json.lineId && existCheck[i][5] == json.eventId) {
        row = i;
        break;
      }
    }
    var addnew = true;
    //既に予約済み
    if (row >= 0 && existCheck[row][1] == "完了") {
      res = {"status":"error", "message":"すでに予約済みです。変更する場合は先にキャンセルしてから再度予約をお願いいたします。"}

    }
    //予約する
    else {      
      //新規？
      if (row == 0) {
        row = lastrow + 1;
        addnew = true;
      }else{
        row = row + 1;
        addnew = false;
      }
//Logger.log(row);
      reserveSheet.getRange(row, 1).setValue(Utilities.formatDate(new Date(), 'JST', 'yyyy/MM/dd HH:mm'));
      reserveSheet.getRange(row, 2).setValue("完了");
      reserveSheet.getRange(row, 3).setValue(json.lineId);
      reserveSheet.getRange(row, 4).setValue(json.calId);
      reserveSheet.getRange(row, 5).setValue(json.eventName.replace(/\[[0-9]+\/[0-9]+\]/, ""));
      reserveSheet.getRange(row, 6).setValue(json.eventId);
      reserveSheet.getRange(row, 7).setValue(json.eventDate);
      reserveSheet.getRange(row, 8).setValue(json.eventTime);
      reserveSheet.getRange(row, 9).setValue(json.num);
      reserveSheet.getRange(row, 10).setValue(json.num1);
      reserveSheet.getRange(row, 11).setValue(json.num2);
      reserveSheet.getRange(row, 12).setValue(json.name);
      reserveSheet.getRange(row, 13).setValue(json.tel);
      reserveSheet.getRange(row, 14).setValue(json.memo);

      if(addnew){
        //カレンダーの残人数を更新する
        var eventGet = CalendarApp.getCalendarById(json.calId).getEventById(json.eventId);
        var num = eventGet.getTitle().match(/[0-9]+\/[0-9]+/)[0].split("/")
        //todo 定員over無視する
        //if (Number(num[0]) + Number(json.num) > Number(num[1])) {
        //  res = {"status":"error", "message":"定員オーバー"}
        //} else {
          var cnum = Number(num[0]) + Number(json.num)
          var numUp = "[" + cnum + "/" + num[1] + "]"
          var titleUp = eventGet.getTitle().replace(/\[[0-9]+\/[0-9]+\]/, numUp)
          eventGet.setTitle(titleUp)
          //postSlackbot(idCheck[0], json.events[0].postback.data)
          res = {"status":"success", "message":"予約が完了しました"}
        //}
      }
      else{
          res = {"status":"success", "message":"予約を変更しました"}
      }

      //MAIL
      sendMail("【LINE予約】予約を受けました", row);
      //LINE push
      if(json.lineId.match(/U[0-9a-f]{32}/)){
        Push_flexMessage(json.lineId, Utilities.formatDate(new Date(json.eventDate), 'JST', 'yyyy年MM月dd日'),json.eventTime, "下記の通り受付いたしました", "#4061c2");
      }
    }

  } else if(json.action == "cancel"){
    //キャンセルの流れ
    var existCheck = reserveSheet.getRange(1, 1, lastrow, 14).getValues();
    var row = 0;
    //ヘッダーあり　1から開始
    for (var i = 1; i < existCheck.length; i++) {
      if (existCheck[i][2] == json.lineId && existCheck[i][5] == json.eventId) {
        row = i;
        break;
      }
    }
    //見つからない
    if (row == 0){
      res = {"status":"error", "message":"予約が見つかりません"}
    }
    //既にキャンセル
    else if (reserveSheet.getRange(row, 2) == "キャンセル") {
      res = {"status":"error", "message":"すでにキャンセル済みです"}
    }
    //キャンセルする
    else {
      row = row + 1;
      reserveSheet.getRange(row, 2).setValue("キャンセル")

      //カレンダーの残人数を更新する
      var eventGet = CalendarApp.getCalendarById(json.calId).getEventById(json.eventId);
      var num = eventGet.getTitle().match(/[0-9]+\/[0-9]+/)[0].split("/")
      var cnum = Number(num[0]) - Number(json.num)
      var numUp = "[" + cnum + "/" + num[1] + "]"
      var titleUp = eventGet.getTitle().replace(/\[[0-9]+\/[0-9]+\]/, numUp)
      eventGet.setTitle(titleUp)
      //postSlackbot(idCheck[0], json.events[0].postback.data)
      res = {"status":"success", "message":"キャンセルしました"}
      //MAIL
      sendMail("【LINE予約】キャンセルがありました", row);
      //LINE push
      if(json.lineId.match(/U[0-9a-f]{32}/)){
        Push_flexMessage(json.lineId, Utilities.formatDate(new Date(json.eventDate), 'JST', 'yyyy年MM月dd日'),json.eventTime, "キャンセルいたしました", "#eb8509");
      }
    }
  }
Logger.log(JSON.stringify(res));
  let output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(JSON.stringify(res));
  return output;
}

function test() {
  
  //Logger.log(CalendarApp.getCalendarById("fha1sqff9ll5cc8b58n77fp2v8@group.calendar.google.com"));
  GetEvent(new Date);

  return;
  
  // カレンダーを取得する（*****は隠し文字）
  var calendar = CalendarApp.getCalendarById("hlaih6sk1mq8omsabf00ronq9g@group.calendar.google.com")
  var event = calendar.getEventById("CSVConvertcc0e988e6cccda1016fd7f0114c0ed39")
//  var event = calendar.getEvents(new Date('2022-5-1'), new Date('2022-5-15'));//getEventById("CSVConvertcc0e988e6cccda1016fd7f0114c0ed39")
  // ログに出力
  Logger.log(calendar) // Calendar
  Logger.log(event) 
}


function test2() {
  lastrow = configSheet.getLastRow();
  //アクセス可能なカレンダーのIDを指定して、Googleカレンダーを取得する
  var calendarID = configSheet.getRange(2,1,lastrow-1,1).getValues()
  var startDate = new Date();	
  var now = new Date()	
  var h = now.getHours()	
  var m = now.getMinutes()	
  var s = now.getSeconds()	
  var ms = now.getMilliseconds()	
  now.setHours(00);	
  now.setMinutes(00);	
  now.setSeconds(00);	
  now.setMilliseconds(00)	
  startDate.setHours(00);	
  startDate.setMinutes(00);	
  startDate.setSeconds(00);	
  startDate.setMilliseconds(00)	
  if(now.getTime()==startDate.getTime()){	
    startDate.setHours(h);	
    startDate.setMinutes(m);	
    startDate.setSeconds(s);	
    startDate.setMilliseconds(ms)	
  }	
  var endDate = new Date();
  //2022.6.21 ここで絞るとメールスクレイピングで先日付の予約取込に失敗する
  //endDate.setMonth(endDate.getMonth()+1);
  endDate.setMonth(endDate.getMonth()+9);
//Logger.log(Utilities.formatDate(new Date(startDate), 'JST', 'yyyy年MM月dd日'));
Logger.log(Utilities.formatDate(new Date(endDate), 'JST', 'yyyy年MM月dd日'));
  var myEvent = [];
  calendarID.forEach(function(ID){	
    let myCalendar = CalendarApp.getCalendarById(ID[0]);
    try{	
      let events = myCalendar.getEvents(startDate, endDate);	
//Logger.log(events)	
      Array.prototype.push.apply(myEvent,events)	
    }catch{	
      Logger.log("getEvents エラー")	
    }	
  });
  myEvent.sort((a, b) => {
    if (a.getStartTime() > b.getStartTime()) {
      return 1;
    } else {
      return -1;
    }	
  });	
Logger.log(JSON.stringify(myEvent))
}
