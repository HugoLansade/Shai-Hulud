let canvas = document.querySelector('.canvas');
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth *0.75;
canvas.height = window.innerHeight *0.75;  

let lvlEnd = false;
let lvl = 1;
let firstShipPassage = true;

/************************ Gestion de la partie DOM / clic***************************************/
document.getElementById("cover-arrow").addEventListener("click", function() {
    let bookCover = document.querySelector('.cover');
    let pages = document.querySelectorAll('.page');
    bookCover.classList.toggle("active");
    pages.forEach(el => el.classList.toggle('active'))
  })

  document.getElementById("notice-page-arrow").addEventListener("click", function() {
    let book = document.querySelector('.book');    
    let notice = document.querySelector('.notice-page');
    let middlePage = document.querySelector('.middle-page');
    let gamePage = document.querySelector('.game-page');
    let pageDroite = document.querySelector('.page-droite');
    let pageGauche = document.querySelector('.page-gauche');

    //creation of canvas element and insertion in the game page (even if doesnt matter because of z-index)
    //finally not using this method cause it doesnt work well with the animate function
    // const canvas = document.createElement("canvas")
    // canvas.id = "canvas";
    // book.insertBefore(canvas, gamePage);
    let canvas = document.querySelector('.canvas');


    notice.classList.toggle("active");
    middlePage.classList.toggle("active");
    pageDroite.classList.toggle("hidden");
    pageGauche.classList.toggle("hidden");
    canvas.classList.toggle("hidden");

  })

  document.querySelector('.choose-lvl-container').addEventListener("click", function(){
    let value = inputSlider.value;
    lvl = value;
    firstShipPassage = true;
    // vider le level actuel puis commencer le suivant
    reset();
    start(lvl);
  })
  let color =  "#E8B24A";
  let colorTextStyle = `style= "color : ${color}"`

  function updateHTML() {
    
    pvHulud.textContent = `: ${shaiHulud.pv} `;
    lvlID.textContent = `${lvl}`;
    harkonnenID.firstChild.textContent = `${objLvlState.nbHarkonnen}`;
    harkonnenID.lastElementChild.textContent = `${stateBattle.harkonnenMort}`;
  
    if (stateBattle.sardaukarMort !== 0) {
      sardaukarID.innerHTML =
      `We estimate that <strong ${colorTextStyle}></strong> Sardaukars were parachuted but only <strong></strong> of them survived.`; //style="color: #E8B24A"
      sardaukarID.firstChild.textContent = `${objLvlState.nbSardaukar}`;
      sardaukarID.lastElementChild.textContent = `${
        objLvlState.nbSardaukar - stateBattle.sardaukarMort
      }`;
    }
    
    if (stateBattle.usineMort !== 0) {
      usineID.innerHTML =
        "<strong></strong> factory were destroyed, it had a huge impact on Harkonnens troop, we estimate that they had to cut their troop budget by <strong>4</strong>%.";
      usineID.firstChild.textContent = `${stateBattle.usineMort}`;
      usineID.lastElementChild.textContent = "";
      usineID.lastElementChild.textContent = `${stateBattle.usineMort * 4}`;
    }
  
    if (stateBattle.vehiculeHarkonnenMort !== 0) {
      harkonnenVehiculeID.innerHTML =
        "Only <strong></strong> Harkonnnen's vehicule didn't blow up among the <strong></strong> initial.";
      harkonnenVehiculeID.firstChild.textContent = `${
        objLvlState.nbVehiculeHarkonnen - stateBattle.vehiculeHarkonnenMort
      }`;
      harkonnenVehiculeID.lastElementChild.textContent = `${objLvlState.nbVehiculeHarkonnen}`;
    }
  }

function reset(){
  harkoTot = [];
  harkoArray = [];
  initialXSardaukar = [];
  sardaukarArray = [];
  usineArray = [];
  vehiculeHarkonnenArray = [];
  vehiculeHarkonnenArrayTot = [];
  usineArrayTot = [];
  bombeHarkonnenTot = [];
  bombeHarkonnenArray = [];
  bombeSardaukarTot = [];
  bombeSardaukarArray = [];
  bombeVehiculeHarkonnenTot = [];
  bombeVehiculeHarkonnenArray = [];
}
/*************Construction du slider ************/

const slideValue = document.getElementById("lvlValue");
const inputSlider = document.getElementById("inputValue");
const lvlChooseElement = document.getElementById("lvlChoose")
inputSlider.oninput = (() =>{
  let value = inputSlider.value;
  slideValue.textContent = value;
  lvlChooseElement.textContent = value;
  slideValue.style.left = (value/1.15) + "%"; //permet d'avoir le curseur indiquant la valeur qui suit plus ou moins le pointeur
  slideValue.classList.add("show");
});

inputSlider.onblur = (() =>{
  slideValue.classList.remove("show");
});

/***************************************Partie CANVAS*****************************/

//****************************** */ Declaration des liens pour récupérer les images
let imageBombeHarkonnen = document.getElementById("bombeHarkonnen");
let imageBombeSardaukar = document.getElementById("bombeSardaukar");
let imageBombeHarkonnenVehicule = document.getElementById("bombeHarkonnenVehicule");
let harkonnenId = document.getElementById("imageHarkonnen");
let sardaukarId = document.getElementById("imageSardaukar");
let backgrounbId = document.getElementById("imageBackground");
let vaisseau = document.getElementById("imageVaisseau");
let usineId = document.getElementById("imageUsine");
let vehiculeHarkonnenId = document.getElementById("imageVehiculeHarkonnen");
let shaiHuludId = document.getElementById("imageShaiHulud");

const lvlID = document.getElementById("lvl");
const harkonnenID = document.getElementById("harkonnenNb");
const sardaukarID = document.getElementById("sardaukarNb");
const harkonnenVehiculeID = document.getElementById("harkonnenVehicule");
const usineID = document.getElementById("usine");
const pvHulud = document.getElementById("life-shai-hulud");


//****************************** */ Declaration des array
// const keys = [];

const particles = []; // Pour les éclats
const bombeColor = ["#650D04","#B62F21","#FD8210","#FAC94C"];
// const tabXSardaukar = [];

// const sardaukarLegion = [];

let harkoArray = [];
let harkoTot = [];
let initialXSardaukar = [];
let sardaukarArray = [];
let usineArrayTot = [];
let usineArray = [];
let vehiculeHarkonnenArrayTot = [];
let vehiculeHarkonnenArray = [];
let bombeHarkonnenTot = [];
let bombeHarkonnenArray = [];
let bombeSardaukarTot = [];
let bombeSardaukarArray = [];
let bombeVehiculeHarkonnenTot = [];
let bombeVehiculeHarkonnenArray = [];
let vaisseauxSardaukar = {};
let backupSardaukar = 0;
/*********Création des classes définissant les persos */


class Protagonniste {
    constructor(x, y, width, height, velocity, color, type, source, _id) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.velocity = velocity;
      this.color = color;
      this.type = type;
      this.source = source;
      this.frameX = 0;    // Postition pret à marcher
      this.frameY;     // Position vers la droite // 1 vers la gauche
      this.randomInitialDirection = Math.random() * 1;
      this._id = _id;
    }
  
    draw() {
      // ctx.fillStyle = this.color; // Attribution d'une couleur
      ctx.drawImage(this.source, this.width * this.frameX, this.height * this.frameY, this.width, this.height, this.x, this.y, this.width , this.height) // Création de la shape du harkonnen avec position initiale random
    }

    move() {
      if(this.type === 'sardaukar' && this.y + sardaukar.sardaukarHeight < objGeneral.feetPosition){
        this.y += this.velocity;
        this.frameY = 0;
      }       //Math.abs nous permet deffectuer une différence qui nous indique si nous sommes sur la meme ligne ou non
      else if(this.type === 'sardaukar' && Math.abs(this.y - objGeneral.feetPosition) > 1){
          // tant qu'on a pas atteri sur le sable et qu'on est un sardaukar sinon on fait comme d'hab sur le sable
          // console.log('type ' + this);
          this.y += this.velocity;
          this.frameY = 1;        
          
      } else if(this.type === 'vaisseauxSardaukar'){
        this.x -= this.velocity; // Si c'est le vaisseaux on veut seulement qu'il traverse l'écran
        this.frameY = 0;
      } else {
          if(this.randomInitialDirection < 0.5){
            this.x -= this.velocity;
            
        }else if(this.randomInitialDirection >= 0.5 ){
            this.x += this.velocity;
        }
        
        if(this.x + this.width > canvas.width ){
            this.frameY = 1;
            this.velocity = -this.velocity;
        } else if(this.x - this.width/100 < 0) {
            this.frameY = 2;
            this.velocity = -this.velocity;
        }
      }      
    }
  }
  
  class Particle {
    constructor(x, y, radius, color, velocity) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.velocity = velocity;
      this.color = color;
    }
  
    drawNormal() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color; // Attribution d'une couleur
      ctx.fill();
    }
  
    move() {
      this.drawNormal();
      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y;
    }
  }
  
  class ParticleFading {
    constructor(x, y, radius, color, velocity) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.velocity = velocity;
      this.color = color;
      this.alpha = 1; //Permet aux particules de disparaitre
    }
  
    drawNormal() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color; // Attribution d'une couleur
      ctx.fill();
    }
  
    drawFading() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color; // Attribution d'une couleur
      ctx.fill();
      ctx.restore();
    }
  
    move() {
      this.drawFading();
      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y; 
      
      // switch (true) {
      //   case this.alpha >= 0.8:
      //     this.color = "#650D04";
      //     break;
      //   case this.alpha >= 0.5:
      //     this.color = "#B62F21";
      //     break;
      //   case this.alpha >= 0.2:
      //     this.color = "#FD8210";
      //     break;
      //   case this.alpha >= 0.003:
      //     this.color = "#FAC94C";
      //     break;
      //   default:
      //     break;
      // }   
      this.alpha -= 0.003;
    }
  }

  class Bombe {
    constructor(x, width, height, color, type, source, id) {
      this.x = x;
      this.y = objGeneral.feetPosition + 30;
      this.width = width;
      this.height = height;
      this.color = color;
      this.type = type;
      this.source = source;
      this.id = id;
    }
  
    draw() {
      ctx.drawImage(this.source, this.x, objGeneral.feetPosition + 30, this.width, this.height); //insérer une image a x, y, largeur, longueur
    }
  }
  
  class BombeVehicule {
    constructor(x, y, width, height, color, type, source, velocity, id) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.type = type;
      this.source = source;
      this.velocity = velocity;
      this.angle = 0;
      this.id = id;
    }
  
    draw() {
      ctx.drawImage(this.source, this.x, this.y, this.width, this.height); //insérer une image a x, y, largeur, longueur
      //ctx.rotate(this.angle * Math.PI);
    }
  
    move() {
      this.draw();
      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y;
      //this.angle += 0.1;
      if (this.x + this.width > canvas.width || this.x < 0) {

        this.velocity.x = -this.velocity.x;
      }
      if (
        this.y + this.height > canvas.height ||
        this.y - this.height/2 < canvas.height /2

      ) {
        this.velocity.y = -this.velocity.y;
      }
    }
  }
