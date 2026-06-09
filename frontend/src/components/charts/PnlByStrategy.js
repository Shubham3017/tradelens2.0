import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PnlByStrategy = ({ data }) => {
    const chartData = {
        labels: Object.keys(data),
        datasets: [{
            label: 'Avg P&L (₹)',
            data: Object.values(data),
            backgroundColor: Object.values(data).map(v =>
                v >= 0 ? '#28a745' : '#e94560'),
            borderRadius: 6,
        }]
    };

    const options = {
        responsive: true,
        plugins: { legend: { labels: { color: '#555' } } },
        scales: {
            x: { ticks: { color: '#888' }, grid: { color: '#f0f0f0' } },
            y: { ticks: { color: '#888' }, grid: { color: '#f0f0f0' } }
        }
    };

    return <Bar data={chartData} options={options} />;
};

export default PnlByStrategy;