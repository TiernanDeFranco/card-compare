// src/components/Pile.tsx
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


interface PileProps {
  pile: CardProps[];
  pileFaceUp: boolean;
  pileSelectable: boolean;
  selectedPileCard: CardProps | null;
  onCardClick: (card: CardProps, pileIndex: number) => void;
}

const Pile: React.FC<PileProps> = ({ pile, pileFaceUp, pileSelectable ,selectedPileCard, onCardClick }) => {
  return (
    <div className="pile-container">
      {pile.length > 0 ? (
        <Card
          {...pile[pile.length - 1]}
          faceUp={pileFaceUp}
          selectable={pileSelectable}
          isSelected={selectedPileCard !== null && pile[pile.length - 1].suit === selectedPileCard.suit && pile[pile.length - 1].value === selectedPileCard.value}
          onClick={() => onCardClick(pile[pile.length - 1], pile.length - 1)}
        />
      ) : (
        <div className="empty-pile">
          <img src='src/assets/card-images/emptyPile.png' alt='Empty Pile' />
        </div>
      )}
    </div>
  );
};



export default Pile;
