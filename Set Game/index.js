console.log('Game of set!')

/**
 * @typedef {object} Card
 * @property {number} shapeCount
 * @property {'diamond' | 'wave' | 'oval'} shape
 * @property {'red' | 'green' | 'blue'} color
 * @property {'solid' | 'shade' | 'hollow'} shading
 */

var cardTriplet=[];
var cardList=[];
var game_stop=true;
var point=0;

const SHAPE_COUNTS = [1, 2, 3]
const SHAPES = ['diamond', 'wave', 'oval']
const COLORS = ['red', 'green', 'blue']
const SHADINGS = ['solid', 'shade', 'hollow']

const DECK = (() => {
    /** @type {Card[]} */
    const deck = []

    for (const shapeCount of SHAPE_COUNTS)
        for (const shape of SHAPES)
            for (const color of COLORS)
                for (const shading of SHADINGS)
                    deck.push({
                        shapeCount,
                        shape,
                        color,
                        shading
                    })

    return deck
})()

const Card = {
    /** Id of card for comparison */
    id(card) {
        return `${card.shapeCount}-${card.color}-${card.shape}-${card.shading}`
    },

    /**
     * Parse a string id back into a card object.
     *
     * @param {string} id
     * @return {Card} 
     */
    parse(id) {
        const [shapeCount, color, shape, shading] = id.split('-');

        return {
            shapeCount: Number(shapeCount),
            color,
            shape,
            shading,
        }
    },

    /**
     * @param {Card} a 
     * @param {Card} b 
     */
    equal(a, b) {
        return Card.id(a) === Card.id(b);
    },

    /** @param {Card} card */
    url(card) {
        var myloc = window.location.href;
        myloc = myloc.split("/");
        myloc.pop();
        myloc = myloc.join("/");
        console.log(myloc)
        return `${myloc}/card/${card.shapeCount}-${card.color}-${card.shape}-${card.shading}.jpg`
    },

    /** 
     * Create an HTML element to display the card.
     *
     * @param {Card} card
     */
    createElement(card) {
        const id = Card.id(card);
        const div = document.createElement('div');

        const img = document.createElement('img');

        img.src = Card.url(card);
        img.alt = id;

        div.appendChild(img);
        div.classList.add('card');

        div.onclick = Card.onClickHandler(id, div);

        return div;
    },


    onClickHandler: (id, div) => () => {
        if(game_stop){
        console.log('Clicked ', id);

        //wasSelected - id already selected now deselect it.
        const wasSelected = gameState.cardsSelected.has(id);

        if (wasSelected) {
            div.classList.remove('card-selected');
            gameState.cardsSelected.delete(id);
        } else if (gameState.cardsSelected.size < 3) {
            div.classList.add('card-selected');
            gameState.cardsSelected.add(id);
        }

        // Handle set selected

        //console.log("In click handler: cardSelected size is ", gameState.cardsSelected.size);
        if (gameState.cardsSelected.size === 3) {
            const cardSelection = Array.from(gameState.cardsSelected);
            const isSet = Card.isSet(cardSelection.map(Card.parse));

            console.log('Is set?: ', isSet);

            unselectAllCards();

            if (isSet) {
                incSetsFound();

                //add more time for scoring 
                gameState.time += 15;

                scoreSum();


                //Game over

                if (gameState.deck.length < 3) {
                    //document.getElementById('error-msg').textContent = 'Game over! (No more cards left)';
                    gameOver();
                    return;
                }


                for (const selectedCardId of cardSelection) {
                    const selectedCard = Card.parse(selectedCardId);
                    const indexInTable = gameState.cardTable.findIndex((card) => Card.equal(card, selectedCard));
                    
                    if (indexInTable < 0) {
                        throw new Error('Card not in table?')
                    }

                    gameState.cardTable[indexInTable] = drawCards(1)[0];

                    console.log('Replacing card ', Card.id(selectedCard), ' with ', Card.id(gameState.cardTable[indexInTable]));
                }

                //check if has no set, if so add 3 more cards.
                checkTable();

                commitTable();
            } else {
                document.getElementById('error-msg').textContent = 'Not a set!';
            }
        }
    }
},

    /** Not used currently
     * 
     * @param 
     * @returns 
     */
    addCards(cardList,Deck){
        let cardListLength=cardList.length;
        if(findSet==false){
            for(i=0;i<3;i++){
                let left=Deck.length;
                let random=Math.random()*left;
                cardList.push(Deck[random]);
                Deck.splice(random);
            }
        }
    },

    /**
     * @param {[Card, Card, Card]} cardTriplet 
     */
    isSet(cardTriplet) {
        const colors = {
            red: 1,
            green: 2,
            blue: 3
        }
        const shading = {
            solid: 1,
            shade: 2,
            hollow: 3
        }
        const shape = {
            diamond: 1,
            wave: 2,
            oval: 3,
        }

        let colorsSum = 0;
        let shadingSum = 0;
        let shapeSum = 0;
        let shapeCountSum = 0;

        for (const card of cardTriplet) {
            colorsSum += colors[card.color];
            shadingSum += shading[card.shading];
            shapeSum += shape[card.shape];
            shapeCountSum += card.shapeCount;
        }

        return colorsSum % 3 === 0
            && shadingSum % 3 === 0
            && shapeSum % 3 === 0
            && shapeCountSum % 3 === 0;
    },

    /**
     * @param {ReadonlyArray<Card>} cardList 
     * @returns {boolean} there exists Card set {c1, c2, c3} in cardList
     */
    hasSet(cardList) {
        // We know that it's mathematically impossible for a card list to not have a
        // set if it's larger than 21.
        if (cardList.length >= 21) return true;

        //card triplet array
        let cards = [];

        for(i=0;i<cardList.length;i++){
            cards.push(cardList[i]);
            for(j=i+1;j<cardList.length;j++){
                cards.push(cardList[j]);
                for(k=j+1;k<cardList.length;k++){
                    cards.push(cardList[k]);

                    if(Card.isSet(cards)){
                        return true;
                    }

                    cards.pop();
                }
                cards.pop();
            }
            cards.pop();
        }
        // checked every possible combination
        return false;
    }
}

