#!/usr/bin/env bash
# Vercel build entrypoint (wired up via `buildCommand` in vercel.json).
#
# Why this exists: the prerender step (scripts/prerender.mjs) needs a real
# headless Chrome, and Vercel's Amazon Linux build image ships none of Chrome's
# shared libraries. Puppeteer downloads the binary fine, then it dies with
#   `error while loading shared libraries: libnspr4.so`
# and — because prerender.mjs deliberately exits 0 — the deploy stays green
# while serving an empty <div id="root">. So: install the libs first, then build.
#
# Everything here is best-effort. If the package manager is unavailable or a
# package name has drifted, we log and carry on: `npm run build:prerender` still
# produces a working (if un-prerendered) site, and dist/prerender-status.json
# records what actually happened. Only a real build/tsc failure fails the deploy.

set -uo pipefail

# Chrome's runtime deps on Amazon Linux 2023. Keep `nss`/`nspr` first — they're
# the ones that bit us. Fonts are installed separately below (see note there).
LIBS="nss nspr atk at-spi2-atk at-spi2-core cups-libs libdrm libX11 \
libXcomposite libXdamage libXext libXfixes libXrandr libXi libxcb \
libxkbcommon mesa-libgbm pango alsa-lib"

# Vercel builds run as root; guard anyway so this is runnable elsewhere.
SUDO=""
if [ "$(id -u)" -ne 0 ] && command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
fi

install_pkgs() {
  local mgr="$1"
  shift
  # One bulk transaction is much faster, but dnf aborts the whole thing if a
  # single name is unknown — fall back to per-package so one drifted name can't
  # cost us every lib.
  if $SUDO "$mgr" install -y "$@" >/dev/null 2>&1; then
    return 0
  fi
  echo "[vercel-build] bulk install failed, retrying per-package"
  for p in "$@"; do
    $SUDO "$mgr" install -y "$p" >/dev/null 2>&1 || echo "[vercel-build]   unavailable: $p"
  done
}

PKG_MGR=""
for mgr in dnf microdnf yum; do
  if command -v "$mgr" >/dev/null 2>&1; then
    PKG_MGR="$mgr"
    break
  fi
done

if [ -n "$PKG_MGR" ]; then
  echo "[vercel-build] installing Chrome runtime libs via $PKG_MGR"
  install_pkgs "$PKG_MGR" $LIBS
  # Real font metrics: HeroLogo measures glyph boxes to place the circuit
  # underline, so a fontless container would snapshot slightly-off geometry.
  # (The site's Archivo still comes over the network from Google Fonts.)
  $SUDO "$PKG_MGR" install -y liberation-fonts >/dev/null 2>&1 \
    || echo "[vercel-build]   unavailable: liberation-fonts"
  echo "[vercel-build] lib install done"
else
  echo "[vercel-build] no dnf/microdnf/yum on PATH — skipping lib install"
fi

npm run build:prerender
