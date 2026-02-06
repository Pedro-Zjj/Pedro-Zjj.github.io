/**
 * Personal Portfolio - Main JavaScript
 * Handles Markdown parsing, content loading, and UI interactions
 */

// Simple Markdown Parser
class MarkdownParser {
  static parse(markdown) {
    let html = markdown;
    
    // Escape HTML
    html = html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
    
    // Headers
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold and Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    
    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');
    
    // Tables
    html = html.replace(/\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g, (match, header, rows) => {
      const headers = header.split('|').map(h => h.trim()).filter(h => h);
      const rowData = rows.trim().split('\n').map(row => {
        const cells = row.split('|').map(c => c.trim()).filter(c => c);
        return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
      }).join('');
      
      return '<table class="markdown-table"><thead><tr>' + 
        headers.map(h => `<th>${h}</th>`).join('') + 
        '</tr></thead><tbody>' + rowData + '</tbody></table>';
    });
    
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/^(?!<[a-z])/gim, '<p>');
    html = html.replace(/$(?!<\/)/gim, '</p>');
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<[^\/])/g, '$1');
    html = html.replace(/<\/([^>]+)><\/p>/g, '</$1>');
    
    // Clean up
    html = html.replace(/\n/g, '');
    
    return html;
  }
  
  // Extract metadata from markdown frontmatter
  static extractMetadata(markdown) {
    const metadata = {};
    const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
    
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const lines = frontmatter.split('\n');
      
      lines.forEach(line => {
        const match = line.match(/^([^:]+):\s*(.+)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          // Parse arrays
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          }
          
          metadata[key] = value;
        }
      });
    }
    
    return metadata;
  }
  
  // Remove frontmatter from markdown
  static removeFrontmatter(markdown) {
    return markdown.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
  }
}

// Content Loader
class ContentLoader {
  static async loadFile(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to load ${path}`);
      return await response.text();
    } catch (error) {
      console.error('Error loading file:', error);
      return null;
    }
  }
  
  static async loadDirectory(directory) {
    // For GitHub Pages, we need a manifest file listing all content
    // This will be generated at build time or manually maintained
    try {
      const manifest = await this.loadFile(`${directory}/manifest.json`);
      if (manifest) {
        return JSON.parse(manifest);
      }
    } catch (e) {
      // Silently fallback to default files, no console error
    }
    
    // Fallback: return default file list
    return this.getDefaultFiles(directory);
  }
  
  static getDefaultFiles(directory) {
    const defaults = {
      'content/projects': ['project-1.md', 'project-2.md', 'project-3.md'],
      'content/internships': ['internship-1.md', 'internship-2.md'],
      'content/papers': ['paper-1.md', 'paper-2.md'],
      'content/blog': ['post-1.md', 'post-2.md', 'post-3.md'],
      'content/portfolio': ['work-1.md', 'work-2.md', 'work-3.md']
    };
    return defaults[directory] || [];
  }
}

// UI Components
class UI {
  static showLoading(container) {
    container.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
      </div>
    `;
  }
  
  static showEmpty(container, message = '暂无内容') {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>${message}</p>
      </div>
    `;
  }
  
  static showError(container, message = '加载失败') {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <p>${message}</p>
      </div>
    `;
  }
  
  static initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
      
      // Close menu when clicking a link
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('active');
        });
      });
    }
  }
  
  static setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
  }
  
  static animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.card, .list-item, .timeline-item').forEach(el => {
      observer.observe(el);
    });
  }
}

// Theme Manager
class ThemeManager {
  static THEME_KEY = 'portfolio-theme';
  
