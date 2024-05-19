
let songs;
let currentSong = new Audio();
let currFolder;
let vl;
let bar;

// javascript function to convert seconds in to minuts:seconds  in this format 00:02 ---------------------- 
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// javascript function to play the current selected music ---------------------- 
const playMusic = (track, pause=false)=> {
	currentSong.src = `/Spotify-Clone/${currFolder}/` + track;
	
	if(!pause){
		currentSong.play();
	    play.src = "images/play.svg";
	}
	document.querySelector(".cureent-song-details").innerHTML = decodeURI(track);
}

//get songs from our computer directory-------------------------
async function getSongs(folder){
	let response;
	let data;
	currFolder = folder;

	try{
		response = await fetch(`http://127.0.0.1:5500/Spotify-Clone/${currFolder}/`);
		data = await response.text();
		// console.log(data);
	}
	catch(error){
		console.error(error);
	}
	
	let div = document.createElement("div");
	div.innerHTML = data;
	let as = div.getElementsByTagName("a");

	let songsData = [];
	for (let index = 0; index < as.length; index++) {
		const element = as[index];

		if(element.href.endsWith(".mp3")){
			songsData.push(element.href.split(`/${currFolder}/`)[1]);
		}
		
	}

	//adding songs to the library------------------------------------------------------------
	let ul = document.querySelector(".song-list").getElementsByTagName("ul")[0];
	ul.innerHTML = "";
	for (const song of songsData) {
		ul.innerHTML = ul.innerHTML + `<li>${song.replaceAll("%20", " ")}</li>`;
	}

	return songsData;

}

//list all the albums on the page 
const displayAlbums = async ()=> {
	let response;
	let data;
	try {
		response = await fetch(`http://127.0.0.1:5500/Spotify-Clone/songs/`);
		data = await response.text();
	} 
	catch (error) {
		console.error(error);
	}

	let div = document.createElement("div");
	div.innerHTML = data;
	
	let as = div.getElementsByTagName("a");
	let cardContainer = document.querySelector(".artists-list");
	let array = Array.from(as)
	
	for (let index = 0; index < array.length; index++) {
		const element = array[index];

		if(element.href.includes("songs/")){
			let album =  element.href.split("/")[5]
			let data;
			let response;
			
			try {
				response = await fetch(`http://127.0.0.1:5500/Spotify-Clone/songs/${album}/info.json`);
				data = await response.json();
			} catch (error) {
				console.error(error);
			}

			cardContainer.innerHTML = cardContainer.innerHTML + 
			`<div data-folder="${album}" class="artist-card">
				<div class="artist-img">
					<img src="songs/${album}/cover.jpg" alt="">
				</div>
				<span class="artist-name">${data.title}</span>
				<span class="artist">${data.description}</span>
			</div>`
		}
	} 

	//Load the playlist whenever card is clicked-------------------
	Array.from(document.querySelectorAll(".artist-card")).forEach(e=>{
		e.addEventListener('click', async item=>{
			songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
			playMusic(songs[0], false);
			// play.src = "images/pause.svg";
			// document.querySelector(".seekbar-circle").style.left = 0 + "%";
		});
	});
	
}



async function main(){
	songs = await getSongs("songs/Arijit");
	currentSong.volume = 0.5;
	
	playMusic(songs[0], true);

	//list all the albums on the page 
	displayAlbums();

	//Add an eventListener to all the song in the library--------------------
	Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
		e.addEventListener('click', (element)=> {
			playMusic(e.innerHTML);
		})
	});

	//Add an eventListener to the play-----------------------------------
	play.addEventListener('click', ()=> {
		if(currentSong.paused){
			currentSong.play();
			play.src = "images/play.svg";
		}
		else{
			currentSong.pause();
			play.src = "images/pause.svg";
		}
	});

	//listen  for time update of current song-------------------
	currentSong.addEventListener('timeupdate', ()=>{
		document.querySelector(".duration").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

		if(currentSong.currentTime <= currentSong.duration ){
			document.querySelector(".seekbar-circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
		};

		if(currentSong.currentTime === currentSong.duration){
			let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);

			if(index < songs.length-1){
				playMusic(songs[index+1]);
			}
			else if(index == songs.length-1){
				currentSong.pause();
				play.src = "images/pause.svg";
			}
		}
	});

	//Add an eventListener to the seekar--------------------------
	document.querySelector(".seekbar").addEventListener('click', e=>{
		let precent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
		document.querySelector(".seekbar-circle").style.left = precent + "%";
		currentSong.currentTime = ((currentSong.duration) * precent) / 100;
	});

	//Add an eventListener to the previous----------------------------
	prev.addEventListener('click', ()=> {
		let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
		if(index > 0){
			playMusic(songs[index-1]);
		}
		else{
			playMusic(songs[index]);
		}
	});

	//Add an eventListener to the next----------------------------
	next.addEventListener('click', ()=> {
		let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
		if(index < songs.length-1){
			playMusic(songs[index+1]);
		}
		else{
			playMusic(songs[index]);
		}
	})

	//Add an eventListener to change the volume---------------------
	audio_volume.addEventListener('change', e=> {
		currentSong.volume = parseInt(e.target.value)/100;
	});

	//Add an eventListener to mute the and on volume -----------------------
	document.querySelector(".range img").addEventListener('click', e=>{
		if(e.target.src.includes("images/volumeOn.svg")){
			e.target.src = "images/volumeMute.svg"
			vl = currentSong.volume;
		    bar = audio_volume.value;
			currentSong.volume = 0;
			audio_volume.value = 0;
		}
		else{
			e.target.src = "images/volumeOn.svg"
			currentSong.volume = vl;
			audio_volume.value = bar;
		}
	})

}

main();












// const url = 'https://spotify23.p.rapidapi.com/search/?q=%3CREQUIRED%3E&type=multi&offset=0&limit=10&numberOfTopResults=5';
// const options = {
// 	method: 'GET',
// 	headers: {
// 		'X-RapidAPI-Key': '5554b98d39msh4bb3c67ffb4b92ap15da85jsn9cecbeb2505a',
// 		'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
// 	}
// };

// try {
// 	const response = await fetch(url, options);
// 	result = await response.json();
// 	console.log(result);
// } catch (error) {
// 	console.error(error);
// }

// const TotalItems = result.artists.items;
// TotalItems.map((item) => {
// 	// console.log(item);
// 	artist_box.innerHTML = artist_box.innerHTML + 
// 	`<div class="artist-card">
// 		<div class="artist-img">
// 			<img src="${item.data.visuals.avatarImage.sources[0].url}" alt="">
// 		</div>
// 		<span class="artist-name">${item.data.profile.name}</span>
// 		<span class="artist">Artist</span>
// 	</div>`;
// });

