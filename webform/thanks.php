<?php
session_start();

$res_status = filter_input(INPUT_POST, 'res_status');
$res_message = filter_input(INPUT_POST, 'res_message');

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
    [message]：{$res_message}
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
        date_default_timezone_set('Asia/Tokyo');
        file_put_contents($log, "==================start ".date("Y-m-d D h:i:s")."====================\n", FILE_APPEND);
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
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-PPEK52GV28"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-PPEK52GV28');
</script>  
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>予約完了｜駿府の工房 匠宿 星と森 木育スペース</title>
  <meta name="description" content="駿府の工房 匠宿 星と森 木育スペースの予約システムです">
  <meta name="robots" content="nofollow">
  <meta property="og:title" content="予約完了｜駿府の工房 匠宿 星と森 木育スペース">
  <meta property="og:description" content="駿府の工房 匠宿 星と森 木育スペースの予約システムです">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/form.css">
</head>

<body>
  <div class="form-cover"></div>
  <div class="form-title">
    <!-- <h1>これは予約システムのデモサイトです</h1> -->
    <!-- <p>予約が完了しました</p>-->
    <p><?= htmlspecialchars($res_message, ENT_QUOTES, "UTF-8") ?></p>
  </div>
  <div class="thanks-wrapper form-wrapper">
    <div class="img-checked"><img src="img/<?=$res_status?>.svg" alt="checked" height="80" width="80"></div>    
  </div>
</body>

</html>
