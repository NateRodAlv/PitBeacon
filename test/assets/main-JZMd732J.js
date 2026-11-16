const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./codemirror-Cb9nMA79.js","./rolldown-runtime-XKyaHtl9.js","./codemirror-DQxhl3h3.css"])))=>i.map(i=>d[i]);
import{_ as e,a as t,b as n,c as r,d as i,f as a,g as o,h as s,l as c,n as l,o as u,p as d,r as f,t as p,u as m,v as h,y as g}from"./robotParts-Jpkix48K.js";var _={"webcast-card":{x:0,y:0,width:1,height:1},"stats-card":{x:0,y:1,width:1,height:1},"pit-notes-card":{x:0,y:2,width:1,height:1},"robot-viewer-card":{x:1,y:0,width:1,height:2},"leaderboard-card":{x:1,y:2,width:1,height:1},"match-card":{x:2,y:0,width:1,height:3}},v={teamNumber:7250,tbaapikey:`YOUR_AUTH_KEY`,match13apikey:``,match13ProxyUrl:`https://pitbeacon.rodriguezalvaradonathan.workers.dev`,seasonYearOverride:``,noteAlarmToggle:!1,noteAlarmThreshold:8,noteAlarmSound:`alarm1`,matchAlarmToggle:!0,matchAlertThreshold:300,matchAlarmSound:`alarm1`,gridSize:3,gridCols:3,gridRows:3,hiddenSections:[],layout:structuredClone(_),activeProfileName:`Default`,layoutProfiles:{},autoSwapEnabled:!1,autoSwapInterval:30,supabaseUrl:`https://mbojqtezmtngsehtyzpa.supabase.co`,supabaseAnonKey:`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ib2pxdGV6bXRuZ3NlaHR5enBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzcxNjAsImV4cCI6MjEwMzk1MzE2MH0.5PArCN5Nz9Aubc2t5iPas4qlo9oLDWxyJ8tMC_e7h90`,cardSubmitFunctionUrl:`https://mbojqtezmtngsehtyzpa.supabase.co/functions/v1/index`,defaultCards:[{id:`webcast-card`,label:`Webcasts`,icon:`device-tv`,lockedAspect:16/11,selfRefresh:!1,builtin:!0},{id:`match-card`,label:`Matches`,icon:`tournament`,selfRefresh:!1,builtin:!0},{id:`leaderboard-card`,label:`Leaderboard`,icon:`trophy`,selfRefresh:!1,builtin:!0},{id:`pit-notes-card`,label:`Pit Notes`,icon:`tool`,selfRefresh:!1,builtin:!0},{id:`robot-viewer-card`,label:`3D Robot Viewer`,icon:`cube`,selfRefresh:!0,builtin:!0},{id:`stats-card`,label:`Team Stats`,icon:`chart-bar`,selfRefresh:!1,builtin:!0}],developerCards:{}},y=class{constructor(e={}){this._state={...e},this._listeners=[]}getState(){return{...this._state}}update(e){let t=[];for(let[n,r]of Object.entries(e))JSON.stringify(this._state[n])!==JSON.stringify(r)&&(this._state[n]=r,t.push(n));if(t.length>0){let e=this.getState();this._listeners.forEach(n=>n(e,t))}return this}subscribe(e){return this._listeners.push(e),()=>{let t=this._listeners.indexOf(e);t>=0&&this._listeners.splice(t,1)}}reset(){return this._state={},this._listeners=[],this}},ee=class e{static _fetchCache=new Map;static _inFlight=new Map;constructor(e,t,n,r,i=null){this._state=e,this._dataSources=t,this._audioFiles=n,this._config=r,this._cardId=i,this._listeners=[],this._storage=this._buildStorage()}getState(){return this._state.getState()}onStateChange(e){return this._state.subscribe(e)}async fetchDataSource(e){return this._dataSources.fetch(e)}getDataSourceNames(){return this._dataSources.getSourceNames()}getCardSettings(e,t={}){try{let n=JSON.parse(localStorage.getItem(`cardSettings`)||`{}`);return{...t,...n[e]||{}}}catch(n){return console.warn(`Failed to load settings for card "${e}":`,n),t}}async refreshTeamData(){return typeof window.pitbeaconRefreshTeamData==`function`?window.pitbeaconRefreshTeamData():null}updateCard(e,t,n=null,r=null){e.selfRefresh=!0,!e||typeof t!=`number`||t<=0||e._cardTimer&&e._cardTimerInterval===t&&e._cardRefreshCallback===n&&e._cardCompareFn===r||(e._cardTimer&&clearInterval(e._cardTimer),e._cardTimerInterval=t,e._cardRefreshCallback=n,e._cardCompareFn=r,e._cardTimer=setInterval(()=>{if(!e.isConnected)return;let t=this.getState();if(t)try{let i=r?r(t,this):t,a=JSON.stringify(i);if(e._lastCardSnapshot===a)return;e._lastCardSnapshot=a,typeof n==`function`?n(e,t,this):window._pitbeaconRender?window._pitbeaconRender():e.innerHTML=``}catch(e){console.error(`Card refresh failed:`,e)}},t))}async fetchCustom(t,n={}){let{method:r=`GET`,headers:i={},body:a=null,timeoutMs:o=8e3,cacheSeconds:s=0,parse:c=null}=n,l=e._buildFetchCacheKey(r,t,a);if(s>0){let t=e._fetchCache.get(l);if(t&&(Date.now()-t.timestamp)/1e3<s)return t.result}if(e._inFlight.has(l))return e._inFlight.get(l);let u=this._performFetch(t,{method:r,headers:i,body:a,timeoutMs:o,parse:c},l,s);e._inFlight.set(l,u);try{return await u}finally{e._inFlight.delete(l)}}async _performFetch(t,{method:n,headers:r,body:i,timeoutMs:a,parse:o},s,c){let l=new AbortController,u=setTimeout(()=>l.abort(),a),d;try{let e=await fetch(t,{method:n,headers:r,body:n===`GET`||n===`HEAD`?void 0:i,signal:l.signal}),a=await e.text();if(!e.ok)d={ok:!1,data:null,error:`HTTP ${e.status}`,status:e.status};else try{d={ok:!0,data:o?o(a):a?JSON.parse(a):null,error:null,status:e.status}}catch(t){d={ok:!1,data:null,error:`Parse error: ${t.message}`,status:e.status}}}catch(e){d={ok:!1,data:null,error:e.name===`AbortError`?`Request timed out after ${a}ms`:e.message||`Network error`,status:null}}finally{clearTimeout(u)}return c>0&&d.ok&&e._fetchCache.set(s,{timestamp:Date.now(),result:d}),d}static _buildFetchCacheKey(e,t,n){return`${e}::${t}::${n||``}`}triggerAlarm(e){let t={match:this._config.matchAlarmSound||`alarm1`,note:this._config.noteAlarmSound||`alarm1`}[e]||e||`alarm1`;this._audioFiles[t]||(console.warn(`triggerAlarm: unknown sound "${t}", falling back to alarm1`),t=`alarm1`);let n=this._audioFiles[t];return n&&(n.currentTime=0,n.play().catch(e=>console.warn(`Audio play failed:`,e))),this}getAlarmSounds(){return Object.keys(this._audioFiles)}notify(e,t=`message`){return window._pitbeaconNotify?window._pitbeaconNotify(e,t):console.log(`[${t}] ${e}`),this}get storage(){return this._storage}storageFor(e){return e?(this._scopedStorage??=new Map,this._scopedStorage.has(e)||this._scopedStorage.set(e,this._buildStorage(e)),this._scopedStorage.get(e)):this._storage}_buildStorage(e=this._cardId){let t=`pitbeaconCardStorage:${e||`global`}:`;return{get:n=>{try{let r=window.localStorage.getItem(t+n);if(r===null&&e){let e=window.localStorage.getItem(`pitbeaconCardStorage:global:`+n);e!==null&&(window.localStorage.setItem(t+n,e),r=e)}return r===null?null:JSON.parse(r)}catch(e){return console.warn(`sdk.storage.get failed:`,e),null}},set:(e,n)=>{try{return window.localStorage.setItem(t+e,JSON.stringify(n)),!0}catch(e){return console.warn(`sdk.storage.set failed:`,e),!1}},delete:e=>{try{return window.localStorage.removeItem(t+e),!0}catch(e){return console.warn(`sdk.storage.delete failed:`,e),!1}}}}getConfig(e){let t=[`teamNumber`,`match13apikey`,`match13ProxyUrl`,`matchAlarmSound`,`noteAlarmSound`,`noteAlarmToggle`,`eventName`];if(e===void 0){let e={};for(let n of t.filter(e=>e!==`match13apikey`))n in this._config&&(e[n]=this._config[n]);return e}return t.includes(e)?this._config[e]:null}},b=new URL(`alarm1-V4sBKpwn.mp3`,import.meta.url).href,x=new URL(`alarm2-BkbZr_pM.mp3`,import.meta.url).href,S=new URL(`alarm3-DsESxpda.mp3`,import.meta.url).href,te=new URL(`beep-COkWJPT7.mp3`,import.meta.url).href,C={alarm1:new Audio(b),alarm2:new Audio(x),alarm3:new Audio(S),beep:new Audio(te)};Object.values(C).forEach(e=>{e.onerror=()=>console.warn(`Audio file failed to load`)});var ne=class{constructor(){this._cards=new Map,this._listeners=[]}register(e,t){return this._cards.has(e)&&!t.allowOverride?(console.warn(`Card "${e}" already registered. Use allowOverride to replace.`),this):(this._cards.set(e,t),this._notify(`register`,e),this)}unregister(e){if(this._cards.has(e)){let t=this._cards.get(e);if(t.builtin&&!t.allowUnregister)return console.warn(`Cannot unregister built-in card "${e}"`),this;this._cards.delete(e),this._notify(`unregister`,e)}return this}get(e){return this._cards.get(e)||null}has(e){return this._cards.has(e)}listCards(){return Array.from(this._cards.keys())}listBuiltin(){return Array.from(this._cards.entries()).filter(([e,t])=>t.builtin).map(([e,t])=>e)}listDeveloper(){return Array.from(this._cards.entries()).filter(([e,t])=>t.developer).map(([e,t])=>e)}getDefinitions(){let e={};for(let[t,n]of this._cards)e[t]={...n};return e}subscribe(e){return this._listeners.push(e),()=>{let t=this._listeners.indexOf(e);t>=0&&this._listeners.splice(t,1)}}_notify(e,t){let n=this._cards.get(t);this._listeners.forEach(r=>r(e,t,n))}},re=class{constructor(e){this._registry=e}validate(e,t=3,n=3){let r=[],i=[],a=[];for(let[o,s]of Object.entries(e))if(this._validatePosition(s,t,n)||r.push(`Card "${o}" has invalid position (${s.x},${s.y}) ${s.width}×${s.height}`),!this._registry.has(o)){i.push(`Card "${o}" not found in registry`);let t=`__fallback_${o}`;e[t]={...s},delete e[o],a.push({originalId:o,replacementId:t,position:s})}let o=this._findOverlaps(e);o.length>0&&i.push(`Overlapping cards: ${o.join(`, `)}`);for(let e of a)this._registry.has(e.replacementId)||this._registry.register(e.replacementId,{id:e.replacementId,label:`⚠ Missing: ${e.originalId}`,icon:`alert-circle`,builtin:!1,fallback:!0,render:(t,n,r)=>{t.innerHTML=`
                            <div class="fallback-card">
                                <div class="fallback-icon">⚠</div>
                                <div class="fallback-title">Missing Card</div>
                                <div class="fallback-id">${e.originalId}</div>
                                <div class="fallback-hint">This card was not found in the registry.</div>
                                <div class="fallback-actions">
                                    <button class="fallback-remove" data-card="${e.replacementId}">Remove from layout</button>
                                </div>
                            </div>
                        `;let i=t.querySelector(`.fallback-remove`);i&&i.addEventListener(`click`,()=>{let t=r.getConfig().layout||{};delete t[e.replacementId],localStorage.setItem(`layout`,JSON.stringify(t)),window._pitbeaconRender&&window._pitbeaconRender()})}});return{valid:r.length===0,errors:r,warnings:i,fallbackInjections:a,layout:{...e}}}_validatePosition(e,t,n){let{x:r,y:i,width:a,height:o}=e;return!(r<0||i<0||a<1||o<1||r+a>t||i+o>n)}_findOverlaps(e){let t=[],n=Object.keys(e);for(let r=0;r<n.length;r++)for(let i=r+1;i<n.length;i++)this._rectsOverlap(e[n[r]],e[n[i]])&&t.push(`${n[r]} ↔ ${n[i]}`);return t}_rectsOverlap(e,t){return e.x<t.x+t.width&&e.x+e.width>t.x&&e.y<t.y+t.height&&e.y+e.height>t.y}},ie=`modulepreload`,ae=function(e,t){return new URL(e,t).href},oe={},se=function(e){return e.pathname.endsWith(`.css`)},ce=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},le=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=ae(t,n);let r=s(t),i=se(r);return ce(oe,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:ie,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{let i=a=>{t.removeEventListener(`load`,i),t.removeEventListener(`error`,i),a.type===`error`?n(Error(`Unable to preload CSS for ${r}`)):e(a)};t.addEventListener(`load`,i),t.addEventListener(`error`,i)})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},ue=class{constructor(e,t){this._registry=e,this._sdk=t,this._sandboxes=new Map,this._editorState={id:`dev-card-1`,label:`My Custom Card`,html:`<div class="dev-card-content">
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
</html>`,d=new Blob([u],{type:`text/html`}),f=URL.createObjectURL(d);s.src=f;let p=n=>{if(n.source===s.contentWindow)switch(n.data.type){case`getState`:{let e=i.getState();s.contentWindow.postMessage({type:`stateUpdate`,state:e},`*`);break}case`fetchDataSource`:i.fetchDataSource(n.data.name).then(e=>{s.contentWindow.postMessage({type:`fetchResponse`,id:n.data.id,data:e},`*`)}).catch(e=>{s.contentWindow.postMessage({type:`fetchResponse`,id:n.data.id,error:e.message},`*`)});break;case`markSelfRefresh`:e.selfRefresh=!0;break;case`triggerAlarm`:i.triggerAlarm(n.data.nameOrPreset);break;case`notify`:i.notify(n.data.message,n.data.notificationType);break;case`getDataSourceNames`:{let e=i.getDataSourceNames();s.contentWindow.postMessage({type:`getDataSourceNamesResponse`,id:n.data.id,names:e},`*`);break}case`getAlarmSounds`:{let e=i.getAlarmSounds();s.contentWindow.postMessage({type:`getAlarmSoundsResponse`,id:n.data.id,sounds:e},`*`);break}case`getConfig`:{let e=i.getConfig();s.contentWindow.postMessage({type:`getConfigResponse`,id:n.data.id,config:e},`*`);break}case`storageGet`:{let e=i.storageFor(t).get(n.data.key);s.contentWindow.postMessage({type:`storageGetResponse`,id:n.data.id,value:e},`*`);break}case`storageSet`:{let e=i.storageFor(t).set(n.data.key,n.data.value);s.contentWindow.postMessage({type:`storageSetResponse`,id:n.data.id,success:e},`*`);break}case`storageDelete`:{let e=i.storageFor(t).delete(n.data.key);s.contentWindow.postMessage({type:`storageDeleteResponse`,id:n.data.id,success:e},`*`);break}case`fetchCustom`:{let e=null;if(n.data.parseSource)try{e=Function(`return (`+n.data.parseSource+`)`)()}catch(e){s.contentWindow.postMessage({type:`fetchCustomResponse`,id:n.data.id,result:{ok:!1,data:null,error:`Invalid parse function: ${e.message}`,status:null}},`*`);break}i.fetchCustom(n.data.url,{method:n.data.method,headers:n.data.headers,body:n.data.body,timeoutMs:n.data.timeoutMs,cacheSeconds:n.data.cacheSeconds,parse:e}).then(e=>{s.contentWindow.postMessage({type:`fetchCustomResponse`,id:n.data.id,result:e},`*`)});break}}};window.addEventListener(`message`,p);let m=new MutationObserver(()=>{document.contains(e)||h()});m.observe(document.body,{childList:!0,subtree:!0});let h=()=>{URL.revokeObjectURL(f),window.removeEventListener(`message`,p),m.disconnect(),this._sandboxes.delete(t)};e._cleanup=h,this._sandboxes.set(t,{element:e,iframe:s,defSignature:a,cleanup:h})}_loadCodeMirrorAssets(){return this._cmAssetsPromise||=le(()=>import(`./codemirror-Cb9nMA79.js`).then(()=>!!window.CodeMirror),__vite__mapDeps([0,1,2]),import.meta.url).catch(()=>!1),this._cmAssetsPromise}async _makeCodeEditor(e,t){if(!e||e._ideEnhanced)return;e._ideEnhanced=!0;let n;try{n=await this._loadCodeMirrorAssets()}catch{n=!1}n&&window.CodeMirror?this._attachCodeMirror(e,t):this._attachFallbackEditor(e)}_attachCodeMirror(e,t){let n=()=>e.closest(`.dev-card-shell`),r=window.CodeMirror.fromTextArea(e,{mode:t,theme:`dracula`,lineNumbers:!0,indentUnit:2,tabSize:2,autoCloseBrackets:!0,matchBrackets:!0,viewportMargin:1/0,extraKeys:{"Cmd-S":()=>n()?.querySelector(`#devCardSave`)?.click(),"Ctrl-S":()=>n()?.querySelector(`#devCardSave`)?.click(),"Cmd-Enter":()=>n()?.querySelector(`#devCardTest`)?.click(),"Ctrl-Enter":()=>n()?.querySelector(`#devCardTest`)?.click()}});r.on(`change`,()=>{r.save(),e.dispatchEvent(new Event(`input`,{bubbles:!0}))}),e._cm=r}_attachFallbackEditor(e){let t={"(":`)`,"[":`]`,"{":`}`,'"':`"`,"'":`'`},n=new Set(Object.values(t)),r=(e,t)=>e.lastIndexOf(`
`,t-1)+1,i=e=>(e.match(/^[ \t]*/)||[``])[0];e.addEventListener(`keydown`,a=>{let{value:o,selectionStart:s,selectionEnd:c}=e,l=(a.metaKey||a.ctrlKey)&&a.key===`s`,u=(a.metaKey||a.ctrlKey)&&a.key===`Enter`;if(l)a.preventDefault(),e.closest(`.dev-card-shell`)?.querySelector(`#devCardSave`)?.click();else if(u)a.preventDefault(),e.closest(`.dev-card-shell`)?.querySelector(`#devCardTest`)?.click();else if(a.key===`Tab`){a.preventDefault();let t=r(o,s);if(s===c&&!a.shiftKey)e.value=o.slice(0,s)+`  `+o.slice(c),e.selectionStart=e.selectionEnd=s+2;else{let n=c,r=o.slice(t,n).split(`
`).map(e=>a.shiftKey?e.replace(/^ {1,2}/,``):`  `+e).join(`
`);e.value=o.slice(0,t)+r+o.slice(n);let i=r.length-(n-t);e.selectionStart=t===s?s:s+(a.shiftKey?-2:2),e.selectionEnd=n+i}e.dispatchEvent(new Event(`input`,{bubbles:!0}))}else if(a.key===`Enter`){let t=r(o,s),l=o.slice(t,s),u=i(l),d=l.trim(),f=/[{[(]$/.test(d),p=o[s],m=f&&n.has(p);a.preventDefault();let h=`
`+(f?u+`  `:u),g=s+h.length;m&&(h+=`
`+u),e.value=o.slice(0,s)+h+o.slice(c),e.selectionStart=e.selectionEnd=g,e.dispatchEvent(new Event(`input`,{bubbles:!0}))}else if(t[a.key]&&s===c){a.preventDefault();let n=t[a.key];e.value=o.slice(0,s)+a.key+n+o.slice(c),e.selectionStart=e.selectionEnd=s+1,e.dispatchEvent(new Event(`input`,{bubbles:!0}))}else if(n.has(a.key)&&s===c&&o[s]===a.key)a.preventDefault(),e.selectionStart=e.selectionEnd=s+1;else if(a.key===`Backspace`&&s===c&&s>0){let n=o[s-1],r=o[s];t[n]===r&&(a.preventDefault(),e.value=o.slice(0,s-1)+o.slice(s+1),e.selectionStart=e.selectionEnd=s-1,e.dispatchEvent(new Event(`input`,{bubbles:!0})))}}),e.spellcheck=!1,e.style.tabSize=`2`,e.style.fontFamily=`'Fira Code', 'Consolas', monospace`,e.style.whiteSpace=`pre`}_getEditorValue(e){return e._cm?e._cm.getValue():e.value}_setEditorValue(e,t){e._cm?e._cm.setValue(t||``):e.value=t||``}initEditor(e){let t=e.querySelector(`.dev-card-shell`),n=e.querySelector(`.dev-card-body`),r=e.querySelector(`.dev-card-header`),i=e.querySelector(`.dev-card-close`),a=e.querySelector(`#devCardId`),o=e.querySelector(`#devCardLabel`),s=e.querySelector(`#devCardHTML`),c=e.querySelector(`#devCardCSS`),l=e.querySelector(`#devCardJS`),u=e.querySelector(`#devCardSandbox`);if(this._makeCodeEditor(s,`htmlmixed`),this._makeCodeEditor(c,`css`),this._makeCodeEditor(l,`javascript`),e._devCardInitDone)return;e._devCardInitDone=!0;let d=document.createElement(`div`);d.id=`devCardPicker`,d.className=`dc-picker`,d.innerHTML=`
    <div class="dc-picker-inner">
      <button class="vb-btn vb-btn-primary" id="devCardPickerNew">➕ Create New Card</button>
      <div class="dc-picker-divider">or edit an existing card</div>
      <div class="dc-picker-list" id="devCardPickerList"></div>
    </div>
  `,t.insertBefore(d,n);let f=document.createElement(`button`);f.id=`devCardBack`,f.className=`vb-btn vb-btn-sm`,f.textContent=`← Back`,f.style.display=`none`,r.insertBefore(f,i);let p=()=>{d.style.display=``,n.style.display=`none`,f.style.display=`none`,h()},m=()=>{d.style.display=`none`,n.style.display=``,f.style.display=``,[s,c,l].forEach(e=>e._cm?.refresh())},h=()=>{let t=e.querySelector(`#devCardPickerList`);if(!t)return;t.innerHTML=``;let n=this._registry.getDefinitions(),r=Object.entries(n).filter(([,e])=>e.developer===!0);r.length===0?t.innerHTML=`<p class="dc-picker-empty">No saved developer cards yet.</p>`:r.forEach(([e,n])=>{let r=document.createElement(`div`);r.className=`dc-picker-item`,r.innerHTML=`
        <span class="dc-picker-item-label"></span>
        <span class="dc-picker-item-id"></span>
      `,r.querySelector(`.dc-picker-item-label`).textContent=n.label||e,r.querySelector(`.dc-picker-item-id`).textContent=`#${e}`,r.addEventListener(`click`,()=>g(e,n)),t.appendChild(r)})},g=(e,t)=>{a.value=e,o.value=t.label||e,this._setEditorValue(s,t.html),this._setEditorValue(c,t.css),this._setEditorValue(l,t.js),m(),v()};e._devCardLoad=e=>{let t=this._registry.get(e);t?.developer&&g(e,t)},e.querySelector(`#devCardPickerNew`).addEventListener(`click`,()=>{a.value=this._editorState.id,o.value=this._editorState.label,this._setEditorValue(s,this._editorState.html),this._setEditorValue(c,this._editorState.css),this._setEditorValue(l,this._editorState.js),m(),v()}),f.addEventListener(`click`,p);let _,v=()=>{clearTimeout(_),_=setTimeout(()=>{this._previewSandbox(u,{id:a.value,label:o.value,html:this._getEditorValue(s),css:this._getEditorValue(c),js:this._getEditorValue(l)})},500)};[a,o,s,c,l].forEach(e=>{e.addEventListener(`input`,v)}),e.querySelector(`#devCardSave`).addEventListener(`click`,()=>{let e=a.value.trim(),t=o.value.trim();if(!e){window.displayMessage?window.displayMessage(`Card ID is required`,`error`):console.error(`Card ID is required`);return}let n=JSON.parse(localStorage.getItem(`developerCards`)||`{}`),r={...n[e]||{},label:t||e,html:this._getEditorValue(s),css:this._getEditorValue(c),js:this._getEditorValue(l)};n[e]=r,localStorage.setItem(`developerCards`,JSON.stringify(n)),window.dispatchEvent(new CustomEvent(`pitbeacon:card-saved`,{detail:{id:e,def:r}}));let i=this.createCardDefinition(e,r);i.allowOverride=!0,this._registry.register(e,i),window.displayMessage&&window.displayMessage(`Card "${e}" saved!`,`message`),window._pitbeaconRender&&window._pitbeaconRender()}),e.querySelector(`#devCardTest`).addEventListener(`click`,v),new MutationObserver(()=>{e.classList.contains(`active`)&&p()}).observe(e,{attributes:!0,attributeFilter:[`class`]}),p()}_previewSandbox(e,t){let n=`
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
</html>`,r=new Blob([n],{type:`text/html`}),i=URL.createObjectURL(r);e.src=i,e._blobUrl&&URL.revokeObjectURL(e._blobUrl),e._blobUrl=i}},de=1992,fe=2100;function pe(e){let t=Number.parseInt(e,10);return Number.isInteger(t)&&t>=de&&t<=fe?t:null}function me(e=new Date,t=null){return pe(t)??e.getFullYear()}var he=[`your_auth_key`,`your auth key`,`tba key`,`your-api-key`,`your api key`];function ge(e){let t=String(e?.tbaapikey??``).trim();return t?!he.includes(t.toLowerCase()):!1}function _e(e,t){return me(t?.fullDate instanceof Date?t.fullDate:new Date,e?.seasonYearOverride)}var ve=`https://www.thebluealliance.com/api/v3`,ye=[`currentMatches`,`currentEventData`,`currentRankings`,`teamInfo`,`teamSummaryData`];function be(e){let[t,n,r]=String(e).split(`-`).map(Number);return{year:t,month:n-1,day:r}}function xe(e,t){if(!e?.start_date||!e?.end_date)return!1;let n=be(e.start_date),r=be(e.end_date),i=new Date(n.year,n.month,n.day,0,0,0,0),a=new Date(r.year,r.month,r.day,23,59,59,999);return t>=i&&t<=a}var Se=class{constructor(e,t){this._config=e,this._state=t,this._store=new Map,this._etagUnsupported=!1,this._round={failed:!1},this.lastSuccessAt=null}updateConfig(e){this._config=e,this.clearCache()}clearCache(){this._store.clear()}getSourceNames(){return[...ye]}async fetch(e){switch(e){case`currentMatches`:return this._state.getState().currentMatches||null;case`currentEventData`:return this._state.getState().currentEventData||null;case`currentRankings`:return this._state.getState().currentRankings||null;case`teamInfo`:return this._fetchTeamInfo();case`teamSummaryData`:return this._state.getState().currentTeamSummaryData||null;default:return null}}_hasRealApiKey(){return ge(this._config)}_season(){return _e(this._config,this._state.getState())}async _request(e,t){try{return await fetch(e,{headers:t})}catch(n){if(t[`If-None-Match`]){this._etagUnsupported=!0;let n={...t};return delete n[`If-None-Match`],fetch(e,{headers:n})}throw n}}async _tba(e){if(!this._hasRealApiKey())return null;let t=`${ve}${e}`,n=this._store.get(t),r={"X-TBA-Auth-Key":this._config.tbaapikey};n?.etag&&!this._etagUnsupported&&(r[`If-None-Match`]=n.etag);try{let e=await this._request(t,r);if(e.status===304&&n)return this.lastSuccessAt=Date.now(),n.data;if(e.status===404)return this._store.delete(t),this.lastSuccessAt=Date.now(),null;if(!e.ok)throw Error(`API Error: ${e.status}`);let i=await e.json();return this._store.set(t,{etag:e.headers.get(`ETag`),data:i}),this.lastSuccessAt=Date.now(),i}catch(t){return console.warn(`TBA request failed (${e}):`,t),this._round.failed=!0,n?n.data:null}}async _fetchTeamInfo(){if(!this._hasRealApiKey())return{events:[]};let e=await this._tba(`/team/frc${this._config.teamNumber}/events/${this._season()}`);return e?{events:e}:null}async fetchAll(){if(!this._hasRealApiKey())return null;this._round={failed:!1};let e=await this._fetchTeamInfo();if(!e?.events)return null;let t=this._state.getState().fullDate||new Date,n=e.events.find(e=>xe(e,t)),r=null,i=null,a=null;if(n){let e=this._config.teamNumber;r=await this._tba(`/team/frc${e}/event/${n.key}/matches/simple`),r&&(i=n),a=(await this._tba(`/event/${n.key}/rankings`))?.rankings??null}return{matches:r,eventData:i,rankings:a,stale:this._round.failed,fetchedAt:this.lastSuccessAt}}async fetchTeamSummary(e){let t=this._config.teamNumber,n=this._state.getState().currentEventData?.name||null;if(!t||!this._hasRealApiKey())return{teamSummary:{eventRank:`–`,eventRecord:{wins:0,losses:0,ties:0},winRate:`–`,seasonEventCount:0,eventName:n}};let[r,i,a]=await Promise.all([this._tba(`/team/frc${t}/events/${this._season()}`),e?this._tba(`/team/frc${t}/event/${e}/status`):null,e?this._tba(`/event/${e}/rankings`):null]),o=Array.isArray(a?.rankings)?a.rankings.find(e=>e.team_key===`frc${t}`):null,s=o?.record||i?.qual?.record||null,c=o?.rank??i?.qual?.rank??null,l=s?.wins??0,u=s?.losses??0,d=s?.ties??0,f=l+u+d;return{teamSummary:{eventRank:c,eventRecord:{wins:l,losses:u,ties:d},winRate:f>0?`${(l/f*100).toFixed(1)}%`:`–`,seasonEventCount:Array.isArray(r)?r.length:0,eventName:n}}}},Ce=102400;function we(e){let t=String(e.js||e.javascript||``);return{id:String(e.id||``).trim(),label:String(e.label||e.id||``).trim(),description:String(e.description||``).trim(),authorName:String(e.author_name||e.authorName||`Community author`).trim(),icon:String(e.icon||`code`).trim(),settings:e.settings&&typeof e.settings==`object`?e.settings:Ae(t),html:String(e.html||``),css:String(e.css||``),js:t,version:String(e.version||`1.0.0`).trim()}}function Te(e){return JSON.stringify({html:String(e.html||``),css:String(e.css||``),js:String(e.js||e.javascript||``),settings:e.settings||{}})}function Ee(e){let t=we(e),n=[];return/^[a-z0-9][a-z0-9-]{1,48}$/.test(t.id)||n.push(`Card ID must use lowercase letters, numbers, and hyphens.`),(!t.label||t.label.length>80)&&n.push(`Card label is required and must be 80 characters or fewer.`),(!t.html||t.html.length>4e4)&&n.push(`Card HTML is required and must be 40 KB or smaller.`),(t.css.length>4e4||t.js.length>4e4)&&n.push(`Card CSS and JavaScript must each be 40 KB or smaller.`),JSON.stringify(t).length>Ce&&n.push(`The complete card package must be 100 KB or smaller.`),{card:t,errors:n}}function De(e,t={}){return t.type?t.type:typeof e==`boolean`?`checkbox`:typeof e==`number`?`number`:typeof e==`string`&&/^#[0-9a-f]{6}$/i.test(e)?`color`:`text`}function Oe(e){let t=e.trim();if(t===`true`)return!0;if(t===`false`)return!1;if(t===`null`)return null;if(/^-?\d+(\.\d+)?$/.test(t))return Number(t);if(t.startsWith(`"`)&&t.endsWith(`"`)||t.startsWith(`'`)&&t.endsWith(`'`))return t.slice(1,-1)}function ke(e){let t=[],n=0,r=0,i=null;for(let a=0;a<e.length;a+=1){let o=e[a];i?o===i&&e[a-1]!==`\\`&&(i=null):o===`'`||o===`"`||o==="`"?i=o:o===`{`||o===`[`||o===`(`?r+=1:o===`}`||o===`]`||o===`)`?--r:o===`,`&&r===0&&(t.push(e.slice(n,a)),n=a+1)}return t.push(e.slice(n)),t}function Ae(e=``){let t={},n=/sdk\.configurable\s*\(([^()]*(?:\([^)]*\)[^()]*)*)\)/g,r;for(;r=n.exec(e);){let[e,n,i]=ke(r[1]),a=Oe(e||``),o=Oe(n||``);if(typeof a!=`string`||o===void 0)continue;let s={};if(i?.trim().startsWith(`{`))try{s=JSON.parse(i.replace(/([{,])\s*([a-zA-Z][\w]*)\s*:/g,`$1"$2":`))}catch{s={}}t[a]={label:s.label||a.replace(/([A-Z])/g,` $1`).replace(/^./,e=>e.toUpperCase()),type:De(o,s),default:o,...s.min===void 0?{}:{min:s.min},...s.max===void 0?{}:{max:s.max},...s.step===void 0?{}:{step:s.step},...s.options?{options:s.options}:{}}}return t}var je=class{constructor(e,t,n,r){this._config=e,this._runtime=t,this._stateManager=n,this._sdk=r}isConfigured(){return!!(this._config.supabaseUrl&&this._config.supabaseAnonKey)}async listApproved(){if(!this.isConfigured())return[];let e=`${this._config.supabaseUrl.replace(/\/$/,``)}/rest/v1/cards?select=id,label,description,author_name,icon,html,css,js,version,settings,created_at&status=eq.approved&order=created_at.desc`,t=await fetch(e,{headers:{apikey:this._config.supabaseAnonKey,Authorization:`Bearer ${this._config.supabaseAnonKey}`}});if(!t.ok)throw Error(`Catalog request failed (${t.status})`);return(await t.json()).map(we)}async submit(e,t=``){let{card:n,errors:r}=Ee(e);if(r.length)throw Error(r.join(` `));if(!this._config.cardSubmitFunctionUrl)throw Error(`Card submission is not configured yet.`);let i=await fetch(this._config.cardSubmitFunctionUrl,{method:`POST`,headers:{"Content-Type":`application/json`,apikey:this._config.supabaseAnonKey,Authorization:`Bearer ${this._config.supabaseAnonKey}`},body:JSON.stringify({card:n,updateOf:e.updateOf||null,turnstileToken:t})}),a=await i.json().catch(()=>({}));if(!i.ok)throw Error(a.error||`Card submission failed.`);return a}renderPreview(e,t,n=`catalog-preview-${t.id}`){let r={...t,developer:!0,builtin:!1,settings:t.settings,settingsValues:t.settingsValues};this._runtime._renderDevCard(e,n,r,this._stateManager.getState(),this._sdk)}},Me=class{constructor(e,t,n,r,i){this._registry=e,this._validator=t,this._state=n,this._dataSources=r,this._sdk=i,this._renderedCards=new Map,window._pitbeaconRender=()=>this.render(window._pitbeaconConfig||{},document.getElementById(`container`)),window._pitbeaconNotify=(e,t)=>{window.displayMessage&&window.displayMessage(e,t)}}render(e,t){if(!t)return;let n=e.gridCols||e.gridSize||3,r=e.gridRows||e.gridSize||3,i=e.layout||{},a=e.hiddenSections||[],o=this._validator.validate(i,n,r);o.errors.length>0&&console.warn(`Layout validation errors:`,o.errors),o.warnings.length>0&&console.warn(`Layout warnings:`,o.warnings);let s=o.layout;t.style.display=`grid`,t.style.gridTemplateColumns=`repeat(${n}, 1fr)`,t.style.gridTemplateRows=`repeat(${r}, 1fr)`,t.style.gap=`12px`,t.style.height=`calc(100vh - var(--header-height, 4.5rem))`,t.style.padding=`12px`,t.style.overflow=`auto`,t.style.background=`transparent`;let c=new Set,l=this._state.getState();for(let[e,n]of Object.entries(s)){if(a.includes(e))continue;let r=this._registry.get(e);if(!r){console.warn(`Card "${e}" not found in registry`);continue}c.add(e);let i=this._renderedCards.get(e);if(i||(i=document.createElement(`div`),i.id=`card-${e}`,i.className=`card-container`,i.style.overflow=`auto`,i.style.minHeight=`0`,t.appendChild(i),this._renderedCards.set(e,i)),i.style.gridColumn=`${n.x+1} / span ${n.width}`,i.style.gridRow=`${n.y+1} / span ${n.height}`,i.style.display=``,r.render)try{r.render(i,l,this._sdk,e)}catch(t){console.error(`Error rendering card "${e}":`,t),i.innerHTML=`
                    <div class="card-error">
                        <span class="card-error-icon">⚠</span>
                        <span class="card-error-msg">Error rendering card</span>
                        <span class="card-error-detail">${t.message}</span>
                    </div>
                `}}for(let[e,t]of this._renderedCards)!c.has(e)&&t.parentNode&&(t.remove(),this._renderedCards.delete(e));window._pitbeaconConfig=e}updateCards(e){for(let[t,n]of this._renderedCards){let r=this._registry.get(t);if(r&&r.render&&n.isConnected&&(!n.selfRefresh||r.developer))try{r.render(n,e,this._sdk,t)}catch(e){console.error(`Error updating card "${t}":`,e)}}}getCardElement(e){return this._renderedCards.get(e)||null}};function Ne(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var w=Ne();function Pe(e){w=e}var T={exec:()=>null};function E(e){let t=[];return n=>{let r=Math.max(0,Math.min(3,n-1)),i=t[r];return i||(i=e(r),t[r]=i),i}}function D(e,t=``){let n=typeof e==`string`?e:e.source,r={replace:(e,t)=>{let i=typeof t==`string`?t:t.source;return i=i.replace(O.caret,`$1`),n=n.replace(e,i),r},getRegex:()=>new RegExp(n,t)};return r}var Fe=((e=``)=>{try{return!!RegExp(`(?<=1)(?<!1)`+e)}catch{return!1}})(),O={codeRemoveIndent:/^(?: {0,3}\t| {1,4})/gm,listInterruptsParagraph:/^ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,endingSpaceTabChar:/[ \t]$/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,leadingSpaceTab:/^[ \t]+/,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+)[ \t]*)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,blockquoteMarkerWhitespace:/^( {0,3}>)([ \t]+)/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\][ \t]+\S/,listReplaceTask:/^\[[ xX]\][ \t]+/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,numericCharacterReference:/&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/,numericCharacterReferenceOrAmpersand:/&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:e=>RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:E(e=>RegExp(`^ {0,${e}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),hrRegex:E(e=>RegExp(`^ {0,${e}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)`)),fencesBeginRegex:E(e=>RegExp(`^ {0,${e}}(?:\`\`\`|~~~)`)),headingBeginRegex:E(e=>RegExp(`^ {0,${e}}#{1,6}(?:\\s|$)`)),pedanticHeadingBeginRegex:E(e=>RegExp(`^ {0,${e}}#`)),htmlBeginRegex:E(e=>RegExp(`^ {0,${e}}(?:</?(?:${Xe})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`,`i`)),blockquoteBeginRegex:E(e=>RegExp(`^ {0,${e}}>`)),nestedContainerMarkers:/^(?: {0,3}(?:(?:[*+-]|\d{1,9}[.)])[ \t]+|>[ \t]?))+/},Ie=/^(?:[ \t]*(?:\n|$))+/,Le=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Re=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}(?:(?=`)\1`*|(?=~)\1~*) *(?=\n|$)|$)/,ze=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Be=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,Ve=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,He=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |fences|blockquote|heading|hr|html|table))+?)\n {0,3}(=+|-+)[ \t]*(?:\n+|$)/,Ue=D(He).replace(/bull/g,Ve).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/hr/g,/ {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,``).getRegex(),We=D(He).replace(/bull/g,Ve).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/hr/g,/ {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),Ge=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/,Ke=/^[^\n]+/,qe=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\\n]|\n(?![ \t]*\n))+/,Je=D(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace(`label`,qe).replace(`title`,/(?:"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\\n]|\n(?!\n))*'|\((?:\\[\s\S]|[^()\\])*\))/).getRegex(),Ye=D(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g,Ve).getRegex(),Xe=`address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul`,Ze=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Qe=D(`^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?:[ \\t]+|\\n|/?>|$)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))`,`i`).replace(`comment`,Ze).replace(`tag`,Xe).replace(`attribute`,/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),$e=e=>D(Ge).replace(`hr`,ze).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,e).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,Xe).getRegex(),et=$e(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/),tt=$e(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/),nt={blockquote:D(/^( {0,3}> ?(?:(?![ \t]*(?:\n|$))(paragraph)|[^\n]*)(?:\n|$))+/).replace(`paragraph`,tt).getRegex(),code:Le,def:Je,fences:Re,heading:Be,hr:ze,html:Qe,lheading:Ue,list:Ye,newline:Ie,paragraph:et,table:T,text:Ke},rt=D(`^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)`).replace(`hr`,ze).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`blockquote`,` {0,3}>`).replace(`code`,`(?: {4}| {0,3}	)[^\\n]`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]`).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,Xe).getRegex(),it={...nt,lheading:We,table:rt,paragraph:D(Ge).replace(`hr`,ze).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`table`,rt).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]`).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,Xe).getRegex()},at={...nt,html:D(`^ *(?:comment(?: *\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1>(?: *\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?>(?: *\\n{2,}|\\s*$))`).replace(`comment`,Ze).replace(/tag/g,`(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b`).getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:T,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:D(Ge).replace(`hr`,ze).replace(`heading`,` *#{1,6} *[^
]`).replace(`lheading`,Ue).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`|fences`,``).replace(`|list`,``).replace(`|html`,``).replace(`|tag`,``).getRegex()},ot=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,st=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,ct=/^( {2,}|\\)\n(?!\s*$)[ \t]*/,lt=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,k=/[\p{P}\p{S}]/u,A=/[\s\p{P}\p{S}]/u,ut=/[^\s\p{P}\p{S}]/u,dt=D(/^((?![*_])punctSpace)/,`u`).replace(/punctSpace/g,A).getRegex(),ft=/[\p{Pi}\p{Ps}"']/u,pt=/(?!~)[\p{P}\p{S}]/u,mt=/(?!~)[\s\p{P}\p{S}]/u,ht=/(?:[^\s\p{P}\p{S}]|~)/u,gt=D(/link|precode-code|html/,`g`).replace(`link`,/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace(`precode-`,Fe?"(?<!`)()":"(^^|[^`])").replace(`code`,/(?<b>`+)[^`]+\k<b>(?!`)/).replace(`html`,/<(?! )[^<>]*?>/).getRegex(),_t=/^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,vt=D(_t,`u`).replace(/punct/g,k).getRegex(),yt=D(_t,`u`).replace(/punct/g,pt).getRegex(),bt=D(/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/,`u`).replace(/openQuote/g,ft).replace(/punct/g,k).getRegex(),xt=`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)`,St=D(xt,`gu`).replace(/notPunctSpace/g,ut).replace(/punctSpace/g,A).replace(/punct/g,k).getRegex(),Ct=D(xt,`gu`).replace(/notPunctSpace/g,ht).replace(/punctSpace/g,mt).replace(/punct/g,pt).getRegex(),wt=D(`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,ut).replace(/punctSpace/g,A).replace(/punct/g,k).getRegex(),Tt=D(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)`,`gu`).replace(/notPunctSpace/g,ut).replace(/punctSpace/g,A).replace(/punct/g,k).getRegex(),Et=D(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,ut).replace(/punctSpace/g,A).replace(/punct/g,k).getRegex(),Dt=D(/^~~?(?:((?!~)punct)|[^\s~])/,`u`).replace(/punct/g,k).getRegex(),Ot=D(`^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,ut).replace(/punctSpace/g,A).replace(/punct/g,k).getRegex(),kt=D(/\\(punct)/,`gu`).replace(/punct/g,k).getRegex(),At=D(/(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\(punct)/,`gu`).replace(/punct/g,k).getRegex(),jt=D(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace(`scheme`,/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace(`email`,/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),Mt=D(Ze).replace(`(?:-->|$)`,`-->`).getRegex(),Nt=D(`^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>`).replace(`comment`,Mt).replace(`attribute`,/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),Pt=/\[(?:\\[\s\S]|[^\[\]\\])*\]/,Ft=D(/(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/).replace(`brackets`,Pt).getRegex(),It=D(/^!?\[(label)\]\([ \t\n]*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?[ \t\n]*\)/).replace(`label`,Ft).replace(`href`,/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace(`title`,/"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\((?:\\[\s\S]|[^)\\])*\)/).getRegex(),Lt=D(/^!?\[(label)\]\[(ref)\]/).replace(`label`,Ft).replace(`ref`,qe).getRegex(),Rt=D(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,qe).getRegex(),zt=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/,Bt=D(/(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/).replace(`brackets`,Pt).getRegex(),Vt=D(`reflink|nolink(?!\\()`,`g`).replace(`reflink`,D(/^!?\[(label)\]\[(ref)\]/).replace(`label`,Bt).replace(`ref`,zt).getRegex()).replace(`nolink`,D(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,zt).getRegex()).getRegex(),Ht=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,Ut=D(/(?:mailto:email|xmpp:email(?:\/[A-Za-z0-9@.]+)?)/).replace(/email/g,/[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),Wt={_backpedal:T,anyPunctuation:kt,anyPunctuationOutsideCode:At,autolink:jt,blockSkip:gt,br:ct,code:st,del:T,delLDelim:T,delRDelim:T,emStrongLDelim:vt,emStrongRDelimAst:St,emStrongRDelimUnd:Tt,escape:ot,link:It,nolink:Rt,punctuation:dt,reflink:Lt,reflinkSearch:Vt,tag:Nt,text:lt,url:T},Gt={...Wt,emStrongLDelim:bt,emStrongRDelimAst:wt,emStrongRDelimUnd:Et,link:D(/^!?\[(label)\]\((.*?)\)/).replace(`label`,Ft).getRegex(),reflink:D(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace(`label`,Ft).getRegex()},Kt={...Wt,emStrongRDelimAst:Ct,emStrongLDelim:yt,delLDelim:Dt,delRDelim:Ot,url:D(/^emailProtocol|^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace(`emailProtocol`,Ut).replace(`protocol`,Ht).replace(`email`,/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:D(/^(?:[^a-zA-Z0-9](?=emailProtocol)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|wwwStart|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=emailProtocol)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/).replace(`protocol`,Ht).replace(/emailProtocol/g,/(?:mailto|xmpp):/).replace(`wwwStart`,Fe?`(?<![^\\s*_~(])www\\.`:`www\\.`).getRegex()},qt={...Kt,br:D(ct).replace(`{2,}`,`*`).getRegex(),text:D(Kt.text).replace(`\\b_`,`\\b_| {2,}\\n`).replace(/\{2,\}/g,`*`).getRegex()},Jt={normal:nt,gfm:it,pedantic:at},Yt={normal:Wt,gfm:Kt,breaks:qt,pedantic:Gt},Xt={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`},Zt=e=>Xt[e];function j(e,t){if(t){if(O.escapeTest.test(e))return e.replace(O.escapeReplace,Zt)}else if(O.escapeTestNoEncode.test(e))return e.replace(O.escapeReplaceNoEncode,Zt);return e}function Qt(e){return O.numericCharacterReference.test(e)?e.replace(O.numericCharacterReferenceOrAmpersand,(e,t,n)=>{if(t===void 0&&n===void 0)return`&amp;`;let r=t===void 0?Number.parseInt(n,16):Number.parseInt(t,10);return r===0||r>1114111||r>=55296&&r<=57343?`�`:r===38?`&amp;`:String.fromCodePoint(r)}):e}function $t(e){try{e=encodeURI(e).replace(O.percentDecode,`%`)}catch{return null}return e}function en(e,t){let n=e.replace(O.findPipe,(e,t,n)=>{let r=!1,i=t;for(;--i>=0&&n[i]===`\\`;)r=!r;return r?`|`:` |`}).split(O.splitPipe),r=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),t){if(n.length>t)n.splice(t);else for(;n.length<t;)n.push(``)}for(;r<n.length;r++)n[r]=n[r].trim().replace(O.slashPipe,`|`);return n}function M(e,t,n){let r=e.length;if(r===0)return``;let i=0;for(;i<r;){let a=e.charAt(r-i-1);if(a===t&&!n)i++;else if(a!==t&&n)i++;else break}return e.slice(0,r-i)}function tn(e){let t=e.split(`
`),n=t.length-1;for(;n>=0&&O.blankLine.test(t[n]);)n--;return t.length-n<=2?e:t.slice(0,n+1).join(`
`)}function nn(e){return e.trim().replace(O.multipleSpaceGlobal,` `).toLowerCase().toUpperCase().toLowerCase()}function rn(e,t){if(e.indexOf(t[0])===-1&&e.indexOf(t[1])===-1)return-1;let n=0;for(let r=0;r<e.length;r++)if(e[r]===`\\`)r++;else if(e[r]===t[0])n++;else if(e[r]===t[1]&&(n--,n<0))return r;return n>0?-2:-1}var an=new WeakMap;function on(e){let t={"*":-1,_:-1},n=-1,r=e.length;for(let i=0;i<r;i++){let a=e[i];if(a!==`*`&&a!==`_`&&a!==`~`)continue;let o=i===0?`
`:e[i-1],s=i+1;for(;s<r&&e[s]===a;)s++;o!==` `&&o!==`	`&&o!==`
`&&o!==`\r`&&o!==`\f`&&(a===`~`?n=i:t[a]=i),i=s-1}return{maskedSrc:e,lastPossibleEmStrongCloserIndex:t,lastPossibleDelCloserIndex:n}}function sn(e,t){let n=on(t),r=an.get(e);r?r.push(n):an.set(e,[n])}function cn(e){let t=an.get(e);t&&(t.pop(),t.length===0&&an.delete(e))}function ln(e,t,n){let r=an.get(e)?.at(-1);return r&&r.maskedSrc===t?r.lastPossibleEmStrongCloserIndex[n]:on(t).lastPossibleEmStrongCloserIndex[n]}function un(e,t){let n=an.get(e)?.at(-1);return n&&n.maskedSrc===t?n.lastPossibleDelCloserIndex:on(t).lastPossibleDelCloserIndex}function dn(e,t=0){let n=t,r=``;for(let t of e)if(t===`	`){let e=4-n%4;r+=` `.repeat(e),n+=e}else r+=t,n++;return r}function fn(e,t,n,r,i){let a=t.href,o=t.title||null,s=e[1].replace(i.other.outputLinkReplace,`$1`),c=e[0].charAt(0)===`!`,l=r.state.inLink,u=r.state.linkEmitted,d=r.state.inRawBlock;r.state.inLink=!0,r.state.linkEmitted=!1;let f=r.inlineTokens(s),p=r.state.linkEmitted;if(r.state.linkEmitted=u,r.state.inLink=l,!c){if(p){r.state.inRawBlock=d;return}r.state.linkEmitted=!0}return{type:c?`image`:`link`,raw:n,href:a,title:o,text:s,tokens:f}}function pn(e,t,n){let r=e.match(n.other.indentCodeCompensation);if(r===null)return t;let i=r[1];return t.split(`
`).map(e=>{let t=e.match(n.other.beginningSpace);if(t===null)return e;let[r]=t;return e.slice(Math.min(r.length,i.length))}).join(`
`)}function mn(e,t,n,r){if(!t.includes(`<`))return!1;for(let i=0;i<t.length;i++){if(t[i]===`\\`){i++;continue}if(t[i]==="`"){let e=r.inline.code.exec(t.slice(i));if(e){i+=e[0].length-1;continue}}if(t[i]!==`<`)continue;let a=e.slice(n+i),o=r.inline.tag.exec(a)||r.inline.autolink.exec(a);if(o){if(o[0].length>t.length-i)return!0;i+=o[0].length-1}}return!1}var N=class{options;rules;lexer;constructor(e){this.options=e||w}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:`space`,raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let e=this.options.pedantic?t[0]:tn(t[0]);return{type:`code`,raw:e,codeBlockStyle:`indented`,text:e.replace(this.rules.other.codeRemoveIndent,``)}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let e=t[0],n=pn(e,t[3]||``,this.rules);return{type:`code`,raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,`$1`):t[2],text:n}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let e=t[2].trim();if(this.rules.other.endingHash.test(e)){let t=M(e,`#`);(this.options.pedantic||!t||this.rules.other.endingSpaceTabChar.test(t))&&(e=t.trim())}return{type:`heading`,raw:M(t[0],`
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
`?t[1].slice(0,-1):t[1];return{type:`paragraph`,raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:`text`,raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:`escape`,raw:t[0],text:t[1]}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:`html`,raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){if(this.lexer.state.linkParenPossible===!1)return;let t=this.rules.inline.link.exec(e);if(t){let n=t[0].charAt(0)===`!`?2:1;if(!this.options.pedantic&&mn(e,t[1],n,this.rules))return;let r=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(r)){if(!this.rules.other.endAngleBracket.test(r))return;let e=M(r.slice(0,-1),`\\`);if((r.length-e.length)%2==0)return}else{let e=rn(t[2],`()`);if(e===-2)return;if(e>-1){let n=(t[0].indexOf(`!`)===0?5:4)+t[1].length+e;t[2]=t[2].substring(0,e),t[0]=t[0].substring(0,n).trim(),t[3]=``}}let i=M(t[0].slice(0,-1),`\\`);if((t[0].length-i.length)%2==0)return;let a=t[2],o=``;if(this.options.pedantic){let e=this.rules.other.pedanticHrefTitle.exec(a);e&&(a=e[1],o=e[3])}else o=t[3]?t[3].slice(1,-1):``;return a=a.trim(),this.rules.other.startAngleBracket.test(a)&&(a=this.options.pedantic&&!this.rules.other.endAngleBracket.test(r)?a.slice(1):a.slice(1,-1)),fn(t,{href:a&&a.replace(this.rules.inline.anyPunctuation,`$1`),title:o&&o.replace(this.rules.inline.anyPunctuation,`$1`)},t[0],this.lexer,this.rules)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let r=n[0].charAt(0)===`!`?2:1;if(!this.options.pedantic&&mn(e,n[1],r,this.rules))return;let i=t[nn(n[2]||n[1])];if(!i){let e=n[0].charAt(0);return{type:`text`,raw:e,text:e}}return fn(n,i,n[0],this.lexer,this.rules)}}emStrong(e,t,n=``){let r=this.rules.inline.emStrongLDelim.exec(e);if(!r||!r[1]&&!r[2]&&!r[3]&&!r[4])return;let i=r[0][0],a=n===i,o=t.length-e.length,s=o;for(;!this.options.pedantic&&s>0&&t[s-1]===i;)s--;let c=[...t.slice(Math.max(0,s-2),s)].at(-1)??``,l=c===`*`||c===`_`||!!this.rules.inline.punctuation.exec(c);s<o&&(n=c);let u=s<o?l:n===`*`||n===`_`||!!this.rules.inline.punctuation.exec(n);if(r[4]&&n.match(this.rules.other.unicodeAlphaNumeric))return;let d=r[1]||r[3]||``;if(!d||!n||u){let n=[...r[0]].length-1,u,f,p=n,m=0,h=o-s+n,g=!this.options.pedantic&&!!c.trim()&&(!!d||i===`*`&&!l);if(i!==`*`&&i!==`_`)return;let _=i===`*`?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd,v=ln(this,t,i),y=t.length-e.length+n;if(v<y)return;t=t.slice(-1*e.length+n);let ee=v-y;for(_.lastIndex=0;(r=_.exec(t))!==null&&!(r.index>ee);){if(u=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!u)continue;if(f=[...u].length,r[3]||r[4]){p+=f;continue}if(r[5]||r[6]||g){if(a&&(r[5]||r[6]))break;if(h%3&&!((h+f)%3)){m+=f;continue}}if(p-=f,p>0)continue;f=Math.min(f,f+p+m);let t=[...r[0]][0].length,i=e.slice(0,n+r.index+t+f);if(Math.min(n,f)%2){let e=i.slice(1,-1);return{type:`em`,raw:i,text:e,tokens:this.lexer.inlineTokens(e)}}let o=i.slice(2,-2);return{type:`strong`,raw:i,text:o,tokens:this.lexer.inlineTokens(o)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let e=t[2].replace(this.rules.other.newLineCharGlobal,` `),n=this.rules.other.nonSpaceChar.test(e),r=this.rules.other.startingSpaceChar.test(e)&&this.rules.other.endingSpaceChar.test(e);return n&&r&&(e=e.substring(1,e.length-1)),{type:`codespan`,raw:t[0],text:e}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:`br`,raw:t[0]}}del(e,t,n=``){let r=this.rules.inline.delLDelim.exec(e);if(r&&(!r[1]||!n||this.rules.inline.punctuation.exec(n))){let n=[...r[0]].length-1,i,a,o=n,s=this.rules.inline.delRDelim,c=un(this,t),l=t.length-e.length+n;if(c<l)return;t=t.slice(-1*e.length+n);let u=c-l;for(s.lastIndex=0;(r=s.exec(t))!==null&&!(r.index>u);){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i||(a=[...i].length,a!==n))continue;if(r[3]||r[4]){o+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o);let t=[...r[0]][0].length,s=e.slice(0,n+r.index+t+a),c=s.slice(n,-n);return{type:`del`,raw:s,text:c,tokens:this.lexer.inlineTokens(c)}}}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let e,n;return t[2]===`@`?(e=t[1],n=`mailto:`+e):(e=t[1],n=e),{type:`link`,raw:t[0],text:e,href:n,autolink:!0,tokens:[{type:`text`,raw:e,text:e}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let e,n;if(t[2]===`@`)e=t[0],n=`mailto:`+e;else{let r;do r=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??``;while(r!==t[0]);e=t[0],n=t[1]===`www.`?`http://`+t[0]:t[0]}return{type:`link`,raw:t[0],text:e,href:n,autolink:!0,tokens:[{type:`text`,raw:e,text:e}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let e=this.lexer.state.inRawBlock;return{type:`text`,raw:t[0],text:e?t[0]:Qt(t[0]),escaped:e}}}},P=class e{tokens;options;state;inlineQueue;tokenizer;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||w,this.options.tokenizer=this.options.tokenizer||new N,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,linkEmitted:!1,linkParenPossible:!0,top:!0};let t={other:O,block:Jt.normal,inline:Yt.normal};this.options.pedantic?(t.block=Jt.pedantic,t.inline=Yt.pedantic):this.options.gfm&&(t.block=Jt.gfm,t.inline=this.options.breaks?Yt.breaks:Yt.gfm),this.tokenizer.rules=t}static get rules(){return{block:Jt,inline:Yt}}static lex(t,n){return new e(n).lex(t)}static lexInline(t,n){return new e(n).inlineTokens(t)}lex(e){e=e.replace(O.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let e=0;e<this.inlineQueue.length;e++){let t=this.inlineQueue[e];this.state.inRawBlock=!1,this.inlineTokens(t.src,t.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){this.tokenizer.lexer=this;let r=this.state.lastToken;this.options.pedantic&&(e=e.replace(O.tabCharGlobal,`    `).replace(O.spaceLine,``));let i=1/0;for(;e;){if(e.length<i)i=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}this.state.lastToken=t.at(-1);let r;if(this.options.extensions?.block?.some(n=>(r=n.call({lexer:this},e,t))?(e=e.substring(r.raw.length),t.push(r),!0):!1))continue;if(r=this.tokenizer.space(e)){e=e.substring(r.raw.length);let n=t.at(-1);r.raw.length===1&&n!==void 0?n.raw+=`
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
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=n.text):t.push(r)}else if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return this.state.top=!0,this.state.lastToken=r,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}linkInText(e){if(!e.includes(`[`))return!1;let t=this.tokenizer.rules.inline.link;for(let n of e.matchAll(this.tokenizer.rules.inline.blockSkip))if(t.test(n[0])&&e.charAt(n.index-1)!==`!`)return!0;for(let t of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)){let e=t[0],n=e.lastIndexOf(`[`);if(e.charAt(0)!==`!`&&Object.hasOwn(this.tokens.links,nn(e.slice(n+1,-1)))&&!(n>1&&this.linkInText(e.slice(1,n-1))))return!0}return!1}inlineTokens(e,t=[]){this.tokenizer.lexer=this;let n=this.state.linkParenPossible;this.state.linkParenPossible=n&&e.includes(`)`);try{return this.#e(e,t)}finally{this.state.linkParenPossible=n}}#e(e,t){let n=e.includes(`*`)||e.includes(`_`)||e.includes(`~`)||this.options.hooks?.emStrongMask||this.tokenizer.emStrong!==N.prototype.emStrong||this.tokenizer.del!==N.prototype.del?this.#r(e):e;sn(this.tokenizer,n);try{return this.#t(e,n,t)}finally{cn(this.tokenizer)}}#t(e,t,n){let r=!1,i=``,a=1/0;for(;e;){if(e.length<a)a=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}r||(i=``),r=!1;let o;if(this.options.extensions?.inline?.some(t=>(o=t.call({lexer:this},e,n))?(e=e.substring(o.raw.length),n.push(o),!0):!1))continue;if((o=this.tokenizer.escape(e))||(o=this.tokenizer.tag(e))||(o=this.tokenizer.link(e))){e=e.substring(o.raw.length),n.push(o);continue}if(o=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(o.raw.length);let t=n.at(-1);o.type===`text`&&t?.type===`text`?(t.raw+=o.raw,t.text+=o.text):n.push(o);continue}if((o=this.tokenizer.emStrong(e,t,i))||(o=this.tokenizer.codespan(e))||(o=this.tokenizer.br(e))||(o=this.tokenizer.del(e,t,i))||(o=this.tokenizer.autolink(e))||!this.state.inLink&&(o=this.tokenizer.url(e))){e=e.substring(o.raw.length),n.push(o);continue}let s=e;if(this.options.extensions?.startInline){let t=1/0,n=e.slice(1),r;this.options.extensions.startInline.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(s=e.substring(0,t+1))}if(o=this.tokenizer.inlineText(s)){e=e.substring(o.raw.length),o.raw.slice(-1)!==`_`&&(i=o.raw.slice(-1)),r=!0;let t=n.at(-1);t?.type===`text`?(t.raw+=o.raw,t.text+=o.text):n.push(o)}else if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return n}#n(e){let{blockSkip:t,tag:n,autolink:r}=this.tokenizer.rules.inline,i=``,a=0,o;for(t.lastIndex=0;o=t.exec(e);){let s=o.index+(o[2]?o[2].length:0),c=o.index+o[0].length;if(e.charAt(s)===`<`){let i=e.slice(s),a=n.exec(i)||r.exec(i);if(!a){t.lastIndex=s+1;continue}c=s+a[0].length,t.lastIndex=c}i+=e.slice(a,s)+`[`+`a`.repeat(c-s-2)+`]`,a=c}return i+e.slice(a)}#r(e){let t=e;if(this.tokens.links&&e.includes(`[`)){let e=this.tokenizer.rules.inline.reflinkSearch,n=t=>{let r=t.lastIndexOf(`[`);if(!Object.hasOwn(this.tokens.links,nn(t.slice(r+1,-1))))return t;if(r>1&&t.charAt(0)!==`!`){let i=t.slice(1,r-1);if(this.linkInText(i))return`[`+i.replace(e,n)+`][`+`a`.repeat(t.length-r-2)+`]`}return`[`+`a`.repeat(t.length-2)+`]`};t=t.replace(e,n)}return t=t.replace(this.tokenizer.rules.inline.anyPunctuationOutsideCode,(e,t,n)=>n?`+`.repeat(e.length):t?t+e.slice(t.length,-t.length).replace(/`/g,`+`)+t:e),t=this.#n(t),t=this.options.hooks?.emStrongMask?.call({lexer:this},t)??t,t}infiniteLoopError(e){let t=`Infinite loop on byte: `+e;if(this.options.silent)console.error(t);else throw Error(t)}},hn=class{options;parser;constructor(e){this.options=e||w}space(e){return``}code({text:e,lang:t,escaped:n}){let r=(t||``).match(O.notSpaceStart)?.[0],i=e?e.replace(O.endingNewline,``)+`
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
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${j(e,!0)}</code>`}br(e){return`<br>`}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,text:n,tokens:r,autolink:i}){let a=i?j(n,!0):this.parser.parseInline(r),o=$t(e);if(o===null)return a;e=j(o,i);let s=`<a href="`+e+`"`;return t&&(s+=` title="`+j(t)+`"`),s+=`>`+a+`</a>`,s}image({href:e,title:t,text:n,tokens:r}){r&&(n=this.parser.parseInline(r,this.parser.textRenderer));let i=$t(e);if(i===null)return j(n);e=i;let a=`<img src="${j(e)}" alt="${j(n)}"`;return t&&(a+=` title="${j(t)}"`),a+=`>`,a}text(e){return`tokens`in e&&e.tokens?this.parser.parseInline(e.tokens):`escaped`in e&&e.escaped?e.text:j(e.text)}},gn=class{parser;strong({text:e,tokens:t}){return t?this.parser.parseInline(t,this):e}em({text:e,tokens:t}){return t?this.parser.parseInline(t,this):e}codespan({text:e}){return e}del({text:e,tokens:t}){return t?this.parser.parseInline(t,this):e}html({text:e}){return e}text({text:e}){return e}link({text:e,tokens:t}){return t?this.parser.parseInline(t,this):e}image({text:e,tokens:t}){return t?this.parser.parseInline(t,this):e}br(){return`
`}checkbox({raw:e}){return e}},F=class e{options;renderer;textRenderer;constructor(e){this.options=e||w,this.options.renderer=this.options.renderer||new hn,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new gn,this.textRenderer.parser=this}static parse(t,n){return new e(n).parse(t)}static parseInline(t,n){return new e(n).parseInline(t)}parse(e){this.renderer.parser=this;let t=``;for(let n=0;n<e.length;n++){let r=e[n];if(this.options.extensions?.renderers?.[r.type]){let e=r,n=this.options.extensions.renderers[e.type].call({parser:this},e);if(n!==!1||![`space`,`hr`,`heading`,`code`,`table`,`blockquote`,`list`,`checkbox`,`html`,`def`,`paragraph`,`text`].includes(e.type)){t+=n===!1?``:n??``;continue}}let i=r;switch(i.type){case`space`:t+=this.renderer.space(i);break;case`hr`:t+=this.renderer.hr(i);break;case`heading`:t+=this.renderer.heading(i);break;case`code`:t+=this.renderer.code(i);break;case`table`:t+=this.renderer.table(i);break;case`blockquote`:t+=this.renderer.blockquote(i);break;case`list`:t+=this.renderer.list(i);break;case`checkbox`:t+=this.renderer.checkbox(i);break;case`html`:t+=this.renderer.html(i);break;case`def`:t+=this.renderer.def(i);break;case`paragraph`:t+=this.renderer.paragraph(i);break;case`text`:t+=this.renderer.text(i);break;default:{let e=`Token with "`+i.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return t}parseInline(e,t=this.renderer){this.renderer.parser=this;let n=``;for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let e=this.options.extensions.renderers[i.type].call({parser:this},i);if(e!==!1||![`escape`,`html`,`link`,`image`,`checkbox`,`strong`,`em`,`codespan`,`br`,`del`,`text`].includes(i.type)){n+=e===!1?``:e??``;continue}}let a=i;switch(a.type){case`escape`:n+=t.text(a);break;case`html`:n+=t.html(a);break;case`link`:n+=t.link(a);break;case`image`:n+=t.image(a);break;case`checkbox`:n+=t.checkbox(a);break;case`strong`:n+=t.strong(a);break;case`em`:n+=t.em(a);break;case`codespan`:n+=t.codespan(a);break;case`br`:n+=t.br(a);break;case`del`:n+=t.del(a);break;case`text`:n+=t.text(a);break;default:{let e=`Token with "`+a.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return n}},_n=class{options;block;constructor(e){this.options=e||w}static passThroughHooks=new Set([`preprocess`,`postprocess`,`processAllTokens`,`emStrongMask`]);static passThroughHooksRespectAsync=new Set([`preprocess`,`postprocess`,`processAllTokens`]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}emStrongMask(e){return e}provideLexer(e=this.block){return e?P.lex:P.lexInline}provideParser(e=this.block){return e?F.parse:F.parseInline}};function I(e,t){if(Array.isArray(t))for(let n=0;n<t.length;n++)e.push(t[n]);else e.push(t)}var L=new class{defaults=Ne();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=F;Renderer=hn;TextRenderer=gn;Lexer=P;Tokenizer=N;Hooks=_n;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let r of e)switch(I(n,t.call(this,r)),r.type){case`table`:{let e=r;for(let r of e.header)I(n,this.walkTokens(r.tokens,t));for(let r of e.rows)for(let e of r)I(n,this.walkTokens(e.tokens,t));break}case`list`:{let e=r;I(n,this.walkTokens(e.items,t));break}default:{let e=r;this.defaults.extensions?.childTokens?.[e.type]?this.defaults.extensions.childTokens[e.type].forEach(r=>{let i=e[r].flat(1/0);I(n,this.walkTokens(i,t))}):e.tokens&&I(n,this.walkTokens(e.tokens,t))}}return n}use(...e){let t=this.defaults.extensions||{renderers:Object.create(null),childTokens:Object.create(null)};return e.forEach(e=>{let n={...e};if(n.async=this.defaults.async||n.async||!1,e.extensions&&(e.extensions.forEach(e=>{if(!e.name)throw Error(`extension name required`);if(`renderer`in e){let n=t.renderers[e.name];n?t.renderers[e.name]=function(...t){let r=e.renderer.apply(this,t);return r===!1&&(r=n.apply(this,t)),r}:t.renderers[e.name]=e.renderer}if(`tokenizer`in e){if(!e.level||e.level!==`block`&&e.level!==`inline`)throw Error(`extension level must be 'block' or 'inline'`);let n=t[e.level];n?n.unshift(e.tokenizer):t[e.level]=[e.tokenizer],e.start&&(e.level===`block`?t.startBlock?t.startBlock.push(e.start):t.startBlock=[e.start]:e.level===`inline`&&(t.startInline?t.startInline.push(e.start):t.startInline=[e.start]))}`childTokens`in e&&e.childTokens&&(t.childTokens[e.name]=e.childTokens)}),n.extensions=t),e.renderer){let t=this.defaults.renderer||new hn(this.defaults);for(let n in e.renderer){if(!(n in t))throw Error(`renderer '${n}' does not exist`);if([`options`,`parser`].includes(n))continue;let r=n,i=e.renderer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n===!1?``:n??``}}n.renderer=t}if(e.tokenizer){let t=this.defaults.tokenizer||new N(this.defaults);for(let n in e.tokenizer){if(!(n in t))throw Error(`tokenizer '${n}' does not exist`);if([`options`,`rules`,`lexer`].includes(n))continue;let r=n,i=e.tokenizer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.tokenizer=t}if(e.hooks){let t=this.defaults.hooks||new _n;for(let n in e.hooks){if(!(n in t))throw Error(`hook '${n}' does not exist`);if([`options`,`block`].includes(n))continue;let r=n,i=e.hooks[r],a=t[r];t[r]=_n.passThroughHooks.has(n)?e=>{if(t.options.async&&_n.passThroughHooksRespectAsync.has(n))return(async()=>{let n=await i.call(t,e);return a.call(t,n)})();let r=i.call(t,e);return a.call(t,r)}:(...e)=>{if(t.options.async)return(async()=>{let n=await i.apply(t,e);return n===!1&&(n=await a.apply(t,e)),n})();let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.hooks=t}if(e.walkTokens){let t=this.defaults.walkTokens,r=e.walkTokens;n.walkTokens=function(e){let n=[];return I(n,r.call(this,e)),t&&I(n,t.call(this,e)),n}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return P.lex(e,t??this.defaults)}parser(e,t){return F.parse(e,t??this.defaults)}parseMarkdown(e){return(t,n)=>{let r={...n},i={...this.defaults,...r},a=this.onError(!!i.silent,!!i.async);if(this.defaults.async===!0&&r.async===!1)return a(Error(`marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise.`));if(typeof t>`u`||t===null)return a(Error(`marked(): input parameter is undefined or null`));if(typeof t!=`string`)return a(Error(`marked(): input parameter is of type `+Object.prototype.toString.call(t)+`, string expected`));if(i.hooks&&(i.hooks.options=i,i.hooks.block=e),i.async)return(async()=>{let n=i.hooks?await i.hooks.preprocess(t):t,r=await(i.hooks?await i.hooks.provideLexer(e):e?P.lex:P.lexInline)(n,i),a=i.hooks?await i.hooks.processAllTokens(r):r;i.walkTokens&&await Promise.all(this.walkTokens(a,i.walkTokens));let o=await(i.hooks?await i.hooks.provideParser(e):e?F.parse:F.parseInline)(a,i);return i.hooks?await i.hooks.postprocess(o):o})().catch(a);try{i.hooks&&(t=i.hooks.preprocess(t));let n=(i.hooks?i.hooks.provideLexer(e):e?P.lex:P.lexInline)(t,i);i.hooks&&(n=i.hooks.processAllTokens(n)),i.walkTokens&&this.walkTokens(n,i.walkTokens);let r=(i.hooks?i.hooks.provideParser(e):e?F.parse:F.parseInline)(n,i);return i.hooks&&(r=i.hooks.postprocess(r)),r}catch(e){return a(e)}}}onError(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let e=`<p>An error occurred:</p><pre>`+j(n.message+``,!0)+`</pre>`;return t?Promise.resolve(e):e}if(t)return Promise.reject(n);throw n}}};function R(e,t){return L.parse(e,t)}R.options=R.setOptions=function(e){return L.setOptions(e),R.defaults=L.defaults,Pe(R.defaults),R},R.getDefaults=Ne,R.defaults=w;function vn(...e){return L.use(...e),R.defaults=L.defaults,Pe(R.defaults),R}R.use=vn,R.walkTokens=function(e,t){return L.walkTokens(e,t)},R.parseInline=L.parseInline,R.Parser=F,R.parser=F.parse,R.Renderer=hn,R.TextRenderer=gn,R.Lexer=P,R.lexer=P.lex,R.Tokenizer=N,R.Hooks=_n,R.parse=R,R.options,R.setOptions,R.walkTokens,R.parseInline,F.parse,P.lex;var yn=`# PitBeacon Developer Card Editor — Guide

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
`,bn=class{open(){let e=document.getElementById(`docsModal`);e||(e=document.createElement(`div`),e.id=`docsModal`,e.className=`docs-modal`,e.innerHTML=`
        <div class="docs-shell">
          <div class="docs-header">
            <h2 class="docs-title">📖 Developer Guide</h2>
            <button class="vb-btn vb-btn-close" id="docsClose" type="button">✕</button>
          </div>
          <div class="docs-body" id="docsBody"></div>
        </div>
      `,document.body.appendChild(e),e.querySelector(`#docsClose`).addEventListener(`click`,()=>{e.classList.remove(`active`)}),e.addEventListener(`click`,t=>{t.target===e&&e.classList.remove(`active`)}),e.querySelector(`#docsBody`).innerHTML=R.parse(yn)),e.classList.add(`active`)}},z=new y({currentMatches:null,currentEventData:null,currentRankings:null,currentTeamSummaryData:null,lastMatchAlertId:null,fullDate:new Date,teamNumber:v.teamNumber,isTestMode:!1,dataStatus:null}),B=new ne,V=new Se(v,z),xn=new ee(z,V,C,v),H=new ue(B,xn),U=new je(v,H,z,xn),Sn=new Me(B,new re(B),z,V,xn),Cn=new bn;function W(){Sn.render(v,document.getElementById(`container`))}var wn={id:`__fallback__`,label:`⚠ Missing Card`,icon:`alert-circle`,builtin:!0,render:(e,t,n,r)=>{e.innerHTML=`
            <div class="fallback-card">
                <div class="fallback-icon">⚠</div>
                <div class="fallback-title">Missing Card</div>
                <div class="fallback-id">${r}</div>
                <div class="fallback-hint">This card was not found in the registry.</div>
                <button class="fallback-remove" data-card="${r}">Remove from layout</button>
            </div>
        `;let i=e.querySelector(`.fallback-remove`);i&&i.addEventListener(`click`,()=>{let e=n.getConfig();e.layout&&(delete e.layout[r],localStorage.setItem(`layout`,JSON.stringify(e.layout)),window._pitbeaconRender&&window._pitbeaconRender())})}};function Tn(){function e(e,t,n){let r=t.currentEventData,i=e._webcastIframeCache||=new Map,a=t.fullDate||new Date,o=[];if(r?.webcasts?.length)for(let e of r.webcasts){if(e.date){let t=new Date(e.date),n=new Date(a.getFullYear(),a.getMonth(),a.getDate());if(t.getDate()!==n.getDate())continue}let t=``;e.type===`youtube`?t=`https://www.youtube.com/embed/${e.channel}`:e.type===`twitch`&&(t=`https://player.twitch.tv/?channel=${e.channel}&parent=${window.location.hostname}`),t&&o.push({url:t,type:e.type,channel:e.channel})}let s=o.map(e=>`${e.type}:${e.channel}:${e.url}`).join(`|`);if(e._webcastRenderKey===s&&e._webcastWrapper)return;e._webcastRenderKey=s,e.innerHTML=``;let c=document.createElement(`div`);if(c.style.cssText=``,!o.length){c.innerHTML=`<p class="inactive" style="text-align:center;color:var(--text-dim);font-style:italic;padding:20px;">No webcasts available.</p>`,e.appendChild(c),e._webcastWrapper=c;return}let l=document.createElement(`div`);l.style.cssText=`display:flex;flex-direction:column;gap:8px;`;for(let e of o){let t=document.createElement(`div`);t.className=`webcast-card`,t.style.cssText=`border-radius:8px;border:1px solid var(--border-accent);overflow:hidden;`;let n=i.get(e.url);n||(n=document.createElement(`iframe`),n.src=e.url,n.width=`100%`,n.height=`225`,n.frameborder=`0`,n.allowfullscreen=!0,n.style.cssText=`display:block;width:100%;aspect-ratio:16/9;`,i.set(e.url,n)),t.appendChild(n),l.appendChild(t)}c.appendChild(l),e.appendChild(c),e._webcastWrapper=c}return{id:`webcast-card`,label:`Webcasts`,icon:`device-tv`,lockedAspect:16/11,builtin:!0,render:(t,n,r)=>{t._webcastCardInitialized||=(r.updateCard(t,1e4,e,e=>e.currentEventData?.webcasts??null),!0),e(t,n,r)}}}function En(){return{id:`match-card`,label:`Matches`,icon:`tournament`,builtin:!0,render:(e,t,n)=>{e._matchCardInitialized||=(n.updateCard(e,1e3,(e,t,n)=>{Dn(e,t,n)},(e,t)=>({matches:e.currentMatches,teamNumber:t.getConfig(`teamNumber`),t:Math.floor((e.fullDate?.getTime()??Date.now())/1e3)})),!0),Dn(e,t,n)}}}function Dn(e,t,n){let r=t.currentMatches||[],i=n.getConfig(`teamNumber`),a=Math.floor(t.fullDate?.getTime()/1e3||Date.now()/1e3);if(e.innerHTML=``,!r.length){e.innerHTML=`<p class="inactive">No matches found.</p>`;return}let o=[...r].sort((e,t)=>e.predicted_time-t.predicted_time).filter(e=>e.alliances.red.team_keys.includes(`frc${i}`)||e.alliances.blue.team_keys.includes(`frc${i}`));if(!o.length){e.innerHTML=`<p class="inactive">No upcoming matches for team ${i}.</p>`;return}let s=document.createElement(`div`);s.style.cssText=`display:flex;flex-direction:column;gap:8px;padding:4px 0;`;let c=!1;for(let e=0;e<o.length;e++){let t=o[e],n=t.predicted_time,r=n-a;if(a>=n-300&&a<=n+150&&!c){c=!0;let l=document.createElement(`div`);l.className=`match-card`;let u=Math.max(0,Math.floor(r/60)),d=Math.max(0,Math.floor(r%60)),f=r<30?`countdown-urgent`:`countdown-warning`;l.innerHTML=`
                        <div class="upcoming-basicinfo">
                            <h1 class="match-title">⏰ Match Starting Soon!</h1>
                            <p>Match: ${t.comp_level.toUpperCase()} ${t.match_number}</p>
                            <p>Est: ${new Date(n*1e3).toLocaleTimeString()}</p>
                            <p class="${f}">Time Until: ${u}m ${d}s</p>
                        </div>
                        <div class="upcoming-teams">
                            ${On(t,i)}
                        </div>
                    `,s.appendChild(l);for(let t=e+1;t<o.length;t++){let e=o[t];s.appendChild(kn(e,a,i))}break}}if(!c){let e=o.filter(e=>e.predicted_time>a);e.length===0?s.innerHTML=`<p class="inactive">No upcoming matches for team ${i}.</p>`:e.forEach(e=>{s.appendChild(kn(e,a,i))})}e.appendChild(s)}function On(e,t){let n=e.alliances.red.team_keys.map(e=>e.replace(`frc`,``)),r=e.alliances.blue.team_keys.map(e=>e.replace(`frc`,``)),i=n.includes(String(t)),a=r.includes(String(t)),o=``;if(i){o+=`<div class="alliance-row user-team"><p class="red highlight">${t}</p></div>`;let e=n.filter(e=>e!==String(t));e.length&&(o+=`<div class="alliance-row">${e.map(e=>`<p class="red">${e}</p>`).join(``)}</div>`)}else o+=`<div class="alliance-row">${n.map(e=>`<p class="red">${e}</p>`).join(``)}</div>`;if(a){o+=`<div class="alliance-row user-team"><p class="blue highlight">${t}</p></div>`;let e=r.filter(e=>e!==String(t));e.length&&(o+=`<div class="alliance-row">${e.map(e=>`<p class="blue">${e}</p>`).join(``)}</div>`)}else o+=`<div class="alliance-row">${r.map(e=>`<p class="blue">${e}</p>`).join(``)}</div>`;return o}function kn(e,t,n){let r=document.createElement(`div`);r.className=`upcomingmatch-card`;let i=Math.max(0,e.predicted_time-t),a=Math.floor(i/60),o=Math.floor(i%60);return r.innerHTML=`
        <div class="upcoming-basicinfo">
            <h1 class="match-title">Upcoming Match</h1>
            <p>Match: ${e.comp_level.toUpperCase()} ${e.match_number}</p>
            <p>Est: ${new Date(e.predicted_time*1e3).toLocaleTimeString()}</p>
            <p class="countdown-warning">Time Until: ${a}m ${o}s</p>
        </div>
        <div class="upcoming-teams">
            ${On(e,n)}
        </div>
    `,r}function An(e,t,n=30){let r=e._cardAutoScroll;if(!t){r&&cancelAnimationFrame(r.frame),e._cardAutoScroll=null;return}let i=Number(n),a=Number.isFinite(i)?Math.min(120,Math.max(5,i)):30,o=a<30?Math.sqrt(a*30):a;if(r){r.speed=o;return}let s={frame:0,lastTime:0,pauseUntil:0,speed:o};e._cardAutoScroll=s;let c=t=>{if(!e.isConnected||e._cardAutoScroll!==s)e._cardAutoScroll=null;else{if(s.pauseUntil&&t>=s.pauseUntil)e.scrollTop=0,s.pauseUntil=0,s.lastTime=t;else if(!s.pauseUntil&&s.lastTime){let n=e.scrollHeight-e.clientHeight;if(n>0){let r=Math.min(t-s.lastTime,50);e.scrollTop=Math.min(n,e.scrollTop+r*s.speed/1e3),e.scrollTop>=n-1&&(s.pauseUntil=t+1200)}s.lastTime=t}else s.lastTime=t;s.frame=requestAnimationFrame(c)}};s.frame=requestAnimationFrame(c)}function jn(){return{id:`leaderboard-card`,label:`Leaderboard`,icon:`trophy`,builtin:!0,settings:{autoScroll:{type:`checkbox`,label:`Auto-scroll leaderboard`,default:!1},autoScrollSpeed:{type:`number`,label:`Scroll speed`,default:30,min:5,max:120,step:1}},render:(e,t,n)=>{let r=t.currentRankings||[],i=n.getConfig(`teamNumber`),a=n.getCardSettings(`leaderboard-card`,{autoScroll:!1,autoScrollSpeed:30});if(e.innerHTML=``,!r||!r.length){An(e,!1),e.innerHTML=`<p class="inactive" style="padding:20px;text-align:center;color:var(--text-dim);font-style:italic;">No rankings available.</p>`;return}let o=document.createElement(`div`),s=document.createElement(`table`);s.className=`leaderboard-table`,s.innerHTML=`
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
            `,o.appendChild(s),e.appendChild(o),An(e,a.autoScroll,a.autoScrollSpeed)}}}var Mn={tool:`<path d="M14.7 6.3a4 4 0 0 0 5 5L21 17l-4 4-5.7-1.3a4 4 0 0 0-5-5L5 8l4-4z"/>`,battery:`<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/><path d="M6 11v2m4-2v2"/>`,package:`<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>`,checklist:`<path d="m4 6 1.5 1.5L8 5m-4 8 1.5 1.5L8 12m-4 8 1.5 1.5L8 19"/><path d="M12 6h8m-8 7h8m-8 7h8"/>`,flag:`<path d="M5 21V4m0 0h11l-2 4 2 4H5"/>`,target:`<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>`,upload:`<path d="M12 16V4m0 0 4 4m-4-4L8 8M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>`,reset:`<path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5"/>`,play:`<path d="m6 4 14 8-14 8z"/>`,pause:`<path d="M7 4h3v16H7zm7 0h3v16h-3z"/>`,rotate:`<path d="M21 12a9 9 0 1 1-3-6.7L21 8m0-5v5h-5"/>`,trash:`<path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/>`};function Nn(e,t=16){return`<svg class="pb-icon" width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${Mn[e]??``}</svg>`}var Pn={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`};function G(e){return String(e??``).replace(/[&<>"']/g,e=>Pn[e])}var Fn=`pitbeacon:focus-part`,In={tasks:{label:`Robot`,title:`Robot Health`,icon:`tool`,add:`＋ Task`,empty:`No robot tasks logged.`},batteries:{label:`Batteries`,title:`Batteries`,icon:`battery`,add:`＋ Battery`,empty:`No batteries logged.`},parts:{label:`Parts`,title:`Parts Inventory`,icon:`package`,add:`＋ Part`,empty:`No parts tracked.`},checkins:{label:`Check-in`,title:`Pit Check-in`,icon:`checklist`,add:`＋ Task`,empty:`No check-in items.`}},Ln={tasks:`showTasks`,batteries:`showBatteries`,parts:`showParts`,checkins:`showCheckins`},Rn={pending:{label:`Pending`,cls:`chip-warn`},"in-progress":{label:`In Progress`,cls:`chip-info`},completed:{label:`Done`,cls:`chip-ok`}},zn={ready:{label:`Ready`,cls:`chip-ok`},charging:{label:`Charging`,cls:`chip-info`},dead:{label:`Dead`,cls:`chip-err`}},Bn={showTasks:{type:`checkbox`,label:`Show Robot tasks`,default:!0},showBatteries:{type:`checkbox`,label:`Show Batteries`,default:!0},showParts:{type:`checkbox`,label:`Show Parts`,default:!0},showCheckins:{type:`checkbox`,label:`Show Check-in`,default:!0},defaultSection:{type:`select`,label:`Open on`,default:`tasks`,options:[{value:`tasks`,label:`Robot`},{value:`batteries`,label:`Batteries`},{value:`parts`,label:`Parts`},{value:`checkins`,label:`Check-in`}]},hideCompleted:{type:`checkbox`,label:`Hide finished tasks and check-ins`,default:!1},flaggedFirst:{type:`checkbox`,label:`Show flagged items first`,default:!0},compact:{type:`checkbox`,label:`Compact rows`,default:!1}},Vn=Object.fromEntries(Object.entries(Bn).map(([e,t])=>[e,t.default]));function Hn(e,t){return{...Vn,...e.getCardSettings(t,Vn)}}function Un(e){let t=Object.keys(In).filter(t=>e[Ln[t]]!==!1);return t.length?t:[`tasks`]}function Wn(e,t){return Object.entries(e).map(([e,{label:n,cls:r}])=>`<button type="button" class="pit-chip ${r}${e===t?` chip-active`:``}" data-action="status" data-value="${G(e)}">${G(n)}</button>`).join(``)}function Gn(e){return`<input type="checkbox" class="flag-toggle" data-action="flag" aria-label="Flag" ${e.flagged?`checked`:``}>`}function Kn(){return`<button type="button" class="pit-del-btn" data-action="delete" aria-label="Delete">✕</button>`}function qn(e){let t=Math.min(100,Math.max(0,((parseFloat(e)||0)-10)/3*100));return{pct:t,cls:t>=70?`volt-bar-ok`:t>=40?`volt-bar-warn`:`volt-bar-err`}}var Jn={tasks(e,{listId:t}){let n=!!(e.partId&&l(e.partId));return`<div class="pit-card${e.flagged?` flagged`:``}" data-id="${G(e.id)}">
      <div class="pit-card-row">
        ${Gn(e)}
        <div class="pit-card-fields">
          <input class="pit-input" data-field="task" placeholder="Task…" value="${G(e.task)}">
          <input class="pit-input pit-sub" data-field="component" data-part-link list="${t}" placeholder="Part / component…" value="${G(e.component)}">
        </div>
        ${n?`<button type="button" class="pit-del-btn pn-locate" data-action="locate" title="Show on the 3D model" aria-label="Show on the 3D model">${Nn(`target`,14)}</button>`:``}
        ${Kn()}
      </div>
      <div class="pit-status-row">${Wn(Rn,e.status)}</div>
    </div>`},batteries(e){let{pct:t,cls:n}=qn(e.voltage);return`<div class="pit-card${e.flagged?` flagged`:``}" data-id="${G(e.id)}">
      <div class="pit-card-row">
        ${Gn(e)}
        <div class="pit-card-fields">
          <div class="batt-top-row">
            <input class="pit-input batt-id" data-field="label" placeholder="ID" value="${G(e.label)}">
            <div class="batt-volt-block">
              <input class="pit-input" data-field="voltage" data-volt type="number" step="0.1" placeholder="V" value="${G(e.voltage)}">
              <div class="volt-track"><div class="volt-bar ${n}" style="width:${t.toFixed(0)}%"></div></div>
            </div>
            <input class="pit-input batt-cycles" data-field="cycles" type="number" placeholder="Cycles" value="${G(e.cycles)}">
          </div>
        </div>
        ${Kn()}
      </div>
      <div class="pit-status-row">${Wn(zn,e.status)}</div>
    </div>`},parts(e){let t=parseInt(e.quantity,10)||0,n=parseInt(e.minStock,10)||0,r=m(e);return`<div class="pit-card part-card${r?` part-card-low`:``}${e.flagged?` flagged`:``}" data-id="${G(e.id)}">
      <div class="part-card-top">
        ${Gn(e)}
        <input class="pit-input" data-field="name" placeholder="Part name…" value="${G(e.name)}">
        ${Kn()}
      </div>
      <div class="part-qty-row">
        <div class="part-qty-block"><span class="part-qty-num ${r?`qty-low`:`qty-ok`}">${t}</span><span class="part-qty-label">have</span></div>
        <span class="part-divider">/</span>
        <div class="part-qty-block"><span class="part-qty-num part-qty-min">${n}</span><span class="part-qty-label">min</span></div>
      </div>
      ${r?`<div class="part-low-badge">⚠ LOW STOCK</div>`:`<div class="part-ok-badge">✓ OK</div>`}
      <div class="part-inputs-row">
        <label class="part-micro-label">Qty<input class="pit-input" data-field="quantity" data-restock type="number" min="0" value="${G(e.quantity)}"></label>
        <label class="part-micro-label">Min<input class="pit-input" data-field="minStock" data-restock type="number" min="0" value="${G(e.minStock)}"></label>
      </div>
    </div>`},checkins(e){return`<div class="checkin-row${e.completed?` checkin-done`:``}${e.flagged?` flagged`:``}" data-id="${G(e.id)}">
      <input type="checkbox" class="checkin-check" data-action="complete" aria-label="Done" ${e.completed?`checked`:``}>
      <input class="pit-input" data-field="task" placeholder="Task…" value="${G(e.task)}">
      <input class="pit-input checkin-assignee" data-field="assignedTo" placeholder="Who…" value="${G(e.assignedTo)}">
      ${Gn(e)}
      ${Kn()}
    </div>`}};function Yn(e,t,n){let r=t;return n.hideCompleted&&(e===`tasks`&&(r=r.filter(e=>e.status!==`completed`)),e===`checkins`&&(r=r.filter(e=>!e.completed))),n.flaggedFirst&&(r=[...r.filter(e=>e.flagged),...r.filter(e=>!e.flagged)]),r}function Xn(){return{id:`pit-notes-card`,label:`Pit Notes`,icon:`tool`,builtin:!0,settings:Bn,render(e,t,n,r=`pit-notes-card`){let i=e._pitNotes??=Zn(e,n,r);i.sdk=n,i.cardId=r,i.isEditing()?i.dirty=!0:i.draw()}}}function Zn(o,m,h){let g=`pn-parts-${h}`,_={sdk:m,cardId:h,dirty:!1,selfSaving:!1,active:null,isEditing:()=>{let e=document.activeElement;return!!(e&&o.contains(e)&&e.matches(`input:not([type=checkbox]), select`))},settings:()=>Hn(_.sdk,_.cardId),draw:b};o.innerHTML=`<div class="pit-notes">
    <div class="pit-notes-tabs" role="tablist" data-tabs></div>
    <div class="pit-header"><span class="pit-title" data-title></span><button type="button" class="pit-add-btn" data-action="add"></button></div>
    <div class="pit-body" data-body></div>
    <datalist id="${g}"></datalist>
  </div>`;let v=o.querySelector(`.pit-notes`);Object.assign(v.style,{background:`var(--bg-surface)`,borderRadius:`8px`,border:`1px solid var(--border)`,padding:`10px 12px`,height:`100%`,overflow:`auto`});function y(e){_.selfSaving=!0;try{return e()}finally{_.selfSaving=!1}}function ee(t,n){let r=e(`pitNotesSection`),i=_.active??r??n.defaultSection;return t.includes(i)?i:t[0]}function b(){_.dirty=!1;let e=_.settings(),t=Un(e),n=_.active=ee(t,e),r=i(),a=d(r);v.classList.toggle(`pit-notes-compact`,!!e.compact),v.querySelector(`[data-tabs]`).innerHTML=t.map(e=>{let{open:t,flagged:r}=a[e];return`<button type="button" class="pit-notes-tab${e===n?` active`:``}" role="tab" aria-selected="${e===n}" data-action="tab" data-section="${e}">
          ${Nn(In[e].icon,14)}<span>${In[e].label}</span>
          ${t?`<span class="pit-notes-count">${t}</span>`:``}${r?`<span class="pit-notes-flag" title="${r} flagged">${Nn(`flag`,11)}</span>`:``}
        </button>`}).join(``),v.querySelector(`[data-title]`).textContent=In[n].title,v.querySelector(`[data-action=add]`).textContent=In[n].add,v.querySelector(`datalist`).innerHTML=f().map(e=>`<option value="${G(e.name)}"></option>`).join(``);let o=Yn(n,r[n],e),s=v.querySelector(`[data-body]`);if(!o.length){s.innerHTML=`<p class="pit-empty">${G(In[n].empty)}</p>`;return}let c=o.map(e=>Jn[n](e,{listId:g})).join(``);s.innerHTML=n===`parts`?`<div class="parts-grid">${c}</div>`:c,s.dataset.section=n}function x(e){let t=e.closest(`[data-id]`);return t?{id:t.dataset.id,row:t}:null}v.addEventListener(`click`,e=>{let o=e.target.closest(`[data-action]`);if(!o||!v.contains(o))return;let l=o.dataset.action,u=_.active;if(l===`tab`)_.active=o.dataset.section,n(`pitNotesSection`,_.active),b();else if(l===`add`){let e=y(()=>c(u));b(),v.querySelector(`[data-id="${CSS.escape(e.id)}"] input:not([type=checkbox])`)?.focus()}else if(l===`status`){let e=x(o);if(!e)return;let n=o.dataset.value;(u===`tasks`?r:t).includes(n)&&y(()=>s(u,e.id,{status:n})),b()}else if(l===`delete`){let e=x(o);if(!e)return;y(()=>a(u,e.id)),b()}else if(l===`locate`){let e=x(o),t=e&&i().tasks.find(t=>t.id===e.id);t?.partId&&window.dispatchEvent(new CustomEvent(Fn,{detail:{partId:t.partId}}))}}),v.addEventListener(`change`,e=>{let t=e.target,n=x(t);if(!n)return;let r=_.active;if(t.dataset.action===`flag`){let e=t.checked;y(()=>s(r,n.id,{flagged:e})),e&&_.sdk.getConfig(`noteAlarmToggle`)&&_.sdk.triggerAlarm(`note`),b()}else if(t.dataset.action===`complete`)y(()=>s(r,n.id,{completed:t.checked})),b();else if(t.hasAttribute(`data-part-link`)){let e=t.value.trim(),i=l(e);y(()=>s(r,n.id,i?{partId:i.id,component:i.name}:{partId:null,component:e})),b()}else t.hasAttribute(`data-restock`)&&b()}),v.addEventListener(`input`,e=>{let t=e.target,n=t.dataset.field,r=x(t);if(n&&r&&!t.hasAttribute(`data-part-link`)){if(y(()=>s(_.active,r.id,{[n]:t.value})),t.hasAttribute(`data-volt`)){let{pct:e,cls:n}=qn(t.value),i=r.row.querySelector(`.volt-bar`);i&&(i.style.width=`${e.toFixed(0)}%`,i.className=`volt-bar ${n}`)}else if(t.hasAttribute(`data-restock`)){let e=r.row.querySelector(`[data-field="minStock"]`)?.value,t=r.row.querySelector(`[data-field="quantity"]`)?.value;r.row.classList.toggle(`part-card-low`,(parseInt(t,10)||0)<=(parseInt(e,10)||0))}}}),v.addEventListener(`focusout`,()=>{setTimeout(()=>{_.dirty&&!_.isEditing()&&o.isConnected&&b()},0)});let S=()=>{o.isConnected?_.selfSaving||(_.isEditing()?_.dirty=!0:b()):te()},te=()=>{window.removeEventListener(u,S),window.removeEventListener(p,S),window.removeEventListener(`storage`,C)},C=e=>{(e.key===null||e.key===`pitNotes`||e.key===`robotParts`||e.key===`cardSettings`)&&S()};return window.addEventListener(u,S),window.addEventListener(p,S),window.addEventListener(`storage`,C),_}var Qn=3e3;function K(e,t=`message`){let n=document.getElementById(`errorcontainer`);if(!n)return;let r=document.createElement(`div`);r.className=t===`error`?`error`:`message`;let i=document.createElement(`p`);i.className=`error-exit`,i.textContent=`X`;let a=document.createElement(`p`);a.textContent=String(e??``),r.append(i,a),n.appendChild(r),setTimeout(()=>r.remove(),Qn)}function $n(){window.displayMessage=K}var er=[`--text-primary`,`--text-muted`,`--border`,`--accent`,`--bg-input`];function tr(){let e=getComputedStyle(document.documentElement),t={};for(let n of er){let r=e.getPropertyValue(n).trim();r&&(t[n]=r)}return t}function nr(){return{id:`robot-viewer-card`,label:`Robot Viewer`,icon:`cube`,builtin:!0,selfRefresh:!0,settings:{},render(e){if(e.selfRefresh=!0,e._robotViewer)return;let t=document.createElement(`iframe`);t.className=`robot-viewer-frame`,t.title=`3D robot viewer`,t.src=new URL(`viewer.html`,document.baseURI).href,t.setAttribute(`allow`,`fullscreen`),t.loading=`eager`,e.replaceChildren(t);let n=e=>t.contentWindow?.postMessage({source:`pitbeacon`,...e},location.origin),r=()=>n({type:`theme`,vars:tr()}),i=e=>{let t=e.detail?.partId;t&&n({type:`focus-part`,partId:t})},a=e=>{if(e.origin!==location.origin||e.source!==t.contentWindow)return;let n=e.data;n?.source===`pitbeacon-viewer`&&(n.type===`ready`?r():n.type===`notify`&&typeof n.message==`string`&&K(n.message,n.level===`error`?`error`:`message`))},o=new MutationObserver(r);o.observe(document.documentElement,{attributes:!0,attributeFilter:[`style`,`class`,`data-theme`]});let s=()=>{window.removeEventListener(Fn,i),window.removeEventListener(`message`,a),o.disconnect(),e._robotViewer=null};window.addEventListener(Fn,i),window.addEventListener(`message`,a),t.addEventListener(`load`,r);let c=new MutationObserver(()=>{e.isConnected&&e.contains(t)||(c.disconnect(),s())});c.observe(document.body,{childList:!0,subtree:!0}),e._robotViewer={frame:t,post:n}}}}function q(e,t=1){return typeof e!=`number`||!Number.isFinite(e)?`–`:e.toFixed(t).replace(/\.?0+$/,``)}function J(e,t,n,r=!1){let i=document.createElement(`div`);i.className=`stats-row`;let a=document.createElement(`span`);a.className=`stats-label`,a.textContent=t;let o=document.createElement(`span`);o.className=r?`stats-value stats-accent`:`stats-value`,o.textContent=n,i.append(a,o),e.appendChild(i)}function rr(e,t){let n=document.createElement(`h3`);n.className=`stats-section-title`,n.textContent=t,e.appendChild(n)}function ir(e,t,n=!1){An(e,!1),e.replaceChildren();let r=document.createElement(`p`);r.className=n?`stats-error`:`stats-message`,r.textContent=t,e.appendChild(r)}function ar(e,t,n,r){e.replaceChildren();let i=document.createElement(`div`);i.className=`stats-team-heading`;let a=document.createElement(`strong`);a.textContent=`Team ${n}`;let o=document.createElement(`span`);o.className=`stats-year`,o.textContent=String(t.year||r),i.append(a,o),e.appendChild(i);let s=document.createElement(`div`);s.className=`stats-primary`;let c=document.createElement(`span`);c.className=`stats-label`,c.textContent=`Match13 expected points (xP)`;let l=document.createElement(`strong`);l.className=`stats-primary-value`,l.textContent=q(t.xp),s.append(c,l),e.appendChild(s),rr(e,`Season ranking`),J(e,`Normalized xP`,q(t.normXp)),J(e,`Match13 rank`,t.rank?`#${t.rank}`:`–`,!0),J(e,`Percentile`,typeof t.percentile==`number`?`${q(t.percentile)}%`:`–`,!0),rr(e,`Expected scoring`),J(e,`Autonomous`,q(t.xAuto)),J(e,`Teleoperated`,q(t.xTele)),J(e,`Endgame`,q(t.xEnd)),rr(e,`Comparison ratings`),J(e,`EPA`,q(t.epa)),J(e,`OPR`,q(t.opr)),J(e,`DPR`,q(t.dpr));let u=Object.entries(t.components||{});if(u.length){rr(e,`Estimated game pieces`);for(let[t,n]of u)J(e,t,q(n))}let d=document.createElement(`div`);d.className=`stats-footer`;let f=document.createElement(`a`);f.className=`stats-link`,f.href=`https://www.match13.com/docs/api`,f.target=`_blank`,f.rel=`noopener noreferrer`,f.textContent=`About Match13 ratings ↗`,d.appendChild(f),e.appendChild(d)}function or(){return{id:`stats-card`,label:`Team Stats`,icon:`chart-bar`,builtin:!0,settings:{autoScroll:{type:`checkbox`,label:`Auto-scroll team stats`,default:!1},autoScrollSpeed:{type:`number`,label:`Scroll speed`,default:30,min:5,max:120,step:1}},render:async(e,t,n)=>{e._statsCardInitialized||=(e.innerHTML=`
          <div class="stats-shell">
            <div class="pit-header">
              <span class="pit-title"><i class="ti ti-chart-bar"></i> Team Stats</span>
              <button class="pit-add-btn" type="button">↻ Refresh</button>
            </div>
            <div class="stats-body"></div>
          </div>
        `,!0);let r=e.querySelector(`.stats-body`),i=e.querySelector(`.pit-add-btn`),a=String(n.getConfig(`teamNumber`)||``).trim(),o=n.getCardSettings(`stats-card`,{autoScroll:!1,autoScrollSpeed:30});An(r,o.autoScroll,o.autoScrollSpeed);let s=String(n.getConfig(`match13apikey`)||``).trim().replace(/^Bearer\s+/i,``),c=String(n.getConfig(`match13ProxyUrl`)||``).trim().replace(/\/+$/,``),l=t.fullDate instanceof Date?t.fullDate.getFullYear():new Date().getFullYear(),u=async()=>{if(!/^\d+$/.test(a))ir(r,`Enter a valid team number in Settings.`,!0);else if(!s)ir(r,`Add your Match13 API key in Settings to load team stats.`);else if(!s.startsWith(`m13_live_`))ir(r,`Match13 API keys should start with m13_live_. Check that the complete key was copied into Settings.`,!0);else if(!c)ir(r,`PitBeacon's Match13 proxy has not been configured yet. Please try again later.`,!0);else{i.disabled=!0,ir(r,`Loading Match13 team stats…`);try{let e=await fetch(`${c}/v1/teams/${a}/years/${l}`,{headers:{Authorization:`Bearer ${s}`}}),t=await e.text(),n=null;if(t)try{n=JSON.parse(t)}catch{if(e.ok)throw Error(`Match13 returned an invalid response.`)}let i=n?.detail||n?.title||n?.message;if(e.status===404)throw Error(`Match13 has no season data for team ${a} in ${l}.`);if(e.status===401||e.status===403)throw Error(`Match13 rejected the API key (HTTP ${e.status}). The request uses the required Bearer authorization format. Verify the complete, active Match13 key from match13.com/account and save Settings.${i?` API detail: ${i}`:``}`);if(e.status===429)throw Error(`Match13 rate limit reached. Try again later.`);if(!e.ok)throw Error(`Match13 request failed (HTTP ${e.status}).${i?` ${i}`:``}`);if(!n||typeof n!=`object`||Array.isArray(n))throw Error(`Match13 returned an invalid team stats response.`);ar(r,n,a,l),An(r,o.autoScroll,o.autoScrollSpeed)}catch(e){let t=e instanceof TypeError?`Could not reach Match13 through PitBeacon's proxy. Please try again later. ${e.message}`:e.message||`An unexpected error occurred.`;ir(r,t,!0)}finally{i.disabled=!1}}};i.onclick=u;let d=`${a}:${l}:${s}:${c}`;e._statsLoadKey!==d&&(e._statsLoadKey=d,await u())}}}function sr(e){let t=String(e??``).trim(),n=t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(n)return{year:Number(n[1]),month:Number(n[2])-1,day:Number(n[3])};let r=new Date(t);return!t||Number.isNaN(r.getTime())?null:{year:r.getFullYear(),month:r.getMonth(),day:r.getDate()}}function cr({testMode:e,testDate:t}={},n=new Date){if(!e)return n;let r=sr(t);return r?new Date(r.year,r.month,r.day,n.getHours(),n.getMinutes(),n.getSeconds()):n}function lr(e,{teamNumber:t,nowSeconds:n,thresholdSeconds:r,lastAlertId:i}){let a=`frc${t}`;for(let t of e||[]){let e=t.alliances?.red?.team_keys||[],o=t.alliances?.blue?.team_keys||[];if(!e.includes(a)&&!o.includes(a))continue;let s=t.predicted_time-n,c=`${t.comp_level}-${t.match_number}`;if(s>0&&s<=r&&i!==c)return{match:t,matchId:c,secondsUntil:s}}return null}function ur(e,t){let n=lr(e.currentMatches,{teamNumber:v.teamNumber,nowSeconds:Math.floor(t.getTime()/1e3),thresholdSeconds:v.matchAlertThreshold,lastAlertId:e.lastMatchAlertId});if(!n)return;let r=C[v.matchAlarmSound]||C.alarm1;r.currentTime=0,r.play().catch(e=>console.log(`Audio play failed:`,e)),z.update({lastMatchAlertId:n.matchId});let i=Math.floor(n.secondsUntil/60),a=Math.floor(n.secondsUntil%60);K(`Match Alert: ${n.match.comp_level.toUpperCase()} ${n.match.match_number} in ${i}m ${a}s!`,`message`)}function dr(){let e=cr(v),t=document.getElementById(`time-display`);t&&(t.textContent=e.toLocaleTimeString(`en-US`,{hour12:!0})),z.update({fullDate:e,isTestMode:!!v.testMode});let n=z.getState();n.currentMatches&&v.matchAlarmToggle&&ur(n,e)}function fr(){return dr(),setInterval(dr,1e3)}var pr=`pitbeacon`,mr=1,hr=[`snapshots`,`models`],gr=null;function _r(){return gr||(gr=new Promise((e,t)=>{if(typeof indexedDB>`u`){t(Error(`IndexedDB unavailable`));return}let n=indexedDB.open(pr,mr);n.onupgradeneeded=()=>{let e=n.result;for(let t of hr)e.objectStoreNames.contains(t)||e.createObjectStore(t)},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error),n.onblocked=()=>t(Error(`IndexedDB upgrade blocked by another tab`))}).catch(e=>{throw gr=null,e}),gr)}async function vr(e,t,n){let r=await _r();return new Promise((i,a)=>{let o=r.transaction(e,t),s=n(o.objectStore(e));o.oncomplete=()=>i(s?.result),o.onerror=()=>a(o.error),o.onabort=()=>a(o.error)})}var yr={get:(e,t)=>vr(e,`readonly`,e=>e.get(t)),set:(e,t,n)=>vr(e,`readwrite`,e=>e.put(n,t)),delete:(e,t)=>vr(e,`readwrite`,e=>e.delete(t)),keys:e=>vr(e,`readonly`,e=>e.getAllKeys()),clear:e=>vr(e,`readwrite`,e=>e.clear())},br=`latest`,xr=12096e5;async function Sr({teamNumber:e,matches:t,eventData:n,rankings:r,teamSummary:i}){try{return await yr.set(`snapshots`,br,{teamNumber:String(e),matches:t,eventData:n,rankings:r,teamSummary:i,savedAt:Date.now()}),!0}catch{return!1}}async function Cr(e,t=Date.now()){try{let n=await yr.get(`snapshots`,br);return!n||String(n.teamNumber)!==String(e)||t-n.savedAt>xr?null:n}catch{return null}}var wr=3e4,Tr=3e4,Er=null;async function Dr(){try{let e=await V.fetchAll();if(!e)return;let t=await V.fetchTeamSummary(e.eventData?.key);z.update({currentMatches:e.matches,currentEventData:e.eventData,currentRankings:e.rankings,currentTeamSummaryData:t,dataStatus:{stale:e.stale,lastUpdate:e.fetchedAt,source:`live`}}),Sn.updateCards(z.getState()),!e.stale&&(e.matches||e.eventData)&&Sr({teamNumber:v.teamNumber,matches:e.matches,eventData:e.eventData,rankings:e.rankings,teamSummary:t})}catch(e){K(`Network Error: ${e.message}`,`error`)}}function Or(){return Er||=Dr().finally(()=>{Er=null}),Er}async function kr(){let e=await Cr(v.teamNumber);return!e||z.getState().dataStatus?.source===`live`?!1:(z.update({currentMatches:e.matches,currentEventData:e.eventData,currentRankings:e.rankings,currentTeamSummaryData:e.teamSummary,dataStatus:{stale:!0,lastUpdate:e.savedAt,source:`cache`}}),Sn.updateCards(z.getState()),!0)}function Ar(){setTimeout(()=>{Or(),Ar()},wr+Math.random()*Tr)}function jr(){Or(),Ar(),window.addEventListener(`online`,()=>Or()),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&Or()})}function Mr(){window.pitbeaconRefreshTeamData=async()=>{let e=z.getState().currentEventData?.key,t=await V.fetchTeamSummary(e);return z.update({currentTeamSummaryData:t}),Sn.updateCards(z.getState()),t}}function Nr(e){return new Date(e).toLocaleTimeString(`en-US`,{hour:`numeric`,minute:`2-digit`})}function Pr(){let e=document.getElementById(`netStatus`);if(!e)return;let t=()=>{let t=z.getState().dataStatus,n=typeof navigator<`u`&&navigator.onLine===!1,r=n||!!t?.stale;if(e.hidden=!r,!r)return;let i=n?`Offline`:`Connection issue`;e.textContent=t?.lastUpdate?`${i} · data from ${Nr(t.lastUpdate)}`:i};z.subscribe(t),window.addEventListener(`online`,t),window.addEventListener(`offline`,t),t()}function Fr(){return{enabled:!0,gridCols:v.gridCols,gridRows:v.gridRows,layout:JSON.parse(JSON.stringify(v.layout||{})),hiddenCards:[...v.hiddenSections||[]]}}function Ir(e){e===`Default`&&(delete v.layoutProfiles.Default,localStorage.setItem(`layoutProfiles`,JSON.stringify(v.layoutProfiles)));let t=Fr();v.layoutProfiles[e]=t,v.activeProfileName=e,localStorage.setItem(`layoutProfiles`,JSON.stringify(v.layoutProfiles)),localStorage.setItem(`activeProfileName`,e),Rr(),K(`Profile "${e}" saved!`,`message`)}function Lr(e){let t;t=e===`Default`?{gridCols:3,gridRows:3,layout:structuredClone(_),hiddenCards:[]}:v.layoutProfiles[e],t?(v.gridCols=t.gridCols,v.gridRows=t.gridRows,v.gridSize=t.gridCols,v.layout=JSON.parse(JSON.stringify(t.layout)),v.hiddenSections=t.hiddenCards||[],v.activeProfileName=e,localStorage.setItem(`gridCols`,v.gridCols),localStorage.setItem(`gridRows`,v.gridRows),localStorage.setItem(`gridSize`,v.gridCols),localStorage.setItem(`layout`,JSON.stringify(v.layout)),localStorage.setItem(`hiddenCards`,JSON.stringify(v.hiddenSections)),localStorage.setItem(`activeProfileName`,e),W(),Rr()):K(`Profile "${e}" not found.`,`error`)}function Rr(){let e=document.getElementById(`profileSelect`);e&&(e.innerHTML=`<option value="Default">Default</option>`,Object.keys(v.layoutProfiles).filter(e=>e!==`Default`).forEach(t=>{let n=document.createElement(`option`);n.value=t,n.textContent=t,e.appendChild(n)}),e.value=v.activeProfileName||`Default`);let t=document.getElementById(`profileSwitcher`);if(!t)return;let n=[...Object.keys(v.layoutProfiles)];n.length<=1?t.innerHTML=``:(t.innerHTML=n.map(e=>{let t=v.layoutProfiles[e].enabled!==!1;return`  <div class="profile-btn${e===v.activeProfileName?` profile-btn-active`:``}" data-profile="${e}">
    ${e}
    <input type="checkbox" class="proftoggle" name="profiletoggle" data-profile="${e}" ${t?`checked`:``}>
  </div>`}).join(``),t.querySelectorAll(`.profile-btn`).forEach(e=>{e.addEventListener(`click`,()=>Lr(e.dataset.profile))}),t.querySelectorAll(`input[name='profiletoggle']`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.profile,r=v.layoutProfiles[n];r&&(r.enabled=e.checked,localStorage.setItem(`layoutProfiles`,JSON.stringify(v.layoutProfiles)),Vr())})}))}var zr=null;function Br(){return[`Default`,...Object.keys(v.layoutProfiles||{}).filter(e=>e!==`Default`)].filter(e=>v.layoutProfiles[e]?.enabled!==!1)}function Vr(){if(zr&&=(clearInterval(zr),null),!v.autoSwapEnabled)return;let e=Br();e.length<2||(zr=setInterval(()=>{let t=e.indexOf(v.activeProfileName),n=e[(t+1)%e.length];Lr(n)},v.autoSwapInterval*1e3))}function Hr(e){let t={};try{t=JSON.parse(localStorage.getItem(`cardSettings`)||`{}`)[e.id]||{}}catch{}let n={},r=Ur(e);return e.settings=r,Object.entries(r).forEach(([r,i])=>{let a=typeof i==`string`?{type:`text`,default:i}:i||{};n[r]=t[r]??e.settingsValues?.[r]??a.default??(a.type!==`checkbox`&&``)}),n}function Ur(e){return Object.keys(e?.settings||{}).length?e.settings:Ae(e?.js||``)}function Wr(e,t){let n={};try{n=JSON.parse(localStorage.getItem(`cardSettings`)||`{}`)}catch{}n[e]=t,localStorage.setItem(`cardSettings`,JSON.stringify(n))}function Gr(e){let t=String(e||`1.0.0`).match(/^(\d+)\.(\d+)\.(\d+)$/);return t?`${t[1]}.${t[2]}.${Number(t[3])+1}`:`1.0.1`}function Kr(e,t,n,r){let i=Object.entries(Ur(t));if(!i.length)return;let a=document.createElement(`div`);a.className=`card-settings-controls`;let o=document.createElement(`strong`);o.textContent=`Card settings`,a.appendChild(o),i.forEach(([e,i])=>{let o=typeof i==`string`?{type:`text`,default:i}:i||{},s=document.createElement(`label`);s.className=`card-setting-field`;let c=document.createElement(`span`);c.textContent=o.label||e,s.appendChild(c);let l=document.createElement(o.type===`select`?`select`:`input`);l.name=e,l.type=o.type===`select`?`text`:o.type||`text`,o.type===`select`&&(o.options||[]).forEach(e=>{let t=document.createElement(`option`);t.value=e.value??e,t.textContent=e.label??e,l.appendChild(t)}),o.min!==void 0&&(l.min=o.min),o.max!==void 0&&(l.max=o.max),o.step!==void 0&&(l.step=o.step),o.type===`checkbox`?l.checked=!!n[e]:l.value=n[e],l.addEventListener(`input`,()=>{n[e]=o.type===`checkbox`?l.checked:l.value,Wr(t.id,n),r(n)}),s.appendChild(l),a.appendChild(s)}),e.appendChild(a)}async function qr(e){let t=e.querySelector(`#cardCatalogList`),n=e.querySelector(`#cardCatalogStatus`);if(t&&n&&(t.innerHTML=``,n.textContent=U.isConfigured()?`Loading approved cards...`:`Catalog backend is not configured yet. Add the Supabase values in config.js.`,U.isConfigured()))try{let e=await U.listApproved(),r=[...e.reduce((e,t)=>(e.has(t.id)||e.set(t.id,[]),e.get(t.id).push(t),e),new Map).values()];n.textContent=e.length?``:`No approved community cards yet.`,r.forEach(e=>{e.sort((e,t)=>String(t.version).localeCompare(String(e.version),void 0,{numeric:!0}));let n=e[0],r=document.createElement(`article`);r.className=`catalog-card-item`,r.tabIndex=0,r.innerHTML=`<div class="catalog-card-info"><strong></strong><span></span></div><div class="catalog-card-preview"></div>`,r.querySelector(`strong`).textContent=n.label,r.querySelector(`span`).textContent=n.description||`Community card`,t.appendChild(r),U.renderPreview(r.querySelector(`.catalog-card-preview`),n,`catalog-tile-${n.id}`);let i=()=>Jr(e);r.addEventListener(`click`,i),r.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),i())})})}catch(e){n.textContent=e.message}}function Jr(e){let t=document.getElementById(`cardCatalogDetailModal`),n=t.querySelector(`#cardCatalogDetailTitle`),r=t.querySelector(`#cardCatalogDetailDescription`),i=t.querySelector(`#cardCatalogDetailVersion`),a=t.querySelector(`#cardCatalogDetailPreview`),o=t.querySelector(`#cardCatalogDetailSettings`),s=t.querySelector(`#cardCatalogDetailSave`),c=t.querySelector(`#cardCatalogDetailStatus`);e=[...e].sort((e,t)=>String(t.version).localeCompare(String(e.version),void 0,{numeric:!0})),i.innerHTML=e.map(e=>`<option value="${e.version}">${e.version}</option>`).join(``);let l=e[0],u,d=()=>{n.textContent=l.label,r.textContent=l.description||`Community card`,u=Hr(l),o.innerHTML=``,U.renderPreview(a,l,`catalog-detail-${l.id}`),Kr(o,l,u,e=>{l.settingsValues=e,U.renderPreview(a,l,`catalog-detail-${l.id}`)}),s.disabled=!1,c.textContent=``};i.onchange=()=>{l=e.find(e=>e.version===i.value)||e[0],d()},s.onclick=()=>{let e=B.get(l.id);e?.builtin?c.textContent=`Card ID is already used by a built-in card.`:(v.developerCards[l.id]={label:l.label,description:l.description,icon:l.icon,version:l.version,settings:l.settings,settingsValues:u,html:l.html,css:l.css,js:l.js},g(`developerCards`,v.developerCards),e&&B.unregister(l.id),B.register(l.id,H.createCardDefinition(l.id,v.developerCards[l.id])),s.disabled=!0,c.textContent=`Saved. Add it from the Layout Editor.`,W())},t.classList.add(`active`),d()}function Yr(e){let t=e.querySelector(`#cardUploadForm`),n=e.querySelector(`#cardUploadLocalCard`),r=e.querySelector(`#cardUploadStatus`);t&&n&&r&&(Zr(e),t.addEventListener(`submit`,async i=>{i.preventDefault();let a=n?.value;if(!a)r.textContent=`Select a saved card first.`;else try{let n=[{id:a,...v.developerCards[a]}],i=e.querySelector(`#cardUploadAuthor`).value.trim(),o=e.querySelector(`#cardUploadDescription`).value.trim();r.textContent=`Submitting for review...`;for(let e of n){let t=Ae(e.js||``),n={...e,authorName:i,description:o,settings:t},a=(await U.listApproved()).filter(t=>t.id===e.id),s=a.find(e=>Te(e)===Te(n));if(s){r.textContent=`Version ${s.version} is already approved.`;continue}let c=null;if(a.length){let e=[...a].sort((e,t)=>String(t.version).localeCompare(String(e.version),void 0,{numeric:!0}))[0];if(!confirm(`This card already exists. Request an update to ${e.version}?`))continue;let t=await Xr(e.version);if(!t?.trim())continue;n.version=t.trim(),c={id:e.id,version:e.version}}await U.submit({...n,updateOf:c})}r.textContent=`Submitted. It will appear after moderation.`,t.reset()}catch(e){r.textContent=e.message}}))}function Xr(e){let t=document.getElementById(`cardUpdateModal`),n=document.getElementById(`cardUpdateMessage`),r=document.getElementById(`cardUpdateVersion`),i=document.getElementById(`cardUpdateConfirm`),a=document.getElementById(`cardUpdateCancel`);return!t||!r||!i||!a?Promise.resolve(null):(n.textContent=`This card already exists at version ${e}. Choose a new version to request an update.`,r.value=Gr(e),t.classList.add(`active`),new Promise(e=>{let n=n=>{t.classList.remove(`active`),i.removeEventListener(`click`,o),a.removeEventListener(`click`,s),e(n)},o=()=>n(r.value.trim()||null),s=()=>n(null);i.addEventListener(`click`,o),a.addEventListener(`click`,s),r.focus(),r.select()}))}function Zr(e=document.getElementById(`cardUploadModal`)){let t=e?.querySelector(`#cardUploadLocalCard`);if(!t)return;let n=t.options[0]?.cloneNode(!0);t.innerHTML=``,n&&t.appendChild(n);let r=Object.keys(v.developerCards||{});r.forEach(e=>{let n=document.createElement(`option`);n.value=e,n.textContent=v.developerCards[e].label||e,t.appendChild(n)}),t.disabled=r.length===0,n&&(n.textContent=r.length?n.textContent:`No saved cards available`,t.options[0].textContent=n.textContent)}var Y=null;function Qr(){return B.listCards().filter(e=>e!==`__fallback__`)}function $r(e){let t=B.get(e),n=t.developer||!1,r=v.hiddenSections.includes(e),i=v.developerCards[e],a=G(e);return`<div class="card-manager-item" data-card-id="${a}">
    <div class="card-manager-item-info">
      ${n?`<label class="card-manager-export-select" title="Select ${a} for export"><input type="checkbox" class="card-export-checkbox" data-card-id="${a}"> Export</label>`:``}
      <span class="card-manager-item-icon">📄</span>
      <span class="card-manager-item-id">${a}</span>
      <span class="card-manager-item-label">${G(t.label)}</span>
      ${n&&i?.description?`<span class="card-manager-item-description">${G(i.description)}</span>`:``}
      ${n?`<span class="card-manager-item-badge">Custom</span>`:``}
      ${t.builtin?`<span class="card-manager-item-badge builtin">Built-in</span>`:``}
      ${r?`<span class="card-manager-item-badge" style="background:rgba(200,50,50,0.2);color:rgb(220,80,80);">Hidden</span>`:``}
    </div>
    ${n?`<div class="card-manager-card-preview"></div>`:``}
    <div class="card-manager-item-actions">
      ${n?`<button type="button" class="card-manager-item-edit" data-card-id="${a}">Edit</button>`:``}
      ${n?`<button type="button" class="card-manager-item-delete" data-card-id="${a}">Delete</button>`:``}
      <button type="button" class="card-manager-item-toggle" data-card-id="${a}">${r?`Show`:`Hide`}</button>
    </div>
  </div>`}function ei(){let e=Y?.querySelector(`#cardManagerList`);if(!e)return;let t=Qr(),n=t.filter(e=>B.get(e)?.builtin),r=t.filter(e=>B.get(e)?.developer);e.innerHTML=`
    <section class="card-manager-section">
      <h3 class="card-manager-section-title">Built-in Cards</h3>
      <div class="card-manager-section-list card-manager-builtins">
        ${n.length?n.map($r).join(``):`<p class="card-manager-empty">No built-in cards.</p>`}
      </div>
    </section>
    <section class="card-manager-section">
      <h3 class="card-manager-section-title">Your Custom Cards</h3>
      <div class="card-manager-section-list card-manager-developer-grid">
        ${r.length?r.map($r).join(``):`<p class="card-manager-empty">No custom cards yet. Browse the Catalog or build one in Create.</p>`}
      </div>
    </section>`,e.querySelectorAll(`.card-manager-card-preview`).forEach(e=>{let t=e.closest(`.card-manager-item`),n=t.dataset.cardId,r={id:n,...v.developerCards[n]};U.renderPreview(e,r,`registry-tile-${n}`),t.classList.add(`card-manager-developer-card`)})}function ti(e){let t=v.hiddenSections.indexOf(e);t>=0?v.hiddenSections.splice(t,1):v.hiddenSections.push(e),g(`hiddenCards`,v.hiddenSections),ei(),W()}function ni(e){confirm(`Delete custom card "${e}"?`)&&(delete v.developerCards[e],g(`developerCards`,v.developerCards),B.unregister(e),ei(),W())}function ri(){let e=[...Y.querySelectorAll(`.card-export-checkbox:checked`)].map(e=>e.dataset.cardId);e.length?e.forEach((e,t)=>{let n=new Blob([JSON.stringify({[e]:v.developerCards[e]},null,2)],{type:`application/json`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`pitbeacon-card-${e}.json`,setTimeout(()=>{i.click(),URL.revokeObjectURL(r)},t*150)}):K(`Select at least one custom card to export.`,`error`)}function ii(e){let t=new FileReader;t.onload=e=>{try{let t=JSON.parse(e.target.result);if(!t||typeof t!=`object`||Array.isArray(t))throw Error(`File is not a PitBeacon card export.`);let n=Object.entries(t);n.forEach(([e,t])=>{if(!t||typeof t!=`object`)throw Error(`Card "${e}" is not valid.`);let n=B.get(e);if(n&&!n.developer)throw Error(`Cannot import over built-in card "${e}".`)}),n.forEach(([e,t])=>{let n=H.createCardDefinition(e,t);n.allowOverride=!0,v.developerCards[e]=t,B.register(e,n)}),g(`developerCards`,v.developerCards),ei(),W(),K(`Cards imported successfully!`,`message`)}catch(e){K(`Import failed: ${e.message}`,`error`)}},t.readAsText(e)}function ai(e,{onEdit:t}){Y=e,Y.addEventListener(`click`,e=>{let n=e.target.closest(`button[data-card-id]`);if(n){let e=n.dataset.cardId;n.classList.contains(`card-manager-item-toggle`)?ti(e):n.classList.contains(`card-manager-item-delete`)?ni(e):n.classList.contains(`card-manager-item-edit`)&&t?.(e);return}let r=e.target.closest(`.card-manager-developer-card`);if(r&&!e.target.closest(`button, input, label`)){let e=r.dataset.cardId;Jr([{id:e,...v.developerCards[e]}])}}),Y.querySelector(`#cardManagerExport`).addEventListener(`click`,ri);let n=Y.querySelector(`#cardManagerFileInput`);Y.querySelector(`#cardManagerImport`).addEventListener(`click`,()=>n.click()),n.addEventListener(`change`,()=>{let e=n.files[0];e&&ii(e),n.value=``})}var oi=[`mine`,`catalog`,`create`],X,si=!1,ci=!1,li=`mine`;function ui(e){return X.querySelector(`.cards-panel[data-panel="${e}"]`)}function di(){let e=X.querySelector(`#devCardModal`);return si||=(H.initEditor(e),!0),e}function fi(e,{reload:t=!1}={}){if(oi.includes(e)||(e=`mine`),li=e,X.querySelectorAll(`.cards-tab`).forEach(t=>{let n=t.dataset.tab===e;t.setAttribute(`aria-selected`,String(n)),t.tabIndex=n?0:-1}),oi.forEach(t=>{ui(t).hidden=t!==e}),e===`mine`&&ei(),e===`catalog`&&(!ci||t)&&(ci=!0,qr(X)),e===`create`){let e=di();e.classList.remove(`active`),e.offsetWidth,e.classList.add(`active`)}}function pi(e=`mine`){X.classList.add(`active`),fi(e),X.querySelector(`.cards-tab[data-tab="${li}"]`)?.focus()}function mi(){X.classList.remove(`active`),X.querySelector(`#cardCatalogList`).innerHTML=``,ci=!1}function hi(e){fi(`create`);let t=X.querySelector(`#devCardModal`);setTimeout(()=>t._devCardLoad?.(e),0)}function gi({detail:e}){let{id:t,def:n}=e;v.developerCards[t]=n;let r=B.get(t);r?.developer&&!r.settings&&n.js&&(n.settings=Ae(n.js)),n.settingsValues=Hr({id:t,...n}),Zr(),li===`mine`&&ei()}function _i(){if(X=document.getElementById(`cardsModal`),!X)return;ai(ui(`mine`),{onEdit:hi}),Yr(document.getElementById(`cardUploadModal`)),X.querySelectorAll(`.cards-tab`).forEach((e,t,n)=>{e.addEventListener(`click`,()=>fi(e.dataset.tab)),e.addEventListener(`keydown`,e=>{let r={ArrowRight:1,ArrowLeft:-1}[e.key];if(!r)return;let i=n[(t+r+n.length)%n.length];i.focus(),fi(i.dataset.tab)})}),X.querySelector(`#cardsClose`).addEventListener(`click`,mi),X.addEventListener(`click`,e=>{e.target===X&&mi()}),document.addEventListener(`keydown`,e=>{if(e.key!==`Escape`||!X.classList.contains(`active`))return;let t=document.querySelector(`#cardCatalogDetailModal.active, #cardUploadModal.active, #cardUpdateModal.active`);t?t.classList.remove(`active`):mi()}),X.querySelector(`#devCardGuide`).addEventListener(`click`,()=>Cn.open()),X.querySelector(`#cardCatalogSubmit`).addEventListener(`click`,()=>{Zr(),document.getElementById(`cardUploadModal`).classList.add(`active`)}),window.addEventListener(`pitbeacon:card-saved`,gi),[`cardCatalogDetailModal`,`cardUploadModal`].forEach(e=>{let t=document.getElementById(e);t?.addEventListener(`click`,e=>{e.target===t&&t.classList.remove(`active`)})});let e=(e,t)=>document.getElementById(e)?.addEventListener(`click`,()=>{document.getElementById(t).classList.remove(`active`)});e(`cardCatalogDetailClose`,`cardCatalogDetailModal`),e(`cardUploadClose`,`cardUploadModal`),document.getElementById(`cardUpdateClose`)?.addEventListener(`click`,()=>{document.getElementById(`cardUpdateCancel`)?.click()}),document.getElementById(`cardsBtn`)?.addEventListener(`click`,()=>pi(`mine`)),window.addEventListener(`pitbeacon:cards-changed`,()=>{li===`mine`&&ei()})}function vi(){let e=[`--bg-base`,`--bg-surface`,`--bg-raised`,`--bg-input`,`--accent`,`--accent-hover`,`--border`,`--border-accent`,`--text-primary`,`--text-muted`,`--text-dim`,`--scrollbar-track`,`--scrollbar-thumb`,`--scrollbar-thumb-hover`],t={};e.forEach(e=>{let n=document.documentElement.style.getPropertyValue(e).trim();n&&(t[e]=n)}),localStorage.setItem(`customColors`,JSON.stringify(t))}function yi(){try{let e=JSON.parse(localStorage.getItem(`customColors`)||`{}`);Object.entries(e).forEach(([e,t])=>document.documentElement.style.setProperty(e,t))}catch{}}function bi(){let e=[`--bg-base`,`--bg-surface`,`--bg-raised`,`--bg-input`,`--accent`,`--accent-hover`,`--border`,`--border-accent`,`--text-primary`,`--text-muted`,`--text-dim`,`--scrollbar-track`,`--scrollbar-thumb`,`--scrollbar-thumb-hover`],t={};return e.forEach(e=>{let n=document.documentElement.style.getPropertyValue(e).trim();n&&(t[e]=n)}),t}function xi(e){let t=e.match(/\d+/g);return t?`#`+t.slice(0,3).map(e=>parseInt(e).toString(16).padStart(2,`0`)).join(``).toUpperCase():e}function Si(){let e=document.getElementById(`customColorVariable`),t=document.getElementById(`customColorPicker`),n=document.getElementById(`customColorHex`);if(!e||!t||!n)return;let r=getComputedStyle(document.documentElement).getPropertyValue(e.value).trim(),i=r.startsWith(`rgb`)?xi(r):r;n.textContent=i,i.startsWith(`#`)&&(t.value=i)}function Ci(e){let t=e.querySelector(`#customColorVariable`),n=e.querySelector(`#customColorPicker`),r=e.querySelector(`#customColorReset`),i=e.querySelector(`#customColorsClose`);t.addEventListener(`change`,Si),n.addEventListener(`input`,()=>{document.documentElement.style.setProperty(t.value,n.value),document.getElementById(`customColorHex`).textContent=n.value,vi()}),r.addEventListener(`click`,()=>{let e={dark:{"--bg-base":`rgb(22, 22, 22)`,"--bg-surface":`rgb(30, 30, 30)`,"--bg-raised":`rgb(40, 40, 40)`,"--bg-input":`rgb(50, 50, 50)`,"--accent":`rgb(47, 48, 112)`,"--accent-hover":`rgb(60, 62, 140)`,"--border":`rgba(255, 255, 255, 0.07)`,"--border-accent":`rgba(47, 48, 112, 0.6)`,"--text-primary":`rgb(240, 240, 240)`,"--text-muted":`rgb(160, 155, 155)`,"--text-dim":`rgb(100, 98, 98)`},light:{"--bg-base":`rgb(245, 245, 247)`,"--bg-surface":`rgb(235, 235, 238)`,"--bg-raised":`rgb(225, 225, 230)`,"--bg-input":`rgb(210, 210, 215)`,"--accent":`rgb(47, 48, 112)`,"--accent-hover":`rgb(70, 72, 160)`,"--border":`rgba(0, 0, 0, 0.1)`,"--border-accent":`rgba(47, 48, 112, 0.3)`,"--text-primary":`rgb(20, 20, 22)`,"--text-muted":`rgb(80, 85, 90)`,"--text-dim":`rgb(130, 135, 140)`},"high-contrast":{"--bg-base":`rgb(0, 0, 0)`,"--bg-surface":`rgb(15, 15, 15)`,"--bg-raised":`rgb(30, 30, 30)`,"--bg-input":`rgb(50, 50, 50)`,"--accent":`rgb(0, 255, 255)`,"--accent-hover":`rgb(0, 200, 200)`,"--border":`rgba(0, 255, 255, 0.3)`,"--border-accent":`rgba(0, 255, 255, 0.6)`,"--text-primary":`rgb(255, 255, 255)`,"--text-muted":`rgb(200, 200, 200)`,"--text-dim":`rgb(150, 150, 150)`}},n=t.value,r=e[v.theme||`dark`]?.[n];if(!r)return;document.documentElement.style.setProperty(n,r);let i=JSON.parse(localStorage.getItem(`customColors`)||`{}`);delete i[n],localStorage.setItem(`customColors`,JSON.stringify(i)),Si(),K(`Reset ${n} to default`,`message`)});let a=()=>{e.classList.remove(`active`),e.setAttribute(`aria-hidden`,`true`),document.getElementById(`openCustomColorsBtn`).focus()};i.addEventListener(`click`,a),e.addEventListener(`click`,t=>{t.target===e&&a()}),document.addEventListener(`keydown`,t=>{t.key===`Escape`&&e.classList.contains(`active`)&&a()})}var Z={modal:null,shell:null,dragData:null,resizeData:null};function wi(){let e=document.getElementById(`layoutEditorModal`);e.innerHTML=``,e.classList.add(`active`),Z.modal=e,Ei(e)}function Ti(e,t){let n=Array.isArray(v.defaultCards)?v.defaultCards.find(t=>t.id===e):null,r=t?.icon||n?.icon||`square`,i=String(r).trim().toLowerCase(),a={"device-tv":`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="14" rx="2"></rect><path d="M8 21h8"></path><path d="M12 18v3"></path></svg>`,tournament:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v4"></path><path d="M16 4v4"></path><path d="M4 8h16"></path><path d="M8 8v4"></path><path d="M16 8v4"></path><path d="M8 12h8"></path><path d="M6 12h2"></path><path d="M16 12h2"></path><path d="M4 16h16"></path><path d="M8 16v4"></path><path d="M16 16v4"></path></svg>`,trophy:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10"></path><path d="M8 4v3a4 4 0 0 0 4 4 4 4 0 0 0 4-4V4"></path><path d="M8 12H6a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1"></path><path d="M16 12h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1"></path><path d="M12 17v3"></path></svg>`,tool:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4a2 2 0 0 1 2.8 2.8L9.6 12 8 10.4l7.2-7.2Z"></path><path d="m6 12 6 6"></path><path d="m10 16 4 4"></path></svg>`,battery:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="14" height="12" rx="2"></rect><path d="M19 10h1"></path><path d="M17 8v8"></path></svg>`,package:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z"></path><path d="m4 7 8 4 8-4"></path><path d="m12 11 8-4"></path><path d="M12 11v10"></path></svg>`,checklist:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11"></path><path d="M9 12h11"></path><path d="M9 18h11"></path><path d="m4 5 1.5 1.5L8 3"></path><path d="m4 11 1.5 1.5L8 9"></path><path d="m4 17 1.5 1.5L8 15"></path></svg>`,"chart-bar":`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9"></path><path d="M10 19V5"></path><path d="M16 19v-7"></path><path d="M22 19v-3"></path></svg>`,"alert-circle":`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v5"></path><path d="M12 16h.01"></path></svg>`,code:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8-4 4 4 4"></path><path d="m16 8 4 4-4 4"></path><path d="m13 4-2 16"></path></svg>`};return`<span class="le-card-icon" data-icon-name="${r}" aria-hidden="true">${a[i]||a.square||`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>`}</span>`}function Ei(e){let t=B.listCards(),n=v.gridCols||3,r=v.gridRows||3,i=document.createElement(`div`);i.className=`le-shell`,i.id=`leShell`,i.innerHTML=`
        <div class="le-header">
            <div class="le-header-left">
                <h2 class="le-title">📐 Layout Editor</h2>
                <div class="le-controls">
                    <label>Cols <input type="number" id="leGridCols" min="2" max="12" value="${n}"></label>
                    <label>Rows <input type="number" id="leGridRows" min="2" max="12" value="${r}"></label>
                </div>
            </div>
            <div class="le-header-right">
                <button class="le-close-btn" id="leClose">✕</button>
            </div>
        </div>
        <div class="le-body">
            <div class="le-palette">
                <div class="le-palette-title">📦 Available Cards</div>
                <div class="le-palette-list" id="leCardList">
                    ${t.filter(e=>e!==`__fallback__`).map(e=>{let t=B.get(e),n=v.layout[e]!==void 0,r=Object.keys(Ur(t)).length>0;return`<div class="le-palette-item ${n?`in-layout`:``}" draggable="true" data-card-id="${e}" style="${n?`opacity:0.4;cursor:default;`:``}">
                            ${Ti(e,t)}
                            <span class="le-card-label">${t.label}</span>
                            ${r?`<button class="le-settings-btn" type="button" data-card-id="${e}" aria-label="Settings for ${t.label}" title="Configure ${t.label}">⚙</button>`:``}
                            ${n?` ✓`:``}
                        </div>`}).join(``)}
                    ${t.filter(e=>e!==`__fallback__`).length===0?`<div class="le-palette-empty">No cards available</div>`:``}
                </div>
                <section class="le-card-settings" id="leCardSettings" hidden></section>
                <div class="le-palette-title" style="border-top:1px solid var(--border);margin-top:4px;padding-top:8px;">💾 Actions</div>
                <div style="padding:8px 11px;display:flex;flex-direction:column;gap:6px;">
                    <button class="btn-export" id="leExport" style="width:100%;padding:6px;">Export Layout</button>
                    <button class="btn-import" id="leImport" style="width:100%;padding:6px;">Import Layout</button>
                    <button class="btn-reset" id="leReset" style="width:100%;padding:6px;">Reset to Default</button>
                </div>
            </div>
            <div class="le-canvas">
                <div class="layout-grid" id="leGrid" style="--grid-cols:${n};--grid-rows:${r};grid-template-columns:repeat(${n},1fr);grid-template-rows:repeat(${r},1fr);">
                    ${Object.entries(v.layout).map(([e,t])=>{let n=B.get(e);return n?`<div class="layout-item" data-card-id="${e}" style="grid-column:${t.x+1}/span ${t.width};grid-row:${t.y+1}/span ${t.height};">
                            <div class="layout-item-header">
                                <span>${Ti(e,n)}<span class="le-card-label">${n.label}</span></span>
                                ${Object.keys(Ur(n)).length?`<button class="le-settings-btn" type="button" data-card-id="${e}" aria-label="Settings for ${n.label}" title="Configure ${n.label}">⚙</button>`:``}
                                <button class="le-remove-btn" data-card-id="${e}">✕</button>
                            </div>
                            <div class="layout-item-hint">${t.width}×${t.height}</div>
                            <div class="resize-handle"></div>
                        </div>`:``}).join(``)}
                </div>
            </div>
        </div>
    `,e.appendChild(i),Z.shell=i;let a=i.querySelector(`#leGridCols`),o=i.querySelector(`#leGridRows`),s=i.querySelector(`#leGrid`),c=i.querySelector(`#leCardSettings`);function l(){let e=Math.max(2,Math.min(12,parseInt(a.value)||3)),t=Math.max(2,Math.min(12,parseInt(o.value)||3));v.gridCols=e,v.gridRows=t,s.style.gridTemplateColumns=`repeat(${e},1fr)`,s.style.gridTemplateRows=`repeat(${t},1fr)`,s.style.setProperty(`--grid-cols`,e),s.style.setProperty(`--grid-rows`,t),localStorage.setItem(`gridCols`,e),localStorage.setItem(`gridRows`,t)}a.addEventListener(`change`,l),o.addEventListener(`change`,l),i.querySelector(`#leClose`).addEventListener(`click`,()=>{Di()}),i.querySelectorAll(`.le-settings-btn`).forEach(e=>{e.addEventListener(`mousedown`,e=>e.stopPropagation()),e.addEventListener(`click`,t=>{t.preventDefault(),t.stopPropagation();let n=B.get(e.dataset.cardId);if(!n)return;let r=Ur(n);if(!Object.keys(r).length)return;c.hidden=!1,c.replaceChildren();let i=document.createElement(`div`);i.className=`le-card-settings-header`;let a=document.createElement(`strong`);a.textContent=`${n.label} settings`;let o=document.createElement(`button`);o.type=`button`,o.className=`le-card-settings-close`,o.setAttribute(`aria-label`,`Close card settings`),o.textContent=`×`,o.addEventListener(`click`,()=>{c.hidden=!0,c.replaceChildren()}),i.append(a,o),c.appendChild(i);let s=document.createElement(`p`);s.className=`le-card-settings-hint`,s.textContent=`Changes are saved automatically and apply immediately.`,c.appendChild(s);let l=Hr(n);Kr(c,n,l,e=>{n.settingsValues=e,n.developer&&v.developerCards[n.id]&&(v.developerCards[n.id].settingsValues=e,localStorage.setItem(`developerCards`,JSON.stringify(v.developerCards))),Sn.updateCards(z.getState())})})}),i.querySelectorAll(`.le-palette-item`).forEach(e=>{e.addEventListener(`dragstart`,e=>{e.target.closest(`.le-settings-btn`)&&e.preventDefault()})}),e.addEventListener(`click`,t=>{t.target===e&&Di()}),i.querySelectorAll(`.le-remove-btn`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation();let r=t.dataset.cardId;delete v.layout[r],localStorage.setItem(`layout`,JSON.stringify(v.layout)),e.innerHTML=``,Ei(e)})}),i.querySelectorAll(`.le-palette-item:not(.in-layout)`).forEach(e=>{e.addEventListener(`dragstart`,t=>{t.dataTransfer.setData(`text/plain`,e.dataset.cardId),e.style.opacity=`0.5`}),e.addEventListener(`dragend`,t=>{e.style.opacity=``})}),s.addEventListener(`dragover`,e=>e.preventDefault()),s.addEventListener(`drop`,t=>{t.preventDefault();let n=t.dataTransfer.getData(`text/plain`);if(!n||v.layout[n])return;let r=s.getBoundingClientRect(),i=parseInt(a.value)||3,c=parseInt(o.value)||3,l=(r.width-8*(i-1))/i,u=(r.height-8*(c-1))/c,d=Math.max(0,Math.min(Math.floor((t.clientX-r.left)/(l+8)),i-1)),f=Math.max(0,Math.min(Math.floor((t.clientY-r.top)/(u+8)),c-1));v.layout[n]={x:d,y:f,width:1,height:1},localStorage.setItem(`layout`,JSON.stringify(v.layout)),e.innerHTML=``,Ei(e)}),Oi(s),ki(s),i.querySelector(`#leExport`).addEventListener(`click`,()=>{let e={version:`26.10.24`,gridCols:v.gridCols,gridRows:v.gridRows,layout:v.layout,hiddenCards:v.hiddenSections,customColors:bi()},t=new Blob([JSON.stringify(e,null,2)],{type:`application/json`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=`pitbeacon-layout-${new Date().toISOString().split(`T`)[0]}.json`,n.click(),K(`Layout exported!`,`message`)}),i.querySelector(`#leImport`).addEventListener(`click`,()=>{let t=document.createElement(`input`);t.type=`file`,t.accept=`.json`,t.onchange=t=>{let n=t.target.files[0];if(!n)return;let r=new FileReader;r.onload=t=>{try{let n=JSON.parse(t.target.result);n.gridCols&&(v.gridCols=n.gridCols),n.gridRows&&(v.gridRows=n.gridRows),n.layout&&(v.layout=n.layout),n.hiddenCards&&(v.hiddenSections=n.hiddenCards),n.customColors&&(Object.entries(n.customColors).forEach(([e,t])=>{document.documentElement.style.setProperty(e,t)}),localStorage.setItem(`customColors`,JSON.stringify(n.customColors))),localStorage.setItem(`gridCols`,v.gridCols),localStorage.setItem(`gridRows`,v.gridRows),localStorage.setItem(`layout`,JSON.stringify(v.layout)),localStorage.setItem(`hiddenCards`,JSON.stringify(v.hiddenSections)),K(`Layout imported!`,`message`),e.innerHTML=``,Ei(e)}catch(e){K(`Import failed: `+e.message,`error`)}},r.readAsText(n)},t.click()}),i.querySelector(`#leReset`).addEventListener(`click`,()=>{confirm(`Reset layout to default?`)&&(v.layout=structuredClone(_),v.gridCols=3,v.gridRows=3,v.gridSize=3,v.hiddenSections=[],[`gridCols`,`gridRows`,`gridSize`].forEach(e=>localStorage.setItem(e,`3`)),localStorage.setItem(`layout`,JSON.stringify(v.layout)),localStorage.setItem(`hiddenCards`,JSON.stringify(v.hiddenSections)),K(`Layout reset to default`,`message`),e.innerHTML=``,Ei(e))})}function Di(){Z.modal&&(Z.modal.classList.remove(`active`),Z.modal.innerHTML=``,Z.modal=null,Z.shell=null,W())}function Oi(e){e.addEventListener(`mousedown`,t=>{let n=t.target.closest(`.layout-item`);if(!n||t.target.closest(`.le-remove-btn`)||t.target.closest(`.resize-handle`))return;let r=e.getBoundingClientRect(),i=v.gridCols||3,a=v.gridRows||3,o=(r.width-8*(i-1))/i,s=(r.height-8*(a-1))/a,c=n.dataset.cardId,l=v.layout[c];if(!l)return;let u=t.clientX,d=t.clientY,f=l.x,p=l.y;n.classList.add(`dragging`);let m=e=>{let t=Math.round((e.clientX-u)/(o+8)),r=Math.round((e.clientY-d)/(s+8)),c=Math.max(0,Math.min(f+t,i-l.width)),m=Math.max(0,Math.min(p+r,a-l.height));(c!==l.x||m!==l.y)&&(l.x=c,l.y=m,n.style.gridColumn=`${l.x+1} / span ${l.width}`,n.style.gridRow=`${l.y+1} / span ${l.height}`)},h=()=>{document.removeEventListener(`mousemove`,m),document.removeEventListener(`mouseup`,h),n.classList.remove(`dragging`),localStorage.setItem(`layout`,JSON.stringify(v.layout))};document.addEventListener(`mousemove`,m),document.addEventListener(`mouseup`,h)})}function ki(e){e.addEventListener(`mousedown`,t=>{let n=t.target.closest(`.resize-handle`);if(!n)return;let r=n.closest(`.layout-item`);if(!r)return;let i=e.getBoundingClientRect(),a=v.gridCols||3,o=v.gridRows||3,s=(i.width-8*(a-1))/a,c=(i.height-8*(o-1))/o,l=r.dataset.cardId,u=v.layout[l];if(!u)return;let d=t.clientX,f=t.clientY,p=u.width,m=u.height;r.classList.add(`resizing`),t.preventDefault();let h=e=>{let t=Math.round((e.clientX-d)/(s+8)),n=Math.round((e.clientY-f)/(c+8)),i=Math.max(1,Math.min(p+t,a-u.x)),l=Math.max(1,Math.min(m+n,o-u.y));if(i!==u.width||l!==u.height){u.width=i,u.height=l,r.style.gridColumn=`${u.x+1} / span ${u.width}`,r.style.gridRow=`${u.y+1} / span ${u.height}`;let e=r.querySelector(`.layout-item-hint`);e&&(e.textContent=`${u.width}×${u.height}`)}},g=()=>{document.removeEventListener(`mousemove`,h),document.removeEventListener(`mouseup`,g),r.classList.remove(`resizing`),localStorage.setItem(`layout`,JSON.stringify(v.layout))};document.addEventListener(`mousemove`,h),document.addEventListener(`mouseup`,g)})}var Ai=[`robot-health-card`,`battery-card`,`parts-card`,`checkin-card`],ji=`pit-notes-card`;function Mi(e){if(!e||typeof e!=`object`)return e;Object.hasOwn(e,`statbotics-card`)&&(Object.hasOwn(e,`stats-card`)||(e[`stats-card`]=e[`statbotics-card`]),delete e[`statbotics-card`]);let t=Ai.filter(t=>Object.hasOwn(e,t));return t.length&&(Object.hasOwn(e,`pit-notes-card`)||(e[ji]=e[t[0]]),t.forEach(t=>delete e[t])),e}function Ni(e){if(!Array.isArray(e))return e;let t=e.map(e=>e===`statbotics-card`?`stats-card`:e),n=t.filter(e=>Ai.includes(e)),r=t.filter(e=>!Ai.includes(e));return n.length===Ai.length&&!r.includes(`pit-notes-card`)&&r.push(ji),r}var Q=e=>document.getElementById(e);function Pi(e,t){return o(e,t)}function Fi(){let e=Pi(`developerCards`,null);if(e&&typeof e==`object`){v.developerCards=e;for(let[t,n]of Object.entries(e))n.settings=n.settings&&Object.keys(n.settings).length?n.settings:Ae(n.js||``),n.settingsValues=Hr({id:t,...n}),B.register(t,H.createCardDefinition(t,n))}}function Ii(){let t=e(`teamNumber`);t&&(v.teamNumber=t,Q(`teamNumber`).value=t,z.update({teamNumber:Number.parseInt(t,10)}));let n=e(`tbaapikey`);n&&(v.tbaapikey=n,Q(`tbaapikey`).value=n);let r=e(`match13apikey`);r&&(v.match13apikey=r,Q(`match13apikey`).value=r),v.theme=e(`theme`,`dark`),document.documentElement.setAttribute(`data-theme`,v.theme),v.noteAlarmToggle=e(`noteAlarmToggle`)===`true`,v.noteAlarmSound=e(`noteAlarmSound`,`alarm1`),Q(`noteAlarmToggle`).checked=v.noteAlarmToggle,Q(`noteAlarmSound`).value=v.noteAlarmSound,v.matchAlarmToggle=e(`matchAlarmToggle`)!==`false`,v.matchAlertThreshold=Number.parseInt(e(`matchAlertThreshold`,`300`),10)||300,v.matchAlarmSound=e(`matchAlarmSound`,`alarm1`),Q(`matchAlarmToggle`).checked=v.matchAlarmToggle,Q(`matchAlertThreshold`).value=v.matchAlertThreshold,Q(`matchAlarmSound`).value=v.matchAlarmSound,v.gridCols=Number.parseInt(e(`gridCols`,v.gridCols),10)||v.gridCols,v.gridRows=Number.parseInt(e(`gridRows`,v.gridRows),10)||v.gridRows,v.gridSize=v.gridCols;let i=Pi(`layout`,null);i&&typeof i==`object`&&(v.layout=Mi(i));let a=Pi(`hiddenCards`,null);v.hiddenSections=Array.isArray(a)?Ni(a):[];let o=Pi(`layoutProfiles`,null);v.layoutProfiles=o&&typeof o==`object`?o:{};for(let e of Object.values(v.layoutProfiles))e&&typeof e==`object`&&(Mi(e.layout),Array.isArray(e.hiddenCards)&&(e.hiddenCards=Ni(e.hiddenCards)));v.activeProfileName=e(`activeProfileName`,`Default`),Fi(),v.seasonYearOverride=e(`seasonYearOverride`,``)||``,Q(`seasonYearOverride`).value=v.seasonYearOverride,v.testMode=e(`testMode`)===`true`,v.testDate=e(`testDate`,``),Q(`testMode`).checked=v.testMode,v.testDate&&(Q(`testDate`).value=v.testDate),Q(`testDate`).style.display=v.testMode?`block`:`none`;let s=cr(v);z.update({fullDate:s,isTestMode:v.testMode&&s!==null}),v.autoSwapEnabled=e(`autoSwapEnabled`)===`true`,v.autoSwapInterval=Number.parseInt(e(`autoSwapInterval`,`30`),10)||30,Q(`autoSwapEnabled`).checked=v.autoSwapEnabled,Q(`autoSwapInterval`).value=v.autoSwapInterval,Rr(),yi()}function Li(){v.teamNumber=Q(`teamNumber`).value.trim(),v.tbaapikey=Q(`tbaapikey`).value.trim(),v.match13apikey=Q(`match13apikey`).value.trim(),v.noteAlarmToggle=Q(`noteAlarmToggle`).checked,v.noteAlarmSound=Q(`noteAlarmSound`).value,v.matchAlarmToggle=Q(`matchAlarmToggle`).checked,v.matchAlertThreshold=Number.parseInt(Q(`matchAlertThreshold`).value,10)||300,v.matchAlarmSound=Q(`matchAlarmSound`).value,v.autoSwapEnabled=Q(`autoSwapEnabled`).checked,v.autoSwapInterval=Number.parseInt(Q(`autoSwapInterval`).value,10)||30;let e=pe(Q(`seasonYearOverride`).value);v.seasonYearOverride=e?String(e):``;let t=Q(`testMode`).checked,r=Q(`testDate`).value.trim();return t&&!sr(r)?(K(`Test Mode needs a date like 2026-04-26.`,`error`),!1):(v.testMode=t,v.testDate=t?r:``,z.update({teamNumber:Number.parseInt(v.teamNumber,10)||v.teamNumber}),n(`teamNumber`,v.teamNumber),n(`tbaapikey`,v.tbaapikey),n(`match13apikey`,v.match13apikey),n(`theme`,v.theme),n(`noteAlarmToggle`,v.noteAlarmToggle),n(`noteAlarmSound`,v.noteAlarmSound),n(`matchAlarmToggle`,v.matchAlarmToggle),n(`matchAlertThreshold`,v.matchAlertThreshold),n(`matchAlarmSound`,v.matchAlarmSound),n(`autoSwapEnabled`,v.autoSwapEnabled),n(`autoSwapInterval`,v.autoSwapInterval),n(`seasonYearOverride`,v.seasonYearOverride),n(`testMode`,v.testMode),v.testMode?n(`testDate`,v.testDate):h(`testDate`),document.documentElement.setAttribute(`data-theme`,v.theme),Vr(),V.updateConfig(v),dr(),!0)}function Ri(){let e=Q(`settingscontainer`),t=Q(`testMode`),r=Q(`testDate`);t.addEventListener(`change`,()=>{r.style.display=t.checked?`block`:`none`}),Q(`settings`).addEventListener(`click`,()=>{e.style.display=e.style.display===`flex`?`none`:`flex`}),document.addEventListener(`keydown`,t=>{t.key===`Escape`&&e.style.display===`flex`&&!document.querySelector(`.active`)&&(e.style.display=`none`)}),Q(`savebutton`).addEventListener(`click`,()=>{Li()&&(K(`Settings saved.`,`message`),e.style.display=`none`,Or())}),Q(`hideTopBtn`).addEventListener(`click`,()=>{let e=Q(`header`).classList.toggle(`hidden`);document.documentElement.style.setProperty(`--header-height`,e?`0px`:`4.5rem`)}),Ci(Q(`customColorsModal`)),Q(`openCustomColorsBtn`)?.addEventListener(`click`,()=>{let e=Q(`customColorsModal`);e.classList.add(`active`),e.setAttribute(`aria-hidden`,`false`),Si(),e.querySelector(`#customColorVariable`)?.focus()}),Q(`saveProfileBtn`)?.addEventListener(`click`,()=>{let e=Q(`newProfileName`);Ir(e.value.trim()||v.activeProfileName||`Default`),e.value=``}),Q(`deleteProfileBtn`)?.addEventListener(`click`,()=>{let e=Q(`profileSelect`).value;e===`Default`?K(`The Default profile can't be deleted.`,`error`):confirm(`Delete profile "${e}"?`)&&(delete v.layoutProfiles[e],n(`layoutProfiles`,JSON.stringify(v.layoutProfiles)),v.activeProfileName===e&&(v.activeProfileName=`Default`,n(`activeProfileName`,`Default`)),Rr(),K(`Profile "${e}" deleted.`,`message`))}),Q(`profileSelect`)?.addEventListener(`change`,e=>Lr(e.target.value)),Q(`errorcontainer`).addEventListener(`click`,e=>{e.target.classList.contains(`error-exit`)&&e.target.parentElement.remove()})}function zi(){e(`tbaapikey`)||(Q(`settingscontainer`).style.display=`flex`)}function Bi(e,t){try{localStorage.setItem(e,t)}catch{}}var $=!1,Vi=null,Hi=null,Ui=null,Wi=null,Gi=null;function Ki(){try{$=localStorage.getItem(`easterEggsEnabled`)===`true`}catch{$=!1}return $}function qi(){ea(!$)}function Ji(){let e=document.querySelector(`.logo-img`);e&&(e.classList.toggle(`easter-eggs-enabled`,$),e.setAttribute(`aria-pressed`,String($)),e.title=`${$?`Disable`:`Enable`} Easter eggs`)}function Yi(){if(!$)return;clearTimeout(Vi);let e=3e3+Math.random()*370;Vi=setTimeout(Xi,e)}function Xi(){if(Vi=null,!$)return;if(Ui?.classList.contains(`walking`)){Yi();return}let e=document.getElementById(`container`),t=Array.from(e.querySelectorAll(`.card-container`)).filter(e=>e.isConnected&&e.getClientRects().length>0);if(!t.length){Yi();return}$i();let n=t[Math.floor(Math.random()*t.length)],r=document.createElement(`div`);r.className=`easter-egg-duck`,r.setAttribute(`role`,`button`),r.setAttribute(`tabindex`,`0`),r.setAttribute(`aria-label`,`Make the duck walk`),r.textContent=`🦆`,r.addEventListener(`click`,e=>{e.stopPropagation(),Zi(r)}),r.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),Zi(r))});let i=n.getBoundingClientRect(),a=e.getBoundingClientRect();r.style.right=`${i.right-a.left-Math.random()*100+e.scrollLeft}px`,r.style.bottom=`${i.bottom-a.top-Math.random()*100+e.scrollTop}px`,e.appendChild(r),Ui=r,requestAnimationFrame(()=>r.classList.add(`visible`)),Hi=setTimeout(()=>{r.classList.contains(`walking`)||(r.classList.remove(`visible`),setTimeout(()=>{r.classList.contains(`walking`)||(r.remove(),Ui===r&&(Ui=null))},350))},5e3),Yi()}function Zi(e){if(!$||e.classList.contains(`walking`))return;clearTimeout(Hi);let t=e.getBoundingClientRect();e.classList.add(`walking`),e.style.left=`${Math.max(0,Math.min(window.innerWidth-48,t.left))}px`,e.style.bottom=`0px`,e.style.right=`auto`,e.style.top=`auto`,e.style.setProperty(`--duck-direction`,`1`),document.body.appendChild(e);let n=1,r=0,i=t=>{if(e.isConnected&&e.classList.contains(`walking`)){if(r){let i=Math.min(t-r,50),a=parseFloat(e.style.left)+n*i*.08;(a<=0||a>=window.innerWidth-48)&&(n*=-1,e.style.setProperty(`--duck-direction`,String(n*-1)),a=Math.max(0,Math.min(window.innerWidth-48,a))),e.style.left=`${a}px`}r=t,Wi=requestAnimationFrame(i)}};Wi=requestAnimationFrame(i),Qi(e)}function Qi(e){clearTimeout(Gi),$&&e.classList.contains(`walking`)&&(Gi=setTimeout(()=>{$&&e.classList.contains(`walking`)&&(e.classList.remove(`jumping`),e.offsetWidth,e.classList.add(`jumping`),setTimeout(()=>e.classList.remove(`jumping`),1e3),Qi(e))},2e3+Math.random()*4e3))}function $i({poof:e=!1}={}){let t=Ui;if(Ui=null,cancelAnimationFrame(Wi),Wi=null,clearTimeout(Gi),Gi=null,t){if(e){let e=t.getBoundingClientRect();t.classList.remove(`walking`,`jumping`,`visible`),t.style.position=`fixed`,t.style.left=`${e.left}px`,t.style.top=`${e.top}px`,t.style.right=`auto`,t.style.bottom=`auto`,t.style.opacity=`1`,t.style.transform=`none`,document.body.appendChild(t),t.classList.add(`duck-poof`),setTimeout(()=>t.remove(),700)}else t.remove()}}function ea(e){$=e,Bi(`easterEggsEnabled`,String(e)),Ji(),clearTimeout(Vi),clearTimeout(Hi),$i({poof:!e}),e&&Yi()}var ta=`false`,na=`false`,ra=ta===`true`,ia=na===`true`;function aa(e={}){let{immediate:t=!1,onNeedReload:n,onNeedRefresh:r,onOfflineReady:i,onRegistered:a,onRegisteredSW:o,onRegisterError:s}=e,c,l,u,d=async(e=!0)=>{await l,ra||u?.()};async function f(){if(`serviceWorker`in navigator){if(c=await le(async()=>{let{Workbox:e}=await import(`./workbox-window.prod.es5-Bd17z0YL.js`);return{Workbox:e}},[],import.meta.url).then(({Workbox:e})=>new e(`./sw.js`,{scope:`./`,type:`classic`})).catch(e=>{s?.(e)}),!c)return;if(u=()=>{c?.messageSkipWaiting()},!ia){if(ra)c.addEventListener(`activated`,e=>{(e.isUpdate||e.isExternal)&&(n?n():window.location.reload())}),c.addEventListener(`installed`,e=>{e.isUpdate||i?.()});else{let e=!1,t=()=>{e=!0,c?.addEventListener(`controlling`,e=>{e.isUpdate&&(n?n():window.location.reload())}),r?.()};c.addEventListener(`installed`,n=>{n.isUpdate===void 0?n.isExternal===void 0?!e&&i?.():n.isExternal?t():!e&&i?.():n.isUpdate||i?.()}),c.addEventListener(`waiting`,t)}}c.register({immediate:t}).then(e=>{o?o(`./sw.js`,e):a?.(e)}).catch(e=>{s?.(e)})}}return l=f(),d}var oa=e=>document.getElementById(e),sa=!1,ca=null;function la(){if(oa(`updateBanner`))return;let e=document.createElement(`div`);e.className=`update-banner`,e.id=`updateBanner`,e.setAttribute(`role`,`status`);let t=document.createElement(`span`);t.textContent=`A new version of PitBeacon is ready.`;let n=document.createElement(`button`);n.type=`button`,n.className=`savebutton`,n.style.margin=`0`,n.textContent=`Reload`,n.addEventListener(`click`,()=>ca?.(!0));let r=document.createElement(`button`);r.type=`button`,r.className=`savebutton`,r.style.cssText=`margin:0;background:transparent;border:1px solid var(--border)`,r.textContent=`Later`,r.addEventListener(`click`,()=>e.remove()),e.append(t,n,r),document.body.appendChild(e)}function ua(){`serviceWorker`in navigator&&(ca=aa({onNeedRefresh:la,onOfflineReady(){sa=!0,fa()},onRegisteredSW(){sa=!0,fa()}}))}function da(){return new Promise(e=>{if(!window.indexedDB)return e(!1);let t=indexedDB.open(`pitbeacon-robot-viewer-v2`,1);t.onupgradeneeded=()=>{t.result.createObjectStore(`models`),t.result.createObjectStore(`libs`)},t.onerror=()=>e(!1),t.onsuccess=()=>{let n=t.result;try{let t=n.transaction(`models`,`readonly`).objectStore(`models`).get(`last`);t.onsuccess=()=>{n.close(),e(!!t.result?.files?.length)},t.onerror=()=>{n.close(),e(!1)}}catch{n.close(),e(!1)}}})}async function fa(){let e=oa(`offlineReady`);if(!e)return;let t=!!navigator.serviceWorker?.controller,[n,r]=await Promise.all([Cr(v.teamNumber).catch(()=>null),da()]),i=[{ok:t,text:t?`App saved on this device`:sa?`App is being saved. Reload once to finish.`:`App not saved yet (needs a normal https page load)`},{ok:!!n,text:n?`Latest event data saved`:`No event data saved yet (appears after the first update)`},{ok:r,text:r?`Robot model saved`:`No robot model loaded (optional)`}];e.replaceChildren(...i.map(e=>{let t=document.createElement(`li`);return t.dataset.ok=String(e.ok),t.textContent=e.text,t}));let a=oa(`offlineStorage`);if(a&&navigator.storage?.estimate)try{let{usage:e=0,quota:t=0}=await navigator.storage.estimate(),n=await navigator.storage.persisted?.()?` Protected from automatic cleanup.`:``;a.textContent=`Using ${(e/1048576).toFixed(1)} MB of ${(t/1048576).toFixed(0)} MB.${n}`}catch{a.textContent=``}}async function pa(){try{await navigator.storage?.persist?.()}catch{}}function ma(){fa(),oa(`settings`)?.addEventListener(`click`,fa),window.addEventListener(`online`,fa),navigator.serviceWorker?.addEventListener(`controllerchange`,fa)}$n(),window.pitbeaconGlobal=xn,B.register(`webcast-card`,Tn()),B.register(`match-card`,En()),B.register(`leaderboard-card`,jn()),B.register(`pit-notes-card`,Xn()),B.register(`robot-viewer-card`,nr()),B.register(`stats-card`,or()),B.register(`__fallback__`,wn);function ha(){let e=document.getElementById(`version`);e&&(e.textContent=`Version 26.11.16`);let t=document.querySelector(`.logo-img`);t?.addEventListener(`click`,qi),t?.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),qi())}),document.getElementById(`cardsBtn`)?.addEventListener(`click`,()=>pi()),document.getElementById(`layoutEditorBtn`)?.addEventListener(`click`,wi)}function ga(){let e=Ki();Ii(),Ri(),ha(),Ji(),_i(),Pr(),ma(),Mr(),W(),Vr(),e&&Yi(),fr(),kr().finally(jr),ua(),pa(),zi()}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,ga):ga(),window.__PITBEACON_DEBUG={config:v,stateManager:z,registry:B,dataSources:V,renderer:Sn,devCardRuntime:H};