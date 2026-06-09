# dpm-agent-kit installer (Windows PowerShell). Non-destructive: backs up, writes new files,
# never overwrites your settings.json. Re-run safe.
# Usage:  pwsh -File install.ps1
$ErrorActionPreference = 'Stop'

$KitDir    = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClaudeDir = if ($env:CLAUDE_DIR) { $env:CLAUDE_DIR } else { Join-Path $env:USERPROFILE '.claude' }
$Ts        = Get-Date -Format 'yyyyMMdd_HHmmss'

Write-Host "==> dpm-agent-kit installer"
Write-Host "    kit:        $KitDir"
Write-Host "    claude dir: $ClaudeDir"

# --- prereqs ---------------------------------------------------------------
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Write-Error "Node.js not found. Install Node, then re-run."; exit 1 }
$NodeBin = ($node.Source -replace '\\','/')
Write-Host "    node:       $NodeBin"

New-Item -ItemType Directory -Force -Path (Join-Path $ClaudeDir 'hooks')    | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $ClaudeDir 'commands') | Out-Null

# --- 1. hooks --------------------------------------------------------------
Write-Host "==> Installing hooks -> $ClaudeDir\hooks\"
Copy-Item -Force (Join-Path $KitDir 'templates\hooks\*.js') (Join-Path $ClaudeDir 'hooks')
$hookCount = (Get-ChildItem (Join-Path $KitDir 'templates\hooks\*.js')).Count
Write-Host "    copied $hookCount hook scripts"

# --- 2. settings (substitute, never overwrite) -----------------------------
Write-Host "==> Preparing settings"
$ClaudeDirFwd = $ClaudeDir -replace '\\','/'
$tmpl = Get-Content -Raw (Join-Path $KitDir 'templates\settings\settings.template.json')
$tmpl = $tmpl.Replace('__NODE__', $NodeBin).Replace('__CLAUDE_DIR__', $ClaudeDirFwd)
$settingsPath = Join-Path $ClaudeDir 'settings.json'
$settingsOut  = Join-Path $ClaudeDir 'settings.dpm-agent-kit.json'

if (Test-Path $settingsPath) {
  Copy-Item -Force $settingsPath (Join-Path $ClaudeDir "settings.json.bak-$Ts")
  Set-Content -Path $settingsOut -Value $tmpl -Encoding UTF8
  Write-Host "    existing settings.json found -> backed up to settings.json.bak-$Ts"
  Write-Host "    !! NOT overwriting. Merge the 'hooks' (and 'permissions.allow') blocks from:"
  Write-Host "       $settingsOut"
  Write-Host "       into your settings.json. (An agent can do this for you — see INSTALL.md.)"
} else {
  Set-Content -Path $settingsPath -Value $tmpl -Encoding UTF8
  Write-Host "    no existing settings.json -> installed fresh one with hooks wired"
}

# --- 3. CLAUDE.md (offer, never overwrite) ---------------------------------
$claudeMd = Join-Path $ClaudeDir 'CLAUDE.md'
if (-not (Test-Path $claudeMd)) {
  Copy-Item (Join-Path $KitDir 'templates\claude-md\CLAUDE.md') $claudeMd
  Copy-Item (Join-Path $KitDir 'templates\claude-md\CLAUDE-delegation.md') (Join-Path $ClaudeDir 'CLAUDE-delegation.md')
  Write-Host "==> Installed CLAUDE.md + CLAUDE-delegation.md (you had none)"
} else {
  Write-Host "==> You already have a CLAUDE.md — left untouched."
  Write-Host "    Template to merge from: $KitDir\templates\claude-md\CLAUDE.md"
}

# --- 4. memory scaffold (only if absent) -----------------------------------
$memDir = Join-Path $ClaudeDir 'memory'
if (-not (Test-Path (Join-Path $memDir 'MEMORY.md'))) {
  New-Item -ItemType Directory -Force -Path $memDir | Out-Null
  Copy-Item -Force (Join-Path $KitDir 'templates\memory\*.md') $memDir
  Write-Host "==> Installed memory scaffold -> $memDir\ (read MEMORY-SYSTEM.md)"
} else {
  Write-Host "==> Memory already initialized at $memDir — left untouched."
}

# --- 5. vendored custom skills ---------------------------------------------
Write-Host "==> Installing vendored skills -> $ClaudeDir\commands\"
$skip = @('WEB-INSTALLED-SKILLS.md','SKILLS-MANIFEST.md','README.md')
Get-ChildItem (Join-Path $KitDir 'templates\skills\*.md') | ForEach-Object {
  if ($skip -notcontains $_.Name) {
    Copy-Item -Force $_.FullName (Join-Path $ClaudeDir "commands\$($_.Name)")
  }
}
Write-Host "    done. (Install superpowers + grill-me per templates\skills\WEB-INSTALLED-SKILLS.md)"

Write-Host ""
Write-Host "==> Done. Next:"
Write-Host "    1. Restart Claude Code so settings.json reloads."
Write-Host "    2. Smoke-test: ask the agent to run 'printenv' — it should be BLOCKED."
Write-Host "    3. Read docs\HANDLING-SECRETS.md to add your real paths/policy."
