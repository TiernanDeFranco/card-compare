import React, { useState, useEffect } from 'react';
import PlayerHand from './PlayerHand';
import Pile from './Pile';
import { TempStorage } from './TempStorage';

interface CardProps {
  suit: string;
  value: number;
  faceUp?: boolean;
  selectable?: boolean;
  isSelected?: boolean;
  onClick: () => void;
  originPile?: number;
}


const Game: React.FC = () => {
  const [deck, setDeck] = useState<CardProps[]>([]);
  const [playerHand, setPlayerHand] = useState<CardProps[]>([]);
  const [pile1, setPile1] = useState<CardProps[]>([]);
  const [pile2, setPile2] = useState<CardProps[]>([]);
  const [pile3, setPile3] = useState<CardProps[]>([]);
  const [pile4, setPile4] = useState<CardProps[]>([]);

  const [pile1FaceUp, setPile1FaceUp] = useState<boolean>(true);
  const [pile2FaceUp, setPile2FaceUp] = useState<boolean>(true);
  const [pile3FaceUp, setPile3FaceUp] = useState<boolean>(true);
  const [pile4FaceUp, setPile4FaceUp] = useState<boolean>(true);

  const [discardSelectable, setDiscardSelectable] = useState<boolean>(false);

  const [selectedCard, setSelectedCard] = useState<CardProps | null>(null);
  const [selectedHandCardIndex, setSelectedHandCardIndex] = useState<number>(-1);
  const [selectedPileCard, setSelectedPileCard] = useState<{ pileIndex: number; card: CardProps } | null>(null);
  
  const [discardPile, setDiscardPile] = useState<CardProps[]>([]);
  const [tempStorage, setTempStorage] = useState<CardProps[]>([]);

  const [backButton2Visible, setBackButton2Visible] = useState<boolean>(false);

  const [playerScore, setPlayerScore] = useState<number>(0);




  useEffect(() => {
    const newDeck = initializeDeck();
    setDeck(newDeck);
  }, []);

  useEffect(() => {
    if (deck.length > 0) {
      dealCards();
    }
  }, [deck]);

  const initializeDeck = (): CardProps[] => {
    setSelectedCard(null);
    setSelectedPileCard(null);
    setDiscardPile([]);
    setTempStorage([]);
    setPile1FaceUp(true);
    setPile2FaceUp(true);
    setPile3FaceUp(true);
    setPile4FaceUp(true);
    setDiscardSelectable(false);
    setBackButton2Visible(false);
    setPlayerScore(0);
    const suits = ['H', 'D', 'C', 'S'];
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    let newDeck: CardProps[] = [];

    suits.forEach((suit) => {
      values.forEach((value) => {
        newDeck.push({ suit, value, faceUp: true, onClick: () => {} });
      });

      if (checkForDuplicates(newDeck)) {
        console.error("Duplicate cards found in the deck");
      }
    });

    return shuffleDeck(newDeck);
  };

  const shuffleDeck = (deck: CardProps[]): CardProps[] => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const dealCards = (): void => {
    const newPlayerHand = deck.slice(0, 4).map(card => ({ ...card }));
    const newDeck = deck.slice(4);

      const pileSize = Math.floor(newDeck.length / 4);
      setPile1(newDeck.slice(0, pileSize));
      setPile2(newDeck.slice(pileSize, 2 * pileSize));
      setPile3(newDeck.slice(2 * pileSize, 3 * pileSize));
      setPile4(newDeck.slice(3 * pileSize, 4 * pileSize));

    setPlayerHand(newPlayerHand);

    console.log(newPlayerHand);
    console.log(newDeck.slice(0, pileSize));
    console.log(newDeck.slice(pileSize, 2 * pileSize));
    console.log(newDeck.slice(2 * pileSize, 3 * pileSize));
    console.log(newDeck.slice(3 * pileSize, 4 * pileSize));

  };

  const handlePileCardClick = (card: CardProps, pileIndex: number) => {
    if (selectedPileCard && selectedPileCard.card.suit === card.suit && selectedPileCard.card.value === card.value) {
      setSelectedPileCard(null);
      console.log(`Pile card deselected`);
    } else {
      setSelectedPileCard({ pileIndex, card }); 
      console.log(`Card clicked from pile ${pileIndex}:`, card);
    }
  };
  
  
const handleHandCardClick = (card: CardProps, index: number) => {
  if (selectedCard && card.suit === selectedCard.suit && card.value === selectedCard.value) {
    setSelectedCard(null);
    setSelectedHandCardIndex(-1);
    console.log(`Card selected : NULL`);
  } else {
    setSelectedCard(card); 
    setSelectedHandCardIndex(index);
    console.log(`Card clicked from hand :`, card);
  }
  
};


useEffect(() => {
  if (selectedCard && selectedPileCard) {

    compareCards(selectedCard, selectedPileCard.card);

    setSelectedCard(null);
    setSelectedPileCard(null);

  }
}, [selectedCard, selectedPileCard]);




const compareCards = (cardFromHand: CardProps, cardFromPile: CardProps) => {

   const blackSuits = ['S', 'C']; // Spades and Clubs
   const redSuits = ['D', 'H']; // Diamonds and Hearts
    if ((cardFromHand.value === 1 || cardFromPile.value === 1) && (cardFromHand.suit === cardFromPile.suit) && (cardFromHand.value != cardFromPile.value))
    {
    console.log("Legal Move: Aces High-Low");
    makeMove(cardFromHand, cardFromPile, selectedHandCardIndex, selectedPileCard?.pileIndex);
    }
    else if ((cardFromHand.value === 1 || cardFromPile.value === 1) && (blackSuits.includes(cardFromHand.suit) && blackSuits.includes(cardFromPile.suit) && cardFromHand.suit != cardFromPile.suit)&& (cardFromHand.value != cardFromPile.value))
    {
      console.log("Legal Move: Aces High-Low Black");
      makeMove(cardFromHand, cardFromPile, selectedHandCardIndex, selectedPileCard?.pileIndex);
    }
    else if ((cardFromHand.value === 1 || cardFromPile.value === 1) && (redSuits.includes(cardFromHand.suit) && redSuits.includes(cardFromPile.suit) && cardFromHand.suit != cardFromPile.suit)&& (cardFromHand.value != cardFromPile.value))
    {
      console.log("Legal Move: Aces High-Low Red");
      makeMove(cardFromHand, cardFromPile, selectedHandCardIndex, selectedPileCard?.pileIndex);
    }
    else if (cardFromHand.value === cardFromPile.value && 
    ((blackSuits.includes(cardFromHand.suit) && redSuits.includes(cardFromPile.suit)) || 
     (redSuits.includes(cardFromHand.suit) && blackSuits.includes(cardFromPile.suit))))
    {
    console.log("The cards are of opposite colors and have the same value.");
    makeMove(cardFromHand, cardFromPile, selectedHandCardIndex, selectedPileCard?.pileIndex);
    }
    else if ((cardFromHand.suit === cardFromPile.suit) && (cardFromHand.value < cardFromPile.value)) //Same Suit, Lower Value
    {
        console.log("Legal Move (Same Suit Lower)");
        makeMove(cardFromHand, cardFromPile, selectedHandCardIndex, selectedPileCard?.pileIndex);
    }
    else if ((blackSuits.includes(cardFromHand.suit) && blackSuits.includes(cardFromPile.suit) && cardFromHand.suit != cardFromPile.suit) && cardFromHand.value > cardFromPile.value) //Compliment Higher Black
    {
      console.log("Legal Move (Compliment Higher)");
      makeMove(cardFromHand, cardFromPile, selectedHandCardIndex, selectedPileCard?.pileIndex);
    }
    else if ((redSuits.includes(cardFromHand.suit) && redSuits.includes(cardFromPile.suit) && cardFromHand.suit != cardFromPile.suit) && cardFromHand.value > cardFromPile.value) //Compliment Higher Red
    {
      console.log("Legal Move (Compliment Higher)");
      makeMove(cardFromHand, cardFromPile, selectedHandCardIndex, selectedPileCard?.pileIndex);
    }
    else
    {
      console.log('Illegal Move');
    }
  
};


const checkForDuplicates = (deck: CardProps[]) => {
  const cardStrings = deck.map(card => `${card.suit}-${card.value}`);
  const uniqueCards = new Set(cardStrings);
  return uniqueCards.size !== cardStrings.length;
};


const makeMove = (cardFromHand: CardProps, cardFromPile: CardProps, handCardIndex: number, pileIndex?: number) => {
  if (!discardSelectable) {
    setDiscardPile(discardPile => [...discardPile, cardFromHand]);
    setTempStorage(tempStorage => [...tempStorage, {...cardFromPile, originPile: pileIndex}]);

    setPlayerHand(currentHand => {
      let newHand = [...currentHand];
      newHand.splice(handCardIndex, 1);
      return newHand;
    });

    if (pileIndex !== undefined) {
      switch (pileIndex) {
        case 1:
          setPile1(pile1 => pile1.length > 0 ? pile1.slice(0, -1) : []);
          setPile1FaceUp(false);
          break;
        case 2:
          setPile2(pile2 => pile2.length > 0 ? pile2.slice(0, -1) : []);
          setPile2FaceUp(false);
          break;
        case 3:
          setPile3(pile3 => pile3.length > 0 ? pile3.slice(0, -1) : []);
          setPile3FaceUp(false);
          break;
        case 4:
          setPile4(pile4 => pile4.length > 0 ? pile4.slice(0, -1) : []);
          setPile4FaceUp(false);
          break;
        default:
          console.error("Invalid pile index");
      }
    }
  } else {
    
    setDiscardPile(discardPile => [...discardPile, cardFromHand]);

    setPlayerHand(currentHand => {
      let newHand = [...currentHand];
      newHand.splice(handCardIndex, 1);
      return newHand;
    });

    if (playerHand.length < 4 && playerHand.length > 0) 
    {
      setBackButton2Visible(true);
    }
    else
    {
      setBackButton2Visible(false);
    }

    setPlayerScore(playerScore => playerScore + 100);
    console.log(`${playerScore} + 100 = ${playerScore + 100}`)

    if (discardPile.length === 52)
    {
      setPlayerScore(playerScore => (playerScore + 100) * 5);
      console.log(`${playerScore} * 5  = ${(playerScore + 100) * 5}`);
    }

  }
};

const resetRound = () => {
  const numCardsToMove = 1;

  setPlayerHand(playerHand => [...playerHand, ...discardPile.slice(-numCardsToMove)]);
  setDiscardPile(discardPile => discardPile.slice(0, -numCardsToMove));

  if (tempStorage.length > 0) {
    const lastCard = tempStorage[tempStorage.length - 1];

    switch (lastCard.originPile) {
      case 1:
        setPile1(pile1 => [...pile1, lastCard]);
        setPile1FaceUp(true);
        break;
      case 2:
        setPile2(pile2 => [...pile2, lastCard]);
        setPile2FaceUp(true);
        break;
      case 3:
        setPile3(pile3 => [...pile3, lastCard]);
        setPile3FaceUp(true);
        break;
      case 4:
        setPile4(pile4 => [...pile4, lastCard]);
        setPile4FaceUp(true);
        break;
      default:
        console.error("Invalid pile origin");
    }
  }

  setTempStorage(tempStorage => tempStorage.slice(0, -numCardsToMove));
};



const backButton2 = () => {
  const numCardsToMove = 1;

  setPlayerHand(playerHand => [...playerHand, ...discardPile.slice(-numCardsToMove)]);
  setDiscardPile(discardPile => discardPile.slice(0, -numCardsToMove));

  setPlayerScore(playerScore => playerScore - 100);

};



const endTurn = () => {

  let cardNum = tempStorage.length;

  console.log(cardNum);

  let bonusPoints = 0;

  const playedCards = discardPile.slice(discardPile.length - cardNum);

  const calculateFlushBonus = (playedCards: CardProps[]): number => {
    const suitCounts: Record<string, number> = {};
    let bonusPoints = 0;
  
    playedCards.forEach(card => {
      suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
    });
  
    Object.values(suitCounts).forEach(count => {
      if (count > 1) {
        switch (count) {
          case 2:
            bonusPoints += 5;
            console.log('2 card same suit');
            break;
          case 3:
            bonusPoints += 15;
            console.log('3 card same suit');
            break;
          case 4:
            bonusPoints += 30;
            console.log('4 card same suit');
            break;
        }
      }
    });
    console.log({bonusPoints});
    return bonusPoints;
  };

  const calculateSameValBonus = (playedCards: CardProps[]): number => {
    const valueCounts: Record<string, number> = {};
    let bonusPoints = 0;
  
    playedCards.forEach(card => {
      valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
    });
  
    Object.values(valueCounts).forEach(count => {
      if (count > 1) {
        switch (count) {
          case 2:
            bonusPoints += 15;
            console.log('2 card same val');
            break;
          case 3:
            bonusPoints += 25;
            console.log('3 card same val');
            break;
          case 4:
            bonusPoints += 50;
            console.log('4 card same val');
            break;
        }
      }
    });
    console.log({bonusPoints});
    return bonusPoints;
  };
  
  bonusPoints += calculateFlushBonus(playedCards);
  bonusPoints += calculateSameValBonus(playedCards);

  let turnScore = (1 + bonusPoints) * cardNum;
  turnScore = Math.round(turnScore);
  console.log(`(${1}+${bonusPoints})*${cardNum} = rounded: ${turnScore}`);

  setPlayerScore(playerScore => playerScore + turnScore);

  setPlayerHand(playerHand => [...playerHand, ...tempStorage.map(card => ({...card}))]);

  setTempStorage([]);
  setPile1FaceUp(true);
  setPile2FaceUp(true);
  setPile3FaceUp(true);
  setPile4FaceUp(true);

  
  if (checkForDuplicates(deck)) {
    console.error("Duplicate cards found in the deck");
  }

  const allPilesEmpty = pile1.length === 0 && pile2.length === 0 && pile3.length === 0 && pile4.length === 0;

  if (allPilesEmpty) {
    setDiscardSelectable(true);
    setPlayerScore(playerScore => Math.round(turnScore + (playerScore * 1.5)));
    console.log(`${playerScore} * 1.5 = rounded: ${Math.round(turnScore + (playerScore * 1.5))}`);
  }

};




  // Render method
  return (
    <div className="game-container">
      <h1 className='label'>Card Compare</h1>
      <TempStorage cards={tempStorage}/>
      <div>
      <h2>{playerScore} points</h2>
      <div className='parent-container'>
      <div className='pile-grid'>
        <Pile pile={pile1} onCardClick={(card) => handlePileCardClick(card, 1)} pileFaceUp={pile1FaceUp} pileSelectable={pile1FaceUp} selectedPileCard={selectedPileCard?.pileIndex === 1 ? selectedPileCard.card : null}/>
        <Pile pile={pile2} onCardClick={(card) => handlePileCardClick(card, 2)} pileFaceUp={pile2FaceUp} pileSelectable={pile2FaceUp} selectedPileCard={selectedPileCard?.pileIndex === 2 ? selectedPileCard.card : null}/>
        <Pile pile={pile3} onCardClick={(card) => handlePileCardClick(card, 3)} pileFaceUp={pile3FaceUp} pileSelectable={pile3FaceUp} selectedPileCard={selectedPileCard?.pileIndex === 3 ? selectedPileCard.card : null}/>
        <Pile pile={pile4} onCardClick={(card) => handlePileCardClick(card, 4)} pileFaceUp={pile4FaceUp} pileSelectable={pile4FaceUp} selectedPileCard={selectedPileCard?.pileIndex === 4 ? selectedPileCard.card : null}/>
      </div>
      </div>
      <div>
        <h2>Discard Pile</h2>
        <Pile pile={discardPile} pileFaceUp={true} onCardClick={(card) => handlePileCardClick(card, 5)} pileSelectable={discardSelectable}  selectedPileCard={selectedPileCard?.pileIndex === 5 ? selectedPileCard.card : null}/>
      </div>
      <div>
        <h2 className='label'>Player Hand</h2>
        <PlayerHand cards={playerHand} onCardClick={handleHandCardClick} selectedCard={selectedCard} />
      </div>
      {tempStorage.length > 0 && (
        <div>
           <button className='back-button' onClick={resetRound}>Back</button>
          <button className='end-turn-button' onClick={endTurn}>End Turn</button>
        </div>
      )}

{backButton2Visible && (
        <div>
           <button className='back-button' onClick={backButton2}>Back</button>
        </div>
      )}
      
      </div>
    </div>
  );
};

export default Game;
