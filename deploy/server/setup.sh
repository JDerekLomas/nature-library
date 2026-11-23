#!/usr/bin/env bash
# One-time (idempotent) setup of a small-sites web box. Run as root on the box from this folder:  bash setup.sh
# Installs Node 24, Caddy, git, ufw, fail2ban, unattended upgrades; the `site` user; the unit, timer, Caddyfile,
# sshd and sudoers rules. It does NOT write the secrets: /etc/small-web/nature-library.env and caddy.env are
# written by an admin, and the deploy key's public half goes in /srv/site/.ssh/authorized_keys.
#
# PRIOR ART: sourcelibrary's infrastructure/web-box/setup.sh (Node + Caddy + a system user + ufw). This box is
# for small sites with an outside developer, so it carries none of Source Library's guard, secrets or units.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
[ "$(id -u)" = 0 ] || { echo "run as root" >&2; exit 1; }
ADMIN_IP="${ADMIN_IP:?set ADMIN_IP to the address root may ssh from}"
export DEBIAN_FRONTEND=noninteractive

apt-get update -q
apt-get install -y -q ca-certificates curl gnupg git ufw fail2ban unattended-upgrades jq debian-keyring debian-archive-keyring apt-transport-https

# --- unattended security upgrades (reboot at 03:30 UTC if a kernel needs it) -----
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'X'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
X
cat > /etc/apt/apt.conf.d/52small-web <<'X'
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "03:30";
X

# --- swap: next build peaks at a few GB; 4 GB of swap keeps a crawler spike during a build from OOMing ---
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q /swapfile /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# --- Node 24 (what Vercel ran: nodeVersion 24.x) ---------------------------------
if ! node -v 2>/dev/null | grep -q '^v24\.'; then
  install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_24.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
  apt-get update -q && apt-get install -y -q nodejs
fi

# --- Caddy (official apt repo) -------------------------------------------------
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -q && apt-get install -y -q caddy
fi

# --- the site user and its folders -------------------------------------------------
id site >/dev/null 2>&1 || useradd --system --create-home --home-dir /srv/site --shell /bin/bash site
chmod 0755 /srv/site
install -d -o site -g site -m 0755 /srv/site/nature-library /srv/site/nature-library/releases /srv/site/nature-library/shared /srv/site/nature-library/shared/fetch-cache
install -d -o site -g site -m 0700 /srv/site/.ssh
[ -f /srv/site/.ssh/authorized_keys ] || install -o site -g site -m 0600 /dev/null /srv/site/.ssh/authorized_keys
install -d -o root -g site -m 0750 /etc/small-web
[ -f /etc/small-web/nature-library.env ] || install -o root -g site -m 0640 /dev/null /etc/small-web/nature-library.env
[ -f /etc/small-web/caddy.env ] || install -o root -g caddy -m 0640 /dev/null /etc/small-web/caddy.env

install -m 0755 "$HERE/site-deploy" /usr/local/bin/site-deploy
install -m 0755 "$HERE/site-deploy-ssh" /usr/local/bin/site-deploy-ssh
install -m 0755 "$HERE/site-prewarm" /usr/local/bin/site-prewarm
install -m 0440 "$HERE/sudoers-site" /etc/sudoers.d/site && visudo -cf /etc/sudoers.d/site >/dev/null

# --- systemd ---------------------------------------------------------------------------
install -m 0644 "$HERE/nature-library.service" /etc/systemd/system/nature-library.service
install -m 0644 "$HERE/site-prune-cache.service" /etc/systemd/system/site-prune-cache.service
install -m 0644 "$HERE/site-prune-cache.timer" /etc/systemd/system/site-prune-cache.timer
install -d /etc/systemd/journald.conf.d
printf '[Journal]\nSystemMaxUse=1G\nMaxRetentionSec=30day\n' > /etc/systemd/journald.conf.d/small-web.conf
systemctl daemon-reload
systemctl restart systemd-journald
systemctl enable nature-library.service site-prune-cache.timer >/dev/null
systemctl start site-prune-cache.timer

# --- Caddy -------------------------------------------------------------------------------
install -d -o caddy -g caddy /var/log/caddy
install -m 0644 "$HERE/Caddyfile" /etc/caddy/Caddyfile
install -d /etc/systemd/system/caddy.service.d
printf '[Service]\nEnvironmentFile=/etc/small-web/caddy.env\n' > /etc/systemd/system/caddy.service.d/small-web.conf
systemctl daemon-reload

# --- ssh: keys only, root from the admin box, site through its forced command ------------
sed "s/ADMIN_IP/$ADMIN_IP/" "$HERE/sshd-small-web.conf" > /etc/ssh/sshd_config.d/10-small-web.conf
sshd -t && systemctl reload ssh

# --- fail2ban on sshd (key-only already; this keeps the log quiet) -----------------------
printf '[sshd]\nenabled = true\nmaxretry = 5\nbantime = 1h\n' > /etc/fail2ban/jail.d/small-web.conf
systemctl enable --now fail2ban >/dev/null && systemctl restart fail2ban

# --- host firewall (the provider firewall sits in front with the same three ports) -------
ufw --force reset >/dev/null
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow 22/tcp comment 'ssh: keys only (sshd rules)' >/dev/null
ufw allow 80/tcp comment 'http' >/dev/null
ufw allow 443/tcp comment 'https' >/dev/null
ufw --force enable >/dev/null

echo "setup done. Next: write /etc/small-web/nature-library.env and caddy.env, add the deploy key, then"
echo "  sudo -u site site-deploy deploy <sha> && systemctl restart caddy"
echo "To check the Caddyfile, run the check as caddy (as root it creates the log file owned by root and Caddy then cannot write it):"
echo "  sudo -u caddy caddy validate --config /etc/caddy/Caddyfile --envfile /etc/small-web/caddy.env"
