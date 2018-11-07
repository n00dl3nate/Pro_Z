const PubSub = require('../helpers/pub_sub.js');
const Player = require('./player_model.js');
const TextView = require('../views/text_view.js');

const Fight = function () {
  this.player = new Player;
};

Fight.prototype.roll = function(){
  return Math.floor(Math.random()*20)+1;
}


Fight.prototype.playerAttack = function (monster){
  //monster declaration
  const monsterName = monster.name;
  const monsterAttack = monster.attack;

  //Dice Roll Values Per Attack
  const playerAtk = this.player.getAttackHtml();
  const playerRoll = this.roll() + playerAtk;
  const enemyRoll = this.roll() + monsterAttack;
  const diceUpdate = [playerRoll,enemyRoll];
  PubSub.publish('Dice:input',diceUpdate);

  //Damage for monster

  //Result declaration
  let yourResult = '';
  //Deciding attack outCome Player Attack

  if (playerRoll == enemyRoll){
    yourResult = `You attacked the ${monsterName} (${this.getMonsteHp()} HP). It parried!`;
  } else if (playerRoll < enemyRoll){
    yourResult = `You attacked the ${monsterName} (${this.getMonsteHp()} HP). You rolled [${playerRoll}] and it rolled [${enemyRoll}]. You failed to hurt it.`
  } else {
    let monsterDamage = playerRoll - enemyRoll;
    if (monsterDamage < 0){
      monsterDamage = 0;
    }
    this.updateMonsterHp(this.getMonsteHp() - monsterDamage);
    this.updateMonsterBar(this.getMonsteHp());

    if (this.getMonsteHp() < 0){
      this.updateMonsterHp(0);
    }

    yourResult = `You attacked the ${monsterName}. You rolled [${playerRoll}] and it rolled [${enemyRoll}]. It took ${monsterDamage} Damage! Monster Hp:${this.getMonsteHp()}`;
  };

  const newMonster = {
    name: monster.name,
    attack: monster.attack,
    hp: monster.hp
  }

  return yourResult;

};

Fight.prototype.monsterAttack = function (monster) {
  //monster declaration

  const monsterName = monster.name;
  const monsterAttack = monster.attack;

  //Dice Roll Values Per Attack

  const playerAtk = this.player.getAttackHtml();
  var playerRoll = this.roll() + playerAtk;
  var enemyRoll = this.roll() + monsterAttack;
  const diceUpdate = [playerRoll,enemyRoll];
  setTimeout(function(){
    PubSub.publish('Dice:input',diceUpdate);
  },2000)

  var revengeResult = '';
  var fightDamage = 0;

  if (enemyRoll == playerRoll){
    revengeResult = `The ${monsterName} attacked you, but you parried!`;
  } else if (enemyRoll > playerRoll){
    fightDamage = enemyRoll - playerRoll;
    if (fightDamage < 0){
      fightDamage = 0;
    }
    revengeResult = `The ${monsterName} attacked you. It rolled [${enemyRoll}] and you rolled [${playerRoll}]. You take ${fightDamage} Damage!`;
    // Update player HP
    var newPlayerHp = this.player.getHpHtml() - fightDamage;
    this.player.updateHp(newPlayerHp);

  } else {
    revengeResult = `The ${monsterName} attacked you. It rolled [${enemyRoll}] and you rolled [${playerRoll}]. It failed to hurt you physically, but emotionally you are devastated.`
  }
  //
  if (this.getMonsteHp() <= 0){
    var additional = `The ${monsterName} is dead.`;
    this.enableNavigation();
    this.clearMonster();
    var diceReset = ['...','...'];
    setTimeout(function(){
      PubSub.publish('Dice:input',diceReset);
    },2000)
    return `${revengeResult} ${additional}`;
  } else {
    if (enemyRoll == playerRoll){
      revengeResult = `The ${monsterName} (${this.getMonsteHp()} HP) attacked you, but you parried!`;
    } else if (enemyRoll > playerRoll){
      fightDamage = enemyRoll - playerRoll;
      if (fightDamage < 0){
        fightDamage = 0;
      }
      revengeResult = `The ${monsterName} (${this.getMonsteHp()} HP) attacked you. It rolled [${enemyRoll}] and you rolled [${playerRoll}]. You take ${fightDamage} Damage!`;
      // Update player HP
      var newPlayerHp = this.player.getHpHtml() - fightDamage;
      this.player.updateHp(newPlayerHp);

    } else {
      revengeResult = `The ${monsterName} (${this.getMonsteHp()} HP) attacked you. It rolled [${enemyRoll}] and you rolled [${playerRoll}]. It failed to hurt you physically, but emotionally you are devastated.`
    }
    return revengeResult;
  }
}

// Fight.prototype.startFight = function (monster) {
//
//   let newMonster = Fight.playerAttack(monster);
//
//   if (newMonster.hp > 0){
//      Fight.monsterAttack(monster)
//   };
//
//   return newMonster;
//
// }

Fight.prototype.run = function(enemy){
  const enemyName = enemy.name;
  var enemyHp = enemy.hp;
  const enemyAtk = enemy.attack;
  var runResult = '';

  if (this.roll()%2 == 0){
    runResult = `You run away from the ${enemyName}. It tries to hit you but misses.`;
  } else {
    var runDamage = Math.ceil(this.roll());
    runResult = `You ran away from the ${enemyName}. It manages to hit you for [${runDamage}] as you bravely run away.`;
    this.player.updateHp((this.player.getHpHtml() - runDamage));
  }
  return runResult;
  this.clearMonster();
};

