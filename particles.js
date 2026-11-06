/**
 * 交互式粒子网络背景特效 (Vanilla JS, No Dependencies)
 * 功能：粒子漂浮、邻近连线、鼠标悬停汇聚、鼠标移动散开
 */
(function () {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // 配置参数
    const config = {
        particleCount: 120,       // 粒子数量
        maxDistance: 130,         // 粒子之间连线的最大距离
        mouseRadius: 150,         // 鼠标影响范围
        speed: 0.6,               // 粒子基础漂浮速度
        color: '44, 82, 130',     // 粒子颜色 (RGB)
        lineColor: '44, 82, 130'  // 连线颜色 (RGB)
    };

    let particles = [];
    const mouse = { x: null, y: null };

    // 监听鼠标位置
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // 鼠标离开窗口时重置位置
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
    });

    // 粒子类
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // 随机初始速度方向
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * config.speed;
            this.vy = Math.sin(angle) * config.speed;
            this.radius = Math.random() * 2 + 1; // 半径 1~3px
        }

        update() {
            // 自由移动
            this.x += this.vx;
            this.y += this.vy;

            // 边界反弹
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // 鼠标交互：悬停汇聚 (Attract)
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.mouseRadius) {
                    let force = (config.mouseRadius - distance) / config.mouseRadius;
                    // 正向力：汇聚；负向力：排斥 (散开)
                    this.x += (dx / distance) * force * 2; 
                    this.y += (dy / distance) * force * 2;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${config.color}, 0.6)`;
            ctx.fill();
        }
    }

    // 初始化粒子
    function initParticles() {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // 动画主循环
    function animate() {
        // 拖尾效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; 
        ctx.fillRect(0, 0, width, height);

        // 更新并绘制所有粒子
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // 绘制粒子之间的连线
            for (let j = i + 1; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.maxDistance) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.lineWidth = (config.maxDistance - distance) / config.maxDistance * 1.5;
                    ctx.strokeStyle = `rgba(${config.lineColor}, ${(config.maxDistance - distance) / config.maxDistance})`;
                    ctx.stroke();
                }
            }

            // 绘制粒子与鼠标之间的连线
            if (mouse.x !== null && mouse.y !== null) {
                let dx = particles[i].x - mouse.x;
                let dy = particles[i].y - mouse.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.mouseRadius) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = `rgba(${config.lineColor}, ${1 - distance / config.mouseRadius})`;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    // 启动
    initParticles();
    animate();
})();