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
          layers: this.wmsParams.layers.replace(/gt_.+/,'gt'),
          query_layers: this.wmsParams.layers.replace(/gt_.+/,'gt'),
          info_format: 'application/json',  //text/javascript
          // Warnmodul2: nur ausgewählte Properties werden abgefragt - eine ungefilterte Antwort liefert eine Vielzahl weiterer Eigenschaften der Warnungen, analog zum Inhalt im CAP-Format
          propertyName: 'EVENT,ONSET,EXPIRES,SENT,SEVERITY,EC_GROUP' +(this.wmsParams.layers.match(/seen|kreise/)?',AREADESC':''),  //,PARAMATERVALUE,DESCRIPTION,ALTITUDE
          // Warnmodul2: FEATURE_COUNT > 1 notwendig, um im Falle überlappender Warnungen alle Warnungen abzufragen
          FEATURE_COUNT: 50
        };
    
    params[params.version === '1.3.0' ? 'i' : 'x'] = Math.round(point.x);  //InvalidPoint on mobile bugfixed   point.x
    params[params.version === '1.3.0' ? 'j' : 'y'] = Math.round(point.y);  //
    
    return "https://maps.dwd.de/geoserver/dwd/wms/" + L.Util.getParamString(params);  //this._url  don't use proxy here
  },

  //showGetFeatureInfo: function (err, latlng, content) {  //removed

  // Warnmodul2: angepasste Funktion zum Aufbereiten der Geoserver-Antwort (Auswahl von bestimmten properties) und zur Anzeige als Popup
  showGetFeatureInfoJson: function (latlng, data) {  var newstyle=true  //false edit here
    this._data=data  //needed for notification
    this._marker.closePopup();this._marker.unbindPopup(); this._marker.setLatLng(latlng)  //feedback
    if ( data.features[0] == null ) { return 0 };
    var content="<h2 style='opacity:.87'>Amtliche Warnung</h2>";
    var color={Minor:"yellow",Moderate:"orange",Severe:"red",Extreme:"DarkRed"}  //
    data.features.sort(function(a, b){return new Date(a.properties.ONSET) - new Date(b.properties.ONSET)});  //sort array
    data.features.forEach(function(item){ item=item.properties  //$.each(data.features, function (i, item) {
        var o = new Date(item.ONSET);
        var e = new Date(item.EXPIRES); var ec=item.EC_GROUP.match(/\w+/); ec={TORNADO:"WIND",HAIL:"RAIN",SNOWDRIFT:"SNOWFALL"}[ec]||ec
        var onset = ('0' + o.getDate()).slice(-2) + '.' + ('0' + (o.getMonth()+1)).slice(-2) + ". - " + ('0' + (o.getHours())).slice(-2) + ":" + ('0' + (o.getMinutes())).slice(-2) + " Uhr",
        end = ('0' + e.getDate()).slice(-2) + '.' + ('0' + (e.getMonth()+1)).slice(-2) + "." +" - " + ('0' + (e.getHours())).slice(-2) + ":" + ('0' + (e.getMinutes())).slice(-2) + " Uhr" ;
        if(e.toDateString()==o.toDateString()) end=end.replace(/.{6}/,'Ende :')  //
        content += "<div style='position: relative;'>"  //
        if(newstyle) content += "<div style='position: absolute;top: 0px;left: 0px'><svg width=56 height=56 viewBox=\"0 0 64 64\">"
          +"<polygon points=\"30,4 4,60 60,60\" stroke-linejoin=\"round\" style=\"fill:none;stroke:"+({UV:"magenta",HEAT:"violet"}[item.EC_GROUP]||color[item.SEVERITY])+";stroke-width:5\" /></svg></div>"  //
        content += "<div style='position: relative;'><table style='"  //background: no-repeat 12px 75%/32px url(\"icons/"+ec+".png\")
        if(!newstyle) content += ", no-repeat left/contain url(\"icons/warn.png\"), linear-gradient(to right, "+color[item.SEVERITY]+" 54px,transparent 54px)"
        content += "; border-spacing:0px'>"
        + "<tr><td>Ereignis&nbsp;:</td><td><b><a style='text-decoration:none' href='?" + item.EC_GROUP + "'>" + item.EVENT.replace("RMATION","") + "</a></b>"  //.EVENT
        //+ (item.ALTITUDE?" <sup>&uarr;"+(0.3048*item.ALTITUDE).toFixed()+"m</sup>":"")  //add ALTITUDE to propertyName
        + "</td></tr><tr><td></td><td"+(Date.now()-o<0?" style='color:#808080'":"")+">" + onset + "</td></tr>"  //Beginn:
        + "<tr><td></td><td"+(Date.now()-e>0?" style='color:#808080'":"")+">" + (item.EXPIRES?end:item.AREADESC) + "</td></tr></table>" //"&nbsp;"
        +"</div>"  //
        +"<div title='"+(item.PARAMATERVALUE||'')+"' style='position: absolute;top: 0px;left: 0px;width:56px;height:56px;background: no-repeat 12px 75%/32px url(\"icons/"+ec+".png\")'></div>"  //DESCRIPTION
        +"</div><p></p>";
    });
    content += "<a target='dwd' href='https://www.dwd.de/warnungen'>dwd.de</a> "+new Date(data.features[0].properties.SENT).toLocaleTimeString('de',{hour:"2-digit",minute:"2-digit"});
    if((Date.now()-new Date(data.features[0].properties.SENT))/3.6e6>48) content += " not up to date, try <a href='?7'>Landkreise</a>"  //

    this._marker.bindPopup(content,{ maxWidth: 400}).openPopup();  //L.popup({ maxWidth: 800}).setLatLng(latlng).setContent(content).openOn(this._map);
  }
});



L.tileLayer.betterWms = function (url, options) {
  return new L.TileLayer.BetterWMS(url, options);  
};
