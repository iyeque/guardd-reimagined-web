import { FC, memo } from 'react';

export const OrganicTexture: FC = () => {
  return (
    <div className="fixed inset-0 -z-5 pointer-events-none opacity-20 dark:opacity-10">
      {/* Optimized static texture - Single overlay is much cheaper than blended layers */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCwwIEsyMDAsMjAwIE0yMDAsMCBMMCwyMDAiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] " />
    </div>
  );
};

export default memo(OrganicTexture);
