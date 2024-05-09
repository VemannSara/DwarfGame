const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const startButton = document.querySelector('#start')
const startWindow = document.querySelector('#startWindow')
const gameData = document.querySelector('#adatok')
const pauseButton = document.querySelector('#stop')
const resumeButton = document.querySelector('#continue')
const resetButton = document.querySelector('#reset')
//const TimerButtons = document.querySelector('#stop')
//TODO külső paraméterben meglehessen
//var inputElement = document.getElementById('meret').value;
let gridSize = 15
//let gridSize = tableSize()

// Get the value entered by the user
//const gridSize = parseInt(inputElement.value);
//const gridSize = 10
const cellSize = canvas.width / gridSize;
const numberOfStones = 5
const numberOfLavas = 5
const maxGoldNumbers = 20
const maxDiamondNumbers = 20
let score = 0
let gamePaused = false

function resize() {
    // We are resizing for mobile devices only. For other devices, the
    // dimensions will be stuck at 800 * 600. To change the default dimensions,
    // change the height and width of the canvas and the width of the #container
    var win = window,
        doc = document,
        w = win.innerWidth,
        h = win.innerHeight,
        container = doc.getElementById('container'),
        canvas = doc.getElementById('Canvas');
    
    if( win.navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/i) ) {
      canvas.height = h;
      canvas.width  = w;
      container.style.height = h;
      container.style.width = w;
    }
}



// TORPE ==============================================================================================================
const dwarf = {
    image: new Image(),
    x: Math.floor(gridSize/2),
    y: Math.floor(gridSize/2),
    canmove : true,
    draw: function (){
        const imageSize = cellSize
        context.drawImage(
            this.image,
            this.x*cellSize, this.y*cellSize, imageSize,imageSize)
    },
    moveTo: function (x,y){
        const newX = Math.floor(x / cellSize)
        const newY = Math.floor(y / cellSize)
        if (newX >= 0 && newX < gridSize && newY >=0 && newY < gridSize ){ //hogy ne menjen ki a képernyőről
            const barriers = []
            for(const stone of stones){
                barriers.push({x: stone.x, y: stone.y})
            }

            for (const lava of lavas){
                barriers.push({x: lava.x, y: lava.y})
            }

            this.canmove = true

            for (const barrier of barriers) {
                if (newX === barrier.x && newY === barrier.y) { //megnézi, hogy van-e akadály
                     this.canmove = false
                }
            }
            
            if (this.canmove && !gamePaused) {
                this.x = newX
                this.y = newY           
                drawTable( //most újrarajzolja a táblát, nem biztos hogy jó így-->jóeaállítani a képméretet
                    this.x*cellSize, this.y*cellSize,
                )
            }                
        }
    }
}
dwarf.image.src = 'dwarf2.png'

// KO AKADALY ==========================================================================================================
let stones = []

for(let i = 0; i < numberOfStones; i++) {
    stones[i] = createStone()
}

function createStone() {
    let stone = {
        image: new Image(),
        draw: function (){
            const imageSize = cellSize
            context.drawImage(
                this.image,
                this.x*cellSize, this.y*cellSize, imageSize,imageSize)
        }
    }
    stone.image.src = 'ko.png'
    generateCoordinatesStones(stone)
    return stone
}
//Akadaly koordinata hozzáad
function generateCoordinatesStones(object) {
    let x
    let y
    let success = false
    while(!success) {
        x = Math.floor(Math.random() * gridSize)
        y = Math.floor(Math.random() * gridSize)
        if ((x !== dwarf.x || y !== dwarf.y) && checkCoordinates(stones, x, y)) {
            success = true
        }
    }
    object.x = x
    object.y = y
}

// Megnézzuk, hogy (x, y) benne van-e mar a megadott tombben. True lesz ha jó a koordináta azaz nincs benne.
function checkCoordinates(array, x, y) {
    for (const item of array) {
        if (item.x === x && item.y === y) {
            return false
        }
    }
    return true
}

