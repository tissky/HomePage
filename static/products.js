// ===== 产品数据 =====
const products = [
    {
        id: 1,
        title: 'AI 智能助手',
        description: '基于先进的自然语言处理技术，为您提供智能对话和问题解答服务',
        category: 'ai',
        tags: ['AI', 'NLP', '智能对话'],
        icon: 'fa-robot',
        badge: 'new',
        users: '5K+',
        rating: '4.8'
    },
    {
        id: 2,
        title: '小说改编助手',
        description: '智能分析小说内容，自动生成剧本、角色设定和关系图谱',
        category: 'ai',
        tags: ['AI', '文学', '剧本'],
        icon: 'fa-book',
        badge: 'hot',
        users: '3K+',
        rating: '4.9'
    },
    {
        id: 3,
        title: '代码生成器',
        description: '根据需求描述自动生成高质量代码，支持多种编程语言',
        category: 'tool',
        tags: ['开发', '自动化', 'AI'],
        icon: 'fa-code',
        badge: 'popular',
        users: '8K+',
        rating: '4.7'
    },
    {
        id: 4,
        title: '个人主页构建器',
        description: '快速创建专业的个人主页，支持多种模板和自定义选项',
        category: 'web',
        tags: ['Web', '设计', '模板'],
        icon: 'fa-home',
        users: '12K+',
        rating: '4.8'
    },
    {
        id: 5,
        title: '数据可视化平台',
        description: '将复杂数据转化为直观的图表和交互式仪表板',
        category: 'web',
        tags: ['数据', '图表', '分析'],
        icon: 'fa-chart-bar',
        badge: 'new',
        users: '6K+',
        rating: '4.6'
    },
    {
        id: 6,
        title: '移动端应用框架',
        description: '跨平台移动应用开发框架，一次编写，多端运行',
        category: 'mobile',
        tags: ['移动', '跨平台', '框架'],
        icon: 'fa-mobile-alt',
        users: '15K+',
        rating: '4.9'
    },
    {
        id: 7,
        title: 'API 管理工具',
        description: '强大的API设计、测试和文档管理工具',
        category: 'tool',
        tags: ['API', '开发', '测试'],
        icon: 'fa-plug',
        badge: 'popular',
        users: '10K+',
        rating: '4.7'
    },
    {
        id: 8,
        title: '图像处理引擎',
        description: 'AI驱动的图像处理和优化工具，支持批量处理',
        category: 'ai',
        tags: ['图像', 'AI', '处理'],
        icon: 'fa-image',
        users: '7K+',
        rating: '4.8'
    },
    {
        id: 9,
        title: '项目管理系统',
        description: '团队协作和项目管理平台，提升工作效率',
        category: 'web',
        tags: ['管理', '协作', '效率'],
        icon: 'fa-tasks',
        badge: 'hot',
        users: '20K+',
        rating: '4.9'
    },
    {
        id: 10,
        title: '智能文档编辑器',
        description: '支持实时协作的在线文档编辑器，富文本和Markdown双模式',
        category: 'web',
        tags: ['文档', '编辑', '协作'],
        icon: 'fa-file-alt',
        users: '18K+',
        rating: '4.8'
    },
    {
        id: 11,
        title: '语音识别SDK',
        description: '高精度语音识别和转写服务，支持多语言',
        category: 'ai',
        tags: ['语音', 'AI', 'SDK'],
        icon: 'fa-microphone',
        badge: 'new',
        users: '4K+',
        rating: '4.7'
    },
    {
        id: 12,
        title: '性能监控平台',
        description: '实时监控应用性能，快速定位和解决问题',
        category: 'tool',
        tags: ['监控', '性能', '分析'],
        icon: 'fa-tachometer-alt',
        users: '9K+',
        rating: '4.6'
    }
];

// ===== DOM 元素 =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const productsGrid = document.getElementById('productsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const backToTopButton = document.getElementById('backToTop');
const statNumbers = document.querySelectorAll('.stat-number');

// ===== 导航栏滚动效果 =====
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // 添加滚动样式
    if (scrollTop > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // 显示/隐藏返回顶部按钮
    if (scrollTop > 500) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
    
    lastScrollTop = scrollTop;
});

// ===== 移动端导航切换 =====
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// 点击导航链接后关闭菜单
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===== 平滑滚动 =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== 返回顶部 =====
backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== 数字计数动画 =====
function animateNumber(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target.toString().includes('99') ? '99%' : target + '+';
            clearInterval(timer);
        } else {
            const displayValue = Math.floor(current);
            element.textContent = displayValue.toString().includes('99') ? Math.floor(current) + '%' : Math.floor(current) + '+';
        }
    }, 16);
}

