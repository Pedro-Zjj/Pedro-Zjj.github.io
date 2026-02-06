/**
 * Portfolio Data Manager
 * Loads data from Markdown files with flexible YAML frontmatter support
 */

/**
 * Simple Markdown to HTML converter
 */
const MarkdownRenderer = {
  /**
   * Convert markdown text to HTML
   */
  toHTML(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Escape HTML entities first
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
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');
    html = html.replace(/^\*\*\*$/gim, '<hr>');
    html = html.replace(/^___$/gim, '<hr>');
    
    // Unordered lists
    html = html.replace(/^(\s*)[-*+] (.*$)/gim, (match, indent, content) => {
      const level = indent.length / 2;
      return `<li>${content}</li>`;
    });
    
    // Ordered lists
    html = html.replace(/^(\s*)\d+\. (.*$)/gim, '<li>$2</li>');
    
    // Wrap consecutive li elements in ul
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
      return `<ul>${match}</ul>`;
    });
    
    // Tables (simple support)
    html = html.replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map(c => c.trim()).filter(c => c);
      return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    });
    
    // Wrap table rows in table
    html = html.replace(/(<tr>.*<\/tr>\n?)+/g, (match) => {
      return `<table>${match}</table>`;
    });
    
    // Paragraphs (must be last)
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/^(.+)$/gim, (match) => {
      if (match.match(/^<[a-z]/i)) return match;
      return `<p>${match}</p>`;
    });
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    
    return html;
  }
};

