/**
 * 本地全文索引搜索功能
 * 功能：从 Ghost Content API 获取文章，构建本地索引，支持搜索高亮和无结果建议
 */
(function () {
    'use strict';

    // 配置
    const CONFIG = {
        contentApiKey: 'b512e5084b26cddd690c28acd1',
        apiUrl: window.location.origin + '/ghost/api/content/posts/',
        maxResults: 10,
        excerptLength: 150
    };

    // 状态
    let postsIndex = [];
    let isIndexLoaded = false;
    let isLoading = false;

    // DOM 元素
    const modal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchNoResults = document.getElementById('search-no-results');
    const searchStatus = document.getElementById('search-status');
    const indexCount = document.getElementById('search-index-count');
    const suggestionTags = document.getElementById('suggestion-tags');
    const suggestionPosts = document.getElementById('suggestion-posts');

    // 隐藏 Ghost 原生搜索组件
    const nativeSearch = document.getElementById("sodo-search-root");
    if (nativeSearch) {
        nativeSearch.style.display = "none";
        nativeSearch.style.visibility = "hidden";
    }

    if (!modal || !searchInput) return;

    /**
     * 从 HTML 中提取纯文本
     */
    function htmlToText(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    /**
     * 中文分词（2-gram + 英文单词，不使用单字以避免过度匹配）
     */
    function tokenize(text) {
        if (!text) return [];
        const tokens = [];
        // 匹配英文单词
        const englishWords = text.match(/[a-zA-Z0-9]+/g) || [];
        tokens.push(...englishWords);
        // 中文按 2-gram 拆分
        const chineseChars = text.replace(/[a-zA-Z0-9\s\p{P}]/gu, '');
        for (let i = 0; i < chineseChars.length - 1; i++) {
            tokens.push(chineseChars.substr(i, 2));
        }
        // 单个中文字也加入（仅用于单字查询）
        if (chineseChars.length === 1) {
            tokens.push(chineseChars);
        }
        return tokens.map(t => t.toLowerCase());
    }

    /**
     * 从 Content API 加载所有文章并构建索引
     */
    async function loadIndex() {
        if (isIndexLoaded || isLoading) return;
        isLoading = true;

        const loadingEl = searchStatus.querySelector('.search-loading');
        const readyEl = searchStatus.querySelector('.search-ready');
        loadingEl.hidden = false;
        readyEl.hidden = true;

        try {
            const url = `${CONFIG.apiUrl}?key=${CONFIG.contentApiKey}&include=tags,authors&limit=all&formats=plaintext`;
            const response = await fetch(url);
            const data = await response.json();
            const posts = data.posts || [];

            postsIndex = posts.map(post => {
                const plainText = post.plaintext || htmlToText(post.html || '');
                const tagNames = (post.tags || []).map(t => t.name).join(' ');
                const searchText = `${post.title} ${plainText} ${tagNames}`;
                return {
                    id: post.id,
                    title: post.title,
                    url: post.url,
                    excerpt: post.custom_excerpt || plainText.substring(0, CONFIG.excerptLength) + '...',
                    plainText: plainText,
                    tags: post.tags || [],
                    primaryTag: post.primary_tag || null,
                    publishedAt: post.published_at,
                    tokens: new Set(tokenize(searchText))
                };
            });

            isIndexLoaded = true;
            indexCount.textContent = postsIndex.length;
            loadingEl.hidden = true;
            readyEl.hidden = false;

            // 预加载无结果建议
            loadSuggestions();

        } catch (error) {
            console.error('搜索索引加载失败:', error);
            loadingEl.textContent = '索引加载失败，请刷新页面重试';
        } finally {
            isLoading = false;
        }
    }

    /**
     * 加载无结果建议（热门标签和推荐文章）
     */
    function loadSuggestions() {
        // 热门标签（按出现频次排序）
        const tagCount = {};
        postsIndex.forEach(post => {
            post.tags.forEach(tag => {
                tagCount[tag.name] = (tagCount[tag.name] || 0) + 1;
            });
        });
        const topTags = Object.entries(tagCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name]) => name);

        suggestionTags.innerHTML = topTags.map(tag =>
            `<button class="suggestion-tag" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`
        ).join('');

        // 推荐文章（最新5篇）
        const recommended = [...postsIndex]
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
            .slice(0, 5);

        suggestionPosts.innerHTML = recommended.map(post =>
            `<a class="suggestion-post" href="${post.url}">
                <span class="suggestion-post-title">${escapeHtml(post.title)}</span>
                ${post.primaryTag ? `<span class="suggestion-post-tag">${escapeHtml(post.primaryTag.name)}</span>` : ''}
            </a>`
        ).join('');

        // 标签点击事件
        suggestionTags.querySelectorAll('.suggestion-tag').forEach(btn => {
            btn.addEventListener('click', () => {
                searchInput.value = btn.dataset.tag;
                performSearch(btn.dataset.tag);
            });
        });
    }

    /**
     * 执行搜索
     */
    function performSearch(query) {
        if (!query || query.trim().length === 0) {
            searchResults.hidden = true;
            searchNoResults.hidden = true;
            searchStatus.hidden = false;
            return;
        }

        searchStatus.hidden = true;

        const queryTrimmed = query.trim();
        const queryLower = queryTrimmed.toLowerCase();
        const queryTokens = tokenize(queryTrimmed);
        if (queryTokens.length === 0) {
            showNoResults();
            return;
        }

        // 判断是否为短查询（2个中文字以内或1个英文单词）
        const chineseCount = (queryTrimmed.match(/[\u4e00-\u9fa5]/g) || []).length;
        const isShortQuery = chineseCount <= 2 && queryTokens.length <= 2;

        // 计算每篇文章的匹配分数
        const scored = postsIndex.map(post => {
            let score = 0;
            let matchedTokens = new Set();

            const titleLower = post.title.toLowerCase();
            const tagText = post.tags.map(t => t.name.toLowerCase()).join(' ');
            const contentLower = post.plainText.toLowerCase();

            // 完整短语匹配（最高优先级）
            const fullPhraseMatch = titleLower.includes(queryLower) ||
                                   contentLower.includes(queryLower) ||
                                   tagText.includes(queryLower);
            if (fullPhraseMatch) {
                score += 50;
                if (titleLower.includes(queryLower)) score += 30;
            }

            // Token 匹配
            queryTokens.forEach(token => {
                if (titleLower.includes(token)) {
                    score += 10;
                    matchedTokens.add(token);
                }
                if (tagText.includes(token)) {
                    score += 5;
                    matchedTokens.add(token);
                }
                if (contentLower.includes(token)) {
                    score += 1;
                    matchedTokens.add(token);
                }
            });

            // 匹配阈值：短查询允许1个token匹配，长查询需要至少2个token匹配或完整短语匹配
            const meetsThreshold = isShortQuery
                ? (matchedTokens.size >= 1 || fullPhraseMatch)
                : (matchedTokens.size >= 2 || fullPhraseMatch);

            if (!meetsThreshold) {
                score = 0;
            }

            return { post, score, matchedTokens: Array.from(matchedTokens) };
        }).filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, CONFIG.maxResults);

        if (scored.length === 0) {
            showNoResults();
        } else {
            showResults(scored, query);
        }
    }

    /**
     * 显示搜索结果
     */
    function showResults(scored, query) {
        searchNoResults.hidden = true;
        searchResults.hidden = false;

        const queryLower = query.toLowerCase();

        searchResults.innerHTML = `
            <div class="search-results-header">
                找到 <strong>${scored.length}</strong> 篇相关文章
            </div>
            <div class="search-results-list">
                ${scored.map(({ post, matchedTokens }) => `
                    <a class="search-result-item" href="${post.url}">
                        <div class="search-result-title">${highlightText(post.title, queryLower, matchedTokens)}</div>
                        <div class="search-result-excerpt">${highlightText(post.excerpt, queryLower, matchedTokens)}</div>
                        <div class="search-result-meta">
                            ${post.primaryTag ? `<span class="search-result-tag">${escapeHtml(post.primaryTag.name)}</span>` : ''}
                            <span class="search-result-date">${formatDate(post.publishedAt)}</span>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
    }

    /**
     * 高亮匹配的关键词
     */
    function highlightText(text, query, matchedTokens) {
        if (!text) return '';
        let result = escapeHtml(text);

        // 先高亮完整查询词
        if (query.length >= 2) {
            const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
            result = result.replace(regex, '<mark class="search-highlight">$1</mark>');
        }

        // 再高亮匹配的 token（避免重复高亮）
        matchedTokens.forEach(token => {
            if (token.length >= 2 && !query.toLowerCase().includes(token)) {
                const regex = new RegExp(`(${escapeRegex(token)})`, 'gi');
                result = result.replace(regex, (match) => {
                    // 检查是否已经在 mark 标签内
                    if (result.indexOf('<mark') !== -1) {
                        return match;
                    }
                    return `<mark class="search-highlight">${match}</mark>`;
                });
            }
        });

        return result;
    }

    /**
     * 显示无结果建议
     */
    function showNoResults() {
        searchResults.hidden = true;
        searchNoResults.hidden = false;
    }

    /**
     * HTML 转义
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 正则转义
     */
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * 格式化日期
     */
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    /**
     * 打开搜索弹窗
     */
    function openSearch() {
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        searchInput.value = '';
        searchResults.hidden = true;
        searchNoResults.hidden = true;
        searchStatus.hidden = false;

        // 延迟聚焦，等待动画
        setTimeout(() => searchInput.focus(), 100);

        // 加载索引
        loadIndex();
    }

    /**
     * 关闭搜索弹窗
     */
    function closeSearch() {
        modal.hidden = true;
        document.body.style.overflow = '';
    }

    // 事件绑定
    // 搜索按钮点击（替换原生 Ghost 搜索）
    document.querySelectorAll('[data-custom-search]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openSearch();
        });
    });

    // 关闭按钮
    document.querySelectorAll('[data-search-close]').forEach(el => {
        el.addEventListener('click', closeSearch);
    });

    // 搜索输入
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value;
        searchTimeout = setTimeout(() => performSearch(query), 200);
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        // ESC 关闭
        if (e.key === 'Escape' && !modal.hidden) {
            closeSearch();
        }
        // Ctrl/Cmd + K 打开搜索
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
    });

    // 点击弹窗外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeSearch();
        }
    });

})();