// LAVA ==============================================================================================================
let lavas = [] 

for(let i = 0; i < numberOfLavas; i++) {
    lavas[i] = createLava()
} 

function createLava(){
    const lava = {
        image: new Image(),
        draw: function (){
            const imageSize = cellSize
            context.drawImage(
                this.image,
                this.x*cellSize, this.y*cellSize, imageSize,imageSize)
        }
    }
    lava.image.src = 'lava3.png'
    generateCoordinatesLava(lava)
    return lava
}

//megnézzük, hogy nincs ott törpe, kő és láva
function generateCoordinatesLava(object) {
    let x
    let y
    let success = false
    while(!success) {
        x = Math.floor(Math.random() * gridSize)
        y = Math.floor(Math.random() * gridSize)
        if ((x !== dwarf.x || y !== dwarf.y) && (checkCoordinates(stones, x, y)) && (checkCoordinates(lavas, x, y))) {
            success = true
        }
    }
    object.x = x
    object.y = y
}

// ARANY ==============================================================================================================

let golds = []

function createGold(){
    const gold = {
        image: new Image(),
        draw: function (){
            const imageSize = cellSize/2
            context.drawImage(
                this.image,
                this.x*cellSize, this.y*cellSize, imageSize,imageSize)
        }
    }
    gold.image.src = 'gold.png'
    generateCoordinatesGold(gold)
    return gold
}

function generateCoordinatesGold(object) {
    let x
    let y
    let success = false
    while(!success) {
        x = Math.floor(Math.random() * gridSize)
        y = Math.floor(Math.random() * gridSize)
        if ((x !== dwarf.x || y !== dwarf.y) && (checkCoordinates(stones, x, y)) && (checkCoordinates(lavas, x, y)) && (checkCoordinates(golds, x, y))) {
            success = true
        }
    }
    object.x = x
    object.y = y
}

let goldcount = 0
function placeGold() {
    if (maxGoldNumbers > goldcount && !gamePaused)
        golds.push(createGold())
        goldcount++
        drawTable()
}

function catchGold(){
    let i = 0
    for (const gold of golds){
        if ((gold.x === dwarf.x) && (gold.y === dwarf.y)){
            golds.splice(i, 1)
            //golds.pop()
            score = score + 1
        }
        i++
    }
    return score,golds
}

// GYÉMÁNT =============================================================================================================
let diamonds = []

function createDiamond(){
    const diamond = {
        image: new Image(),
        draw: function (){
            const imageSize = cellSize/2
            context.drawImage(
                this.image,
                this.x*cellSize, this.y*cellSize, imageSize,imageSize)
        }
    }
    diamond.image.src = 'diamond.png'
    generateCoordinatesDiamnond(diamond)
    return diamond
}

function generateCoordinatesDiamnond(object) {
    let x
    let y
    let success = false
    while(!success) {
        x = Math.floor(Math.random() * gridSize)
        y = Math.floor(Math.random() * gridSize)
        if ((x !== dwarf.x || y !== dwarf.y) && (checkCoordinates(stones, x, y)) && (checkCoordinates(lavas, x, y)) && (checkCoordinates(golds, x, y)) && (checkCoordinates(diamonds, x, y))) {
            success = true
        }
    }
    object.x = x
    object.y = y
}

let diamondcount = 0
function placeDiamond() {
    if (maxDiamondNumbers > diamondcount && !gamePaused)
        diamonds.push(createDiamond())
        diamondcount++
        drawTable()
}

function catchDiamond(){
    let i = 0
    for (const diamond of diamonds){
        if ((diamond.x === dwarf.x) && (diamond.y === dwarf.y)){
            diamonds.splice(i, 1)
            //golds.pop()
            score = score + 3
        }
        i++
    }
    return score,diamonds
}

// TIMER ==============================================================================================================

var timerVar
var totalSeconds = 0

function startTimer() {
    timerVar = setInterval(countTimer, 1000)
}