Fight.prototype.sendMonster = function(monsterInfo){
  // PubSub.subscribe('Fight:attack-clicked',(baddie)=>{
    const attackButton = document.getElementById('nav-attack-btn').addEventListener('click',()=>{
      var yourAttack = this.playerAttack(monsterInfo);

      var theirAttack = this.monsterAttack(monsterInfo);

      this.printStuff(yourAttack,theirAttack);

      if (this.getMonsteHp() == 0){
        this.enableNavigation();
        this.removeMonsterBar();
      }
    });
  // });

  // set up run function
  // PubSub.subscribe('Fight:run-clicked',(baddie)=>{
  //   var runAway = this.run(monsterInfo);
  //   this.printStuff(runAway);
  // });
  const runButton = document.getElementById('nav-run-btn').addEventListener('click',()=>{
    var runAway = this.run(monsterInfo);
    this.printStuff(runAway);
    this.enableNavigation();
    this.removeMonsterBar();
  });
};

Fight.prototype.printStuff = function(yourInput,theirInput){
  const target = document.querySelector('div#text-display');
  target.innerHTML = "";

  yourAttack = document.createElement('p');
  yourAttack.textContent = yourInput;
  target.appendChild(yourAttack);
  this.disableFight();

  if (theirInput != ''){
    setTimeout(()=>{
      theirAttack = document.createElement('p');
      theirAttack.textContent = theirInput;
      target.appendChild(theirAttack);
      if (this.getMonsteHp() > 0){
        this.restartFight();
      }
    },2000);
  } else if (theirInput == false && this.getMonsteHp() > 0){
    // this.enableNavigation();
    this.restartFight();
  } else {
    this.enableNavigation();
    var diceReset = ['...','...'];
    setTimeout(function(){
      PubSub.publish('Dice:input',diceReset);
    },2000)
  }
};

Fight.prototype.restartFight = function(){
  // Enable the fight buttons again
  console.log('Fight Restarted');
  const attackButton = document.getElementById('nav-attack-btn');
  const defendButton = document.getElementById('nav-defend-btn');
  const runButton = document.getElementById('nav-run-btn');

  attackButton.disabled = false;
  attackButton.setAttribute('class','btn-block navigate btn btn-lg');
  defendButton.disabled = false;
  defendButton.setAttribute('class','btn-block navigate btn btn-lg');
  runButton.disabled = false;
  runButton.setAttribute('class','btn-block navigate btn btn-lg');
};

Fight.prototype.disableFight = function(){
  // Disable the fight buttons
  console.log('Fight Stopped');
  const attackButton = document.getElementById('nav-attack-btn');
  const defendButton = document.getElementById('nav-defend-btn');
  const runButton = document.getElementById('nav-run-btn');

  attackButton.disabled = true;
  attackButton.setAttribute('class','btn-disabled btn-block navigate btn btn-lg');
  defendButton.disabled = true;
  defendButton.setAttribute('class','btn-disabled btn-block navigate btn btn-lg');
  runButton.disabled = true;
  runButton.setAttribute('class','btn-disabled btn-block navigate btn btn-lg');
};

Fight.prototype.enableNavigation = function(){
  const leftNavButton = document.getElementById('nav-left-btn');
  const rightNavButton = document.getElementById('nav-right-btn');
  const forwardNavButton = document.getElementById('nav-forward-btn');
  const attackButton = document.getElementById('nav-attack-btn');
  const defendButton = document.getElementById('nav-defend-btn');
  const runButton = document.getElementById('nav-run-btn');

  leftNavButton.disabled = false;
  leftNavButton.setAttribute('class','navigate btn btn-lg btn-block');
  rightNavButton.disabled = false;
  rightNavButton.setAttribute('class','navigate btn btn-lg btn-block');
  forwardNavButton.disabled = false;
  forwardNavButton.setAttribute('class','navigate btn btn-lg btn-block');

  attackButton.disabled = true;
  attackButton.setAttribute('class','btn-disabled btn-block navigate btn btn-lg');
  defendButton.disabled = true;
  defendButton.setAttribute('class','btn-disabled btn-block navigate btn btn-lg');
  runButton.disabled = true;
  runButton.setAttribute('class','btn-disabled btn-block navigate btn btn-lg');
};

Fight.prototype.updateMonsterBar = function(){
  var healthBar = document.getElementById('enemy-hp-bar');
  var hp = this.getMonsteHp();
  if (hp < 0){
    hp = 0;
  }
  healthBar.textContent = `${hp} HP`;
  healthBar.setAttribute('style',`width:${hp}%`);
}

Fight.prototype.removeMonsterBar = function(){
  var monsterBarContainer = document.getElementById('enemybar');
  monsterBarContainer.setAttribute('class','');
  monsterBarContainer.innerHTML = "";
  // <div id="enemybar" class=""></div>
};

Fight.prototype.updateMonsterHp = function(amount){
  const monsterhtml = document.querySelector('#monsterHp')
  monsterhtml.value = amount
}

Fight.prototype.getMonsteHp = function(){
  const monsterhtml = document.querySelector('#monsterHp')
  return monsterhtml.value
}

Fight.prototype.clearMonster = function(){
  monsterImg = document.querySelector("#monsterPlacement")
  monsterImg.src = ""
}



module.exports = Fight