//****************************** */ Declaration des objets caractérisant le jeu

const objBombeStyle = {
    bombeHarkonnenWidth: 40,
    bombeHarkonnenHeight: 25,
    bombeHarkonnenColor: "#dc2f02", // rouge mais serait cool de rajouter plusieurs couleur lors de l'explosion
    bbHarkonnenSource: imageBombeHarkonnen,
    bombeSardaukarWidth: 40,
    bombeSardaukarHeight: 25,
    bombeSardaukarColor: "#168aad", // rouge mais serait cool de rajouter plusieurs couleur lors de l'explosion
    bombeSardaukarSource: imageBombeSardaukar,
    bombeHarkonnenVehiculeWidth: 50,
    bombeHarkonnenVehiculeHeight: 50,
    bombeHarkonnenVehiculeColor: "#3FF3FF", // bleu électrique mais serait cool de rajouter plusieurs couleur lors de l'explosion
    bbHarkonnenVehiculeSource: imageBombeHarkonnenVehicule,
    bbHarkonnenVehiculeSpeedMin: 0.4,
    bbHarkonnenVehiculeSpeedMax: 0.6,
  };
  
  // limite de soldat sur le terrain pour pas que ca soit trop le bordel
  const limitationEcran = {
    sardaukarMax: 15,
    harkonnenMax: 20,//30,
    vehiculeHarkonnenMax: 2,
    usineMax: 1,
    bombeHarkonnenMax: 10,
    bombeSardaukarMax: 5,
    bombeVehiculeHarkonnenMax: 4,
  };
  
  // Permet d'incrementer au fur et a mesure pour ajouter à l'html
  let stateBattle = {
    sardaukarMort: 0,
    harkonnenMort: 0,
    usineMort: 0,
    vehiculeHarkonnenMort: 0,
    bombeHarkonnenOnField: 0,
    bombeSardaukarField: 0,
    bombeVehiculeHarkonnenOnField: 0,
  };

  //permet de réinitialiser state battle facilement
  const stateBattleInitial = {
    sardaukarMort: 0,
    harkonnenMort: 0,
    usineMort: 0,
    vehiculeHarkonnenMort: 0,
    bombeHarkonnenOnField: 0,
    bombeSardaukarField: 0,
    bombeVehiculeHarkonnenOnField: 0,
  };
  
  const pv = {
    harkonnenEat: 0.5,
    sardaukarEat: 1,
    fremFood: 3,
    harkonnenBombe: 10,
    sardaukarBombe: 15,
    vehiculeHarkonnenBombe: 10,
  };
  
    /**************Definition des caractéristiques des protagonistes****************/

  const shaiHulud = {
    x: 600,
    y: 500,
    width : 112.5,
    height : 108.5,
    frameX : 0,
    frameY : 0,
    radius: 50,
    color: "#696151", // 696151 gris  // ca6702 marron
    speed: 20,
    moving: false,
    pv: 100,
  };
  
  const vaisseaux = {
      vaisseauSardaukarWidth : 448,
      vaisseauSardaukarHeight : 141,
      vaisseauSardaukarColor : "#3FF3FF",
      vaisseauxSardaukarSpeed : 2
  }
let sandLineMiddlePosition = canvas.height / 2 +30;
  
const harkonnen = {
    // harkonnenHeight : 20,
    // harkonnenWidth : 20,
    harkonnenWidth : 32,
    harkonnenHeight : 48,
    harkonnenColor: "#424356", // "#5A189A", //'#023047'; //'#ffb703' fake just for nice color
    maxSpeedHarkonnen : 1,
    minSpeedHarkonnen : 0.2,
    feetPosition : sandLineMiddlePosition - 48 // a remplacer par harkonnen height
  }
  
const sardaukar = {
      maxSpeedSardaukar : 0.6,
      minSpeedSardaukar : 0.5,
      sardaukarWidth : 40,
      sardaukarHeight : 56,
      sardaukarColor : "#f5f3f4", //'#fb8500' fake just for nice color // real '#f5f3f4' //F1F9F9
      maxSpeedSardaukar : 0.6,
      minSpeedSardaukar : 0.5
  }

const usine = {
  usineWidth : 308.75, //little//354.25, medium// 363.25, big
  usineHeight : 207.7, // 209, //229.3,
  usineBottom : sandLineMiddlePosition - 207.7 +1, //229.3 = usineHeight
  usineColor : "#EE7E2D", //"#7f4f24",
  usineSpeed : 0.1
  }

const vehiculeHarkonnen = {
  vehiculeHarkonnenWidth : 168,
  vehiculeHarkonnenHeight : 101.6666666,
  vehiculeHarkonnenBottom : sandLineMiddlePosition -  101.6666666+15, //101.6666666 =vehiculeHarkonnenHeight
  vehiculeHarkonnenColor : "#219ebc",
  vehiculeHarkonnenMaxSpeed : 1.7,
  vehiculeHarkonnenMinSpeed : 1.5
  }

const vaisseauSardaukar = {
  width : 448,
  height : 141,
  vaisseauSardaukarColor : "#3FF3FF",
  speed : 2
  }
 //Création du vaisseau des sardaukars
  let objLvlState = {}

  const objGeneral = {
    sandLineMiddlePosition : canvas.height / 2,
    feetPosition :  canvas.height / 2 - 20
}

/*--------------------------------------------------------------Construction des niveaux et personnages--------------------------------------------------------------*/

//***** UTILISATION : A chaque niveau cette fonction est lancée et son objet est stocké puis assigné aux différentes valeurs  */
// Fonction permettant de donner les caractéristiques (nb enemis) en fonction du niveau

function lvlCharacteristicObject(lvl) {
    let nbHarkonnen = null;
    let nbSardaukar = null;
    let nbVehiculeHarkonnen = null;
    let nbUsine = null;
    let nbBombeHarkonnen = null;
    let nbBombeSardaukar = null;
    let nbBombeVehiculeHarkonnen = null;
  
    switch (true) {
      case lvl <= 5:
        nbHarkonnen = 10 * Number(`${lvl}`); // On augmente le nombre de Harkonnen par 10 à chaque tour
        nbSardaukar = 0;
        nbBombeHarkonnen = nbHarkonnen / 10; // ON ajoute des bombes en fonction du nombre de perso present
        break;
  
      case lvl <= 10:
        nbSardaukar = 10 * (Number(`${lvl}`) - 5) * 0.5; // On augmente le nombre de Sardaukar par 5 à chaque tour
        nbHarkonnen = 50;
        nbUsine = 1;
        nbBombeHarkonnen = nbHarkonnen / 10;
        nbBombeSardaukar = nbSardaukar / 5;
        break;
  
      case lvl <= 20:
        nbHarkonnen = 50 + 10 * (Number(`${lvl}`) - 10); // On augmente de 10, pour lvl20 => 150Harkonnens
        nbSardaukar = 30;
        nbVehiculeHarkonnen = 3;
        nbUsine = 3;
        nbBombeHarkonnen = nbHarkonnen / 10;
        nbBombeSardaukar = nbSardaukar / 5;
        nbBombeVehiculeHarkonnen = nbVehiculeHarkonnen;
        break;
  
      case lvl <= 100:
        nbHarkonnen = 150 + 10 * (Number(`${lvl}`) - 20); // Augmente de 10, lvl100 => 950 Harkonnens
        nbSardaukar = 30 + Number(`${lvl}` - 20) * 2; // Augmente de 2, lvl100 => 190 Harkonnens
        if (Number(lvl) % 3 === 0) {
          // On ajoute un véhicule tous les 3 tours
          nbVehiculeHarkonnen = 4 + (Number(`${lvl}`) - 20) / 3; // lvl98 => 30 véhicules
        } else {
          nbVehiculeHarkonnen = 3; // Permet à Shai Hulud de reprendre de la vie;
        }
        nbUsine = 3;
        nbBombeHarkonnen = nbHarkonnen / 10;
        nbBombeSardaukar = nbSardaukar / 5;
        nbBombeVehiculeHarkonnen = nbVehiculeHarkonnen;
        break;
  
      default:
        alert("Bug dans createInitialPosition ou lvl non spécifié");
        break;
    }
  
    let lvlState = {
      lvl: lvl,
      nbHarkonnen: nbHarkonnen,
      nbSardaukar: nbSardaukar,
      nbVehiculeHarkonnen: nbVehiculeHarkonnen,
      nbUsine: nbUsine,
      nbBombeVehiculeHarkonnen: nbBombeVehiculeHarkonnen,
      nbBombeSardaukar: nbBombeSardaukar,
      nbBombeHarkonnen: nbBombeHarkonnen,
    };
  
    return lvlState;
  }

