import * as THREE from "three";
import * as MINDAR from "mindar";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";


document.addEventListener("DOMContentLoaded", () => {
	const start = async() => {
		const mindarThree = new MINDAR.MindARThree({
			container: document.body,
			uiLoading: "yes", 
			uiScanning: "yes", 
			uiError: "no"
      		});

		const {renderer, scene, camera} = mindarThree;

		const anchor_eyes = mindarThree.addAnchor(6); //перенісся
		const anchor_hairs = mindarThree.addAnchor(10);   //маківка


		var light = new THREE.HemisphereLight(0xffffff, 0xdddddd, 2.5);
		scene.add(light);

		const loader = new GLTFLoader();

		let cat_model = false, dog_model = false, cat_mixer = false, dog_mixer = false, glasses_model = false;

		loader.load(
			// resource URL
			'assets/cartoon_dog.glb',
			// called when the resource is loaded
			function ( model ) {
				console.log("Модель собаки завантажено", model);
				anchor_hairs.group.add( model.scene );
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
				gltf.asset; // Object
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
			'assets/toon_cat_free.glb',
			// called when the resource is loaded
			function ( model ) {
				console.log("Модель кота завантажено", model);
				anchor_hairs.group.add( model.scene );
				cat_model = model;
				cat_model.scene.scale.set(0.002, 0.002, 0.002);
				cat_model.scene.position.set(0, 0.2, 0);
				cat_model.scene.rotation.y += -5*Math.PI/180;

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


		loader.load(
			// resource URL
			'assets/doflamingo_glasses.glb',
			// called when the resource is loaded
			function ( model ) {
				console.log("Модель glasses завантажено", model);
				anchor_eyes.group.add( model.scene );
				glasses_model = model;
				glasses_model.scene.scale.set(0.18, 0.18, 0.18);
				glasses_model.scene.position.set(0, 0.2, 0);
				glasses_model.scene.rotation.y += 90*Math.PI/180;
				glasses_model.scene.rotation.x += -30*Math.PI/180;
			},
			// called while loading is progressing
			function ( xhr ) {
				console.log( ( xhr.loaded / xhr.total * 100 ) + '% моделі glasses завантажено' );
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'Помилка завантаження моделі glasses' );
			}
		);


		const faceMesh = mindarThree.addFaceMesh();

		//faceMesh.material.wireframe = true;
		//faceMesh.material.map = new THREE.TextureLoader().load('assets/ab_transp.png' );
		faceMesh.material.map = new THREE.TextureLoader().load('assets/Face_Mask_Template.png' );
		faceMesh.material.transparent = true;

		scene.add(faceMesh);

		const clock = new THREE.Clock();

		await mindarThree.start();

		mindarThree.video.style.visibility = "hidden";
		//console.log(mindarThree.video.style.visibility);

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
