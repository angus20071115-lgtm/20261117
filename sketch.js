
let characterSprite; // 儲存角色一的精靈圖
let walkSprite; // 儲存角色一的走路精靈圖
let magicSprite; // 儲存角色一的施法精靈圖
let magicEffectSprite; // 儲存角色一的魔法特效精靈圖
let characterX; // 儲存角色一目前的水平中心位置
let isWalking = false; // 記錄角色是否已切換為走路動畫
let facingDirection = 1; // 記錄角色朝向（1 為右，-1 為左）
let isCasting = false; // 記錄角色是否正在播放施法動畫
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面計數
let magicDirection = 1; // 記錄施法時鎖定的方向
let spaceIsDown = false; // 記錄空白鍵是否已按住以避免重複觸發
let activeEffects = []; // 儲存目前畫面上飛行中的魔法特效

const frameCountInSprite = 10; // 設定精靈圖包含的影格數
const frameWidth = 139.5; // 設定每個影格的寬度
const frameHeight = 196; // 設定每個影格的高度

const walkFrameCount = 9; // 設定走路精靈圖包含的影格數
const walkFrameWidth = 1246 / walkFrameCount;
const walkFrameHeight = 198;

const magicFrameCount = 4; // 設定施法精靈圖包含的影格數
const magicFrameWidth = 1039 / magicFrameCount;
const magicFrameHeight = 146;

const effectFrameCount = 5; // 設定魔法特效精靈圖包含的影格數
const effectFrameWidth = 740 / effectFrameCount;
const effectFrameHeight = 19;

const framesPerStep = 8; // 設定動畫每隔幾個畫面更新一格

function preload() {
  characterSprite = loadImage("1/stop/stop.png");
  walkSprite = loadImage("1/walk/walk.png");
  magicSprite = loadImage("1/magic/magic.png");
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);

  characterX = (width * 2) / 3;

  frameRate(60);
}

function draw() {
  background("#87CEEB");

  const movingRight = keyIsDown(RIGHT_ARROW);
  const movingLeft = keyIsDown(LEFT_ARROW);

  isWalking = movingRight || movingLeft;

  const movementStep = constrain(width * 0.004, 2, 8);

  if (movingRight) {
    isWalking = true;
    facingDirection = 1;
    characterX += movementStep;
  } else if (movingLeft) {
    isWalking = true;
    facingDirection = -1;
    characterX -= movementStep;
  }

  // 角色縮小為螢幕高度的約 1/3
  const characterScale = min(
    (height / 3) / frameHeight,
    ((width * 2) / 3) / frameWidth
  );

  const characterWidth = frameWidth * characterScale;
  const characterHeight = frameHeight * characterScale;

  characterX = constrain(
    characterX,
    characterWidth / 2,
    width - characterWidth / 2
  );

  // 檢查施法動畫是否播放完畢
  if (
    isCasting &&
    frameCount - magicStartFrame >= magicFrameCount * framesPerStep
  ) {
    isCasting = false;

    // 在角色前方建立魔法特效
    activeEffects.push({
      x: characterX + magicDirection * characterWidth / 2,
      y: height - characterHeight * 0.58,
      direction: magicDirection
    });
  }

  // 根據角色狀態選擇精靈圖
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

  const elapsedMagicFrames = frameCount - magicStartFrame;

  const frameIndex = isCasting
    ? floor(elapsedMagicFrames / framesPerStep)
    : floor(frameCount / framesPerStep) % activeFrameCount;

  const sourceX = frameIndex * activeFrameWidth;

  const activeWidth = activeFrameWidth * characterScale;
  const activeHeight = activeFrameHeight * characterScale;

  const characterY = height - activeHeight / 2;

  // 繪製角色
  push();

  translate(characterX, characterY);

  scale(isCasting ? magicDirection : facingDirection, 1);

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

  // 魔法特效大小與角色同步縮放
  const effectScale = characterScale;

  const effectWidth = effectFrameWidth * effectScale;
  const effectHeight = effectFrameHeight * effectScale;

  const effectSpeed = max(6, width * 0.008);

  // 更新並繪製所有飛行中的魔法特效
  for (
    let effectIndex = activeEffects.length - 1;
    effectIndex >= 0;
    effectIndex--
  ) {
    const effect = activeEffects[effectIndex];

    effect.x += effect.direction * effectSpeed;

    // 移除飛出畫面的特效
    if (effect.x > width || effect.x < 0) {
      activeEffects.splice(effectIndex, 1);
      continue;
    }

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

// 鍵盤按下事件
function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    isWalking = true;
    facingDirection = 1;
    return false;
  }

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

// 鍵盤放開事件
function keyReleased() {
  if (keyCode === 32) {
    spaceIsDown = false;
  }
}

// 視窗尺寸改變時重新調整畫布
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  characterX = constrain(characterX, 1, width - 1);
}
