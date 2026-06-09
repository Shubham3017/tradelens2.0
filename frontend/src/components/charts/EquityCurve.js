import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler);

const EquityCurve = ({ data }) => {
    const chartData = {
        labels: data.map(d => d.date),
        datasets: [{
            label: 'Cumulative P&L (₹)',
            data: data.map(d => d.value),
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#28a745',
            borderWidth: 2,
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { labels: { color: '#555555' } }
        },
        scales: {
            x: {
                ticks: { color: '#aaaaaa', font: { size: 11 } },
                grid: { color: '#f0f0f0' }
            },
            y: {
                ticks: { color: '#aaaaaa' },
                grid: { color: '#f0f0f0' }
            }
        }
    };

    return <Line data={chartData} options={options} />;
};

export default EquityCurve;