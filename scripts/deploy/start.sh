#!/bin/bash
cd /www/wwwroot/seo-admin
exec dotenv -e /www/wwwroot/seo-admin/.env.local -- /www/wwwroot/seo-admin/node_modules/.bin/next start -p 3100
