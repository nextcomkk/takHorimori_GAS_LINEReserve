function sendMail(title, reserveSheetRow) {
//Logger.log("sendMail");
  var mailAddress = configSheet.getRange("C2").getValue();
//Logger.log(mailAddress);
//Logger.log(reserveSheet.getRange(reserveSheetRow,12).getValue());
//Logger.log(reserveSheet.getRange(reserveSheetRow,8).getValue());
//Logger.log(reserveSheet.getRange(reserveSheetRow,9).getValue());
//Logger.log(reserveSheet.getRange(reserveSheetRow,10).getValue());
//Logger.log(reserveSheet.getRange(reserveSheetRow,11).getValue());
//Logger.log(reserveSheet.getRange(reserveSheetRow,13).getValue());
//Logger.log(reserveSheet.getRange(reserveSheetRow,14).getValue());
  var message = "予 約 者："+reserveSheet.getRange(reserveSheetRow,12).getValue()+"\n"+
                "利用日時："+Utilities.formatDate(new Date(reserveSheet.getRange(reserveSheetRow,7).getValue()), 'JST', 'yyyy/MM/dd')+" "+reserveSheet.getRange(reserveSheetRow,8).getValue()+"\n"+
                "お 子 様："+reserveSheet.getRange(reserveSheetRow,9).getValue()+"（うち２歳未満："+reserveSheet.getRange(reserveSheetRow,10).getValue()+"）\n"+
                "保 護 者："+reserveSheet.getRange(reserveSheetRow,11).getValue()+"\n"+
                "連 絡 先："+reserveSheet.getRange(reserveSheetRow,13).getValue()+"\n"+
                "備　　考："+reserveSheet.getRange(reserveSheetRow,14).getValue()+"\n";
Logger.log(message);
  var options = {
    name:"LINE予約",
    noReply:true
  };
  MailApp.sendEmail(mailAddress, title, message, options);
}

function sendmailtest(){
  sendMail("メールテスト", 16);
}