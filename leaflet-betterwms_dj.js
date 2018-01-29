// Änderungen für das DWD-Warnmodul2 wurden mit "// Warnmodul2:" markiert
L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({
  
  onAdd: function (map) {
    // Triggered when the layer is added to a map.
    //   Register a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    map.on('click', this.getFeatureInfoJsonp, this);
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
     if(data.features.length){  //add notification
     var severity=["Minor","Moderate","Severe","Extreme"], warnlev=qs  //decodeURI(location.search.slice(1));
     if(isNaN(warnlev)?
     data.features.map(function(obj){return obj.properties.EVENT}).some(function(x){return (warnlev.split(",").indexOf(x)+1)}) :   //querystringparameter ?ereignis e.g. ?GLÄTTE
     data.features.map(function(obj){return obj.properties.SEVERITY}).some(function(x){return (severity.indexOf(x) >= warnlev)}))  //  ?warnlevel e.g. ?1
     showNotification(data.features.length)}
    }
    xhr.send()   
  },


  getFeatureInfoUrl: function (latlng) {
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
          propertyName: 'EVENT,ONSET,EXPIRES,SENT,SEVERITY,EC_GROUP',  //,SEVERITY,EC_GROUP ?
          // Warnmodul2: FEATURE_COUNT > 1 notwendig, um im Falle überlappender Warnungen alle Warnungen abzufragen
          FEATURE_COUNT: 50
        };
    
    params[params.version === '1.3.0' ? 'i' : 'x'] = Math.round(point.x);  //InvalidPoint on mobile bugfixed   point.x
    params[params.version === '1.3.0' ? 'j' : 'y'] = Math.round(point.y);  //
    
    return this._url + L.Util.getParamString(params, this._url, true);
  },

  //showGetFeatureInfo: function (err, latlng, content) {  //removed

  // Warnmodul2: angepasste Funktion zum Aufbereiten der Geoserver-Antwort (Auswahl von bestimmten properties) und zur Anzeige als Popup
  showGetFeatureInfoJson: function (latlng, data) {
    marker.unbindPopup();marker.closePopup(); marker.setLatLng(latlng)  //feedback
    if ( data.features[0] == null ) { return 0 };
    var content="<h2>Amtliche Warnung</h2>";
    var color={Minor:"yellow",Moderate:"orange",Severe:"red",Extreme:"DarkRed"}  //
    data.features.forEach(function(item){  //$.each(data.features, function (i, item) {
            var o = new Date(item.properties.ONSET);
            var e = new Date(item.properties.EXPIRES);
            onset = ('0' + o.getDate()).slice(-2) + '.' + ('0' + (o.getMonth()+1)).slice(-2) + ". - " + ('0' + (o.getHours())).slice(-2) + ":" + ('0' + (o.getMinutes())).slice(-2) + " Uhr";
            end = ('0' + e.getDate()).slice(-2) + '.' + ('0' + (e.getMonth()+1)).slice(-2) + ". - " + ('0' + (e.getHours())).slice(-2) + ":" + ('0' + (e.getMinutes())).slice(-2) + " Uhr" ;
            content += "<p><table style='background: no-repeat 15px 75%/30px url(\"icons/"+item.properties.EC_GROUP.replace(/;.*/,'')+".png\"), "+color[item.properties.SEVERITY]+" no-repeat left/contain url(\"icons/warn.png\"); border-spacing:0px'>"
            content += "<tr><td style='padding-right:3px'>Ereignis :</td><td style='background:white'><b><a style='text-decoration:none' href='?" + item.properties.EVENT + "'>" + item.properties.EVENT + "</a></b></td></tr>";
            content += "<tr><td>Beginn:</td><td style='background:white'>" + onset + "</td></tr>";
            content += "<tr><td>Ende:</td><td style='background:white'>" + end + "</td></tr></table></p>";
            //content += "Gesendet: " + item.properties.SENT + "</p>";
    });
    content += "<a target='blank' href='https://www.dwd.de/warnungen'>www.dwd.de/warnungen</a>";

    marker.bindPopup(content,{ maxWidth: 800}).openPopup();  //L.popup({ maxWidth: 800}).setLatLng(latlng).setContent(content).openOn(this._map);
  }
});



L.tileLayer.betterWms = function (url, options) {
  return new L.TileLayer.BetterWMS(url, options);  
};
