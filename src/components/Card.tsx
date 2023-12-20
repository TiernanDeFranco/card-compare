import React from 'react';

interface CardProps {
  suit: string;
  value: number;
  faceUp?: boolean;
  selectable?: boolean;
  isSelected?: boolean;
  onClick: () => void;
  originPile?: number;
}

  const Card: React.FC<CardProps> = ({ suit, value, faceUp, selectable, isSelected, onClick }) => {
    const getCardImage = (): string => {

      return faceUp ? `/card-images/${suit}${value}.png` : '/card-images/faceDown.png';

    };
  
    const imageUrl = getCardImage();
  
    const cardClass = isSelected ? "card-selected playing-card" : "playing-card";

    return (
      selectable ? 
        <img className={cardClass} onClick={onClick} src={imageUrl} alt={`${value} of ${suit}`} /> :
        <img src={imageUrl} alt={`${value} of ${suit}`} />
    );
    
  };
  
  export default Card;