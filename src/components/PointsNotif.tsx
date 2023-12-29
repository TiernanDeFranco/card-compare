import React, { useState, useEffect } from 'react';

interface BonusDetail {
    points: number;
    reason: string;
  }

  interface PointsDetail {
    points: number;
    reason: string;
  }
  
  interface PointsNotifProps {
    bonuses: BonusDetail[];
    points: PointsDetail[];
  }
  
  const PointsNotif: React.FC<PointsNotifProps> = ({ bonuses, points }) => {
    let bonusTotal = bonuses.reduce((total, bonus) => {
        return total + bonus.points;
      }, 0); 
      
    return (
      <div className="points-notification">
        {bonuses.map((bonus, index) => (
          <div key={index}>
            +{bonus.points} Bonus [{bonus.reason}]
          </div>
        ))}
       <div>
    {points.map((point, index) => (
        <div key={index}>
        +{point.points} {point.points > 1 ? 'Points' : 'Point'} [{point.reason}]
        </div>
    ))}
    </div>
      </div>
    );
  };
  
  export default PointsNotif;
  