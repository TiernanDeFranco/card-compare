import React from 'react';
import Card from './Card';

interface CardProps {
    suit: string;
    value: number;
    faceUp?: boolean;
    selectable?: boolean;
    isSelected?: boolean;
    onClick: () => void;
  }
  
  
  interface StorageProps {
    cards: CardProps[];
  }


export const TempStorage: React.FC<StorageProps> = ({ cards }) => {
    return (
      <div className="temp-storage">
        {cards.length > 0 && (
          <label className='temp-label'>Cards to Pickup</label>
        )}
        {cards.map((card, index) => (
          <Card key={index} suit={card.suit} value={card.value} selectable={false} faceUp={true} onClick={() => {}}/>
        ))}
      </div>
    );
};