function fillRemoveBombeArray() {
    if (
      stateBattle.bombeHarkonnenOnField < limitationEcran.bombeHarkonnenMax &&
      bombeHarkonnenTot.length !== 0
    ) {
      // On entre dans la condition seulement si le nombre de bombe est inférieur au nombre max et si le big array n'est pas vide  
      bombeHarkonnenArray.push(bombeHarkonnenTot[0]); //on ajoute la premiere bombe de l'array contenant toutes les bombes à l'array qui est dessiné
      bombeHarkonnenTot.splice(0, 1); // On enleve celle qu'on vient de prendre
      stateBattle.bombeHarkonnenOnField++;
    }
    if (
      stateBattle.bombeSardaukarField < limitationEcran.bombeSardaukarMax &&
      bombeSardaukarTot.length !== 0
    ) {
      // On entre dans la condition seulement si le nombre de bombe est inférieur au nombre max et si le big array n'est pas vide  
      bombeSardaukarArray.push(bombeSardaukarTot[0]); //on ajoute la premiere bombe de l'array contenant toutes les bombes à l'array qui est dessiné
      bombeSardaukarTot.splice(0, 1); // On enleve celle qu'on vient de prendre
      stateBattle.bombeSardaukarField++;
    }
    if (
      stateBattle.bombeVehiculeHarkonnenOnField <
        limitationEcran.bombeVehiculeHarkonnenMax &&
        bombeVehiculeHarkonnenTot.length !== 0
    ) {
      // On entre dans la condition seulement si le nombre de bombe est inférieur au nombre max et si le big array n'est pas vide
  
      bombeVehiculeHarkonnenArray.push(
        bombeVehiculeHarkonnenTot[0]
      ); //on ajoute la premiere bombe de l'array contenant toutes les bombes à l'array qui est dessiné
      bombeVehiculeHarkonnenTot.splice(0, 1); // On enleve celle qu'on vient de prendre
      stateBattle.bombeVehiculeHarkonnenOnField++;
      console.log('la')
      console.log(bombeVehiculeHarkonnenTot)
      console.log(bombeVehiculeHarkonnenArray)

    }
  
  }


//Fonction permettant d'assigner une vitesse pour un perso entre ses vitesses maximale et minimale
function assignationVitesse(speedMax, speedMin) {
    return Math.random() * (speedMax-speedMin) + speedMin; 
  }

function creationHarkonnen(nbHarko, harkonnenLegion){
    for (let i = 0; i < nbHarko; i++) {
      let velocity = assignationVitesse(harkonnen.maxSpeedHarkonnen, harkonnen.minSpeedHarkonnen);
      let Xposition =
        Math.random() * (canvas.width - harkonnen.harkonnenWidth * 2) + harkonnen.harkonnenWidth; // On créer une position initiale aléatoire entre 0 et la taille du canvas en enlevant la taille du harkonnen sur les bords pour pas qu'il soit coincé à la bordure de l"écran
      let _id = idGenerator();
        harkonnenLegion.push(
        new Protagonniste(
          Xposition,
          harkonnen.feetPosition,
          harkonnen.harkonnenWidth,
          harkonnen.harkonnenHeight,
          velocity,
          harkonnen.harkonnenColor,
          "harkonnen",
          harkonnenId,
          _id,
        )
      ); //Création d'un array qui contient notre legion d'harkonnen
    }
  }

function creationUsine(nbUsine, usineArray){
  for (let i = 0; i < nbUsine; i++) {
    let Xposition =
      Math.random() * (canvas.width - usine.usineWidth * 2) + usine.usineWidth; // On créer une position initiale aléatoire entre 0 et la taille du canvas en enlevant la taille de l'usine sur les bords pour pas qu'il soit coincé à la bordure de l"écran
      let _id = idGenerator();
      usineArray.push(
      new Protagonniste(
        Xposition,
        usine.usineBottom,
        usine.usineWidth,
        usine.usineHeight,
        usine.usineSpeed,
        usine.usineColor,
        "usine",
        usineId,
        _id,
      )
    ); //Création d'un array qui contient notre legion de sardaukar
  }
}


function creationVehiculeHarkonnen(nbVehiculeHarkonnen, vehiculeHarkonnenArray){
  for (let i = 0; i < nbVehiculeHarkonnen; i++) {
    let velocity = assignationVitesse(
      vehiculeHarkonnen.vehiculeHarkonnenMaxSpeed,
      vehiculeHarkonnen.vehiculeHarkonnenMinSpeed
    );
    let Xposition =
      Math.random() * (canvas.width - vehiculeHarkonnen.vehiculeHarkonnenWidth * 2) +
      vehiculeHarkonnen.vehiculeHarkonnenWidth; // On créer une position initiale aléatoire entre 0 et la taille du canvas en enlevant la taille du sardaukar sur les bords pour pas qu'il soit coincé à la bordure de l"écran
      let _id = idGenerator();
      vehiculeHarkonnenArray.push(
      new Protagonniste(
        Xposition,
        vehiculeHarkonnen.vehiculeHarkonnenBottom,
        vehiculeHarkonnen.vehiculeHarkonnenWidth,
        vehiculeHarkonnen.vehiculeHarkonnenHeight,
        velocity,
        vehiculeHarkonnen.vehiculeHarkonnenColor,
        "vehiculeHarkonnen",
        vehiculeHarkonnenId,
        _id,
      )
    ); //Création d'un array qui contient notre legion de sardaukar
  }
}

function creationBombeHarkonnen(nbBombeHarkonnen, bombeHarkonnenArray){
  for (let i = 0; i < nbBombeHarkonnen; i++) {
    let Xposition =
      Math.random() * (canvas.width - objBombeStyle.bombeHarkonnenWidth * 2) + objBombeStyle.bombeHarkonnenWidth;
      let _id = idGenerator();
      bombeHarkonnenArray.push(
      new Bombe(
        Xposition,
        objBombeStyle.bombeHarkonnenWidth,
        objBombeStyle.bombeHarkonnenHeight,
        objBombeStyle.bombeHarkonnenColor,
        "bombeHarkonnen",
        imageBombeHarkonnen,
        _id,
      )
    );
  }
}

function creationBombeSardaukar(nbBombeSardaukar, bombeSardaukarArray){
        for (let i = 0; i < nbBombeSardaukar; i++) {
          let Xposition =
            Math.random() *
              (canvas.width - objBombeStyle.bombeSardaukarWidth * 2) +
            objBombeStyle.bombeSardaukarWidth;
            let _id = idGenerator();
            bombeSardaukarArray.push(
            new Bombe(
              Xposition,
              objBombeStyle.bombeSardaukarWidth,
              objBombeStyle.bombeSardaukarHeight,
              objBombeStyle.bombeSardaukarColor,
              "bombeSardaukar",
              imageBombeSardaukar,
              _id,
            )
          );
        }
}

function creationBombeVehiculeHarkonnen(nbBombeVehiculeHarkonnen,bombeVehiculeHarkonnenArray){
        for (let i = 0; i < nbBombeVehiculeHarkonnen; i++) {
          //let velocity = assignationVitesse(objBombeStyle.bbHarkonnenVehiculeSpeedMax, objBombeStyle.bbHarkonnenVehiculeSpeedMin);
          let Xposition =
            Math.random() *
              (canvas.width - objBombeStyle.bombeHarkonnenVehiculeWidth * 2) +
            objBombeStyle.bombeHarkonnenVehiculeWidth;
            let _id = idGenerator();          
            bombeVehiculeHarkonnenArray.push(
            new BombeVehicule(
              Xposition,
              canvas.height / 2 + objBombeStyle.bombeHarkonnenVehiculeHeight,
              objBombeStyle.bombeHarkonnenVehiculeWidth,
              objBombeStyle.bombeHarkonnenVehiculeHeight,
              objBombeStyle.bombeHarkonnenVehiculeColor,
              "bombeHarkonnenVehicule",
              imageBombeHarkonnenVehicule,
              {
                x: Math.random() - 0.5,
                y: Math.random() - 0.5,
              },
              _id,
            )
          );
        }
}

function idGenerator(){
  return Math.random() * Date.now(); // on créer un nombre au hasard entre 0 et la date à la milliseconde pres d'aujoud'hui. Ca n'est pas parfait mais évite la majorité des beugs
}

