#!/usr/local/bin/php
<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

date_default_timezone_set('Asia/Tokyo');

require(dirname(__FILE__) . '/src/PHPMailer/src/PHPMailer.php');
require(dirname(__FILE__) . '/src/PHPMailer/src/Exception.php');
require(dirname(__FILE__) . '/src/PHPMailer/src/SMTP.php');
require(dirname(__FILE__) . '/const.php');
$logfile = dirname(__FILE__).'/log.txt';
$errfile = dirname(__FILE__).'/errorlog.txt';
// $mailfile = dirname(__FILE__).'/mail.txt';

//echo $logfile;
$mail_body = file_get_contents("php://stdin");
// $mail_body = file_get_contents($mailfile);
$subject = get_subject($mail_body);

$body = strip_tags(get_body("",$mail_body));
$indx = 0;
$api_url = API_URL;
$token = TOKEN;
$mailTo = MAIL_TO;
$planNameCheck1 = "手びねり";
$planNameCheck2 = "電動ろくろ";
$lineId = "";
$name = "";
$tel = "";
$calId = "";
$eventName = "";
$eventId = "";
$eventDate = "";
$eventTime = "";
$seats = "";
$memo = "";
$num = 1;

$mailNew = strstr($body, "予約が確定しました。");
$mailCheck = strstr($body, "予約がキャンセルされました。");

if($mailNew || $mailCheck){

    //予約番号の解析
    $lineId = intercept_str("予約番号：","利用日時：",$body);
    //利用日時の解析
    $mailDate = intercept_str("利用日時：","プラン名：",$body);
    //プラン名の解析
    $planName = intercept_str("プラン名：","人数：",$body);
    //体験者氏名の解析
    $name = intercept_str("体験者氏名：","様",$body);
    //当日緊急連絡先：の解析
    $tel = intercept_str("当日緊急連絡先：","---------------------",$body);

    $act_new = [];

    if($mailNew){
        //new api
        $act_new_json = file_get_contents($api_url."?act=new&token=".$token);
        $act_new = json_decode($act_new_json,true);
    }else{
        //check api
        $act_new_json = file_get_contents($api_url."?act=check&token=".$token."&lineId=".$lineId);
        $act_new = json_decode($act_new_json,true);
    }

    if($act_new == null){
        //mail 送信
        toMail($subject, $mailDate, $name, $tel, $mailTo, $body);
        return;
    }

    $dateArr = explode(" ",$mailDate);
    $toDate = trim(substr($dateArr[0],0,strpos($dateArr[0],"(")));
    $time = trim($dateArr[1]);

    $dateArr = explode("/",$toDate);
    $date = $dateArr[0]."年".$dateArr[1]."月".$dateArr[2]."日";
    $time = substr($time,0,strpos($time,":")+3);

    $nowDate = date("Y/m/d H:i");

    if($nowDate > $toDate." ".$time){
         //mail 送信
         toMail($subject, $mailDate, $name, $tel, $mailTo, $body);
         $addinfo = "現在時刻:".$nowDate." 予約時刻:".$toDate." ".$time;
         setErrLog($errfile, $lineId, $mailDate, $name, $tel,$addinfo);
         return;
    }

    $numArr = array();

    // テストため
    $addinfo=" 予約時刻:".$toDate." ".$time." ".$date;

    foreach($act_new as $item){
        $eventTime = substr($item['eventTime'],0,strpos($item['eventTime'],":")+3);
         // テストため
         $addinfo=$addinfo."\n 比較時刻:".$item['eventDate']." ".$item['eventTime']." ".$eventTime;
        if($date == $item['eventDate'] && $time == $eventTime){
            $numArr[] = $item;
        }
    }

    if(count($numArr) > 0){
        foreach($numArr as $k => $item){
            if((strpos($planName, $planNameCheck1) && strpos( $item['eventName'], $planNameCheck1)) 
            || (strpos($planName, $planNameCheck2) && strpos( $item['eventName'], $planNameCheck2))){
                $indx = $k;
                break;
            }
        }

    }else{
       //mail 送信
       toMail($subject, $mailDate, $name, $tel, $mailTo, $body);
       setErrLog($errfile, $lineId, $mailDate, $name, $tel,$addinfo);
       return;
    }

    $calId = $numArr[$indx]['calId'];
    $eventName = $numArr[$indx]['eventName'];
    $eventId = $numArr[$indx]['eventId'];
    str_replace("年","/",$numArr[$indx]['eventDate']);
    $eventDate = str_replace("年", "/", $numArr[$indx]['eventDate']);
    $eventDate = str_replace("月", "/", $eventDate);
    $eventDate = str_replace("日", "", $eventDate);
    $eventTime = $numArr[$indx]['eventTime'];
    if ($mailNew) {
        $memo = $numArr[$indx]['memo'];
    }

    if($mailNew){
        // post api
        $api_data = [
            "action"=>"reserve",
            "token" => $token,
            "lineId" => $lineId,
            "calId" => $calId,
            "eventName" => $eventName,
            "eventId" => $eventId,
            "eventDate" => $eventDate,
            "eventTime" => $eventTime,
            "num" => $num,
            "name" => $name,
            "tel" => $tel,
            "memo" => $memo
        ];
        $returnData = request_by_curl($api_url, $api_data);
        //log
        setLog($subject, $lineId, $mailDate, $name, $tel, $logfile);
    }else{
        //cancel api
        $api_data = [
            "action"=>"cancel",
            "token" => $token,
            "lineId" => $lineId,
            "calId" => $calId,
            "eventName" => $eventName,
            "eventId" => $eventId,
            "eventDate" => $eventDate,
            "eventTime" => $eventTime,
            "num" => $num,
            "name" => $name,
            "tel" => $tel
        ];
        $returnData = request_by_curl($api_url, $api_data);
        //log
        setLog($subject, $lineId, $mailDate, $name, $tel, $logfile);
    }

}else{
    return;
}

