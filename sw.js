/* Paperknife service worker: lets the site install like an app and keeps the shell + libraries available offline.
   Pages are fetched network-first, so a new index.html always shows up as soon as you are online. */
const CACHE='paperknife-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url),same=url.origin===self.location.origin,lib=/(^|\.)cdnjs\.cloudflare\.com$|fonts\.(googleapis|gstatic)\.com$/.test(url.host);
  if(!same&&!lib)return;   // never touch ad networks
  const save=r=>{if(r&&(r.ok||r.type==='opaque')){const c=r.clone();caches.open(CACHE).then(ch=>ch.put(req,c));}return r;};
  if(same)e.respondWith(fetch(req).then(save).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
  else e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(save)));
});
