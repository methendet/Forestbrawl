// ================================================================
// FOREST BRAWL — QOL SYSTEMS v1
// (1) Minimap overlay: boss/cave/kaynak zamanlayıcıları
// (2) Akıllı yeniden bağlanma: 30s karakter grace sayacı
// (3) Mobil çift joystick: dead zone + haptic + ok gösterge
// (4) Konuk → Hesap kaydetme modal akışı
// ================================================================
(function(){
'use strict';

// ── 1. MİNİMAP OVERLAY ───────────────────────────────────────
var _MMOW=7200,_MMS=128,_MMSC=128/(_MMOW*2);
function _mmpx(wx,wy){return[(wx+_MMOW)*_MMSC,(wy+_MMOW)*_MMSC];}

var _mmOvCtx=(function(){
  try {
    var mmDiv=document.getElementById('minimap');
    if(!mmDiv || typeof mmDiv.appendChild !== 'function') return null;
    var oc=document.createElement('canvas');
    oc.id='mm-ext-canvas';oc.width=_MMS;oc.height=_MMS;
    oc.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;border-radius:8px;z-index:2;';
    mmDiv.appendChild(oc);
    return oc.getContext('2d');
  } catch(e) { return null; }
})();

var _MM_CAMPS_EXT=[
  {bx:2000,  by:400,   col:'#cc5522',tid:'forest'},
  {bx:-600,  by:-3100, col:'#4488ff',tid:'snow'  },
  {bx:3200,  by:1200,  col:'#ccaa00',tid:'desert'},
  {bx:-3200, by:-1000, col:'#aa22ff',tid:'dark'  },
  {bx:-800,  by:3200,  col:'#44aa22',tid:'swamp' },
];
var _MM_CAVES_EXT = [];
// PERF: Cave positions are static — pre-compute minimap pixel coords and cache gradient.
// Without cache: createRadialGradient × N_caves per 450ms call → GC + GPU work.
var _mmCaveCache = null; // lazy-built once when _mmOvCtx is ready

function _redrawMmOverlay(){
  if(!_mmOvCtx)return;
  var S=_MMS,now=Date.now();
  _mmOvCtx.clearRect(0,0,S,S);

  // Boss camp markers
  _MM_CAMPS_EXT.forEach(function(c){
    var p=_mmpx(c.bx,c.by);
    var bs=typeof bossState!=='undefined'?bossState[c.tid]:null;
    var alive=!bs||bs.alive!==false;
    var respawnAt=bs&&!alive?bs.respawnAt:0;
    var remain=respawnAt?Math.max(0,Math.ceil((respawnAt-now)/1000)):0;
    _mmOvCtx.save();
    // Outer glow
    if(alive){
      _mmOvCtx.globalAlpha=0.35;
      _mmOvCtx.fillStyle=c.col;
      _mmOvCtx.beginPath();_mmOvCtx.arc(p[0],p[1],7,0,Math.PI*2);_mmOvCtx.fill();
    }
    _mmOvCtx.globalAlpha=alive?0.95:0.4;
    _mmOvCtx.font='8px sans-serif';
    _mmOvCtx.textAlign='center';_mmOvCtx.textBaseline='middle';
    _mmOvCtx.fillText(alive?'⚔️':'💀',p[0],p[1]);
    // Respawn countdown
    if(!alive&&remain>0){
      _mmOvCtx.globalAlpha=1;
      _mmOvCtx.font='bold 6px sans-serif';
      _mmOvCtx.fillStyle='#ffcc55';
      _mmOvCtx.textBaseline='top';
      _mmOvCtx.fillText(remain+'s',p[0],p[1]+6);
    }
    _mmOvCtx.restore();
  });

  // Cave markers (purple dots) — gradients cached once (caves never move)
  if(!_mmCaveCache){
    _mmCaveCache=_MM_CAVES_EXT.map(function(cv){
      var p=_mmpx(cv.x,cv.y);
      var gg=_mmOvCtx.createRadialGradient(p[0],p[1],0,p[0],p[1],6);
      gg.addColorStop(0,'rgba(160,60,255,0.8)');
      gg.addColorStop(1,'rgba(100,0,200,0)');
      return{px:p[0],py:p[1],grd:gg};
    });
  }
  _mmCaveCache.forEach(function(c){
    _mmOvCtx.save();
    _mmOvCtx.globalAlpha=0.9;
    _mmOvCtx.fillStyle=c.grd;
    _mmOvCtx.beginPath();_mmOvCtx.arc(c.px,c.py,6,0,Math.PI*2);_mmOvCtx.fill();
    _mmOvCtx.fillStyle='#cc88ff';
    _mmOvCtx.beginPath();_mmOvCtx.arc(c.px,c.py,2.5,0,Math.PI*2);_mmOvCtx.fill();
    _mmOvCtx.restore();
  });

  // Camp resource respawn timers
  if(typeof campResNodes!=='undefined'){
    _MM_CAMPS_EXT.forEach(function(c){
      var nodes=campResNodes[c.tid];
      if(!nodes)return;
      var p=_mmpx(c.bx,c.by);
      var deadNodes=nodes.filter(function(n){return!n.alive&&n.respawnAt>0;});
      if(deadNodes.length===0)return;
      var soonest=deadNodes.reduce(function(a,b){return a.respawnAt<b.respawnAt?a:b;});
      var rem=Math.max(0,Math.ceil((soonest.respawnAt-now)/1000));
      if(rem>0){
        _mmOvCtx.save();
        _mmOvCtx.globalAlpha=0.85;
        _mmOvCtx.font='bold 5px sans-serif';
        _mmOvCtx.fillStyle='#ffee88';
        _mmOvCtx.textAlign='center';_mmOvCtx.textBaseline='bottom';
        _mmOvCtx.fillText('🪵'+rem+'s',p[0],p[1]-8);
        _mmOvCtx.restore();
      }
    });
  }
}

setInterval(_redrawMmOverlay,450);

// ── 2. AKILLI YENİDEN BAĞLANMA SAYACI ────────────────────────
var _dcAt=0,_GRACE=30;

setInterval(function(){
  try{
    var isConnected=typeof _connected!=='undefined'?_connected:true;
    var rcOv=document.getElementById('_rcOverlay');
    if(!rcOv)return;
    var cdEl=document.getElementById('_qolRcCd');
    if(!cdEl){
      cdEl=document.createElement('div');
      cdEl.id='_qolRcCd';
      cdEl.style.cssText='font-size:.9rem;padding:8px 22px;border-radius:10px;font-weight:700;text-align:center;border:1px solid rgba(0,255,120,0.28);background:rgba(0,80,40,0.28);color:#88ffbb;max-width:310px;';
      rcOv.appendChild(cdEl);
    }
    if(!isConnected){
      if(!_dcAt)_dcAt=Date.now();
      var el=Math.floor((Date.now()-_dcAt)/1000);
      var rem=Math.max(0,_GRACE-el);
      cdEl.style.display='';
      cdEl.textContent=rem>0
        ?'👤 Karakterin '+rem+'s daha alanda kalacak'
        :'⚠️ Karakter sahayı terk etti — bağlanılıyor...';
      cdEl.style.color=rem>10?'#88ffbb':rem>0?'#ffcc55':'#ff8888';
    } else {
      if(_dcAt){_dcAt=0;cdEl.textContent='';}
      cdEl.style.display='none';
    }
  }catch(e){}
},1000);

// ── 3. MOBİL JOYSTICK İYİLEŞTİRME (görsel hedef dairesi kaldırıldı) ───────────────────────────
// Attack direction arc indicator intentionally removed to keep the HUD cleaner.

// ── 4. KONUK → HESAP KAYDETME ────────────────────────────────
(function(){
  // Save button (inside trophy-meta-hud)
  setTimeout(function(){
    var tmh=document.getElementById('trophy-meta-hud');
    if(!tmh||document.getElementById('_savePBtn'))return;
    var btn=document.createElement('button');
    btn.id='_savePBtn';
    btn.title='İlerlemeyi Kaydet';
    btn.textContent='💾';
    btn.style.cssText='background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);color:#aaddff;border-radius:8px;padding:3px 8px;font-size:14px;cursor:pointer;font-family:inherit;transition:background .12s;';
    btn.addEventListener('mouseenter',function(){btn.style.background='rgba(255,255,255,0.14)';});
    btn.addEventListener('mouseleave',function(){btn.style.background='rgba(255,255,255,0.07)';});
    btn.addEventListener('click',_openSave);
    tmh.appendChild(btn);
  },800);

  // Modal
  var modal=document.createElement('div');
  modal.id='_saveModal';
  modal.style.cssText='display:none;position:fixed;inset:0;z-index:9997;background:rgba(0,0,0,0.78);align-items:center;justify-content:center;font-family:inherit;';
  modal.innerHTML=[
    '<div style="background:linear-gradient(155deg,#0d1b2e,#182d44);border:1px solid rgba(80,180,255,0.25);border-radius:18px;padding:26px 26px 20px;max-width:360px;width:92%;text-align:center;color:#fff;display:flex;flex-direction:column;gap:11px;">',
      '<div style="font-size:19px;font-weight:800;letter-spacing:.03em;">💾 İlerlemeyi Kaydet</div>',
      '<div style="font-size:10.5px;color:rgba(255,255,255,0.38);">İsim belirle — tüm istatistiklerin tarayıcıda korunur</div>',
      '<div id="_saveStats" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 14px;font-size:11px;line-height:1.9;text-align:left;"></div>',
      '<input id="_saveNameInput" type="text" maxlength="20" placeholder="Oyuncu adın..." ',
        'style="background:rgba(255,255,255,0.08);border:1px solid rgba(80,160,255,0.32);border-radius:9px;padding:9px 12px;color:#fff;font-size:14px;font-family:inherit;outline:none;width:100%;box-sizing:border-box;">',
      '<div style="display:flex;gap:8px;">',
        '<button id="_saveSaveBtn" style="flex:1;background:linear-gradient(90deg,#1a7acc,#0a5aaa);border:none;color:#fff;border-radius:10px;padding:10px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;">✅ Kaydet</button>',
        '<button id="_saveCancelBtn" style="flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);color:rgba(255,255,255,0.45);border-radius:10px;padding:10px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;">✕ İptal</button>',
      '</div>',
      '<div id="_saveResult" style="display:none;font-size:11px;color:#88ffcc;background:rgba(0,140,70,0.18);border-radius:8px;padding:9px;"></div>',
    '</div>'
  ].join('');
  document.body.appendChild(modal);

  modal.querySelector('#_saveCancelBtn').addEventListener('click',function(){modal.style.display='none';});
  modal.querySelector('#_saveSaveBtn').addEventListener('click',_doSave);
  modal.addEventListener('click',function(e){if(e.target===modal)modal.style.display='none';});

  // Pre-fill
  var sn=localStorage.getItem('fb_saved_name');
  if(sn){var ni=modal.querySelector('#_saveNameInput');if(ni)ni.value=sn;}

  function _openSave(){
    var statsEl=modal.querySelector('#_saveStats');
    if(statsEl){
      function _ls(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
      var td=_ls('fb_trophies_v1')||{n:0,pk:0};
      var md=_ls('fb_meta_v1')||{lv:1,xp:0};
      var ad=_ls('fb_achievements_v2')||{done:[]};
      var kills=parseInt(localStorage.getItem('fb_total_kills')||'0',10);
      var games=parseInt(localStorage.getItem('fb_total_games')||'0',10);
      var bk=parseInt(localStorage.getItem('fb_boss_kills')||'0',10);
      var wood=parseInt(localStorage.getItem('fb_total_wood_meta')||'0',10);
      statsEl.innerHTML=
        '🏆 Kupa: <b>'+td.n+'</b>  ·  Rekor: '+td.pk+'<br>'+
        '⭐ Meta Sv: <b>'+md.lv+'</b>  ·  '+md.xp+' XP<br>'+
        '🗡️ Kill: <b>'+kills+'</b>  ·  💀 Boss Kill: <b>'+bk+'</b><br>'+
        '🎮 Oyun: <b>'+games+'</b>  ·  🌲 Odun: <b>'+wood+'</b><br>'+
        '🏅 Başarım: <b>'+(ad.done||[]).length+' / 50</b>';
    }
    var resEl=modal.querySelector('#_saveResult');
    if(resEl)resEl.style.display='none';
    modal.style.display='flex';
    setTimeout(function(){var ni=modal.querySelector('#_saveNameInput');if(ni)ni.focus();},80);
  }

  function _doSave(){
    var ni=modal.querySelector('#_saveNameInput');
    var name=(ni&&ni.value.trim())||'Oyuncu';
    name=name.slice(0,20)||'Oyuncu';
    localStorage.setItem('fb_saved_name',name);
    // Snapshot
    var snap={
      v:1,n:name,ts:Date.now(),
      t:localStorage.getItem('fb_trophies_v1'),
      m:localStorage.getItem('fb_meta_v1'),
      a:localStorage.getItem('fb_achievements_v2'),
      tl:localStorage.getItem('fb_titles_v1'),
      k:localStorage.getItem('fb_total_kills'),
      g:localStorage.getItem('fb_total_games'),
      bk:localStorage.getItem('fb_boss_kills'),
    };
    localStorage.setItem('fb_saved_profile',JSON.stringify(snap));
    // Profile code (short base64 of name + kills + games)
    var code='';
    try{code=btoa(name+':'+snap.k+':'+snap.g).replace(/=/g,'').slice(0,22);}
    catch(e){code='FB'+Date.now().toString(36);}
    var resEl=modal.querySelector('#_saveResult');
    if(resEl){
      resEl.style.display='block';
      resEl.innerHTML='✅ <b>'+name+'</b> olarak kaydedildi!<br>'+
        '<span style="font-size:9.5px;color:rgba(255,255,255,0.4);">Profil kodu: </span>'+
        '<code style="font-size:9.5px;background:rgba(255,255,255,0.1);padding:1px 6px;border-radius:4px;letter-spacing:.05em;">'+code+'</code>';
    }
    // Update URL name param for next session
    try{
      var url=new URL(window.location.href);
      url.searchParams.set('name',name);
      history.replaceState(null,'',url.toString());
    }catch(e){}
    if(typeof window._showAchPopup==='function')
      setTimeout(function(){window._showAchPopup('💾','Profil Kaydedildi!',name+' olarak devam edeceksin');},350);
  }
})();

})();
