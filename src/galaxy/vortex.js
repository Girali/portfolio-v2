import * as THREE from "three";
import * as GSAP from "gsap";

export default class Vortex {
    constructor(position = new THREE.Vector3(), radius = 50.0, perpVector = new THREE.Vector3(0, 0, 1), color = 0xff9913) {
        this.position = position;
        this.G = radius / 2;
        this.maxDistance = 80;
        this.radius = radius;
        this.perpVector = perpVector.normalize();
        this.color = color;

        this.epsilon = 0.1;

        this.geometry = new THREE.SphereGeometry(1);
        this.material = new THREE.MeshStandardMaterial( { color: 0xffffff  , emissive: this.color, emissiveIntensity: 3}); //
        this.mesh = new THREE.Mesh(this.geometry);
        this.mesh.material = this.material;
        this.mesh.position.copy(this.position);
        this.mesh.scale.copy(new THREE.Vector3(1,1,1).multiplyScalar(radius / 50.0));
        this.pointLight = new THREE.PointLight( this.color, 1000 );
        this.pointLight.position.copy(this.position);
    }

    updateVortex_internal(position, color, radius, perpVector) {
        this.color = color;
        this.material.emissive.set( color );
        this.radius = radius;
        this.G = radius / 2;
        this.perpVector = perpVector.normalize();
        this.mesh.scale.copy(new THREE.Vector3(1,1,1).multiplyScalar(radius / 50.0));
        this.pointLight.color.set( color );
        this.position = position;
        this.mesh.position.copy(this.position);
    }

    updateVortex(position, color, radius, perpVector, duration) {
        let tempPos = this.position.clone();
        let tempDir = this.perpVector.clone();
        let tempColor = new THREE.Color(this.color);
        let targetColor = new THREE.Color(color);
        let tempSize = { value: this.radius };

        GSAP.gsap.to(tempPos, {
            x: position.x,
            y: position.y,
            z: position.z,
            duration: duration,
            ease: "power2.inOut",
            onUpdate: () => this.updateVortex_internal(tempPos, tempColor.getHex(), tempSize.value, tempDir)
        });

        GSAP.gsap.to(tempDir, {
            x: perpVector.x,
            y: perpVector.y,
            z: perpVector.z,
            duration: duration,
            ease: "power2.inOut",
            onUpdate: () => this.updateVortex_internal(tempPos, tempColor.getHex(), tempSize.value, tempDir)
        });

        GSAP.gsap.to(tempColor, {
            r: targetColor.r,
            g: targetColor.g,
            b: targetColor.b,
            duration: duration,
            ease: "power2.inOut",
            onUpdate: () => this.updateVortex_internal(tempPos, tempColor.getHex(), tempSize.value, tempDir)
        });

        GSAP.gsap.to(tempSize, {
            value: radius,
            duration: duration,
            ease: "power2.inOut",
            onUpdate: () => this.updateVortex_internal(tempPos, tempColor.getHex(), tempSize.value, tempDir)
        });
    }

    computeAttractorForce(particle) {
        const direction = this.position.clone().sub(particle.position);
        const distance = direction.length() + this.epsilon;
        const normalizedDirection = direction.clone().divideScalar(distance);

        const forceMagnitude = this.G / (distance * distance);
        return normalizedDirection.clone().multiplyScalar(forceMagnitude);
    }

    computeVortexForce(particle) {
        const perpendicular = particle.velocity.clone().cross(new THREE.Vector3(0,0,1));  //# Rotate around Z-axis
        return perpendicular.clone().multiplyScalar(this.G);
    }

    computeForceField(particle) {
        const noiseForce = new THREE.Vector3(1,1,1).multiplyScalar(this.G); //sampleNoise(particle.position) * noiseStrength;
        const vortexForce = this.computeVortexForce(particle);
        return noiseForce.clone().add(vortexForce);
    }
}
