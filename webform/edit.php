<?php
session_start();

$cur_q = parse_url($_SERVER["REQUEST_URI"],PHP_URL_QUERY);
parse_str($cur_q,$myArray);
$input['line_id'] = isset($myArray["lineid"])? $myArray["lineid"] : '';

// htmlspecialchars
function h($s) {
    return htmlspecialchars($s, ENT_QUOTES, "UTF-8");
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
  <title>予約システム｜駿府の工房 匠宿 星と森 木育スペース</title>
  <meta name="description" content="駿府の工房 匠宿 星と森 木育スペースの予約システムです">
  <meta name="robots" content="nofollow">
  <meta property="og:title" content="予約システム｜駿府の工房 匠宿 星と森 木育スペース">
  <meta property="og:description" content="駿府の工房 匠宿 星と森 木育スペースの予約システムです">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="./css/base.css?v=0.3">
  <link rel="stylesheet" href="./css/form.css?v=0.23">
</head>

<body>
<div id="loader-bg">
  <div id="loader">
    <img src="img/img-loading.gif" width="80" height="80" alt="Now Loading..." />
    <p>Now Loading...</p>
  </div>
</div>
<div id="wrap">
  <div class="form-cover"></div>
  <div class="form-title">
    <!-- <h1>予約内容一覧</h1> -->
    <p>現在の予約状況です</p>
  </div>
  <div class="form-wrapper" id="get_data">

  </div>
  <input type="hidden" name="line_id" id="line_id" value="<?= h($input['line_id']) ?>">
</div>
</body>
<script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js"></script>
<script src="./js/vendor/throttle-debounce.min.js"></script>
<script src="./js/vendor/holiday_jp.min.js"></script>
<script charset="utf-8" src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
<script src="./js/check.js?v=1.95"></script>
</html>