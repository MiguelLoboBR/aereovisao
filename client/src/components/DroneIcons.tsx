interface IconProps {
  className?: string;
}

// Novo componente baseado na imagem do logo
export const DroneIcon = ({ className = "" }: IconProps) => (
  <img 
    src="/images/aereo-visao-logo.png" 
    alt="Aéreo Visão Logo" 
    className={className}
    style={{ maxWidth: '100%', maxHeight: '100%' }}
  />
);

// SVG original mantido como backup
export const DroneIconSVG = ({ className = "" }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width="1em" 
    height="1em" 
    fill="currentColor" 
    className={className}
  >
    <path d="M16.5,2.34l-5.5,1.65A1,1,0,0,0,10,5V7L3,11V13l7-2v5.17a2,2,0,1,0,2,0V11l7,2V11L12,7V5.34l5.5-1.65A1,1,0,0,0,17,2.67,0.9,0.9,0,0,0,16.5,2.34Z"/>
  </svg>
);
