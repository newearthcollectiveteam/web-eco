#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Claude Code Framework Setup
# Selective, merge-based installer for the unified development
# framework, skills, and patterns into ~/.claude/.
#
# Usage:
#   ./scripts/setup-claude.sh                  # Interactive
#   ./scripts/setup-claude.sh --preset=standard # Non-interactive
#   ./scripts/setup-claude.sh --update         # Re-install same preset
#   ./scripts/setup-claude.sh --restore        # Restore from latest backup
#   ./scripts/setup-claude.sh --help           # Show help
# ============================================================

CLAUDE_DIR="$HOME/.claude"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
FRAMEWORK_SRC="$REPO_DIR/claude-framework"
MANIFEST_FILE="$FRAMEWORK_SRC/manifest.json"
TRACKING_FILE="$CLAUDE_DIR/.framework-manifest"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# ── Helpers ──────────────────────────────────────────────────

print_header() {
  echo ""
  echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Claude Code Framework Setup                 ║${NC}"
  echo -e "${BLUE}║  New Earth Collective Development Standards   ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
  echo ""
}

print_help() {
  echo "Claude Code Framework Setup"
  echo ""
  echo "Usage:"
  echo "  ./scripts/setup-claude.sh                    Interactive preset selection"
  echo "  ./scripts/setup-claude.sh --preset=minimal   Install minimal preset (11 skills)"
  echo "  ./scripts/setup-claude.sh --preset=standard  Install standard preset (22 skills)"
  echo "  ./scripts/setup-claude.sh --preset=full      Install full preset (34 skills)"
  echo "  ./scripts/setup-claude.sh --update           Re-install same preset with latest version"
  echo "  ./scripts/setup-claude.sh --restore          Restore from latest backup"
  echo "  ./scripts/setup-claude.sh --help             Show this help"
  echo ""
  echo "Presets:"
  echo "  minimal   Session management + Git workflow (essential tier)"
  echo "  standard  + Code quality & hygiene (recommended tier)"
  echo "  full      + Project setup, multi-agent, utilities (all tiers)"
  echo ""
  echo "The installer:"
  echo "  - Creates a backup before any changes (~/.claude-backup-<timestamp>/)"
  echo "  - Only overwrites framework-managed skills (preserves your custom skills)"
  echo "  - Tracks what was installed in ~/.claude/.framework-manifest"
  echo "  - Never overwrites settings.json if it already exists"
}

# Parse JSON value from manifest.json using grep/sed (no jq dependency)
json_value() {
  local key="$1"
  grep "\"$key\"" "$MANIFEST_FILE" | head -1 | sed 's/.*: *"\(.*\)".*/\1/'
}

