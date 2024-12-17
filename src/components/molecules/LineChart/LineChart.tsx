import {
    CategoryScale,
    ChartData,
    Chart as ChartJS,
    ChartOptions,
    LineElement,
    LinearScale,
    PointElement,
    Scriptable,
    ScriptableContext,
    Title,
    Tooltip,
} from 'chart.js';
import ChartTooltip from 'chart.js/auto';
import { useCallback, useEffect, useRef } from 'react';
import { ChartProps, Line } from 'react-chartjs-2';
import { Spinner } from 'src/components/atoms';
import {
    crossHairPlugin,
    options as customOptions,
    defaultDatasets,
} from 'src/components/molecules/LineChart/constants';
import { MaturityListItem } from 'src/components/organisms';
import { Maturity } from 'src/utils';

ChartJS.register(
    LinearScale,
    PointElement,
    LineElement,
    Title,
    CategoryScale,
    Tooltip
);

const triggerHover = (chart: ChartJS<'line'>, index: number) => {
    chart.setActiveElements([
        {
            datasetIndex: 0,
            index: index,
        },
    ]);
    chart.update();
};

const triggerTooltip = (chart: ChartJS<'line'>, index: number) => {
    const tooltip = chart.tooltip as unknown as ChartTooltip<'line'>;
    if (tooltip) {
        tooltip.setActiveElements([
            {
                datasetIndex: 0,
                index: index,
            },
        ]);
        tooltip.update();
    }
    chart.update();
};

export type LineChartProps = {
    style?: React.CSSProperties;
    data: ChartData<'line'>;
    maturityList: MaturityListItem[];
    maturity: Maturity;
    handleChartClick: (index: number) => void;
} & ChartProps;

export const LineChart = ({
    data = { datasets: [], labels: [] },
    options = customOptions,
    style,
    maturityList,
    maturity,
    handleChartClick,
}: LineChartProps) => {
    const chartRef = useRef<ChartJS<'line'>>(null);

    if (data.datasets.length > 0 && data.datasets[0].data.length > 0) {
        const dataArray = data.datasets[0].data as number[];

        if (dataArray.every(item => item === 0)) {
            options = {
                ...options,
                scales: {
                    ...options.scales,
                    y: {
                        display: false,
                        beginAtZero: true,
                    },
                },
            };
        }
    }

    const refinedDatasets = data.datasets.map(set => {
        if (defaultDatasets) {
            return {
                borderCapStyle: 'round' as Scriptable<
                    CanvasLineCap,
                    ScriptableContext<'line'>
                >,
                ...defaultDatasets,
                ...set,
            };
        }
        return {
            ...set,
        };
    });

    const refinedData = {
        ...data,
        datasets: refinedDatasets,
    };

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!chartRef.current) return;

        const element = chartRef.current.getElementsAtEventForMode(
            event as unknown as Event,
            'nearest',
            { axis: 'x', intersect: false, includeInvisible: true },
            true
        );
        if (element && element[0]) {
            const { index } = element[0];
            const label = data.labels?.[index];
            const selectedMaturityIndex = maturityList.findIndex(
                element => element.label === label
            );
            if (selectedMaturityIndex >= 0) {
                handleChartClick(selectedMaturityIndex);
            }
        }
    };

    const onMouseOut = useCallback(() => {
        if (!chartRef.current) return;

        const numberOfElements = chartRef.current.data.datasets[0].data.length;
        let index = maturityList.findIndex(
            element => element.maturity === maturity.toNumber()
        );

        if (numberOfElements) {
            index = index > 0 ? index : 0;
            triggerHover(chartRef.current, index);
            triggerTooltip(chartRef.current, index);
        }
    }, [maturityList, maturity]);

    useEffect(() => {
        onMouseOut();
    }, [onMouseOut]);

    return (
        <>
            {refinedData.datasets.length > 0 &&
            refinedData.datasets[0].data.length > 0 ? (
                <Line
                    style={style}
                    data={refinedData}
                    options={options as ChartOptions<'line'>}
                    ref={chartRef}
                    onClick={handleClick}
                    data-chromatic='ignore'
                    plugins={[crossHairPlugin]}
                    onMouseOut={onMouseOut}
                />
            ) : (
                <div className='flex h-full w-full items-center justify-center'>
                    <Spinner />
                </div>
            )}
        </>
    );
};