function createLvlProtagoniste(lvlCharacteristic) {
    const harkonnenLegion = [];
    const usineArray = [];
    const vehiculeHarkonnenArray = [];
    const bombeHarkonnenArray = [];
    const bombeSardaukarArray = [];
    const bombeVehiculeHarkonnenArray = [];
    let nbSardaukar = objLvlState.nbSardaukar;  
    let lvl = lvlCharacteristic.lvl;
  
    switch (true) {
      case lvl <= 5:
        // On a que des Harkonnens
          creationHarkonnen(lvlCharacteristic.nbHarkonnen, harkonnenLegion);
          creationBombeHarkonnen(lvlCharacteristic.nbBombeHarkonnen, bombeHarkonnenArray);
        break;
  
      case lvl <= 10:
        // On a Sardokar, Harkonnen, Usine
        creationHarkonnen(lvlCharacteristic.nbHarkonnen, harkonnenLegion);
        creationBombeHarkonnen(lvlCharacteristic.nbBombeHarkonnen, bombeHarkonnenArray);
        creationBombeSardaukar(lvlCharacteristic.nbBombeSardaukar, bombeSardaukarArray);
        creationUsine(lvlCharacteristic.nbUsine, usineArray);
        assignationXrandomSardaukarArray(nbSardaukar); // tableau des positions initials des sardaukars

        break;
  
      case lvl <= 20:
        // On a Sardokar, Harkonnen, Usine
        creationHarkonnen(lvlCharacteristic.nbHarkonnen, harkonnenLegion);
        creationBombeHarkonnen(lvlCharacteristic.nbBombeHarkonnen, bombeHarkonnenArray);
        creationBombeSardaukar(lvlCharacteristic.nbBombeSardaukar, bombeSardaukarArray);
        creationUsine(lvlCharacteristic.nbUsine, usineArray);
        creationVehiculeHarkonnen(lvlCharacteristic.nbVehiculeHarkonnen,vehiculeHarkonnenArray);
        creationBombeVehiculeHarkonnen(lvlCharacteristic.nbBombeVehiculeHarkonnen,bombeVehiculeHarkonnenArray);
        assignationXrandomSardaukarArray(nbSardaukar);

        break;
  
      case lvl <= 100:
        // On a Sardokar, Harkonnen, Usine
        creationHarkonnen(lvlCharacteristic.nbHarkonnen, harkonnenLegion);
        creationBombeHarkonnen(lvlCharacteristic.nbBombeHarkonnen, bombeHarkonnenArray);
        creationBombeSardaukar(lvlCharacteristic.nbBombeSardaukar, bombeSardaukarArray);
        creationUsine(lvlCharacteristic.nbUsine, usineArray);
        creationVehiculeHarkonnen(lvlCharacteristic.nbVehiculeHarkonnen,vehiculeHarkonnenArray);
        creationBombeVehiculeHarkonnen(lvlCharacteristic.nbBombeVehiculeHarkonnen,bombeVehiculeHarkonnenArray);
        assignationXrandomSardaukarArray(nbSardaukar);

        break;
  
      default:
        alert("Bug dans createLvlProtagoniste, deuxieme switch");
        break;
    }
  
    // console.log("harko");
  
    // console.log("Sardau");
    // console.log(bombeSardaukarArray);
    // console.log("Vehicule");
    // console.log(bombeVehiculeHarkonnenArray);
  
    let lvlProtagonisteArray = {
      usines: usineArray,
      vehiculeHarkonnens: vehiculeHarkonnenArray,
      harkonnens: harkonnenLegion,
      bombeHarkonnen: bombeHarkonnenArray,
      bombeSardaukar: bombeSardaukarArray,
      bombeVehiculeHarkonnen: bombeVehiculeHarkonnenArray,
    };
    return lvlProtagonisteArray;
  }

function screenLimitation(arrayTot, arrayOnScreen, limitation){
    if(limitation < arrayTot.length){
    
      for (let i = limitation; i !== 0; i--) {
        arrayOnScreen.push(arrayTot[i]); // harkoTot[i]peut etre parce qu'a i il n'y a plus de harkonnen
        arrayTot.splice(i,1); //ca cause une division par 2 constament !!!
      }
    } else {
      for (let i = 0; i < arrayTot.length; i++) { //ici on met que la moitié a chaque fois convient mieux finalement
        arrayOnScreen.push(arrayTot[i]); // harkoTot[i]peut etre parce qu'a i il n'y a plus de harkonnen
        arrayTot.splice(i,1);
      }
    }
  }

/****************************Création des sardaukars************* */
// Les sardaukars sont créés différement :
/*
1) on construit un array contenant les positions des tous les sardaukars qui apparaitront dans le niveau
2) on trie cette array de manière à ce que lorsque les sardaukars soit parachutés ont ait l'illusion qu'ils tombent de l'avion

*/
function assignationXrandomSardaukarArray(nbMaxSardaukar) {
  let xmax = canvas.width - vaisseauSardaukar.width/3;
  let xmin = vaisseauSardaukar.width/3;
  // console.log("xmax",xmax)
  // console.log("xmin",xmin)

  if(nbMaxSardaukar !== 0){
      // ON construit un tableau de position initial de sardaukar
      for (let i = 0; i < nbMaxSardaukar; i++) {
          initialXSardaukar[i] = Math.floor(Math.random() * (xmax - xmin) + xmin);     
      }
      // On trie dans l'ordre inverse du tableau car le vaisseau viendra de X max jusqua x min 
      initialXSardaukar.sort((a,b) => b - a);
      console.log("length array sar", initialXSardaukar.length)
  }
}

function passageVaisseauEtPushSardaukar(condition){
  // console.log("in")

  for(let i = 0; i < condition; i ++){        
    // console.log("condition",condition)
    // console.log("i",i)
    // console.log("in")


    // console.log(sardaukarArray)
      let velocity = assignationVitesse(sardaukar.maxSpeedSardaukar, sardaukar.minSpeedSardaukar);
      let randomIndex = Math.floor(Math.random() * initialXSardaukar.length) //cela evite d'avoir des sardaukars trop regroupé qui est causé par le sort
      let xInBetweenScreen = initialXSardaukar[randomIndex];
      // console.log("initialXSardaukar", initialXSardaukar)
      // console.log("vaisseauxSardaukar.x" )

      // console.log(vaisseauxSardaukar.x )
      if(vaisseauxSardaukar.x > -vaisseauxSardaukar.width){          
          // console.log("in")
          // console.log("vaisseauxSardaukar.x",vaisseauxSardaukar.x)
          // console.log("xInBetweenScreen",xInBetweenScreen)
          // console.log("vaisseauxSardaukar.width",vaisseauxSardaukar.width)
        // let a = Math.abs(vaisseauxSardaukar.x + vaisseauxSardaukar.width - xInBetweenScreen);
        // let b = vaisseauxSardaukar.width/2;
        // console.log("a",a)
        // console.log("b",b)


          //On rentre uniquement si la distance entre la position de spawn du sardaukar dans le ciel (décidé avant xInbetween)
          //et la position du centre du vaisseau est inférieur à la largeur du vaisseaux on prend la valeur absolue pour ne pas avoir de probleme si le point de spawn est plus grand que la position de l'avion
          if(Math.abs(vaisseauxSardaukar.x + vaisseauxSardaukar.width - xInBetweenScreen) < vaisseauxSardaukar.width/2){
          // if(true){

          // console.log("in2")
            
            let _id = idGenerator();
              
              //On push le sardau dans l'array qui est dessinné constamment
              sardaukarArray.push(
                  new Protagonniste(
                    xInBetweenScreen,
                    vaisseauxSardaukar.y + 25,
                    sardaukar.sardaukarWidth,
                    sardaukar.sardaukarHeight,
                    velocity,
                    sardaukar.sardaukarColor,
                    "sardaukar",
                    sardaukarId,
                    _id
                  )
                );
                initialXSardaukar.splice(randomIndex,1); // notre array evolue au cours du temps ce qui fait que l'on peut maitriser le nombre de sardaukar à parachuter
                
          }       
      } 
      else if(backupSardaukar !== stateBattle.sardaukarMort) {
          // on refait démarer le vaisseaux à droite du canvas pour la prochaine loop
          vaisseauxSardaukar.x = canvas.width;
          backupSardaukar++;

          console.log('go2');
      }        
      else {
        // console.log("HEYYYYYYYYYYYYYYYYYYYYYYYYY")
      }          
  }

}

