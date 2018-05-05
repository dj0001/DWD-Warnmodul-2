//add script at the end
//lights go on for warnings
//tested with emulator, because i don't own a bridge

(function(){
var bridge="http://localhost:8000/api/newdeveloper"  //edit here
var path=opt.light  //URL parameter ?&light=1
path=path? "lights/"+path+"/state" :"groups/0/action"

var dt=0; warnlayer._marker.on('move', function(e){ var data=warnlayer._data
if(data.features.length) {
var severity=["Minor","Moderate","Severe","Extreme"], max=0  //get the highest warnlevel
data.features.forEach(function(item){ item=item.properties
max=Math.max(max,severity.indexOf(item.SEVERITY))
 })

var color=[10920,5481,0,0]
var bd={"bri":127,"sat":255,on:true}; bd.hue=color[max]  //={on:true}

if(!isNaN(qs) && max >= qs-1+dt) {showLights(bd); dt++}  //warnlev
 } else dt=0
})

function showLights(bd) {
var xhr = new XMLHttpRequest();
xhr.open("PUT", bridge+"/"+path)
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function() {console.log(xhr.responseText)}
xhr.onerror = function(e) {changebri("Error\n")}
xhr.send(JSON.stringify(bd))
}

function changebri(hd){
if(!bridge.match("/api")) hd='must contain /api\n'
bridge=prompt(hd+"change bridge adress", bridge)||bridge
bridge=((bridge.match(/https?:/))?'':'http://')+bridge
localStorage.bridge=bridge
}

if ((localStorage||{}).bridge) bridge=localStorage.bridge; else changebri("addon successfully installed\n")  // ?4 disable
console.log(bridge)
})();
