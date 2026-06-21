#!/usr/bin/env sh
set -eu

echo "Guestly SQL check"
echo "================="

for file in database/*.sql; do
  test -s "$file"
  grep -qiE "create|insert|select|refresh" "$file"
  echo "checked $file"
done

echo "SQL check complete"
