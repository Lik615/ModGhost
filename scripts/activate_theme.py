"""通过 settings API 激活自定义主题"""
import requests
import jwt
import time

API_URL = "http://localhost:2368"
ADMIN_API_KEY = "6a9e99ef5de65e7cd86e2f0d:6a34b9de8d7e6e3f6a57618a69cd2127686752c6abb81340c7f5ae37f85a1f46"

def get_token():
    key_id, secret = ADMIN_API_KEY.split(":")
    header = {"alg": "HS256", "typ": "JWT", "kid": key_id}
    payload = {"exp": int(time.time()) + 300, "iat": int(time.time()), "aud": "/admin/"}
    return jwt.encode(payload, bytes.fromhex(secret), algorithm="HS256", headers=header)

headers = {"Authorization": f"Ghost {get_token()}", "Content-Type": "application/json"}

# 列出可用主题
resp = requests.get(f"{API_URL}/ghost/api/admin/themes/", headers=headers)
print(f"主题列表状态码: {resp.status_code}")
if resp.status_code == 200:
    themes = resp.json().get("themes", [])
    for t in themes:
        print(f"  - {t.get('name')} (active: {t.get('active')})")

# 通过 settings 激活主题
resp = requests.put(
    f"{API_URL}/ghost/api/admin/settings/",
    headers=headers,
    json={"settings": [{"key": "active_theme", "value": "oss-blog-theme"}]}
)
print(f"\n激活状态码: {resp.status_code}")
if resp.status_code == 200:
    settings = resp.json().get("settings", [])
    active = next((s["value"] for s in settings if s["key"] == "active_theme"), None)
    print(f"当前激活主题: {active}")
else:
    print(resp.text[:500])
