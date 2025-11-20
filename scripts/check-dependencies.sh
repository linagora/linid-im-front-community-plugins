#!/bin/bash

rm -f dependencies.txt

for app in apps/*; do
  if [ -d "$app" ]; then
    echo "### $(basename "$app")" >> dependencies.txt
    echo "" >> dependencies.txt
    echo '```bash' >> dependencies.txt

    (cd "$app" && npx npm-check-updates) >> dependencies.txt

    echo '```' >> dependencies.txt
    echo "" >> dependencies.txt
  fi
done