function request_by_curl($remote_server, $post_string)
{
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch,CURLOPT_URL,$remote_server);
        curl_setopt($ch,CURLOPT_POST, 1);
        curl_setopt($ch,CURLOPT_POSTFIELDS,json_encode($post_string));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
        curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
        $data = curl_exec($ch);
        curl_close($ch);
        return $data;
    } else {
        $date = date('Y-m-d h:i:s');
        $errLog = "===========err STATR ".$date."===========\n";
        $errLog .= "curlは未インストール\n";
        $errLog .= "======================err End=======================\n";
        file_put_contents($errfile, $errLog,  FILE_APPEND);
    }
}

function setErrLog($errlogfile, $lineId, $mailDate, $name, $tel,$addinfo){

    $date = date('Y-m-d h:i:s');
    $errLog = "===========err STATR ".$date."===========\n";
    $errLog .= "【予約システム】自動取り込みに失敗した予約があります\n";
    $errLog .= "予約番号：".$lineId."\n";
    $errLog .= "体験者氏名：".$name."\n";
    $errLog .= "利用日時：".$mailDate."\n";
    $errLog .= "緊急連絡先：".$tel."\n";
    $errLog .= $addinfo."\n";
    $errLog .= "======================err End=======================\n";
    file_put_contents($errlogfile, $errLog,  FILE_APPEND);
}

function setLog($subject, $lineId, $mailDate, $name, $tel, $logfile){

    $date = date('Y-m-d h:i:s');
    $log = "===========メール受信 STATR ".$date."===========\n";
    $log .= "==================メール本文==================\n";
    $log .= "Subject：".$subject."\n";
    $log .= "予約番号：".$lineId."\n";
    $log .= "利用日時：".$mailDate."\n";
    $log .= "体験者氏名：".$name."\n";
    $log .= "当日緊急連絡先：".$tel."\n";
    $log .= "=====================メール受信 End======================\n";
    file_put_contents($logfile, $log);
}

function toMail($mailSubject, $date, $name, $tel, $to, $mail_body){
    $charset = check_charset($mail_body);
    if (empty($charset)) {
        $charset = "UTF-8";
    }
    // email
    // 文字エンコードを指定
    mb_language('japanese');
    mb_internal_encoding($charset);
    // インスタンスを生成（true指定で例外を有効化）
    $mail = new PHPMailer(true);
    // 文字エンコードを指定
    $mail->CharSet = $charset;
    $mail->Encoding = 'base64';

    $from = '予約フォーム';
    $subject = "【予約システム】自動取り込みに失敗した予約があります";

    $body = "予約システムをご利用頂き、ありがとうございます。\r\n\r\n";
    $body .= "下記のメールからの予約更新に失敗致しました。\r\n";
    $body .= "定員が減らせていない可能性がありますので、\r\n";
    $body .= "ご確認をお願いいたします。\r\n\r\n";
    $body .= "件　名：".$mailSubject."\r\n";
    $body .= "日　時：".$date."\r\n\r\n";
    $body .= "予約者：".$name."\r\n";
    $body .= "連絡先：".$tel."\r\n\r\n";
    $body .= "以下本文------------------------------\r\n";
    if ($charset != "UTF-8"){
        $from = mb_convert_encoding($from, $charset ,"UTF-8");
        $subject = mb_convert_encoding($subject, $charset ,"UTF-8");
        $body = mb_convert_encoding($body, $charset ,"UTF-8");
    }

    $body .= $mail_body;
    // SMTPサーバの設定
    $mail->isSMTP();                          // SMTPの使用宣言
    $mail->Host       = MAIL_HOST;   // SMTPサーバーを指定
    $mail->SMTPAuth   = true;                 // SMTP authenticationを有効化
    $mail->Username   = MAIL_USERNAME;   // SMTPサーバーのユーザ名
    $mail->Password   = MAIL_PASSWORD;           // SMTPサーバーのパスワード
    $mail->SMTPSecure = 'ssl';  // 暗号化を有効（tls or ssl）無効の場合はfalse
    $mail->Port       = MAIL_PORT; // TCPポートを指定（tlsの場合は465や587）
    // 送受信先設定（第二引数は省略可）
    $mail->setFrom(MAIL_USERNAME, $from); // 送信者
    $toArr = explode(",", $to);
    foreach( $toArr as $address) {
        $mail->addAddress($address, '');// 宛先
    }

    $mail->addReplyTo(MAIL_USERNAME, ''); // 返信先
    $mail->Sender = MAIL_USERNAME; // Return-path
    // 送信内容設定
    $mail->Subject = $subject;
    $mail->Body    = $body;
    // 送信
    $mail->send();
}

