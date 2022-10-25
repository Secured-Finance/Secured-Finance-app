import {
    ChartOptions,
    ChartTypeRegistry,
    ScriptableContext,
    TooltipItem,
} from 'chart.js';

export const defaultDatasets = {
    borderWidth: 3,
    radius: 0,
    lineTension: 0.4,
    pointRadius: 0.01,
};

export const crossHairPlugin = {
    id: 'cross-hair',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    afterDraw: (chart: any) => {
        if (chart.tooltip._active && chart.tooltip._active.length) {
            const activePoint = chart.tooltip._active[0];
            const ctx = chart.ctx;
            const x = activePoint.element.x;
            const y = activePoint.element.y;
            const bottomY = chart.scales.y.bottom;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, y + 12);
            ctx.lineTo(x, bottomY + 15);
            ctx.lineWidth = 1;
            ctx.setLineDash([8, 8]);
            ctx.strokeStyle = 'rgba(252, 252, 253, 0.7)';
            ctx.stroke();
            ctx.restore();
        }
    },
};

export const getCurveGradient = (context: ScriptableContext<'line'>) => {
    const ctx = context.chart.ctx;
    const yieldCurveGradient = ctx.createLinearGradient(
        0,
        0,
        ctx.canvas.offsetWidth,
        0
    );
    yieldCurveGradient.addColorStop(0, 'rgba(255, 89, 248, 0)');
    yieldCurveGradient.addColorStop(0.2, 'rgba(174, 114, 255, 1)');
    yieldCurveGradient.addColorStop(0.5, 'rgba(144, 233, 237, 1)');
    yieldCurveGradient.addColorStop(0.78, 'rgba(92, 209, 103, 1)');
    yieldCurveGradient.addColorStop(1, 'rgba(255, 238, 0, 0)');
    return yieldCurveGradient;
};

export const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    layout: {
        padding: {
            top: 50,
        },
    },
    elements: {
        point: {
            hoverRadius: 6,
            hoverBorderColor: '#FFFFFF',
            hoverBorderWidth: 2,
            backgroundColor: '#5162FF',
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            display: false,
        },

        x: {
            beginAtZero: true,
            ticks: {
                color: 'rgba(255, 255, 255, 0.6)',
                font: {
                    lineHeight: 2.0,
                },
                padding: 10,
            },
            grid: {
                display: false,
                borderColor: 'transparent',
            },
        },
    },
    hover: {
        intersect: false,
    },
    plugins: {
        tooltip: {
            yAlign: 'bottom',
            caretPadding: 16,
            backgroundColor: 'rgba(47, 50, 65, 1)',
            borderWidth: 1,
            borderColor: 'rgba(52, 56, 76, 1)',
            displayColors: false,
            cornerRadius: 10,
            padding: 8,
            callbacks: {
                label: (item: TooltipItem<keyof ChartTypeRegistry>) => {
                    let content = '';
                    content += item.formattedValue + '%';
                    return content;
                },
                title: () => {
                    return '';
                },
            },
        },
    },
};
