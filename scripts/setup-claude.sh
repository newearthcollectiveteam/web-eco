#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Claude Code Framework Setup
# Installs the unified development framework, skills, and
# patterns into the developer's ~/.claude/ directory.
# ============================================================

CLAUDE_DIR="$HOME/.claude"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
FRAMEWORK_SRC="$REPO_DIR/claude-framework"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Claude Code Framework Setup                 ║${NC}"
echo -e "${BLUE}║  New Earth Collective Development Standards   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Check that the framework source exists in the repo
if [ ! -d "$FRAMEWORK_SRC" ]; then
  echo -e "${RED}Error: claude-framework/ directory not found in repo root.${NC}"
  echo "Make sure you've pulled the latest code and the directory exists."
  exit 1
fi

# Check for existing installation
if [ -f "$CLAUDE_DIR/FRAMEWORK.md" ]; then
  echo -e "${YELLOW}Existing Claude framework detected at $CLAUDE_DIR${NC}"
  read -rp "Overwrite with project framework? (y/N): " confirm
  if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Aborted. Existing setup unchanged."
    exit 0
  fi
  echo ""
fi

# Create ~/.claude if needed
mkdir -p "$CLAUDE_DIR"

echo -e "${GREEN}[1/5]${NC} Installing core framework files..."
cp "$FRAMEWORK_SRC/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md"
cp "$FRAMEWORK_SRC/FRAMEWORK.md" "$CLAUDE_DIR/FRAMEWORK.md"
cp "$FRAMEWORK_SRC/MULTIAGENT.md" "$CLAUDE_DIR/MULTIAGENT.md"
echo "  ✓ CLAUDE.md (global instructions)"
echo "  ✓ FRAMEWORK.md (development standards)"
echo "  ✓ MULTIAGENT.md (parallel workflow protocol)"

echo -e "${GREEN}[2/5]${NC} Installing settings..."
# Only install settings.json if it doesn't exist (don't overwrite personal settings)
if [ ! -f "$CLAUDE_DIR/settings.json" ]; then
  cp "$FRAMEWORK_SRC/settings.json" "$CLAUDE_DIR/settings.json"
  echo "  ✓ settings.json (installed)"
else
  echo "  ⊘ settings.json already exists (skipped — won't overwrite your personal settings)"
fi

echo -e "${GREEN}[3/5]${NC} Installing skills (27 custom skills)..."
mkdir -p "$CLAUDE_DIR/skills"
# Copy all skills, overwriting existing ones to ensure latest version
cp -R "$FRAMEWORK_SRC/skills/"* "$CLAUDE_DIR/skills/" 2>/dev/null || true
SKILL_COUNT=$(ls -d "$CLAUDE_DIR/skills/"*/ 2>/dev/null | wc -l | tr -d ' ')
echo "  ✓ $SKILL_COUNT skills installed"

echo -e "${GREEN}[4/5]${NC} Installing patterns library..."
mkdir -p "$CLAUDE_DIR/patterns"
cp -R "$FRAMEWORK_SRC/patterns/"* "$CLAUDE_DIR/patterns/" 2>/dev/null || true
PATTERN_COUNT=$(ls "$CLAUDE_DIR/patterns/"*.md 2>/dev/null | wc -l | tr -d ' ')
echo "  ✓ $PATTERN_COUNT patterns installed"

echo -e "${GREEN}[5/5]${NC} Setting up Supabase MCP..."
# Check if Claude CLI is installed
if command -v claude &> /dev/null; then
  echo "  Claude CLI detected. Adding Supabase MCP server..."
  echo ""
  echo -e "${YELLOW}  To connect Supabase MCP, run:${NC}"
  echo "    claude mcp add supabase -- npx -y @anthropic-ai/supabase-mcp@latest"
  echo ""
  echo "  Then follow the prompts to authenticate with your Supabase account."
else
  echo -e "${YELLOW}  Claude CLI not found. Install it first:${NC}"
  echo "    npm install -g @anthropic-ai/claude-code"
  echo ""
  echo "  Then add Supabase MCP:"
  echo "    claude mcp add supabase -- npx -y @anthropic-ai/supabase-mcp@latest"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "What was installed:"
echo "  ~/.claude/CLAUDE.md       — Global development instructions"
echo "  ~/.claude/FRAMEWORK.md    — Unified development framework (v1.19.0)"
echo "  ~/.claude/MULTIAGENT.md   — Multi-agent workflow protocol"
echo "  ~/.claude/settings.json   — Claude Code settings"
echo "  ~/.claude/skills/         — 27 custom skills (/resume, /handoff, etc.)"
echo "  ~/.claude/patterns/       — 18 reusable architecture patterns"
echo ""
echo "Next steps:"
echo "  1. Run 'claude' in this project directory to start Claude Code"
echo "  2. Type '/resume' to load project context"
echo "  3. Check CONTRIBUTING.md for the development workflow"
echo ""
