// ================================================================
// FOREST BRAWL — META-PROGRESSION SYSTEMS v1
// Trophy|Meta-Level|Achievements|Titles|Secret Caves|Battle Pass
// ================================================================
(function(){
'use strict';

// ── 1. TROPHY / KUPA SİSTEMİ ─────────────────────────────────
var LEAGUES=[
  {id:0,name:'Bronz',  emoji:'🥉',color:'#cd7f32',bg:'league-bronz',min:0,    max:499  },
  {id:1,name:'Gümüş', emoji:'🥈',color:'#b0bec5',bg:'league-gumus',min:500,  max:999  },
  {id:2,name:'Altın',  emoji:'🥇',color:'#ffd700',bg:'league-altin',min:1000, max:2499 },
  {id:3,name:'Elmas',  emoji:'💎',color:'#00e5ff',bg:'league-elmas',min:2500, max:4999 },
  {id:4,name:'Usta',   emoji:'🏆',color:'#ce93d8',bg:'league-usta', min:5000, max:9999 },
  {id:5,name:'Efsane', emoji:'👑',color:'#ffab40',bg:'league-efsane',min:10000,max:999999},
];
function getLeague(n){for(var i=LEAGUES.length-1;i>=0;i--){if(n>=LEAGUES[i].min)return LEAGUES[i];}return LEAGUES[0];}
function nextLeague(l){return LEAGUES[Math.min(l.id+1,LEAGUES.length-1)];}

var _trophy=(function(){try{return JSON.parse(localStorage.getItem('fb_trophies_v1')||'null');}catch(e){}return null;})()
  ||{n:0,g:0,pk:0};
function _saveTrophy(){try{localStorage.setItem('fb_trophies_v1',JSON.stringify(_trophy));}catch(e){}}

function _applyTrophyResult(kills,timeSec){
  var gain=kills*15;
  if(timeSec>=300)gain+=30;
  if(timeSec>=600)gain+=50;
  if(kills>=5)gain+=25;
  if(kills>=10)gain+=50;
  if(gain<5&&timeSec>=60)gain=5;
  var loss=0;
  if(kills===0&&timeSec<60)loss=15;
  else if(kills===0)loss=8;
  var net=gain-loss;
  var league=getLeague(_trophy.n);
  var floor=Math.max(0,league.min-50);
  var old=_trophy.n;
  _trophy.n=Math.max(floor,_trophy.n+net);
  _trophy.g=(_trophy.g||0)+1;
  if(_trophy.n>(_trophy.pk||0))_trophy.pk=_trophy.n;
  _saveTrophy();
  return{old:old,newN:_trophy.n,net:net,gain:gain,loss:loss};
}

// ── 2. META-LEVEL SİSTEMİ ────────────────────────────────────
var META_XP_TABLE=[0];
for(var _mi=1;_mi<=50;_mi++)META_XP_TABLE.push(Math.floor(150*Math.pow(_mi,1.75)));

var _meta=(function(){try{return JSON.parse(localStorage.getItem('fb_meta_v1')||'null');}catch(e){}return null;})()
  ||{xp:0,lv:1,pk:1};
function _saveMeta(){try{localStorage.setItem('fb_meta_v1',JSON.stringify(_meta));}catch(e){}}

function _metaLevelOf(xp){
  var lv=1;
  for(var i=1;i<META_XP_TABLE.length;i++){if(xp>=META_XP_TABLE[i])lv=i+1;else break;}
  return Math.min(lv,50);
}

function _applyMetaXp(kills,timeSec,score){
  var earned=kills*80+Math.floor(timeSec/60)*25+Math.floor(score/20);
  earned=Math.max(5,earned);
  var oldXp=_meta.xp,oldLv=_meta.lv;
  _meta.xp+=earned;
  _meta.lv=_metaLevelOf(_meta.xp);
  if(_meta.lv>(_meta.pk||1))_meta.pk=_meta.lv;
  _saveMeta();
  return{earned:earned,oldXp:oldXp,oldLv:oldLv,newXp:_meta.xp,newLv:_meta.lv};
}



function _bonusDescForLevel(lv){
  var parts=[];
  if(lv%5===0)parts.push('+3% Hasar');
  if(lv%10===0)parts.push('+3% Hız');
  if(lv%8===0)parts.push('+5% XP');
  if(lv%20===0)parts.push('+15 Maksimum Can');
  return parts.length?parts.join(' · '):'Devam et!';
}

// ── 3. UNVAN SİSTEMİ ────────────────────────────────────────
var TITLES=[
  {id:'yeni',    name:'Acemi',            emoji:'🌱',check:function(){return true;}},
  {id:'k10',     name:'Savaşçı',          emoji:'⚔️', check:function(){return _tk()>=10;}},
  {id:'k50',     name:'Katil',            emoji:'🗡️', check:function(){return _tk()>=50;}},
  {id:'k200',    name:'Canavar Avcısı',   emoji:'👹',check:function(){return _tk()>=200;}},
  {id:'k500',    name:'Kâbus',            emoji:'💀',check:function(){return _tk()>=500;}},
  {id:'k1000',   name:'Efsanevi Avcı',    emoji:'🩸',check:function(){return _tk()>=1000;}},
  {id:'b50',     name:'İnşaatçı',         emoji:'🏗️',check:function(){return _tb()>=50;}},
  {id:'b200',    name:'Mühendis',         emoji:'🔨',check:function(){return _tb()>=200;}},
  {id:'b500',    name:'Duvar Ustası',     emoji:'🧱',check:function(){return _tb()>=500;}},
  {id:'t5m',     name:'Hayatta Kalan',    emoji:'🛡️',check:function(){return _ttm()>=5;}},
  {id:'t60m',    name:'Dayanıklı',        emoji:'⏱️',check:function(){return _ttm()>=60;}},
  {id:'t300m',   name:'Ebedi Savaşçı',   emoji:'🌙',check:function(){return _ttm()>=300;}},
  {id:'lv10',    name:'Tecrübeli',        emoji:'📈',check:function(){return _meta.lv>=10;}},
  {id:'lv25',    name:'Üstat',            emoji:'🏅',check:function(){return _meta.lv>=25;}},
  {id:'lv50',    name:'Tanrısal',         emoji:'✨',check:function(){return _meta.lv>=50;}},
  {id:'tp2500',  name:'Elmas Şampiyonu',  emoji:'💎',check:function(){return(_trophy.pk||0)>=2500;}},
  {id:'tp5000',  name:'Usta Şampiyon',    emoji:'👑',check:function(){return(_trophy.pk||0)>=5000;}},
  {id:'w1000',   name:'Kaynak Toplayıcı', emoji:'🌲',check:function(){return _tw()>=1000;}},
  {id:'g50',     name:'Bağımlı',          emoji:'🎮',check:function(){return _tg()>=50;}},
  {id:'cave',    name:'Mağara Kâşifi',    emoji:'🕳️',check:function(){return!!localStorage.getItem('fb_cave_entered');}},
];

var _titlesData=(function(){try{return JSON.parse(localStorage.getItem('fb_titles_v1')||'null');}catch(e){}return null;})()
  ||{e:['yeni'],a:'yeni'};
function _saveTitles(){try{localStorage.setItem('fb_titles_v1',JSON.stringify(_titlesData));}catch(e){}}

function _tk(){return parseInt(localStorage.getItem('fb_total_kills')||'0',10);}
function _tb(){return parseInt(localStorage.getItem('fb_total_builds_meta')||'0',10);}
function _ttm(){return Math.floor(parseInt(localStorage.getItem('fb_total_time')||'0',10)/60);}
function _tg(){return parseInt(localStorage.getItem('fb_total_games')||'0',10);}
function _tw(){return parseInt(localStorage.getItem('fb_total_wood_meta')||'0',10);}

function _checkTitleUnlocks(){
  var fresh=[];
  TITLES.forEach(function(t){
    try{if(!_titlesData.e.includes(t.id)&&t.check()){_titlesData.e.push(t.id);fresh.push(t);}}catch(e){}
  });
  if(fresh.length){
    _saveTitles();
    fresh.forEach(function(t){
      if(typeof window._showAchPopup==='function')
        window._showAchPopup(t.emoji,'🏅 Unvan Kazandın: '+t.name,'Yeni unvanın aktif!');
    });
  }
}


// ── 4. BAŞARIM SİSTEMİ — 50 Başarım ────────────────────────
var ACHIEVEMENTS=[
  // COMBAT (8)
  {id:'c1',cat:'⚔️',name:'İlk Kan',       desc:'İlk düşmanını öldür',          check:function(){return _tk()>=1;}},
  {id:'c2',cat:'⚔️',name:'5 Kill',         desc:'5 düşman öldür',               check:function(){return _tk()>=5;}},
  {id:'c3',cat:'⚔️',name:'10 Kill',        desc:'10 düşman öldür',              check:function(){return _tk()>=10;}},
  {id:'c4',cat:'⚔️',name:'50 Kill',        desc:'50 düşman öldür',              check:function(){return _tk()>=50;}},
  {id:'c5',cat:'⚔️',name:'100 Kill',       desc:'100 düşman öldür',             check:function(){return _tk()>=100;}},
  {id:'c6',cat:'⚔️',name:'500 Kill',       desc:'500 düşman öldür',             check:function(){return _tk()>=500;}},
  {id:'c7',cat:'⚔️',name:'1000 Kill',      desc:'1000 düşman öldür',            check:function(){return _tk()>=1000;}},
  {id:'c8',cat:'⚔️',name:'5000 Kill',      desc:'5000 düşman öldür',            check:function(){return _tk()>=5000;}},
  // SURVIVAL (8)
  {id:'s1',cat:'🛡️',name:'1 Dakika',       desc:'1 dakika hayatta kal',         check:function(){return _ttm()>=1;}},
  {id:'s2',cat:'🛡️',name:'5 Dakika',       desc:'5 dakika oyna',                check:function(){return _ttm()>=5;}},
  {id:'s3',cat:'🛡️',name:'30 Dakika',      desc:'30 dakika oyna',               check:function(){return _ttm()>=30;}},
  {id:'s4',cat:'🛡️',name:'2 Saat',         desc:'120 dakika oyna',              check:function(){return _ttm()>=120;}},
  {id:'s5',cat:'🛡️',name:'10 Saat',        desc:'600 dakika oyna',              check:function(){return _ttm()>=600;}},
  {id:'s6',cat:'🛡️',name:'Veteran',        desc:'1000 dakika oyna',             check:function(){return _ttm()>=1000;}},
  {id:'s7',cat:'🛡️',name:'İlk Oyun',       desc:'İlk oyununu tamamla',          check:function(){return _tg()>=1;}},
  {id:'s8',cat:'🛡️',name:'50 Oyun',        desc:'50 oyun oyna',                 check:function(){return _tg()>=50;}},
  // BUILDING (6)
  {id:'b1',cat:'🏗️',name:'Kurucu',         desc:'İlk binanı yap',               check:function(){return _tb()>=1;}},
  {id:'b2',cat:'🏗️',name:'10 Bina',        desc:'10 bina yap',                  check:function(){return _tb()>=10;}},
  {id:'b3',cat:'🏗️',name:'50 Bina',        desc:'50 bina yap',                  check:function(){return _tb()>=50;}},
  {id:'b4',cat:'🏗️',name:'100 Bina',       desc:'100 bina yap',                 check:function(){return _tb()>=100;}},
  {id:'b5',cat:'🏗️',name:'500 Bina',       desc:'500 bina yap',                 check:function(){return _tb()>=500;}},
  {id:'b6',cat:'🏗️',name:'1000 Bina',      desc:'1000 bina yap',                check:function(){return _tb()>=1000;}},
  // RESOURCES (6)
  {id:'r1',cat:'🌲',name:'Oduncu',          desc:'100 odun topla',               check:function(){return _tw()>=100;}},
  {id:'r2',cat:'🌲',name:'Orman Beyi',      desc:'500 odun topla',               check:function(){return _tw()>=500;}},
  {id:'r3',cat:'🌲',name:'Orman Tanrısı',   desc:'2000 odun topla',              check:function(){return _tw()>=2000;}},
  {id:'r4',cat:'💰',name:'İlk Altın',       desc:'100 altın kazan',              check:function(){return parseInt(localStorage.getItem('fb_total_gold')||'0',10)>=100;}},
  {id:'r5',cat:'💰',name:'Zengin',          desc:'5000 altın kazan',             check:function(){return parseInt(localStorage.getItem('fb_total_gold')||'0',10)>=5000;}},
  {id:'r6',cat:'💰',name:'Milyoner',        desc:'50000 altın kazan',            check:function(){return parseInt(localStorage.getItem('fb_total_gold')||'0',10)>=50000;}},
  // PROGRESSION (11)
  {id:'p1',cat:'⭐',name:'Seviye 5',        desc:'Meta seviye 5 ulaş',           check:function(){return _meta.lv>=5;}},
  {id:'p2',cat:'⭐',name:'Seviye 10',       desc:'Meta seviye 10 ulaş',          check:function(){return _meta.lv>=10;}},
  {id:'p3',cat:'⭐',name:'Seviye 20',       desc:'Meta seviye 20 ulaş',          check:function(){return _meta.lv>=20;}},
  {id:'p4',cat:'⭐',name:'Seviye 35',       desc:'Meta seviye 35 ulaş',          check:function(){return _meta.lv>=35;}},
  {id:'p5',cat:'⭐',name:'Seviye 50',       desc:'Meta seviye 50 ulaş',          check:function(){return _meta.lv>=50;}},
  {id:'p6',cat:'🥉',name:'Bronz Ligi',      desc:'Bronz ligine gir',             check:function(){return true;}},
  {id:'p7',cat:'🥈',name:'Gümüş Ligi',      desc:'500 kupaya ulaş',              check:function(){return(_trophy.pk||0)>=500;}},
  {id:'p8',cat:'🥇',name:'Altın Ligi',      desc:'1000 kupaya ulaş',             check:function(){return(_trophy.pk||0)>=1000;}},
  {id:'p9',cat:'💎',name:'Elmas Ligi',      desc:'2500 kupaya ulaş',             check:function(){return(_trophy.pk||0)>=2500;}},
  {id:'p10',cat:'🏆',name:'Usta Ligi',      desc:'5000 kupaya ulaş',             check:function(){return(_trophy.pk||0)>=5000;}},
  {id:'p11',cat:'👑',name:'Efsane',         desc:'10000 kupaya ulaş',            check:function(){return(_trophy.pk||0)>=10000;}},
  // EXPLORATION (11)
  {id:'e1',cat:'🕳️',name:'Mağara Kâşifi',  desc:'Gizli bir mağaraya gir',       check:function(){return!!localStorage.getItem('fb_cave_entered');}},
  {id:'e2',cat:'🕳️',name:'Mağara Gezgini', desc:'3 farklı mağaraya gir',        check:function(){return parseInt(localStorage.getItem('fb_caves_visited')||'0',10)>=3;}},
  {id:'e3',cat:'🕳️',name:'Mağara Ustası',  desc:'5 mağaraya gir',               check:function(){return parseInt(localStorage.getItem('fb_caves_visited')||'0',10)>=5;}},
  {id:'e4',cat:'🗺️',name:'Kuzey Kâşifi',   desc:'Kar bölgesine gir',            check:function(){return!!localStorage.getItem('fb_biome_snow');}},
  {id:'e5',cat:'🗺️',name:'Güney Kâşifi',   desc:'Bataklık bölgesine gir',       check:function(){return!!localStorage.getItem('fb_biome_swamp');}},
  {id:'e6',cat:'🗺️',name:'Doğu Kâşifi',    desc:'Çöl bölgesine gir',            check:function(){return!!localStorage.getItem('fb_biome_desert');}},
  {id:'e7',cat:'🗺️',name:'Batı Kâşifi',    desc:'Karanlık ormana gir',          check:function(){return!!localStorage.getItem('fb_biome_darkforest');}},
  {id:'e8',cat:'🗺️',name:'Dünya Gezgini',  desc:'Tüm biyomlara gir',            check:function(){return['snow','swamp','desert','darkforest'].every(function(b){return!!localStorage.getItem('fb_biome_'+b);});}},
  {id:'e9',cat:'🗺️',name:'200 Oyun',        desc:'200 oyun oyna',               check:function(){return _tg()>=200;}},
  {id:'e10',cat:'🗺️',name:'500 Oyun',       desc:'500 oyun oyna',               check:function(){return _tg()>=500;}},
  {id:'e11',cat:'🗺️',name:'2000 Kill',      desc:'2000 düşman öldür',           check:function(){return _tk()>=2000;}},
];

var _achData=(function(){try{return JSON.parse(localStorage.getItem('fb_achievements_v2')||'null');}catch(e){}return null;})()
  ||{done:[]};
function _saveAchData(){try{localStorage.setItem('fb_achievements_v2',JSON.stringify(_achData));}catch(e){}}

function _checkAchievements(){
  var fresh=[];
  ACHIEVEMENTS.forEach(function(a){
    try{if(!_achData.done.includes(a.id)&&a.check()){_achData.done.push(a.id);fresh.push(a);}}catch(e){}
  });
  if(fresh.length){
    _saveAchData();
    fresh.forEach(function(a){
      if(typeof window._showAchPopup==='function')
        window._showAchPopup(a.cat,'🏅 '+a.name,a.desc);
    });
  }
  _checkTitleUnlocks();
  _renderAchPanel();
  _updateMetaHud();
}

function _renderAchPanel(){
  var grid=document.getElementById('ach-grid');
  var sub=document.getElementById('ach-panel-sub');
  if(!grid)return;
  var done=_achData.done.length,total=ACHIEVEMENTS.length;
  if(sub)sub.textContent=done+' / '+total+' başarım tamamlandı';
  grid.innerHTML=ACHIEVEMENTS.map(function(a){
    var isDone=_achData.done.includes(a.id);
    return'<div class="ach-card'+(isDone?' done':'')+'" title="'+a.desc+'">'+
      '<span class="ach-icon">'+a.cat+'</span>'+
      '<div class="ach-name">'+a.name+'</div>'+
      (isDone?'<div style="font-size:7px;color:#44ff88;margin-top:2px;font-weight:800;">✅</div>':'')+
      '</div>';
  }).join('');
}
window._openAchPanel=function(){
  _renderAchPanel();
  var p=document.getElementById('ach-panel');
  if(p)p.classList.toggle('show');
};

// ── 5. GİZLİ MAĞARALAR ──────────────────────────────────────
var CAVES = [];
var _caveNearIdx = -1;
var _caveCooldown={};
var _caveVisited=parseInt(localStorage.getItem('fb_caves_visited')||'0',10);



// PERF: Pre-built cave glow image — replaces createRadialGradient() every frame per cave.
// Caves never move, so one shared 180×180 bitmap suffices for all cave glow blits.
var _caveGrdCache = null;
window._drawCavesHook=function(ctx){
  if(typeof player==='undefined'||!player)return;
  var t=typeof globalTime!=='undefined'?globalTime:0;
  _caveNearIdx=-1;
  // Build shared glow bitmap once — zero cost on subsequent frames
  if(!_caveGrdCache){
    try{
      var _cgOC=createRenderCanvas(180,180);
      var _cgCx=_cgOC.getContext('2d');
      var _cg=_cgCx.createRadialGradient(90,90,0,90,90,90);
      _cg.addColorStop(0,'rgba(80,0,180,0.45)');
      _cg.addColorStop(0.6,'rgba(40,0,100,0.2)');
      _cg.addColorStop(1,'rgba(0,0,0,0)');
      _cgCx.fillStyle=_cg;
      _cgCx.beginPath();_cgCx.arc(90,90,90,0,Math.PI*2);_cgCx.fill();
      _caveGrdCache=_cgOC;
    }catch(e){_caveGrdCache=false;} // fallback flag so we don't retry every frame
  }
  CAVES.forEach(function(cv,idx){
    var dx=cv.x-player.x,dy=cv.y-player.y;
    var dist2=dx*dx+dy*dy;
    // PERF: Skip caves beyond 1800px — well outside any viewport at all zoom levels
    if(dist2>1800*1800)return;
    var dist=Math.sqrt(dist2);
    var _caveThr=typeof _isMobile!=='undefined'&&_isMobile?180:120;if(dist<_caveThr)_caveNearIdx=idx;
    var pulse=0.82+Math.sin(t*0.045+idx*1.3)*0.18;
    ctx.save();
    ctx.translate(cv.x,cv.y);
    // Glow aura — blit cached bitmap instead of createRadialGradient each frame (major GPU save)
    if(_caveGrdCache){ctx.drawImage(_caveGrdCache,-90,-90);}
    else{ctx.globalAlpha=0.25;ctx.fillStyle='#5000b4';ctx.beginPath();ctx.arc(0,0,90,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    // Stone ground ring
    ctx.beginPath();ctx.arc(0,0,52,0,Math.PI*2);
    ctx.fillStyle='#2a2030';ctx.fill();
    ctx.strokeStyle='rgba(120,80,200,'+pulse+')';ctx.lineWidth=5;ctx.stroke();
    // Dark void
    ctx.beginPath();ctx.arc(0,0,38,0,Math.PI*2);
    ctx.fillStyle='#06030e';ctx.fill();
    // Inner swirl + rising particles — skip at quality 0 (saves 10 save/arc/fill/restore calls per cave)
    if(typeof _qualityLevel==='undefined'||_qualityLevel>=1){
    for(var ri=0;ri<6;ri++){
      var ra=(ri/6)*Math.PI*2+t*0.012;
      var rr=28+Math.sin(t*0.05+ri)*6;
      ctx.save();
      ctx.globalAlpha=0.5*pulse;
      ctx.fillStyle='rgba(140,60,255,0.5)';
      ctx.beginPath();ctx.arc(Math.cos(ra)*rr*0.5,Math.sin(ra)*rr*0.5,4,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    for(var pi2=0;pi2<4;pi2++){
      var pf=((t*1.2+pi2*30)%60)/60;
      ctx.save();
      ctx.globalAlpha=(pf<0.4?pf/0.4:1-((pf-0.4)/0.6))*0.7;
      ctx.fillStyle='#9944ff';
      var px2=Math.sin(t*0.025+pi2*1.5)*18;
      ctx.beginPath();ctx.arc(px2,-pf*55+10,3-pf*2,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    } // end quality>=1 loops
    // Label (proximity fade)
    if(dist<350){
      ctx.globalAlpha=Math.min(1,(350-dist)/160);
      ctx.font='bold 14px sans-serif';
      ctx.textAlign='center';
      ctx.fillStyle='#ddb8ff';
      ctx.fillText(cv.name,0,-60);
      if(dist<120){
        ctx.font='bold 11px sans-serif';
        ctx.fillStyle='rgba(255,255,255,0.7)';
        ctx.fillText('[E] Gir',0,-44);
      }
      ctx.globalAlpha=1;
    }
    ctx.restore();
  });
  // Show/hide prompt
  var pr=document.getElementById('cave-prompt');
  if(pr){if(_caveNearIdx>=0)pr.classList.add('show');else pr.classList.remove('show');}
};

function _enterCave(idx){
  if(idx<0||idx>=CAVES.length)return;
  var cv=CAVES[idx];
  var now=Date.now();
  if(_caveCooldown[cv.id]&&now-_caveCooldown[cv.id]<25000)return;
  _caveCooldown[cv.id]=now;
  // Track
  _caveVisited++;
  localStorage.setItem('fb_cave_entered','1');
  localStorage.setItem('fb_caves_visited',_caveVisited);
  // Flash
  var fl=document.createElement('div');
  fl.style.cssText='position:fixed;inset:0;z-index:9998;background:#080010;opacity:0;pointer-events:none;transition:opacity 0.35s;';
  document.body.appendChild(fl);
  requestAnimationFrame(function(){
    fl.style.opacity='0.88';
    setTimeout(function(){fl.style.opacity='0';setTimeout(function(){fl.remove();},380);},600);
  });
  // Popup
  if(typeof window._showAchPopup==='function')
    window._showAchPopup('🕳️',cv.name+' Keşfedildi!','Kristaller ve tehlikeli canavarlar seni bekliyor...');
  // Spawn crystal loot (use gold-type resources)
  if(typeof player!=='undefined'&&typeof resources!=='undefined'){
    for(var ci=0;ci<3+Math.floor(Math.random()*4);ci++){
      var ca=Math.random()*Math.PI*2,cd=70+Math.random()*110;
      var crystal = {
        x:player.x+Math.cos(ca)*cd,y:player.y+Math.sin(ca)*cd,
        type:3,radius:28,hp:25,maxHp:25,
        yW:0,yS:0,yG:8+Math.floor(Math.random()*12),
        yXp:50+Math.floor(Math.random()*30),_netIdx:-1
      };
      resources.push(crystal);
      _addResourceToGrid(crystal);
    }
  }
  setTimeout(_checkAchievements,200);
}

window.addEventListener('keydown',function(e){
  if((e.key==='e'||e.key==='E')&&_caveNearIdx>=0){
    try{if(typeof player!=='undefined'&&player&&!document.querySelector('#death-overlay.show'))_enterCave(_caveNearIdx);}catch(er){}
  }
});

// ── 6. BATTLE PASS ──────────────────────────────────────────
var _SEASON_MS=28*24*60*60*1000;
var _curSeason=Math.floor(Date.now()/_SEASON_MS);
var _BP_TIERS=[
  {t:1, xp:100,  r:'🪵 +200 Odun Bonusu',    type:'msg'},
  {t:2, xp:200,  r:'⭐ +500 Meta XP',          type:'xp',  v:500},
  {t:3, xp:350,  r:'💰 +300 Altın',            type:'gold', v:300},
  {t:4, xp:550,  r:'🏅 Unvan: Kahraman',       type:'msg'},
  {t:5, xp:800,  r:'⭐ +1000 Meta XP',         type:'xp',  v:1000},
  {t:6, xp:1100, r:'❤️ +15 Maks Can Bonusu',  type:'msg'},
  {t:7, xp:1450, r:'💰 +500 Altın',            type:'gold', v:500},
  {t:8, xp:1850, r:'⭐ +1500 Meta XP',         type:'xp',  v:1500},
  {t:9, xp:2300, r:'⚔️ +%5 Hasar Artışı',     type:'msg'},
  {t:10,xp:2800, r:'🏅 Unvan: Mevsimsel',       type:'msg'},
  {t:11,xp:3400, r:'⭐ +2000 Meta XP',         type:'xp',  v:2000},
  {t:12,xp:4100, r:'💰 +1000 Altın',           type:'gold', v:1000},
  {t:13,xp:4900, r:'💨 +%5 Hız Artışı',       type:'msg'},
  {t:14,xp:5800, r:'⭐ +3000 Meta XP',         type:'xp',  v:3000},
  {t:15,xp:6800, r:'🏅 Unvan: Kristal',        type:'msg'},
  {t:16,xp:7900, r:'💰 +2000 Altın',           type:'gold', v:2000},
  {t:17,xp:9100, r:'⭐ +5000 Meta XP',         type:'xp',  v:5000},
  {t:18,xp:10400,r:'⚔️ +%10 Hasar Artışı',    type:'msg'},
  {t:19,xp:11800,r:'🌙 Unvan: Gece Efendisi',  type:'msg'},
  {t:20,xp:13300,r:'👑 Unvan: Sezon Şampiyonu',type:'msg'},
];

var _bpData=(function(){
  try{var d=JSON.parse(localStorage.getItem('fb_bp_v1')||'null');if(d&&d.s===_curSeason)return d;}catch(e){}
  return null;
})() || {s:_curSeason,xp:0,t:0,c:[]};
function _saveBp(){try{localStorage.setItem('fb_bp_v1',JSON.stringify(_bpData));}catch(e){}}

function _bpUnlockedTier(){
  var t=0;
  for(var i=0;i<_BP_TIERS.length;i++){if(_bpData.xp>=_BP_TIERS[i].xp)t=i+1;else break;}
  return t;
}

function _renderBpPanel(){
  var tiersEl=document.getElementById('bp-tiers');
  var slbl=document.getElementById('bp-season-label');
  var fillEl=document.getElementById('bp-xp-fill');
  if(!tiersEl)return;
  var curT=_bpUnlockedTier();
  var maxXp=_BP_TIERS[_BP_TIERS.length-1].xp;
  if(slbl)slbl.textContent='Sezon '+((_curSeason%12)+1)+' • '+_bpData.xp+' / '+maxXp+' XP';
  if(fillEl)setTimeout(function(){fillEl.style.width=Math.min(100,Math.round(_bpData.xp/maxXp*100))+'%';},100);
  tiersEl.innerHTML=_BP_TIERS.map(function(bt){
    var unlocked=_bpData.xp>=bt.xp;
    var claimed=_bpData.c.includes(bt.t);
    var cls='bp-tier-row'+(claimed?' claimed':(unlocked?' unlocked':''));
    var btn='';
    if(unlocked&&!claimed)btn='<button class="bp-claim-btn" onclick="window._bpClaim('+bt.t+')">Topla</button>';
    else if(claimed)btn='<span style="color:#44ff88;font-size:10px;font-weight:800;">✅</span>';
    else btn='<button class="bp-claim-btn" disabled>'+bt.xp+' XP</button>';
    return'<div class="'+cls+'"><div class="bp-tier-num">'+bt.t+'</div><div class="bp-tier-reward">'+bt.r+'</div>'+btn+'</div>';
  }).join('');
}

window._bpClaim=function(tier){
  if(_bpData.c.includes(tier))return;
  var bt=_BP_TIERS.find(function(b){return b.t===tier;});
  if(!bt||_bpData.xp<bt.xp)return;
  _bpData.c.push(tier);_saveBp();
  if(bt.type==='xp'){_meta.xp+=bt.v;_meta.lv=_metaLevelOf(_meta.xp);_saveMeta();}
  else if(bt.type==='gold'){var g=parseInt(localStorage.getItem('fb_gold')||'0',10)+bt.v;localStorage.setItem('fb_gold',g);}
  if(typeof window._showAchPopup==='function')window._showAchPopup('🎫','Battle Pass Ödülü!',bt.r);
  _renderBpPanel();_updateMetaHud();
};
window._openBpPanel=function(){_renderBpPanel();var p=document.getElementById('bp-panel');if(p)p.classList.toggle('show');};

// ── 7. HUD GÜNCELLEME ────────────────────────────────────────
function _updateMetaHud(){
  var tBadge=document.getElementById('trophy-badge');
  var mBadge=document.getElementById('meta-badge');
  if(!tBadge||!mBadge)return;
  var lg=getLeague(_trophy.n);
  tBadge.textContent=lg.emoji+' '+_trophy.n+' 🏆';
  tBadge.className='tmh-badge '+lg.bg;
  mBadge.textContent='⭐ Sv.'+_meta.lv;
  if(_meta.lv>=10)mBadge.style.color='#ffd700';
  else mBadge.style.color='#fff';
}

// ── 8. DEATH SCREEN ─────────────────────────────────────────
function _showDeathBars(tRes,mRes){
  var tBar=document.getElementById('death-trophy-bar');
  var mBar=document.getElementById('death-meta-bar');
  if(tBar&&tRes){
    tBar.style.display='block';
    var lg=getLeague(tRes.newN);
    var nxLg=nextLeague(lg);
    var pct=lg.id>=LEAGUES.length-1?100:Math.min(100,Math.round((tRes.newN-lg.min)/(nxLg.min-lg.min)*100));
    var netStr=(tRes.net>=0?'+':'')+tRes.net+' 🏆';
    var netCol=tRes.net>=0?'#44ff88':'#ff5566';
    var lbl=document.getElementById('death-trophy-label');
    var fill=document.getElementById('death-trophy-fill');
    var sub=document.getElementById('death-trophy-sub');
    if(lbl)lbl.innerHTML='<span>'+lg.emoji+' '+lg.name+' — '+tRes.newN+'</span><span style="color:'+netCol+'">'+netStr+'</span>';
    if(fill){fill.style.background=lg.color;setTimeout(function(){fill.style.width=pct+'%';},120);}
    if(sub)sub.textContent=tRes.newN+' / '+nxLg.min+' — '+nxLg.emoji+' '+nxLg.name;
  }
  if(mBar&&mRes){
    mBar.style.display='block';
    var curLv=mRes.newLv;
    var lvStart=META_XP_TABLE[Math.min(curLv-1,49)];
    var lvEnd=curLv>=50?lvStart+99999:META_XP_TABLE[Math.min(curLv,49)];
    var mPct=curLv>=50?100:Math.min(100,Math.round((mRes.newXp-lvStart)/(lvEnd-lvStart)*100));
    var lvUpStr=mRes.newLv>mRes.oldLv?' (Seviye Atladı: '+mRes.oldLv+'→'+mRes.newLv+')':'';
    var mlbl=document.getElementById('death-meta-label');
    var mfill=document.getElementById('death-meta-fill');
    var msub=document.getElementById('death-meta-sub');
    if(mlbl)mlbl.innerHTML='<span>⭐ Meta Sv.'+mRes.newLv+lvUpStr+'</span><span style="color:#44ff88;">+'+mRes.earned+' XP</span>';
    if(mfill)setTimeout(function(){mfill.style.width=mPct+'%';},220);
    if(msub)msub.textContent=mRes.newXp+' / '+(curLv<50?lvEnd:'∞')+' XP';
    if(mRes.newLv>mRes.oldLv&&typeof window._showAchPopup==='function'){
      setTimeout(function(){window._showAchPopup('⭐','Seviye Atladı! → '+mRes.newLv,_bonusDescForLevel(mRes.newLv));},1200);
    }
  }
}

// ── 9. GÖREV PANELİ BUTONLARI ───────────────────────────────
(function(){
  // Expand quest pool
  if(typeof window._QUEST_POOL!=='undefined'&&Array.isArray(window._QUEST_POOL)){
    var extras=[
      {id:'stone50',  name:'Taş Toplayıcı',  goal:50,  unit:'taş',    key:'stone',  emoji:'🪨',reward:'+90🪙'},
      {id:'kills15',  name:'Acımasız',        goal:15,  unit:'kill',   key:'kills',  emoji:'⚔️', reward:'+350🪙'},
      {id:'kills3',   name:'İlk Adım',        goal:3,   unit:'kill',   key:'kills',  emoji:'🗡️', reward:'+60🪙'},
      {id:'wood200',  name:'Büyük Ormancı',   goal:200, unit:'odun',   key:'wood',   emoji:'🌳',reward:'+300🪙'},
      {id:'survive5', name:'Uzun Hayatta',    goal:5,   unit:'dakika', key:'time',   emoji:'⏱️', reward:'+180🪙'},
      {id:'survive10',name:'Dayanıklı',       goal:10,  unit:'dakika', key:'time',   emoji:'🕐',reward:'+350🪙'},
      {id:'gold200',  name:'Altın Madeni',    goal:200, unit:'altın',  key:'gold',   emoji:'💎',reward:'+250🪙'},
      {id:'builds10', name:'Kale İnşaatı',    goal:10,  unit:'bina',   key:'builds', emoji:'🏰',reward:'+220🪙'},
      {id:'kills30',  name:'Kâbus',           goal:30,  unit:'kill',   key:'kills',  emoji:'💥',reward:'+600🪙'},
      {id:'wood500',  name:'Orman Lordu',     goal:500, unit:'odun',   key:'wood',   emoji:'🌲',reward:'+500🪙'},
    ];
    var existIds=window._QUEST_POOL.map(function(q){return q.id;});
    extras.forEach(function(q){if(!existIds.includes(q.id))window._QUEST_POOL.push(q);});
  }
  // Add buttons to quest panel
  setTimeout(function(){
    var qh=document.getElementById('quest-panel-hdr') || document.getElementById('quest-header') || document.getElementById('quest-panel');
    if(!qh||document.getElementById('_ach-btn'))return;
    var row=document.createElement('div');
    row.style.cssText='display:flex;gap:4px;padding:5px 8px 6px;border-top:1px solid rgba(255,255,255,0.06);';
    row.innerHTML=
      '<button id="_ach-btn" onclick="window._openAchPanel&&window._openAchPanel()" style="flex:1;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.2);color:#e8c840;border-radius:7px;padding:4px 2px;font-size:9px;font-weight:800;cursor:pointer;font-family:inherit;">🏅 Başarımlar</button>'+
      '<button id="_bp-btn"  onclick="window._openBpPanel&&window._openBpPanel()"  style="flex:1;background:rgba(140,80,220,0.1);border:1px solid rgba(140,80,220,0.25);color:#cc88ff;border-radius:7px;padding:4px 2px;font-size:9px;font-weight:800;cursor:pointer;font-family:inherit;">🎫 Battle Pass</button>';
    var qb=document.getElementById('quest-body');
    if(qb)qb.parentNode.insertBefore(row,qb.nextSibling);
    else qh.appendChild(row);
  },900);
})();

// ── 10. BİYOM TAKİBİ ────────────────────────────────────────
setInterval(function(){
  try{
    if(typeof playerBiome!=='undefined'&&playerBiome&&playerBiome!=='forest'){
      if(!localStorage.getItem('fb_biome_'+playerBiome)){
        localStorage.setItem('fb_biome_'+playerBiome,'1');
        _checkAchievements();
      }
    }
  }catch(e){}
},5000);

// ── 11. ANA ENTEGRASYON ──────────────────────────────────────
window._metaOnDie=function(kills,timeSec,score){
  try{
    var tRes=_applyTrophyResult(kills,timeSec);
    var mRes=_applyMetaXp(kills,timeSec,score);
    _bpData.xp+=mRes.earned;_saveBp();
    _checkAchievements();
    setTimeout(function(){_showDeathBars(tRes,mRes);},350);
    _updateMetaHud();
  }catch(e){}
};

// Initial
_updateMetaHud();
setTimeout(_checkAchievements,1200);

})();