//
// メール処理ユーティリティ関数
//

function intercept_str($start,$end,$str)
{
    $strarr=explode($start,$str);
    $str=$strarr[1];
    $strarr=explode($end,$str);
    $strarr = explode("\n", str_replace(array("\r\n", "\r", "\n"), "\n", $strarr[0]));
    return $strarr[0];
}

function check_is_right_encode($decoded)
{
    if (preg_match("/名前|氏名/u", $decoded)) return true;
    return false;
}

function get_from($raw)
{
    try {

        $lines = explode("\n", $raw);

        $from_found= false;
        $from = "";
        for ($i = 0; $i < count($lines); $i++)
        {
            if (!$from_found)
            {
                if (preg_match("/^From:/i", $lines[$i]))
                {
                    $from = preg_replace("/^From:/i", "", $lines[$i]);
                    $from_found = true;
                }
            }
            else
            {
                $first_char = substr($lines[$i], 0, 1);
                if ($first_char == " " || $first_char == "\t")
                {
                    $from .= $lines[$i];
                }
                else
                {
                    break;
                }
            }
        }

        return mb_decode_mimeheader(trim($from));

    }catch(Exception $e){
        file_put_contents(__DIR__.DIRECTORY_SEPARATOR.'errorlog.txt', "get_from Exception: ".$e->getMessage()."\n",FILE_APPEND);
    }
    return "get_from Error";
}

function get_subject($raw)
{

    try {

        $lines = explode("\n", $raw);

        $subject_found= false;
        $subject = "";
        for ($i = 0; $i < count($lines); $i++)
        {
            if (!$subject_found)
            {
                if (preg_match("/^Subject:/i", $lines[$i]))
                {
                    $subject = preg_replace("/^Subject:/i", "", $lines[$i]);
                    $subject_found = true;
                }
            }
            else
            {
                $first_char = substr($lines[$i], 0, 1);
                if ($first_char == " " || $first_char == "\t")
                {
                    $subject .= $lines[$i];
                }
                else
                {
                    break;
                }
            }
        }

        return mb_decode_mimeheader(trim($subject));

    }catch(Exception $e){
        file_put_contents(__DIR__.DIRECTORY_SEPARATOR.'errorlog.txt', "get_subject Exception: ".$e->getMessage()."\n",FILE_APPEND);
    }
    return "get_subject Error";
}

function get_body($type, $raw)
{
    try {
        $lines = explode("\n", str_replace(array("\r\n", "\r", "\n"), "\n", $raw));
        $body = "";
        $body_in = false;
        for ($i = 0; $i < count($lines); $i++)
        {
            if ($body_in)
            {
                $body .= $lines[$i] ."\n";
            }
            else
            {
                if (strlen($lines[$i]) == 0) $body_in = true;
            }
        }

        $is_quoted_printable = check_is_quoted_printable($raw);
        $boundary = check_boundary($raw);

        if ($boundary)
        {
            $body = base64change($body, $boundary);
        }
        else
        {
            $charset = check_charset($raw);
            if (empty($charset)) {
                $charset = "UTF-8";
            }
            $is_base64 = check_is_base64($raw);
            $body = decode_email_body($body, $charset, $is_quoted_printable, $is_base64);
        }

        $body = strip_brank_lines($body);

        return $body;
    }catch(Exception $e){
        file_put_contents(__DIR__.DIRECTORY_SEPARATOR.'errorlog.txt', "get_body Exception: ".$e->getMessage()."\n",FILE_APPEND);
    }

    return "get_body Error";
}

