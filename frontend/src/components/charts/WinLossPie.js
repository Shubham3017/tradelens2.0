import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const WinLossPie = ({ winRate }) => {
    const data = {
        labels: ['Wins', 'Losses'],
        datasets: [{
            data: [winRate, 100 - winRate],
            backgroundColor: ['#28a745', '#e94560'],
            borderWidth: 0,
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#555555' }
            }
        }
    };

    return <Pie data={data} options={options} />;
};

export default WinLossPie;