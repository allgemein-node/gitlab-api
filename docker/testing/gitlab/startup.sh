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
  echo "Install backup ..."
  gitlab-ctl stop unicorn
  gitlab-ctl stop puma
  gitlab-ctl stop sidekiq
  gitlab-backup restore BACKUP=test force=yes
  touch /etc/.gitlab-booted
  gitlab-ctl start sidekiq
  gitlab-ctl start puma
  gitlab-ctl start unicorn
  echo "Install backup => done"
fi

echo "Show jobs"
jobs -l
echo "Move back to foreground"
fg %1