function countTimer() {
    ++totalSeconds
    var hour = Math.floor(totalSeconds /3600)
    var minute = Math.floor((totalSeconds - hour*3600)/60)
    var seconds = totalSeconds - (hour*3600 + minute*60)
    if(hour < 10){
        hour = "0"+hour
    }
    if(minute < 10) {
        minute = "0"+minute
    }
    if(seconds < 10) {
        seconds = "0"+seconds
    }
    document.getElementById("timer").innerHTML = `Az eltelt idő: ${hour}:${minute}:${seconds}`
}

function PauseTime(){
    clearInterval(timerVar)
    gamePaused = true
}
function resumeTimer() {
    startTimer()
    gamePaused = false
}
    
// JATEK LOGIKA ========================================================================================================
function writeScore(){
    let winscore = document.querySelector('#pont').value
    document.getElementById("score").innerHTML = `A megszerzett pontok: ${score}`
    if (score >= winscore && totalSeconds <= 60){
        document.getElementById("win").innerHTML = `Gratulálok nyertél!`
        PauseTime()
    }
    else if(totalSeconds > 60){
        document.getElementById("loose").innerHTML = `Vesztettél! :(`
        PauseTime()
    }
}


function writeName(){
    const playerName = document.getElementById('name').value
    if (playerName) {
        gameData.innerHTML = `Név: ${playerName}`;
    } else {
        alert('Kérlek érvényes nevet adj meg!');
    }
}

// function tableSize(){
//     const inputsize = document.querySelector('#meret').value
//     const gridSize = parseInt(inputsize)
//     return gridSize
// }
    
function drawField(x,y){
    context.fillStyle = '#804900'
    //#804900
    context.fillRect(x,y,cellSize,cellSize)
    //dwarf.draw()
}

function drawTable(){
    for(let xIndex = 0; xIndex < gridSize; xIndex++){
        for(let yIndex = 0; yIndex < gridSize; yIndex++){
            drawField(xIndex*cellSize, yIndex*cellSize,)
        }
        
    }
    pauseButton.style.visibility = 'visible'
    resumeButton.style.visibility = 'visible'
    //imerButtons.style.visibility = "visible"
    startWindow.style.visibility = 'hidden'
    startWindow.style.height = 0
    startWindow.style.margin = 0
    canvas.setAttribute("aria-disabled", "false");
    dwarf.draw()

    for (const stone of stones) {
        stone.draw()
    }

    for (const lava of lavas){
        lava.draw()
    }

    for (const gold of golds){
        gold.draw()
    }

    for (const diamond of diamonds){
        diamond.draw()
    }
    writeScore()
    catchGold()
    catchDiamond()
    // goldDraw()
}


function listenToKeys() {
    document.addEventListener('keydown', event => {
        if(event.key == 'd'){
            dwarf.moveTo(cellSize*(dwarf.x+1), cellSize*(dwarf.y))
        }else if(event.key == 'a'){
            dwarf.moveTo(cellSize*(dwarf.x-1), cellSize*(dwarf.y))
        }else if(event.key == 'w'){
            dwarf.moveTo(cellSize*(dwarf.x), cellSize*(dwarf.y-1))
        }else if(event.key == 's'){
            dwarf.moveTo(cellSize*(dwarf.x), cellSize*(dwarf.y+1))
        }
    })
}

function startGame(){
    //gridSize = tableSize()
    //gridSize = 10
    resize()
    drawTable()
    writeName()
    writeScore()
    listenToKeys()
    
    //GamePause()
    //ResumeGame()

    //timerVar = setInterval(countTimer, 1000) //másodpercenként
    startTimer()
    setInterval(placeGold, 3000)
    setInterval(placeDiamond, 5000)
    
    //myInterval = setInterval(myTimer, 1000)
    
    
}

startButton.addEventListener('click', startGame)
pauseButton.addEventListener('click', PauseTime)
resumeButton.addEventListener('click', resumeTimer)

