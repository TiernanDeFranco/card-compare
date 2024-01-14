import React, { useState, useEffect } from 'react';
import PlayerHand from './PlayerHand';
import Pile from './Pile';
import { TempStorage } from './TempStorage';
import PointsNotif from './PointsNotif';
import { auth, provider,db } from '../firebaseConfig';
import { signInWithPopup} from 'firebase/auth';
import 'firebase/auth';
import 'firebase/firestore';
import { addDoc, updateDoc, getDocs, collection, serverTimestamp, query, where} from 'firebase/firestore';
import { FaCircleInfo } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";


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


  const [playerScore, setPlayerScore] = useState<number>(0);

  const [legalMovesLeft, setLegalMovesLeft] = useState<boolean>(true);

  const [openRules, setOpenRules] = useState<boolean>(false);

  interface BonusDetail {
    points: number;
    reason: string;
    key: number;
  }

  interface PointsDetail {
    points: number;
    reason: string;
    key: number;
  }
  
  
  const [bonus, setBonus] = useState<BonusDetail[]>([]);
  const [turnScore, setTurnScore] = useState<number>(0);
  const [points, setPoints] = useState<PointsDetail[]>([]);


  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const scoreRef = collection(db, "leaderboard");

  const storeUserData = async (setPlayerScore: number) => {
    const user = auth.currentUser;
    if (!user) return;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const querySnapshot = await getDocs(query(
      scoreRef,
      where("user", "==", user.displayName),
      where("timestamp", ">=", startOfDay)
    ));
  
    const userData = {
      score: setPlayerScore,
      cardsLeft: 52 - discardPile.length,
      user: user.displayName,
      timestamp: serverTimestamp()
    };
  
    if (querySnapshot.empty) {
      await addDoc(scoreRef, userData);
    } else {
      const existingDoc = querySnapshot.docs[0];
      const existingData = existingDoc.data();
  
      if (setPlayerScore > existingData.score) { 
        const docRef = existingDoc.ref;
        await updateDoc(docRef, userData);
      }
    }
  };
  
  
  const handleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.user) {
        const score = playerScore;
        await storeUserData(score);
      }
    } catch (error) {
      console.error(error);
    }
  };
  

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
    setPlayerScore(0);
    setBonus([]);
    setTurnScore(0);
    setPoints([]);
    setLegalMovesLeft(true);
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

      const newpile1 = newDeck.slice(0, pileSize);
      const newpile2 = newDeck.slice(pileSize, 2 * pileSize);
      const newpile3 = newDeck.slice(2 * pileSize, 3 * pileSize);
      const newpile4 = newDeck.slice(3 * pileSize, 4 * pileSize);

      setPile1(newpile1);
      setPile2(newpile2);
      setPile3(newpile3);
      setPile4(newpile4);

    setPlayerHand(newPlayerHand);

    const pile1Legal = checkForLegalMoves(newPlayerHand, newpile1);
    const pile2Legal = checkForLegalMoves(newPlayerHand, newpile2);
    const pile3Legal = checkForLegalMoves(newPlayerHand, newpile3);
    const pile4Legal = checkForLegalMoves(newPlayerHand, newpile4);

    if (!(pile1Legal || pile2Legal || pile3Legal || pile4Legal)) 
    {
      initializeDeck();
    }


  };

  const handlePileCardClick = (card: CardProps, pileIndex: number) => {
    if (selectedPileCard && selectedPileCard.card.suit === card.suit && selectedPileCard.card.value === card.value) {
      setSelectedPileCard(null);
    } else {
      setSelectedPileCard({ pileIndex, card }); 
    }
  };
  
  
