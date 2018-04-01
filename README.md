# DWD-Warnmodul-2
show weather alerts from Deutscher Wetterdienst    
[Demo](https://dj0001.github.io/DWD-Warnmodul-2/)

removed jquery (use json), add icons, update marker and map, location request, add satlayer    
needs Leaflet

*Read this in other languages: [Deutsch](README.de.md)*

## API

add filter querystringparameter ?EC_GROUP e.g. ?Frost    
Demo https://dj0001.github.io/DWD-Warnmodul-2/?Frost    

add Notification querystringparameter ?warnlevel e.g. ?2 (?5 no-notification)    
Demo https://dj0001.github.io/DWD-Warnmodul-2/?2 for ≥ Moderate

add city querystringparameter ?ort=<city> e.g. ?ort=Augsburg    
Demo https://dj0001.github.io/DWD-Warnmodul-2/?ort=Augsburg    

## Changelog
26.01. add Notification    
26.01. add Geocode (click on search icon)    
27.01. add legend ⌄    
29.01. add parameter ort    
30.01. without global variables    
31.01. add parameter ?0 no-geolocation, ?1 watch-geo    
16.02. add more locations [beta](https://dj0001.github.io/DWD/new/index_multi.html)    
18.02. without map [beta](https://dj0001.github.io/DWD/new/index_womap.html?1)    
28.02. structured data [beta](https://search.google.com/structured-data/testing-tool#url=https%3A%2F%2Fdj0001.github.io%2FDWD%2Fnew%2Findex_st.html%3Fort%3DAugsburg)    
01.03. add Binnenseen    
13.03. add alternative [themes](https://github.com/dj0001/DWD/tree/gh-pages/new/themes)    
17.03. full configurable background [release](https://dj0001.github.io/DWD/new/index_txtimg.html)    
31.03. add parameter filter ?6 tomorrow    
31.03. Warnungen_Gemeinden not up to date currently; replace with [Warnungen_Landkreise](https://dj0001.github.io/DWD/new/index_lkr.html?7) or use [testserver](https://dj0001.github.io/DWD/new/index_testserver.html?7)    
&nbsp;&nbsp;.04. add Pollenflug    
todo: waiting for "periodic background sync" (chrome) or push notifications (DWD)

## License
Copyright © warndata, <a href="https://dwd.de/DE/leistungen/webmodul_warnungen/webmodul_warnungen.html">DWD<img src="https://www.dwd.de/SiteGlobals/StyleBundles/Bilder/favicon.ico?__blob=normal" alt="DWD" target="_dwd" /></a>    

Copyright © 2018, dj0001    
[BSD 2-Clause](https://opensource.org/licenses/BSD-2-Clause)
