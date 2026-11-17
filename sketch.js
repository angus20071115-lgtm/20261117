
let characterSprite;       // 角色站立精靈圖
let walkSprite;            // 角色走路精靈圖
let magicSprite;           // 角色施法精靈圖
let magicEffectSprite;     // 魔法特效精靈圖
let bgSprite;              // 背景圖片

let characterX;            // 角色畫面水平位置
let characterWorldX;       // 角色在背景世界中的位置
let cameraX = 0;           // 背景攝影機位置
let bgWidth;               // 背景縮放後的寬度

let isWalking = false;
let facingDirection = 1;
let isCasting = false;
let magicStartFrame = 0;
let magicDirection = 1;
let spaceIsDown = false;

let activeEffects = [];

const frameCountInSprite = 10;
const frameWidth = 139.5;
const frameHeight = 196;

const walkFrameCount = 9;
const walkFrameWidth = 1246 / walkFrameCount;
const walkFrameHeight = 198;

const magicFrameCount = 4;
const magicFrameWidth = 1039 / magicFrameCount;
const magicFrameHeight = 146;

const effectFrameCount = 5;
const effectFrameWidth = 740 / effectFrameCount;
const effectFrameHeight = 19;

const framesPerStep = 8;

// 背景圖片數量
const bgCount = 3;


// =====================================
// 1. 載入圖片
// =====================================

function preload() {

  characterSprite = loadImage("1/stop/stop.png");

  walkSprite = loadImage("1/walk/walk.png");

  magicSprite = loadImage("1/magic/magic.png");

  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png");

  // 載入紫色魔法森林背景
  bgSprite = loadImage("bg/0.png");

}


// =====================================
// 2. 初始化畫布
// =====================================

function setup() {

  createCanvas(windowWidth, windowHeight);

  imageMode(CENTER);

  frameRate(60);

  // 計算背景圖片縮放後的寬度
  bgWidth = bgSprite.width * (height / bgSprite.height);

  // 背景世界總寬度
  const worldWidth = bgWidth * bgCount;

  // 初始攝影機位於第二張背景附近
  cameraX = constrain(
    bgWidth,
    0,
    max(0, worldWidth - width)
  );

  // 設定角色初始位置
  characterX = (width * 2) / 3;

  // 計算角色在背景世界中的位置
  characterWorldX = cameraX + characterX;

}


// =====================================
// 3. 每一個畫面更新
// =====================================

