<?php
session_start();

$cur_q = parse_url($_SERVER["REQUEST_URI"],PHP_URL_QUERY);
parse_str($cur_q,$myArray);

$input['act'] = isset($myArray["act"])? $myArray["act"] : '';
$input['line_id'] = isset($myArray["lineid"])? $myArray["lineid"] : '';
$input['user-name'] = isset($myArray["name"])? $myArray["name"] : '';

if($input['act'] == "check"){
  header('Location: ./edit.php');
  die;
}

// Config Json解析
$config_json_file = file_get_contents("config.json");
$conf = json_decode($config_json_file, true);
$csrf_token = $conf['token'];

$_SESSION['token'] = $csrf_token;

// if back from check.php
$has_session = false;
if(isset($_SESSION['back']) && $_SESSION['back']){
  $has_session = true;
}
$_SESSION['back'] = false;

if ($has_session) {
  $input['reservation-date'] = $_SESSION['reservation-date'];
  $input['genre'] = $_SESSION['genre'];
  $input['number-of-child'] = $_SESSION['number-of-child'];
  $input['number-of-guardian'] = $_SESSION['number-of-guardian'];
  $input['number-of-under2'] = $_SESSION['number-of-under2'];
  $input['contact'] = $_SESSION['contact'];
  $input['remarks'] = $_SESSION['remarks'];
  $input['genre-id'] = $_SESSION['genre-id'];
  $input['cal-id'] = $_SESSION['cal-id'];
  $input['event-name'] = $_SESSION['event-name'];
  $input['event-id'] = $_SESSION['event-id'];
  $input['event-date'] = $_SESSION['event-date'];
  $input['event-time'] = $_SESSION['event-time'];
  $input['seats'] = $_SESSION['seats'];
  $input['memo'] = $_SESSION['memo'];
  $input['agreement'] = $_SESSION['agreement'];
} else {
  $input['reservation-date'] = '';
  $input['genre'] = '';
  $input['number-of-child'] = '';
  $input['number-of-guardian'] = '';
  $input['number-of-under2'] = '';
  $input['contact'] = '';
  $input['remarks'] = '';
  $input['genre-id'] = '';
  $input['cal-id'] = '';
  $input['event-name'] = '';
  $input['event-id'] = '';
  $input['event-date'] = '';
  $input['event-time'] = '';
  $input['seats'] = '';
  $input['memo'] = '';
  $input['agreement'] = '';
}

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
  <meta property="og:url" content="https://takhoshitomorilinereserve.azurewebsites.net/webform/" />
  <meta property="og:image" content="https://takhoshitomorilinereserve.azurewebsites.net/webform/img/form-cover.jpg" />
  <meta property="og:site_name" content="駿府の工房 匠宿 星と森">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
  <link rel="stylesheet" href="./css/base.css?v=<?= filemtime('css/base.css'); ?>">
  <link rel="stylesheet" href="./css/form.css?v=<?= filemtime('css/form.css'); ?>">

  <script>
    var genre_id = "<?= h($input['genre']) ?>";
    var cal_id = "<?= h($input['cal-id']) ?>";
    var event_name = "<?= h($input['event-name']) ?>";
    var event_id = "<?= h($input['event-id']) ?>";
    var event_date = "<?= h($input['event-date']) ?>";
    var event_time = "<?= h($input['event-time']) ?>";
    var seats = "<?= h($input['seats']) ?>";
    var return_memo = "<?= h($input['memo']) ?>";
    var has_session = "<?php echo $has_session ?>";
  </script>
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
    <!-- <h1>予約システム</h1> -->
    <p>駿府の工房 匠宿 星と森 木育スペース 予約システム</p>
  </div>
  <div class="form-wrapper">
    <div class="alert alert-danger submit-error-message">正しく入力されていない項目があります</div>
    <form action="./confirm.php" method="POST" enctype="multipart/form-data">
      <div class="form-controller reservation-date">
        <label>
          利用日
          <span class="tag tag-danger">必須</span>
        </label>
        <div class="form-group reservation-date">
          <input type="text" name="reservation-date" id="reservation-date" value="<?= h($input['reservation-date']) ?>" class="form-control form-control-success form-control-danger">
          <p class="text-danger error">有効な日付を選択してください</p>
        </div>
      </div>
      <div class="form-controller form-group genre">
        <div class="form-group genre">
          <label>
            日程選択
            <span class="tag tag-danger">必須</span>
          </label>
          <div class="row row-gutter-xs row-select-button-group" style="margin-top: 0.5rem;" id="add_genre">

          </div>
          <p class="text-danger error">選択してください</p>
        </div>
      </div>

      <div class="form-controller number-of-child">
        <label>
          お子様の人数
          <span class="tag tag-danger">必須</span>
        </label>
        <div class="form-group number-of-child">
          <input type="number" name="number-of-child" id="number-of-child" value="<?= h($input['number-of-child']) ?>" class="form-control form-control-success form-control-danger" min="0" max="100">人
          <p class="text-danger error"></p>
        </div>
      </div>
      <div class="form-controller number-of-under2">
        <label>
          うち2歳未満(0~1歳)のお子様の人数
          <span class="tag tag-danger">必須</span>
        </label>
        <div class="form-group number-of-under2">
          <input type="number" name="number-of-under2" id="number-of-under2" value="<?= h($input['number-of-under2']) ?>" class="form-control form-control-success form-control-danger" min="0" max="100">人
          <p class="text-danger error"></p>
        </div>
      </div>
      <div class="form-controller number-of-guardian">
        <label>
          保護者の人数（保護者1名につきお子様の人数は2名まで）
          <span class="tag tag-danger">必須</span>
        </label>
        <div class="form-group number-of-guardian">
          <input type="number" name="number-of-guardian" id="number-of-guardian" value="<?= h($input['number-of-guardian']) ?>" class="form-control form-control-success form-control-danger" min="0" max="100">人
          <p class="text-danger error"></p>
        </div>
      </div>

      <div class="form-controller name">
          <label>
          お名前(本名※ニックネームでは受付できません)
          <span class="tag tag-danger">必須</span>
          </label>
          <div class="row row-gutter-xs">
          <div class="">
              <div class="form-group has-feedback user-name">
              <input type="text" name="user-name" id="user-name" value="<?= h($input['user-name']) ?>"  placeholder="山田太郎" class="form-control form-control-success form-control-danger">
              <p class="text-danger error">入力してください</p>
              </div>
          </div>
          </div>
      </div>

      <div class="form-controller contact">
        <label>
          連絡先(携帯電話)
          <span class="tag tag-danger">必須</span>
        </label>
        <div class="form-group contact">
          <input type="text" name="contact" id="contact" value="<?= h($input['contact']) ?>" placeholder="09012345678" class="form-control form-control-success form-control-danger">
          <p class="text-danger error">有効な連絡先を入力してください</p>
        </div>
      </div>
      <div class="form-controller remarks">
        <label>
          備考
          <span class="tag tag-default">任意</span>
        </label>
        <div class="form-group remarks">
            <textarea name="remarks" id="remarks" class="form-control form-control-success form-control-danger"  style="overflow:auto;" rows="4"><?= h($input['remarks']) ?></textarea>
            <p class="text-danger error">入力してください</p>
        </div>
      </div>

      <div class="form-controller agreement">
        <!-- <p><a href="./riyoukiyaku_hoshitomori.pdf" target="_blank">利用規約</a>を確認の上チェックしてください</p> -->
        <label>
          <a href="https://takumishuku.xsrv.jp/riyoukiyaku_hoshitomori.pdf" target="_blank">利用規約</a>を確認の上チェックしてください
          <span class="tag tag-danger">必須</span>
        </label>
        <div class="form-group agreement">
          <label class="select-button form-radio-field form-control-success form-control-danger">
              <span class="checkbox-button">
                <input type="checkbox" name="agreement" value="1" class="form-control-success form-control-danger checkbox-agreement" <?= $input['agreement'] === true ? "checked" : "" ?>>
                利用規約に同意する
              </span>
          </label>
          <p class="text-danger error">同意してください</p>
        </div>
      </div>

      <div class="alert alert-danger submit-error-message" style="margin-bottom: 20px;">正しく入力されていない項目があります</div>
      <input type="hidden" name="line_id" id="line_id" value="<?= h($input['line_id']) ?>">
      <input type="hidden" name="genre_id" id="genre_id" value="<?= h($input['genre-id']) ?>">
      <input type="hidden" name="token" id="token"  value="<?= $csrf_token ?>">
      <div class="submit-button">
        <input type="submit" value="確認">
      </div>
    </form>
  </div>
</div>
</body>
<script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js"></script>
<script src="./js/vendor/throttle-debounce.min.js"></script>
<script src="./js/vendor/holiday_jp.min.js"></script>
<script src="./js/jquery.cookie.js"></script>
<script charset="utf-8" src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
<script src="./js/config.js?v=<?= filemtime('js/config.js'); ?>"></script>
<script src="./js/form.js?v=<?= filemtime('js/form.js'); ?>"></script>
</html>
