
'use strict';

$(function () {
    function onClick(obj_name, callback) {
        $(obj_name).on('click', callback);
    }

    $.getJSON('./config.json', (data) => {
        var URL = data.api_url;
        //submit button
        onClick('input[type="submit"]', function (e) {
            e.preventDefault();
            var line_id = $("#line_id").val();
            var genre = $("#genre").val();
            var num = $("#number_of_child").val();
            var num1 = $("#number_of_under2").val();
            var num2 = $("#number_of_guardian").val();
            var user_name = $("#user_name").val();
            var contact = $("#contact").val();
            var remarks = $("#remarks").val();
            var cal_id = $("#cal_id").val();
            var event_name = $("#event_name").val();
            var event_id = $("#event_id").val();
            var event_date = $("#event_date").val();
            var event_time = $("#event_time").val();
            var seats = $("#seats").val();
            var memo = $("#memo").val();
            var token = $("#token").val();

            event_date = event_date.slice(0,-1);
            event_date = event_date.replace('年','/').replace('月','/');

            var SendDATA = {
                "action": "reserve",
                "token": token,
                "lineId": line_id,
                "calId": cal_id,
                "eventName": event_name,
                "eventId": event_id,
                "eventDate": event_date,
                "eventTime": event_time,
                "num": num,
                "num1": num1,
                "num2": num2,
                "name" : user_name,
                "tel": contact,
                "memo": remarks
            };

            var postparam = {
                "method"     : "POST",
                "mode"       : "no-cors",
                "Content-Type" : "application/x-www-form-urlencoded",
                "body" : JSON.stringify(SendDATA)
            };

            const promise = fetch(URL, postparam);
            promise.then(function(response) {
                return response.json();
            }).then(function(data) {
                console.log(data);
                $("#res_status").val(data['status']);
                $("#res_message").val(data['message']);
                $('form').submit();
            });



            // var line_id = $("#line_id").val();
            // var genre = $("#genre").val();
            // var user_name = $("#user_name").val();
            // var tel = $("#tel").val();
            // var remarks = $("#remarks").val();
            // var cal_id = $("#cal_id").val();
            // var event_name = $("#event_name").val();
            // var event_id = $("#event_id").val();
            // var event_date = $("#event_date").val();
            // var event_time = $("#event_time").val();
            // var seats = $("#seats").val();
            // var memo = $("#memo").val();
            // var token = $("#token").val();

            // event_date = event_date.slice(0,-1);
            // event_date = event_date.replace('年','/').replace('月','/');
            // event_time = event_time.replace(/～/g, "-");

            // //post api
            // $.ajax({
            //     type: 'POST',
            //     url: 'https://script.google.com/macros/s/AKfycbw0MSlzj7bwGhr1wI7qcBMjhO0IXza0Q51CxttAGAE_lFaDbF-9uEBFL-tLnWUG3c0B/exec',
            //     data: {
            //         action: "reserve",
            //         token: token,
            //         lineId: line_id,
            //         calId: cal_id,
            //         eventName: event_name,
            //         eventId: event_id,
            //         eventDate: event_date,
            //         eventTime: event_time,
            //         num:"1",
            //         name : user_name,
            //         tel: tel,
            //         memo: memo
            //     },
            //     dataType: 'JSON',
            //     cache: false,
            //     async: true,
            //     success: function(res){
            //         console.log(res);
            //         $('form').submit();
            //     },
            //     error: function (XMLHttpRequest, textStatus, errorThrown) {
            //         console.log(XMLHttpRequest);
            //         alert("送信できませんでした");
            //     }
            // });
        });
    });

    onClick('input[type="button"]', function (e) {
        e.preventDefault();
        history.go(-1);
    });
});
