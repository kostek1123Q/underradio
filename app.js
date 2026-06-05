const API = https://underradio-backend.onrender.com"; // <- ZMIEN TO

let tracks = [];

async function loadTracks(){
const res = await fetch(`${API}/tracks`);
tracks = await res.json();
render();
}

function embed(url){

if(url.includes("youtube.com/watch")){
const id = url.split("v=")[1].split("&")[0];
return `https://www.youtube.com/embed/${id}`;
}

if(url.includes("youtu.be")){
const id = url.split("/").pop();
return `https://www.youtube.com/embed/${id}`;
}

if(url.includes("spotify")){
return url.replace("open.spotify.com","open.spotify.com/embed");
}

if(url.includes("soundcloud")){
return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`;
}

return "";
}

async function addTrack(){

const nick = document.getElementById("nick").value;
const url = document.getElementById("url").value;

if(!nick || !url) return alert("uzupełnij pola");

await fetch(`${API}/tracks`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
nickname:nick,
track_url:url
})
});

document.getElementById("nick").value="";
document.getElementById("url").value="";

loadTracks();
}

async function likeTrack(id){
await fetch(`${API}/tracks/${id}/like`,{
method:"POST"
});

loadTracks();
}

async function loadComments(id){
const res = await fetch(`${API}/tracks/${id}/comments`);
return await res.json();
}

async function addComment(id){

const input = document.getElementById(`c-${id}`);
const value = input.value;

if(!value) return;

await fetch(`${API}/tracks/${id}/comments`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
nickname:"user",
comment:value
})
});

loadTracks();
}

function render(){

tracks.sort((a,b)=>b.likes-a.likes);

const box = document.getElementById("tracks");
box.innerHTML="";

tracks.forEach(t=>{

box.innerHTML += `
<div class="track">

<div class="top">
<div class="nick">${t.nickname}</div>

<div class="like" onclick="likeTrack(${t.id})">
🔥 ${t.likes}
</div>
</div>

<a href="${t.track_url}" target="_blank">open link</a>

${embed(t.track_url) ? `
<iframe src="${embed(t.track_url)}"></iframe>
` : ""}

<input class="commentBox" id="c-${t.id}" placeholder="komentarz">
<button class="smallBtn" onclick="addComment(${t.id})">dodaj</button>

</div>
`;
});
}

loadTracks();
setInterval(loadTracks, 5000);