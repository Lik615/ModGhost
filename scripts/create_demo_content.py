"""
Ghost Admin API 批量创建演示内容脚本
创建8篇文章、分配标签、创建2个会员账号
"""
import requests
import jwt
import time
import json

# 配置
API_URL = "http://localhost:2368"
ADMIN_API_KEY = "6a9e99ef5de65e7cd86e2f0d:6a34b9de8d7e6e3f6a57618a69cd2127686752c6abb81340c7f5ae37f85a1f46"

def get_admin_token():
    """生成 Ghost Admin API JWT token"""
    key_id, secret = ADMIN_API_KEY.split(":")
    header = {"alg": "HS256", "typ": "JWT", "kid": key_id}
    payload = {
        "exp": int(time.time()) + 300,  # 5分钟过期
        "iat": int(time.time()),
        "aud": "/admin/"
    }
    token = jwt.encode(payload, bytes.fromhex(secret), algorithm="HS256", headers=header)
    return token

def api_request(method, endpoint, data=None):
    """发送 Ghost Admin API 请求"""
    token = get_admin_token()
    headers = {
        "Authorization": f"Ghost {token}",
        "Content-Type": "application/json"
    }
    url = f"{API_URL}/ghost/api/admin{endpoint}"
    response = requests.request(method, url, headers=headers, json=data)
    if response.status_code not in [200, 201]:
        print(f"Error {response.status_code}: {response.text}")
    return response

# 获取所有标签
print("=== 获取标签列表 ===")
resp = api_request("GET", "/tags/")
tags = resp.json().get("tags", [])
tag_map = {t["name"]: t["id"] for t in tags}
print(f"标签: {list(tag_map.keys())}")

# 8篇演示文章数据
posts_data = [
    {
        "title": "开源软件与新技术课程介绍",
        "html": "<p>本课程围绕开源软件的获取、使用、分析与规范开发展开。</p><p>通过实践成熟开源项目，学生能够掌握从环境搭建、源码阅读到二次开发的完整流程。</p><p>实验以 Ghost 博客系统为基线，训练主题扩展、接口集成和版本管理能力。</p>",
        "tags": ["技术"],
        "featured": True
    },
    {
        "title": "Ghost 博客系统架构解析",
        "html": "<p>Ghost 是一个现代化的开源博客平台，采用 Node.js 构建。</p><p>其架构分为核心服务、内容 API、管理后台和主题系统四大部分。</p><p>核心负责认证、内容、标签、会员和评论；主题层通过 Handlebars 模板渲染前台页面。</p>",
        "tags": ["技术"],
    },
    {
        "title": "Git 版本管理最佳实践",
        "html": "<p>良好的 Git 工作流是团队协作的基础。</p><p>推荐使用 Feature Branch 工作流：每个功能创建独立分支，完成后通过 Pull Request 合并。</p><p>Commit 信息应清晰描述变更内容，遵循 Conventional Commits 规范。</p>",
        "tags": ["技术"],
    },
    {
        "title": "我的编程学习之路",
        "html": "<p>从第一次接触代码到现在，已经走过了很长的路。</p><p>最初学的是 Python，简单的语法让我快速入门。后来接触了 Java 和 Web 开发，技术栈逐渐丰富。</p><p>学习编程最重要的是动手实践，多读优秀的开源代码。</p>",
        "tags": ["生活", "随笔"],
    },
    {
        "title": "周末的咖啡与代码",
        "html": "<p>周末的午后，一杯咖啡，一台电脑，就是最惬意的时光。</p><p>写写代码，看看技术文章，时间过得飞快。</p><p>这种专注的状态，是工作日里很难体会到的。</p>",
        "tags": ["生活"],
    },
    {
        "title": "关于开源精神的思考",
        "html": "<p>开源不仅仅是代码的开放，更是一种协作精神。</p><p>全球的开发者共同维护一个项目，每个人贡献自己的力量。</p><p>使用开源软件的同时，也应该思考如何回馈社区。</p>",
        "tags": ["随笔"],
    },
    {
        "title": "软件测试基础：因果图与边界值",
        "html": "<p>软件测试是保证质量的重要环节。</p><p>因果图法适用于描述多种输入条件的组合，边界值分析则关注输入域的边界。</p><p>合理运用这些方法，可以用较少的用例覆盖更多的场景。</p>",
        "tags": ["技术"],
    },
    {
        "title": "项目管理中的挣值管理",
        "html": "<p>挣值管理（EVM）是项目成本和进度控制的重要方法。</p><p>通过 BCWS、BCWP 和 ACWP 三个指标，可以计算出 SV、CV、SPI 和 CPI 等关键参数。</p><p>这些指标能够直观反映项目的健康状况，帮助项目经理及时调整。</p>",
        "tags": ["技术"],
    }
]

# 创建文章
print("\n=== 创建文章 ===")
created_posts = []
for i, post in enumerate(posts_data):
    post_data = {
        "posts": [{
            "title": post["title"],
            "html": post["html"],
            "status": "published",
            "tags": [{"name": t} for t in post["tags"]],
            "featured": post.get("featured", False)
        }]
    }
    resp = api_request("POST", "/posts/?source=html", post_data)
    if resp.status_code in [200, 201]:
        created = resp.json()["posts"][0]
        created_posts.append(created)
        print(f"[{i+1}/8] 创建成功: {created['title']} (id: {created['id']})")
    else:
        print(f"[{i+1}/8] 创建失败: {post['title']}")
        print(resp.text[:500])

print(f"\n共创建 {len(created_posts)} 篇文章")

# 创建会员账号
print("\n=== 创建会员 ===")
members_data = [
    {"name": "演示用户一", "email": "user1@demo.com", "note": "演示会员账号1"},
    {"name": "演示用户二", "email": "user2@demo.com", "note": "演示会员账号2"},
]

for member in members_data:
    member_data = {"members": [member]}
    resp = api_request("POST", "/members/", member_data)
    if resp.status_code in [200, 201]:
        m = resp.json()["members"][0]
        print(f"创建会员成功: {m['name']} ({m['email']})")
    else:
        print(f"创建会员失败: {member['email']}")
        print(resp.text[:500])

print("\n=== 完成 ===")