function draw() {

  // ===================================
  // A. 背景與角色移動控制
  // ===================================

  const movingRight = keyIsDown(RIGHT_ARROW);

  const movingLeft = keyIsDown(LEFT_ARROW);

  isWalking = movingRight || movingLeft;

  // 計算移動速度
  const movementStep = constrain(
    width * 0.004,
    2,
    8
  );

  // 計算角色縮放比例
  const characterScale = min(
    (height / 3) / frameHeight,
    ((width * 2) / 3) / frameWidth
  );

  const characterWidth = frameWidth * characterScale;

  const characterHeight = frameHeight * characterScale;

  // 背景世界總寬度
  const worldWidth = bgWidth * bgCount;

  // 攝影機能移動的最右側位置
  const maxCameraX = max(
    0,
    worldWidth - width
  );


  // ===================================
  // B. 按右方向鍵
  // ===================================

  if (movingRight) {

    facingDirection = 1;

    // 背景尚未到達最右側
    if (cameraX < maxCameraX) {

      // 計算背景剩餘可移動距離
      const scrollAmount = min(
        movementStep,
        maxCameraX - cameraX
      );

      // 背景向左移動的視覺效果
      cameraX += scrollAmount;

      // 角色在世界中的位置同步增加
      characterWorldX += scrollAmount;

    } else {

      // 背景已到最右側
      // 改由角色向右移動
      characterWorldX += movementStep;

    }

  }


  // ===================================
  // C. 按左方向鍵
  // ===================================

  else if (movingLeft) {

    facingDirection = -1;

    // 背景尚未到達最左側
    if (cameraX > 0) {

      // 計算背景剩餘可移動距離
      const scrollAmount = min(
        movementStep,
        cameraX
      );

      // 背景向右移動的視覺效果
      cameraX -= scrollAmount;

      // 角色在世界中的位置同步減少
      characterWorldX -= scrollAmount;

    } else {

      // 背景已到最左側
      // 改由角色向左移動
      characterWorldX -= movementStep;

    }

  }


  // ===================================
  // D. 限制角色移動範圍
  // ===================================

  characterWorldX = constrain(
    characterWorldX,
    characterWidth / 2,
    worldWidth - characterWidth / 2
  );

  // 換算角色在畫面上的位置
  characterX = characterWorldX - cameraX;


  // ===================================
  // E. 繪製背景圖片
  // ===================================

  background("#87CEEB");

  // 將同一張背景圖片繪製三次
  for (let i = 0; i < bgCount; i++) {

    // 每張背景的水平位置
    const bgX = i * bgWidth - cameraX;

    // 繪製背景
    image(
      bgSprite,
      bgX + bgWidth / 2,
      height / 2,
      bgWidth,
      height
    );

  }


  // ===================================
  // F. 判斷施法動畫是否完成
  // ===================================

  if (
    isCasting &&
    frameCount - magicStartFrame >=
    magicFrameCount * framesPerStep
  ) {

    isCasting = false;

    // 建立魔法飛行特效
    activeEffects.push({

      x: characterX +
        magicDirection * characterWidth / 2,

      y: height - characterHeight * 0.58,

      direction: magicDirection

    });

  }


  // ===================================
  // G. 選擇目前角色動畫
  // ===================================

  const activeSprite = isCasting
    ? magicSprite
    : isWalking
    ? walkSprite
    : characterSprite;

  const activeFrameCount = isCasting
    ? magicFrameCount
    : isWalking
    ? walkFrameCount
    : frameCountInSprite;

  const activeFrameWidth = isCasting
    ? magicFrameWidth
    : isWalking
    ? walkFrameWidth
    : frameWidth;

  const activeFrameHeight = isCasting
    ? magicFrameHeight
    : isWalking
    ? walkFrameHeight
    : frameHeight;


  // ===================================
  // H. 計算目前動畫影格
  // ===================================

  const elapsedMagicFrames = frameCount - magicStartFrame;

  const frameIndex = isCasting

    ? min(
        floor(elapsedMagicFrames / framesPerStep),
        magicFrameCount - 1
      )

    : floor(frameCount / framesPerStep) % activeFrameCount;

  const sourceX = frameIndex * activeFrameWidth;

  const activeWidth = activeFrameWidth * characterScale;

  const activeHeight = activeFrameHeight * characterScale;

  const characterY = height - activeHeight / 2;


  // ===================================
  // I. 繪製角色
  // ===================================

  push();

  translate(characterX, characterY);

  // 依照角色面向翻轉圖片
  scale(
    isCasting ? magicDirection : facingDirection,
    1
  );

  image(
    activeSprite,
    0,
    0,
    activeWidth,
    activeHeight,
    sourceX,
    0,
    activeFrameWidth,
    activeFrameHeight
  );

  pop();


  // ===================================
  // J. 魔法特效設定
  // ===================================

  const effectScale = characterScale;

  const effectWidth = effectFrameWidth * effectScale;

  const effectHeight = effectFrameHeight * effectScale;

  const effectSpeed = max(
    6,
    width * 0.008
  );


  // ===================================
  // K. 更新及繪製魔法特效
  // ===================================

  for (
    let effectIndex = activeEffects.length - 1;
    effectIndex >= 0;
    effectIndex--
  ) {

    const effect = activeEffects[effectIndex];

    // 更新特效飛行位置
    effect.x += effect.direction * effectSpeed;

    // 超出畫面時移除特效
    if (
      effect.x > width ||
      effect.x < 0
    ) {

      activeEffects.splice(effectIndex, 1);

      continue;

    }

    // 計算魔法特效動畫影格
    const effectFrameIndex =
      floor(frameCount / framesPerStep) % effectFrameCount;

    push();

    translate(effect.x, effect.y);

    scale(effect.direction, 1);

    image(
      magicEffectSprite,
      0,
      0,
      effectWidth,
      effectHeight,
      effectFrameIndex * effectFrameWidth,
      0,
      effectFrameWidth,
      effectFrameHeight
    );

    pop();

  }

}


// =====================================
// 4. 鍵盤按下事件
// =====================================

function keyPressed() {

  // 按下右方向鍵
  if (keyCode === RIGHT_ARROW) {

    isWalking = true;

    facingDirection = 1;

    return false;

  }

  // 按下左方向鍵
  if (keyCode === LEFT_ARROW) {

    isWalking = true;

    facingDirection = -1;

    return false;

  }

  // 按下空白鍵施法
  if (keyCode === 32) {

    if (!spaceIsDown && !isCasting) {

      isCasting = true;

      magicStartFrame = frameCount;

      magicDirection = facingDirection;

    }

    spaceIsDown = true;

    return false;

  }

}


// =====================================
// 5. 鍵盤放開事件
// =====================================

function keyReleased() {

  if (keyCode === 32) {

    spaceIsDown = false;

  }

}


// =====================================
// 6. 視窗尺寸改變
// =====================================

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);

  // 重新計算背景寬度
  bgWidth = bgSprite.width * (height / bgSprite.height);

  // 重新計算背景世界寬度
  const worldWidth = bgWidth * bgCount;

  // 計算攝影機最大位置
  const maxCameraX = max(
    0,
    worldWidth - width
  );

  // 限制攝影機位置
  cameraX = constrain(
    cameraX,
    0,
    maxCameraX
  );

  // 重新計算角色縮放比例
  const characterScale = min(
    (height / 3) / frameHeight,
    ((width * 2) / 3) / frameWidth
  );

  const characterWidth = frameWidth * characterScale;

  // 限制角色在背景世界範圍內
  characterWorldX = constrain(
    characterWorldX,
    characterWidth / 2,
    worldWidth - characterWidth / 2
  );

  // 更新角色畫面位置
  characterX = characterWorldX - cameraX;

}
