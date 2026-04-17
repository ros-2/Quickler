#!/usr/bin/env bash
# Stamp the site with a build number and write it into every page's footer.
#
# Usage: bash bump-version.sh
#        Then commit + push. The resulting commit itself is the version.
#
# The version is the commit count reachable from HEAD plus one (to account
# for the commit we are about to make). Idempotent across pages: existing
# 'site version N' lines get replaced, not duplicated.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

CURRENT="$(git rev-list --count HEAD 2>/dev/null || echo 0)"
NEXT=$((CURRENT + 1))
echo "==> Stamping site version $NEXT"
echo "$NEXT" > VERSION

STAMP="<div class=\"site-version\" style=\"text-align:center;font-size:0.75rem;opacity:0.55;margin-top:6px;\">site version $NEXT</div>"

updated=0
for f in *.html pages/*.html; do
  [ -f "$f" ] || continue
  if ! grep -q "</footer>" "$f"; then
    continue
  fi
  if grep -q '<div class="site-version"' "$f"; then
    # Replace existing stamp — sed BSD/GNU portable via perl.
    perl -i -pe 's|<div class="site-version"[^<]*</div>|'"$STAMP"'|' "$f"
  else
    # Insert before </footer>.
    perl -i -pe 's|(\s*)</footer>|\1    '"$STAMP"'\n\1</footer>|' "$f"
  fi
  updated=$((updated + 1))
done

echo "    $updated file(s) updated"
echo "    don't forget to commit + push"
