import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WinRateByHour = ({ data }) => {
    const values = Object.values(data);
    const colors = values.map(v =>
        v >= 70 ? '#28a745' : v >= 40 ? '#ffc107' : '#e94560');

    const chartData = {
        labels: Object.keys(data),
        datasets: [{
            label: 'Win Rate %',
            data: values,
            backgroundColor: colors,
            borderRadius: 6,
        }]
    };

    const options = {
        responsive: true,
        plugins: { legend: { labels: { color: '#555' } } },
        scales: {
            x: { ticks: { color: '#888' }, grid: { color: '#f0f0f0' } },
            y: { ticks: { color: '#888' }, grid: { color: '#f0f0f0' }, max: 100 }
        }
    };

    return <Bar data={chartData} options={options} />;
};

export default WinRateByHour;