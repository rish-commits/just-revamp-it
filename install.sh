#!/bin/sh
# just-revamp-it — install into the current project.
#
#   sh install.sh
#
# Copies the skill into ./.claude/skills/. That location works in every place
# Claude Code runs (terminal, VS Code, JetBrains, desktop) with no plugin
# commands and nothing to configure. Safe to re-run: it replaces the copy.

set -e

REPO="https://github.com/rish-commits/just-revamp-it.git"
DEST=".claude/skills/just-revamp-it"
TMP=".jri-install-tmp"

command -v git  >/dev/null 2>&1 || { echo "error: git is required."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "error: Node 18+ is required (nodejs.org)."; exit 1; }

MAJOR=$(node -p "process.versions.node.split('.')[0]")
[ "$MAJOR" -ge 18 ] || { echo "error: Node 18+ required, found $(node -v)."; exit 1; }

[ -d .git ] || echo "note: this does not look like a project root. Installing into $(pwd)"

rm -rf "$TMP"
git clone -q --depth 1 "$REPO" "$TMP"
mkdir -p .claude/skills
rm -rf "$DEST"
cp -R "$TMP/skills/just-revamp-it" .claude/skills/
rm -rf "$TMP"

echo "Installed just-revamp-it into $DEST"
echo "  $(ls "$DEST/reference" | wc -l | tr -d ' ') chapters, $(ls "$DEST/scripts"/*.mjs | wc -l | tr -d ' ') scripts"
echo
echo "Restart Claude Code, then run:  /just-revamp-it audit"
