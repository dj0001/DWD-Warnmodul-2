//add script at the end
//adds USA warnlayer

(function(){
L.TileLayer.BetterWMS2 = L.TileLayer.WMS.extend({
  
  onAdd: function (map) {
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    map.on('click', this.getFeatureInfoJsonp, this);
    if(!this._marker) this._marker = L.marker([50.099444, 8.770833]).addTo(this._map)  //Marker hinzufügen
  },
  
  onRemove: function (map) {
    L.TileLayer.WMS.prototype.onRemove.call(this, map);
    map.off('click', this.getFeatureInfoJsonp, this);
  },

  getFeatureInfoJsonp: function (evt) {
   var url = this.getFeatureInfoUrl(evt.latlng)  
   showResultsJson = L.Util.bind(this.showGetFeatureInfoJson, this);
   fetch(url).then(function(response) {response.json().then(function(data) {showResultsJson(evt.latlng, data)}) })
  },
  
    getFeatureInfoUrl: function (latlng) {
        var size = this._map.getSize(),       
        params = {
          f: 'json',  //layers: 'show:0,1',
          geometry: latlng.lng+','+latlng.lat,
          tolerance: 8,
          mapExtent: this._map.getBounds().toBBoxString(),    //bbox
          imageDisplay: size.x+','+size.y+',96',  //922,523,96?
          returnGeometry: false
        };   
  
    return this._url.replace('export','identify') + L.Util.getParamString(params);
  },
    
  showGetFeatureInfoJson: function (latlng, data) {  //console.log(data)
  this._marker.closePopup();this._marker.unbindPopup(); this._marker.setLatLng(latlng)  //feedback
  if ( data.results[0] == null ) { return 0 };
  var content=""
  if(data.results) data.results.forEach(function(item){ item=item.attributes
content += "<p>"+item.prod_type
 +"<br>"+item.issuance
 +"<br>"+item.expiration
 + "</p>"
});
this._marker.bindPopup(content,{ maxWidth: 800}).openPopup();  
  }

});
L.tileLayer.betterWms2 = function (url, options) {return new L.TileLayer.BetterWMS2(url, options)};

var noaalayer = L.tileLayer.betterWms2("https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer/export", {
 layers: 'show:0,1',
 format: 'png32',
 transparent: true,
 opacity: 0.6,
 f: 'image',
 dpi: 96,
 bboxSR: 102100,
 imageSR: 102100,  //3857
 attribution: '<a href="https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer/legend">NOAA</a>'
});

 lc.addOverlay(noaalayer,"<span title='USA'>NOAA</span>")
})();
