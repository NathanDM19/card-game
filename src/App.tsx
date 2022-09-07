import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import cardImages, { back } from "./cards/cards";

interface Card {
  image: string;
  flipped: boolean;
  matched: boolean;
}

function App() {
  const [totalCards, setTotalCards] = useState(36);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [paused, setPaused] = useState(false);
  const [timer, setTimer]: any = useState(0);
  const [active, setActive] = useState(false);
  const [won, setWon] = useState(false);
  let intervalRef = useRef(timer);
  
  useEffect(() => placeCards(totalCards), []);

  function placeCards(cardsUsed: number) {
    clearInterval(intervalRef.current);
    setActive(false);
    setTimer(0);
    setWon(false);
    setFlippedCards([]);
    const newCards: Card[] = [];
    const cardsArray = [...cardImages.slice(0, cardsUsed / 2), ...cardImages.slice(0, cardsUsed / 2)];
    while (cardsArray.length) {
      const random = Math.floor(Math.random() * cardsArray.length);
      newCards.push({image: cardsArray[random], flipped: false, matched: false});
      cardsArray.splice(random, 1);
    }
    setCards(newCards);
  }

  function clickCard(i: number) {
    if (!cards[i].matched && !paused && !flippedCards.includes(i)) {
      if (!active) {
        setActive(true);
        intervalRef.current = setInterval(() => setTimer((timer: number) => timer + .1), 100);
      }
      let tempCards: Card[] = [...cards];
      tempCards[i].flipped = true;
      setCards(tempCards);
      flippedCards.push(i);
      if (flippedCards.length === 2) {
        checkCards();
      }
    }
  }

  function checkCards() {
    setPaused(true);
    const selectedCards: Card[] = [];
    const places: number[] = [];
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].flipped) {
        selectedCards.push(cards[i]);
        places.push(i);
      }
    }
    const tempCards = [...cards];
    if (selectedCards[0].image === selectedCards[1].image) {
      tempCards[places[0]].matched = true;
      tempCards[places[1]].matched = true;
      finishGo(tempCards, places);
    } else {
      if (guesses.includes(places[0]) || guesses.includes(places[1])) {
        setTimer((timer: number) => timer + 5);
      }
      setTimeout(() => {
        finishGo(tempCards, places);
      }, 500);
    }
    setFlippedCards([]);
    checkWin();
  }

  function finishGo(tempCards: Card[], places: number[]) {
    tempCards[places[0]].flipped = false;
    tempCards[places[1]].flipped = false;
    setGuesses([...guesses, places[0], places[1]]);
    setCards(cards);
    setPaused(false);
  }

  function checkWin() {
    let won: boolean = true;
    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].matched) {
        won = false;
      }
    }
    if (won) {
      clearInterval(intervalRef.current);
      setWon(true);
    }
  }

  function changeTotalCards(total: number) {
    setTotalCards(total);
    placeCards(total);
  }

  return (
    <div className="App">
      <div className="cards">
        <div className="selectCards">
          <label>Total Cards: </label>
          <select 
            name="cards" 
            id="cards" 
            defaultValue={totalCards}
            onChange={(e) => changeTotalCards(parseInt(e.target.value))}>
            {Array(51).fill("").map((_, i) => {
              const total = i * 2 + 4;
              return (
                <option key={i} value={`${total}`}>{total}</option>
              )
            })}
          </select>
        </div>
        <p className="timer">Timer: {timer === 0 ? 0 : timer.toFixed(1)}</p>
        <button className="reset" onClick={() => placeCards(totalCards)}>Reset</button>
        {/* <br/><br/><br/> */}
        {cards.map((card, i) => {
          return (
              <img 
                key={`card${i}`} 
                className="card"
                onClick={() => clickCard(i)}
                src={card.flipped || card.matched ? card.image: back} />
          )
        })}
      {won && <div className="won">
        <h1>Congratulations!</h1>
        <p>You finished the game in {timer.toFixed(1)} seconds</p>
        <button onClick={() => placeCards(totalCards)}>Reset</button>
        </div>}
      </div>
    </div>
  );
}

export default App;
