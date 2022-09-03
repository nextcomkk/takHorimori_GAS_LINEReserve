function Push_Message(lineId, text) {
  const url = 'https://api.line.me/v2/bot/message/push';

  const payload = {
    to: lineId,
    messages: [
      { type: 'text', text: text }
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

function Push_flexMessage(lineId, date, time, text, color) {
  const url = 'https://api.line.me/v2/bot/message/push';
  const payload = {
    to: lineId,
    "messages": [
      {
        'type': 'flex',
        'altText': '予約内容の確認',
        'contents':
        {
          "type": "bubble",
          "size": "kilo",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": text,
                "color": "#ffffff",
                "size": "md",
                "align": "center"
              },
              {
                "type": "text",
                "text": " "
              },
              {
                "type": "text",
                "text": date,
                "weight": "bold",
                "color": "#ffffff",
                "size": "lg",
                "align": "center"
              },
              {
                "type": "text",
                "text": time,
                "color": "#ffffff",
                "size": "lg",
                "align": "center"
              }
            ],
            "paddingAll": "20px",
            "backgroundColor": color
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
Logger.log(JSON.stringify(params));
  UrlFetchApp.fetch(url, params);
}