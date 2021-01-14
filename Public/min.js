
var category = ['All', 'Pump Station', 'Dam', 'Community Pump', 'Well']
var editedobj = {}
var savedobj = { location: '' }
var list = []
var moveMarker = { location: '' }
// fileter function 
function waterstation() {
    let arr = `<span  class="dropbtn"> <img src="${category[0]}.png" />${category[0]}</span><div class="dropdown-content">`
    arr += category.map((e, o) => o !== 0 ? (`<span key='${o}' onclick="view(${o})" class="dropbtn"><img src="${e}.png" alt=""> ${e}</span>`) : '')
    arr += ` </div>`
    arr = arr.replaceAll(',', '')
    document.querySelector('.dropdown').innerHTML = arr
}
waterstation()


// the first time the document is loaded
document.addEventListener("DOMContentLoaded", () => {
    fetch('/init').then(response => response.json())
        .then(data => {
            console.log(data)
            list = data;
            if (list.length) {
                for (let markerpoint = 0; markerpoint < list.length; markerpoint++) {
                    markerPositioner(list[markerpoint], markerpoint)
                }
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

function markerPositioner(val, pos) {
    let gIcon = L.icon({
        iconUrl: `${val.type}.png`,
        iconSize: [17, 17], // size of the icon 
    });
    let k = L.marker([val.location.lat, val.location.lng], { draggable: true, title: savedobj.type, icon: gIcon }).addTo(mymap);
    k.bindPopup(`<div class="position"> 
                    <div><span>Type:</span>  ${val.type}
                    </div>
                    <div><span>Capacity:</span>${val.capacity}
                    </div> 
                    <div class='deleter'>
                    <button onclick="deleter('${val._id}')" >Delete                        
                        </button>   <img src="loading.gif" alt="">                   
                    <a href='/edit?id=${val._id}' > edit</a>                      
                    </div>        
                </div>`);
    k.id = val._id

    k.on('dragend', function (event) {
        flip('.updatestation', 'flex')
        moveMarker.location = { ...event.target._latlng } 
        moveMarker._id = event.target.id
    })
    list[pos * 1] = { ...val, marker: k }
    return
}

// change fileter
function view(e) {
    const pos = category[e * 1]
    for (let l = (e * 1); l < category.length; l++) {
        if (category[l + 1]) {
            category[l] = category[l + 1]
        }
    }
    category.length = category.length - 1
    category = [pos,...category]
    waterstation()
    mymap.eachLayer(l=>l.id &&  mymap.removeLayer(l))
    if (list.length) {
        for (let markerpoint = 0; markerpoint < list.length; markerpoint++) {
             (list[markerpoint].type === pos || pos === 'All') && markerPositioner(list[markerpoint], markerpoint)
        }        
    }
}
//   open filters  
function init() {
    flip('.dropdown-content', 'block')
}

function displayoff() {
    flip('.parpopup', 'none')
    savedobj = {}
}

// save drap position
function dragPositionyes() {
    flip('.updatestation div img', 'block')    
    fetch('/saveedit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(moveMarker),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if (data !== 'err') {
               
                    flip('.updatestation div img', 'none')
                    flip('h3', 'block')
                for (let lop = 0; lop < list.length; lop++) {
                     if(list[lop]._id===data.p){                
                         mymap.removeLayer(list[lop].marker)
                          list[lop] = data._doc 
                         markerPositioner(list[lop],lop)
                         break;
                     }                    
                }
                
                setTimeout(() => {
                    flip('.updatestation', 'none')
                    flip('h3', 'none')
                    moveMarker = {}
                }, 1000);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// turn change location off
function dragPositionno() {
    flip('.updatestation', 'none')
    for (let d = 0; d < list.length; d++) {
            if(list[d]._id===moveMarker._id){
                 mymap.removeLayer(list[d].marker);
                 markerPositioner(list[d], d) 
            }
    }
  
}

// saving a station
function savestation() {
    savedobj.type = document.querySelector('.position div:nth-child(1) input').value
    savedobj.capacity = document.querySelector('.position div:nth-child(2) input').value
    if(category.indexOf(savedobj.type)!==-1 && savedobj.type !=='All'){
    if (savedobj.type !== '' && savedobj.capacity !== "") {
        // showing progress image
        flip('.groupimg img','block')
        fetch('/add', {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(savedobj),
        })
            .then(response => response.json())
            .then(data => {
                if (data !== 'err') {
                    
                        flip('.groupimg img', 'none')
                        flip('.parpopup', 'none')
                        document.querySelector('.position div:nth-child(1) input').value = ''
                        document.querySelector('.position div:nth-child(2) input').value = ''
                        markerPositioner(data, list.length)
                        list.push(data)
                    
                    savedobj = {}
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        flip('.position div:nth-child(2) input', '2px solid gray')
        flip('.position div:nth-child(1) input', '2px solid gray')
    } else if (savedobj.type === '') {
        flip('.position div:nth-child(1) input', '2px solid red')
        flip('.position div:nth-child(2) input', '2px solid gray')
    } else if (savedobj.capacity === '') {
        flip('.position div:nth-child(2) input', '2px solid red')
        flip('.position div:nth-child(1) input', '2px solid gray')
    }
}
}
function deleter(e) {
    flip('.deleter img', 'block')
    fetch('/deleter', {
        method: 'delete',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: e }),
    })
        .then(response => response.json())
        .then(data => {
            if (data !== 'err') {
                    list = list.filter(v => {
                        v._id === data && mymap.removeLayer(v.marker);
                        return v._id !== data
                    })
                
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
// initializing the map here
var mymap = L.map('mapid').setView([8.5491651393907, -11.643084429690779], 8);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW1hZHViYXJpZSIsImEiOiJja2ptdzJqOGM2Z3hmMnlsZ2prbGw3cGlsIn0.97FzOEjHufiMQSI6j2B6-Q', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    minZoom: 8,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);

function onMapClick(e) {
    flip('.parpopup', 'flex')
    savedobj.location = { ...e.latlng }
}
mymap.on('click', onMapClick);
mymap.on('mousemove', (e)=>{
    console.log(e.originalEvent.screenX) 
   let tracker = document.querySelector('.latlng').style
   tracker.top=(e.originalEvent.screenY>700)?(e.originalEvent.screenY-80):(e.originalEvent.screenY-30)+'px'
   tracker.left=(e.originalEvent.screenX<50)?(e.originalEvent.screenX+80):(e.originalEvent.screenX>660)?(e.originalEvent.screenX-80):(e.originalEvent.screenX-20)+'px'
   document.querySelector('.latlng .lat p').innerHTML = e.latlng.lat
   document.querySelector('.latlng .lng p').innerHTML = e.latlng.lng
});

function flip(e, v) {
    if (v === 'none' || v == 'flex' || v === 'block') {
        document.querySelector(e).style.display = v
    } else {
        document.querySelector(e).style.border = v
    }
}
