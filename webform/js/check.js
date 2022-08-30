'use strict';

$(function () {
    var today = new Array('日', '月', '火', '水', '木', '金', '土');

    $.getJSON('./config.json', (data) => {
        showloading();
        var api_url = data.api_url;
        var token = data.token;
        var line_id = $("#line_id").val();

        if (line_id != ""){
            getData(api_url,line_id,token);
        }else{
            liff
            .init({
                liffId: data.liffId
            })
            .then(() => {
                if (liff.isLoggedIn()) {
                  liff.getProfile()
                    .then(profile => {
                      $("#line_id").val(profile.userId);
                      var line_id = $("#line_id").val();
                      getData(api_url,line_id,token);
                    })
                  }
                else{
                    hideloading();
                    liff.login();
                }
            })
            .catch((err) => {
              hideloading();
              //alert("err");
            });
        }

        function getData(api_url,line_id,token) {
        //check api
        $.ajax({
            type: 'GET',
            url: api_url,
            data: {
                "act": "check",
                "lineId": line_id,
                "token": token
            },
            dataType: 'JSON',
            cache: false,
            success: function(res){
                console.log(res);
                if(res){
                    function compare( a, b ){
                        var r = 0;
                        if( a.eventDate < b.eventDate ){ r = -1; }
                        else if( a.eventDate > b.eventDate ){ r = 1; }
                        else if(a.eventDate == b.eventDate ){
                            if( a.eventTime < b.eventTime ){ r = -1; }
                            else if( a.eventTime > b.eventTime ){ r = 1; }
                        }
                        return r;
                    }

                    res.sort( compare );
                    for(var i = 0; i<res.length;i++){
                        var eventDate = res[i].eventDate;
                        eventDate = eventDate.slice(0,-1);
                        eventDate = eventDate.replace('年','/').replace('月','/');
                        var day = new Date(Date.parse(eventDate));
                        var week = today[day.getDay()];
    
                        var str = "<div class='form-controller' style='padding-top: 10px;'><label><b>予約日時:</b></label><div class='form-group con-div'>"+eventDate+"("+week+") "+res[i].eventTime+"</div></div>";
                        str += "<input type='hidden' name='calId"+i+"' id='calId"+i+"' value='"+res[i].calId+"'></input>"
                        str += "<input type='hidden' name='eventName"+i+"' id='eventName"+i+"' value='"+res[i].eventName+"'></input>"
                        str += "<input type='hidden' name='eventId"+i+"' id='eventId"+i+"' value='"+res[i].eventId+"'></input>"
                        str += "<input type='hidden' name='eventDate"+i+"' id='eventDate"+i+"' value='"+res[i].eventDate+"'></input>"
                        str += "<input type='hidden' name='eventTime"+i+"' id='eventTime"+i+"' value='"+res[i].eventTime+"'></input>"
                        str += "<input type='hidden' name='num"+i+"' id='num"+i+"' value='"+res[i].num+"'></input>"
                        str += "<input type='hidden' name='name"+i+"' id='name"+i+"' value='"+res[i].name+"'></input>"
                        str += "<input type='hidden' name='tel"+i+"' id='tel"+i+"' value='"+res[i].tel+"'></input>"
                        str += "<div class='submit-button-d'><input type='button' name='btn"+i+"' id='btn"+i+"' onclick='del("+i+")' value='キャンセル'></div><hr>";

                        $("#get_data").append(str);
                    }
                }else{
                    var str = "<div class='form-controller' style='padding-top: 10px;text-align: center;color: red;'>予約されていません</div>";
                    $("#get_data").append(str);
                }
                hideloading();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(XMLHttpRequest);
                // alert("送信できませんでした");
                var str = "<div class='form-controller' style='padding-top: 10px;text-align: center;color: red;'>予約されていません</div>";
                $("#get_data").append(str);
                hideloading();
            }
        });
        }

        function showloading(){
            var h = $(window).height();
        
            // $('#wrap').css('display','none');
            $('#loader-bg ,#loader').height(h).css('display','block');
          }
      
          function hideloading(){
            $('#loader-bg').delay(900).fadeOut(800);
            $('#loader').delay(600).fadeOut(300);
            // $('#wrap').css('display', 'block');
          }
    });
    
});


function del(id){
    var calId = $("#calId"+id).val();
    var eventName = $("#eventName"+id).val();
    var eventId = $("#eventId"+id).val();
    var eventDate = $("#eventDate"+id).val();
    var eventTime = $("#eventTime"+id).val();
    var num = $("#num"+id).val();
    var name = $("#name"+id).val();
    var tel = $("#tel"+id).val();
    //Wクリック対策
    $("#btn"+id).prop("disabled", true);
    
    eventDate = eventDate.slice(0,-1);
    eventDate = eventDate.replace('年','/').replace('月','/');

    //cancel api
    $.getJSON('./config.json', (data) => {
        var URL = data.api_url;
        var token = data.token;
        var line_id = $("#line_id").val();

        var SendDATA = {
            "action": "cancel",
            "token": token,
            "lineId": line_id,
            "calId": calId,
            "eventName": eventName,
            "eventId": eventId,
            "eventDate": eventDate,
            "eventTime": eventTime,
            "num":num,
            "name" : name,
            "tel": tel
        };

        var postparam = {
            "method"     : "POST",
            "mode"       : "no-cors",
            "Content-Type" : "application/x-www-form-urlencoded",
            "body" : JSON.stringify(SendDATA)
        };

        const promise = fetch(URL, postparam);
        promise.then(function(response) {
            console.log(response);
            // location.reload(true);
            $(window).attr('location','./deleted.php');

        });
    });
}
