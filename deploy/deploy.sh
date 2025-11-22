#!/bin/bash
set -e

LOGFILE="/home/stanley/projects/peaceverse/deploy/peaceverse-deploy.log"

echo "📌 Starting deployment... $(date)" | tee -a $LOGFILE

# Navigate to project
cd /home/stanley/projects/peaceverse

# Reset and pull latest
git reset --hard >> $LOGFILE 2>&1
git pull origin main >> $LOGFILE 2>&1

echo "➡️ Updating backend..." | tee -a $LOGFILE
cd backend

npm install >> $LOGFILE 2>&1

pm2 restart peaceverse || pm2 start server.js --name peaceverse >> $LOGFILE 2>&1

echo "➡️ Building frontend..." | tee -a $LOGFILE
cd ../frontend

npm install >> $LOGFILE 2>&1
npm run build >> $LOGFILE 2>&1

echo "➡️ Deploying frontend to Nginx directory..." | tee -a $LOGFILE
sudo rm -rf /var/www/peaceverse/* 2>> $LOGFILE
sudo cp -r dist/* /var/www/peaceverse/ >> $LOGFILE 2>&1

echo "➡️ Reloading Nginx..." | tee -a $LOGFILE
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment complete! $(date)" | tee -a $LOGFILE