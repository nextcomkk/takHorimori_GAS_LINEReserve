function postSlackbot(val,check) {
  //SlackAPIで登録したボットのトークンを設定する
  let token = sheet2.getRange(1,9).getValue();

  var message = "予 約 者："+val[8]+"\n"+
                "利用日時："+Utilities.formatDate(new Date(val[5]), 'JST', 'yyyy/MM/dd')+" "+val[6]+"\n"+
                "イベント："+val[3].replace(/\[[0-9]+\/[0-9]+\]/,"")+"\n"+
                "人　　数："+val[7]+"\n"+
                "連 絡 先："+val[9]+"\n"+
                "LINE ID："+val[1]+"\n";
  if(check=="cancel") message = "【キャンセル】"+"\n"+message
  //ライブラリから導入したSlackAppを定義し、トークンを設定する
  let slackApp = SlackApp.create(token);
  //Slackボットがメッセージを投稿するチャンネルを定義する
  let channelId = "<channelId>";
  //Slackボットが投稿するメッセージを定義する
  //SlackAppオブジェクトのpostMessageメソッドでボット投稿を行う
  slackApp.postMessage(channelId, message);
}