function gestionDesPassagesSardaukars(){
  // CAS 1 **************************** 
  //Si le nombre de sardaukar du niveau est inférieur à la limitation de sardau de l'ecran on les parachutes tous
  if(objLvlState.nbSardaukar <= limitationEcran.sardaukarMax && firstShipPassage){

      passageVaisseauEtPushSardaukar(objLvlState.nbSardaukar);
    // console.log('on met tout')
    // console.log('x',initialXSardaukar)

    // console.log('nb sardau',objLvlState.nbSardaukar)
    // console.log('sardaukarMax',limitationEcran.sardaukarMax)
    
    // console.log('sardaukarArray',sardaukarArray)

  }     //Si le nombre de sardaukar du niveau est supérieur à la limitation de sardau de l'ecran on le nombre de la limitation d'écran
  else if(objLvlState.nbSardaukar > limitationEcran.sardaukarMax && firstShipPassage){

      passageVaisseauEtPushSardaukar(limitationEcran.sardaukarMax); // on fait un premier passage enlevant la premiere salve
      // console.log('on met que limitation ecran')
    // console.log('x',initialXSardaukar)
     
    //   console.log('nb sardau',objLvlState.nbSardaukar)
    // console.log('sardaukarMax',limitationEcran.sardaukarMax)
    // console.log('sardaukarArray',sardaukarArray);

    firstShipPassage = false; // le vaisseau vient de passer donc à son prochain passage on ira dans le cas2
  }
  // CAS 2 *************************************
  else if(!firstShipPassage) {
      // let diff = Math.abs(tabXSardaukar.length - limitationEcran.sardaukarMax);
      let diff = initialXSardaukar.length;
      // console.log("dans diff")
      switch (true) {
          case diff > limitationEcran.sardaukarMax:
              passageVaisseauEtPushSardaukar(limitationEcran.sardaukarMax);
              // console.log('1');
              break;
  
          case diff > 10:
              passageVaisseauEtPushSardaukar(10);
              // console.log('2');
              break;

          case diff > 5:
              passageVaisseauEtPushSardaukar(5);
              // console.log('3');
              break;

          case diff >= 1:                
              passageVaisseauEtPushSardaukar(1);
              // console.log('4');
              break;

          case diff === 0: // Pour moi pas besoin de ce cas !
              passageVaisseauEtPushSardaukar(diff);
              // console.log('5');
              break;

          default:
              alert("erreur dans switch sardaukar parachute" + diff)
              break;
      }

      // console.log('out : ' + diff);
  }
}

//Cette fonction doit être appelée une fois à l'initialisation et ensuite uniquement dans le calcul des distances quand un sardaukar est mangé
function parachuteSardaukar(){
  //si tous les sardaukars ne sont pas mort et que le nombre de sardaukar initial est différent de 0
  if(stateBattle.sardaukarMort !== objLvlState.nbSardaukar && objLvlState.nbSardaukar !== 0){
      drawVaisseau();
      gestionDesPassagesSardaukars();     
      // console.log("vaisseauxSardaukar.x",vaisseauxSardaukar.x)

  }
}

function start(lvl){
  //Creation de l'array contenant tous les persos à dessiner
    objLvlState = lvlCharacteristicObject(lvl);
    let temp = createLvlProtagoniste(objLvlState);
    harkoTot = temp.harkonnens;
    usineArrayTot = temp.usines;
    vehiculeHarkonnenArrayTot = temp.vehiculeHarkonnens;
    bombeHarkonnenTot = temp.bombeHarkonnen;
    bombeSardaukarTot = temp.bombeSardaukar;
    bombeVehiculeHarkonnenTot = temp.bombeVehiculeHarkonnen;
    let limHarko = limitationEcran.harkonnenMax;
    let limVehiculeHarko = limitationEcran.vehiculeHarkonnenMax;
    let limUsine = limitationEcran.usineMax;
    let limBombeHarko = limitationEcran.bombeHarkonnenMax;
    let limBombeSardaukar = limitationEcran.bombeSardaukarMax;
    let limBombeVehicule = limitationEcran.bombeVehiculeHarkonnenMax;

    vaisseauxSardaukar = new Protagonniste( canvas.width, 30,  vaisseauSardaukar.width, vaisseauSardaukar.height, vaisseauSardaukar.speed, vaisseauSardaukar.vaisseauSardaukarColor, 'vaisseauxSardaukar', vaisseau);
   
    parachuteSardaukar();

    // fonction de remplissage de l'array qui sera dessiné on ajoute dans l'un et enleve dans l'autre pour eviter les doublons
    // console.log("limitationEcran.harkonnenMax", limitationEcran.harkonnenMax)
    // // console.log(harkoTot)
    // console.log("usineArray",usineArray)
    // console.log("vehiculeHarkonnenArray",vehiculeHarkonnenArray)


    // Soit le nombre total d'harkonnen est en dessous de la limitation d'écran au quel cas on peut tout mettre
    //Soit elle est au dessus donc on limite avec la limitation d'écran
    screenLimitation(harkoTot, harkoArray, limHarko);
    screenLimitation(vehiculeHarkonnenArrayTot, vehiculeHarkonnenArray, limVehiculeHarko);
    screenLimitation(usineArrayTot, usineArray, limUsine);
    screenLimitation(bombeHarkonnenTot, bombeHarkonnenArray, limBombeHarko);
    screenLimitation(bombeSardaukarTot, bombeSardaukarArray, limBombeSardaukar);
    screenLimitation(bombeVehiculeHarkonnenTot, bombeVehiculeHarkonnenArray, limBombeVehicule);



    
    // console.log('harkoTot', harkoTot)
    // console.log('harkoArray', harkoArray)
    // console.log("usineArray",usineArray)
    // console.log("usineArraytpt",usineArrayTot)
    // console.log("bombeHarkonnenArray",bombeHarkonnenArray)
    // console.log("bombeHarkonnenTot",bombeHarkonnenTot)
    // console.log("bombeSardaukarArray",bombeSardaukarArray)
    // console.log("bombeSardaukarTot",bombeSardaukarTot)
    // console.log("bombeVehiculeHarkonnenArray",bombeVehiculeHarkonnenArray)
    // console.log("bombeVehiculeHarkonnenTot",bombeVehiculeHarkonnenTot)
    // REINITIALISER LA POSITION DE SHAI HULUD
    shaiHulud.x = 600;
    shaiHulud.y = 500;

    // console.log("vehicule tot")
    // console.log(vehiculeHarkonnenArrayTot)

    // console.log("vehicule ")
    // console.log(vehiculeHarkonnenArray)


    // Reinitialisation des states des combats
    stateBattle.harkonnenMort = 0; // faire de meme pour chaque partie
    stateBattle.sardaukarMort = 0;
    stateBattle.usineMort = 0;
    stateBattle.vehiculeHarkonnenMort = 0;
    stateBattle.bombeHarkonnenOnField = 0;
    stateBattle.bombeSardaukarField = 0;
    stateBattle.bombeVehiculeHarkonnenOnField = 0;
    backupSardaukar = 0;
    let title = document.getElementById('title-shai-hulud');
    title.textContent = "Shai Hulud";

}
start(lvl)
// let objetArrayTroupes = createLvlProtagoniste(lvlCharacteristicObject(lvl));

// const harkoArray = objetArrayTroupes.harkonnens;
// const harkoArray = start(lvl);

function gameOver(){
  if(shaiHulud.pv <= 0){
    
    lvl = 1;
    reset();
    start(lvl);
    reset();
    let title = document.getElementById('title-shai-hulud');
    title.textContent = "Game Over"
    shaiHulud.pv = 100;
  }
}