const handleHandCardClick = (card: CardProps, index: number) => {
  if (selectedCard && card.suit === selectedCard.suit && card.value === selectedCard.value) {
    setSelectedCard(null);
    setSelectedHandCardIndex(-1);
  } else {
    setSelectedCard(card); 
    setSelectedHandCardIndex(index);
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

    makeMove(cardFromHand, cardFromPile, selectedHandCardIndex, selectedPileCard?.pileIndex);
    }
    else if ((cardFromHand.value === 1 || cardFromPile.value === 1) && (blackSuits.includes(cardFromHand.suit) && blackSuits.includes(cardFromPile.suit) && cardFromHand.suit != cardFromPile.suit)&& (cardFromHand.value != cardFromPile.value))
    {

      makeMove(cardFromHand, cardFromPile, selectedHandCardIndex, selectedPileCard?.pileIndex);
    }
    else if ((cardFromHand.value === 1 || cardFromPile.value === 1) && (redSuits.includes(cardFromHand.suit) && redSuits.includes(cardFromPile.suit) && cardFromHand.suit != cardFromPile.suit)&& (cardFromHand.value != cardFromPile.value))
    {

      makeMove(cardFromHand, cardFromPile, selectedHandCardIndex, selectedPileCard?.pileIndex);
    }
    else if (cardFromHand.value === cardFromPile.value && 
    ((blackSuits.includes(cardFromHand.suit) && redSuits.includes(cardFromPile.suit)) || 
     (redSuits.includes(cardFromHand.suit) && blackSuits.includes(cardFromPile.suit))))
    {

    makeMove(cardFromHand, cardFromPile, selectedHandCardIndex, selectedPileCard?.pileIndex);
    }
    else if ((cardFromHand.suit === cardFromPile.suit) && (cardFromHand.value < cardFromPile.value)) //Same Suit, Lower Value
    {

        makeMove(cardFromHand, cardFromPile, selectedHandCardIndex, selectedPileCard?.pileIndex);
    }
    else if ((blackSuits.includes(cardFromHand.suit) && blackSuits.includes(cardFromPile.suit) && cardFromHand.suit != cardFromPile.suit) && cardFromHand.value > cardFromPile.value) //Compliment Higher Black
    {

      makeMove(cardFromHand, cardFromPile, selectedHandCardIndex, selectedPileCard?.pileIndex);
    }
    else if ((redSuits.includes(cardFromHand.suit) && redSuits.includes(cardFromPile.suit) && cardFromHand.suit != cardFromPile.suit) && cardFromHand.value > cardFromPile.value) //Compliment Higher Red
    {

      makeMove(cardFromHand, cardFromPile, selectedHandCardIndex, selectedPileCard?.pileIndex);
    }
  
};

