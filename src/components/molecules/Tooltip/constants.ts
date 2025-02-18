import { TooltipMode } from './types';

export const modeStyles: { [key in TooltipMode]: string } = {
    [TooltipMode.Dark]: 'bg-neutral-700 border-neutral-500',
    [TooltipMode.Success]: 'bg-tooltip-success border-secondary-700',
    [TooltipMode.Warning]: 'bg-tooltip-warning border-warning-700',
    [TooltipMode.Error]: 'bg-tooltip-error border-error-700',
};

export const iconStyles: { [key in TooltipMode]: string } = {
    [TooltipMode.Dark]: 'text-neutral-300',
    [TooltipMode.Success]: 'text-secondary-500',
    [TooltipMode.Warning]: 'text-warning-500',
    [TooltipMode.Error]: 'text-error-500',
};
