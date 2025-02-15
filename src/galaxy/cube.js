import * as THREE from 'three';

export default class Cube {
    constructor(position = new THREE.Vector3(), rotation = new THREE.Quaternion()) {
        this.position = position;
        this.rotation = rotation;
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.dt = 0.016;
        this.damping = 0.99;
        this.size = 0.2;
        this.epsilon = 0.1;

        this.geometry = new THREE.BoxGeometry(this.size ,this.size , this.size );
        this.material = new THREE.MeshStandardMaterial( { color: 0xffffff , roughness: 0.5, metalness: 0.5 } );
        this.mesh = new THREE.Mesh(this.geometry);
        this.mesh.material = this.material;
        this.mesh.position.copy(this.position);
    }

    noisePerlin(noise,x,y,z){
        noise.frequency = 1;
        noise.amplitude = 1;
        noise.persistence = 2;
        noise.lacunarity = 2;

        let total = 0;

        for(let i = 0; i < 3; i++) {

            total += noise.perlin3D(x * noise.frequency, y * noise.frequency, z * noise.frequency) * noise.amplitude;

            noise.amplitude *= noise.persistence;
            noise.frequency *= noise.lacunarity;
        }

        return total + 2;
    }

    process(vortex, noise) {

        const particlePosition = this.position
        const distanceVector = particlePosition.clone().sub(vortex.position);
        const distance = distanceVector.length();

        if (distance < vortex.radius) {
            // Calculate gravitational force
            const force = (vortex.G * this.noisePerlin(noise, this.position.x, this.position.y, this.position.z)) / (distance * distance);
            const acceleration = force * this.dt;

            // Update velocities for orbit
            const perpVector = distanceVector.clone().cross(vortex.perpVector);
            this.velocity.x += perpVector.x * acceleration - distanceVector.x * acceleration * 0.5;
            this.velocity.y += perpVector.y * acceleration - distanceVector.y * acceleration * 0.5;
            this.velocity.z += perpVector.z * acceleration - distanceVector.z * acceleration * 0.5;
        }

        // Apply velocity
        this.position.x += this.velocity.x * this.dt;
        this.position.y += this.velocity.y * this.dt;
        this.position.z += this.velocity.z * this.dt;

        // Apply damping
        this.velocity.x *= this.damping;
        this.velocity.y *= this.damping;
        this.velocity.z *= this.damping;

        this.mesh.position.copy(this.position);
        this.mesh.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), this.velocity.clone().normalize()));
    }

    processParticle(vortex) {
        let force = new THREE.Vector3();

        force.add(vortex.computeAttractorForce(this));

        force.add(vortex.computeForceField(this));

        this.velocity.add(force.multiplyScalar(this.dt));
        this.position.add(this.velocity.clone().multiplyScalar(this.dt));

        this.velocity.multiplyScalar(this.damping);

        this.mesh.position.copy(this.position);
    }
}