function distanceRemoveProtagonisteTouched(enemyOnField, enemyTot) {
  //POur tous sauf sardaukars
  enemyOnField.forEach((enemy, index) => {

  const distBetweenShaiHuludandEnemy = Math.hypot(
    (shaiHulud.x+shaiHulud.width/2) - (enemy.x+enemy.width/2), //on place notre repère au centre de shai hulud et de l'enemi
    (shaiHulud.y+shaiHulud.height/2) - (enemy.y+enemy.height/2)
  ); // On evalue la distance entre les deux objets
  // const distBetweenShaiHuludandEnemy = Math.hypot(shaiHulud.x - 5, shaiHulud.y - 5);
  // On enleve l'enemei seulement si shaiHulud arrive à la moitié de son rayon pour donner l'impression d'absorption et non pas de simple contact
  if (
    distBetweenShaiHuludandEnemy - shaiHulud.radius / 2 - enemy.height / 2 < 1
  ) {
    // projection de particule quand on mange un mec
    for (let i = 0; i < enemy.width; i++) {
      // enemy.width = nb de particle à chaque pour un hit proportionnel à la taille de ce que l'on mange donc
      if(enemy.type === "bombeSardaukar" || enemy.type === "bombeHarkonnen" || enemy.type === "bombeHarkonnenVehicule" || enemy.type === "vehiculeHarkonnen"){
        let randomParticuleIndex = Math.floor(Math.random() * 3);
        enemy.color = bombeColor[randomParticuleIndex];
      }
      particles.push(
        new ParticleFading(enemy.x+enemy.width/2, enemy.y+enemy.height/2, Math.random() * (3 - 2) + 2, enemy.color, {
          x: Math.random() - 0.5,
          y: -Math.random(),
        })
      );
    }
    
    //setTimeout(() => {                                                      // Permet de se débarrasser de l'effet flash post enlevement (maybe not useful)
    let idToRemove = enemyOnField[index]._id;

    // console.log("-------- HarkoTot INITIAL")
      
    // enemyTot.forEach(el => console.log(el._id))
    // console.log("-------- HarkoArray")
    // enemyOnField.forEach(el => console.log(el._id))
    // console.log("-------- HarkoTot INTIAL 2 ")      
    // harkoTot.forEach(el => console.log(el._id))
    // console.log("-------- HarkoArray")
    // harkoArray.forEach(el => console.log(el._id))
    // // enemyTot = enemyTot.filter(el => enemyTot[0]._id !== el._id)
    // console.log("enemytot", enemyTot)

    // console.log("enemyOnField before",enemyOnField)
    // console.log("enemy avant splice", enemyOnField[index])
    // console.log("before filter",enemyOnField)
    // console.log("before filter arra",harkoArray)
    // console.log("harkoArray")

    // harkoArray.forEach(el => console.log(el._id))
    // console.log("enemy")
    // enemyOnField.forEach(el => console.log(el._id))


    enemyOnField.splice(index, 1); // Si on touche un enemi l'enleve de l'array regroupant tout le monde (plus rapide de faire avec l'index que d'utiliser filter ici)
    // console.log("enemyOnField",enemyOnField)
    // console.log("harkoArray")

    // harkoArray.forEach(el => console.log(el._id))
    // console.log("enemy")
    // enemyOnField.forEach(el => console.log(el._id))
    // console.log("zpres splice", enemyOnField[index])
    // console.log("after filter",enemyOnField)
    // console.log("after filter arra",harkoArray)

    // console.log("before filter",enemyTot)
    // console.log("harko before filter",harkoTot)
    // console.log(idToRemove)
    //     console.log("-------- HarkoTot")
    // harkoTot.forEach(el => console.log(el._id))
    // console.log("-------- enemytot")
    // enemyTot.forEach(el => console.log(el._id))

    enemyTot = enemyTot.filter(el => idToRemove !== el._id) //on renvoie un tableau contenant tout les persos avec un id different de celui a remove.
    // console.log("-------- HarkoTot")
    // harkoTot.forEach(el => console.log(el._id))
    // console.log("-------- enemytot")
    // enemyTot.forEach(el => console.log(el._id))
    
    // console.log("after filter",enemyTot)
    // console.log("harko after filter",harkoTot)

    
    console.log("New harko after eat")
    console.log(enemyOnField)
    console.log("harkoTot",enemyTot)

    // console.log("-------- HarkoTot")
    // harkoTot.forEach(el => console.log(el._id))
    // console.log("-------- HarkoArray")
    // harkoArray.forEach(el => console.log(el._id))

    if(enemyTot.length >= 1){
      // console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")



      enemyOnField.push(enemyTot[0]); //On ajoute un harkonnen du total vers l'array
      // console.log("enemy on field avec le mec ajouté",enemyOnField)
      //   // console.log("add one with id", harkoTot[0]._id)
      //   // console.log("enemytot", enemyTot)
      //   // console.log("harkoTot", harkoTot)
      //   console.log("-------- HarkoTot")
      //   enemyTot.forEach(el => console.log(el._id))
      //   console.log("-------- HarkoArray")
      //   harkoArray.forEach(el => console.log(el._id))
      //   console.log("-------on enleve le mec que l'on vient d'ajouter")
      // console.log("le prochain que l'on poussera sera",enemyTot[0])

        let a = enemyTot.splice(0,1); //On enleve l'harkonnen quel'on vient d'ajouter de tot
      // console.log("le prochain que l'on poussera sera",enemyTot[0])
      if(enemy.type === "harkonnen"){
        console.log("in")
        harkoTot = enemyTot;
        if (shaiHulud.pv < 100) {
          shaiHulud.pv += pv.harkonnenEat;
        }
        stateBattle.harkonnenMort++;
      } else if (enemy.type === "usine"){
        usineArrayTot = enemyTot;
        stateBattle.usineMort++;

      }  else if (enemy.type === "vehiculeHarkonnen"){
        vehiculeHarkonnenArrayTot = enemyTot;
        stateBattle.vehiculeHarkonnenMort++;
      } else if (enemy.type === "bombeSardaukar"){
        bombeSardaukarTot = enemyTot;
        shaiHulud.pv -= pv.sardaukarBombe;
        stateBattle.bombeSardaukarField--;
        fillRemoveBombeArray();
      } else if (enemy.type === "bombeHarkonnen"){
        bombeHarkonnenTot = enemyTot;
        shaiHulud.pv -= pv.harkonnenBombe;
        stateBattle.bombeHarkonnenOnField--;
        fillRemoveBombeArray();
      } else if (enemy.type === "bombeHarkonnenVehicule"){
        bombeVehiculeHarkonnenTot = enemyTot;
        shaiHulud.pv -= pv.vehiculeHarkonnenBombe;
        console.log("bombe b=vehicule there",stateBattle.bombeVehiculeHarkonnenOnField )
        stateBattle.bombeVehiculeHarkonnenOnField--;
        console.log("bombe b=vehicule",stateBattle.bombeVehiculeHarkonnenOnField )

        fillRemoveBombeArray();
      }
        // console.log("-------- HarkoTot FINALE")
      
        // enemyTot.forEach(el => console.log(el._id))
        // console.log("-------- HarkoArray")
        // enemyOnField.forEach(el => console.log(el._id))
        // console.log("-------- HarkoTot FINALE 2 ")      
        // harkoTot.forEach(el => console.log(el._id))
        // console.log("-------- HarkoArray")
        // harkoArray.forEach(el => console.log(el._id))
        // // enemyTot = enemyTot.filter(el => enemyTot[0]._id !== el._id)
        // console.log("enemytot", enemyTot)

    } else if(enemyOnField.length >= 1 && enemyTot.length === 0 ){

      console.log('>>>>>>>>>>>>>>>>>>>>> enleve que les arrayharko')
      if(enemy.type === "harkonnen"){
        console.log("in")
        harkoTot = enemyTot;
        if (shaiHulud.pv < 100) {
          shaiHulud.pv += pv.harkonnenEat;
        }
        stateBattle.harkonnenMort++;
      } else if (enemy.type === "usine"){
        usineArrayTot = enemyTot;
        stateBattle.usineMort++;

      }  else if (enemy.type === "vehiculeHarkonnen"){
        vehiculeHarkonnenArrayTot = enemyTot;
        stateBattle.vehiculeHarkonnenMort++;
      } else if (enemy.type === "bombeSardaukar"){
        bombeSardaukarTot = enemyTot;
        shaiHulud.pv -= pv.sardaukarBombe;
        stateBattle.bombeSardaukarField--;
        fillRemoveBombeArray();
      } else if (enemy.type === "bombeHarkonnen"){
        bombeHarkonnenTot = enemyTot;
        shaiHulud.pv -= pv.harkonnenBombe;
        stateBattle.bombeHarkonnenOnField--;
        fillRemoveBombeArray();
      } else if (enemy.type === "bombeHarkonnenVehicule"){
        bombeVehiculeHarkonnenTot = enemyTot;
        shaiHulud.pv -= pv.vehiculeHarkonnenBombe;
        console.log("bombe b=vehicule here",stateBattle.bombeVehiculeHarkonnenOnField )
        stateBattle.bombeVehiculeHarkonnenOnField--;
        console.log("bombe b=vehicule",stateBattle.bombeVehiculeHarkonnenOnField )
        fillRemoveBombeArray();
      }

    } else if(enemyOnField.length === 0 && enemyTot.length === 0 ){ //on a fini le niveau
      if(enemy.type === "harkonnen"){
        console.log("in")
        harkoTot = enemyTot;
        if (shaiHulud.pv < 100) {
          shaiHulud.pv += pv.harkonnenEat;
        }
        stateBattle.harkonnenMort++;
      } else if (enemy.type === "usine"){
        usineArrayTot = enemyTot;
        stateBattle.usineMort++;

      }  else if (enemy.type === "vehiculeHarkonnen"){
        vehiculeHarkonnenArrayTot = enemyTot;
        stateBattle.vehiculeHarkonnenMort++;
      } else if (enemy.type === "bombeSardaukar"){
        bombeSardaukarTot = enemyTot;
        shaiHulud.pv -= pv.sardaukarBombe;
        stateBattle.bombeSardaukarField--;
        fillRemoveBombeArray();
      } else if (enemy.type === "bombeHarkonnen"){
        bombeHarkonnenTot = enemyTot;
        shaiHulud.pv -= pv.harkonnenBombe;
        stateBattle.bombeHarkonnenOnField--;
        fillRemoveBombeArray();
      } else if (enemy.type === "bombeHarkonnenVehicule"){
        bombeVehiculeHarkonnenTot = enemyTot;
        shaiHulud.pv -= pv.vehiculeHarkonnenBombe;
        console.log("bombe b=vehicule",stateBattle.bombeVehiculeHarkonnenOnField )
        stateBattle.bombeVehiculeHarkonnenOnField--;
        console.log("bombe b=vehicule",stateBattle.bombeVehiculeHarkonnenOnField )
        fillRemoveBombeArray();
      }

      switch (true) {
        case lvl <= 5:
              // On a que des Harkonnens
              if(harkoArray.length === 0){
                lvlEnd = true;
              }
      console.log('>>>>>>>>>>>>>>>>>>>>> LVL END NOW')
              
              break;
        
            case lvl <= 10:
              // On a Sardokar, Harkonnen, Usine
              console.log("harrkengt",harkoArray.length)
              console.log("sardaukarArrayengt",sardaukarArray.length)

              if(harkoArray.length === 0 && sardaukarArray.length === 0){ // les usines ne sont pas des enemies pas besoin de les détruires pour finir le niveau
                lvlEnd = true;
              }
      console.log('>>>>>>>>>>>>>>>>>>>>> LVL END NOW')

              break;
        
            case lvl <= 20:
              // On a Sardokar, Harkonnen, Usine, vehicule
              if(harkoArray.length === 0 && sardaukarArray.length === 0 && vehiculeHarkonnenArray.length === 0){ // les usines ne sont pas des enemies pas besoin de les détruires pour finir le niveau
                lvlEnd = true;
              }
      console.log('>>>>>>>>>>>>>>>>>>>>> LVL END NOW')

              break;
        
            case lvl <= 100:
              // On a Sardokar, Harkonnen, Usine, vehicule
              if(harkoArray.length === 0 && sardaukarArray.length === 0 && vehiculeHarkonnenArray.length === 0){ // les usines ne sont pas des enemies pas besoin de les détruires pour finir le niveau
                lvlEnd = true;
              }
      console.log('>>>>>>>>>>>>>>>>>>>>> LVL END NOW')

              break;
              
        default:
          console.log('>>>>>>>>>>>>>>>>>>>>> Default in switch')

          break;
      }
    } 
    

    // // On incremente le nombre de mort en fonction de l'enemi, on augmente les pvs de shai Hulud on enleve le mort de l'array de l'objet
    // if (enemy.type === "harkonnen") {
    //   stateBattle.harkonnenMort++;
    //   if (shaiHulud.pv < 100) {
    //     shaiHulud.pv += pv.harkonnenEat;
    //   }
    // }  else if (enemy.type === "usine") {
    //   objReboot.objArrayTroupesReboot.usines.splice(0, 1);
    //   if (objReboot.objArrayTroupesReboot.usines.length > limitationEcran.usineMax) {
    //       objReboot.allOfProtagonistArrayReboot.push(objReboot.objArrayTroupesReboot.usines[0]);
    //     // allOfProtagonistArray.push( new Protagonniste(400, 300,20,20,1,'green','sardaukar'));
    //   }
    //   stateBattle.usineMort++;
    // } else if (enemy.type === "vehiculeHarkonnen") {
    //   objReboot.objArrayTroupesReboot.vehiculeHarkonnens.splice(0, 1); //On vire un sardaukar au hasard position 0 car ils ne sont pas visible sur l'écran
    //   if (
    //       objReboot.objArrayTroupesReboot.vehiculeHarkonnens.length >
    //     limitationEcran.vehiculeHarkonnenMax
    //   ) {
    //       objReboot.allOfProtagonistArrayReboot.push(objReboot.objArrayTroupesReboot.vehiculeHarkonnens[0]);
    //     // allOfProtagonistArray.push( new Protagonniste(400, 300,20,20,1,'green','sardaukar'));
    //   }
    //   stateBattle.vehiculeHarkonnenMort++;
    // }
    //}, 0)
  }
});
}

