<?php
session_start();

$line_id = $_SESSION['line_id'];
$genre = $_SESSION['genre'];
$number_of_child = $_SESSION['number-of-child'];
$number_of_under2 = $_SESSION['number-of-under2'];
$number_of_guardian = $_SESSION['number-of-guardian'];
$user_name = $_SESSION['user-name'];
$radio_date = $_SESSION['radio-date'];
$contact = $_SESSION['contact'];
$remarks = $_SESSION['remarks'];
$cal_id = $_SESSION['cal-id'];
$event_name = $_SESSION['event-name'];
$event_id = $_SESSION['event-id'];
$event_date = $_SESSION['event-date'];
$event_time = $_SESSION['event-time'];
$seats = $_SESSION['seats'];
$memo = $_SESSION['memo'];

try {

    $log_data = <<<EOD
    [line_id]：{$line_id}
    [radio]：{$genre}
    [子供]：{$number_of_child}
    [2歳以下]：{$number_of_under2}
    [保護者]：{$number_of_guardian}
    [名前]：{$user_name}
    [日程選択]：{$radio_date}
    [連絡先]：{$contact}
    [備考]：{$remarks}
    [cal_id]：{$cal_id}
    [event_name]：{$event_name}
    [event_id]：{$event_id}
    [event_date]：{$event_date}
    [event_time]：{$event_time}
    [seats]：{$seats}
    [memo]：{$memo}\n
    EOD;

    $log = "./data.log";
    if(file_exists($log)){
        file_put_contents($log, "==================statr ".date("Y-m-d D h:i:s")."====================\n", FILE_APPEND);
        file_put_contents($log, $log_data, FILE_APPEND);
        file_put_contents($log, "==================end ".date("Y-m-d D h:i:s")."======================\n", FILE_APPEND);
    } else {

        file_put_contents($log, $log_data, FILE_USE_INCLUDE_PATH);
    }

    //セッション破棄
    $_SESSION = array();
    if (isset($_COOKIE["PHPSESSID"])) {
      setcookie("PHPSESSID", '', time() - 1800, '/');
    }
    session_destroy();
  } catch (Exception $e) {
      // エラーの場合
      echo "Message could not be sent.";
  }
?>
<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>予約完了</title>
  <meta name="description" content="これは予約システムのデモサイトです">
  <meta name="robots" content="nofollow">
  <meta property="og:title" content="予約完了">
  <meta property="og:description" content="これは予約システムのデモサイトです">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/form.css">
</head>

<body>
  <div class="form-cover"></div>
  <div class="form-title">
    <!-- <h1>これは予約システムのデモサイトです</h1> -->
    <p>予約が完了しました</p>
  </div>
  <div class="thanks-wrapper form-wrapper">
    <div class="img-checked"><img src="img/check.svg" alt="checked" height="30" width="30"></div>
    <p class="title">送信完了</p>
  </div>
</body>

</html>
