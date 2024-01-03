import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const Leaderboard = () => {


    interface LeaderboardData {
        id: string;
        user: string;
        score: number;
        cardsLeft: number;
    }
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardData[]>([]);
    const [leaderboardType, setLeaderboardType] = useState<string>("Daily");

    const scoreRef = collection(db, "leaderboard");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    useEffect(() => {
        fetchLeaderboard("Daily");
    }, []);

    const fetchLeaderboard = async (leaderboardType: string) => {
        let queryLeaderboard;

        switch (leaderboardType) {
            case "Daily":
                const startOfDay = new Date(today);
                queryLeaderboard = query(scoreRef, where('timestamp', '>=', startOfDay));
                break;

            case "Weekly":
                const startOfWeek = new Date(today);
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                queryLeaderboard = query(scoreRef, where('timestamp', '>=', startOfWeek));
                break;

            case "Monthly":
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                queryLeaderboard = query(scoreRef, where('timestamp', '>=', startOfMonth));
                break;

            case "Lifetime":
                queryLeaderboard = query(scoreRef);
                break;

            default:
                return;
        }

        try {
            const querySnapshot = await getDocs(queryLeaderboard);
            const fetchedData: LeaderboardData[] = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                user: doc.data().user,
                score: doc.data().score,
                cardsLeft: doc.data().cardsLeft
            }))
            .sort((a, b) => b.score - a.score);
        
            setLeaderboardData(fetchedData);
            console.log(fetchedData);
        } catch (error) {
            console.error("Error fetching leaderboard data: ", error);
        }
    };

  return (
    <div>
        <h1 className='label'>{leaderboardType} Leaderboard</h1>
        <div className='leaderboard-buttons'>
            <button className='leaderboard-button' onClick={() => {setLeaderboardType("Daily"); fetchLeaderboard("Daily");}}>Daily</button>
            <button className='leaderboard-button' onClick={() => {setLeaderboardType("Weekly"); fetchLeaderboard("Weekly");}}>Weekly</button>
            <button className='leaderboard-button' onClick={() => {setLeaderboardType(today.toLocaleString('default', { month: 'long' })); fetchLeaderboard("Monthly");}}>Monthly</button>
            <button className='leaderboard-button' onClick={() => {setLeaderboardType("Lifetime"); fetchLeaderboard("Lifetime");}}>Lifetime</button>
        </div>

        {leaderboardData.length > 0 ? (
    <div className='leaderboard-container'>
        <div className='leaderboard-grid'>
            <div className='leaderboard-header'>
                <h4>Rank</h4>
                <h4>Player</h4>
                <h4>Cards Left</h4>
                <h4>Score</h4>
            </div>
            {leaderboardData.map((data, index) => (
                <React.Fragment key={data.id}>
                    <span>{index + 1}</span>
                    <span>{data.user}</span>
                    <span>{data.cardsLeft}</span>
                    <span>{data.score}</span>
                </React.Fragment>
            ))}
        </div>
    </div>
) : (
    <div className='no-data-message'>
        No data available for the {leaderboardType} Leaderboard
    </div>
)}

    </div>
  )
}
