#!/usr/bin/env sh
set -eu

echo "Guestly launch check"
echo "===================="
npm run lint
npm run intelligence:verify
npm run intelligence:audit
npm run sql:check
python3 tools/feedback_report.py
echo "Launch check complete"
