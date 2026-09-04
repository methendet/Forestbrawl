/* ═══════════════════════════════════════════════════
   INVENTORY CANVAS ICONS — real in-game resource/weapon art
   ═══════════════════════════════════════════════════ */
(function(){
'use strict';

var _IC = {}, _IT = {};
function _initIC(){
  for (var i = 1; i <= 10; i++) {
    var cv = document.getElementById('icanv-' + i);
    if (cv) {
      _IC[i] = cv;
      _IT[i] = cv.getContext('2d');
    }
  }
  var fcv = document.getElementById('icanv-food');
  if (fcv) {
    _IC['food'] = fcv;
    _IT['food'] = fcv.getContext('2d');
  }
}

function _drawSlotBase(ctx){
  var W = 40;
  ctx.clearRect(0,0,W,W);
  ctx.fillStyle = 'rgba(12,18,24,0.45)';
  ctx.fillRect(2,2,36,36);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.strokeRect(3,3,34,34);
}

function _drawFoodSlot(slotCtx) {
  _drawSlotBase(slotCtx);
  const img = _SPRITES['asset/apple.png'] || _SPRITES['resourceasset/apple.png'] || _SPRITES['asset/apple'];
  slotCtx.save();
  slotCtx.translate(20, 20);
  if (img && img.complete && img.naturalWidth > 0) {
    slotCtx.drawImage(img, -14, -14, 28, 28);
  } else {
    slotCtx.font = 'bold 20px sans-serif';
    slotCtx.textAlign = 'center';
    slotCtx.textBaseline = 'middle';
    slotCtx.fillStyle = '#fef2f2';
    slotCtx.fillText('🍎', 0, 2);
  }
  slotCtx.restore();
}

function _drawSpriteToSlot(ctx, img) {
  _drawSlotBase(ctx);
  if (!img) return;
  var maxW = 28, maxH = 28;
  var scale = Math.min(maxW / (img.width || 1), maxH / (img.height || 1));
  var w = (img.width || 28) * scale;
  var h = (img.height || 28) * scale;
  ctx.drawImage(img, 20 - w / 2, 20 - h / 2, w, h);
}

function _drawWeaponSlot(ctx, kind, tier){
  var img = typeof _weaponSprite === 'function' ? _weaponSprite(kind, tier || 0) : null;
  if (!img) {
    _drawSlotBase(ctx);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(kind === 'axe' ? 'A' : 'S', 20, 20);
    return;
  }
  _drawSpriteToSlot(ctx, img);
}

function _drawBuildingSlot(slotCtx, type){
  _drawSlotBase(slotCtx);
  let spriteName = null;
  switch (type) {
    case 3: spriteName = 'spike'; break;
    case 4: spriteName = 'windmill_base'; break;
    case 5: spriteName = 'boostpad'; break;
    case 6: spriteName = 'beartrap'; break;
    case 7: spriteName = 'turret'; break;
    case 8: spriteName = 'door'; break;
    case 9: spriteName = 'healpad'; break;
  }
  if (spriteName) {
    const img = _getBuildSprite(spriteName);
    if (img && img.complete && img.naturalWidth > 0) {
      slotCtx.save();
      slotCtx.translate(20, 20);
      slotCtx.drawImage(img, -14, -14, 28, 28);
      if (type === 4) {
        const bladeImg = _getBuildSprite('windmill_blades');
        if (bladeImg && bladeImg.complete && bladeImg.naturalWidth > 0) {
          slotCtx.save();
          slotCtx.rotate(Math.PI / 4);
          slotCtx.drawImage(bladeImg, -14, -14, 28, 28);
          slotCtx.restore();
        }
      }
      slotCtx.restore();
      return;
    }
  }
  if (typeof drawBuilding !== 'function') return;
  var gameCtx = ctx;
  try {
    ctx = slotCtx;
    slotCtx.save();
    slotCtx.translate(20, 20);
    slotCtx.scale(0.35, 0.35);
    drawBuilding({x:0,y:0,type:type,tier:0,angle:0,shake:0,hp:100,maxHp:100}, false);
    slotCtx.restore();
  } finally {
    ctx = gameCtx;
  }
}

function _slotDef(slotIndex){
  if (slotIndex === 1) return { kind: 'axe', tier: (typeof _wepTier === 'function' && typeof _axeXP !== 'undefined') ? _wepTier(_axeXP) : 0 };
  if (slotIndex === 2) return { kind: 'sword', tier: (typeof _wepTier === 'function' && typeof _swordXP !== 'undefined') ? _wepTier(_swordXP) : 0 };
  if (slotIndex >= 3 && slotIndex <= 10) return { buildType: slotIndex };
  return null;
}

var _lastInv = {};
function renderInventoryIcons(force){
  try {
    if (!_IC[1]) _initIC();
    for (var i = 1; i <= 10; i++) {
      var slot = _IC[i];
      if (!slot) continue;
      var ctx = _IT[i];
      var def = _slotDef(i);
      var key = def ? (def.kind ? 'k:' + def.kind + ':' + (def.tier || 0) : 'b:' + def.buildType) : 'empty';
      var redraw = force || key !== _lastInv[i];
      if (!redraw) continue;
      _lastInv[i] = key;
      if (def && def.kind) {
        _drawWeaponSlot(ctx, def.kind, def.tier);
      } else if (def && def.buildType) {
        _drawBuildingSlot(ctx, def.buildType);
      } else {
        _drawSlotBase(ctx);
      }
    }
    if (_IT['food']) {
      _drawFoodSlot(_IT['food']);
    }
  } catch (e) {}
}

window.renderInventoryIcons = renderInventoryIcons;
_initIC();
renderInventoryIcons(true);
})();
