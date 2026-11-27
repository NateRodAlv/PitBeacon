const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./codemirror-Cb9nMA79.js","./rolldown-runtime-XKyaHtl9.js","./codemirror-DQxhl3h3.css"])))=>i.map(i=>d[i]);
import{S as e,_ as t,a as n,b as r,c as i,d as a,f as o,g as s,l as c,m as l,n as u,o as d,r as f,t as p,u as m,v as h,x as g,y as _}from"./robotParts-qXroFm2z.js";var v={"webcast-card":{x:0,y:0,width:1,height:1},"match-card":{x:2,y:0,width:1,height:3},"robot-viewer-card":{x:0,y:1,width:1,height:2},"leaderboard-card":{x:1,y:0,width:1,height:3}},y={teamNumber:7250,tbaapikey:`YOUR_AUTH_KEY`,match13apikey:``,match13ProxyUrl:`https://pitbeacon.rodriguezalvaradonathan.workers.dev`,noteAlarmToggle:!1,noteAlarmThreshold:8,noteAlarmSound:`alarm1`,matchAlarmToggle:!0,matchAlertThreshold:300,showNextMatchBanner:!0,showCardStatusDots:!0,autoHideTopBar:!1,autoHideTopBarDelay:5,matchAlarmSound:`alarm1`,gridSize:3,gridCols:3,gridRows:3,hiddenSections:[],layout:structuredClone(v),activeProfileName:`Default`,layoutProfiles:{},autoSwapEnabled:!1,autoSwapInterval:30,supabaseUrl:`https://mbojqtezmtngsehtyzpa.supabase.co`,supabaseAnonKey:`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ib2pxdGV6bXRuZ3NlaHR5enBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzcxNjAsImV4cCI6MjEwMzk1MzE2MH0.5PArCN5Nz9Aubc2t5iPas4qlo9oLDWxyJ8tMC_e7h90`,cardSubmitFunctionUrl:`https://mbojqtezmtngsehtyzpa.supabase.co/functions/v1/index`,defaultCards:[{id:`webcast-card`,label:`Webcasts`,icon:`device-tv`,lockedAspect:16/11,selfRefresh:!1,builtin:!0},{id:`match-card`,label:`Matches`,icon:`tournament`,selfRefresh:!1,builtin:!0},{id:`leaderboard-card`,label:`Leaderboard`,icon:`trophy`,selfRefresh:!1,builtin:!0},{id:`pit-notes-card`,label:`Pit Notes`,icon:`tool`,selfRefresh:!1,builtin:!0},{id:`robot-viewer-card`,label:`3D Robot Viewer`,icon:`cube`,selfRefresh:!0,builtin:!0},{id:`stats-card`,label:`Team Stats`,icon:`chart-bar`,selfRefresh:!1,builtin:!0}],developerCards:{}},b=class{constructor(e={}){this._state={...e},this._listeners=[]}getState(){return{...this._state}}update(e){let t=[];for(let[n,r]of Object.entries(e))JSON.stringify(this._state[n])!==JSON.stringify(r)&&(this._state[n]=r,t.push(n));if(t.length>0){let e=this.getState();this._listeners.forEach(n=>n(e,t))}return this}subscribe(e){return this._listeners.push(e),()=>{let t=this._listeners.indexOf(e);t>=0&&this._listeners.splice(t,1)}}reset(){return this._state={},this._listeners=[],this}},ee=class e{static _fetchCache=new Map;static _inFlight=new Map;constructor(e,t,n,r,i=null){this._state=e,this._dataSources=t,this._audioFiles=n,this._config=r,this._cardId=i,this._listeners=[],this._storage=this._buildStorage()}getState(){return this._state.getState()}onStateChange(e){return this._state.subscribe(e)}async fetchDataSource(e){return this._dataSources.fetch(e)}getDataSourceNames(){return this._dataSources.getSourceNames()}getCardSettings(e,t={}){try{let n=JSON.parse(localStorage.getItem(`cardSettings`)||`{}`);return{...t,...n[e]||{}}}catch(n){return console.warn(`Failed to load settings for card "${e}":`,n),t}}async refreshTeamData(){return typeof window.pitbeaconRefreshTeamData==`function`?window.pitbeaconRefreshTeamData():null}updateCard(e,t,n=null,r=null){e.selfRefresh=!0,!e||typeof t!=`number`||t<=0||e._cardTimer&&e._cardTimerInterval===t&&e._cardRefreshCallback===n&&e._cardCompareFn===r||(e._cardTimer&&clearInterval(e._cardTimer),e._cardTimerInterval=t,e._cardRefreshCallback=n,e._cardCompareFn=r,e._cardTimer=setInterval(()=>{if(!e.isConnected)return;let t=this.getState();if(t)try{let i=r?r(t,this):t,a=JSON.stringify(i);if(e._lastCardSnapshot===a)return;e._lastCardSnapshot=a,typeof n==`function`?n(e,t,this):window._pitbeaconRender?window._pitbeaconRender():e.innerHTML=``}catch(e){console.error(`Card refresh failed:`,e)}},t))}async fetchCustom(t,n={}){let{method:r=`GET`,headers:i={},body:a=null,timeoutMs:o=8e3,cacheSeconds:s=0,parse:c=null}=n,l=e._buildFetchCacheKey(r,t,a);if(s>0){let t=e._fetchCache.get(l);if(t&&(Date.now()-t.timestamp)/1e3<s)return t.result}if(e._inFlight.has(l))return e._inFlight.get(l);let u=this._performFetch(t,{method:r,headers:i,body:a,timeoutMs:o,parse:c},l,s);e._inFlight.set(l,u);try{return await u}finally{e._inFlight.delete(l)}}async _performFetch(t,{method:n,headers:r,body:i,timeoutMs:a,parse:o},s,c){let l=new AbortController,u=setTimeout(()=>l.abort(),a),d;try{let e=await fetch(t,{method:n,headers:r,body:n===`GET`||n===`HEAD`?void 0:i,signal:l.signal}),a=await e.text();if(!e.ok)d={ok:!1,data:null,error:`HTTP ${e.status}`,status:e.status};else try{d={ok:!0,data:o?o(a):a?JSON.parse(a):null,error:null,status:e.status}}catch(t){d={ok:!1,data:null,error:`Parse error: ${t.message}`,status:e.status}}}catch(e){d={ok:!1,data:null,error:e.name===`AbortError`?`Request timed out after ${a}ms`:e.message||`Network error`,status:null}}finally{clearTimeout(u)}return c>0&&d.ok&&e._fetchCache.set(s,{timestamp:Date.now(),result:d}),d}static _buildFetchCacheKey(e,t,n){return`${e}::${t}::${n||``}`}triggerAlarm(e){let t={match:this._config.matchAlarmSound||`alarm1`,note:this._config.noteAlarmSound||`alarm1`}[e]||e||`alarm1`;this._audioFiles[t]||(console.warn(`triggerAlarm: unknown sound "${t}", falling back to alarm1`),t=`alarm1`);let n=this._audioFiles[t];return n&&(n.currentTime=0,n.play().catch(e=>console.warn(`Audio play failed:`,e))),this}getAlarmSounds(){return Object.keys(this._audioFiles)}notify(e,t=`message`){return window._pitbeaconNotify?window._pitbeaconNotify(e,t):console.log(`[${t}] ${e}`),this}get storage(){return this._storage}storageFor(e){return e?(this._scopedStorage??=new Map,this._scopedStorage.has(e)||this._scopedStorage.set(e,this._buildStorage(e)),this._scopedStorage.get(e)):this._storage}_buildStorage(e=this._cardId){let t=`pitbeaconCardStorage:${e||`global`}:`;return{get:n=>{try{let r=window.localStorage.getItem(t+n);if(r===null&&e){let e=window.localStorage.getItem(`pitbeaconCardStorage:global:`+n);e!==null&&(window.localStorage.setItem(t+n,e),r=e)}return r===null?null:JSON.parse(r)}catch(e){return console.warn(`sdk.storage.get failed:`,e),null}},set:(e,n)=>{try{return window.localStorage.setItem(t+e,JSON.stringify(n)),!0}catch(e){return console.warn(`sdk.storage.set failed:`,e),!1}},delete:e=>{try{return window.localStorage.removeItem(t+e),!0}catch(e){return console.warn(`sdk.storage.delete failed:`,e),!1}}}}getConfig(e){let t=[`teamNumber`,`match13apikey`,`match13ProxyUrl`,`matchAlarmSound`,`noteAlarmSound`,`noteAlarmToggle`,`eventName`];if(e===void 0){let e={};for(let n of t.filter(e=>e!==`match13apikey`))n in this._config&&(e[n]=this._config[n]);return e}return t.includes(e)?this._config[e]:null}},x=new URL(`alarm1-V4sBKpwn.mp3`,import.meta.url).href,S=new URL(`alarm2-BkbZr_pM.mp3`,import.meta.url).href,C=new URL(`alarm3-DsESxpda.mp3`,import.meta.url).href,te=new URL(`beep-COkWJPT7.mp3`,import.meta.url).href,ne={alarm1:new Audio(x),alarm2:new Audio(S),alarm3:new Audio(C),beep:new Audio(te)};Object.values(ne).forEach(e=>{e.onerror=()=>console.warn(`Audio file failed to load`)});var re=class{constructor(){this._cards=new Map,this._listeners=[]}register(e,t){return this._cards.has(e)&&!t.allowOverride?(console.warn(`Card "${e}" already registered. Use allowOverride to replace.`),this):(this._cards.set(e,t),this._notify(`register`,e),this)}unregister(e){if(this._cards.has(e)){let t=this._cards.get(e);if(t.builtin&&!t.allowUnregister)return console.warn(`Cannot unregister built-in card "${e}"`),this;this._cards.delete(e),this._notify(`unregister`,e)}return this}get(e){return this._cards.get(e)||null}has(e){return this._cards.has(e)}listCards(){return Array.from(this._cards.keys())}listBuiltin(){return Array.from(this._cards.entries()).filter(([e,t])=>t.builtin).map(([e,t])=>e)}listDeveloper(){return Array.from(this._cards.entries()).filter(([e,t])=>t.developer).map(([e,t])=>e)}getDefinitions(){let e={};for(let[t,n]of this._cards)e[t]={...n};return e}subscribe(e){return this._listeners.push(e),()=>{let t=this._listeners.indexOf(e);t>=0&&this._listeners.splice(t,1)}}_notify(e,t){let n=this._cards.get(t);this._listeners.forEach(r=>r(e,t,n))}},ie=class{constructor(e){this._registry=e}validate(t,n=3,r=3){let i=[],a=[],o=[];for(let[e,s]of Object.entries(t))if(this._validatePosition(s,n,r)||i.push(`Card "${e}" has invalid position (${s.x},${s.y}) ${s.width}×${s.height}`),!this._registry.has(e)){a.push(`Card "${e}" not found in registry`);let n=`__fallback_${e}`;t[n]={...s},delete t[e],o.push({originalId:e,replacementId:n,position:s})}let s=this._findOverlaps(t);s.length>0&&a.push(`Overlapping cards: ${s.join(`, `)}`);for(let t of o)this._registry.has(t.replacementId)||this._registry.register(t.replacementId,{id:t.replacementId,label:`Missing: ${t.originalId}`,icon:`alert-circle`,builtin:!1,fallback:!0,render:(n,r,i)=>{n.innerHTML=`
                            <div class="fallback-card">
                                <div class="fallback-icon">${e(`warning`,32)}</div>
                                <div class="fallback-title">Missing Card</div>
                                <div class="fallback-id">${t.originalId}</div>
                                <div class="fallback-hint">This card was not found in the registry.</div>
                                <div class="fallback-actions">
                                    <button class="fallback-remove" data-card="${t.replacementId}">Remove from layout</button>
                                </div>
                            </div>
                        `;let a=n.querySelector(`.fallback-remove`);a&&a.addEventListener(`click`,()=>{let e=i.getConfig().layout||{};delete e[t.replacementId],localStorage.setItem(`layout`,JSON.stringify(e)),window._pitbeaconRender&&window._pitbeaconRender()})}});return{valid:i.length===0,errors:i,warnings:a,fallbackInjections:o,layout:{...t}}}_validatePosition(e,t,n){let{x:r,y:i,width:a,height:o}=e;return!(r<0||i<0||a<1||o<1||r+a>t||i+o>n)}_findOverlaps(e){let t=[],n=Object.keys(e);for(let r=0;r<n.length;r++)for(let i=r+1;i<n.length;i++)this._rectsOverlap(e[n[r]],e[n[i]])&&t.push(`${n[r]} ↔ ${n[i]}`);return t}_rectsOverlap(e,t){return e.x<t.x+t.width&&e.x+e.width>t.x&&e.y<t.y+t.height&&e.y+e.height>t.y}},ae=`modulepreload`,oe=function(e,t){return new URL(e,t).href},w={},T=function(e){return e.pathname.endsWith(`.css`)},se=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},ce=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=oe(t,n);let r=s(t),i=T(r);return se(w,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:ae,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{let i=a=>{t.removeEventListener(`load`,i),t.removeEventListener(`error`,i),a.type===`error`?n(Error(`Unable to preload CSS for ${r}`)):e(a)};t.addEventListener(`load`,i),t.addEventListener(`error`,i)})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},le=class{constructor(e,t){this._registry=e,this._sdk=t,this._sandboxes=new Map,this._editorState={id:`dev-card-1`,label:`My Custom Card`,html:`<div class="dev-card-content">
    <h3>My Custom Card</h3>
    <p>State: <span id="stateDisplay">Loading...</span></p>
    <button id="fetchBtn">Fetch Data</button>
    <div id="result"></div>
</div>`,css:`.dev-card-content { padding: 8px; }
.dev-card-content h3 { margin: 0 0 6px 0; color: var(--text-primary); }
.dev-card-content p { color: var(--text-muted); }
#fetchBtn { background: var(--accent); color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; }
#fetchBtn:hover { background: var(--accent-hover); }`,js:`const sdk = window.__pitbeaconSDK;

sdk.onStateChange((state) => {
    const el = document.getElementById('stateDisplay');
    if (el) el.textContent = state.currentMatch ? 
        'Match ' + state.currentMatch.comp_level + ' ' + state.currentMatch.match_number : 
        'No active match';
});

document.getElementById('fetchBtn')?.addEventListener('click', async function() {
    try {
        const data = await sdk.fetchDataSource('currentMatches');
        document.getElementById('result').textContent = 
            data ? 'Found ' + data.length + ' matches' : 'No data';
    } catch(e) {
        document.getElementById('result').textContent = 'Error: ' + e.message;
    }
});`}}createCardDefinition(e,t){return{id:e,label:t.label||e,icon:`code`,developer:!0,builtin:!1,html:t.html,css:t.css,js:t.js,settings:t.settings||{},settingsValues:t.settingsValues||{},render:(n,r,i)=>{this._renderDevCard(n,e,t,r,i)}}}_renderDevCard(e,t,n,r,i){let a=(n.html||``)+`||`+(n.css||``)+`||`+(n.js||``)+`||`+JSON.stringify(n.settingsValues||{}),o=this._sandboxes.get(t);if(o&&o.defSignature===a){if(o.element===e&&document.contains(o.iframe)){try{o.iframe.contentWindow.postMessage({type:`stateUpdate`,state:r},`*`)}catch(e){console.warn(`Failed to push state update to card sandbox:`,e)}return}if(document.contains(o.iframe)){e.innerHTML=``,e.appendChild(o.iframe),o.element=e;try{o.iframe.contentWindow.postMessage({type:`stateUpdate`,state:r},`*`)}catch(e){console.warn(`Failed to push state update to card sandbox:`,e)}return}}o&&o.cleanup&&o.cleanup(),this._sandboxes.delete(t),e.innerHTML=``,e.selfRefresh=!1;let s=document.createElement(`iframe`);s.style.cssText=`width:100%;height:100%;border:none;border-radius:4px;background:var(--bg-surface);`,s.sandbox=`allow-scripts`,e.appendChild(s);let c=getComputedStyle(document.documentElement),l={"--bg-surface":c.getPropertyValue(`--bg-surface`).trim()||`#2a2a2a`,"--bg-raised":c.getPropertyValue(`--bg-raised`).trim()||`#3a3a3a`,"--bg-input":c.getPropertyValue(`--bg-input`).trim()||`#4a4a4a`,"--bg-base":c.getPropertyValue(`--bg-base`).trim()||`#1a1a1a`,"--accent":c.getPropertyValue(`--accent`).trim()||`#2f3070`,"--accent-hover":c.getPropertyValue(`--accent-hover`).trim()||`#3c3e8c`,"--border":c.getPropertyValue(`--border`).trim()||`rgba(255,255,255,0.07)`,"--border-accent":c.getPropertyValue(`--border-accent`).trim()||`rgba(47,48,112,0.6)`,"--text-primary":c.getPropertyValue(`--text-primary`).trim()||`#f0f0f0`,"--text-muted":c.getPropertyValue(`--text-muted`).trim()||`#a09b9b`,"--text-dim":c.getPropertyValue(`--text-dim`).trim()||`#646262`,"--scrollbar-track":c.getPropertyValue(`--scrollbar-track`).trim()||`rgba(255,255,255,0.03)`,"--scrollbar-thumb":c.getPropertyValue(`--scrollbar-thumb`).trim()||`rgba(255,255,255,0.12)`,"--scrollbar-thumb-hover":c.getPropertyValue(`--scrollbar-thumb-hover`).trim()||`rgba(255,255,255,0.22)`},u=`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
            --bg-surface: ${l[`--bg-surface`]};
            --bg-raised: ${l[`--bg-raised`]};
            --bg-input: ${l[`--bg-input`]};
            --bg-base: ${l[`--bg-base`]};
            --accent: ${l[`--accent`]};
            --accent-hover: ${l[`--accent-hover`]};
            --border: ${l[`--border`]};
            --border-accent: ${l[`--border-accent`]};
            --text-primary: ${l[`--text-primary`]};
            --text-muted: ${l[`--text-muted`]};
            --text-dim: ${l[`--text-dim`]};
        }
          ::-webkit-scrollbar { width: 5px; height: 5px; }
          ::-webkit-scrollbar-track {
            background: var(--scrollbar-track);
            border-radius: 99px;
          }
          ::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb);
            border-radius: 99px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbar-thumb-hover);
          }
        body { 
            font-family: 'Rubik', sans-serif; 
            background: var(--bg-surface, #2a2a2a);
            color: var(--text-primary, #f0f0f0);
            padding: 8px;
            overflow: auto;
            margin: 0;
            min-height: 100vh;
        }
        ${n.css||``}
    </style>
</head>
<body>
    ${n.html||`<div class="dev-card-content"><p>No HTML defined</p></div>`}
<script>
        // Create SDK bridge - only declare once
        (function() {
            // SDK bridge functions
            var sdk = {
                _callbacks: [],
                _state: null,
                _cardTimer: null,
                _lastCardSnapshot: null,
                
                getState: function() {
                    return this._state;
                },

                getSetting: function(name, fallback) {
                  var settings = window.__pitbeaconCardSettings || {};
                  return Object.prototype.hasOwnProperty.call(settings, name) ? settings[name] : fallback;
                },

                configurable: function(name, defaultValue, options) {
                  var settings = window.__pitbeaconCardSettings || {};
                  return Object.prototype.hasOwnProperty.call(settings, name) ? settings[name] : defaultValue;
                },
                
                onStateChange: function(cb) {
                    this._callbacks.push(cb);
                    if (this._state) cb(this._state);
                    return function() {
                        var idx = this._callbacks.indexOf(cb);
                        if (idx >= 0) this._callbacks.splice(idx, 1);
                    }.bind(this);
                },
                
                fetchDataSource: function(name) {
                    return new Promise(function(resolve, reject) {
                        var id = Date.now() + Math.random();
                        var handler = function(e) {
                            if (e.data.type === 'fetchResponse' && e.data.id === id) {
                                window.removeEventListener('message', handler);
                                if (e.data.error) reject(new Error(e.data.error));
                                else resolve(e.data.data);
                            }
                        };
                        window.addEventListener('message', handler);
                        window.parent.postMessage({
                            type: 'fetchDataSource',
                            id: id,
                            name: name
                        }, '*');
                    });
                },

                getDataSourceNames: function() {
                    return new Promise(function(resolve) {
                        var id = Date.now() + '-' + Math.random();
                        var handler = function(e) {
                            if (e.data.type === 'getDataSourceNamesResponse' && e.data.id === id) {
                                window.removeEventListener('message', handler);
                                resolve(e.data.names || []);
                            }
                        };
                        window.addEventListener('message', handler);
                        window.parent.postMessage({ type: 'getDataSourceNames', id: id }, '*');
                    });
                },

                fetchCustom: function(url, options) {
                    options = options || {};
                    return new Promise(function(resolve) {
                        var id = Date.now() + '-' + Math.random();
                        var handler = function(e) {
                            if (e.data.type === 'fetchCustomResponse' && e.data.id === id) {
                                window.removeEventListener('message', handler);
                                resolve(e.data.result);
                            }
                        };
                        window.addEventListener('message', handler);
                        window.parent.postMessage({
                            type: 'fetchCustom',
                            id: id,
                            url: url,
                            method: options.method || 'GET',
                            headers: options.headers || {},
                            body: options.body || null,
                            timeoutMs: options.timeoutMs || 8000,
                            cacheSeconds: options.cacheSeconds || 0,
                            parseSource: options.parse ? options.parse.toString() : null
                        }, '*');
                    });
                },
                
                triggerAlarm: function(nameOrPreset) {
                    window.parent.postMessage({
                        type: 'triggerAlarm',
                        nameOrPreset: nameOrPreset
                    }, '*');
                },

                getAlarmSounds: function() {
                    return new Promise(function(resolve) {
                        var id = Date.now() + '-' + Math.random();
                        var handler = function(e) {
                            if (e.data.type === 'getAlarmSoundsResponse' && e.data.id === id) {
                                window.removeEventListener('message', handler);
                                resolve(e.data.sounds || []);
                            }
                        };
                        window.addEventListener('message', handler);
                        window.parent.postMessage({ type: 'getAlarmSounds', id: id }, '*');
                    });
                },
                
                notify: function(message, type) {
                    window.parent.postMessage({
                        type: 'notify',
                        message: message,
                        notificationType: type || 'message'
                    }, '*');
                },

                storage: {
                    get: function(key) {
                        return new Promise(function(resolve) {
                            var id = Date.now() + '-' + Math.random();
                            var handler = function(e) {
                                if (e.data.type === 'storageGetResponse' && e.data.id === id) {
                                    window.removeEventListener('message', handler);
                                    resolve(e.data.value);
                                }
                            };
                            window.addEventListener('message', handler);
                            window.parent.postMessage({ type: 'storageGet', id: id, key: key }, '*');
                        });
                    },
                    set: function(key, value) {
                        return new Promise(function(resolve) {
                            var id = Date.now() + '-' + Math.random();
                            var handler = function(e) {
                                if (e.data.type === 'storageSetResponse' && e.data.id === id) {
                                    window.removeEventListener('message', handler);
                                    resolve(e.data.success);
                                }
                            };
                            window.addEventListener('message', handler);
                            window.parent.postMessage({ type: 'storageSet', id: id, key: key, value: value }, '*');
                        });
                    },
                    delete: function(key) {
                        return new Promise(function(resolve) {
                            var id = Date.now() + '-' + Math.random();
                            var handler = function(e) {
                                if (e.data.type === 'storageDeleteResponse' && e.data.id === id) {
                                    window.removeEventListener('message', handler);
                                    resolve(e.data.success);
                                }
                            };
                            window.addEventListener('message', handler);
                            window.parent.postMessage({ type: 'storageDelete', id: id, key: key }, '*');
                        });
                    }
                },

                getConfig: function() {
                    return new Promise(function(resolve) {
                        var id = Date.now() + '-' + Math.random();
                        var handler = function(e) {
                            if (e.data.type === 'getConfigResponse' && e.data.id === id) {
                                window.removeEventListener('message', handler);
                                resolve(e.data.config || {});
                            }
                        };
                        window.addEventListener('message', handler);
                        window.parent.postMessage({ type: 'getConfig', id: id }, '*');
                    });
                },

                // Opts this card out of the default per-tick render (which just
                // pushes a fresh stateUpdate into this iframe every tick) in favor
                // of a self-managed interval with its own change-detection. Runs
                // entirely inside this iframe since neither a DOM element nor a
                // function can cross the postMessage boundary to the parent page —
                // only a one-time signal to stop the default push is sent out.
                updateCard: function(interval, refreshCallback, compareFn) {
                    if (typeof interval !== 'number' || interval <= 0) return;
                    if (this._cardTimer) clearInterval(this._cardTimer);

                    window.parent.postMessage({ type: 'markSelfRefresh' }, '*');

                    this._cardTimer = setInterval(function() {
                        if (!sdk._state) return;
                        try {
                            var snapshot = compareFn ? compareFn(sdk._state, sdk) : sdk._state;
                            var serialized = JSON.stringify(snapshot);
                            if (sdk._lastCardSnapshot === serialized) return;
                            sdk._lastCardSnapshot = serialized;

                            if (typeof refreshCallback === 'function') {
                                refreshCallback(sdk._state, sdk);
                            }
                        } catch (err) {
                            console.error('Card refresh failed:', err);
                        }
                    }, interval);
                }
            };
            
            
            // Listen for state updates from parent
            window.addEventListener('message', function(e) {
                if (e.data.type === 'stateUpdate') {
                    sdk._state = e.data.state;
                    sdk._callbacks.forEach(function(cb) { cb(sdk._state); });
                }
            });
            
            // Request initial state
            window.parent.postMessage({ type: 'getState' }, '*');
            
            // Store SDK globally for user code
            window.__pitbeaconSDK = sdk;
        })();
        
        // User code is scoped separately from the sandbox wrapper so card-level
        // const/let declarations cannot collide with runtime internals.
        (function() {
          window.__pitbeaconCardSettings = ${JSON.stringify(n.settingsValues||{}).replace(/</g,`\\u003c`)};
          ${n.js||``}
        })();
    <\/script>
</body>
</html>`,d=new Blob([u],{type:`text/html`}),f=URL.createObjectURL(d);s.src=f;let p=n=>{if(n.source===s.contentWindow)switch(n.data.type){case`getState`:{let e=i.getState();s.contentWindow.postMessage({type:`stateUpdate`,state:e},`*`);break}case`fetchDataSource`:i.fetchDataSource(n.data.name).then(e=>{s.contentWindow.postMessage({type:`fetchResponse`,id:n.data.id,data:e},`*`)}).catch(e=>{s.contentWindow.postMessage({type:`fetchResponse`,id:n.data.id,error:e.message},`*`)});break;case`markSelfRefresh`:e.selfRefresh=!0;break;case`triggerAlarm`:i.triggerAlarm(n.data.nameOrPreset);break;case`notify`:i.notify(n.data.message,n.data.notificationType);break;case`getDataSourceNames`:{let e=i.getDataSourceNames();s.contentWindow.postMessage({type:`getDataSourceNamesResponse`,id:n.data.id,names:e},`*`);break}case`getAlarmSounds`:{let e=i.getAlarmSounds();s.contentWindow.postMessage({type:`getAlarmSoundsResponse`,id:n.data.id,sounds:e},`*`);break}case`getConfig`:{let e=i.getConfig();s.contentWindow.postMessage({type:`getConfigResponse`,id:n.data.id,config:e},`*`);break}case`storageGet`:{let e=i.storageFor(t).get(n.data.key);s.contentWindow.postMessage({type:`storageGetResponse`,id:n.data.id,value:e},`*`);break}case`storageSet`:{let e=i.storageFor(t).set(n.data.key,n.data.value);s.contentWindow.postMessage({type:`storageSetResponse`,id:n.data.id,success:e},`*`);break}case`storageDelete`:{let e=i.storageFor(t).delete(n.data.key);s.contentWindow.postMessage({type:`storageDeleteResponse`,id:n.data.id,success:e},`*`);break}case`fetchCustom`:{let e=null;if(n.data.parseSource)try{e=Function(`return (`+n.data.parseSource+`)`)()}catch(e){s.contentWindow.postMessage({type:`fetchCustomResponse`,id:n.data.id,result:{ok:!1,data:null,error:`Invalid parse function: ${e.message}`,status:null}},`*`);break}i.fetchCustom(n.data.url,{method:n.data.method,headers:n.data.headers,body:n.data.body,timeoutMs:n.data.timeoutMs,cacheSeconds:n.data.cacheSeconds,parse:e}).then(e=>{s.contentWindow.postMessage({type:`fetchCustomResponse`,id:n.data.id,result:e},`*`)});break}}};window.addEventListener(`message`,p);let m=new MutationObserver(()=>{document.contains(e)||h()});m.observe(document.body,{childList:!0,subtree:!0});let h=()=>{URL.revokeObjectURL(f),window.removeEventListener(`message`,p),m.disconnect(),this._sandboxes.delete(t)};e._cleanup=h,this._sandboxes.set(t,{element:e,iframe:s,defSignature:a,cleanup:h})}_loadCodeMirrorAssets(){return this._cmAssetsPromise||=ce(()=>import(`./codemirror-Cb9nMA79.js`).then(()=>!!window.CodeMirror),__vite__mapDeps([0,1,2]),import.meta.url).catch(()=>!1),this._cmAssetsPromise}async _makeCodeEditor(e,t){if(!e||e._ideEnhanced)return;e._ideEnhanced=!0;let n;try{n=await this._loadCodeMirrorAssets()}catch{n=!1}n&&window.CodeMirror?this._attachCodeMirror(e,t):this._attachFallbackEditor(e)}_attachCodeMirror(e,t){let n=()=>e.closest(`.dev-card-shell`),r=window.CodeMirror.fromTextArea(e,{mode:t,theme:`dracula`,lineNumbers:!0,indentUnit:2,tabSize:2,autoCloseBrackets:!0,matchBrackets:!0,viewportMargin:1/0,extraKeys:{"Cmd-S":()=>n()?.querySelector(`#devCardSave`)?.click(),"Ctrl-S":()=>n()?.querySelector(`#devCardSave`)?.click(),"Cmd-Enter":()=>n()?.querySelector(`#devCardTest`)?.click(),"Ctrl-Enter":()=>n()?.querySelector(`#devCardTest`)?.click()}});r.on(`change`,()=>{r.save(),e.dispatchEvent(new Event(`input`,{bubbles:!0}))}),e._cm=r}_attachFallbackEditor(e){let t={"(":`)`,"[":`]`,"{":`}`,'"':`"`,"'":`'`},n=new Set(Object.values(t)),r=(e,t)=>e.lastIndexOf(`
`,t-1)+1,i=e=>(e.match(/^[ \t]*/)||[``])[0];e.addEventListener(`keydown`,a=>{let{value:o,selectionStart:s,selectionEnd:c}=e,l=(a.metaKey||a.ctrlKey)&&a.key===`s`,u=(a.metaKey||a.ctrlKey)&&a.key===`Enter`;if(l)a.preventDefault(),e.closest(`.dev-card-shell`)?.querySelector(`#devCardSave`)?.click();else if(u)a.preventDefault(),e.closest(`.dev-card-shell`)?.querySelector(`#devCardTest`)?.click();else if(a.key===`Tab`){a.preventDefault();let t=r(o,s);if(s===c&&!a.shiftKey)e.value=o.slice(0,s)+`  `+o.slice(c),e.selectionStart=e.selectionEnd=s+2;else{let n=c,r=o.slice(t,n).split(`
`).map(e=>a.shiftKey?e.replace(/^ {1,2}/,``):`  `+e).join(`
`);e.value=o.slice(0,t)+r+o.slice(n);let i=r.length-(n-t);e.selectionStart=t===s?s:s+(a.shiftKey?-2:2),e.selectionEnd=n+i}e.dispatchEvent(new Event(`input`,{bubbles:!0}))}else if(a.key===`Enter`){let t=r(o,s),l=o.slice(t,s),u=i(l),d=l.trim(),f=/[{[(]$/.test(d),p=o[s],m=f&&n.has(p);a.preventDefault();let h=`
`+(f?u+`  `:u),g=s+h.length;m&&(h+=`
`+u),e.value=o.slice(0,s)+h+o.slice(c),e.selectionStart=e.selectionEnd=g,e.dispatchEvent(new Event(`input`,{bubbles:!0}))}else if(t[a.key]&&s===c){a.preventDefault();let n=t[a.key];e.value=o.slice(0,s)+a.key+n+o.slice(c),e.selectionStart=e.selectionEnd=s+1,e.dispatchEvent(new Event(`input`,{bubbles:!0}))}else if(n.has(a.key)&&s===c&&o[s]===a.key)a.preventDefault(),e.selectionStart=e.selectionEnd=s+1;else if(a.key===`Backspace`&&s===c&&s>0){let n=o[s-1],r=o[s];t[n]===r&&(a.preventDefault(),e.value=o.slice(0,s-1)+o.slice(s+1),e.selectionStart=e.selectionEnd=s-1,e.dispatchEvent(new Event(`input`,{bubbles:!0})))}}),e.spellcheck=!1,e.style.tabSize=`2`,e.style.fontFamily=`'Fira Code', 'Consolas', monospace`,e.style.whiteSpace=`pre`}_getEditorValue(e){return e._cm?e._cm.getValue():e.value}_setEditorValue(e,t){e._cm?e._cm.setValue(t||``):e.value=t||``}initEditor(t){let n=t.querySelector(`.dev-card-shell`),r=t.querySelector(`.dev-card-body`),i=t.querySelector(`.dev-card-header`),a=t.querySelector(`.dev-card-close`),o=t.querySelector(`#devCardId`),s=t.querySelector(`#devCardLabel`),c=t.querySelector(`#devCardHTML`),l=t.querySelector(`#devCardCSS`),u=t.querySelector(`#devCardJS`),d=t.querySelector(`#devCardSandbox`);if(this._makeCodeEditor(c,`htmlmixed`),this._makeCodeEditor(l,`css`),this._makeCodeEditor(u,`javascript`),t._devCardInitDone)return;t._devCardInitDone=!0;let f=document.createElement(`div`);f.id=`devCardPicker`,f.className=`dc-picker`,f.innerHTML=`
    <div class="dc-picker-inner">
      <button class="vb-btn vb-btn-primary" id="devCardPickerNew">${e(`plus`,16)} Create New Card</button>
      <div class="dc-picker-divider">or edit an existing card</div>
      <div class="dc-picker-list" id="devCardPickerList"></div>
    </div>
  `,n.insertBefore(f,r);let p=document.createElement(`button`);p.id=`devCardBack`,p.className=`vb-btn vb-btn-sm`,p.textContent=`← Back`,p.style.display=`none`,i.insertBefore(p,a);let m=()=>{f.style.display=``,r.style.display=`none`,p.style.display=`none`,g()},h=()=>{f.style.display=`none`,r.style.display=``,p.style.display=``,[c,l,u].forEach(e=>e._cm?.refresh())},g=()=>{let e=t.querySelector(`#devCardPickerList`);if(!e)return;e.innerHTML=``;let n=this._registry.getDefinitions(),r=Object.entries(n).filter(([,e])=>e.developer===!0);r.length===0?e.innerHTML=`<p class="dc-picker-empty">No saved developer cards yet.</p>`:r.forEach(([t,n])=>{let r=document.createElement(`div`);r.className=`dc-picker-item`,r.innerHTML=`
        <span class="dc-picker-item-label"></span>
        <span class="dc-picker-item-id"></span>
      `,r.querySelector(`.dc-picker-item-label`).textContent=n.label||t,r.querySelector(`.dc-picker-item-id`).textContent=`#${t}`,r.addEventListener(`click`,()=>_(t,n)),e.appendChild(r)})},_=(e,t)=>{o.value=e,s.value=t.label||e,this._setEditorValue(c,t.html),this._setEditorValue(l,t.css),this._setEditorValue(u,t.js),h(),y()};t._devCardLoad=e=>{let t=this._registry.get(e);t?.developer&&_(e,t)},t.querySelector(`#devCardPickerNew`).addEventListener(`click`,()=>{o.value=this._editorState.id,s.value=this._editorState.label,this._setEditorValue(c,this._editorState.html),this._setEditorValue(l,this._editorState.css),this._setEditorValue(u,this._editorState.js),h(),y()}),p.addEventListener(`click`,m);let v,y=()=>{clearTimeout(v),v=setTimeout(()=>{this._previewSandbox(d,{id:o.value,label:s.value,html:this._getEditorValue(c),css:this._getEditorValue(l),js:this._getEditorValue(u)})},500)};[o,s,c,l,u].forEach(e=>{e.addEventListener(`input`,y)}),t.querySelector(`#devCardSave`).addEventListener(`click`,()=>{let e=o.value.trim(),t=s.value.trim();if(!e){window.displayMessage?window.displayMessage(`Card ID is required`,`error`):console.error(`Card ID is required`);return}let n=JSON.parse(localStorage.getItem(`developerCards`)||`{}`),r={...n[e]||{},label:t||e,html:this._getEditorValue(c),css:this._getEditorValue(l),js:this._getEditorValue(u)};n[e]=r,localStorage.setItem(`developerCards`,JSON.stringify(n)),window.dispatchEvent(new CustomEvent(`pitbeacon:card-saved`,{detail:{id:e,def:r}}));let i=this.createCardDefinition(e,r);i.allowOverride=!0,this._registry.register(e,i),window.displayMessage&&window.displayMessage(`Card "${e}" saved!`,`message`),window._pitbeaconRender&&window._pitbeaconRender()}),t.querySelector(`#devCardTest`).addEventListener(`click`,y),new MutationObserver(()=>{t.classList.contains(`active`)&&m()}).observe(t,{attributes:!0,attributeFilter:[`class`]}),m()}_previewSandbox(e,t){let n=`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Rubik', sans-serif; 
            background: var(--bg-surface, #2a2a2a);
            color: var(--text-primary, #f0f0f0);
            padding: 8px;
            overflow: auto;
            height: 100vh;
        }
        ${t.css||``}
    </style>
</head>
<body>
    ${t.html||`<div class="dev-card-content"><p>No HTML defined</p></div>`}
<script>
        // Create SDK bridge - only declare once
(function() {
            var sdk = {
                _state: { currentMatch: { comp_level: 'qm', match_number: 1 } },
                getState: function() { return this._state; },
                onStateChange: function(cb) { cb(this._state); return function() {}; },
                fetchDataSource: async function(name) {
                    if (name === 'currentMatches') return [{ comp_level: 'qm', match_number: 1 }];
                    return null;
                },
                getDataSourceNames: async function() {
                    return ['currentMatches', 'currentEventData', 'currentRankings'];
                },

              fetchCustom: async function(url, options) {
                    options = options || {};
                    console.log('[preview] fetchCustom called (mocked, no real request):', url, options);
                    var rawText = JSON.stringify({ preview: true, note: 'mocked in Preview' });
                    try {
                        var data = options.parse ? options.parse(rawText) : JSON.parse(rawText);
                        return { ok: true, data: data, error: null, status: 200 };
                    } catch (err) {
                        return { ok: false, data: null, error: 'Parse error: ' + err.message, status: 200 };
                    }
                },
                triggerAlarm: function(nameOrPreset) { console.log('Alarm:', nameOrPreset); },
                getAlarmSounds: async function() { return ['alarm1', 'alarm2', 'chime', 'buzzer']; },
                notify: function(msg) { console.log('Notify:', msg); },
                storage: {
                    _data: {},
                    get: async function(key) { return this._data[key] ?? null; },
                    set: async function(key, value) { this._data[key] = value; return true; },
                    delete: async function(key) { delete this._data[key]; return true; },
                },
                getConfig: async function() {
                    return { teamNumber: 7250, matchAlarmSound: 'alarm1', noteAlarmSound: 'chime' };
                },
            };
            window.__pitbeaconSDK = sdk;
        })();

        // User code is scoped separately from the sandbox wrapper.
        (function() {
          ${t.js||``}
        })();
    <\/script>
</body>
</html>`,r=new Blob([n],{type:`text/html`}),i=URL.createObjectURL(r);e.src=i,e._blobUrl&&URL.revokeObjectURL(e._blobUrl),e._blobUrl=i}};function ue(e=new Date){return e.getFullYear()}var E=[`your_auth_key`,`your auth key`,`tba key`,`your-api-key`,`your api key`];function D(e){let t=String(e?.tbaapikey??``).trim();return t?!E.includes(t.toLowerCase()):!1}function de(e){return ue(e?.fullDate instanceof Date?e.fullDate:new Date)}var fe=`https://www.thebluealliance.com/api/v3`,pe=[`currentMatches`,`currentEventData`,`currentRankings`,`teamInfo`,`teamSummaryData`];function me(e){let[t,n,r]=String(e).split(`-`).map(Number);return{year:t,month:n-1,day:r}}function he(e,t){if(!e?.start_date||!e?.end_date)return!1;let n=me(e.start_date),r=me(e.end_date),i=new Date(n.year,n.month,n.day,0,0,0,0),a=new Date(r.year,r.month,r.day,23,59,59,999);return t>=i&&t<=a}var ge=class{constructor(e,t){this._config=e,this._state=t,this._store=new Map,this._etagUnsupported=!1,this._round={failed:!1},this.lastSuccessAt=null}updateConfig(e){this._config=e,this.clearCache()}clearCache(){this._store.clear()}getSourceNames(){return[...pe]}async fetch(e){switch(e){case`currentMatches`:return this._state.getState().currentMatches||null;case`currentEventData`:return this._state.getState().currentEventData||null;case`currentRankings`:return this._state.getState().currentRankings||null;case`teamInfo`:return this._fetchTeamInfo();case`teamSummaryData`:return this._state.getState().currentTeamSummaryData||null;default:return null}}_hasRealApiKey(){return D(this._config)}_season(){return de(this._state.getState())}async _request(e,t){try{return await fetch(e,{headers:t})}catch(n){if(t[`If-None-Match`]){this._etagUnsupported=!0;let n={...t};return delete n[`If-None-Match`],fetch(e,{headers:n})}throw n}}async _tba(e){if(!this._hasRealApiKey())return null;let t=`${fe}${e}`,n=this._store.get(t),r={"X-TBA-Auth-Key":this._config.tbaapikey};n?.etag&&!this._etagUnsupported&&(r[`If-None-Match`]=n.etag);try{let e=await this._request(t,r);if(e.status===304&&n)return this.lastSuccessAt=Date.now(),n.data;if(e.status===404)return this._store.delete(t),this.lastSuccessAt=Date.now(),null;if(!e.ok)throw Error(`API Error: ${e.status}`);let i=await e.json();return this._store.set(t,{etag:e.headers.get(`ETag`),data:i}),this.lastSuccessAt=Date.now(),i}catch(t){return console.warn(`TBA request failed (${e}):`,t),this._round.failed=!0,n?n.data:null}}async _fetchTeamInfo(){if(!this._hasRealApiKey())return{events:[]};let e=await this._tba(`/team/frc${this._config.teamNumber}/events/${this._season()}`);return e?{events:e}:null}async fetchAll(){if(!this._hasRealApiKey())return null;this._round={failed:!1};let e=await this._fetchTeamInfo();if(!e?.events)return null;let t=this._state.getState().fullDate||new Date,n=e.events.find(e=>he(e,t)),r=null,i=null,a=null;if(n){let e=this._config.teamNumber;r=await this._tba(`/team/frc${e}/event/${n.key}/matches/simple`),r&&(i=n),a=(await this._tba(`/event/${n.key}/rankings`))?.rankings??null}return{matches:r,eventData:i,rankings:a,stale:this._round.failed,fetchedAt:this.lastSuccessAt}}async fetchTeamSummary(e){let t=this._config.teamNumber,n=this._state.getState().currentEventData?.name||null;if(!t||!this._hasRealApiKey())return{teamSummary:{eventRank:`–`,eventRecord:{wins:0,losses:0,ties:0},winRate:`–`,seasonEventCount:0,eventName:n}};let[r,i,a]=await Promise.all([this._tba(`/team/frc${t}/events/${this._season()}`),e?this._tba(`/team/frc${t}/event/${e}/status`):null,e?this._tba(`/event/${e}/rankings`):null]),o=Array.isArray(a?.rankings)?a.rankings.find(e=>e.team_key===`frc${t}`):null,s=o?.record||i?.qual?.record||null,c=o?.rank??i?.qual?.rank??null,l=s?.wins??0,u=s?.losses??0,d=s?.ties??0,f=l+u+d;return{teamSummary:{eventRank:c,eventRecord:{wins:l,losses:u,ties:d},winRate:f>0?`${(l/f*100).toFixed(1)}%`:`–`,seasonEventCount:Array.isArray(r)?r.length:0,eventName:n}}}},_e=102400;function ve(e){let t=String(e.js||e.javascript||``);return{id:String(e.id||``).trim(),label:String(e.label||e.id||``).trim(),description:String(e.description||``).trim(),authorName:String(e.author_name||e.authorName||`Community author`).trim(),icon:String(e.icon||`code`).trim(),settings:e.settings&&typeof e.settings==`object`?e.settings:we(t),html:String(e.html||``),css:String(e.css||``),js:t,version:String(e.version||`1.0.0`).trim()}}function ye(e){return JSON.stringify({html:String(e.html||``),css:String(e.css||``),js:String(e.js||e.javascript||``),settings:e.settings||{}})}function be(e){let t=ve(e),n=[];return/^[a-z0-9][a-z0-9-]{1,48}$/.test(t.id)||n.push(`Card ID must use lowercase letters, numbers, and hyphens.`),(!t.label||t.label.length>80)&&n.push(`Card label is required and must be 80 characters or fewer.`),(!t.html||t.html.length>4e4)&&n.push(`Card HTML is required and must be 40 KB or smaller.`),(t.css.length>4e4||t.js.length>4e4)&&n.push(`Card CSS and JavaScript must each be 40 KB or smaller.`),JSON.stringify(t).length>_e&&n.push(`The complete card package must be 100 KB or smaller.`),{card:t,errors:n}}function xe(e,t={}){return t.type?t.type:typeof e==`boolean`?`checkbox`:typeof e==`number`?`number`:typeof e==`string`&&/^#[0-9a-f]{6}$/i.test(e)?`color`:`text`}function Se(e){let t=e.trim();if(t===`true`)return!0;if(t===`false`)return!1;if(t===`null`)return null;if(/^-?\d+(\.\d+)?$/.test(t))return Number(t);if(t.startsWith(`"`)&&t.endsWith(`"`)||t.startsWith(`'`)&&t.endsWith(`'`))return t.slice(1,-1)}function Ce(e){let t=[],n=0,r=0,i=null;for(let a=0;a<e.length;a+=1){let o=e[a];i?o===i&&e[a-1]!==`\\`&&(i=null):o===`'`||o===`"`||o==="`"?i=o:o===`{`||o===`[`||o===`(`?r+=1:o===`}`||o===`]`||o===`)`?--r:o===`,`&&r===0&&(t.push(e.slice(n,a)),n=a+1)}return t.push(e.slice(n)),t}function we(e=``){let t={},n=/sdk\.configurable\s*\(([^()]*(?:\([^)]*\)[^()]*)*)\)/g,r;for(;r=n.exec(e);){let[e,n,i]=Ce(r[1]),a=Se(e||``),o=Se(n||``);if(typeof a!=`string`||o===void 0)continue;let s={};if(i?.trim().startsWith(`{`))try{s=JSON.parse(i.replace(/([{,])\s*([a-zA-Z][\w]*)\s*:/g,`$1"$2":`))}catch{s={}}t[a]={label:s.label||a.replace(/([A-Z])/g,` $1`).replace(/^./,e=>e.toUpperCase()),type:xe(o,s),default:o,...s.min===void 0?{}:{min:s.min},...s.max===void 0?{}:{max:s.max},...s.step===void 0?{}:{step:s.step},...s.options?{options:s.options}:{}}}return t}var Te=class{constructor(e,t,n,r){this._config=e,this._runtime=t,this._stateManager=n,this._sdk=r}isConfigured(){return!!(this._config.supabaseUrl&&this._config.supabaseAnonKey)}async listApproved(){if(!this.isConfigured())return[];let e=`${this._config.supabaseUrl.replace(/\/$/,``)}/rest/v1/cards?select=id,label,description,author_name,icon,html,css,js,version,settings,created_at&status=eq.approved&order=created_at.desc`,t=await fetch(e,{headers:{apikey:this._config.supabaseAnonKey,Authorization:`Bearer ${this._config.supabaseAnonKey}`}});if(!t.ok)throw Error(`Catalog request failed (${t.status})`);return(await t.json()).map(ve)}async submit(e,t=``){let{card:n,errors:r}=be(e);if(r.length)throw Error(r.join(` `));if(!this._config.cardSubmitFunctionUrl)throw Error(`Card submission is not configured yet.`);let i=await fetch(this._config.cardSubmitFunctionUrl,{method:`POST`,headers:{"Content-Type":`application/json`,apikey:this._config.supabaseAnonKey,Authorization:`Bearer ${this._config.supabaseAnonKey}`},body:JSON.stringify({card:n,updateOf:e.updateOf||null,turnstileToken:t})}),a=await i.json().catch(()=>({}));if(!i.ok)throw Error(a.error||`Card submission failed.`);return a}renderPreview(e,t,n=`catalog-preview-${t.id}`){let r={...t,developer:!0,builtin:!1,settings:t.settings,settingsValues:t.settingsValues};this._runtime._renderDevCard(e,n,r,this._stateManager.getState(),this._sdk)}},Ee=2,De=160,Oe=class{constructor(e,t,n,r,i){this._registry=e,this._validator=t,this._state=n,this._dataSources=r,this._sdk=i,this._renderedCards=new Map,this._dots=new Map,window._pitbeaconRender=()=>this.render(window._pitbeaconConfig||{},document.getElementById(`container`)),window._pitbeaconNotify=(e,t)=>{window.displayMessage&&window.displayMessage(e,t)}}render(t,n){if(!n)return;let r=t.gridCols||t.gridSize||3,i=t.gridRows||t.gridSize||3,a=t.layout||{},o=t.hiddenSections||[],s=this._validator.validate(a,r,i);s.errors.length>0&&console.warn(`Layout validation errors:`,s.errors),s.warnings.length>0&&console.warn(`Layout warnings:`,s.warnings);let c=s.layout,l=!!t.portraitLayout,u=0;if(l){let e=Object.entries(c).filter(([e])=>!o.includes(e)&&this._registry.get(e)),t=this._buildPortraitLayout(e,r,i);c=t.layout,u=t.rows}n.dataset.portrait=l?`true`:`false`,n.style.display=`grid`,l?(n.style.gridTemplateColumns=`repeat(${Ee}, minmax(0, 1fr))`,n.style.gridTemplateRows=`repeat(${Math.max(1,u)}, minmax(${De}px, 1fr))`):(n.style.gridTemplateColumns=`repeat(${r}, 1fr)`,n.style.gridTemplateRows=`repeat(${i}, 1fr)`),n.style.gap=`12px`,n.style.height=`calc(var(--view-h, 100vh) - var(--header-height, 4.5rem) - var(--banner-height, 0px))`,n.style.padding=`12px`,n.style.overflow=`auto`,n.style.background=`transparent`;let d=new Set,f=this._state.getState();for(let[r,i]of Object.entries(c)){if(o.includes(r))continue;let a=this._registry.get(r);if(!a){console.warn(`Card "${r}" not found in registry`);continue}d.add(r);let s=this._renderedCards.get(r);if(s||(s=document.createElement(`div`),s.id=`card-${r}`,s.className=`card-container`,s.style.overflow=`auto`,s.style.minHeight=`0`,n.appendChild(s),this._renderedCards.set(r,s)),s.style.gridColumn=`${i.x+1} / span ${i.width}`,s.style.gridRow=`${i.y+1} / span ${i.height}`,s.style.display=``,l?(s.dataset.pspan=String(i.width),s.dataset.prows=String(i.height)):(delete s.dataset.pspan,delete s.dataset.prows),this._syncDot(r,a,i,n,t.showCardStatusDots!==!1),a.render)try{a.render(s,f,this._sdk,r)}catch(t){console.error(`Error rendering card "${r}":`,t),s.innerHTML=`
                    <div class="card-error">
                        <span class="card-error-icon">${e(`warning`,22)}</span>
                        <span class="card-error-msg">Error rendering card</span>
                        <span class="card-error-detail">${t.message}</span>
                    </div>
                `}}for(let[e,t]of this._renderedCards)!d.has(e)&&t.parentNode&&(t.remove(),this._renderedCards.delete(e));for(let[e,t]of this._dots)d.has(e)||(t.remove(),this._dots.delete(e));window._pitbeaconConfig=t,window.dispatchEvent(new CustomEvent(`pitbeacon:layout-rendered`))}_syncDot(e,t,n,r,i){let a=this._dots.get(e);!i||!t.builtin||t.statusDot===!1?a&&(a.remove(),this._dots.delete(e)):(a||(a=document.createElement(`span`),a.className=`card-status-dot`,a.dataset.cardId=e,a.dataset.color=`grey`,a.setAttribute(`role`,`img`),a.tabIndex=0,r.appendChild(a),this._dots.set(e,a)),a.style.gridColumn=`${n.x+1} / span ${n.width}`,a.style.gridRow=`${n.y+1} / span ${n.height}`)}getDots(){return[...this._dots.entries()]}_buildPortraitLayout(e,t,n){let r=e.slice().sort((e,t)=>e[1].y-t[1].y||e[1].x-t[1].x),i=[],a=(e,t,n,r)=>{if(t+n>Ee)return!1;for(let a=e;a<e+r;a++)for(let e=t;e<t+n;e++)if(i[a]&&i[a][e])return!1;return!0},o={},s=0;for(let[e,c]of r){let r=c.width/t>=.5?Ee:1,l=c.height/n>=.5?2:1,u=!1;for(let t=0;!u;t++)for(let n=0;n+r<=Ee;n++)if(a(t,n,r,l)){for(let e=t;e<t+l;e++){i[e]=i[e]||[];for(let t=n;t<n+r;t++)i[e][t]=!0}o[e]={x:n,y:t,width:r,height:l},s=Math.max(s,t+l),u=!0;break}}return{layout:o,rows:s}}updateCards(e){for(let[t,n]of this._renderedCards){let r=this._registry.get(t);if(r&&r.render&&n.isConnected&&(!n.selfRefresh||r.developer))try{r.render(n,e,this._sdk,t)}catch(e){console.error(`Error updating card "${t}":`,e)}}}getCardElement(e){return this._renderedCards.get(e)||null}};function ke(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var Ae=ke();function je(e){Ae=e}var Me={exec:()=>null};function Ne(e){let t=[];return n=>{let r=Math.max(0,Math.min(3,n-1)),i=t[r];return i||(i=e(r),t[r]=i),i}}function O(e,t=``){let n=typeof e==`string`?e:e.source,r={replace:(e,t)=>{let i=typeof t==`string`?t:t.source;return i=i.replace(k.caret,`$1`),n=n.replace(e,i),r},getRegex:()=>new RegExp(n,t)};return r}var Pe=((e=``)=>{try{return!!RegExp(`(?<=1)(?<!1)`+e)}catch{return!1}})(),k={codeRemoveIndent:/^(?: {0,3}\t| {1,4})/gm,listInterruptsParagraph:/^ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,endingSpaceTabChar:/[ \t]$/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,leadingSpaceTab:/^[ \t]+/,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+)[ \t]*)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,blockquoteMarkerWhitespace:/^( {0,3}>)([ \t]+)/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\][ \t]+\S/,listReplaceTask:/^\[[ xX]\][ \t]+/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,numericCharacterReference:/&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/,numericCharacterReferenceOrAmpersand:/&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:e=>RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:Ne(e=>RegExp(`^ {0,${e}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),hrRegex:Ne(e=>RegExp(`^ {0,${e}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)`)),fencesBeginRegex:Ne(e=>RegExp(`^ {0,${e}}(?:\`\`\`|~~~)`)),headingBeginRegex:Ne(e=>RegExp(`^ {0,${e}}#{1,6}(?:\\s|$)`)),pedanticHeadingBeginRegex:Ne(e=>RegExp(`^ {0,${e}}#`)),htmlBeginRegex:Ne(e=>RegExp(`^ {0,${e}}(?:</?(?:${Ye})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`,`i`)),blockquoteBeginRegex:Ne(e=>RegExp(`^ {0,${e}}>`)),nestedContainerMarkers:/^(?: {0,3}(?:(?:[*+-]|\d{1,9}[.)])[ \t]+|>[ \t]?))+/},Fe=/^(?:[ \t]*(?:\n|$))+/,Ie=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Le=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}(?:(?=`)\1`*|(?=~)\1~*) *(?=\n|$)|$)/,Re=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,ze=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,Be=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,Ve=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |fences|blockquote|heading|hr|html|table))+?)\n {0,3}(=+|-+)[ \t]*(?:\n+|$)/,He=O(Ve).replace(/bull/g,Be).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/hr/g,/ {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,``).getRegex(),Ue=O(Ve).replace(/bull/g,Be).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/hr/g,/ {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),We=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/,Ge=/^[^\n]+/,Ke=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\\n]|\n(?![ \t]*\n))+/,qe=O(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace(`label`,Ke).replace(`title`,/(?:"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\\n]|\n(?!\n))*'|\((?:\\[\s\S]|[^()\\])*\))/).getRegex(),Je=O(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g,Be).getRegex(),Ye=`address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul`,Xe=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Ze=O(`^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?:[ \\t]+|\\n|/?>|$)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))`,`i`).replace(`comment`,Xe).replace(`tag`,Ye).replace(`attribute`,/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),Qe=e=>O(We).replace(`hr`,Re).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,e).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,Ye).getRegex(),$e=Qe(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/),et=Qe(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/),tt={blockquote:O(/^( {0,3}> ?(?:(?![ \t]*(?:\n|$))(paragraph)|[^\n]*)(?:\n|$))+/).replace(`paragraph`,et).getRegex(),code:Ie,def:qe,fences:Le,heading:ze,hr:Re,html:Ze,lheading:He,list:Je,newline:Fe,paragraph:$e,table:Me,text:Ge},nt=O(`^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)`).replace(`hr`,Re).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`blockquote`,` {0,3}>`).replace(`code`,`(?: {4}| {0,3}	)[^\\n]`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]`).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,Ye).getRegex(),rt={...tt,lheading:Ue,table:nt,paragraph:O(We).replace(`hr`,Re).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`table`,nt).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]`).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,Ye).getRegex()},it={...tt,html:O(`^ *(?:comment(?: *\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1>(?: *\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?>(?: *\\n{2,}|\\s*$))`).replace(`comment`,Xe).replace(/tag/g,`(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b`).getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:Me,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:O(We).replace(`hr`,Re).replace(`heading`,` *#{1,6} *[^
]`).replace(`lheading`,He).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`|fences`,``).replace(`|list`,``).replace(`|html`,``).replace(`|tag`,``).getRegex()},at=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,ot=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,st=/^( {2,}|\\)\n(?!\s*$)[ \t]*/,ct=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,A=/[\p{P}\p{S}]/u,lt=/[\s\p{P}\p{S}]/u,ut=/[^\s\p{P}\p{S}]/u,dt=O(/^((?![*_])punctSpace)/,`u`).replace(/punctSpace/g,lt).getRegex(),ft=/[\p{Pi}\p{Ps}"']/u,pt=/(?!~)[\p{P}\p{S}]/u,mt=/(?!~)[\s\p{P}\p{S}]/u,ht=/(?:[^\s\p{P}\p{S}]|~)/u,gt=O(/link|precode-code|html/,`g`).replace(`link`,/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace(`precode-`,Pe?"(?<!`)()":"(^^|[^`])").replace(`code`,/(?<b>`+)[^`]+\k<b>(?!`)/).replace(`html`,/<(?! )[^<>]*?>/).getRegex(),_t=/^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,vt=O(_t,`u`).replace(/punct/g,A).getRegex(),yt=O(_t,`u`).replace(/punct/g,pt).getRegex(),bt=O(/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/,`u`).replace(/openQuote/g,ft).replace(/punct/g,A).getRegex(),xt=`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)`,St=O(xt,`gu`).replace(/notPunctSpace/g,ut).replace(/punctSpace/g,lt).replace(/punct/g,A).getRegex(),Ct=O(xt,`gu`).replace(/notPunctSpace/g,ht).replace(/punctSpace/g,mt).replace(/punct/g,pt).getRegex(),wt=O(`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,ut).replace(/punctSpace/g,lt).replace(/punct/g,A).getRegex(),Tt=O(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)`,`gu`).replace(/notPunctSpace/g,ut).replace(/punctSpace/g,lt).replace(/punct/g,A).getRegex(),Et=O(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,ut).replace(/punctSpace/g,lt).replace(/punct/g,A).getRegex(),Dt=O(/^~~?(?:((?!~)punct)|[^\s~])/,`u`).replace(/punct/g,A).getRegex(),Ot=O(`^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,ut).replace(/punctSpace/g,lt).replace(/punct/g,A).getRegex(),kt=O(/\\(punct)/,`gu`).replace(/punct/g,A).getRegex(),At=O(/(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\(punct)/,`gu`).replace(/punct/g,A).getRegex(),jt=O(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace(`scheme`,/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace(`email`,/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),Mt=O(Xe).replace(`(?:-->|$)`,`-->`).getRegex(),Nt=O(`^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>`).replace(`comment`,Mt).replace(`attribute`,/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),Pt=/\[(?:\\[\s\S]|[^\[\]\\])*\]/,Ft=O(/(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/).replace(`brackets`,Pt).getRegex(),It=O(/^!?\[(label)\]\([ \t\n]*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?[ \t\n]*\)/).replace(`label`,Ft).replace(`href`,/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace(`title`,/"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\((?:\\[\s\S]|[^)\\])*\)/).getRegex(),Lt=O(/^!?\[(label)\]\[(ref)\]/).replace(`label`,Ft).replace(`ref`,Ke).getRegex(),Rt=O(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,Ke).getRegex(),zt=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/,Bt=O(/(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/).replace(`brackets`,Pt).getRegex(),Vt=O(`reflink|nolink(?!\\()`,`g`).replace(`reflink`,O(/^!?\[(label)\]\[(ref)\]/).replace(`label`,Bt).replace(`ref`,zt).getRegex()).replace(`nolink`,O(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,zt).getRegex()).getRegex(),Ht=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,Ut=O(/(?:mailto:email|xmpp:email(?:\/[A-Za-z0-9@.]+)?)/).replace(/email/g,/[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),Wt={_backpedal:Me,anyPunctuation:kt,anyPunctuationOutsideCode:At,autolink:jt,blockSkip:gt,br:st,code:ot,del:Me,delLDelim:Me,delRDelim:Me,emStrongLDelim:vt,emStrongRDelimAst:St,emStrongRDelimUnd:Tt,escape:at,link:It,nolink:Rt,punctuation:dt,reflink:Lt,reflinkSearch:Vt,tag:Nt,text:ct,url:Me},Gt={...Wt,emStrongLDelim:bt,emStrongRDelimAst:wt,emStrongRDelimUnd:Et,link:O(/^!?\[(label)\]\((.*?)\)/).replace(`label`,Ft).getRegex(),reflink:O(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace(`label`,Ft).getRegex()},Kt={...Wt,emStrongRDelimAst:Ct,emStrongLDelim:yt,delLDelim:Dt,delRDelim:Ot,url:O(/^emailProtocol|^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace(`emailProtocol`,Ut).replace(`protocol`,Ht).replace(`email`,/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:O(/^(?:[^a-zA-Z0-9](?=emailProtocol)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|wwwStart|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=emailProtocol)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/).replace(`protocol`,Ht).replace(/emailProtocol/g,/(?:mailto|xmpp):/).replace(`wwwStart`,Pe?`(?<![^\\s*_~(])www\\.`:`www\\.`).getRegex()},qt={...Kt,br:O(st).replace(`{2,}`,`*`).getRegex(),text:O(Kt.text).replace(`\\b_`,`\\b_| {2,}\\n`).replace(/\{2,\}/g,`*`).getRegex()},Jt={normal:tt,gfm:rt,pedantic:it},Yt={normal:Wt,gfm:Kt,breaks:qt,pedantic:Gt},Xt={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`},Zt=e=>Xt[e];function j(e,t){if(t){if(k.escapeTest.test(e))return e.replace(k.escapeReplace,Zt)}else if(k.escapeTestNoEncode.test(e))return e.replace(k.escapeReplaceNoEncode,Zt);return e}function Qt(e){return k.numericCharacterReference.test(e)?e.replace(k.numericCharacterReferenceOrAmpersand,(e,t,n)=>{if(t===void 0&&n===void 0)return`&amp;`;let r=t===void 0?Number.parseInt(n,16):Number.parseInt(t,10);return r===0||r>1114111||r>=55296&&r<=57343?`�`:r===38?`&amp;`:String.fromCodePoint(r)}):e}function $t(e){try{e=encodeURI(e).replace(k.percentDecode,`%`)}catch{return null}return e}function en(e,t){let n=e.replace(k.findPipe,(e,t,n)=>{let r=!1,i=t;for(;--i>=0&&n[i]===`\\`;)r=!r;return r?`|`:` |`}).split(k.splitPipe),r=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),t){if(n.length>t)n.splice(t);else for(;n.length<t;)n.push(``)}for(;r<n.length;r++)n[r]=n[r].trim().replace(k.slashPipe,`|`);return n}function M(e,t,n){let r=e.length;if(r===0)return``;let i=0;for(;i<r;){let a=e.charAt(r-i-1);if(a===t&&!n)i++;else if(a!==t&&n)i++;else break}return e.slice(0,r-i)}function tn(e){let t=e.split(`
`),n=t.length-1;for(;n>=0&&k.blankLine.test(t[n]);)n--;return t.length-n<=2?e:t.slice(0,n+1).join(`
`)}function nn(e){return e.trim().replace(k.multipleSpaceGlobal,` `).toLowerCase().toUpperCase().toLowerCase()}function rn(e,t){if(e.indexOf(t[0])===-1&&e.indexOf(t[1])===-1)return-1;let n=0;for(let r=0;r<e.length;r++)if(e[r]===`\\`)r++;else if(e[r]===t[0])n++;else if(e[r]===t[1]&&(n--,n<0))return r;return n>0?-2:-1}var an=new WeakMap;function on(e){let t={"*":-1,_:-1},n=-1,r=e.length;for(let i=0;i<r;i++){let a=e[i];if(a!==`*`&&a!==`_`&&a!==`~`)continue;let o=i===0?`
`:e[i-1],s=i+1;for(;s<r&&e[s]===a;)s++;o!==` `&&o!==`	`&&o!==`
`&&o!==`\r`&&o!==`\f`&&(a===`~`?n=i:t[a]=i),i=s-1}return{maskedSrc:e,lastPossibleEmStrongCloserIndex:t,lastPossibleDelCloserIndex:n}}function sn(e,t){let n=on(t),r=an.get(e);r?r.push(n):an.set(e,[n])}function cn(e){let t=an.get(e);t&&(t.pop(),t.length===0&&an.delete(e))}function ln(e,t,n){let r=an.get(e)?.at(-1);return r&&r.maskedSrc===t?r.lastPossibleEmStrongCloserIndex[n]:on(t).lastPossibleEmStrongCloserIndex[n]}function un(e,t){let n=an.get(e)?.at(-1);return n&&n.maskedSrc===t?n.lastPossibleDelCloserIndex:on(t).lastPossibleDelCloserIndex}function dn(e,t=0){let n=t,r=``;for(let t of e)if(t===`	`){let e=4-n%4;r+=` `.repeat(e),n+=e}else r+=t,n++;return r}function fn(e,t,n,r,i){let a=t.href,o=t.title||null,s=e[1].replace(i.other.outputLinkReplace,`$1`),c=e[0].charAt(0)===`!`,l=r.state.inLink,u=r.state.linkEmitted,d=r.state.inRawBlock;r.state.inLink=!0,r.state.linkEmitted=!1;let f=r.inlineTokens(s),p=r.state.linkEmitted;if(r.state.linkEmitted=u,r.state.inLink=l,!c){if(p){r.state.inRawBlock=d;return}r.state.linkEmitted=!0}return{type:c?`image`:`link`,raw:n,href:a,title:o,text:s,tokens:f}}function pn(e,t,n){let r=e.match(n.other.indentCodeCompensation);if(r===null)return t;let i=r[1];return t.split(`
`).map(e=>{let t=e.match(n.other.beginningSpace);if(t===null)return e;let[r]=t;return e.slice(Math.min(r.length,i.length))}).join(`
`)}function mn(e,t,n,r){if(!t.includes(`<`))return!1;for(let i=0;i<t.length;i++){if(t[i]===`\\`){i++;continue}if(t[i]==="`"){let e=r.inline.code.exec(t.slice(i));if(e){i+=e[0].length-1;continue}}if(t[i]!==`<`)continue;let a=e.slice(n+i),o=r.inline.tag.exec(a)||r.inline.autolink.exec(a);if(o){if(o[0].length>t.length-i)return!0;i+=o[0].length-1}}return!1}var hn=class{options;rules;lexer;constructor(e){this.options=e||Ae}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:`space`,raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let e=this.options.pedantic?t[0]:tn(t[0]);return{type:`code`,raw:e,codeBlockStyle:`indented`,text:e.replace(this.rules.other.codeRemoveIndent,``)}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let e=t[0],n=pn(e,t[3]||``,this.rules);return{type:`code`,raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,`$1`):t[2],text:n}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let e=t[2].trim();if(this.rules.other.endingHash.test(e)){let t=M(e,`#`);(this.options.pedantic||!t||this.rules.other.endingSpaceTabChar.test(t))&&(e=t.trim())}return{type:`heading`,raw:M(t[0],`
`),depth:t[1].length,text:e,tokens:this.lexer.inline(e)}}}hr(e){let t=this.rules.block.hr.exec(e);if(t)return{type:`hr`,raw:M(t[0],`
`)}}blockquote(e){let t=this.rules.block.blockquote.exec(e);if(t){let e=M(t[0],`
`).split(`
`),n=``,r=``,i=[];for(;e.length>0;){let t=!1,a=[],o=0;for(;o<e.length;o++)if(this.rules.other.blockquoteStart.test(e[o]))a.push(e[o]),t=!0;else if(!t)a.push(e[o]);else break;e=e.slice(o);let s=a.join(`
`),c=s.replace(this.rules.other.blockquoteMarkerWhitespace,(e,t,n)=>t+dn(n,t.length)).replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,``);n=n?`${n}
${s}`:s,r=r?`${r}
${c}`:c;let l=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(c,i,!0),this.lexer.state.top=l,e.length===0)break;let u=i.at(-1);if(u?.type===`code`||u?.type===`heading`||u?.type===`hr`||u?.type===`html`||u?.type===`table`)break;if(u?.type===`blockquote`){let t=u,a=e.join(`
`),o=t.raw+`
`+a.replace(this.rules.other.blockquoteSetextReplace2,``),s=this.blockquote(o);i[i.length-1]=s;let c=o.substring(s.raw.length).replace(/^\n/,``),l=c?c.split(`
`).length:0,d=l?e.slice(0,-l):e;if(d.length>0&&(n=`${n}
${d.join(`
`)}`),r=r.substring(0,r.length-t.text.length)+s.text,e=e.slice(d.length),e.length>0&&this.rules.other.blockquoteStart.test(e[0]))continue;break}if(u?.type===`list`){let t=u,a=t.raw+`
`+e.join(`
`),o=this.list(a);i[i.length-1]=o;let s=o.raw.length>t.raw.length?a.slice(t.raw.length+1,o.raw.length).split(`
`).length:0;if(s>0){let t=e.slice(0,s).join(`
`);n=`${n}
${t}`,r=`${r}
${t}`}e=e.slice(s)}}return{type:`blockquote`,raw:n,tokens:i,text:r}}}list(e){let t=this.rules.block.list.exec(e);if(t){if(!this.options.pedantic&&this.lexer.state.lastToken?.type===`text`&&!this.rules.other.listInterruptsParagraph.test(e))return;let n=e,r=()=>n.length-e.length,i=t[1].trim(),a=i.length>1,o={type:`list`,raw:``,ordered:a,start:a?+i.slice(0,-1):``,loose:!1,items:[]};i=a?`\\d{1,9}\\${i.slice(-1)}`:`\\${i}`,this.options.pedantic&&(i=a?i:`[*+-]`);let s=this.rules.other.listItemRegex(i),c=!1;for(;e;){let i=!1,a=``;if(!(t=s.exec(e))||this.rules.block.hr.test(e))break;let l=r();e=e.substring(t[0].length);let u=t[2].split(`
`,1)[0],d=t[1].length,f=this.options.pedantic?dn(u,d):u.replace(this.rules.other.leadingSpaceTab,e=>dn(e,d)),p=e.split(`
`,1)[0],m=!f.trim(),h=0;if(this.options.pedantic?(h=2,a=f.trimStart()):m?h=d+1:(h=f.search(this.rules.other.nonSpaceChar),h=h>4?1:h,a=f.slice(h),h+=d),m&&this.rules.other.blankLine.test(p)&&(e=e.substring(p.length+1),i=!0),!i){let t=this.rules.other.nextBulletRegex(h),n=this.rules.other.hrRegex(h),r=this.rules.other.fencesBeginRegex(h),i=this.options.pedantic?this.rules.other.pedanticHeadingBeginRegex(h):this.rules.other.headingBeginRegex(h),o=this.rules.other.htmlBeginRegex(h),s=this.rules.other.blockquoteBeginRegex(h),c=!1;for(;e;){let l=e.split(`
`,1)[0],u;if(p=l,this.options.pedantic?(p=p.replace(this.rules.other.listReplaceNesting,`  `),u=p):u=p.replace(this.rules.other.leadingSpaceTab,e=>dn(e)),r.test(p)||i.test(p)||o.test(p)||s.test(p)||t.test(p)||n.test(p))break;if(u.search(this.rules.other.nonSpaceChar)>=h||!p.trim())a+=`
`+u.slice(h),c=!1;else{if(m||f.replace(this.rules.other.tabCharGlobal,`    `).search(this.rules.other.nonSpaceChar)>=4||r.test(f)||i.test(f)||o.test(f)||n.test(f))break;if(!this.options.pedantic&&!c){let e=f.replace(this.rules.other.nestedContainerMarkers,``);if(this.rules.block.fences.test(e)||this.rules.block.heading.test(e)||this.rules.block.hr.test(e))break}let e=!this.options.pedantic&&/^ {0,3}(?:=+|-+) *$/.test(p)&&this.rules.block.lheading.test(`${f}
${p}`)?`    ${u.replace(/^ {0,3}/,``)}`:p;a+=`
`+e,c=!0}m=!p.trim(),e=e.substring(l.length+1),f=u.slice(h)}}let g=n.slice(l,r());o.loose||(c?o.loose=!0:this.rules.other.doubleBlankLine.test(g)&&(c=!0)),o.items.push({type:`list_item`,raw:g,task:!!this.options.gfm&&this.rules.other.listIsTask.test(a),loose:!1,text:a,tokens:[]})}let l=o.items.at(-1);if(l)l.raw=l.raw.trimEnd(),l.text=l.text.trimEnd();else return;o.raw=n.slice(0,r()).trimEnd();for(let e of o.items)if(this.lexer.state.top=!1,e.tokens=this.lexer.blockTokens(e.text,[]),!o.loose){let t=e.tokens.filter(e=>e.type===`space`);o.loose=t.length>0&&t.some(e=>this.rules.other.anyLine.test(e.raw))}for(let e of o.items){let t=e.tokens[0];if(e.task&&(t?.type===`text`||t?.type===`paragraph`)){e.text=e.text.replace(this.rules.other.listReplaceTask,``),t.raw=t.raw.replace(this.rules.other.listReplaceTask,``),t.text=t.text.replace(this.rules.other.listReplaceTask,``);for(let e=this.lexer.inlineQueue.length-1;e>=0;e--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[e].src)){this.lexer.inlineQueue[e].src=this.lexer.inlineQueue[e].src.replace(this.rules.other.listReplaceTask,``);break}let n=this.rules.other.listTaskCheckbox.exec(e.raw);if(n){let t={type:`checkbox`,raw:n[0]+` `,checked:n[0]!==`[ ]`};e.checked=t.checked,o.loose?e.tokens[0]&&[`paragraph`,`text`].includes(e.tokens[0].type)&&`tokens`in e.tokens[0]&&e.tokens[0].tokens?(e.tokens[0].raw=t.raw+e.tokens[0].raw,e.tokens[0].text=t.raw+e.tokens[0].text,e.tokens[0].tokens.unshift(t)):e.tokens.unshift({type:`paragraph`,raw:t.raw,text:t.raw,tokens:[t]}):e.tokens.unshift(t)}}else e.task&&=!1}if(o.loose)for(let e of o.items){e.loose=!0;for(let t of e.tokens)t.type===`text`&&(t.type=`paragraph`)}return o}}html(e){let t=this.rules.block.html.exec(e);if(t){let e=tn(t[0]);return{type:`html`,block:!0,raw:e,pre:t[1]===`pre`||t[1]===`script`||t[1]===`style`,text:e}}}def(e){let t=this.rules.block.def.exec(e);if(t){if(!this.rules.other.startAngleBracket.test(t[2])&&rn(t[2],`()`)!==-1)return;let e=nn(t[1]),n=t[2]?t[2].replace(this.rules.other.hrefBrackets,`$1`).replace(this.rules.inline.anyPunctuation,`$1`):``,r=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,`$1`):t[3];return{type:`def`,tag:e,raw:M(t[0],`
`),href:n,title:r}}}table(e){let t=this.rules.block.table.exec(e);if(!t||!this.rules.other.tableDelimiter.test(t[2]))return;let n=en(t[1]),r=t[2].replace(this.rules.other.tableAlignChars,``).split(`|`),i=t[3]?.trim()?t[3].replace(this.rules.other.tableRowBlankLine,``).split(`
`):[],a={type:`table`,raw:M(t[0],`
`),header:[],align:[],rows:[]};if(n.length===r.length){for(let e of r)this.rules.other.tableAlignRight.test(e)?a.align.push(`right`):this.rules.other.tableAlignCenter.test(e)?a.align.push(`center`):this.rules.other.tableAlignLeft.test(e)?a.align.push(`left`):a.align.push(null);for(let e=0;e<n.length;e++)a.header.push({text:n[e],tokens:this.lexer.inline(n[e]),header:!0,align:a.align[e]});for(let e of i)a.rows.push(en(e,a.header.length).map((e,t)=>({text:e,tokens:this.lexer.inline(e),header:!1,align:a.align[t]})));return a}}lheading(e){let t=this.rules.block.lheading.exec(e);if(t){let e=t[1].trim();return{type:`heading`,raw:M(t[0],`
`),depth:t[2].charAt(0)===`=`?1:2,text:e,tokens:this.lexer.inline(e)}}}paragraph(e){let t=this.rules.block.paragraph.exec(e);if(t){let e=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:`paragraph`,raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:`text`,raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:`escape`,raw:t[0],text:t[1]}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:`html`,raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){if(this.lexer.state.linkParenPossible===!1)return;let t=this.rules.inline.link.exec(e);if(t){let n=t[0].charAt(0)===`!`?2:1;if(!this.options.pedantic&&mn(e,t[1],n,this.rules))return;let r=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(r)){if(!this.rules.other.endAngleBracket.test(r))return;let e=M(r.slice(0,-1),`\\`);if((r.length-e.length)%2==0)return}else{let e=rn(t[2],`()`);if(e===-2)return;if(e>-1){let n=(t[0].indexOf(`!`)===0?5:4)+t[1].length+e;t[2]=t[2].substring(0,e),t[0]=t[0].substring(0,n).trim(),t[3]=``}}let i=M(t[0].slice(0,-1),`\\`);if((t[0].length-i.length)%2==0)return;let a=t[2],o=``;if(this.options.pedantic){let e=this.rules.other.pedanticHrefTitle.exec(a);e&&(a=e[1],o=e[3])}else o=t[3]?t[3].slice(1,-1):``;return a=a.trim(),this.rules.other.startAngleBracket.test(a)&&(a=this.options.pedantic&&!this.rules.other.endAngleBracket.test(r)?a.slice(1):a.slice(1,-1)),fn(t,{href:a&&a.replace(this.rules.inline.anyPunctuation,`$1`),title:o&&o.replace(this.rules.inline.anyPunctuation,`$1`)},t[0],this.lexer,this.rules)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let r=n[0].charAt(0)===`!`?2:1;if(!this.options.pedantic&&mn(e,n[1],r,this.rules))return;let i=t[nn(n[2]||n[1])];if(!i){let e=n[0].charAt(0);return{type:`text`,raw:e,text:e}}return fn(n,i,n[0],this.lexer,this.rules)}}emStrong(e,t,n=``){let r=this.rules.inline.emStrongLDelim.exec(e);if(!r||!r[1]&&!r[2]&&!r[3]&&!r[4])return;let i=r[0][0],a=n===i,o=t.length-e.length,s=o;for(;!this.options.pedantic&&s>0&&t[s-1]===i;)s--;let c=[...t.slice(Math.max(0,s-2),s)].at(-1)??``,l=c===`*`||c===`_`||!!this.rules.inline.punctuation.exec(c);s<o&&(n=c);let u=s<o?l:n===`*`||n===`_`||!!this.rules.inline.punctuation.exec(n);if(r[4]&&n.match(this.rules.other.unicodeAlphaNumeric))return;let d=r[1]||r[3]||``;if(!d||!n||u){let n=[...r[0]].length-1,u,f,p=n,m=0,h=o-s+n,g=!this.options.pedantic&&!!c.trim()&&(!!d||i===`*`&&!l);if(i!==`*`&&i!==`_`)return;let _=i===`*`?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd,v=ln(this,t,i),y=t.length-e.length+n;if(v<y)return;t=t.slice(-1*e.length+n);let b=v-y;for(_.lastIndex=0;(r=_.exec(t))!==null&&!(r.index>b);){if(u=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!u)continue;if(f=[...u].length,r[3]||r[4]){p+=f;continue}if(r[5]||r[6]||g){if(a&&(r[5]||r[6]))break;if(h%3&&!((h+f)%3)){m+=f;continue}}if(p-=f,p>0)continue;f=Math.min(f,f+p+m);let t=[...r[0]][0].length,i=e.slice(0,n+r.index+t+f);if(Math.min(n,f)%2){let e=i.slice(1,-1);return{type:`em`,raw:i,text:e,tokens:this.lexer.inlineTokens(e)}}let o=i.slice(2,-2);return{type:`strong`,raw:i,text:o,tokens:this.lexer.inlineTokens(o)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let e=t[2].replace(this.rules.other.newLineCharGlobal,` `),n=this.rules.other.nonSpaceChar.test(e),r=this.rules.other.startingSpaceChar.test(e)&&this.rules.other.endingSpaceChar.test(e);return n&&r&&(e=e.substring(1,e.length-1)),{type:`codespan`,raw:t[0],text:e}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:`br`,raw:t[0]}}del(e,t,n=``){let r=this.rules.inline.delLDelim.exec(e);if(r&&(!r[1]||!n||this.rules.inline.punctuation.exec(n))){let n=[...r[0]].length-1,i,a,o=n,s=this.rules.inline.delRDelim,c=un(this,t),l=t.length-e.length+n;if(c<l)return;t=t.slice(-1*e.length+n);let u=c-l;for(s.lastIndex=0;(r=s.exec(t))!==null&&!(r.index>u);){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i||(a=[...i].length,a!==n))continue;if(r[3]||r[4]){o+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o);let t=[...r[0]][0].length,s=e.slice(0,n+r.index+t+a),c=s.slice(n,-n);return{type:`del`,raw:s,text:c,tokens:this.lexer.inlineTokens(c)}}}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let e,n;return t[2]===`@`?(e=t[1],n=`mailto:`+e):(e=t[1],n=e),{type:`link`,raw:t[0],text:e,href:n,autolink:!0,tokens:[{type:`text`,raw:e,text:e}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let e,n;if(t[2]===`@`)e=t[0],n=`mailto:`+e;else{let r;do r=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??``;while(r!==t[0]);e=t[0],n=t[1]===`www.`?`http://`+t[0]:t[0]}return{type:`link`,raw:t[0],text:e,href:n,autolink:!0,tokens:[{type:`text`,raw:e,text:e}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let e=this.lexer.state.inRawBlock;return{type:`text`,raw:t[0],text:e?t[0]:Qt(t[0]),escaped:e}}}},N=class e{tokens;options;state;inlineQueue;tokenizer;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||Ae,this.options.tokenizer=this.options.tokenizer||new hn,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,linkEmitted:!1,linkParenPossible:!0,top:!0};let t={other:k,block:Jt.normal,inline:Yt.normal};this.options.pedantic?(t.block=Jt.pedantic,t.inline=Yt.pedantic):this.options.gfm&&(t.block=Jt.gfm,t.inline=this.options.breaks?Yt.breaks:Yt.gfm),this.tokenizer.rules=t}static get rules(){return{block:Jt,inline:Yt}}static lex(t,n){return new e(n).lex(t)}static lexInline(t,n){return new e(n).inlineTokens(t)}lex(e){e=e.replace(k.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let e=0;e<this.inlineQueue.length;e++){let t=this.inlineQueue[e];this.state.inRawBlock=!1,this.inlineTokens(t.src,t.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){this.tokenizer.lexer=this;let r=this.state.lastToken;this.options.pedantic&&(e=e.replace(k.tabCharGlobal,`    `).replace(k.spaceLine,``));let i=1/0;for(;e;){if(e.length<i)i=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}this.state.lastToken=t.at(-1);let r;if(this.options.extensions?.block?.some(n=>(r=n.call({lexer:this},e,t))?(e=e.substring(r.raw.length),t.push(r),!0):!1))continue;if(r=this.tokenizer.space(e)){e=e.substring(r.raw.length);let n=t.at(-1);r.raw.length===1&&n!==void 0?n.raw+=`
`:t.push(r);continue}if(r=this.tokenizer.code(e)){e=e.substring(r.raw.length);let n=t.at(-1);n?.type===`paragraph`||n?.type===`text`?(n.raw+=(n.raw.endsWith(`
`)?``:`
`)+r.raw,n.text+=`
`+r.text,this.inlineQueue.at(-1).src=n.text):t.push(r);continue}if((r=this.tokenizer.fences(e))||(r=this.tokenizer.heading(e))||(r=this.tokenizer.hr(e))||(r=this.tokenizer.blockquote(e))||(r=this.tokenizer.list(e))||(r=this.tokenizer.html(e))){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.def(e)){e=e.substring(r.raw.length);let n=t.at(-1);n?.type===`paragraph`||n?.type===`text`?(n.raw+=(n.raw.endsWith(`
`)?``:`
`)+r.raw,n.text+=`
`+r.raw,this.inlineQueue.at(-1).src=n.text):(this.tokens.links[r.tag]||(this.tokens.links[r.tag]={href:r.href,title:r.title}),t.push(r));continue}if((r=this.tokenizer.table(e))||(r=this.tokenizer.lheading(e))){e=e.substring(r.raw.length),t.push(r);continue}let a=e;if(this.options.extensions?.startBlock){let t=1/0,n=e.slice(1),r;this.options.extensions.startBlock.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(a=e.substring(0,t+1))}if(this.state.top&&(r=this.tokenizer.paragraph(a))){let i=t.at(-1);n&&i?.type===`paragraph`?(i.raw+=(i.raw.endsWith(`
`)?``:`
`)+r.raw,i.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=i.text):t.push(r),n=a.length!==e.length,e=e.substring(r.raw.length)}else if(r=this.tokenizer.text(e)){e=e.substring(r.raw.length);let n=t.at(-1);n?.type===`text`?(n.raw+=(n.raw.endsWith(`
`)?``:`
`)+r.raw,n.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=n.text):t.push(r)}else if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return this.state.top=!0,this.state.lastToken=r,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}linkInText(e){if(!e.includes(`[`))return!1;let t=this.tokenizer.rules.inline.link;for(let n of e.matchAll(this.tokenizer.rules.inline.blockSkip))if(t.test(n[0])&&e.charAt(n.index-1)!==`!`)return!0;for(let t of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)){let e=t[0],n=e.lastIndexOf(`[`);if(e.charAt(0)!==`!`&&Object.hasOwn(this.tokens.links,nn(e.slice(n+1,-1)))&&!(n>1&&this.linkInText(e.slice(1,n-1))))return!0}return!1}inlineTokens(e,t=[]){this.tokenizer.lexer=this;let n=this.state.linkParenPossible;this.state.linkParenPossible=n&&e.includes(`)`);try{return this.#e(e,t)}finally{this.state.linkParenPossible=n}}#e(e,t){let n=e.includes(`*`)||e.includes(`_`)||e.includes(`~`)||this.options.hooks?.emStrongMask||this.tokenizer.emStrong!==hn.prototype.emStrong||this.tokenizer.del!==hn.prototype.del?this.#r(e):e;sn(this.tokenizer,n);try{return this.#t(e,n,t)}finally{cn(this.tokenizer)}}#t(e,t,n){let r=!1,i=``,a=1/0;for(;e;){if(e.length<a)a=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}r||(i=``),r=!1;let o;if(this.options.extensions?.inline?.some(t=>(o=t.call({lexer:this},e,n))?(e=e.substring(o.raw.length),n.push(o),!0):!1))continue;if((o=this.tokenizer.escape(e))||(o=this.tokenizer.tag(e))||(o=this.tokenizer.link(e))){e=e.substring(o.raw.length),n.push(o);continue}if(o=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(o.raw.length);let t=n.at(-1);o.type===`text`&&t?.type===`text`?(t.raw+=o.raw,t.text+=o.text):n.push(o);continue}if((o=this.tokenizer.emStrong(e,t,i))||(o=this.tokenizer.codespan(e))||(o=this.tokenizer.br(e))||(o=this.tokenizer.del(e,t,i))||(o=this.tokenizer.autolink(e))||!this.state.inLink&&(o=this.tokenizer.url(e))){e=e.substring(o.raw.length),n.push(o);continue}let s=e;if(this.options.extensions?.startInline){let t=1/0,n=e.slice(1),r;this.options.extensions.startInline.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(s=e.substring(0,t+1))}if(o=this.tokenizer.inlineText(s)){e=e.substring(o.raw.length),o.raw.slice(-1)!==`_`&&(i=o.raw.slice(-1)),r=!0;let t=n.at(-1);t?.type===`text`?(t.raw+=o.raw,t.text+=o.text):n.push(o)}else if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return n}#n(e){let{blockSkip:t,tag:n,autolink:r}=this.tokenizer.rules.inline,i=``,a=0,o;for(t.lastIndex=0;o=t.exec(e);){let s=o.index+(o[2]?o[2].length:0),c=o.index+o[0].length;if(e.charAt(s)===`<`){let i=e.slice(s),a=n.exec(i)||r.exec(i);if(!a){t.lastIndex=s+1;continue}c=s+a[0].length,t.lastIndex=c}i+=e.slice(a,s)+`[`+`a`.repeat(c-s-2)+`]`,a=c}return i+e.slice(a)}#r(e){let t=e;if(this.tokens.links&&e.includes(`[`)){let e=this.tokenizer.rules.inline.reflinkSearch,n=t=>{let r=t.lastIndexOf(`[`);if(!Object.hasOwn(this.tokens.links,nn(t.slice(r+1,-1))))return t;if(r>1&&t.charAt(0)!==`!`){let i=t.slice(1,r-1);if(this.linkInText(i))return`[`+i.replace(e,n)+`][`+`a`.repeat(t.length-r-2)+`]`}return`[`+`a`.repeat(t.length-2)+`]`};t=t.replace(e,n)}return t=t.replace(this.tokenizer.rules.inline.anyPunctuationOutsideCode,(e,t,n)=>n?`+`.repeat(e.length):t?t+e.slice(t.length,-t.length).replace(/`/g,`+`)+t:e),t=this.#n(t),t=this.options.hooks?.emStrongMask?.call({lexer:this},t)??t,t}infiniteLoopError(e){let t=`Infinite loop on byte: `+e;if(this.options.silent)console.error(t);else throw Error(t)}},gn=class{options;parser;constructor(e){this.options=e||Ae}space(e){return``}code({text:e,lang:t,escaped:n}){let r=(t||``).match(k.notSpaceStart)?.[0],i=e?e.replace(k.endingNewline,``)+`
`:``;return r?`<pre><code class="language-`+j(r)+`">`+(n?i:j(i,!0))+`</code></pre>
`:`<pre><code>`+(n?i:j(i,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}def(e){return``}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){let t=e.ordered,n=e.start,r=``;for(let t=0;t<e.items.length;t++){let n=e.items[t];r+=this.listitem(n)}let i=t?`ol`:`ul`,a=t&&n!==1?` start="`+n+`"`:``;return`<`+i+a+`>
`+r+`</`+i+`>
`}listitem(e){return`<li>${this.parser.parse(e.tokens)}</li>
`}checkbox({checked:e}){return`<input `+(e?`checked="" `:``)+`disabled="" type="checkbox"> `}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t=``,n=``;for(let t=0;t<e.header.length;t++)n+=this.tablecell(e.header[t]);t+=this.tablerow({text:n});let r=``;for(let t=0;t<e.rows.length;t++){let i=e.rows[t];n=``;for(let e=0;e<i.length;e++)n+=this.tablecell(i[e]);r+=this.tablerow({text:n})}return r&&=`<tbody>${r}</tbody>`,`<table>
<thead>
`+t+`</thead>
`+r+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){let t=this.parser.parseInline(e.tokens),n=e.header?`th`:`td`;return(e.align?`<${n} align="${e.align}">`:`<${n}>`)+t+`</${n}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${j(e,!0)}</code>`}br(e){return`<br>`}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,text:n,tokens:r,autolink:i}){let a=i?j(n,!0):this.parser.parseInline(r),o=$t(e);if(o===null)return a;e=j(o,i);let s=`<a href="`+e+`"`;return t&&(s+=` title="`+j(t)+`"`),s+=`>`+a+`</a>`,s}image({href:e,title:t,text:n,tokens:r}){r&&(n=this.parser.parseInline(r,this.parser.textRenderer));let i=$t(e);if(i===null)return j(n);e=i;let a=`<img src="${j(e)}" alt="${j(n)}"`;return t&&(a+=` title="${j(t)}"`),a+=`>`,a}text(e){return`tokens`in e&&e.tokens?this.parser.parseInline(e.tokens):`escaped`in e&&e.escaped?e.text:j(e.text)}},_n=class{parser;strong({text:e,tokens:t}){return t?this.parser.parseInline(t,this):e}em({text:e,tokens:t}){return t?this.parser.parseInline(t,this):e}codespan({text:e}){return e}del({text:e,tokens:t}){return t?this.parser.parseInline(t,this):e}html({text:e}){return e}text({text:e}){return e}link({text:e,tokens:t}){return t?this.parser.parseInline(t,this):e}image({text:e,tokens:t}){return t?this.parser.parseInline(t,this):e}br(){return`
`}checkbox({raw:e}){return e}},P=class e{options;renderer;textRenderer;constructor(e){this.options=e||Ae,this.options.renderer=this.options.renderer||new gn,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new _n,this.textRenderer.parser=this}static parse(t,n){return new e(n).parse(t)}static parseInline(t,n){return new e(n).parseInline(t)}parse(e){this.renderer.parser=this;let t=``;for(let n=0;n<e.length;n++){let r=e[n];if(this.options.extensions?.renderers?.[r.type]){let e=r,n=this.options.extensions.renderers[e.type].call({parser:this},e);if(n!==!1||![`space`,`hr`,`heading`,`code`,`table`,`blockquote`,`list`,`checkbox`,`html`,`def`,`paragraph`,`text`].includes(e.type)){t+=n===!1?``:n??``;continue}}let i=r;switch(i.type){case`space`:t+=this.renderer.space(i);break;case`hr`:t+=this.renderer.hr(i);break;case`heading`:t+=this.renderer.heading(i);break;case`code`:t+=this.renderer.code(i);break;case`table`:t+=this.renderer.table(i);break;case`blockquote`:t+=this.renderer.blockquote(i);break;case`list`:t+=this.renderer.list(i);break;case`checkbox`:t+=this.renderer.checkbox(i);break;case`html`:t+=this.renderer.html(i);break;case`def`:t+=this.renderer.def(i);break;case`paragraph`:t+=this.renderer.paragraph(i);break;case`text`:t+=this.renderer.text(i);break;default:{let e=`Token with "`+i.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return t}parseInline(e,t=this.renderer){this.renderer.parser=this;let n=``;for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let e=this.options.extensions.renderers[i.type].call({parser:this},i);if(e!==!1||![`escape`,`html`,`link`,`image`,`checkbox`,`strong`,`em`,`codespan`,`br`,`del`,`text`].includes(i.type)){n+=e===!1?``:e??``;continue}}let a=i;switch(a.type){case`escape`:n+=t.text(a);break;case`html`:n+=t.html(a);break;case`link`:n+=t.link(a);break;case`image`:n+=t.image(a);break;case`checkbox`:n+=t.checkbox(a);break;case`strong`:n+=t.strong(a);break;case`em`:n+=t.em(a);break;case`codespan`:n+=t.codespan(a);break;case`br`:n+=t.br(a);break;case`del`:n+=t.del(a);break;case`text`:n+=t.text(a);break;default:{let e=`Token with "`+a.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return n}},vn=class{options;block;constructor(e){this.options=e||Ae}static passThroughHooks=new Set([`preprocess`,`postprocess`,`processAllTokens`,`emStrongMask`]);static passThroughHooksRespectAsync=new Set([`preprocess`,`postprocess`,`processAllTokens`]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}emStrongMask(e){return e}provideLexer(e=this.block){return e?N.lex:N.lexInline}provideParser(e=this.block){return e?P.parse:P.parseInline}};function F(e,t){if(Array.isArray(t))for(let n=0;n<t.length;n++)e.push(t[n]);else e.push(t)}var yn=new class{defaults=ke();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=P;Renderer=gn;TextRenderer=_n;Lexer=N;Tokenizer=hn;Hooks=vn;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let r of e)switch(F(n,t.call(this,r)),r.type){case`table`:{let e=r;for(let r of e.header)F(n,this.walkTokens(r.tokens,t));for(let r of e.rows)for(let e of r)F(n,this.walkTokens(e.tokens,t));break}case`list`:{let e=r;F(n,this.walkTokens(e.items,t));break}default:{let e=r;this.defaults.extensions?.childTokens?.[e.type]?this.defaults.extensions.childTokens[e.type].forEach(r=>{let i=e[r].flat(1/0);F(n,this.walkTokens(i,t))}):e.tokens&&F(n,this.walkTokens(e.tokens,t))}}return n}use(...e){let t=this.defaults.extensions||{renderers:Object.create(null),childTokens:Object.create(null)};return e.forEach(e=>{let n={...e};if(n.async=this.defaults.async||n.async||!1,e.extensions&&(e.extensions.forEach(e=>{if(!e.name)throw Error(`extension name required`);if(`renderer`in e){let n=t.renderers[e.name];n?t.renderers[e.name]=function(...t){let r=e.renderer.apply(this,t);return r===!1&&(r=n.apply(this,t)),r}:t.renderers[e.name]=e.renderer}if(`tokenizer`in e){if(!e.level||e.level!==`block`&&e.level!==`inline`)throw Error(`extension level must be 'block' or 'inline'`);let n=t[e.level];n?n.unshift(e.tokenizer):t[e.level]=[e.tokenizer],e.start&&(e.level===`block`?t.startBlock?t.startBlock.push(e.start):t.startBlock=[e.start]:e.level===`inline`&&(t.startInline?t.startInline.push(e.start):t.startInline=[e.start]))}`childTokens`in e&&e.childTokens&&(t.childTokens[e.name]=e.childTokens)}),n.extensions=t),e.renderer){let t=this.defaults.renderer||new gn(this.defaults);for(let n in e.renderer){if(!(n in t))throw Error(`renderer '${n}' does not exist`);if([`options`,`parser`].includes(n))continue;let r=n,i=e.renderer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n===!1?``:n??``}}n.renderer=t}if(e.tokenizer){let t=this.defaults.tokenizer||new hn(this.defaults);for(let n in e.tokenizer){if(!(n in t))throw Error(`tokenizer '${n}' does not exist`);if([`options`,`rules`,`lexer`].includes(n))continue;let r=n,i=e.tokenizer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.tokenizer=t}if(e.hooks){let t=this.defaults.hooks||new vn;for(let n in e.hooks){if(!(n in t))throw Error(`hook '${n}' does not exist`);if([`options`,`block`].includes(n))continue;let r=n,i=e.hooks[r],a=t[r];t[r]=vn.passThroughHooks.has(n)?e=>{if(t.options.async&&vn.passThroughHooksRespectAsync.has(n))return(async()=>{let n=await i.call(t,e);return a.call(t,n)})();let r=i.call(t,e);return a.call(t,r)}:(...e)=>{if(t.options.async)return(async()=>{let n=await i.apply(t,e);return n===!1&&(n=await a.apply(t,e)),n})();let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.hooks=t}if(e.walkTokens){let t=this.defaults.walkTokens,r=e.walkTokens;n.walkTokens=function(e){let n=[];return F(n,r.call(this,e)),t&&F(n,t.call(this,e)),n}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return N.lex(e,t??this.defaults)}parser(e,t){return P.parse(e,t??this.defaults)}parseMarkdown(e){return(t,n)=>{let r={...n},i={...this.defaults,...r},a=this.onError(!!i.silent,!!i.async);if(this.defaults.async===!0&&r.async===!1)return a(Error(`marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise.`));if(typeof t>`u`||t===null)return a(Error(`marked(): input parameter is undefined or null`));if(typeof t!=`string`)return a(Error(`marked(): input parameter is of type `+Object.prototype.toString.call(t)+`, string expected`));if(i.hooks&&(i.hooks.options=i,i.hooks.block=e),i.async)return(async()=>{let n=i.hooks?await i.hooks.preprocess(t):t,r=await(i.hooks?await i.hooks.provideLexer(e):e?N.lex:N.lexInline)(n,i),a=i.hooks?await i.hooks.processAllTokens(r):r;i.walkTokens&&await Promise.all(this.walkTokens(a,i.walkTokens));let o=await(i.hooks?await i.hooks.provideParser(e):e?P.parse:P.parseInline)(a,i);return i.hooks?await i.hooks.postprocess(o):o})().catch(a);try{i.hooks&&(t=i.hooks.preprocess(t));let n=(i.hooks?i.hooks.provideLexer(e):e?N.lex:N.lexInline)(t,i);i.hooks&&(n=i.hooks.processAllTokens(n)),i.walkTokens&&this.walkTokens(n,i.walkTokens);let r=(i.hooks?i.hooks.provideParser(e):e?P.parse:P.parseInline)(n,i);return i.hooks&&(r=i.hooks.postprocess(r)),r}catch(e){return a(e)}}}onError(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let e=`<p>An error occurred:</p><pre>`+j(n.message+``,!0)+`</pre>`;return t?Promise.resolve(e):e}if(t)return Promise.reject(n);throw n}}};function I(e,t){return yn.parse(e,t)}I.options=I.setOptions=function(e){return yn.setOptions(e),I.defaults=yn.defaults,je(I.defaults),I},I.getDefaults=ke,I.defaults=Ae;function bn(...e){return yn.use(...e),I.defaults=yn.defaults,je(I.defaults),I}I.use=bn,I.walkTokens=function(e,t){return yn.walkTokens(e,t)},I.parseInline=yn.parseInline,I.Parser=P,I.parser=P.parse,I.Renderer=gn,I.TextRenderer=_n,I.Lexer=N,I.lexer=N.lex,I.Tokenizer=hn,I.Hooks=vn,I.parse=I,I.options,I.setOptions,I.walkTokens,I.parseInline,P.parse,N.lex;var xn=`# PitBeacon Developer Card Editor — Guide

This document covers the raw code editor for building custom PitBeacon
cards: what the editor gives you, how the SDK works, and a full starter
template you can copy, rename, and adapt.

---

## 1. What the Developer Editor Is

The Developer Card Editor lets you write a card as three plain files —
**HTML**, **CSS**, and **JavaScript** — that get bundled together and run
inside a sandboxed \`<iframe>\` on your pit display. This is the "I want full
control" path, as opposed to picking a pre-built template and only changing
a few marked values (see Section 5 for a template you can start from
either way).

A card you save here is stored locally in your browser and immediately
available on your pit display. It is **not** uploaded anywhere — there is
no server involved, since PitBeacon is a static site. If you want to share
cards, just export them as a json file.

### Opening the editor

- **Create New Card** — starts you from a blank/default example.
- **Edit an existing card** — pick any previously-saved card from the list
  to load its HTML/CSS/JS back into the editor.

### Editor features

The HTML, CSS, and JS panels are full code editors, not plain text boxes:

- **Syntax highlighting** for each language (when your connection allows
  loading the highlighting library — see "Offline behavior" below).
- **Tab / Shift+Tab** — indent or dedent the current line, or every line in
  a selection.
- **Auto-indent on Enter** — matches the indentation of the line above, and
  adds an extra level after an opening \`{\`, \`[\`, or \`(\`.
- **Auto-closing pairs** — typing \`(\`, \`[\`, \`{\`, \`"\`, or \`'\` automatically
  inserts its matching closer; typing the closer yourself just skips over
  the auto-inserted one instead of duplicating it.
- **Smart backspace** — deleting inside an empty pair (e.g. \`()\`) removes
  both characters at once.
- **\`Cmd/Ctrl + S\`** — saves the card without needing to click the Save
  button.
- **\`Cmd/Ctrl + Enter\`** — refreshes the live preview.

**Offline behavior:** the editor tries to load a syntax-highlighting
library from a CDN. If your connection can't reach it (e.g. no wifi at a
venue), the editor automatically falls back to a plain but still fully
functional mode — you keep all the keyboard behaviors above, just without
color-coding. Nothing breaks either way.

### Live Preview

The Preview panel renders your card using **mock data** — a fake match, a
fake team number, and \`fetchCustom\` calls that don't hit the real network
(so you can safely test a card's logic without spamming your actual
endpoint while you're still writing it). Use the real pit display to see a
card against live data.

### Saving

Every card needs a unique **Card ID** (used internally) and a **Label**
(what you'll see when picking it later). Saved cards persist in your
browser and reappear next time you open the editor.

---

## 2. The SDK: What Your Card Can Do

Inside your card's JavaScript, \`window.__pitbeaconSDK\` (usually aliased to
a local \`sdk\` variable) gives you access to match state, data sources, and
a handful of utilities. Everything below is available from card code.

> **Async note:** Several of these return a \`Promise\` and need \`await\` (or
> \`.then()\`) — marked below. \`getState()\` and \`onStateChange()\` are the
> only synchronous ones.

### State

\`\`\`js
sdk.getState()
\`\`\`
Returns the current match/event state object synchronously. Useful inside
a click handler or timer where you need a snapshot *right now*, rather
than subscribing separately.

\`\`\`js
sdk.onStateChange(callback)
\`\`\`
Subscribes to state changes. Calls \`callback(state)\` immediately with the
current state, then again every time it updates. Returns an unsubscribe
function.

### Built-in data sources

\`\`\`js
await sdk.fetchDataSource(name)
\`\`\`
Fetches one of PitBeacon's built-in data sources. Resolves with the data,
or rejects on failure — wrap in \`try/catch\` if you use this directly. Valid data sources as of now are 'teamNumber', 'matchAlarmSound', 'noteAlarmSound', and 'eventName'.

### Custom endpoints — \`fetchCustom\`

This is how you pull data from **your own** infrastructure — a Google
Sheet, a scouting server, anything with a URL.

\`\`\`js
const result = await sdk.fetchCustom(url, options);
\`\`\`

**Unlike \`fetchDataSource\`, this never throws.** It always resolves to:

\`\`\`js
{ ok: boolean, data: any, error: string | null, status: number | null }
\`\`\`

Always check \`result.ok\` before using \`result.data\`. This matters a lot on
flaky venue wifi — your card can show "last known data" or a friendly
error instead of silently breaking.

**\`options\`** (all optional):

| Option | Default | Meaning |
|---|---|---|
| \`method\` | \`'GET'\` | HTTP method |
| \`headers\` | \`{}\` | Request headers, e.g. an API key |
| \`body\` | \`null\` | Request body (ignored for GET/HEAD) |
| \`timeoutMs\` | \`8000\` | Give up after this long, reported as an error rather than hanging forever |
| \`cacheSeconds\` | \`0\` | Reuse a completed result for this many seconds — good for endpoints multiple cards or repeated renders all hit |
| \`parse\` | \`JSON.parse\` | A function \`(rawText) => yourData\` for handling non-JSON responses (CSV, Google's \`gviz\` format, etc.) |

**Important limitation on \`parse\`:** it can only see the raw text you give
it — it **cannot** reference other variables from elsewhere in your card
script. Everything it needs must come from the \`rawText\` argument itself.
This is fine for the common case (reshaping/unwrapping a response), but
keep it in mind if a parse function you write "mysteriously" can't see a
variable you expected it to.

**Example:**

\`\`\`js
const result = await sdk.fetchCustom('https://example.com/api/data', {
  headers: { 'Authorization': 'Bearer ' + API_KEY },
  cacheSeconds: 15,
  parse: (text) => JSON.parse(text).rows,
});

if (result.ok) {
  console.log(result.data);
} else {
  console.warn('Fetch failed:', result.error);
}
\`\`\`

**A note on API keys:** any key you put in a card's headers lives in that
card's saved code, visible to anyone with devtools open on that browser —
which is normal for a client-side app. The one thing to genuinely watch
for: **if you export or share a card** (e.g. posting it as a template on
ChiefDelphi), double-check it doesn't still contain your personal API key
before sharing it publicly.

If your API key is rejected even though it looks correct, check whether
it's **referrer-restricted** to a specific domain — you may need to add
PitBeacon's URL to that key's allowlist in whatever service issued it.

### Alarms

\`\`\`js
sdk.triggerAlarm(nameOrPreset)
\`\`\`
Plays a sound. Pass either:
- a **preset** — \`'match'\` or \`'note'\` — which plays whatever sound is
  configured for that event, or
- a **literal sound name** — e.g. \`'chime'\` — to play a specific sound
  directly.

Sounds are a fixed set shipped with PitBeacon (no custom uploads, since
this is a static site) — see \`getAlarmSounds()\` for the full list.

\`\`\`js
await sdk.getAlarmSounds()
\`\`\`
Returns the list of valid sound names, e.g. \`['alarm1', 'alarm2', 'chime', 'buzzer']\`.

### Notifications

\`\`\`js
sdk.notify(message, type)
\`\`\`
Shows a visual toast/message — no sound. \`type\` defaults to \`'message'\`.
Distinct from \`triggerAlarm\`: call both if you want a sound *and* a
message for the same event.

### Per-card storage

\`\`\`js
await sdk.storage.get(key)
await sdk.storage.set(key, value)
await sdk.storage.delete(key)
\`\`\`
Simple persistent key/value storage, automatically scoped to your card —
two different cards' \`myKey\` won't collide. Useful for anything your card
needs to remember between reloads, e.g. "which matches has this scout
already submitted."

Cards run in a locked-down sandbox: they cannot read the page, cookies,
\`localStorage\` or IndexedDB directly. \`sdk.storage\` is the only way to keep
data, and it is limited to your own card (as of the 2027 release; older
versions shared one storage area between all cards, and a value written
there is copied into your card the first time it is read).

### Config

\`\`\`js
await sdk.getConfig()
\`\`\`
Returns a small set of app-level settings your card can read, e.g.
\`{ teamNumber, matchAlarmSound, noteAlarmSound }\`. Use this instead of a
dedicated "get team number" call — e.g. \`(await sdk.getConfig()).teamNumber\`.

### User-configurable card settings

Use \`sdk.configurable(name, defaultValue, options)\` for values that should
be editable by the person using the card. The catalog detects these calls
from your JavaScript when you upload the card and creates the controls
automatically. The selected values are saved locally per card and are used
in the catalog preview, Card Registry, and layout.

\`\`\`js
const teamNumber = sdk.configurable("teamNumber", 7250, {
  label: "Team Number",
  min: 1,
  max: 99999,
});

const sheetTab = sdk.configurable("sheetTab", "Trivia", {
  label: "Google Sheet Tab",
});

const showPredictions = sdk.configurable("showPredictions", true, {
  label: "Show Predictions",
});
\`\`\`

The function returns the user's selected value, or the default value when
the card has not been configured yet. Use the returned value directly in
the rest of your card code:

\`\`\`js
const teamNumber = sdk.configurable("teamNumber", 7250);
const url = \`https://example.com/team/\${teamNumber}\`;
\`\`\`

The type is inferred from the default value:

| Default value | Control |
|---|---|
| \`"text"\` | Text input |
| \`7250\` | Number input |
| \`true\` or \`false\` | Checkbox |
| \`"#2f3070"\` | Color input |

Optional properties are:

| Property | Meaning |
|---|---|
| \`label\` | Human-readable control label |
| \`type\` | Explicitly set \`text\`, \`number\`, \`checkbox\`, \`color\`, or \`select\` |
| \`min\`, \`max\`, \`step\` | Number input limits and increment |
| \`options\` | Values for a \`select\` control |

For a dropdown, provide the type and options explicitly:

\`\`\`js
const alliance = sdk.configurable("alliance", "red", {
  label: "Alliance",
  type: "select",
  options: ["red", "blue"],
});
\`\`\`

Keep the setting name stable after publishing a card. Changing it creates
a new setting and can make existing users' saved value stop applying.
Only use literal names and default values in the call so the catalog can
discover them reliably. Dynamic calls such as
\`sdk.configurable(variableName, value)\` cannot be detected automatically.

The upload form does not require a separate settings JSON file. Upload the
card JavaScript containing the calls above, and the metadata is generated
from the code. A card's JavaScript can also call
\`sdk.getSetting(name, fallback)\` to read the current value, but
\`sdk.configurable()\` is preferred because it both declares and reads the
setting.

### Custom refresh — \`updateCard\`

**The default behavior:** PitBeacon polls for fresh match/event data on a
rolling 30–60 second cadence (a random delay in that range, so cards
across different displays don't all hit the network at once). Every time
that poll completes, your card gets a fresh \`stateUpdate\` — which is what
fires your \`onStateChange\` callbacks.

That default is fine for most cards. Reach for \`updateCard\` when you want
something different — a faster local countdown, a slower check to avoid
re-rendering something expensive, or a check that should only react to one
specific slice of state instead of *any* state change:

\`\`\`js
sdk.updateCard(interval, refreshCallback, compareFn)
\`\`\`

| Param | Required | Meaning |
|---|---|---|
| \`interval\` | Yes | Milliseconds between checks. Silently does nothing if this isn't a positive number. |
| \`refreshCallback\` | No | \`function(state, sdk)\`, called only when \`compareFn\`'s output has actually changed since the last check. |
| \`compareFn\` | No | \`function(state, sdk)\`, returns whatever snapshot of state you actually care about. Defaults to the entire state object if you leave it out. |

**Calling this opts your card out of the default refresh entirely.**
From that point on, nothing re-checks your card until your own \`interval\`
timer fires — the regular 30–60 second poll cycle skips it completely.
If you never call \`updateCard\`, your card just keeps getting the default
treatment described above; you don't need to do anything to get that.

A couple of things that are specific to the Developer Editor (as opposed
to PitBeacon's built-in cards):

- **The callback only gets \`(state, sdk)\`**, not an element reference.
  Built-in cards get passed the outer container element because their
  code lives outside it; your card's HTML *is* the entire iframe body, so
  you just query it directly (\`document.getElementById(...)\`, etc.) — no
  element to pass in.
- **It's safe to call once, directly in your top-level script.** Your
  card's JS runs fresh exactly once per load (unlike a \`render()\` function
  that re-runs on every tick), so there's no need to guard it with an
  "only set this up once" flag — just call \`sdk.updateCard(...)\` near the
  top of your script and let it run.

**Why bother with \`compareFn\`:** without one, \`updateCard\` diffs the
*entire* state object on every check — which includes things like the
live clock, so it looks "changed" on basically every tick regardless of
whether anything your card actually displays moved. A \`compareFn\` scopes
the diff down to just the fields you care about, so \`refreshCallback\`
only fires when something relevant actually changed:

\`\`\`js
sdk.updateCard(
  1000,
  (state, sdk) => {
    // Your custom render/update logic goes here.
    renderMyCard(state, sdk);
  },
  (state) => ({
    // Only this field is compared — anything else changing elsewhere in
    // app state (e.g. the live clock) won't cause a false "changed" match.
    matches: state.currentMatches,
  }),
);
\`\`\`

(\`compareFn\` only receives \`state\` — anything else your card needs, like
config values, should be read inside \`refreshCallback\` via \`sdk\`, or
captured from an earlier \`await sdk.getConfig()\` call, since \`getConfig\`
itself is async and can't be called synchronously inside \`compareFn\`.)

---

## 3. Configuring a Card for Your Own System

Cards that call \`fetchCustom\` almost always need something specific to
*you* — a URL, a sheet ID, or an API key. Declare user-editable values with
\`sdk.configurable()\` near the top of the JavaScript panel:

\`\`\`js
const sheetId = sdk.configurable("sheetId", "PASTE_YOUR_SHEET_ID_HERE", {
  label: "Google Sheet ID",
});
const sheetTab = sdk.configurable("sheetTab", "Matches", {
  label: "Sheet Tab",
});
const apiKey = sdk.configurable("apiKey", "", {
  label: "API Key",
});
\`\`\`

The catalog and Card Registry turn these declarations into editable
controls. Do not put private credentials in a card: card code and settings
are client-side and visible to anyone who can inspect the browser.

---

## 4. Copying Code Out

The **Code** tab shows the fully generated HTML, CSS, and JS for the
current card, and a **Copy** button puts all three in your clipboard
together — handy for sharing a card with a teammate or posting it as a
template for others.

You can also download the card as a json file to share.

---

## 5. Starter Template: Team Info from a Google Sheet

This template reads a row from a published Google Sheet (no server to
deploy — just "Publish to web" your sheet) and displays it as a simple
card. It uses Google's \`gviz\` endpoint, which returns a JSON-like response
wrapped in a bit of extra text — the \`parse\` function below strips that
wrapper for you, so you don't need to understand the format, just paste
your sheet's ID and tab name.

### How to get your Sheet ID and set sharing

1. Open your Google Sheet.
2. Click **Share** → set to **"Anyone with the link" → Viewer**.
3. Your Sheet ID is the long string in the URL, between \`/d/\` and
   \`/edit\`:
   \`https://docs.google.com/spreadsheets/d/\`**\`THIS_PART\`**\`/edit\`
4. Note the exact name of the tab (bottom of the sheet) you want to read.

### HTML

\`\`\`html
<div class="team-info-card">
  <h2 id="teamName">Loading...</h2>
  <div class="team-info-row">
    <span class="team-info-label">Team #</span>
    <span id="teamNumber">—</span>
  </div>
  <div class="team-info-row">
    <span class="team-info-label">Notes</span>
    <span id="teamNotes">—</span>
  </div>
  <div id="statusMsg" class="status-msg"></div>
</div>
\`\`\`

### CSS

\`\`\`css
.team-info-card {
  padding: 16px;
  font-family: 'Rubik', sans-serif;
}
.team-info-card h2 {
  margin: 0 0 12px 0;
  color: var(--text-primary);
}
.team-info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
}
.team-info-label {
  color: var(--text-muted);
}
.status-msg {
  margin-top: 12px;
  font-size: 0.8rem;
  color: var(--text-dim);
  font-style: italic;
}
\`\`\`

### JavaScript

\`\`\`js
const sdk = window.__pitbeaconSDK;

// ┌─ CONFIGURE THIS ──────────────────────────────────────────
// Paste your own Google Sheet's ID and tab name below.
const SHEET_ID  = "PASTE_YOUR_SHEET_ID_HERE";
const SHEET_TAB = "TeamInfo";
// └────────────────────────────────────────────────────────────

const url =
  \`https://docs.google.com/spreadsheets/d/\${SHEET_ID}/gviz/tq\` +
  \`?tqx=out:json&sheet=\${encodeURIComponent(SHEET_TAB)}\`;

// gviz wraps its JSON in \`google.visualization.Query.setResponse(...)\` —
// this strips that wrapper so the rest of the card can treat it as plain
// JSON. Expects the sheet's first row of data to have: name, team number,
// notes (columns A, B, C) — adjust the row[...] indexes below if your
// sheet's columns are in a different order.
function parseGvizResponse(rawText) {
  const jsonText = rawText
    .replace(/^[\\s\\S]*?setResponse\\(/, "")
    .replace(/\\);\\s*$/, "");
  const parsed = JSON.parse(jsonText);
  const row = parsed.table.rows[0].c;
  return {
    name: row[0]?.v ?? "Unknown",
    teamNumber: row[1]?.v ?? "—",
    notes: row[2]?.v ?? "",
  };
}

async function loadTeamInfo() {
  const statusEl = document.getElementById("statusMsg");
  const result = await sdk.fetchCustom(url, {
    cacheSeconds: 30, // avoid re-hitting the sheet too often
    parse: parseGvizResponse,
  });

  if (result.ok) {
    document.getElementById("teamName").textContent = result.data.name;
    document.getElementById("teamNumber").textContent = result.data.teamNumber;
    document.getElementById("teamNotes").textContent = result.data.notes;
    statusEl.textContent = "";
  } else {
    statusEl.textContent = "Couldn't load sheet data: " + result.error;
  }
}

loadTeamInfo();

// Optional: refresh every 30s in case the sheet changes during the event.
setInterval(loadTeamInfo, 30000);
\`\`\`

### What to customize

- \`SHEET_ID\` and \`SHEET_TAB\` at the top — required.
- The three \`row[...]\` indexes in \`parseGvizResponse\` if your sheet's
  columns aren't in name / team number / notes order.
- The refresh interval (\`30000\` ms) if you want the card to poll more or
  less often.

Everything else — the fetch, caching, error handling, and DOM updates —
works as-is.
`,Sn=class{open(){let t=document.getElementById(`docsModal`);t||(t=document.createElement(`div`),t.id=`docsModal`,t.className=`docs-modal`,t.innerHTML=`
        <div class="docs-shell">
          <div class="docs-header">
            <h2 class="docs-title">${e(`book`,20)} Developer Guide</h2>
            <button class="vb-btn vb-btn-close" id="docsClose" type="button">✕</button>
          </div>
          <div class="docs-body" id="docsBody"></div>
        </div>
      `,document.body.appendChild(t),t.querySelector(`#docsClose`).addEventListener(`click`,()=>{t.classList.remove(`active`)}),t.addEventListener(`click`,e=>{e.target===t&&t.classList.remove(`active`)}),t.querySelector(`#docsBody`).innerHTML=I.parse(xn)),t.classList.add(`active`)}},L=new b({currentMatches:null,currentEventData:null,currentRankings:null,currentTeamSummaryData:null,lastMatchAlertId:null,fullDate:new Date,teamNumber:y.teamNumber,isTestMode:!1,dataStatus:null}),R=new re,z=new ge(y,L),Cn=new ee(L,z,ne,y),wn=new le(R,Cn),B=new Te(y,wn,L,Cn),V=new Oe(R,new ie(R),L,z,Cn),Tn=new Sn;function H(){V.render(y,document.getElementById(`container`))}var En={id:`__fallback__`,label:`Missing Card`,icon:`alert-circle`,builtin:!0,render:(t,n,r,i)=>{t.innerHTML=`
            <div class="fallback-card">
                <div class="fallback-icon">${e(`warning`,32)}</div>
                <div class="fallback-title">Missing Card</div>
                <div class="fallback-id">${i}</div>
                <div class="fallback-hint">This card was not found in the registry.</div>
                <button class="fallback-remove" data-card="${i}">Remove from layout</button>
            </div>
        `;let a=t.querySelector(`.fallback-remove`);a&&a.addEventListener(`click`,()=>{let e=r.getConfig();e.layout&&(delete e.layout[i],localStorage.setItem(`layout`,JSON.stringify(e.layout)),window._pitbeaconRender&&window._pitbeaconRender())})}};function Dn(e,{tbaKey:t=``,online:n=!0,hasEvent:r=!1,teamNumber:i=``}={}){if(!D({tbaapikey:t}))return{reason:`no-key`,title:`Add your TBA key to get started`,body:`PitBeacon loads matches and rankings from The Blue Alliance. Paste a read key from thebluealliance.com/account in Settings.`,action:`settings`};if(!n)return{reason:`offline`,title:`You're offline`,body:`Nothing saved on this device yet. Reconnect and this card fills in on its own.`,action:null};if(!r)return{reason:`no-event`,title:`No event found for team ${i||`your team`}`,body:`Cards fill in once your team's event is running. Check the team number in Settings, or use Test Mode with a past event date to preview.`,action:`settings`};switch(e){case`teamMatches`:return{reason:`no-team-matches`,title:`No matches for team ${i} yet`,body:`The schedule is usually posted shortly before qualifications start. This updates automatically.`,action:null};case`noUpcoming`:return{reason:`no-upcoming`,title:`No more matches scheduled`,body:`That's all of team ${i}'s scheduled matches. Playoff matches show up here once your alliance is selected.`,action:null};case`rankings`:return{reason:`no-rankings`,title:`Rankings aren't out yet`,body:`They appear after the first qualification matches are played.`,action:null};case`webcasts`:return{reason:`no-webcasts`,title:`No webcast today`,body:`This event hasn't listed a stream for today. Check the event page on The Blue Alliance.`,action:null};default:return{reason:`no-matches`,title:`No matches posted yet`,body:`The schedule appears once the event publishes it. This updates automatically.`,action:null}}}var On=`pitbeacon:open-settings`;function kn(e){return{tbaKey:y.tbaapikey,online:typeof navigator>`u`||navigator.onLine!==!1,hasEvent:!!e?.currentEventData,teamNumber:y.teamNumber}}function An(e,t){return Dn(e,kn(t))}function jn(e,t){let n=document.createElement(`div`);n.className=`empty-state`,n.dataset.reason=t.reason||``;let r=document.createElement(`strong`);r.className=`empty-state-title`,r.textContent=t.title;let i=document.createElement(`p`);i.className=`empty-state-body`,i.textContent=t.body,n.append(r,i);let a=t.actionLabel||(t.action===`settings`?`Open Settings`:null),o=t.onAction||(t.action===`settings`?()=>window.dispatchEvent(new CustomEvent(`pitbeacon:open-settings`)):null);if(a&&o){let e=document.createElement(`button`);e.type=`button`,e.className=`empty-state-action`,e.textContent=a,e.addEventListener(`click`,o),n.appendChild(e)}return e.replaceChildren(n),n}function Mn(e,t,n){return jn(e,An(t,n))}function Nn(){function e(e,t,n){let r=t.currentEventData,i=e._webcastIframeCache||=new Map,a=t.fullDate||new Date,o=[];if(r?.webcasts?.length)for(let e of r.webcasts){if(e.date){let t=new Date(e.date),n=new Date(a.getFullYear(),a.getMonth(),a.getDate());if(t.getDate()!==n.getDate())continue}let t=``;e.type===`youtube`?t=`https://www.youtube.com/embed/${e.channel}`:e.type===`twitch`&&(t=`https://player.twitch.tv/?channel=${e.channel}&parent=${window.location.hostname}`),t&&o.push({url:t,type:e.type,channel:e.channel})}let s=o.length?null:An(`webcasts`,t),c=s?`empty:${s.reason}`:o.map(e=>`${e.type}:${e.channel}:${e.url}`).join(`|`);if(e._webcastRenderKey===c&&e._webcastWrapper)return;e._webcastRenderKey=c,e.innerHTML=``;let l=document.createElement(`div`);if(l.style.cssText=``,!o.length){jn(l,s),e.appendChild(l),e._webcastWrapper=l;return}let u=document.createElement(`div`);u.style.cssText=`display:flex;flex-direction:column;gap:8px;`;for(let e of o){let t=document.createElement(`div`);t.className=`webcast-card`,t.style.cssText=`border-radius:8px;border:1px solid var(--border-accent);overflow:hidden;`;let n=i.get(e.url);n||(n=document.createElement(`iframe`),n.src=e.url,n.width=`100%`,n.height=`225`,n.frameborder=`0`,n.allowfullscreen=!0,n.style.cssText=`display:block;width:100%;aspect-ratio:16/9;`,i.set(e.url,n)),t.appendChild(n),u.appendChild(t)}l.appendChild(u),e.appendChild(l),e._webcastWrapper=l}return{id:`webcast-card`,label:`Webcasts`,icon:`device-tv`,lockedAspect:16/11,builtin:!0,statusSource:`tba`,render:(t,n,r)=>{t._webcastCardInitialized||=(r.updateCard(t,1e4,e,e=>({webcasts:e.currentEventData?.webcasts??null,empty:An(`webcasts`,e).reason})),!0),e(t,n,r)}}}function Pn(){return{id:`match-card`,label:`Matches`,icon:`tournament`,builtin:!0,statusSource:`tba`,render:(e,t,n)=>{e._matchCardInitialized||=(n.updateCard(e,1e3,(e,t,n)=>{Fn(e,t,n)},(e,t)=>({matches:e.currentMatches,empty:An(`matches`,e).reason,teamNumber:t.getConfig(`teamNumber`),t:Math.floor((e.fullDate?.getTime()??Date.now())/1e3)})),!0),Fn(e,t,n)}}}function Fn(t,n,r){let i=n.currentMatches||[],a=r.getConfig(`teamNumber`),o=Math.floor(n.fullDate?.getTime()/1e3||Date.now()/1e3);if(t.innerHTML=``,!i.length){Mn(t,`matches`,n);return}let s=[...i].sort((e,t)=>e.predicted_time-t.predicted_time).filter(e=>e.alliances.red.team_keys.includes(`frc${a}`)||e.alliances.blue.team_keys.includes(`frc${a}`));if(!s.length){Mn(t,`teamMatches`,n);return}let c=document.createElement(`div`);c.style.cssText=`display:flex;flex-direction:column;gap:8px;padding:4px 0;`;let l=!1;for(let t=0;t<s.length;t++){let n=s[t],r=n.predicted_time,i=r-o;if(o>=r-300&&o<=r+150&&!l){l=!0;let u=document.createElement(`div`);u.className=`match-card`;let d=Math.max(0,Math.floor(i/60)),f=Math.max(0,Math.floor(i%60)),p=i<30?`countdown-urgent`:`countdown-warning`;u.innerHTML=`
                        <div class="upcoming-basicinfo">
                            <h1 class="match-title">${e(`clock`,22)} Match Starting Soon!</h1>
                            <p>Match: ${n.comp_level.toUpperCase()} ${n.match_number}</p>
                            <p>Est: ${new Date(r*1e3).toLocaleTimeString()}</p>
                            <p class="${p}">Time Until: ${d}m ${f}s</p>
                        </div>
                        <div class="upcoming-teams">
                            ${In(n,a)}
                        </div>
                    `,c.appendChild(u);for(let e=t+1;e<s.length;e++){let t=s[e];c.appendChild(Ln(t,o,a))}break}}if(!l){let e=s.filter(e=>e.predicted_time>o);e.length===0?Mn(c,`noUpcoming`,n):e.forEach(e=>{c.appendChild(Ln(e,o,a))})}t.appendChild(c)}function In(e,t){let n=e.alliances.red.team_keys.map(e=>e.replace(`frc`,``)),r=e.alliances.blue.team_keys.map(e=>e.replace(`frc`,``)),i=n.includes(String(t)),a=r.includes(String(t)),o=``;if(i){o+=`<div class="alliance-row user-team"><p class="red highlight">${t}</p></div>`;let e=n.filter(e=>e!==String(t));e.length&&(o+=`<div class="alliance-row">${e.map(e=>`<p class="red">${e}</p>`).join(``)}</div>`)}else o+=`<div class="alliance-row">${n.map(e=>`<p class="red">${e}</p>`).join(``)}</div>`;if(a){o+=`<div class="alliance-row user-team"><p class="blue highlight">${t}</p></div>`;let e=r.filter(e=>e!==String(t));e.length&&(o+=`<div class="alliance-row">${e.map(e=>`<p class="blue">${e}</p>`).join(``)}</div>`)}else o+=`<div class="alliance-row">${r.map(e=>`<p class="blue">${e}</p>`).join(``)}</div>`;return o}function Ln(e,t,n){let r=document.createElement(`div`);r.className=`upcomingmatch-card`;let i=Math.max(0,e.predicted_time-t),a=Math.floor(i/60),o=Math.floor(i%60);return r.innerHTML=`
        <div class="upcoming-basicinfo">
            <h1 class="match-title">Upcoming Match</h1>
            <p>Match: ${e.comp_level.toUpperCase()} ${e.match_number}</p>
            <p>Est: ${new Date(e.predicted_time*1e3).toLocaleTimeString()}</p>
            <p class="countdown-warning">Time Until: ${a}m ${o}s</p>
        </div>
        <div class="upcoming-teams">
            ${In(e,n)}
        </div>
    `,r}function Rn(e,t,n=30){let r=e._cardAutoScroll;if(!t){r&&cancelAnimationFrame(r.frame),e._cardAutoScroll=null;return}let i=Number(n),a=Number.isFinite(i)?Math.min(120,Math.max(5,i)):30,o=a<30?Math.sqrt(a*30):a;if(r){r.speed=o;return}let s={frame:0,lastTime:0,pauseUntil:0,speed:o};e._cardAutoScroll=s;let c=t=>{if(!e.isConnected||e._cardAutoScroll!==s)e._cardAutoScroll=null;else{if(s.pauseUntil&&t>=s.pauseUntil)e.scrollTop=0,s.pauseUntil=0,s.lastTime=t;else if(!s.pauseUntil&&s.lastTime){let n=e.scrollHeight-e.clientHeight;if(n>0){let r=Math.min(t-s.lastTime,50);e.scrollTop=Math.min(n,e.scrollTop+r*s.speed/1e3),e.scrollTop>=n-1&&(s.pauseUntil=t+1200)}s.lastTime=t}else s.lastTime=t;s.frame=requestAnimationFrame(c)}};s.frame=requestAnimationFrame(c)}function zn(){return{id:`leaderboard-card`,label:`Leaderboard`,icon:`trophy`,builtin:!0,statusSource:`tba`,settings:{autoScroll:{type:`checkbox`,label:`Auto-scroll leaderboard`,default:!1},autoScrollSpeed:{type:`number`,label:`Scroll speed`,default:30,min:5,max:120,step:1}},render:(e,t,n)=>{let r=t.currentRankings||[],i=n.getConfig(`teamNumber`),a=n.getCardSettings(`leaderboard-card`,{autoScroll:!1,autoScrollSpeed:30});if(e.innerHTML=``,!r||!r.length){Rn(e,!1),Mn(e,`rankings`,t);return}let o=document.createElement(`div`),s=document.createElement(`table`);s.className=`leaderboard-table`,s.innerHTML=`
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Team</th>
                        <th>W-L-T</th>
                    </tr>
                </thead>
                <tbody>
                    ${r.map(e=>{let t=e.team_key.replace(`frc`,``);return`<tr class="${t===String(i)?`my-team`:``}">
                            <td>${e.rank}</td>
                            <td>${t}</td>
                            <td>${e.record.wins}-${e.record.losses}-${e.record.ties}</td>
                        </tr>`}).join(``)}
                </tbody>
            `,o.appendChild(s),e.appendChild(o),Rn(e,a.autoScroll,a.autoScrollSpeed)}}}var Bn={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`};function U(e){return String(e??``).replace(/[&<>"']/g,e=>Bn[e])}var Vn=`pitbeacon:focus-part`,Hn={tasks:{label:`Robot`,title:`Robot Health`,icon:`tool`,add:`＋ Task`,empty:{title:`No robot tasks yet`,body:`Tap ＋ Task to log a repair, or select a part in the 3D viewer and add one there.`}},batteries:{label:`Batteries`,title:`Batteries`,icon:`battery`,add:`＋ Battery`,empty:{title:`No batteries logged`,body:`Add each battery with its voltage and status to keep track of which ones are ready.`}},parts:{label:`Parts`,title:`Parts Inventory`,icon:`package`,add:`＋ Part`,empty:{title:`No spare parts tracked`,body:`Add parts with a minimum stock level to keep track of low stock.`}},checkins:{label:`Check-in`,title:`Pit Check-in`,icon:`checklist`,add:`＋ Task`,empty:{title:`No check-in items`,body:`Add the things that must be done before each match, like inspection, bumpers and battery swap.`}}},Un={tasks:`showTasks`,batteries:`showBatteries`,parts:`showParts`,checkins:`showCheckins`},Wn={pending:{label:`Pending`,cls:`chip-warn`},"in-progress":{label:`In Progress`,cls:`chip-info`},completed:{label:`Done`,cls:`chip-ok`}},Gn={ready:{label:`Ready`,cls:`chip-ok`},charging:{label:`Charging`,cls:`chip-info`},dead:{label:`Dead`,cls:`chip-err`}},Kn={showTasks:{type:`checkbox`,label:`Show Robot tasks`,default:!0},showBatteries:{type:`checkbox`,label:`Show Batteries`,default:!0},showParts:{type:`checkbox`,label:`Show Parts`,default:!0},showCheckins:{type:`checkbox`,label:`Show Check-in`,default:!0},defaultSection:{type:`select`,label:`Open on`,default:`tasks`,options:[{value:`tasks`,label:`Robot`},{value:`batteries`,label:`Batteries`},{value:`parts`,label:`Parts`},{value:`checkins`,label:`Check-in`}]},hideCompleted:{type:`checkbox`,label:`Hide finished tasks and check-ins`,default:!1},flaggedFirst:{type:`checkbox`,label:`Show flagged items first`,default:!0},compact:{type:`checkbox`,label:`Compact rows`,default:!1}},qn=Object.fromEntries(Object.entries(Kn).map(([e,t])=>[e,t.default]));function Jn(e,t){return{...qn,...e.getCardSettings(t,qn)}}function Yn(e){let t=Object.keys(Hn).filter(t=>e[Un[t]]!==!1);return t.length?t:[`tasks`]}function Xn(e,t){return Object.entries(e).map(([e,{label:n,cls:r}])=>`<button type="button" class="pit-chip ${r}${e===t?` chip-active`:``}" data-action="status" data-value="${U(e)}">${U(n)}</button>`).join(``)}function Zn(e){return`<input type="checkbox" class="flag-toggle" data-action="flag" aria-label="Flag" ${e.flagged?`checked`:``}>`}function Qn(){return`<button type="button" class="pit-del-btn" data-action="delete" aria-label="Delete">✕</button>`}function $n(e){let t=Math.min(100,Math.max(0,((parseFloat(e)||0)-10)/3*100));return{pct:t,cls:t>=70?`volt-bar-ok`:t>=40?`volt-bar-warn`:`volt-bar-err`}}var er={tasks(t,{listId:n}){let r=!!(t.partId&&u(t.partId));return`<div class="pit-card${t.flagged?` flagged`:``}" data-id="${U(t.id)}">
      <div class="pit-card-row">
        ${Zn(t)}
        <div class="pit-card-fields">
          <input class="pit-input" data-field="task" placeholder="Task…" value="${U(t.task)}">
          <input class="pit-input pit-sub" data-field="component" data-part-link list="${n}" placeholder="Part / component…" value="${U(t.component)}">
        </div>
        ${r?`<button type="button" class="pit-del-btn pn-locate" data-action="locate" title="Show on the 3D model" aria-label="Show on the 3D model">${e(`target`,14)}</button>`:``}
        ${Qn()}
      </div>
      <div class="pit-status-row">${Xn(Wn,t.status)}</div>
    </div>`},batteries(e){let{pct:t,cls:n}=$n(e.voltage);return`<div class="pit-card${e.flagged?` flagged`:``}" data-id="${U(e.id)}">
      <div class="pit-card-row">
        ${Zn(e)}
        <div class="pit-card-fields">
          <div class="batt-top-row">
            <input class="pit-input batt-id" data-field="label" placeholder="ID" value="${U(e.label)}">
            <div class="batt-volt-block">
              <input class="pit-input" data-field="voltage" data-volt type="number" step="0.1" placeholder="V" value="${U(e.voltage)}">
              <div class="volt-track"><div class="volt-bar ${n}" style="width:${t.toFixed(0)}%"></div></div>
            </div>
            <input class="pit-input batt-cycles" data-field="cycles" type="number" placeholder="Cycles" value="${U(e.cycles)}">
          </div>
        </div>
        ${Qn()}
      </div>
      <div class="pit-status-row">${Xn(Gn,e.status)}</div>
    </div>`},parts(t){let n=parseInt(t.quantity,10)||0,r=parseInt(t.minStock,10)||0,i=m(t);return`<div class="pit-card part-card${i?` part-card-low`:``}${t.flagged?` flagged`:``}" data-id="${U(t.id)}">
      <div class="part-card-top">
        ${Zn(t)}
        <input class="pit-input" data-field="name" placeholder="Part name…" value="${U(t.name)}">
        ${Qn()}
      </div>
      <div class="part-qty-row">
        <div class="part-qty-block"><span class="part-qty-num ${i?`qty-low`:`qty-ok`}">${n}</span><span class="part-qty-label">have</span></div>
        <span class="part-divider">/</span>
        <div class="part-qty-block"><span class="part-qty-num part-qty-min">${r}</span><span class="part-qty-label">min</span></div>
      </div>
      ${i?`<div class="part-low-badge">${e(`warning`,14)} LOW STOCK</div>`:`<div class="part-ok-badge">${e(`check`,14)} OK</div>`}
      <div class="part-inputs-row">
        <label class="part-micro-label">Qty<input class="pit-input" data-field="quantity" data-restock type="number" min="0" value="${U(t.quantity)}"></label>
        <label class="part-micro-label">Min<input class="pit-input" data-field="minStock" data-restock type="number" min="0" value="${U(t.minStock)}"></label>
      </div>
    </div>`},checkins(e){return`<div class="checkin-row${e.completed?` checkin-done`:``}${e.flagged?` flagged`:``}" data-id="${U(e.id)}">
      <input type="checkbox" class="checkin-check" data-action="complete" aria-label="Done" ${e.completed?`checked`:``}>
      <input class="pit-input" data-field="task" placeholder="Task…" value="${U(e.task)}">
      <input class="pit-input checkin-assignee" data-field="assignedTo" placeholder="Who…" value="${U(e.assignedTo)}">
      ${Zn(e)}
      ${Qn()}
    </div>`}};function tr(e,t,n){let r=t;return n.hideCompleted&&(e===`tasks`&&(r=r.filter(e=>e.status!==`completed`)),e===`checkins`&&(r=r.filter(e=>!e.completed))),n.flaggedFirst&&(r=[...r.filter(e=>e.flagged),...r.filter(e=>!e.flagged)]),r}function nr(){return{id:`pit-notes-card`,label:`Pit Notes`,icon:`tool`,builtin:!0,statusSource:`local`,settings:Kn,render(e,t,n,r=`pit-notes-card`){let i=e._pitNotes??=rr(e,n,r);i.sdk=n,i.cardId=r,i.isEditing()?i.dirty=!0:i.draw()}}}function rr(t,r,m){let _=`pn-parts-${m}`,v={sdk:r,cardId:m,dirty:!1,selfSaving:!1,active:null,isEditing:()=>{let e=document.activeElement;return!!(e&&t.contains(e)&&e.matches(`input:not([type=checkbox]), select`))},settings:()=>Jn(v.sdk,v.cardId),draw:x};t.innerHTML=`<div class="pit-notes">
    <div class="pit-notes-tabs" role="tablist" data-tabs></div>
    <div class="pit-header"><span class="pit-title" data-title></span><button type="button" class="pit-add-btn" data-action="add"></button></div>
    <div class="pit-body" data-body></div>
    <datalist id="${_}"></datalist>
  </div>`;let y=t.querySelector(`.pit-notes`);Object.assign(y.style,{background:`var(--bg-surface)`,borderRadius:`8px`,border:`1px solid var(--border)`,padding:`10px 12px`,height:`100%`,overflow:`auto`});function b(e){v.selfSaving=!0;try{return e()}finally{v.selfSaving=!1}}function ee(e,t){let n=h(`pitNotesSection`),r=v.active??n??t.defaultSection;return e.includes(r)?r:e[0]}function x(){v.dirty=!1;let t=v.settings(),n=Yn(t),r=v.active=ee(n,t),i=a(),o=l(i);y.classList.toggle(`pit-notes-compact`,!!t.compact),y.querySelector(`[data-tabs]`).innerHTML=n.map(t=>{let{open:n,flagged:i}=o[t];return`<button type="button" class="pit-notes-tab${t===r?` active`:``}" role="tab" aria-selected="${t===r}" data-action="tab" data-section="${t}">
          ${e(Hn[t].icon,14)}<span>${Hn[t].label}</span>
          ${n?`<span class="pit-notes-count">${n}</span>`:``}${i?`<span class="pit-notes-flag" title="${i} flagged">${e(`flag`,11)}</span>`:``}
        </button>`}).join(``),y.querySelector(`[data-title]`).textContent=Hn[r].title,y.querySelector(`[data-action=add]`).textContent=Hn[r].add,y.querySelector(`datalist`).innerHTML=f().map(e=>`<option value="${U(e.name)}"></option>`).join(``);let s=tr(r,i[r],t),c=y.querySelector(`[data-body]`);if(!s.length){jn(c,t.hideCompleted&&i[r].length>0?{reason:`filtered`,title:`Everything here is finished`,body:`Finished items are hidden. Turn off "Hide finished tasks and check-ins" in this card's settings to see them.`}:{reason:`empty`,...Hn[r].empty});return}let u=s.map(e=>er[r](e,{listId:_})).join(``);c.innerHTML=r===`parts`?`<div class="parts-grid">${u}</div>`:u,c.dataset.section=r}function S(e){let t=e.closest(`[data-id]`);return t?{id:t.dataset.id,row:t}:null}y.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(!t||!y.contains(t))return;let r=t.dataset.action,l=v.active;if(r===`tab`)v.active=t.dataset.section,g(`pitNotesSection`,v.active),x();else if(r===`add`){let e=b(()=>c(l));x(),y.querySelector(`[data-id="${CSS.escape(e.id)}"] input:not([type=checkbox])`)?.focus()}else if(r===`status`){let e=S(t);if(!e)return;let r=t.dataset.value;(l===`tasks`?i:n).includes(r)&&b(()=>s(l,e.id,{status:r})),x()}else if(r===`delete`){let e=S(t);if(!e)return;b(()=>o(l,e.id)),x()}else if(r===`locate`){let e=S(t),n=e&&a().tasks.find(t=>t.id===e.id);n?.partId&&window.dispatchEvent(new CustomEvent(Vn,{detail:{partId:n.partId}}))}}),y.addEventListener(`change`,e=>{let t=e.target,n=S(t);if(!n)return;let r=v.active;if(t.dataset.action===`flag`){let e=t.checked;b(()=>s(r,n.id,{flagged:e})),e&&v.sdk.getConfig(`noteAlarmToggle`)&&v.sdk.triggerAlarm(`note`),x()}else if(t.dataset.action===`complete`)b(()=>s(r,n.id,{completed:t.checked})),x();else if(t.hasAttribute(`data-part-link`)){let e=t.value.trim(),i=u(e);b(()=>s(r,n.id,i?{partId:i.id,component:i.name}:{partId:null,component:e})),x()}else t.hasAttribute(`data-restock`)&&x()}),y.addEventListener(`input`,e=>{let t=e.target,n=t.dataset.field,r=S(t);if(n&&r&&!t.hasAttribute(`data-part-link`)){if(b(()=>s(v.active,r.id,{[n]:t.value})),t.hasAttribute(`data-volt`)){let{pct:e,cls:n}=$n(t.value),i=r.row.querySelector(`.volt-bar`);i&&(i.style.width=`${e.toFixed(0)}%`,i.className=`volt-bar ${n}`)}else if(t.hasAttribute(`data-restock`)){let e=r.row.querySelector(`[data-field="minStock"]`)?.value,t=r.row.querySelector(`[data-field="quantity"]`)?.value;r.row.classList.toggle(`part-card-low`,(parseInt(t,10)||0)<=(parseInt(e,10)||0))}}}),y.addEventListener(`focusout`,()=>{setTimeout(()=>{v.dirty&&!v.isEditing()&&t.isConnected&&x()},0)});let C=()=>{t.isConnected?v.selfSaving||(v.isEditing()?v.dirty=!0:x()):te()},te=()=>{window.removeEventListener(d,C),window.removeEventListener(p,C),window.removeEventListener(`storage`,ne)},ne=e=>{(e.key===null||e.key===`pitNotes`||e.key===`robotParts`||e.key===`cardSettings`)&&C()};return window.addEventListener(d,C),window.addEventListener(p,C),window.addEventListener(`storage`,ne),v}var ir=3e3;function W(e,t=`message`){let n=document.getElementById(`errorcontainer`);if(!n)return;let r=document.createElement(`div`);r.className=t===`error`?`error`:`message`;let i=document.createElement(`p`);i.className=`error-exit`,i.textContent=`X`;let a=document.createElement(`p`);a.textContent=String(e??``),r.append(i,a),n.appendChild(r),setTimeout(()=>r.remove(),ir)}function ar(){window.displayMessage=W}var or=`pitbeacon-robot-viewer-v2`,sr=/\.(urdf|glb|gltf)$/i,cr=`pitbeacon:robot-model-saved`;function lr(){return new Promise((e,t)=>{if(typeof indexedDB>`u`)return t(Error(`This browser can't store a model.`));let n=indexedDB.open(or,1);n.onupgradeneeded=()=>{n.result.createObjectStore(`models`),n.result.createObjectStore(`libs`)},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error)})}async function ur(e){if(!e.some(e=>sr.test(e.name)))throw Error(`Choose a .urdf, .glb or .gltf file.`);let t=await lr();try{await new Promise((n,r)=>{let i=t.transaction(`models`,`readwrite`);i.objectStore(`models`).put({files:e,savedAt:Date.now()},`last`),i.oncomplete=n,i.onerror=i.onabort=()=>r(i.error)})}finally{t.close()}window.dispatchEvent(new CustomEvent(cr))}async function dr(e){return Promise.all(Array.from(e||[]).map(async e=>({name:e.webkitRelativePath||e.name,buffer:await e.arrayBuffer()})))}var fr=new WeakMap,pr=new WeakMap,mr=0;function hr(e){let{ownerDocument:t}=e,n=pr.get(t);n||(n={hosts:new Set,onKeyDown:null},n.onKeyDown=e=>{if(e.key!==`Escape`)return;let t=null,r=-1/0;for(let e of n.hosts)for(let n of e.windows.values()){let i=e.priority*1e4+Number(n.element.style.zIndex);i>r&&(r=i,t=n)}t&&(e.preventDefault(),e.stopImmediatePropagation(),t.close())},pr.set(t,n),t.addEventListener(`keydown`,n.onKeyDown,!0)),n.hosts.add(e),e.manager=n}function gr(e){let t=e.manager;t.hosts.delete(e),t.hosts.size||(e.ownerDocument.removeEventListener(`keydown`,t.onKeyDown,!0),pr.delete(e.ownerDocument))}function _r(e){let t=fr.get(e);if(t?.host.isConnected)return t;t&&G(e);let n=e.ownerDocument,r=n.createElement(`div`);return r.className=`floating-modal-host${e===n.body?` floating-modal-host--viewport`:``}`,e.appendChild(r),t={host:r,parent:e,ownerDocument:n,windows:new Map,nextZIndex:1,priority:e===n.body?12e3:Number(n.defaultView?.getComputedStyle(e).zIndex)||0},fr.set(e,t),hr(t),r.addEventListener(`pointerdown`,e=>{let n=e.target.closest(`.floating-modal-window`);n&&(n.style.zIndex=String(t.nextZIndex++))}),t}function G(e){let t=fr.get(e);t&&[...t.windows.values()].forEach(e=>e.close(!1))}function vr({parent:t,title:n,id:r=n,content:i,opener:a=null,onClose:o=null,width:s=460,height:c=360}){if(!(t instanceof HTMLElement))throw TypeError(`A parent element is required to open a floating modal.`);let l=String(r||``);if(!l)throw TypeError(`A floating modal id is required.`);let u=_r(t),d=u.windows.get(l);if(d)return d.focus(),d;let{ownerDocument:f}=u,p=f.defaultView||window,m=f.createElement(`section`),h=`floatingModalTitle${++mr}`;m.className=`floating-modal-window`,m.dataset.floatingModalId=l,m.setAttribute(`role`,`dialog`),m.setAttribute(`aria-modal`,`false`),m.setAttribute(`aria-labelledby`,h);let g=u.host.getBoundingClientRect(),_=g.width||t.clientWidth||p.innerWidth,v=g.height||t.clientHeight||p.innerHeight,y=JSON.parse(p.localStorage.getItem(`pitbeacon:floating-modal:${encodeURIComponent(l)}`)||`null`),b=Number.isFinite(y?.width)&&y.width>=280?y.width:s,ee=Number.isFinite(y?.height)&&y.height>=180?y.height:c,x=Math.min(b,Math.max(280,_-32)),S=Math.min(ee,Math.max(180,v-32));m.style.width=`${x}px`,m.style.height=`${S}px`;let C=u.windows.size%8*28,te=Math.max(0,_-x),ne=Math.max(0,v-S),re=Number.isFinite(y?.left)?y.left:(_-x)/2+C,ie=Number.isFinite(y?.top)?y.top:(v-S)/2+C;m.style.left=`${Math.max(0,Math.min(te,re))}px`,m.style.top=`${Math.max(0,Math.min(ne,ie))}px`;let ae=f.createElement(`header`);ae.className=`floating-modal-header`;let oe=f.createElement(`h2`);oe.className=`floating-modal-title`,oe.id=h,oe.textContent=n;let w=f.createElement(`button`);w.type=`button`,w.className=`floating-modal-lock`;let T=f.createElement(`button`);T.type=`button`,T.className=`floating-modal-close`,T.setAttribute(`aria-label`,`Close ${n}`),T.textContent=`×`,ae.append(oe,w,T);let se=f.createElement(`div`);se.className=`floating-modal-body`;let ce=i.parentNode,le=i.nextSibling,ue=i.ownerDocument;se.append(i),m.append(ae,se),u.host.appendChild(m);let E=y?.locked===!0,D=()=>{},de=`pitbeacon:floating-modal:${encodeURIComponent(l)}`,fe=()=>{p.localStorage.setItem(de,JSON.stringify({left:parseFloat(m.style.left),top:parseFloat(m.style.top),width:m.offsetWidth||parseFloat(m.style.width),height:m.offsetHeight||parseFloat(m.style.height),locked:E}))},pe=()=>{m.classList.toggle(`is-locked`,E),m.style.resize=E?`none`:`both`,w.setAttribute(`aria-pressed`,String(E)),w.setAttribute(`aria-label`,`${E?`Unlock`:`Lock`} window`),w.title=`${E?`Unlock`:`Lock`} window`,w.innerHTML=e(E?`lock`:`unlock`,16)},me=(e=!0)=>{u.windows.get(l)===he&&(D(),fe(),u.windows.delete(l),f.removeEventListener(`pointerup`,fe),ce&&(ue.adoptNode(i),ce.insertBefore(i,le?.parentNode===ce?le:null)),m.remove(),u.windows.size===0&&(u.host.remove(),gr(u),fr.delete(t)),o?.(),e&&a?.isConnected&&t.isConnected&&a.focus())},he={element:m,close:me,focus:()=>{m.style.zIndex=String(u.nextZIndex++),T.focus()}};return m.style.zIndex=String(u.nextZIndex++),u.windows.set(l,he),pe(),w.addEventListener(`click`,()=>{E=!E,pe(),fe()}),T.addEventListener(`click`,me),f.addEventListener(`pointerup`,fe),m.addEventListener(`focusin`,()=>{m.style.zIndex=String(u.nextZIndex++)}),ae.addEventListener(`pointerdown`,e=>{if(E||e.button!==0||e.target.closest(`button`))return;e.preventDefault(),m.style.zIndex=String(u.nextZIndex++);let t=e.clientX,n=e.clientY,r=parseFloat(m.style.left),i=parseFloat(m.style.top),a=e=>{let a=u.host.getBoundingClientRect(),o=a.width||p.innerWidth,s=a.height||p.innerHeight,c=m.offsetWidth||parseFloat(m.style.width),l=m.offsetHeight||parseFloat(m.style.height),d=Math.max(0,o-c),f=Math.max(0,s-l);m.style.left=`${Math.max(0,Math.min(d,r+e.clientX-t))}px`,m.style.top=`${Math.max(0,Math.min(f,i+e.clientY-n))}px`},o=()=>{f.removeEventListener(`pointermove`,a),f.removeEventListener(`pointerup`,o),D=()=>{},fe()};D=o,f.addEventListener(`pointermove`,a),f.addEventListener(`pointerup`,o)}),T.focus(),he}var yr=[`--text-primary`,`--text-muted`,`--border`,`--accent`,`--bg-input`],br={rbvSetup:{id:`robot-viewer-setup`,title:`Mate connectors & poses`,openerId:`rbvSetupToggle`,width:440,height:560},rbvSettingsPanel:{id:`robot-viewer-settings`,title:`Robot viewer settings`,openerId:`rbvSettingsToggle`,width:440,height:560}};function xr(){let e=getComputedStyle(document.documentElement),t={};for(let n of yr){let r=e.getPropertyValue(n).trim();r&&(t[n]=r)}return t}function Sr(){return{id:`robot-viewer-card`,label:`Robot Viewer`,icon:`cube`,builtin:!0,statusSource:`local`,selfRefresh:!0,settings:{},render(e){if(e.selfRefresh=!0,e._robotViewer)return;let t=document.createElement(`iframe`);t.className=`robot-viewer-frame`,t.title=`3D robot viewer`,t.src=new URL(`viewer.html`,document.baseURI).href,t.setAttribute(`allow`,`fullscreen`),t.loading=`eager`,e.replaceChildren(t);let n=new Map,r=new Map,i=e=>t.contentWindow?.postMessage({source:`pitbeacon`,...e},location.origin),a=()=>i({type:`theme`,vars:xr()}),o=()=>{[...n.values()].forEach(e=>e.close(!1)),n.clear()},s=e=>{let t=e.detail?.partId;t&&i({type:`focus-part`,partId:t})},c=e=>{if(e.origin!==location.origin||e.source!==t.contentWindow)return;let o=e.data;if(o?.source===`pitbeacon-viewer`){if(o.type===`ready`)a();else if(o.type===`floating-window-open`||o.type===`floating-window-close`){if(!Object.hasOwn(br,o.panelId))return;let e=br[o.panelId],a=n.get(o.panelId);if(o.type===`floating-window-close`){a?.close();return}if(a){a.focus();return}let s=r.get(o.panelId);if(s||(s=t.contentDocument?.getElementById(o.panelId)||null,s&&r.set(o.panelId,s)),!s){W(`Could not open the Robot Viewer ${e.title.toLowerCase()} window.`,`error`);return}let c=vr({parent:document.body,id:e.id,title:e.title,content:s,opener:t.contentDocument?.getElementById(e.openerId)||null,width:e.width,height:e.height,onClose:()=>{n.delete(o.panelId),i({type:`viewer-floating-window-closed`,panelId:o.panelId})}});n.set(o.panelId,c)}else o.type===`notify`&&typeof o.message==`string`&&W(o.message,o.level===`error`?`error`:`message`)}},l=new MutationObserver(a);l.observe(document.documentElement,{attributes:!0,attributeFilter:[`style`,`class`,`data-theme`]});let u=()=>{o(),r.clear(),t.contentWindow?.location.reload()},d=()=>{o(),r.clear(),window.removeEventListener(cr,u),window.removeEventListener(Vn,s),window.removeEventListener(`message`,c),l.disconnect(),e._robotViewer=null};window.addEventListener(cr,u),window.addEventListener(Vn,s),window.addEventListener(`message`,c),t.addEventListener(`load`,()=>{o(),r.clear(),a()});let f=new MutationObserver(()=>{e.isConnected&&e.contains(t)||(f.disconnect(),d())});f.observe(document.body,{childList:!0,subtree:!0}),e._robotViewer={frame:t,post:i}}}}function K(e,t=1){return typeof e!=`number`||!Number.isFinite(e)?`–`:e.toFixed(t).replace(/\.?0+$/,``)}function q(e,t,n,r=!1){let i=document.createElement(`div`);i.className=`stats-row`;let a=document.createElement(`span`);a.className=`stats-label`,a.textContent=t;let o=document.createElement(`span`);o.className=r?`stats-value stats-accent`:`stats-value`,o.textContent=n,i.append(a,o),e.appendChild(i)}function Cr(e,t){let n=document.createElement(`h3`);n.className=`stats-section-title`,n.textContent=t,e.appendChild(n)}function wr(e,t,n=!1){Rn(e,!1),e.replaceChildren();let r=document.createElement(`p`);r.className=n?`stats-error`:`stats-message`,r.textContent=t,e.appendChild(r)}function Tr(e,t){Rn(e,!1),jn(e,t)}function Er(e,t,n=null){e._cardStatus={state:t,color:{fresh:`green`,failed:`red`,offline:`red`,none:`grey`}[t],lastUpdate:n},window.dispatchEvent(new CustomEvent(`pitbeacon:card-status`))}function Dr(e,t,n,r){e.replaceChildren();let i=document.createElement(`div`);i.className=`stats-team-heading`;let a=document.createElement(`strong`);a.textContent=`Team ${n}`;let o=document.createElement(`span`);o.className=`stats-year`,o.textContent=String(t.year||r),i.append(a,o),e.appendChild(i);let s=document.createElement(`div`);s.className=`stats-primary`;let c=document.createElement(`span`);c.className=`stats-label`,c.textContent=`Match13 expected points (xP)`;let l=document.createElement(`strong`);l.className=`stats-primary-value`,l.textContent=K(t.xp),s.append(c,l),e.appendChild(s),Cr(e,`Season ranking`),q(e,`Normalized xP`,K(t.normXp)),q(e,`Match13 rank`,t.rank?`#${t.rank}`:`–`,!0),q(e,`Percentile`,typeof t.percentile==`number`?`${K(t.percentile)}%`:`–`,!0),Cr(e,`Expected scoring`),q(e,`Autonomous`,K(t.xAuto)),q(e,`Teleoperated`,K(t.xTele)),q(e,`Endgame`,K(t.xEnd)),Cr(e,`Comparison ratings`),q(e,`EPA`,K(t.epa)),q(e,`OPR`,K(t.opr)),q(e,`DPR`,K(t.dpr));let u=Object.entries(t.components||{});if(u.length){Cr(e,`Estimated game pieces`);for(let[t,n]of u)q(e,t,K(n))}let d=document.createElement(`div`);d.className=`stats-footer`;let f=document.createElement(`a`);f.className=`stats-link`,f.href=`https://www.match13.com/docs/api`,f.target=`_blank`,f.rel=`noopener noreferrer`,f.textContent=`About Match13 ratings ↗`,d.appendChild(f),e.appendChild(d)}function Or(){return{id:`stats-card`,label:`Team Stats`,icon:`chart-bar`,builtin:!0,statusSource:`match13`,settings:{autoScroll:{type:`checkbox`,label:`Auto-scroll team stats`,default:!1},autoScrollSpeed:{type:`number`,label:`Scroll speed`,default:30,min:5,max:120,step:1}},render:async(e,t,n)=>{e._statsCardInitialized||=(e.innerHTML=`
          <div class="stats-shell">
            <div class="pit-header">
              <span class="pit-title"><i class="ti ti-chart-bar"></i> Team Stats</span>
              <button class="pit-add-btn" type="button">↻ Refresh</button>
            </div>
            <div class="stats-body"></div>
          </div>
        `,!0);let r=e.querySelector(`.stats-body`),i=e.querySelector(`.pit-add-btn`),a=String(n.getConfig(`teamNumber`)||``).trim(),o=n.getCardSettings(`stats-card`,{autoScroll:!1,autoScrollSpeed:30});Rn(r,o.autoScroll,o.autoScrollSpeed);let s=String(n.getConfig(`match13apikey`)||``).trim().replace(/^Bearer\s+/i,``),c=String(n.getConfig(`match13ProxyUrl`)||``).trim().replace(/\/+$/,``),l=t.fullDate instanceof Date?t.fullDate.getFullYear():new Date().getFullYear(),u=async()=>{if(!/^\d+$/.test(a))Tr(r,{reason:`no-team`,title:`Enter your team number`,body:`Team stats need a valid team number. Set it in Settings.`,action:`settings`}),Er(e,`none`);else if(!s)Tr(r,{reason:`no-key`,title:`Add your Match13 key`,body:`Team stats come from Match13. Create an API key at match13.com/account and paste it in Settings.`,action:`settings`}),Er(e,`none`);else if(navigator.onLine===!1)Tr(r,{reason:`offline`,title:`You're offline`,body:`Team stats need a connection. Press Refresh once you're back online.`,action:null}),Er(e,`offline`,e._cardStatus?.lastUpdate??null);else if(!s.startsWith(`m13_live_`))wr(r,`Match13 API keys should start with m13_live_. Check that the complete key was copied into Settings.`,!0);else if(!c)wr(r,`PitBeacon's Match13 proxy has not been configured yet. Please try again later.`,!0);else{i.disabled=!0,wr(r,`Loading Match13 team stats…`);try{let t=await fetch(`${c}/v1/teams/${a}/years/${l}`,{headers:{Authorization:`Bearer ${s}`}}),n=await t.text(),i=null;if(n)try{i=JSON.parse(n)}catch{if(t.ok)throw Error(`Match13 returned an invalid response.`)}let u=i?.detail||i?.title||i?.message;if(t.status===404)throw Error(`Match13 has no season data for team ${a} in ${l}.`);if(t.status===401||t.status===403)throw Error(`Match13 rejected the API key (HTTP ${t.status}). The request uses the required Bearer authorization format. Verify the complete, active Match13 key from match13.com/account and save Settings.${u?` API detail: ${u}`:``}`);if(t.status===429)throw Error(`Match13 rate limit reached. Try again later.`);if(!t.ok)throw Error(`Match13 request failed (HTTP ${t.status}).${u?` ${u}`:``}`);if(!i||typeof i!=`object`||Array.isArray(i))throw Error(`Match13 returned an invalid team stats response.`);Dr(r,i,a,l),Er(e,`fresh`,Date.now()),Rn(r,o.autoScroll,o.autoScrollSpeed)}catch(t){let n=t instanceof TypeError?`Could not reach Match13 through PitBeacon's proxy. Please try again later. ${t.message}`:t.message||`An unexpected error occurred.`;wr(r,n,!0),Er(e,`failed`,e._cardStatus?.lastUpdate??null)}finally{i.disabled=!1}}};i.onclick=u;let d=`${a}:${l}:${s}:${c}`;e._statsLoadKey!==d&&(e._statsLoadKey=d,await u())}}}function kr(e){let t=String(e??``).trim(),n=t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(n)return{year:Number(n[1]),month:Number(n[2])-1,day:Number(n[3])};let r=new Date(t);return!t||Number.isNaN(r.getTime())?null:{year:r.getFullYear(),month:r.getMonth(),day:r.getDate()}}function Ar({testMode:e,testDate:t}={},n=new Date){if(!e)return n;let r=kr(t);return r?new Date(r.year,r.month,r.day,n.getHours(),n.getMinutes(),n.getSeconds()):n}function jr(e,{teamNumber:t,nowSeconds:n,thresholdSeconds:r,lastAlertId:i}){let a=`frc${t}`;for(let t of e||[]){let e=t.alliances?.red?.team_keys||[],o=t.alliances?.blue?.team_keys||[];if(!e.includes(a)&&!o.includes(a))continue;let s=t.predicted_time-n,c=`${t.comp_level}-${t.match_number}`;if(s>0&&s<=r&&i!==c)return{match:t,matchId:c,secondsUntil:s}}return null}function Mr(e,t){let n=jr(e.currentMatches,{teamNumber:y.teamNumber,nowSeconds:Math.floor(t.getTime()/1e3),thresholdSeconds:y.matchAlertThreshold,lastAlertId:e.lastMatchAlertId});if(!n)return;let r=ne[y.matchAlarmSound]||ne.alarm1;r.currentTime=0,r.play().catch(e=>console.log(`Audio play failed:`,e)),L.update({lastMatchAlertId:n.matchId});let i=Math.floor(n.secondsUntil/60),a=Math.floor(n.secondsUntil%60);W(`Match Alert: ${n.match.comp_level.toUpperCase()} ${n.match.match_number} in ${i}m ${a}s!`,`message`)}function Nr(){let e=Ar(y),t=document.getElementById(`time-display`);t&&(t.textContent=e.toLocaleTimeString(`en-US`,{hour12:!0})),L.update({fullDate:e,isTestMode:!!y.testMode});let n=L.getState();n.currentMatches&&y.matchAlarmToggle&&Mr(n,e)}function Pr(){return Nr(),setInterval(Nr,1e3)}var Fr=`pitbeacon`,Ir=1,Lr=[`snapshots`,`models`],Rr=null;function zr(){return Rr||(Rr=new Promise((e,t)=>{if(typeof indexedDB>`u`){t(Error(`IndexedDB unavailable`));return}let n=indexedDB.open(Fr,Ir);n.onupgradeneeded=()=>{let e=n.result;for(let t of Lr)e.objectStoreNames.contains(t)||e.createObjectStore(t)},n.onsuccess=()=>{let t=n.result;t.onversionchange=()=>{t.close(),Rr=null},e(t)},n.onerror=()=>t(n.error),n.onblocked=()=>t(Error(`IndexedDB upgrade blocked by another tab`))}).catch(e=>{throw Rr=null,e}),Rr)}async function Br(e,t,n){let r=await zr();return new Promise((i,a)=>{let o=r.transaction(e,t),s=n(o.objectStore(e));o.oncomplete=()=>i(s?.result),o.onerror=()=>a(o.error),o.onabort=()=>a(o.error)})}var Vr={get:(e,t)=>Br(e,`readonly`,e=>e.get(t)),set:(e,t,n)=>Br(e,`readwrite`,e=>e.put(n,t)),delete:(e,t)=>Br(e,`readwrite`,e=>e.delete(t)),keys:e=>Br(e,`readonly`,e=>e.getAllKeys()),clear:e=>Br(e,`readwrite`,e=>e.clear())},Hr=`latest`,Ur=12096e5;async function Wr({teamNumber:e,matches:t,eventData:n,rankings:r,teamSummary:i}){try{return await Vr.set(`snapshots`,Hr,{teamNumber:String(e),matches:t,eventData:n,rankings:r,teamSummary:i,savedAt:Date.now()}),!0}catch{return!1}}async function Gr(e,t=Date.now()){try{let n=await Vr.get(`snapshots`,Hr);return!n||String(n.teamNumber)!==String(e)||t-n.savedAt>Ur?null:n}catch{return null}}var Kr=3e4,qr=3e4,Jr=null;async function Yr(){try{let e=await z.fetchAll();if(!e)return;let t=await z.fetchTeamSummary(e.eventData?.key);L.update({currentMatches:e.matches,currentEventData:e.eventData,currentRankings:e.rankings,currentTeamSummaryData:t,dataStatus:{stale:e.stale,lastUpdate:e.fetchedAt,source:`live`}}),V.updateCards(L.getState()),!e.stale&&(e.matches||e.eventData)&&Wr({teamNumber:y.teamNumber,matches:e.matches,eventData:e.eventData,rankings:e.rankings,teamSummary:t})}catch(e){W(`Network Error: ${e.message}`,`error`)}}function Xr(){return Jr||=Yr().finally(()=>{Jr=null}),Jr}async function Zr(){let e=await Gr(y.teamNumber);return!e||L.getState().dataStatus?.source===`live`?!1:(L.update({currentMatches:e.matches,currentEventData:e.eventData,currentRankings:e.rankings,currentTeamSummaryData:e.teamSummary,dataStatus:{stale:!0,lastUpdate:e.savedAt,source:`cache`}}),V.updateCards(L.getState()),!0)}function Qr(){setTimeout(()=>{Xr(),Qr()},Kr+Math.random()*qr)}function $r(){Xr(),Qr(),window.addEventListener(`online`,()=>Xr()),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&Xr()})}function ei(){window.pitbeaconRefreshTeamData=async()=>{let e=L.getState().currentEventData?.key,t=await z.fetchTeamSummary(e);return L.update({currentTeamSummaryData:t}),V.updateCards(L.getState()),t}}function ti(e){return new Date(e).toLocaleTimeString(`en-US`,{hour:`numeric`,minute:`2-digit`})}function ni(){let e=document.getElementById(`netStatus`);if(!e)return;let t=()=>{let t=L.getState().dataStatus,n=typeof navigator<`u`&&navigator.onLine===!1,r=n||!!t?.stale;if(e.hidden=!r,!r)return;let i=n?`Offline`:`Connection issue`;e.textContent=t?.lastUpdate?`${i} · data from ${ti(t.lastUpdate)}`:i};L.subscribe(t),window.addEventListener(`online`,t),window.addEventListener(`offline`,t),t()}function ri(){return{enabled:!0,gridCols:y.gridCols,gridRows:y.gridRows,layout:JSON.parse(JSON.stringify(y.layout||{})),hiddenCards:[...y.hiddenSections||[]]}}function ii(e){e===`Default`&&(delete y.layoutProfiles.Default,localStorage.setItem(`layoutProfiles`,JSON.stringify(y.layoutProfiles)));let t=ri();y.layoutProfiles[e]=t,y.activeProfileName=e,localStorage.setItem(`layoutProfiles`,JSON.stringify(y.layoutProfiles)),localStorage.setItem(`activeProfileName`,e),si(),W(`Profile "${e}" saved!`,`message`)}function ai(e){let t;t=e===`Default`?{gridCols:3,gridRows:3,layout:structuredClone(v),hiddenCards:[]}:y.layoutProfiles[e],t?(y.gridCols=t.gridCols,y.gridRows=t.gridRows,y.gridSize=t.gridCols,y.layout=JSON.parse(JSON.stringify(t.layout)),y.hiddenSections=t.hiddenCards||[],y.activeProfileName=e,localStorage.setItem(`gridCols`,y.gridCols),localStorage.setItem(`gridRows`,y.gridRows),localStorage.setItem(`gridSize`,y.gridCols),localStorage.setItem(`layout`,JSON.stringify(y.layout)),localStorage.setItem(`hiddenCards`,JSON.stringify(y.hiddenSections)),localStorage.setItem(`activeProfileName`,e),H(),si()):W(`Profile "${e}" not found.`,`error`)}function oi(e){e.innerHTML=`<option value="Default">Default</option>`,Object.keys(y.layoutProfiles).filter(e=>e!==`Default`).forEach(t=>{let n=document.createElement(`option`);n.value=t,n.textContent=t,e.appendChild(n)}),e.value=y.activeProfileName||`Default`}function si(){document.querySelectorAll(`#profileSelect, #leProfileSelect`).forEach(oi);let e=document.getElementById(`profileSwitcher`);if(!e)return;let t=[...Object.keys(y.layoutProfiles)];t.length<=1?e.innerHTML=``:(e.innerHTML=t.map(e=>{let t=y.layoutProfiles[e].enabled!==!1;return`  <div class="profile-btn${e===y.activeProfileName?` profile-btn-active`:``}" data-profile="${e}">
    ${e}
    <input type="checkbox" class="proftoggle" name="profiletoggle" data-profile="${e}" ${t?`checked`:``}>
  </div>`}).join(``),e.querySelectorAll(`.profile-btn`).forEach(e=>{e.addEventListener(`click`,()=>ai(e.dataset.profile))}),e.querySelectorAll(`input[name='profiletoggle']`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.profile,r=y.layoutProfiles[n];r&&(r.enabled=e.checked,localStorage.setItem(`layoutProfiles`,JSON.stringify(y.layoutProfiles)),ui())})}))}var ci=null;function li(){return[`Default`,...Object.keys(y.layoutProfiles||{}).filter(e=>e!==`Default`)].filter(e=>y.layoutProfiles[e]?.enabled!==!1)}function ui(){if(ci&&=(clearInterval(ci),null),!y.autoSwapEnabled)return;let e=li();e.length<2||(ci=setInterval(()=>{let t=e.indexOf(y.activeProfileName),n=e[(t+1)%e.length];ai(n)},y.autoSwapInterval*1e3))}function di(e){let t={};try{t=JSON.parse(localStorage.getItem(`cardSettings`)||`{}`)[e.id]||{}}catch{}let n={},r=fi(e);return e.settings=r,Object.entries(r).forEach(([r,i])=>{let a=typeof i==`string`?{type:`text`,default:i}:i||{};n[r]=t[r]??e.settingsValues?.[r]??a.default??(a.type!==`checkbox`&&``)}),n}function fi(e){return Object.keys(e?.settings||{}).length?e.settings:we(e?.js||``)}function pi(e,t){let n={};try{n=JSON.parse(localStorage.getItem(`cardSettings`)||`{}`)}catch{}n[e]=t,localStorage.setItem(`cardSettings`,JSON.stringify(n))}function mi(e){let t=String(e||`1.0.0`).match(/^(\d+)\.(\d+)\.(\d+)$/);return t?`${t[1]}.${t[2]}.${Number(t[3])+1}`:`1.0.1`}function hi(e,t,n,r){let i=Object.entries(fi(t));if(!i.length)return;let a=document.createElement(`div`);a.className=`card-settings-controls`;let o=document.createElement(`strong`);o.textContent=`Card settings`,a.appendChild(o),i.forEach(([e,i])=>{let o=typeof i==`string`?{type:`text`,default:i}:i||{},s=document.createElement(`label`);s.className=`card-setting-field`;let c=document.createElement(`span`);c.textContent=o.label||e,s.appendChild(c);let l=document.createElement(o.type===`select`?`select`:`input`);l.name=e,o.type===`select`?(o.options||[]).forEach(e=>{let t=document.createElement(`option`);t.value=e.value??e,t.textContent=e.label??e,l.appendChild(t)}):l.type=o.type||`text`,o.min!==void 0&&(l.min=o.min),o.max!==void 0&&(l.max=o.max),o.step!==void 0&&(l.step=o.step),o.type===`checkbox`?l.checked=!!n[e]:l.value=n[e],l.addEventListener(`input`,()=>{n[e]=o.type===`checkbox`?l.checked:l.value,pi(t.id,n),r(n)}),s.appendChild(l),a.appendChild(s)}),e.appendChild(a)}async function gi(e){let t=e.querySelector(`#cardCatalogList`),n=e.querySelector(`#cardCatalogStatus`);if(t&&n&&(t.innerHTML=``,n.textContent=B.isConfigured()?`Loading approved cards...`:`Catalog backend is not configured yet. Add the Supabase values in config.js.`,B.isConfigured()))try{let e=await B.listApproved(),r=[...e.reduce((e,t)=>(e.has(t.id)||e.set(t.id,[]),e.get(t.id).push(t),e),new Map).values()];n.textContent=e.length?``:`No approved community cards yet.`,r.forEach(e=>{e.sort((e,t)=>String(t.version).localeCompare(String(e.version),void 0,{numeric:!0}));let n=e[0],r=document.createElement(`article`);r.className=`catalog-card-item`,r.tabIndex=0,r.innerHTML=`<div class="catalog-card-info"><strong></strong><span></span></div><div class="catalog-card-preview"></div>`,r.querySelector(`strong`).textContent=n.label,r.querySelector(`span`).textContent=n.description||`Community card`,t.appendChild(r),B.renderPreview(r.querySelector(`.catalog-card-preview`),n,`catalog-tile-${n.id}`);let i=()=>_i(e);r.addEventListener(`click`,i),r.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),i())})})}catch(e){n.textContent=e.message}}function _i(e){let t=document.getElementById(`cardCatalogDetailModal`),n=t.querySelector(`#cardCatalogDetailTitle`),i=t.querySelector(`#cardCatalogDetailDescription`),a=t.querySelector(`#cardCatalogDetailVersion`),o=t.querySelector(`#cardCatalogDetailPreview`),s=t.querySelector(`#cardCatalogDetailSettings`),c=t.querySelector(`#cardCatalogDetailSave`),l=t.querySelector(`#cardCatalogDetailStatus`);e=[...e].sort((e,t)=>String(t.version).localeCompare(String(e.version),void 0,{numeric:!0})),a.innerHTML=e.map(e=>`<option value="${e.version}">${e.version}</option>`).join(``);let u=e[0],d,f=()=>{n.textContent=u.label,i.textContent=u.description||`Community card`,d=di(u),s.innerHTML=``,B.renderPreview(o,u,`catalog-detail-${u.id}`),hi(s,u,d,e=>{u.settingsValues=e,B.renderPreview(o,u,`catalog-detail-${u.id}`)}),c.disabled=!1,l.textContent=``};a.onchange=()=>{u=e.find(e=>e.version===a.value)||e[0],f()},c.onclick=()=>{let e=R.get(u.id);e?.builtin?l.textContent=`Card ID is already used by a built-in card.`:(y.developerCards[u.id]={label:u.label,description:u.description,icon:u.icon,version:u.version,settings:u.settings,settingsValues:d,html:u.html,css:u.css,js:u.js},r(`developerCards`,y.developerCards),e&&R.unregister(u.id),R.register(u.id,wn.createCardDefinition(u.id,y.developerCards[u.id])),c.disabled=!0,l.textContent=`Saved. Add it from the Layout Editor.`,H())},t.classList.add(`active`),f()}function vi(e){let t=e.querySelector(`#cardUploadForm`),n=e.querySelector(`#cardUploadLocalCard`),r=e.querySelector(`#cardUploadStatus`);t&&n&&r&&(bi(e),t.addEventListener(`submit`,async i=>{i.preventDefault();let a=n?.value;if(!a)r.textContent=`Select a saved card first.`;else try{let n=[{id:a,...y.developerCards[a]}],i=e.querySelector(`#cardUploadAuthor`).value.trim(),o=e.querySelector(`#cardUploadDescription`).value.trim();r.textContent=`Submitting for review...`;for(let e of n){let t=we(e.js||``),n={...e,authorName:i,description:o,settings:t},a=(await B.listApproved()).filter(t=>t.id===e.id),s=a.find(e=>ye(e)===ye(n));if(s){r.textContent=`Version ${s.version} is already approved.`;continue}let c=null;if(a.length){let e=[...a].sort((e,t)=>String(t.version).localeCompare(String(e.version),void 0,{numeric:!0}))[0];if(!confirm(`This card already exists. Request an update to ${e.version}?`))continue;let t=await yi(e.version);if(!t?.trim())continue;n.version=t.trim(),c={id:e.id,version:e.version}}await B.submit({...n,updateOf:c})}r.textContent=`Submitted. It will appear after moderation.`,t.reset()}catch(e){r.textContent=e.message}}))}function yi(e){let t=document.getElementById(`cardUpdateModal`),n=document.getElementById(`cardUpdateMessage`),r=document.getElementById(`cardUpdateVersion`),i=document.getElementById(`cardUpdateConfirm`),a=document.getElementById(`cardUpdateCancel`);return!t||!r||!i||!a?Promise.resolve(null):(n.textContent=`This card already exists at version ${e}. Choose a new version to request an update.`,r.value=mi(e),t.classList.add(`active`),new Promise(e=>{let n=n=>{t.classList.remove(`active`),i.removeEventListener(`click`,o),a.removeEventListener(`click`,s),e(n)},o=()=>n(r.value.trim()||null),s=()=>n(null);i.addEventListener(`click`,o),a.addEventListener(`click`,s),r.focus(),r.select()}))}function bi(e=document.getElementById(`cardUploadModal`)){let t=e?.querySelector(`#cardUploadLocalCard`);if(!t)return;let n=t.options[0]?.cloneNode(!0);t.innerHTML=``,n&&t.appendChild(n);let r=Object.keys(y.developerCards||{});r.forEach(e=>{let n=document.createElement(`option`);n.value=e,n.textContent=y.developerCards[e].label||e,t.appendChild(n)}),t.disabled=r.length===0,n&&(n.textContent=r.length?n.textContent:`No saved cards available`,t.options[0].textContent=n.textContent)}var xi=null;function Si(){return R.listCards().filter(e=>e!==`__fallback__`)}function Ci(t){let n=R.get(t),r=n.developer||!1,i=y.hiddenSections.includes(t),a=y.developerCards[t],o=U(t);return`<div class="card-manager-item" data-card-id="${o}">
    <div class="card-manager-item-info">
      ${r?`<label class="card-manager-export-select" title="Select ${o} for export"><input type="checkbox" class="card-export-checkbox" data-card-id="${o}"> Export</label>`:``}
      <span class="card-manager-item-icon">${e(`file`,18)}</span>
      <span class="card-manager-item-id">${o}</span>
      <span class="card-manager-item-label">${U(n.label)}</span>
      ${r&&a?.description?`<span class="card-manager-item-description">${U(a.description)}</span>`:``}
      ${r?`<span class="card-manager-item-badge">Custom</span>`:``}
      ${n.builtin?`<span class="card-manager-item-badge builtin">Built-in</span>`:``}
      ${i?`<span class="card-manager-item-badge" style="background:rgba(200,50,50,0.2);color:rgb(220,80,80);">Hidden</span>`:``}
    </div>
    ${r?`<div class="card-manager-card-preview"></div>`:``}
    <div class="card-manager-item-actions">
      ${r?`<button type="button" class="card-manager-item-edit" data-card-id="${o}">Edit</button>`:``}
      ${r?`<button type="button" class="card-manager-item-delete" data-card-id="${o}">Delete</button>`:``}
      <button type="button" class="card-manager-item-toggle" data-card-id="${o}">${i?`Show`:`Hide`}</button>
    </div>
  </div>`}function wi(){let e=xi?.querySelector(`#cardManagerList`);if(!e)return;let t=Si(),n=t.filter(e=>R.get(e)?.builtin),r=t.filter(e=>R.get(e)?.developer);e.innerHTML=`
    <section class="card-manager-section">
      <h3 class="card-manager-section-title">Built-in Cards</h3>
      <div class="card-manager-section-list card-manager-builtins">
        ${n.length?n.map(Ci).join(``):`<p class="card-manager-empty">No built-in cards.</p>`}
      </div>
    </section>
    <section class="card-manager-section">
      <h3 class="card-manager-section-title">Your Custom Cards</h3>
      <div class="card-manager-section-list card-manager-developer-grid">
        ${r.length?r.map(Ci).join(``):`<p class="card-manager-empty">No custom cards yet. Browse the Catalog or build one in Create.</p>`}
      </div>
    </section>`,e.querySelectorAll(`.card-manager-card-preview`).forEach(e=>{let t=e.closest(`.card-manager-item`),n=t.dataset.cardId,r={id:n,...y.developerCards[n]};B.renderPreview(e,r,`registry-tile-${n}`),t.classList.add(`card-manager-developer-card`)})}function Ti(e){let t=y.hiddenSections.indexOf(e);t>=0?y.hiddenSections.splice(t,1):y.hiddenSections.push(e),r(`hiddenCards`,y.hiddenSections),wi(),H()}function Ei(e){confirm(`Delete custom card "${e}"?`)&&(delete y.developerCards[e],r(`developerCards`,y.developerCards),R.unregister(e),wi(),H())}function Di(){let e=[...xi.querySelectorAll(`.card-export-checkbox:checked`)].map(e=>e.dataset.cardId);e.length?e.forEach((e,t)=>{let n=new Blob([JSON.stringify({[e]:y.developerCards[e]},null,2)],{type:`application/json`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`pitbeacon-card-${e}.json`,setTimeout(()=>{i.click(),URL.revokeObjectURL(r)},t*150)}):W(`Select at least one custom card to export.`,`error`)}function Oi(e){let t=new FileReader;t.onload=e=>{try{let t=JSON.parse(e.target.result);if(!t||typeof t!=`object`||Array.isArray(t))throw Error(`File is not a PitBeacon card export.`);let n=Object.entries(t);n.forEach(([e,t])=>{if(!t||typeof t!=`object`)throw Error(`Card "${e}" is not valid.`);let n=R.get(e);if(n&&!n.developer)throw Error(`Cannot import over built-in card "${e}".`)}),n.forEach(([e,t])=>{let n=wn.createCardDefinition(e,t);n.allowOverride=!0,y.developerCards[e]=t,R.register(e,n)}),r(`developerCards`,y.developerCards),wi(),H(),W(`Cards imported successfully!`,`message`)}catch(e){W(`Import failed: ${e.message}`,`error`)}},t.readAsText(e)}function ki(e,{onEdit:t}){xi=e,xi.addEventListener(`click`,e=>{let n=e.target.closest(`button[data-card-id]`);if(n){let e=n.dataset.cardId;n.classList.contains(`card-manager-item-toggle`)?Ti(e):n.classList.contains(`card-manager-item-delete`)?Ei(e):n.classList.contains(`card-manager-item-edit`)&&t?.(e);return}let r=e.target.closest(`.card-manager-developer-card`);if(r&&!e.target.closest(`button, input, label`)){let e=r.dataset.cardId;_i([{id:e,...y.developerCards[e]}])}}),xi.querySelector(`#cardManagerExport`).addEventListener(`click`,Di);let n=xi.querySelector(`#cardManagerFileInput`);xi.querySelector(`#cardManagerImport`).addEventListener(`click`,()=>n.click()),n.addEventListener(`change`,()=>{let e=n.files[0];e&&Oi(e),n.value=``})}var Ai=[`mine`,`catalog`,`create`],J,ji=!1,Mi=!1,Ni=`mine`;function Pi(e){return J.querySelector(`.cards-panel[data-panel="${e}"]`)}function Fi(){let e=J.querySelector(`#devCardModal`);return ji||=(wn.initEditor(e),!0),e}function Ii(e,{reload:t=!1}={}){if(Ai.includes(e)||(e=`mine`),Ni=e,J.querySelectorAll(`.cards-tab`).forEach(t=>{let n=t.dataset.tab===e;t.setAttribute(`aria-selected`,String(n)),t.tabIndex=n?0:-1}),Ai.forEach(t=>{Pi(t).hidden=t!==e}),e===`mine`&&wi(),e===`catalog`&&(!Mi||t)&&(Mi=!0,gi(J)),e===`create`){let e=Fi();e.classList.remove(`active`),e.offsetWidth,e.classList.add(`active`)}}function Li(e=`mine`){J.classList.add(`active`),Ii(e),J.querySelector(`.cards-tab[data-tab="${Ni}"]`)?.focus()}function Ri(){J.classList.remove(`active`),J.querySelector(`#cardCatalogList`).innerHTML=``,Mi=!1}function zi(e){Ii(`create`);let t=J.querySelector(`#devCardModal`);setTimeout(()=>t._devCardLoad?.(e),0)}function Bi({detail:e}){let{id:t,def:n}=e;y.developerCards[t]=n;let r=R.get(t);r?.developer&&!r.settings&&n.js&&(n.settings=we(n.js)),n.settingsValues=di({id:t,...n}),bi(),Ni===`mine`&&wi()}function Vi(){if(J=document.getElementById(`cardsModal`),!J)return;ki(Pi(`mine`),{onEdit:zi}),vi(document.getElementById(`cardUploadModal`)),J.querySelectorAll(`.cards-tab`).forEach((e,t,n)=>{e.addEventListener(`click`,()=>Ii(e.dataset.tab)),e.addEventListener(`keydown`,e=>{let r={ArrowRight:1,ArrowLeft:-1}[e.key];if(!r)return;let i=n[(t+r+n.length)%n.length];i.focus(),Ii(i.dataset.tab)})}),J.querySelector(`#cardsClose`).addEventListener(`click`,Ri),J.addEventListener(`click`,e=>{e.target===J&&Ri()}),document.addEventListener(`keydown`,e=>{if(e.key!==`Escape`||!J.classList.contains(`active`))return;let t=document.querySelector(`#cardCatalogDetailModal.active, #cardUploadModal.active, #cardUpdateModal.active`);t?t.classList.remove(`active`):Ri()}),J.querySelector(`#devCardGuide`).addEventListener(`click`,()=>Tn.open()),J.querySelector(`#cardCatalogSubmit`).addEventListener(`click`,()=>{bi(),document.getElementById(`cardUploadModal`).classList.add(`active`)}),window.addEventListener(`pitbeacon:card-saved`,Bi),[`cardCatalogDetailModal`,`cardUploadModal`].forEach(e=>{let t=document.getElementById(e);t?.addEventListener(`click`,e=>{e.target===t&&t.classList.remove(`active`)})});let e=(e,t)=>document.getElementById(e)?.addEventListener(`click`,()=>{document.getElementById(t).classList.remove(`active`)});e(`cardCatalogDetailClose`,`cardCatalogDetailModal`),e(`cardUploadClose`,`cardUploadModal`),document.getElementById(`cardUpdateClose`)?.addEventListener(`click`,()=>{document.getElementById(`cardUpdateCancel`)?.click()}),document.getElementById(`cardsBtn`)?.addEventListener(`click`,()=>Li(`mine`)),window.addEventListener(`pitbeacon:cards-changed`,()=>{Ni===`mine`&&wi()})}function Hi(){let e=[`--bg-base`,`--bg-surface`,`--bg-raised`,`--bg-input`,`--accent`,`--accent-hover`,`--border`,`--border-accent`,`--text-primary`,`--text-muted`,`--text-dim`,`--scrollbar-track`,`--scrollbar-thumb`,`--scrollbar-thumb-hover`],t={};e.forEach(e=>{let n=document.documentElement.style.getPropertyValue(e).trim();n&&(t[e]=n)}),localStorage.setItem(`customColors`,JSON.stringify(t))}function Ui(){try{let e=JSON.parse(localStorage.getItem(`customColors`)||`{}`);Object.entries(e).forEach(([e,t])=>document.documentElement.style.setProperty(e,t))}catch{}}function Wi(){let e=[`--bg-base`,`--bg-surface`,`--bg-raised`,`--bg-input`,`--accent`,`--accent-hover`,`--border`,`--border-accent`,`--text-primary`,`--text-muted`,`--text-dim`,`--scrollbar-track`,`--scrollbar-thumb`,`--scrollbar-thumb-hover`],t={};return e.forEach(e=>{let n=document.documentElement.style.getPropertyValue(e).trim();n&&(t[e]=n)}),t}function Gi(e){let t=e.match(/\d+/g);return t?`#`+t.slice(0,3).map(e=>parseInt(e).toString(16).padStart(2,`0`)).join(``).toUpperCase():e}function Ki(){let e=document.getElementById(`customColorVariable`),t=document.getElementById(`customColorPicker`),n=document.getElementById(`customColorHex`);if(!e||!t||!n)return;let r=getComputedStyle(document.documentElement).getPropertyValue(e.value).trim(),i=r.startsWith(`rgb`)?Gi(r):r;n.textContent=i,i.startsWith(`#`)&&(t.value=i)}function qi(e){let t=e.querySelector(`#customColorVariable`),n=e.querySelector(`#customColorPicker`),r=e.querySelector(`#customColorReset`),i=e.querySelector(`#customColorsClose`);t.addEventListener(`change`,Ki),n.addEventListener(`input`,()=>{document.documentElement.style.setProperty(t.value,n.value),document.getElementById(`customColorHex`).textContent=n.value,Hi()}),r.addEventListener(`click`,()=>{let e={dark:{"--bg-base":`rgb(22, 22, 22)`,"--bg-surface":`rgb(30, 30, 30)`,"--bg-raised":`rgb(40, 40, 40)`,"--bg-input":`rgb(50, 50, 50)`,"--accent":`rgb(47, 48, 112)`,"--accent-hover":`rgb(60, 62, 140)`,"--border":`rgba(255, 255, 255, 0.07)`,"--border-accent":`rgba(47, 48, 112, 0.6)`,"--text-primary":`rgb(240, 240, 240)`,"--text-muted":`rgb(160, 155, 155)`,"--text-dim":`rgb(100, 98, 98)`},light:{"--bg-base":`rgb(245, 245, 247)`,"--bg-surface":`rgb(235, 235, 238)`,"--bg-raised":`rgb(225, 225, 230)`,"--bg-input":`rgb(210, 210, 215)`,"--accent":`rgb(47, 48, 112)`,"--accent-hover":`rgb(70, 72, 160)`,"--border":`rgba(0, 0, 0, 0.1)`,"--border-accent":`rgba(47, 48, 112, 0.3)`,"--text-primary":`rgb(20, 20, 22)`,"--text-muted":`rgb(80, 85, 90)`,"--text-dim":`rgb(130, 135, 140)`},"high-contrast":{"--bg-base":`rgb(0, 0, 0)`,"--bg-surface":`rgb(15, 15, 15)`,"--bg-raised":`rgb(30, 30, 30)`,"--bg-input":`rgb(50, 50, 50)`,"--accent":`rgb(0, 255, 255)`,"--accent-hover":`rgb(0, 200, 200)`,"--border":`rgba(0, 255, 255, 0.3)`,"--border-accent":`rgba(0, 255, 255, 0.6)`,"--text-primary":`rgb(255, 255, 255)`,"--text-muted":`rgb(200, 200, 200)`,"--text-dim":`rgb(150, 150, 150)`}},n=t.value,r=e[y.theme||`dark`]?.[n];if(!r)return;document.documentElement.style.setProperty(n,r);let i=JSON.parse(localStorage.getItem(`customColors`)||`{}`);delete i[n],localStorage.setItem(`customColors`,JSON.stringify(i)),Ki(),W(`Reset ${n} to default`,`message`)});let a=()=>{e.classList.remove(`active`),e.setAttribute(`aria-hidden`,`true`),document.getElementById(`openCustomColorsBtn`).focus()};i.addEventListener(`click`,a),e.addEventListener(`click`,t=>{t.target===e&&a()}),document.addEventListener(`keydown`,t=>{t.key===`Escape`&&e.classList.contains(`active`)&&a()})}var Y={modal:null,shell:null,dragData:null,resizeData:null};function Ji(){let e=document.getElementById(`layoutEditorModal`);G(e),e.innerHTML=``,e.classList.add(`active`),Y.modal=e,Xi(e)}function Yi(e,t){let n=Array.isArray(y.defaultCards)?y.defaultCards.find(t=>t.id===e):null,r=t?.icon||n?.icon||`square`,i=String(r).trim().toLowerCase(),a={"device-tv":`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="14" rx="2"></rect><path d="M8 21h8"></path><path d="M12 18v3"></path></svg>`,tournament:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v4"></path><path d="M16 4v4"></path><path d="M4 8h16"></path><path d="M8 8v4"></path><path d="M16 8v4"></path><path d="M8 12h8"></path><path d="M6 12h2"></path><path d="M16 12h2"></path><path d="M4 16h16"></path><path d="M8 16v4"></path><path d="M16 16v4"></path></svg>`,trophy:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10"></path><path d="M8 4v3a4 4 0 0 0 4 4 4 4 0 0 0 4-4V4"></path><path d="M8 12H6a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1"></path><path d="M16 12h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1"></path><path d="M12 17v3"></path></svg>`,tool:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4a2 2 0 0 1 2.8 2.8L9.6 12 8 10.4l7.2-7.2Z"></path><path d="m6 12 6 6"></path><path d="m10 16 4 4"></path></svg>`,battery:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="14" height="12" rx="2"></rect><path d="M19 10h1"></path><path d="M17 8v8"></path></svg>`,package:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z"></path><path d="m4 7 8 4 8-4"></path><path d="m12 11 8-4"></path><path d="M12 11v10"></path></svg>`,checklist:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11"></path><path d="M9 12h11"></path><path d="M9 18h11"></path><path d="m4 5 1.5 1.5L8 3"></path><path d="m4 11 1.5 1.5L8 9"></path><path d="m4 17 1.5 1.5L8 15"></path></svg>`,"chart-bar":`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9"></path><path d="M10 19V5"></path><path d="M16 19v-7"></path><path d="M22 19v-3"></path></svg>`,"alert-circle":`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v5"></path><path d="M12 16h.01"></path></svg>`,code:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8-4 4 4 4"></path><path d="m16 8 4 4-4 4"></path><path d="m13 4-2 16"></path></svg>`};return`<span class="le-card-icon" data-icon-name="${r}" aria-hidden="true">${a[i]||a.square||`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>`}</span>`}function Xi(t){let n=R.listCards(),r=y.gridCols||3,i=y.gridRows||3,a=document.createElement(`div`);a.className=`le-shell`,a.id=`leShell`,a.setAttribute(`role`,`dialog`),a.setAttribute(`aria-modal`,`true`),a.setAttribute(`aria-labelledby`,`leTitle`),a.innerHTML=`
        <header class="le-header">
            <div class="le-header-copy">
                <h2 class="le-title" id="leTitle">Layout editor</h2>
                <p class="le-description">Arrange the cards shown on your PitBeacon display.</p>
            </div>
            <div class="le-header-actions">
                <div class="le-profile-controls" role="group" aria-label="Layout profiles">
                    <select id="leProfileSelect" aria-label="Active profile"></select>
                    <input type="text" id="leProfileName" aria-label="Profile name" placeholder="Profile name">
                    <button class="le-action-btn le-action-primary" id="leSaveProfile" type="button">Save profile</button>
                </div>
                <div class="le-controls" role="group" aria-label="Display grid size">
                    <label for="leGridCols">Columns <input type="number" id="leGridCols" min="2" max="12" value="${r}"></label>
                    <label for="leGridRows">Rows <input type="number" id="leGridRows" min="2" max="12" value="${i}"></label>
                </div>
                <button class="le-close-btn" id="leClose" type="button" aria-label="Close layout editor" title="Close">×</button>
            </div>
        </header>
        <div class="le-body">
            <aside class="le-palette" aria-label="Available cards">
                <div class="le-palette-heading">
                    <h3 class="le-palette-title">Available cards</h3>
                    <p class="le-palette-hint">Drag a card onto the preview to add it.</p>
                </div>
                <div class="le-palette-list" id="leCardList">
                    ${n.filter(e=>e!==`__fallback__`).map(t=>{let n=R.get(t),r=y.layout[t]!==void 0,i=Object.keys(fi(n)).length>0;return`<div class="le-palette-item ${r?`in-layout`:``}" draggable="${!r}" data-card-id="${t}">
                            ${Yi(t,n)}
                            <span class="le-card-label">${n.label}</span>
                            ${i?`<button class="le-settings-btn" type="button" data-card-id="${t}" aria-label="Settings for ${n.label}" title="Configure ${n.label}">${e(`settings`,14)}</button>`:``}
                            ${r?`<span class="le-added-badge">Added</span>`:``}
                        </div>`}).join(``)}
                    ${n.filter(e=>e!==`__fallback__`).length===0?`<div class="le-palette-empty">No cards available</div>`:``}
                </div>
                <div class="le-actions">
                    <h3 class="le-actions-title">Layout settings</h3>
                    <button class="le-action-btn le-action-primary" id="leExport" type="button">Export layout</button>
                    <button class="le-action-btn" id="leImport" type="button">Import layout</button>
                    <button class="le-action-btn le-action-reset" id="leReset" type="button">Reset to default</button>
                </div>
            </aside>
            <section class="le-canvas" aria-label="Display preview">
                <div class="le-canvas-toolbar">
                    <span class="le-canvas-label">Display preview</span>
                    <span class="le-canvas-hint">Drag cards to move them · use a corner handle to resize</span>
                </div>
                <div class="layout-grid" id="leGrid" style="--grid-cols:${r};--grid-rows:${i};grid-template-columns:repeat(${r},1fr);grid-template-rows:repeat(${i},1fr);">
                    ${Object.entries(y.layout).map(([t,n])=>{let r=R.get(t);return r?`<div class="layout-item" data-card-id="${t}" style="grid-column:${n.x+1}/span ${n.width};grid-row:${n.y+1}/span ${n.height};">
                            <div class="layout-item-header">
                                <span class="layout-item-title">${Yi(t,r)}<span class="le-card-label">${r.label}</span></span>
                                ${Object.keys(fi(r)).length?`<button class="le-settings-btn" type="button" data-card-id="${t}" aria-label="Settings for ${r.label}" title="Configure ${r.label}">${e(`settings`,14)}</button>`:``}
                                <button class="le-remove-btn" type="button" data-card-id="${t}" aria-label="Remove ${r.label}" title="Remove card">×</button>
                            </div>
                            <div class="layout-item-hint">${n.width} × ${n.height} cells</div>
                            <div class="resize-handle" aria-hidden="true"></div>
                        </div>`:``}).join(``)}
                </div>
            </section>
        </div>
    `,t.appendChild(a),Y.shell=a,oi(a.querySelector(`#leProfileSelect`));let o=a.querySelector(`#leGridCols`),s=a.querySelector(`#leGridRows`),c=a.querySelector(`#leGrid`);a.querySelector(`#leProfileSelect`).addEventListener(`change`,e=>{ai(e.target.value),G(t),t.innerHTML=``,Xi(t)}),a.querySelector(`#leSaveProfile`).addEventListener(`click`,()=>{ii(a.querySelector(`#leProfileName`).value.trim()||y.activeProfileName||`Default`),a.querySelector(`#leProfileName`).value=``});function l(){let e=Math.max(2,Math.min(12,parseInt(o.value)||3)),t=Math.max(2,Math.min(12,parseInt(s.value)||3));y.gridCols=e,y.gridRows=t,c.style.gridTemplateColumns=`repeat(${e},1fr)`,c.style.gridTemplateRows=`repeat(${t},1fr)`,c.style.setProperty(`--grid-cols`,e),c.style.setProperty(`--grid-rows`,t),localStorage.setItem(`gridCols`,e),localStorage.setItem(`gridRows`,t)}o.addEventListener(`change`,l),s.addEventListener(`change`,l),a.querySelector(`#leClose`).addEventListener(`click`,()=>{Zi()}),a.querySelectorAll(`.le-settings-btn`).forEach(e=>{e.addEventListener(`mousedown`,e=>e.stopPropagation()),e.addEventListener(`click`,n=>{n.preventDefault(),n.stopPropagation();let r=R.get(e.dataset.cardId);if(!r)return;let i=fi(r);if(!Object.keys(i).length)return;let a=document.createElement(`div`);a.className=`le-card-settings-content`;let o=document.createElement(`p`);o.className=`le-card-settings-hint`,o.textContent=`Changes are saved automatically and apply immediately.`,a.appendChild(o),hi(a,r,di(r),e=>{r.settingsValues=e,r.developer&&y.developerCards[r.id]&&(y.developerCards[r.id].settingsValues=e,localStorage.setItem(`developerCards`,JSON.stringify(y.developerCards))),V.updateCards(L.getState())}),vr({parent:t,id:`layout-card-settings:${r.id}`,title:`${r.label} settings`,content:a,opener:e,width:460,height:380})})}),a.querySelectorAll(`.le-palette-item`).forEach(e=>{e.addEventListener(`dragstart`,e=>{e.target.closest(`.le-settings-btn`)&&e.preventDefault()})}),t.addEventListener(`click`,e=>{e.target===t&&Zi()}),a.querySelectorAll(`.le-remove-btn`).forEach(e=>{e.addEventListener(`click`,n=>{n.stopPropagation();let r=e.dataset.cardId;delete y.layout[r],localStorage.setItem(`layout`,JSON.stringify(y.layout)),G(t),t.innerHTML=``,Xi(t)})}),a.querySelectorAll(`.le-palette-item:not(.in-layout)`).forEach(e=>{e.addEventListener(`dragstart`,t=>{t.dataTransfer.setData(`text/plain`,e.dataset.cardId),e.style.opacity=`0.5`}),e.addEventListener(`dragend`,t=>{e.style.opacity=``})}),c.addEventListener(`dragover`,e=>e.preventDefault()),c.addEventListener(`drop`,e=>{e.preventDefault();let n=e.dataTransfer.getData(`text/plain`);if(!n||y.layout[n])return;let r=c.getBoundingClientRect(),i=parseInt(o.value)||3,a=parseInt(s.value)||3,l=(r.width-8*(i-1))/i,u=(r.height-8*(a-1))/a,d=Math.max(0,Math.min(Math.floor((e.clientX-r.left)/(l+8)),i-1)),f=Math.max(0,Math.min(Math.floor((e.clientY-r.top)/(u+8)),a-1));y.layout[n]={x:d,y:f,width:1,height:1},localStorage.setItem(`layout`,JSON.stringify(y.layout)),G(t),t.innerHTML=``,Xi(t)}),Qi(c),$i(c),a.querySelector(`#leExport`).addEventListener(`click`,()=>{let e={version:`26.10.24`,gridCols:y.gridCols,gridRows:y.gridRows,layout:y.layout,hiddenCards:y.hiddenSections,customColors:Wi()},t=new Blob([JSON.stringify(e,null,2)],{type:`application/json`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=`pitbeacon-layout-${new Date().toISOString().split(`T`)[0]}.json`,n.click(),W(`Layout exported!`,`message`)}),a.querySelector(`#leImport`).addEventListener(`click`,()=>{let e=document.createElement(`input`);e.type=`file`,e.accept=`.json`,e.onchange=e=>{let n=e.target.files[0];if(!n)return;let r=new FileReader;r.onload=e=>{try{let n=JSON.parse(e.target.result);n.gridCols&&(y.gridCols=n.gridCols),n.gridRows&&(y.gridRows=n.gridRows),n.layout&&(y.layout=n.layout),n.hiddenCards&&(y.hiddenSections=n.hiddenCards),n.customColors&&(Object.entries(n.customColors).forEach(([e,t])=>{document.documentElement.style.setProperty(e,t)}),localStorage.setItem(`customColors`,JSON.stringify(n.customColors))),localStorage.setItem(`gridCols`,y.gridCols),localStorage.setItem(`gridRows`,y.gridRows),localStorage.setItem(`layout`,JSON.stringify(y.layout)),localStorage.setItem(`hiddenCards`,JSON.stringify(y.hiddenSections)),W(`Layout imported!`,`message`),G(t),t.innerHTML=``,Xi(t)}catch(e){W(`Import failed: `+e.message,`error`)}},r.readAsText(n)},e.click()}),a.querySelector(`#leReset`).addEventListener(`click`,()=>{confirm(`Reset layout to default?`)&&(y.layout=structuredClone(v),y.gridCols=3,y.gridRows=3,y.gridSize=3,y.hiddenSections=[],[`gridCols`,`gridRows`,`gridSize`].forEach(e=>localStorage.setItem(e,`3`)),localStorage.setItem(`layout`,JSON.stringify(y.layout)),localStorage.setItem(`hiddenCards`,JSON.stringify(y.hiddenSections)),W(`Layout reset to default`,`message`),G(t),t.innerHTML=``,Xi(t))})}function Zi(){Y.modal&&(G(Y.modal),Y.modal.classList.remove(`active`),Y.modal.innerHTML=``,Y.modal=null,Y.shell=null,H())}function Qi(e){e.addEventListener(`mousedown`,t=>{let n=t.target.closest(`.layout-item`);if(!n||t.target.closest(`.le-remove-btn`)||t.target.closest(`.resize-handle`))return;let r=e.getBoundingClientRect(),i=y.gridCols||3,a=y.gridRows||3,o=(r.width-8*(i-1))/i,s=(r.height-8*(a-1))/a,c=n.dataset.cardId,l=y.layout[c];if(!l)return;let u=t.clientX,d=t.clientY,f=l.x,p=l.y;n.classList.add(`dragging`);let m=e=>{let t=Math.round((e.clientX-u)/(o+8)),r=Math.round((e.clientY-d)/(s+8)),c=Math.max(0,Math.min(f+t,i-l.width)),m=Math.max(0,Math.min(p+r,a-l.height));(c!==l.x||m!==l.y)&&(l.x=c,l.y=m,n.style.gridColumn=`${l.x+1} / span ${l.width}`,n.style.gridRow=`${l.y+1} / span ${l.height}`)},h=()=>{document.removeEventListener(`mousemove`,m),document.removeEventListener(`mouseup`,h),n.classList.remove(`dragging`),localStorage.setItem(`layout`,JSON.stringify(y.layout))};document.addEventListener(`mousemove`,m),document.addEventListener(`mouseup`,h)})}function $i(e){e.addEventListener(`mousedown`,t=>{let n=t.target.closest(`.resize-handle`);if(!n)return;let r=n.closest(`.layout-item`);if(!r)return;let i=e.getBoundingClientRect(),a=y.gridCols||3,o=y.gridRows||3,s=(i.width-8*(a-1))/a,c=(i.height-8*(o-1))/o,l=r.dataset.cardId,u=y.layout[l];if(!u)return;let d=t.clientX,f=t.clientY,p=u.width,m=u.height;r.classList.add(`resizing`),t.preventDefault();let h=e=>{let t=Math.round((e.clientX-d)/(s+8)),n=Math.round((e.clientY-f)/(c+8)),i=Math.max(1,Math.min(p+t,a-u.x)),l=Math.max(1,Math.min(m+n,o-u.y));if(i!==u.width||l!==u.height){u.width=i,u.height=l,r.style.gridColumn=`${u.x+1} / span ${u.width}`,r.style.gridRow=`${u.y+1} / span ${u.height}`;let e=r.querySelector(`.layout-item-hint`);e&&(e.textContent=`${u.width} × ${u.height} cells`)}},g=()=>{document.removeEventListener(`mousemove`,h),document.removeEventListener(`mouseup`,g),r.classList.remove(`resizing`),localStorage.setItem(`layout`,JSON.stringify(y.layout))};document.addEventListener(`mousemove`,h),document.addEventListener(`mouseup`,g)})}var ea=[`robot-health-card`,`battery-card`,`parts-card`,`checkin-card`],ta=`pit-notes-card`;function na(e){if(!e||typeof e!=`object`)return e;Object.hasOwn(e,`statbotics-card`)&&(Object.hasOwn(e,`stats-card`)||(e[`stats-card`]=e[`statbotics-card`]),delete e[`statbotics-card`]);let t=ea.filter(t=>Object.hasOwn(e,t));return t.length&&(Object.hasOwn(e,`pit-notes-card`)||(e[ta]=e[t[0]]),t.forEach(t=>delete e[t])),e}function ra(e){if(!Array.isArray(e))return e;let t=e.map(e=>e===`statbotics-card`?`stats-card`:e),n=t.filter(e=>ea.includes(e)),r=t.filter(e=>!ea.includes(e));return n.length===ea.length&&!r.includes(`pit-notes-card`)&&r.push(ta),r}var ia={qm:`Q`,ef:`EF`,qf:`QF`,sf:`SF`,f:`F`};function aa(e){let t=ia[e.comp_level]??String(e.comp_level??``).toUpperCase(),n=e.comp_level&&e.comp_level!==`qm`&&e.set_number?`${e.set_number}-`:``;return`${t}${t.length>1||n?` `:``}${n}${e.match_number}`}function oa(e){let t=e.predicted_time??e.time;return Number.isFinite(t)?t:null}function sa(e,t){let n=`frc${t}`;return e.alliances?.red?.team_keys?.includes(n)?`red`:e.alliances?.blue?.team_keys?.includes(n)?`blue`:null}function ca({matches:e,teamNumber:t,nowSec:n,alertThreshold:r=300,matchDuration:i=150}){if(!Array.isArray(e)||!e.length)return null;let a=e.map(e=>({match:e,start:oa(e),alliance:sa(e,t)})).filter(e=>e.start!==null&&e.alliance&&e.start+i>=n).sort((e,t)=>e.start-t.start)[0];if(!a)return null;let o=Math.max(0,Math.floor(a.start-n)),s=n>=a.start;return{label:aa(a.match),alliance:a.alliance,startsAt:a.start,secondsUntil:o,inProgress:s,urgent:s||o<=r}}function la(e){let t=Math.max(0,Math.floor(e)),n=Math.floor(t/3600),r=Math.floor(t%3600/60);return n>0?`${n}h ${r}m`:r>0?`${r}m ${String(t%60).padStart(2,`0`)}s`:`${t}s`}var ua=`2.1rem`,X=null,da=``;function fa(){let e=document.createElement(`div`);e.id=`nextMatchBanner`,e.className=`nm-banner`,e.setAttribute(`role`,`status`),e.hidden=!0;for(let t of[`nm-tag`,`nm-match`,`nm-time`,`nm-alliance`]){let n=document.createElement(`span`);n.className=t,e.appendChild(n)}return e}function pa(){X&&(X.hidden=!0,da=``,document.documentElement.style.setProperty(`--banner-height`,`0px`))}function ma(){if(!X)return;if(!y.showNextMatchBanner)return pa();let e=L.getState(),t=Math.floor((e.fullDate?.getTime?.()??Date.now())/1e3),n=ca({matches:e.currentMatches,teamNumber:y.teamNumber,nowSec:t,alertThreshold:y.matchAlertThreshold});if(!n)return pa();let r=n.inProgress?`In progress`:`in ${la(n.secondsUntil)}`,i=`${n.label}|${r}|${n.alliance}|${n.urgent}`;(i!==da||X.hidden)&&(da=i,X.hidden=!1,X.dataset.alliance=n.alliance,X.classList.toggle(`nm-urgent`,n.urgent),X.querySelector(`.nm-tag`).textContent=n.urgent?`Match soon`:`Next match`,X.querySelector(`.nm-match`).textContent=n.label,X.querySelector(`.nm-time`).textContent=r,X.querySelector(`.nm-alliance`).textContent=n.alliance===`red`?`Red alliance`:`Blue alliance`,document.documentElement.style.setProperty(`--banner-height`,ua))}function ha(){let e=document.getElementById(`header`);e&&(X=fa(),e.insertAdjacentElement(`afterend`,X),L.subscribe(ma),ma())}var ga=window.matchMedia(`(orientation: portrait)`),_a=e=>e===`rotate-cw`||e===`rotate-ccw`;function va(e=!0){let t=y.portraitMode||`auto`,n=_a(t),r=t===`auto`&&ga.matches,i=document.documentElement;i.classList.toggle(`rotate-cw`,t===`rotate-cw`),i.classList.toggle(`rotate-ccw`,t===`rotate-ccw`),i.classList.toggle(`portrait-layout`,n||r),y.portraitLayout=n||r;let a=document.getElementById(`portraitBtn`);a&&(a.classList.toggle(`active`,n),a.setAttribute(`aria-pressed`,String(n))),e&&H()}function ya(){y.portraitMode=h(`portraitMode`,`auto`);let e=document.getElementById(`portraitMode`);e&&(e.value=y.portraitMode),va(!1)}function ba(e){y.portraitMode=e,g(`portraitMode`,e);let t=document.getElementById(`portraitMode`);t&&(t.value=e),va()}function xa(){document.getElementById(`portraitBtn`)?.addEventListener(`click`,()=>{ba(_a(y.portraitMode)?`landscape`:`rotate-cw`)}),ga.addEventListener(`change`,()=>va())}var Sa=[Fr,or];function Ca(e){return e instanceof Error?e.message:String(e)}function wa(e){return new Promise((t,n)=>{let r=indexedDB.deleteDatabase(e);r.onsuccess=()=>t(),r.onerror=()=>n(r.error||Error(`Could not delete "${e}".`)),r.onblocked=()=>n(Error(`Database "${e}" is still open in another tab.`))})}async function Ta(){let e=[];for(let[t,n]of[[`Local storage`,globalThis.localStorage],[`Session storage`,globalThis.sessionStorage]])try{n.clear()}catch(n){e.push(`${t}: ${Ca(n)}`)}let t=globalThis.caches;if(t)try{let n=await t.keys();(await Promise.allSettled(n.map(e=>t.delete(e)))).forEach((t,r)=>{t.status===`rejected`&&e.push(`Cache "${n[r]}": ${Ca(t.reason)}`)})}catch(t){e.push(`Cache storage: ${Ca(t)}`)}globalThis.indexedDB&&(await Promise.allSettled(Sa.map(wa))).forEach((t,n)=>{t.status===`rejected`&&e.push(`IndexedDB "${Sa[n]}": ${Ca(t.reason)}`)});let n=globalThis.navigator?.serviceWorker;if(n)try{let t=new URL(`./`,globalThis.location.href).href,r=(await n.getRegistrations()).filter(e=>e.scope===t);(await Promise.allSettled(r.map(e=>e.unregister()))).forEach((t,n)=>{t.status===`rejected`&&e.push(`Service worker "${r[n].scope}": ${Ca(t.reason)}`)})}catch(t){e.push(`Service workers: ${Ca(t)}`)}if(e.length)throw Error(e.join(` `))}var Z=e=>document.getElementById(e);function Ea(e,n){return t(e,n)}function Da(){let e=Ea(`developerCards`,null);if(e&&typeof e==`object`){y.developerCards=e;for(let[t,n]of Object.entries(e))n.settings=n.settings&&Object.keys(n.settings).length?n.settings:we(n.js||``),n.settingsValues=di({id:t,...n}),R.register(t,wn.createCardDefinition(t,n))}}function Oa(){let e=h(`teamNumber`);e&&(y.teamNumber=e,Z(`teamNumber`).value=e,L.update({teamNumber:Number.parseInt(e,10)}));let t=h(`tbaapikey`);t&&(y.tbaapikey=t,Z(`tbaapikey`).value=t);let n=h(`match13apikey`);n&&(y.match13apikey=n,Z(`match13apikey`).value=n),y.theme=h(`theme`,`dark`),document.documentElement.setAttribute(`data-theme`,y.theme),y.noteAlarmToggle=h(`noteAlarmToggle`)===`true`,y.noteAlarmSound=h(`noteAlarmSound`,`alarm1`),Z(`noteAlarmToggle`).checked=y.noteAlarmToggle,Z(`noteAlarmSound`).value=y.noteAlarmSound,y.matchAlarmToggle=h(`matchAlarmToggle`)!==`false`,y.matchAlertThreshold=Number.parseInt(h(`matchAlertThreshold`,`300`),10)||300,y.matchAlarmSound=h(`matchAlarmSound`,`alarm1`),Z(`matchAlarmToggle`).checked=y.matchAlarmToggle,Z(`matchAlertThreshold`).value=y.matchAlertThreshold,Z(`matchAlarmSound`).value=y.matchAlarmSound,y.showNextMatchBanner=h(`showNextMatchBanner`)!==`false`,Z(`showNextMatchBanner`).checked=y.showNextMatchBanner,y.showCardStatusDots=h(`showCardStatusDots`)!==`false`,Z(`showCardStatusDots`).checked=y.showCardStatusDots,y.autoHideTopBar=h(`autoHideTopBar`)===`true`,y.autoHideTopBarDelay=Math.min(300,Math.max(1,Number.parseInt(h(`autoHideTopBarDelay`,`5`),10)||5)),Z(`autoHideTopBar`).checked=y.autoHideTopBar,Z(`autoHideTopBarDelay`).value=y.autoHideTopBarDelay,Z(`autoHideTopBarDelay`).disabled=!y.autoHideTopBar,y.gridCols=Number.parseInt(h(`gridCols`,y.gridCols),10)||y.gridCols,y.gridRows=Number.parseInt(h(`gridRows`,y.gridRows),10)||y.gridRows,y.gridSize=y.gridCols;let r=Ea(`layout`,null);r&&typeof r==`object`&&(y.layout=na(r));let i=Ea(`hiddenCards`,null);y.hiddenSections=Array.isArray(i)?ra(i):[];let a=Ea(`layoutProfiles`,null);y.layoutProfiles=a&&typeof a==`object`?a:{};for(let e of Object.values(y.layoutProfiles))e&&typeof e==`object`&&(na(e.layout),Array.isArray(e.hiddenCards)&&(e.hiddenCards=ra(e.hiddenCards)));y.activeProfileName=h(`activeProfileName`,`Default`),Da(),y.testMode=h(`testMode`)===`true`,y.testDate=h(`testDate`,``),Z(`testMode`).checked=y.testMode,y.testDate&&(Z(`testDate`).value=y.testDate),Z(`testDate`).style.display=y.testMode?`block`:`none`;let o=Ar(y);L.update({fullDate:o,isTestMode:y.testMode&&o!==null}),y.autoSwapEnabled=h(`autoSwapEnabled`)===`true`,y.autoSwapInterval=Number.parseInt(h(`autoSwapInterval`,`30`),10)||30,Z(`autoSwapEnabled`).checked=y.autoSwapEnabled,Z(`autoSwapInterval`).value=y.autoSwapInterval,ya(),si(),Ui()}function ka(){let e=y.showCardStatusDots;y.teamNumber=Z(`teamNumber`).value.trim(),y.tbaapikey=Z(`tbaapikey`).value.trim(),y.match13apikey=Z(`match13apikey`).value.trim(),y.noteAlarmToggle=Z(`noteAlarmToggle`).checked,y.noteAlarmSound=Z(`noteAlarmSound`).value,y.matchAlarmToggle=Z(`matchAlarmToggle`).checked,y.matchAlertThreshold=Number.parseInt(Z(`matchAlertThreshold`).value,10)||300,y.matchAlarmSound=Z(`matchAlarmSound`).value,y.autoSwapEnabled=Z(`autoSwapEnabled`).checked,y.autoSwapInterval=Number.parseInt(Z(`autoSwapInterval`).value,10)||30,y.showNextMatchBanner=Z(`showNextMatchBanner`).checked,y.showCardStatusDots=Z(`showCardStatusDots`).checked,y.autoHideTopBar=Z(`autoHideTopBar`).checked,y.autoHideTopBarDelay=Math.min(300,Math.max(1,Number.parseInt(Z(`autoHideTopBarDelay`).value,10)||5)),Z(`autoHideTopBarDelay`).value=y.autoHideTopBarDelay;let t=Z(`testMode`).checked,n=Z(`testDate`).value.trim();return t&&!kr(n)?(W(`Test Mode needs a date like 2026-04-26.`,`error`),!1):(y.testMode=t,y.testDate=t?n:``,L.update({teamNumber:Number.parseInt(y.teamNumber,10)||y.teamNumber}),g(`teamNumber`,y.teamNumber),g(`tbaapikey`,y.tbaapikey),g(`match13apikey`,y.match13apikey),g(`theme`,y.theme),g(`noteAlarmToggle`,y.noteAlarmToggle),g(`noteAlarmSound`,y.noteAlarmSound),g(`matchAlarmToggle`,y.matchAlarmToggle),g(`matchAlertThreshold`,y.matchAlertThreshold),g(`matchAlarmSound`,y.matchAlarmSound),g(`showNextMatchBanner`,y.showNextMatchBanner),g(`showCardStatusDots`,y.showCardStatusDots),g(`autoHideTopBar`,y.autoHideTopBar),g(`autoHideTopBarDelay`,y.autoHideTopBarDelay),g(`autoSwapEnabled`,y.autoSwapEnabled),g(`autoSwapInterval`,y.autoSwapInterval),g(`testMode`,y.testMode),y.testMode?g(`testDate`,y.testDate):_(`testDate`),document.documentElement.setAttribute(`data-theme`,y.theme),ui(),ba(Z(`portraitMode`).value),z.updateConfig(y),y.showCardStatusDots!==e&&H(),Nr(),ma(),!0)}function Aa(){let e=Z(`settingscontainer`),t=Z(`header`),n=Z(`testMode`),r=Z(`testDate`),i=Z(`hideTopBtn`),a=Z(`autoHideTopBar`),o=Z(`autoHideTopBarDelay`),s=null,c=(e=!1)=>{let n=t.classList.contains(`hidden`);if(n&&!e){document.documentElement.style.setProperty(`--header-height`,`0px`);return}n&&t.classList.remove(`hidden`);let r=t.offsetHeight,i=t.querySelector(`.spacer`).getBoundingClientRect(),a=new DOMPoint(i.left+i.width/2,i.top+i.height/2),o=getComputedStyle(document.body).transform,s=o===`none`?a:a.matrixTransform(new DOMMatrix(o).inverse());document.documentElement.style.setProperty(`--hide-top-btn-left`,`${s.x}px`),document.documentElement.style.setProperty(`--hide-top-btn-top`,`${s.y}px`),n&&t.classList.add(`hidden`),document.documentElement.style.setProperty(`--header-height`,n?`0px`:`${r}px`)};c(),`ResizeObserver`in window&&new ResizeObserver(()=>c()).observe(t),window.addEventListener(`resize`,()=>c(!0)),new MutationObserver(()=>c(!0)).observe(document.documentElement,{attributes:!0,attributeFilter:[`class`]});let l=e=>{if(t.classList.contains(`hidden`)===e)return;t.classList.toggle(`hidden`,e);let n=e?`Show Top Bar`:`Hide Top Bar`;i.title=n,i.setAttribute(`aria-label`,n),c()},u=()=>{clearTimeout(s),s=null,y.autoHideTopBar&&!t.classList.contains(`hidden`)&&(s=setTimeout(()=>l(!0),y.autoHideTopBarDelay*1e3))},d=e=>{y.autoHideTopBar&&(e.target instanceof Element&&e.target.closest(`#hideTopBtn`)||(l(!1),u()))};[`pointermove`,`pointerdown`,`keydown`,`wheel`].forEach(e=>{document.addEventListener(e,d,{passive:!0})}),a.addEventListener(`change`,()=>{o.disabled=!a.checked}),n.addEventListener(`change`,()=>{r.style.display=n.checked?`block`:`none`}),Z(`settings`).addEventListener(`click`,()=>{e.style.display=e.style.display===`flex`?`none`:`flex`}),document.addEventListener(`keydown`,t=>{t.key===`Escape`&&e.style.display===`flex`&&!document.querySelector(`.active`)&&(e.style.display=`none`)}),Z(`savebutton`).addEventListener(`click`,()=>{ka()&&(u(),W(`Settings saved.`,`message`),e.style.display=`none`,Xr())}),window.addEventListener(On,()=>{e.style.display=`flex`}),Z(`runWizardBtn`)?.addEventListener(`click`,()=>{e.style.display=`none`,window.dispatchEvent(new CustomEvent(`pitbeacon:run-wizard`))}),Z(`showWelcomeBtn`)?.addEventListener(`click`,()=>{e.style.display=`none`,window.dispatchEvent(new CustomEvent(`pitbeacon:show-welcome`))}),Z(`resetApplicationBtn`)?.addEventListener(`click`,async e=>{if(!confirm(`This permanently clears local storage, saved models, event data, and offline caches for this site. Continue?`))return;let t=e.currentTarget;t.disabled=!0;try{await Ta(),window.location.reload()}catch(e){t.disabled=!1,W(`Application reset was incomplete: ${e.message}`,`error`)}}),i.addEventListener(`click`,()=>{l(!t.classList.contains(`hidden`)),u()}),u(),qi(Z(`customColorsModal`)),Z(`openCustomColorsBtn`)?.addEventListener(`click`,()=>{let e=Z(`customColorsModal`);e.classList.add(`active`),e.setAttribute(`aria-hidden`,`false`),Ki(),e.querySelector(`#customColorVariable`)?.focus()}),Z(`saveProfileBtn`)?.addEventListener(`click`,()=>{let e=Z(`newProfileName`);ii(e.value.trim()||y.activeProfileName||`Default`),e.value=``}),Z(`deleteProfileBtn`)?.addEventListener(`click`,()=>{let e=Z(`profileSelect`).value;e===`Default`?W(`The Default profile can't be deleted.`,`error`):confirm(`Delete profile "${e}"?`)&&(delete y.layoutProfiles[e],g(`layoutProfiles`,JSON.stringify(y.layoutProfiles)),y.activeProfileName===e&&(y.activeProfileName=`Default`,g(`activeProfileName`,`Default`)),si(),W(`Profile "${e}" deleted.`,`message`))}),Z(`profileSelect`)?.addEventListener(`change`,e=>ai(e.target.value)),Z(`errorcontainer`).addEventListener(`click`,e=>{e.target.classList.contains(`error-exit`)&&e.target.parentElement.remove()})}function ja({teamNumber:e=null,tbaKey:t=null,match13Key:n=null}={}){e&&(y.teamNumber=String(e),Z(`teamNumber`).value=y.teamNumber,g(`teamNumber`,y.teamNumber),L.update({teamNumber:Number.parseInt(y.teamNumber,10)})),t&&(y.tbaapikey=t,Z(`tbaapikey`).value=t,g(`tbaapikey`,t)),n!==null&&(y.match13apikey=n,Z(`match13apikey`).value=n,g(`match13apikey`,n)),(e||t||n!==null)&&(z.updateConfig(y),Xr())}var Ma=18e4,Na={fresh:`green`,stale:`yellow`,offline:`red`,failed:`red`,none:`grey`};function Pa({status:e=null,online:t=!0,now:n=Date.now(),staleAfterMs:r=Ma}={}){let i=Number.isFinite(e?.lastUpdate)?e.lastUpdate:null,a=e=>({state:e,color:Na[e],lastUpdate:i});return t===!1?a(`offline`):e?e.source===`cache`?a(`stale`):e.stale?a(`failed`):a(i===null?`none`:n-i>r?`stale`:`fresh`):a(`none`)}var Fa={fresh:`Up to date`,stale:`Data may be out of date`,offline:`Offline`,failed:`Last refresh failed`,none:`No data yet`};function Ia(e,t=La){let n=Fa[e.state];return e.lastUpdate?`${n} · updated ${t(e.lastUpdate)}`:n}function La(e){return new Date(e).toLocaleTimeString(`en-US`,{hour:`numeric`,minute:`2-digit`})}var Ra=`pitbeacon:card-status`,za=`Saved on this device · always available`;function Ba(e,t,n,r){let i=R.get(e),a=V.getCardElement(e)?._cardStatus;if(a)return{...a,tip:Ia(a)};if(i?.statusSource===`local`)return{state:`local`,color:`green`,tip:za};let o=Pa({status:t.dataStatus,online:n,now:r});return{...o,tip:Ia(o)}}function Va(){let e=L.getState(),t=navigator.onLine!==!1,n=Date.now();for(let[r,i]of V.getDots()){let a=Ba(r,e,t,n),o=`${R.get(r)?.label??`Card`}: ${a.tip}`;i.dataset.color!==a.color&&(i.dataset.color=a.color),i.title!==o&&(i.title=o,i.setAttribute(`aria-label`,o))}}function Ha(){L.subscribe((e,t)=>{t.some(e=>e!==`fullDate`)&&Va()}),window.addEventListener(`pitbeacon:layout-rendered`,Va),window.addEventListener(Ra,Va),window.addEventListener(`online`,()=>{Va(),V.updateCards(L.getState())}),window.addEventListener(`offline`,()=>{Va(),V.updateCards(L.getState())}),setInterval(Va,15e3),Va()}var Ua=`pitbeacon:run-wizard`,Wa=`pitbeacon:show-welcome`,Ga=`setupWizardDone`,Ka=`welcomeDismissed2027`,qa=`https://www.thebluealliance.com/api/v3/status`,Ja=[`--accent`,`--accent-hover`,`--border-accent`],Ya=[{name:`Indigo (default)`,values:null},{name:`Blue`,values:[`rgb(30, 90, 200)`,`rgb(50, 110, 220)`,`rgba(30, 90, 200, 0.6)`]},{name:`Green`,values:[`rgb(22, 120, 70)`,`rgb(30, 145, 88)`,`rgba(22, 120, 70, 0.6)`]},{name:`Crimson`,values:[`rgb(150, 30, 45)`,`rgb(180, 45, 62)`,`rgba(150, 30, 45, 0.6)`]},{name:`Amber`,values:[`rgb(170, 105, 10)`,`rgb(200, 128, 20)`,`rgba(170, 105, 10, 0.6)`]},{name:`Violet`,values:[`rgb(100, 50, 160)`,`rgb(122, 70, 190)`,`rgba(100, 50, 160, 0.6)`]}];function Q(e,t={},...n){let r=document.createElement(e);for(let[e,n]of Object.entries(t))e===`class`?r.className=n:e===`text`?r.textContent=n:e.startsWith(`on`)?r.addEventListener(e.slice(2),n):n!==!1&&n!=null&&r.setAttribute(e,n===!0?``:n);return n.forEach(e=>e!=null&&r.append(e)),r}function Xa({labelId:e,className:t,onDismiss:n}){let r=Q(`div`,{class:`pb-dialog-backdrop`}),i=Q(`div`,{class:`pb-dialog ${t}`,role:`dialog`,"aria-modal":`true`,"aria-labelledby":e});r.appendChild(i);let a=document.activeElement,o=()=>{document.removeEventListener(`keydown`,s,!0),r.remove(),a?.focus?.()},s=e=>{e.key===`Escape`&&(e.stopPropagation(),n())};return document.addEventListener(`keydown`,s,!0),document.body.appendChild(r),{dialog:i,close:o}}var Za=[[`Setup wizard`,`Team number, TBA key, robot model and colors in one short flow. Re-run it any time from Settings.`],[`Note Cards`,`Merged all pit notes into one comprehensive card. Integrated with the 3D viewer to pin notes to parts.`],[`Next-match banner`,`A slim strip with your next match, the countdown and your alliance color. It turns urgent near the alert time.`],[`Card status dots`,`A dot in each card's corner shows data freshness. Hover it for the last update time.`],[`New 3D viewer`,`A new 3D Robot Viewer card to import and view your robot model, pin repair notes to parts, and see the robot in different poses. Export your model from CAD as a .glb, .gltf or .urdf file (with its mesh files) and load it in the card. .urdf files have mate connectors imported with them.`],[`Helpful empty cards`,`Cards with no data now say why and what to do next.`]],Qa=!1;function $a(){if(Qa)return;Qa=!0;let e=()=>{g(Ka,`true`),Qa=!1,n()},{dialog:t,close:n}=Xa({labelId:`welcomeTitle`,className:`welcome-card`,onDismiss:e});t.append(Q(`button`,{type:`button`,class:`pb-dialog-x`,"aria-label":`Dismiss`,text:`×`,onclick:e}),Q(`p`,{class:`pb-eyebrow`,text:`PitBeacon`}),Q(`h2`,{id:`welcomeTitle`,class:`pb-dialog-title`,text:`What's new in 2027`}),Q(`ul`,{class:`welcome-list`},...Za.map(([e,t])=>Q(`li`,{},Q(`strong`,{text:e}),Q(`span`,{text:t})))),Q(`p`,{class:`pb-dialog-note`,text:`You can bring this back from Settings > Setup & what's new.`}),Q(`div`,{class:`pb-dialog-actions`},Q(`button`,{type:`button`,class:`pb-btn pb-btn-primary`,text:`Got it`,onclick:e}))),t.querySelector(`.pb-btn-primary`).focus()}function eo(){h(Ka)!==`true`&&$a()}var to=!1;function no(){if(to)return;to=!0;let e={team:h(`teamNumber`,``)||``,key:D(y)?y.tbaapikey:``,match13key:h(`match13apikey`,``)||``,modelFiles:null,modelName:``,accent:0},t=Object.fromEntries(Ja.map(e=>[e,document.documentElement.style.getPropertyValue(e)])),n=0,r=e=>{g(Ga,e),to=!1,o(),eo()},i=()=>{Ja.forEach(e=>{t[e]?document.documentElement.style.setProperty(e,t[e]):document.documentElement.style.removeProperty(e)}),r(`skipped`)},{dialog:a,close:o}=Xa({labelId:`wizardTitle`,className:`setup-wizard`,onDismiss:i}),s=[d,f,p];async function c(){let t=e.team.trim(),n=e.key.trim(),i=e.match13key.trim();if(ja({teamNumber:/^\d{1,5}$/.test(t)?t:null,tbaKey:n||null,match13Key:i}),e.modelFiles)try{await ur(e.modelFiles)}catch(e){console.warn(`Could not save the robot model from setup:`,e)}Hi(),r(`true`)}function l(){let e=[`Your team`,`Robot model`,`Look & feel`][n],t=s[n](),r=n===s.length-1,o=Q(`ol`,{class:`wizard-steps`,"aria-label":`Step ${n+1} of ${s.length}`},...s.map((e,t)=>Q(`li`,{class:t===n?`active`:t<n?`done`:``})));a.replaceChildren(Q(`p`,{class:`pb-eyebrow`,text:`Setup · step ${n+1} of ${s.length}`}),Q(`h2`,{id:`wizardTitle`,class:`pb-dialog-title`,text:e}),o,t,Q(`div`,{class:`pb-dialog-actions`},Q(`button`,{type:`button`,class:`pb-btn pb-btn-link`,text:`Skip setup`,onclick:i}),Q(`span`,{class:`pb-spacer`}),n>0?Q(`button`,{type:`button`,class:`pb-btn`,text:`Back`,onclick:()=>{--n,l()}}):null,Q(`button`,{type:`button`,class:`pb-btn pb-btn-primary`,"data-wizard-next":``,text:r?`Finish`:`Next`,onclick:()=>r?c():(n+=1,l())}))),(a.querySelector(`input:not([type=file])`)||a.querySelector(`[data-wizard-next]`))?.focus()}function u(e,t,n){return Q(`label`,{class:`wizard-field`},Q(`span`,{text:e}),t,n?Q(`small`,{text:n}):null)}function d(){let t=Q(`input`,{type:`text`,inputmode:`numeric`,maxlength:`5`,placeholder:`e.g. 7250`,value:e.team,autocomplete:`off`}),n=Q(`input`,{type:`password`,placeholder:`Paste your TBA read key`,value:e.key,autocomplete:`off`}),r=Q(`input`,{type:`password`,placeholder:`Paste your Match13 read key`,value:e.match13key,autocomplete:`off`}),i=Q(`p`,{class:`wizard-result`,role:`status`,"aria-live":`polite`}),a=Q(`p`,{class:`wizard-result`,role:`status`,"aria-live":`polite`});t.addEventListener(`input`,()=>{e.team=t.value,a.textContent=``}),n.addEventListener(`input`,()=>{e.key=n.value,i.textContent=``}),r.addEventListener(`input`,()=>{e.match13key=r.value,a.textContent=``});let o=Q(`button`,{type:`button`,class:`pb-btn`,text:`Test TBA key`});o.addEventListener(`click`,async()=>{let e=n.value.trim();if(i.dataset.ok=`false`,!D({tbaapikey:e}))i.textContent=`Paste a key first.`;else{i.textContent=`Checking…`;try{let t=await fetch(qa,{headers:{"X-TBA-Auth-Key":e}});i.dataset.ok=String(t.ok),i.textContent=t.ok?`Key works.`:t.status===401?`TBA rejected that key. Check that it was copied completely.`:`TBA answered with HTTP ${t.status}.`}catch{i.textContent=`Couldn't reach TBA. You can still continue and check later.`}}});let s=Q(`button`,{type:`button`,class:`pb-btn`,text:`Test Match13 key`});return s.addEventListener(`click`,async()=>{let e=r.value.trim().replace(/^Bearer\s+/i,``);if(a.dataset.ok=`false`,!e){a.textContent=`Paste a key first.`;return}if(!e.startsWith(`m13_live_`)){a.textContent=`Match13 keys should start with m13_live_. Check that the complete key was copied.`;return}let n=t.value.trim();if(!/^\d{1,5}$/.test(n)){a.textContent=`Enter a valid team number to test this key.`;return}let i=String(y.match13ProxyUrl||``).trim().replace(/\/+$/,``);if(!i){a.textContent=`PitBeacon's Match13 proxy is not configured. You can still continue and check later.`;return}let o=Ar(y).getFullYear();a.textContent=`Checking…`;try{let t=await fetch(`${i}/v1/teams/${n}/years/${o}`,{headers:{Authorization:`Bearer ${e}`}});a.dataset.ok=String(t.ok),t.ok?a.textContent=`Key works.`:t.status===401||t.status===403?a.textContent=`Match13 rejected that key. Check that it was copied completely.`:t.status===404?a.textContent=`Match13 returned no data for this team and season. Check the team number and season.`:a.textContent=`Match13 answered with HTTP ${t.status}.`}catch{a.textContent=`Couldn't reach Match13 through PitBeacon's proxy. You can still continue and check later.`}}),Q(`div`,{class:`wizard-body`},Q(`p`,{class:`wizard-lead`,text:`PitBeacon pulls your matches and rankings from The Blue Alliance.`}),u(`Team number`,t),u(`TBA read API key`,n,`Create one at thebluealliance.com/account under Read API Keys. Stored only in this browser.`),u(`Match13 read API key`,r,`Optional (for stats card). Create one at match13.com/account under Read API Keys. Stored only in the browser, goes through a Cloudflare worker.`),Q(`div`,{class:`wizard-inline`},o,i),Q(`div`,{class:`wizard-inline`},s,a))}function f(){let t=Q(`p`,{class:`wizard-result`,role:`status`,"aria-live":`polite`,text:e.modelName?`Ready: ${e.modelName}`:``});t.dataset.ok=e.modelName?`true`:``;let n=async n=>{let r=Array.from(n.files||[]);r.some(e=>sr.test(e.name))?(e.modelFiles=await dr(r),e.modelName=r.find(e=>sr.test(e.name)).name,t.dataset.ok=`true`,t.textContent=`Ready: ${e.modelName} (loads when you finish)`):(t.dataset.ok=`false`,t.textContent=`Choose a .urdf, .glb or .gltf file.`)},r=Q(`input`,{type:`file`,multiple:!0,accept:`.urdf,.glb,.gltf,.stl,.obj,.dae,.bin,.png,.jpg,.jpeg,.webp`,class:`wizard-file`}),i=Q(`input`,{type:`file`,multiple:!0,webkitdirectory:!0,class:`wizard-file`});return r.addEventListener(`change`,()=>n(r)),i.addEventListener(`change`,()=>n(i)),Q(`div`,{class:`wizard-body`},Q(`p`,{class:`wizard-lead`,text:`Optional. Add your robot's CAD export to see it in 3D and pin repair notes to individual parts.`}),u(`Model file (.glb, .gltf or .urdf)`,r,`A URDF needs its mesh files too: pick them together, or choose the whole export folder below.`),u(`Or a whole URDF export folder`,i),t,Q(`p`,{class:`wizard-skip-note`,text:`No model yet? Just press Next. You can load one in the 3D Robot Viewer card any time.`}))}function p(){let t=Q(`div`,{class:`wizard-swatches`,role:`radiogroup`,"aria-label":`Accent color`}),n=n=>{e.accent=n;let r=Ya[n].values;Ja.forEach((e,t)=>{r?document.documentElement.style.setProperty(e,r[t]):document.documentElement.style.removeProperty(e)}),t.querySelectorAll(`button`).forEach((e,t)=>e.setAttribute(`aria-checked`,String(t===n)))};return Ya.forEach((r,i)=>{let a=Q(`button`,{type:`button`,role:`radio`,class:`wizard-swatch`,"aria-checked":String(i===e.accent),title:r.name,"aria-label":r.name});a.style.background=r.values?r.values[0]:`rgb(47, 48, 112)`,a.addEventListener(`click`,()=>n(i)),t.appendChild(a)}),Q(`div`,{class:`wizard-body`},Q(`p`,{class:`wizard-lead`,text:`Optional. Pick an accent color; the dark theme stays. More colors are in Settings > Appearance.`}),t,Q(`p`,{class:`wizard-skip-note`,text:`That's everything. Finish saves your choices.`}))}l()}function ro(){window.addEventListener(Ua,no),window.addEventListener(Wa,$a);let e=h(Ga);!e&&!D(y)?no():(e||g(Ga,`true`),eo())}function io(e,t){try{localStorage.setItem(e,t)}catch{}}var $=!1,ao=null,oo=null,so=null,co=null,lo=null;function uo(){try{$=localStorage.getItem(`easterEggsEnabled`)===`true`}catch{$=!1}return $}function fo(){yo(!$)}function po(){let e=document.querySelector(`.logo-img`);e&&(e.classList.toggle(`easter-eggs-enabled`,$),e.setAttribute(`aria-pressed`,String($)),e.title=`${$?`Disable`:`Enable`} Easter eggs`)}function mo(){if(!$)return;clearTimeout(ao);let e=3e3+Math.random()*370;ao=setTimeout(ho,e)}function ho(){if(ao=null,!$)return;if(so?.classList.contains(`walking`)){mo();return}let t=document.getElementById(`container`),n=Array.from(t.querySelectorAll(`.card-container`)).filter(e=>e.isConnected&&e.getClientRects().length>0);if(!n.length){mo();return}vo();let r=n[Math.floor(Math.random()*n.length)],i=document.createElement(`div`);i.className=`easter-egg-duck`,i.setAttribute(`role`,`button`),i.setAttribute(`tabindex`,`0`),i.setAttribute(`aria-label`,`Make the duck walk`),i.innerHTML=e(`duck`,40),i.addEventListener(`click`,e=>{e.stopPropagation(),go(i)}),i.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),go(i))});let a=r.getBoundingClientRect(),o=t.getBoundingClientRect();i.style.right=`${a.right-o.left-Math.random()*100+t.scrollLeft}px`,i.style.bottom=`${a.bottom-o.top-Math.random()*100+t.scrollTop}px`,t.appendChild(i),so=i,requestAnimationFrame(()=>i.classList.add(`visible`)),oo=setTimeout(()=>{i.classList.contains(`walking`)||(i.classList.remove(`visible`),setTimeout(()=>{i.classList.contains(`walking`)||(i.remove(),so===i&&(so=null))},350))},5e3),mo()}function go(e){if(!$||e.classList.contains(`walking`))return;clearTimeout(oo);let t=e.getBoundingClientRect();e.classList.add(`walking`),e.style.left=`${Math.max(0,Math.min(window.innerWidth-48,t.left))}px`,e.style.bottom=`0px`,e.style.right=`auto`,e.style.top=`auto`,e.style.setProperty(`--duck-direction`,`1`),document.body.appendChild(e);let n=1,r=0,i=t=>{if(e.isConnected&&e.classList.contains(`walking`)){if(r){let i=Math.min(t-r,50),a=parseFloat(e.style.left)+n*i*.08;(a<=0||a>=window.innerWidth-48)&&(n*=-1,e.style.setProperty(`--duck-direction`,String(n*-1)),a=Math.max(0,Math.min(window.innerWidth-48,a))),e.style.left=`${a}px`}r=t,co=requestAnimationFrame(i)}};co=requestAnimationFrame(i),_o(e)}function _o(e){clearTimeout(lo),$&&e.classList.contains(`walking`)&&(lo=setTimeout(()=>{$&&e.classList.contains(`walking`)&&(e.classList.remove(`jumping`),e.offsetWidth,e.classList.add(`jumping`),setTimeout(()=>e.classList.remove(`jumping`),1e3),_o(e))},2e3+Math.random()*4e3))}function vo({poof:e=!1}={}){let t=so;if(so=null,cancelAnimationFrame(co),co=null,clearTimeout(lo),lo=null,t){if(e){let e=t.getBoundingClientRect();t.classList.remove(`walking`,`jumping`,`visible`),t.style.position=`fixed`,t.style.left=`${e.left}px`,t.style.top=`${e.top}px`,t.style.right=`auto`,t.style.bottom=`auto`,t.style.opacity=`1`,t.style.transform=`none`,document.body.appendChild(t),t.classList.add(`duck-poof`),setTimeout(()=>t.remove(),700)}else t.remove()}}function yo(e){$=e,io(`easterEggsEnabled`,String(e)),po(),clearTimeout(ao),clearTimeout(oo),vo({poof:!e}),e&&mo()}var bo=`false`,xo=`false`,So=bo===`true`,Co=xo===`true`;function wo(e={}){let{immediate:t=!1,onNeedReload:n,onNeedRefresh:r,onOfflineReady:i,onRegistered:a,onRegisteredSW:o,onRegisterError:s}=e,c,l,u,d=async(e=!0)=>{await l,So||u?.()};async function f(){if(`serviceWorker`in navigator){if(c=await ce(async()=>{let{Workbox:e}=await import(`./workbox-window.prod.es5-Bd17z0YL.js`);return{Workbox:e}},[],import.meta.url).then(({Workbox:e})=>new e(`./sw.js`,{scope:`./`,type:`classic`})).catch(e=>{s?.(e)}),!c)return;if(u=()=>{c?.messageSkipWaiting()},!Co){if(So)c.addEventListener(`activated`,e=>{(e.isUpdate||e.isExternal)&&(n?n():window.location.reload())}),c.addEventListener(`installed`,e=>{e.isUpdate||i?.()});else{let e=!1,t=()=>{e=!0,c?.addEventListener(`controlling`,e=>{e.isUpdate&&(n?n():window.location.reload())}),r?.()};c.addEventListener(`installed`,n=>{n.isUpdate===void 0?n.isExternal===void 0?!e&&i?.():n.isExternal?t():!e&&i?.():n.isUpdate||i?.()}),c.addEventListener(`waiting`,t)}}c.register({immediate:t}).then(e=>{o?o(`./sw.js`,e):a?.(e)}).catch(e=>{s?.(e)})}}return l=f(),d}var To=e=>document.getElementById(e),Eo=!1,Do=null;function Oo(){if(To(`updateBanner`))return;let e=document.createElement(`div`);e.className=`update-banner`,e.id=`updateBanner`,e.setAttribute(`role`,`status`);let t=document.createElement(`span`);t.textContent=`A new version of PitBeacon is ready.`;let n=document.createElement(`button`);n.type=`button`,n.className=`savebutton`,n.style.margin=`0`,n.textContent=`Reload`,n.addEventListener(`click`,()=>Do?.(!0));let r=document.createElement(`button`);r.type=`button`,r.className=`savebutton`,r.style.cssText=`margin:0;background:transparent;border:1px solid var(--border)`,r.textContent=`Later`,r.addEventListener(`click`,()=>e.remove()),e.append(t,n,r),document.body.appendChild(e)}function ko(){`serviceWorker`in navigator&&(Do=wo({onNeedRefresh:Oo,onOfflineReady(){Eo=!0,jo()},onRegisteredSW(){Eo=!0,jo()}}))}function Ao(){return new Promise(e=>{if(!window.indexedDB)return e(!1);let t=indexedDB.open(`pitbeacon-robot-viewer-v2`,1);t.onupgradeneeded=()=>{t.result.createObjectStore(`models`),t.result.createObjectStore(`libs`)},t.onerror=()=>e(!1),t.onsuccess=()=>{let n=t.result;try{let t=n.transaction(`models`,`readonly`).objectStore(`models`).get(`last`);t.onsuccess=()=>{n.close(),e(!!t.result?.files?.length)},t.onerror=()=>{n.close(),e(!1)}}catch{n.close(),e(!1)}}})}async function jo(){let e=To(`offlineReady`);if(!e)return;let t=!!navigator.serviceWorker?.controller,[n,r]=await Promise.all([Gr(y.teamNumber).catch(()=>null),Ao()]),i=[{ok:t,text:t?`App saved on this device`:Eo?`App is being saved. Reload once to finish.`:`App not saved yet (needs a normal https page load)`},{ok:!!n,text:n?`Latest event data saved`:`No event data saved yet (appears after the first update)`},{ok:r,text:r?`Robot model saved`:`No robot model loaded (optional)`}];e.replaceChildren(...i.map(e=>{let t=document.createElement(`li`);return t.dataset.ok=String(e.ok),t.textContent=e.text,t}));let a=To(`offlineStorage`);if(a&&navigator.storage?.estimate)try{let{usage:e=0,quota:t=0}=await navigator.storage.estimate(),n=await navigator.storage.persisted?.()?` Protected from automatic cleanup.`:``;a.textContent=`Using ${(e/1048576).toFixed(1)} MB of ${(t/1048576).toFixed(0)} MB.${n}`}catch{a.textContent=``}}async function Mo(){try{await navigator.storage?.persist?.()}catch{}}function No(){jo(),To(`settings`)?.addEventListener(`click`,jo),window.addEventListener(`online`,jo),navigator.serviceWorker?.addEventListener(`controllerchange`,jo)}ar(),window.pitbeaconGlobal=Cn,R.register(`webcast-card`,Nn()),R.register(`match-card`,Pn()),R.register(`leaderboard-card`,zn()),R.register(`pit-notes-card`,nr()),R.register(`robot-viewer-card`,Sr()),R.register(`stats-card`,Or()),R.register(`__fallback__`,En);function Po(){let e=document.getElementById(`version`);e&&(e.textContent=`Version 26.11.27`);let t=document.querySelector(`.logo-img`);t?.addEventListener(`click`,fo),t?.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),fo())}),document.getElementById(`cardsBtn`)?.addEventListener(`click`,()=>Li()),document.getElementById(`layoutEditorBtn`)?.addEventListener(`click`,Ji)}function Fo(){let e=uo();Oa(),Aa(),Po(),xa(),po(),Vi(),ni(),No(),ei(),ha(),H(),Ha(),ui(),e&&mo(),Pr(),Zr().finally($r),ko(),Mo(),ro()}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,Fo):Fo(),window.__PITBEACON_DEBUG={config:y,stateManager:L,registry:R,dataSources:z,renderer:V,devCardRuntime:wn};