function check_charset($raw)
{
    if (preg_match("/charsets*=s*(.+?)[;\n]/s", $raw, $match))
    {
        return strtolower(trim(str_replace('"', "", $match[1])));
    }
    else
    {
        return "";
    }
}

function check_is_quoted_printable($raw)
{
    if (preg_match("/quoted-printable/i", $raw))
    {
        return true;
    }
    else
    {
        return false;
    }
}

function check_is_base64($raw)
{
    if (preg_match("/Content-Transfer-Encoding:\s*base64/i", $raw))
    {
        return true;
    }
    else
    {
        return false;
    }
}

function check_boundary($raw)
{
    // Content-Type: multipart/alternative; boundary="000000000000d8a4fa0587bc6b74"
    if (preg_match("/multipart\/(alternative|mixed|related);.+?boundarys*=s*(.+?)[;\n]/s", $raw, $match))
    {
        return trim(str_replace('"', "", $match[2]));
    }
    else
    {
        return "";
    }
}


function decode_email_body($body, $charset = "JIS", $is_quoted_printable, $is_base64)
{
    // http://program.station.ez-net.jp/mini/encode/quoted.asp
    // Content-Transfer-Encoding: quoted-printable は 8bitが7bitになっているのでそれを復元してやらないと文字化けする
    if ($is_quoted_printable)
    {
        $body = quoted_printable_decode($body);
    }

    // Content-Transfer-Encoding: base64の場合のデコード
    if ($is_base64)
    {
        $body = base64_decode($body);
    }

    // http://www.atmarkit.co.jp/ait/articles/0602/18/news009.html
    // 現在本文で使われているメールはほぼ JIS
    // 海外からのスパムメールで、UTF-8 か UTF-7 が使われている程度
    // return mb_convert_encoding($body,"UTF-8","EUC-JP");
    // $decoded = mb_convert_encoding($body, "UTF-8","auto");
    if ($charset != "UTF-8" && $charset != "utf-8"){
        $decoded = mb_convert_encoding($body, "UTF-8", $charset);
        if (!check_is_right_encode($decoded)) $decoded = mb_convert_encoding($body, "UTF-8", "JIS");
        if (!check_is_right_encode($decoded)) $decoded = mb_convert_encoding($body, "UTF-8", "EUC-JP");
    } else {
        $decoded = $body;
    }

    return $decoded;
}

function base64change($body, $boundary)
{
    if (strlen($boundary) == 0)
    {
        return $body;
    }

    $temp = "";

    $parts = explode("--{$boundary}", $body);
    foreach ($parts as $part)
    {
        $lines = explode("\n", str_replace(array("\r\n", "\r", "\n"), "\n", $part));

        $part_head = "";
        $part_body = "";
        $is_body = false;
        $is_pre = true;

        foreach ($lines as $line)
        {
            if ($line != "") $is_pre = false;
            if ($is_pre) continue;
            if (!$is_body)
            {
                if($line == "")
                {
                    $is_body = true;
                }
                else
                {
                    $part_head .= $line."\n";
                }
            }
            else
            {
                $part_body .= $line."\n";
            }
        }

        $innerBoundary = check_boundary($part_head);
        if ($innerBoundary)
        {
            // マルチパートが入れ子になっているケース
            $innerPart = base64change($part_body, $innerBoundary);
            $temp .= $innerPart;
        }
        elseif (preg_match("/text\/plain|text\/html/ui",$part_head))
        {
            if (preg_match("/Content-Transfer-Encoding:[ ]*base64/ui",$part_head))
            {
                $part_body = base64_decode($part_body)."\n";
            }
            elseif (preg_match("/Content-Transfer-Encoding:[ ]*quoted-printable/ui",$part_head))
            {
                $part_body = quoted_printable_decode($part_body)."\n";
            }

            $charset = check_charset($part_head);
            $part_body = mb_convert_encoding($part_body, "UTF-8", $charset);

            $temp .= $part_head."\n\n".$part_body;
        }
    }

    $temp = str_replace(array("\r\n", "\r", "\n"), "\n", $temp);

    return $temp;
}


function strip_brank_lines($body)
{
    $lines = explode("\n", str_replace(array("\r\n", "\r", "\n"), "\n", $body));
    $lines = explode("\n",$body);

    $temp = "";
    $in_blank_part = false;
    foreach ($lines as $line)
    {
        if (strlen($line) ==0)
        {
            $in_blank_part = true;
        }
        else
        {
            if ($in_blank_part)
            {
                $temp .= "\n";
                $in_blank_part = false;
            }
            $temp .= $line."\n";
        }
    }

    return $temp;
}
?>