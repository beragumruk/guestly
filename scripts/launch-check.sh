#!/usr/bin/env sh
set -eu

echo "Guestly launch check"
echo "===================="
npm run lint
python3 tools/feedback_report.py
echo "Launch check complete"
