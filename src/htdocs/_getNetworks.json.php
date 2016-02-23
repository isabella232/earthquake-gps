<?php

include '../lib/classes/Db.class.php'; // db connector, queries
include '../lib/functions/functions.inc.php'; // app functions

date_default_timezone_set('UTC');

$callback = safeParam('callback');
$now = date(DATE_RFC2822);

$db = new Db;

// Db query result: all "non-hidden" networks
$rsNetworks = $db->queryNetworks();

// Initialize array template for json feed
$output = [
  'count' => $rsNetworks->rowCount(),
  'generated' => $now,
  'features' => [],
  'type' => 'FeatureCollection'
];

// Store results from db into features array
while ($row = $rsNetworks->fetch(PDO::FETCH_ASSOC)) {
  $feature = [
    'id' => intval($row['id']),
    'geometry' => [
      'coordinates' => [
        floatval($row['lon']),
        floatval($row['lat'])
      ],
      'type' => 'Point'
    ],
    'properties' => [
      'name' => $row['name'],
      'type' => $row['type']
    ],
    'type' => 'Feature'
  ];

  array_push($output['features'], $feature);
}

// Send json stream to browser
showJson($output, $callback);
