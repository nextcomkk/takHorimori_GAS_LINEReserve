function reminder() {
  lastrow = sheet.getLastRow();
  var idCheck = sheet.getRange(2,2,lastrow-1,11).getValues()
  var date = new Date()
  date.setDate(date.getDate()+1)
  date.setHours(00);
  date.setMinutes(00);
  date.setSeconds(00);
  date.setMilliseconds(00)

  for(var i=0;i<idCheck.length;i++){
    var date1 = new Date(idCheck[i][5])
    date1.setHours(00)
    date1.setMinutes(00)
    date1.setSeconds(00)
    date1.setMilliseconds(00)
    Logger.log(date1)
    if(idCheck[i][0]=="完了"&&date1.getTime()==date.getTime()) reminMessgae(idCheck[i])

  }
}

function reminMessgae(val){
  const url = 'https://api.line.me/v2/bot/message/push';
  const payload = {
    to: val[1],　//ユーザーID
    "messages" : [
      {
        'type':'flex',
        'altText':'this is a flex message',
        'contents': 
        {　
          "type": "bubble",
          "size": "giga",
          "body": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [
          {
            "type": "text",
            "text": "リマインド",
            "wrap": true,
            "weight": "bold",
            "size": "xl"
          },
          {
            "type": "text",
            "text": val[3],
          },
          {
            "type": "text",
            "text": Utilities.formatDate(new Date(val[5]), 'JST', 'yyyy年MM月dd日') +" "+ val[6]
          },
          {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "人数："+val[7]+"\n"+"お名前："+val[8]+"\n"+"連絡先："+val[9],
                "wrap": true,
                "size": "sm",
                "flex": 0
              }
            ]
          }
        ]
      }
          
        }
      }
    ]
  };
  const params = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + access_token
    },
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, params);
}
