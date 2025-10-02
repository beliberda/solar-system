import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

// Глобальные переменные
let scene, camera, renderer, controls;
let sun, planets = [];
let planetData = [];

// Инициализация сцены
function init() {
    // Создание сцены
    scene = new THREE.Scene();

    // Создание камеры
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 50, 100);

    // Создание рендерера
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Добавляем canvas в контейнер
    const container = document.getElementById('container');
    container.appendChild(renderer.domElement);
    // Создание контроллов для управления камерой
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;

    // Создание звездного неба
    createStarField();

    // // Создание освещения
    createLights();

    // // Создание солнца
    createSun();

    // // Создание планет
    createPlanets();

    // // Запуск анимации
    animate();

    // // Обработка изменения размера окна
    // window.addEventListener('resize', onWindowResize, false);
}

// Создание звездного неба
function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 2000;
        starPositions[i + 1] = (Math.random() - 0.5) * 2000;
        starPositions[i + 2] = (Math.random() - 0.5) * 2000;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 'white',
        size: 2,
        sizeAttenuation: false
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

// Создание освещения
function createLights() {
    // Основной свет от солнца
    const sunLight = new THREE.PointLight("white", 1.5, 500);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Увеличиваем окружающий свет для лучшей видимости планет
    const ambientLight = new THREE.AmbientLight("yellow", 0.6);
    scene.add(ambientLight);

    // Добавляем дополнительный направленный свет
    const directionalLight = new THREE.DirectionalLight("white", 0.3);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    // Добавляем еще один направленный свет с другой стороны
    const directionalLight2 = new THREE.DirectionalLight("white", 0.2);
    directionalLight2.position.set(-50, -50, -50);
    scene.add(directionalLight2);
}

// Создание солнца
function createSun() {
    const sunGeometry = new THREE.SphereGeometry(8, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: "rgb(255, 231, 48)",
        emissive: 0xffd700,
        emissiveIntensity: 0.5
    });

    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
}

// Создание планет
function createPlanets() {
    // Данные о планетах: [название, цвет, размер, расстояние от солнца, скорость орбиты, скорость вращения]
    const planetConfigs = [
        ['Меркурий', 0x8c7853, 1.5, 15, 0.02, 0.01],
        ['Венера', 0xffc649, 2, 20, 0.015, 0.008],
        ['Земля', 0x6b93d6, 2.2, 25, 0.012, 0.01],
        ['Марс', 0xcd5c5c, 1.8, 30, 0.01, 0.009],
        ['Юпитер', 0xd8ca9d, 5, 45, 0.008, 0.02],
        ['Сатурн', 0xfad5a5, 4.5, 60, 0.006, 0.018],
        ['Уран', 0x4fd0e7, 3, 75, 0.004, 0.012],
        ['Нептун', 0x4b70dd, 2.8, 90, 0.003, 0.011]
    ];

    planetConfigs.forEach((config, index) => {
        const [name, color, size, distance, orbitSpeed, rotationSpeed] = config;

        // Создание планеты
        const planetGeometry = new THREE.SphereGeometry(size, 32, 32);
        const planetMaterial = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 30,
            specular: 0x111111
        });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);

        planet.castShadow = true;
        planet.receiveShadow = true;

        // Начальная позиция
        planet.position.x = distance;
        planet.position.z = 0;

        scene.add(planet);
        planets.push(planet);

        // Сохранение данных о планете
        planetData.push({
            mesh: planet,
            distance: distance,
            orbitSpeed: orbitSpeed,
            rotationSpeed: rotationSpeed,
            angle: Math.random() * Math.PI * 2 // Случайная начальная позиция на орбите
        });

        // Создание орбиты (визуализация)
        createOrbit(distance);
    });
}

// Создание орбиты
function createOrbit(radius) {
    const orbitGeometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: "white",
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });

    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
}

// Анимация
function animate() {
    requestAnimationFrame(animate);

    // Вращение солнца
    if (sun) {
        sun.rotation.y += 0.005;
    }

    // Движение планет
    planetData.forEach(planet => {
        // Орбитальное движение
        planet.angle += planet.orbitSpeed;
        planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
        planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;

        // Собственное вращение
        planet.mesh.rotation.y += planet.rotationSpeed;
    });

    // Обновление контроллов
    if (controls) {
        controls.update();
    }

    // Рендеринг
    renderer.render(scene, camera);
}

// Обработка изменения размера окна
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Запуск приложения после загрузки DOM
// document.addEventListener('DOMContentLoaded', function () {
//     init();
// });
init()