const checkForLegalMoves = (hand: CardProps[], pile: CardProps[]): boolean => {
  const blackSuits = ['S', 'C'];
  const redSuits = ['D', 'H'];
  const topPileCard = pile[pile.length - 1];

  if (!topPileCard) return false;

  for (let handCard of hand) {
    if ((handCard.value === 1 || topPileCard.value === 1) && handCard.suit === topPileCard.suit && handCard.value !== topPileCard.value) {
      return true;
    }
    if ((handCard.value === 1 || topPileCard.value === 1) && blackSuits.includes(handCard.suit) && blackSuits.includes(topPileCard.suit) && handCard.suit !== topPileCard.suit && handCard.value !== topPileCard.value) {
      return true;
    }
    if ((handCard.value === 1 || topPileCard.value === 1) && redSuits.includes(handCard.suit) && redSuits.includes(topPileCard.suit) && handCard.suit !== topPileCard.suit && handCard.value !== topPileCard.value) {
      return true;
    }
    if (handCard.value === topPileCard.value && ((blackSuits.includes(handCard.suit) && redSuits.includes(topPileCard.suit)) || (redSuits.includes(handCard.suit) && blackSuits.includes(topPileCard.suit)))) {
      return true;
    }
    if (handCard.suit === topPileCard.suit && handCard.value < topPileCard.value) {
      return true;
    }
    if (blackSuits.includes(handCard.suit) && blackSuits.includes(topPileCard.suit) && handCard.suit !== topPileCard.suit && handCard.value > topPileCard.value) {
      return true;
    }
    if (redSuits.includes(handCard.suit) && redSuits.includes(topPileCard.suit) && handCard.suit !== topPileCard.suit && handCard.value > topPileCard.value) {
      return true;
    }
  }
  
  return false;
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

    let points: PointsDetail[] = [

    ];

    
    const newDiscardPile = [...discardPile, cardFromHand];
  
    setDiscardPile(newDiscardPile);

    let newHand = [...playerHand];
      newHand.splice(handCardIndex, 1);
      setPlayerHand(newHand);


    setPlayerScore(playerScore => playerScore + 100);

    points.push({ points: 100, reason: '1 card played - Final Four', key: Math.random() });

    if (newDiscardPile.length === 52)
    {
      setPlayerScore(playerScore => (playerScore + 100) * 2);

      points.push({ points: playerScore, reason: 'Score x 2 - Final Card Played', key: Math.random() });
    }
    else
    {
      const discardLegal = checkForLegalMoves(newHand, newDiscardPile);
      if (!discardLegal) setLegalMovesLeft(false);
    }

    setPoints(points);



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

  let bonuses: BonusDetail[] = [
  ];

  let points: PointsDetail[] = [

  ];

  let cardNum = tempStorage.length;


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
            bonusPoints += 20;
    
            bonuses.push({ points: 20, reason: "2 cards of same suit", key: Math.random() });
            break;
          case 3:
            bonusPoints += 35;
   
            bonuses.push({ points: 35, reason: "3 cards of same suit", key: Math.random() });
            break;
          case 4:
            bonusPoints += 45;

            bonuses.push({ points: 45, reason: "4 cards of same suit", key: Math.random() });
            break;
        }
      }
    });

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
            bonusPoints += 25;
            bonuses.push({ points: 25, reason: "2 cards of same value", key: Math.random() });
            break;
          case 3:
            bonusPoints += 50;

            bonuses.push({ points: 50, reason: "3 cards of same value", key: Math.random() });
            break;
          case 4:
            bonusPoints += 100;
    
            bonuses.push({ points: 100, reason: "4 cards of same value", key: Math.random() });
            break;
        }
      }
    });
 
    return bonusPoints;
  };
  
  bonusPoints += calculateFlushBonus(playedCards);
  bonusPoints += calculateSameValBonus(playedCards);

  let turnScore = (cardNum + bonusPoints) * cardNum;
  turnScore = Math.round(turnScore);


  if (cardNum > 1)
  {
    if (bonusPoints < 1)
    {
      points.push({ points: turnScore, reason: `${cardNum} cards played x ${cardNum} cards`, key: Math.random() });
    }
    else
    {
    points.push({ points: turnScore, reason: `(${cardNum} cards + ${bonusPoints} bonus) x ${cardNum} cards`, key: Math.random() });
    }
  }
  else
  {
    points.push({ points: turnScore, reason: '1 card played', key: Math.random() });
  }

  const newPlayerHand = [...playerHand, ...tempStorage.map(card => ({...card}))];

  setPlayerScore(playerScore => playerScore + turnScore);

  setPlayerHand(newPlayerHand);

  setTempStorage([]);
  setPile1FaceUp(true);
  setPile2FaceUp(true);
  setPile3FaceUp(true);
  setPile4FaceUp(true);



  setBonus(bonuses);
  setTurnScore(turnScore);
  setPoints(points);

  
  if (checkForDuplicates(deck)) {
    console.error("Duplicate cards found in the deck");
  }

  const allPilesEmpty = pile1.length === 0 && pile2.length === 0 && pile3.length === 0 && pile4.length === 0;

  if (allPilesEmpty) {
    setDiscardSelectable(true);
    setPlayerScore(playerScore => Math.round(turnScore + (playerScore * 2)));
    points.push({ points: playerScore, reason: 'Score x 2 - Cleared Piles', key: Math.random() });
  }

  

  const pile1Legal = checkForLegalMoves(newPlayerHand, pile1);
  const pile2Legal = checkForLegalMoves(newPlayerHand, pile2);
  const pile3Legal = checkForLegalMoves(newPlayerHand, pile3);
  const pile4Legal = checkForLegalMoves(newPlayerHand, pile4);

  if (!(pile1Legal || pile2Legal || pile3Legal || pile4Legal) && (!allPilesEmpty)) 
  {
    setLegalMovesLeft(false);
  }

  if (allPilesEmpty)
  {
    const discardLegal = checkForLegalMoves(newPlayerHand, discardPile);
    setLegalMovesLeft(discardLegal);
  }

};




  // Render method
  return (

    <>
    {!openRules && (
    <div className="game-container">
      
      <div>
        <h1 className='label'>
          Card Compare‎ ‎ ‎ 
          <button className='invisible' onClick={() => {setOpenRules(true)}}><FaCircleInfo/></button>
        </h1>
      </div>


      {
      turnScore != 0 && <PointsNotif bonuses={bonus} points={points}/>
      }
      
      <TempStorage cards={tempStorage}/>
      <div>
      <h2>{playerScore} points</h2>
      {!legalMovesLeft && (discardPile.length < 52) && <div> <div> <h2 className='legal-moves-left'>No Legal Moves Left :(</h2>  
      <button className='score-button' onClick={handleSignIn}>Record Score</button> </div> 
      <div>
      <button className='restart-button'onClick={() => window.location.reload()}>Restart</button> </div> </div>
      }

    {!legalMovesLeft && (discardPile.length === 52) && <div> <div> <h2 className='legal-moves-left'>You Won!</h2>
    <button className='score-button' onClick={handleSignIn}>Record Score</button> </div> 
      <div>
      <button className='restart-button'onClick={() => window.location.reload()}>Restart</button> </div> </div>
      }
      
          
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

{(discardSelectable && playerHand.length < 4) && (
        <div>
           <button className='back-button' onClick={backButton2}>Back</button>
        </div>
      )}

     
      
      </div>
    </div>
    )}

    {openRules && (

<div>
    <h1 className='label'>
        Game Rules
        <button className='invisible' onClick={() => { setOpenRules(false) }}><RxCross2 /></button>
    </h1>

    <p><strong>Card Compare:</strong> A strategic game with 52 cards divided into 4 piles and 4 cards in your hand.</p>
     
    <ul>
        <li>Click a card from your hand and then the top card from one of the piles to compare.</li>
        <li>Playing a card from your hand moves it to the discard pile, and the chosen pile card to the 'Cards to Pickup' pile.</li>
        <li>End your turn by clicking [End Turn], merging 'Cards to Pickup' with your hand for the next turn. Plan your moves strategically.</li>
        <li>When all four piles are empty, the discard pile becomes the new, sole pile to compare against, play your cards wisely to ensure you can play as many as possible</li>
    </ul>

    <h4>Scoring</h4>
    <p>Score = [(Number of Cards Played + Bonus Points) x Number of Cards Played]. More cards played per turn increase the score.
      </p>

      <h4>Bonus Points System</h4>
  <ul>
    <li>
      <strong>Flush Bonus:</strong>
      <span> Earn a bonus for playing multiple cards of the same suit. The bonus increases with more cards played.</span>
    </li>
    <li>
      <strong>Same Value Bonus:</strong>
      <span> Earn a bonus for playing multiple cards of the same value. More cards lead to a higher bonus.</span>
    </li>
  </ul>

    <h4>Understanding Legal Moves</h4>
    <h5>Rules are from the perspective of the card in your hand (bottom) compared to the card in the piles (top)</h5>
    <img src='./rules/rule-image.png' style={{ width: '100%' }} alt="Detailed Rule Chart" />
</div>


    )}
    </>
  );
};

export default Game;
