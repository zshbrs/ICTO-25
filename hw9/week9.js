import * as THREE from "three";
import * as MINDAR from "mindar";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";


document.addEventListener("DOMContentLoaded", () => {
	const start = async() => {
		const mindarThree = new MINDAR.MindARThree({
			container: document.body,
			imageTargetSrc: "images/catdog.mind",
			maxTrack: 2,
			uiLoading: "yes", 
			uiScanning: "yes", 
			uiError: "no"
      		});

		const {renderer, scene, camera} = mindarThree;
		const anchor_cat = mindarThree.addAnchor(0);
		const anchor_dog = mindarThree.addAnchor(1);

		const video = document.getElementById("catdogvideo");
		const texture = new THREE.VideoTexture(video);

		const geometry = new THREE.PlaneGeometry(1, 720/1280);
		const material = new THREE.MeshBasicMaterial({map: texture});
		const plane = new THREE.Mesh(geometry, material);

		anchor_cat.group.add(plane); // до першого довільне відео

		anchor_cat.onTargetFound = () => {
			video.play();
		}

		anchor_cat.onTargetLost = () => {
			video.pause();
		}

		var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
		scene.add(light);

		const loader = new GLTFLoader();

		let cat_model = false, dog_model = false, cat_mixer = false, dog_mixer = false;

		loader.load(
			// resource URL
			'images/cartoon_dog.glb',
			// called when the resource is loaded
			function ( model ) {
				console.log("Модель собаки завантажено", model);
				anchor_dog.group.add( model.scene );
				dog_model = model;
				dog_model.scene.scale.set(0.15, 0.15, 0.15);
				dog_model.scene.position.set(-1, 0, 0);

				dog_mixer = new THREE.AnimationMixer(dog_model.scene);

				for(let i=0; i< dog_model.animations.length; i++) 
				{
					const action = dog_mixer.clipAction(dog_model.animations[i]);
					action.play();
				}
/*
				gltf.animations; // Array<THREE.AnimationClip>
				gltf.scene; // THREE.Group
				gltf.scenes; // Array<THREE.Group>
				gltf.cameras; // Array<THREE.Camera>
				gltf.images; // Object
*/
			},
			// called while loading is progressing
			function ( xhr ) {
				console.log( ( xhr.loaded / xhr.total * 100 ) + '% моделі собаки завантажено' );
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'Помилка завантаження моделі собаки' );
			}
		);

		loader.load(
			// resource URL
			'images/toon_cat_free.glb',
			// called when the resource is loaded
			function ( model ) {
				console.log("Модель кота завантажено", model);
				anchor_dog.group.add( model.scene );
				cat_model = model;
				cat_model.scene.scale.set(0.002, 0.002, 0.002);
				cat_model.scene.position.set(0.5, -0.5, 0);

				cat_mixer = new THREE.AnimationMixer(cat_model.scene);

				for(let i=0; i< cat_model.animations.length; i++) 
				{
					const action = cat_mixer.clipAction(cat_model.animations[i]);
					action.play();
				}
			},
			// called while loading is progressing
			function ( xhr ) {
				console.log( ( xhr.loaded / xhr.total * 100 ) + '% моделі кота завантажено' );
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'Помилка завантаження моделі кота' );
			}
		);


		const clock = new THREE.Clock();

		await mindarThree.start();

		renderer.setAnimationLoop(() => {
			const delta = clock.getDelta();
			if(cat_mixer)
				cat_mixer.update(delta);
			if(dog_mixer)
				dog_mixer.update(delta);
			if(dog_model)
				dog_model.scene.rotation.y += delta;
		  	renderer.render(scene, camera);
		});
	}
	start();
});











