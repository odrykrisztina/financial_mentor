<?php
return [
  'paths' => ['api/*', 'sanctum/csrf-cookie'],
  'allowed_origins' => ['http://localhost:4200'],
  'allowed_methods' => ['*'],
  'allowed_headers' => ['*'],
  'supports_credentials' => false,
];