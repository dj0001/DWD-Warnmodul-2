//add script at the end
//lights go on for warnings
//tested with emulator, because i don't own a bridge

(function(){
var bridge="http://localhost:8000/api/newdeveloper"  //edit here
var path=opt.light  //URL parameter ?&light=1
if(!path) path="groups/0/action"; else path=isNaN(path)? "sensors"+path+"/state" :"lights/"+path+"/state"  //?&light=/3 sensor

var dt=0; warnlayer._marker.on('move', function(e){ var data=warnlayer._data
if(data.features.length) {
var severity=["Minor","Moderate","Severe","Extreme"], max=0  //get the highest warnlevel
data.features.forEach(function(item){ item=item.properties
max=Math.max(max,severity.indexOf(item.SEVERITY))
 })

var color=[10920,5481,0,0]
var bd={"bri":254,"sat":255,on:true}; bd.hue=color[max]  //={on:true}  //"bri":127

if(!isNaN(qs) && max >= qs-1+dt) {showLights(path.match("sensors/")?{status:max+1}:bd); dt++}  //warnlev
  } else if(dt) {
 //showLights(path.match("sensors/")?{status:0}:{on:false}); 
 dt=0}
})

function showLights(bd) {
var xhr = new XMLHttpRequest();
xhr.open("PUT", bridge+"/"+path)
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function() {console.log(xhr.responseText);}
xhr.onerror = function(e) {changebri("Error\n")}  //; delete localStorage.bridge
xhr.send(JSON.stringify(bd))
}

function changebri(hd){
bridge=prompt(hd+"change bridge adress", bridge)||bridge
bridge=((bridge.match(/https?:/))?'':'http://')+bridge
}

//if(opt.reset) delete localStorage.bridge  //?&reset=1
if ((localStorage||{}).bridge) bridge=localStorage.bridge; 
//else if(self.fetch) { fetch("https://www.meethue.com/api/nupnp").then(function(response)  //discover bridge
// {response.json().then(function(data){if(data[0]) bridge=data[0].internalipaddress;changebri((data[0]?'':"not ")+"found\n");showLights({on:true})})} )} 
else {changebri("addon successfully installed\n");   // ?4 disable
 if(!bridge.match("/api")) bridge+="/api/dev"
 if(self.fetch) fetch(bridge+"/config",{method:"GET"}).then(function(response)  //"http://localhost:8000/api//config"
  {response.json().then(function(data){if(data.whitelist) localStorage.bridge=bridge; else {
   alert("unauthorised user\npress link button"); bridge=bridge.replace(/\/api.*/,'/api')
   fetch(bridge,{method:"POST",body:'{"devicetype":""}',headers:{'Content-Type':'application/json'}}).then(function(response)
   {response.json().then(function(data){if(data[0].success) localStorage.bridge=bridge+="/"+data[0].success.username})} ) }
  })} )
  .catch(function(err){changebri("bridge not found\n")})
}
console.log(bridge)
})();
