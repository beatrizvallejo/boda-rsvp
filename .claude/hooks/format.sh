#!/usr/bin/env bash
# PostToolUse (Edit|Write|MultiEdit): formatea el archivo editado si el proyecto ya tiene Prettier/ESLint.
# Nunca bloquea: siempre sale con 0.
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -d node_modules ] || exit 0

FILE=$(node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{const j=JSON.parse(d);process.stdout.write((j.tool_input&&j.tool_input.file_path)||"")}catch(e){}})')
[ -n "$FILE" ] && [ -f "$FILE" ] || exit 0

case "$FILE" in
  *.ts|*.js|*.mjs|*.vue|*.css|*.json) ;;
  *) exit 0 ;;
esac

if [ -x node_modules/.bin/prettier ]; then
  node_modules/.bin/prettier --write "$FILE" >/dev/null 2>&1
fi
case "$FILE" in
  *.ts|*.js|*.mjs|*.vue)
    if [ -x node_modules/.bin/eslint ]; then
      node_modules/.bin/eslint --fix "$FILE" >/dev/null 2>&1
    fi
    ;;
esac
exit 0
