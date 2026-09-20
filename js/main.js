// GENERAL VARIABLES
var cnv;
var score, points = 0;
var lives;
var state = 'menu'; // menu, playing or over
var overAt = 0; // time the game ended
var RESTART_DELAY = 600; // ms
var gravity = 0.1;
var BOMB_CHANCE = 0.1;
var MISS_MARKER_FRAMES = 30;
var sword;
var fruit = [];
var missMarkers = [];
var fruitsList = ['apple', 'banana', 'peach', 'strawberry', 'watermelon', 'boom'];
var fruitsImgs = [], slicedFruitsImgs = [];
var livesImgs = [], livesImgs2 = [];
var boom, spliced, missed; // sounds
var bg, foregroundImg, fruitLogo, ninjaLogo, scoreImg, newGameImg, fruitImg, gameOverImg; // images
// var button, startButton;
// var timer;
// var counter = 60;
// var seconds, minutes;
// var timerValue = 60;

function preload(){

    // LOAD SOUNDS
    boom = loadSound('sounds/boom.mp3');
    spliced = loadSound('sounds/splatter.mp3');
    missed = loadSound('sounds/missed.mp3');

    // LOAD IMAGES
    for(var i=0; i<fruitsList.length-1; i++){
        slicedFruitsImgs[2*i] = loadImage('images/'+ fruitsList[i] + '-1.png');
        slicedFruitsImgs[2*i + 1] = loadImage('images/'+ fruitsList[i] + '-2.png');
    }
    for(var i=0; i<fruitsList.length; i++){
        fruitsImgs[i] = loadImage('images/'+ fruitsList[i] + '.png');
    }
    for(var i=0; i<3; i++){
        livesImgs[i] = loadImage('images/x'+ (i+1) + '.png');
    }
    for(var i=0; i<3; i++){
        livesImgs2[i] = loadImage('images/xx'+ (i+1) + '.png');
    }
    bg = loadImage('images/background.jpg');
    foregroundImg = loadImage('images/home-mask.png');
    fruitLogo = loadImage('images/fruit.png');
    ninjaLogo = loadImage('images/ninja.png');
    scoreImg = loadImage('images/score.png');
    newGameImg = loadImage('images/new-game.png');
    fruitImg = loadImage('images/fruitMode.png');
    gameOverImg = loadImage('images/game-over.png');
}

function setup(){

    cnv = createCanvas(800,635);
    cnv.mousePressed(check);
    sword = new Sword(color("#FFFFFF"));
    frameRate(60);
    score = 0;
    lives = 3;

}

function draw(){
    if(state === 'playing'){
        game();
    }
    if(state === 'menu'){
        drawMenu();
    }else if(state === 'over'){
        drawGameOver();
    }
}

function drawMenu(){
    clear();
    background(bg);
    image(foregroundImg, 0, 0, 800, 350);
    image(fruitLogo, 40, 20, 358, 195);
    image(ninjaLogo, 420, 50, 318, 165);
    image(newGameImg, 310, 360, 200, 200);
    image(fruitImg, 365, 415, 90, 90);
    noStroke();
    fill(255);
    textAlign(CENTER);
    textSize(16);
    text('Press F for full screen', width/2, height - 15);
}

function keyPressed(){ // F toggles full screen
    if(key === 'f' || key === 'F'){
        fullscreen(!fullscreen());
    }
}

function check(){ // Check for game start or restart
    if(state === 'menu'){
        if(mouseX > 300 && mouseX < 520 && mouseY > 350 && mouseY < 550){
            startGame();
        }
    }else if(state === 'over'){
        if(millis() - overAt > RESTART_DELAY){
            startGame();
        }
    }
}

function startGame(){ // Reset everything and start
    fruit = [];
    missMarkers = [];
    sword.swipes = [];
    score = 0;
    points = 0;
    lives = 3;
    state = 'playing';
}