const PortfolioData = {
  // Cache for loaded data
  _cache: {
    projects: null,
    blogPosts: null,
    papers: null,
    workExperience: null,
    portfolio: null
  },

  /**
   * Field mapping for different content types
   * Maps various field names to standard internal names
   */
  _fieldMappings: {
    // Common fields
    common: {
      // Title variations
      'title': 'title',
      'name': 'title',
      'project_name': 'title',
      
      // Description variations
      'description': 'description',
      'summary': 'description',
      'excerpt': 'description',
      
      // Date variations
      'date': 'date',
      'publish_date': 'date',
      'created': 'date',
      
      // Image variations
      'image': 'image',
      'cover': 'image',
      'cover_image': 'image',
      'thumbnail': 'thumbnail',
      'thumb': 'thumbnail',
      
      // Tags variations
      'tags': 'tags',
      'keywords': 'tags',
      'tech': 'tags',
      'technologies': 'tags',
      
      // Category variations
      'category': 'category',
      'type': 'category',
      'project_type': 'category',
    },
    
    // Project-specific mappings
    projects: {
      'duration': 'duration',
      'period': 'duration',
      'timeframe': 'duration',
      'role': 'role',
      'position': 'role',
      'team': 'team',
      'team_size': 'team',
      'status': 'status',
      'state': 'status',
      'demo': 'demo',
      'demo_url': 'demo',
      'live': 'demo',
      'github': 'github',
      'repo': 'github',
      'repository': 'github',
      'source': 'github',
      'docs': 'docs',
      'documentation': 'docs',
      'highlights': 'highlights',
      'features': 'highlights',
      'key_points': 'highlights',
      'stats': 'stats',
      'metrics': 'stats',
      'statistics': 'stats',
    },
    
    // Blog-specific mappings
    blog: {
      'reading_time': 'readingTime',
      'readingTime': 'readingTime',
      'read_time': 'readingTime',
      'updated': 'updated',
      'updated_at': 'updated',
      'last_modified': 'updated',
      'author': 'author',
      'writer': 'author',
      'author_avatar': 'authorAvatar',
      'avatar': 'authorAvatar',
      'featured': 'featured',
      'is_featured': 'featured',
      'highlight': 'featured',
    },
    
    // Paper-specific mappings
    papers: {
      'authors': 'authors',
      'author': 'authors',
      'writer': 'authors',
      'venue': 'venue',
      'conference': 'venue',
      'journal': 'venue',
      'published_at': 'venue',
      'year': 'year',
      'rank': 'rank',
      'level': 'rank',
      'ccf_rank': 'rank',
      'pdf': 'pdf',
      'paper': 'pdf',
      'paper_url': 'pdf',
      'code': 'code',
      'code_url': 'code',
      'github': 'code',
      'slides': 'slides',
      'presentation': 'slides',
      'ppt': 'slides',
      'doi': 'doi',
      'citations': 'citations',
      'cited': 'citations',
      'abstract': 'abstract',
      'citation': 'citation',
      'bibtex': 'citation',
    },
    
    // Portfolio-specific mappings
    portfolio: {
      'link': 'link',
      'url': 'link',
      'project_url': 'link',
      'behance': 'behance',
      'behance_url': 'behance',
      'dribbble': 'dribbble',
      'dribbble_url': 'dribbble',
      'client': 'client',
      'customer': 'client',
      'company': 'client',
    }
  },

  /**
   * Normalize field names using mappings
   */
  _normalizeFields(metadata, contentType) {
    const normalized = {};
    const mappings = {
      ...this._fieldMappings.common,
      ...(this._fieldMappings[contentType] || {})
    };
    
    for (const [key, value] of Object.entries(metadata)) {
      const normalizedKey = mappings[key] || key;
      normalized[normalizedKey] = value;
    }
    
    return normalized;
  },

  /**
   * Parse YAML frontmatter from markdown content
   * Supports various YAML formats
   */
  parseFrontmatter(content) {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!match) return { metadata: {}, content: content };

    const yamlText = match[1];
    const bodyContent = match[2].trim();

    const metadata = {};
    const lines = yamlText.split('\n');
    let currentKey = null;
    let currentValue = [];
    let isMultiline = false;
    let isArray = false;
    let multilineType = null; // '|' or '>'

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Check for new key
      const keyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
      
      if (keyMatch && !isMultiline && !isArray) {
        // Save previous key-value
        if (currentKey) {
          const joinedValue = currentValue.join('\n').trim();
          metadata[currentKey] = this.parseValue(joinedValue);
        }
        
        currentKey = keyMatch[1];
        const value = keyMatch[2].trim();
        
        // Check for inline array format: key: [item1, item2]
        if (value.startsWith('[') && value.endsWith(']')) {
          metadata[currentKey] = this.parseValue(value);
          currentKey = null;
          currentValue = [];
        }
        // Check for multiline indicator
        else if (value === '|' || value === '>') {
          isMultiline = true;
          multilineType = value;
          currentValue = [];
        } else if (value === '') {
          // Check if next line starts array items
          const nextLine = lines[i + 1];
          if (nextLine && nextLine.trim().startsWith('- ')) {
            isArray = true;
            currentValue = [];
          } else {
            currentValue = [];
          }
        } else {
          currentValue = [value];
        }
      } else if (isArray) {
        // Check if this is an array item
        if (trimmedLine.startsWith('- ')) {
          currentValue.push(trimmedLine.substring(2).trim());
        } else if (trimmedLine === '') {
          // Empty line in array - continue
        } else {
          // End of array
          if (currentKey) {
            metadata[currentKey] = currentValue;
          }
          currentKey = null;
          currentValue = [];
          isArray = false;
          
          // Process this line as a new key
          const newKeyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
          if (newKeyMatch) {
            currentKey = newKeyMatch[1];
            const value = newKeyMatch[2].trim();
            if (value.startsWith('[') && value.endsWith(']')) {
              metadata[currentKey] = this.parseValue(value);
              currentKey = null;
              currentValue = [];
            } else if (value === '|' || value === '>') {
              isMultiline = true;
              multilineType = value;
              currentValue = [];
            } else if (value === '') {
              const nextLine = lines[i + 1];
              if (nextLine && nextLine.trim().startsWith('- ')) {
                isArray = true;
                currentValue = [];
              } else {
                currentValue = [];
              }
            } else {
              currentValue = [value];
            }
          }
        }
      } else if (isMultiline) {
        // Check if multiline continues (indented or empty line)
        if (line.startsWith('  ') || line.startsWith('\t') || trimmedLine === '') {
          if (multilineType === '|') {
            currentValue.push(line);
          } else if (multilineType === '>') {
            // Folded style: replace newline with space
            currentValue.push(line.trim());
          }
        } else {
          // End of multiline
          if (currentKey) {
            let value = currentValue.join(multilineType === '>' ? ' ' : '\n');
            metadata[currentKey] = value;
          }
          currentKey = null;
          currentValue = [];
          isMultiline = false;
          multilineType = null;
          
          // Process this line as a new key
          const newKeyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
          if (newKeyMatch) {
            currentKey = newKeyMatch[1];
            const value = newKeyMatch[2].trim();
            if (value.startsWith('[') && value.endsWith(']')) {
              metadata[currentKey] = this.parseValue(value);
              currentKey = null;
              currentValue = [];
            } else if (value === '|' || value === '>') {
              isMultiline = true;
              multilineType = value;
              currentValue = [];
            } else if (value === '') {
              const nextLine = lines[i + 1];
              if (nextLine && nextLine.trim().startsWith('- ')) {
                isArray = true;
                currentValue = [];
              } else {
                currentValue = [];
              }
            } else {
              currentValue = [value];
            }
          }
        }
      } else {
        currentValue.push(line);
      }
    }

    // Save last key-value
    if (currentKey) {
      if (isArray) {
        metadata[currentKey] = currentValue;
      } else if (isMultiline) {
        let value = currentValue.join(multilineType === '>' ? ' ' : '\n');
        metadata[currentKey] = value;
      } else {
        const joinedValue = currentValue.join('\n').trim();
        metadata[currentKey] = this.parseValue(joinedValue);
      }
    }

    return { metadata, content: bodyContent };
  },

  /**
   * Parse a YAML value with type inference
   */
  parseValue(value) {
    value = value.trim();
    
    if (!value) return null;

    // Array format: [item1, item2, item3]
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        // Try JSON parse first
        return JSON.parse(value.replace(/'/g, '"'));
      } catch {
        // Manual parsing for simple arrays
        const items = value.slice(1, -1).split(',');
        return items.map(v => this.parseValue(v.trim())).filter(v => v !== null);
      }
    }

    // String with quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }

    // Number (integer)
    if (/^-?\d+$/.test(value)) {
      return parseInt(value, 10);
    }
    
    // Number (float)
    if (/^-?\d+\.\d+$/.test(value)) {
      return parseFloat(value);
    }

    // Boolean
    if (value === 'true' || value === 'True' || value === 'TRUE') return true;
    if (value === 'false' || value === 'False' || value === 'FALSE') return false;

    // Null
    if (value === 'null' || value === '~' || value === 'Null' || value === 'NULL') {
      return null;
    }

    // Comma-separated list (not in brackets)
    if (value.includes(',') && !value.includes(':')) {
      return value.split(',').map(v => v.trim()).filter(v => v);
    }

    return value;
  },

  /**
   * Load a single markdown file
   */
  async loadMarkdownFile(path, contentType) {
    try {
      console.log(`Fetching: ${path}`);
      const response = await fetch(path);
      console.log(`Response for ${path}:`, response.status, response.ok);
      if (!response.ok) {
        console.error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
        return null;
      }
      const text = await response.text();
      console.log(`Loaded ${path}, content length:`, text.length);
      const parsed = this.parseFrontmatter(text);
      
      // Debug: log raw parsed metadata
      if (path.includes('project-1')) {
        console.log('Raw parsed metadata for project-1:', parsed.metadata);
      }
      
      // Normalize field names
      parsed.metadata = this._normalizeFields(parsed.metadata, contentType);
      
      // Debug: log normalized metadata
      if (path.includes('project-1')) {
        console.log('Normalized metadata for project-1:', parsed.metadata);
      }
      
      return parsed;
    } catch (error) {
      console.error(`Error loading ${path}:`, error);
      return null;
    }
  },

  /**
   * Load all markdown files from a directory
   */
  async loadMarkdownDirectory(dirPath, contentType) {
    // File mapping for static server
    const fileMap = {
      'content/projects': ['project-1.md', 'project-2.md', 'project-3.md'],
      'content/blog': ['post-1.md', 'post-2.md', 'post-3.md'],
      'content/papers': ['paper-1.md', 'paper-2.md'],
      'content/portfolio': ['work-1.md', 'work-2.md', 'work-3.md']
    };

    const files = fileMap[dirPath] || [];
    const results = [];

    for (const file of files) {
      const data = await this.loadMarkdownFile(`${dirPath}/${file}`, contentType);
      if (data) {
        results.push({
          id: file.replace('.md', ''),
          ...data.metadata,
          content: data.content
        });
      }
    }

    return results;
  },

  /**
   * Initialize data from Markdown files
   */
  async init() {
    // Load all data types concurrently
    const [projects, blogPosts, papers, portfolio] = await Promise.all([
      this.loadMarkdownDirectory('content/projects', 'projects'),
      this.loadMarkdownDirectory('content/blog', 'blog'),
      this.loadMarkdownDirectory('content/papers', 'papers'),
      this.loadMarkdownDirectory('content/portfolio', 'portfolio')
    ]);

    this._cache.projects = projects;
    this._cache.blogPosts = blogPosts;
    this._cache.papers = papers;
    this._cache.portfolio = portfolio;

    // Debug: log parsed data
    console.log('Parsed projects:', projects);
    console.log('Parsed blogPosts:', blogPosts);
    console.log('Parsed papers:', papers);

    // Work experience is still static (can be moved to MD if needed)
    this._cache.workExperience = this._getStaticWorkExperience();

    return this._cache;
  },

  /**
   * Get static work experience data
   */
  _getStaticWorkExperience() {
    return [
      {
        id: 'work-1',
        title: '高级前端工程师',
        company: '字节跳动',
        location: '北京',
        date: '2024.06 - 至今',
        description: '负责抖音电商后台管理系统的架构设计与核心功能开发，带领5人团队完成多个重要项目。',
        tags: ['React', 'TypeScript', 'Micro-frontend', 'Node.js'],
        achievements: [
          '主导商品管理系统的重构，代码量减少30%，性能提升40%',
          '设计并实现微前端架构，支持10+子应用独立部署',
          '建立前端工程化体系，提升团队开发效率50%',
          '指导初级工程师，组织技术分享10+场'
        ]
      },
      {
        id: 'work-2',
        title: '前端开发工程师',
        company: '阿里巴巴',
        location: '杭州',
        date: '2022.07 - 2024.05',
        description: '参与淘宝商家后台系统的开发与维护，负责数据可视化和大屏展示相关功能。',
        tags: ['Vue.js', 'Data Visualization', 'ECharts', 'Webpack'],
        achievements: [
          '开发数据可视化组件库，被10+个项目采用',
          '优化大数据表格渲染性能，支持百万级数据流畅展示',
          '获得2023年度优秀员工称号',
          '申请技术专利2项'
        ]
      },
      {
        id: 'work-3',
        title: '软件开发实习生',
        company: '腾讯',
        location: '深圳',
        date: '2021.06 - 2021.09',
        description: '参与微信小程序开发，负责活动页面和营销工具的前端实现。',
        tags: ['微信小程序', 'JavaScript', 'CSS3'],
        achievements: [
          '独立完成5个活动页面的开发，累计PV超过1000万',
          '优化页面加载速度，首屏时间减少60%',
          '获得转正offer'
        ]
      }
    ];
  },

  // Getters
  get projects() {
    return this._cache.projects || [];
  },

  get blogPosts() {
    return this._cache.blogPosts || [];
  },

  get papers() {
    return this._cache.papers || [];
  },

  get workExperience() {
    return this._cache.workExperience || [];
  },

  get portfolio() {
    return this._cache.portfolio || [];
  },

  // Helper methods
  getProjectById(id) {
    return this.projects.find(p => p.id === id);
  },

  getBlogPostById(id) {
    return this.blogPosts.find(p => p.id === id);
  },

  getPaperById(id) {
    return this.papers.find(p => p.id === id);
  },

  getPortfolioById(id) {
    return this.portfolio.find(p => p.id === id);
  },

  getProjectsByCategory(category) {
    if (category === 'all') return this.projects;
    return this.projects.filter(p => p.category === category);
  },

  getBlogPostsByCategory(category) {
    if (category === 'all') return this.blogPosts;
    return this.blogPosts.filter(p => p.category === category);
  },
  
  getFeaturedBlogPosts() {
    return this.blogPosts.filter(p => p.featured);
  },

  // Navigation helpers
  getProjectNavigation(currentId) {
    const projects = this.projects;
    const currentIndex = projects.findIndex(p => p.id === currentId);
    if (currentIndex === -1) return { prev: null, next: null };
    
    return {
      prev: currentIndex > 0 ? projects[currentIndex - 1] : null,
      next: currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null
    };
  },

  getBlogPostNavigation(currentId) {
    const posts = this.blogPosts;
    const currentIndex = posts.findIndex(p => p.id === currentId);
    if (currentIndex === -1) return { prev: null, next: null };
    
    return {
      prev: currentIndex > 0 ? posts[currentIndex - 1] : null,
      next: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null
    };
  },

  getPaperNavigation(currentId) {
    const papers = this.papers;
    const currentIndex = papers.findIndex(p => p.id === currentId);
    if (currentIndex === -1) return { prev: null, next: null };
    
    return {
      prev: currentIndex > 0 ? papers[currentIndex - 1] : null,
      next: currentIndex < papers.length - 1 ? papers[currentIndex + 1] : null
    };
  }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  PortfolioData.init().then(() => {
    window.dispatchEvent(new CustomEvent('portfolioDataReady'));
  });
});
