/***** Constructors *****************************/
function noteHitter(x, y, imgId){
    this.x = x;
    this.y = y;
    this.width = noteDimensions;
    this.height = noteDimensions;
    this.img = document.getElementById(imgId);
    this.draw = function(){
        gameSpace.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}

function note(x, imgId){
    this.x = x;
    this. y = -100;
    this.height = noteDimensions;
    this.width = noteDimensions;
    this.img = document.getElementById(imgId);
    this.draw = function(){
        gameSpace.globalAlpha = 1;
        gameSpace.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}

/****************** Global Variables **************************************/
var gameSpace = document.getElementById("gameSpace").getContext("2d");
var noteDimensions = 50;
var noteSpeed = 10;
var noteHitterLeft = new noteHitter(250, 350, "arrowLeft");
var noteHitterDown = new noteHitter(noteHitterLeft.x + 70, 350, "arrowDown");
var noteHitterUp = new noteHitter(noteHitterDown.x + 70, 350, "arrowUp");
var noteHitterRight = new noteHitter(noteHitterUp.x + 70, 350, "arrowRight");
var leftIsPressed = false;
var downIsPressed = false;
var upIsPressed = false;
var rightIsPressed = false;
var audio;
var noteTiming = 0; //Timing for notes to appear on screen
var notePattern = 1; //Determines which note pattern to appear next
var pointCounter = document.getElementById("pointCounter");
var points = 0;
var pointTimeCounters = [0, 0, 0, 0]; //Counter for perfect/good/messy hits (index 0/1/2) and misses (index 3)
var play; //Stores setInterval
var frameRate = 60; //Frame rate the game is running at
var timeLimit = frameRate * 60; //Songs are played for 1 minute
var timer = 0;

//Arrays for notes of each type
var lNotes = [];
var dNotes = [];
var uNotes = [];
var rNotes = [];

//Current index of the note arrays
var currentUp = 0;
var currentLeft = 0;
var currentDown = 0;
var currentRight = 0;

//Values of different point timings
var perfect = 50;
var good = 30;
var messy = 15;

PrintMenu();

function PrintMenu(){
    gameSpace.font = "25px Arial";
    gameSpace.fillText("音ゲー IIDX", 200, 50);   
    gameSpace.font = "50px Arial";
    gameSpace.fillText("Otoge IIDX", 200, 100);
    gameSpace.font = "30px Arial";
    gameSpace.fillText("Select a song:", 230, 150);
    gameSpace.font = "20px Arial";
    gameSpace.fillText("1. [Easy] Kono Yubi Tomare - Goose House", 250, 200); 
    gameSpace.fillText("2. [Medium] All Star - Smash Mouth", 250, 235);
    gameSpace.fillText("3. [Hard] Living in the Sunlight - Tiny Tim", 250, 270);
    gameSpace.fillText("H. How to play", 250, 305);
    gameSpace.fillText("Press the key next to the option you want to choose", 250, 340);

    window.addEventListener('keydown', MenuSelect);
}

function PrintResults(){
    gameSpace.font = "50px Arial";
    gameSpace.fillText("Score: " + points, 200, 100);
    gameSpace.font = "30px Arial";
    gameSpace.fillText("Perfect: " + pointTimeCounters[0], 230, 155);
    gameSpace.fillText("Good: " + pointTimeCounters[1], 230, 190);
    gameSpace.fillText("Messy: " + pointTimeCounters[2], 230, 225);
    gameSpace.fillText("Miss: " + pointTimeCounters[3], 230, 260);
    if(pointTimeCounters[3] == 0){
        gameSpace.font = "40px Arial";
        gameSpace.fillText("Full Combo!", 210, 320);
        gameSpace.font = "25px Arial";
        gameSpace.fillText("Press any key to return to main menu", 200, 365);
    }
    else{
        gameSpace.font = "25px Arial";
        gameSpace.fillText("Press any key to return to main menu", 200, 300);
    }

    window.addEventListener('keydown', ReturnToMenu);
}

//"How to play" screen
function PrintInstructions(){
    window.removeEventListener('keydown', MenuSelect);
    gameSpace.clearRect(0, 0, 800, 500);

    gameSpace.font = "50px Arial";
    gameSpace.fillText("How to play", 200, 100);
    gameSpace.font = "20px Arial";
    gameSpace.fillText("Notes will be falling from the top of the screen onto the notehitters", 190, 150);
    gameSpace.fillText("on the bottom of the screen. Hit the corresponding arrow key on time", 190, 180);
    gameSpace.fillText("with the note falling down to score points. Points will be scored", 190, 210);
    gameSpace.fillText("based on accuracy. Hitting a perfect will score " + perfect + " points, hitting a", 190, 240);
    gameSpace.fillText("good will score " + good + " points, hitting a messy will score " + messy + " points.", 190, 270);
    gameSpace.fillText("Complete a song without missing a note to get a Full Combo", 190, 300);
    gameSpace.fillText("Press any key to return to main menu", 190, 335);

    noteHitterLeft.draw();
    noteHitterDown.draw();
    noteHitterRight.draw();
    noteHitterUp.draw();

    window.addEventListener('keydown', ReturnToMenu);
}

function SongStart(song, name){
        window.removeEventListener('keydown', MenuSelect);
        gameSpace.clearRect(0, 0, 800, 500);

        //Note hitters are transparent when the corresponding key is not pressed
        gameSpace.globalAlpha = 0.5;
        noteHitterLeft.draw();
        noteHitterDown.draw();
        noteHitterUp.draw();
        noteHitterRight.draw();
        gameSpace.globalAlpha = 1;

        window.addEventListener('keydown', NotePress);
        window.addEventListener('keyup', NoteRelease);

        audio = new Audio("Music/" + name + ".ogg");
        audio.play();

        gameSpace.beginPath();
        gameSpace.moveTo(0, 410);
        gameSpace.lineTo(800, 420);
        gameSpace.stroke();

        play = setInterval(song, 1000 / frameRate);
}

function EndGame(){
    gameSpace.clearRect(0, 0, 800, 500);
    window.removeEventListener('keydown', NotePress);
    window.removeEventListener('keyup', NoteRelease);
    audio.pause();
    audio.currentTime = 0;
    clearInterval(play);
    timer = 0;
    notePattern = 1;
    PrintResults();
}

//Song 1
function KonoYubi(){
    gameSpace.globalAlpha = 1;
    gameSpace.clearRect(0, 380, 150, 20);
    gameSpace.font = "20px Arial";
    gameSpace.fillText("Score: " + points, 10, 400);

    // Pattern 1:
    // ← ↓ ↑ ↓ →

    // Pattern 2:
    // → → ↑ ↑ ↓ ← ↓ ←

    //Create new notes with the patterns until 2 seconds are left in the song
    if((timeLimit - timer)/frameRate >= 2){
        if(notePattern == 1){
            CreateNotes(2, frameRate + 0, frameRate + 15, frameRate + 30, frameRate + 60, frameRate + 90, frameRate + 80, frameRate + 45); //Pattern 1
        }
        else{
            CreateNotes(1, frameRate + 70, frameRate + 60, frameRate + 30, frameRate, frameRate + 100, frameRate + 90, frameRate + 80, frameRate + 45, frameRate + 15); //Pattern 2
        }
    }

    MoveNotes();
    NoteHitDetection();
    NotesOverlap();
    noteTiming++;
    timer++;

    if(timer >= timeLimit){
        EndGame();
    }
}

//Song 2
function AllStar(){
    gameSpace.globalAlpha = 1;
    gameSpace.clearRect(0, 380, 150, 20);
    gameSpace.font = "20px Arial";
    gameSpace.fillText("Score: " + points, 10, 400);

    // Pattern 1:
    // ← ↓ ↓ → ↑ ↑

    // Pattern 2:
    // ← ↓ ← → ↑

    if((timeLimit - timer)/frameRate >= 2){
        if(notePattern == 1){
            CreateNotes(2, frameRate, frameRate + 15, frameRate + 60, frameRate + 45, frameRate + 85, -1, frameRate + 30, frameRate + 75); //Pattern 1
        }
        else{
            CreateNotes(1, frameRate, frameRate + 15, frameRate + 60, frameRate + 45, frameRate + 70, frameRate + 30); //Pattern 2
        }
    }

    MoveNotes();
    NoteHitDetection();
    NotesOverlap();
    noteTiming++;
    timer++;

    if(timer >= timeLimit){
        EndGame();
    }
}

function LivingSunlight(){
    gameSpace.globalAlpha = 1;
    gameSpace.clearRect(0, 380, 150, 20);
    gameSpace.font = "20px Arial";
    gameSpace.fillText("Score: " + points, 10, 400);

    // Pattern 0:
    // ← ← ↓ ↓ ↑ →

    // Pattern 1:
    // ← ← → → ↓ ↓ ↑ ↑

    // Pattern 2:
    // ← ↓ ← ↓ → ↑

    //Only start creating notes after 32 seconds have passed (The intro to this song is 32 secs and has no notes)
    //End notes 9 seconds before the end of the song (song's outro is 9 secs with no notes)
    if((timeLimit - timer)/frameRate >= 9 && timer >= frameRate * 32){
        if(notePattern == 1){
            CreateNotes(2, frameRate - 20, frameRate + 35, frameRate + 65, frameRate + 10, frameRate + 85, frameRate - 5, frameRate + 50, frameRate + 80, frameRate + 20); //Pattern 1
        }
        else if(notePattern == 2){
            CreateNotes(1, frameRate - 20, frameRate - 5, frameRate + 55, frameRate + 40, frameRate + 60, frameRate + 10, frameRate + 25); //Pattern 2
        }
        else{
            CreateNotes(1, frameRate, frameRate + 30, frameRate + 60, frameRate + 75, frameRate + 100, frameRate + 15, frameRate + 45); //Pattern 0 (Only appears once)
        }
    }

    MoveNotes();
    NoteHitDetection();
    NotesOverlap();
    noteTiming++;
    timer++;

    if(timer >= timeLimit){
        timeLimit = frameRate * 60; //Reset time limit
        EndGame();
    }
}

//Takes in the timing for each note type (up to 2 per type) and creates notes until the limit is reached
//When the limit is reached, the next pattern in the song will be created next
function CreateNotes(nextPattern, l, d, u, r, limit, l2 = -1, d2 = -1, u2 = -1, r2 = -1){
    if(noteTiming == l || noteTiming == l2){
        lNotes[currentLeft] = new note(noteHitterLeft.x, "arrowLeft");
        lNotes[currentLeft].draw();
        currentLeft++;
    }
    else if(noteTiming == d || noteTiming == d2){
        dNotes[currentDown] = new note(noteHitterDown.x, "arrowDown");
        dNotes[currentDown].draw();
        currentDown++;
    }
    else if (noteTiming == u || noteTiming == u2){
        uNotes[currentUp] = new note(noteHitterUp.x, "arrowUp");
        uNotes[currentUp].draw();
        currentUp++;
    }
    else if(noteTiming == r || noteTiming == r2){
        rNotes[currentRight] = new note(noteHitterRight.x, "arrowRight");
        rNotes[currentRight].draw();
        currentRight++;
    }

    if(noteTiming >= limit){
        noteTiming = 0;
        notePattern = nextPattern;
    }
}

function MoveNotes(){
    lNotes.forEach(function(theNote){
        gameSpace.clearRect(theNote.x, theNote.y, theNote.width, theNote.height);
        theNote.y += noteSpeed;
        theNote.draw();
    })

    dNotes.forEach(function(theNote){
        gameSpace.clearRect(theNote.x, theNote.y, theNote.width, theNote.height);
        theNote.y += noteSpeed;
        theNote.draw();
    })

    uNotes.forEach(function(theNote){
        gameSpace.clearRect(theNote.x, theNote.y, theNote.width, theNote.height);
        theNote.y += noteSpeed;
        theNote.draw();
    })

    rNotes.forEach(function(theNote){
        gameSpace.clearRect(theNote.x, theNote.y, theNote.width, theNote.height);
        theNote.y += noteSpeed;
        theNote.draw();
    })
} 

//Add points and display message indicating which note timing was hit
function NoteHitDetection(){
    for(i = 0; i < currentLeft; i++){
        var distance = (lNotes[i].y + lNotes[i].height) - noteHitterLeft.y;
        if(distance >= -25 && distance <= 50){
            if(leftIsPressed){
                if(distance > 40 && distance <= 50){
                    points += perfect;
                    gameSpace.clearRect(200, 425, 500, 500);
                    gameSpace.font = "30px Arial";
                    gameSpace.fillStyle = "gold";
                    gameSpace.fillText("PERFECT", 320, 450);
                    gameSpace.fillStyle = "black";
                }
                else if(distance > 25 && distance <= 40){
                    points += good;
                    gameSpace.clearRect(200, 425, 500, 500);
                    gameSpace.font = "30px Arial";
                    gameSpace.fillStyle = "blue";
                    gameSpace.fillText("GOOD", 320, 450);
                    gameSpace.fillStyle = "black";
                }
                else if(distance >= 0 && distance < 25){
                    points += messy;
                    gameSpace.clearRect(200, 425, 500, 500);
                    gameSpace.font = "30px Arial";
                    gameSpace.fillStyle = "purple";
                    gameSpace.fillText("MESSY", 320, 450);
                    gameSpace.fillStyle = "black";
                }

                gameSpace.clearRect(lNotes[i].x, lNotes[i].y, lNotes[i].width, lNotes[i].height);
                lNotes.splice(i, 1);
                currentLeft--;

                //Prevent notehitter from being erased when note is hit
                gameSpace.clearRect(noteHitterLeft.x, noteHitterLeft.y, noteHitterLeft.width, noteHitterLeft.height);
                noteHitterLeft.draw();
            }
        }
        else if(distance > 50){
            gameSpace.clearRect(lNotes[i].x, lNotes[i].y, lNotes[i].width, lNotes[i].height);
            lNotes.splice(i, 1);
            currentLeft--;
            pointTimeCounters[3]++;
            gameSpace.globalAlpha = 0.5;
            noteHitterLeft.draw();
            gameSpace.globalAlpha = 1;
            gameSpace.clearRect(200, 425, 500, 500);
            gameSpace.font = "30px Arial";
            gameSpace.fillStyle = "red";
            gameSpace.fillText("MISS", 320, 450);
            gameSpace.fillStyle = "black";
        }
    }

    for(i = 0; i < currentDown; i++){
        var distance = (dNotes[i].y + dNotes[i].height) - noteHitterDown.y;
        if(distance >= -25 && distance <= 50){
            if(downIsPressed){
                if(distance > 40 && distance <= 50){
                    points += perfect;
                    pointTimeCounters[0]++;
                    gameSpace.clearRect(200, 425, 500, 500);
                    gameSpace.font = "30px Arial";
                    gameSpace.fillStyle = "gold";
                    gameSpace.fillText("PERFECT", 320, 450);
                    gameSpace.fillStyle = "black";
                }
                else if(distance > 25 && distance <= 40){
                    points += good;
                    pointTimeCounters[1]++;
                    gameSpace.clearRect(200, 425, 500, 500);
                    gameSpace.font = "30px Arial";
                    gameSpace.fillStyle = "blue";
                    gameSpace.fillText("GOOD", 320, 450);
                    gameSpace.fillStyle = "black";
                }
                else if(distance >= 0 && distance <= 25){
                    points += messy;
                    pointTimeCounters[2]++;
                    gameSpace.clearRect(200, 425, 500, 500);
                    gameSpace.font = "30px Arial";
                    gameSpace.fillStyle = "purple";
                    gameSpace.fillText("MESSY", 320, 450);
                    gameSpace.fillStyle = "black";
                }

                gameSpace.clearRect(dNotes[i].x, dNotes[i].y, dNotes[i].width, dNotes[i].height);
                dNotes.splice(i, 1);
                currentDown--;

                //Prevent notehitter from being erased when note is hit
                gameSpace.clearRect(noteHitterDown.x, noteHitterDown.y, noteHitterDown.width,noteHitterDown.height);
                noteHitterDown.draw();
            }
        }
        else if(distance > 50){
            gameSpace.clearRect(dNotes[i].x, dNotes[i].y, dNotes[i].width, dNotes[i].height);
            dNotes.splice(i, 1);
            currentDown--;
            pointTimeCounters[3]++;
            gameSpace.globalAlpha = 0.5;
            noteHitterDown.draw();
            gameSpace.globalAlpha = 1;
            gameSpace.clearRect(200, 425, 500, 500);
            gameSpace.font = "30px Arial";
            gameSpace.fillStyle = "red";
            gameSpace.fillText("MISS", 320, 450);
            gameSpace.fillStyle = "black";
        }
    }

    for(i = 0; i < currentUp; i++){
        var distance = (uNotes[i].y + uNotes[i].height) - noteHitterUp.y;
        if(distance >= -25 && distance <= 50){
            if(upIsPressed){
                if(distance > 40 && distance <= 50){
                    points += perfect;
                    pointTimeCounters[0]++;
                    gameSpace.clearRect(200, 425, 500, 500);
                    gameSpace.font = "30px Arial";
                    gameSpace.fillStyle = "gold";
                    gameSpace.fillText("PERFECT", 320, 450);
                    gameSpace.fillStyle = "black";
                }
                else if(distance > 25 && distance <= 40){
                    points += good;
                    pointTimeCounters[1]++;
                    gameSpace.clearRect(200, 425, 500, 500);
                    gameSpace.font = "30px Arial";
                    gameSpace.fillStyle = "blue";
                    gameSpace.fillText("GOOD", 320, 450);
                    gameSpace.fillStyle = "black";
                }
                else if(distance >= 0 && distance <= 25){
                    points += messy;
                    pointTimeCounters[2]++;
                    gameSpace.clearRect(200, 425, 500, 500);
                    gameSpace.font = "30px Arial";
                    gameSpace.fillStyle = "purple";
                    gameSpace.fillText("MESSY", 320, 450);
                    gameSpace.fillStyle = "black";
                }

                gameSpace.clearRect(uNotes[i].x, uNotes[i].y, uNotes[i].width, uNotes[i].height);
                uNotes.splice(i, 1);
                currentUp--;

                //Prevent notehitter from being erased when note is hit
                gameSpace.clearRect(noteHitterUp.x, noteHitterUp.y, noteHitterUp.width, noteHitterUp.height);
                noteHitterUp.draw();
            }
        }
        else if(distance > 50){
            gameSpace.clearRect(uNotes[i].x, uNotes[i].y, uNotes[i].width, uNotes[i].height);
            uNotes.splice(i, 1);
            currentUp--;
            pointTimeCounters[3]++;
            gameSpace.globalAlpha = 0.5;
            noteHitterUp.draw();
            gameSpace.globalAlpha = 1;
            gameSpace.clearRect(200, 425, 500, 500);
            gameSpace.font = "30px Arial";
            gameSpace.fillStyle = "red";
            gameSpace.fillText("MISS", 320, 450);
            gameSpace.fillStyle = "black";
        }
    }

    for(i = 0; i < currentRight; i++){
        var distance = (rNotes[i].y + rNotes[i].height) - noteHitterRight.y;
        if(distance >= -25 && distance <= 50){
            if(rightIsPressed){
                if(distance > 40 && distance <= 50){
                    points += perfect;
                    pointTimeCounters[0]++;
                    gameSpace.clearRect(200, 425, 500, 500);
                    gameSpace.font = "30px Arial";
                    gameSpace.fillStyle = "gold";
                    gameSpace.fillText("PERFECT", 320, 450);
                    gameSpace.fillStyle = "black";
                }
                else if(distance > 25 && distance <= 40){
                    points += good;
                    pointTimeCounters[1]++;
                    gameSpace.clearRect(200, 425, 500, 500);
                    gameSpace.font = "30px Arial";
                    gameSpace.fillStyle = "blue";
                    gameSpace.fillText("GOOD", 320, 450);
                    gameSpace.fillStyle = "black";
                }
                else if(distance >= 0 && distance <= 25){
                    points += messy;
                    pointTimeCounters[2]++;
                    gameSpace.clearRect(200, 425, 500, 500);
                    gameSpace.font = "30px Arial";
                    gameSpace.fillStyle = "purple";
                    gameSpace.fillText("MESSY", 320, 450);
                    gameSpace.fillStyle = "black";
                }

                gameSpace.clearRect(rNotes[i].x, rNotes[i].y, rNotes[i].width, rNotes[i].height);
                rNotes.splice(i, 1);
                currentRight--;

                //Prevent notehitter from being erased when note is hit
                gameSpace.clearRect(noteHitterRight.x, noteHitterRight.y, noteHitterRight.width, noteHitterRight.height);
                noteHitterRight.draw();
            }
        }
        else if(distance > 50){
            gameSpace.clearRect(rNotes[i].x, rNotes[i].y, rNotes[i].width, rNotes[i].height);
            rNotes.splice(i, 1);
            currentRight--;
            pointTimeCounters[3]++;
            gameSpace.globalAlpha = 0.5;
            noteHitterRight.draw();
            gameSpace.globalAlpha = 1;
            gameSpace.clearRect(200, 425, 500, 500);
            gameSpace.font = "30px Arial";
            gameSpace.fillStyle = "red";
            gameSpace.fillText("MISS", 320, 450);
            gameSpace.fillStyle = "black";
        }
    }
}

//Prevent NoteHitters from being erased when notehitters and notes overlap
function NotesOverlap(){
  lNotes.forEach(function(theNote){
    if((theNote.y >= noteHitterLeft.y && theNote.y <= noteHitterLeft.y + noteHitterLeft.height) || (theNote.y + theNote.height >= noteHitterLeft.y && theNote.y + theNote.height <= noteHitterLeft.y + noteHitterLeft.height)){
        gameSpace.clearRect(noteHitterLeft.x, noteHitterLeft.y, noteHitterLeft.width, noteHitterLeft.height);
        gameSpace.globalAlpha = 0.5;
        noteHitterLeft.draw();
        gameSpace.globalAlpha = 1;
    }
  })

  dNotes.forEach(function(theNote){
    if((theNote.y >= noteHitterDown.y && theNote.y <= noteHitterDown.y + noteHitterDown.height) || (theNote.y + theNote.height >= noteHitterDown.y && theNote.y + theNote.height <= noteHitterDown.y + noteHitterDown.height)){
        gameSpace.clearRect(noteHitterDown.x, noteHitterDown.y, noteHitterDown.width, noteHitterDown.height);
        gameSpace.globalAlpha = 0.5;
        noteHitterDown.draw();
        gameSpace.globalAlpha = 1;
    }
  })

  uNotes.forEach(function(theNote){
    if((theNote.y >= noteHitterUp.y && theNote.y <= noteHitterUp.y + noteHitterUp.height) || (theNote.y + theNote.height >= noteHitterUp.y && theNote.y + theNote.height <= noteHitterUp.y + noteHitterUp.height)){
        gameSpace.clearRect(noteHitterUp.x, noteHitterUp.y, noteHitterUp.width, noteHitterUp.height);
        gameSpace.globalAlpha = 0.5;
        noteHitterUp.draw();
        gameSpace.globalAlpha = 1;
    }
  })

  rNotes.forEach(function(theNote){
    if((theNote.y >= noteHitterRight.y && theNote.y <= noteHitterRight.y + noteHitterRight.height) || (theNote.y + theNote.height >= noteHitterRight.y && theNote.y + theNote.height <= noteHitterRight.y + noteHitterRight.height)){
        gameSpace.clearRect(noteHitterRight.x, noteHitterRight.y, noteHitterRight.width, noteHitterRight.height);
        gameSpace.globalAlpha = 0.5;
        noteHitterRight.draw();
        gameSpace.globalAlpha = 1;
    }
  })
}

/*************** Event listener functions *******************/
function MenuSelect(e){
    switch (e.keyCode){
        case 49: case 97:
            SongStart(KonoYubi, "konoyubitomare");
            break;

        case 50: case 98:
            SongStart(AllStar, "allstar");
            break;

        case 51: case 99:
            timeLimit = frameRate * 146; //This song is extra long
            notePattern = 0; //This song has a 3rd pattern
            SongStart(LivingSunlight, "livinginthesunlight");
            break;

        case 72:
            PrintInstructions();
            break;
    }
}

function ReturnToMenu(){
    pointTimeCounters = [0, 0, 0, 0];
    window.removeEventListener('keydown', ReturnToMenu);
    gameSpace.clearRect(0, 0, 800, 500);
    points = 0;
    PrintMenu();
}

//Darken notehitter when corresponding key is pressed
function NotePress(e){
    if(e.keyCode == 37){
        gameSpace.clearRect(noteHitterLeft.x, noteHitterLeft.y, noteHitterLeft.width, noteHitterLeft.height);
        gameSpace.globalAlpha = 1;
        noteHitterLeft.draw();
        leftIsPressed = true;
    }
    else if(e.keyCode == 40){
        gameSpace.clearRect(noteHitterDown.x, noteHitterDown.y, noteHitterDown.width, noteHitterDown.height);
        gameSpace.globalAlpha = 1;
        noteHitterDown.draw();
        downIsPressed = true;
    }
    else if(e.keyCode == 38){
        gameSpace.clearRect(noteHitterUp.x, noteHitterUp.y, noteHitterUp.width, noteHitterUp.height);
        gameSpace.globalAlpha = 1;
        noteHitterUp.draw();
        upIsPressed = true;
    }
    else if(e.keyCode == 39){
        gameSpace.clearRect(noteHitterRight.x, noteHitterRight.y, noteHitterRight.width, noteHitterRight.height);
        gameSpace.globalAlpha = 1;
        noteHitterRight.draw();
        rightIsPressed = true;
    }
}

//Lighten notehitter when corresponding key is released
function NoteRelease(e){
    if(e.keyCode == 37){
        gameSpace.clearRect(noteHitterLeft.x, noteHitterLeft.y, noteHitterLeft.width, noteHitterLeft.height);
        gameSpace.globalAlpha = 0.5;
        noteHitterLeft.draw();
        leftIsPressed = false;
    }
    else if(e.keyCode == 40){
        gameSpace.clearRect(noteHitterDown.x, noteHitterDown.y, noteHitterDown.width, noteHitterDown.height);
        gameSpace.globalAlpha = 0.5;
        noteHitterDown.draw();
        downIsPressed = false;
    }
    else if(e.keyCode == 38){
        gameSpace.clearRect(noteHitterUp.x, noteHitterUp.y, noteHitterUp.width, noteHitterUp.height);
        gameSpace.globalAlpha = 0.5;
        noteHitterUp.draw();
        upIsPressed = false;
    }
    else if(e.keyCode == 39){
        gameSpace.clearRect(noteHitterRight.x, noteHitterRight.y, noteHitterRight.width, noteHitterRight.height);
        gameSpace.globalAlpha = 0.5;
        noteHitterRight.draw();
        rightIsPressed = false;
    }
}