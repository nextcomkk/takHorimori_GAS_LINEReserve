// =====================================
// 設定
// =====================================

var config_load = false;

// 基準日（デフォルト：今日の日付）
var reference_date = new Date();

// 営業日（指定した営業日から予約できる）
var after_days = 3;

// 基準日からn日まで予約可能（デフォルト1年）
var is_range_days = true; // 予約可能範囲制限するかどうか
var range_days = 365;

// 無効にする日付
// "YYYY-MM-DD"
//var disable_list = [];

// 無効にする日付
// 月
// 1 ~ 12
var disable_month = [];
// 曜日
//  0  1  2  3  4  5 6
// 日 月 火 水  木 金 土
var disable_week = [];
// 日
// 1 ~ 31
var disable_day = []; // 毎月n日はお休み

// 有効にする日付
// "YYYY-MM-DD"
var enable_list = [];

var c = {

}

$.ajaxSetup({
    cache: false
});

var cjSetup = function(info){
  var lafter_days = info.after_days;
  var lis_range_days = info.is_range_days;
  var lrange_days = info.range_days;
  var ldisable_list = info.disable_date;
  /*
  disable_month = data.calender.disable_month;
  disable_week = data.calender.disable_week;
  disable_day = data.calender.disable_day;
  enable_list = data.calender.enable_date;
  */
  var ldisable_month = [];
  var ldisable_week = [];
  var ldisable_day = [];
  var lenable_list = [];
  var lreference_date = new Date(reference_date.getTime());
  lreference_date.setDate(lreference_date.getDate() + lafter_days);

  var lholiday = info.holiday;

  var get_date_fromat_string = function(date) {
      return date.getFullYear() + "-" + (("0" + (date.getMonth()+1)).slice(-2)) + "-" + ("0" + date.getDate()).slice(-2);
  }


  var date_year = lreference_date.getFullYear(); // 年
  var date_month = lreference_date.getMonth() + 1;
  var date_month_formatted = ("0" + (date_month)).slice(-2); // 月
  var date_day = ("0" + lreference_date.getDate()).slice(-2); // 日
  var formatted_date = date_year + "-" + date_month_formatted + "-" + date_day;

  // flatpickr config
  var lflatpickr = {
    minDate: formatted_date,
    locale: 'ja', // 日本語
    disableMobile: true, // モバイル対応
    disable: [
      function (date) {
        var date_year = date.getFullYear(); // 年
        var date_month = date.getMonth() + 1;
        var date_month_formatted = ("0" + (date_month)).slice(-2); // 月
        var date_week = date.getDay(); // 曜日
        var date_day = ("0" + date.getDate()).slice(-2); // 日
        var formatted_date = date_year + "-" + date_month_formatted + "-" + date_day;

        return ((ldisable_month.includes(date_month) && ldisable_week.includes(date_week)) || ldisable_day.includes(date_day)) || ldisable_list.includes(formatted_date);
      }
    ],
    onDayCreate: function onDayCreate( dObj, dStr, fp, dayElem ){
        //日付毎にチェック
        //if (holiday_jp.between(dayElem.dateObj, dayElem.dateObj).length > 0) {
        if (lholiday.includes(get_date_fromat_string(dayElem.dateObj))){
            $(dayElem).addClass('flatpickr-holidays');
        }
        /*

        //
        if (dayElem.dateObj.getDay() === 1) {
                 var date_year = dayElem.dateObj.getFullYear();
                 var date_month_formatted =  ("0" + (dayElem.dateObj.getMonth() + 1)).slice(-2);
                 var date_day = ("0" + dayElem.dateObj.getDate()).slice(-2);
                 var formatted_date = date_year + "-" + date_month_formatted + "-" + date_day;

                 // enable_dateに指定された日付ではない場合は無効化、指定されていない日付なら有効化しておく
                 if (!enable_list.includes(formatted_date)) {
                    // 月曜日は無効にしておく
                    $(dayElem).addClass('flatpickr-disabled');
                 } else {
                     if (!disable_list.includes(formatted_date)){
                         if ($(dayElem).hasClass('flatpickr-disabled')) {
                             $(dayElem).removeClass('flatpickr-disabled');
                          }
                      }
                 }
        }
        */
    },
    // enable: [
    //   function (date) {
    //     var date_year = date.getFullYear(); // 年
    //     var date_month = date.getMonth() + 1;
    //     var date_month_formatted = ("0" + (date_month)).slice(-2); // 月
    //     var date_week = date.getDay(); // 曜日
    //     var date_day = ("0" + date.getDate()).slice(-2); // 日
    //     var formatted_date = date_year + "/" + date_month_formatted + "/" + date_day;

    //     return ((!disable_month.includes(date_month) || !disable_week.includes(date_week)) && !disable_day.includes(date_day)) && enable_list.includes(formatted_date);
  };


  if (lis_range_days) {
    lflatpickr.maxDate = lreference_date.fp_incr(lrange_days);
  }

  return lflatpickr;
}

// var cj = $.getJSON('./config.json', (data) => {
//   var calender_info = data['calender'];

//   calender_info['v1']['disable_date'] = cal_info1.disable_date;
//   calender_info['v1']['holiday'] = cal_info1.holiday;
//   calender_info['v2']['disable_date'] = cal_info2.disable_date;
//   calender_info['v2']['holiday'] = cal_info2.holiday;

//   c.flatpickr1 = cjSetup(calender_info['v1']);
//   c.flatpickr2 = cjSetup(calender_info['v2']);

//   config_load = true;
// });

c.flatpickr1 = cjSetup({
  // minDate: "today",
  "holiday": [],
  "disable_date": [],
  "after_days": 0,
  "is_range_days": true,
  "range_days" : 60
});
// =====================================