  static init() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    
    // Check if HTML already has data-theme set
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    
    if (savedTheme) {
      // Apply saved theme
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (htmlTheme) {
      // Use theme already set in HTML
      localStorage.setItem(this.THEME_KEY, htmlTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = prefersDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.THEME_KEY, theme);
    }
    
    // Initialize theme toggle buttons
    this.initToggleButtons();
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.THEME_KEY)) {
        const newTheme = e.matches ? 'dark' : 'light';
        this.setTheme(newTheme);
      }
    });
  }
  
  static initToggleButtons() {
    const toggles = document.querySelectorAll('.theme-btn');
    
    toggles.forEach(toggle => {
      // Set initial icon based on current theme
      this.updateThemeIcon(toggle);
      
      // Add click handler
      toggle.addEventListener('click', () => {
        const newTheme = this.getCurrentTheme() === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Update all toggle buttons icons
        document.querySelectorAll('.theme-btn').forEach(t => {
          this.updateThemeIcon(t);
        });
      });
    });
  }
  
  static updateThemeIcon(button) {
    const icon = button.querySelector('i');
    if (icon) {
      const currentTheme = this.getCurrentTheme();
      // Dark mode shows sun (to switch to light), light mode shows moon (to switch to dark)
      if (currentTheme === 'dark') {
        icon.className = 'fas fa-sun';
        button.setAttribute('title', '切换到浅色模式');
      } else {
        icon.className = 'fas fa-moon';
        button.setAttribute('title', '切换到深色模式');
      }
    }
  }
  
  static getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }
  
  static setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = theme === 'dark' ? '#1e293b' : '#f8fafc';
      metaThemeColor.setAttribute('content', color);
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }
  
  static toggle() {
    const newTheme = this.getCurrentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }
}

// Language Manager
class LanguageManager {
  static LANG_KEY = 'portfolio-language';
  static currentLang = 'zh';
  
