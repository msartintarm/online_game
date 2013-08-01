<?php

  //To execute: `php -S localhost:8000 -t .`

$oldF = $_SERVER["SCRIPT_FILENAME"];
$path = pathinfo($oldF);
$ext = $path["extension"];

if ($ext === "js") {

  $oldF = $_SERVER["SCRIPT_FILENAME"];
  $newF = $oldF . ".gz";

  $gz = gzopen ( $newF, 'w9' );
  gzwrite ( $gz, file_get_contents($oldF) );
  gzclose ($gz);
  header("Content-Type: application/javascript");
  header("Content-Encoding: gzip");
  header("Cache-Control: public");
  header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($oldF)));
  readfile($newF);

} else if ($ext === "gif" || $ext === "jpg") {
  header("Cache-Control: public");
  return FALSE;
} else {
  return FALSE;
}

?>