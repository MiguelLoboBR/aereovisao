import { Link } from "wouter";

interface SponsorProps {
  name: string;
  description?: string;
  url?: string;
  type: 'premium' | 'partner';
}

const SponsorCard = ({ name, description, url, type }: SponsorProps) => {
  const isPremium = type === 'premium';

  return (
    <div className="flex flex-col items-center">
      <div className={`${isPremium ? 'h-32 w-full' : 'h-24 w-full'} flex items-center justify-center ${isPremium ? 'mb-4' : 'mb-3'}`}>
        <div className={`
          ${isPremium 
            ? 'bg-aero-slate-100 h-24 w-48 rounded-xl' 
            : 'bg-aero-slate-50 h-16 w-32 rounded-lg border border-aero-slate-200'
          } flex items-center justify-center
        `}>
          <span className={`${isPremium ? 'text-aero-slate-400 text-lg' : 'text-aero-slate-400 text-sm'} font-medium`}>
            {name}
          </span>
        </div>
      </div>
      
      {description && isPremium && (
        <h3 className="font-inter font-medium text-aero-slate-800 text-center">{name}</h3>
      )}
      
      {description && isPremium && (
        <p className="text-aero-slate-500 text-sm text-center mt-1">{description}</p>
      )}
      
      {!isPremium && (
        <h3 className="font-inter font-medium text-aero-slate-800 text-center text-sm">{name}</h3>
      )}
      
      {url && isPremium && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 text-blue-600 text-sm hover:underline">
          Visitar site
        </a>
      )}
    </div>
  );
};

export default SponsorCard;