function distanceRemoveSardaukarsTouched() {
  //POur tous sauf sardaukars
  sardaukarArray.forEach((enemy, index) => {

  const distBetweenShaiHuludandEnemy = Math.hypot(
    (shaiHulud.x+shaiHulud.width/2) - (enemy.x+enemy.width/2), //on place notre repère au centre de shai hulud et de l'enemi
    (shaiHulud.y+shaiHulud.height/2) - (enemy.y+enemy.height/2)
  ); // On evalue la distance entre les deux objets
  // const distBetweenShaiHuludandEnemy = Math.hypot(shaiHulud.x - 5, shaiHulud.y - 5);
  // On enleve l'enemei seulement si shaiHulud arrive à la moitié de son rayon pour donner l'impression d'absorption et non pas de simple contact
  if (
    distBetweenShaiHuludandEnemy - shaiHulud.radius / 2 - enemy.height / 2 < 1
  ) {
    // projection de particule quand on mange un mec
    for (let i = 0; i < enemy.width; i++) {
      // enemy.width = nb de particle à chaque pour un hit proportionnel à la taille de ce que l'on mange donc
      particles.push(
        new ParticleFading(enemy.x+enemy.width/2, enemy.y+enemy.height/2, Math.random() * (3 - 2) + 2, enemy.color, {
          x: Math.random() - 0.5,
          y: -Math.random(),
        })
      );
    }
    console.log("sar",sardaukarArray)
    sardaukarArray.splice(index, 1); // Si on touche un enemi l'enleve de l'array regroupant tout le monde (plus rapide de faire avec l'index que d'utiliser filter ici)
    console.log("sar",sardaukarArray)
    
    stateBattle.sardaukarMort ++;
    if (shaiHulud.pv < 100) {
      shaiHulud.pv += pv.sardaukarEat;
    }
    switch (true) {
      case lvl <= 5:
            // On a que des Harkonnens
            if(harkoArray.length === 0){
              lvlEnd = true;
            }
    console.log('>>>>>>>>>>>>>>>>>>>>> LVL END NOW')
            
            break;
      
          case lvl <= 10:
            // On a Sardokar, Harkonnen, Usine
            console.log("harrkengt",harkoArray.length)
            console.log("sardaukarArrayengt",sardaukarArray.length)

            if(harkoArray.length === 0 && sardaukarArray.length === 0){ // les usines ne sont pas des enemies pas besoin de les détruires pour finir le niveau
              lvlEnd = true;
            }
    console.log('>>>>>>>>>>>>>>>>>>>>> LVL END NOW')

            break;
      
          case lvl <= 20:
            // On a Sardokar, Harkonnen, Usine, vehicule
            if(harkoArray.length === 0 && sardaukarArray.length === 0 && vehiculeHarkonnenArray.length === 0){ // les usines ne sont pas des enemies pas besoin de les détruires pour finir le niveau
              lvlEnd = true;
            }
    console.log('>>>>>>>>>>>>>>>>>>>>> LVL END NOW')

            break;
      
          case lvl <= 100:
            // On a Sardokar, Harkonnen, Usine, vehicule
            if(harkoArray.length === 0 && sardaukarArray.length === 0 && vehiculeHarkonnenArray.length === 0){ // les usines ne sont pas des enemies pas besoin de les détruires pour finir le niveau
              lvlEnd = true;
            }
    console.log('>>>>>>>>>>>>>>>>>>>>> LVL END NOW')

            break;
            
      default:
        console.log('>>>>>>>>>>>>>>>>>>>>> Default in switch')

        break;
    }
  }
});
}



/****************************** gestion des interactions *********************************/
// function distanceRemoveProtagonisteTouched() {
//     //POur tous sauf sardaukars
//     harkoArray.forEach((enemy, index) => {

//     const distBetweenShaiHuludandEnemy = Math.hypot(
//       (shaiHulud.x+shaiHulud.width/2) - (enemy.x+enemy.width/2), //on place notre repère au centre de shai hulud et de l'enemi
//       (shaiHulud.y+shaiHulud.height/2) - (enemy.y+enemy.height/2)
//     ); // On evalue la distance entre les deux objets
//     // const distBetweenShaiHuludandEnemy = Math.hypot(shaiHulud.x - 5, shaiHulud.y - 5);
//     // On enleve l'enemei seulement si shaiHulud arrive à la moitié de son rayon pour donner l'impression d'absorption et non pas de simple contact
//     if (
//       distBetweenShaiHuludandEnemy - shaiHulud.radius / 2 - enemy.height / 2 < 1
//     ) {
//       // projection de particule quand on mange un mec
//       for (let i = 0; i < enemy.width; i++) {
//         // enemy.width = nb de particle à chaque pour un hit proportionnel à la taille de ce que l'on mange donc
//         particles.push(
//           new ParticleFading(enemy.x+enemy.width/2, enemy.y+enemy.height/2, Math.random() * (3 - 2) + 2, enemy.color, {
//             x: Math.random() - 0.5,
//             y: -Math.random(),
//           })
//         );
//       }
      
//       //setTimeout(() => {                                                      // Permet de se débarrasser de l'effet flash post enlevement (maybe not useful)
//       let idToRemove = harkoArray[index]._id;
//       harkoArray.splice(index, 1); // Si on touche un enemi l'enleve de l'array regroupant tout le monde (plus rapide de faire avec l'index que d'utiliser filter ici)
      
//       harkoTot = harkoTot.filter(el => idToRemove !== el._id) //on renvoie un tableau contenant tout les persos avec un id different de celui a remove.
//       // console.log("New harko after eat")
//       // console.log(harkoArray)
//       // console.log("harkoTot",harkoTot)

//       // console.log("-------- HarkoTot")
//       // harkoTot.forEach(el => console.log(el._id))
//       // console.log("-------- HarkoArray")
//       // harkoArray.forEach(el => console.log(el._id))

//       if(harkoTot.length >= 1){

//           harkoArray.push(harkoTot[0]); //On ajoute un harkonnen du total vers l'array
//           // console.log("add one with id", harkoTot[0]._id)
//           harkoTot.splice(0,1); //On enleve l'harkonnen quel'on vient d'ajouter de tot

//       } else if(harkoArray.length >= 1 && harkoTot.length === 0 ){

//         // console.log('>>>>>>>>>>>>>>>>>>>>> enleve que les arrayharko')

//       } else if(harkoArray.length === 0 && harkoTot.length === 0 ){ //on a fini le niveau

//         console.log('>>>>>>>>>>>>>>>>>>>>> LVL END NOW')
//         lvlEnd = true;

//       } 
      