  static translations = {
    zh: {
      nav: {
        home: '我的主页',
        projects: '项目经历',
        experience: '工作经历',
        papers: '论文发表',
        blog: '博客文章',
        portfolio: '作品集'
      },
      hero: {
        welcome: '欢迎来到我的个人空间',
        greeting: '你好，我是',
        subtitle: '行政管理与汉语国际教育双学位背景，专注于跨学科研究与教育实践。热爱学习，持续探索，致力于将理论知识转化为实际应用。',
        cta: {
          projects: '查看项目',
          resume: '个人简历'
        }
      },
      blog: {
        label: '博客',
        latestTitle: '最新文章',
        desc: '分享技术见解、学习心得和行业观察',
        viewAll: '查看全部文章'
      },
      page: {
        projectsLabel: 'Projects',
        projectsTitle: '项目经历',
        projectsDesc: '这里展示了我参与开发的各类项目，涵盖Web应用、移动应用、人工智能等多个领域',
        experienceLabel: 'Work Experience',
        experienceTitle: '工作经历',
        experienceDesc: '在不同公司的职业发展历程，积累了丰富的实战经验',
        papersLabel: 'Publications',
        papersTitle: '论文发表',
        papersDesc: '我的学术研究成果，涵盖人工智能、软件工程等领域',
        blogLabel: 'Blog',
        blogTitle: '博客文章',
        blogDesc: '分享技术见解、学习心得和行业观察',
        portfolioLabel: 'Portfolio',
        portfolioTitle: '作品集',
        portfolioDesc: '我的设计作品和创意项目展示'
      },
      resume: {
        label: 'Resume',
        title: '朱俊杰',
        subtitle: '男 | 2002年6月出生 | 行政管理 & 汉语国际教育双学位',
        downloadPDF: '下载PDF版本',
        personalInfo: '个人信息',
        education: '教育背景',
        skills: '技能特长',
        awards: '获奖荣誉',
        aboutMe: '关于我'
      },
      section: {
        featuredProjects: '精选项目',
        recentProjects: '近期项目',
        projectsDesc: '探索我近期完成的一些代表性项目作品',
        viewAllProjects: '查看全部项目',
        latestPosts: '最新文章',
        blogDesc: '分享技术见解、学习心得和行业观察',
        viewAllPosts: '查看全部文章'
      },
      common: {
        search: '搜索',
        searchPlaceholder: '搜索项目...',
        searchBlogPlaceholder: '搜索文章...',
        gridView: '网格视图',
        listView: '列表视图',
        readMore: '阅读更多',
        learnMore: '了解更多',
        back: '返回',
        backToList: '返回列表',
        share: '分享',
        copyLink: '复制链接',
        download: '下载',
        close: '关闭',
        loading: '加载中...',
        noResults: '暂无结果',
        viewDetails: '查看详情',
        prev: '上一页',
        next: '下一页',
        category: '分类',
        tags: '标签',
        date: '日期',
        author: '作者'
      },
      footer: {
        description: '行政管理与汉语国际教育双学位背景，专注于跨学科研究与教育实践。',
        quickLinks: '快速链接',
        contact: '联系方式',
        copyright: '© 2024 朱俊杰. 保留所有权利.',
        lastUpdate: '最后更新：2024年1月'
      },
      meta: {
        pageTitle: '个人作品集'
      }
    },
    en: {
      nav: {
        home: 'Home',
        projects: 'Projects',
        experience: 'Experience',
        papers: 'Publications',
        blog: 'Blog',
        portfolio: 'Portfolio'
      },
      hero: {
        welcome: 'Welcome to my space',
        greeting: 'Hi, I\'m',
        subtitle: 'Dual degree in Public Administration and Teaching Chinese as a Foreign Language. Focused on interdisciplinary research and educational practice. Passionate about learning and exploring.',
        cta: {
          projects: 'View Projects',
          resume: 'Resume'
        }
      },
      blog: {
        label: 'Blog',
        latestTitle: 'Latest Posts',
        desc: 'Sharing technical insights, learning experiences, and industry observations',
        viewAll: 'View All Posts'
      },
      page: {
        projectsLabel: 'Projects',
        projectsTitle: 'Projects',
        projectsDesc: 'Showcasing various projects I have participated in, covering Web applications, mobile apps, AI, and more',
        experienceLabel: 'Work Experience',
        experienceTitle: 'Work Experience',
        experienceDesc: 'Professional journey across different companies, accumulating rich practical experience',
        papersLabel: 'Publications',
        papersTitle: 'Publications',
        papersDesc: 'My academic research achievements, covering AI, software engineering, and other fields',
        blogLabel: 'Blog',
        blogTitle: 'Blog',
        blogDesc: 'Sharing technical insights, learning experiences, and industry observations',
        portfolioLabel: 'Portfolio',
        portfolioTitle: 'Portfolio',
        portfolioDesc: 'Showcasing my design works and creative projects'
      },
      resume: {
        label: 'Resume',
        title: 'Zhu Junjie',
        subtitle: 'Male | Born June 2002 | Dual Degree in Public Administration & TCFL',
        downloadPDF: 'Download PDF',
        personalInfo: 'Personal Information',
        education: 'Education',
        skills: 'Skills',
        awards: 'Awards',
        aboutMe: 'About Me'
      },
      section: {
        featuredProjects: 'Featured Projects',
        recentProjects: 'Recent Projects',
        projectsDesc: 'Explore some of my recent representative works',
        viewAllProjects: 'View All Projects',
        latestPosts: 'Latest Posts',
        blogDesc: 'Sharing technical insights, learning experiences, and industry observations',
        viewAllPosts: 'View All Posts'
      },
      common: {
        search: 'Search',
        searchPlaceholder: 'Search projects...',
        searchBlogPlaceholder: 'Search articles...',
        gridView: 'Grid View',
        listView: 'List View',
        readMore: 'Read More',
        learnMore: 'Learn More',
        back: 'Back',
        backToList: 'Back to List',
        share: 'Share',
        copyLink: 'Copy Link',
        download: 'Download',
        close: 'Close',
        loading: 'Loading...',
        noResults: 'No Results',
        viewDetails: 'View Details',
        prev: 'Previous',
        next: 'Next',
        category: 'Category',
        tags: 'Tags',
        date: 'Date',
        author: 'Author'
      },
      footer: {
        description: 'Dual degree in Public Administration and Teaching Chinese as a Foreign Language. Focused on interdisciplinary research.',
        quickLinks: 'Quick Links',
        contact: 'Contact',
        copyright: '© 2024 Zhu Junjie. All rights reserved.',
        lastUpdate: 'Last updated: Jan 2024'
      },
      meta: {
        pageTitle: 'Portfolio'
      }
    }
  };
  
