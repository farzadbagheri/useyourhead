var score = 0;
//velocity
var vy = 4;
//gravity constant
const gravity = 0.001;

var constraints = { video: { width: 1280, height: 720 } }; 
function getRandomInt(max) { //random int-in-range generator from MDN
	return Math.floor(Math.random() * Math.floor(max));
}
var basket = document.getElementById("basket");
var basketball = document.getElementById("basketball");
var canvas = document.getElementById("myCanvas")
var context = canvas.getContext("2d") 
	
//initial text filling
function text() {
	context.font = "50px  Courier New";
	context.fillText("Use Your Head!", 25,75);
	context.strokeText('score: ' + score, 975,75);
	context.font = "30px  Courier New"
	context.strokeText("play in a well lit room :)", 25, 125);
}
text();

//ask for user permission to allow webcam video playback
navigator.mediaDevices.getUserMedia(constraints)
.then(function(mediaStream) {
	var video = document.querySelector('video');
	video.srcObject = mediaStream;
	video.onloadedmetadata = function(e) {
		video.play();
	};
	var ctracker = new clm.tracker();
	ctracker.init();
	ctracker.start(video);
	 
	//ball function with position and offset to create different drops
	function Ball(position, offset) {
		if(position > 0.75)  {
			position = 0.75;
		} else if(position < 0.25) {
			position = 0.25;
		}
		this.x = (canvas.width * position) ;
		this.y = 0 - getRandomInt(offset);;
		//this.degrees = 0;
		this.draw = function(context) {
		    context.drawImage(basketball, this.x - basketball.width, this.y - basketball.height);
		}
	}
	
	//random list of balls on start up, anywhere from 2 to 6 at once
	function getNewBalls() {
		let balls = [];
		for(var k = 0; k < 2 + getRandomInt(4); k++) {
			balls[k] = new Ball(Math.random(), getRandomInt(1000));
		}
		return balls
	}
	let balls = getNewBalls();
		
	function positionLoop() {
		requestAnimationFrame(positionLoop);
		
		//ctracker create array of facial positions
		var positions = ctracker.getCurrentPosition();
		
		//canvas is cleared for a new frame
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.beginPath();
		//positions[62] represents the tip of the user's nose!
		if(positions[62])  {
			context.drawImage(basket, canvas.width - positions[62][0] - basket.width, positions[62][1] - basket.height);
		}
		for (var j = balls.length - 1; j >= 0; j--) {
			balls[j].y += vy += gravity;
			balls[j].draw(context);
			
			//check if ball is in the basket in order to rerender and add a point
			if(positions[62] && (balls[j].y >= positions[62][1] && 
				balls[j].y <= positions[62][1] + basket.height &&
				balls[j].x <= canvas.width - positions[62][0] + basket.width &&
				balls[j].x >= canvas.width - positions[62][0] - basket.width / 2) 
			){
				balls[j] = new Ball(Math.random(), getRandomInt(1500));
				score++;
			//else if the ball has left the screen, reinitialize it
			} else if (balls[j].y > canvas.height) {
				balls[j] = new Ball(Math.random(), getRandomInt(1500));
			}
		}
		//print text last again so it is not obstructed or removed
			text();
  	}
	//loop game until user exits the session
  	positionLoop();
})
.catch(function(err) { 
	//log error for video stream if neccessary
	console.log(err.name + ": " + err.message); 
});
