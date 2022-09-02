'use strict';

$(function () {
  var list = [
    "genre",
    "user-name",
    "contact",
    "remarks",
    "number-of-child",
    "agreement",
  ];

  var today = new Array('日', '月', '火', '水', '木', '金', '土');

  var checked_flg = "";
  $.getJSON('./config.json', (data) => {
    showloading();
    if (getValue("#user-name") == "" && $.cookie('GAS_Reserve_GoogleCal_WebForm_UserName')){
      $("#user-name").val($.cookie('GAS_Reserve_GoogleCal_WebForm_UserName'));
    }
    if (getValue("#contact") == "" && $.cookie('GAS_Reserve_GoogleCal_WebForm_Contact')){
      $("#contact").val($.cookie('GAS_Reserve_GoogleCal_WebForm_Contact'));
    }

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
              .then(async profile => {
                if (getValue("#contact") == "") {
                  $("#user-name").val(profile.displayName);
                  v.userName();
                }
                $("#line_id").val(profile.userId);
                var line_id = $("#line_id").val();
                if (line_id) {
                  await fetch(data.member_base_url + data.member_api + line_id, {
                    mode: "cors",
                    headers: { 'Authorization': data.member_api_token }
                  })
                    .then(function (res) {
                      if(res.ok) {
                        return res.json();
                      } else {
                        throw new Error();
                      }
                    }).then(function (json) {
                      if (getValue("#user-name") === "") {
                        $("#user-name").val(json['member_lastname'] + " " + json['member_firstname']);
                        v.userName();

                        if (json['member_tel']) {
                          $("#contact").val(json['member_tel']);
                          v.contact();
                        }
                      }
                    }).catch(err => {
                      console.log(err);
                    });
                }

                getData(api_url, line_id, token);
              })
          }
          else{
            hideloading();
            // liff.login();
          }
      })
      .catch((err) => {
        hideloading();
        //alert("err");
      });
    }


    //===========================
    // VALIDATE
    //===========================
    // form-group jQuery object
    var $fg = $('.form-group');
    // error_count
    var error_count = 0;
    $("input[type='submit']").prop('disabled', false);
    //submit button
    onClick('input[type="submit"]', function (e) {
      e.preventDefault();
      $("input[type='submit']").prop('disabled', true);
      v.all();
      // var genre= $('input:radio[name="genre"]:checked').val();
    });

    // user name
    onKeyup("#user-name", function () {
      v.userName();
    });

    // remarks
    onChange("#remarks", function () {
      v.remarks();
    });

    // contact
    onKeyup("#contact", function () {
      v.contact();
    });

    // number-of
    onChange("input[name^=number-of]", function () {
      v.numberOf(this);
    });

    // reservation date
    onChange("#reservation-date", function () {
      v.reservationDate();
      createGenre()
    });

    // ============================
    var events = {};
    function getData(api_url,line_id,token) {
    //get api
      $.ajax({
        type: 'GET',
        url: api_url,
        data: {
          "act": "new",
          "lineId": line_id,
          "token": token
        },
        dataType: 'JSON',
        cache: false,
        success: function(res){
          if(res){
            var disable = [...Array(31)].map((v, idx) => {
              const dt = new Date()
              dt.setDate(dt.getDate()+idx);
              return (dt.getFullYear() + '-' + ('00' + (dt.getMonth()+1)).slice(-2) + '-' + ('00' + dt.getDate()).slice(-2));
            });

            for(var i = 0; i<res.length;i++) {
              if (!res[i].eventDate) continue;
              var key = res[i].eventDate.slice(0,-1).replace('年','-').replace('月','-');
              if (!events[key]) { events[key] = []; }
              if (disable.indexOf(key) !== -1) {
                disable.splice(disable.indexOf(key), 1);
              }
              events[key].push(res[i]);
            }
            $('#reservation-date').flatpickr(config(disable));

            // apiを読み込んだら表示
            $('.submit-button').show();

          }else{
            alert("送信できませんでした");
          }
          hideloading();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          console.log(XMLHttpRequest);
          alert("送信できませんでした");
          hideloading();
        }
      });
    }

    function createGenre() {
      $("#add_genre label").remove();
      var res = events[getValue("#reservation-date")];
      if (res) {
        for(var i = 0; i<res.length;i++){
          var eventDate = res[i].eventDate;
          eventDate = eventDate.slice(0,-1);
          eventDate = eventDate.replace('年','/').replace('月','/');
          var day = new Date(Date.parse(eventDate));
          var week = today[day.getDay()];
          var memo = res[i].memo.slice(0,-1);

          //1ヶ月先まで表示
          var dt = new Date();
          if(day>dt.setMonth(dt.getMonth()+1)) break;

          if(res[i].eventId == genre_id && res[i].calId == cal_id && res[i].eventName == event_name && res[i].eventId == event_id
            && res[i].eventDate == event_date && res[i].eventTime == event_time && res[i].seats == seats && memo == return_memo){
            checked_flg = "checked";
          }else{
            checked_flg = "";
          }
          var str = "<label class='select-button form-radio-field form-control-success form-control-danger'><div style='width: 100%;'>";
          str += "<span class='radio-button'><input type='radio' name='genre' id='genre"+i+"' value='"+res[i].eventId+"' class='form-control-success' "+checked_flg+"></span>";
          // str += "<span class='radio-text'>"+eventDate+"("+week+") "+res[i].eventTime+" "+res[i].eventName+"</span>";
          str += "<span class='radio-text'>"+res[i].eventTime+" "+res[i].eventName+"</span>";
          str += "<input type='hidden' name='calId"+i+"' id='calId"+i+"' value='"+res[i].calId+"'>";
          str += "<input type='hidden' name='eventName"+i+"' id='eventName"+i+"' value='"+res[i].eventName+"'>";
          str += "<input type='hidden' name='eventId"+i+"'id='eventId"+i+"' value='"+res[i].eventId+"'>";
          str += "<input type='hidden' name='eventDate"+i+"'id='eventDate"+i+"' value='"+res[i].eventDate+"'>";
          str += "<input type='hidden' name='eventTime"+i+"'id='eventTime"+i+"' value='"+res[i].eventTime+"'>";
          str += "<input type='hidden' name='seats"+i+"'id='seats"+i+"' value='"+res[i].seats+"'>";
          str += "<input type='hidden' name='memo"+i+"'id='memo"+i+"' value='"+memo+"'>";
          str += "<input type='hidden' name='radio_date"+i+"'id='radio_date"+i+"' value='"+eventDate+"("+week+") "+res[i].eventTime+"'></div>";
          str += "<div style='width: 100%;margin-right: 10%;text-align: right;'><span class='radio-text'>残り："+res[i].seats+"枠</span></div>";
          str += "</label>";
          $(str).appendTo("#add_genre").hide().fadeIn();
        }

        onClick("input[type='radio']", function (e) {
          var genre_id = $(this).attr("id").replace('genre','');
          $("[name='genre_id']").val(genre_id);
          v.genre();
          if (getValue('#number-of-child')) {
            v.numberOf();
          }
        });
      }

    }

    // process each time "keyup" event occurs
    function onKeyup(obj_name, callback) {
      $(obj_name).on('keyup', $.debounce(100, callback));
    }

    function onkeydown(obj_name, callback) {
      $(obj_name).on('keydown', callback);
    }

    function onChange(obj_name, callback) {
      $(obj_name).on('change', callback);
    }

    function onClick(obj_name, callback) {
      $(obj_name).on('click', callback);
    }

    // get the value inputted
    function getValue(id) {
      return $(id).val();
    }

    function getRadio(name){
      return $('input:radio[name="'+name+'"]:checked').val();
    }

    function success(obj_name) {
      $(obj_name).removeClass('has-danger').addClass('has-success');
    }

    function danger(obj_name) {
      $(obj_name).find('.text-danger').addClass('text-danger-animation');
      $(obj_name).removeClass('has-success').addClass('has-danger');
      error_count++;
    }

    // remove classes, has-success and has-danger
    function removeBothStatus(obj_name) {
      $(obj_name).removeClass('has-success').removeClass('has-danger');
    }

    function validate(terms, target_obj_name) {
      if (terms) {
        success(target_obj_name);
      } else {
        danger(target_obj_name);
      }
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

    // Validate Method
    class m {
      // Required
      static isRequired(value) {
        if (value.length > 0) {
          return true;
        }
        return false;
      }

      // is num
      static isNum(value) {
        var reg = /^([1-9]\d*|0)$/;
        return reg.test(value);
      }

      // tel
      static isTel(value) {
        var reg = /^0[0-9]{9,11}?$/;
        return reg.test(value);
      }

      // email
      static isEmail(value) {
        // var reg = /^[A-Za-z0-9]{1}[A-Za-z0-9_.+\-]*@{1}[A-Za-z0-9_.-]{1,}.[A-Za-z0-9]{1,}$/;
        var reg = /^[A-Za-z0-9]{1}[A-Za-z0-9_.+\-]*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;
        return reg.test(value);
      }

    }

    // Validate Class
    class v {
      // all validate
      static all() {
        // init error_count flag
        error_count = 0;
        v.validateAll();

        if (error_count) {
          $('.submit-error-message').show();
          $("input[type='submit']").prop('disabled', false);
        } else { // submit
          $.cookie('GAS_Reserve_GoogleCal_WebForm_UserName', getValue("#user-name"), { expires: 365 });
          $.cookie('GAS_Reserve_GoogleCal_WebForm_Contact', getValue("#contact"), { expires: 365 });
          $('form').submit();
        }
      }

      static validateAll() {
        list.includes('genre') ? this.genre() : '';
        list.includes('user-name') ? this.userName() : '';
        list.includes('contact') ? this.contact() : '';
        list.includes('remarks') ? this.remarks() : '';
        list.includes('number-of-child') ? this.numberOf() : '';
        list.includes('agreement') ? this.agreement() : '';
      }

      static validateFirst() {
        this.genre();
        this.userName();
        this.remarks(remarks);
        this.contact();
        this.numberOf();
        this.agreement();
      }

      //getRadio
      static genre(){
        var value = getRadio("genre");
        if(value == undefined){
          validate(false, $fg.filter(".genre"));
        }else{
          validate(true, $fg.filter(".genre"));
        }
      }
      //user name
      static userName() {
        var value = getValue("#user-name");
        validate(m.isRequired(value), $fg.filter(".user-name"));
      }

      //remarks
      static remarks(){
        validate(true, $fg.filter(".remarks"));
      }

      // contact
      static contact() {
        var value = getValue("#contact");
        var check = m.isTel(value) || m.isEmail(value);
        validate(m.isRequired(value) && check, $fg.filter(".contact"));
      }

      // number-of
      static numberOf(target) {
        var child = getValue('#number-of-child');
        var guardian = getValue('#number-of-guardian');
        var under2 = getValue('#number-of-under2');

        if (target) {
          validate(m.isRequired(getValue(`#${target.id}`)), $fg.filter(`.${target.id}`));
          $fg.filter(`.form-group.${target.id}`).find(".error").text('入力してください');
        } else {
          validate(m.isRequired(child), $fg.filter('.number-of-child'));
          $fg.filter('.form-group.number-of-child').find(".error").text('入力してください');
          validate(m.isRequired(guardian), $fg.filter('.number-of-guardian'));
          $fg.filter('.form-group.number-of-guardian').find(".error").text('入力してください');
          validate(m.isRequired(under2), $fg.filter('.number-of-under2'));
          $fg.filter('.form-group.number-of-under2').find(".error").text('入力してください');
          if (!child || !guardian || !under2) return;
        }

        if (child) {
          if (child === '0') {
            validate(false, $fg.filter('.number-of-child'));
            $fg.filter('.form-group.number-of-child').find(".error").text('1名以上で入力してください');
            return;
          }
          var id = getValue('[name=genre_id]');
          if (id) {
            validate((Number(getValue(`#seats${id}`) || 0) >= Number(child)), $fg.filter('.number-of-child'));
            $fg.filter('.form-group.number-of-child').find(".error").text('残席数がありません');
          }
        }

        if (child && guardian) {
          var check = (Number(child) / 2 <= Number(guardian));
          validate(check, $fg.filter('.number-of-guardian'));
          $fg.filter('.form-group.number-of-guardian').find(".error").text('保護者1名につきお子様の人数は2名までです');
          if (check) {
            var check2 = (Number(child) * 2 >= Number(guardian));
            if (!check2) {
              validate(check2, $fg.filter('.number-of-guardian'));
              $fg.filter('.form-group.number-of-guardian').find(".error").text('保護者の人数はお子様1名につき2名までです');
            }
          }
        }

        if (child && under2) {
          validate((Number(child) - Number(under2) >= 0), $fg.filter('.number-of-under2'));
          $fg.filter('.form-group.number-of-under2').find(".error").text('お子様の人数を超えています');
        }
      }

      static agreement() {
        var isChecked = $('[name=agreement]:checked').length;
        validate(isChecked, $fg.filter(".agreement"));
      }

      static reservationDate() {
        var value = getValue("#reservation-date");
        validate(m.isRequired(value), $fg.filter(".reservation-date"));
      }
    }

    if (has_session) {
      v.validateFirst();
    }

  });
});
