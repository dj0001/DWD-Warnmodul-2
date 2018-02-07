
	(function(){
  //var qs=decodeURI(location.search.slice(1))
	//addons DJ
var auto=300  //update-interval in s (alle 5 min; 2e6 no-updates)  //edit here

  auto=Math.max(300,auto); auto*=1000
  var tID; warnlayer._marker.on('move', function(e){clearTimeout(tID);
   tID=setTimeout(function(){qs==1?karte.locate({setView:true, maxZoom:8}):warnlayer.getFeatureInfoJsonp({latlng:e.latlng})}, auto)});  //?1 watch location
  var t0=Date.now(); setInterval(function(){update()}, auto)  //add update alle 5 min
  document.addEventListener("visibilitychange", function(){if(!document.hidden) update()}, false);
  
  function update() {if(Date.now()-t0>=3*auto) {t0=Date.now(); warnlayer.setUrl("https://maps.dwd.de/geoserver/dwd/wms/?" + Math.random());
   var tmp='<a href="#" onclick=\'navigator.share({title:"DWD", url:"?ort='+Object.values(warnlayer._marker.getLatLng())+'"})\'>'  //Chrome android
   if(!navigator.share) tmp='<a href="https://raw.githubusercontent.com/dj0001/DWD-Warnmodul-2/master/README.de.md" target="_rd">'  // i
    karte.attributionControl.setPrefix(tmp +new Date().toLocaleTimeString('de',{hour:"2-digit",minute:"2-digit"}) +'</a>')}}
  
//more addons
warnlayer._marker.on('move', function(e){ var data=warnlayer._data
     if(data.features.length){  //add notification
     var severity=["Minor","Moderate","Severe","Extreme"], warnlev=qs  //decodeURI(location.search.slice(1));
     if(isNaN(warnlev)?
     data.features.map(function(obj){return obj.properties.EC_GROUP}).some(function(x){return (x.match(warnlev))}) :   //.EVENT warnlev.split(",").indexOf(x)+1  //querystringparameter ?EC_GROUP e.g. ?GLAZE
     data.features.map(function(obj){return obj.properties.SEVERITY}).some(function(x){return (severity.indexOf(x) >= warnlev-1)}))  //  ?warnlevel e.g. ?1
     showNotification(data.features.length)}
})

if(navigator.serviceWorker) navigator.serviceWorker.register('sw.js');
function showNotification(tx) {
  if(typeof(Notification) != "undefined") Notification.requestPermission(function(result) {
    if (result === 'granted') {
      navigator.serviceWorker.ready.then(function(registration) {
        registration.showNotification('DWD', {
          body: tx+' Warnungen!',
          icon: 'icons/warn.png',
          vibrate: [200, 100, 200, 100, 200, 100, 200],
          tag: 'vibration-sample'
        });
      });
    }
  });
}
if(typeof(Notification) != "undefined" &&qs!=="5") Notification.requestPermission();  //4


L.Control.Watermark = L.Control.extend({ //image for geocode (OpenStreetMap)
  onAdd: function(map) {
    var img = L.DomUtil.create('img');
    img.src = 'icons/search.png'; ; img.alt="search"
    img.style.background = 'white';

    L.DomEvent.on(img, 'click', function(){this._geocode()}, this); //handler
    L.DomEvent.disableClickPropagation(img)

    return img;
  },
  _geocode: function(ort) {
      var q = ort||prompt("Ort", "");
      if (q) {
        fetch("https://nominatim.openstreetmap.org/search?q=" + q + "&format=json&limit=1")
          .then(function(response) {
            response.json().then(function(data) {var e = [data[0].lat,data[0].lon];
              karte.setView(e);
              warnlayer.getFeatureInfoJsonp({latlng: e})
            })
          })
      }
    }
    //, onRemove: function(map) { }   // Nothing to do here
});
L.control.watermark = function(opts) {return new L.Control.Watermark(opts)}
var geo=L.control.watermark({position: 'bottomright'}).addTo(karte)  //add geocode

  if(isNaN(qs) &&qs.match(/^ort=/)) {qs=qs.slice(4); if(qs.match(/^[\d,-\.]+$/)) warnlayer.getFeatureInfoJsonp({latlng: qs.split(",")});  //?ort=48.37,10.9
   else geo._geocode(qs); qs=''} else if(qs!=="0") karte.locate({setView: true, maxZoom: 8});  //add geolocation
  karte.on('locationfound', function(e){console.log(e.latitude+","+e.longitude); warnlayer.getFeatureInfoJsonp(e)})
  karte.on('locationerror', function(e){if(qs==1) setTimeout(function(){karte.locate({setView:true, maxZoom:8})}, auto); else console.log(e)})  //

karte.attributionControl.setPrefix('<a href="javascript:void(0)" id="legend">&#x2304;</a>')  //add legend &#x24d8;
document.getElementById("legend").addEventListener("click", function (){ var img=document.createElement("img");
  img.src="https://maps.dwd.de/geoserver/wms?REQUEST=GetLegendGraphic&version=1.3&format=image/png&width=20&height=20&layer=dwd:Warnungen_Gemeinden";
  document.querySelector("#kartencontainer").parentNode.insertBefore(img,document.querySelector("#kartencontainer").nextSibling)
 karte.attributionControl.setPrefix("") } )

})();
