import * as THREE from 'three';

export class DayNightSystem {

    constructor(scene) {
        this.scene = scene;

        // 120 seconds = complete 24-hour cycle
        this.dayLength = 120;

        // Start at 08:00 (in minutes)
        this.timeOfDay = 8 * 60;

        this.sun = null;
        this.moon = null;

        this.sunLight = null;
        this.moonLight = null;

        this.ambientLight = null;
        this.hemiLight = null;

        this.sky = null;

        // Sky Color Targets for smooth transition
        this.nightSkyColor = new THREE.Color(0x050814);
        this.sunriseSkyColor = new THREE.Color(0xd87a4d);
        this.daySkyColor = new THREE.Color(0x6ba6d1);
        this.sunsetSkyColor = new THREE.Color(0xd16138);

        this.currentSkyColor = new THREE.Color();

        this.createSky();
        this.createSun();
        this.createMoon();
        this.createLighting();

        this.update(0);

        console.log("Day/Night System v1.1 OPTIMIZED");
    }

    createSky() {
        const geometry = new THREE.SphereGeometry(500, 32, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x87a9c4,
            side: THREE.BackSide
        });

        this.sky = new THREE.Mesh(geometry, material);
        this.scene.add(this.sky);
    }

    createSun() {
        const geometry = new THREE.SphereGeometry(8, 20, 20);
        const material = new THREE.MeshBasicMaterial({ color: 0xfff2b0 });

        this.sun = new THREE.Mesh(geometry, material);
        this.scene.add(this.sun);
    }

    createMoon() {
        const geometry = new THREE.SphereGeometry(5, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xdde7ff });

        this.moon = new THREE.Mesh(geometry, material);
        this.scene.add(this.moon);
    }

    createLighting() {
        this.sunLight = new THREE.DirectionalLight(0xfff1cf, 2.2);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 1;
        this.sunLight.shadow.camera.far = 700;

        this.scene.add(this.sunLight);

        this.moonLight = new THREE.DirectionalLight(0x9bb8ff, 0.25);
        this.scene.add(this.moonLight);

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
        this.scene.add(this.ambientLight);

        this.hemiLight = new THREE.HemisphereLight(0x9dc7ff, 0x34402f, 0.45);
        this.scene.add(this.hemiLight);
    }

    update(deltaTime) {
        if (!Number.isFinite(deltaTime)) {
            deltaTime = 0.016;
        }

        // Advance time
        this.timeOfDay += (1440 / this.dayLength) * deltaTime;

        if (this.timeOfDay >= 1440) {
            this.timeOfDay -= 1440;
        }

        const hour = this.timeOfDay / 60;

        // Sun orbit angle calculation
        const sunAngle = ((hour - 6) / 24) * Math.PI * 2;

        const sunX = Math.cos(sunAngle) * 300;
        const sunY = Math.sin(sunAngle) * 300;
        const sunZ = 100;

        this.sun.position.set(sunX, sunY, sunZ);
        this.sunLight.position.copy(this.sun.position);

        // Moon placement opposite to Sun
        this.moon.position.set(-sunX, -sunY, -sunZ);
        this.moonLight.position.copy(this.moon.position);

        // Smooth Daylight blending
        let daylight = Math.max(0, Math.sin(sunAngle));
        daylight = THREE.MathUtils.smoothstep(daylight, 0, 1);
        const night = 1 - daylight;

        // Visibilities
        this.sun.visible = daylight > 0.03;
        this.sunLight.intensity = 0.25 + daylight * 2.0;

        this.moon.visible = night > 0.15;
        this.moonLight.intensity = night * 0.45;

        // Ambient Light Dynamics
        this.ambientLight.intensity = 0.12 + daylight * 0.32;
        this.hemiLight.intensity = 0.18 + daylight * 0.40;

        // Interpolated Smooth Sky Transitions
        if (hour >= 5 && hour < 8) {
            // Sunrise Blend
            const factor = (hour - 5) / 3;
            this.currentSkyColor.copy(this.nightSkyColor).lerp(this.sunriseSkyColor, factor);
        } else if (hour >= 8 && hour < 17) {
            // Day Transition
            const factor = (hour - 8) / 9;
            this.currentSkyColor.copy(this.sunriseSkyColor).lerp(this.daySkyColor, factor);
        } else if (hour >= 17 && hour < 20) {
            // Sunset Blend
            const factor = (hour - 17) / 3;
            this.currentSkyColor.copy(this.daySkyColor).lerp(this.sunsetSkyColor, factor);
        } else {
            // Night Transition
            const factor = hour >= 20 ? (hour - 20) / 4 : (hour + 4) / 9;
            this.currentSkyColor.copy(this.sunsetSkyColor).lerp(this.nightSkyColor, factor);
        }

        this.sky.material.color.copy(this.currentSkyColor);
        this.scene.background = this.currentSkyColor.clone();

        // Update UI element if exists
        const timeVal = document.getElementById('time-val');
        if (timeVal) {
            timeVal.textContent = this.getFormattedTime();
        }
    }

    getTime() {
        const hours = Math.floor(this.timeOfDay / 60);
        const minutes = Math.floor(this.timeOfDay % 60);
        return { hours, minutes, totalMinutes: this.timeOfDay };
    }

    getFormattedTime() {
        const time = this.getTime();
        let hour = time.hours;
        const minute = String(time.minutes).padStart(2, "0");
        const suffix = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;

        return `${hour}:${minute} ${suffix}`;
    }

    isNight() {
        const hour = this.timeOfDay / 60;
        return hour < 6 || hour >= 19;
    }

    isDay() {
        return !this.isNight();
    }

    setTime(hours, minutes = 0) {
        hours = THREE.MathUtils.clamp(Number(hours) || 0, 0, 23);
        minutes = THREE.MathUtils.clamp(Number(minutes) || 0, 0, 59);
        this.timeOfDay = hours * 60 + minutes;
    }

    dispose() {
        if (this.sky) {
            this.sky.geometry.dispose();
            this.sky.material.dispose();
            this.scene.remove(this.sky);
        }
        if (this.sun) {
            this.sun.geometry.dispose();
            this.sun.material.dispose();
            this.scene.remove(this.sun);
        }
        if (this.moon) {
            this.moon.geometry.dispose();
            this.moon.material.dispose();
            this.scene.remove(this.moon);
        }
        if (this.sunLight) this.scene.remove(this.sunLight);
        if (this.moonLight) this.scene.remove(this.moonLight);
        if (this.ambientLight) this.scene.remove(this.ambientLight);
        if (this.hemiLight) this.scene.remove(this.hemiLight);
    }
}
