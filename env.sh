#!/bin/sh
# Writes the runtime config (assets/env.js) and <base href> at container start.

HTML_DIR=/usr/share/nginx/html
mkdir -p "$HTML_DIR/assets"

API_URL="${API_URL:-http://localhost:5010}"
IDP_ISSUER="${IDP_ISSUER:-http://localhost:5008}"
IDP_CLIENT_ID="${IDP_CLIENT_ID:-personal-dashboard-web}"
IDP_SCOPE="${IDP_SCOPE:-openid profile offline_access}"
BASE_HREF="${BASE_HREF:-/}"

# Escapes a value for a JS string.
js() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

cat > "$HTML_DIR/assets/env.js" <<EOF
window.__env = {
  apiUrl: "$(js "$API_URL")",
  idpIssuer: "$(js "$IDP_ISSUER")",
  idpClientId: "$(js "$IDP_CLIENT_ID")",
  idpScope: "$(js "$IDP_SCOPE")"
};
EOF
echo "Runtime config: API_URL=$API_URL IDP_ISSUER=$IDP_ISSUER IDP_CLIENT_ID=$IDP_CLIENT_ID IDP_SCOPE=$IDP_SCOPE"

case "$BASE_HREF" in /*) ;; *) BASE_HREF="/$BASE_HREF" ;; esac
case "$BASE_HREF" in */) ;; *) BASE_HREF="$BASE_HREF/" ;; esac
sed -i "s|<base href=\"[^\"]*\"[^>]*>|<base href=\"$BASE_HREF\">|" "$HTML_DIR/index.html"
echo "Base href: $BASE_HREF"
