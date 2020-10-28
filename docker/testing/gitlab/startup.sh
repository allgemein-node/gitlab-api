#!/bin/bash

set -m

./assets/wrapper &


if [ ! -f /etc/.gitlab-booted ]; then
  echo "Waiting ..."
  while [ ! -f /var/opt/gitlab/bootstrapped ]; do
    echo "Waiting for bootstrap ..."
    sleep 30
  done
  sleep 30
  cp /backups/test_gitlab_backup.tar /var/opt/gitlab/backups/
  chmod 600 /var/opt/gitlab/backups/test_gitlab_backup.tar
  chown git:git /var/opt/gitlab/backups/test_gitlab_backup.tar
  echo "Install backup ..."
  gitlab-ctl stop unicorn
  gitlab-ctl stop puma
  gitlab-ctl stop sidekiq
  gitlab-backup restore BACKUP=test force=yes
  gitlab-ctl start sidekiq
  gitlab-ctl start puma
  gitlab-ctl start unicorn
  sleep 30
  touch /etc/.gitlab-booted
  echo "Install backup => done"
fi

echo "Show jobs"
jobs -l
echo "Move back to foreground"
fg %1