// if Table has no sets add 3 more cards.
function checkTable(){
    let setExists = Card.hasSet(gameState.cardTable);

    if(!setExists){
        if(gameState.deck.length >= 3){
            // add 3 more cards. 
            gameState.cols++;
            let cards = drawCards(3);
            gameState.cardTable.push(cards[0], cards[1], cards[2]);
            
            commitTable();
        }else{
            //Game over, deck empty, no sets.
            gameOver();
        }
        
    }
}

//event handler for hint button click
function hint(event){

    let setExists = Card.hasSet(gameState.cardTable);
    console.log("Hint handler -Does table of cards have set? ", setExists);

    let cards = [];

    //search for set
    //console.log("Hint handler -Searching for set");

    //penalty for hint button
    point -= 0.5;
    document.getElementById('s').innerHTML=point;

    for(i=0;i<gameState.cardTable.length;i++){
        cards.push(gameState.cardTable[i]);
        for(j=i+1;j<gameState.cardTable.length;j++){
            cards.push(gameState.cardTable[j]);
            for(k=j+1;k<gameState.cardTable.length;k++){
                cards.push(gameState.cardTable[k]);
                if(Card.isSet(cards)){
                    //length two hint selection
                    console.log("Hint handler -set found card1:", Card.id(cards[0]), " card2: ", Card.id(cards[1]), " card3: ", Card.id(cards[2]));

                    //first unselect all
                    unselectAllCards();

                    //select two out of three in the set found
                    for (const [id, el] of gameState.cardMap) {
                        if(id == Card.id(cards[0]) || id == Card.id(cards[1])){
                            el.classList.add('card-selected');
                        }
                    }
                    //add to gamestate selections ID two of three of existing set.
                    gameState.cardsSelected.add(Card.id(cards[0]));
                    gameState.cardsSelected.add(Card.id(cards[1]));
                    //cards[2] is last one needed to select for set.

                    
                    //commitTable();

                    // break out of hint handler function after first set found.
                    return;
                    
                }
                cards.pop();
            }
            cards.pop();
        }
        cards.pop();
    }

    //return cardTriplet;
}



