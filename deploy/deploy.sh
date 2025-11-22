#!/bin/bash
set -e

LOGFILE="$HOME/projects/peaceverse/deploy/peaceverse-deploy.log"
echo "📌 Starting deployment... $(date)" | tee -a $LOGFILE

# Navigate to project
cd $HOME/projects/peaceverse

# Clean untracked files in deploy folder to avoid git merge issues
git clean -fd deploy >> $LOGFILE 2>&1

# Reset and pull latest changes
git reset --hard >> $LOGFILE 2>&1
git pull origin main >> $LOGFILE 2>&1

echo "➡️ Updating backend..." | tee -a $LOGFILE
cd backend
npm install >> $LOGFILE 2>&1

# Restart or start backend with PM2
pm2 restart peaceverse || pm2 start server.js --name peaceverse >> $LOGFILE 2>&1

echo "➡️ Building frontend..." | tee -a $LOGFILE
cd ../frontend
npm install >> $LOGFILE 2>&1
npm run build >> $LOGFILE 2>&1

echo "➡️ Deploying frontend to Nginx directory..." | tee -a $LOGFILE
rm -rf /var/www/peaceverse/* 2>> $LOGFILE
cp -r dist/* /var/www/peaceverse/ >> $LOGFILE 2>&1

echo "➡️ Reloading Nginx..." | tee -a $LOGFILE
nginx -t >> $LOGFILE 2>&1
nginx -s reload >> $LOGFILE 2>&1

echo "✅ Deployment complete! $(date)" | tee -a $LOGFILE