//       // On incremente le nombre de mort en fonction de l'enemi, on augmente les pvs de shai Hulud on enleve le mort de l'array de l'objet
//       if (enemy.type === "harkonnen") {
//         // objReboot.objArrayTroupesReboot.harkonnens.splice(0, 1); //On vire un harkonnen au hasard position 0 car ils ne sont pas visible sur l'écran
//         // if (objReboot.objArrayTroupesReboot.harkonnens.length > limitationEcran.harkonnenMax) {
//         //   // on ajoute un nouveau harkonnnen suelement si on en a encore en stock dans l'array de l'objet (limite de 30)
//         //   objReboot.allOfProtagonistArrayReboot.push(objReboot.objArrayTroupesReboot.harkonnens[0]);
//         //   // allOfProtagonistArray.push( new Protagonniste(300, 300,20,20,1,'red','harkonnen'));
//         // }
//         stateBattle.harkonnenMort++;
//         if (shaiHulud.pv < 100) {
//           shaiHulud.pv += pv.harkonnenEat;
//         }
//       }  else if (enemy.type === "usine") {
//         objReboot.objArrayTroupesReboot.usines.splice(0, 1); //On vire un sardaukar au hasard position 0 car ils ne sont pas visible sur l'écran
//         if (objReboot.objArrayTroupesReboot.usines.length > limitationEcran.usineMax) {
//             objReboot.allOfProtagonistArrayReboot.push(objReboot.objArrayTroupesReboot.usines[0]);
//           // allOfProtagonistArray.push( new Protagonniste(400, 300,20,20,1,'green','sardaukar'));
//         }
//         stateBattle.usineMort++;
//       } else if (enemy.type === "vehiculeHarkonnen") {
//         objReboot.objArrayTroupesReboot.vehiculeHarkonnens.splice(0, 1); //On vire un sardaukar au hasard position 0 car ils ne sont pas visible sur l'écran
//         if (
//             objReboot.objArrayTroupesReboot.vehiculeHarkonnens.length >
//           limitationEcran.vehiculeHarkonnenMax
//         ) {
//             objReboot.allOfProtagonistArrayReboot.push(objReboot.objArrayTroupesReboot.vehiculeHarkonnens[0]);
//           // allOfProtagonistArray.push( new Protagonniste(400, 300,20,20,1,'green','sardaukar'));
//         }
//         stateBattle.vehiculeHarkonnenMort++;
//       }
//       //}, 0)
//     }
//   });
// // Cas sardaukars
// //   sardaukarLegion.forEach((enemy, index) => {
// //     const distBetweenShaiHuludandEnemy = Math.hypot(
// //         shaiHulud.x - enemy.x,
// //         shaiHulud.y - enemy.y
// //       ); // On evalue la distance entre les deux objets
// //       // const distBetweenShaiHuludandEnemy = Math.hypot(shaiHulud.x - 5, shaiHulud.y - 5);
// //       // On enleve l'enemei seulement si shaiHulud arrive à la moitié de son rayon pour donner l'impression d'absorption et non pas de simple contact
// //       if ( distBetweenShaiHuludandEnemy - shaiHulud.radius / 2 - enemy.width / 3 < 1) {
// //         // projection de particule quand on mange un mec
// //         for (let i = 0; i < enemy.width; i++) {
// //           // enemy.width = nb de particle à chaque pour un hit proportionnel à la taille de ce que l'on mange donc
// //           particles.push(
// //             new ParticleFading(enemy.x, enemy.y, 3, enemy.color, {
// //               x: Math.random() - 0.5,
// //               y: -Math.random(),
// //             })
// //           );
// //         }
  
// //         //setTimeout(() => {                                                      // Permet de se débarrasser de l'effet flash post enlevement (maybe not useful)
// //         sardaukarLegion.splice(index, 1); // Si on touche un enemi l'enleve de l'array regroupant tout le monde

// //         // On incremente le nombre de mort en fonction de l'enemi, on augmente les pvs de shai Hulud on enleve le mort de l'array de l'objet
       
        
// //         // if (objLvlState.nbSardaukar > limitationEcran.sardaukarMax && a !== 0) {
// //         // arraySardaukarParachute.push(objetArrayTroupes.sardaukars[0]); // ne marche pas car c'est le meme que j'ai coupé avant la limite dans la creation
// //         // a --;
// //         // // allOfProtagonistArray.push( new Protagonniste(400, 300,20,20,1,'green','sardaukar'));
// //         // }
// //         stateBattle.sardaukarMort++;
// //         // Si la somme des points de vie de Shai Hulud + ceux qui vont être assigné sont inférieure au point de vie max on les ajoute sinon on remplit jusqua 100 on ne dépasse pas la limite
// //         shaiHulud.pv + pv.sardaukarEat < 100
// //         ? (shaiHulud.pv += pv.sardaukarEat)
// //         : (shaiHulud.pv = 100);
        
        
// //         //}, 0)
// //       }
// //   });


// }






// console.log(objetArrayTroupes)
/*******************Drawing function*******************/

//Fonction dessinnant tous les perso de l'array allOfProtagonist
function drawEnnemies(enemiesArray) {
    // On parcours le grand array et on anime les protagonnistes un à un
    enemiesArray.forEach((enemy) => {
      enemy.draw();
      enemy.move();
    });
  }

function drawBomb(bombArray) {
  bombArray.forEach((bombe) => {
      bombe.draw();
    });
  }

function drawBombHarkonnenVehicule(bombArray) {
    bombArray.forEach((bombe) => {
      bombe.move();
    });
  }

function drawVaisseau (){
    vaisseauxSardaukar.draw();
    vaisseauxSardaukar.move();
}

// Ligne du sable
function sandLineDraw() {
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.lineTo(1700, 500);
    ctx.strokeStyle = "#e9c46a";
    ctx.stroke();
  }
  
  //function pour dessiner le cercle au fur et à mesure
function drawSpriteHulud() {
      ctx.drawImage(shaiHuludId, shaiHulud.width * shaiHulud.frameX, shaiHulud.height * shaiHulud.frameY, shaiHulud.width, shaiHulud.height, shaiHulud.x, shaiHulud.y, shaiHulud.width , shaiHulud.height);
  }

function particleProjection(){
    particles.forEach((particle, index) => {
        //Partie test pour particle qui fade
        if (particle.alpha <= 0) {
          particles.splice(index, 1);
        } else {
          particle.move();
        }
      });
  }

// Déplacement de Shai Hulud
window.addEventListener(
    "keydown",
    function (event) {
      if (event.key == "ArrowDown" && shaiHulud.y < canvas.height - shaiHulud.height) {
        //event.key == "ArrowDown" && event.key == "ArrowLeft" ne marche pas trouver une solution
        shaiHulud.y += shaiHulud.speed; // c'est plus parce que l'origine du graph est en haut à gauche
        shaiHulud.frameX = 1;
        shaiHulud.frameY = 1;
      } else if (event.key == "ArrowUp" && shaiHulud.y > objGeneral.feetPosition -10) {
        // Faire quelque chose pour la touche "up arrow" pressée.
        shaiHulud.y -= shaiHulud.speed;
        shaiHulud.frameX = 0;
        shaiHulud.frameY = 1;
      } else if (event.key == "ArrowLeft" && shaiHulud.x > 0) {
        // Faire quelque chose pour la touche "ArrowLeft" pressée.
        shaiHulud.x -= shaiHulud.speed;
        shaiHulud.frameX = 0;
        shaiHulud.frameY = 0;
      } else if (event.key == "ArrowRight" && shaiHulud.x < canvas.width - shaiHulud.width) {
        // Faire quelque chose pour la touche "ArrowRight" pressée.
        shaiHulud.x += shaiHulud.speed;
        shaiHulud.frameX = 1;
        shaiHulud.frameY = 0;
      }
  
      event.preventDefault();  
      //from here was removed the code keydown below (bottom of page)
    },
    true
  );




function animate(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.drawImage(backgrounbId, 0, 0, canvas.width, canvas.height)
    // ctx.rect(882, 0, 10, 10);
    // ctx.fill()
    // ctx.rect(149, 0, 10, 10);
    // ctx.fill()
    drawSpriteHulud();
    
    drawEnnemies(usineArray);




  /*****************Gestion des bombes */
  // fillRemoveBombeArray();

   if(bombeHarkonnenArray.length !== 0){
    drawBomb(bombeHarkonnenArray);
    } 
    if(bombeSardaukarArray.length !== 0){
      drawBomb(bombeSardaukarArray);
    }
    if (bombeVehiculeHarkonnenArray.length !== 0){
      drawBombHarkonnenVehicule(bombeVehiculeHarkonnenArray);
    }
    drawEnnemies(harkoArray);
    drawEnnemies(vehiculeHarkonnenArray);
    drawEnnemies(sardaukarArray);

        // drawVaisseau();
    parachuteSardaukar(); //doit etre appelé dansle calcul des distances
    // distanceRemoveProtagonisteTouched(harkoArray,harkoTot);
    distanceRemoveProtagonisteTouched(harkoArray,harkoTot);
    distanceRemoveProtagonisteTouched(usineArray,usineArrayTot);
    distanceRemoveProtagonisteTouched(vehiculeHarkonnenArray,vehiculeHarkonnenArrayTot);
    distanceRemoveSardaukarsTouched();
    distanceRemoveProtagonisteTouched(bombeHarkonnenArray,bombeHarkonnenTot);
    distanceRemoveProtagonisteTouched(bombeSardaukarArray,bombeSardaukarTot);
    distanceRemoveProtagonisteTouched(bombeVehiculeHarkonnenArray,bombeVehiculeHarkonnenTot);


    // distanceRemoveProtagonisteTouched(harkoArray,harkoTot);
    particleProjection();    
    updateHTML();
    gameOver();

    if(lvlEnd){
        lvlEnd = !lvlEnd;
        console.log(lvl);
        lvl++;
        console.log('newlvl', lvl)
        start(lvl);
        animate;
    }
    
    requestAnimationFrame(animate);
}

animate();