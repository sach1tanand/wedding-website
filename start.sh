#!/bin/bash
set -e
GOLD='\033[0;33m'; GREEN='\033[0;32m'; RED='\033[0;31m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "\n${GOLD}${BOLD}  ╔══════════════════════════════════════════════════╗"
echo -e "  ║  💍  ARYAN & PRIYA — WEDDING WEBSITE v2          ║"
echo -e "  ╚══════════════════════════════════════════════════╝${NC}\n"

command -v node >/dev/null 2>&1 || { echo -e "${RED}  ❌ Node.js not found. Install from https://nodejs.org${NC}"; exit 1; }
echo -e "${GREEN}  ✅ Node.js $(node -v) found.${NC}"

[ ! -f "$DIR/backend/.env" ] && cp "$DIR/backend/.env.example" "$DIR/backend/.env" && echo -e "${GOLD}  ⚠️  Created .env from template — fill in credentials.${NC}"

echo -e "\n${CYAN}  📦 Installing backend deps...${NC}"
cd "$DIR/backend" && [ ! -d node_modules ] && npm install --silent || echo -e "${GREEN}  ✅ Backend ready.${NC}"

echo -e "${CYAN}  📦 Installing frontend deps...${NC}"
cd "$DIR/frontend" && [ ! -d node_modules ] && npm install --silent || echo -e "${GREEN}  ✅ Frontend ready.${NC}"

mkdir -p "$DIR/backend/uploads"

echo -e "\n${CYAN}  🚀 Starting backend on :5000...${NC}"
cd "$DIR/backend" && npm start &
BPID=$!
sleep 4

echo -e "${CYAN}  🌸 Starting frontend on :3000...${NC}"
cd "$DIR/frontend" && npm start &
FPID=$!
sleep 8

echo -e "\n${GOLD}${BOLD}  ✅  http://localhost:3000  |  Admin: set in .env${NC}\n"
[[ "$OSTYPE" == "darwin"* ]] && open "http://localhost:3000" || xdg-open "http://localhost:3000" 2>/dev/null || true

trap "kill $BPID $FPID 2>/dev/null; echo 'Stopped.'" EXIT
wait
