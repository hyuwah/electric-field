var stage;
var ATOM_SIZE = 75;
var POINT_SIZE = 10;
var DEFAULT_Y_POSITION = 300;
var COULOMB_CONSTANT = 8987.5517873681764;
var pointOfReference;
var firstAtom, secondAtom;
var firstArrow, secondArrow, resultantArrow;

function Atom(name, posX, posY){
	this.name = name;
	this.chargeType = $('input[name="' + this.name + '"]:checked').val();
	this.atom = new createjs.Shape();
	if (this.chargeType == '+'){
		this.color = "Red";
	} else {
		this.color = "DeepSkyBlue";
	}
	this.atom.graphics.beginFill(this.color).drawCircle(0, 0, ATOM_SIZE);
	this.text = new createjs.Text(this.chargeType, "bold 48px Arial", "#FFFFFF");
	this.text.textAlign = "center";
	this.text.y = -ATOM_SIZE / 3;
	this.dragger = new createjs.Container();
	this.dragger.x = posX;
	this.dragger.y = posY;
	this.dragger.addChild(this.atom, this.text);
	stage.addChild(this.dragger);
	this.dragger.on("pressmove", function (ev){
		ev.currentTarget.x = ev.stageX;
		ev.currentTarget.y = ev.stageY;
		calculate();
		stage.update();
	});
	this.radioListener = $('input[name="' + this.name + '"]').change({parent: this}, function(ev){
		if ($('input[name="' + ev.data.parent.name + '"]:checked').val() == '+'){
			ev.data.parent.color = "Red";
			ev.data.parent.text.text = ev.data.parent.chargeType = "+";
		} else {
			ev.data.parent.color = "DeepSkyBlue";
			ev.data.parent.text.text = ev.data.parent.chargeType = "-";
		}
		ev.data.parent.atom.graphics.clear().beginFill(ev.data.parent.color).drawCircle(0, 0, ATOM_SIZE);
		calculate();
		stage.update();
	});
}

function dist(dx, dy){
	return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

function calculate(){
	var q1 = parseFloat($('#firstAtomCharge').val());
	if (firstAtom.chargeType == '-') q1 = -q1;
	var q2 = parseFloat($('#secondAtomCharge').val());
	if (secondAtom.chargeType == '-') q2 = -q2;

	var dx = firstAtom.dragger.x - secondAtom.dragger.x;
	var dy = firstAtom.dragger.y - secondAtom.dragger.y;

	var force = Math.abs(COULOMB_CONSTANT * q1 * q2 / dist(dx, dy));
	$('#force').text(force + " N");

	dx = pointOfReference.x - firstAtom.dragger.x;
	dy = pointOfReference.y - firstAtom.dragger.y;
	firstElectricField = COULOMB_CONSTANT * q1 / dist(dx, dy);
	$('#electricField1').text(firstElectricField + " N/C");
	firstVector = {
		x : dx * firstElectricField / dist(dx, dy),
		y : dy * firstElectricField / dist(dx, dy)
	}
	firstArrow.graphics.clear()
					   .setStrokeStyle(10)
					   .beginStroke(firstAtom.color)
					   .moveTo(pointOfReference.x, pointOfReference.y)
					   .lineTo(pointOfReference.x + firstVector.x, pointOfReference.y + firstVector.y);
	
	dx = pointOfReference.x - secondAtom.dragger.x;
	dy = pointOfReference.y - secondAtom.dragger.y;
	secondElectricField = COULOMB_CONSTANT * q2 / dist(dx, dy);
	$('#electricField2').text(secondElectricField + " N/C");
	secondVector = {
		x : dx * secondElectricField / dist(dx, dy),
		y : dy * secondElectricField / dist(dx, dy)
	}
	secondArrow.graphics.clear()
					   .setStrokeStyle(10)
					   .beginStroke(secondAtom.color)
					   .moveTo(pointOfReference.x, pointOfReference.y)
					   .lineTo(pointOfReference.x + secondVector.x, pointOfReference.y + secondVector.y);

	resultantArrow.graphics.clear()
					   .setStrokeStyle(10)
					   .beginStroke("yellow")
					   .moveTo(pointOfReference.x, pointOfReference.y)
					   .lineTo(pointOfReference.x + firstVector.x + secondVector.x, pointOfReference.y + firstVector.y + secondVector.y);
}

$(document).ready(function (){
	stage = new createjs.Stage("ElectricField");
	stage.mouseMoveOutside = true;

	firstAtom = new Atom("firstAtom", 400, DEFAULT_Y_POSITION);
	secondAtom = new Atom("secondAtom", 1400, DEFAULT_Y_POSITION);

	pointOfReference = new createjs.Shape();
	pointOfReference.x = 900;
	pointOfReference.y = 500;
	pointOfReference.graphics.beginFill("black").drawCircle(0, 0, POINT_SIZE);
	stage.addChild(pointOfReference);
	stage.on("stagemousedown", function (ev){
		pointOfReference.x = ev.stageX;
		pointOfReference.y = ev.stageY;
		calculate();
		stage.update();
	});

	$('input.form-control').on('input', function(){
		var text = $(this).val();
		if (text === ""){
			$('#inputError').show();
			return;
		}
		for (var i = 0; i < text.length; i++){
			if (text.charAt(i) != '.' && (text.charAt(i) < '0' || text.charAt(i) > '9')){
				$('#inputError').show();
				return;
			}
		}
		$('#inputError').hide();
		calculate();
		stage.update();
	});
	firstArrow = new createjs.Shape();
	secondArrow = new createjs.Shape();
	resultantArrow = new createjs.Shape();
	stage.addChild(firstArrow, secondArrow, resultantArrow);
	calculate();

	stage.update();
});