// 使用 Intersection Observer 触发数字动画
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateNumber(entry.target);
            statsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

statNumbers.forEach(stat => {
    statsObserver.observe(stat);
});

// ===== Hero 粒子效果 =====
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // 随机位置
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // 随机大小
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // 随机动画延迟和持续时间
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        
        particlesContainer.appendChild(particle);
    }
}

// ===== 渲染产品卡片 =====
function renderProducts(filteredProducts) {
    productsGrid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-inbox" style="font-size: 4rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <p style="opacity: 0.6;">暂无产品</p>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        const badgeHTML = product.badge ? `
            <span class="product-badge badge-${product.badge}">
                ${product.badge === 'new' ? '新品' : product.badge === 'hot' ? '热门' : '推荐'}
            </span>
        ` : '';
        
        card.innerHTML = `
            <div class="product-image">
                <i class="fas ${product.icon}"></i>
            </div>
            <div class="product-content">
                <div class="product-header">
                    <h3 class="product-title">${product.title}</h3>
                    ${badgeHTML}
                </div>
                <p class="product-description">${product.description}</p>
                <div class="product-tags">
                    ${product.tags.map(tag => `<span class="product-tag">${tag}</span>`).join('')}
                </div>
                <div class="product-footer">
                    <div class="product-stats">
                        <span class="product-stat">
                            <i class="fas fa-users"></i>
                            ${product.users}
                        </span>
                        <span class="product-stat">
                            <i class="fas fa-star"></i>
                            ${product.rating}
                        </span>
                    </div>
                    <span class="product-action">
                        查看详情
                        <i class="fas fa-arrow-right"></i>
                    </span>
                </div>
            </div>
        `;
        
        // 添加点击事件
        card.addEventListener('click', () => {
            showProductDetail(product);
        });
        
        productsGrid.appendChild(card);
    });
}

// ===== 产品过滤 =====
function filterProducts(category) {
    if (category === 'all') {
        return products;
    }
    return products.filter(product => product.category === category);
}

// ===== 过滤按钮事件 =====
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 更新活动状态
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // 过滤产品
        const category = button.getAttribute('data-filter');
        const filteredProducts = filterProducts(category);
        
        // 添加淡出效果
        productsGrid.style.opacity = '0';
        productsGrid.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            renderProducts(filteredProducts);
            productsGrid.style.opacity = '1';
            productsGrid.style.transform = 'translateY(0)';
        }, 300);
    });
});

// ===== 产品详情模态框（简化版） =====
function showProductDetail(product) {
    // 简单的提示，实际项目中可以创建完整的模态框
    alert(`产品名称: ${product.title}\n\n${product.description}\n\n分类: ${product.category}\n标签: ${product.tags.join(', ')}\n用户: ${product.users}\n评分: ${product.rating}`);
}

// ===== 滚动动画观察器 =====
const scrollObserverOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, scrollObserverOptions);

// 观察需要滚动动画的元素
function observeScrollAnimations() {
    const elementsToAnimate = document.querySelectorAll('.feature-card, .section-header');
    elementsToAnimate.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        scrollObserver.observe(element);
    });
}

// ===== 键盘导航支持 =====
document.addEventListener('keydown', (e) => {
    // ESC 关闭移动菜单
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
    
    // 空格键或回车键滚动到顶部（当焦点在返回顶部按钮上时）
    if ((e.key === ' ' || e.key === 'Enter') && document.activeElement === backToTopButton) {
        e.preventDefault();
        backToTopButton.click();
    }
});

// ===== 防抖函数 =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== 窗口大小改变处理 =====
const handleResize = debounce(() => {
    // 如果是桌面端，确保移动菜单是关闭的
    if (window.innerWidth > 768) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
}, 250);

window.addEventListener('resize', handleResize);

// ===== 页面加载完成后的初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    // 创建粒子效果
    createParticles();
    
    // 渲染所有产品
    renderProducts(products);
    
    // 设置滚动动画
    observeScrollAnimations();
    
    // 添加页面加载动画
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ===== 性能优化：懒加载图片（如果有实际图片） =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    // 观察所有带有 data-src 属性的图片
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== 错误处理 =====
window.addEventListener('error', (e) => {
    console.error('页面错误:', e.error);
});

// ===== 控制台美化 =====
console.log('%c欢迎访问产品中心！', 'color: #74b9ff; font-size: 24px; font-weight: bold;');
console.log('%c有任何问题欢迎联系我们', 'color: #fd79a8; font-size: 14px;');
