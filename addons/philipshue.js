//add script at the end
//lights go on for warnings
//tested with emulator, because i don't own a bridge

(function(){
var bridge="http://localhost:8000/api/newdeveloper"  //edit here
var path=opt.light  //URL parameter ?&light=1
if(!path) path="groups/0/action"; else path=isNaN(path)? "sensors"+path+"/state" :"lights/"+path+"/state"  //?&light=/3 sensor

var bb={}; warnlayer._marker.on('move', function(e){ var data=warnlayer._data
if(seenlayer._data && seenlayer._data.features.length) data=seenlayer._data  //works, but delayed
var bd={"bri":254,"sat":255,on:true};  //"bri":127 
if(data.features.length) {
var severity=["Minor","Moderate","Severe","Extreme"], max=0, ec=false  //get the highest warnlevel
data.features.forEach(function(item){ item=item.properties
max=Math.max(max,severity.indexOf(item.SEVERITY)); ec=ec||item.EC_GROUP.match(qs)  //?THUNDERSTORM
 })

var color=[60,30,0,330]
if (max<2) bd.hue=182*({UV:300,HEAT:270}[data.features[0].properties.EC_GROUP]|| color[max]); else bd.hue=182*color[max]  //;bd.alert="lselect"

if(!isNaN(qs) && max >= qs-1 ||isNaN(qs) && ec) {showLights(path.match("sensors/")?{status:max+1}:bd) }  //warnlev
  } else {
  bd.on=false  //edit here nowarn; off bd.on=false; green bd.hue=21840; white bd.sat=0
  showLights(path.match("sensors/")?{status:0}:bd); }
})

function showLights(bd) { 
if(JSON.stringify(bd)==JSON.stringify(bb)) return;
bb=bd
var xhr = new XMLHttpRequest();
xhr.open("PUT", bridge+"/"+path)
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function() {console.log(xhr.responseText);}
xhr.onerror = function(e) {console.log(e.type)}  //
xhr.send(JSON.stringify(bd))
}

function changebri(hd){
bridge=prompt(hd+"change bridge adress", bridge)||bridge
bridge=((bridge.match(/https?:/))?'':'http://')+bridge
}

//if(opt.reset) delete localStorage.bridge  //?&reset=1
try {if ((localStorage||{}).bridge) bridge=localStorage.bridge; else changebri("addon successfully installed\n")}  // ?4 disable
catch(e) {changebri("addon successfully installed\n")}  //Edge
 if(!bridge.match("/api")) bridge+="/api/dev"
 if (bridge.match("///"))  //search on portal "/api/olddeveloper"
 fetch("https://www.meethue.com/api/nupnp").then(function(response){response.json().then(function(data){if(data[0]) bridge=bridge.replace("//","//"+data[0].internalipaddress);changebri("found\n")})})
 ; else if(self.fetch) fetch(bridge+"/config",{method:"GET"}).then(function(response)  //"http://localhost:8000/api//config"
  {response.json().then(function(data){if(data.whitelist) {localStorage.bridge=bridge;if(!opt.light) changelight()} else {
   alert("unauthorised user\npress link button"); bridge=bridge.replace(/\/api.*/,'/api')
   fetch(bridge,{method:"POST",body:'{"devicetype":""}',headers:{'Content-Type':'application/json'}}).then(function(response)
   {response.json().then(function(data){if(data[0].success) localStorage.bridge=bridge+="/"+data[0].success.username})} ) }
  })} )
  .catch(function(err){changebri("bridge not found\n"); delete localStorage.bridge
  })
//}
console.log(bridge)
warnlayer.on('tileerror', function(e){karte.attributionControl.setPrefix("err")})  //

if(opt.bulb) warnlayer._marker.on('move', function(e){ //simulate bulb  //?&bulb=1
setTimeout(function(){ if(!(localStorage||{}).bridge) bulb(bb); else  // wo/with bridge
 fetch(bridge+"/lights/"+(opt.light*1||1)).then(function(response){response.json().then(function(data){ bulb(data.state) })})
 }, 1000)
})
function bulb(bd) { var l = (2 - bd.sat/255) * bd.bri/255 / 2; var s = l<1 ? bd.sat*bd.bri/(l<0.5 ? l*2 : 2-l*2) : 0; if (isNaN(s)) s = 0; 
 document.querySelector("input[alt=search]").style.transition = (bd.transition||4)/10+"s"
 document.querySelector("input[alt=search]").style.backgroundColor=bd.on?"hsl("+(bd.hue||0)/182+","+s*100+"%,"+(l||0)*100+"%)":"hsl(0,0%,50%)"
 if(bd.alert=="lselect") blink(30) }

function changelight(){ var hd=""
fetch(bridge+"/lights").then(function(response){response.json().then(function(data){ for(var key in data) {hd+=key+"="+data[key].name+"\n"}
 var tmp=prompt("select light\n"+hd,"0")||"/0"; path=isNaN(tmp)? "groups"+tmp+"/action" :"lights/"+tmp+"/state"; if(!isNaN(tmp)) opt.light=tmp  // /3 group
 })})
}
function blink(n) {bb.alert="select";bulb(document.querySelector("input[alt=search]").style.backgroundColor=="rgb(128, 128, 128)"?bb:{on:false});n--;if(n) setTimeout(function(){blink(n)},500)}

})();
