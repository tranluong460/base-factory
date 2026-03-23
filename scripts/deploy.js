#!/usr/bin/env node
// =============================================================
// Deploy Script - Thay thế GitHub Actions workflow
// Chức năng: Bump version + Deploy sang nhánh prod
// =============================================================

import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

// Màu sắc
const RED = '\x1B[0;31m'
const GREEN = '\x1B[0;32m'
const YELLOW = '\x1B[1;33m'
const CYAN = '\x1B[0;36m'
const NC = '\x1B[0m'

const log = (msg) => console.log(`${GREEN}[✓]${NC} ${msg}`)
const warn = (msg) => console.log(`${YELLOW}[!]${NC} ${msg}`)
const info = (msg) => console.log(`${CYAN}[→]${NC} ${msg}`)
function err(msg) {
  console.error(`${RED}[✗]${NC} ${msg}`); process.exit(1)
}

const run = (cmd) => execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }).trim()
const runShow = (cmd) => execSync(cmd, { encoding: 'utf-8', stdio: 'inherit' })

const readPkg = () => JSON.parse(readFileSync('package.json', 'utf-8'))
const writePkg = (pkg) => writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`)

// =============================================
// Kiểm tra nhánh hiện tại
// =============================================
const currentBranch = run('git branch --show-current')
if (currentBranch !== 'main') {
  warn(`Đang ở nhánh '${currentBranch}', chuyển sang main...`)
  // Stash thay đổi chưa commit nếu có
  const status = run('git status --porcelain')
  const needStash = status.length > 0
  if (needStash) {
    info('Stash các thay đổi chưa commit...')
    runShow('git stash push -m "deploy-script-auto-stash"')
  }
  runShow('git checkout main')
  runShow('git pull origin main')
}

// Kiểm tra [skip ci]
const lastMsg = run('git log -1 --pretty=%B')
const skipBump = lastMsg.includes('[skip ci]')

let newVer

// =============================================
// JOB 1: Bump version
// =============================================
if (!skipBump) {
  info('=== JOB 1: Bump Version ===')

  const pkg = readPkg()
  const [major, minor, patch] = pkg.version.split('.').map(Number)

  info(`Version hiện tại: ${pkg.version}`)

  // Smart bump logic
  if (minor >= 9 && patch >= 9) {
    pkg.version = `${major + 1}.0.0`
    log(`Bump MAJOR: ${major}.${minor}.${patch} → ${pkg.version}`)
  } else if (patch >= 9) {
    pkg.version = `${major}.${minor + 1}.0`
    log(`Bump MINOR: ${major}.${minor}.${patch} → ${pkg.version}`)
  } else {
    pkg.version = `${major}.${minor}.${patch + 1}`
    log(`Bump PATCH: ${major}.${minor}.${patch} → ${pkg.version}`)
  }

  // Cập nhật lastUpdated (timezone Việt Nam)
  const vnDate = new Date().toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  pkg.lastUpdated = vnDate
  log(`Cập nhật lastUpdated: ${vnDate}`)

  writePkg(pkg)
  newVer = pkg.version

  // Commit và push
  runShow('git add package.json')
  runShow(`git commit -m "chore: bump version to ${newVer} [skip ci]"`)
  runShow('git push origin main')
  log(`Đã push version ${newVer} lên main`)
} else {
  warn('Commit cuối là [skip ci], bỏ qua bump version.')
  newVer = readPkg().version
  info(`Giữ nguyên version: ${newVer}`)
}

// =============================================
// JOB 2: Deploy sang nhánh prod
// =============================================
info('=== JOB 2: Deploy to Prod ===')

// Đảm bảo đang ở main mới nhất
runShow('git checkout main')
runShow('git pull origin main')

// Tạo thư mục tạm
const outDir = mkdtempSync(join(tmpdir(), 'deploy-'))
info(`Thư mục tạm: ${outDir}`)

// Copy các file cần thiết
function copyFile(src, dest) {
  try {
    cpSync(src, dest, { recursive: true })
    return true
  } catch {
    return false
  }
}

if (existsSync('dist')) {
  cpSync('dist', join(outDir, 'dist'), { recursive: true })
  log('Đã copy dist/')
} else {
  warn('Không tìm thấy thư mục dist/ - bạn đã build chưa? (yarn build)')
}

copyFile('package.json', join(outDir, 'package.json'))
copyFile('README.md', join(outDir, 'README.md')) || warn('Không có README.md')
copyFile('LICENSE', join(outDir, 'LICENSE')) || warn('Không có LICENSE')
copyFile('.gitignore', join(outDir, '.gitignore'))

if (existsSync('docs')) {
  cpSync('docs', join(outDir, 'docs'), { recursive: true })
  log('Đã copy docs/')
}

log('Đã chuẩn bị thư mục prod')

// Deploy sang nhánh prod
try {
  run('git show-ref --verify --quiet refs/remotes/origin/prod')
  runShow('git fetch origin prod')
  runShow('git checkout prod')
  runShow('git pull origin prod')
} catch {
  // Tạo nhánh orphan mới
  runShow('git checkout --orphan prod')
  try {
    runShow('git rm -rf .')
  } catch { /* empty */ }
  runShow('git commit --allow-empty -m "Initial prod branch"')
}

// Xóa toàn bộ file cũ trên prod (clean: true)
try {
  runShow('git rm -rf .')
} catch { /* empty */ }

// Copy file từ thư mục tạm vào
cpSync(outDir, '.', { recursive: true })

// Commit và push
runShow('git add -A')

let hasChanges = false
try {
  run('git diff --cached --quiet')
} catch {
  hasChanges = true
}

if (hasChanges) {
  runShow(`git commit -m "${newVer}"`)
  runShow('git push origin prod')
  log(`Đã deploy version ${newVer} lên nhánh prod`)
} else {
  warn('Không có thay đổi nào để deploy')
}

// Quay lại nhánh ban đầu
if (currentBranch !== 'main') {
  runShow(`git checkout ${currentBranch}`)
  // Restore stash nếu đã stash trước đó
  try {
    const stashList = run('git stash list')
    if (stashList.includes('deploy-script-auto-stash')) {
      info('Restore stash...')
      runShow('git stash pop')
    }
  } catch { /* no stash */ }
} else {
  runShow('git checkout main')
}

// Dọn dẹp
rmSync(outDir, { recursive: true, force: true })
log('Dọn dẹp xong')

console.log('')
console.log(`${GREEN}========================================${NC}`)
console.log(`${GREEN}  Deploy hoàn tất! Version: ${newVer}${NC}`)
console.log(`${GREEN}========================================${NC}`)
