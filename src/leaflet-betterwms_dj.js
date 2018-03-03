// Änderungen für das DWD-Warnmodul2 wurden mit "// Warnmodul2:" markiert
L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({
  
  onAdd: function (map) {
    // Triggered when the layer is added to a map.
    //   Register a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    map.on('click', this.getFeatureInfoJsonp, this);
    if(!this._marker) this._marker = L.marker([50.099444, 8.770833]).addTo(this._map)  //Marker hinzufügen
  },
  
  onRemove: function (map) {
    // Triggered when the layer is removed from a map.
    //   Unregister a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onRemove.call(this, map);
    map.off('click', this.getFeatureInfoJsonp, this);
  },

  //getFeatureInfo: function (evt) {  //removed

  // Warnmodul2: JSON-Version der getFeatureInfo-Funktion  //P
  getFeatureInfoJsonp: function (evt) {
    // Make an AJAX request to the server and hope for the best
    var url = this.getFeatureInfoUrl(evt.latlng),
        showResultsJson = L.Util.bind(this.showGetFeatureInfoJson, this);
/*    $.ajax({
      url: url,
      dataType: 'jsonp',
      jsonpCallback: 'parseResponse',
      success: function(data) {
        // Warnmodul2: angepasst shorResults-Funktion wird genutzt
        showResultsJson(evt.latlng, data);
      }
    }); */
    //fetch(url).then(function(response) {response.json().then(function(data) {showResultsJson(evt.latlng, data)}) })
    var xhr = new XMLHttpRequest()
    xhr.open("GET", url, true)
    xhr.onload = function() {var data=JSON.parse(this.response); showResultsJson(evt.latlng, data)
     /* if(data.features.length){  //add notification */
    }
    xhr.send()   
  },


  getFeatureInfoUrl: function (latlng) { this._map=this._map||karte  //work if layer disabled
    // Construct a GetFeatureInfo request URL given a point
    var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
        size = this._map.getSize(),
        
        params = {
          request: 'GetFeatureInfo',
          service: 'WMS',
          srs: 'EPSG:4326',
          styles: this.wmsParams.styles,
          transparent: this.wmsParams.transparent,
          version: this.wmsParams.version,      
          format: this.wmsParams.format,
          bbox: this._map.getBounds().toBBoxString(),
          height: size.y,
          width: size.x,
          layers: this.wmsParams.layers,
          query_layers: this.wmsParams.layers,
          info_format: 'application/json',  //text/javascript
          // Warnmodul2: nur ausgewählte Properties werden abgefragt - eine ungefilterte Antwort liefert eine Vielzahl weiterer Eigenschaften der Warnungen, analog zum Inhalt im CAP-Format
          propertyName: 'EVENT,ONSET,EXPIRES,SENT,SEVERITY,EC_GROUP,SENT',  //,SEVERITY,EC_GROUP
          // Warnmodul2: FEATURE_COUNT > 1 notwendig, um im Falle überlappender Warnungen alle Warnungen abzufragen
          FEATURE_COUNT: 50
        };
    
    params[params.version === '1.3.0' ? 'i' : 'x'] = Math.round(point.x);  //InvalidPoint on mobile bugfixed   point.x
    params[params.version === '1.3.0' ? 'j' : 'y'] = Math.round(point.y);  //
    
    return "https://maps.dwd.de/geoserver/dwd/wms/" + L.Util.getParamString(params);  //this._url  don't use proxy here
  },

  //showGetFeatureInfo: function (err, latlng, content) {  //removed

  // Warnmodul2: angepasste Funktion zum Aufbereiten der Geoserver-Antwort (Auswahl von bestimmten properties) und zur Anzeige als Popup
  showGetFeatureInfoJson: function (latlng, data) {
    this._data=data  //needed for notification
    this._marker.closePopup();this._marker.unbindPopup(); this._marker.setLatLng(latlng)  //feedback
    if ( data.features[0] == null ) { return 0 };
    var content="<h2 style='opacity:.87'>Amtliche Warnung</h2>";
    var color={Minor:"yellow",Moderate:"orange",Severe:"red",Extreme:"DarkRed"}  //
    data.features.sort(function(a, b){return new Date(a.properties.ONSET) - new Date(b.properties.ONSET)});  //sort array
    data.features.forEach(function(item){  //$.each(data.features, function (i, item) {
            var o = new Date(item.properties.ONSET);
            var e = new Date(item.properties.EXPIRES); var td=(e.toDateString()==o.toDateString());
            onset = ('0' + o.getDate()).slice(-2) + '.' + ('0' + (o.getMonth()+1)).slice(-2) + ". - " + ('0' + (o.getHours())).slice(-2) + ":" + ('0' + (o.getMinutes())).slice(-2) + " Uhr";
            end = (td?"Ende :":(('0' + e.getDate()).slice(-2) + '.' + ('0' + (e.getMonth()+1)).slice(-2) + "."))+" - " + ('0' + (e.getHours())).slice(-2) + ":" + ('0' + (e.getMinutes())).slice(-2) + " Uhr" ;
            content += "<p><table style='background: no-repeat 15px 75%/30px url(\"icons/"+item.properties.EC_GROUP.replace(/;.*/,'')+".png\"), "+color[item.properties.SEVERITY]+" no-repeat left/contain url(\"icons/warn.png\"); border-spacing:0px'>"
            content += "<tr><td style='padding-right:3px'>Ereignis :</td><td style='background:white'><b><a style='text-decoration:none' href='?" + item.properties.EC_GROUP + "'>" + item.properties.EVENT + "</a></b></td></tr>";  //.EVENT
            content += "<tr><td></td><td style='background:white;"+(Date.now()-o<0?"color:#808080":"")+"'>" + onset + "</td></tr>";  //Beginn:
            content += "<tr><td></td><td style='background:white'>" + (item.properties.EXPIRES?end:"&nbsp;") + "</td></tr></table></p>";  //Ende:
            //content += "Gesendet: " + item.properties.SENT + "</p>";
    });
    content += "<a target='dwd' href='https://www.dwd.de/warnungen'>dwd.de</a> "+new Date(data.features[0].properties.SENT).toLocaleTimeString('de',{hour:"2-digit",minute:"2-digit"});

    this._marker.bindPopup(content,{ maxWidth: 800}).openPopup();  //L.popup({ maxWidth: 800}).setLatLng(latlng).setContent(content).openOn(this._map);
  }
});



L.tileLayer.betterWms = function (url, options) {
  return new L.TileLayer.BetterWMS(url, options);  
};
