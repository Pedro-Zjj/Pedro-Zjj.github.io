# 个人主页

一个精美的个人作品集网站，采用纯 HTML/CSS/JavaScript 构建，完全兼容 GitHub Pages 静态部署。

## 在线预览

访问 [https://pedro-zjj.github.io](https://pedro-zjj.github.io) 查看效果

## 功能特点

- **响应式设计**: 完美适配桌面端和移动端
- **深色/浅色主题**: 支持一键切换，自动保存偏好
- **现代化 UI**: 紫罗兰科技风格配色，优雅的动画效果
- **多页面结构**: 主页、简历、项目、工作经历、论文、博客、作品集
- **视图切换**: 项目/博客支持网格/列表视图切换
- **搜索功能**: 支持实时搜索项目和博客
- **Lightbox 画廊**: 作品集支持大图预览

## 页面结构

```
├── index.html          # 主页 - Hero + 精选项目
├── resume.html         # 个人简历
├── projects.html       # 项目经历列表
├── project-detail.html # 项目详情
├── work-experience.html# 工作经历
├── papers.html         # 论文发表列表
├── paper-detail.html   # 论文详情
├── blog.html           # 博客文章列表
├── blog-detail.html    # 博客详情
├── portfolio.html      # 作品集（图片画廊）
├── assets/
│   ├── css/
│   │   └── main.css    # 主样式文件（含深色/浅色主题变量）
│   ├── js/
│   │   └── main.js     # 核心 JavaScript
│   └── images/         # 图片资源
└── content/
    └── resume.pdf      # 简历 PDF 文件
```

## 如何使用

### 1. 本地预览

由于使用了 ES6 模块和 fetch API，需要通过本地服务器打开：

```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx serve

# 然后访问 http://localhost:8000
```

### 2. 自定义内容

#### 修改个人信息

编辑以下文件中的个人信息：

- `index.html`: 主页 Hero 区域
- `resume.html`: 简历详情
- 页脚联系信息（所有 HTML 文件）

#### 添加项目

编辑 `projects.html`，在 `projects-container` 中添加新的 `article.card`：

```html
<article class="card" data-category="web">
  <div class="card-image">
    <img src="图片URL" alt="项目名称">
  </div>
  <div class="card-content">
    <div class="card-meta">
      <span><i class="far fa-calendar"></i> 2024-01</span>
      <span><i class="far fa-clock"></i> 3个月</span>
    </div>
    <h3 class="card-title">
      <a href="project-detail.html?slug=project-x">项目名称</a>
    </h3>
    <p class="card-excerpt list-view-desc">项目简介...</p>
  </div>
</article>
```

#### 添加博客文章

编辑 `blog.html`，在 `blog-container` 中添加新的 `article.card`。

#### 添加论文

编辑 `papers.html`，在 `papers-list` 中添加新的论文条目。

#### 添加工作经历

编辑 `work-experience.html`，在 `experience-list` 中添加新的经历。

#### 添加作品集图片

编辑 `portfolio.html`，在 `portfolio-container` 中添加新的 `gallery-item`。

### 3. 自定义样式

编辑 `assets/css/main.css` 文件来自定义样式：

**深色模式（默认）**:
```css
:root {
  --bg-primary: #0a0a0f;      /* 主背景色 */
  --bg-secondary: #12121a;    /* 次背景色 */
  --accent: #8b5cf6;          /* 强调色（紫罗兰） */
  --accent-hover: #a78bfa;    /* 悬停色 */
  --text-primary: #fafafa;    /* 主文字 */
  --text-secondary: #a1a1aa;  /* 次文字 */
}
```

**浅色模式**:
```css
[data-theme="light"] {
  --bg-primary: #fafafa;
  --bg-secondary: #ffffff;
  --accent: #8b5cf6;          /* 与深色模式一致 */
  --text-primary: #18181b;
  --text-secondary: #52525b;
}
```

### 4. 部署到 GitHub Pages

1. Fork 或克隆本仓库到你的 GitHub 账号
2. 进入仓库 Settings -> Pages
3. Source 选择 "Deploy from a branch"
4. Branch 选择 "main" 或 "master"，文件夹选择 "/ (root)"
5. 保存后等待部署完成（约 1-2 分钟）
6. 访问 `https://你的用户名.github.io` 查看效果

## 主题配色

- **主色调**: 紫罗兰 (#8b5cf6)
- **深色背景**: 深空黑 (#0a0a0f)
- **浅色背景**: 米白色 (#fafafa)
- **强调效果**: 发光阴影、渐变文字、网格背景

## 技术栈

- **HTML5**: 语义化标签
- **CSS3**: CSS Variables、Flexbox、Grid、动画
- **JavaScript**: ES6+、LocalStorage、事件委托
- **Font Awesome 6**: 图标库
- **Google Fonts**: 
  - Cormorant Garamond (英文标题)
  - Noto Serif SC (中文标题)
  - DM Sans (英文正文)
  - Noto Sans SC (中文正文)

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 项目特点

- ✅ 纯静态网站，无需后端
- ✅ 自动保存主题偏好
- ✅ 自动保存视图偏好（网格/列表）
- ✅ 平滑的页面过渡动画
- ✅ 优雅的悬停交互效果
- ✅ 完整的移动端适配

## 许可证

MIT License

---

**作者**: 张佳俊  
**GitHub**: [pedro-zjj](https://github.com/pedro-zjj)