# Get skills for a category from manifest.json
get_category_skills() {
  local category="$1"
  local in_category=false
  local in_skills=false
  local skills=()

  while IFS= read -r line; do
    if [[ "$line" =~ \"$category\" ]]; then
      in_category=true
    fi
    if $in_category && [[ "$line" =~ \"skills\" ]]; then
      in_skills=true
      continue
    fi
    if $in_skills && [[ "$line" =~ \] ]]; then
      break
    fi
    if $in_skills && [[ "$line" =~ \"([a-z_-]+)\" ]]; then
      skills+=("${BASH_REMATCH[1]}")
    fi
  done < "$MANIFEST_FILE"

  echo "${skills[@]}"
}

# Get categories for a preset from manifest.json
get_preset_categories() {
  local preset="$1"
  local in_preset=false
  local in_categories=false
  local categories=()

  while IFS= read -r line; do
    if [[ "$line" =~ \"$preset\" ]]; then
      in_preset=true
    fi
    if $in_preset && [[ "$line" =~ \"categories\" ]]; then
      in_categories=true
      continue
    fi
    if $in_categories && [[ "$line" =~ \] ]]; then
      break
    fi
    if $in_categories && [[ "$line" =~ \"([a-z_]+)\" ]]; then
      categories+=("${BASH_REMATCH[1]}")
    fi
  done < "$MANIFEST_FILE"

  echo "${categories[@]}"
}

# Get all skills for a preset
get_preset_skills() {
  local preset="$1"
  local all_skills=()

  for category in $(get_preset_categories "$preset"); do
    for skill in $(get_category_skills "$category"); do
      all_skills+=("$skill")
    done
  done

  echo "${all_skills[@]}"
}

# Create backup of existing ~/.claude/
create_backup() {
  if [ -d "$CLAUDE_DIR" ]; then
    local backup_dir="$HOME/.claude-backup-$(date +%Y%m%d-%H%M%S)"
    echo -e "${DIM}  Creating backup at $backup_dir${NC}"
    cp -R "$CLAUDE_DIR" "$backup_dir"
    echo -e "  ${GREEN}✓${NC} Backup created"
  fi
}

# Write tracking file
write_tracking() {
  local preset="$1"
  local skills_json="$2"
  local categories_json="$3"
  local version
  version=$(json_value "version")

  cat > "$TRACKING_FILE" << EOF
{
  "version": "$version",
  "preset": "$preset",
  "categories": [$categories_json],
  "skills": [$skills_json],
  "source_repo": "newearthcollectiveteam/web-eco",
  "installed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "installed_by": "$(git config user.name 2>/dev/null || echo "unknown")"
}
EOF
}

# ── Restore ──────────────────────────────────────────────────

do_restore() {
  local latest_backup
  latest_backup=$(ls -dt "$HOME"/.claude-backup-* 2>/dev/null | head -1)

  if [ -z "$latest_backup" ]; then
    echo -e "${RED}No backup found.${NC} No ~/.claude-backup-* directories exist."
    exit 1
  fi

  echo -e "Restoring from: ${BOLD}$latest_backup${NC}"
  read -rp "This will replace your current ~/.claude/. Continue? (y/N): " confirm
  if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi

  rm -rf "$CLAUDE_DIR"
  cp -R "$latest_backup" "$CLAUDE_DIR"
  echo -e "${GREEN}Restored successfully.${NC}"
  exit 0
}

# ── Update ───────────────────────────────────────────────────

do_update() {
  if [ ! -f "$TRACKING_FILE" ]; then
    echo -e "${RED}No previous installation found.${NC}"
    echo "Run without --update to do a fresh install."
    exit 1
  fi

  local installed_preset
  installed_preset=$(grep '"preset"' "$TRACKING_FILE" | sed 's/.*: *"\(.*\)".*/\1/')
  local installed_version
  installed_version=$(grep '"version"' "$TRACKING_FILE" | head -1 | sed 's/.*: *"\(.*\)".*/\1/')
  local new_version
  new_version=$(json_value "version")

  echo -e "Current installation: ${BOLD}$installed_preset${NC} preset, v${installed_version}"
  echo -e "Available version:   ${BOLD}v${new_version}${NC}"

  if [ "$installed_version" = "$new_version" ]; then
    echo -e "${YELLOW}Already up to date.${NC} Re-installing anyway to ensure consistency."
  fi

  PRESET="$installed_preset"
  do_install
}

# ── Install ──────────────────────────────────────────────────

do_install() {
  local version
  version=$(json_value "version")
  local skills
  skills=($(get_preset_skills "$PRESET"))
  local categories
  categories=($(get_preset_categories "$PRESET"))

  echo -e "${BOLD}Installing ${PRESET} preset (${#skills[@]} skills)...${NC}"
  echo ""

  # Step 1: Backup
  echo -e "${GREEN}[1/5]${NC} Backing up existing installation..."
  create_backup

  # Step 2: Create directories
  mkdir -p "$CLAUDE_DIR/skills"
  mkdir -p "$CLAUDE_DIR/patterns"

  # Step 3: Core docs (always installed)
  echo -e "${GREEN}[2/5]${NC} Installing core framework files..."
  cp "$FRAMEWORK_SRC/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md"
  cp "$FRAMEWORK_SRC/FRAMEWORK.md" "$CLAUDE_DIR/FRAMEWORK.md"
  cp "$FRAMEWORK_SRC/MULTIAGENT.md" "$CLAUDE_DIR/MULTIAGENT.md"
  echo "  ✓ CLAUDE.md (global instructions)"
  echo "  ✓ FRAMEWORK.md (development standards)"
  echo "  ✓ MULTIAGENT.md (parallel workflow protocol)"

  # Settings: never overwrite existing
  if [ ! -f "$CLAUDE_DIR/settings.json" ]; then
    cp "$FRAMEWORK_SRC/settings.json" "$CLAUDE_DIR/settings.json"
    echo "  ✓ settings.json (installed)"
  else
    echo -e "  ${DIM}⊘ settings.json already exists (preserved)${NC}"
  fi

  # Step 4: Skills (merge-based — only install preset skills, preserve custom)
  echo -e "${GREEN}[3/5]${NC} Installing skills (${#skills[@]} from ${PRESET} preset)..."

  local installed_count=0
  for skill in "${skills[@]}"; do
    local src_dir="$FRAMEWORK_SRC/skills/$skill"
    local dest_dir="$CLAUDE_DIR/skills/$skill"
    if [ -d "$src_dir" ]; then
      mkdir -p "$dest_dir"
      cp -R "$src_dir/"* "$dest_dir/"
      ((installed_count++))
    else
      echo -e "  ${YELLOW}⚠${NC}  Skill '$skill' listed in manifest but not found in distribution"
    fi
  done
  echo "  ✓ $installed_count skills installed"

  # Check for custom skills (skills in ~/.claude/skills/ not in the framework)
  local all_framework_skills
  all_framework_skills=($(get_preset_skills "full"))
  local custom_count=0
  if [ -d "$CLAUDE_DIR/skills" ]; then
    for skill_dir in "$CLAUDE_DIR/skills"/*/; do
      [ -d "$skill_dir" ] || continue
      local skill_name
      skill_name=$(basename "$skill_dir")
      local is_framework=false
      for fs in "${all_framework_skills[@]}"; do
        if [ "$fs" = "$skill_name" ]; then
          is_framework=true
          break
        fi
      done
      if ! $is_framework; then
        ((custom_count++))
      fi
    done
  fi
  if [ "$custom_count" -gt 0 ]; then
    echo -e "  ${DIM}⊘ $custom_count custom skill(s) preserved${NC}"
  fi

  # Step 5: Patterns (always install all — they're reference material)
  echo -e "${GREEN}[4/5]${NC} Installing patterns library..."
  cp -R "$FRAMEWORK_SRC/patterns/"* "$CLAUDE_DIR/patterns/" 2>/dev/null || true
  local pattern_count
  pattern_count=$(ls "$CLAUDE_DIR/patterns/"*.md 2>/dev/null | wc -l | tr -d ' ')
  echo "  ✓ $pattern_count patterns installed"

  # Step 6: Write tracking file
  echo -e "${GREEN}[5/5]${NC} Writing installation manifest..."
  local skills_json=""
  for skill in "${skills[@]}"; do
    [ -n "$skills_json" ] && skills_json+=", "
    skills_json+="\"$skill\""
  done
  local categories_json=""
  for cat in "${categories[@]}"; do
    [ -n "$categories_json" ] && categories_json+=", "
    categories_json+="\"$cat\""
  done
  write_tracking "$PRESET" "$skills_json" "$categories_json"
  echo "  ✓ .framework-manifest (installation tracking)"

  # Step 7: Supabase MCP hint
  echo ""
  if command -v claude &> /dev/null; then
    if ! claude mcp list 2>/dev/null | grep -qi supabase; then
      echo -e "${YELLOW}  Optional: Connect Supabase MCP for direct database access:${NC}"
      echo "    claude mcp add supabase -- npx -y @anthropic-ai/supabase-mcp@latest"
      echo ""
    fi
  fi

  # Done
  echo -e "${BLUE}════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}Setup complete!${NC} (v${version}, ${PRESET} preset)"
  echo ""
  echo "What was installed:"
  echo "  ~/.claude/CLAUDE.md           — Global development instructions"
  echo "  ~/.claude/FRAMEWORK.md        — Unified development framework (v${version})"
  echo "  ~/.claude/MULTIAGENT.md       — Multi-agent workflow protocol"
  echo "  ~/.claude/skills/             — ${#skills[@]} skills (${PRESET} preset)"
  echo "  ~/.claude/patterns/           — ${pattern_count} reusable patterns"
  echo "  ~/.claude/.framework-manifest — Installation tracking"
  echo ""
  echo "Next steps:"
  echo "  1. Run 'claude' in this project directory to start Claude Code"
  echo "  2. Type '/resume' to load project context"
  echo "  3. Check CONTRIBUTING.md for the development workflow"
  echo ""
  echo -e "${DIM}Update later: ./scripts/setup-claude.sh --update${NC}"
  echo -e "${DIM}Restore backup: ./scripts/setup-claude.sh --restore${NC}"
}

# ── Main ─────────────────────────────────────────────────────

PRESET=""
ACTION="install"

# Parse arguments
for arg in "$@"; do
  case "$arg" in
    --help|-h)
      print_help
      exit 0
      ;;
    --restore)
      ACTION="restore"
      ;;
    --update)
      ACTION="update"
      ;;
    --preset=*)
      PRESET="${arg#--preset=}"
      if [[ ! "$PRESET" =~ ^(minimal|standard|full)$ ]]; then
        echo -e "${RED}Invalid preset: $PRESET${NC}"
        echo "Valid presets: minimal, standard, full"
        exit 1
      fi
      ;;
    *)
      echo -e "${RED}Unknown argument: $arg${NC}"
      print_help
      exit 1
      ;;
  esac
done

# Check framework source
if [ ! -d "$FRAMEWORK_SRC" ]; then
  echo -e "${RED}Error: claude-framework/ directory not found in repo root.${NC}"
  echo "Make sure you've pulled the latest code."
  exit 1
fi

# Check for manifest.json (fall back to legacy behavior if missing)
if [ ! -f "$MANIFEST_FILE" ]; then
  echo -e "${YELLOW}Warning: manifest.json not found. Using legacy full-install mode.${NC}"
  echo "Pull the latest code to get the new selective installer."
  echo ""

  # Legacy behavior: full replace
  print_header
  mkdir -p "$CLAUDE_DIR/skills" "$CLAUDE_DIR/patterns"
  cp "$FRAMEWORK_SRC/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md"
  cp "$FRAMEWORK_SRC/FRAMEWORK.md" "$CLAUDE_DIR/FRAMEWORK.md"
  cp "$FRAMEWORK_SRC/MULTIAGENT.md" "$CLAUDE_DIR/MULTIAGENT.md"
  [ ! -f "$CLAUDE_DIR/settings.json" ] && cp "$FRAMEWORK_SRC/settings.json" "$CLAUDE_DIR/settings.json"
  cp -R "$FRAMEWORK_SRC/skills/"* "$CLAUDE_DIR/skills/" 2>/dev/null || true
  cp -R "$FRAMEWORK_SRC/patterns/"* "$CLAUDE_DIR/patterns/" 2>/dev/null || true
  echo -e "${GREEN}Legacy install complete.${NC}"
  exit 0
fi

# Dispatch action
case "$ACTION" in
  restore)
    do_restore
    ;;
  update)
    print_header
    do_update
    ;;
  install)
    print_header

    # Interactive preset selection if not specified
    if [ -z "$PRESET" ]; then
      local_version=$(json_value "version")
      echo -e "Framework version: ${BOLD}v${local_version}${NC}"
      echo ""

      # Check for existing installation
      if [ -f "$TRACKING_FILE" ]; then
        local inst_preset inst_version
        inst_preset=$(grep '"preset"' "$TRACKING_FILE" | sed 's/.*: *"\(.*\)".*/\1/')
        inst_version=$(grep '"version"' "$TRACKING_FILE" | head -1 | sed 's/.*: *"\(.*\)".*/\1/')
        echo -e "${YELLOW}Existing installation detected:${NC} ${inst_preset} preset, v${inst_version}"
        echo ""
      fi

      echo "Choose a preset:"
      echo ""
      echo -e "  ${BOLD}1) Minimal${NC} — 11 skills"
      echo "     Session management + Git workflow"
      echo "     Skills: /resume, /handoff, /checkout, /pr, /review, /sync, /release, /push..."
      echo ""
      echo -e "  ${BOLD}2) Standard${NC} ${GREEN}(recommended)${NC} — 22 skills"
      echo "     + Code quality, auditing, and hygiene"
      echo "     Adds: /validate, /cohere, /tidy, /brand, /a11y, /scorecard, /audit-sweep..."
      echo ""
      echo -e "  ${BOLD}3) Full${NC} — 34 skills"
      echo "     + Project scaffolding, multi-agent, framework maintenance"
      echo "     Adds: /seed, /spawn, /integrate, /discover, /sync-framework..."
      echo ""
      echo -e "  ${BOLD}4) Skip${NC} — Exit without installing"
      echo ""

      read -rp "Select preset (1-4) [2]: " choice
      choice="${choice:-2}"

      case "$choice" in
        1) PRESET="minimal" ;;
        2) PRESET="standard" ;;
        3) PRESET="full" ;;
        4) echo "Skipped. Run again when you're ready."; exit 0 ;;
        *)
          echo -e "${RED}Invalid choice.${NC}"
          exit 1
          ;;
      esac
    fi

    do_install
    ;;
esac
