<?php

include_once '../conf/config.inc.php'; // app config
include_once '../lib/_functions.inc.php'; // app functions

$network = safeParam('network', 'SFBayArea');
$station = safeParam('station', 'p271');

$name = strtoupper($station);

if (!isset($TEMPLATE)) {
  $TITLE = "$network Network";
  $SUBTITLE = "GPS Station $name Kinematic Data";
  $TITLETAG = "$TITLE | $SUBTITLE";
  $NAVIGATION = true;
  $HEAD = '
    <link rel="stylesheet" href="../../css/kinematic.css" />
  ';
  $FOOT = '
    <script>
      var MOUNT_PATH = "' . $MOUNT_PATH . '",
          STATION = "' . $station . '";
    </script>
    <script src="../../lib/dygraph/dygraph-combined.js"></script>
    <script src="../../js/kinematic.js"></script>
  ';
  $CONTACT = 'jsvarc';

  include 'template.inc.php';
}

$backLink = sprintf('%s/%s/%s',
  $MOUNT_PATH,
  $network,
  $station
);

print '<h2 class="subtitle">' . $SUBTITLE . '</h2>';

?>

<p>Click and drag on a plot to zoom in. Hold shift while dragging to pan.</p>

<nav>
  <button class="pan left"><i class="material-icons">&#xE5CB;</i> Left</button>
  <button class="pan right">Right <i class="material-icons">&#xE5CC;</i></button>
  <button class="reset"><i class="material-icons">&#xE5D5;</i> Reset</button>
</nav>

<section class="plots">
  <div class="north plot"><p class="loading">Loading&hellip;</p></div>
  <div class="east plot"><p class="loading">Loading&hellip;</p></div>
  <div class="up plot"><p class="loading">Loading&hellip;</p></div>
  <h2>Downloads</h2>
  <ul class="downloads no-style">
    <li><a href="kinematic/data" class="text">Plot data</a></li>
  </ul>
</section>

<p class="back">&laquo;
  <a href="<?php print $backLink; ?>">Back to station <?php print $name; ?></a>
</p>