  static init() {
    // Load saved language preference
    const savedLang = localStorage.getItem(this.LANG_KEY);
    if (savedLang && this.translations[savedLang]) {
      this.currentLang = savedLang;
    }
    
    // Initialize toggle button first
    this.initToggleButton();
    
    // Then apply language to update button text
    this.applyLanguage();
  }
  
  static initToggleButton() {
    const toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) {
      // Set initial state
      const langSpan = toggleBtn.querySelector('.lang-current');
      if (langSpan) {
        langSpan.textContent = this.currentLang === 'zh' ? '中' : 'EN';
      }
      
      toggleBtn.addEventListener('click', () => {
        this.toggle();
      });
    }
  }
  
  static toggle() {
    this.currentLang = this.currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem(this.LANG_KEY, this.currentLang);
    this.applyLanguage();
    
    // Update button text
    const toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) {
      const langSpan = toggleBtn.querySelector('.lang-current');
      if (langSpan) {
        langSpan.textContent = this.currentLang === 'zh' ? '中' : 'EN';
      }
    }
  }
  
  static applyLanguage() {
    const t = this.translations[this.currentLang];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const keys = key.split('.');
      let value = t;
      for (const k of keys) {
        value = value?.[k];
        if (!value) break;
      }
      if (value) {
        // Preserve any child elements (like icons)
        const icon = el.querySelector('i');
        if (icon) {
          el.innerHTML = '';
          el.appendChild(icon);
          el.appendChild(document.createTextNode(' ' + value));
        } else {
          el.textContent = value;
        }
      }
    });
    
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === 'index.html') link.textContent = t.nav.home;
      else if (href === 'projects.html') link.textContent = t.nav.projects;
      else if (href === 'work-experience.html') link.textContent = t.nav.experience;
      else if (href === 'papers.html') link.textContent = t.nav.papers;
      else if (href === 'blog.html') link.textContent = t.nav.blog;
      else if (href === 'portfolio.html') link.textContent = t.nav.portfolio;
    });
    
    // Update buttons with text content
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      const text = btn.textContent.trim();
      if (text.includes('查看全部项目') || text.includes('View All Projects')) {
        btn.innerHTML = t.section.viewAllProjects + ' <i class="fas fa-arrow-right"></i>';
      } else if (text.includes('查看全部文章') || text.includes('View All Posts')) {
        btn.innerHTML = t.section.viewAllPosts + ' <i class="fas fa-arrow-right"></i>';
      } else if (text.includes('下载PDF') || text.includes('Download PDF')) {
        btn.innerHTML = '<i class="fas fa-download"></i> ' + t.resume.downloadPDF;
      }
    });
    
    // Update search placeholder
    const searchInputs = document.querySelectorAll('input[type="text"], input[type="search"]');
    searchInputs.forEach(input => {
      const placeholder = input.getAttribute('placeholder') || '';
      if (placeholder.includes('搜索项目') || placeholder.includes('Search projects')) {
        input.placeholder = t.common.searchPlaceholder;
      } else if (placeholder.includes('搜索文章') || placeholder.includes('Search articles')) {
        input.placeholder = t.common.searchBlogPlaceholder;
      }
    });
    
    // Update view toggle buttons
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
      if (btn.dataset.view === 'grid') {
        btn.setAttribute('title', t.common.gridView);
      } else if (btn.dataset.view === 'list') {
        btn.setAttribute('title', t.common.listView);
      }
    });
    
    // Update resume section titles
    const resumeSectionTitles = document.querySelectorAll('.resume-section h2');
    resumeSectionTitles.forEach(title => {
      const text = title.textContent.trim();
      if (text.includes('个人信息') || text.includes('Personal Information')) {
        title.innerHTML = '<i class="fas fa-user" style="margin-right: 0.5rem; color: var(--accent);"></i>' + t.resume.personalInfo;
      } else if (text.includes('教育背景') || text.includes('Education')) {
        title.innerHTML = '<i class="fas fa-graduation-cap" style="margin-right: 0.5rem; color: var(--accent);"></i>' + t.resume.education;
      } else if (text.includes('技能特长') || text.includes('Skills')) {
        title.innerHTML = '<i class="fas fa-code" style="margin-right: 0.5rem; color: var(--accent);"></i>' + t.resume.skills;
      } else if (text.includes('获奖荣誉') || text.includes('Awards')) {
        title.innerHTML = '<i class="fas fa-trophy" style="margin-right: 0.5rem; color: var(--accent);"></i>' + t.resume.awards;
      } else if (text.includes('关于我') || text.includes('About Me')) {
        title.innerHTML = '<i class="fas fa-user-circle" style="margin-right: 0.5rem; color: var(--accent);"></i>' + t.resume.aboutMe;
      }
    });
    
    // Update document title
    const pageTitleMap = {
      'index.html': `${t.meta.pageTitle} - ${t.nav.home}`,
      'projects.html': `${t.meta.pageTitle} - ${t.nav.projects}`,
      'project-detail.html': `${t.meta.pageTitle} - ${t.common.viewDetails}`,
      'work-experience.html': `${t.meta.pageTitle} - ${t.nav.experience}`,
      'papers.html': `${t.meta.pageTitle} - ${t.nav.papers}`,
      'paper-detail.html': `${t.meta.pageTitle} - ${t.common.viewDetails}`,
      'blog.html': `${t.meta.pageTitle} - ${t.nav.blog}`,
      'blog-detail.html': `${t.meta.pageTitle} - ${t.common.viewDetails}`,
      'portfolio.html': `${t.meta.pageTitle} - ${t.nav.portfolio}`,
      'resume.html': `${t.meta.pageTitle} - ${t.resume.label}`
    };
    
    if (pageTitleMap[currentPage]) {
      document.title = pageTitleMap[currentPage];
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: this.currentLang } }));
  }
  
  static getCurrentLang() {
    return this.currentLang;
  }
}

