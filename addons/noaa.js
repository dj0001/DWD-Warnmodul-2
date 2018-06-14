//add script at the end
//add USA warnlayer

(function(){
		var noaalayer = L.tileLayer.wms("https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer/export", {
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