const randomizeDeck = (deck) => {
    return deck
        .map((card) => ({ card, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map((pair) => pair.card);
}

const gameState = {
    /** @type {Card[]} */
    deck: randomizeDeck(DECK),
    started: false,
    setsFound: -1,

    //Columns to add more if cards added
    cols: 4,

    //Time to have global time variable
    time: 60,

    //Bot interval time to find set
    interval: 20,
    
    /** @type {Set<string>} */
    cardsSelected: new Set(),

    /** @type {Card[]} */
    cardTable: [],

    /** @type {Map<string, HTMLDivElement>} */
    cardMap: new Map()
}

globalThis.gameState = gameState;

incSetsFound();// -1 -> 0

gameState.cardTable = drawCards(12);


// TODO:
// 1. Setup card-table
// 2. Start game

function incSetsFound() {
    ++gameState.setsFound;

    document.getElementById('sets-found').textContent = `${gameState.setsFound}`;
}

/**
 * Draw a select number of cards out of the deck.
 * @param {number} n 
 * @return {Array<Card>}
 */
function drawCards(n) {
    if (gameState.deck.length < n) {
        throw new Error('Not enough cards in deck');
    }

    const cards = gameState.deck.splice(0, n);

    document.getElementById('cards-in-deck').textContent = `${gameState.deck.length}`;

    return cards;
}

//moved to gameState
//var time=60;
var id=setInterval(countdown,1000);

//Bot interval timer 
var id2=setInterval(activateBot, gameState.interval*1000);

function countdown(){
    gameState.time--;

    var timeRemain=document.getElementById('Timer');


    Timer.innerHTML=gameState.time;

    if(gameState.time==-1){
        //alert("Game over and Your score is "+ document.getElementById('s').innerHTML);
        gameState.time=0;
        clearInterval(id);
        clearInterval(id2);
        gameOver();
    }

}



function activateBot(){
    let cards = []; //Card triplet array

    //find set remove, add score to sBot
    for(i=0;i<gameState.cardTable.length;i++){
        cards.push(gameState.cardTable[i]);
        for(j=i+1;j<gameState.cardTable.length;j++){
            cards.push(gameState.cardTable[j]);
            for(k=j+1;k<gameState.cardTable.length;k++){
                cards.push(gameState.cardTable[k]);
                if(Card.isSet(cards)){
                    //Inside bot found set
                    //Console log
                    console.log("activateBot handler -set found card1:", Card.id(cards[0]), " card2: ", Card.id(cards[1]), " card3: ", Card.id(cards[2]));

                    //first unselect all
                    unselectAllCards();

                    //add 1 to bot score.
                    document.getElementById('sBot').innerHTML= parseInt(document.getElementById('sBot').innerHTML)+1;

                    //remove found set 
                    for (const selectedCard of cards) {
                        
                        console.log(selectedCard); //debug

                        const indexInTable = gameState.cardTable.findIndex((card) => Card.equal(card, selectedCard));
                        
                        if (indexInTable < 0) {
                            throw new Error('Card not in table?')
                        }
                        gameState.cardTable[indexInTable] = drawCards(1)[0];
                        console.log('Replacing card ', Card.id(selectedCard), ' with ', Card.id(gameState.cardTable[indexInTable]));
                    }

                    //update changes
                    commitTable();
                    checkTable();

                    //increment sets found
                    incSetsFound();

                    // break out of hint handler function after first set found.
                    return;
                    
                }
                cards.pop();
            }
            cards.pop();
        }
        cards.pop();
    }

    

}

function gameOver(){
    let sBot = parseInt(document.getElementById('sBot').innerHTML);
    let s = parseInt(document.getElementById('s').innerHTML);
    if(s > sBot){
        alert("Game Over, You Win! Player score: "+ document.getElementById('s').innerHTML + " Bot score: "+ document.getElementById('sBot').innerHTML);
    }else if(sBot > s){
        alert("Game Over, You Lose! Player score: "+ document.getElementById('s').innerHTML + " Bot score: "+ document.getElementById('sBot').innerHTML);
    }else{
        alert("Game Over, Tie game! Player score: "+ document.getElementById('s').innerHTML + " Bot score: "+ document.getElementById('sBot').innerHTML);
    }
    
    game_stop=false;
}



function scoreSum(){

    point+=1;
    document.getElementById('s').innerHTML=point;
    
}


const unselectAllCards = () => {
    for (const [id, el] of gameState.cardMap) {
        el.classList.remove('card-selected');
    }

    gameState.cardsSelected.clear();
}

const commitTable = () => {
    

    const tableEl = document.getElementById('card-table');

    tableEl.innerHTML = '';

    //in normal game of set, 3 rows with adding on columns of 3 cards.

    gameState.cardMap.clear();

    //console.log(gameState.cardTable);


    for (let i = 0; i < 3; i++) {
        const rowEl = document.createElement('tr');

        for (let j = 0; j < gameState.cols; j++) {
            const cellEl = document.createElement('td');
            const index = (i * gameState.cols) + j;
            const card = gameState.cardTable[index];

            const el = Card.createElement(card);

            cellEl.appendChild(el);
            rowEl.appendChild(cellEl);
            gameState.cardMap.set(Card.id(card), el);
        }

        tableEl.appendChild(rowEl);
    }
}

// add hint button handler
document.getElementById("hint").addEventListener("click", hint);

commitTable();

//do not call checkTable before commitTable or error
checkTable();