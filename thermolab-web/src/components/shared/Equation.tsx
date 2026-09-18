
import React from 'react';
import katex from 'katex';

interface EquationProps {
  tex: string;
  display?: boolean;
}

export const Equation: React.FC<EquationProps> = ({ tex, display = false }) => {
  const html = katex.renderToString(tex, {
    throwOnError: false,
    displayMode: display
  });

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};
