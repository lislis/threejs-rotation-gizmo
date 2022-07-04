import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

class RayysMouse {
  constructor(renderer, camera, controls) {
    this.renderer = renderer;
    this.camera = camera;
    this.controls = controls;

    this.mouse = new THREE.Vector2();
    this.rawCoords = new THREE.Vector2();

    this.cb = {}
    this.cb.onMouseDown = [];
    this.cb.onMouseUp = [];
    this.cb.onMouseMove = [];

    var onMouseDown = function(event) {
      if (this.controls) {
        this.controls.enablePan = false;
        this.controls.enableRotate = false;
      }

      this.prevMouse = this.mouse.clone();
      this.updateMouseCoords(event, this.mouse);
      this.mouseDown = this.mouse.clone();
      this.rawMouseDown = this.rawCoords.clone();

      // notify subscribers
      for (var i = 0; i < this.cb.onMouseDown.length; i++) {
        this.cb.onMouseDown[i](this.mouse, event, this);
      }
    };

    var onMouseUp = function(event) {
      this.prevMouse = this.mouse.clone();
      this.updateMouseCoords(event);
      this.mouseDown = undefined;
      this.rawMouseDown = undefined;

      if (this.controls) {
        this.controls.enablePan = false;
        this.controls.enableRotate = false;
      }

      for (var i = 0; i < this.cb.onMouseUp.length; i++) {
        this.cb.onMouseUp[i](this.mouse, event, this);
      }
    };

    var onMouseMove = function(event) {
      this.prevMouse = this.mouse.clone();
      this.updateMouseCoords(event);
      if (!this.prevMouse.equals(this.mouse)) {
        for (var i = 0; i < this.cb.onMouseMove.length; i++) {
          this.cb.onMouseMove[i](this.mouse, event, this);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove.bind(this), false);
    renderer.domElement.addEventListener('mousedown', onMouseDown.bind(this), false);
    renderer.domElement.addEventListener('mouseup', onMouseUp.bind(this), false);
  }

  updateMouseCoords(event) {
    this.rawCoords.x = (event.clientX - this.renderer.domElement.offsetLeft) - this.renderer.domElement.offsetWidth / 2;
    this.rawCoords.y = -(event.clientY - this.renderer.domElement.offsetTop + 0.5) + this.renderer.domElement.offsetHeight / 2;
    this.mouse.x = ((event.clientX - this.renderer.domElement.offsetLeft + 0.5) / this.renderer.domElement.offsetWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - this.renderer.domElement.offsetTop + 0.5) / this.renderer.domElement.offsetHeight) * 2 + 1;
  }

  subscribe(mouseDownHandler, mouseMoveHandler, mouseUpHandler) {
    this.cb.onMouseDown.push(mouseDownHandler);
    this.cb.onMouseMove.push(mouseMoveHandler);
    this.cb.onMouseUp.push(mouseUpHandler);
  }

} // end of RayysMouse

class RayysRotationGizmo {
  init(radius = 1) {
    this.radius = radius;
    this.origin = new THREE.Vector3(0, 0, 0);
    this.gizmo = new THREE.Object3D();
    this.gizmo.renderOrder = 0;
    this.gizmo.scale.set(2,2,2)

    var geometry = new THREE.SphereBufferGeometry(this.radius - 1e-2, 32, 32);
    var material = new THREE.MeshBasicMaterial({
      //color: 0x00000,
      //transparent: true,
      //opacity: 0.0,
      depthTest: true,
      colorWrite: false,
    });
    var sphere = new THREE.Mesh(geometry, material);
    sphere.renderOrder = 9999;
    // sphere.layers.set(2);
    this.gizmo.add(sphere);

    var gizmoCircles = []; // sphere

    // X-plane curve
    var curve = new THREE.EllipseCurve(
      0, 0, // ax, aY
      this.radius, this.radius, // xRadius, yRadius
      0, 2 * Math.PI, // aStartAngle, aEndAngle
      false, // aClockwise
      0 // aRotation
    );

    var points = curve.getPoints(90);
    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var material = new THREE.LineBasicMaterial({
      color: 0xff0000
    });
    var ellipseX = new THREE.Line(geometry, material);
    //debugger
    gizmoCircles.push(ellipseX);
    ellipseX.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    //ellipseX.layers.set(1);
    ellipseX.renderOrder = 9999;
    this.gizmo.add(ellipseX);

    // Y-plane curve
    var curve = new THREE.EllipseCurve(
      0, 0, // ax, aY
      this.radius, this.radius, // xRadius, yRadius
      0, 2 * Math.PI, // aStartAngle, aEndAngle
      false, // aClockwise
      0 // aRotation
    );

    var points = curve.getPoints(90);
    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var material = new THREE.LineBasicMaterial({
      color: 0x00ff00
    });
    var ellipseY = new THREE.Line(geometry, material);
    gizmoCircles.push(ellipseY);
    //ellipseY.layers.set(1);
    ellipseY.renderOrder = 9999;
    this.gizmo.add(ellipseY);

    // Z-plane curve
    var curve = new THREE.EllipseCurve(
      0, 0, // ax, aY
      radius, radius, // xRadius, yRadius
      0, 2 * Math.PI, // aStartAngle, aEndAngle
      false, // aClockwise
      0 // aRotation
    );

    var points = curve.getPoints(90);
    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });
    var ellipseZ = new THREE.Line(geometry, material);
    gizmoCircles.push(ellipseZ);
    ellipseZ.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2));
    //ellipseZ.layers.set(1);
    ellipseZ.renderOrder = 9999;
    this.gizmo.add(ellipseZ);

    var geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3(0, 0, 0));
    geom.vertices.push(new THREE.Vector3(0, 1, 0));
    geom.vertices.push(new THREE.Vector3(0, 0, 0));
    geom.vertices.push(new THREE.Vector3(0, 1, 0));
    var startSeg = new THREE.LineSegments(geom, new THREE.LineBasicMaterial({
      color: 0x000000
    }));
    startSeg.name = "startSeg";
    // gizmo.add(startSeg);

    var points_geom = new THREE.Geometry();
    points_geom.vertices.push(new THREE.Vector3(0, 0, 0));
    points_geom.vertices.push(new THREE.Vector3(0, 0, 0));
    var points = new THREE.Points(points_geom, new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.15
    }));
    // scene.add(points);

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshPhongMaterial({
      color: 0x00ff00
    });
    var cube = new THREE.Mesh(geometry, material);
    cube.applyMatrix(new THREE.Matrix4().makeTranslation(0, 1, 0));
    cube.matrixAutoUpdate = false;
    scene.add(cube);

    //angle arc
    var makeGizmoArc = function(from, to, isClockwise) {
      let curve = new THREE.EllipseCurve(
        0, 0, // ax, aY
        radius + 1e-1, radius + 1e-1, // xRadius, yRadius
        from, to, // aStartAngle, aEndAngle
        isClockwise, // aClockwise
        0 // aRotation
      );

      let points = curve.getPoints(50);
      let geometry = new THREE.BufferGeometry().setFromPoints(points);
      let material = new THREE.LineBasicMaterial({
        color: 0xff00ff
      });

      // Create the final object to add to the scene
      let ellipse = new THREE.Line(geometry, material);
      return ellipse;
    }
    // ==angle arc
    var gizmoArc;

    this.gizmo.applyMatrix(new THREE.Matrix4().makeTranslation(0, 1, 0));
    // gizmo.matrixAutoUpdate = false;
    // scene.add(this.gizmo);

    this.plane = new THREE.Plane(new THREE.Vector3(1, 1, 0.2), 8);
    // var helper = new THREE.PlaneHelper(plane, 8, 0xffff00);
    // scene.add( helper );

    var translationPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    translationPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), this.gizmo.position);
    var translationPlaneHelper = new THREE.PlaneHelper(this.translationPlane, 10, 0xff0000);
    // scene.add(translationPlaneHelper);
    var zeroAngleDir = new THREE.Vector3(1, 0, 0);

    var pickCircle = function(pos) {
      raycaster.setFromCamera(pos, camera);

      // cancel gizmo highlighing
      for (let i = 0; i < gizmoCircles.length; i++) {
        let line = gizmoCircles[i];
        if (line.material.prevColor) {
          line.material.color.copy(line.material.prevColor);
          line.material.needsUpdate = true;
          delete line.material.prevColor;
        }
      }

      raycaster.linePrecision = 0.15;

      var intersects = raycaster.intersectObjects(gizmoCircles);
      if (intersects.length > 0) {
        let line = intersects[0].object;
        if (!line.material.prevColor) {
          line.material.prevColor = line.material.color.clone();
          line.material.color.setHex(0xffff00);
          line.material.needsUpdate = true;

          if (line === ellipseX) {
            zeroAngleDir.set(1, 0, 0);
            translationPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), this.gizmo.position);
          } else if (line === ellipseY) {
            zeroAngleDir.set(1, 0, 0);
            translationPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), this.gizmo.position);
          } else if (line === ellipseZ) {
            zeroAngleDir.set(0, 0, -1);
            translationPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(1, 0, 0), this.gizmo.position);
          }

          controls.enabled = false;
          return intersects[0].point;
        }
      } else {
        controls.enabled = true;
        return undefined;
      }
    }.bind(this)

    var getPick = function(pos) {
      raycaster.setFromCamera(pos, camera);
      let target = new THREE.Vector3();
      raycaster.ray.intersectPlane(translationPlane, target);
      return target;
    }

    var getAngle = function(v, zeroDir, normal) {
      let angle = Math.acos(zeroDir.dot(v));

      let adir = zeroDir.clone().cross(v).normalize().sub(normal);
      if (adir.lengthSq() > 1e-3) {
        angle = 2 * Math.PI - angle;
      }

      return angle;
    }

    var pickPoint0;
    var pickPoint1;

    var startAngle;
    var prevAngle;
    var endAngle;
    var totalRotation;

    var turnCount = 0;

    var mouse = new RayysMouse(renderer, camera);
    var raycaster = new THREE.Raycaster();
    mouse.subscribe(
      function(pos) {
        // console.log(`Mouse down at: ${JSON.stringify(pos)}`);

        pickPoint0 = pickCircle(pos);
        if (pickPoint0) {

          points.geometry.vertices[0].copy(pickPoint0);
          points.geometry.verticesNeedUpdate = true;

          startSeg.geometry.vertices[1].copy(pickPoint0.clone().sub(this.gizmo.position));
          startSeg.geometry.verticesNeedUpdate = true;

          let v = pickPoint0.clone().sub(this.gizmo.position).normalize();
          startAngle = getAngle(v, zeroAngleDir, translationPlane.normal);
          endAngle = startAngle;
          prevAngle = startAngle;
          totalRotation = 0.0;
          turnCount = 0;

          // console.log(startAngle);
        }
      }.bind(this),
      function(pos, event, sender) {
        // console.log(`Mouse moved to: ${JSON.stringify(pos)}`);
        if (!sender.mouseDown) {
          pickCircle(pos);
        } else if (pickPoint0 !== undefined) {
          pickPoint1 = getPick(pos);

          points.geometry.vertices[1].copy(pickPoint1);
          points.geometry.verticesNeedUpdate = true;

          startSeg.geometry.vertices[3].copy(pickPoint1.clone().sub(this.gizmo.position));
          startSeg.geometry.verticesNeedUpdate = true;

          let v = pickPoint1.clone().sub(this.gizmo.position).normalize();
          prevAngle = endAngle;
          endAngle = getAngle(v, zeroAngleDir, translationPlane.normal);

          let angleIncrement = (endAngle - prevAngle);

          if (angleIncrement < -Math.PI) {
            angleIncrement += 2 * Math.PI;
            turnCount++;
          }

          if (angleIncrement > Math.PI) {
            angleIncrement -= 2 * Math.PI;
            turnCount--;
          }

          totalRotation += angleIncrement;
          // console.log(`turnCount=${turnCount}, rotation=${totalRotation}`);

          if (gizmoArc) {
            this.gizmo.remove(gizmoArc);
          }
          if (Math.abs(totalRotation) < 2 * Math.PI) {
            gizmoArc = makeGizmoArc(startAngle, endAngle, totalRotation < 0);
          } else {
            gizmoArc = makeGizmoArc(0, 2 * Math.PI, false);
          }
          gizmoArc.lookAt(translationPlane.normal);
          this.gizmo.add(gizmoArc);

          let position = new THREE.Vector3();
          let quaternion = new THREE.Quaternion();
          let scale = new THREE.Vector3();
          cube.matrix.decompose(position, quaternion, scale);

          let dquat = new THREE.Quaternion();
          dquat.setFromAxisAngle(translationPlane.normal, angleIncrement);
          quaternion.premultiply(dquat);
          cube.matrix.compose(position, quaternion, scale);
        }
      }.bind(this),
      function(pos) {
        // console.log(`Mouse up at: ${JSON.stringify(pos)}`);
        if (gizmoArc) {
          this.gizmo.remove(gizmoArc);
        }
      }.bind(this),
    );

    return this.gizmo;
  }

  render(renderer, scene, camera) {
    var dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    this.plane.setFromNormalAndCoplanarPoint(dir, this.origin);

    var dist = this.plane.distanceToPoint(camera.position);
    var f = Math.abs(dist) / 10;

    var gposition = new THREE.Vector3();
    var gquaternion = new THREE.Quaternion();
    var gscale = new THREE.Vector3();

    this.gizmo.matrix.decompose(gposition, gquaternion, gscale);
    this.gizmo.matrix.identity();
    this.gizmo.matrix.compose(gposition, gquaternion, new THREE.Vector3(f, f, f));

    //renderer.autoClearColor = false;
    //renderer.autoClearDepth = false;
    //this.gizmo.render();

    //renderer.autoClearColor = true;
    //renderer.autoClearDepth = true;

    /* camera.layers.set(0);
       renderer.render(scene, camera);

       camera.layers.set(2);
       renderer.render(scene, camera);
       renderer.autoClearColor = false;
       renderer.autoClearDepth = false;

       camera.layers.set(1);
       renderer.render(scene, camera);
       renderer.autoClearDepth = true;
       renderer.autoClearColor = true; */
  }
}

var renderer;
var controls;

var scene = new THREE.Scene();
var width = window.innerWidth;
var height = window.innerHeight;
var aspect = width / height;
var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.sortObjects = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(new THREE.Color(0x303030));
document.body.appendChild(renderer.domElement);

camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 5;
camera.lookAt(0, 0, 0);

controls = new OrbitControls(camera, renderer.domElement);

// white spotlight shining from the side, casting a shadow
var spotLight = new THREE.SpotLight(0xffffff, 2.5, 25, Math.PI / 6);
spotLight.position.set(4, 10, 1);
scene.add(spotLight);

// grid
var size = 10;
var divisions = 10;
var gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

var gizmo = new RayysRotationGizmo();
scene.add(gizmo.init());

var animate = function() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

animate();
