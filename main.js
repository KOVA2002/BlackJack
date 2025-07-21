// utils
function arraySum(seq) {
    const seq_sum = seq.reduce((acc, val) => acc + val, 0);
    return seq_sum;
}

function getRandomElement(seq) {
    const randomIndex = Math.floor(Math.random() * seq.length);
    const randomElement = seq[randomIndex];
    return randomElement;
}

function getCardValue(argS){
    argS = argS.replace(/[JQKA♥♦♣♠]/g, (match) => {
        const replacements = {
            'J': '10',
            'Q': '10',
            'K': '10',
            'A': '11',
            '♥': '',
            '♦': '',
            '♣': '',
            '♠': ''
        };
        return replacements[match];
    });
    argS = +argS;
    return argS;
}

function cardsSum(cards){

    let values = cards.map(x => getCardValue(x));
    let sum = arraySum(values);

    // reduce the value of aces if the sum goes over
    if(sum > 21 && values.includes(11)){
        values = values.map(x => x === 11 ? 1 : x);
    };
    sum = arraySum(values);
    
    return sum;
}

// accessors to html elements
const elements = {
    btnYes: document.querySelector('#yes'),
    btnNo: document.querySelector('#no'),
    divUserCards: document.getElementById("uCardsDiv"),
    divCompCards: document.getElementById("cCardsDiv"),
    paraInfo: document.getElementById("paraInfo"),
    paraUserCardsTitle: document.getElementById("uCardsTitle"),
    paraUserCardsSum: document.getElementById("uCardsSum"),
    paraCompCardsTitle: document.getElementById("cCardsTitle"),
    paraCompCardsSum: document.getElementById("cCardsSum"),
    paraMain: document.getElementById("paraMain")
    };

// auxiliary variables
const deck = ['2♥', '3♥', '4♥', '5♥', '6♥', '7♥', '8♥', '9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥',
    '2♦', '3♦', '4♦', '5♦', '6♦', '7♦', '8♦', '9♦', '10♦', 'J♦', 'Q♦', 'K♦', 'A♦',
    '2♣', '3♣', '4♣', '5♣', '6♣', '7♣', '8♣', '9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣',
    '2♠', '3♠', '4♠', '5♠', '6♠', '7♠', '8♠', '9♠', '10♠', 'J♠', 'Q♠', 'K♠', 'A♠'];

const locals = {     
    userCards: [getRandomElement(deck), getRandomElement(deck)],
    compCards: [getRandomElement(deck), getRandomElement(deck)],
    get userSum() {
        return cardsSum(this.userCards);
    },
    get compSum() {
        return cardsSum(this.compCards);
    }
};

// game functions
function updateTextContent(elements, message, userCardsTitle, userS, compCardsTitle, compS, mainText){
    
    elements.paraInfo.textContent = message;
    elements.paraUserCardsTitle.textContent = userCardsTitle;
    elements.paraUserCardsSum.textContent = userS;
    elements.paraCompCardsTitle.textContent = compCardsTitle;
    elements.paraCompCardsSum.textContent = compS;
    elements.paraMain.textContent = mainText;
    }

function updateCardImages(cards, div){

    // empty the div
    div.innerHTML = "";
    
    // fill in the div
    for (const card of cards){
        let rank = card.slice(0, -1);
        let suit = card.slice(-1);

        rank = rank.replace(/[JQKA]/g, (match) => {
            const replacements = {
                'J': 'jack',
                'Q': 'queen',
                'K': 'king',
                'A': 'ace',
            };
            return replacements[match];
        });

        suit = suit.replace(/[♥♦♣♠]/g, (match) => {
            const replacements = {
                '♥': 'hearts',
                '♦': 'diamonds',
                '♣': 'clubs',
                '♠': 'spades'
            };
            return replacements[match];
        });

        const imgElement = document.createElement('img');
        imgElement.src = `images/English_pattern_${rank}_of_${suit}.svg.png`;
        imgElement.alt = 'card';
        imgElement.width = 60; // You can set the width or other properties if needed
        // Append the img element to the div
        div.appendChild(imgElement);
    }
}

function finalize(elements, locals, message){

    // update textual fields
    updateTextContent(
        elements,
        message, 
        "Your cards:", 
        `Your final hand: ${locals.userSum}`, 
        "Computer's cards:", 
        `Computer's final hand: ${locals.compSum}\n`, 
        "Do you want to play again?");
    // update card images
    updateCardImages(locals.userCards, elements.divUserCards);
    updateCardImages(locals.compCards, elements.divCompCards);
    // reset data for the next probable game(if the user clicks 'yes' later)
    elements.paraMain.setAttribute('class', 'game-begin');
    locals.userCards.length = 0;
    locals.compCards.length = 0;
    locals.userCards.push(getRandomElement(deck), getRandomElement(deck));
    locals.compCards.push(getRandomElement(deck), getRandomElement(deck));
}

function askAboutAnotherCard(elements, locals){

    // update textual fields
    updateTextContent(
        elements,
        "", 
        "Your cards:", 
        `Your points: ${locals.userSum}`, 
        "Computer's first card:", 
        "",
        "Do you want to get another card?");
    // update card images
    updateCardImages(locals.userCards, elements.divUserCards);
    updateCardImages(locals.compCards.slice(0, 1), elements.divCompCards);
    // change turn
    elements.paraMain.setAttribute('class', 'users-turn');
}

// event handlers

elements.btnYes.addEventListener('click', ()=>{
    
    let userSum = locals.userSum;
    let compSum = locals.compSum;
    
    if (compSum === 21 || userSum === 21){

        // check blackjack
        let msg = "";
        if (compSum === 21){
            msg = "The computer won. It's got blackjack.";
        } else if(userSum === 21){
            msg = "Congrats! You won with blackjack!";
        }
        finalize(elements, locals, msg);
    }
    else if (elements.paraMain.getAttribute('class') === "game-begin"){
        // Clean up the images
        elements.divUserCards.innerHTML = '';
        elements.divCompCards.innerHTML = '';
        //
        askAboutAnotherCard(elements, locals);
    }
    else if (elements.paraMain.getAttribute('class') === "users-turn"){

        locals.userCards.push(getRandomElement(deck));
        userSum = (locals.userSum);
        if(userSum > 21){
            finalize(elements, locals, "The computer won. You went over...");
        }
        else {
            askAboutAnotherCard(elements, locals);
        }
    }
})

elements.btnNo.addEventListener("click", ()=>{

    if(['game-begin', 'shut-down'].includes(elements.paraMain.getAttribute('class'))){

        // Add farewell message and reset other textual fields
        updateTextContent(elements, "", "", "", "", "", "Bye! Have a great time!")
        // Clean up card images
        elements.divUserCards.innerHTML = '';
        elements.divCompCards.innerHTML = '';
        // change mode
        elements.paraMain.setAttribute('class', 'shut-down');

    }
    else if (elements.paraMain.getAttribute('class') === 'users-turn'){
        
        let userSum = locals.userSum;
        let compSum = locals.compSum;
        while (compSum < 18){
            locals.compCards.push(getRandomElement(deck));
            compSum = locals.compSum;
        }
        let msg = "";
        if (compSum > 21){
            msg = "You won! The opponent went over.";
        }else if (compSum >= userSum){
            msg = "You lost.";
        }else {
            msg = "You won!";
        }
        finalize(elements, locals, msg);
    }
})
