var heatmapInstance;
var csvData = {};

window.addEventListener(
    'DOMContentLoaded',
    init
);

function init(){
    document.querySelector('#prog').value = 0;
    document.querySelector('#volRange').value=document.querySelector('#videoContainer').volume;
    bindEvents();
    initHeatmap();
}


function initHeatmap() {
    heatmapInstance = h337.create({
        // only container is required, the rest will be defaults
        container: document.querySelector('#heatmap'),
        radius: 30
    });

    showHeatmapData()
}

function showHeatmapData() {
    // now generate some random data
    var video = document.querySelector("video");
    var width = video.clientWidth;
    var height = video.clientHeight;
    var currentTime = video.currentTime >> 0;

    // heatmap data format
    var data = {
        max: 1,
        data: csvData[currentTime]
    };

    // console.log(currentTime, csvData[currentTime]);

    heatmapInstance._renderer.setDimensions(width, height);

    if (data.data)
        heatmapInstance.setData(data);
}

function bindEvents(){
    var video = document.querySelector('#videoContainer');
    var progBar = document.querySelector('#prog');
    var dropArea = document.querySelector('#dropArea');
    var dropAreaCSV = document.querySelector('#dropAreaCSV');

    video.addEventListener(
        'timeupdate',
        showProgress
    );

    video.addEventListener(
        'play',
        playing
    );

    video.addEventListener(
        'ended',
        ended
    );

    video.addEventListener(
        'pause',
        paused
    );

    video.addEventListener(
        'error',
        function(e){
            videoError('Video Error');
        }
    );

    video.addEventListener(
        'stalled',
        function(e){
            videoError('Video Stalled');
        }
    );

    dropArea.addEventListener(
        'dragleave',
        makeUnDroppable
    );

    dropArea.addEventListener(
        'dragenter',
        makeDroppable
    );

    dropArea.addEventListener(
        'dragover',
        makeDroppable
    );

    dropArea.addEventListener(
        'drop',
        loadVideo
    );

    dropAreaCSV.addEventListener(
        'dragleave',
        makeUnDroppable
    );

    dropAreaCSV.addEventListener(
        'dragenter',
        makeDroppable
    );

    dropAreaCSV.addEventListener(
        'dragover',
        makeDroppable
    );

    dropAreaCSV.addEventListener(
        'drop',
        readCSV
    );

    document.querySelector('#playerContainer').addEventListener(
        'click',
        playerClicked
    );

    document.querySelector('#chooseVideo').addEventListener(
        'change',
        loadVideo
    );

    document.querySelector('#chooseCSV').addEventListener(
        'change',
        readCSV
    );

    document.querySelector('#volRange').addEventListener(
        'change',
        adjustVolume
    );

    document.querySelector('#enterLink').addEventListener(
        'change',
        loadVideo
    );

    document.querySelector('#enterLinkCSV').addEventListener(
        'change',
        readCSV
    );

    window.addEventListener(
        'keyup',
        function(e){
            switch(e.keyCode){
                case 13 : //enter
                case 32 : //space
                    togglePlay();
                    break;
            }
        }
    );
}


function getTime(ms){

    var date = new Date(ms);
    var time = [];

    time.push(date.getUTCHours());
    time.push(date.getUTCMinutes());
    time.push(date.getUTCSeconds());

    return time.join(':');
}

function adjustVolume(e){
    var video = document.querySelector('#videoContainer');
    video.volume=e.target.value;
}

function showProgress(){
    var video = document.querySelector('#videoContainer');
    var progBar = document.querySelector('#prog');
    var count = document.querySelector('#count');
    progBar.value=(video.currentTime/video.duration);
    count.innerHTML = getTime(video.currentTime*1000) +
        '/'+
        getTime(video.duration*1000);
    showHeatmapData();
}

function togglePlay(){
    document.querySelector('.play:not(.hide),.pause:not(.hide)').click();
}

function toggleScreen(){
    document.querySelector('.fullscreen:not(.hide),.smallscreen:not(.hide)').click();
}

function playing(e){
    var player = document.querySelector('#playerContainer');

    document.querySelector('#play').classList.add('hide');
    document.querySelector('#pause').classList.remove('hide');
    player.classList.remove('paused');

    hideFileArea();
}

function fullscreened(e){
    var player = document.querySelector('#playerContainer');
    player.classList.add('fullscreened');
    player.webkitRequestFullscreen();

}


function smallscreened(e){
    var player = document.querySelector('#playerContainer');
    player.classList.remove('fullscreened');
    document.webkitExitFullscreen();
}


function hideFileArea(){
    var dropArea=document.querySelector('.dropContainer');
    dropArea.classList.add('hidden');

    setTimeout(
        function(){
            var dropArea=document.querySelector('.dropContainer');
            dropArea.classList.add('hide');
        },
        500
    );
}

