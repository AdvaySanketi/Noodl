import React from 'react';

export const DarkThemeInput = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  helpText 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-[hsl(180,100%,90%)] text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[hsl(180,100%,90%)]/20 bg-[hsl(210,100%,15%)] 
        text-[hsl(180,100%,90%)] py-2.5 px-4 shadow-sm transition-all duration-200
        focus:border-[hsl(180,100%,80%)] focus:outline-none focus:ring-2 focus:ring-[hsl(180,100%,80%)]/30
        focus:shadow-md placeholder-[hsl(180,100%,90%)]/40 dark:[color-scheme:dark]
        [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:opacity-70"
      />
      {helpText && (
        <p className="mt-1.5 text-xs text-[hsl(180,100%,90%)]/70">{helpText}</p>
      )}
    </div>
  );
};

export const DarkThemeCheckbox = ({ label, id, checked, onChange }) => {
  return (
    <div className="flex items-center">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="h-5 w-5 rounded border-[hsl(180,100%,90%)]/20 bg-[hsl(210,100%,18%)] 
          text-[hsl(180,100%,80%)] shadow-sm transition-colors duration-200
          focus:ring-2 focus:ring-[hsl(180,100%,80%)]/30 focus:outline-none mr-3"
        />
        <label htmlFor={id} className="text-sm text-[hsl(180,100%,90%)] cursor-pointer rounded-xl">
          {label}
        </label>
      </div>
    </div>
  );
};

export const DarkThemeRadio = ({ name, value, checked, onChange, ariaLabel }) => {
  return (
    <div className="flex items-center justify-center w-16">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-[hsl(180,100%,80%)] border-2 border-[hsl(180,100%,90%)]/30 
        bg-[hsl(210,100%,18%)] transition-colors duration-200
        focus:ring-2 focus:ring-[hsl(180,100%,80%)]/30 focus:outline-none"
        aria-label={ariaLabel}
      />
    </div>
  );
};

export const DarkThemeNumberInput = ({
  label,
  name,
  value,
  onChange,
  min,
  max
}) => {
  return (
    <div className="flex items-center">
      {label && (
        <label htmlFor={name} className="block text-sm text-[hsl(180,100%,90%)] mr-3">
          {label}
        </label>
      )}
      <input
        type="number"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className="w-16 rounded-md border border-[hsl(180,100%,90%)]/20 bg-[hsl(210,100%,18%)] 
        text-[hsl(180,100%,90%)] py-1.5 px-2 shadow-sm text-center transition-all duration-200
        focus:border-[hsl(180,100%,80%)] focus:outline-none focus:ring-2 focus:ring-[hsl(180,100%,80%)]/30"
      />
    </div>
  );
};

export const DarkThemeButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = ''
}) => {
  const baseClasses = "px-4 py-2.5 rounded-lg flex items-center font-medium shadow-sm transition-all duration-200";
  
  const variantClasses = {
    primary: "bg-[hsl(180,70%,40%)] hover:bg-[hsl(180,70%,45%)] text-white hover:shadow-md",
    secondary: "bg-[hsl(210,70%,20%)] hover:bg-[hsl(210,70%,25%)] text-[hsl(180,100%,90%)] hover:shadow-md",
    success: "bg-[hsl(140,70%,40%)] hover:bg-[hsl(140,70%,45%)] text-white hover:shadow-md",
    danger: "bg-[hsl(0,70%,50%)] hover:bg-[hsl(0,70%,55%)] text-white hover:shadow-md"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const DarkThemeQuestionCard = ({ children }) => {
  return (
    <div className="border border-[hsl(180,100%,90%)]/10 rounded-xl p-6 
    bg-[hsl(210,100%,15%)] shadow-lg space-y-4 transition-all duration-300 hover:shadow-xl">
      {children}
    </div>
  );
};

export const DarkThemeDivider = ({ label }) => {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[hsl(180,100%,90%)]/15"></div>
      </div>
      {label && (
        <div className="relative flex justify-center">
          <span className="bg-[hsl(210,100%,12%)] px-4 text-sm text-[hsl(180,100%,90%)]/70">{label}</span>
        </div>
      )}
    </div>
  );
};

export const DarkThemeHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-8">
      <h1 
        className="text-3xl font-bold text-[hsl(180,100%,90%)] mb-2 tracking-tight"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-[hsl(180,80%,80%)] text-lg">{subtitle}</p>
      )}
    </div>
  );
};