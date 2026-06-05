let tracks = [];

function getEmbed(link){

if(link.includes("youtube.com/watch?v=")){

const id =
link.split("v=")[1].split("&")[0];

return `
<iframe
src="https://www.youtube.com/embed/${id}"
allowfullscreen>
</iframe>
`;
}

if(link.includes("youtu.be/")){

const id =
link.split("/").pop();

return `
<iframe
src="https://www.youtube.com/embed/${id}"
allowfullscreen>
</iframe>
`;
}

if(link.includes("spotify.com")){

const clean =
link.split("?")[0];

return `
<iframe
src="${clean.replace(
'open.spotify.com',
'open.spotify.com/embed'
)}">
</iframe>
`;
}

if(link.includes("soundcloud.com")){

return `
<iframe
src="https://w.soundcloud.com/player/?url=${encodeURIComponent(link)}">
</iframe>
`;
}

return "";
}

function renderTracks(){

tracks.sort((a,b)=>b.likes-a.likes);

const list =
document.getElementById("trackList");

list.innerHTML="";

tracks.forEach((track,index)=>{

const commentsHTML =
track.comments
.map(comment =>
`<div class="comment">${comment}</div>`)
.join("");

list.innerHTML += `

<div class="track-card">

<div class="track-top">

<div>

<div class="nickname">
${track.nick}
</div>

<a
class="track-link"
href="${track.link}"
target="_blank">

Otwórz link

</a>

</div>

<div class="likes">

<span>${track.likes}</span>

<button
class="like-btn"
onclick="likeTrack(${index})">

🔥

</button>

</div>

</div>

<div class="preview">
${track.embed}
</div>

<div class="comments">

${commentsHTML}

<input
class="comment-input"
id="comment-${index}"
placeholder="Dodaj komentarz">

<button
class="comment-btn"
onclick="addComment(${index})">

Dodaj komentarz

</button>

</div>

</div>

`;
});
}

function likeTrack(index){

tracks[index].likes++;

renderTracks();
}

function addComment(index){

const input =
document.getElementById(
`comment-${index}`
);

const value =
input.value.trim();

if(!value) return;

tracks[index]
.comments
.push(value);

renderTracks();
}

document
.getElementById("submitTrack")
.addEventListener("click",()=>{

const nick =
document.getElementById("nickname")
.value
.trim();

const link =
document.getElementById("trackLink")
.value
.trim();

if(!nick || !link){

alert("Uzupełnij wszystkie pola");

return;
}

tracks.push({

nick,
link,

likes:0,

comments:[],

embed:getEmbed(link)

});

document.getElementById("nickname").value="";
document.getElementById("trackLink").value="";

renderTracks();

});