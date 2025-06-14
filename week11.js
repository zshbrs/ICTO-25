import * as THREE from "three";
import * as MINDAR from "mindar";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

document.addEventListener("DOMContentLoaded", () => {
	const start = async () => {
		const mindarThree = new MINDAR.MindARThree({
			container: document.body,
			uiLoading: "yes",
			uiScanning: "yes",
			uiError: "no"
		});

		const { renderer, scene, camera } = mindarThree;

		const anchor_eyes = mindarThree.addAnchor(6); // перенісся

		const light = new THREE.HemisphereLight(0xffffff, 0xdddddd, 2.5);
		scene.add(light);

		const loader = new GLTFLoader();

		// Завантаження лише окулярів
		loader.load('assets/doflamingo_glasses.glb', model => {
			console.log("Модель glasses завантажено", model);
			anchor_eyes.group.add(model.scene);
			model.scene.scale.set(0.18, 0.18, 0.18);
			model.scene.position.set(0, 0.2, 0);
			model.scene.rotation.y += 90 * Math.PI / 180;
			model.scene.rotation.x += -30 * Math.PI / 180;
		}, undefined, error => {
			console.log('Помилка завантаження моделі glasses', error);
		});

		// FaceMesh з маскою
		const faceMesh = mindarThree.addFaceMesh();
		faceMesh.material.map = new THREE.TextureLoader().load('assets/Face_Mask_Template.png');
		faceMesh.material.transparent = true;
		scene.add(faceMesh);

		await mindarThree.start();

		// Показати відео фоном
		mindarThree.video.setAttribute("id", "mindar-video");

		renderer.setAnimationLoop(() => {
			renderer.render(scene, camera);
		});
	};

	start();
});