/* ============================================
 *  SCROLL BUTTONS CLASS
 *  ============================================ */

class ScrollButtons {
  static init() {
    const smartBtn = document.getElementById('smart-scroll-btn');
    if (smartBtn) {
      // Set initial icon
      this.updateButtonIcon(smartBtn);
      
      // Add click handler - toggle between top and bottom
      smartBtn.addEventListener('click', () => {
        this.toggleScroll(smartBtn);
      });
      
      // Add scroll listener to update icon on scroll
      window.addEventListener('scroll', () => {
        this.updateButtonIcon(smartBtn);
      });
    }
  }
  
  static toggleScroll(btn) {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const isNearBottom = scrollY > documentHeight * 0.5;
    
    if (isNearBottom) {
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Scroll to bottom
      window.scrollTo({ top: documentHeight, behavior: 'smooth' });
    }
  }
  
  static updateButtonIcon(btn) {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const isNearBottom = scrollY > documentHeight * 0.5;
    
    const icon = btn.querySelector('i');
    if (icon) {
      if (isNearBottom) {
        // Near bottom, show arrow up to go to top
        icon.className = 'fas fa-arrow-up';
        btn.setAttribute('title', '返回顶部');
      } else {
        // Near top, show arrow down to go to bottom
        icon.className = 'fas fa-arrow-down';
        btn.setAttribute('title', '返回底部');
      }
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  UI.initMobileMenu();
  UI.setActiveNav();
  UI.animateOnScroll();
  ThemeManager.init();
  LanguageManager.init();
  ScrollButtons.init();
});

// Export for use in other scripts
window.MarkdownParser = MarkdownParser;
window.ContentLoader = ContentLoader;
window.UI = UI;
window.ThemeManager = ThemeManager;
window.ScrollButtons = ScrollButtons;
