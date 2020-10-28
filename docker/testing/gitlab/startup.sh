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
  req=`curl -L  http://127.0.0.1:8929/api/v4/projects -H "PRIVATE-TOKEN: Nx78xRzzLMKxBVmYnhzr" -I  2>/dev/null | head -n 1 | cut -d$' ' -f2`;
  while [ "$req" != "200" ];
  do
    echo "Waiting for server ..."
    sleep 5;
    req=`curl -L  http://localhost:8929/api/v4/projects -H "PRIVATE-TOKEN: Nx78xRzzLMKxBVmYnhzr" -I  2>/dev/null | head -n 1 | cut -d$' ' -f2`;
  done

  touch /etc/.gitlab-booted
  echo "Install backup => done"
fi

echo "Show jobs"
jobs -l
echo "Move back to foreground"
fg %1

