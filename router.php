<?php

// To execute: `php -S localhost:8000 -t .`

$path = pathinfo($_SERVER["SCRIPT_FILENAME"]);
if ($path["extension"] === "js") {

  $old_file = $_SERVER["SCRIPT_FILENAME"];
  $new_file = $old_file . ".gz";


  $gz = gzopen ( $new_file, 'w9' );
  gzwrite ( $gz, file_get_contents($old_file) );
  gzclose ($gz);
  header("Content-Type: application/javascript");
  header("Content-Encoding: gzip");
  readfile($new_file);

} else {
  return FALSE;
}

?>