// 3D别墅可视化主程序
class VillaVisualizer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.villa = null;
        this.materials = {};
        this.currentMaterials = {
            wall: 'concrete',
            roof: 'metal'
        };
        this.currentTime = 'day';
        this.isRotating = true;
        
        this.init();
    }

    init() {
        this.setupScene();
        this.createMaterials();
        this.createVilla();
        this.setupLighting();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
        this.hideLoadingScreen();
    }

    setupScene() {
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1d29);
        this.scene.fog = new THREE.Fog(0x1a1d29, 50, 200);

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(15, 10, 15);
        this.camera.lookAt(0, 0, 0);

        // 创建渲染器
        const container = document.getElementById('threejs-container');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: container,
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;

        // 创建粒子背景
        this.createParticles();
    }

    createMaterials() {
        // 外墙材质
        this.materials.concrete = new THREE.MeshLambertMaterial({
            color: 0xcccccc,
            roughness: 0.8,
            metalness: 0.1
        });

        this.materials.stone = new THREE.MeshLambertMaterial({
            color: 0x8b7355,
            roughness: 0.9,
            metalness: 0.0
        });

        this.materials.wood = new THREE.MeshLambertMaterial({
            color: 0x8b4513,
            roughness: 0.7,
            metalness: 0.0
        });

        this.materials.glass = new THREE.MeshPhysicalMaterial({
            color: 0x87ceeb,
            metalness: 0.1,
            roughness: 0.0,
            transmission: 0.9,
            thickness: 0.5,
            transparent: true,
            opacity: 0.3
        });

        // 屋顶材质
        this.materials.metal = new THREE.MeshLambertMaterial({
            color: 0x2c3e50,
            roughness: 0.3,
            metalness: 0.8
        });

        this.materials.tiles = new THREE.MeshLambertMaterial({
            color: 0x8b0000,
            roughness: 0.7,
            metalness: 0.1
        });
    }

    createVilla() {
        this.villa = new THREE.Group();

        // 地基
        const foundationGeometry = new THREE.BoxGeometry(12, 0.5, 12);
        const foundationMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
        foundation.position.y = -0.25;
        foundation.receiveShadow = true;
        this.villa.add(foundation);

        // 第一层
        this.createFloor(0, 3, 12, 12, this.materials.concrete);
        
        // 第二层
        this.createFloor(3.5, 2.5, 10, 10, this.materials.concrete);
        
        // 第三层（屋顶）
        this.createRoof(6.5, 1.5, 10, 10, this.materials.metal);

        // 添加窗户
        this.createWindows();
        
        // 添加门
        this.createDoor();

        // 添加柱子
        this.createColumns();

        this.scene.add(this.villa);
    }

    createFloor(y, height, width, depth, material) {
        const floorGeometry = new THREE.BoxGeometry(width, height, depth);
        const floor = new THREE.Mesh(floorGeometry, material);
        floor.position.y = y + height/2;
        floor.castShadow = true;
        floor.receiveShadow = true;
        this.villa.add(floor);

        // 添加装饰线条
        const trimGeometry = new THREE.BoxGeometry(width + 0.2, 0.2, depth + 0.2);
        const trimMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const trim = new THREE.Mesh(trimGeometry, trimMaterial);
        trim.position.y = y + height;
        this.villa.add(trim);
    }

    createRoof(y, height, width, depth, material) {
        // 主屋顶
        const roofGeometry = new THREE.BoxGeometry(width, height, depth);
        const roof = new THREE.Mesh(roofGeometry, material);
        roof.position.y = y + height/2;
        roof.castShadow = true;
        roof.receiveShadow = true;
        this.villa.add(roof);

        // 屋顶装饰
        const decorationGeometry = new THREE.BoxGeometry(width * 0.8, 0.3, depth * 0.8);
        const decorationMaterial = new THREE.MeshLambertMaterial({ color: 0xd4af37 });
        const decoration = new THREE.Mesh(decorationGeometry, decorationMaterial);
        decoration.position.y = y + height + 0.15;
        this.villa.add(decoration);
    }

    createWindows() {
        const windowMaterial = this.materials.glass;
        
        // 第一层窗户
        const windowPositions = [
            { x: 6, y: 1.5, z: 0, rotation: Math.PI / 2 },
            { x: -6, y: 1.5, z: 0, rotation: -Math.PI / 2 },
            { x: 0, y: 1.5, z: 6, rotation: 0 },
            { x: 0, y: 1.5, z: -6, rotation: Math.PI }
        ];

        windowPositions.forEach(pos => {
            const windowGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(pos.x, pos.y, pos.z);
            if (pos.rotation) {
                window.rotation.y = pos.rotation;
            }
            this.villa.add(window);
        });

        // 第二层窗户
        const secondFloorWindows = [
            { x: 5, y: 4.5, z: 0, rotation: Math.PI / 2 },
            { x: -5, y: 4.5, z: 0, rotation: -Math.PI / 2 },
            { x: 0, y: 4.5, z: 5, rotation: 0 },
            { x: 0, y: 4.5, z: -5, rotation: Math.PI }
        ];

        secondFloorWindows.forEach(pos => {
            const windowGeometry = new THREE.BoxGeometry(1.5, 1.2, 0.1);
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(pos.x, pos.y, pos.z);
            if (pos.rotation) {
                window.rotation.y = pos.rotation;
            }
            this.villa.add(window);
        });
    }

    createDoor() {
        const doorGeometry = new THREE.BoxGeometry(1.5, 2.5, 0.1);
        const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 1.25, 6.05);
        this.villa.add(door);
    }

    createColumns() {
        const columnGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3);
        const columnMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        
        const columnPositions = [
            { x: 4, z: 6 },
            { x: -4, z: 6 },
            { x: 4, z: -6 },
            { x: -4, z: -6 }
        ];

        columnPositions.forEach(pos => {
            const column = new THREE.Mesh(columnGeometry, columnMaterial);
            column.position.set(pos.x, 1.5, pos.z);
            column.castShadow = true;
            this.villa.add(column);
        });
    }

    setupLighting() {
        // 环境光
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambientLight);

        // 主光源（太阳）
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.sunLight.position.set(20, 30, 20);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 100;
        this.sunLight.shadow.camera.left = -30;
        this.sunLight.shadow.camera.right = 30;
        this.sunLight.shadow.camera.top = 30;
        this.sunLight.shadow.camera.bottom = -30;
        this.scene.add(this.sunLight);

        // 补光
        this.fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
        this.fillLight.position.set(-10, 20, -10);
        this.scene.add(this.fillLight);
    }

    createParticles() {
        const particleCount = 100;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = Math.random() * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            colors[i * 3] = 1;
            colors[i * 3 + 1] = 0.843;
            colors[i * 3 + 2] = 0.216;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        this.particles = new THREE.Points(particles, particleMaterial);
        this.scene.add(this.particles);
    }

    setupControls() {
        // 鼠标控制
        this.mouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.currentRotationX = 0;
        this.currentRotationY = 0;

        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!this.mouseDown) return;

            const deltaX = e.clientX - this.mouseX;
            const deltaY = e.clientY - this.mouseY;

            this.targetRotationY += deltaX * 0.01;
            this.targetRotationX += deltaY * 0.01;

            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        canvas.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });

        // 滚轮缩放
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const scale = e.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(scale);
            this.camera.position.clampLength(5, 50);
        });

        // 触摸控制（移动端）
        let touchStartX = 0;
        let touchStartY = 0;

        canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;

            const deltaX = touchX - touchStartX;
            const deltaY = touchY - touchStartY;

            this.targetRotationY += deltaX * 0.01;
            this.targetRotationX += deltaY * 0.01;

            touchStartX = touchX;
            touchStartY = touchY;
        });
    }

    setupEventListeners() {
        // 材质切换
        document.querySelectorAll('.material-item[data-material]').forEach(item => {
            item.addEventListener('click', () => {
                const material = item.dataset.material;
                this.changeWallMaterial(material);
                
                // 更新UI状态
                document.querySelectorAll('.material-item[data-material]').forEach(el => 
                    el.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // 屋顶材质切换
        document.querySelectorAll('.material-item[data-roof]').forEach(item => {
            item.addEventListener('click', () => {
                const roof = item.dataset.roof;
                this.changeRoofMaterial(roof);
                
                // 更新UI状态
                document.querySelectorAll('.material-item[data-roof]').forEach(el => 
                    el.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // 时间切换
        document.querySelectorAll('.material-item[data-time]').forEach(item => {
            item.addEventListener('click', () => {
                const time = item.dataset.time;
                this.changeTimeOfDay(time);
                
                // 更新UI状态
                document.querySelectorAll('.material-item[data-time]').forEach(el => 
                    el.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // 视角控制
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.changeView(view);
            });
        });

        // 窗口大小调整
        window.addEventListener('resize', () => {
            const container = document.getElementById('threejs-container');
            this.camera.aspect = container.offsetWidth / container.offsetHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.offsetWidth, container.offsetHeight);
        });
    }

    changeWallMaterial(materialType) {
        this.currentMaterials.wall = materialType;
        this.updateVillaMaterials();
    }

    changeRoofMaterial(materialType) {
        this.currentMaterials.roof = materialType;
        this.updateVillaMaterials();
    }

    updateVillaMaterials() {
        // 这里简化处理，实际应该遍历别墅的各个部分并更新材质
        console.log(`更新材质 - 墙面: ${this.currentMaterials.wall}, 屋顶: ${this.currentMaterials.roof}`);
    }

    changeTimeOfDay(time) {
        this.currentTime = time;
        
        switch(time) {
            case 'day':
                this.sunLight.color.setHex(0xffffff);
                this.sunLight.intensity = 1;
                this.ambientLight.intensity = 0.4;
                this.scene.background = new THREE.Color(0x1a1d29);
                break;
            case 'sunset':
                this.sunLight.color.setHex(0xff6b35);
                this.sunLight.intensity = 0.7;
                this.ambientLight.intensity = 0.3;
                this.scene.background = new THREE.Color(0x2c1810);
                break;
            case 'night':
                this.sunLight.color.setHex(0x4169e1);
                this.sunLight.intensity = 0.2;
                this.ambientLight.intensity = 0.1;
                this.scene.background = new THREE.Color(0x0a0a0a);
                break;
        }
    }

    changeView(viewType) {
        const duration = 1000;
        const startPos = this.camera.position.clone();
        let targetPos;

        switch(viewType) {
            case 'front':
                targetPos = new THREE.Vector3(0, 8, 20);
                break;
            case 'side':
                targetPos = new THREE.Vector3(20, 8, 0);
                break;
            case 'top':
                targetPos = new THREE.Vector3(0, 25, 0);
                break;
            case 'iso':
                targetPos = new THREE.Vector3(15, 10, 15);
                break;
        }

        // 使用anime.js进行平滑过渡
        anime({
            targets: this.camera.position,
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: duration,
            easing: 'easeInOutQuad'
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // 平滑旋转
        this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.05;
        this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;

        if (this.villa) {
            this.villa.rotation.y = this.currentRotationY;
            this.villa.rotation.x = this.currentRotationX;
        }

        // 自动旋转
        if (this.isRotating && !this.mouseDown) {
            this.targetRotationY += 0.005;
        }

        // 粒子动画
        if (this.particles) {
            this.particles.rotation.y += 0.001;
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.01;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        this.renderer.render(this.scene, this.camera);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progress = document.getElementById('loadingProgress');
        
        // 模拟加载进度
        let loadProgress = 0;
        const interval = setInterval(() => {
            loadProgress += Math.random() * 15;
            if (loadProgress >= 100) {
                loadProgress = 100;
                clearInterval(interval);
                
                setTimeout(() => {
                    anime({
                        targets: loadingScreen,
                        opacity: 0,
                        duration: 800,
                        easing: 'easeOutQuad',
                        complete: () => {
                            loadingScreen.style.display = 'none';
                            this.showUIElements();
                        }
                    });
                }, 500);
            }
            progress.style.width = loadProgress + '%';
        }, 100);
    }

    showUIElements() {
        const elements = document.querySelectorAll('.fade-in');
        elements.forEach((el, index) => {
            anime({
                targets: el,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 600,
                delay: index * 100,
                easing: 'easeOutQuad'
            });
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new VillaVisualizer();
});

// 添加一些额外的交互效果
document.addEventListener('DOMContentLoaded', () => {
    // 导航栏滚动效果
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop;
    });

    // 材质项悬停效果
    document.querySelectorAll('.material-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (!item.classList.contains('active')) {
                anime({
                    targets: item,
                    scale: 1.05,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            }
        });

        item.addEventListener('mouseleave', () => {
            if (!item.classList.contains('active')) {
                anime({
                    targets: item,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            }
        });
    });

    // 按钮悬停效果
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            anime({
                targets: btn,
                scale: 1.05,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });

        btn.addEventListener('mouseleave', () => {
            anime({
                targets: btn,
                scale: 1,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
    });
});