"""导出 Ghost 内容作为备份"""
import requests
import jwt
import time
import json
import os

API_URL = "http://localhost:2368"
ADMIN_API_KEY = "6a9e99ef5de65e7cd86e2f0d:6a34b9de8d7e6e3f6a57618a69cd2127686752c6abb81340c7f5ae37f85a1f46"

def get_token():
    key_id, secret = ADMIN_API_KEY.split(":")
    header = {"alg": "HS256", "typ": "JWT", "kid": key_id}
    payload = {"exp": int(time.time()) + 300, "iat": int(time.time()), "aud": "/admin/"}
    return jwt.encode(payload, bytes.fromhex(secret), algorithm="HS256", headers=header)

headers = {"Authorization": f"Ghost {get_token()}"}

# 创建备份目录
os.makedirs("backup", exist_ok=True)

# 导出内容
resp = requests.get(f"{API_URL}/ghost/api/admin/db/", headers=headers)
print(f"导出状态码: {resp.status_code}")

if resp.status_code == 200:
    data = resp.json()
    filepath = "backup/ghost-export.json"
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    file_size = os.path.getsize(filepath)
    print(f"导出成功，文件大小: {file_size} bytes")
    
    # 统计数据
    db = data.get("db", [{}])[0].get("data", {})
    posts = db.get("posts", [])
    tags = db.get("tags", [])
    users = db.get("users", [])
    members = db.get("members", [])
    
    print(f"文章数: {len(posts)}")
    print(f"标签数: {len(tags)}")
    print(f"用户数: {len(users)}")
    print(f"会员数: {len(members)}")
    print(f"\n备份文件: {filepath}")
else:
    print(resp.text[:500])