function game(){
    clear();
    background(bg);
    if(mouseIsPressed){ // Draw sword
        sword.swipe(mouseX, mouseY);
    }
    if(frameCount % 5 === 0){
        if(noise(frameCount) > 0.69){
            fruit.push(randomFruit()); // Display new fruit
        }
    }
    points = 0
    for(var i=fruit.length-1; i>=0; i--){
        fruit[i].update();
        fruit[i].draw();
        if(!fruit[i].visible){
            if(!fruit[i].sliced && fruit[i].name != 'boom'){ // Missed fruit
                missMarkers.push({ x: constrain(fruit[i].x, 10, width - 60), frames: MISS_MARKER_FRAMES });
                missed.play();
                lives--;
                if(lives < 1 ){ // Check for lives
                    gameOver();
                    break;
                }
            }
            fruit.splice(i,1);
        }else{
            if(fruit[i].sliced && fruit[i].name == 'boom'){ // Check for bomb
                boom.play()
                gameOver();
                break;
            }
            if(sword.checkSlice(fruit[i]) && fruit[i].name != 'boom'){ // Sliced fruit
                spliced.play();
                points++;
                fruit[i].update();
                fruit[i].draw();
            }
        }
    }
    score += points;
    if(state !== 'playing'){ // Game over
        return;
    }
    if(frameCount % 2 === 0 ){
        sword.update();
    }
    sword.draw();
    drawMissMarkers();
    drawScore();
    drawLives();  
}

function drawMissMarkers(){ // Red X where a fruit was missed
    for(var i=missMarkers.length-1; i>=0; i--){
        var m = missMarkers[i];
        tint(255, map(m.frames, 0, MISS_MARKER_FRAMES, 0, 255));
        image(livesImgs2[0], m.x, height - 120, 50, 50);
        noTint();
        m.frames--;
        if(m.frames <= 0){
            missMarkers.splice(i,1);
        }
    }
}

function drawLives(){

    image(livesImgs[0], width - 110, 20, livesImgs[0].width, livesImgs[0].height);
    image(livesImgs[1], width - 88, 20, livesImgs[1].width, livesImgs[1].height);
    image(livesImgs[2], width - 60, 20, livesImgs[2].width, livesImgs[2].height);
    if(lives <= 2 ){
        image(livesImgs2[0], width - 110, 20, livesImgs2[0].width, livesImgs2[0].height);
    }
    if(lives <= 1){
        image(livesImgs2[1], width - 88, 20, livesImgs2[1].width, livesImgs2[1].height);
    }
    if(lives === 0){
        image(livesImgs2[2], width - 60, 20, livesImgs2[2].width, livesImgs2[2].height);
    }
}

function drawScore(){
    image(scoreImg, 10, 10, 40, 40);
    textAlign(LEFT);
    noStroke();
    fill(255,147,21);
    textSize(50);
    text(score, 50, 50);
}

function gameOver(){
    if(state !== 'playing'){ // Already over
        return;
    }
    state = 'over';
    overAt = millis();
    lives = 0;
    console.log("lost");
}

function drawGameOver(){
    clear();
    background(bg);
    image(gameOverImg, 155, 260, 490, 85);
    drawScore();
    drawLives();
    if(millis() - overAt > RESTART_DELAY){ // Show text after the delay
        noStroke();
        fill(255,147,21);
        textAlign(CENTER);
        textSize(28);
        text('Click to play again', width/2, 400);
    }
}

// timer = createP("timer");
// setInterval(timeIt, 1000);

// textAlign(CENTER);
// setInterval(timeIt, 1000);

//   if (timerValue == 0) {
//     text('game over', width / 2, height / 2 + 15);
//   }
// fruit.push(new Fruit(random(width),height,3,"#FF00FF",random()));
// function resetSketch(){
//     clear();
//     background(bg);
//     game();
// }
// function timeIt() {
//     console.log("time");
//     if (timerValue > 0) {
//         console.log(timerValue);
//         timerValue--;
//         textAlign(CENTER);
//         noStroke();
//         fill(255,147,21);
//         textSize(50);
//         text(timerValue, 200, 250);
//     }
//   }
