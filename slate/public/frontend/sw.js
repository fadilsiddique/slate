var un=Object.defineProperty,ln=Object.defineProperties;var hn=Object.getOwnPropertyDescriptors;var $e=Object.getOwnPropertySymbols;var dn=Object.prototype.hasOwnProperty,fn=Object.prototype.propertyIsEnumerable;var qe=(t,e,n)=>e in t?un(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,je=(t,e)=>{for(var n in e||(e={}))dn.call(e,n)&&qe(t,n,e[n]);if($e)for(var n of $e(e))fn.call(e,n)&&qe(t,n,e[n]);return t},He=(t,e)=>ln(t,hn(e));var c=(t,e,n)=>new Promise((s,r)=>{var i=u=>{try{o(n.next(u))}catch(l){r(l)}},a=u=>{try{o(n.throw(u))}catch(l){r(l)}},o=u=>u.done?s(u.value):Promise.resolve(u.value).then(i,a);o((n=n.apply(t,e)).next())});const pn=function(){const e=typeof document!="undefined"&&document.createElement("link").relList;return e&&e.supports&&e.supports("modulepreload")?"modulepreload":"preload"}(),gn=function(t){return"/assets/slate/frontend/"+t},Ke={},We=function(e,n,s){let r=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),o=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));r=Promise.allSettled(n.map(u=>{if(u=gn(u),u in Ke)return;Ke[u]=!0;const l=u.endsWith(".css"),h=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${h}`))return;const d=document.createElement("link");if(d.rel=l?"stylesheet":pn,l||(d.as="script"),d.crossOrigin="",d.href=u,o&&d.setAttribute("nonce",o),document.head.appendChild(d),l)return new Promise((w,L)=>{d.addEventListener("load",w),d.addEventListener("error",()=>L(new Error(`Unable to preload CSS for ${u}`)))})}))}function i(a){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=a,window.dispatchEvent(o),!o.defaultPrevented)throw a}return r.then(a=>{for(const o of a||[])o.status==="rejected"&&i(o.reason);return e().catch(i)})};try{self["workbox:core:7.3.0"]&&_()}catch(t){}const mn=(t,...e)=>{let n=t;return e.length>0&&(n+=` :: ${JSON.stringify(e)}`),n},wn=mn;class p extends Error{constructor(e,n){const s=wn(e,n);super(s),this.name=e,this.details=n}}const E={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:typeof registration!="undefined"?registration.scope:""},oe=t=>[E.prefix,t,E.suffix].filter(e=>e&&e.length>0).join("-"),bn=t=>{for(const e of Object.keys(E))t(e)},G={updateDetails:t=>{bn(e=>{typeof t[e]=="string"&&(E[e]=t[e])})},getGoogleAnalyticsName:t=>t||oe(E.googleAnalytics),getPrecacheName:t=>t||oe(E.precache),getPrefix:()=>E.prefix,getRuntimeName:t=>t||oe(E.runtime),getSuffix:()=>E.suffix};function Ve(t,e){const n=e();return t.waitUntil(n),n}try{self["workbox:precaching:7.3.0"]&&_()}catch(t){}const yn="__WB_REVISION__";function _n(t){if(!t)throw new p("add-to-cache-list-unexpected-type",{entry:t});if(typeof t=="string"){const i=new URL(t,location.href);return{cacheKey:i.href,url:i.href}}const{revision:e,url:n}=t;if(!n)throw new p("add-to-cache-list-unexpected-type",{entry:t});if(!e){const i=new URL(n,location.href);return{cacheKey:i.href,url:i.href}}const s=new URL(n,location.href),r=new URL(n,location.href);return s.searchParams.set(yn,e),{cacheKey:s.href,url:r.href}}class En{constructor(){this.updatedURLs=[],this.notUpdatedURLs=[],this.handlerWillStart=s=>c(this,[s],function*({request:e,state:n}){n&&(n.originalRequest=e)}),this.cachedResponseWillBeUsed=r=>c(this,[r],function*({event:e,state:n,cachedResponse:s}){if(e.type==="install"&&n&&n.originalRequest&&n.originalRequest instanceof Request){const i=n.originalRequest.url;s?this.notUpdatedURLs.push(i):this.updatedURLs.push(i)}return s})}}class vn{constructor({precacheController:e}){this.cacheKeyWillBeUsed=r=>c(this,[r],function*({request:n,params:s}){const i=(s==null?void 0:s.cacheKey)||this._precacheController.getCacheKeyForURL(n.url);return i?new Request(i,{headers:n.headers}):n}),this._precacheController=e}}let q;function Sn(){if(q===void 0){const t=new Response("");if("body"in t)try{new Response(t.body),q=!0}catch(e){q=!1}q=!1}return q}function In(t,e){return c(this,null,function*(){let n=null;if(t.url&&(n=new URL(t.url).origin),n!==self.location.origin)throw new p("cross-origin-copy-response",{origin:n});const s=t.clone(),i={headers:new Headers(s.headers),status:s.status,statusText:s.statusText},a=Sn()?s.body:yield s.blob();return new Response(a,i)})}const Cn=t=>new URL(String(t),location.href).href.replace(new RegExp(`^${location.origin}`),"");function ze(t,e){const n=new URL(t);for(const s of e)n.searchParams.delete(s);return n.href}function Dn(t,e,n,s){return c(this,null,function*(){const r=ze(e.url,n);if(e.url===r)return t.match(e,s);const i=Object.assign(Object.assign({},s),{ignoreSearch:!0}),a=yield t.keys(e,i);for(const o of a){const u=ze(o.url,n);if(r===u)return t.match(o,s)}})}let Tn=class{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}};const dt=new Set;function Rn(){return c(this,null,function*(){for(const t of dt)yield t()})}function ft(t){return new Promise(e=>setTimeout(e,t))}try{self["workbox:strategies:7.3.0"]&&_()}catch(t){}function Y(t){return typeof t=="string"?new Request(t):t}class An{constructor(e,n){this._cacheKeys={},Object.assign(this,n),this.event=n.event,this._strategy=e,this._handlerDeferred=new Tn,this._extendLifetimePromises=[],this._plugins=[...e.plugins],this._pluginStateMap=new Map;for(const s of this._plugins)this._pluginStateMap.set(s,{});this.event.waitUntil(this._handlerDeferred.promise)}fetch(e){return c(this,null,function*(){const{event:n}=this;let s=Y(e);if(s.mode==="navigate"&&n instanceof FetchEvent&&n.preloadResponse){const a=yield n.preloadResponse;if(a)return a}const r=this.hasCallback("fetchDidFail")?s.clone():null;try{for(const a of this.iterateCallbacks("requestWillFetch"))s=yield a({request:s.clone(),event:n})}catch(a){if(a instanceof Error)throw new p("plugin-error-request-will-fetch",{thrownErrorMessage:a.message})}const i=s.clone();try{let a;a=yield fetch(s,s.mode==="navigate"?void 0:this._strategy.fetchOptions);for(const o of this.iterateCallbacks("fetchDidSucceed"))a=yield o({event:n,request:i,response:a});return a}catch(a){throw r&&(yield this.runCallbacks("fetchDidFail",{error:a,event:n,originalRequest:r.clone(),request:i.clone()})),a}})}fetchAndCachePut(e){return c(this,null,function*(){const n=yield this.fetch(e),s=n.clone();return this.waitUntil(this.cachePut(e,s)),n})}cacheMatch(e){return c(this,null,function*(){const n=Y(e);let s;const{cacheName:r,matchOptions:i}=this._strategy,a=yield this.getCacheKey(n,"read"),o=Object.assign(Object.assign({},i),{cacheName:r});s=yield caches.match(a,o);for(const u of this.iterateCallbacks("cachedResponseWillBeUsed"))s=(yield u({cacheName:r,matchOptions:i,cachedResponse:s,request:a,event:this.event}))||void 0;return s})}cachePut(e,n){return c(this,null,function*(){const s=Y(e);yield ft(0);const r=yield this.getCacheKey(s,"write");if(!n)throw new p("cache-put-with-no-response",{url:Cn(r.url)});const i=yield this._ensureResponseSafeToCache(n);if(!i)return!1;const{cacheName:a,matchOptions:o}=this._strategy,u=yield self.caches.open(a),l=this.hasCallback("cacheDidUpdate"),h=l?yield Dn(u,r.clone(),["__WB_REVISION__"],o):null;try{yield u.put(r,l?i.clone():i)}catch(d){if(d instanceof Error)throw d.name==="QuotaExceededError"&&(yield Rn()),d}for(const d of this.iterateCallbacks("cacheDidUpdate"))yield d({cacheName:a,oldResponse:h,newResponse:i.clone(),request:r,event:this.event});return!0})}getCacheKey(e,n){return c(this,null,function*(){const s=`${e.url} | ${n}`;if(!this._cacheKeys[s]){let r=e;for(const i of this.iterateCallbacks("cacheKeyWillBeUsed"))r=Y(yield i({mode:n,request:r,event:this.event,params:this.params}));this._cacheKeys[s]=r}return this._cacheKeys[s]})}hasCallback(e){for(const n of this._strategy.plugins)if(e in n)return!0;return!1}runCallbacks(e,n){return c(this,null,function*(){for(const s of this.iterateCallbacks(e))yield s(n)})}*iterateCallbacks(e){for(const n of this._strategy.plugins)if(typeof n[e]=="function"){const s=this._pluginStateMap.get(n);yield i=>{const a=Object.assign(Object.assign({},i),{state:s});return n[e](a)}}}waitUntil(e){return this._extendLifetimePromises.push(e),e}doneWaiting(){return c(this,null,function*(){for(;this._extendLifetimePromises.length;){const e=this._extendLifetimePromises.splice(0),s=(yield Promise.allSettled(e)).find(r=>r.status==="rejected");if(s)throw s.reason}})}destroy(){this._handlerDeferred.resolve(null)}_ensureResponseSafeToCache(e){return c(this,null,function*(){let n=e,s=!1;for(const r of this.iterateCallbacks("cacheWillUpdate"))if(n=(yield r({request:this.request,response:n,event:this.event}))||void 0,s=!0,!n)break;return s||n&&n.status!==200&&(n=void 0),n})}}class J{constructor(e={}){this.cacheName=G.getRuntimeName(e.cacheName),this.plugins=e.plugins||[],this.fetchOptions=e.fetchOptions,this.matchOptions=e.matchOptions}handle(e){const[n]=this.handleAll(e);return n}handleAll(e){e instanceof FetchEvent&&(e={event:e,request:e.request});const n=e.event,s=typeof e.request=="string"?new Request(e.request):e.request,r="params"in e?e.params:void 0,i=new An(this,{event:n,request:s,params:r}),a=this._getResponse(i,s,n),o=this._awaitComplete(a,i,s,n);return[a,o]}_getResponse(e,n,s){return c(this,null,function*(){yield e.runCallbacks("handlerWillStart",{event:s,request:n});let r;try{if(r=yield this._handle(n,e),!r||r.type==="error")throw new p("no-response",{url:n.url})}catch(i){if(i instanceof Error){for(const a of e.iterateCallbacks("handlerDidError"))if(r=yield a({error:i,event:s,request:n}),r)break}if(!r)throw i}for(const i of e.iterateCallbacks("handlerWillRespond"))r=yield i({event:s,request:n,response:r});return r})}_awaitComplete(e,n,s,r){return c(this,null,function*(){let i,a;try{i=yield e}catch(o){}try{yield n.runCallbacks("handlerDidRespond",{event:r,request:s,response:i}),yield n.doneWaiting()}catch(o){o instanceof Error&&(a=o)}if(yield n.runCallbacks("handlerDidComplete",{event:r,request:s,response:i,error:a}),n.destroy(),a)throw a})}}class I extends J{constructor(e={}){e.cacheName=G.getPrecacheName(e.cacheName),super(e),this._fallbackToNetwork=e.fallbackToNetwork!==!1,this.plugins.push(I.copyRedirectedCacheableResponsesPlugin)}_handle(e,n){return c(this,null,function*(){const s=yield n.cacheMatch(e);return s||(n.event&&n.event.type==="install"?yield this._handleInstall(e,n):yield this._handleFetch(e,n))})}_handleFetch(e,n){return c(this,null,function*(){let s;const r=n.params||{};if(this._fallbackToNetwork){const i=r.integrity,a=e.integrity,o=!a||a===i;s=yield n.fetch(new Request(e,{integrity:e.mode!=="no-cors"?a||i:void 0})),i&&o&&e.mode!=="no-cors"&&(this._useDefaultCacheabilityPluginIfNeeded(),yield n.cachePut(e,s.clone()))}else throw new p("missing-precache-entry",{cacheName:this.cacheName,url:e.url});return s})}_handleInstall(e,n){return c(this,null,function*(){this._useDefaultCacheabilityPluginIfNeeded();const s=yield n.fetch(e);if(!(yield n.cachePut(e,s.clone())))throw new p("bad-precaching-response",{url:e.url,status:s.status});return s})}_useDefaultCacheabilityPluginIfNeeded(){let e=null,n=0;for(const[s,r]of this.plugins.entries())r!==I.copyRedirectedCacheableResponsesPlugin&&(r===I.defaultPrecacheCacheabilityPlugin&&(e=s),r.cacheWillUpdate&&n++);n===0?this.plugins.push(I.defaultPrecacheCacheabilityPlugin):n>1&&e!==null&&this.plugins.splice(e,1)}}I.defaultPrecacheCacheabilityPlugin={cacheWillUpdate(e){return c(this,arguments,function*({response:t}){return!t||t.status>=400?null:t})}};I.copyRedirectedCacheableResponsesPlugin={cacheWillUpdate(e){return c(this,arguments,function*({response:t}){return t.redirected?yield In(t):t})}};class kn{constructor({cacheName:e,plugins:n=[],fallbackToNetwork:s=!0}={}){this._urlsToCacheKeys=new Map,this._urlsToCacheModes=new Map,this._cacheKeysToIntegrities=new Map,this._strategy=new I({cacheName:G.getPrecacheName(e),plugins:[...n,new vn({precacheController:this})],fallbackToNetwork:s}),this.install=this.install.bind(this),this.activate=this.activate.bind(this)}get strategy(){return this._strategy}precache(e){this.addToCacheList(e),this._installAndActiveListenersAdded||(self.addEventListener("install",this.install),self.addEventListener("activate",this.activate),this._installAndActiveListenersAdded=!0)}addToCacheList(e){const n=[];for(const s of e){typeof s=="string"?n.push(s):s&&s.revision===void 0&&n.push(s.url);const{cacheKey:r,url:i}=_n(s),a=typeof s!="string"&&s.revision?"reload":"default";if(this._urlsToCacheKeys.has(i)&&this._urlsToCacheKeys.get(i)!==r)throw new p("add-to-cache-list-conflicting-entries",{firstEntry:this._urlsToCacheKeys.get(i),secondEntry:r});if(typeof s!="string"&&s.integrity){if(this._cacheKeysToIntegrities.has(r)&&this._cacheKeysToIntegrities.get(r)!==s.integrity)throw new p("add-to-cache-list-conflicting-integrities",{url:i});this._cacheKeysToIntegrities.set(r,s.integrity)}if(this._urlsToCacheKeys.set(i,r),this._urlsToCacheModes.set(i,a),n.length>0){const o=`Workbox is precaching URLs without revision info: ${n.join(", ")}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`;console.warn(o)}}}install(e){return Ve(e,()=>c(this,null,function*(){const n=new En;this.strategy.plugins.push(n);for(const[i,a]of this._urlsToCacheKeys){const o=this._cacheKeysToIntegrities.get(a),u=this._urlsToCacheModes.get(i),l=new Request(i,{integrity:o,cache:u,credentials:"same-origin"});yield Promise.all(this.strategy.handleAll({params:{cacheKey:a},request:l,event:e}))}const{updatedURLs:s,notUpdatedURLs:r}=n;return{updatedURLs:s,notUpdatedURLs:r}}))}activate(e){return Ve(e,()=>c(this,null,function*(){const n=yield self.caches.open(this.strategy.cacheName),s=yield n.keys(),r=new Set(this._urlsToCacheKeys.values()),i=[];for(const a of s)r.has(a.url)||(yield n.delete(a),i.push(a.url));return{deletedURLs:i}}))}getURLsToCacheKeys(){return this._urlsToCacheKeys}getCachedURLs(){return[...this._urlsToCacheKeys.keys()]}getCacheKeyForURL(e){const n=new URL(e,location.href);return this._urlsToCacheKeys.get(n.href)}getIntegrityForCacheKey(e){return this._cacheKeysToIntegrities.get(e)}matchPrecache(e){return c(this,null,function*(){const n=e instanceof Request?e.url:e,s=this.getCacheKeyForURL(n);if(s)return(yield self.caches.open(this.strategy.cacheName)).match(s)})}createHandlerBoundToURL(e){const n=this.getCacheKeyForURL(e);if(!n)throw new p("non-precached-url",{url:e});return s=>(s.request=new Request(e),s.params=Object.assign({cacheKey:n},s.params),this.strategy.handle(s))}}let ce;const Ce=()=>(ce||(ce=new kn),ce);try{self["workbox:routing:7.3.0"]&&_()}catch(t){}const pt="GET",Z=t=>t&&typeof t=="object"?t:{handle:t};class B{constructor(e,n,s=pt){this.handler=Z(n),this.match=e,this.method=s}setCatchHandler(e){this.catchHandler=Z(e)}}class On extends B{constructor(e,n,s){const r=({url:i})=>{const a=e.exec(i.href);if(a&&!(i.origin!==location.origin&&a.index!==0))return a.slice(1)};super(r,n,s)}}class Nn{constructor(){this._routes=new Map,this._defaultHandlerMap=new Map}get routes(){return this._routes}addFetchListener(){self.addEventListener("fetch",e=>{const{request:n}=e,s=this.handleRequest({request:n,event:e});s&&e.respondWith(s)})}addCacheListener(){self.addEventListener("message",e=>{if(e.data&&e.data.type==="CACHE_URLS"){const{payload:n}=e.data,s=Promise.all(n.urlsToCache.map(r=>{typeof r=="string"&&(r=[r]);const i=new Request(...r);return this.handleRequest({request:i,event:e})}));e.waitUntil(s),e.ports&&e.ports[0]&&s.then(()=>e.ports[0].postMessage(!0))}})}handleRequest({request:e,event:n}){const s=new URL(e.url,location.href);if(!s.protocol.startsWith("http"))return;const r=s.origin===location.origin,{params:i,route:a}=this.findMatchingRoute({event:n,request:e,sameOrigin:r,url:s});let o=a&&a.handler;const u=e.method;if(!o&&this._defaultHandlerMap.has(u)&&(o=this._defaultHandlerMap.get(u)),!o)return;let l;try{l=o.handle({url:s,request:e,event:n,params:i})}catch(d){l=Promise.reject(d)}const h=a&&a.catchHandler;return l instanceof Promise&&(this._catchHandler||h)&&(l=l.catch(d=>c(this,null,function*(){if(h)try{return yield h.handle({url:s,request:e,event:n,params:i})}catch(w){w instanceof Error&&(d=w)}if(this._catchHandler)return this._catchHandler.handle({url:s,request:e,event:n});throw d}))),l}findMatchingRoute({url:e,sameOrigin:n,request:s,event:r}){const i=this._routes.get(s.method)||[];for(const a of i){let o;const u=a.match({url:e,sameOrigin:n,request:s,event:r});if(u)return o=u,(Array.isArray(o)&&o.length===0||u.constructor===Object&&Object.keys(u).length===0||typeof u=="boolean")&&(o=void 0),{route:a,params:o}}return{}}setDefaultHandler(e,n=pt){this._defaultHandlerMap.set(n,Z(e))}setCatchHandler(e){this._catchHandler=Z(e)}registerRoute(e){this._routes.has(e.method)||this._routes.set(e.method,[]),this._routes.get(e.method).push(e)}unregisterRoute(e){if(!this._routes.has(e.method))throw new p("unregister-route-but-not-found-with-method",{method:e.method});const n=this._routes.get(e.method).indexOf(e);if(n>-1)this._routes.get(e.method).splice(n,1);else throw new p("unregister-route-route-not-registered")}}let j;const Pn=()=>(j||(j=new Nn,j.addFetchListener(),j.addCacheListener()),j);function x(t,e,n){let s;if(typeof t=="string"){const i=new URL(t,location.href),a=({url:o})=>o.href===i.href;s=new B(a,e,n)}else if(t instanceof RegExp)s=new On(t,e,n);else if(typeof t=="function")s=new B(t,e,n);else if(t instanceof B)s=t;else throw new p("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});return Pn().registerRoute(s),s}function xn(t,e=[]){for(const n of[...t.searchParams.keys()])e.some(s=>s.test(n))&&t.searchParams.delete(n);return t}function*Mn(t,{ignoreURLParametersMatching:e=[/^utm_/,/^fbclid$/],directoryIndex:n="index.html",cleanURLs:s=!0,urlManipulation:r}={}){const i=new URL(t,location.href);i.hash="",yield i.href;const a=xn(i,e);if(yield a.href,n&&a.pathname.endsWith("/")){const o=new URL(a.href);o.pathname+=n,yield o.href}if(s){const o=new URL(a.href);o.pathname+=".html",yield o.href}if(r){const o=r({url:i});for(const u of o)yield u.href}}class Ln extends B{constructor(e,n){const s=({request:r})=>{const i=e.getURLsToCacheKeys();for(const a of Mn(r.url,n)){const o=i.get(a);if(o){const u=e.getIntegrityForCacheKey(o);return{cacheKey:o,integrity:u}}}};super(s,e.strategy)}}function Bn(t){const e=Ce(),n=new Ln(e,t);x(n)}const Un="-precache-",Fn=(n,...s)=>c(void 0,[n,...s],function*(t,e=Un){const i=(yield self.caches.keys()).filter(a=>a.includes(e)&&a.includes(self.registration.scope)&&a!==t);return yield Promise.all(i.map(a=>self.caches.delete(a))),i});function $n(){self.addEventListener("activate",t=>{const e=G.getPrecacheName();t.waitUntil(Fn(e).then(n=>{}))})}function qn(t){return Ce().createHandlerBoundToURL(t)}function jn(t){Ce().precache(t)}function Hn(t,e){jn(t),Bn(e)}class Kn extends B{constructor(e,{allowlist:n=[/./],denylist:s=[]}={}){super(r=>this._match(r),e),this._allowlist=n,this._denylist=s}_match({url:e,request:n}){if(n&&n.mode!=="navigate")return!1;const s=e.pathname+e.search;for(const r of this._denylist)if(r.test(s))return!1;return!!this._allowlist.some(r=>r.test(s))}}class Wn extends J{_handle(e,n){return c(this,null,function*(){let s=yield n.cacheMatch(e),r;if(!s)try{s=yield n.fetchAndCachePut(e)}catch(i){i instanceof Error&&(r=i)}if(!s)throw new p("no-response",{url:e.url,error:r});return s})}}const gt={cacheWillUpdate:e=>c(void 0,[e],function*({response:t}){return t.status===200||t.status===0?t:null})};class Vn extends J{constructor(e={}){super(e),this.plugins.some(n=>"cacheWillUpdate"in n)||this.plugins.unshift(gt),this._networkTimeoutSeconds=e.networkTimeoutSeconds||0}_handle(e,n){return c(this,null,function*(){const s=[],r=[];let i;if(this._networkTimeoutSeconds){const{id:u,promise:l}=this._getTimeoutPromise({request:e,logs:s,handler:n});i=u,r.push(l)}const a=this._getNetworkPromise({timeoutId:i,request:e,logs:s,handler:n});r.push(a);const o=yield n.waitUntil(c(this,null,function*(){return(yield n.waitUntil(Promise.race(r)))||(yield a)}));if(!o)throw new p("no-response",{url:e.url});return o})}_getTimeoutPromise({request:e,logs:n,handler:s}){let r;return{promise:new Promise(a=>{r=setTimeout(()=>c(this,null,function*(){a(yield s.cacheMatch(e))}),this._networkTimeoutSeconds*1e3)}),id:r}}_getNetworkPromise(i){return c(this,arguments,function*({timeoutId:e,request:n,logs:s,handler:r}){let a,o;try{o=yield r.fetchAndCachePut(n)}catch(u){u instanceof Error&&(a=u)}return e&&clearTimeout(e),(a||!o)&&(o=yield r.cacheMatch(n)),o})}}class mt extends J{constructor(e={}){super(e),this._networkTimeoutSeconds=e.networkTimeoutSeconds||0}_handle(e,n){return c(this,null,function*(){let s,r;try{const i=[n.fetch(e)];if(this._networkTimeoutSeconds){const a=ft(this._networkTimeoutSeconds*1e3);i.push(a)}if(r=yield Promise.race(i),!r)throw new Error(`Timed out the network response after ${this._networkTimeoutSeconds} seconds.`)}catch(i){i instanceof Error&&(s=i)}if(!r)throw new p("no-response",{url:e.url,error:s});return r})}}class zn extends J{constructor(e={}){super(e),this.plugins.some(n=>"cacheWillUpdate"in n)||this.plugins.unshift(gt)}_handle(e,n){return c(this,null,function*(){const s=n.fetchAndCachePut(e).catch(()=>{});n.waitUntil(s);let r=yield n.cacheMatch(e),i;if(!r)try{r=yield s}catch(a){a instanceof Error&&(i=a)}if(!r)throw new p("no-response",{url:e.url,error:i});return r})}}const Gn=(t,e)=>e.some(n=>t instanceof n);let Ge,Je;function Jn(){return Ge||(Ge=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Qn(){return Je||(Je=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const wt=new WeakMap,ye=new WeakMap,bt=new WeakMap,ue=new WeakMap,De=new WeakMap;function Yn(t){const e=new Promise((n,s)=>{const r=()=>{t.removeEventListener("success",i),t.removeEventListener("error",a)},i=()=>{n(v(t.result)),r()},a=()=>{s(t.error),r()};t.addEventListener("success",i),t.addEventListener("error",a)});return e.then(n=>{n instanceof IDBCursor&&wt.set(n,t)}).catch(()=>{}),De.set(e,t),e}function Xn(t){if(ye.has(t))return;const e=new Promise((n,s)=>{const r=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",a),t.removeEventListener("abort",a)},i=()=>{n(),r()},a=()=>{s(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",i),t.addEventListener("error",a),t.addEventListener("abort",a)});ye.set(t,e)}let _e={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return ye.get(t);if(e==="objectStoreNames")return t.objectStoreNames||bt.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return v(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function Zn(t){_e=t(_e)}function es(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const s=t.call(le(this),e,...n);return bt.set(s,e.sort?e.sort():[e]),v(s)}:Qn().includes(t)?function(...e){return t.apply(le(this),e),v(wt.get(this))}:function(...e){return v(t.apply(le(this),e))}}function ts(t){return typeof t=="function"?es(t):(t instanceof IDBTransaction&&Xn(t),Gn(t,Jn())?new Proxy(t,_e):t)}function v(t){if(t instanceof IDBRequest)return Yn(t);if(ue.has(t))return ue.get(t);const e=ts(t);return e!==t&&(ue.set(t,e),De.set(e,t)),e}const le=t=>De.get(t);function $(t,e,{blocked:n,upgrade:s,blocking:r,terminated:i}={}){const a=indexedDB.open(t,e),o=v(a);return s&&a.addEventListener("upgradeneeded",u=>{s(v(a.result),u.oldVersion,u.newVersion,v(a.transaction),u)}),n&&a.addEventListener("blocked",u=>n(u.oldVersion,u.newVersion,u)),o.then(u=>{i&&u.addEventListener("close",()=>i()),r&&u.addEventListener("versionchange",l=>r(l.oldVersion,l.newVersion,l))}).catch(()=>{}),o}function X(t,{blocked:e}={}){const n=indexedDB.deleteDatabase(t);return e&&n.addEventListener("blocked",s=>e(s.oldVersion,s)),v(n).then(()=>{})}const ns=["get","getKey","getAll","getAllKeys","count"],ss=["put","add","delete","clear"],he=new Map;function Qe(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(he.get(e))return he.get(e);const n=e.replace(/FromIndex$/,""),s=e!==n,r=ss.includes(n);if(!(n in(s?IDBIndex:IDBObjectStore).prototype)||!(r||ns.includes(n)))return;const i=function(a,...o){return c(this,null,function*(){const u=this.transaction(a,r?"readwrite":"readonly");let l=u.store;return s&&(l=l.index(o.shift())),(yield Promise.all([l[n](...o),r&&u.done]))[0]})};return he.set(e,i),i}Zn(t=>He(je({},t),{get:(e,n,s)=>Qe(e,n)||t.get(e,n,s),has:(e,n)=>!!Qe(e,n)||t.has(e,n)}));try{self["workbox:background-sync:7.3.0"]&&_()}catch(t){}const Ye=3,rs="workbox-background-sync",b="requests",H="queueName";class is{constructor(){this._db=null}addEntry(e){return c(this,null,function*(){const s=(yield this.getDb()).transaction(b,"readwrite",{durability:"relaxed"});yield s.store.add(e),yield s.done})}getFirstEntryId(){return c(this,null,function*(){const n=yield(yield this.getDb()).transaction(b).store.openCursor();return n==null?void 0:n.value.id})}getAllEntriesByQueueName(e){return c(this,null,function*(){const s=yield(yield this.getDb()).getAllFromIndex(b,H,IDBKeyRange.only(e));return s||new Array})}getEntryCountByQueueName(e){return c(this,null,function*(){return(yield this.getDb()).countFromIndex(b,H,IDBKeyRange.only(e))})}deleteEntry(e){return c(this,null,function*(){yield(yield this.getDb()).delete(b,e)})}getFirstEntryByQueueName(e){return c(this,null,function*(){return yield this.getEndEntryFromIndex(IDBKeyRange.only(e),"next")})}getLastEntryByQueueName(e){return c(this,null,function*(){return yield this.getEndEntryFromIndex(IDBKeyRange.only(e),"prev")})}getEndEntryFromIndex(e,n){return c(this,null,function*(){const r=yield(yield this.getDb()).transaction(b).store.index(H).openCursor(e,n);return r==null?void 0:r.value})}getDb(){return c(this,null,function*(){return this._db||(this._db=yield $(rs,Ye,{upgrade:this._upgradeDb})),this._db})}_upgradeDb(e,n){n>0&&n<Ye&&e.objectStoreNames.contains(b)&&e.deleteObjectStore(b),e.createObjectStore(b,{autoIncrement:!0,keyPath:"id"}).createIndex(H,H,{unique:!1})}}class as{constructor(e){this._queueName=e,this._queueDb=new is}pushEntry(e){return c(this,null,function*(){delete e.id,e.queueName=this._queueName,yield this._queueDb.addEntry(e)})}unshiftEntry(e){return c(this,null,function*(){const n=yield this._queueDb.getFirstEntryId();n?e.id=n-1:delete e.id,e.queueName=this._queueName,yield this._queueDb.addEntry(e)})}popEntry(){return c(this,null,function*(){return this._removeEntry(yield this._queueDb.getLastEntryByQueueName(this._queueName))})}shiftEntry(){return c(this,null,function*(){return this._removeEntry(yield this._queueDb.getFirstEntryByQueueName(this._queueName))})}getAll(){return c(this,null,function*(){return yield this._queueDb.getAllEntriesByQueueName(this._queueName)})}size(){return c(this,null,function*(){return yield this._queueDb.getEntryCountByQueueName(this._queueName)})}deleteEntry(e){return c(this,null,function*(){yield this._queueDb.deleteEntry(e)})}_removeEntry(e){return c(this,null,function*(){return e&&(yield this.deleteEntry(e.id)),e})}}const os=["method","referrer","referrerPolicy","mode","credentials","cache","redirect","integrity","keepalive"];class W{static fromRequest(e){return c(this,null,function*(){const n={url:e.url,headers:{}};e.method!=="GET"&&(n.body=yield e.clone().arrayBuffer());for(const[s,r]of e.headers.entries())n.headers[s]=r;for(const s of os)e[s]!==void 0&&(n[s]=e[s]);return new W(n)})}constructor(e){e.mode==="navigate"&&(e.mode="same-origin"),this._requestData=e}toObject(){const e=Object.assign({},this._requestData);return e.headers=Object.assign({},this._requestData.headers),e.body&&(e.body=e.body.slice(0)),e}toRequest(){return new Request(this._requestData.url,this._requestData)}clone(){return new W(this.toObject())}}const Xe="workbox-background-sync",cs=60*24*7,de=new Set,Ze=t=>{const e={request:new W(t.requestData).toRequest(),timestamp:t.timestamp};return t.metadata&&(e.metadata=t.metadata),e};class us{constructor(e,{forceSyncFallback:n,onSync:s,maxRetentionTime:r}={}){if(this._syncInProgress=!1,this._requestsAddedDuringSync=!1,de.has(e))throw new p("duplicate-queue-name",{name:e});de.add(e),this._name=e,this._onSync=s||this.replayRequests,this._maxRetentionTime=r||cs,this._forceSyncFallback=!!n,this._queueStore=new as(this._name),this._addSyncListener()}get name(){return this._name}pushRequest(e){return c(this,null,function*(){yield this._addRequest(e,"push")})}unshiftRequest(e){return c(this,null,function*(){yield this._addRequest(e,"unshift")})}popRequest(){return c(this,null,function*(){return this._removeRequest("pop")})}shiftRequest(){return c(this,null,function*(){return this._removeRequest("shift")})}getAll(){return c(this,null,function*(){const e=yield this._queueStore.getAll(),n=Date.now(),s=[];for(const r of e){const i=this._maxRetentionTime*60*1e3;n-r.timestamp>i?yield this._queueStore.deleteEntry(r.id):s.push(Ze(r))}return s})}size(){return c(this,null,function*(){return yield this._queueStore.size()})}_addRequest(i,a){return c(this,arguments,function*({request:e,metadata:n,timestamp:s=Date.now()},r){const u={requestData:(yield W.fromRequest(e.clone())).toObject(),timestamp:s};switch(n&&(u.metadata=n),r){case"push":yield this._queueStore.pushEntry(u);break;case"unshift":yield this._queueStore.unshiftEntry(u);break}this._syncInProgress?this._requestsAddedDuringSync=!0:yield this.registerSync()})}_removeRequest(e){return c(this,null,function*(){const n=Date.now();let s;switch(e){case"pop":s=yield this._queueStore.popEntry();break;case"shift":s=yield this._queueStore.shiftEntry();break}if(s){const r=this._maxRetentionTime*60*1e3;return n-s.timestamp>r?this._removeRequest(e):Ze(s)}else return})}replayRequests(){return c(this,null,function*(){let e;for(;e=yield this.shiftRequest();)try{yield fetch(e.request.clone())}catch(n){throw yield this.unshiftRequest(e),new p("queue-replay-failed",{name:this._name})}})}registerSync(){return c(this,null,function*(){if("sync"in self.registration&&!this._forceSyncFallback)try{yield self.registration.sync.register(`${Xe}:${this._name}`)}catch(e){}})}_addSyncListener(){"sync"in self.registration&&!this._forceSyncFallback?self.addEventListener("sync",e=>{if(e.tag===`${Xe}:${this._name}`){const n=()=>c(this,null,function*(){this._syncInProgress=!0;let s;try{yield this._onSync({queue:this})}catch(r){if(r instanceof Error)throw s=r,s}finally{this._requestsAddedDuringSync&&!(s&&!e.lastChance)&&(yield this.registerSync()),this._syncInProgress=!1,this._requestsAddedDuringSync=!1}});e.waitUntil(n())}}):this._onSync({queue:this})}static get _queueNames(){return de}}class ls{constructor(e,n){this.fetchDidFail=r=>c(this,[r],function*({request:s}){yield this._queue.pushRequest({request:s})}),this._queue=new us(e,n)}}function yt(t){t.then(()=>{})}try{self["workbox:expiration:7.3.0"]&&_()}catch(t){}const hs="workbox-expiration",K="cache-entries",et=t=>{const e=new URL(t,location.href);return e.hash="",e.href};class ds{constructor(e){this._db=null,this._cacheName=e}_upgradeDb(e){const n=e.createObjectStore(K,{keyPath:"id"});n.createIndex("cacheName","cacheName",{unique:!1}),n.createIndex("timestamp","timestamp",{unique:!1})}_upgradeDbAndDeleteOldDbs(e){this._upgradeDb(e),this._cacheName&&X(this._cacheName)}setTimestamp(e,n){return c(this,null,function*(){e=et(e);const s={url:e,timestamp:n,cacheName:this._cacheName,id:this._getId(e)},i=(yield this.getDb()).transaction(K,"readwrite",{durability:"relaxed"});yield i.store.put(s),yield i.done})}getTimestamp(e){return c(this,null,function*(){const s=yield(yield this.getDb()).get(K,this._getId(e));return s==null?void 0:s.timestamp})}expireEntries(e,n){return c(this,null,function*(){const s=yield this.getDb();let r=yield s.transaction(K).store.index("timestamp").openCursor(null,"prev");const i=[];let a=0;for(;r;){const u=r.value;u.cacheName===this._cacheName&&(e&&u.timestamp<e||n&&a>=n?i.push(r.value):a++),r=yield r.continue()}const o=[];for(const u of i)yield s.delete(K,u.id),o.push(u.url);return o})}_getId(e){return this._cacheName+"|"+et(e)}getDb(){return c(this,null,function*(){return this._db||(this._db=yield $(hs,1,{upgrade:this._upgradeDbAndDeleteOldDbs.bind(this)})),this._db})}}class fs{constructor(e,n={}){this._isRunning=!1,this._rerunRequested=!1,this._maxEntries=n.maxEntries,this._maxAgeSeconds=n.maxAgeSeconds,this._matchOptions=n.matchOptions,this._cacheName=e,this._timestampModel=new ds(e)}expireEntries(){return c(this,null,function*(){if(this._isRunning){this._rerunRequested=!0;return}this._isRunning=!0;const e=this._maxAgeSeconds?Date.now()-this._maxAgeSeconds*1e3:0,n=yield this._timestampModel.expireEntries(e,this._maxEntries),s=yield self.caches.open(this._cacheName);for(const r of n)yield s.delete(r,this._matchOptions);this._isRunning=!1,this._rerunRequested&&(this._rerunRequested=!1,yt(this.expireEntries()))})}updateTimestamp(e){return c(this,null,function*(){yield this._timestampModel.setTimestamp(e,Date.now())})}isURLExpired(e){return c(this,null,function*(){if(this._maxAgeSeconds){const n=yield this._timestampModel.getTimestamp(e),s=Date.now()-this._maxAgeSeconds*1e3;return n!==void 0?n<s:!0}else return!1})}delete(){return c(this,null,function*(){this._rerunRequested=!1,yield this._timestampModel.expireEntries(1/0)})}}function ps(t){dt.add(t)}class Te{constructor(e={}){this.cachedResponseWillBeUsed=a=>c(this,[a],function*({event:n,request:s,cacheName:r,cachedResponse:i}){if(!i)return null;const o=this._isResponseDateFresh(i),u=this._getCacheExpiration(r);yt(u.expireEntries());const l=u.updateTimestamp(s.url);if(n)try{n.waitUntil(l)}catch(h){}return o?i:null}),this.cacheDidUpdate=r=>c(this,[r],function*({cacheName:n,request:s}){const i=this._getCacheExpiration(n);yield i.updateTimestamp(s.url),yield i.expireEntries()}),this._config=e,this._maxAgeSeconds=e.maxAgeSeconds,this._cacheExpirations=new Map,e.purgeOnQuotaError&&ps(()=>this.deleteCacheAndMetadata())}_getCacheExpiration(e){if(e===G.getRuntimeName())throw new p("expire-custom-caches-only");let n=this._cacheExpirations.get(e);return n||(n=new fs(e,this._config),this._cacheExpirations.set(e,n)),n}_isResponseDateFresh(e){if(!this._maxAgeSeconds)return!0;const n=this._getDateHeaderTimestamp(e);if(n===null)return!0;const s=Date.now();return n>=s-this._maxAgeSeconds*1e3}_getDateHeaderTimestamp(e){if(!e.headers.has("date"))return null;const n=e.headers.get("date"),r=new Date(n).getTime();return isNaN(r)?null:r}deleteCacheAndMetadata(){return c(this,null,function*(){for(const[e,n]of this._cacheExpirations)yield self.caches.delete(e),yield n.delete();this._cacheExpirations=new Map})}}$n();Hn([{"revision":"9fee8fc3ee50f8283163772828926cd7","url":"registerSW.js"},{"revision":"44173f3aa1c46fc3cfd643cea1b812e5","url":"index.html"},{"revision":"33460367a54c18a18942e9ba271811fb","url":"frappe-push-notification.js"},{"revision":"df059787395d872ed052f5938bb54e5e","url":"favicon.png"},{"revision":null,"url":"assets/usePullToRefresh-BQJWBoAC.js"},{"revision":null,"url":"assets/useFrappeAuth-iir_F9Mp.js"},{"revision":null,"url":"assets/useFormatters-0PJIFdUT.js"},{"revision":null,"url":"assets/quotations-BTboxfxn.js"},{"revision":null,"url":"assets/orders-BbMYX2iq.js"},{"revision":null,"url":"assets/items-CrgN8fZr.js"},{"revision":null,"url":"assets/invoices-D1eR0Vvb.js"},{"revision":null,"url":"assets/index9.css"},{"revision":null,"url":"assets/index8.css"},{"revision":null,"url":"assets/index7.css"},{"revision":null,"url":"assets/index6.css"},{"revision":null,"url":"assets/index5.css"},{"revision":null,"url":"assets/index4.css"},{"revision":null,"url":"assets/index3.css"},{"revision":null,"url":"assets/index2.css"},{"revision":null,"url":"assets/index14.css"},{"revision":null,"url":"assets/index13.css"},{"revision":null,"url":"assets/index12.css"},{"revision":null,"url":"assets/index11.css"},{"revision":null,"url":"assets/index10.css"},{"revision":null,"url":"assets/index.js"},{"revision":null,"url":"assets/index.css"},{"revision":null,"url":"assets/deliveryNotes-BF0ic_rl.js"},{"revision":null,"url":"assets/defaults-DAw7XKdY.js"},{"revision":null,"url":"assets/customers-y05SDa6I.js"},{"revision":null,"url":"assets/StatusBadge-gwoTaoDu.js"},{"revision":null,"url":"assets/ShareButton-DZCdbeWD.js"},{"revision":null,"url":"assets/SalesOrdersView-jDR64diL.js"},{"revision":null,"url":"assets/SalesOrderFormView-Bj21NE8h.js"},{"revision":null,"url":"assets/SalesOrderDetailView-7GSELX4t.js"},{"revision":null,"url":"assets/QuotationsView-CZi41VOL.js"},{"revision":null,"url":"assets/QuotationFormView-VskpLoDs.js"},{"revision":null,"url":"assets/QuotationDetailView-CzdIuWxZ.js"},{"revision":null,"url":"assets/PullToRefreshIndicator-CVlJXW2F.js"},{"revision":null,"url":"assets/ProfileView-BjDSaXqx.js"},{"revision":null,"url":"assets/NotificationsView-D6Zr9A7G.js"},{"revision":null,"url":"assets/LoginView-C6GG8Kni.js"},{"revision":null,"url":"assets/ItemsView-C85xpBF8.js"},{"revision":null,"url":"assets/ItemFormView-DVNYOQWY.js"},{"revision":null,"url":"assets/ItemDetailView-BCZDi3YK.js"},{"revision":null,"url":"assets/InvoicesView-fnmz9vqD.js"},{"revision":null,"url":"assets/InvoiceFormView-1OmTUbz5.js"},{"revision":null,"url":"assets/InvoiceDetailView-DbxIzV7r.js"},{"revision":null,"url":"assets/Inter-ThinItalic-DBcH6Vgh.woff2"},{"revision":null,"url":"assets/Inter-Thin-DSL9z4N4.woff2"},{"revision":null,"url":"assets/Inter-SemiBoldItalic-BCv_V4rY.woff2"},{"revision":null,"url":"assets/Inter-SemiBold-1vGiIFm-.woff2"},{"revision":null,"url":"assets/Inter-Regular-C2oJmTkV.woff2"},{"revision":null,"url":"assets/Inter-MediumItalic-eHnJB7Jg.woff2"},{"revision":null,"url":"assets/Inter-Medium-IZr8HYrM.woff2"},{"revision":null,"url":"assets/Inter-LightItalic-D7CZjNld.woff2"},{"revision":null,"url":"assets/Inter-Light-DnIZ4z7m.woff2"},{"revision":null,"url":"assets/Inter-Italic-hKgVlhAp.woff2"},{"revision":null,"url":"assets/Inter-ExtraLightItalic-P0LgEjH5.woff2"},{"revision":null,"url":"assets/Inter-ExtraLight-CVHKq-2y.woff2"},{"revision":null,"url":"assets/Inter-ExtraBoldItalic-D3vRRq6U.woff2"},{"revision":null,"url":"assets/Inter-ExtraBold-By5SPTh4.woff2"},{"revision":null,"url":"assets/Inter-BoldItalic-BdQXFVxU.woff2"},{"revision":null,"url":"assets/Inter-Bold-qmp61_03.woff2"},{"revision":null,"url":"assets/Inter-BlackItalic-Bghfc0zS.woff2"},{"revision":null,"url":"assets/Inter-Black-CC-lMqXu.woff2"},{"revision":null,"url":"assets/HomeView-DQ_Hr0tz.js"},{"revision":null,"url":"assets/FloatingActionButton-DdVOxOHe.js"},{"revision":null,"url":"assets/ErrorState-CiD02z4i.js"},{"revision":null,"url":"assets/DetailTopNav-DHbEndIX.js"},{"revision":null,"url":"assets/DeliveryNotesView-Beaz4ClU.js"},{"revision":null,"url":"assets/DeliveryNoteFormView-5kso-Fy6.js"},{"revision":null,"url":"assets/DeliveryNoteDetailView-D-TFYSXi.js"},{"revision":null,"url":"assets/DateRangePicker-c4yg-Rvw.js"},{"revision":null,"url":"assets/CustomersView-CsONOMyL.js"},{"revision":null,"url":"assets/CustomerFormView-BqamhdMM.js"},{"revision":null,"url":"assets/CustomerDetailView-D2_Tyqij.js"},{"revision":null,"url":"assets/AutocompleteInput-D_DE3fUJ.js"},{"revision":null,"url":"assets/AppShell-Bg6tOyZu.js"},{"revision":null,"url":"assets/ActionFooter-BhTvnfPD.js"},{"revision":"9a2047dc176c04df5131116f9e85b3c4","url":"manifest.webmanifest"}]);x(new Kn(qn("index.html"),{denylist:[/^\/api\//]}));const _t=new ls("saleshub-mutations",{maxRetentionTime:24*60});x(({url:t,request:e})=>t.pathname.startsWith("/api/method/")&&e.method==="POST",new mt({plugins:[_t]}),"POST");x(({url:t,request:e})=>t.pathname.startsWith("/api/resource/")&&e.method==="PUT",new mt({plugins:[_t]}),"PUT");x(({url:t})=>t.pathname.startsWith("/api/method/")||t.pathname.startsWith("/api/resource/"),new Vn({cacheName:"frappe-api-cache",networkTimeoutSeconds:5,plugins:[new Te({maxEntries:200,maxAgeSeconds:24*60*60})]}));x(({request:t})=>t.destination==="font",new Wn({cacheName:"fonts-cache",plugins:[new Te({maxEntries:20,maxAgeSeconds:30*24*60*60})]}));x(({request:t})=>t.destination==="image",new zn({cacheName:"images-cache",plugins:[new Te({maxEntries:60,maxAgeSeconds:7*24*60*60})]}));self.addEventListener("message",t=>{var e;((e=t.data)==null?void 0:e.type)==="SKIP_WAITING"&&self.skipWaiting()});const tt=new URL(location).searchParams.get("config");tt&&c(void 0,null,function*(){try{const{initializeApp:t}=yield We(()=>c(void 0,null,function*(){const{initializeApp:i}=yield Promise.resolve().then(()=>Lr);return{initializeApp:i}}),void 0),{getMessaging:e,onBackgroundMessage:n}=yield We(()=>c(void 0,null,function*(){const{getMessaging:i,onBackgroundMessage:a}=yield Promise.resolve().then(()=>ma);return{getMessaging:i,onBackgroundMessage:a}}),void 0),s=t(JSON.parse(tt)),r=e(s);n(r,i=>{var u,l,h,d;const a=((u=i==null?void 0:i.data)==null?void 0:u.title)||"SalesHub",o={body:((l=i==null?void 0:i.data)==null?void 0:l.body)||"",icon:((h=i==null?void 0:i.data)==null?void 0:h.notification_icon)||"/assets/slate/frontend/icons/icon-192.png",data:{url:(d=i==null?void 0:i.data)==null?void 0:d.click_action}};self.registration.showNotification(a,o)}),self.addEventListener("notificationclick",i=>{var o;i.notification.close();const a=(o=i.notification.data)==null?void 0:o.url;a&&i.waitUntil(clients.openWindow(a))})}catch(t){console.error("[SW] Firebase push notification init failed",t)}});var nt={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Et=function(t){const e=[];let n=0;for(let s=0;s<t.length;s++){let r=t.charCodeAt(s);r<128?e[n++]=r:r<2048?(e[n++]=r>>6|192,e[n++]=r&63|128):(r&64512)===55296&&s+1<t.length&&(t.charCodeAt(s+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++s)&1023),e[n++]=r>>18|240,e[n++]=r>>12&63|128,e[n++]=r>>6&63|128,e[n++]=r&63|128):(e[n++]=r>>12|224,e[n++]=r>>6&63|128,e[n++]=r&63|128)}return e},gs=function(t){const e=[];let n=0,s=0;for(;n<t.length;){const r=t[n++];if(r<128)e[s++]=String.fromCharCode(r);else if(r>191&&r<224){const i=t[n++];e[s++]=String.fromCharCode((r&31)<<6|i&63)}else if(r>239&&r<365){const i=t[n++],a=t[n++],o=t[n++],u=((r&7)<<18|(i&63)<<12|(a&63)<<6|o&63)-65536;e[s++]=String.fromCharCode(55296+(u>>10)),e[s++]=String.fromCharCode(56320+(u&1023))}else{const i=t[n++],a=t[n++];e[s++]=String.fromCharCode((r&15)<<12|(i&63)<<6|a&63)}}return e.join("")},vt={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let r=0;r<t.length;r+=3){const i=t[r],a=r+1<t.length,o=a?t[r+1]:0,u=r+2<t.length,l=u?t[r+2]:0,h=i>>2,d=(i&3)<<4|o>>4;let w=(o&15)<<2|l>>6,L=l&63;u||(L=64,a||(w=64)),s.push(n[h],n[d],n[w],n[L])}return s.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Et(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):gs(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let r=0;r<t.length;){const i=n[t.charAt(r++)],o=r<t.length?n[t.charAt(r)]:0;++r;const l=r<t.length?n[t.charAt(r)]:64;++r;const d=r<t.length?n[t.charAt(r)]:64;if(++r,i==null||o==null||l==null||d==null)throw new ms;const w=i<<2|o>>4;if(s.push(w),l!==64){const L=o<<4&240|l>>2;if(s.push(L),d!==64){const cn=l<<6&192|d;s.push(cn)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class ms extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const ws=function(t){const e=Et(t);return vt.encodeByteArray(e,!0)},St=function(t){return ws(t).replace(/\./g,"")},bs=function(t){try{return vt.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ys(){if(typeof self!="undefined")return self;if(typeof window!="undefined")return window;if(typeof global!="undefined")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _s=()=>ys().__FIREBASE_DEFAULTS__,Es=()=>{if(typeof process=="undefined"||typeof nt=="undefined")return;const t=nt.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},vs=()=>{if(typeof document=="undefined")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(n){return}const e=t&&bs(t[1]);return e&&JSON.parse(e)},Ss=()=>{try{return _s()||Es()||vs()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},It=()=>{var t;return(t=Ss())===null||t===void 0?void 0:t.config};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Is{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,s)=>{n?this.reject(n):this.resolve(s),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,s))}}}function Cs(){return typeof window!="undefined"||Ct()}function Ct(){return typeof WorkerGlobalScope!="undefined"&&typeof self!="undefined"&&self instanceof WorkerGlobalScope}function Dt(){try{return typeof indexedDB=="object"}catch(t){return!1}}function Tt(){return new Promise((t,e)=>{try{let n=!0;const s="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(s);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(s),t(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{var i;e(((i=r.error)===null||i===void 0?void 0:i.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ds="FirebaseError";class M extends Error{constructor(e,n,s){super(n),this.code=e,this.customData=s,this.name=Ds,Object.setPrototypeOf(this,M.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,re.prototype.create)}}class re{constructor(e,n,s){this.service=e,this.serviceName=n,this.errors=s}create(e,...n){const s=n[0]||{},r=`${this.service}/${e}`,i=this.errors[e],a=i?Ts(i,s):"Error",o=`${this.serviceName}: ${a} (${r}).`;return new M(r,o,s)}}function Ts(t,e){return t.replace(Rs,(n,s)=>{const r=e[s];return r!=null?String(r):`<${s}?>`})}const Rs=/\{\$([^}]+)}/g;function Ee(t,e){if(t===e)return!0;const n=Object.keys(t),s=Object.keys(e);for(const r of n){if(!s.includes(r))return!1;const i=t[r],a=e[r];if(st(i)&&st(a)){if(!Ee(i,a))return!1}else if(i!==a)return!1}for(const r of s)if(!n.includes(r))return!1;return!0}function st(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Re(t){return t&&t._delegate?t._delegate:t}class A{constructor(e,n,s){this.name=e,this.instanceFactory=n,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const T="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class As{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const s=new Is;if(this.instancesDeferred.set(n,s),this.isInitialized(n)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:n});r&&s.resolve(r)}catch(r){}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const s=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(s)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:s})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Os(e))try{this.getOrInitializeService({instanceIdentifier:T})}catch(n){}for(const[n,s]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(n);try{const i=this.getOrInitializeService({instanceIdentifier:r});s.resolve(i)}catch(i){}}}}clearInstance(e=T){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}delete(){return c(this,null,function*(){const e=Array.from(this.instances.values());yield Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])})}isComponentSet(){return this.component!=null}isInitialized(e=T){return this.instances.has(e)}getOptions(e=T){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,s=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:s,options:n});for(const[i,a]of this.instancesDeferred.entries()){const o=this.normalizeInstanceIdentifier(i);s===o&&a.resolve(r)}return r}onInit(e,n){var s;const r=this.normalizeInstanceIdentifier(n),i=(s=this.onInitCallbacks.get(r))!==null&&s!==void 0?s:new Set;i.add(e),this.onInitCallbacks.set(r,i);const a=this.instances.get(r);return a&&e(a,r),()=>{i.delete(e)}}invokeOnInitCallbacks(e,n){const s=this.onInitCallbacks.get(n);if(s)for(const r of s)try{r(e,n)}catch(i){}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let s=this.instances.get(e);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:ks(e),options:n}),this.instances.set(e,s),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(s,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,s)}catch(r){}return s||null}normalizeInstanceIdentifier(e=T){return this.component?this.component.multipleInstances?e:T:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function ks(t){return t===T?void 0:t}function Os(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new As(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ae=[];var f;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(f||(f={}));const At={debug:f.DEBUG,verbose:f.VERBOSE,info:f.INFO,warn:f.WARN,error:f.ERROR,silent:f.SILENT},Ns=f.INFO,Ps={[f.DEBUG]:"log",[f.VERBOSE]:"log",[f.INFO]:"info",[f.WARN]:"warn",[f.ERROR]:"error"},xs=(t,e,...n)=>{if(e<t.logLevel)return;const s=new Date().toISOString(),r=Ps[e];if(r)console[r](`[${s}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Ms{constructor(e){this.name=e,this._logLevel=Ns,this._logHandler=xs,this._userLogHandler=null,Ae.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in f))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?At[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,f.DEBUG,...e),this._logHandler(this,f.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,f.VERBOSE,...e),this._logHandler(this,f.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,f.INFO,...e),this._logHandler(this,f.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,f.WARN,...e),this._logHandler(this,f.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,f.ERROR,...e),this._logHandler(this,f.ERROR,...e)}}function Ls(t){Ae.forEach(e=>{e.setLogLevel(t)})}function Bs(t,e){for(const n of Ae){let s=null;e&&e.level&&(s=At[e.level]),t===null?n.userLogHandler=null:n.userLogHandler=(r,i,...a)=>{const o=a.map(u=>{if(u==null)return null;if(typeof u=="string")return u;if(typeof u=="number"||typeof u=="boolean")return u.toString();if(u instanceof Error)return u.message;try{return JSON.stringify(u)}catch(l){return null}}).filter(u=>u).join(" ");i>=(s!=null?s:r.logLevel)&&t({level:f[i].toLowerCase(),message:o,args:a,type:r.name})}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Us{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(Fs(n)){const s=n.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(n=>n).join(" ")}}function Fs(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const ee="@firebase/app",ve="0.10.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const S=new Ms("@firebase/app"),$s="@firebase/app-compat",qs="@firebase/analytics-compat",js="@firebase/analytics",Hs="@firebase/app-check-compat",Ks="@firebase/app-check",Ws="@firebase/auth",Vs="@firebase/auth-compat",zs="@firebase/database",Gs="@firebase/data-connect",Js="@firebase/database-compat",Qs="@firebase/functions",Ys="@firebase/functions-compat",Xs="@firebase/installations",Zs="@firebase/installations-compat",er="@firebase/messaging",tr="@firebase/messaging-compat",nr="@firebase/performance",sr="@firebase/performance-compat",rr="@firebase/remote-config",ir="@firebase/remote-config-compat",ar="@firebase/storage",or="@firebase/storage-compat",cr="@firebase/firestore",ur="@firebase/vertexai-preview",lr="@firebase/firestore-compat",hr="firebase",dr="10.14.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const V="[DEFAULT]",fr={[ee]:"fire-core",[$s]:"fire-core-compat",[js]:"fire-analytics",[qs]:"fire-analytics-compat",[Ks]:"fire-app-check",[Hs]:"fire-app-check-compat",[Ws]:"fire-auth",[Vs]:"fire-auth-compat",[zs]:"fire-rtdb",[Gs]:"fire-data-connect",[Js]:"fire-rtdb-compat",[Qs]:"fire-fn",[Ys]:"fire-fn-compat",[Xs]:"fire-iid",[Zs]:"fire-iid-compat",[er]:"fire-fcm",[tr]:"fire-fcm-compat",[nr]:"fire-perf",[sr]:"fire-perf-compat",[rr]:"fire-rc",[ir]:"fire-rc-compat",[ar]:"fire-gcs",[or]:"fire-gcs-compat",[cr]:"fire-fst",[lr]:"fire-fst-compat",[ur]:"fire-vertex","fire-js":"fire-js",[hr]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const D=new Map,U=new Map,F=new Map;function Se(t,e){try{t.container.addComponent(e)}catch(n){S.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function pr(t,e){t.container.addOrOverwriteComponent(e)}function k(t){const e=t.name;if(F.has(e))return S.debug(`There were multiple attempts to register component ${e}.`),!1;F.set(e,t);for(const n of D.values())Se(n,t);for(const n of U.values())Se(n,t);return!0}function Q(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function gr(t,e,n=V){Q(t,e).clearInstance(n)}function kt(t){return t.options!==void 0}function mr(t){return t.settings!==void 0}function wr(){F.clear()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const br={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},g=new re("app","Firebase",br);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ot{constructor(e,n,s){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new A("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw g.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yr extends Ot{constructor(e,n,s,r){const i=n.automaticDataCollectionEnabled!==void 0?n.automaticDataCollectionEnabled:!1,a={name:s,automaticDataCollectionEnabled:i};if(e.apiKey!==void 0)super(e,a,r);else{const o=e;super(o.options,a,r)}this._serverConfig=Object.assign({automaticDataCollectionEnabled:i},n),this._finalizationRegistry=null,typeof FinalizationRegistry!="undefined"&&(this._finalizationRegistry=new FinalizationRegistry(()=>{this.automaticCleanup()})),this._refCount=0,this.incRefCount(this._serverConfig.releaseOnDeref),this._serverConfig.releaseOnDeref=void 0,n.releaseOnDeref=void 0,C(ee,ve,"serverapp")}toJSON(){}get refCount(){return this._refCount}incRefCount(e){this.isDeleted||(this._refCount++,e!==void 0&&this._finalizationRegistry!==null&&this._finalizationRegistry.register(e,this))}decRefCount(){return this.isDeleted?0:--this._refCount}automaticCleanup(){xt(this)}get settings(){return this.checkDestroyed(),this._serverConfig}checkDestroyed(){if(this.isDeleted)throw g.create("server-app-deleted")}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _r=dr;function Nt(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const s=Object.assign({name:V,automaticDataCollectionEnabled:!1},e),r=s.name;if(typeof r!="string"||!r)throw g.create("bad-app-name",{appName:String(r)});if(n||(n=It()),!n)throw g.create("no-options");const i=D.get(r);if(i){if(Ee(n,i.options)&&Ee(s,i.config))return i;throw g.create("duplicate-app",{appName:r})}const a=new Rt(r);for(const u of F.values())a.addComponent(u);const o=new Ot(n,s,a);return D.set(r,o),o}function Er(t,e){if(Cs()&&!Ct())throw g.create("invalid-server-app-environment");e.automaticDataCollectionEnabled===void 0&&(e.automaticDataCollectionEnabled=!1);let n;kt(t)?n=t.options:n=t;const s=Object.assign(Object.assign({},e),n);s.releaseOnDeref!==void 0&&delete s.releaseOnDeref;const r=l=>[...l].reduce((h,d)=>Math.imul(31,h)+d.charCodeAt(0)|0,0);if(e.releaseOnDeref!==void 0&&typeof FinalizationRegistry=="undefined")throw g.create("finalization-registry-not-supported",{});const i=""+r(JSON.stringify(s)),a=U.get(i);if(a)return a.incRefCount(e.releaseOnDeref),a;const o=new Rt(i);for(const l of F.values())o.addComponent(l);const u=new yr(n,e,i,o);return U.set(i,u),u}function Pt(t=V){const e=D.get(t);if(!e&&t===V&&It())return Nt();if(!e)throw g.create("no-app",{appName:t});return e}function vr(){return Array.from(D.values())}function xt(t){return c(this,null,function*(){let e=!1;const n=t.name;D.has(n)?(e=!0,D.delete(n)):U.has(n)&&t.decRefCount()<=0&&(U.delete(n),e=!0),e&&(yield Promise.all(t.container.getProviders().map(s=>s.delete())),t.isDeleted=!0)})}function C(t,e,n){var s;let r=(s=fr[t])!==null&&s!==void 0?s:t;n&&(r+=`-${n}`);const i=r.match(/\s|\//),a=e.match(/\s|\//);if(i||a){const o=[`Unable to register library "${r}" with version "${e}":`];i&&o.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&a&&o.push("and"),a&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),S.warn(o.join(" "));return}k(new A(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}function Sr(t,e){if(t!==null&&typeof t!="function")throw g.create("invalid-log-argument");Bs(t,e)}function Ir(t){Ls(t)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cr="firebase-heartbeat-database",Dr=1,z="firebase-heartbeat-store";let fe=null;function Mt(){return fe||(fe=$(Cr,Dr,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(z)}catch(n){console.warn(n)}}}}).catch(t=>{throw g.create("idb-open",{originalErrorMessage:t.message})})),fe}function Tr(t){return c(this,null,function*(){try{const n=(yield Mt()).transaction(z),s=yield n.objectStore(z).get(Lt(t));return yield n.done,s}catch(e){if(e instanceof M)S.warn(e.message);else{const n=g.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});S.warn(n.message)}}})}function rt(t,e){return c(this,null,function*(){try{const s=(yield Mt()).transaction(z,"readwrite");yield s.objectStore(z).put(e,Lt(t)),yield s.done}catch(n){if(n instanceof M)S.warn(n.message);else{const s=g.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});S.warn(s.message)}}})}function Lt(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rr=1024,Ar=30*24*60*60*1e3;class kr{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new Nr(n),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}triggerHeartbeat(){return c(this,null,function*(){var e,n;try{const r=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=it();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=yield this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:r}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const o=new Date(a.date).valueOf();return Date.now()-o<=Ar}),this._storage.overwrite(this._heartbeatsCache))}catch(s){S.warn(s)}})}getHeartbeatsHeader(){return c(this,null,function*(){var e;try{if(this._heartbeatsCache===null&&(yield this._heartbeatsCachePromise),((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=it(),{heartbeatsToSend:s,unsentEntries:r}=Or(this._heartbeatsCache.heartbeats),i=St(JSON.stringify({version:2,heartbeats:s}));return this._heartbeatsCache.lastSentHeartbeatDate=n,r.length>0?(this._heartbeatsCache.heartbeats=r,yield this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(n){return S.warn(n),""}})}}function it(){return new Date().toISOString().substring(0,10)}function Or(t,e=Rr){const n=[];let s=t.slice();for(const r of t){const i=n.find(a=>a.agent===r.agent);if(i){if(i.dates.push(r.date),at(n)>e){i.dates.pop();break}}else if(n.push({agent:r.agent,dates:[r.date]}),at(n)>e){n.pop();break}s=s.slice(1)}return{heartbeatsToSend:n,unsentEntries:s}}class Nr{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}runIndexedDBEnvironmentCheck(){return c(this,null,function*(){return Dt()?Tt().then(()=>!0).catch(()=>!1):!1})}read(){return c(this,null,function*(){if(yield this._canUseIndexedDBPromise){const n=yield Tr(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}})}overwrite(e){return c(this,null,function*(){var n;if(yield this._canUseIndexedDBPromise){const r=yield this.read();return rt(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return})}add(e){return c(this,null,function*(){var n;if(yield this._canUseIndexedDBPromise){const r=yield this.read();return rt(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return})}}function at(t){return St(JSON.stringify({version:2,heartbeats:t})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pr(t){k(new A("platform-logger",e=>new Us(e),"PRIVATE")),k(new A("heartbeat",e=>new kr(e),"PRIVATE")),C(ee,ve,t),C(ee,ve,"esm2017"),C("fire-js","")}Pr("");var xr="firebase",Mr="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */C(xr,Mr,"app");const Lr=Object.freeze(Object.defineProperty({__proto__:null,FirebaseError:M,SDK_VERSION:_r,_DEFAULT_ENTRY_NAME:V,_addComponent:Se,_addOrOverwriteComponent:pr,_apps:D,_clearComponents:wr,_components:F,_getProvider:Q,_isFirebaseApp:kt,_isFirebaseServerApp:mr,_registerComponent:k,_removeServiceInstance:gr,_serverApps:U,deleteApp:xt,getApp:Pt,getApps:vr,initializeApp:Nt,initializeServerApp:Er,onLog:Sr,registerVersion:C,setLogLevel:Ir},Symbol.toStringTag,{value:"Module"})),Bt="@firebase/installations",ke="0.6.9";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ut=1e4,Ft=`w:${ke}`,$t="FIS_v2",Br="https://firebaseinstallations.googleapis.com/v1",Ur=60*60*1e3,Fr="installations",$r="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qr={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},O=new re(Fr,$r,qr);function qt(t){return t instanceof M&&t.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jt({projectId:t}){return`${Br}/projects/${t}/installations`}function Ht(t){return{token:t.token,requestStatus:2,expiresIn:Hr(t.expiresIn),creationTime:Date.now()}}function Kt(t,e){return c(this,null,function*(){const s=(yield e.json()).error;return O.create("request-failed",{requestName:t,serverCode:s.code,serverMessage:s.message,serverStatus:s.status})})}function Wt({apiKey:t}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t})}function jr(t,{refreshToken:e}){const n=Wt(t);return n.append("Authorization",Kr(e)),n}function Vt(t){return c(this,null,function*(){const e=yield t();return e.status>=500&&e.status<600?t():e})}function Hr(t){return Number(t.replace("s","000"))}function Kr(t){return`${$t} ${t}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wr(s,r){return c(this,arguments,function*({appConfig:t,heartbeatServiceProvider:e},{fid:n}){const i=jt(t),a=Wt(t),o=e.getImmediate({optional:!0});if(o){const d=yield o.getHeartbeatsHeader();d&&a.append("x-firebase-client",d)}const u={fid:n,authVersion:$t,appId:t.appId,sdkVersion:Ft},l={method:"POST",headers:a,body:JSON.stringify(u)},h=yield Vt(()=>fetch(i,l));if(h.ok){const d=yield h.json();return{fid:d.fid||n,registrationStatus:2,refreshToken:d.refreshToken,authToken:Ht(d.authToken)}}else throw yield Kt("Create Installation",h)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zt(t){return new Promise(e=>{setTimeout(e,t)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vr(t){return btoa(String.fromCharCode(...t)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zr=/^[cdef][\w-]{21}$/,Ie="";function Gr(){try{const t=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(t),t[0]=112+t[0]%16;const n=Jr(t);return zr.test(n)?n:Ie}catch(t){return Ie}}function Jr(t){return Vr(t).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ie(t){return`${t.appName}!${t.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gt=new Map;function Jt(t,e){const n=ie(t);Qt(n,e),Qr(n,e)}function Qt(t,e){const n=Gt.get(t);if(n)for(const s of n)s(e)}function Qr(t,e){const n=Yr();n&&n.postMessage({key:t,fid:e}),Xr()}let R=null;function Yr(){return!R&&"BroadcastChannel"in self&&(R=new BroadcastChannel("[Firebase] FID Change"),R.onmessage=t=>{Qt(t.data.key,t.data.fid)}),R}function Xr(){Gt.size===0&&R&&(R.close(),R=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zr="firebase-installations-database",ei=1,N="firebase-installations-store";let pe=null;function Oe(){return pe||(pe=$(Zr,ei,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(N)}}})),pe}function te(t,e){return c(this,null,function*(){const n=ie(t),r=(yield Oe()).transaction(N,"readwrite"),i=r.objectStore(N),a=yield i.get(n);return yield i.put(e,n),yield r.done,(!a||a.fid!==e.fid)&&Jt(t,e.fid),e})}function Yt(t){return c(this,null,function*(){const e=ie(t),s=(yield Oe()).transaction(N,"readwrite");yield s.objectStore(N).delete(e),yield s.done})}function ae(t,e){return c(this,null,function*(){const n=ie(t),r=(yield Oe()).transaction(N,"readwrite"),i=r.objectStore(N),a=yield i.get(n),o=e(a);return o===void 0?yield i.delete(n):yield i.put(o,n),yield r.done,o&&(!a||a.fid!==o.fid)&&Jt(t,o.fid),o})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ne(t){return c(this,null,function*(){let e;const n=yield ae(t.appConfig,s=>{const r=ti(s),i=ni(t,r);return e=i.registrationPromise,i.installationEntry});return n.fid===Ie?{installationEntry:yield e}:{installationEntry:n,registrationPromise:e}})}function ti(t){const e=t||{fid:Gr(),registrationStatus:0};return Xt(e)}function ni(t,e){if(e.registrationStatus===0){if(!navigator.onLine){const r=Promise.reject(O.create("app-offline"));return{installationEntry:e,registrationPromise:r}}const n={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},s=si(t,n);return{installationEntry:n,registrationPromise:s}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:ri(t)}:{installationEntry:e}}function si(t,e){return c(this,null,function*(){try{const n=yield Wr(t,e);return te(t.appConfig,n)}catch(n){throw qt(n)&&n.customData.serverCode===409?yield Yt(t.appConfig):yield te(t.appConfig,{fid:e.fid,registrationStatus:0}),n}})}function ri(t){return c(this,null,function*(){let e=yield ot(t.appConfig);for(;e.registrationStatus===1;)yield zt(100),e=yield ot(t.appConfig);if(e.registrationStatus===0){const{installationEntry:n,registrationPromise:s}=yield Ne(t);return s||n}return e})}function ot(t){return ae(t,e=>{if(!e)throw O.create("installation-not-found");return Xt(e)})}function Xt(t){return ii(t)?{fid:t.fid,registrationStatus:0}:t}function ii(t){return t.registrationStatus===1&&t.registrationTime+Ut<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ai(s,r){return c(this,arguments,function*({appConfig:t,heartbeatServiceProvider:e},n){const i=oi(t,n),a=jr(t,n),o=e.getImmediate({optional:!0});if(o){const d=yield o.getHeartbeatsHeader();d&&a.append("x-firebase-client",d)}const u={installation:{sdkVersion:Ft,appId:t.appId}},l={method:"POST",headers:a,body:JSON.stringify(u)},h=yield Vt(()=>fetch(i,l));if(h.ok){const d=yield h.json();return Ht(d)}else throw yield Kt("Generate Auth Token",h)})}function oi(t,{fid:e}){return`${jt(t)}/${e}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pe(t,e=!1){return c(this,null,function*(){let n;const s=yield ae(t.appConfig,i=>{if(!Zt(i))throw O.create("not-registered");const a=i.authToken;if(!e&&li(a))return i;if(a.requestStatus===1)return n=ci(t,e),i;{if(!navigator.onLine)throw O.create("app-offline");const o=di(i);return n=ui(t,o),o}});return n?yield n:s.authToken})}function ci(t,e){return c(this,null,function*(){let n=yield ct(t.appConfig);for(;n.authToken.requestStatus===1;)yield zt(100),n=yield ct(t.appConfig);const s=n.authToken;return s.requestStatus===0?Pe(t,e):s})}function ct(t){return ae(t,e=>{if(!Zt(e))throw O.create("not-registered");const n=e.authToken;return fi(n)?Object.assign(Object.assign({},e),{authToken:{requestStatus:0}}):e})}function ui(t,e){return c(this,null,function*(){try{const n=yield ai(t,e),s=Object.assign(Object.assign({},e),{authToken:n});return yield te(t.appConfig,s),n}catch(n){if(qt(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))yield Yt(t.appConfig);else{const s=Object.assign(Object.assign({},e),{authToken:{requestStatus:0}});yield te(t.appConfig,s)}throw n}})}function Zt(t){return t!==void 0&&t.registrationStatus===2}function li(t){return t.requestStatus===2&&!hi(t)}function hi(t){const e=Date.now();return e<t.creationTime||t.creationTime+t.expiresIn<e+Ur}function di(t){const e={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},t),{authToken:e})}function fi(t){return t.requestStatus===1&&t.requestTime+Ut<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pi(t){return c(this,null,function*(){const e=t,{installationEntry:n,registrationPromise:s}=yield Ne(e);return s?s.catch(console.error):Pe(e).catch(console.error),n.fid})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gi(t,e=!1){return c(this,null,function*(){const n=t;return yield mi(n),(yield Pe(n,e)).token})}function mi(t){return c(this,null,function*(){const{registrationPromise:e}=yield Ne(t);e&&(yield e)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wi(t){if(!t||!t.options)throw ge("App Configuration");if(!t.name)throw ge("App Name");const e=["projectId","apiKey","appId"];for(const n of e)if(!t.options[n])throw ge(n);return{appName:t.name,projectId:t.options.projectId,apiKey:t.options.apiKey,appId:t.options.appId}}function ge(t){return O.create("missing-app-config-values",{valueName:t})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const en="installations",bi="installations-internal",yi=t=>{const e=t.getProvider("app").getImmediate(),n=wi(e),s=Q(e,"heartbeat");return{app:e,appConfig:n,heartbeatServiceProvider:s,_delete:()=>Promise.resolve()}},_i=t=>{const e=t.getProvider("app").getImmediate(),n=Q(e,en).getImmediate();return{getId:()=>pi(n),getToken:r=>gi(n,r)}};function Ei(){k(new A(en,yi,"PUBLIC")),k(new A(bi,_i,"PRIVATE"))}Ei();C(Bt,ke);C(Bt,ke,"esm2017");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tn="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",vi="https://fcmregistrations.googleapis.com/v1",nn="FCM_MSG",Si="google.c.a.c_id",Ii=3,Ci=1;var ne;(function(t){t[t.DATA_MESSAGE=1]="DATA_MESSAGE",t[t.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(ne||(ne={}));/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */var se;(function(t){t.PUSH_RECEIVED="push-received",t.NOTIFICATION_CLICKED="notification-clicked"})(se||(se={}));/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function y(t){const e=new Uint8Array(t);return btoa(String.fromCharCode(...e)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function Di(t){const e="=".repeat((4-t.length%4)%4),n=(t+e).replace(/\-/g,"+").replace(/_/g,"/"),s=atob(n),r=new Uint8Array(s.length);for(let i=0;i<s.length;++i)r[i]=s.charCodeAt(i);return r}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const me="fcm_token_details_db",Ti=5,ut="fcm_token_object_Store";function Ri(t){return c(this,null,function*(){if("databases"in indexedDB&&!(yield indexedDB.databases()).map(i=>i.name).includes(me))return null;let e=null;return(yield $(me,Ti,{upgrade:(s,r,i,a)=>c(this,null,function*(){var o;if(r<2||!s.objectStoreNames.contains(ut))return;const u=a.objectStore(ut),l=yield u.index("fcmSenderId").get(t);if(yield u.clear(),!!l){if(r===2){const h=l;if(!h.auth||!h.p256dh||!h.endpoint)return;e={token:h.fcmToken,createTime:(o=h.createTime)!==null&&o!==void 0?o:Date.now(),subscriptionOptions:{auth:h.auth,p256dh:h.p256dh,endpoint:h.endpoint,swScope:h.swScope,vapidKey:typeof h.vapidKey=="string"?h.vapidKey:y(h.vapidKey)}}}else if(r===3){const h=l;e={token:h.fcmToken,createTime:h.createTime,subscriptionOptions:{auth:y(h.auth),p256dh:y(h.p256dh),endpoint:h.endpoint,swScope:h.swScope,vapidKey:y(h.vapidKey)}}}else if(r===4){const h=l;e={token:h.fcmToken,createTime:h.createTime,subscriptionOptions:{auth:y(h.auth),p256dh:y(h.p256dh),endpoint:h.endpoint,swScope:h.swScope,vapidKey:y(h.vapidKey)}}}}})})).close(),yield X(me),yield X("fcm_vapid_details_db"),yield X("undefined"),Ai(e)?e:null})}function Ai(t){if(!t||!t.subscriptionOptions)return!1;const{subscriptionOptions:e}=t;return typeof t.createTime=="number"&&t.createTime>0&&typeof t.token=="string"&&t.token.length>0&&typeof e.auth=="string"&&e.auth.length>0&&typeof e.p256dh=="string"&&e.p256dh.length>0&&typeof e.endpoint=="string"&&e.endpoint.length>0&&typeof e.swScope=="string"&&e.swScope.length>0&&typeof e.vapidKey=="string"&&e.vapidKey.length>0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ki="firebase-messaging-database",Oi=1,P="firebase-messaging-store";let we=null;function xe(){return we||(we=$(ki,Oi,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(P)}}})),we}function Me(t){return c(this,null,function*(){const e=Be(t),s=yield(yield xe()).transaction(P).objectStore(P).get(e);if(s)return s;{const r=yield Ri(t.appConfig.senderId);if(r)return yield Le(t,r),r}})}function Le(t,e){return c(this,null,function*(){const n=Be(t),r=(yield xe()).transaction(P,"readwrite");return yield r.objectStore(P).put(e,n),yield r.done,e})}function Ni(t){return c(this,null,function*(){const e=Be(t),s=(yield xe()).transaction(P,"readwrite");yield s.objectStore(P).delete(e),yield s.done})}function Be({appConfig:t}){return t.appId}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pi={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."},m=new re("messaging","Messaging",Pi);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xi(t,e){return c(this,null,function*(){const n=yield Fe(t),s=rn(e),r={method:"POST",headers:n,body:JSON.stringify(s)};let i;try{i=yield(yield fetch(Ue(t.appConfig),r)).json()}catch(a){throw m.create("token-subscribe-failed",{errorInfo:a==null?void 0:a.toString()})}if(i.error){const a=i.error.message;throw m.create("token-subscribe-failed",{errorInfo:a})}if(!i.token)throw m.create("token-subscribe-no-token");return i.token})}function Mi(t,e){return c(this,null,function*(){const n=yield Fe(t),s=rn(e.subscriptionOptions),r={method:"PATCH",headers:n,body:JSON.stringify(s)};let i;try{i=yield(yield fetch(`${Ue(t.appConfig)}/${e.token}`,r)).json()}catch(a){throw m.create("token-update-failed",{errorInfo:a==null?void 0:a.toString()})}if(i.error){const a=i.error.message;throw m.create("token-update-failed",{errorInfo:a})}if(!i.token)throw m.create("token-update-no-token");return i.token})}function sn(t,e){return c(this,null,function*(){const s={method:"DELETE",headers:yield Fe(t)};try{const i=yield(yield fetch(`${Ue(t.appConfig)}/${e}`,s)).json();if(i.error){const a=i.error.message;throw m.create("token-unsubscribe-failed",{errorInfo:a})}}catch(r){throw m.create("token-unsubscribe-failed",{errorInfo:r==null?void 0:r.toString()})}})}function Ue({projectId:t}){return`${vi}/projects/${t}/registrations`}function Fe(n){return c(this,arguments,function*({appConfig:t,installations:e}){const s=yield e.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t.apiKey,"x-goog-firebase-installations-auth":`FIS ${s}`})})}function rn({p256dh:t,auth:e,endpoint:n,vapidKey:s}){const r={web:{endpoint:n,auth:e,p256dh:t}};return s!==tn&&(r.web.applicationPubKey=s),r}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Li=7*24*60*60*1e3;function Bi(t){return c(this,null,function*(){const e=yield Fi(t.swRegistration,t.vapidKey),n={vapidKey:t.vapidKey,swScope:t.swRegistration.scope,endpoint:e.endpoint,auth:y(e.getKey("auth")),p256dh:y(e.getKey("p256dh"))},s=yield Me(t.firebaseDependencies);if(s){if($i(s.subscriptionOptions,n))return Date.now()>=s.createTime+Li?Ui(t,{token:s.token,createTime:Date.now(),subscriptionOptions:n}):s.token;try{yield sn(t.firebaseDependencies,s.token)}catch(r){console.warn(r)}return ht(t.firebaseDependencies,n)}else return ht(t.firebaseDependencies,n)})}function lt(t){return c(this,null,function*(){const e=yield Me(t.firebaseDependencies);e&&(yield sn(t.firebaseDependencies,e.token),yield Ni(t.firebaseDependencies));const n=yield t.swRegistration.pushManager.getSubscription();return n?n.unsubscribe():!0})}function Ui(t,e){return c(this,null,function*(){try{const n=yield Mi(t.firebaseDependencies,e),s=Object.assign(Object.assign({},e),{token:n,createTime:Date.now()});return yield Le(t.firebaseDependencies,s),n}catch(n){throw n}})}function ht(t,e){return c(this,null,function*(){const s={token:yield xi(t,e),createTime:Date.now(),subscriptionOptions:e};return yield Le(t,s),s.token})}function Fi(t,e){return c(this,null,function*(){const n=yield t.pushManager.getSubscription();return n||t.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:Di(e)})})}function $i(t,e){const n=e.vapidKey===t.vapidKey,s=e.endpoint===t.endpoint,r=e.auth===t.auth,i=e.p256dh===t.p256dh;return n&&s&&r&&i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qi(t){const e={from:t.from,collapseKey:t.collapse_key,messageId:t.fcmMessageId};return ji(e,t),Hi(e,t),Ki(e,t),e}function ji(t,e){if(!e.notification)return;t.notification={};const n=e.notification.title;n&&(t.notification.title=n);const s=e.notification.body;s&&(t.notification.body=s);const r=e.notification.image;r&&(t.notification.image=r);const i=e.notification.icon;i&&(t.notification.icon=i)}function Hi(t,e){e.data&&(t.data=e.data)}function Ki(t,e){var n,s,r,i,a;if(!e.fcmOptions&&!(!((n=e.notification)===null||n===void 0)&&n.click_action))return;t.fcmOptions={};const o=(r=(s=e.fcmOptions)===null||s===void 0?void 0:s.link)!==null&&r!==void 0?r:(i=e.notification)===null||i===void 0?void 0:i.click_action;o&&(t.fcmOptions.link=o);const u=(a=e.fcmOptions)===null||a===void 0?void 0:a.analytics_label;u&&(t.fcmOptions.analyticsLabel=u)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wi(t){return typeof t=="object"&&!!t&&Si in t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vi(t){return new Promise(e=>{setTimeout(e,t)})}function zi(t,e){return c(this,null,function*(){const n=Gi(e,yield t.firebaseDependencies.installations.getId());Ji(t,n,e.productId)})}function Gi(t,e){var n,s;const r={};return t.from&&(r.project_number=t.from),t.fcmMessageId&&(r.message_id=t.fcmMessageId),r.instance_id=e,t.notification?r.message_type=ne.DISPLAY_NOTIFICATION.toString():r.message_type=ne.DATA_MESSAGE.toString(),r.sdk_platform=Ii.toString(),r.package_name=self.origin.replace(/(^\w+:|^)\/\//,""),t.collapse_key&&(r.collapse_key=t.collapse_key),r.event=Ci.toString(),!((n=t.fcmOptions)===null||n===void 0)&&n.analytics_label&&(r.analytics_label=(s=t.fcmOptions)===null||s===void 0?void 0:s.analytics_label),r}function Ji(t,e,n){const s={};s.event_time_ms=Math.floor(Date.now()).toString(),s.source_extension_json_proto3=JSON.stringify({messaging_client_event:e}),n&&(s.compliance_data=Qi(n)),t.logEvents.push(s)}function Qi(t){return{privacy_context:{prequest:{origin_associated_product_id:t}}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yi(t,e){return c(this,null,function*(){var n,s;const{newSubscription:r}=t;if(!r){yield lt(e);return}const i=yield Me(e.firebaseDependencies);yield lt(e),e.vapidKey=(s=(n=i==null?void 0:i.subscriptionOptions)===null||n===void 0?void 0:n.vapidKey)!==null&&s!==void 0?s:tn,yield Bi(e)})}function Xi(t,e){return c(this,null,function*(){const n=ta(t);if(!n)return;e.deliveryMetricsExportedToBigQueryEnabled&&(yield zi(e,n));const s=yield an();if(sa(s))return ra(s,n);if(n.notification&&(yield ia(ea(n))),!!e&&e.onBackgroundMessageHandler){const r=qi(n);typeof e.onBackgroundMessageHandler=="function"?yield e.onBackgroundMessageHandler(r):e.onBackgroundMessageHandler.next(r)}})}function Zi(t){return c(this,null,function*(){var e,n;const s=(n=(e=t.notification)===null||e===void 0?void 0:e.data)===null||n===void 0?void 0:n[nn];if(s){if(t.action)return}else return;t.stopImmediatePropagation(),t.notification.close();const r=aa(s);if(!r)return;const i=new URL(r,self.location.href),a=new URL(self.location.origin);if(i.host!==a.host)return;let o=yield na(i);if(o?o=yield o.focus():(o=yield self.clients.openWindow(r),yield Vi(3e3)),!!o)return s.messageType=se.NOTIFICATION_CLICKED,s.isFirebaseMessaging=!0,o.postMessage(s)})}function ea(t){const e=Object.assign({},t.notification);return e.data={[nn]:t},e}function ta({data:t}){if(!t)return null;try{return t.json()}catch(e){return null}}function na(t){return c(this,null,function*(){const e=yield an();for(const n of e){const s=new URL(n.url,self.location.href);if(t.host===s.host)return n}return null})}function sa(t){return t.some(e=>e.visibilityState==="visible"&&!e.url.startsWith("chrome-extension://"))}function ra(t,e){e.isFirebaseMessaging=!0,e.messageType=se.PUSH_RECEIVED;for(const n of t)n.postMessage(e)}function an(){return self.clients.matchAll({type:"window",includeUncontrolled:!0})}function ia(t){var e;const{actions:n}=t,{maxActions:s}=Notification;return n&&s&&n.length>s&&console.warn(`This browser only supports ${s} actions. The remaining actions will not be displayed.`),self.registration.showNotification((e=t.title)!==null&&e!==void 0?e:"",t)}function aa(t){var e,n,s;const r=(n=(e=t.fcmOptions)===null||e===void 0?void 0:e.link)!==null&&n!==void 0?n:(s=t.notification)===null||s===void 0?void 0:s.click_action;return r||(Wi(t.data)?self.location.origin:null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oa(t){if(!t||!t.options)throw be("App Configuration Object");if(!t.name)throw be("App Name");const e=["projectId","apiKey","appId","messagingSenderId"],{options:n}=t;for(const s of e)if(!n[s])throw be(s);return{appName:t.name,projectId:n.projectId,apiKey:n.apiKey,appId:n.appId,senderId:n.messagingSenderId}}function be(t){return m.create("missing-app-config-values",{valueName:t})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ca{constructor(e,n,s){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.logEvents=[],this.isLogServiceStarted=!1;const r=oa(e);this.firebaseDependencies={app:e,appConfig:r,installations:n,analyticsProvider:s}}_delete(){return Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ua=t=>{const e=new ca(t.getProvider("app").getImmediate(),t.getProvider("installations-internal").getImmediate(),t.getProvider("analytics-internal"));return self.addEventListener("push",n=>{n.waitUntil(Xi(n,e))}),self.addEventListener("pushsubscriptionchange",n=>{n.waitUntil(Yi(n,e))}),self.addEventListener("notificationclick",n=>{n.waitUntil(Zi(n))}),e};function la(){k(new A("messaging-sw",ua,"PUBLIC"))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function on(){return c(this,null,function*(){return Dt()&&(yield Tt())&&"PushManager"in self&&"Notification"in self&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ha(t,e){if(self.document!==void 0)throw m.create("only-available-in-sw");return t.onBackgroundMessageHandler=e,()=>{t.onBackgroundMessageHandler=null}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function da(t,e){t.deliveryMetricsExportedToBigQueryEnabled=e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fa(t=Pt()){return on().then(e=>{if(!e)throw m.create("unsupported-browser")},e=>{throw m.create("indexed-db-unsupported")}),Q(Re(t),"messaging-sw").getImmediate()}function pa(t,e){return t=Re(t),ha(t,e)}function ga(t,e){return t=Re(t),da(t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */la();const ma=Object.freeze(Object.defineProperty({__proto__:null,experimentalSetDeliveryMetricsExportedToBigQueryEnabled:ga,getMessaging:fa,isSupported:on,onBackgroundMessage:pa},Symbol.toStringTag,{value:"Module"}));