function showFileArea(){
    var dropArea=document.querySelector('.dropContainer');
    dropArea.classList.remove('hide');

    setTimeout(
        function(){
            var dropArea=document.querySelector('.dropContainer');
            dropArea.classList.remove('hidden');
        },
        10
    );
}

function paused(e){
    var player = document.querySelector('#playerContainer');

    document.querySelector('#pause').classList.add('hide');
    document.querySelector('#play').classList.remove('hide');
    player.classList.add('paused');

    showFileArea();
}

function ended(e){
    var player = document.querySelector('#playerContainer');

    document.querySelector('#play').classList.remove('hide');
    document.querySelector('#pause').classList.add('hide');
    player.classList.add('paused');

    showFileArea();
}

function makeDroppable(e) {
    e.preventDefault();
    e.target.classList.add('droppableArea');
};

function makeUnDroppable(e) {
    e.preventDefault();
    e.target.classList.remove('droppableArea');
};

function loadVideo(e) {
    e.preventDefault();
    var files = [];
    if(e.dataTransfer){
        files=e.dataTransfer.files;
    }else if(e.target.files){
        files=e.target.files;
    }else{
        files=[
            {
                type:'video',
                path:e.target.value
            }
        ];
    }

    //@ToDo handle playlist
    for (var i=0; i<files.length; i++) {
        console.log(files[i]);
        if(files[i].type.indexOf('video')>-1){
            var video = document.querySelector('video');
            video.src=files[i].path;
            setTimeout(
                function(){
                    document.querySelector('.dropArea').classList.remove('droppableArea');
                    document.querySelector('.play:not(.hide),.pause:not(.hide)').click();
                },
                250
            );
        }
    };
};

function readCSV(e) {
    e.preventDefault();

    var files = [];
    var fileNames = "";

    if(e.dataTransfer){
        files=e.dataTransfer.files;
    }else if(e.target.files){
        files=e.target.files;
    }else{
        files=[
            {
                type:'csv',
                path:e.target.value
            }
        ];
    }

    //@ToDo handle playlist
    for (var i=0; i<files.length; i++) {
        // console.log(files[i]);
        readCSVFile(files[i]);

        fileNames += files[i].name + (files.length == i + 1 ? '' : ', ');
    }

    alert("File success load: " + fileNames);
};

function videoError(message){
    var err=document.querySelector('#error');
    err.querySelector('h1').innerHTML=message;
    err.classList.remove('hide')

    setTimeout(
        function(){
            document.querySelector('#error').classList.remove('hidden');
        },
        10
    );
}

function closeError(){
    document.querySelector('#error').classList.add('hidden');
    setTimeout(
        function(){
            document.querySelector('#error').classList.add('hide');
        },
        300
    );
}

function playerClicked(e){
    if(!e.target.id || e.target.id=='controlContainer' || e.target.id=='dropArea'){
        return;
    }

    var video = document.querySelector('#videoContainer');
    var player = document.querySelector('#playerContainer');

    switch(e.target.id){
        case 'video' :
            togglePlay();
            break;
        case 'play' :
            if(!video.videoWidth){
                videoError('Error Playing Video');
                return;
            }
            video.play();
            break;
        case 'pause' :
            video.pause();
            break;
        case 'volume' :
            document.querySelector('#volRange').classList.toggle('hidden');
            break;
        case 'mute' :
            video.muted=(video.muted)? false:true;
            player.classList.toggle('muted');
            break;
        case 'volRange' :
            //do nothing for now
            break;
        case 'fullscreen' :
            fullscreened();
            break;
        case 'smallscreen' :
            smallscreened();
            break;
        case 'prog' :
            video.currentTime = ((e.offsetX)/e.target.offsetWidth)*video.duration;
            break;
        case 'close' :
            window.close();
            break;
        case 'fileChooser' :
            document.querySelector('#chooseVideo').click();
            break;
        case 'fileChooserCSV' :
            document.querySelector('#chooseCSV').click();
            break;
        case 'enterLink' :
            //do nothing for now
            break;
        case 'chart' :
            window.location = "chart.html";
            break;
        case 'error' :
        case 'errorMessage' :
            closeError();
            break;
        default :
            console.log('stop half assing shit.');
    }
}

function readCSVFile(file) {
    var reader = new FileReader();
    var delimiter = ';';

    reader.onload = function () {
        var lines = this.result.split('\n');

        var result = lines.map(function(line) {
            return line.split(delimiter);
        });

        for(var item in result) {
            var splitTime = result[item][0].split(":");
            var time = Number(splitTime[0]) * 60 * 60
                + Number(splitTime[1]) * 60
                + Number(splitTime[2]);

            if (!csvData[time])
                csvData[time] = [];

            csvData[time].push({x: parseFloat(result[item][1]), y: parseFloat(result[item][2]), value: 1});
        }

        // console.log(csvData);
    };

    reader.readAsText(file);
}