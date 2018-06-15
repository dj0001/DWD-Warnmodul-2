//add script at the end
//adds USA warnlayer

(function(){
L.TileLayer.BetterWMS2 = L.TileLayer.WMS.extend({
  
  onAdd: function (map) {
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    map.on('click', this.showGetFeatureInfoJson, this);
    if(!this._marker) this._marker = L.marker([50.099444, 8.770833]).addTo(this._map)  //Marker hinzufügen
  },
  
  onRemove: function (map) {
    L.TileLayer.WMS.prototype.onRemove.call(this, map);
    map.off('click', this.showGetFeatureInfoJson, this);
  },

 showGetFeatureInfoJson: function (evt) {
 this._marker.closePopup();this._marker.unbindPopup(); this._marker.setLatLng(evt.latlng)
 content='<iframe src="https://dj0001.github.io/DWD/new/noaa/index_withoutmapUSA.html?'+evt.latlng.lat+','+evt.latlng.lng+'" style="border:none" height="180" width="200"></iframe>'  //small=false
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
 imageSR: 102100,  //?
attribution: '<a href="https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer/legend">NOAA</a>'
});

 lc.addOverlay(noaalayer,"<span title='USA'>NOAA</span>")
})();
