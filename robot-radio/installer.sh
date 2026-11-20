#!/bin/sh
# Installe (ou met à jour) le robot de la Radio Je suis KCCiste sur un serveur Ubuntu/Debian.
#   curl -fsSL https://raw.githubusercontent.com/reaganmbumba/jesuiskcciste.com/main/robot-radio/installer.sh | YOUTUBE_KEY=xxxx-xxxx-xxxx-xxxx-xxxx sh
# Sans YOUTUBE_KEY, la clé déjà enregistrée sur le serveur est gardée.
set -eu
SRC="https://raw.githubusercontent.com/reaganmbumba/jesuiskcciste.com/main/robot-radio"
DIR=/opt/robot-radio
ENVF=/etc/robot-radio.env

export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -y -q ffmpeg nodejs fonts-dejavu-core curl ca-certificates

mkdir -p "$DIR"
for f in robot.mjs logo.png robot-radio; do curl -fsSL "$SRC/$f" -o "$DIR/$f"; done
install -m 755 "$DIR/robot-radio" /usr/local/bin/robot-radio

umask 077
[ -f "$ENVF" ] || printf 'YOUTUBE_KEY=\n' > "$ENVF"
if [ -n "${YOUTUBE_KEY:-}" ]; then
  grep -v '^YOUTUBE_KEY=' "$ENVF" > "$ENVF.tmp" || true
  printf 'YOUTUBE_KEY=%s\n' "$YOUTUBE_KEY" >> "$ENVF.tmp"
  mv "$ENVF.tmp" "$ENVF"
fi
chmod 600 "$ENVF"

id robotradio >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin robotradio
cat > /etc/systemd/system/robot-radio.service <<UNIT
[Unit]
Description=Robot Radio Je suis KCCiste vers YouTube
After=network-online.target
Wants=network-online.target

[Service]
EnvironmentFile=$ENVF
ExecStart=/usr/bin/node $DIR/robot.mjs
User=robotradio
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable robot-radio >/dev/null 2>&1
systemctl restart robot-radio
echo "Robot radio installé. État : robot-radio etat"
