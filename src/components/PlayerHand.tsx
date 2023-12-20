// src/components/PlayerHand.tsx
import React from 'react';
import Card from './Card';

interface CardProps {
    suit: string;
    value: number;
    faceUp?: boolean;
    selectable?: boolean;
    isSelected?: boolean;
    onClick: () => void;
    originPile?: number;
  }
  

interface PlayerHandProps {
    cards: CardProps[];
    selectedCard: CardProps | null;
    onCardClick: (card: CardProps, index: number) => void;
  }
  

const PlayerHand: React.FC<PlayerHandProps> = ({ cards, selectedCard, onCardClick }) => {
  return (
    <div className="player-hand">
      {cards.map((card, index) => (
        <Card
          key={index}
          faceUp={card.faceUp}
          suit={card.suit}
          selectable={true}
          value={card.value}
          isSelected={selectedCard !== null && card.suit === selectedCard.suit && card.value === selectedCard.value}
          onClick={() => onCardClick(card, index)}
        />
      ))}
    </div>
  );
};


export default PlayerHand;
