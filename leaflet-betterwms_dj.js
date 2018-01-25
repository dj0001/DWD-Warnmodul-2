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
/*  
  getFeatureInfo: function (evt) {
    // Make an AJAX request to the server and hope for the best
    var url = this.getFeatureInfoUrl(evt.latlng),
        showResults = L.Util.bind(this.showGetFeatureInfo, this);
    $.ajax({
      url: url,
      success: function (data, status, xhr) {
        var err = typeof data === 'string' ? null : data;
        showResults(err, evt.latlng, data);
      },
      error: function (xhr, status, error) {
        showResults(error);  
      }
    });
  },
*/  
  // Warnmodul2: JSONP-Version der getFeatureInfo-Funktion
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
    xhr.onload = function() {showResultsJson(evt.latlng, JSON.parse(this.response))}
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
          propertyName: 'EVENT,ONSET,EXPIRES,SENT',
          // Warnmodul2: FEATURE_COUNT > 1 notwendig, um im Falle überlappender Warnungen alle Warnungen abzufragen
          FEATURE_COUNT: 50
        };
    
    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;
    
    return this._url + L.Util.getParamString(params, this._url, true);
  },
/*  
  showGetFeatureInfo: function (err, latlng, content) {
    if (err) { console.log(err); return; } // do nothing if there's an error
    console.log("showGetFeatureInfo: " + content);
    // Otherwise show the content in a popup, or something.
    L.popup({ maxWidth: 800})
      .setLatLng(latlng)
      .setContent(content)
      .openOn(this._map);
  },
*/

  // Warnmodul2: angepasste Funktion zum Aufbereiten der Geoserver-Antwort (Auswahl von bestimmten properties) und zur Anzeige als Popup
  showGetFeatureInfoJson: function (latlng, data) {console.log(data)
    if ( data.features[0] == null ) { return 0 };
    var content="<h2>Amtliche Warnung</h2>";
    data.features.forEach(function(item){  //$.each(data.features, function (i, item) {
            var o = new Date(item.properties.ONSET);
            var e = new Date(item.properties.EXPIRES);
            onset = ('0' + o.getDate()).slice(-2) + '.' + ('0' + (o.getMonth()+1)).slice(-2) + ". - " + ('0' + (o.getHours())).slice(-2) + ":" + ('0' + (o.getMinutes())).slice(-2) + " Uhr";
            end = ('0' + e.getDate()).slice(-2) + '.' + ('0' + (e.getMonth()+1)).slice(-2) + ". - " + ('0' + (e.getHours())).slice(-2) + ":" + ('0' + (e.getMinutes())).slice(-2) + " Uhr" ;
            content += "<p><table><tr><td>Ereignis:</td><td><b>" + item.properties.EVENT + "</b></td></tr>";
            content += "<tr><td>Beginn:</td><td>" + onset + "</td></tr>";
            content += "<tr><td>Ende:</td><td>" + end + "</td></tr></table></p>";
            //content += "Gesendet: " + item.properties.SENT + "</p>";
    });
    content += "<a target='blank' href='https://www.dwd.de/warnungen'>www.dwd.de/warnungen</a>";

    L.popup({ maxWidth: 800})
      .setLatLng(latlng)
      .setContent(content)
      .openOn(this._map);
  }
});



L.tileLayer.betterWms = function (url, options) {
  return new L.TileLayer.BetterWMS(url, options);  
};