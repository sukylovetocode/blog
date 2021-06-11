## ❗ 开发 THREE.JS 应该注意的

- **MeshBasicMaterial** 是唯一一个不需要光都能看到的材质，如果你遇到了 BUG，可以考虑将物体都使用该材质来帮助你找到问题
- 你的物体真的在摄像机可视范围中嘛?设置的足够远看看我们是否能看到这个物体

```jsx
camera.far = 100000;
camera.updateProjectionMatrix();
```

- 尽可能不要在循环中制造物体，可以只制作一个物体然后通过移动位置来达到类似的效果
- 永远用 BufferGeometry 性能更好
- 为了更接近我们真实的感官颜色 我们最好对 renderer 处理

```jsx
renderer.gammaFactor = 2.2;
renderer.outputEncoding = THREE.sRGBEncoding;
```

对物体的颜色

```jsx
const color = new Color(0x800080);
color.convertSRGBToLinear();

//OR

const material = new MeshBasicMaterial({ color: 0x800080 });
material.color.convertSRGBToLinear();
```

对材质

```jsx
import { sRGBEncoding } from "./vendor/three/build/three.module.js";

const colorMap = new TextureLoader().load("colorMap.jpg");
colorMap.encoding = sRGBEncoding;
```

- Draco 在 GLTF 格式文件中是最为节省性能的，模型尽可能使用 GLTF
- 如果你有一堆物体需要设置是否可见，可以考虑使用分层 ，这样会使我们的性能更好

[three.js](https://threejs.org/docs/#api/en/core/Layers)

- 不能把物体设置在同一个位置，这样会导致穿模（z-fighting）最起码要设置 0.0001 的距离避免
- 永远不要移动你的场景 Scene
- 不要使用 `preserveDrawingBuffer` `alpha buffer` `stencil buffer` `depth buffer` 除非你真的需要
- 如果你使用了 `OrbitControls` 我们可以通过设置事件让我们屏幕只有移动了摄像机才会重新渲染

```jsx
OrbitControls.addEventListener("change", () => renderer.render(scene, camera));
```

- 不要禁止抗锯齿然后使用预处理的 AA 处理，这性能会消耗更大
- 灯光是消耗性能的，尽可能少用
- 使用 `renderer.physicallyCorrectLights` 修正灯光位置
- 如果你想删除或者添加灯光 不要直接删除物体，可以通过 `light.visible = false` `light.intensiy = 0` 达到类似的效果 增强性能
- 点光源渲染的阴影消耗最大 我们可以通过 `CameraHelper` 来展示他
- 如果你使用 `morph targets` 记得要设置 `morghTargets = true` 否则这将不会生效
- 材质尺寸要求是双数的，而且应该尽可能的小
- PNG 或者 JPG 样式的材质到内存中消耗的一致
- 尽量不销毁物体，使用 `object.visible = false` `material.opacity = 0` 来代替他
- 透明物体消耗性能，尽可能不使用
- 设置 `object.matrixAutoUpdate = false` 且当他们位置角度等变化时才调用 `object.updateMatrix()` 更新
- 使用 `geometry instance` 当你有许多类似物体要创建时
- 通过烘焙阴影去避免使用灯光
- `LOD (Level Of Detail) object` 适用于我们物体有远近层次关系 这样他们可能会几帧才更新一次

[The Big List of three.js Tips and Tricks! | Discover three.js](https://discoverthreejs.com/tips-and-tricks/)
