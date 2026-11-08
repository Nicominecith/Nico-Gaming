/* ===== NICO GAMING IRL - EINSTELLUNGEN =====
   Widget-Links (Chat, Alerts, ...) NICHT hier eintragen, wenn die Seite öffentlich gehostet ist.
   Gib sie stattdessen als URL-Parameter mit, z.B.  overlay.html?chat=https%3A%2F%2F...  */
window.NICO = {
  name: "NICO GAMING",
  handle: "twitch.tv/Nicominecith_TTV",
  startMinutes: 5,
  musicVolume: 0.38,
  sfxVolume: 0.8,
  endingFadeAfterSec: 75,
  ticker: ["FOLLOW NICHT VERGESSEN","TWITCH.TV/NICOMINECITH_TTV","!COMMANDS IM CHAT","DANKE FÜR DEINEN SUPPORT"],
  widgets: { music:"", alerts:"", chat:"https://www.giambaj.it/twitch/jchat/v2/?channel=Nicominecith_ttv&size=2&font=1&fade=30&hide_commands=true&stroke=1&shadow=2", sponsor:"", viewers:"" }
};
// URL-Parameter überschreiben Widget-Links:  ?chat=..&alerts=..&viewers=..&music=..&sponsor=..
(function(){const q=new URLSearchParams(location.search);
 for(const k of Object.keys(NICO.widgets)){const v=q.get(k);if(v)NICO.widgets[k]=v}
 if(q.get('handle'))NICO.handle=q.get('handle');})();
